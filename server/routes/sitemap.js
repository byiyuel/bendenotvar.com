const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://bendenotvar.com.tr';

async function sitemapHandler(req, res) {
  try {
    const staticUrls = [
      '/', '/ads', '/contact', '/privacy', '/terms'
    ].map(p => `${BASE_URL}${p}`);

    const ads = await prisma.ad.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, updatedAt: true }
    });

    const urls = [
      ...staticUrls.map(loc => ({ loc })),
      ...ads.map(a => ({ loc: `${BASE_URL}/ads/${a.id}`, lastmod: a.updatedAt.toISOString() }))
    ];

    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc>${u.lastmod?`<lastmod>${u.lastmod}</lastmod>`:''}</url>`).join('\n')}
</urlset>`);
  } catch (e) {
    console.error('sitemap error', e);
    res.status(500).send('error');
  }
}

module.exports = { sitemapHandler };


