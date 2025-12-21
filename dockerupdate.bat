@echo off
setlocal enabledelayedexpansion

:MENU
cls
echo ========================================
echo Medical Microservices Update Manager
echo ========================================
echo.
echo Select the service to rebuild and reload:
echo.
echo 1) Discovery Service
echo 2) Config Server
echo 3) API Gateway
echo 4) Auth Service
echo 5) Patient Service
echo 6) RDV Service
echo 7) Medical Frontend
echo.
echo 8) UPDATE ALL (Infrastucture + Apps)
echo 9) WIPE ALL DATA (Reset Databases)
echo 10) Exit
echo.
echo ========================================
set /p choice="Enter choice (1-10): "

if "%choice%"=="1" set SERVICE=discovery-service
if "%choice%"=="2" set SERVICE=config-server
if "%choice%"=="3" set SERVICE=gateway-service
if "%choice%"=="4" set SERVICE=auth-service
if "%choice%"=="5" set SERVICE=patient-service
if "%choice%"=="6" set SERVICE=rdv-service
if "%choice%"=="7" set SERVICE=medical-frontend
if "%choice%"=="8" goto UPDATE_ALL
if "%choice%"=="9" goto WIPE_DATA
if "%choice%"=="10" exit /b 0

if "!SERVICE!"=="" (
    echo Invalid choice!
    pause
    goto MENU
)

echo.
echo Update started for: !SERVICE!
echo ----------------------------------------
echo [1/3] Stopping container...
docker-compose stop !SERVICE!

echo [2/3] Rebuilding image...
docker-compose build !SERVICE!

echo [3/3] Starting service...
docker-compose up -d !SERVICE!

echo.
echo Update completed for !SERVICE!
pause
goto MENU

:UPDATE_ALL
echo.
echo Update started for ALL services
echo ----------------------------------------
echo This will stop, rebuild, and restart the entire stack.
echo Proceed? (Y/N)
set /p confirm="> "
if /i not "%confirm%"=="Y" goto MENU

docker-compose up -d --build
echo.
echo Full update completed!
pause
goto MENU

:WIPE_DATA
echo.
echo !!! WARNING: THIS WILL DELETE ALL DATABASE DATA !!!
echo --------------------------------------------------
echo Proceed? (Y/N)
set /p confirm="> "
if /i not "%confirm%"=="Y" goto MENU

echo Stopping services and removing volumes...
docker-compose down -v
echo Restarting fresh...
docker-compose up -d --build
echo.
echo All data wiped and services restarted fresh!
pause
goto MENU