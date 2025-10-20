# 🚀 bendenotvar.com VDS Kurulum Rehberi

Bu rehber Ubuntu 22.04 LTS üzerinde kurulum içindir.

## 📋 Ön Hazırlık

### 1. VDS Bilgilerinizi Hazırlayın
```
VDS IP Adresi: YOUR_VDS_IP
Domain: bendenotvar.com.tr
SSH Kullanıcı: root (veya sudo yetkili kullanıcı)
```

### 2. Domain DNS Ayarları
Domain aldığınız yerde (GoDaddy, NameCheap vb.) A kayıtlarını ekleyin:

```
A Record:
  bendenotvar.com.tr    ->  YOUR_VDS_IP
  www.bendenotvar.com.tr ->  YOUR_VDS_IP
```

DNS yayılması 5-30 dakika sürebilir.

---

## 🔧 ADIM 1: VDS'e Bağlanma

### Windows (PowerShell):
```powershell
ssh root@YOUR_VDS_IP
```

### İlk giriş sonrası şifre değiştirin:
```bash
passwd
```

---

## 🐧 ADIM 2: Sistem Güncellemesi

```bash
# Sistem güncelleme
apt update && apt upgrade -y

# Gerekli paketleri kur
apt install -y curl wget git nano ufw
```

---

## 🐳 ADIM 3: Docker Kurulumu

```bash
# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker'ı başlat
systemctl start docker
systemctl enable docker

# Docker Compose kurulumu
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Kontrol et
docker --version
docker-compose --version
```

---

## 📁 ADIM 4: Proje Dosyalarını Yükle

### Seçenek A: Git ile (Önerilen)
```bash
# Proje klasörü oluştur
mkdir -p /opt/bendenotvar
cd /opt/bendenotvar

# GitHub'dan clone et (önce GitHub'a push edin)
git clone https://github.com/YOUR-USERNAME/bendenotvar.com.git .
```

### Seçenek B: FTP ile Manuel Yükleme
WinSCP veya FileZilla ile tüm proje dosyalarını `/opt/bendenotvar` klasörüne yükleyin.

---

## ⚙️ ADIM 5: Environment Dosyalarını Düzenle

### Backend .env
```bash
cd /opt/bendenotvar
nano server/.env
```

Aşağıdaki içeriği yapıştırın ve değerleri düzenleyin:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="BURAYA-GUCLU-BIR-SIFRE-YAZIN-32-KARAKTER"
JWT_EXPIRES_IN="7d"

# Email Configuration (Gmail SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-gmail-app-password"
EMAIL_FROM="bendenotvar <noreply@bendenotvar.com.tr>"

# Server Configuration
PORT=5000
NODE_ENV="production"

# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760

# Frontend URL
CLIENT_URL="https://bendenotvar.com.tr"

# Allowed Email Domains
ALLOWED_EMAIL_DOMAINS="@ogr.uludag.edu.tr,@uludag.edu.tr"
```

**CTRL+O** (kaydet), **CTRL+X** (çık)

### Frontend .env
```bash
nano client/.env
```

```env
REACT_APP_API_URL=https://bendenotvar.com.tr/api
REACT_APP_SOCKET_URL=https://bendenotvar.com.tr
```

**CTRL+O** (kaydet), **CTRL+X** (çık)

### Docker Compose .env
```bash
nano .env
```

```env
# Domain
DOMAIN=bendenotvar.com.tr

# Database
POSTGRES_DB=bendenotvar
POSTGRES_USER=bendenotvar_user
POSTGRES_PASSWORD=GUCLU-BIR-VERITABANI-SIFRESI-BURAYA

# JWT
JWT_SECRET=BURAYA-GUCLU-BIR-SIFRE-YAZIN-32-KARAKTER

# Email
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

---

## 🌐 ADIM 6: Nginx Konfigürasyonunu Güncelle

```bash
nano nginx.conf
```

Dosyada `bendenotvar.com` yazan yerleri `bendenotvar.com.tr` ile değiştirin.

---

## 🔥 ADIM 7: Firewall Ayarları

```bash
# Port açma
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS

# Firewall'u aktif et
ufw enable

# Kontrol et
ufw status
```

---

## 🚀 ADIM 8: Projeyi Başlat

```bash
cd /opt/bendenotvar

# Container'ları çalıştır
docker-compose up -d

# Logları takip et (sorun varsa görebilmek için)
docker-compose logs -f
```

**CTRL+C** ile log takibinden çıkabilirsiniz.

