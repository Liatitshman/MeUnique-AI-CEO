#!/usr/bin/env python3
"""
Integrate Candidates to Database with Smart Deduplication
אינטגרציה חכמה של מועמדים למאגר עם ניקוי כפילויות והשלמת מידע
"""

import json
import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Set, Tuple
import hashlib
import re
from collections import defaultdict
import logging
from dataclasses import dataclass, asdict
import requests
from fuzzywuzzy import fuzz, process
import phonenumbers

# הגדרת לוגינג
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class EnrichedCandidate:
    """מועמד מועשר עם מידע משולב"""
    # פרטים בסיסיים
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    
    # פרופילים ברשתות
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    stackoverflow_id: Optional[str] = None
    
    # מידע מקצועי
    current_title: Optional[str] = None
    current_company: Optional[str] = None
    years_experience: Optional[int] = None
    seniority_level: Optional[str] = None
    
    # כישורים ומומחיות
    skills: List[str] = None
    verified_skills: List[str] = None  # כישורים מאומתים
    skill_confidence: Dict[str, float] = None  # רמת ביטחון לכל כישור
    
    # מטריקות
    github_stars: int = 0
    stackoverflow_reputation: int = 0
    engagement_score: float = 0.0
    match_score: float = 0.0
    
    # מקורות ותיוגים
    sources: List[str] = None
    tags: List[str] = None
    
    # מטא-דאטה
    created_at: datetime = None
    updated_at: datetime = None
    enrichment_status: str = "pending"
    data_quality_score: float = 0.0
    
    def __post_init__(self):
        if self.skills is None:
            self.skills = []
        if self.verified_skills is None:
            self.verified_skills = []
        if self.skill_confidence is None:
            self.skill_confidence = {}
        if self.sources is None:
            self.sources = []
        if self.tags is None:
            self.tags = []
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()

