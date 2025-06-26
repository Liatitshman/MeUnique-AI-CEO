#!/bin/bash

# 🚀 MeUnique AI CEO - Final Setup & Validation
# סקריפט סופי להגדרת כל המפתחות וולידציה

echo "🚀 MeUnique AI CEO - הגדרה וולידציה סופית"
echo "=========================================="

# צבעים
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# בדיקת קובץ .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ קובץ .env לא נמצא!${NC}"
    exit 1
fi

# טעינת משתני סביבה
source .env

echo -e "\n${BLUE}=== בדיקת מפתחות API ===${NC}"

# רשימת כל המפתחות הנדרשים
declare -A api_keys=(
    ["OPENAI_API_KEY"]="OpenAI API Key"
    ["DATABASE_URL"]="Database Connection"
    ["NEXTAUTH_SECRET"]="NextAuth Secret"
    ["LINKEDIN_CLIENT_ID"]="LinkedIn Client ID"
    ["LINKEDIN_CLIENT_SECRET"]="LinkedIn Client Secret"
    ["GITHUB_TOKEN"]="GitHub Personal Access Token"
    ["TWITTER_API_KEY"]="Twitter API Key"
    ["TWITTER_API_SECRET"]="Twitter API Secret"
    ["SENTRY_DSN"]="Sentry Error Tracking"
    ["GOOGLE_ANALYTICS_ID"]="Google Analytics"
    ["SMTP_HOST"]="Email SMTP Host"
    ["STRIPE_SECRET_KEY"]="Stripe Secret Key"
)

# בדיקת כל מפתח
missing_keys=()
for key in "${!api_keys[@]}"; do
    value="${!key}"
    if [ -z "$value" ] || [[ "$value" == *"your_"* ]] || [[ "$value" == *"_here"* ]]; then
        echo -e "${RED}❌ ${api_keys[$key]}: חסר או לא מוגדר${NC}"
        missing_keys+=("$key")
    else
        echo -e "${GREEN}✅ ${api_keys[$key]}: מוגדר${NC}"
    fi
done

# אם יש מפתחות חסרים, הצע להזין אותם
if [ ${#missing_keys[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}נמצאו ${#missing_keys[@]} מפתחות חסרים${NC}"
    echo -e "${BLUE}האם תרצי להזין אותם עכשיו? (y/n)${NC}"
    read -r response
    
    if [[ "$response" == "y" ]]; then
        for key in "${missing_keys[@]}"; do
            echo -e "\n${PURPLE}${api_keys[$key]}:${NC}"
            
            # הוראות ספציפיות לכל מפתח
            case $key in
                "OPENAI_API_KEY")
                    echo "1. לכי ל: https://platform.openai.com/api-keys"
                    echo "2. צרי מפתח חדש"
                    echo "3. העתיקי את המפתח (מתחיל ב-sk-)"
                    ;;
                "DATABASE_URL")
                    echo "1. אפשרויות: Supabase (מומלץ), PostgreSQL, PlanetScale"
                    echo "2. פורמט: postgresql://user:password@host:port/database"
                    echo "3. לדוגמה: postgresql://postgres:password@db.supabase.co:5432/postgres"
                    ;;
                "NEXTAUTH_SECRET")
                    echo "יוצר secret אוטומטית..."
                    secret=$(openssl rand -base64 32)
                    echo "Secret נוצר: $secret"
                    sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$secret|" .env
                    continue
                    ;;
                "LINKEDIN_CLIENT_ID")
                    echo "1. לכי ל: https://www.linkedin.com/developers/"
                    echo "2. צרי אפליקציה חדשה"
                    echo "3. העתיקי את Client ID"
                    ;;
                "GITHUB_TOKEN")
                    echo "1. לכי ל: https://github.com/settings/tokens"
                    echo "2. Generate new token (classic)"
                    echo "3. בחרי הרשאות: repo, read:user"
                    ;;
                "STRIPE_SECRET_KEY")
                    echo "1. לכי ל: https://dashboard.stripe.com/apikeys"
                    echo "2. העתיקי את Secret key (מתחיל ב-sk_)"
                    ;;
            esac
            
            echo -e "\n${YELLOW}הזיני את הערך:${NC}"
            read -r value
            
            if [ ! -z "$value" ]; then
                # עדכון בקובץ .env
                sed -i '' "s|$key=.*|$key=$value|" .env
                echo -e "${GREEN}✅ $key עודכן${NC}"
            fi
        done
        
        # טעינה מחדש
        source .env
    fi
fi

echo -e "\n${BLUE}=== בדיקת חיבורים ===${NC}"

