# 🛠️ מדריך תיקון ידני מלא - בעיית הטרמינל

## 🚨 הבעיה
Terminal מנסה להיפתח מתיקיה שלא קיימת: `🎯_MeUnique-Business-FINAL`

## ✅ פתרון שלב אחר שלב

### 1️⃣ סגירת כל התהליכים
1. פתחי **Activity Monitor** (⌘+Space → "Activity Monitor")
2. חפשי "Terminal"
3. לחצי עליו ואז על כפתור ה-X למעלה
4. בחרי "Force Quit"

### 2️⃣ הסרה מ-Login Items
1. לכי ל-**System Settings** → **General** → **Login Items**
2. **הסירי את הסימון** מ-Terminal
3. אם יש שם גם "🎯_MeUnique-Business-FINAL" - מחקי אותו

### 3️⃣ ניקוי קבצים בעייתיים
פתחי **Finder** והקישי ⌘+Shift+G, הדביקי כל נתיב ומחקי:

```
~/Library/Saved Application State/com.apple.Terminal.savedState
~/Library/Preferences/com.apple.Terminal.plist
```

### 4️⃣ מחיקת תיקיות בעייתיות
בטרמינל חדש (פתחי מ-Spotlight, לא מ-Dock):
```bash
cd ~/Desktop
rm -rf "🎯_MeUnique-Business-FINAL"
rm -rf "Liatitshman-MeUnique.AI"
```

### 5️⃣ הגדרת Cursor
1. ב-Cursor, לכי ל-**Settings** (⌘+,)
2. חפשי "terminal"
3. הגדירי:
   - **Terminal › Integrated: Cwd** = `/Users/liattishman/Desktop/MeUnique-AI-CEO`

### 6️⃣ יצירת קיצור דרך בטוח
הוסיפי ל-`.zshrc`:
```bash
echo 'alias meunique="cd ~/Desktop/MeUnique-AI-CEO && clear"' >> ~/.zshrc
source ~/.zshrc
```

## 🔒 מניעה לעתיד

### אל תעשי:
- ❌ אל תפתחי Terminal מה-Dock
- ❌ אל תשמרי Terminal ב-Login Items
- ❌ אל תיצרי תיקיות עם אימוג'י בשם

### עשי:
- ✅ השתמשי בטרמינל רק דרך Cursor
- ✅ אם צריך טרמינל נפרד - הקלידי `meunique`
- ✅ שמרי את הפרויקט בנתיב פשוט

## 🆘 אם הבעיה חוזרת

### Option 1: Reset מלא
```bash
defaults delete com.apple.Terminal
rm -rf ~/Library/Preferences/com.apple.Terminal*
```

### Option 2: שימוש ב-iTerm2
1. הורידי [iTerm2](https://iterm2.com)
2. הגדירי אותו כ-default terminal
3. הוא לא ישמור מצבים בעייתיים

## 📝 בדיקה שהכל עובד
1. סגרי את Cursor
2. פתחי מחדש
3. נסי לפתוח טרמינל ב-Cursor (לא בנפרד!)
4. אם עובד - מעולה! 🎉

---

**חשוב**: אם משהו לא ברור או לא עובד - אל תנסי לבד! 
שאלי ואני אעזור עם פתרון אחר. 