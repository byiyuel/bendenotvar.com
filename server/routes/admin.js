const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/admin/overview - basic platform metrics
router.get('/overview', async (req, res) => {
  try {
    const [totalUsers, totalAds, totalMessages, totalFavorites, recentUsers, recentAds, pendingAdsCount] = await Promise.all([
      prisma.user.count(),
      prisma.ad.count(),
      prisma.message.count(),
      prisma.favorite.count(),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, firstName: true, lastName: true, email: true, createdAt: true } }),
      prisma.ad.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, createdAt: true } }),
      prisma.ad.count({ where: { status: 'PENDING' } }).catch(() => 0),
    ]);

    res.json({ totalUsers, totalAds, totalMessages, totalFavorites, recentUsers, recentAds, pendingAdsCount });
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
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_LIST_USERS' } }).catch(()=>{});
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
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_UPDATE_ROLE', target: id, metadata: JSON.stringify({ role }) } }).catch(()=>{});
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
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_DELETE_USER', target: id } }).catch(()=>{});
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
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_LIST_ADS' } }).catch(()=>{});
  } catch (error) {
    console.error('Admin ads list error:', error);
    res.status(500).json({ message: 'İlanlar alınamadı' });
  }
});

// Pending ads and status changes (moderation)
router.get('/ads/pending', async (req, res) => {
  try {
    const ads = await prisma.ad.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, firstName: true, lastName: true } } } });
    res.json(ads);
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_LIST_PENDING_ADS' } }).catch(()=>{});
  } catch (error) {
    console.error('Admin pending ads error:', error);
    res.status(500).json({ message: 'Onay bekleyen ilanlar alınamadı' });
  }
});

router.patch('/ads/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING | ACTIVE | REJECTED | INACTIVE | DELETED
    const allowed = ['PENDING','ACTIVE','REJECTED','INACTIVE','DELETED'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Geçersiz durum' });
    const ad = await prisma.ad.update({ where: { id }, data: { status } });
    res.json({ message: 'Durum güncellendi', ad });
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_UPDATE_AD_STATUS', target: id, metadata: JSON.stringify({ status }) } }).catch(()=>{});
  } catch (error) {
    console.error('Admin update ad status error:', error);
    res.status(500).json({ message: 'Durum güncellenemedi' });
  }
});

router.delete('/ads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ad.delete({ where: { id } });
    res.json({ message: 'İlan silindi' });
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_DELETE_AD', target: id } }).catch(()=>{});
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
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_CREATE_CATEGORY', target: category.id } }).catch(()=>{});
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
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_UPDATE_CATEGORY', target: id } }).catch(()=>{});
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
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_DELETE_CATEGORY', target: id } }).catch(()=>{});
  } catch (error) {
    console.error('Admin delete category error:', error);
    res.status(500).json({ message: 'Kategori silinemedi' });
  }
});

module.exports = router;


