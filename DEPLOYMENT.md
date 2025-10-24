# bendenotvar Deployment Rehberi

Bu rehber, bendenotvar platformunu VPS/Dedicated server'da nasıl deploy edeceğinizi açıklar.

## Sistem Gereksinimleri

### Minimum Gereksinimler
- **CPU**: 2 core
- **RAM**: 4 GB
- **Disk**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS

### Önerilen Gereksinimler
- **CPU**: 4 core
- **RAM**: 8 GB
- **Disk**: 100 GB SSD
- **OS**: Ubuntu 22.04 LTS

## Hızlı Kurulum

### 1. Otomatik Kurulum (Önerilen)

```bash
# Projeyi klonlayın
git clone https://github.com/yourusername/bendenotvar.git
cd bendenotvar

# Deployment script'ini çalıştırın
chmod +x deploy.sh
./deploy.sh
```

### 2. Manuel Kurulum

#### Adım 1: Sistem Güncellemesi
```bash
sudo apt update && sudo apt upgrade -y
```

#### Adım 2: Gerekli Paketlerin Kurulumu
```bash
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx
```

#### Adım 3: Docker Kurulumu
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh
```

#### Adım 4: Docker Compose Kurulumu
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Adım 5: Proje Kurulumu
```bash
# Proje klasörü oluştur
sudo mkdir -p /opt/bendenotvar
sudo chown $USER:$USER /opt/bendenotvar
cd /opt/bendenotvar

# Projeyi klonla
git clone https://github.com/yourusername/bendenotvar.git .

# Environment dosyalarını oluştur
cp server/env.example server/.env
cp client/env.example client/.env
```

#### Adım 6: Environment Yapılandırması

**server/.env dosyasını düzenleyin:**
```env
# Database
DATABASE_URL="postgresql://bendenotvar_user:bendenotvar_password@postgres:5432/bendenotvar"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="bendenotvar <noreply@bendenotvar.com>"

# Server Configuration
PORT=5000
NODE_ENV="production"

# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760

# Frontend URL
CLIENT_URL="https://bendenotvar.com"

# Allowed Email Domains
ALLOWED_EMAIL_DOMAINS="@ogr.uludag.edu.tr,@uludag.edu.tr"
```

**client/.env dosyasını düzenleyin:**
```env
REACT_APP_API_URL=https://bendenotvar.com/api
REACT_APP_SOCKET_URL=https://bendenotvar.com
```

#### Adım 7: SSL Sertifikası
```bash
sudo certbot --nginx -d bendenotvar.com -d www.bendenotvar.com --non-interactive --agree-tos --email admin@bendenotvar.com
```

#### Adım 8: Uygulamayı Başlatma
```bash
# Container'ları başlat
docker-compose up -d

# Veritabanı migration'ları
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma generate

# Seed data (opsiyonel)
docker-compose exec backend npm run db:seed
```

#### Adım 9: Nginx Yapılandırması
```bash
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl reload nginx
```

#### Adım 10: Firewall Yapılandırması
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

## Yönetim Komutları

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

# Belirli bir servisin loglarını görüntüle
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Veritabanı Yönetimi
```bash
# Migration çalıştır
docker-compose exec backend npx prisma migrate deploy

# Seed data ekle
docker-compose exec backend npm run db:seed

# Prisma Studio'yu aç
docker-compose exec backend npx prisma studio
```

### Backup ve Restore
```bash
# Veritabanı backup
docker-compose exec postgres pg_dump -U bendenotvar_user bendenotvar > backup_$(date +%Y%m%d_%H%M%S).sql

# Veritabanı restore
docker-compose exec -T postgres psql -U bendenotvar_user bendenotvar < backup_file.sql
```

## Monitoring ve Logs

### Sistem Monitoring
```bash
# Container durumları
docker-compose ps

# Sistem kaynak kullanımı
docker stats

# Disk kullanımı
df -h

# Memory kullanımı
free -h
```

### Log Monitoring
```bash
# Tüm servislerin logları
docker-compose logs -f

# Nginx logları
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Sistem logları
sudo journalctl -f
```

## Güvenlik

### SSL Sertifikası Yenileme
```bash
# Otomatik yenileme testi
sudo certbot renew --dry-run

# Manuel yenileme
sudo certbot renew
```

### Firewall Kuralları
```bash
# Mevcut kuralları görüntüle
sudo ufw status

# Yeni kural ekle
sudo ufw allow 8080

# Kural sil
sudo ufw delete allow 8080
```

### Güvenlik Güncellemeleri
```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Docker image'ları güncelle
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Yaygın Sorunlar

#### 1. Container Başlamıyor
```bash
# Logları kontrol et
docker-compose logs backend

# Container'ı yeniden oluştur
docker-compose up -d --force-recreate backend
```

#### 2. Veritabanı Bağlantı Hatası
```bash
# PostgreSQL durumunu kontrol et
docker-compose exec postgres pg_isready -U bendenotvar_user

# Veritabanı bağlantısını test et
docker-compose exec backend npx prisma db push
```

#### 3. SSL Sertifika Sorunu
```bash
# Sertifika durumunu kontrol et
sudo certbot certificates

# Sertifikayı yenile
sudo certbot renew --force-renewal
```

#### 4. Nginx Yapılandırma Hatası
```bash
# Yapılandırmayı test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

### Performance Optimizasyonu

#### 1. Database Optimizasyonu
```sql
-- PostgreSQL yapılandırması
-- /etc/postgresql/15/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

#### 2. Nginx Optimizasyonu
```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_comp_level 6;
```

## Backup Stratejisi

### Otomatik Backup Script
```bash
#!/bin/bash
# /opt/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"

# Backup klasörü oluştur
mkdir -p $BACKUP_DIR

# Veritabanı backup
docker-compose exec -T postgres pg_dump -U bendenotvar_user bendenotvar > $BACKUP_DIR/db_$DATE.sql

# Upload dosyaları backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# Eski backup'ları temizle (7 günden eski)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### Cron Job Ekleme
```bash
# Crontab'ı düzenle
crontab -e

# Günlük backup (her gece 2:00'da)
0 2 * * * /opt/backup.sh
```

## Support

Sorunlarınız için:
- GitHub Issues: https://github.com/yourusername/bendenotvar/issues
- Email: support@bendenotvar.com
- Dokümantasyon: https://docs.bendenotvar.com









