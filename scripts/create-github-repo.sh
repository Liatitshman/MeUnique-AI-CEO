#!/bin/bash

echo "🚀 יוצר Repository ב-GitHub אוטומטית"
echo "===================================="
echo ""

# Configuration
GITHUB_USERNAME="liattishman"
REPO_NAME="MeUnique-AI-CEO"
REPO_DESCRIPTION="AI-powered CEO system with 15 specialized agents"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}אפשרות 1: שימוש ב-GitHub CLI${NC}"
echo "אם יש לך GitHub CLI מותקן, הרץ:"
echo -e "${GREEN}gh repo create ${REPO_NAME} --public --description \"${REPO_DESCRIPTION}\"${NC}"
echo ""

echo -e "${YELLOW}אפשרות 2: יצירה ידנית${NC}"
echo "1. פתחי דפדפן ולכי ל: https://github.com/new"
echo "2. מלאי את הפרטים:"
echo "   - Repository name: ${REPO_NAME}"
echo "   - Description: ${REPO_DESCRIPTION}"
echo "   - בחרי Public או Private"
echo "   - ⚠️ אל תסמני 'Add a README file'"
echo "   - ⚠️ אל תסמני 'Add .gitignore'"
echo "   - ⚠️ אל תסמני 'Choose a license'"
echo "3. לחצי 'Create repository'"
echo ""

echo -e "${YELLOW}אפשרות 3: שימוש ב-API (דורש token)${NC}"
echo "אם יש לך Personal Access Token:"
echo ""
echo "read -s -p \"Enter GitHub Token: \" GITHUB_TOKEN"
echo "echo"
echo "curl -H \"Authorization: token \$GITHUB_TOKEN\" \\"
echo "     -H \"Accept: application/vnd.github.v3+json\" \\"
echo "     https://api.github.com/user/repos \\"
echo "     -d '{\"name\":\"${REPO_NAME}\",\"description\":\"${REPO_DESCRIPTION}\",\"private\":false}'"
echo ""

echo -e "${BLUE}אחרי יצירת ה-Repository, הרץ:${NC}"
echo "git push -u origin main"
echo ""

echo -e "${RED}חשוב: וודאי שה-repository נוצר לפני הpush!${NC}"

# בדיקה אם gh מותקן
if command -v gh &> /dev/null; then
    echo ""
    echo -e "${GREEN}✅ GitHub CLI מותקן! האם לרוץ את הפקודה אוטומטית? (y/n)${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gh repo create ${REPO_NAME} --public --description "${REPO_DESCRIPTION}" --source=. --remote=origin --push
    fi
else
    echo ""
    echo -e "${YELLOW}💡 טיפ: התקני GitHub CLI עם: brew install gh${NC}"
fi 