const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validationResult, body } = require('express-validator');
const { sendVerificationEmail } = require('../utils/email');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const router = express.Router();
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

// Login rate limiter: limit repeated attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.' }
});

// Register validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi girin')
    .custom(async (email) => {
      const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || ['@ogr.uludag.edu.tr', '@uludag.edu.tr'];
      const isAllowed = allowedDomains.some(domain => email.endsWith(domain));
      if (!isAllowed) {
        throw new Error('Sadece Uludağ Üniversitesi e-posta adresleri kabul edilmektedir');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Ad en az 2 karakter olmalıdır'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Soyad en az 2 karakter olmalıdır')
];

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi girin'),
  body('password')
    .notEmpty()
    .withMessage('Şifre gereklidir')
];

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Doğrulama hatası',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, department, faculty } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Bu e-posta adresi zaten kayıtlı'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        department,
        faculty,
        isVerified: false,
        role: 'USER'
      }
    });

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      message: 'Hesabınız oluşturuldu. E-posta adresinizi doğrulamak için gönderilen bağlantıya tıklayın.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      message: 'Sunucu hatası oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Doğrulama hatası',
        errors: errors.array()
      });
    }

    const { email, password, totpToken, backupCode } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Geçersiz e-posta veya şifre'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Geçersiz e-posta veya şifre'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({
        message: 'E-posta adresinizi doğrulamanız gerekiyor. Doğrulama e-postasını kontrol edin.',
        needsVerification: true,
        email: user.email
      });
    }

    // Enforce 2FA if enabled
    if (user.totpEnabled) {
      let ok = false;
      if (totpToken) {
        ok = speakeasy.totp.verify({ secret: user.totpSecret, encoding: 'base32', token: totpToken, window: 1 });
      } else if (backupCode) {
        const { createHash } = require('crypto');
        const hash = createHash('sha256').update(backupCode).digest('hex');
        const code = await prisma.backupCode.findFirst({ where: { userId: user.id, codeHash: hash, usedAt: null } });
        if (code) {
          ok = true;
          await prisma.backupCode.update({ where: { id: code.id }, data: { usedAt: new Date() } });
        }
      }
      if (!ok) return res.status(400).json({ message: '2FA kodu gerekli veya geçersiz', requires2FA: true });
    }

    // Generate access/refresh tokens with rotation
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );
    const jti = randomUUID();
    const refreshExpDays = parseInt((process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7'), 10);
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh', jti },
      process.env.JWT_SECRET,
      { expiresIn: `${refreshExpDays}d` }
    );
    // Persist refresh token metadata
    await prisma.refreshToken.create({ data: {
      jti,
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshExpDays*24*60*60*1000)
    }});

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        faculty: user.faculty,
        role: user.role,
        isVerified: user.isVerified
      }
    });
// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: 'Refresh token required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') return res.status(400).json({ message: 'Invalid token type' });
    // Check jti validity and not revoked
    const stored = await prisma.refreshToken.findUnique({ where: { jti: decoded.jti } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Refresh token revoked or expired' });
    }
    // Rotate: revoke old and issue new
    await prisma.refreshToken.update({ where: { jti: decoded.jti }, data: { revokedAt: new Date() } });
    const newJti = randomUUID();
    const refreshExpDays = parseInt((process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7'), 10);
    const newRefresh = jwt.sign({ userId: decoded.userId, type: 'refresh', jti: newJti }, process.env.JWT_SECRET, { expiresIn: `${refreshExpDays}d` });
    await prisma.refreshToken.create({ data: { jti: newJti, userId: decoded.userId, expiresAt: new Date(Date.now() + refreshExpDays*24*60*60*1000) } });
    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' });
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    res.cookie('refresh_token', newRefresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: parseInt((process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7'),10) * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.json({ message: 'Refreshed' });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

// Logout - clear cookies
router.post('/logout', async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type === 'refresh' && decoded.jti) {
        await prisma.refreshToken.update({ where: { jti: decoded.jti }, data: { revokedAt: new Date() } }).catch(()=>{});
      }
    }
  } catch(_) {}
  res.clearCookie('access_token', { httpOnly: true, secure: isProd, sameSite: 'strict', path: '/' });
  res.clearCookie('refresh_token', { httpOnly: true, secure: isProd, sameSite: 'strict', path: '/' });
  res.json({ message: 'Çıkış yapıldı' });
});

// 2FA: setup (returns otpauth URL as QR)
router.post('/2fa/setup', authenticateToken, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ length: 20, name: 'bendenotvar' });
    const otpauth = secret.otpauth_url;
    const qr = await qrcode.toDataURL(otpauth);
    // temp secret session yerine DB'de saklamak isterseniz ayrı alan gerekir; basitçe client verify ile tamamlayacağız
    res.json({ base32: secret.base32, otpauth, qr });
  } catch (e) {
    console.error('2FA setup error:', e);
    res.status(500).json({ message: '2FA kurulumu başarısız' });
  }
});

// 2FA verify/enable (also generate backup codes on enable)
router.post('/2fa/enable', authenticateToken, async (req, res) => {
  try {
    const { token, base32 } = req.body;
    const verified = speakeasy.totp.verify({ secret: base32, encoding: 'base32', token, window: 1 });
    if (!verified) return res.status(400).json({ message: 'Geçersiz doğrulama kodu' });
    await prisma.user.update({ where: { id: req.user.id }, data: { totpSecret: base32, totpEnabled: true } });
    // Create backup codes (hashed)
    const { randomBytes, createHash } = require('crypto');
    const codes = Array.from({ length: 5 }, () => randomBytes(4).toString('hex'));
    const hashes = codes.map(c => ({ codeHash: createHash('sha256').update(c).digest('hex'), userId: req.user.id }));
    // Clear previous codes then insert new
    await prisma.backupCode.deleteMany({ where: { userId: req.user.id } }).catch(()=>{});
    await prisma.backupCode.createMany({ data: hashes });
    res.json({ message: '2FA etkinleştirildi', backupCodes: codes });
  } catch (e) {
    console.error('2FA enable error:', e);
    res.status(500).json({ message: '2FA etkinleştirilemedi' });
  }
});

router.post('/2fa/disable', authenticateToken, async (req, res) => {
  try {
    await prisma.user.update({ where: { id: req.user.id }, data: { totpEnabled: false, totpSecret: null } });
    res.json({ message: '2FA devre dışı bırakıldı' });
  } catch (e) {
    console.error('2FA disable error:', e);
    res.status(500).json({ message: '2FA devre dışı bırakılamadı' });
  }
});

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Sunucu hatası oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'E-posta adresi gereklidir'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'E-posta adresiniz zaten doğrulanmış'
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
      res.json({
        message: 'Doğrulama e-postası yeniden gönderildi. E-posta kutunuzu kontrol edin.'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        message: 'E-posta gönderilirken hata oluştu. Lütfen daha sonra tekrar deneyin.'
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      message: 'Sunucu hatası oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/verify/:token
// @desc    Verify email address
// @access  Public
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Update user verification status
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { isVerified: true }
    });

    res.json({
      message: 'E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).json({
      message: 'Doğrulama bağlantısı geçersiz veya süresi dolmuş'
    });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.get('/verify-token', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId || req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({
      valid: true,
      user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;