# 📦 VDS Deployment Dosyaları

Bu klasörde VDS'e deployment için gerekli tüm dosyalar hazır!

## 📁 Dosyalar

### 🚀 Kurulum Dosyaları

1. **`HIZLI-BASLANGIC.md`** ⚡
   - 5 dakikada kurulum
   - Adım adım komutlar
   - **BURADAN BAŞLAYIN!**

2. **`VDS-KURULUM-REHBERI.md`** 📖
   - Detaylı kurulum rehberi
   - Sorun giderme
   - Faydalı komutlar
   - Yedekleme bilgileri

### 🐳 Docker Dosyaları

3. **`docker-compose.production.yml`** 🐋
   - Production için optimize edilmiş Docker Compose
   - 3 servis: Backend, Frontend, Nginx
   - Health check mekanizmaları
   - Auto-restart

4. **`deploy-vds.sh`** 🔧
   - Otomatik kurulum scripti
   - Docker, Certbot, Firewall kurulumu
   - Container'ları başlatma
   - Veritabanı migration

### 🌐 Nginx

5. **`nginx.production.conf`** 🔒
   - SSL/HTTPS desteği
   - Reverse proxy
   - WebSocket desteği
   - Gzip compression
   - Security headers
   - Rate limiting

---

## ⚡ Hızlı Başlangıç (3 Adım)

### 1️⃣ VDS'e Dosyaları Yükle
```bash
# Git ile
git clone https://github.com/YOUR-USERNAME/bendenotvar.com.git /opt/bendenotvar

# Veya manuel FTP/SCP ile yükleyin
```

### 2️⃣ Kurulum Scriptini Çalıştır
```bash
cd /opt/bendenotvar
chmod +x deploy-vds.sh
./deploy-vds.sh
```

### 3️⃣ SSL Kur
```bash
sudo certbot --nginx -d bendenotvar.com.tr -d www.bendenotvar.com.tr
```

**🎉 TAMAM! Site çalışıyor!**

---

## 📋 Yapılması Gerekenler (Checklist)

### VDS Almadan Önce
- [ ] Domain satın al (bendenotvar.com.tr)
- [ ] VDS satın al (2 Core, 3GB RAM önerilen)
- [ ] Gmail App Password oluştur

### VDS'te
- [ ] Ubuntu 22.04 LTS kur
- [ ] SSH ile bağlan
- [ ] Projeyi yükle
- [ ] `.env` dosyalarını düzenle
- [ ] `deploy-vds.sh` çalıştır
- [ ] Domain DNS ayarlarını yap (A record)
- [ ] SSL sertifikası kur
- [ ] Siteyi test et

### Deployment Sonrası
- [ ] Email gönderimi test et (kayıt ol)
- [ ] Socket.io test et (mesajlaşma)
- [ ] Dosya yükleme test et (ilan oluştur)
- [ ] Performans test et
- [ ] Backup sistemi kur

---

## 🔄 Güncelleme (Kod Değiştiğinde)

```bash
cd /opt/bendenotvar
git pull
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

---

## 🛠️ Faydalı Komutlar

```bash
# Container durumu
docker-compose -f docker-compose.production.yml ps

# Loglar
docker-compose -f docker-compose.production.yml logs -f

# Yeniden başlat
docker-compose -f docker-compose.production.yml restart

# Durdur
docker-compose -f docker-compose.production.yml down

# Disk kullanımı
df -h

# RAM kullanımı
free -h

# Container kaynak kullanımı
docker stats
```

---

## 📧 Environment Değişkenleri

### Ana `.env` (Proje kökünde)
```env
DOMAIN=bendenotvar.com.tr
DATABASE_URL=file:./dev.db
JWT_SECRET=32-karakterlik-güçlü-şifre
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=gmail-app-password
```

### `server/.env`
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="32-karakterlik-güçlü-şifre"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="gmail-app-password"
CLIENT_URL="https://bendenotvar.com.tr"
NODE_ENV="production"
```

### `client/.env`
```env
REACT_APP_API_URL=https://bendenotvar.com.tr/api
REACT_APP_SOCKET_URL=https://bendenotvar.com.tr
```

---

## 🆘 Sorun Giderme

### Site açılmıyor?
```bash
# Container'lar çalışıyor mu?
docker-compose -f docker-compose.production.yml ps

# Logları kontrol et
docker-compose -f docker-compose.production.yml logs -f

# Nginx test
sudo nginx -t

# DNS kontrol
ping bendenotvar.com.tr
```

### Backend hatası?
```bash
# Backend logları
docker-compose -f docker-compose.production.yml logs backend

# Container'a gir
docker-compose -f docker-compose.production.yml exec backend sh
```

### SSL hatası?
```bash
# Certbot yenile
sudo certbot renew --dry-run

# Nginx reload
sudo systemctl reload nginx
```

---

## 📊 Performans İzleme

```bash
# Sistem kaynakları
htop

# Disk
df -h

# Container'lar
docker stats

# Nginx log
tail -f /var/log/nginx/access.log
```

---

## 🔒 Güvenlik

### Firewall
```bash
sudo ufw status
```

Açık olması gerekenler:
- 22/tcp (SSH)
- 80/tcp (HTTP)
- 443/tcp (HTTPS)

### SSL/TLS
- Let's Encrypt otomatik yenileme
- TLS 1.2 ve 1.3
- HSTS header aktif

### Rate Limiting
- API: 10 req/s (burst 20)
- Nginx seviyesinde

---

## 💾 Yedekleme

### Veritabanı
```bash
# Yedek al
docker-compose -f docker-compose.production.yml exec backend sh -c "cp prisma/dev.db prisma/backup_$(date +%Y%m%d).db"

# Yerel makineye indir
scp root@YOUR_VDS_IP:/opt/bendenotvar/server/prisma/dev.db ./backup.db
```

### Uploads klasörü
```bash
# Sıkıştır
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz server/uploads/

# İndir
scp root@YOUR_VDS_IP:/opt/bendenotvar/uploads_backup_*.tar.gz ./
```

---

## 🎯 Production Checklist

- [x] Docker ve Docker Compose kurulu
- [x] Firewall yapılandırılmış
- [x] SSL sertifikası aktif
- [x] Environment dosyaları düzenlendi
- [x] Nginx reverse proxy çalışıyor
- [x] WebSocket desteği aktif
- [x] Rate limiting aktif
- [x] Security headers aktif
- [x] Gzip compression aktif
- [x] Health check endpoint çalışıyor

---

## 📞 Destek

Sorun yaşarsanız:
1. Önce `VDS-KURULUM-REHBERI.md` dosyasındaki sorun giderme bölümüne bakın
2. Logları kontrol edin: `docker-compose -f docker-compose.production.yml logs -f`
3. GitHub Issues'da sorun açın

---

## 🎉 Başarılar!

Artık projeniz VDS'te çalışıyor!

- 🌐 **Site**: https://bendenotvar.com.tr
- 🔌 **API**: https://bendenotvar.com.tr/api
- 💬 **WebSocket**: wss://bendenotvar.com.tr

**İyi çalışmalar! 🚀**

