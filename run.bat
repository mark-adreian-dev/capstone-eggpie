@echo off
title Run Laravel + React (Vite) App
echo ==========================================
echo Starting local web app...
echo ==========================================

REM Change to script directory
cd /d "%~dp0"

REM Start Laravel backend
echo Starting Laravel server...
cd server
start "Laravel Server" cmd /k "php artisan serve"

REM Wait 3 seconds before starting frontend
timeout /t 3 /nobreak >nul

REM Start React frontend
echo Starting React (Vite) client...
cd ../client
start "Vite Client" cmd /k "npm run dev"
start http://localhost:5173
