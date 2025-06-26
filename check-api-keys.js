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
