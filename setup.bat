@echo off
title Setup Laravel + React (Vite) App
echo ==========================================
echo 🚀 Setting up Laravel + React environment...
echo ==========================================

REM Move to script directory
cd /d "%~dp0"

REM Check for Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js before running this script.
    pause
    exit /b
)

REM Check for Composer
where composer >nul 2>nul
if errorlevel 1 (
    echo ❌ Composer not found. Please install Composer before running this script.
    pause
    exit /b
)

REM ================================
REM Step 1: Laravel backend setup
REM ================================
echo 📦 Installing Laravel dependencies...
cd server
if not exist vendor (
    composer install
) else (
    echo ✅ Composer dependencies already installed.
)

REM Copy .env if not exists
if not exist .env (
    echo 🧩 Creating .env file from example...
    copy .env.example .env >nul
)

REM Generate app key
echo 🔑 Generating Laravel app key...
php artisan key:generate

REM =====================================
REM Step 1.1: Check & create database if needed
REM =====================================
echo 🗄️ Checking database connection...

REM Extract DB name, user, and password from .env
for /f "tokens=1,2 delims==" %%a in ('findstr "DB_DATABASE=" .env') do set %%a=%%b
for /f "tokens=1,2 delims==" %%a in ('findstr "DB_USERNAME=" .env') do set %%a=%%b
for /f "tokens=1,2 delims==" %%a in ('findstr "DB_PASSWORD=" .env') do set %%a=%%b
for /f "tokens=1,2 delims==" %%a in ('findstr "DB_HOST=" .env') do set %%a=%%b

if "%DB_HOST%"=="" set DB_HOST=127.0.0.1
if "%DB_USERNAME%"=="" set DB_USERNAME=root
if "%DB_DATABASE%"=="" set DB_DATABASE=capstoneclarmil

REM Attempt to create DB if it doesn't exist
echo Creating database "%DB_DATABASE%" (if missing)...
echo CREATE DATABASE IF NOT EXISTS %DB_DATABASE%; > createdb.sql
mysql -h %DB_HOST% -u %DB_USERNAME% -p %DB_PASSWORD% < createdb.sql
del createdb.sql

REM Run migrations
echo 🗄️ Running migrations...
php artisan migrate
REM Run migrations
echo 🗄️ Running seeders...
php artisan db:seed

REM Return to root
cd ..

REM ================================
REM Step 2: React frontend setup
REM ================================
echo 📦 Installing React + Vite dependencies...
cd client
if exist node_modules (
    echo ✅ Node modules already installed.
) else (
    npm install
)

REM Return to root
cd ..

echo ==========================================
echo ✅ Setup complete!
echo To start your app, run: run-app.bat
echo ==========================================
pause
