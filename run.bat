@echo off
setlocal EnableDelayedExpansion
title MIET AI Chatbot - Enterprise Bootloader

:: Get the directory where the script is located
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo ====================================================
echo      MIET AI HELPDESK SYSTEM - BOOT LOADER
echo ====================================================

:: 1. PREREQUISITE CHECK
echo [*] Checking Environment Requirements...

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python not found in PATH. Please install Python.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js/NPM not found in PATH. Please install Node.js.
    pause
    exit /b 1
)

:: 2. PORT CLEANUP
echo [*] Freeing up critical ports (8000, 5173)...

:: Find and kill processes on 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo [!] Clearing Backend Port 8000 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

:: Find and kill processes on 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo [!] Clearing Frontend Port 5173 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

:: 3. BACKEND SETUP
echo [*] Validating Backend...
if not exist "backend\venv" (
    echo [-] Virtual environment missing. Creating...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
)

:: 4. FRONTEND SETUP
echo [*] Validating Frontend...
if not exist "frontend\node_modules" (
    echo [-] Node modules missing. Installing dependencies...
    cd frontend
    npm install
    cd ..
)

:: 5. LAUNCH SYSTEM
echo ----------------------------------------------------
echo [SUCCESS] Skipping validation checks and Launching...
echo ----------------------------------------------------

:: BACKEND
start "MIET_BACKEND_SERVER" cmd /k "cd /d "%ROOT_DIR%backend" && call venv\Scripts\activate && echo [BACKEND] Starting... && python main.py"

:: FRONTEND
start "MIET_FRONTEND_VITE" cmd /k "cd /d "%ROOT_DIR%frontend" && echo [FRONTEND] Starting... && npm run dev"

echo.
echo [INFO] LOCAL ACCESS:
echo  -   Frontend: http://localhost:5173
echo  -   Admin:    http://localhost:5173/admin
echo  -   Backend:  http://localhost:8000
echo.
echo [!] Keep this window open or close it once servers are confirmed.
echo ====================================================
timeout /t 5
