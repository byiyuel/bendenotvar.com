const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Favorilere ekle/çıkar
router.post('/:adId', async (req, res) => {
  try {
    const { adId } = req.params;

    // İlan var mı kontrol et
    const ad = await prisma.ad.findUnique({
      where: { id: adId }
    });

    if (!ad) {
      return res.status(404).json({
        message: 'İlan bulunamadı'
      });
    }

    // Zaten favoride mi kontrol et
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_adId: {
          userId: req.user.id,
          adId: adId
        }
      }
    });

    if (existingFavorite) {
      // Favoriden çıkar
      await prisma.favorite.delete({
        where: {
          userId_adId: {
            userId: req.user.id,
            adId: adId
          }
        }
      });

      res.json({
        message: 'İlan favorilerden çıkarıldı',
        isFavorite: false
      });
    } else {
      // Favoriye ekle
      await prisma.favorite.create({
        data: {
          userId: req.user.id,
          adId: adId
        }
      });

      res.json({
        message: 'İlan favorilere eklendi',
        isFavorite: true
      });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      message: 'Favori işlemi sırasında hata oluştu'
    });
  }
});

// Favori durumunu kontrol et
router.get('/:adId/status', async (req, res) => {
  try {
    const { adId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_adId: {
          userId: req.user.id,
          adId: adId
        }
      }
    });

    res.json({
      isFavorite: !!favorite
    });
  } catch (error) {
    console.error('Check favorite status error:', error);
    res.status(500).json({
      message: 'Favori durumu kontrol edilirken hata oluştu'
    });
  }
});

// Kullanıcının tüm favorilerini getir
router.get('/', async (req, res) => {
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
      data: favorites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      message: 'Favoriler alınırken hata oluştu'
    });
  }
});

// Favoriden çıkar
router.delete('/:adId', async (req, res) => {
  try {
    const { adId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_adId: {
          userId: req.user.id,
          adId: adId
        }
      }
    });

    if (!favorite) {
      return res.status(404).json({
        message: 'Bu ilan favorilerinizde bulunamadı'
      });
    }

    await prisma.favorite.delete({
      where: {
        userId_adId: {
          userId: req.user.id,
          adId: adId
        }
      }
    });

    res.json({
      message: 'İlan favorilerden çıkarıldı'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      message: 'Favori çıkarılırken hata oluştu'
    });
  }
});

module.exports = router;


