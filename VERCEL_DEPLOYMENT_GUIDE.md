# 🚀 MeUnique AI CEO - מדריך העלאה מלא ל-Vercel

## 📋 רשימת בדיקה לפני העלאה

### ✅ בדיקות קוד:
- [ ] `npm run build` - עובר בהצלחה
- [ ] `npm run test` - כל הטסטים עוברים
- [ ] אין שגיאות TypeScript
- [ ] אין מפתחות חשופים בקוד

### ✅ הגדרות Database:
- [ ] Supabase account נוצר
- [ ] טבלאות נוצרו (ראה SQL למטה)
- [ ] Connection string מוכן

### ✅ API Keys מוכנים:
- [ ] OpenAI API Key
- [ ] LinkedIn Cookie
- [ ] GitHub Token
- [ ] לפחות מפתח אחד לכל פלטפורמה

---

## 🔧 שלב 1: הכנת Supabase

### יצירת פרויקט:
1. לך ל: https://app.supabase.com/
2. לחץ "New Project"
3. הגדרות:
   - Name: `meunique-ai-ceo`
   - Password: **שמור במקום בטוח!**
   - Region: `eu-west-1` (אירופה)

### יצירת טבלאות:
```sql
-- העתק והרץ ב-SQL Editor של Supabase

-- טבלת מועמדים
CREATE TABLE candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    location TEXT,
    current_title TEXT,
    current_company TEXT,
    years_experience INTEGER,
    skills TEXT[],
    languages TEXT[],
    status TEXT DEFAULT 'new',
    score DECIMAL,
    notes TEXT,
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
    type TEXT NOT NULL,
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

-- אינדקסים
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_skills ON candidates USING GIN(skills);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_cost_tracking_agent ON cost_tracking(agent);
```

### שמור את המפתחות:
מ-Settings > API:
- `Project URL`: https://xxxxx.supabase.co
- `anon/public key`: eyJhbGc...
- `service_role key`: eyJhbGc... (סודי!)

---

## 🌐 שלב 2: הגדרת Vercel

### התקנה והתחברות:
```bash
# התקן Vercel CLI
npm i -g vercel

# התחבר
vercel login
```

### יצירת פרויקט:
```bash
# בתיקיית הפרויקט
vercel

# ענה על השאלות:
? Set up and deploy "~/Desktop/MeUnique-AI-CEO"? [Y/n] Y
? Which scope do you want to deploy to? Your Account
? Link to existing project? [y/N] N
? What's your project's name? meunique-ai-ceo
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

---

## 🔐 שלב 3: הגדרת משתני סביבה

### אפשרות 1: דרך הממשק (מומלץ)
1. לך ל: https://vercel.com/YOUR_USERNAME/meunique-ai-ceo/settings/environment-variables
2. הוסף כל משתנה בנפרד:

### משתנים חובה:
```
NEXT_PUBLIC_SUPABASE_URL = https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
DATABASE_URL = postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
OPENAI_API_KEY = sk-...
LINKEDIN_SESSION_COOKIE = AQEDATuN...
GITHUB_TOKEN = ghp_...
NEXTAUTH_SECRET = [32 תווים רנדומליים]
JWT_SECRET = [32 תווים רנדומליים]
```

### משתנים אופציונליים אבל מומלצים:
```
SENTRY_DSN = https://...@....ingest.sentry.io/...
GOOGLE_ANALYTICS_ID = G-XXXXXXXXXX
SENDGRID_API_KEY = SG.xxx
EMAIL_FROM = noreply@meunique.ai
ALERT_EMAIL = admin@meunique.ai
```

### אפשרות 2: דרך CLI
```bash
# לכל משתנה
vercel env add OPENAI_API_KEY production
# הדבק את הערך ולחץ Enter

# חזור על כל המשתנים
```

---

## 🚀 שלב 4: העלאה לפרודקשיין

### בדיקה מקומית אחרונה:
```bash
# בדוק build
npm run build

# הרץ בדיקה מקומית
npm run start
```

### העלאה:
```bash
# העלאה לפרודקשיין
vercel --prod

# או אם כבר העלית:
vercel --prod --force
```

### תקבלי:
```
🔍 Inspect: https://vercel.com/YOUR_USERNAME/meunique-ai-ceo/xxxxx
✅ Production: https://meunique-ai-ceo.vercel.app
```

---

## 🌍 שלב 5: הגדרת Domain מותאם אישית

### אם יש לך domain ב-Namecheap:

1. **ב-Namecheap:**
   - לך ל-Domain List > Manage
   - Advanced DNS
   - הוסף:
     ```
     Type: CNAME
     Host: @
     Value: cname.vercel-dns.com
     TTL: Automatic
     ```

2. **ב-Vercel:**
   - Settings > Domains
   - Add Domain
   - הכנס: `meunique.ai` או `app.meunique.ai`
   - Follow instructions

### אם אין לך domain:
- השתמש ב: `https://meunique-ai-ceo.vercel.app`

---

## 🔍 שלב 6: בדיקות אחרי העלאה

### בדיקות בסיסיות:
```bash
# בדוק שהאתר עולה
curl https://YOUR_DOMAIN.vercel.app

# בדוק API
curl https://YOUR_DOMAIN.vercel.app/api/health

# בדוק Database
curl https://YOUR_DOMAIN.vercel.app/api/db/status
```

### בדיקות בממשק:
1. [ ] דף הבית נטען
2. [ ] ניתן להתחבר
3. [ ] חיפוש מועמדים עובד
4. [ ] סוכנים מגיבים
5. [ ] עלויות נרשמות

---

## 🐛 שלב 7: ניטור ותחזוקה

### הגדרת Monitoring:
1. **Sentry** (שגיאות):
   - הירשם ב: https://sentry.io/
   - צור פרויקט Next.js
   - הוסף DSN ל-Vercel

2. **Google Analytics** (שימוש):
   - צור property ב-GA4
   - הוסף ID ל-Vercel

3. **Vercel Analytics** (ביצועים):
   - Enable ב-Dashboard

### לוגים:
```bash
# צפה בלוגים בזמן אמת
vercel logs --follow

# או בממשק
https://vercel.com/YOUR_USERNAME/meunique-ai-ceo/functions
```

---

## 🔄 עדכונים עתידיים

### לכל עדכון:
```bash
# commit changes
git add .
git commit -m "Update: description"
git push

# Vercel יעדכן אוטומטית!
```

### עדכון ידני:
```bash
vercel --prod
```

---

## ❗ בעיות נפוצות

### "Build failed"
- בדוק `npm run build` מקומית
- וודא שכל הספריות מותקנות

### "Database connection failed"
- בדוק DATABASE_URL
- וודא שה-IP מורשה ב-Supabase

### "API rate limit"
- הוסף rate limiting
- שקול שדרוג חבילה

---

## 📞 תמיכה

### Vercel:
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### Supabase:
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com/

---

## 🎉 מזל טוב!

האתר שלך עכשיו חי ב:
- **Vercel URL**: https://meunique-ai-ceo.vercel.app
- **Custom Domain**: https://YOUR_DOMAIN.com (אם הגדרת)

**טיפים אחרונים:**
1. שמרי backup של כל המפתחות
2. הגדירי alerts לעלויות
3. בדקי ביצועים כל שבוע
4. עדכני dependencies חודשית

---

*מדריך זה עודכן: דצמבר 2024* 