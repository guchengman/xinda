@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ================================
echo    xinda56.cn
echo ================================
echo.

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Install failed
        pause
        exit /b 1
    )
    echo.
)

echo Starting: http://localhost:4321/
echo.

call npx astro dev

pause
