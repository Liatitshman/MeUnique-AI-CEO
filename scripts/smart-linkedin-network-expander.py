#!/usr/bin/env python3
"""
Smart LinkedIn Network Expander
מרחיב את מאגר המועמדים דרך חברים של חברים עם פילטרים חכמים
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Set

# חברות להחרגה - לא טכנולוגיה
EXCLUDED_COMPANIES = {
    # בנקים
    "Bank Hapoalim", "Bank Leumi", "Discount Bank", "Mizrahi Tefahot",
    "First International Bank", "Bank of Jerusalem", "Mercantile Bank",
    
    # ביטוח
    "Harel Insurance", "Migdal Insurance", "Phoenix Insurance", 
    "Clal Insurance", "Menora Mivtachim", "Ayalon Insurance",
    
    # תשתיות וממשלתיות
    "Israel Electric Corporation", "Bezeq", "Israel Railways",
    "Rafael", "Israel Aerospace Industries", "Elbit Systems",
    "Israel Post", "Mekorot", "Hot Telecommunications",
    
    # אחרות לא רלוונטיות
    "Shufersal", "Rami Levy", "Castro", "Fox", "Delta"
}

# חברות מועדפות - הייטק גלובלי ומקומי
PREFERRED_COMPANIES = {
    # FAANG+ בישראל
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix",
    "Intel", "Nvidia", "Qualcomm", "Broadcom",
    
    # יוניקורנים ישראליים
    "Monday.com", "Wix", "Fiverr", "Taboola", "Outbrain",
    "IronSource", "Payoneer", "Gong", "Snyk", "Via",
    "Sisense", "Tipalti", "Rapyd", "Next Insurance",
    
    # סטארטאפים חמים
    "Wiz", "Fireblocks", "Orca Security", "Verbit", "Bizzabo",
    "Aqua Security", "BigID", "Transmit Security"
}

# מילות מפתח לחיפוש
TECH_KEYWORDS = [
    "R&D", "Engineer", "Developer", "Architect", "Tech Lead",
    "Product Manager", "Data Scientist", "DevOps", "Full Stack",
    "Backend", "Frontend", "Mobile", "AI", "ML", "Cloud"
]

class SmartLinkedInExpander:
    def __init__(self):
        self.candidates = []
        self.processed_profiles = set()
        
    def expand_network(self, base_connections: List[Dict]) -> List[Dict]:
        """
        מרחיב את הרשת דרך חיבורים מדרגה שנייה
        """
        expanded_candidates = []
        
        for connection in base_connections:
            # Skip if already processed
            if connection.get('profile_url') in self.processed_profiles:
                continue
                
            # Get 2nd degree connections
            second_degree = self.get_second_degree_connections(connection)
            
            # Filter and enrich
            for candidate in second_degree:
                if self.is_relevant_candidate(candidate):
                    enriched = self.enrich_candidate(candidate)
                    expanded_candidates.append(enriched)
                    
        return expanded_candidates
    
    def get_second_degree_connections(self, connection: Dict) -> List[Dict]:
        """
        מדמה קבלת חיבורים מדרגה שנייה
        """
        # בפועל - כאן תהיה קריאה ל-LinkedIn API
        mock_connections = [
            {
                "name": f"Friend of {connection['name']} - Tech Lead",
                "title": "Tech Lead",
                "company": "Wix",
                "location": "Tel Aviv",
                "connection_degree": 2,
                "mutual_connections": [connection['name']]
            }
        ]
        return mock_connections
    
    def is_relevant_candidate(self, candidate: Dict) -> bool:
        """
        בודק אם המועמד רלוונטי לפי הפילטרים
        """
        company = candidate.get('company', '')
        title = candidate.get('title', '')
        location = candidate.get('location', '')
        
        # החרג חברות לא רלוונטיות
        if company in EXCLUDED_COMPANIES:
            return False
            
        # בדוק מיקום
        if 'Israel' not in location and 'Remote' not in title:
            return False
            
        # בדוק תפקיד טכנולוגי
        has_tech_keyword = any(
            keyword.lower() in title.lower() 
            for keyword in TECH_KEYWORDS
        )
        
        if not has_tech_keyword:
            return False
            
        return True
    
    def enrich_candidate(self, candidate: Dict) -> Dict:
        """
        מעשיר את פרטי המועמד
        """
        # חשב ציון התאמה
        score = self.calculate_match_score(candidate)
        
        # הוסף תגיות
        tags = self.generate_tags(candidate)
        
        # הוסף המלצה לגישה
        approach = self.recommend_approach(candidate)
        
        return {
            **candidate,
            'match_score': score,
            'tags': tags,
            'recommended_approach': approach,
            'added_date': datetime.now().isoformat(),
            'source': 'LinkedIn 2nd Degree Network'
        }
    
    def calculate_match_score(self, candidate: Dict) -> float:
        """
        מחשב ציון התאמה
        """
        score = 0.5  # Base score for 2nd degree
        
        # Bonus for preferred companies
        if candidate.get('company') in PREFERRED_COMPANIES:
            score += 0.2
            
        # Bonus for senior roles
        if any(term in candidate.get('title', '') 
               for term in ['Senior', 'Lead', 'Principal', 'Head']):
            score += 0.15
            
        # Bonus for specific skills
        if 'skills' in candidate:
            valuable_skills = ['Python', 'React', 'Node.js', 'AWS', 'K8s']
            matching_skills = set(candidate['skills']) & set(valuable_skills)
            score += len(matching_skills) * 0.05
            
        return min(score, 1.0)
    
    def generate_tags(self, candidate: Dict) -> List[str]:
        """
        יוצר תגיות למועמד
        """
        tags = []
        
        # Company type
        if candidate.get('company') in PREFERRED_COMPANIES:
            tags.append('preferred_company')
        
        # Seniority
        if 'Senior' in candidate.get('title', ''):
            tags.append('senior')
        elif 'Junior' in candidate.get('title', ''):
            tags.append('junior')
            
        # Location
        if 'Tel Aviv' in candidate.get('location', ''):
            tags.append('tel_aviv')
            
        # Connection type
        tags.append(f"degree_{candidate.get('connection_degree', 2)}")
        
        return tags
    
    def recommend_approach(self, candidate: Dict) -> Dict:
        """
        ממליץ על גישה למועמד
        """
        mutual = candidate.get('mutual_connections', [])
        
        if mutual:
            return {
                'strategy': 'mutual_connection',
                'opening': f'Our mutual connection {mutual[0]} suggested we connect',
                'priority': 'high'
            }
        else:
            return {
                'strategy': 'direct_outreach',
                'opening': 'I noticed your impressive background at {company}',
                'priority': 'medium'
            }
    
    def save_expanded_network(self, candidates: List[Dict]):
        """
        שומר את הרשת המורחבת
        """
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"👑_CEO-System/📁_Documents/candidate-databases/EXPANDED_NETWORK_{timestamp}.json"
        
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'expansion_date': timestamp,
                'total_candidates': len(candidates),
                'filters_applied': {
                    'excluded_companies': list(EXCLUDED_COMPANIES)[:5] + ['...'],
                    'preferred_companies': list(PREFERRED_COMPANIES)[:5] + ['...'],
                    'tech_keywords': TECH_KEYWORDS[:5] + ['...']
                },
                'candidates': candidates
            }, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Saved {len(candidates)} expanded network candidates")
        return filename

def main():
    """
    הרצת הרחבת הרשת
    """
    print("🚀 Starting Smart LinkedIn Network Expansion...")
    
    expander = SmartLinkedInExpander()
    
    # דוגמה לחיבורים בסיסיים
    base_connections = [
        {
            "name": "John Doe",
            "title": "Senior Developer",
            "company": "Wix",
            "profile_url": "linkedin.com/in/johndoe"
        }
    ]
    
    # הרחב רשת
    expanded = expander.expand_network(base_connections)
    
    # סנן רק מועמדים איכותיים
    quality_candidates = [c for c in expanded if c['match_score'] > 0.7]
    
    # שמור
    expander.save_expanded_network(quality_candidates)
    
    print(f"📊 Network expanded: {len(quality_candidates)} quality candidates found")
    print("✅ Expansion complete!")

if __name__ == "__main__":
    main() 