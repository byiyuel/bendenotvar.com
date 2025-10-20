@echo off
echo ========================================
echo    bendenotvar.com - Otomatik Deploy
echo ========================================
echo.

REM Git durumunu kontrol et
echo [1/6] Git durumu kontrol ediliyor...
git status
echo.

REM Değişiklikleri ekle
echo [2/6] Degisiklikler git'e ekleniyor...
git add .
echo.

REM Commit mesajı al
set /p commit_msg="Commit mesaji girin (bos birakmayin): "
if "%commit_msg%"=="" (
    echo Hata: Commit mesaji bos olamaz!
    pause
    exit /b 1
)

REM Commit yap
echo [3/6] Commit yapiliyor...
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo Hata: Commit basarisiz!
    pause
    exit /b 1
)
echo.

REM Push yap
echo [4/6] GitHub'a push ediliyor...
git push origin main
if errorlevel 1 (
    echo Hata: Push basarisiz!
    pause
    exit /b 1
)
echo.

REM VDS'ye SSH ile bağlan ve deploy et
echo [5/6] VDS'ye baglaniyor ve deploy ediliyor...
echo.
echo VDS'ye SSH ile baglaniliyor (root@213.146.184.233)...
echo Asagidaki komutlari VDS'de calistirin:
echo.
echo   cd /opt/bendenotvar/bendenotvar.com
echo   git pull origin main
echo   docker-compose -f docker-compose.production.yml down
echo   docker-compose -f docker-compose.production.yml up -d --build
echo   docker-compose -f docker-compose.production.yml logs -f
echo.

ssh root@213.146.184.233 "cd /opt/bendenotvar/bendenotvar.com && git pull origin main && docker-compose -f docker-compose.production.yml down && docker-compose -f docker-compose.production.yml up -d --build && docker-compose -f docker-compose.production.yml logs --tail=50"

echo.
echo [6/6] Deploy tamamlandi!
echo.
echo ========================================
echo   Site guncellendi: https://bendenotvar.com.tr
echo ========================================
pause

