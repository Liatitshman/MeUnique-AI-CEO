# 🚀 מדריך הגדרה מלא - MeUnique AI CEO

## 📋 סטטוס נוכחי
- ✅ 15/15 סוכנים מיושמים ומוכנים
- ✅ מבנה תיקיות מסודר
- ⚠️ בעיות Git שצריך לתקן
- ⚠️ חיבור GitHub Desktop לא עובד
- ⚠️ סוכני רקע לא מוגדרים

## 🔧 שלב 1: תיקון בעיות Git

### א. נקה את הבעיות הנוכחיות
```bash
cd /Users/liattishman/Desktop/MeUnique-AI-CEO
chmod +x scripts/complete-git-setup.sh
./scripts/complete-git-setup.sh
```

### ב. אם יש בעיות, הרץ:
```bash
# תיקון ידני
git rm -f MeUnique-AI-CEO
git add .
git commit -m "Fix: Remove duplicate directory"
```

## 🌐 שלב 2: הגדרת GitHub

### א. צרי Personal Access Token
1. לכי ל: https://github.com/settings/tokens
2. לחצי על "Generate new token (classic)"
3. תני לו שם: "MeUnique-AI-CEO"
4. סמני את ההרשאות:
   - ✅ repo (כל ההרשאות)
   - ✅ workflow
5. לחצי "Generate token"
6. **העתיקי את הטוקן - הוא יופיע רק פעם אחת!**

### ב. הגדרת Repository
1. לכי ל: https://github.com/new
2. Repository name: `MeUnique-AI-CEO`
3. Description: "AI-powered CEO system with 15 specialized agents"
4. בחרי: Public או Private
5. **אל תסמני** "Initialize this repository with a README"
6. לחצי "Create repository"

## 💻 שלב 3: חיבור לדסקטופ

### א. GitHub Desktop
```bash
chmod +x scripts/github-desktop-fix.sh
./scripts/github-desktop-fix.sh
```

### ב. חיבור ידני ב-GitHub Desktop
1. פתחי GitHub Desktop
2. File → Add Local Repository
3. בחרי: `/Users/liattishman/Desktop/MeUnique-AI-CEO`
4. לחצי "Add Repository"

### ג. אם עדיין לא עובד - Clone חדש
```bash
# עברי לדסקטופ
cd ~/Desktop

# מחקי את התיקייה הישנה (גבי קודם!)
mv MeUnique-AI-CEO MeUnique-AI-CEO-backup

# Clone חדש
git clone https://github.com/YOUR_USERNAME/MeUnique-AI-CEO.git

# העתיקי קבצי הגדרות
cp MeUnique-AI-CEO-backup/.env.local MeUnique-AI-CEO/
cp -r MeUnique-AI-CEO-backup/node_modules MeUnique-AI-CEO/
```

## 🤖 שלב 4: הגדרת סוכני רקע

### א. התקנת תלויות
```bash
cd MeUnique-AI-CEO
npm install
```

### ב. הגדרת סוכנים אוטומטיים
```bash
# צרי שירות רקע
cat > ~/Library/LaunchAgents/com.meunique.ai.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.meunique.ai</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/liattishman/Desktop/MeUnique-AI-CEO/scripts/background-agents-monitor.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# טען את השירות
launchctl load ~/Library/LaunchAgents/com.meunique.ai.plist
```

## 🚀 שלב 5: הפעלת המערכת

### א. בדיקת סטטוס
```bash
# בדוק Git
git status
git remote -v

# בדוק סוכנים
launchctl list | grep meunique

# בדוק Node
node --version
npm --version
```

### ב. הפעלה
```bash
# סביבת פיתוח
npm run dev

# פתח בדפדפן
open http://localhost:3000
```

## 📱 שלב 6: קיצורי דרך

### א. פתיחה ב-Cursor
```bash
# צור קיצור דרך
echo '#!/bin/bash
cd /Users/liattishman/Desktop/MeUnique-AI-CEO
cursor .
' > ~/Desktop/OpenMeUnique.command

chmod +x ~/Desktop/OpenMeUnique.command
```

### ב. פתיחה מהירה בטרמינל
```bash
# הוסף ל-.zshrc
echo 'alias meunique="cd /Users/liattishman/Desktop/MeUnique-AI-CEO && cursor ."' >> ~/.zshrc
source ~/.zshrc
```

## 🆘 פתרון בעיות נפוצות

### בעיה: "Permission denied"
```bash
chmod +x scripts/*.sh
```

### בעיה: "Repository not found"
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/MeUnique-AI-CEO.git
```

### בעיה: "Port 3000 already in use"
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### בעיה: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

## ✅ רשימת בדיקה סופית

- [ ] Git מחובר ועובד
- [ ] GitHub Desktop מזהה את הפרויקט
- [ ] סוכני רקע פועלים
- [ ] npm run dev עובד
- [ ] localhost:3000 נפתח
- [ ] כל ה-API endpoints עובדים
- [ ] קיצורי דרך נוצרו

## 📞 תמיכה

אם את נתקלת בבעיות:
1. הריצי: `./scripts/final-check.sh`
2. בדקי את הלוגים: `tail -f logs/*.log`
3. הפעילי מחדש: `npm run dev`

---
💡 **טיפ**: שמרי את הטוקן של GitHub במקום בטוח! 