# ⚡ Auto Recruiter Agent

## תפקיד בלופ החכם
הסוכן השני בחשיבותו - מרחיב את מאגר המועמדים תוך פיקוח צמוד של ה-CFO על עלויות.

## יכולות מרכזיות
- 🔍 **חיפוש חכם ב-LinkedIn** - Recruiter + Sales Navigator
- 🐙 **גילוי מפתחים ב-GitHub** - לפי שפות וטרנדים
- 👥 **סריקת קהילות** - Discord, Slack, Forums
- 💰 **אופטימיזציית עלויות** - עם אישור CFO
- 🔄 **עיבוד בקבוצות** - עד 50 מועמדים במקביל
- 🎯 **מניעת כפילויות** - השוואה למאגר קיים

## אינטגרציות

### LinkedIn
```typescript
const linkedInSearch = {
  filters: {
    location: ["Israel", "US", "Europe"],
    experience: "3-10 years",
    skills: ["Python", "Machine Learning", "Computer Vision"],
    companies: ["Mobileye", "Microsoft", "Google"]
  },
  limits: {
    daily: 100,
    costPerProfile: 0.10
  }
};
```

### GitHub
```typescript
const githubDiscovery = {
  searchCriteria: {
    stars: "> 50",
    language: "Python",
    topics: ["computer-vision", "deep-learning"],
    activity: "last 30 days"
  },
  enrichment: {
    contributions: true,
    organizations: true,
    techStack: true
  }
};
```

## פיקוח עלויות

### מודל תמחור
- **חיפוש פנימי**: חינם
- **LinkedIn Search**: $0.10 למועמד
- **GitHub API**: $0.05 למועמד
- **העשרת נתונים**: $0.05 למועמד

### בקרת עלויות
```typescript
const costControl = {
  beforeSearch: async (criteria) => {
    const estimatedCost = calculateCost(criteria);
    if (estimatedCost > 10) {
      return await cfoAgent.requestApproval({
        action: "candidate_search",
        estimatedCost,
        expectedResults: criteria.expectedCount
      });
    }
    return { approved: true };
  }
};
```

## דוגמאות שימוש

### חיפוש בסיסי
```typescript
const autoRecruiter = new AutoRecruiterAgent();

const candidates = await autoRecruiter.expandPool({
  jobId: "conntour-founding-engineer",
  currentPoolSize: 12,
  targetPoolSize: 50,
  requirements: {
    skills: ["Python", "C++", "CUDA"],
    experience: "5+ years",
    location: "Israel or willing to relocate"
  }
});
```

### חיפוש מתקדם עם הצלבות
```typescript
const advancedSearch = await autoRecruiter.crossSearch({
  companies: ["Mobileye", "OrCam", "Innoviz"],
  skills: ["Computer Vision", "Deep Learning"],
  excludeCurrentEmployees: true,
  findAlumni: true
});
```

## מדדי ביצוע
- **מהירות**: 50 מועמדים ב-30 שניות
- **איכות**: 70%+ match score
- **עלות**: $5 ל-50 מועמדים
- **ייחודיות**: 95% (5% כפילויות מקסימום)

## Tips לשימוש מיטבי
1. **תמיד התחל מ-Smart Database** - בדוק מה כבר יש
2. **הגדר תקציב מראש** - CFO יאהב אותך
3. **השתמש בפילטרים חכמים** - איכות על כמות
4. **נצל הצלבות** - מועמד מחברה X שעבד בחברה Y
5. **למד מהצלחות** - מה עבד בעבר?

## העשרת נתונים
```typescript
const enrichment = {
  basic: {
    email: "Found via GitHub/LinkedIn",
    phone: "Via contact APIs",
    social: ["Twitter", "GitHub", "LinkedIn"]
  },
  advanced: {
    personality: "Via social analysis",
    interests: "Via GitHub stars/follows",
    availability: "Via activity patterns"
  }
};
```

## חיבור ללופ החכם
1. **מקבל מ-Smart Database**: מיפוי משאבים ראשוני
2. **שולח ל-Culture Matcher**: רשימת מועמדים מורחבת
3. **מתייעץ עם CFO**: אישור עלויות
4. **מעדכן את Smart Database**: מועמדים חדשים

---

*"Finding needles in haystacks, efficiently and affordably"* ⚡ 