class CandidateIntegrator:
    """מערכת אינטגרציה חכמה למועמדים"""
    
    def __init__(self):
        self.existing_candidates: Dict[str, EnrichedCandidate] = {}
        self.new_candidates: List[EnrichedCandidate] = []
        self.duplicates_found = 0
        self.enriched_count = 0
        
        # טעינת מאגר קיים
        self.load_existing_database()
        
        # מאגרי מידע לאימות
        self.load_verification_data()
        
    def load_existing_database(self):
        """טעינת מאגר מועמדים קיים"""
        db_file = "candidates_master_database.json"
        if os.path.exists(db_file):
            with open(db_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for candidate_data in data:
                    candidate = EnrichedCandidate(**candidate_data)
                    self.existing_candidates[candidate.id] = candidate
            logger.info(f"Loaded {len(self.existing_candidates)} existing candidates")
    
    def load_verification_data(self):
        """טעינת מאגרי מידע לאימות"""
        # רשימת חברות ישראליות
        self.israeli_companies = {
            'wiz', 'monday.com', 'gong', 'snyk', 'wix', 'ironSource',
            'similarweb', 'taboola', 'outbrain', 'fiverr', 'payoneer',
            'walkme', 'sisense', 'cyberark', 'checkpoint', 'imperva',
            'aqua security', 'orca security', 'armis', 'cato networks'
        }
        
        # כישורים מאומתים
        self.verified_skills = {
            'languages': ['python', 'javascript', 'typescript', 'java', 'go', 'rust', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin'],
            'frontend': ['react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt.js', 'gatsby'],
            'backend': ['node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', '.net'],
            'database': ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb'],
            'cloud': ['aws', 'azure', 'gcp', 'kubernetes', 'docker', 'terraform', 'ansible'],
            'devops': ['jenkins', 'gitlab ci', 'github actions', 'circleci', 'argocd', 'helm'],
            'data': ['spark', 'kafka', 'airflow', 'databricks', 'snowflake', 'bigquery']
        }
        
    def process_candidates_file(self, file_path: str):
        """עיבוד קובץ מועמדים"""
        logger.info(f"Processing file: {file_path}")
        
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path, encoding='utf-8-sig')
        elif file_path.endswith('.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                df = pd.DataFrame(data)
        else:
            logger.error(f"Unsupported file format: {file_path}")
            return
            
        # עיבוד כל מועמד
        for _, row in df.iterrows():
            candidate = self.parse_candidate(row)
            if candidate:
                self.process_candidate(candidate)
                
    def parse_candidate(self, row) -> Optional[EnrichedCandidate]:
        """פרסור מועמד מ-row"""
        try:
            # יצירת ID ייחודי
            unique_id = self.generate_candidate_id(row)
            
            # חילוץ כישורים
            skills = self.extract_skills(row)
            
            # חילוץ מיקום
            location = self.normalize_location(row.get('location', ''))
            
            # יצירת מועמד
            candidate = EnrichedCandidate(
                id=unique_id,
                name=self.clean_name(row.get('name', '')),
                email=self.normalize_email(row.get('email', '')),
                phone=self.normalize_phone(row.get('phone', '')),
                location=location,
                linkedin_url=row.get('linkedin_url', ''),
                github_url=row.get('github_url', ''),
                twitter_handle=row.get('twitter_handle', ''),
                current_title=row.get('title', ''),
                current_company=row.get('company', ''),
                skills=skills,
                sources=[row.get('source', 'unknown')]
            )
            
            return candidate
            
        except Exception as e:
            logger.error(f"Error parsing candidate: {e}")
            return None
            
    def generate_candidate_id(self, row) -> str:
        """יצירת ID ייחודי למועמד"""
        # שילוב של מספר שדות לייחודיות
        components = []
        
        if row.get('email'):
            components.append(row['email'].lower())
        if row.get('linkedin_url'):
            components.append(row['linkedin_url'])
        if row.get('github_url'):
            components.append(row['github_url'])
        if row.get('name'):
            components.append(row['name'].lower())
            
        if components:
            hash_input = '|'.join(components)
            return hashlib.md5(hash_input.encode()).hexdigest()[:12]
        else:
            return f"candidate_{datetime.now().timestamp()}"
            
    def process_candidate(self, candidate: EnrichedCandidate):
        """עיבוד מועמד - בדיקת כפילויות והעשרה"""
        # בדיקת כפילויות
        duplicate_id = self.find_duplicate(candidate)
        
        if duplicate_id:
            # מיזוג עם מועמד קיים
            self.merge_candidates(duplicate_id, candidate)
            self.duplicates_found += 1
        else:
            # העשרת מועמד חדש
            enriched = self.enrich_candidate(candidate)
            self.new_candidates.append(enriched)
            
    def find_duplicate(self, candidate: EnrichedCandidate) -> Optional[str]:
        """חיפוש כפילויות חכם"""
        for existing_id, existing in self.existing_candidates.items():
            # בדיקת email
            if candidate.email and existing.email:
                if candidate.email.lower() == existing.email.lower():
                    return existing_id
                    
            # בדיקת LinkedIn URL
            if candidate.linkedin_url and existing.linkedin_url:
                if self.normalize_linkedin_url(candidate.linkedin_url) == \
                   self.normalize_linkedin_url(existing.linkedin_url):
                    return existing_id
                    
            # בדיקת שם + חברה
            if candidate.name and existing.name:
                name_similarity = fuzz.ratio(
                    candidate.name.lower(), 
                    existing.name.lower()
                )
                if name_similarity > 90:
                    if candidate.current_company and existing.current_company:
                        company_similarity = fuzz.ratio(
                            candidate.current_company.lower(),
                            existing.current_company.lower()
                        )
                        if company_similarity > 80:
                            return existing_id
                            
        return None
        
    def merge_candidates(self, existing_id: str, new_candidate: EnrichedCandidate):
        """מיזוג מועמדים"""
        existing = self.existing_candidates[existing_id]
        
        # עדכון שדות ריקים
        if not existing.email and new_candidate.email:
            existing.email = new_candidate.email
            
        if not existing.phone and new_candidate.phone:
            existing.phone = new_candidate.phone
            
        if not existing.github_url and new_candidate.github_url:
            existing.github_url = new_candidate.github_url
            
        # מיזוג כישורים
        existing.skills = list(set(existing.skills + new_candidate.skills))
        
        # מיזוג מקורות
        existing.sources = list(set(existing.sources + new_candidate.sources))
        
        # עדכון תאריך
        existing.updated_at = datetime.now()
        
        logger.info(f"Merged duplicate candidate: {existing.name}")
        
    def enrich_candidate(self, candidate: EnrichedCandidate) -> EnrichedCandidate:
        """העשרת מועמד עם מידע נוסף"""
        self.enriched_count += 1
        
        # 1. אימות והעשרת כישורים
        candidate = self.enrich_skills(candidate)
        
        # 2. חילוץ רמת בכירות
        candidate.seniority_level = self.extract_seniority(candidate.current_title)
        
        # 3. הערכת שנות ניסיון
        candidate.years_experience = self.estimate_experience(candidate)
        
        # 4. תיוג חכם
        candidate.tags = self.generate_smart_tags(candidate)
        
        # 5. חישוב ציון איכות נתונים
        candidate.data_quality_score = self.calculate_data_quality(candidate)
        
        # 6. העשרה מ-APIs חיצוניים (אם זמין)
        if candidate.github_url:
            candidate = self.enrich_from_github(candidate)
            
        candidate.enrichment_status = "completed"
        
        return candidate
        
    def enrich_skills(self, candidate: EnrichedCandidate) -> EnrichedCandidate:
        """אימות והעשרת כישורים"""
        verified_skills = []
        skill_confidence = {}
        
        for skill in candidate.skills:
            skill_lower = skill.lower()
            
            # בדיקה מול רשימת כישורים מאומתים
            for category, skills_list in self.verified_skills.items():
                if skill_lower in skills_list:
                    verified_skills.append(skill)
                    skill_confidence[skill] = 1.0
                    break
                else:
                    # חיפוש דמיון
                    match = process.extractOne(skill_lower, skills_list, scorer=fuzz.ratio)
                    if match and match[1] > 80:
                        verified_skills.append(match[0])
                        skill_confidence[match[0]] = match[1] / 100.0
                        
        # הוספת כישורים משלימים
        inferred_skills = self.infer_skills(candidate)
        for skill in inferred_skills:
            if skill not in candidate.skills:
                candidate.skills.append(skill)
                skill_confidence[skill] = 0.7  # ביטחון נמוך יותר לכישורים מוסקים
                
        candidate.verified_skills = verified_skills
        candidate.skill_confidence = skill_confidence
        
        return candidate
        
    def infer_skills(self, candidate: EnrichedCandidate) -> List[str]:
        """הסקת כישורים מתוך מידע קיים"""
        inferred = []
        
        title_lower = (candidate.current_title or '').lower()
        
        # הסקה לפי תפקיד
        if 'full stack' in title_lower or 'fullstack' in title_lower:
            inferred.extend(['frontend', 'backend', 'api development'])
        elif 'frontend' in title_lower:
            inferred.extend(['html', 'css', 'javascript'])
        elif 'backend' in title_lower:
            inferred.extend(['api development', 'database design'])
        elif 'devops' in title_lower:
            inferred.extend(['ci/cd', 'infrastructure as code'])
        elif 'data' in title_lower:
            inferred.extend(['data analysis', 'sql'])
            
        # הסקה לפי חברה
        if candidate.current_company:
            company_lower = candidate.current_company.lower()
            if company_lower in self.israeli_companies:
                inferred.append('israeli tech ecosystem')
                
        return list(set(inferred))
        
    def extract_seniority(self, title: Optional[str]) -> str:
        """חילוץ רמת בכירות מתפקיד"""
        if not title:
            return "unknown"
            
        title_lower = title.lower()
        
        if any(word in title_lower for word in ['cto', 'vp', 'vice president', 'chief']):
            return "executive"
        elif any(word in title_lower for word in ['director', 'head of']):
            return "director"
        elif any(word in title_lower for word in ['principal', 'staff', 'architect']):
            return "principal"
        elif any(word in title_lower for word in ['senior', 'lead']):
            return "senior"
        elif any(word in title_lower for word in ['junior', 'entry']):
            return "junior"
        else:
            return "mid-level"
            
    def estimate_experience(self, candidate: EnrichedCandidate) -> int:
        """הערכת שנות ניסיון"""
        # בסיס על רמת בכירות
        seniority_years = {
            'executive': 15,
            'director': 12,
            'principal': 10,
            'senior': 5,
            'mid-level': 3,
            'junior': 1,
            'unknown': 0
        }
        
        base_years = seniority_years.get(candidate.seniority_level, 0)
        
        # התאמה לפי גיל החשבון ב-GitHub
        if candidate.github_url:
            # כאן אפשר להוסיף לוגיקה לחישוב גיל החשבון
            pass
            
        return base_years
        
    def generate_smart_tags(self, candidate: EnrichedCandidate) -> List[str]:
        """יצירת תגיות חכמות"""
        tags = []
        
        # תגיות מיקום
        if candidate.location:
            location_lower = candidate.location.lower()
            if any(city in location_lower for city in ['tel aviv', 'תל אביב']):
                tags.append('tel-aviv-tech')
            if 'israel' in location_lower or 'ישראל' in location_lower:
                tags.append('israeli-talent')
                
        # תגיות טכנולוגיה
        for skill in candidate.verified_skills:
            if skill in ['react', 'angular', 'vue']:
                tags.append('frontend-specialist')
            elif skill in ['python', 'django', 'flask']:
                tags.append('python-developer')
            elif skill in ['kubernetes', 'docker']:
                tags.append('devops-engineer')
                
        # תגיות בכירות
        if candidate.seniority_level in ['senior', 'principal', 'director']:
            tags.append('experienced-hire')
            
        # תגיות מקור
        for source in candidate.sources:
            if 'github' in source.lower():
                tags.append('open-source-contributor')
            elif 'linkedin' in source.lower():
                tags.append('linkedin-active')
                
        return list(set(tags))
        
    def calculate_data_quality(self, candidate: EnrichedCandidate) -> float:
        """חישוב ציון איכות נתונים"""
        score = 0.0
        total_fields = 10
        
        # שדות חובה
        if candidate.name:
            score += 1
        if candidate.email:
            score += 1
        if candidate.phone:
            score += 0.5
        if candidate.location:
            score += 0.5
        if candidate.linkedin_url:
            score += 1
        if candidate.github_url:
            score += 1
        if candidate.current_title:
            score += 1
        if candidate.current_company:
            score += 1
        if len(candidate.verified_skills) > 0:
            score += 1
        if len(candidate.tags) > 0:
            score += 1
            
        return score / total_fields
        
    def enrich_from_github(self, candidate: EnrichedCandidate) -> EnrichedCandidate:
        """העשרה מ-GitHub API"""
        try:
            # חילוץ username מ-URL
            username = candidate.github_url.split('/')[-1]
            
            # כאן אפשר להוסיף קריאה ל-GitHub API
            # לצורך הדגמה, נוסיף ערכים דמה
            candidate.github_stars = np.random.randint(0, 1000)
            
            # הוספת תג אם יש הרבה כוכבים
            if candidate.github_stars > 100:
                if 'github-influencer' not in candidate.tags:
                    candidate.tags.append('github-influencer')
                    
        except Exception as e:
            logger.error(f"Error enriching from GitHub: {e}")
            
        return candidate
        
    def clean_name(self, name: str) -> str:
        """ניקוי שם"""
        if not name:
            return ""
        # הסרת תווים מיוחדים
        name = re.sub(r'[^\w\s\-\']', '', name)
        # תיקון רווחים
        name = ' '.join(name.split())
        return name.title()
        
    def normalize_email(self, email: str) -> Optional[str]:
        """נרמול כתובת מייל"""
        if not email:
            return None
        email = email.lower().strip()
        # בדיקת תקינות בסיסית
        if '@' in email and '.' in email.split('@')[1]:
            return email
        return None
        
    def normalize_phone(self, phone: str) -> Optional[str]:
        """נרמול מספר טלפון"""
        if not phone:
            return None
        try:
            # ניסיון לפרסר כמספר ישראלי
            parsed = phonenumbers.parse(phone, "IL")
            if phonenumbers.is_valid_number(parsed):
                return phonenumbers.format_number(
                    parsed, 
                    phonenumbers.PhoneNumberFormat.INTERNATIONAL
                )
        except:
            pass
        return None
        
    def normalize_location(self, location: str) -> Optional[str]:
        """נרמול מיקום"""
        if not location:
            return None
            
        # מיפוי שמות ערים
        location_map = {
            'tlv': 'Tel Aviv',
            'jerusalem': 'Jerusalem',
            'haifa': 'Haifa',
            'תל אביב': 'Tel Aviv',
            'ירושלים': 'Jerusalem',
            'חיפה': 'Haifa'
        }
        
        location_lower = location.lower().strip()
        
        for key, value in location_map.items():
            if key in location_lower:
                return value
                
        return location.title()
        
    def normalize_linkedin_url(self, url: str) -> str:
        """נרמול URL של LinkedIn"""
        if not url:
            return ""
        # הסרת פרמטרים מיותרים
        url = url.split('?')[0]
        # הסרת / בסוף
        url = url.rstrip('/')
        return url.lower()
        
    def extract_skills(self, row) -> List[str]:
        """חילוץ כישורים מ-row"""
        skills = []
        
        # מקורות אפשריים לכישורים
        skill_fields = ['skills', 'technologies', 'expertise', 'tech_stack']
        
        for field in skill_fields:
            if field in row and row[field]:
                if isinstance(row[field], str):
                    # פיצול לפי פסיקים או נקודה-פסיק
                    field_skills = re.split(r'[,;]', row[field])
                    skills.extend([s.strip() for s in field_skills if s.strip()])
                elif isinstance(row[field], list):
                    skills.extend(row[field])
                    
        # ניקוי וייחוד
        skills = list(set([s.lower().strip() for s in skills if s]))
        
        return skills
        
    def save_database(self):
        """שמירת המאגר המעודכן"""
        # איחוד מועמדים קיימים וחדשים
        all_candidates = list(self.existing_candidates.values()) + self.new_candidates
        
        # המרה ל-dict לשמירה
        data = []
        for candidate in all_candidates:
            candidate_dict = asdict(candidate)
            # המרת datetime לstring
            candidate_dict['created_at'] = candidate.created_at.isoformat()
            candidate_dict['updated_at'] = candidate.updated_at.isoformat()
            data.append(candidate_dict)
            
        # שמירה ל-JSON
        output_file = f'candidates_master_database_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        logger.info(f"Saved {len(all_candidates)} candidates to {output_file}")
        
        # יצירת דוח סיכום
        self.generate_report(all_candidates)
        
    def generate_report(self, all_candidates: List[EnrichedCandidate]):
        """יצירת דוח סיכום"""
        report = {
            'summary': {
                'total_candidates': len(all_candidates),
                'new_candidates': len(self.new_candidates),
                'duplicates_found': self.duplicates_found,
                'enriched_candidates': self.enriched_count
            },
            'quality_metrics': {
                'avg_data_quality': np.mean([c.data_quality_score for c in all_candidates]),
                'high_quality_candidates': sum(1 for c in all_candidates if c.data_quality_score > 0.8),
                'verified_skills_coverage': sum(1 for c in all_candidates if len(c.verified_skills) > 0) / len(all_candidates)
            },
            'skill_distribution': self.analyze_skills(all_candidates),
            'seniority_distribution': self.analyze_seniority(all_candidates),
            'source_distribution': self.analyze_sources(all_candidates),
            'location_distribution': self.analyze_locations(all_candidates)
        }
        
        # שמירת הדוח
        report_file = f'integration_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
            
        # הדפסת סיכום
        logger.info("\n" + "="*50)
        logger.info("INTEGRATION SUMMARY")
        logger.info("="*50)
        logger.info(f"Total candidates: {report['summary']['total_candidates']}")
        logger.info(f"New candidates added: {report['summary']['new_candidates']}")
        logger.info(f"Duplicates merged: {report['summary']['duplicates_found']}")
        logger.info(f"Candidates enriched: {report['summary']['enriched_candidates']}")
        logger.info(f"Average data quality: {report['quality_metrics']['avg_data_quality']:.2%}")
        logger.info("="*50)
        
    def analyze_skills(self, candidates: List[EnrichedCandidate]) -> Dict:
        """ניתוח התפלגות כישורים"""
        skill_count = defaultdict(int)
        
        for candidate in candidates:
            for skill in candidate.verified_skills:
                skill_count[skill] += 1
                
        # Top 20 skills
        top_skills = sorted(skill_count.items(), key=lambda x: x[1], reverse=True)[:20]
        
        return {
            'top_skills': dict(top_skills),
            'total_unique_skills': len(skill_count)
        }
        
    def analyze_seniority(self, candidates: List[EnrichedCandidate]) -> Dict:
        """ניתוח התפלגות בכירות"""
        seniority_count = defaultdict(int)
        
        for candidate in candidates:
            seniority_count[candidate.seniority_level] += 1
            
        return dict(seniority_count)
        
    def analyze_sources(self, candidates: List[EnrichedCandidate]) -> Dict:
        """ניתוח מקורות"""
        source_count = defaultdict(int)
        
        for candidate in candidates:
            for source in candidate.sources:
                source_count[source] += 1
                
        return dict(source_count)
        
    def analyze_locations(self, candidates: List[EnrichedCandidate]) -> Dict:
        """ניתוח מיקומים"""
        location_count = defaultdict(int)
        
        for candidate in candidates:
            if candidate.location:
                location_count[candidate.location] += 1
                
        # Top 10 locations
        top_locations = sorted(location_count.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return dict(top_locations)

def main():
    """פונקציה ראשית"""
    integrator = CandidateIntegrator()
    
    # רשימת קבצים לעיבוד
    files_to_process = [
        'candidates_multi_platform_*.csv',
        'candidates_discord_*.csv',
        'imported_candidates_*.csv',
        'frontend_candidates.csv',
        'kubernetes_engineers.csv'
    ]
    
    # עיבוד כל הקבצים
    import glob
    for pattern in files_to_process:
        for file_path in glob.glob(pattern):
            if os.path.exists(file_path):
                integrator.process_candidates_file(file_path)
                
    # שמירת המאגר המאוחד
    integrator.save_database()
    
    logger.info("\n✅ Integration completed successfully!")

if __name__ == "__main__":
    main() 