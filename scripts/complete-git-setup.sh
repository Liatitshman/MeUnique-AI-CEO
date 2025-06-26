#!/bin/bash

# Complete Git Setup and Project Configuration Script
# This script will help you set up Git, connect to GitHub, and configure background agents

echo "🚀 Starting Complete Git Setup for MeUnique-AI-CEO"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Get GitHub username
echo -e "\n${YELLOW}Step 1: GitHub Configuration${NC}"
echo "Please enter your GitHub username:"
read GITHUB_USERNAME

echo "Please enter your GitHub repository name (or press Enter for 'MeUnique-AI-CEO'):"
read REPO_NAME
REPO_NAME=${REPO_NAME:-MeUnique-AI-CEO}

# Step 2: Clean up Git issues
echo -e "\n${YELLOW}Step 2: Cleaning up Git issues${NC}"

# Remove the problematic deleted file from git tracking
git rm -f MeUnique-AI-CEO 2>/dev/null || true

# Stage the modified file
git add scripts/make-executable.sh

# Commit current changes
echo "Committing current changes..."
git commit -m "Clean up: Remove duplicate directory and update scripts" || echo "Nothing to commit"

# Step 3: Update remote URL
echo -e "\n${YELLOW}Step 3: Updating Git remote URL${NC}"
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "Remote URL set to: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# Step 4: Create GitHub authentication token file
echo -e "\n${YELLOW}Step 4: GitHub Authentication${NC}"
echo "To push to GitHub, you need a Personal Access Token (PAT)"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Give it a name like 'MeUnique-AI-CEO'"
echo "4. Select scopes: 'repo' (all repo permissions)"
echo "5. Generate and copy the token"
echo ""
echo "Please paste your GitHub Personal Access Token:"
read -s GITHUB_TOKEN

# Save token securely
echo "GITHUB_TOKEN=${GITHUB_TOKEN}" > .env.github
chmod 600 .env.github
echo ".env.github" >> .gitignore

# Step 5: Configure Git credentials
echo -e "\n${YELLOW}Step 5: Configuring Git credentials${NC}"
git config --global credential.helper osxkeychain
git config --global user.name "${GITHUB_USERNAME}"
echo "Please enter your GitHub email:"
read GITHUB_EMAIL
git config --global user.email "${GITHUB_EMAIL}"

# Step 6: Push to GitHub
echo -e "\n${YELLOW}Step 6: Pushing to GitHub${NC}"
echo "Attempting to push to GitHub..."

# Create a temporary credential helper for this session
git config credential.helper "!f() { echo \"username=${GITHUB_USERNAME}\"; echo \"password=${GITHUB_TOKEN}\"; }; f"

# Push with upstream tracking
git push -u origin main || {
    echo -e "${RED}Push failed. Trying to force push...${NC}"
    echo "This will overwrite the remote repository. Continue? (y/n)"
    read CONFIRM
    if [ "$CONFIRM" = "y" ]; then
        git push -u origin main --force
    fi
}

# Reset credential helper to default
git config --unset credential.helper
git config --global credential.helper osxkeychain

# Step 7: Set up background agents
echo -e "\n${YELLOW}Step 7: Setting up Background Agents${NC}"

# Create systemd-like service for macOS using launchd
cat > ~/Library/LaunchAgents/com.meunique.ai.ceo.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.meunique.ai.ceo</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>${PWD}/scripts/background-agents-monitor.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${PWD}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${PWD}/logs/background-agents.log</string>
    <key>StandardErrorPath</key>
    <string>${PWD}/logs/background-agents-error.log</string>
</dict>
</plist>
EOF

# Create logs directory
mkdir -p logs

# Load the service
launchctl load ~/Library/LaunchAgents/com.meunique.ai.ceo.plist 2>/dev/null || {
    launchctl unload ~/Library/LaunchAgents/com.meunique.ai.ceo.plist 2>/dev/null
    launchctl load ~/Library/LaunchAgents/com.meunique.ai.ceo.plist
}

# Step 8: Verify setup
echo -e "\n${YELLOW}Step 8: Verifying setup${NC}"

# Check Git status
echo "Git Status:"
git status --short

# Check remote
echo -e "\nGit Remote:"
git remote -v

# Check background agent
echo -e "\nBackground Agent Status:"
launchctl list | grep com.meunique.ai.ceo || echo "Background agent not running"

# Step 9: Create desktop shortcut
echo -e "\n${YELLOW}Step 9: Creating Desktop Shortcut${NC}"
cat > ~/Desktop/MeUnique-AI-CEO.command << EOF
#!/bin/bash
cd "${PWD}"
cursor .
EOF
chmod +x ~/Desktop/MeUnique-AI-CEO.command

echo -e "\n${GREEN}✅ Setup Complete!${NC}"
echo "================================"
echo "1. Your project is connected to: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo "2. Background agents are configured"
echo "3. Desktop shortcut created: ~/Desktop/MeUnique-AI-CEO.command"
echo ""
echo "Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "To open in Cursor: Double-click the desktop shortcut or run: cursor ." 