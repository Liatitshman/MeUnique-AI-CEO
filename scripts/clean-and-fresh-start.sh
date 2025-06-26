#!/bin/bash

# 🧹 MeUnique AI CEO - Clean & Fresh Start
# מנקה את כל ההגדרות הישנות ומתחיל מחדש

echo "🧹 MeUnique AI CEO - ניקוי והתחלה חדשה"
echo "======================================="

# צבעים
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. ניקוי קבצים מקומיים
echo -e "\n${YELLOW}1. מנקה קבצים מקומיים...${NC}"

# ניקוי build files
rm -rf .next
rm -rf out
rm -rf dist
rm -rf build

# ניקוי logs
rm -rf logs/*

# ניקוי cache
rm -rf node_modules/.cache
rm -rf .cache

# ניקוי temporary files
find . -name "*.tmp" -delete
find . -name "*.temp" -delete
find . -name ".DS_Store" -delete

echo -e "${GREEN}✅ קבצים מקומיים נוקו${NC}"

# 2. בדיקת Vercel
echo -e "\n${YELLOW}2. בודק הגדרות Vercel...${NC}"

if command -v vercel &> /dev/null; then
    echo "Vercel CLI מותקן"
    
    # ניתוק מפרויקטים קיימים
    if [ -d ".vercel" ]; then
        echo "מוחק הגדרות Vercel ישנות..."
        rm -rf .vercel
    fi
    
    echo -e "${GREEN}✅ הגדרות Vercel נוקו${NC}"
else
    echo -e "${BLUE}Vercel CLI לא מותקן. להתקנה: npm i -g vercel${NC}"
fi

# 3. בדיקת Streamlit
echo -e "\n${YELLOW}3. בודק הגדרות Streamlit...${NC}"

# מחיקת קבצי Streamlit config
if [ -d ".streamlit" ]; then
    echo "מוחק הגדרות Streamlit..."
    rm -rf .streamlit
fi

# בדיקה אם יש קבצי Streamlit
streamlit_files=$(find . -name "*.py" -exec grep -l "import streamlit" {} \; 2>/dev/null | head -5)
if [ ! -z "$streamlit_files" ]; then
    echo -e "${YELLOW}נמצאו קבצי Streamlit:${NC}"
    echo "$streamlit_files"
fi

# 4. בדיקת Git
echo -e "\n${YELLOW}4. בודק מצב Git...${NC}"

if [ -d ".git" ]; then
    # הצג סטטוס
    git status --short
    
    # בדיק remote
    echo -e "\n${BLUE}Remote repositories:${NC}"
    git remote -v
else
    echo -e "${RED}❌ לא נמצא Git repository${NC}"
fi

# 5. בדיקת Dependencies
echo -e "\n${YELLOW}5. בודק חבילות...${NC}"

if [ -f "package.json" ]; then
    # בדיקה אם node_modules קיים
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}מתקין חבילות...${NC}"
        npm install
    else
        echo -e "${GREEN}✅ חבילות מותקנות${NC}"
    fi
fi

# 6. בדיקת קבצי הגדרות
echo -e "\n${YELLOW}6. בודק קבצי הגדרות...${NC}"

# .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ קובץ .env קיים${NC}"
    # בדיקת משתנים חשובים
    missing_vars=""
    
    if ! grep -q "OPENAI_API_KEY=" .env; then
        missing_vars="${missing_vars}OPENAI_API_KEY, "
    fi
    if ! grep -q "DATABASE_URL=" .env; then
        missing_vars="${missing_vars}DATABASE_URL, "
    fi
    if ! grep -q "NEXTAUTH_SECRET=" .env; then
        missing_vars="${missing_vars}NEXTAUTH_SECRET, "
    fi
    
    if [ ! -z "$missing_vars" ]; then
        echo -e "${YELLOW}⚠️  משתנים חסרים: ${missing_vars%,*}${NC}"
    fi
else
    echo -e "${RED}❌ קובץ .env לא קיים${NC}"
    if [ -f ".env.example" ]; then
        echo "יוצר .env מ-.env.example..."
        cp .env.example .env
    fi
fi

# 7. בדיקת מבנה הפרויקט
echo -e "\n${YELLOW}7. בודק מבנה פרויקט...${NC}"

# בדיקת תיקיות חשובות
required_dirs=(
    "👑_CEO-System"
    "👑_CEO-System/🤖_Agents"
    "👑_CEO-System/📁_Documents"
    "src/app"
    "src/components"
    "src/lib"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $dir${NC}"
    else
        echo -e "${RED}❌ חסר: $dir${NC}"
    fi
done

# 8. בדיקת סוכנים
echo -e "\n${YELLOW}8. בודק סוכני AI...${NC}"

agent_count=$(find "👑_CEO-System/🤖_Agents" -name "config.json" 2>/dev/null | wc -l)
echo "נמצאו $agent_count סוכנים"

# 9. יצירת סיכום
echo -e "\n${BLUE}=== סיכום ===${NC}"
echo -e "${GREEN}✅ ניקוי הושלם${NC}"
echo -e "\n${YELLOW}פעולות מומלצות:${NC}"
echo "1. הגדר משתני סביבה ב-.env"
echo "2. התחבר ל-GitHub: ./scripts/github-full-setup.sh"
echo "3. הגדר Database: ./scripts/complete-database-setup.sh"
echo "4. העלה ל-Vercel: vercel --prod"
echo ""
echo -e "${BLUE}להרצת המערכת: npm run dev${NC}" 