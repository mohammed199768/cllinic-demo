@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 20 or newer, then run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Repair the Node.js installation, then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\next\package.json" (
  echo Installing OurClinic demo dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo.
echo OurClinic unified demo
echo Public:      http://127.0.0.1:4173/
echo Admin:       http://127.0.0.1:4173/admin
echo Admin login: http://127.0.0.1:4173/admin/login
echo.
call npm run dev
