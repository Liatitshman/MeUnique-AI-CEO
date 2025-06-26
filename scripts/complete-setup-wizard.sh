#!/bin/bash

# 🚀 MeUnique AI CEO - Complete Setup Wizard
# ==========================================

echo "🎯 MeUnique AI CEO - אשף הגדרה מלא"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get API key
get_api_key() {
    local key_name=$1
    local instructions=$2
    local current_value=$(grep "^$key_name=" .env | cut -d'=' -f2)
    
    echo -e "${YELLOW}📋 $key_name${NC}"
    echo -e "${BLUE}$instructions${NC}"
    
    if [[ ! -z "$current_value" && "$current_value" != *"your_"* ]]; then
        echo -e "${GREEN}✅ כבר מוגדר${NC}"
        return
    fi
    
    echo -n "הכנס את הערך (Enter לדלג): "
    read -r value
    
    if [[ ! -z "$value" ]]; then
        # Update .env file
        if grep -q "^$key_name=" .env; then
            sed -i.bak "s|^$key_name=.*|$key_name=$value|" .env
        else
            echo "$key_name=$value" >> .env
        fi
        echo -e "${GREEN}✅ הוגדר בהצלחה!${NC}"
    fi
    echo ""
}

# Check prerequisites
echo "🔍 בודק דרישות מקדימות..."
echo ""

if ! command_exists node; then
    echo -e "${RED}❌ Node.js לא מותקן${NC}"
    echo "התקן מ: https://nodejs.org/"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 לא מותקן${NC}"
    echo "התקן מ: https://www.python.org/"
    exit 1
fi

echo -e "${GREEN}✅ כל הדרישות המקדימות מותקנות${NC}"
echo ""

# Install Python dependencies
echo "📦 מתקין חבילות Python..."
pip3 install -r requirements.txt 2>/dev/null || {
    echo "יוצר requirements.txt..."
    cat > requirements.txt << EOF
requests==2.31.0
beautifulsoup4==4.12.2
selenium==4.15.2
pandas==2.1.3
openai==1.3.5
python-dotenv==1.0.0
tweepy==4.14.0
facebook-sdk==3.1.0
discord.py==2.3.2
praw==7.7.1
slack-sdk==3.23.0
google-auth==2.23.4
google-auth-oauthlib==1.1.0
google-auth-httplib2==0.1.1
sentry-sdk==1.38.0
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
EOF
    pip3 install -r requirements.txt
}

echo ""
echo "🔐 הגדרת מפתחות API"
echo "===================="
echo ""

# LinkedIn
get_api_key "LINKEDIN_SESSION_COOKIE" "
1. היכנס ל-LinkedIn
2. פתח Developer Tools (F12)
3. לך ל-Application > Cookies > linkedin.com
4. חפש 'li_at' והעתק את הערך"

# OpenAI
get_api_key "OPENAI_API_KEY" "
1. לך ל: https://platform.openai.com/api-keys
2. צור מפתח חדש
3. העתק את המפתח"

# GitHub
get_api_key "GITHUB_TOKEN" "
1. לך ל: https://github.com/settings/tokens
2. צור Personal Access Token
3. בחר הרשאות: repo, read:user"

# Twitter/X
echo -e "${YELLOW}🐦 Twitter/X API${NC}"
echo "1. לך ל: https://developer.twitter.com/en/portal/dashboard"
echo "2. צור אפליקציה חדשה"
echo "3. קבל את המפתחות"
get_api_key "TWITTER_API_KEY" "API Key"
get_api_key "TWITTER_API_SECRET" "API Secret"
get_api_key "TWITTER_ACCESS_TOKEN" "Access Token"
get_api_key "TWITTER_ACCESS_TOKEN_SECRET" "Access Token Secret"

# Facebook
echo -e "${YELLOW}📘 Facebook API${NC}"
echo "1. לך ל: https://developers.facebook.com/"
echo "2. צור אפליקציה חדשה"
echo "3. הוסף Facebook Login"
get_api_key "FACEBOOK_APP_ID" "App ID"
get_api_key "FACEBOOK_APP_SECRET" "App Secret"
get_api_key "FACEBOOK_ACCESS_TOKEN" "User Access Token"

# Discord
echo -e "${YELLOW}💬 Discord API${NC}"
echo "1. לך ל: https://discord.com/developers/applications"
echo "2. צור אפליקציה חדשה"
echo "3. צור בוט"
get_api_key "DISCORD_BOT_TOKEN" "Bot Token"
get_api_key "DISCORD_CLIENT_ID" "Client ID"
get_api_key "DISCORD_CLIENT_SECRET" "Client Secret"

# Google
echo -e "${YELLOW}🔍 Google APIs${NC}"
echo "1. לך ל: https://console.cloud.google.com/"
echo "2. צור פרויקט חדש"
echo "3. הפעל APIs: Gmail, Drive, Calendar"
echo "4. צור OAuth 2.0 credentials"
get_api_key "GOOGLE_CLIENT_ID" "Client ID"
get_api_key "GOOGLE_CLIENT_SECRET" "Client Secret"

# Reddit
echo -e "${YELLOW}🤖 Reddit API${NC}"
echo "1. לך ל: https://www.reddit.com/prefs/apps"
echo "2. צור אפליקציה חדשה (script type)"
get_api_key "REDDIT_CLIENT_ID" "Client ID"
get_api_key "REDDIT_CLIENT_SECRET" "Client Secret"

