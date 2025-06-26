#!/bin/bash

# MeUnique API Keys Setup Script
# סקריפט להגדרת מפתחות API

echo "🔑 MeUnique API Keys Setup"
echo "========================="
echo ""

# צבעים
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# בדיקה אם קובץ .env קיים
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  קובץ .env קיים. האם לדרוס אותו? (y/n)${NC}"
    read -r response
    if [ "$response" != "y" ]; then
        echo "ביטול..."
        exit 0
    fi
fi

# יצירת קובץ .env
echo "יוצר קובץ .env חדש..."

cat > .env << 'EOF'
# MeUnique AI CEO - Environment Variables
# =====================================

# LinkedIn Configuration
# להשיג מ-LinkedIn: F12 > Application > Cookies > li_at
LINKEDIN_SESSION_COOKIE=""

# Sales Navigator Token
# להשיג מ-Sales Navigator Settings
SALES_NAVIGATOR_TOKEN=""

# OpenAI Configuration
# https://platform.openai.com/api-keys
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4"
OPENAI_MAX_TOKENS="2000"

# GitHub Configuration
# https://github.com/settings/tokens
GITHUB_TOKEN=""

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/meunique"
REDIS_URL="redis://localhost:6379"

# Optional: Twitter/X API
# https://developer.twitter.com
TWITTER_API_KEY=""
TWITTER_API_SECRET=""
TWITTER_ACCESS_TOKEN=""
TWITTER_ACCESS_SECRET=""

# Optional: Slack Integration
SLACK_TOKEN=""
SLACK_WEBHOOK_URL=""

# Optional: Discord Integration
DISCORD_WEBHOOK_URL=""

# Application Settings
NODE_ENV="production"
PORT="3000"
API_URL="https://api.meunique.ai"

# Security
JWT_SECRET="your-secret-key-here"
ENCRYPTION_KEY="your-encryption-key-here"

# Email Configuration (Optional)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
FROM_EMAIL="noreply@meunique.ai"

# Monitoring (Optional)
SENTRY_DSN=""
MIXPANEL_TOKEN=""
EOF

echo -e "${GREEN}✅ קובץ .env נוצר בהצלחה!${NC}"
echo ""

# הנחיות להשגת מפתחות
echo "📋 הנחיות להשגת מפתחות:"
echo ""

echo -e "${YELLOW}1. LinkedIn Session Cookie:${NC}"
echo "   - היכנסי ל-LinkedIn"
echo "   - פתחי Developer Tools (F12)"
echo "   - לכי ל-Application > Cookies > linkedin.com"
echo "   - חפשי 'li_at' והעתיקי את הערך"
echo ""

echo -e "${YELLOW}2. OpenAI API Key:${NC}"
echo "   - לכי ל-https://platform.openai.com/api-keys"
echo "   - צרי מפתח חדש"
echo "   - העתיקי אותו לקובץ .env"
echo ""

echo -e "${YELLOW}3. GitHub Token:${NC}"
echo "   - לכי ל-https://github.com/settings/tokens"
echo "   - צרי Personal Access Token"
echo "   - בחרי הרשאות: repo, read:user"
echo ""

# בדיקה אם המשתמש רוצה להזין מפתחות עכשיו
echo -e "${YELLOW}האם תרצי להזין מפתחות עכשיו? (y/n)${NC}"
read -r setup_now

if [ "$setup_now" = "y" ]; then
    # LinkedIn Cookie
    echo ""
    echo "הזיני את LinkedIn Session Cookie (li_at):"
    read -r linkedin_cookie
    if [ ! -z "$linkedin_cookie" ]; then
        sed -i '' "s/LINKEDIN_SESSION_COOKIE=\"\"/LINKEDIN_SESSION_COOKIE=\"$linkedin_cookie\"/" .env
        echo -e "${GREEN}✓ LinkedIn Cookie נשמר${NC}"
    fi
    
    # OpenAI Key
    echo ""
    echo "הזיני את OpenAI API Key:"
    read -r openai_key
    if [ ! -z "$openai_key" ]; then
        sed -i '' "s/OPENAI_API_KEY=\"\"/OPENAI_API_KEY=\"$openai_key\"/" .env
        echo -e "${GREEN}✓ OpenAI Key נשמר${NC}"
    fi
    
    # GitHub Token
    echo ""
    echo "הזיני את GitHub Token (אופציונלי, Enter לדילוג):"
    read -r github_token
    if [ ! -z "$github_token" ]; then
        sed -i '' "s/GITHUB_TOKEN=\"\"/GITHUB_TOKEN=\"$github_token\"/" .env
        echo -e "${GREEN}✓ GitHub Token נשמר${NC}"
    fi
fi

# יצירת סקריפט בדיקה
cat > check-api-keys.js << 'EOF'
#!/usr/bin/env node

// בדיקת מפתחות API
require('dotenv').config();

console.log('\n🔍 בודק מפתחות API...\n');

const keys = {
    'LinkedIn Cookie': process.env.LINKEDIN_SESSION_COOKIE,
    'OpenAI Key': process.env.OPENAI_API_KEY,
    'GitHub Token': process.env.GITHUB_TOKEN,
    'Sales Navigator': process.env.SALES_NAVIGATOR_TOKEN
};

let allGood = true;

Object.entries(keys).forEach(([name, value]) => {
    if (value && value.length > 0) {
        console.log(`✅ ${name}: מוגדר (${value.substring(0, 10)}...)`);
    } else {
        console.log(`❌ ${name}: חסר`);
        if (name.includes('LinkedIn') || name.includes('OpenAI')) {
            allGood = false;
        }
    }
});

if (allGood) {
    console.log('\n✨ כל המפתחות החיוניים מוגדרים! המערכת מוכנה לעבודה.');
} else {
    console.log('\n⚠️  חסרים מפתחות חיוניים. אנא הוסיפי אותם לקובץ .env');
}
EOF

chmod +x check-api-keys.js

echo ""
echo -e "${GREEN}✅ ההגדרה הושלמה!${NC}"
echo ""
echo "🚀 השלבים הבאים:"
echo "1. ערכי את קובץ .env והוסיפי את המפתחות החסרים"
echo "2. הריצי: node check-api-keys.js לבדיקת המפתחות"
echo "3. הריצי: python3 scripts/smart-integration-orchestrator.py להפעלת המערכת"
echo ""
echo "💡 טיפ: השתמשי ב-'source .env' לטעינת המשתנים לסביבה"

# הוספה ל-gitignore
if ! grep -q "^.env$" .gitignore 2>/dev/null; then
    echo ".env" >> .gitignore
    echo -e "${GREEN}✓ .env נוסף ל-.gitignore${NC}"
fi 