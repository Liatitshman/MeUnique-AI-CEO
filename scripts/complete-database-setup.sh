#!/bin/bash

# 🗄️ MeUnique Database Setup Script
# =================================

echo "🗄️ הגדרת Database עבור MeUnique AI CEO"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to display options
show_db_options() {
    echo "בחרי אפשרות Database:"
    echo ""
    echo "1. 🟢 Supabase (מומלץ - חינם עד 500MB)"
    echo "   - PostgreSQL מנוהל"
    echo "   - Real-time subscriptions"
    echo "   - Authentication מובנה"
    echo "   - חינם עד 500MB + 2GB bandwidth"
    echo ""
    echo "2. 🔵 PostgreSQL מקומי (חינם לגמרי)"
    echo "   - התקנה על המחשב שלך"
    echo "   - שליטה מלאה"
    echo "   - ללא הגבלות"
    echo ""
    echo "3. 🟠 PlanetScale (חינם עד 5GB)"
    echo "   - MySQL serverless"
    echo "   - Branching לפיתוח"
    echo "   - 1 מיליארד row reads בחודש"
    echo ""
    echo "4. 🟣 Neon (חינם עד 3GB)"
    echo "   - PostgreSQL serverless"
    echo "   - Branching"
    echo "   - Auto-suspend"
    echo ""
    echo "5. 🔴 Railway (חינם $5 קרדיט/חודש)"
    echo "   - PostgreSQL מנוהל"
    echo "   - קל להגדרה"
    echo "   - מספיק לפיילוט"
}

# Supabase setup
setup_supabase() {
    echo -e "${YELLOW}מגדירים Supabase...${NC}"
    echo ""
    echo "1. היכנסי ל: https://app.supabase.com/"
    echo "2. לחצי 'New Project'"
    echo "3. בחרי שם פרויקט: meunique-ai-ceo"
    echo "4. בחרי סיסמה חזקה ל-DB"
    echo "5. בחרי region: eu-west-1 (אירופה)"
    echo ""
    
    read -p "הדביקי את ה-Project URL (לדוגמה: https://xxx.supabase.co): " SUPABASE_URL
    read -p "הדביקי את ה-anon/public key: " SUPABASE_ANON_KEY
    read -p "הדביקי את ה-service_role key (סודי!): " SUPABASE_SERVICE_KEY
    
    # Update .env
    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=${SUPABASE_URL}|" .env
    echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> .env
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .env
    echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY" >> .env
    
    # Create tables SQL
    cat > setup-supabase-tables.sql << 'EOF'
-- יצירת טבלאות עבור MeUnique

-- טבלת מועמדים
CREATE TABLE candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- פרטים בסיסיים
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    location TEXT,
    
    -- פרטים מקצועיים
    current_title TEXT,
    current_company TEXT,
    years_experience INTEGER,
    skills TEXT[],
    languages TEXT[],
    
    -- סטטוס
    status TEXT DEFAULT 'new',
    score DECIMAL,
    notes TEXT,
    
    -- מטאדאטה
    source TEXT,
    source_id TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- טבלת חברות
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    name TEXT NOT NULL UNIQUE,
    website TEXT,
    industry TEXT,
    size TEXT,
    location TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- טבלת משרות
CREATE TABLE positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    company_id UUID REFERENCES companies(id),
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT[],
    skills_required TEXT[],
    salary_range TEXT,
    location TEXT,
    remote_options TEXT,
    status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- טבלת אינטראקציות
CREATE TABLE interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    candidate_id UUID REFERENCES candidates(id),
    position_id UUID REFERENCES positions(id),
    type TEXT NOT NULL, -- 'message_sent', 'response_received', etc.
    content TEXT,
    status TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- טבלת עלויות
CREATE TABLE cost_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    agent TEXT NOT NULL,
    operation TEXT NOT NULL,
    cost DECIMAL NOT NULL,
    details JSONB DEFAULT '{}'::jsonb
);

-- אינדקסים לביצועים
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_skills ON candidates USING GIN(skills);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_cost_tracking_agent ON cost_tracking(agent);
CREATE INDEX idx_cost_tracking_created ON cost_tracking(created_at);

-- Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_tracking ENABLE ROW LEVEL SECURITY;

-- פוליסות אבטחה (יש להתאים לפי הצורך)
CREATE POLICY "Enable all for authenticated users" ON candidates
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Enable all for authenticated users" ON companies
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Enable all for authenticated users" ON positions
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Enable all for authenticated users" ON interactions
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Enable all for authenticated users" ON cost_tracking
    FOR ALL USING (auth.role() = 'authenticated');
