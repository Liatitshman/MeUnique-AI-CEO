#!/bin/bash

# GitHub Desktop Connection Fix Script
# This script helps connect your project to GitHub Desktop

echo "🔧 GitHub Desktop Connection Fix"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Check current directory
echo -e "\n${YELLOW}Step 1: Verifying project location${NC}"
CURRENT_DIR=$(pwd)
echo "Current directory: $CURRENT_DIR"

# Step 2: Fix Git configuration
echo -e "\n${YELLOW}Step 2: Fixing Git configuration${NC}"

# Remove any problematic entries
git rm -f --cached MeUnique-AI-CEO 2>/dev/null || true
git add -A
git commit -m "Fix: Remove duplicate directory reference" || echo "Nothing to commit"

# Step 3: Create GitHub Desktop configuration
echo -e "\n${YELLOW}Step 3: Creating GitHub Desktop configuration${NC}"

# Create .git/config with proper format
cat > .git/config << EOF
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
	ignorecase = true
	precomposeunicode = true
[remote "origin"]
	url = https://github.com/YOUR_USERNAME/MeUnique-AI-CEO.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
[user]
	name = Your Name
	email = your.email@example.com
EOF

echo "Please enter your GitHub username:"
read GITHUB_USERNAME

echo "Please enter your email:"
read GITHUB_EMAIL

echo "Please enter your full name:"
read FULL_NAME

# Update Git config with user details
git config user.name "$FULL_NAME"
git config user.email "$GITHUB_EMAIL"
git config remote.origin.url "https://github.com/${GITHUB_USERNAME}/MeUnique-AI-CEO.git"

# Step 4: Open in GitHub Desktop
echo -e "\n${YELLOW}Step 4: Opening in GitHub Desktop${NC}"

# Check if GitHub Desktop is installed
if [ -d "/Applications/GitHub Desktop.app" ]; then
    echo "Opening project in GitHub Desktop..."
    open -a "GitHub Desktop" "$CURRENT_DIR"
else
    echo -e "${RED}GitHub Desktop not found!${NC}"
    echo "Please install GitHub Desktop from: https://desktop.github.com/"
    echo ""
    echo "After installation, you can add this repository by:"
    echo "1. Open GitHub Desktop"
    echo "2. Click 'File' -> 'Add Local Repository'"
    echo "3. Choose: $CURRENT_DIR"
fi

# Step 5: Alternative - Clone fresh if needed
echo -e "\n${YELLOW}Alternative Option: Fresh Clone${NC}"
echo "If you're still having issues, you can:"
echo "1. Create a new repository on GitHub.com"
echo "2. Run this command to clone fresh:"
echo ""
echo -e "${GREEN}git clone https://github.com/${GITHUB_USERNAME}/MeUnique-AI-CEO.git MeUnique-AI-CEO-Fresh${NC}"
echo ""
echo "3. Copy your .env.local file to the new directory"
echo "4. Run npm install in the new directory"

echo -e "\n${GREEN}✅ Configuration complete!${NC}" 