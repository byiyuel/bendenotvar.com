# bendenotvar.com - Otomatik Deploy Script (PowerShell)
# Kullanım: .\deploy-local.ps1 "commit mesajı"

param(
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = ""
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "   bendenotvar.com - Otomatik Deploy" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Git durumunu kontrol et
Write-Host "[1/6] Git durumu kontrol ediliyor..." -ForegroundColor Cyan
git status
Write-Host ""

# Değişiklik var mı kontrol et
$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "Hata: Commit edilecek degisiklik yok!" -ForegroundColor Red
    exit 1
}

# Değişiklikleri ekle
Write-Host "[2/6] Degisiklikler git'e ekleniyor..." -ForegroundColor Cyan
git add .
Write-Host ""

# Commit mesajı al
if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    $CommitMessage = Read-Host "Commit mesaji girin"
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        Write-Host "Hata: Commit mesaji bos olamaz!" -ForegroundColor Red
        exit 1
    }
}

# Commit yap
Write-Host "[3/6] Commit yapiliyor..." -ForegroundColor Cyan
git commit -m "$CommitMessage"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Hata: Commit basarisiz!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Push yap
Write-Host "[4/6] GitHub'a push ediliyor..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Hata: Push basarisiz!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# VDS'ye SSH ile bağlan ve deploy et
Write-Host "[5/6] VDS'ye baglaniyor ve deploy ediliyor..." -ForegroundColor Cyan
Write-Host "VDS'ye SSH ile baglaniliyor (root@213.146.184.233)..." -ForegroundColor Yellow
Write-Host ""

$sshCommand = @"
cd /opt/bendenotvar/bendenotvar.com && \
git pull origin main && \
docker-compose -f docker-compose.production.yml down && \
docker-compose -f docker-compose.production.yml up -d --build && \
docker-compose -f docker-compose.production.yml logs --tail=50
"@

ssh root@213.146.184.233 $sshCommand

Write-Host ""
Write-Host "[6/6] Deploy tamamlandi!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Site guncellendi: https://bendenotvar.com.tr" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Loglari izlemek icin:" -ForegroundColor Yellow
Write-Host "  ssh root@213.146.184.233" -ForegroundColor White
Write-Host "  cd /opt/bendenotvar/bendenotvar.com" -ForegroundColor White
Write-Host "  docker-compose -f docker-compose.production.yml logs -f" -ForegroundColor White

