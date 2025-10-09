const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validationResult, body } = require('express-validator');
const { sendVerificationEmail } = require('../utils/email');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

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
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Doğrulama hatası',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Giriş başarılı',
      token,
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