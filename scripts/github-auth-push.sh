#!/bin/bash

echo "🔐 GitHub Authentication & Push"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Try different username variations
echo -e "${YELLOW}מנסה וריאציות שונות של שם המשתמש...${NC}"

# Option 1: With capital L
echo -e "\n${BLUE}נסיון 1: Liatishman (עם L גדולה)${NC}"
git remote set-url origin https://github.com/Liatishman/MeUnique-AI-CEO.git

# Check if we need authentication
echo -e "\n${YELLOW}בודק אם צריך אימות...${NC}"
echo "אם תתבקשי, הכניסי:"
echo "Username: Liatishman"
echo "Password: <הטוקן שלך מ-GitHub>"
echo ""

# Try to push
git push -u origin main 2>&1 | tee /tmp/push_result.txt

# Check if successful
if grep -q "fatal" /tmp/push_result.txt; then
    echo -e "\n${RED}נכשל עם Liatishman${NC}"
    
    # Option 2: With lowercase
    echo -e "\n${BLUE}נסיון 2: liatishman (עם l קטנה)${NC}"
    git remote set-url origin https://github.com/liatishman/MeUnique-AI-CEO.git
    git push -u origin main 2>&1 | tee /tmp/push_result.txt
    
    if grep -q "fatal" /tmp/push_result.txt; then
        echo -e "\n${RED}נכשל גם עם liatishman${NC}"
        
        # Option 3: With token
        echo -e "\n${YELLOW}נסיון 3: שימוש בטוקן${NC}"
        echo "צריך Personal Access Token:"
        echo "1. לכי ל: https://github.com/settings/tokens"
        echo "2. צרי token עם הרשאות 'repo'"
        echo ""
        read -p "הדביקי את הטוקן: " GITHUB_TOKEN
        
        # Try with token
        git remote set-url origin https://${GITHUB_TOKEN}@github.com/Liatishman/MeUnique-AI-CEO.git
        git push -u origin main
        
        # Clean token from URL for security
        git remote set-url origin https://github.com/Liatishman/MeUnique-AI-CEO.git
    fi
fi

# Final check
if git ls-remote origin &>/dev/null; then
    echo -e "\n${GREEN}✅ הצלחנו להתחבר ל-GitHub!${NC}"
    echo "הפרויקט זמין ב: https://github.com/Liatishman/MeUnique-AI-CEO"
else
    echo -e "\n${RED}❌ עדיין יש בעיה${NC}"
    echo ""
    echo "אפשרויות נוספות:"
    echo "1. בדקי שה-repository באמת נקרא MeUnique-AI-CEO"
    echo "2. בדקי שהוא public או שיש לך גישה"
    echo "3. נסי להשתמש ב-GitHub Desktop"
    echo ""
    echo "להוספה ב-GitHub Desktop:"
    echo "1. פתחי GitHub Desktop"
    echo "2. File → Add Local Repository"
    echo "3. בחרי: $(pwd)"
    echo "4. אם יבקש, התחברי עם החשבון שלך"
fi

rm -f /tmp/push_result.txt 