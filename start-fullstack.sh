#!/bin/bash

# Diet Tracker Full-Stack App Startup Script

echo "🥗 Starting Diet Tracker Full-Stack App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EOF
    echo "⚠️  Please update the JWT_SECRET in .env file for production use"
fi

# Start the full-stack application
echo "🚀 Starting full-stack application..."
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo "⏹️  Press Ctrl+C to stop the servers"
echo ""

npm run dev 