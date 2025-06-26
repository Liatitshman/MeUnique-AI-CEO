# LinkedIn Scraping Costs Analysis

## עלויות ישירות:

### 1. LinkedIn API
- **LinkedIn API הרשמי**: לא זמין לסקריפטינג מועמדים
- **LinkedIn Recruiter API**: $825/חודש (כבר יש לך)
- **סקריפטינג ידני**: $0 (אבל מוגבל ועלול להיחסם)

### 2. כלים חיצוניים
- **Phantombuster**: $69-$399/חודש
- **Dux-Soup**: $14.99-$55/חודש
- **LinkedIn Helper**: $15/חודש
- **Octoparse**: $75/חודש

### 3. פתרון מומלץ - Hybrid Approach
- **LinkedIn Sales Navigator**: $79/חודש (חיפוש מתקדם)
- **Manual Export + Automation**: $0
- **API Enrichment**: $0.01-$0.05 למועמד

## אסטרטגיית חיפוש חברים של חברים:

```python
# Pseudo-code for 2nd degree connections
def search_extended_network():
    filters = {
        "connection_degree": [2],  # חברים של חברים
        "location": ["Israel"],
        "current_company_exclude": [
            # חברות ישראליות מסורתיות
            "Bank Hapoalim", "Bank Leumi", "Discount Bank",
            "Harel Insurance", "Migdal Insurance", "Phoenix",
            "Israel Electric Corporation", "Bezeq"
        ],
        "industries": ["Technology", "Software", "Internet"],
        "keywords": ["R&D", "Developer", "Engineer", "Product"],
        "company_types": ["Startup", "Tech Company", "Global Tech"]
    }
    return search_linkedin(filters)
```

## פילטרים מומלצים:

### חברות לכלול:
- חברות גלובליות עם R&D בישראל: Google, Microsoft, Amazon, Meta
- יוניקורנים ישראליים: Monday, Wix, Fiverr, Taboola
- סטארטאפים בצמיחה: Series A-D

### חברות להוציא:
- בנקים: הפועלים, לאומי, דיסקונט, מזרחי
- ביטוח: הראל, מגדל, כלל, הפניקס
- תשתיות: חברת החשמל, בזק, רכבת ישראל
- ממשלתיות: רפאל, התעשייה האווירית

## עלות אפס - גישה חכמה:
1. LinkedIn Sales Navigator לחיפוש
2. Export ידני של תוצאות (עד 2,500 בחודש)
3. העשרה אוטומטית עם הנתונים הקיימים
4. שימוש ב-AI לניתוח והתאמה 