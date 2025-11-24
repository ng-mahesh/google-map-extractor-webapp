#!/bin/bash

# Google Maps Data Extractor - Installation Script
# This script automates the installation process

echo "=================================================="
echo "  Google Maps Data Extractor - Installation"
echo "=================================================="
echo ""

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js version: $NODE_VERSION"
echo ""

# Check npm
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm version: $NPM_VERSION"
echo ""

# Check MongoDB
echo "Checking MongoDB installation..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  Warning: MongoDB is not found in PATH."
    echo "   Please make sure MongoDB is installed and running."
else
    MONGO_VERSION=$(mongod --version | head -n 1)
    echo "✅ MongoDB: $MONGO_VERSION"
fi
echo ""

# Install Backend Dependencies
echo "=================================================="
echo "  Installing Backend Dependencies"
echo "=================================================="
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed successfully"
echo ""

# Setup Backend .env
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "✅ Backend .env file created"
    echo "⚠️  Please edit backend/.env and configure your settings"
else
    echo "✅ Backend .env file already exists"
fi
echo ""

cd ..

# Install Frontend Dependencies
echo "=================================================="
echo "  Installing Frontend Dependencies"
echo "=================================================="
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed successfully"
echo ""

# Setup Frontend .env.local
if [ ! -f .env.local ]; then
    echo "Creating frontend .env.local file..."
    cp .env.example .env.local
    echo "✅ Frontend .env.local file created"
else
    echo "✅ Frontend .env.local file already exists"
fi
echo ""

cd ..

# Final Instructions
echo "=================================================="
echo "  Installation Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Make sure MongoDB is running:"
echo "   mongod"
echo ""
echo "2. Edit configuration files if needed:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo ""
echo "3. Start the backend server:"
echo "   cd backend"
echo "   npm run start:dev"
echo ""
echo "4. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "5. Open your browser at:"
echo "   http://localhost:3000"
echo ""
echo "=================================================="
echo "For more information, see:"
echo "  - README.md"
echo "  - QUICK_START.md"
echo "  - PROJECT_SUMMARY.md"
echo "=================================================="
