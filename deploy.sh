#!/bin/bash

# SilentNote Deployment Preparation Script
# This script prepares your project for deployment

echo "🚀 SilentNote Deployment Preparation"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

echo "🔍 Step 2: Running linting checks..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Linting issues found. Please fix them before deployment."
    echo "   You can continue, but it's recommended to fix these issues first."
    read -p "   Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🏗️  Step 3: Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed. Please fix the build issues before deployment."
    exit 1
fi

echo "✅ Build completed successfully"

# Check if dist folder exists and has content
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found after build"
    exit 1
fi

echo "📁 Step 4: Verifying build output..."
echo "   - dist folder created: ✅"
echo "   - Build files present: ✅"

# Check for key files
if [ -f "dist/index.html" ]; then
    echo "   - index.html present: ✅"
else
    echo "   - index.html missing: ❌"
    exit 1
fi

if [ -d "dist/assets" ]; then
    echo "   - assets folder present: ✅"
else
    echo "   - assets folder missing: ❌"
    exit 1
fi

echo ""
echo "🎉 Deployment preparation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Initialize Git repository (if not already done):"
echo "      git init"
echo "      git add ."
echo "      git commit -m 'Initial commit: SilentNote platform'"
echo ""
echo "   2. Create GitHub repository and push:"
echo "      git remote add origin https://github.com/YOUR_USERNAME/silentnote.git"
echo "      git push -u origin main"
echo ""
echo "   3. Deploy to Netlify:"
echo "      - Go to https://netlify.com"
echo "      - Click 'New site from Git'"
echo "      - Connect your GitHub repository"
echo "      - Configure build settings (auto-detected)"
echo "      - Add environment variables"
echo "      - Deploy!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
