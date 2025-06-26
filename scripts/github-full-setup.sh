#!/bin/bash

echo "🚀 GitHub Full Setup - Automatic Push"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
GITHUB_USERNAME="Liatishman"
REPO_NAME="MeUnique-AI-CEO"

echo -e "${YELLOW}שלב 1: יצירת Personal Access Token${NC}"
echo "======================================"
echo ""
echo "צריך ליצור Token עם הרשאות מלאות:"
echo ""
echo "1. פתחי בדפדפן: https://github.com/settings/tokens/new"
echo ""
echo "2. מלאי את הפרטים:"
echo "   - Note: MeUnique-AI-CEO Full Access"
echo "   - Expiration: 90 days (או No expiration)"
echo ""
echo "3. סמני את ההרשאות הבאות:"
echo "   ✅ repo (כל התת-אפשרויות)"
echo "   ✅ workflow"
echo "   ✅ write:packages"
echo "   ✅ delete:packages"
echo "   ✅ admin:org"
echo "   ✅ admin:public_key"
echo "   ✅ admin:repo_hook"
echo "   ✅ gist"
echo "   ✅ notifications"
echo "   ✅ user"
echo "   ✅ delete_repo"
echo ""
echo "4. לחצי 'Generate token'"
echo "5. העתיקי את הטוקן"
echo ""

# Get token
echo -n "הדביקי את הטוקן כאן: "
read -s GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ לא הוזן טוקן${NC}"
    exit 1
fi

echo -e "\n${YELLOW}שלב 2: הגדרת Git${NC}"
git config --global user.name "${GITHUB_USERNAME}"
git config --global user.email "${GITHUB_USERNAME}@users.noreply.github.com"

echo -e "\n${YELLOW}שלב 3: הגדרת Remote עם Token${NC}"
git remote set-url origin "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo -e "\n${YELLOW}שלב 4: דחיפת הקוד${NC}"
echo "דוחף את כל הקבצים..."

# Try to push
if git push -u origin main --force; then
    echo -e "\n${GREEN}✅ הצלחה! הקוד נדחף ל-GitHub${NC}"
    
    # Clean token from URL for security
    git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    
    # Save token securely for future use
    echo "GITHUB_TOKEN=${GITHUB_TOKEN}" > ~/.meunique-github-token
    chmod 600 ~/.meunique-github-token
    
    echo -e "\n${GREEN}✅ ההגדרות נשמרו${NC}"
    echo ""
    echo "הפרויקט זמין ב:"
    echo "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo ""
    echo "מה עכשיו?"
    echo "1. בדוק שכל הקבצים מופיעים ב-GitHub"
    echo "2. הפעל את המערכת: npm run dev"
    echo "3. פתח ב-Cursor: cursor ."
    
else
    echo -e "\n${RED}❌ הדחיפה נכשלה${NC}"
    echo ""
    echo "נסה את האפשרויות הבאות:"
    echo "1. וודא שה-repository קיים וריק"
    echo "2. בדוק שהטוקן נכון"
    echo "3. נסה להריץ: git pull origin main --allow-unrelated-histories"
fi

# Create helper script for future pushes
cat > scripts/quick-push.sh << 'EOF'
#!/bin/bash
# Quick push with saved token
if [ -f ~/.meunique-github-token ]; then
    source ~/.meunique-github-token
    TEMP_URL=$(git remote get-url origin)
    git remote set-url origin "https://Liatishman:${GITHUB_TOKEN}@github.com/Liatishman/MeUnique-AI-CEO.git"
    git push
    git remote set-url origin "$TEMP_URL"
else
    echo "No saved token. Run ./scripts/github-full-setup.sh first"
fi
EOF
chmod +x scripts/quick-push.sh

echo -e "\n${BLUE}💡 טיפ: לpush מהיר בעתיד, הרץ: ./scripts/quick-push.sh${NC}" 