# ✅ Pre-Push Checklist

## 1. ניקוי תיקיות בעייתיות
- [ ] וודא שאין תיקיות `Liatitshman-MeUnique.AI`
- [ ] וודא שאין תיקיות `🎯_MeUnique-Business-FINAL`
- [ ] בדוק ש-`.gitignore` מעודכן

## 2. קבצים קריטיים קיימים
- [ ] ✅ 15 סוכנים עם implementation
- [ ] ✅ Smart Database עם 7 קבצים
- [ ] ✅ Settings עם 4 קבצים
- [ ] ✅ Deploy עם 3 קבצים
- [ ] ✅ package.json
- [ ] ✅ tsconfig.json

## 3. מידע רגיש
- [ ] אין API keys בקוד
- [ ] אין passwords
- [ ] אין מידע אישי

## 4. בדיקת גודל
- [ ] אין קבצים מעל 100MB
- [ ] אין node_modules
- [ ] אין .next

## 5. הרצת בדיקות
```bash
# בדוק שהפרויקט מתקמפל
npm run build

# בדוק את הגודל
du -sh .

# בדוק מה ייכלל ב-Git
git status --porcelain
```

## 6. הגדרות סוכני רקע
- [ ] ✅ background-agents.json קיים
- [ ] ✅ כל הסוכנים מוגדרים
- [ ] ✅ תזמונים נכונים

---

**אחרי שכל הסעיפים מסומנים - אפשר להעלות!** 