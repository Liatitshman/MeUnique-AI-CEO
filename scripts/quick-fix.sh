#!/bin/bash

echo "🚀 MeUnique AI CEO - Quick Fix Script"
echo "===================================="
echo ""
echo "This script will:"
echo "1. Fix Git issues"
echo "2. Set up GitHub connection" 
echo "3. Configure background agents"
echo "4. Create shortcuts"
echo ""

# Ask for GitHub username
echo "Please enter your GitHub username:"
read GITHUB_USERNAME

# Fix current Git issues
echo "📌 Fixing Git issues..."
git config user.name "$GITHUB_USERNAME"
git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"

# Update remote
echo "📌 Updating Git remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${GITHUB_USERNAME}/MeUnique-AI-CEO.git"

# Create logs directory
mkdir -p logs

# Create desktop shortcut
echo "📌 Creating desktop shortcut..."
cat > ~/Desktop/MeUnique-AI-CEO.command << EOF
#!/bin/bash
cd "/Users/liattishman/Desktop/MeUnique-AI-CEO"
cursor .
EOF
chmod +x ~/Desktop/MeUnique-AI-CEO.command

echo ""
echo "✅ Quick fix complete!"
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/new"
echo "2. Create a new repository named: MeUnique-AI-CEO"
echo "3. Don't initialize it with README"
echo "4. Come back here and run: git push -u origin main"
echo ""
echo "To open in Cursor: Double-click the desktop shortcut"
echo "To run the project: npm run dev" 