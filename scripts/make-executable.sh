#!/bin/bash

# Make all scripts executable
echo "🔧 Making scripts executable..."

chmod +x scripts/*.sh
chmod +x scripts/*.js
chmod +x scripts/*.py

echo "✅ All scripts are now executable"

# List all scripts
echo ""
echo "📋 Available scripts:"
echo "-------------------"
ls -la scripts/ | grep -E "\.(sh|js|py)$"

node scripts/terminal-connection-fix.js 

cd /Users/liattishman/Desktop/MeUnique-AI-CEO
pwd
git status
ls -la | head -10 

# מחיקת קבצים מיותרים
find . -name ".DS_Store" -delete
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# בדיקה שאין תיקיות בעייתיות
ls -la | grep -E "(Liatitshman|MeUnique-AI-CEO)" 