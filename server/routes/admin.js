const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/admin/overview - basic platform metrics
router.get('/overview', async (req, res) => {
  try {
    const [totalUsers, totalAds, totalMessages, totalFavorites] = await Promise.all([
      prisma.user.count(),
      prisma.ad.count(),
      prisma.message.count(),
      prisma.favorite.count(),
    ]);

    res.json({ totalUsers, totalAds, totalMessages, totalFavorites });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ message: 'Yönetim istatistikleri alınamadı' });
  }
});

// Users management
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ message: 'Kullanıcılar alınamadı' });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'USER' | 'ADMIN'
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Geçersiz rol' });
    }
    const user = await prisma.user.update({ where: { id }, data: { role } });
    res.json({ message: 'Rol güncellendi', user: { id: user.id, role: user.role } });
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ message: 'Rol güncellenemedi' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Kullanıcı silindi' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Kullanıcı silinemedi' });
  }
});

// Ads management
router.get('/ads', async (req, res) => {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { favorites: true, conversations: true } },
      },
    });
    res.json(ads);
  } catch (error) {
    console.error('Admin ads list error:', error);
    res.status(500).json({ message: 'İlanlar alınamadı' });
  }
});

router.delete('/ads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ad.delete({ where: { id } });
    res.json({ message: 'İlan silindi' });
  } catch (error) {
    console.error('Admin delete ad error:', error);
    res.status(500).json({ message: 'İlan silinemedi' });
  }
});

// Categories management
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (error) {
    console.error('Admin categories list error:', error);
    res.status(500).json({ message: 'Kategoriler alınamadı' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.create({ data: { name, description } });
    res.status(201).json({ message: 'Kategori oluşturuldu', category });
  } catch (error) {
    console.error('Admin create category error:', error);
    res.status(500).json({ message: 'Kategori oluşturulamadı' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await prisma.category.update({ where: { id }, data: { name, description } });
    res.json({ message: 'Kategori güncellendi', category });
  } catch (error) {
    console.error('Admin update category error:', error);
    res.status(500).json({ message: 'Kategori güncellenemedi' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Kategori silindi' });
  } catch (error) {
    console.error('Admin delete category error:', error);
    res.status(500).json({ message: 'Kategori silinemedi' });
  }
});

module.exports = router;


