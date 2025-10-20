const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateAd, handleValidationErrors } = require('../utils/validation');
const { upload, handleUploadError } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Tüm ilanları getir (filtreleme ve arama ile)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      shareType, 
      faculty, 
      department, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Filtreleme koşulları
    const where = {
      status: 'ACTIVE'
    };

    if (category) {
      where.category = category;
    }

    if (shareType) {
      where.shareType = shareType;
    }

    if (faculty) {
      where.user = {
        faculty: {
          contains: faculty,
          mode: 'insensitive'
        }
      };
    }

    if (department) {
      where.user = {
        ...where.user,
        department: {
          contains: department,
          mode: 'insensitive'
        }
      };
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Sıralama
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
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
      }),
      prisma.ad.count({ where })
    ]);

    res.json({
      data: ads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({
      message: 'İlanlar alınırken hata oluştu'
    });
  }
});

// Tek ilan detayını getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            favorites: true,
            conversations: true
          }
        }
      }
    });

    if (!ad) {
      return res.status(404).json({
        message: 'İlan bulunamadı'
      });
    }

    res.json(ad);
  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({
      message: 'İlan alınırken hata oluştu'
    });
  }
});

// Yeni ilan oluştur
router.post('/', authenticateToken, upload.single('file'), validateAd, handleValidationErrors, handleUploadError, async (req, res) => {
  try {
    const { title, description, category, shareType, locationDetails, whatsappLink } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        category,
        shareType,
        locationDetails,
        whatsappLink,
        fileUrl,
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'İlan başarıyla oluşturuldu',
      ad
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({
      message: 'İlan oluşturulurken hata oluştu'
    });
  }
});

// İlan güncelle
router.put('/:id', authenticateToken, upload.single('file'), validateAd, handleValidationErrors, handleUploadError, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, shareType, locationDetails, whatsappLink } = req.body;

    // İlanın sahibi mi kontrol et
    const existingAd = await prisma.ad.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return res.status(404).json({
        message: 'İlan bulunamadı'
      });
    }

    if (existingAd.userId !== req.user.id) {
      return res.status(403).json({
        message: 'Bu ilanı güncelleme yetkiniz yok'
      });
    }

    const updateData = {
      title,
      description,
      category,
      shareType,
      locationDetails,
      whatsappLink
    };

    // Yeni dosya yüklendiyse
    if (req.file) {
      updateData.fileUrl = `/uploads/${req.file.filename}`;
    }

    const ad = await prisma.ad.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            faculty: true
          }
        }
      }
    });

    res.json({
      message: 'İlan başarıyla güncellendi',
      ad
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({
      message: 'İlan güncellenirken hata oluştu'
    });
  }
});

// İlan sil
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // İlanın sahibi mi kontrol et
    const existingAd = await prisma.ad.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return res.status(404).json({
        message: 'İlan bulunamadı'
      });
    }

    if (existingAd.userId !== req.user.id) {
      return res.status(403).json({
        message: 'Bu ilanı silme yetkiniz yok'
      });
    }

    // İlanı direkt sil (DELETED status yerine)
    await prisma.ad.delete({
      where: { id }
    });

    res.json({
      message: 'İlan başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({
      message: 'İlan silinirken hata oluştu'
    });
  }
});

// İlan durumunu değiştir (aktif/pasif)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        message: 'Geçersiz durum'
      });
    }

    // İlanın sahibi mi kontrol et
    const existingAd = await prisma.ad.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return res.status(404).json({
        message: 'İlan bulunamadı'
      });
    }

    if (existingAd.userId !== req.user.id) {
      return res.status(403).json({
        message: 'Bu ilanın durumunu değiştirme yetkiniz yok'
      });
    }

    const ad = await prisma.ad.update({
      where: { id },
      data: { status }
    });

    res.json({
      message: `İlan ${status === 'ACTIVE' ? 'aktifleştirildi' : 'pasifleştirildi'}`,
      ad
    });
  } catch (error) {
    console.error('Update ad status error:', error);
    res.status(500).json({
      message: 'İlan durumu güncellenirken hata oluştu'
    });
  }
});

// Kategorileri getir
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      message: 'Kategoriler alınırken hata oluştu'
    });
  }
});

// Fakülte ve bölüm listelerini getir
router.get('/faculties/list', async (req, res) => {
  try {
    const [faculties, departments] = await Promise.all([
      prisma.user.findMany({
        select: { faculty: true },
        where: { faculty: { not: null } },
        distinct: ['faculty']
      }),
      prisma.user.findMany({
        select: { department: true },
        where: { department: { not: null } },
        distinct: ['department']
      })
    ]);

    res.json({
      faculties: faculties.map(f => f.faculty).filter(Boolean).sort(),
      departments: departments.map(d => d.department).filter(Boolean).sort()
    });
  } catch (error) {
    console.error('Get faculties error:', error);
    res.status(500).json({
      message: 'Fakülte ve bölümler alınırken hata oluştu'
    });
  }
});

module.exports = router;


