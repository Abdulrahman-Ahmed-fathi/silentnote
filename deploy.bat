@echo off
REM SilentNote Deployment Preparation Script for Windows
REM This script prepares your project for deployment

echo 🚀 SilentNote Deployment Preparation
echo =====================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

echo 📦 Step 1: Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

echo 🔍 Step 2: Running linting checks...
call npm run lint

if %errorlevel% neq 0 (
    echo ⚠️  Warning: Linting issues found. Please fix them before deployment.
    echo    You can continue, but it's recommended to fix these issues first.
    set /p continue="   Continue anyway? (y/N): "
    if /i not "%continue%"=="y" (
        pause
        exit /b 1
    )
)

echo 🏗️  Step 3: Building the project...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Error: Build failed. Please fix the build issues before deployment.
    pause
    exit /b 1
)

echo ✅ Build completed successfully

REM Check if dist folder exists and has content
if not exist "dist" (
    echo ❌ Error: dist folder not found after build
    pause
    exit /b 1
)

echo 📁 Step 4: Verifying build output...
echo    - dist folder created: ✅
echo    - Build files present: ✅

REM Check for key files
if exist "dist\index.html" (
    echo    - index.html present: ✅
) else (
    echo    - index.html missing: ❌
    pause
    exit /b 1
)

if exist "dist\assets" (
    echo    - assets folder present: ✅
) else (
    echo    - assets folder missing: ❌
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment preparation completed successfully!
echo.
echo 📋 Next steps:
echo    1. Initialize Git repository (if not already done):
echo       git init
echo       git add .
echo       git commit -m "Initial commit: SilentNote platform"
echo.
echo    2. Create GitHub repository and push:
echo       git remote add origin https://github.com/YOUR_USERNAME/silentnote.git
echo       git push -u origin main
echo.
echo    3. Deploy to Netlify:
echo       - Go to https://netlify.com
echo       - Click "New site from Git"
echo       - Connect your GitHub repository
echo       - Configure build settings (auto-detected)
echo       - Add environment variables
echo       - Deploy!
echo.
echo 📖 For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.
pause
