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
    // SQLite doesn't support case-insensitive mode, so we'll get all active ads and filter
    const allActiveAds = await prisma.ad.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        category: true
      }
    });

    // Count by category (case-insensitive)
    const notesCount = allActiveAds.filter(ad => 
      ad.category.toLowerCase().includes('not')
    ).length;
    
    const booksCount = allActiveAds.filter(ad => 
      ad.category.toLowerCase().includes('kitap')
    ).length;
    
    const equipmentCount = allActiveAds.filter(ad => 
      ad.category.toLowerCase().includes('ekipman')
    ).length;
    
    const projectsCount = allActiveAds.filter(ad => 
      ad.category.toLowerCase().includes('proje')
    ).length;

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
