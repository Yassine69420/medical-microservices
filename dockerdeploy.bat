@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Medical Microservices Deployment
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running...
echo.

echo Stopping any existing containers...
docker-compose down

echo.
echo Building and starting services...
echo This may take several minutes on first run...
echo.

docker-compose up -d --build

echo.
echo ========================================
echo Waiting for Infrastucture Services
echo ========================================
echo.

echo Waiting for MySQL to be ready...
timeout /t 15 /nobreak >nul

echo Waiting for Discovery Service...
timeout /t 10 /nobreak >nul

echo Waiting for Config Server...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo Service Status (Docker Compose)
echo ========================================
echo.

docker-compose ps

echo.
echo ========================================
echo Checking Service Health
echo ========================================
echo.

REM Check MySQL
docker-compose exec -T mysql mysqladmin ping -h localhost -proot >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MySQL is active
) else (
    echo [WARN] MySQL might still be initializing
)

REM Check Discovery Service
curl -s http://localhost:8761/actuator/health | findstr "UP" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Discovery Service is UP
) else (
    echo [WARN] Discovery Service is not ready yet
)

REM Check Config Server
curl -s http://localhost:8888/actuator/health | findstr "UP" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Config Server is UP
) else (
    echo [WARN] Config Server is not ready yet
)

REM Check Gateway Service
curl -s http://localhost:8080/actuator/health | findstr "UP" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Gateway Service is UP
) else (
    echo [WARN] Gateway Service is not ready yet
)

REM Check Auth Service
curl -s http://localhost:8083/actuator/health | findstr "UP" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Auth Service is UP
) else (
    echo [WARN] Auth Service is not ready yet
)

REM Check Patient Service
curl -s http://localhost:8081/actuator/health | findstr "UP" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Patient Service is UP
) else (
    echo [WARN] Patient Service is not ready yet
)

REM Check RDV Service
curl -s http://localhost:8082/actuator/health | findstr "UP" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] RDV Service is UP
) else (
    echo [WARN] RDV Service is not ready yet
)

REM Check Frontend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Medical Frontend is reachable
) else (
    echo [WARN] Medical Frontend is not ready yet
)

echo.
echo ========================================
echo Access Information
echo ========================================
echo.
echo Medical Frontend:   http://localhost:3000
echo API Gateway:        http://localhost:8080
echo Discovery Server:   http://localhost:8761
echo Config Server:      http://localhost:8888
echo.
echo Microservices Direct Access:
echo   Auth Service:     http://localhost:8083
echo   Patient Service:  http://localhost:8081
echo   RDV Service:      http://localhost:8082
echo.
echo Database (MySQL):   localhost:3306
echo   Root Password:    root
echo   Databases:        medical_auth_db, patient_db, rdv_db
echo.
echo ========================================
echo Troubleshooting Commands
echo ========================================
echo.
echo View all logs:       docker-compose logs -f
echo View Gateway logs:   docker-compose logs -f gateway-service
echo View Auth logs:      docker-compose logs -f auth-service
echo View Patient logs:   docker-compose logs -f patient-service
echo View RDV logs:       docker-compose logs -f rdv-service
echo View Frontend logs:  docker-compose logs -f medical-frontend
echo Stop everything:     docker-compose down
echo.

pause
