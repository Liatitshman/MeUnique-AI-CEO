#!/usr/bin/env python3
"""
Advanced Platform Scraper - Multiple Sources
סקרייפינג מתקדם ממקורות מרובים
"""

import json
import os
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional, Set
import pandas as pd
import logging
from dataclasses import dataclass, asdict
from bs4 import BeautifulSoup
import re
from collections import defaultdict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CompanyInfo:
    """מידע על חברה"""
    name: str
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    founded: Optional[int] = None
    funding_total: Optional[float] = None
    tech_stack: List[str] = None
    open_positions: List[str] = None
    glassdoor_rating: Optional[float] = None
    
    def __post_init__(self):
        if self.tech_stack is None:
            self.tech_stack = []
        if self.open_positions is None:
            self.open_positions = []

@dataclass
class EnhancedCandidate:
    """מועמד מועשר עם מידע ממקורות מרובים"""
    id: str
    name: str
    email: Optional[str] = None
    current_company: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = None
    sources: Dict[str, Dict] = None  # platform -> profile_data
    activity_score: float = 0.0
    tags: List[str] = None
    
    def __post_init__(self):
        if self.skills is None:
            self.skills = []
        if self.sources is None:
            self.sources = {}
        if self.tags is None:
            self.tags = []

class AdvancedPlatformScraper:
    """סקרייפר מתקדם למקורות מרובים"""
    
    def __init__(self):
        self.session = None
        self.companies: Dict[str, CompanyInfo] = {}
        self.candidates: Dict[str, EnhancedCandidate] = {}
        self.job_postings: List[Dict] = []
        
        # API keys
        self.api_keys = {
            'crunchbase': os.getenv('CRUNCHBASE_API_KEY'),
            'glassdoor': os.getenv('GLASSDOOR_API_KEY'),
            'producthunt': os.getenv('PRODUCTHUNT_TOKEN'),
            'slack': os.getenv('SLACK_TOKEN')
        }
        
    async def scrape_all_sources(self):
        """סקרייפינג מכל המקורות"""
        logger.info("🚀 Starting advanced multi-source scraping")
        
        tasks = [
            self.scrape_startup_nation(),
            self.scrape_crunchbase_free(),
            self.scrape_product_hunt(),
            self.scrape_slack_communities(),
            self.scrape_glassdoor_companies(),
            self.scrape_angellist(),
            self.scrape_wellfound(),
            self.scrape_israeli_tech_forums()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # סיכום
        self.generate_comprehensive_report()
        
    async def scrape_startup_nation(self):
        """סקרייפינג מ-Start-Up Nation Finder"""
        logger.info("🇮🇱 Scraping Start-Up Nation Finder...")
        
        base_url = "https://finder.startupnationcentral.org"
        
        async with aiohttp.ClientSession() as session:
            # חיפוש חברות ישראליות
            categories = ['cybersecurity', 'fintech', 'healthtech', 'enterprise', 'devtools']
            
            for category in categories:
                try:
                    # API endpoint (if available) or web scraping
                    url = f"{base_url}/companies?category={category}"
                    
                    async with session.get(url) as response:
                        if response.status == 200:
                            html = await response.text()
                            soup = BeautifulSoup(html, 'html.parser')
                            
                            # חילוץ חברות
                            companies = self.extract_startup_nation_companies(soup)
                            
                            for company_data in companies:
                                company = CompanyInfo(
                                    name=company_data['name'],
                                    website=company_data.get('website'),
                                    industry=category,
                                    size=company_data.get('employees'),
                                    founded=company_data.get('founded_year')
                                )
                                
                                self.companies[company.name] = company
                                
                                # חיפוש עובדים בלינקדאין
                                await self.find_company_employees(company.name)
                                
                except Exception as e:
                    logger.error(f"Error scraping Start-Up Nation {category}: {e}")
                    
        logger.info(f"✅ Found {len(self.companies)} Israeli companies")
        
    async def scrape_crunchbase_free(self):
        """סקרייפינג מידע חינמי מ-Crunchbase"""
        logger.info("💰 Scraping Crunchbase (free data)...")
        
        # רשימת חברות ישראליות מובילות
        target_companies = [
            'wiz', 'monday-com', 'gong', 'snyk', 'wix', 'fiverr',
            'taboola', 'outbrain', 'similarweb', 'ironsource'
        ]
        
        async with aiohttp.ClientSession() as session:
            for company_slug in target_companies:
                try:
                    url = f"https://www.crunchbase.com/organization/{company_slug}"
                    
                    async with session.get(url) as response:
                        if response.status == 200:
                            html = await response.text()
                            soup = BeautifulSoup(html, 'html.parser')
                            
                            # חילוץ מידע בסיסי
                            company_info = self.extract_crunchbase_info(soup, company_slug)
                            
                            if company_info:
                                self.companies[company_info.name] = company_info
                                
                except Exception as e:
                    logger.error(f"Error scraping Crunchbase for {company_slug}: {e}")
                    
                await asyncio.sleep(2)  # כיבוד rate limits
                
    async def scrape_product_hunt(self):
        """סקרייפינג מ-Product Hunt"""
        logger.info("🚀 Scraping Product Hunt...")
        
        # חיפוש מוצרים ישראליים או של חברות ישראליות
        israeli_makers = []
        
        async with aiohttp.ClientSession() as session:
            # חיפוש לפי תגיות
            tags = ['israel', 'tel-aviv', 'israeli-startup']
            
            for tag in tags:
                try:
                    url = f"https://www.producthunt.com/topics/{tag}"
                    
                    async with session.get(url) as response:
                        if response.status == 200:
                            html = await response.text()
                            makers = self.extract_product_hunt_makers(html)
                            israeli_makers.extend(makers)
                            
                except Exception as e:
                    logger.error(f"Error scraping Product Hunt {tag}: {e}")
                    
        logger.info(f"✅ Found {len(israeli_makers)} makers on Product Hunt")
        
    async def scrape_slack_communities(self):
        """סקרייפינג מקהילות Slack (עם הרשאות)"""
        logger.info("💬 Analyzing Slack communities...")
        
        # רשימת קהילות Slack ישראליות
        slack_communities = [
            'israel-tech-community',
            'startup-israel',
            'react-israel',
            'python-israel',
            'devops-israel'
        ]
        
        if self.api_keys['slack']:
            # שימוש ב-Slack API
            for community in slack_communities:
                try:
                    # כאן צריך implementation עם Slack API
                    # לחיפוש משתמשים פעילים ומומחים
                    pass
                except Exception as e:
                    logger.error(f"Error accessing Slack {community}: {e}")
        else:
            logger.warning("No Slack token provided")
            
    async def scrape_glassdoor_companies(self):
        """סקרייפינג דירוגי חברות מ-Glassdoor"""
        logger.info("⭐ Scraping Glassdoor ratings...")
        
        for company_name in self.companies.keys():
            try:
                # חיפוש דירוג החברה
                rating = await self.get_glassdoor_rating(company_name)
                if rating:
                    self.companies[company_name].glassdoor_rating = rating
                    
            except Exception as e:
                logger.error(f"Error getting Glassdoor rating for {company_name}: {e}")
                
    async def scrape_angellist(self):
        """סקרייפינג מ-AngelList"""
        logger.info("👼 Scraping AngelList...")
        
        # חיפוש startups ישראליים
        async with aiohttp.ClientSession() as session:
            try:
                # AngelList API או web scraping
                url = "https://angel.co/location/israel"
                
                async with session.get(url) as response:
                    if response.status == 200:
                        html = await response.text()
                        startups = self.extract_angellist_startups(html)
                        
                        for startup in startups:
                            if startup['name'] not in self.companies:
                                self.companies[startup['name']] = CompanyInfo(
                                    name=startup['name'],
                                    website=startup.get('website'),
                                    industry=startup.get('industry'),
                                    size=startup.get('size')
                                )
                                
            except Exception as e:
                logger.error(f"Error scraping AngelList: {e}")
                
    async def scrape_wellfound(self):
        """סקרייפינג מ-Wellfound (formerly AngelList Talent)"""
        logger.info("🔍 Scraping Wellfound...")
        
        # חיפוש משרות בחברות ישראליות
        job_searches = [
            'software-engineer-israel',
            'data-scientist-tel-aviv',
            'product-manager-israel'
        ]
        
        async with aiohttp.ClientSession() as session:
            for search in job_searches:
                try:
                    url = f"https://wellfound.com/jobs/{search}"
                    
                    async with session.get(url) as response:
                        if response.status == 200:
                            html = await response.text()
                            jobs = self.extract_wellfound_jobs(html)
                            self.job_postings.extend(jobs)
                            
                except Exception as e:
                    logger.error(f"Error scraping Wellfound {search}: {e}")
                    
    async def scrape_israeli_tech_forums(self):
        """סקרייפינג מפורומים ישראליים"""
        logger.info("🇮🇱 Scraping Israeli tech forums...")
        
        forums = [
            {
                'name': 'Geektime',
                'url': 'https://www.geektime.co.il',
                'type': 'news'
            },
            {
                'name': 'Dev.to Israel',
                'url': 'https://dev.to/t/israel',
                'type': 'community'
            }
        ]
        
        for forum in forums:
            try:
                await self.scrape_forum(forum)
            except Exception as e:
                logger.error(f"Error scraping {forum['name']}: {e}")
                
    async def find_company_employees(self, company_name: str):
        """חיפוש עובדים של חברה"""
        # כאן צריך לחבר ל-LinkedIn API או Sales Navigator
        # לחיפוש עובדים לפי חברה
        pass
        
    async def cross_reference_data(self):
        """הצלבת מידע בין מקורות"""
        logger.info("🔄 Cross-referencing data across sources...")
        
        # הצלבת מועמדים
        for candidate_id, candidate in self.candidates.items():
            # בדיקה אם המועמד מופיע במספר מקורות
            if len(candidate.sources) > 1:
                candidate.activity_score *= 1.5
                candidate.tags.append('multi-platform-active')
                
            # בדיקה אם עובד בחברה מעניינת
            if candidate.current_company in self.companies:
                company = self.companies[candidate.current_company]
                
                if company.glassdoor_rating and company.glassdoor_rating > 4.0:
                    candidate.tags.append('top-company-employee')
                    
                if company.funding_total and company.funding_total > 50_000_000:
                    candidate.tags.append('well-funded-company')
                    
    def generate_comprehensive_report(self):
        """יצירת דוח מקיף"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        report = {
            'timestamp': timestamp,
            'summary': {
                'companies_found': len(self.companies),
                'candidates_found': len(self.candidates),
                'job_postings': len(self.job_postings)
            },
            'top_companies': self.get_top_companies(),
            'hot_skills': self.analyze_skill_demand(),
            'talent_pools': self.identify_talent_pools(),
            'recommendations': self.generate_sourcing_recommendations()
        }
        
        # שמירת הדוח
        with open(f'comprehensive_sourcing_report_{timestamp}.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
            
        # שמירת נתוני חברות
        companies_df = pd.DataFrame([asdict(c) for c in self.companies.values()])
        companies_df.to_csv(f'companies_database_{timestamp}.csv', index=False)
        
        # שמירת נתוני מועמדים
        candidates_df = pd.DataFrame([asdict(c) for c in self.candidates.values()])
        candidates_df.to_csv(f'enhanced_candidates_{timestamp}.csv', index=False)
        
        logger.info(f"✅ Comprehensive report saved!")
        
    def get_top_companies(self) -> List[Dict]:
        """זיהוי החברות המובילות"""
        scored_companies = []
        
        for name, company in self.companies.items():
            score = 0
            
            # ניקוד לפי גודל
            if company.size:
                if '1000+' in company.size:
                    score += 30
                elif '500-1000' in company.size:
                    score += 20
                elif '100-500' in company.size:
                    score += 10
                    
            # ניקוד לפי מימון
            if company.funding_total:
                score += min(company.funding_total / 1_000_000, 50)  # Max 50 points
                
            # ניקוד לפי דירוג
            if company.glassdoor_rating:
                score += company.glassdoor_rating * 10
                
            # ניקוד לפי משרות פתוחות
            score += len(company.open_positions) * 2
            
            scored_companies.append({
                'name': name,
                'score': score,
                'details': asdict(company)
            })
            
        return sorted(scored_companies, key=lambda x: x['score'], reverse=True)[:20]
        
    def analyze_skill_demand(self) -> Dict[str, int]:
        """ניתוח ביקוש לכישורים"""
        skill_demand = defaultdict(int)
        
        # מהמשרות
        for job in self.job_postings:
            for skill in job.get('required_skills', []):
                skill_demand[skill] += 1
                
        # מהחברות
        for company in self.companies.values():
            for tech in company.tech_stack:
                skill_demand[tech] += 2  # משקל גבוה יותר לטכנולוגיות בשימוש
                
        return dict(sorted(skill_demand.items(), key=lambda x: x[1], reverse=True))
        
    def identify_talent_pools(self) -> List[Dict]:
        """זיהוי מאגרי כישרונות"""
        pools = []
        
        # לפי חברה
        company_pools = defaultdict(list)
        for candidate in self.candidates.values():
            if candidate.current_company:
                company_pools[candidate.current_company].append(candidate.id)
                
        # לפי כישורים
        skill_pools = defaultdict(list)
        for candidate in self.candidates.values():
            for skill in candidate.skills:
                skill_pools[skill].append(candidate.id)
                
        # יצירת המלצות
        for company, candidates in company_pools.items():
            if len(candidates) > 5:
                pools.append({
                    'type': 'company',
                    'name': company,
                    'size': len(candidates),
                    'quality': self.assess_pool_quality(candidates)
                })
                
        return sorted(pools, key=lambda x: x['quality'], reverse=True)
        
    def generate_sourcing_recommendations(self) -> List[str]:
        """יצירת המלצות לסורסינג"""
        recommendations = []
        
        # המלצות לפי ממצאים
        if len(self.companies) > 50:
            recommendations.append(
                f"Focus on top {len([c for c in self.companies.values() if c.glassdoor_rating and c.glassdoor_rating > 4.0])} "
                f"companies with 4+ Glassdoor rating"
            )
            
        hot_skills = self.analyze_skill_demand()
        if hot_skills:
            top_3_skills = list(hot_skills.keys())[:3]
            recommendations.append(
                f"Prioritize candidates with {', '.join(top_3_skills)} skills - highest demand"
            )
            
        # המלצות לפי מקורות
        multi_source_candidates = [
            c for c in self.candidates.values() 
            if len(c.sources) > 2
        ]
        if multi_source_candidates:
            recommendations.append(
                f"Target {len(multi_source_candidates)} multi-platform active candidates first"
            )
            
        return recommendations
        
    # Helper methods
    def extract_startup_nation_companies(self, soup) -> List[Dict]:
        """חילוץ חברות מ-Startup Nation"""
        # Implementation specific to website structure
        return []
        
    def extract_crunchbase_info(self, soup, company_slug: str) -> Optional[CompanyInfo]:
        """חילוץ מידע מ-Crunchbase"""
        # Implementation specific to website structure
        return None
        
    def extract_product_hunt_makers(self, html: str) -> List[Dict]:
        """חילוץ יוצרים מ-Product Hunt"""
        # Implementation specific to website structure
        return []
        
    def extract_angellist_startups(self, html: str) -> List[Dict]:
        """חילוץ סטארטאפים מ-AngelList"""
        # Implementation specific to website structure
        return []
        
    def extract_wellfound_jobs(self, html: str) -> List[Dict]:
        """חילוץ משרות מ-Wellfound"""
        # Implementation specific to website structure
        return []
        
    async def get_glassdoor_rating(self, company_name: str) -> Optional[float]:
        """קבלת דירוג מ-Glassdoor"""
        # Implementation with Glassdoor API or scraping
        return None
        
    async def scrape_forum(self, forum: Dict):
        """סקרייפינג פורום ספציפי"""
        # Implementation specific to forum
        pass
        
    def assess_pool_quality(self, candidate_ids: List[str]) -> float:
        """הערכת איכות מאגר מועמדים"""
        total_score = 0
        
        for cid in candidate_ids:
            candidate = self.candidates.get(cid)
            if candidate:
                total_score += candidate.activity_score
                total_score += len(candidate.skills) * 0.1
                total_score += len(candidate.sources) * 0.2
                
        return total_score / len(candidate_ids) if candidate_ids else 0

async def main():
    """פונקציה ראשית"""
    scraper = AdvancedPlatformScraper()
    
    # הרצת סקרייפינג מכל המקורות
    await scraper.scrape_all_sources()
    
    # הצלבת נתונים
    await scraper.cross_reference_data()
    
    logger.info("\n✅ Advanced scraping completed!")
    logger.info(f"Companies found: {len(scraper.companies)}")
    logger.info(f"Candidates found: {len(scraper.candidates)}")
    logger.info(f"Job postings found: {len(scraper.job_postings)}")

if __name__ == "__main__":
    asyncio.run(main()) 