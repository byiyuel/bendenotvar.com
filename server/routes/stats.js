const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/stats
// @desc    Get platform statistics
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [totalAds, totalUsers, totalMessages, totalFavorites] = await Promise.all([
      prisma.ad.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      prisma.user.count({
        where: {
          isVerified: true
        }
      }),
      prisma.message.count(),
      prisma.favorite.count()
    ]);

    res.json({
      totalAds,
      totalUsers,
      totalMessages,
      totalFavorites
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      message: 'Sunucu hatası oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/stats/categories
// @desc    Get category statistics
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const [notesCount, booksCount, equipmentCount, projectsCount] = await Promise.all([
      prisma.ad.count({
        where: {
          status: 'ACTIVE',
          category: { contains: 'not', mode: 'insensitive' }
        }
      }),
      prisma.ad.count({
        where: {
          status: 'ACTIVE',
          category: { contains: 'kitap', mode: 'insensitive' }
        }
      }),
      prisma.ad.count({
        where: {
          status: 'ACTIVE',
          category: { contains: 'ekipman', mode: 'insensitive' }
        }
      }),
      prisma.ad.count({
        where: {
          status: 'ACTIVE',
          category: { contains: 'proje', mode: 'insensitive' }
        }
      })
    ]);

    res.json({
      notes: notesCount,
      books: booksCount,
      equipment: equipmentCount,
      projects: projectsCount
    });
  } catch (error) {
    console.error('Category stats error:', error);
    res.status(500).json({
      message: 'Kategori istatistikleri alınırken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
