# 🚀 Hızlı Deploy Rehberi

Bu rehber, bendenotvar.com projesini tek komutla VDS'ye deploy etmek için hazırlanmıştır.

## 📋 İçindekiler

1. [Otomatik Deploy (Önerilen)](#otomatik-deploy)
2. [Manuel Deploy](#manuel-deploy)
3. [Sorun Giderme](#sorun-giderme)

---

## 🎯 Otomatik Deploy (Önerilen)

### Windows (PowerShell) - En İyi Seçenek

```powershell
# Basit kullanım (commit mesajı isteyecek)
.\deploy-local.ps1

# Commit mesajı ile birlikte
.\deploy-local.ps1 "Dark mode ve mail template güncellendi"
```

### Windows (CMD/Batch)

```cmd
deploy-local.bat
```

> **Not:** İlk çalıştırmada PowerShell execution policy hatası alırsanız:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

## 📝 Scriptlerin Yaptığı İşlemler

1. ✅ Git durumunu kontrol eder
2. ✅ Değişiklikleri `git add .` ile ekler
3. ✅ Commit yapar (mesaj girmenizi ister)
4. ✅ GitHub'a push eder (`git push origin main`)
5. ✅ VDS'ye SSH ile bağlanır
6. ✅ VDS'de kodu çeker (`git pull`)
7. ✅ Docker container'ları durdurur
8. ✅ Yeniden build eder ve başlatır
9. ✅ Son 50 log satırını gösterir

**Toplam Süre:** ~3-5 dakika (internet hızınıza bağlı)

---

## 🛠️ Manuel Deploy

Eğer scriptleri kullanmak istemezseniz, manuel olarak şu adımları takip edin:

### 1. Yerel (Windows) Tarafında

```bash
# Değişiklikleri ekle
git add .

# Commit yap
git commit -m "Açıklama mesajı"

# GitHub'a push et
git push origin main
```

### 2. VDS Tarafında

```bash
# VDS'ye bağlan
ssh root@213.146.184.233

# Proje dizinine git
cd /opt/bendenotvar/bendenotvar.com

# Kodu çek
git pull origin main

# Container'ları durdur
docker-compose -f docker-compose.production.yml down

# Yeniden build et ve başlat
docker-compose -f docker-compose.production.yml up -d --build

# Logları izle
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🔧 Hızlı Komutlar

### Sadece Frontend Güncellemesi

```bash
ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml up -d --build --no-deps frontend"
```

### Sadece Backend Güncellemesi

```bash
ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml up -d --build --no-deps backend"
```

### Logları İzleme

```bash
# Tüm servislerin logları
ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml logs -f"

# Sadece backend logları
ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml logs -f backend"

# Son 100 log satırı
ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml logs --tail=100"
```

### Container Durumunu Kontrol

```bash
ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml ps"
```

### Hızlı Restart (Build Olmadan)

```bash
ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml restart"
```

---

## 🚨 Sorun Giderme

### 1. SSH Bağlantı Hatası

**Hata:** `Permission denied (publickey)`

**Çözüm:**
```bash
# SSH key'inizi ekleyin
ssh-copy-id root@213.146.184.233

# Veya şifre ile bağlanın
ssh root@213.146.184.233
```

### 2. Git Conflict

**Hata:** `error: Your local changes would be overwritten by merge`

**Çözüm:**
```bash
# Yerel değişiklikleri commit edin veya stash'leyin
git stash
git pull origin main
git stash pop
```

### 3. Docker Build Hatası

**Hata:** `ERROR: failed to solve...`

**Çözüm:**
```bash
# VDS'de Docker cache'i temizleyin
ssh root@213.146.184.233 "docker system prune -af"

# Yeniden build edin
ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml up -d --build --force-recreate"
```

### 4. Port 443 Zaten Kullanımda

**Hata:** `bind: address already in use`

**Çözüm:**
```bash
# Nginx container'ını durdurun
ssh root@213.146.184.233 "docker stop bendenotvar_nginx"

# Yeniden başlatın
ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml up -d"
```

### 5. Database Migration Gerekli

**Çözüm:**
```bash
# Prisma migration'ları çalıştırın
ssh root@213.146.184.233 "docker exec bendenotvar_backend npx prisma migrate deploy"
```

---

## 📊 Deploy Checklist

Deploy yapmadan önce kontrol edin:

- [ ] Yerel testler başarılı mı?
- [ ] `.env` dosyaları güncel mi?
- [ ] Database migration'ları hazır mı?
- [ ] Breaking change var mı?
- [ ] SSL sertifikaları geçerli mi? (3 ayda bir yenilenmelidir)

---

## 🎓 İpuçları

1. **Sık Deploy Edin:** Küçük, sık güncellemeler büyük, riskli güncellemelerden daha iyidir.

2. **Commit Mesajlarına Dikkat:** Anlamlı commit mesajları yazın:
   - ✅ "Dark mode eklendi ve profil overflow düzeltildi"
   - ❌ "fix"

3. **Logları İzleyin:** Deploy sonrası mutlaka logları kontrol edin:
   ```bash
   ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml logs -f"
   ```

4. **Backup Alın:** Önemli güncellemelerden önce database backup'ı alın:
   ```bash
   ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker exec bendenotvar_postgres pg_dump -U bendenotvar bendenotvar > backup_$(date +%Y%m%d_%H%M%S).sql"
   ```

---

## 📞 Yardım

Sorun yaşıyorsanız:

1. Logları kontrol edin
2. Docker container durumunu kontrol edin
3. VDS disk alanını kontrol edin: `df -h`
4. Memory kullanımını kontrol edin: `free -h`

**Acil Durum:**
- Site çöktüyse: `ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml restart"`
- Tamamen sıfırlama: `ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && docker-compose -f docker-compose.production.yml down && docker-compose -f docker-compose.production.yml up -d"`

---

**Son Güncelleme:** 20 Ekim 2025
**Versiyon:** 1.0

