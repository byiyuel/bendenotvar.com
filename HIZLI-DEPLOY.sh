#!/bin/bash

# 🚀 Hızlı VDS Deploy Script
# Kullanım: VDS'te bu scripti çalıştır

set -e

echo "🚀 bendenotvar VDS Deploy Başlıyor..."

# Proje dizinine git
cd /opt/bendenotvar/bendenotvar.com

# Git'ten çek (opsiyonel)
git pull origin main

# Eski container'ları durdur
echo "🛑 Eski container'lar durduruluyor..."
docker-compose -f docker-compose.production.yml down

# Cache temizle
echo "🧹 Cache temizleniyor..."
docker system prune -a -f
docker builder prune -a -f

# Yeniden build et
echo "🔨 Yeniden build ediliyor (5-10 dakika sürebilir)..."
docker-compose -f docker-compose.production.yml build --no-cache

# Başlat
echo "🎬 Container'lar başlatılıyor..."
docker-compose -f docker-compose.production.yml up -d

# Bekle
echo "⏳ Container'ların başlaması bekleniyor..."
sleep 10

# Durum kontrolü
echo "✅ Container durumları:"
docker-compose -f docker-compose.production.yml ps

# Logları göster
echo "📋 Son loglar:"
docker-compose -f docker-compose.production.yml logs --tail=50

echo ""
echo "🎉 Deploy tamamlandı!"
echo "📊 Tam logları görmek için:"
echo "   docker-compose -f docker-compose.production.yml logs -f"
echo ""
echo "🔍 Test et:"
echo "   curl http://localhost:5000/api/health"
echo "   curl http://localhost"
echo ""

