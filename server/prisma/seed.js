const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  const categories = [
    { name: 'Not', description: 'Ders notları ve materyalleri' },
    { name: 'Kitap', description: 'Ders kitapları ve kaynaklar' },
    { name: 'Ekipman', description: 'Laboratuvar ve ders ekipmanları' },
    { name: 'PDF', description: 'Dijital dokümanlar' },
    { name: 'Proje', description: 'Proje materyalleri ve kaynakları' },
    { name: 'Acil', description: 'Acil ihtiyaç duyulan materyaller' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log('✅ Categories created');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@uludag.edu.tr' },
    update: {},
    create: {
      email: 'admin@uludag.edu.tr',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      department: 'Bilgi İşlem',
      faculty: 'Rektörlük',
      isVerified: true,
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin user created');

  // Create sample user
  const sampleUser = await prisma.user.upsert({
    where: { email: 'test@ogr.uludag.edu.tr' },
    update: {},
    create: {
      email: 'test@ogr.uludag.edu.tr',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      department: 'Bilgisayar Mühendisliği',
      faculty: 'Mühendislik Fakültesi',
      isVerified: true,
      role: 'USER'
    }
  });

  console.log('✅ Sample user created');

  // Create sample ads
  const sampleAds = [
    {
      title: 'Veri Yapıları Ders Notları',
      description: 'Tüm konuları kapsayan detaylı notlar, PDF formatında.',
      category: 'Not',
      shareType: 'DIGITAL',
      userId: sampleUser.id,
      fileUrl: '/uploads/sample-notes.pdf'
    },
    {
      title: 'Algoritma Kitabı',
      description: 'Thomas H. Cormen - Introduction to Algorithms kitabı, iyi durumda.',
      category: 'Kitap',
      shareType: 'BORROW',
      userId: sampleUser.id,
      locationDetails: 'Mühendislik Fakültesi Kütüphanesi'
    },
    {
      title: 'Arduino Seti',
      description: 'Proje için kullanılan Arduino Uno ve sensörler.',
      category: 'Ekipman',
      shareType: 'BORROW',
      userId: sampleUser.id,
      locationDetails: 'Laboratuvar 3'
    }
  ];

  for (const ad of sampleAds) {
    await prisma.ad.create({
      data: ad
    });
  }

  console.log('✅ Sample ads created');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

