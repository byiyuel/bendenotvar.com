# 🚀 VDS Deploy Komutları

## ✅ Yapılan Tüm Düzeltmeler

### 1. **Frontend Dockerfile** (`client/Dockerfile`)
- ✅ Node 20 Alpine kullanılıyor
- ✅ `npm ci` → `npm install --legacy-peer-deps` (package-lock.json sorunu çözüldü)

### 2. **Backend Dockerfile** (`server/Dockerfile`)
- ✅ OpenSSL 1.1 compat eklendi (Prisma için gerekli)
- ✅ libc6-compat eklendi (Alpine Linux uyumluluğu)
- ✅ `npm ci` → `npm install` (daha esnek)

### 3. **docker-compose.production.yml**
- ✅ `version: '3.8'` satırı kaldırıldı (modern Docker Compose)

---

## 🎯 VDS'te Çalıştırılacak Komutlar

### 1️⃣ SSH Bağlantısı
```bash
ssh root@213.146.184.233
```

### 2️⃣ Proje Dizinine Git
```bash
cd /opt/bendenotvar/bendenotvar.com
```

### 3️⃣ Git'ten Çek (eğer GitHub kullanıyorsan)
```bash
git pull origin main
```

**VEYA** Manuel FTP ile yükle:
- `client/Dockerfile`
- `server/Dockerfile`
- `docker-compose.production.yml`

### 4️⃣ Eski Container'ları Durdur ve Temizle
```bash
# Container'ları durdur
docker-compose -f docker-compose.production.yml down

# Docker cache'ini temizle
docker system prune -a -f

# Builder cache'ini temizle
docker builder prune -a -f
```

### 5️⃣ Yeniden Build Et (Cache Kullanmadan)
```bash
docker-compose -f docker-compose.production.yml build --no-cache
```

Bu adım 5-10 dakika sürebilir. Çıktıda şunları görmelisin:
```
[+] Building 234.5s (21/21) FINISHED
=> [backend] exporting to image
=> [frontend] exporting to image
```

### 6️⃣ Container'ları Başlat
```bash
docker-compose -f docker-compose.production.yml up -d
```

### 7️⃣ Container Durumlarını Kontrol Et
```bash
docker-compose -f docker-compose.production.yml ps
```

**Beklenen Çıktı:**
```
NAME                    STATUS          PORTS
bendenotvar_backend     Up (healthy)    0.0.0.0:5000->5000/tcp
bendenotvar_frontend    Up              
bendenotvar_nginx       Up (healthy)    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 8️⃣ Logları İzle
```bash
# Tüm loglar
docker-compose -f docker-compose.production.yml logs -f

# Sadece backend
docker-compose -f docker-compose.production.yml logs -f backend

# Sadece frontend
docker-compose -f docker-compose.production.yml logs -f frontend

# Sadece nginx
docker-compose -f docker-compose.production.yml logs -f nginx
```

**CTRL+C** ile log takibinden çıkabilirsin.

---

## 🔍 Test Et

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

**Beklenen:** `{"status":"ok"}` veya benzeri

### Frontend (Nginx üzerinden)
```bash
curl http://localhost
```

**Beklenen:** HTML çıktısı

### Browser'da Test
```
http://213.146.184.233
```

---

## 🗄️ Veritabanı Kurulumu (İlk Kez)

### Prisma Migration Çalıştır
```bash
# Backend container'a gir
docker-compose -f docker-compose.production.yml exec backend sh

# Migration çalıştır
npx prisma migrate deploy

# Prisma Client oluştur
npx prisma generate

# Seed data ekle (opsiyonel)
npm run db:seed

# Container'dan çık
exit
```

---

## ⚠️ Hata Durumunda

### Prisma OpenSSL Hatası Devam Ederse:

```bash
# Backend'i yeniden build et
docker-compose -f docker-compose.production.yml build --no-cache backend
docker-compose -f docker-compose.production.yml up -d backend

# Logları kontrol et
docker-compose -f docker-compose.production.yml logs backend
```

### Frontend Build Hatası Devam Ederse:

```bash
# Frontend'i yeniden build et
docker-compose -f docker-compose.production.yml build --no-cache frontend
docker-compose -f docker-compose.production.yml up -d frontend

# Logları kontrol et
docker-compose -f docker-compose.production.yml logs frontend
```

### Tüm Container'ları Sıfırdan Başlat:

```bash
# Tümünü durdur ve sil (DİKKAT: volumes korunur)
docker-compose -f docker-compose.production.yml down

# Image'ları sil
docker image prune -a -f

# Yeniden build
docker-compose -f docker-compose.production.yml build --no-cache

# Başlat
docker-compose -f docker-compose.production.yml up -d
```

---

## 🔧 Faydalı Komutlar

### Container İçine Gir
```bash
# Backend
docker-compose -f docker-compose.production.yml exec backend sh

# Frontend (sadece nginx çalışıyor, build edilmiş dosyalar var)
docker-compose -f docker-compose.production.yml exec nginx sh
```

### Container'ları Yeniden Başlat
```bash
# Tümü
docker-compose -f docker-compose.production.yml restart

