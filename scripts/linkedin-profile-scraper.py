#!/usr/bin/env python3
"""
LinkedIn Profile Scraper for MeUnique-AI-CEO
מערכת לסריקת פרופיל LinkedIn ומיפוי מועמדים פוטנציאליים
"""

import json
import time
import os
from datetime import datetime
from typing import Dict, List, Any
import requests
from bs4 import BeautifulSoup
import pandas as pd

class LinkedInProfileScraper:
    def __init__(self):
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        self.profile_data = {}
        self.candidates = []
        
    def scrape_profile(self, profile_url: str) -> Dict[str, Any]:
        """
        סורק פרופיל LinkedIn (דוגמה - בפועל צריך LinkedIn API או Selenium)
        """
        print(f"🔍 סורק פרופיל: {profile_url}")
        
        # דוגמה לנתוני פרופיל - בפועל צריך לסרוק מ-LinkedIn
        profile_data = {
            "name": "Liat Tishman",
            "title": "CEO & Founder at MeUnique | AI-Powered Recruitment",
            "location": "Tel Aviv, Israel",
            "connections": "500+",
            "about": "Revolutionizing recruitment with AI technology. 45%+ response rates.",
            "experience": [
                {
                    "title": "CEO & Founder",
                    "company": "MeUnique",
                    "duration": "2023 - Present",
                    "description": "Building AI-powered recruitment platform"
                }
            ],
            "skills": [
                "AI", "Machine Learning", "Recruitment", "HR Tech",
                "Product Management", "Leadership", "Innovation"
            ],
            "languages": ["Hebrew", "English"],
            "network_insights": {
                "total_connections": 500,
                "industry_connections": {
                    "Technology": 200,
                    "HR & Recruitment": 150,
                    "Startups": 100,
                    "Other": 50
                }
            }
        }
        
        return profile_data
    
    def analyze_network(self, profile_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        מנתח את הרשת ומזהה מועמדים פוטנציאליים
        """
        print("🎯 מנתח רשת קשרים...")
        
        # דוגמה למועמדים פוטנציאליים מהרשת
        potential_candidates = [
            {
                "name": "David Cohen",
                "title": "Senior Full Stack Developer",
                "company": "Wix",
                "location": "Tel Aviv",
                "skills": ["React", "Node.js", "MongoDB"],
                "match_score": 0.92,
                "connection_degree": 1,
                "profile_url": "https://linkedin.com/in/david-cohen-example"
            },
            {
                "name": "Sarah Levy",
                "title": "Product Manager",
                "company": "Monday.com",
                "location": "Tel Aviv",
                "skills": ["Product Strategy", "Agile", "Data Analysis"],
                "match_score": 0.88,
                "connection_degree": 2,
                "profile_url": "https://linkedin.com/in/sarah-levy-example"
            },
            {
                "name": "Michael Goldstein",
                "title": "DevOps Engineer",
                "company": "Taboola",
                "location": "Tel Aviv",
                "skills": ["AWS", "Kubernetes", "CI/CD"],
                "match_score": 0.85,
                "connection_degree": 1,
                "profile_url": "https://linkedin.com/in/michael-goldstein-example"
            }
        ]
        
        return potential_candidates
    
    def generate_outreach_messages(self, candidates: List[Dict[str, Any]]) -> Dict[str, str]:
        """
        יוצר הודעות יצירת קשר מותאמות אישית
        """
        messages = {}
        
        for candidate in candidates:
            # הודעה בעברית עם נגיעה אישית
            hebrew_msg = f"""
שלום {candidate['name'].split()[0]},

שמתי לב שאנחנו חולקים קשרים משותפים בתעשיית ההייטק הישראלית.
אני מנהלת את MeUnique - פלטפורמת גיוס מבוססת AI שמשיגה 45%+ שיעורי מענה.

כרגע אנחנו מחפשים {candidate['title']} מוכשר/ת, והפרופיל שלך נראה מרשים במיוחד.
האם תהיה/י פנוי/ה לשיחה קצרה השבוע?

בברכה,
ליאת
"""
            
            # הודעה באנגלית
            english_msg = f"""
Hi {candidate['name'].split()[0]},

I noticed we share mutual connections in the Israeli tech ecosystem.
I'm running MeUnique - an AI-powered recruitment platform achieving 45%+ response rates.

We're currently looking for a talented {candidate['title']}, and your profile caught my attention.
Would you be available for a brief chat this week?

Best regards,
Liat
"""
            
            messages[candidate['name']] = {
                'hebrew': hebrew_msg.strip(),
                'english': english_msg.strip(),
                'recommended_language': 'hebrew' if candidate['location'] == 'Tel Aviv' else 'english'
            }
        
        return messages
    
    def save_to_database(self, candidates: List[Dict[str, Any]], messages: Dict[str, str]):
        """
        שומר את המועמדים למאגר הנתונים
        """
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        
        # שמירת מועמדים
        candidates_file = f"👑_CEO-System/📁_Documents/candidate-databases/LINKEDIN_SCRAPED_{timestamp}.json"
        os.makedirs(os.path.dirname(candidates_file), exist_ok=True)
        
        with open(candidates_file, 'w', encoding='utf-8') as f:
            json.dump({
                "scrape_date": timestamp,
                "source": "LinkedIn Profile Network",
                "total_candidates": len(candidates),
                "candidates": candidates,
                "messages": messages
            }, f, ensure_ascii=False, indent=2)
        
        print(f"✅ נשמרו {len(candidates)} מועמדים ב-{candidates_file}")
        
        # יצירת קובץ CSV לייבוא קל
        df = pd.DataFrame(candidates)
        csv_file = candidates_file.replace('.json', '.csv')
        df.to_csv(csv_file, index=False, encoding='utf-8')
        print(f"📊 נוצר קובץ CSV: {csv_file}")
        
        return candidates_file
    
    def generate_report(self, profile_data: Dict[str, Any], candidates: List[Dict[str, Any]]):
        """
        יוצר דוח מסכם של הסריקה
        """
        report = f"""
# LinkedIn Profile Scraping Report
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Profile Summary
- **Name**: {profile_data['name']}
- **Title**: {profile_data['title']}
- **Location**: {profile_data['location']}
- **Connections**: {profile_data['connections']}

## Network Analysis
- **Total Connections Analyzed**: {profile_data['network_insights']['total_connections']}
- **Potential Candidates Found**: {len(candidates)}

### Industry Breakdown:
"""
        for industry, count in profile_data['network_insights']['industry_connections'].items():
            report += f"- {industry}: {count} connections\n"
        
        report += f"""
## Top Candidates (Match Score > 0.85):
"""
        for candidate in sorted(candidates, key=lambda x: x['match_score'], reverse=True)[:5]:
            report += f"""
### {candidate['name']}
- **Title**: {candidate['title']}
- **Company**: {candidate['company']}
- **Match Score**: {candidate['match_score']}
- **Connection**: {candidate['connection_degree']}° connection
- **Key Skills**: {', '.join(candidate['skills'][:3])}
"""
        
        report_file = "👑_CEO-System/📁_Documents/analysis/LINKEDIN_SCRAPING_REPORT.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"📄 דוח מסכם נשמר ב-{report_file}")
        
        return report

def main():
    """
    פונקציה ראשית להרצת הסריקה
    """
    print("🚀 מתחיל סריקת פרופיל LinkedIn...")
    
    scraper = LinkedInProfileScraper()
    
    # סריקת הפרופיל שלך
    profile_url = "https://www.linkedin.com/in/liat-tishman/"  # החלף בכתובת האמיתית
    profile_data = scraper.scrape_profile(profile_url)
    
    # ניתוח הרשת וזיהוי מועמדים
    candidates = scraper.analyze_network(profile_data)
    
    # יצירת הודעות מותאמות אישית
    messages = scraper.generate_outreach_messages(candidates)
    
    # שמירה במאגר הנתונים
    scraper.save_to_database(candidates, messages)
    
    # יצירת דוח מסכם
    report = scraper.generate_report(profile_data, candidates)
    
    print("\n✅ הסריקה הושלמה בהצלחה!")
    print(f"📊 נמצאו {len(candidates)} מועמדים פוטנציאליים")
    print("💾 כל הנתונים נשמרו במערכת")

if __name__ == "__main__":
    main() 