#!/bin/bash

# bendenotvar Deployment Script
# Bu script VPS/Dedicated server'da çalıştırılmalıdır

set -e

echo "🚀 bendenotvar Deployment Başlatılıyor..."

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Sistem güncellemesi
echo -e "${YELLOW}📦 Sistem güncelleniyor...${NC}"
sudo apt update && sudo apt upgrade -y

# Gerekli paketlerin kurulumu
echo -e "${YELLOW}📦 Gerekli paketler kuruluyor...${NC}"
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Docker kurulumu
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Docker kuruluyor...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Docker Compose kurulumu
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}🐳 Docker Compose kuruluyor...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Proje klasörü oluşturma
PROJECT_DIR="/opt/bendenotvar"
echo -e "${YELLOW}📁 Proje klasörü oluşturuluyor: $PROJECT_DIR${NC}"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Proje dosyalarını kopyalama (Git'ten clone edilecek)
echo -e "${YELLOW}📥 Proje dosyaları kopyalanıyor...${NC}"
# git clone https://github.com/yourusername/bendenotvar.git $PROJECT_DIR
# cd $PROJECT_DIR

# Environment dosyalarını oluşturma
echo -e "${YELLOW}⚙️ Environment dosyaları oluşturuluyor...${NC}"
cp server/env.example server/.env
cp client/env.example client/.env

echo -e "${YELLOW}📝 Lütfen environment dosyalarını düzenleyin:${NC}"
echo "1. server/.env dosyasını düzenleyin"
echo "2. client/.env dosyasını düzenleyin"
echo "3. Bu scripti tekrar çalıştırın"

# SSL sertifikası kurulumu
echo -e "${YELLOW}🔒 SSL sertifikası kuruluyor...${NC}"
sudo certbot --nginx -d bendenotvar.com -d www.bendenotvar.com --non-interactive --agree-tos --email admin@bendenotvar.com

# Docker container'ları başlatma
echo -e "${YELLOW}🐳 Docker container'ları başlatılıyor...${NC}"
docker-compose up -d

# Veritabanı migration'ları
echo -e "${YELLOW}🗄️ Veritabanı migration'ları çalıştırılıyor...${NC}"
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma generate

# Seed data (opsiyonel)
echo -e "${YELLOW}🌱 Seed data ekleniyor...${NC}"
docker-compose exec backend npm run db:seed

# Nginx yapılandırması
echo -e "${YELLOW}🌐 Nginx yapılandırılıyor...${NC}"
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl reload nginx

# Firewall yapılandırması
echo -e "${YELLOW}🔥 Firewall yapılandırılıyor...${NC}"
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Sistem servislerini başlatma
echo -e "${YELLOW}🔄 Sistem servisleri başlatılıyor...${NC}"
sudo systemctl enable nginx
sudo systemctl start nginx

# Health check
echo -e "${YELLOW}🏥 Health check yapılıyor...${NC}"
sleep 30
if curl -f http://localhost/api/health; then
    echo -e "${GREEN}✅ Backend sağlıklı${NC}"
else
    echo -e "${RED}❌ Backend sağlıksız${NC}"
fi

if curl -f http://localhost; then
    echo -e "${GREEN}✅ Frontend sağlıklı${NC}"
else
    echo -e "${RED}❌ Frontend sağlıksız${NC}"
fi

echo -e "${GREEN}🎉 Deployment tamamlandı!${NC}"
echo -e "${GREEN}🌐 Site: https://bendenotvar.com${NC}"
echo -e "${GREEN}📊 Logs: docker-compose logs -f${NC}"
echo -e "${GREEN}🔄 Restart: docker-compose restart${NC}"
echo -e "${GREEN}🛑 Stop: docker-compose down${NC}"


