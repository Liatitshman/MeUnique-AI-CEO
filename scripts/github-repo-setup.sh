#!/bin/bash

# GitHub Repository Setup Script
echo "🚀 GitHub Repository Setup for MeUnique-AI-CEO"
echo "=============================================="
echo ""

# Configuration
GITHUB_USERNAME="liattishman"
REPO_NAME="MeUnique-AI-CEO"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}שלב 1: בדיקת הגדרות Git${NC}"
git config user.name "$GITHUB_USERNAME"
git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"

echo -e "\n${YELLOW}שלב 2: הגדרת Remote${NC}"
# הסר את ה-remote הישן
git remote remove origin 2>/dev/null || true

# הוסף remote חדש
git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo -e "\n${GREEN}✅ ההגדרות מוכנות!${NC}"
echo ""
echo "עכשיו צריך:"
echo ""
echo -e "${BLUE}1. ליצור repository חדש ב-GitHub:${NC}"
echo "   - לכי ל: https://github.com/new"
echo "   - Repository name: MeUnique-AI-CEO"
echo "   - Description: AI-powered CEO system with 15 specialized agents"
echo "   - בחרי: Public או Private"
echo "   - אל תסמני 'Initialize this repository'"
echo ""
echo -e "${BLUE}2. אחרי יצירת ה-repository, הריצי:${NC}"
echo "   git push -u origin main"
echo ""
echo -e "${BLUE}3. אם יש בעיה עם authentication:${NC}"
echo "   - צרי Personal Access Token ב: https://github.com/settings/tokens"
echo "   - בחרי 'repo' permissions"
echo "   - השתמשי בטוקן כסיסמה"
echo ""
echo -e "${YELLOW}טיפ: אם את רוצה לדחוף מיד (אחרי יצירת הrepo):${NC}"
echo "git push -u origin main --force" 