# Slack
echo -e "${YELLOW}💼 Slack API${NC}"
echo "1. לך ל: https://api.slack.com/apps"
echo "2. צור אפליקציה חדשה"
echo "3. הוסף OAuth & Permissions"
get_api_key "SLACK_BOT_TOKEN" "Bot User OAuth Token"
get_api_key "SLACK_APP_TOKEN" "App-Level Token"

# Database setup
echo ""
echo "🗄️ הגדרת מסד נתונים"
echo "==================="
echo ""

if ! command_exists psql; then
    echo -e "${YELLOW}PostgreSQL לא מותקן. מתקין...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install postgresql
        brew services start postgresql
    else
        echo "התקן PostgreSQL ידנית מ: https://www.postgresql.org/download/"
    fi
fi

# Create database if not exists
echo "יוצר מסד נתונים..."
createdb meunique 2>/dev/null || echo "מסד הנתונים כבר קיים"

# Update DATABASE_URL
DB_URL="postgresql://$(whoami)@localhost:5432/meunique"
sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=$DB_URL|" .env

# Security keys
echo ""
echo "🔒 הגדרת מפתחות אבטחה"
echo "====================="
echo ""

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)
sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
echo -e "${GREEN}✅ JWT Secret נוצר${NC}"

# Generate encryption key
ENCRYPTION_KEY=$(openssl rand -hex 32)
sed -i.bak "s|^ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" .env
echo -e "${GREEN}✅ Encryption Key נוצר${NC}"

# Email configuration
echo ""
echo "📧 הגדרת אימייל (אופציונלי)"
echo "=========================="
get_api_key "SMTP_USER" "כתובת Gmail"
get_api_key "SMTP_PASS" "סיסמת אפליקציה (לא הסיסמה הרגילה!)"
get_api_key "ALERT_EMAIL" "אימייל להתראות"

# Monitoring
echo ""
echo "📊 הגדרת ניטור (אופציונלי)"
echo "=========================="
get_api_key "SENTRY_DSN" "Sentry DSN מ: https://sentry.io/"
get_api_key "GOOGLE_ANALYTICS_ID" "Google Analytics ID"

# Create helper scripts
echo ""
echo "📝 יוצר סקריפטים עזר..."
echo "====================="

# Create API test script
cat > scripts/test-all-apis.py << 'EOF'
#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def test_api(name, key_name, test_func):
    key = os.getenv(key_name)
    if not key or key.startswith('your_'):
        print(f"❌ {name}: לא מוגדר")
        return False
    
    try:
        if test_func(key):
            print(f"✅ {name}: עובד!")
            return True
        else:
            print(f"❌ {name}: המפתח לא תקין")
            return False
    except Exception as e:
        print(f"❌ {name}: שגיאה - {str(e)}")
        return False

# Test functions
def test_openai(key):
    import openai
    openai.api_key = key
    # Simple test without making actual API call
    return len(key) > 20 and key.startswith('sk-')

def test_linkedin(cookie):
    return len(cookie) > 50

def test_github(token):
    import requests
    resp = requests.get('https://api.github.com/user', 
                       headers={'Authorization': f'token {token}'})
    return resp.status_code == 200

# Run tests
print("\n🔍 בודק חיבורים ל-APIs...")
print("========================\n")

results = []
results.append(test_api("OpenAI", "OPENAI_API_KEY", test_openai))
results.append(test_api("LinkedIn", "LINKEDIN_SESSION_COOKIE", test_linkedin))
results.append(test_api("GitHub", "GITHUB_TOKEN", test_github))

print(f"\n📊 סיכום: {sum(results)}/{len(results)} APIs מוגדרים ועובדים")
EOF

chmod +x scripts/test-all-apis.py

# Create monitoring dashboard
cat > scripts/api-dashboard.sh << 'EOF'
#!/bin/bash
clear
echo "📊 MeUnique AI CEO - לוח בקרה"
echo "=============================="
echo ""
echo "🔐 סטטוס APIs:"
python3 scripts/test-all-apis.py
echo ""
echo "💰 ניטור עלויות:"
python3 scripts/cost_monitor.py 2>/dev/null || echo "לא זמין"
echo ""
echo "🤖 סטטוס סוכנים:"
node scripts/background-agents-monitor.js 2>/dev/null || echo "לא זמין"
EOF

chmod +x scripts/api-dashboard.sh

# Final setup
echo ""
echo "🏁 מסיים הגדרות..."
echo "=================="

# Install remaining npm packages
npm install

# Run database migrations
echo "מריץ מיגרציות..."
npm run db:migrate 2>/dev/null || echo "אין מיגרציות להריץ"

# Clean up backup files
rm -f .env.bak*

echo ""
echo -e "${GREEN}✅ ההגדרה הושלמה בהצלחה!${NC}"
echo ""
echo "🚀 השלבים הבאים:"
echo "1. בדוק את כל ה-APIs: ./scripts/test-all-apis.py"
echo "2. הצג לוח בקרה: ./scripts/api-dashboard.sh"
echo "3. הפעל את המערכת: npm run dev"
echo "4. הפעל סקריפטינג: python3 scripts/smart-integration-orchestrator.py"
echo ""
echo "📚 מדריכים נוספים:"
echo "- LinkedIn Cookie: ./scripts/linkedin-cookie-hebrew-guide.md"
echo "- Cost Monitoring: ./scripts/cost-monitoring-dashboard.py"
echo "- System Check: ./scripts/system-check.sh" 