#!/bin/bash

# bendenotvar VDS Kurulum ve Deploy Script
# Ubuntu 22.04 LTS için optimize edilmiştir

set -e

# Renkli output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║   bendenotvar VDS Kurulum Script v1.0    ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Root kontrolü
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}❌ Bu scripti root olarak çalıştırmayın!${NC}"
  echo "Sudo yetkili bir kullanıcı ile çalıştırın."
  exit 1
fi

# Sistem güncelleme
echo -e "${YELLOW}📦 Sistem güncelleniyor...${NC}"
sudo apt update
sudo apt upgrade -y

# Gerekli paketler
echo -e "${YELLOW}📦 Gerekli paketler kuruluyor...${NC}"
sudo apt install -y curl wget git nano ufw htop

# Docker kurulumu
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Docker kuruluyor...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker kuruldu${NC}"
else
    echo -e "${GREEN}✅ Docker zaten kurulu${NC}"
fi

# Docker Compose kurulumu
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}🐳 Docker Compose kuruluyor...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose kuruldu${NC}"
else
    echo -e "${GREEN}✅ Docker Compose zaten kurulu${NC}"
fi

# Certbot kurulumu (SSL için)
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}🔒 Certbot kuruluyor...${NC}"
    sudo apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot kuruldu${NC}"
else
    echo -e "${GREEN}✅ Certbot zaten kurulu${NC}"
fi

# Firewall ayarları
echo -e "${YELLOW}🔥 Firewall yapılandırılıyor...${NC}"
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
echo -e "${GREEN}✅ Firewall yapılandırıldı${NC}"

# .env dosyası kontrolü
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚙️ .env dosyası bulunamadı, oluşturuluyor...${NC}"
    cat > .env << 'EOF'
# Domain
DOMAIN=bendenotvar.com.tr

# Database
DATABASE_URL=file:./dev.db

# JWT
JWT_SECRET=CHANGE-THIS-TO-RANDOM-32-CHARACTER-STRING
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=bendenotvar <noreply@bendenotvar.com.tr>

# Allowed Email Domains
ALLOWED_EMAIL_DOMAINS=@ogr.uludag.edu.tr,@uludag.edu.tr
EOF
    echo -e "${RED}⚠️  ÖNEMLI: .env dosyasını düzenleyin!${NC}"
    echo -e "${YELLOW}nano .env komutu ile dosyayı açıp değerleri değiştirin.${NC}"
    exit 1
fi

# server/.env dosyası kontrolü
if [ ! -f server/.env ]; then
    echo -e "${YELLOW}⚙️ server/.env dosyası oluşturuluyor...${NC}"
    cp server/env.example server/.env
    echo -e "${RED}⚠️  server/.env dosyasını düzenleyin!${NC}"
    exit 1
fi

# client/.env dosyası kontrolü
if [ ! -f client/.env ]; then
    echo -e "${YELLOW}⚙️ client/.env dosyası oluşturuluyor...${NC}"
    cp client/env.example client/.env
    echo -e "${RED}⚠️  client/.env dosyasını düzenleyin!${NC}"
    exit 1
fi

# Upload klasörü oluştur
echo -e "${YELLOW}📁 Upload klasörü oluşturuluyor...${NC}"
mkdir -p server/uploads
chmod 755 server/uploads

# SSL klasörü oluştur
mkdir -p ssl

# Docker container'ları durdur (varsa)
if [ "$(docker ps -q)" ]; then
    echo -e "${YELLOW}🛑 Mevcut container'lar durduruluyor...${NC}"
    docker-compose -f docker-compose.production.yml down
fi

# Container'ları build et ve başlat
echo -e "${YELLOW}🐳 Container'lar build ediliyor ve başlatılıyor...${NC}"
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Container'ların başlamasını bekle
echo -e "${YELLOW}⏳ Container'lar başlatılıyor (30 saniye)...${NC}"
sleep 30

# Veritabanı migration
echo -e "${YELLOW}🗄️ Veritabanı migration yapılıyor...${NC}"
docker-compose -f docker-compose.production.yml exec -T backend npx prisma migrate deploy
docker-compose -f docker-compose.production.yml exec -T backend npx prisma generate

# Seed data
echo -e "${YELLOW}🌱 Seed data ekleniyor...${NC}"
docker-compose -f docker-compose.production.yml exec -T backend npm run db:seed || true

# Container durumlarını kontrol et
echo -e "${YELLOW}📊 Container durumları:${NC}"
docker-compose -f docker-compose.production.yml ps

# Health check
echo -e "${YELLOW}🏥 Health check yapılıyor...${NC}"
sleep 10

if curl -f http://localhost:5000/api/health &> /dev/null; then
    echo -e "${GREEN}✅ Backend sağlıklı${NC}"
else
    echo -e "${RED}❌ Backend sağlıksız! Logları kontrol edin: docker-compose -f docker-compose.production.yml logs backend${NC}"
fi

# SSL kurulumu için bilgilendirme
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Kurulum Tamamlandı!            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Container'lar çalışıyor${NC}"
echo ""
echo -e "${YELLOW}📝 Sonraki Adımlar:${NC}"
echo ""
echo -e "${YELLOW}1. SSL Sertifikası Kurulumu:${NC}"
echo "   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""
echo -e "${YELLOW}2. Faydalı Komutlar:${NC}"
echo "   docker-compose -f docker-compose.production.yml ps       # Durum"
echo "   docker-compose -f docker-compose.production.yml logs -f  # Loglar"
echo "   docker-compose -f docker-compose.production.yml restart  # Yeniden başlat"
echo "   docker-compose -f docker-compose.production.yml down     # Durdur"
echo ""
echo -e "${YELLOW}3. Güncelleme (kod değiştiğinde):${NC}"
echo "   git pull"
echo "   ./deploy-vds.sh"
echo ""
echo -e "${GREEN}🌐 Site: http://localhost${NC}"
echo -e "${GREEN}🔌 API: http://localhost/api${NC}"
echo ""

