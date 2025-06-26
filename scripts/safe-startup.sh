#!/bin/bash

# Safe Startup Script for MeUnique AI CEO System
# This script ensures clean startup without terminal issues

echo "🚀 Starting MeUnique AI CEO System safely..."

# 1. Get the correct directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "📁 Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# 2. Clean up problematic folders
echo "🧹 Cleaning up problematic folders..."
find . -name "Liatitshman-MeUnique.AI" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "🎯_MeUnique-Business-FINAL" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Check for duplicate MeUnique-AI-CEO folder
if [ -d "MeUnique-AI-CEO" ]; then
    echo "⚠️  Found duplicate MeUnique-AI-CEO folder, cleaning..."
    if [ -d "MeUnique-AI-CEO/.git" ]; then
        # Move git to parent
        mv MeUnique-AI-CEO/.git .git 2>/dev/null || true
    fi
    # Move all files up
    mv MeUnique-AI-CEO/* . 2>/dev/null || true
    mv MeUnique-AI-CEO/.* . 2>/dev/null || true
    # Remove empty folder
    rmdir MeUnique-AI-CEO 2>/dev/null || true
fi

# 3. Verify Git status
echo "🔍 Checking Git status..."
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository! Initializing..."
    git init
    git add .
    git commit -m "Initial commit - MeUnique AI CEO System"
else
    echo "✅ Git repository found"
    # Clean git status
    git status --porcelain | grep -E "(Liatitshman|MeUnique-Business-FINAL)" | cut -c 4- | xargs -I {} git rm -rf --cached "{}" 2>/dev/null || true
fi

# 4. Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# 5. Kill any zombie processes
echo "🧹 Cleaning up zombie processes..."
pkill -f "node.*background-agents-monitor" || true
pkill -f "python.*cost_monitor" || true

# 6. Start the terminal connection fix
echo "🔧 Starting terminal connection fix..."
node scripts/terminal-connection-fix.js &
TERMINAL_FIX_PID=$!

# 7. Wait a moment for initialization
sleep 2

# 8. Check if everything is running
if ps -p $TERMINAL_FIX_PID > /dev/null; then
    echo "✅ Terminal connection fix is running (PID: $TERMINAL_FIX_PID)"
else
    echo "❌ Terminal connection fix failed to start"
    exit 1
fi

# 9. Start the development server
echo "🌐 Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# 10. Display status
echo ""
echo "========================================"
echo "✅ MeUnique AI CEO System is running!"
echo "========================================"
echo "📊 Terminal Fix PID: $TERMINAL_FIX_PID"
echo "🌐 Dev Server PID: $DEV_SERVER_PID"
echo ""
echo "🔗 Access the system at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================"

# Handle shutdown
trap cleanup EXIT

cleanup() {
    echo ""
    echo "👋 Shutting down services..."
    kill $TERMINAL_FIX_PID 2>/dev/null || true
    kill $DEV_SERVER_PID 2>/dev/null || true
    pkill -f "node.*background-agents-monitor" || true
    echo "✅ Shutdown complete"
}

# Keep script running
wait 