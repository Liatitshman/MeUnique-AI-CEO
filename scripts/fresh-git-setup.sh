#!/bin/bash

# Fresh Git Setup for MeUnique AI CEO
# This script creates a clean Git repository

echo "🚀 Starting fresh Git setup..."

# 1. Backup current state
BACKUP_DIR="$HOME/Desktop/MeUnique-AI-CEO-BACKUP-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup at: $BACKUP_DIR"
cp -r . "$BACKUP_DIR"

# 2. Clean problematic folders if they exist
echo "🧹 Cleaning problematic folders..."
find . -name "Liatitshman-MeUnique.AI" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*MeUnique.AI*" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "🎯_MeUnique-Business-FINAL" -type d -exec rm -rf {} + 2>/dev/null || true

# 3. Remove old Git history
echo "🗑️  Removing old Git history..."
rm -rf .git

# 4. Initialize new Git repository
echo "📝 Initializing new Git repository..."
git init

# 5. Configure Git
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 6. Add all files
echo "📂 Adding files to Git..."
git add .

# 7. Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Complete MeUnique AI CEO System

- 15 AI Agents fully implemented
- Smart Database with full CRUD operations
- Cost monitoring and optimization
- Background agents configured
- Docker deployment ready
- Complete documentation"

# 8. Rename branch to main
git branch -M main

echo "✅ Git setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub named 'MeUnique-AI-CEO'"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/MeUnique-AI-CEO.git"
echo "3. Run: git push -u origin main"
echo ""
echo "Or use GitHub Desktop to publish the repository" 