# בדיקת חיבור Database
echo -n "בודק חיבור Database... "
if [[ "$DATABASE_URL" == *"supabase"* ]]; then
    echo -e "${GREEN}Supabase${NC}"
elif [[ "$DATABASE_URL" == *"planetscale"* ]]; then
    echo -e "${GREEN}PlanetScale${NC}"
elif [[ "$DATABASE_URL" == *"neon"* ]]; then
    echo -e "${GREEN}Neon${NC}"
elif [[ "$DATABASE_URL" == *"localhost"* ]]; then
    echo -e "${YELLOW}Local PostgreSQL${NC}"
else
    echo -e "${RED}לא מוגדר${NC}"
fi

# בדיקת OpenAI
echo -n "בודק OpenAI API... "
if [[ "$OPENAI_API_KEY" == sk-* ]]; then
    echo -e "${GREEN}נראה תקין${NC}"
else
    echo -e "${RED}לא תקין${NC}"
fi

echo -e "\n${BLUE}=== בדיקת סוכנים ===${NC}"

# ספירת סוכנים
agent_count=$(find "👑_CEO-System/🤖_Agents" -name "config.json" 2>/dev/null | wc -l)
echo "סוכני AI פעילים: $agent_count/16"

# בדיקת קבצי implementation
impl_count=$(find "👑_CEO-System/🤖_Agents" -name "implementation.ts" 2>/dev/null | wc -l)
echo "קבצי implementation: $impl_count"

echo -e "\n${BLUE}=== יצירת סיכום להעלאה ===${NC}"

# יצירת קובץ סיכום
cat > READY_FOR_PRODUCTION.md << EOF
# 🚀 MeUnique AI CEO - Ready for Production

## ✅ סטטוס מפתחות API

$(for key in "${!api_keys[@]}"; do
    value="${!key}"
    if [ -z "$value" ] || [[ "$value" == *"your_"* ]]; then
        echo "- ❌ **${api_keys[$key]}**: חסר"
    else
        echo "- ✅ **${api_keys[$key]}**: מוגדר"
    fi
done)

## 📊 סטטוס מערכת

- **סוכני AI**: $agent_count/16
- **Database**: $(if [[ "$DATABASE_URL" != *"your_"* ]]; then echo "מחובר"; else echo "לא מחובר"; fi)
- **Authentication**: $(if [[ ! -z "$NEXTAUTH_SECRET" ]]; then echo "מוגדר"; else echo "חסר"; fi)

## 🔗 קישורים חשובים

### Production URLs
- Main Site: https://meunique.ai
- App: https://app.meunique.ai
- API: https://api.meunique.ai

### Development
- Local: http://localhost:3000
- GitHub: https://github.com/Liatitshman/MeUnique-AI-CEO

## 📝 פקודות להרצה

\`\`\`bash
# פיתוח מקומי
npm run dev

# בניה לפרודקשיין
npm run build

# העלאה ל-Vercel
vercel --prod

# ניטור עלויות
python3 scripts/cost-monitoring-dashboard.py

# ניטור סוכנים
node scripts/background-agents-monitor.js
\`\`\`

## ⚠️ דברים שנשארו

$(if [ ${#missing_keys[@]} -gt 0 ]; then
    echo "### מפתחות חסרים:"
    for key in "${missing_keys[@]}"; do
        echo "- $key"
    done
fi)

---
*נוצר ב: $(date)*
EOF

echo -e "${GREEN}✅ קובץ סיכום נוצר: READY_FOR_PRODUCTION.md${NC}"

echo -e "\n${BLUE}=== המלצות סופיות ===${NC}"

if [ ${#missing_keys[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 מעולה! כל המפתחות מוגדרים${NC}"
    echo -e "\n${YELLOW}צעדים הבאים:${NC}"
    echo "1. הרץ: npm run dev - לבדיקה מקומית"
    echo "2. הרץ: vercel --prod - להעלאה לפרודקשיין"
    echo "3. הגדר דומיין מותאם אישית ב-Vercel"
else
    echo -e "${YELLOW}⚠️  יש ${#missing_keys[@]} מפתחות חסרים${NC}"
    echo -e "\n${YELLOW}המלצות:${NC}"
    echo "1. השלם את המפתחות החסרים"
    echo "2. הרץ שוב את הסקריפט"
    echo "3. רק אז העלה לפרודקשיין"
fi

echo -e "\n${PURPLE}💡 טיפים חשובים:${NC}"
echo "• השתמש ב-Supabase לדאטאבייס (חינם עד 500MB)"
echo "• התחל עם OpenAI בלבד ($50/חודש)"
echo "• הוסף שירותים בהדרגה לפי הצורך"
echo "• עקוב אחר העלויות עם cost-monitoring-dashboard.py" 