# Sadece backend
docker-compose -f docker-compose.production.yml restart backend

# Sadece frontend
docker-compose -f docker-compose.production.yml restart frontend
```

### Disk Kullanımı
```bash
# Docker disk kullanımı
docker system df

# Detaylı
docker system df -v
```

### Temizlik
```bash
# Kullanılmayan image'ları sil
docker image prune -a -f

# Kullanılmayan volume'leri sil (DİKKAT!)
docker volume prune -f

# Tüm kullanılmayanları sil
docker system prune -a -f --volumes
```

---

## 🔒 SSL Sertifikası (Let's Encrypt)

### Certbot Kur
```bash
apt update
apt install -y certbot python3-certbot-nginx
```

### SSL Sertifikası Al
```bash
# Domain'i değiştir!
certbot --nginx -d bendenotvar.com.tr -d www.bendenotvar.com.tr --non-interactive --agree-tos --email admin@bendenotvar.com.tr
```

### Otomatik Yenileme Testi
```bash
certbot renew --dry-run
```

---

## 📊 İzleme

### Sistem Kaynakları
```bash
# CPU ve RAM
htop

# Disk
df -h

# Docker container kaynakları
docker stats
```

### Log Dosyaları
```bash
# Nginx access log
tail -f /var/log/nginx/access.log

# Nginx error log
tail -f /var/log/nginx/error.log
```

---

## ✅ Başarılı Deploy Kontrol Listesi

Build öncesi:
- [ ] Git'ten son değişiklikler çekildi
- [ ] `.env` dosyası düzenlendi (email, JWT secret, vs.)
- [ ] Docker cache temizlendi

Build sırası:
- [ ] Frontend build başarılı
- [ ] Backend build başarılı
- [ ] OpenSSL hatası yok
- [ ] Prisma generate başarılı

Build sonrası:
- [ ] Container'lar `Up` durumunda
- [ ] Health check'ler geçiyor
- [ ] Backend API çalışıyor (`/api/health`)
- [ ] Frontend erişilebilir
- [ ] Nginx çalışıyor
- [ ] Loglar'da critical error yok

Veritabanı:
- [ ] Prisma migration çalıştırıldı
- [ ] Seed data eklendi (opsiyonel)
- [ ] Veritabanı bağlantısı çalışıyor

Güvenlik:
- [ ] Firewall aktif (port 22, 80, 443)
- [ ] SSL sertifikası kuruldu
- [ ] `.env` dosyaları güvenli

---

## 🎉 Deploy Tamamlandı!

Site artık şu adreste çalışmalı:
```
http://213.146.184.233
```

SSL kurduktan sonra:
```
https://bendenotvar.com.tr
```

---

## 📞 Sorun Giderme

### Backend başlamıyor?
```bash
# Logları kontrol et
docker-compose -f docker-compose.production.yml logs backend

# .env dosyasını kontrol et
cat server/.env

# Container'a gir ve kontrol et
docker-compose -f docker-compose.production.yml exec backend sh
ls -la
cat .env
```

### Frontend görünmüyor?
```bash
# Nginx logları
docker-compose -f docker-compose.production.yml logs nginx

# Nginx config test
docker-compose -f docker-compose.production.yml exec nginx nginx -t

# Build edilmiş dosyalar var mı?
docker-compose -f docker-compose.production.yml exec nginx ls -la /usr/share/nginx/html
```

### Veritabanı bağlantı hatası?
```bash
# Backend logları kontrol et
docker-compose -f docker-compose.production.yml logs backend | grep -i "database\|prisma"

# Prisma generate tekrar çalıştır
docker-compose -f docker-compose.production.yml exec backend npx prisma generate

# Migration tekrar çalıştır
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

---

## 💾 Yedekleme

### Veritabanı Yedeği (SQLite)
```bash
# Yedek al
docker-compose -f docker-compose.production.yml exec backend cp prisma/dev.db prisma/backup_$(date +%Y%m%d_%H%M%S).db

# Yerel makineye indir
scp root@213.146.184.233:/opt/bendenotvar/bendenotvar.com/server/prisma/dev.db ./backup.db
```

### Uploads Klasörü Yedeği
```bash
# Sıkıştır
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz server/uploads/

# İndir
scp root@213.146.184.233:/opt/bendenotvar/bendenotvar.com/uploads_backup_*.tar.gz ./
```

---

## 🔄 Güncelleme (Kod Değişikliği)

Kod değişikliği yaptığında:

```bash
# 1. Git'ten çek
cd /opt/bendenotvar/bendenotvar.com
git pull

# 2. Sadece değişen servisi build et
docker-compose -f docker-compose.production.yml build backend
# VEYA
docker-compose -f docker-compose.production.yml build frontend

# 3. Yeniden başlat
docker-compose -f docker-compose.production.yml up -d

# 4. Logları kontrol et
docker-compose -f docker-compose.production.yml logs -f
```

**Hızlı yeniden başlatma:**
```bash
git pull && docker-compose -f docker-compose.production.yml up -d --build && docker-compose -f docker-compose.production.yml logs -f
```

---

**Son Güncelleme:** OpenSSL ve npm install sorunları çözüldü ✅

