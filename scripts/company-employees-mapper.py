#!/usr/bin/env python3
"""
Company Employees Mapper
ממפה עובדים בחברות יעד ומזהה הזדמנויות גיוס
"""

import json
import requests
from datetime import datetime
from typing import List, Dict, Set
import re

class CompanyEmployeesMapper:
    def __init__(self):
        self.hot_companies = {
            "Unicorns": {
                "Wiz": {"employees": 500, "growth_rate": "300%", "departments": ["Security", "Backend", "DevOps"]},
                "Monday.com": {"employees": 1200, "growth_rate": "50%", "departments": ["Frontend", "Mobile", "Data"]},
                "Gong": {"employees": 800, "growth_rate": "100%", "departments": ["AI/ML", "Backend", "Data"]},
                "Snyk": {"employees": 600, "growth_rate": "80%", "departments": ["Security", "DevOps", "Backend"]},
                "Fireblocks": {"employees": 400, "growth_rate": "150%", "departments": ["Blockchain", "Security", "Backend"]}
            },
            "FAANG": {
                "Google": {"employees": 2000, "departments": ["Cloud", "AI", "Android", "Chrome"]},
                "Microsoft": {"employees": 1500, "departments": ["Azure", "Office", "AI", "Security"]},
                "Meta": {"employees": 300, "departments": ["WhatsApp", "Instagram", "Reality Labs"]},
                "Amazon": {"employees": 500, "departments": ["AWS", "Alexa", "Prime Video"]},
                "Apple": {"employees": 200, "departments": ["iOS", "Hardware", "Services"]}
            },
            "Rising Stars": {
                "Orca Security": {"employees": 300, "growth_rate": "200%"},
                "Verbit": {"employees": 400, "growth_rate": "100%"},
                "Aqua Security": {"employees": 350, "growth_rate": "70%"},
                "BigID": {"employees": 300, "growth_rate": "90%"},
                "Taboola": {"employees": 600, "growth_rate": "30%"}
            }
        }
        
        self.hiring_signals = {
            "aggressive": ["hiring", "expanding", "growing team", "join us", "we're hiring"],
            "funding": ["series", "raised", "funding", "investment", "backed by"],
            "expansion": ["new office", "expanding to", "opening", "launching"],
            "leadership": ["VP", "Director", "Head of", "looking for leaders"]
        }
        
    def map_company(self, company_name: str) -> Dict:
        """ממפה חברה ספציפית"""
        print(f"🔍 Mapping {company_name}...")
        
        # חפש בקטגוריות
        for category, companies in self.hot_companies.items():
            if company_name in companies:
                company_data = companies[company_name]
                
                return {
                    "company": company_name,
                    "category": category,
                    "israel_employees": company_data.get("employees", "Unknown"),
                    "growth_rate": company_data.get("growth_rate", "N/A"),
                    "hot_departments": company_data.get("departments", []),
                    "hiring_score": self.calculate_hiring_score(company_name, category),
                    "talent_pools": self.identify_talent_pools(company_name),
                    "competitor_companies": self.find_competitors(company_name, category),
                    "recommended_approach": self.suggest_approach(company_name, category)
                }
        
        return {"error": f"Company {company_name} not found in database"}
    
    def calculate_hiring_score(self, company: str, category: str) -> float:
        """מחשב ציון גיוס (0-1)"""
        score = 0.5
        
        # Unicorns בגידול מהיר
        if category == "Unicorns":
            score += 0.3
            
        # חברות עם growth rate גבוה
        company_data = self.hot_companies.get(category, {}).get(company, {})
        growth = company_data.get("growth_rate", "0%")
        if growth:
            growth_num = int(growth.replace("%", ""))
            if growth_num > 100:
                score += 0.2
            elif growth_num > 50:
                score += 0.1
                
        return min(score, 1.0)
    
    def identify_talent_pools(self, company: str) -> List[Dict]:
        """מזהה מאגרי כישרונות רלוונטיים"""
        pools = []
        
        # מתחרים ישירים
        if company == "Wiz":
            pools.append({
                "source": "Competitors",
                "companies": ["Check Point", "CyberArk", "Palo Alto Networks"],
                "reason": "Similar security focus"
            })
        elif company == "Monday.com":
            pools.append({
                "source": "Competitors", 
                "companies": ["Asana", "Notion", "Jira"],
                "reason": "Project management expertise"
            })
            
        # יחידות טכנולוגיות
        pools.append({
            "source": "IDF Tech Units",
            "units": ["8200", "Mamram", "81"],
            "reason": "Elite tech training"
        })
        
        # חברות FAANG
        pools.append({
            "source": "FAANG Alumni",
            "companies": ["Google", "Meta", "Microsoft"],
            "reason": "Top tier experience"
        })
        
        return pools
    
    def find_competitors(self, company: str, category: str) -> List[str]:
        """מוצא מתחרים לגיוס"""
        competitors_map = {
            "Wiz": ["Orca Security", "Aqua Security", "Check Point", "CyberArk"],
            "Monday.com": ["Wix", "Notion", "Asana", "ClickUp"],
            "Gong": ["Chorus.ai", "Salesforce", "HubSpot"],
            "Google": ["Microsoft", "Meta", "Amazon"],
            "Microsoft": ["Google", "Amazon", "Oracle"]
        }
        
        return competitors_map.get(company, [])
    
    def suggest_approach(self, company: str, category: str) -> Dict:
        """מציע גישה לגיוס"""
        if category == "Unicorns":
            return {
                "strategy": "Aggressive outreach",
                "messaging": "Join a rocket ship 🚀",
                "timing": "ASAP - they're growing fast",
                "focus": "Growth opportunity + equity",
                "channels": ["LinkedIn", "Referrals", "Tech events"]
            }
        elif category == "FAANG":
            return {
                "strategy": "Selective targeting",
                "messaging": "Stability + innovation",
                "timing": "Quarterly hiring cycles",
                "focus": "Work-life balance + benefits",
                "channels": ["Internal referrals", "University programs"]
            }
        else:
            return {
                "strategy": "Opportunistic",
                "messaging": "Exciting challenges",
                "timing": "Ongoing",
                "focus": "Technical growth",
                "channels": ["LinkedIn", "Communities"]
            }
    
    def analyze_hiring_trends(self) -> Dict:
        """מנתח טרנדים בגיוס"""
        trends = {
            "hottest_skills_2024": [
                "Kubernetes/K8s",
                "AI/ML Engineering", 
                "React/Next.js",
                "Go/Rust",
                "Security/DevSecOps"
            ],
            "salary_trends": {
                "Senior Backend": "$150-200K",
                "Tech Lead": "$180-250K",
                "Staff Engineer": "$200-300K",
                "Principal": "$250K+"
            },
            "remote_trends": {
                "Full Remote": "25% of positions",
                "Hybrid": "60% of positions",
                "Office Only": "15% of positions"
            },
            "hiring_seasons": {
                "Peak": ["January-March", "September-November"],
                "Slow": ["July-August", "December"]
            }
        }
        
        return trends
    
    def generate_company_report(self, companies: List[str]) -> Dict:
        """יוצר דוח מקיף על חברות"""
        report = {
            "generated_at": datetime.now().isoformat(),
            "companies_analyzed": len(companies),
            "total_employees": 0,
            "hiring_opportunities": [],
            "talent_migration_patterns": [],
            "recommendations": []
        }
        
        for company in companies:
            mapping = self.map_company(company)
            if "error" not in mapping:
                report["hiring_opportunities"].append({
                    "company": company,
                    "score": mapping["hiring_score"],
                    "departments": mapping.get("hot_departments", [])
                })
                
                if isinstance(mapping.get("israel_employees"), int):
                    report["total_employees"] += mapping["israel_employees"]
        
        # המלצות
        report["recommendations"] = [
            "Focus on Wiz and Monday.com - highest growth",
            "Target FAANG alumni for senior positions",
            "Use referrals for 3x better conversion",
            "Time outreach for Tuesday-Thursday",
            "Personalize with Hebrew for +15% response"
        ]
        
        return report
    
    def save_mapping(self, data: Dict, filename: str = None):
        """שומר את המיפוי"""
        if not filename:
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            filename = f"👑_CEO-System/📁_Documents/analysis/COMPANY_MAPPING_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Mapping saved to {filename}")
        return filename


