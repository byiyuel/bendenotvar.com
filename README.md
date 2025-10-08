# bendenotvar

Üniversite öğrencileri için kampüs içi paylaşım platformu

## Proje Hakkında

bendenotvar, Uludağ Üniversitesi öğrencilerinin ders notları, kitaplar, ekipman ve proje materyallerini güvenli ve hızlı bir şekilde birbirleriyle paylaşmasını sağlayan modern bir web platformudur.

## Özellikler

- 🔐 Sadece @ogr.uludag.edu.tr ve @uludag.edu.tr mail uzantısı ile giriş
- 📚 Ders notları, kitaplar, ekipman ve proje materyali paylaşımı
- 💬 Dahili mesajlaşma sistemi
- 🔍 Gelişmiş arama ve filtreleme
- 📱 Mobil uyumlu tasarım
- 👤 Kullanıcı profilleri ve favoriler

## Teknolojiler

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Socket.IO (mesajlaşma için)
- Multer (dosya yükleme)

### Frontend
- React.js
- TailwindCSS
- Axios (API istekleri)
- Socket.IO Client

## Kurulum

1. Tüm bağımlılıkları yükleyin:
```bash
npm run install-all
```

2. Veritabanı ayarlarını yapın:
```bash
cd server
cp .env.example .env
# .env dosyasını düzenleyin
```

3. Veritabanını oluşturun:
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Proje Yapısı

```
bendenotvar/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Ana proje dosyası
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `POST /api/auth/verify/:token` - Mail doğrulama

### Ads (İlanlar)
- `GET /api/ads` - İlanları listele
- `POST /api/ads` - Yeni ilan oluştur
- `GET /api/ads/:id` - İlan detayı
- `PUT /api/ads/:id` - İlan güncelle
- `DELETE /api/ads/:id` - İlan sil

### Messages
- `GET /api/conversations` - Konuşmaları listele
- `GET /api/conversations/:id/messages` - Mesajları getir
- `POST /api/messages` - Mesaj gönder

## Deployment

### VPS/Dedicated Server Kurulumu

1. Ubuntu 22.04 LTS kurulumu
2. Node.js, PostgreSQL, Nginx kurulumu
3. PM2 ile process yönetimi
4. Let's Encrypt ile HTTPS
5. Nginx reverse proxy yapılandırması

## Geliştirme Aşamaları

- [x] Proje yapısı oluşturma
- [ ] Backend altyapısı
- [ ] Veritabanı şeması
- [ ] Kimlik doğrulama sistemi
- [ ] API endpointleri
- [ ] Frontend altyapısı
- [ ] İlan sistemi
- [ ] Mesajlaşma sistemi
- [ ] Dosya yükleme
- [ ] Admin paneli
- [ ] Deployment

## Lisans

MIT

