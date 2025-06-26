#!/usr/bin/env node

/**
 * 🔍 Test All API Connections
 * בודק את כל החיבורים והמפתחות
 */

require('dotenv').config();
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
};

console.log('🔍 בודק את כל החיבורים...\n');

const tests = {
    // Database
    async testDatabase() {
        console.log('🗄️  Database:');
        
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                );
                
                const { error } = await supabase.from('candidates').select('count').limit(1);
                
                if (!error || error.message.includes('relation')) {
                    console.log(`${colors.green}✅ Supabase - מחובר${colors.reset}`);
                    console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
                } else {
                    throw error;
                }
            } catch (err) {
                console.log(`${colors.red}❌ Supabase - ${err.message}${colors.reset}`);
            }
        } else if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your_')) {
            console.log(`${colors.green}✅ Database URL מוגדר${colors.reset}`);
            console.log(`   ${process.env.DATABASE_URL.substring(0, 30)}...`);
        } else {
            console.log(`${colors.red}❌ אין Database מוגדר${colors.reset}`);
        }
        console.log('');
    },

    // OpenAI
    async testOpenAI() {
        console.log('🤖 OpenAI:');
        const key = process.env.OPENAI_API_KEY;
        
        if (!key || key.includes('your_')) {
            console.log(`${colors.red}❌ לא מוגדר${colors.reset}`);
        } else if (key.startsWith('sk-')) {
            console.log(`${colors.green}✅ מפתח תקין (${key.substring(0, 10)}...)${colors.reset}`);
            // Test actual connection
            try {
                const response = await fetch('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                if (response.ok) {
                    console.log(`${colors.green}   ✅ חיבור הצליח${colors.reset}`);
                } else {
                    console.log(`${colors.yellow}   ⚠️  בעיה בחיבור: ${response.status}${colors.reset}`);
                }
            } catch (err) {
                console.log(`${colors.red}   ❌ שגיאה: ${err.message}${colors.reset}`);
            }
        } else {
            console.log(`${colors.yellow}⚠️  מפתח לא תקני${colors.reset}`);
        }
        console.log('');
    },

    // LinkedIn
    testLinkedIn() {
        console.log('💼 LinkedIn:');
        const cookie = process.env.LINKEDIN_SESSION_COOKIE;
        
        if (!cookie || cookie.includes('your_')) {
            console.log(`${colors.red}❌ Cookie לא מוגדר${colors.reset}`);
        } else if (cookie.length > 100) {
            console.log(`${colors.green}✅ Cookie מוגדר (${cookie.substring(0, 20)}...)${colors.reset}`);
        } else {
            console.log(`${colors.yellow}⚠️  Cookie קצר מדי${colors.reset}`);
        }
        console.log('');
    },

    // GitHub
    async testGitHub() {
        console.log('🐙 GitHub:');
        const token = process.env.GITHUB_TOKEN;
        
        if (!token || token.includes('your_')) {
            console.log(`${colors.red}❌ לא מוגדר${colors.reset}`);
        } else {
            try {
                const response = await fetch('https://api.github.com/user', {
                    headers: { 'Authorization': `token ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(`${colors.green}✅ מחובר כ-${data.login}${colors.reset}`);
                } else {
                    console.log(`${colors.red}❌ Token לא תקין${colors.reset}`);
                }
            } catch (err) {
                console.log(`${colors.red}❌ שגיאה: ${err.message}${colors.reset}`);
            }
        }
        console.log('');
    },

    // Other APIs
    testOtherAPIs() {
        console.log('🌐 APIs נוספים:');
        
        const apis = {
            'Twitter': ['TWITTER_API_KEY', 'TWITTER_API_SECRET'],
            'Facebook': ['FACEBOOK_APP_ID', 'FACEBOOK_ACCESS_TOKEN'],
            'Discord': ['DISCORD_BOT_TOKEN', 'DISCORD_CLIENT_ID'],
            'Reddit': ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET'],
            'Slack': ['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN'],
            'Google': ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
        };
        
        for (const [name, keys] of Object.entries(apis)) {
            const configured = keys.every(k => 
                process.env[k] && !process.env[k].includes('your_')
            );
            
            if (configured) {
                console.log(`${colors.green}✅ ${name} - מוגדר${colors.reset}`);
            } else {
                const missing = keys.filter(k => 
                    !process.env[k] || process.env[k].includes('your_')
                );
                console.log(`${colors.red}❌ ${name} - חסר: ${missing.join(', ')}${colors.reset}`);
            }
        }
        console.log('');
    },

    // Monitoring
    testMonitoring() {
        console.log('📊 Monitoring:');
        
        if (process.env.SENTRY_DSN && !process.env.SENTRY_DSN.includes('your_')) {
            console.log(`${colors.green}✅ Sentry - מוגדר${colors.reset}`);
        } else {
            console.log(`${colors.yellow}⚠️  Sentry - לא מוגדר (אופציונלי)${colors.reset}`);
        }
        
        if (process.env.GOOGLE_ANALYTICS_ID && !process.env.GOOGLE_ANALYTICS_ID.includes('your_')) {
            console.log(`${colors.green}✅ Google Analytics - מוגדר${colors.reset}`);
        } else {
            console.log(`${colors.yellow}⚠️  Google Analytics - לא מוגדר (אופציונלי)${colors.reset}`);
        }
        console.log('');
    }
};

// Run all tests
async function runAllTests() {
    await tests.testDatabase();
    await tests.testOpenAI();
    tests.testLinkedIn();
    await tests.testGitHub();
    tests.testOtherAPIs();
    tests.testMonitoring();
    
    console.log('💡 טיפים:');
    console.log('1. להגדרת Database: ./scripts/complete-database-setup.sh');
    console.log('2. להגדרת APIs: ./scripts/complete-setup-wizard.sh');
    console.log('3. לבדיקת עלויות: python3 scripts/cost-monitoring-dashboard.py');
}

runAllTests().catch(console.error); 