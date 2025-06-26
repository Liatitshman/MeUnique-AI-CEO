#!/bin/bash

echo "🖥️  GitHub Desktop Connection Guide"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/Users/liattishman/Desktop/MeUnique-AI-CEO"

echo -e "${YELLOW}שיטה 1: GitHub Desktop (מומלץ)${NC}"
echo "================================"
echo ""
echo "1. פתחי את GitHub Desktop"
echo "2. לחצי על: File → Add Local Repository"
echo "3. לחצי Browse ובחרי: $PROJECT_DIR"
echo "4. לחצי 'Add Repository'"
echo "5. אם יש שגיאה, לחצי על 'create a repository' במקום"
echo "6. Repository name: MeUnique-AI-CEO"
echo "7. לחצי 'Create Repository'"
echo "8. לחצי 'Publish repository' בחלק העליון"
echo ""

echo -e "${YELLOW}שיטה 2: דרך הדפדפן${NC}"
echo "===================="
echo ""
echo "1. לכי ל-repository שיצרת: https://github.com/Liatishman/MeUnique-AI-CEO"
echo "2. לחצי על הכפתור הירוק 'Code'"
echo "3. לחצי על 'Open with GitHub Desktop'"
echo "4. בחרי Clone"
echo "5. אם יש התנגשות, בחרי את התיקייה הקיימת"
echo ""

echo -e "${YELLOW}שיטה 3: תיקון ידני${NC}"
echo "==================="
echo ""
echo "הריצי את הפקודות הבאות אחת אחרי השנייה:"
echo ""
echo -e "${GREEN}# 1. הגדרת משתמש${NC}"
echo "git config --global user.name \"Liatishman\""
echo "git config --global user.email \"Liatishman@users.noreply.github.com\""
echo ""
echo -e "${GREEN}# 2. יצירת Personal Access Token${NC}"
echo "https://github.com/settings/tokens/new"
echo "- Note: MeUnique-AI-CEO"
echo "- Expiration: 90 days"
echo "- Scopes: ✓ repo (כל האפשרויות תחת repo)"
echo "- Generate token והעתיקי"
echo ""
echo -e "${GREEN}# 3. Push עם token${NC}"
echo "git remote set-url origin https://Liatishman:<TOKEN>@github.com/Liatishman/MeUnique-AI-CEO.git"
echo "git push -u origin main"
echo ""

# Check current status
echo -e "${BLUE}סטטוס נוכחי:${NC}"
echo "============"
git remote -v
echo ""

# Open GitHub Desktop if available
if [ -d "/Applications/GitHub Desktop.app" ]; then
    echo -e "${GREEN}✅ GitHub Desktop מותקן${NC}"
    echo "האם לפתוח את GitHub Desktop? (y/n)"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open -a "GitHub Desktop" "$PROJECT_DIR"
        echo -e "${GREEN}GitHub Desktop נפתח!${NC}"
    fi
else
    echo -e "${YELLOW}GitHub Desktop לא מותקן${NC}"
    echo "להורדה: https://desktop.github.com/"
fi 