### Container'ları kontrol et:
```bash
docker-compose ps
```

Tüm servisler **"Up"** durumunda olmalı.

---

## 🔒 ADIM 9: SSL Sertifikası (Let's Encrypt - BEDAVA)

```bash
# Certbot kur
apt install -y certbot python3-certbot-nginx

# SSL sertifikası al (domain yerine kendi domaininizi yazın)
certbot --nginx -d bendenotvar.com.tr -d www.bendenotvar.com.tr --non-interactive --agree-tos --email admin@bendenotvar.com.tr

# Otomatik yenileme testi
certbot renew --dry-run
```

---

## 🗄️ ADIM 10: Veritabanı Kurulumu

```bash
# Backend container'a gir
docker-compose exec backend sh

# Prisma migration
npx prisma migrate deploy
npx prisma generate

# Seed data (kategoriler vs.)
npm run db:seed

# Container'dan çık
exit
```

---

## ✅ ADIM 11: Test Etme

### 1. Backend Test
```bash
curl http://localhost:5000/api/health
```

Çıktı: `{"status":"ok"}` olmalı

### 2. Browser'da Test
- `https://bendenotvar.com.tr` → Frontend açılmalı
- `https://bendenotvar.com.tr/api/health` → `{"status":"ok"}` göstermeli

---

## 🛠️ Faydalı Komutlar

### Container Yönetimi
```bash
# Container'ları başlat
docker-compose up -d

# Container'ları durdur
docker-compose down

# Container'ları yeniden başlat
docker-compose restart

# Logları görüntüle
docker-compose logs -f

# Backend logları
docker-compose logs -f backend

# Sadece frontend logları
docker-compose logs -f frontend
```

### Güncelleme (kod değiştiğinde)
```bash
cd /opt/bendenotvar

# Git'ten çek (eğer Git kullanıyorsanız)
git pull

# Container'ları yeniden build et
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Disk Kullanımı
```bash
# Disk durumu
df -h

# Docker disk temizleme
docker system prune -a
```

---

## 📧 Gmail App Password Alma

1. Gmail hesabınıza giriş yapın
2. https://myaccount.google.com/security adresine gidin
3. **2-Step Verification** aktif edin
4. **App passwords** bölümüne gidin
5. Yeni bir app password oluşturun
6. Bu şifreyi `server/.env` dosyasındaki `EMAIL_PASS` kısmına yapıştırın

---

## 🆘 Sorun Giderme

### Site açılmıyor?
```bash
# DNS kontrolü
ping bendenotvar.com.tr

# Nginx çalışıyor mu?
systemctl status nginx

# Container'lar çalışıyor mu?
docker-compose ps

# Logları kontrol et
docker-compose logs -f
```

### Backend hatası?
```bash
# Backend loglarını kontrol et
docker-compose logs backend

# Backend container'a gir
docker-compose exec backend sh
```

### Frontend hatası?
```bash
# Frontend loglarını kontrol et
docker-compose logs frontend
```

### Veritabanı hatası?
```bash
# Veritabanı loglarını kontrol et
docker-compose logs postgres

# Veritabanına bağlan
docker-compose exec postgres psql -U bendenotvar_user -d bendenotvar
```

---

## 🔄 Yedekleme

### Veritabanı Yedeği
```bash
# Yedek al
docker-compose exec postgres pg_dump -U bendenotvar_user bendenotvar > backup_$(date +%Y%m%d).sql

# Yedekten geri yükle
docker-compose exec -T postgres psql -U bendenotvar_user bendenotvar < backup_20241020.sql
```

### Uploads Klasörü Yedeği
```bash
# Yedek al
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz server/uploads/

# Geri yükle
tar -xzf uploads_backup_20241020.tar.gz
```

---

## 📊 İzleme

### Sistem Kaynakları
```bash
# RAM ve CPU kullanımı
htop

# Disk kullanımı
df -h

# Container kaynak kullanımı
docker stats
```

---

## 🎉 Tamamlandı!

Site artık çalışıyor olmalı:
- 🌐 **Frontend**: https://bendenotvar.com.tr
- 🔌 **Backend API**: https://bendenotvar.com.tr/api
- 💬 **WebSocket**: wss://bendenotvar.com.tr

**Başarılar! 🚀**

---

## 📞 Destek

Sorun yaşarsanız:
1. `docker-compose logs -f` ile logları kontrol edin
2. GitHub Issues açın
3. admin@bendenotvar.com.tr ile iletişime geçin

