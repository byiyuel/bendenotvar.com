## bendenotvar

Üniversite öğrencileri için kampüs içi paylaşım platformu.

### Proje Hakkında
bendenotvar, Uludağ Üniversitesi öğrencilerinin ders notları, kitaplar, ekipman ve proje materyallerini güvenli ve hızlı şekilde paylaşmasını sağlayan modern bir web uygulamasıdır.

### Özellikler
- 🔐 Sadece `@ogr.uludag.edu.tr` ve `@uludag.edu.tr` uzantılı e‑posta ile kayıt/giriş
- 📚 Ders notu, kitap, ekipman, proje materyali paylaşma
- 💬 Gerçek zamanlı dahili mesajlaşma (Socket.IO)
- 🔍 Gelişmiş arama ve filtreleme
- 📱 Mobil uyumlu arayüz
- ⭐ Favoriler, 👤 profil yönetimi

### Teknolojiler
- **Backend**: Node.js (Express), Prisma ORM, JWT, Multer, Socket.IO, Helmet, Rate Limiting
- **Veritabanı**: Geliştirme için SQLite (varsayılan). Docker/Prod için PostgreSQL desteği hazır.
- **Frontend**: React, TypeScript, TailwindCSS, Axios, React Router
- **Diğer**: Nginx reverse proxy, Docker Compose

---

## Hızlı Başlangıç (Yerel Geliştirme)

### Gereksinimler
- Node.js 18+ ve npm

### 1) Bağımlılıkları yükle
```bash
npm run install-all
```

### 2) Ortam dosyalarını oluştur
- macOS/Linux:
```bash
cp server/env.example server/.env
cp client/env.example client/.env
```
- Windows (PowerShell):
```powershell
copy server\env.example server\.env
copy client\env.example client\.env
```

Ardından `server/.env` ve `client/.env` dosyalarını ihtiyaca göre düzenleyin.

Önemli değişkenler:
- Backend: `PORT`, `CLIENT_URL`, `ALLOWED_EMAIL_DOMAINS`, `UPLOAD_PATH`, `JWT_SECRET`
- Frontend: `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`

Not: Varsayılan Prisma yapılandırması SQLite kullanır. `server/prisma/dev.db` dosyası repoda mevcuttur.

### 3) Prisma (SQLite ile)
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

Opsiyonel: seed
```bash
npm run db:seed
```

### 4) Geliştirme sunucularını başlat
```bash
cd ..
npm run dev
```
Bu komut hem backend'i hem frontend'i birlikte çalıştırır:
- API: `http://localhost:5000`
- Web: `http://localhost:3000`

---

## Docker ile Çalıştırma (PostgreSQL + Nginx)

`docker-compose.yml` ile PostgreSQL, Backend, Frontend ve Nginx servisleri birlikte başlatılabilir.

### 1) Ortam dosyalarını ayarla
`server/.env` içindeki `DATABASE_URL` değerini Postgres'e göre düzenleyin (compose içerisindeki varsayılan uygun):
```
DATABASE_URL="postgresql://bendenotvar_user:bendenotvar_password@postgres:5432/bendenotvar"
```
`client/.env` içinde API ve Socket URL'lerini ayarlayın:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 2) Servisleri başlat
```bash
docker-compose up -d
```

### 3) Prisma migration/generate (container içinde)
```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma generate
```

Notlar:
- Prisma şu an `schema.prisma` içinde `provider = "sqlite"` olarak gelir. Docker ile Postgres kullanmak için `datasource db.provider` değerini `postgresql` yapın ve Postgres'e uygun yeni migration'lar üretin. Mevcut SQLite migration'ları Postgres ile birebir uyumlu olmayabilir.
- Nginx yapılandırması `nginx.conf` dosyasında yer alır ve reverse proxy olarak frontend/backend'e yönlendirir.

---

## Proje Yapısı
```
bendenotvar/
├─ client/           # React frontend
├─ server/           # Express backend
├─ docker-compose.yml
├─ nginx.conf        # Reverse proxy (Docker)
├─ DEPLOYMENT.md     # Detaylı deploy rehberi
└─ README.md
```

### Kök Script'ler
`package.json` (kök) üzerinden:
- `npm run dev`: Backend ve frontend'i birlikte başlatır
- `npm run server`: Sadece server (watch)
- `npm run client`: Sadece client (CRA dev server)
- `npm run build`: Client production build
- `npm start`: Server'ı production modda başlatır
- `npm run install-all`: Kök, `server` ve `client` bağımlılıklarını kurar

### Server Script'leri
`server/package.json` üzerinden:
- `npm run dev`: Nodemon ile yerel geliştirme
- `npm start`: Production
- `npm run db:migrate`: `prisma migrate dev`
- `npm run db:generate`: `prisma generate`
- `npm run db:studio`: Prisma Studio
- `npm run db:seed`: Örnek veri ekler

---

## API Kısa Özet

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/verify/:token`
- Ads: `GET/POST /api/ads`, `GET/PUT/DELETE /api/ads/:id`
- Favorites: `GET/POST/DELETE /api/favorites`
- Messages: `GET /api/conversations`, `GET /api/conversations/:id/messages`, `POST /api/messages`
- Stats: `GET /api/stats`

Geliştirme sırasında rate limiting, güvenlik başlıkları ve CORS ayarları `server/index.js` içinde yapılandırılmıştır. Yüklenen dosyalar `GET /uploads/...` ile servis edilir.

---

## Dağıtım (Deployment)

Detaylı üretim dağıtımı için `DEPLOYMENT.md` dosyasını izleyin. Kısa özet:
1) Sunucuyu hazırlayın (Ubuntu 22.04, Docker & Docker Compose, Nginx, SSL)
2) Ortam değişkenlerini yapılandırın (`server/.env`, `client/.env`)
3) `docker-compose up -d` ile servisleri başlatın
4) `prisma migrate deploy` ve `prisma generate` çalıştırın
5) Nginx'i `nginx.conf` ile yapılandırın ve sertifikaları ekleyin

`deploy.sh` script'i temel adımları otomatikleştirmek için örnek olarak eklenmiştir.

---

## SSS / İpuçları
- Geliştirmede CORS: `CLIENT_URL` ve Socket.IO `origin` listesi `server/index.js` içinde tanımlıdır; gerektiğinde güncelleyin.
- Maksimum dosya boyutu: `MAX_FILE_SIZE` (`server/.env`).
- E‑posta domain kısıtlaması: `ALLOWED_EMAIL_DOMAINS` ile yönetilir.

---

## Lisans
MIT