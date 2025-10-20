# ⚡ VDS'te Hızlı Kurulum (5 Dakika)

## 📋 İhtiyaçlar
- ✅ VDS IP adresi
- ✅ Domain adı (bendenotvar.com.tr)
- ✅ Gmail hesabı (email göndermek için)

---

## 🚀 Adım Adım Kurulum

### 1️⃣ VDS'e Bağlan
```bash
ssh root@YOUR_VDS_IP
```

### 2️⃣ Proje Klasörü Oluştur
```bash
mkdir -p /opt/bendenotvar
cd /opt/bendenotvar
```

### 3️⃣ Projeyi Yükle

**Seçenek A: Git ile**
```bash
# Önce GitHub'a push edin, sonra:
git clone https://github.com/YOUR-USERNAME/bendenotvar.com.git .
```

**Seçenek B: Manuel (WinSCP/FileZilla)**
- Tüm dosyaları `/opt/bendenotvar` klasörüne yükleyin

### 4️⃣ Gerekli Dosyaları Oluştur

```bash
# Ana .env
cat > .env << 'EOF'
DOMAIN=bendenotvar.com.tr
DATABASE_URL=file:./dev.db
JWT_SECRET=uygulama-icin-guclu-32-karakterlik-sifre-12345678
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=bendenotvar <noreply@bendenotvar.com.tr>
ALLOWED_EMAIL_DOMAINS=@ogr.uludag.edu.tr,@uludag.edu.tr
EOF

# Backend .env
cat > server/.env << 'EOF'
DATABASE_URL="file:./dev.db"
JWT_SECRET="uygulama-icin-guclu-32-karakterlik-sifre-12345678"
JWT_EXPIRES_IN="7d"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-gmail-app-password"
EMAIL_FROM="bendenotvar <noreply@bendenotvar.com.tr>"
PORT=5000
NODE_ENV="production"
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760
CLIENT_URL="https://bendenotvar.com.tr"
ALLOWED_EMAIL_DOMAINS="@ogr.uludag.edu.tr,@uludag.edu.tr"
EOF

# Frontend .env
cat > client/.env << 'EOF'
REACT_APP_API_URL=https://bendenotvar.com.tr/api
REACT_APP_SOCKET_URL=https://bendenotvar.com.tr
EOF
```

**⚠️ ÖNEMLİ:** Yukarıdaki dosyalarda:
- `your-gmail@gmail.com` → Kendi Gmail adresiniz
- `your-gmail-app-password` → Gmail App Password ([nasıl alınır?](#gmail-app-password))
- `bendenotvar.com.tr` → Kendi domain adınız

### 5️⃣ Deploy Scriptini Çalıştır
```bash
chmod +x deploy-vds.sh
./deploy-vds.sh
```

Script otomatik olarak:
- ✅ Docker kurulumu
- ✅ Container'ları çalıştırma
- ✅ Veritabanı kurulumu
- ✅ Firewall ayarları
- ✅ Health check

yapacaktır.

### 6️⃣ SSL Sertifikası Kur (BEDAVA)
```bash
sudo certbot --nginx -d bendenotvar.com.tr -d www.bendenotvar.com.tr --non-interactive --agree-tos --email admin@bendenotvar.com.tr
```

### 7️⃣ Test Et
```bash
# Backend test
curl http://localhost:5000/api/health

# Browser'da
# https://bendenotvar.com.tr
```

---

## 📧 Gmail App Password Alma {#gmail-app-password}

1. https://myaccount.google.com/security adresine git
2. **2-Step Verification** aktif et
3. **App passwords** kısmına git
4. "Other (Custom name)" seç → "bendenotvar" yaz
5. Oluşan 16 haneli şifreyi kopyala
6. `.env` dosyalarına yapıştır

---

## 🔄 Güncelleme (Kod Değiştiğinde)

```bash
cd /opt/bendenotvar
git pull
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

---

## 🛠️ Faydalı Komutlar

```bash
# Container durumu
docker-compose -f docker-compose.production.yml ps

# Logları görüntüle
docker-compose -f docker-compose.production.yml logs -f

# Backend logları
docker-compose -f docker-compose.production.yml logs -f backend

# Yeniden başlat
docker-compose -f docker-compose.production.yml restart

# Durdur
docker-compose -f docker-compose.production.yml down

# Kaynak kullanımı
docker stats
```

---

## 🆘 Sorun mu Var?

### Site açılmıyor?
```bash
# Container'ları kontrol et
docker-compose -f docker-compose.production.yml ps

# Logları kontrol et
docker-compose -f docker-compose.production.yml logs -f
```

### Backend hatası?
```bash
# Backend logları
docker-compose -f docker-compose.production.yml logs backend

# Backend container'a gir
docker-compose -f docker-compose.production.yml exec backend sh
```

### DNS problemi?
```bash
# DNS kontrolü
ping bendenotvar.com.tr

# A kaydı kontrolü
nslookup bendenotvar.com.tr
```

---

## 🎉 Tamamlandı!

Site artık şu adreslerde çalışıyor:
- 🌐 **Frontend**: https://bendenotvar.com.tr
- 🔌 **API**: https://bendenotvar.com.tr/api
- 💬 **WebSocket**: wss://bendenotvar.com.tr

**Başarılar! 🚀**

---

## 📚 Detaylı Bilgi

Daha fazla bilgi için `VDS-KURULUM-REHBERI.md` dosyasına bakın.