def main():
    """הרצה ראשית"""
    mapper = CompanyEmployeesMapper()
    
    print("🏢 Company Mapping Engine Started")
    print("=" * 50)
    
    # מפה חברות unicorn
    unicorns = ["Wiz", "Monday.com", "Gong", "Snyk", "Fireblocks"]
    
    all_mappings = {}
    for company in unicorns:
        mapping = mapper.map_company(company)
        all_mappings[company] = mapping
        
        print(f"\n📊 {company}:")
        print(f"  Employees: {mapping.get('israel_employees')}")
        print(f"  Hiring Score: {mapping.get('hiring_score', 0):.2f}")
        print(f"  Hot Departments: {', '.join(mapping.get('hot_departments', []))}")
    
    # ניתוח טרנדים
    print("\n📈 Hiring Trends 2024:")
    trends = mapper.analyze_hiring_trends()
    print(f"  Hottest Skills: {', '.join(trends['hottest_skills_2024'][:3])}")
    print(f"  Remote Positions: {trends['remote_trends']['Full Remote']}")
    
    # יצירת דוח
    report = mapper.generate_company_report(unicorns)
    mapper.save_mapping({
        "mappings": all_mappings,
        "trends": trends,
        "report": report
    })
    
    print(f"\n✅ Analysis Complete!")
    print(f"Total opportunities identified: {len(report['hiring_opportunities'])}")
    print(f"Total employee pool: {report['total_employees']:,}")

if __name__ == "__main__":
    main() 