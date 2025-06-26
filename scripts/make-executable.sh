#!/bin/bash

# Make all scripts executable
echo "🔧 Making scripts executable..."

chmod +x scripts/*.sh
chmod +x scripts/*.js
chmod +x scripts/*.py

echo "✅ All scripts are now executable"

# List all scripts
echo ""
echo "📋 Available scripts:"
echo "-------------------"
ls -la scripts/ | grep -E "\.(sh|js|py)$"

node scripts/terminal-connection-fix.js 

cd /Users/liattishman/Desktop/MeUnique-AI-CEO
pwd
git status
ls -la | head -10 

# מחיקת קבצים מיותרים
find . -name ".DS_Store" -delete
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# בדיקה שאין תיקיות בעייתיות
ls -la | grep -E "(Liatitshman|MeUnique-AI-CEO)" 

# בודא שאתה בתיקייה הנכונה
cd /Users/liattishman/Desktop/MeUnique-AI-CEO
pwd

# בדוק את סטטוס Git
git status

# בדוק אם סוכני הרקע פועלים
ps aux | grep -E "(background-agents|terminal-connection)" 

# הפוך את הסקריפט לניתן להרצה
chmod +x scripts/final-check.sh

# הרץ את הבדיקה הסופית
./scripts/final-check.sh 

# הוסף את כל הקבצים החדשים
git add .

# בדוק מה עומד להיכנס ל-commit
git status

# אם יש קבצים שלא צריכים להיכנס, הסר אותם
# git reset HEAD <filename> 

# צור commit עם הודעה מפורטת
git commit -m "Complete MeUnique AI CEO System v1.0

- Implemented all 15 AI agents (Store, Management, Support)
- Added terminal connection monitoring and fixes
- Created comprehensive documentation
- Set up background agent monitoring
- Fixed folder loop issues
- Added deployment configurations
- Ready for production deployment" 

git init
git add .
git commit -m "Initial commit" 

git pull origin main --allow-unrelated-histories
git push origin main 