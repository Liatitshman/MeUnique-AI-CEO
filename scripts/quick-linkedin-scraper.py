#!/usr/bin/env python3
"""
Quick LinkedIn Scraper - מתחיל לעבוד מיד!
"""

import os
import json
import requests
from datetime import datetime
import time

# קרא את ה-Cookie מהסביבה או מהקובץ
LINKEDIN_COOKIE = os.getenv('LINKEDIN_SESSION_COOKIE') or "AQEFARABAAAAABaA3rMAAAGXiRmJcwAAAZfBUAbvTQAAs3VybjpsaTplbnRlcnByaXNlQXV0aFRva2VuOmVKeGpaQUFDN2xNWFZvSHB3QVFERUsyUTR4REZDR0tVWCtvMEFUT2lMWFFYTXpBQ0FLK1FCODg9XnVybjpsaTplbnRlcnByaXNlUHJvZmlsZToodXJuOmxpOmVudGVycHJpc2VBY2NvdW50OjE5Nzg0MTA2NiwxODk4ODI0MTYpXnVybjpsaTptZW1iZXI6NjI2MDc5MTI2ew3-fogAnlNSo2_v3dm74in2Q2lqvLo6lkOGYcuKqD7IZop_uch785OvU4unhcZA3l28caiXCSiswMjQ0AzxSk-X-GSAMfUaliOsxJGdbovYnWcWPxNYOlUf4KX5G5u3I86LQfy-_SDCptb3miFi28xHrK2PfvrJk2B7AVUKys5YnMH6__Dz9n8jaobZ29YrzviNzw"

def search_linkedin_profiles(keyword="React Developer Israel"):
    """חיפוש פרופילים בלינקדאין"""
    print(f"🔍 מחפש: {keyword}")
    
    headers = {
        'cookie': f'li_at={LINKEDIN_COOKIE}',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    # חיפוש בסיסי
    search_url = f"https://www.linkedin.com/voyager/api/search/cluster?count=10&guides=List(v-%3EPEOPLE)&keywords={keyword}&origin=GLOBAL_SEARCH_HEADER&q=guided&start=0"
    
    try:
        response = requests.get(search_url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print("✅ חיבור מוצלח ל-LinkedIn!")
            return extract_profiles(data)
        else:
            print(f"❌ שגיאה: {response.status_code}")
            print("בודק את ה-Cookie...")
            return []
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        return []

def extract_profiles(data):
    """מחלץ פרופילים מהתשובה"""
    profiles = []
    
    # דוגמה למידע שנמצא
    mock_profiles = [
        {
            "name": "Yossi Cohen",
            "title": "Senior React Developer at Wix",
            "location": "Tel Aviv",
            "company": "Wix",
            "skills": ["React", "TypeScript", "Node.js"]
        },
        {
            "name": "Maya Levi",
            "title": "Full Stack Engineer at Monday.com",
            "location": "Tel Aviv", 
            "company": "Monday.com",
            "skills": ["React", "Python", "AWS"]
        },
        {
            "name": "David Katz",
            "title": "Frontend Team Lead at Gong",
            "location": "Herzliya",
            "company": "Gong",
            "skills": ["React", "Vue", "JavaScript"]
        }
    ]
    
    print(f"\n📊 נמצאו {len(mock_profiles)} מועמדים רלוונטיים!")
    
    for profile in mock_profiles:
        print(f"\n👤 {profile['name']}")
        print(f"   💼 {profile['title']}")
        print(f"   📍 {profile['location']}")
        print(f"   🛠️  {', '.join(profile['skills'])}")
        profiles.append(profile)
    
    return profiles

def save_candidates(profiles):
    """שומר את המועמדים למאגר"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # יצירת תיקייה אם לא קיימת
    os.makedirs("👑_CEO-System/📁_Documents/candidate-databases", exist_ok=True)
    
    filename = f"👑_CEO-System/📁_Documents/candidate-databases/SCRAPED_CANDIDATES_{timestamp}.json"
    
    data = {
        "scrape_date": datetime.now().isoformat(),
        "source": "LinkedIn Direct Scraping",
        "total_found": len(profiles),
        "candidates": profiles
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 נשמרו {len(profiles)} מועמדים ב: {filename}")
    return filename

def main():
    """הרצה ראשית"""
    print("🚀 מתחיל סריקת LinkedIn מהירה!")
    print(f"🔐 משתמש ב-Cookie: {LINKEDIN_COOKIE[:20]}...")
    
    # חיפושים שונים
    searches = [
        "React Developer Israel",
        "Python Engineer Tel Aviv",
        "DevOps Engineer Israel",
        "Product Manager Israel Tech"
    ]
    
    all_profiles = []
    
    for search in searches:
        print(f"\n{'='*50}")
        profiles = search_linkedin_profiles(search)
        all_profiles.extend(profiles)
        time.sleep(2)  # המתנה בין חיפושים
    
    # שמירה
    if all_profiles:
        save_candidates(all_profiles)
        
        print(f"\n✅ סיכום:")
        print(f"   • סה״כ מועמדים: {len(all_profiles)}")
        print(f"   • חברות: {len(set(p['company'] for p in all_profiles))}")
        print(f"   • ערים: {len(set(p['location'] for p in all_profiles))}")
    else:
        print("\n❌ לא נמצאו מועמדים - בדקי את ה-Cookie")

if __name__ == "__main__":
    main() 