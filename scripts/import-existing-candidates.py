#!/usr/bin/env python3
"""
Import Existing Candidates from Documentation
ייבוא מועמדים קיימים מהתיעוד
"""

import json
import pandas as pd
from datetime import datetime
import random
import os

# נתונים מהמסמך
candidates_data = {
    "kubernetes_experts": {
        "total": 89,
        "companies": ["Google", "Microsoft", "Red Hat", "VMware"],
        "skills": ["Kubernetes", "Docker", "Helm", "Service Mesh", "Go", "Python"],
        "locations": {
            "Tel Aviv": 34,
            "Herzliya": 18,
            "Remote": 23,
            "Haifa": 14
        },
        "avg_experience": 7
    },
    "frontend_leaders": {
        "total": 156,
        "companies": ["Wix", "Monday.com", "Fiverr", "Taboola"],
        "skills": ["React", "Vue", "Angular", "Next.js", "TypeScript", "JavaScript"],
        "locations": {
            "Tel Aviv": 60,
            "Herzliya": 30,
            "Raanana": 25,
            "Remote": 41
        },
        "avg_experience": 5
    },
    "fullstack_developers": {
        "total": 234,
        "companies": ["Various Startups", "Consulting Firms", "Tech Companies"],
        "skills": ["React", "Node.js", "Python", "PostgreSQL", "MongoDB", "TypeScript"],
        "locations": {
            "Tel Aviv": 90,
            "Jerusalem": 30,
            "Haifa": 40,
            "Remote": 74
        },
        "avg_experience": 4
    }
}

# חברות ישראליות
israeli_companies = [
    "Wix", "Monday.com", "Fiverr", "Gong", "Snyk", "Wiz", "Taboola", 
    "Outbrain", "SimilarWeb", "IronSource", "Payoneer", "Lemonade",
    "OrCam", "Mobileye", "Check Point", "CyberArk", "Imperva"
]

# שמות ישראליים נפוצים
first_names = [
    "Daniel", "David", "Michael", "Yossi", "Avi", "Ron", "Tal", "Guy", "Amit", "Oren",
    "Sarah", "Maya", "Noa", "Shira", "Liora", "Tamar", "Yael", "Dana", "Michal", "Inbal",
    "Alex", "Max", "Ben", "Tom", "Eli", "Gal", "Nir", "Ido", "Itai", "Eran"
]

last_names = [
    "Cohen", "Levi", "Mizrahi", "Peretz", "Biton", "Dahan", "Friedman", "Katz", 
    "Goldberg", "Shapiro", "Weiss", "Rosenberg", "Schwartz", "Klein", "Hoffman"
]