EOF

    echo ""
    echo -e "${GREEN}✅ Supabase מוגדר!${NC}"
    echo ""
    echo "כעת יש להריץ את ה-SQL בממשק Supabase:"
    echo "1. היכנסי ל-Supabase Dashboard"
    echo "2. לכי ל-SQL Editor"
    echo "3. הדביקי את התוכן מ-setup-supabase-tables.sql"
    echo "4. לחצי Run"
    echo ""
    echo "הקובץ נשמר ב: setup-supabase-tables.sql"
}

# PostgreSQL local setup
setup_postgresql_local() {
    echo -e "${YELLOW}מתקינים PostgreSQL מקומי...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command -v psql &> /dev/null; then
            echo "מתקינים PostgreSQL..."
            brew install postgresql@15
            brew services start postgresql@15
        else
            echo -e "${GREEN}✅ PostgreSQL כבר מותקן${NC}"
        fi
        
        # Create database
        echo "יוצרים database..."
        createdb meunique 2>/dev/null || echo "Database כבר קיים"
        
        # Update .env
        DB_URL="postgresql://$(whoami)@localhost:5432/meunique"
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$DB_URL|" .env
        
        # Create tables
        psql meunique < setup-supabase-tables.sql
        
        echo -e "${GREEN}✅ PostgreSQL מקומי מוגדר!${NC}"
    else
        echo "עבור Linux, הריצי:"
        echo "sudo apt-get install postgresql postgresql-contrib"
        echo "sudo -u postgres createdb meunique"
    fi
}

# PlanetScale setup
setup_planetscale() {
    echo -e "${YELLOW}מגדירים PlanetScale...${NC}"
    echo ""
    echo "1. היכנסי ל: https://planetscale.com/"
    echo "2. צרי חשבון חינמי"
    echo "3. לחצי 'Create Database'"
    echo "4. בחרי שם: meunique-ai-ceo"
    echo "5. בחרי plan: Hobby (חינם)"
    echo "6. לכי ל-Connect > Create Password"
    echo ""
    
    read -p "הדביקי את ה-DATABASE_URL המלא: " PLANETSCALE_URL
    
    # Update .env
    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$PLANETSCALE_URL|" .env
    
    echo -e "${GREEN}✅ PlanetScale מוגדר!${NC}"
    echo ""
    echo "הערה: PlanetScale משתמש ב-MySQL, לא PostgreSQL"
    echo "יש להתאים את הקוד בהתאם"
}

# Neon setup
setup_neon() {
    echo -e "${YELLOW}מגדירים Neon...${NC}"
    echo ""
    echo "1. היכנסי ל: https://neon.tech/"
    echo "2. צרי חשבון חינמי"
    echo "3. לחצי 'Create Database'"
    echo "4. בחרי שם: meunique-ai-ceo"
    echo "5. העתיקי את ה-connection string"
    echo ""
    
    read -p "הדביקי את ה-DATABASE_URL: " NEON_URL
    
    # Update .env
    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$NEON_URL|" .env
    
    echo -e "${GREEN}✅ Neon מוגדר!${NC}"
}

# Test database connection
test_db_connection() {
    echo ""
    echo "בודק חיבור ל-Database..."
    
    # Create test script
    cat > test-db-connection.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testConnection() {
    try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            // Test Supabase
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            
            const { data, error } = await supabase
                .from('candidates')
                .select('count')
                .limit(1);
                
            if (error) throw error;
            console.log('✅ חיבור ל-Supabase הצליח!');
        } else if (process.env.DATABASE_URL) {
            // Test direct PostgreSQL
            console.log('✅ DATABASE_URL מוגדר:', process.env.DATABASE_URL.substring(0, 30) + '...');
        }
    } catch (error) {
        console.error('❌ שגיאה בחיבור:', error.message);
    }
}

testConnection();
EOF

    node test-db-connection.js
    rm test-db-connection.js
}

# Main flow
show_db_options
echo ""
read -p "בחרי אפשרות (1-5): " choice

case $choice in
    1)
        setup_supabase
        ;;
    2)
        setup_postgresql_local
        ;;
    3)
        setup_planetscale
        ;;
    4)
        setup_neon
        ;;
    5)
        echo "Railway דורש כרטיס אשראי לאחר $5 הראשונים"
        echo "מומלץ להתחיל עם Supabase או PostgreSQL מקומי"
        ;;
    *)
        echo "בחירה לא תקינה"
        exit 1
        ;;
esac

# Test connection
test_db_connection

echo ""
echo -e "${GREEN}🎉 סיום!${NC}"
echo ""
echo "השלבים הבאים:"
echo "1. אם בחרת Supabase - הריצי את ה-SQL בממשק"
echo "2. הריצי: npm run dev"
echo "3. בדקי שהכל עובד"
echo ""
echo "💡 טיפ: לניהול קל של ה-DB, התקיני:"
echo "   - TablePlus (macOS)"
echo "   - DBeaver (חינם, cross-platform)"
echo "   - pgAdmin (חינם)" 