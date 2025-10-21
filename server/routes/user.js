const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// Ensure auth middleware populated req.user
const ensureAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Validation middleware
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Ad en az 2 karakter olmalıdır'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Soyad en az 2 karakter olmalıdır'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Bölüm en az 2 karakter olmalıdır'),
  body('faculty')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Fakülte en az 2 karakter olmalıdır')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre gereklidir'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yeni şifre en az 6 karakter olmalıdır')
];

// Helper function to check validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Giriş bilgilerinde hata var',
      errors: errors.array()
    });
  }
  next();
};

// Get user profile
router.get('/profile', ensureAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        faculty: true,
        year: true,
        bio: true,
        profileImage: true,
        isVerified: true,
        role: true,
        totpEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Profil bilgileri alınırken hata oluştu'
    });
  }
});

// Update user profile
router.put('/profile', ensureAuth, upload.single('profileImage'), validateProfileUpdate, handleValidationErrors, handleUploadError, async (req, res) => {
  try {
    const { firstName, lastName, department, faculty, year, bio } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (department !== undefined) updateData.department = department;
    if (faculty !== undefined) updateData.faculty = faculty;
    if (year !== undefined) updateData.year = year;
    if (bio !== undefined) updateData.bio = bio;
    
    // Profil fotoğrafı yüklendiyse
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        faculty: true,
        year: true,
        bio: true,
        profileImage: true,
        isVerified: true,
        role: true,
        totpEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profil başarıyla güncellendi',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Profil güncellenirken hata oluştu'
    });
  }
});

// Change password
router.put('/change-password', ensureAuth, validatePasswordChange, handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Mevcut şifre hatalı'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Şifre değiştirilirken hata oluştu'
    });
  }
});

// Get user's conversations
router.get('/conversations', ensureAuth, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { starterId: req.user.id },
          { recipientId: req.user.id }
        ]
      },
      orderBy: { lastMessageTime: 'desc' },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        starter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({
      message: 'Konuşmalar alınırken hata oluştu'
    });
  }
});

// Get user's favorites
router.get('/favorites', ensureAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: req.user.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          ad: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  department: true,
                  faculty: true
                }
              },
              _count: {
                select: {
                  favorites: true,
                  conversations: true
                }
              }
            }
          }
        }
      }),
      prisma.favorite.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      favorites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({
      message: 'Favoriler alınırken hata oluştu'
    });
  }
});

// Delete user account
router.delete('/account', ensureAuth, async (req, res) => {
  try {
    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.json({
      message: 'Hesap başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      message: 'Hesap silinirken hata oluştu'
    });
  }
});

// @route   GET /api/user/ads
// @desc    Get user's ads
// @access  Private
router.get('/ads', async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    console.log('📋 GET /api/user/ads - User:', req.user.id);
    
    const { page = 1, limit = 12, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    console.log('🔍 Searching ads with where:', where);

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              faculty: true,
              department: true
            }
          },
          _count: {
            select: {
              favorites: true,
              conversations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.ad.count({ where })
    ]);

    console.log(`✅ Found ${ads.length} ads (total: ${total}) for user ${req.user.id}`);

    const pages = Math.ceil(total / parseInt(limit));

    res.json({
      data: ads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });
  } catch (error) {
    console.error('❌ Get user ads error:', error);
    res.status(500).json({ message: 'İlanlar alınırken hata oluştu' });
  }
});

module.exports = router;

