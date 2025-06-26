#!/bin/bash

echo "🔍 MeUnique AI CEO - System Check"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check functions
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo "📋 בדיקת מערכת מלאה:"
echo ""

# 1. Git Configuration
echo "1️⃣ Git Configuration:"
git config user.name &>/dev/null && check_status $? "Git username: $(git config user.name)" || check_status 1 "Git username not set"
git remote -v &>/dev/null && check_status $? "Git remote configured" || check_status 1 "Git remote not configured"

# 2. GitHub Repository
echo -e "\n2️⃣ GitHub Repository:"
REPO_URL="https://github.com/liattishman/MeUnique-AI-CEO"
curl -s -o /dev/null -w "%{http_code}" "$REPO_URL" | grep -q "200\|301" && check_status 0 "Repository exists on GitHub" || check_status 1 "Repository NOT found on GitHub"

# 3. Node.js & npm
echo -e "\n3️⃣ Node.js Environment:"
node --version &>/dev/null && check_status $? "Node.js installed: $(node --version)" || check_status 1 "Node.js not installed"
npm --version &>/dev/null && check_status $? "npm installed: $(npm --version)" || check_status 1 "npm not installed"
[ -d "node_modules" ] && check_status 0 "node_modules exists" || check_status 1 "node_modules missing - run: npm install"

# 4. Background Agent
echo -e "\n4️⃣ Background Agent:"
launchctl list | grep -q com.meunique.ai && check_status 0 "Background agent is loaded" || check_status 1 "Background agent not loaded"
[ -f "logs/agent-status.json" ] && check_status 0 "Agent status file exists" || check_status 1 "Agent status file missing"

# 5. Project Structure
echo -e "\n5️⃣ Project Structure:"
[ -d "👑_CEO-System" ] && check_status 0 "CEO System directory exists" || check_status 1 "CEO System directory missing"
[ -d "src" ] && check_status 0 "Source directory exists" || check_status 1 "Source directory missing"
[ -f ".env.local" ] && check_status 0 ".env.local exists" || check_status 1 ".env.local missing"

# 6. Scripts
echo -e "\n6️⃣ Automation Scripts:"
[ -x "scripts/auto-setup-agent.sh" ] && check_status 0 "Auto setup agent ready" || check_status 1 "Auto setup agent not executable"
[ -x "scripts/terminal-connection-fix.js" ] && check_status 0 "Terminal fix script ready" || check_status 1 "Terminal fix script not found"

# 7. Next.js
echo -e "\n7️⃣ Next.js Application:"
[ -f "next.config.js" ] && check_status 0 "Next.js configured" || check_status 1 "Next.js not configured"
[ -d ".next" ] && check_status 0 "Next.js build exists" || check_status 1 "Next.js not built yet"

echo -e "\n📊 סיכום:"
echo "========="

# Count issues
ISSUES=$(grep -c "❌" <<< "$(
    git config user.name &>/dev/null || echo "❌"
    [ -d "node_modules" ] || echo "❌"
    [ -f ".env.local" ] || echo "❌"
    curl -s -o /dev/null -w "%{http_code}" "$REPO_URL" | grep -q "200\|301" || echo "❌"
)")

if [ "$ISSUES" -eq 0 ]; then
    echo -e "${GREEN}✅ המערכת מוכנה לעבודה מלאה!${NC}"
    echo ""
    echo "להפעלת המערכת:"
    echo "  npm run dev"
    echo ""
    echo "לפתיחה ב-Cursor:"
    echo "  cursor ."
else
    echo -e "${YELLOW}⚠️  יש $ISSUES בעיות שצריך לתקן${NC}"
    echo ""
    echo "פעולות מומלצות:"
    [ ! -d "node_modules" ] && echo "  • npm install"
    [ ! -f ".env.local" ] && echo "  • cp .env.example .env.local"
    curl -s -o /dev/null -w "%{http_code}" "$REPO_URL" | grep -q "200\|301" || echo "  • צרי repository ב-GitHub"
fi

echo ""
echo "💡 לעזרה נוספת: ./scripts/STEP_BY_STEP_SETUP_GUIDE.md" 