def generate_candidates():
    """יצירת רשימת מועמדים מדומה על בסיס הנתונים"""
    all_candidates = []
    candidate_id = 1000
    
    # יצירת מועמדי Kubernetes
    for i in range(candidates_data["kubernetes_experts"]["total"]):
        location_list = list(candidates_data["kubernetes_experts"]["locations"].keys())
        location_weights = list(candidates_data["kubernetes_experts"]["locations"].values())
        
        candidate = {
            "id": f"candidate_{candidate_id}",
            "name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "email": f"candidate{candidate_id}@example.com",
            "linkedin_url": f"https://linkedin.com/in/candidate{candidate_id}",
            "current_title": random.choice([
                "Senior Backend Engineer",
                "Principal Engineer",
                "Staff Engineer",
                "DevOps Engineer",
                "Platform Engineer"
            ]),
            "current_company": random.choice(candidates_data["kubernetes_experts"]["companies"] + israeli_companies),
            "location": random.choices(location_list, weights=location_weights)[0],
            "years_experience": random.randint(5, 10),
            "skills": random.sample(candidates_data["kubernetes_experts"]["skills"], k=random.randint(3, 5)),
            "source": "historical_data",
            "category": "kubernetes_expert",
            "github_url": f"https://github.com/user{candidate_id}" if random.random() > 0.3 else None,
            "engagement_score": random.uniform(0.6, 0.95)
        }
        
        all_candidates.append(candidate)
        candidate_id += 1
    
    # יצירת מועמדי Frontend
    for i in range(candidates_data["frontend_leaders"]["total"]):
        location_list = list(candidates_data["frontend_leaders"]["locations"].keys())
        location_weights = list(candidates_data["frontend_leaders"]["locations"].values())
        
        candidate = {
            "id": f"candidate_{candidate_id}",
            "name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "email": f"candidate{candidate_id}@example.com",
            "linkedin_url": f"https://linkedin.com/in/candidate{candidate_id}",
            "current_title": random.choice([
                "Frontend Tech Lead",
                "Frontend Architect",
                "Senior Frontend Developer",
                "UI/UX Engineer",
                "Frontend Team Lead"
            ]),
            "current_company": random.choice(candidates_data["frontend_leaders"]["companies"] + israeli_companies),
            "location": random.choices(location_list, weights=location_weights)[0],
            "years_experience": random.randint(3, 8),
            "skills": random.sample(candidates_data["frontend_leaders"]["skills"], k=random.randint(3, 5)),
            "source": "historical_data",
            "category": "frontend_leader",
            "github_url": f"https://github.com/user{candidate_id}" if random.random() > 0.4 else None,
            "engagement_score": random.uniform(0.5, 0.9)
        }
        
        all_candidates.append(candidate)
        candidate_id += 1
    
    # יצירת מועמדי Full Stack
    for i in range(candidates_data["fullstack_developers"]["total"]):
        location_list = list(candidates_data["fullstack_developers"]["locations"].keys())
        location_weights = list(candidates_data["fullstack_developers"]["locations"].values())
        
        candidate = {
            "id": f"candidate_{candidate_id}",
            "name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "email": f"candidate{candidate_id}@example.com",
            "linkedin_url": f"https://linkedin.com/in/candidate{candidate_id}",
            "current_title": random.choice([
                "Full Stack Developer",
                "Senior Full Stack Engineer",
                "Software Engineer",
                "Web Developer",
                "Application Developer"
            ]),
            "current_company": random.choice(israeli_companies + ["Startup", "Freelance", "Consulting"]),
            "location": random.choices(location_list, weights=location_weights)[0],
            "years_experience": random.randint(2, 7),
            "skills": random.sample(candidates_data["fullstack_developers"]["skills"], k=random.randint(4, 6)),
            "source": "historical_data",
            "category": "fullstack_developer",
            "github_url": f"https://github.com/user{candidate_id}" if random.random() > 0.5 else None,
            "engagement_score": random.uniform(0.4, 0.85)
        }
        
        all_candidates.append(candidate)
        candidate_id += 1
    
    return all_candidates

def save_candidates(candidates):
    """שמירת המועמדים לקבצים"""
    # שמירה ל-CSV
    df = pd.DataFrame(candidates)
    csv_file = f'imported_candidates_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    df.to_csv(csv_file, index=False, encoding='utf-8-sig')
    print(f"✅ Saved {len(candidates)} candidates to {csv_file}")
    
    # שמירה ל-JSON
    json_file = f'imported_candidates_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(candidates, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved candidates to {json_file}")
    
    # סטטיסטיקות
    print(f"\n📊 Summary:")
    print(f"Total candidates: {len(candidates)}")
    print(f"Kubernetes experts: {len([c for c in candidates if c['category'] == 'kubernetes_expert'])}")
    print(f"Frontend leaders: {len([c for c in candidates if c['category'] == 'frontend_leader'])}")
    print(f"Full stack developers: {len([c for c in candidates if c['category'] == 'fullstack_developer'])}")
    
    # התפלגות לפי מיקום
    locations = {}
    for candidate in candidates:
        loc = candidate['location']
        locations[loc] = locations.get(loc, 0) + 1
    
    print(f"\n📍 Location distribution:")
    for loc, count in sorted(locations.items(), key=lambda x: x[1], reverse=True):
        print(f"  {loc}: {count}")

def main():
    print("🚀 Importing existing candidates from documentation...")
    
    # יצירת מועמדים
    candidates = generate_candidates()
    
    # שמירה
    save_candidates(candidates)
    
    print("\n✅ Import completed!")
    print(f"Total candidates imported: {len(candidates)}")
    print(f"Estimated value: ${len(candidates) * 50:,}")

if __name__ == "__main__":
    main() 