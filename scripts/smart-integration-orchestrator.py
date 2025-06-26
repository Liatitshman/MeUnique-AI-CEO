#!/usr/bin/env python3
"""
Smart Integration Orchestrator
מנהל אינטגרציה חכם לכל מקורות המידע
"""

import asyncio
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple
import pandas as pd
import numpy as np
from collections import defaultdict
import logging
import schedule
import time
from dataclasses import dataclass, asdict
import subprocess

# הגדרת לוגינג
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('smart_integration.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class IntegrationTask:
    """משימת אינטגרציה"""
    name: str
    script: str
    priority: int
    frequency: str  # 'daily', 'weekly', 'hourly'
    last_run: Optional[datetime] = None
    success_count: int = 0
    failure_count: int = 0
    average_runtime: float = 0.0
    
class SmartIntegrationOrchestrator:
    """מנהל אינטגרציה חכם"""
    
    def __init__(self):
        self.tasks = self.initialize_tasks()
        self.running_tasks: Set[str] = set()
        self.results_cache: Dict[str, Dict] = {}
        self.api_limits = self.load_api_limits()
        self.database_path = "👑_CEO-System/🤖_Agents/🏪_7-Stores/💾_Smart-Database/"
        
    def initialize_tasks(self) -> List[IntegrationTask]:
        """אתחול משימות"""
        return [
            IntegrationTask(
                name="LinkedIn Network Analysis",
                script="scripts/linkedin-network-analyzer.py",
                priority=1,
                frequency="daily"
            ),
            IntegrationTask(
                name="Sales Navigator Export",
                script="scripts/auto-sales-ql-export.js",
                priority=2,
                frequency="daily"
            ),
            IntegrationTask(
                name="Multi-Platform Scraping",
                script="scripts/advanced-platform-scraper.py",
                priority=3,
                frequency="weekly"
            ),
            IntegrationTask(
                name="Discord Communities",
                script="scripts/discord-smart-scraper.py",
                priority=4,
                frequency="daily"
            ),
            IntegrationTask(
                name="Company Research",
                script="scripts/company-employees-mapper.py",
                priority=5,
                frequency="weekly"
            ),
            IntegrationTask(
                name="Database Integration",
                script="scripts/integrate-candidates-to-database.py",
                priority=6,
                frequency="hourly"
            ),
            IntegrationTask(
                name="Cost Monitoring",
                script="scripts/cost-monitoring-dashboard.py",
                priority=7,
                frequency="hourly"
            )
        ]
        
    def load_api_limits(self) -> Dict[str, Dict]:
        """טעינת מגבלות API"""
        return {
            'linkedin': {
                'daily_limit': 1000,
                'hourly_limit': 100,
                'current_usage': 0
            },
            'sales_navigator': {
                'daily_limit': 2500,
                'export_limit': 100,
                'current_usage': 0
            },
            'github': {
                'hourly_limit': 5000,
                'current_usage': 0
            },
            'openai': {
                'monthly_budget': 50,
                'current_cost': 0
            }
        }
        
    async def run_orchestration(self):
        """הרצת תהליך האורקסטרציה"""
        logger.info("🎼 Starting Smart Integration Orchestrator")
        
        # הגדרת לוח זמנים
        self.setup_schedule()
        
        # לולאת ריצה ראשית
        while True:
            try:
                # בדיקת משימות מתוזמנות
                schedule.run_pending()
                
                # בדיקת משימות דחופות
                urgent_tasks = self.check_urgent_tasks()
                if urgent_tasks:
                    await self.execute_tasks(urgent_tasks)
                    
                # ניתוח תוצאות וחיבורים
                await self.analyze_and_connect()
                
                # עדכון דשבורד
                self.update_dashboard()
                
                # המתנה קצרה
                await asyncio.sleep(60)  # בדיקה כל דקה
                
            except KeyboardInterrupt:
                logger.info("Orchestration stopped by user")
                break
            except Exception as e:
                logger.error(f"Orchestration error: {e}")
                await asyncio.sleep(300)  # המתנה 5 דקות במקרה של שגיאה
                
    def setup_schedule(self):
        """הגדרת לוח זמנים"""
        for task in self.tasks:
            if task.frequency == 'hourly':
                schedule.every().hour.do(lambda t=task: asyncio.create_task(self.run_task(t)))
            elif task.frequency == 'daily':
                schedule.every().day.at("09:00").do(lambda t=task: asyncio.create_task(self.run_task(t)))
            elif task.frequency == 'weekly':
                schedule.every().monday.at("10:00").do(lambda t=task: asyncio.create_task(self.run_task(t)))
                
    async def run_task(self, task: IntegrationTask):
        """הרצת משימה בודדת"""
        if task.name in self.running_tasks:
            logger.warning(f"Task {task.name} is already running, skipping")
            return
            
        self.running_tasks.add(task.name)
        start_time = datetime.now()
        
        try:
            logger.info(f"🚀 Running task: {task.name}")
            
            # בדיקת מגבלות API
            if not self.check_api_limits(task):
                logger.warning(f"API limits reached for {task.name}, postponing")
                return
                
            # הרצת הסקריפט
            if task.script.endswith('.py'):
                result = await self.run_python_script(task.script)
            elif task.script.endswith('.js'):
                result = await self.run_node_script(task.script)
            else:
                logger.error(f"Unknown script type: {task.script}")
                return
                
            # עדכון סטטיסטיקות
            runtime = (datetime.now() - start_time).total_seconds()
            task.last_run = datetime.now()
            task.success_count += 1
            task.average_runtime = (task.average_runtime * (task.success_count - 1) + runtime) / task.success_count
            
            # שמירת תוצאות
            self.results_cache[task.name] = {
                'timestamp': datetime.now().isoformat(),
                'runtime': runtime,
                'result': result
            }
            
            logger.info(f"✅ Task {task.name} completed in {runtime:.2f} seconds")
            
        except Exception as e:
            logger.error(f"❌ Task {task.name} failed: {e}")
            task.failure_count += 1
            
        finally:
            self.running_tasks.remove(task.name)
            
    async def run_python_script(self, script_path: str) -> Dict:
        """הרצת סקריפט Python"""
        process = await asyncio.create_subprocess_exec(
            sys.executable, script_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"Script failed: {stderr.decode()}")
            
        # ניסיון לפרסר את הפלט כ-JSON
        try:
            return json.loads(stdout.decode())
        except:
            return {'output': stdout.decode()}
            
    async def run_node_script(self, script_path: str) -> Dict:
        """הרצת סקריפט Node.js"""
        process = await asyncio.create_subprocess_exec(
            'node', script_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"Script failed: {stderr.decode()}")
            
        # ניסיון לפרסר את הפלט כ-JSON
        try:
            return json.loads(stdout.decode())
        except:
            return {'output': stdout.decode()}
            
    def check_api_limits(self, task: IntegrationTask) -> bool:
        """בדיקת מגבלות API"""
        # בדיקה לפי סוג המשימה
        if 'linkedin' in task.script.lower():
            limit_info = self.api_limits['linkedin']
            return limit_info['current_usage'] < limit_info['daily_limit']
            
        elif 'sales' in task.script.lower():
            limit_info = self.api_limits['sales_navigator']
            return limit_info['current_usage'] < limit_info['daily_limit']
            
        return True  # אין מגבלה למשימות אחרות
        
    def check_urgent_tasks(self) -> List[IntegrationTask]:
        """בדיקת משימות דחופות"""
        urgent = []
        
        for task in self.tasks:
            # משימה שלא רצה מזמן
            if task.last_run is None:
                urgent.append(task)
            elif task.frequency == 'hourly' and (datetime.now() - task.last_run) > timedelta(hours=2):
                urgent.append(task)
            elif task.frequency == 'daily' and (datetime.now() - task.last_run) > timedelta(days=2):
                urgent.append(task)
                
        return sorted(urgent, key=lambda x: x.priority)
        
    async def execute_tasks(self, tasks: List[IntegrationTask]):
        """הרצת מספר משימות"""
        # הרצה מקבילית של משימות
        await asyncio.gather(*[self.run_task(task) for task in tasks])
        
    async def analyze_and_connect(self):
        """ניתוח וחיבור נתונים"""
        logger.info("🔗 Analyzing and connecting data...")
        
        # טעינת כל הנתונים החדשים
        new_candidates = await self.load_new_candidates()
        new_companies = await self.load_new_companies()
        
        # הצלבת נתונים
        connections = self.cross_reference_data(new_candidates, new_companies)
        
        # עדכון תיוגים וקטגוריות
        self.update_tags_and_categories(connections)
        
        # שמירה למאגר המרכזי
        await self.save_to_smart_database(connections)
        
        # יצירת המלצות
        recommendations = self.generate_smart_recommendations(connections)
        
        # שליחה לסוכנים רלוונטיים
        await self.notify_agents(recommendations)
        
    async def load_new_candidates(self) -> List[Dict]:
        """טעינת מועמדים חדשים"""
        candidates = []
        
        # חיפוש קבצי CSV חדשים
        for file in os.listdir('.'):
            if file.endswith('.csv') and 'candidates' in file:
                df = pd.read_csv(file)
                candidates.extend(df.to_dict('records'))
                
        return candidates
        
    async def load_new_companies(self) -> List[Dict]:
        """טעינת חברות חדשות"""
        companies = []
        
        # חיפוש קבצי נתונים
        for file in os.listdir('.'):
            if file.endswith('.csv') and 'companies' in file:
                df = pd.read_csv(file)
                companies.extend(df.to_dict('records'))
                
        return companies
        
    def cross_reference_data(self, candidates: List[Dict], companies: List[Dict]) -> Dict:
        """הצלבת נתונים"""
        connections = {
            'candidate_company_matches': [],
            'skill_clusters': defaultdict(list),
            'location_groups': defaultdict(list),
            'seniority_levels': defaultdict(list)
        }
        
        # יצירת מפתחות לחיפוש מהיר
        company_dict = {c['name'].lower(): c for c in companies if 'name' in c}
        
        for candidate in candidates:
            # התאמה לחברה
            if 'current_company' in candidate:
                company_key = candidate['current_company'].lower()
                if company_key in company_dict:
                    connections['candidate_company_matches'].append({
                        'candidate': candidate,
                        'company': company_dict[company_key],
                        'match_strength': self.calculate_match_strength(candidate, company_dict[company_key])
                    })
                    
            # קיבוץ לפי כישורים
            if 'skills' in candidate:
                for skill in candidate['skills']:
                    connections['skill_clusters'][skill].append(candidate)
                    
            # קיבוץ לפי מיקום
            if 'location' in candidate:
                connections['location_groups'][candidate['location']].append(candidate)
                
            # קיבוץ לפי רמת בכירות
            seniority = self.extract_seniority(candidate.get('title', ''))
            connections['seniority_levels'][seniority].append(candidate)
            
        return connections
        
    def calculate_match_strength(self, candidate: Dict, company: Dict) -> float:
        """חישוב חוזק ההתאמה"""
        score = 0.0
        
        # התאמת כישורים לטכנולוגיות החברה
        if 'skills' in candidate and 'tech_stack' in company:
            matching_skills = set(candidate['skills']) & set(company['tech_stack'])
            score += len(matching_skills) * 0.2
            
        # התאמת מיקום
        if candidate.get('location') == company.get('location'):
            score += 0.3
            
        # התאמת גודל חברה להעדפות
        if 'preferred_company_size' in candidate:
            if self.match_company_size(candidate['preferred_company_size'], company.get('size')):
                score += 0.2
                
        return min(score, 1.0)
        
    def extract_seniority(self, title: str) -> str:
        """חילוץ רמת בכירות מתואר"""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ['cto', 'ceo', 'vp', 'chief']):
            return 'executive'
        elif any(word in title_lower for word in ['director', 'head of', 'manager']):
            return 'management'
        elif any(word in title_lower for word in ['senior', 'lead', 'principal']):
            return 'senior'
        elif any(word in title_lower for word in ['junior', 'intern']):
            return 'junior'
        else:
            return 'mid-level'
            
    def update_tags_and_categories(self, connections: Dict):
        """עדכון תיוגים וקטגוריות"""
        # תיוג מועמדים hot
        for match in connections['candidate_company_matches']:
            if match['match_strength'] > 0.8:
                match['candidate']['tags'] = match['candidate'].get('tags', [])
                match['candidate']['tags'].append('hot-candidate')
                
        # תיוג skill experts
        for skill, candidates in connections['skill_clusters'].items():
            if len(candidates) < 10:  # כישור נדיר
                for candidate in candidates:
                    candidate['tags'] = candidate.get('tags', [])
                    candidate['tags'].append(f'rare-skill-{skill}')
                    
    async def save_to_smart_database(self, connections: Dict):
        """שמירה למאגר החכם"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # שמירת קשרים
        with open(f"{self.database_path}connections_{timestamp}.json", 'w', encoding='utf-8') as f:
            json.dump(connections, f, ensure_ascii=False, indent=2)
            
        # עדכון אינדקס ראשי
        await self.update_master_index(connections)
        
    async def update_master_index(self, connections: Dict):
        """עדכון אינדקס ראשי"""
        index_file = f"{self.database_path}master_index.json"
        
        # טעינת אינדקס קיים
        if os.path.exists(index_file):
            with open(index_file, 'r', encoding='utf-8') as f:
                master_index = json.load(f)
        else:
            master_index = {
                'candidates': {},
                'companies': {},
                'skills': {},
                'last_updated': None
            }
            
        # עדכון נתונים
        for match in connections['candidate_company_matches']:
            candidate = match['candidate']
            if 'id' in candidate:
                master_index['candidates'][candidate['id']] = {
                    'name': candidate.get('name'),
                    'company': candidate.get('current_company'),
                    'skills': candidate.get('skills', []),
                    'last_seen': datetime.now().isoformat()
                }
                
        master_index['last_updated'] = datetime.now().isoformat()
        
        # שמירה
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(master_index, f, ensure_ascii=False, indent=2)
            
    def generate_smart_recommendations(self, connections: Dict) -> List[Dict]:
        """יצירת המלצות חכמות"""
        recommendations = []
        
        # המלצה 1: מועמדים חמים
        hot_candidates = [
            m for m in connections['candidate_company_matches']
            if m['match_strength'] > 0.8
        ]
        
        if hot_candidates:
            recommendations.append({
                'type': 'hot_candidates',
                'priority': 'high',
                'count': len(hot_candidates),
                'action': 'immediate_outreach',
                'candidates': hot_candidates[:10]
            })
            
        # המלצה 2: מאגרי כישרונות חדשים
        for skill, candidates in connections['skill_clusters'].items():
            if len(candidates) > 20:  # מאגר גדול
                recommendations.append({
                    'type': 'talent_pool',
                    'skill': skill,
                    'size': len(candidates),
                    'action': 'create_targeted_campaign'
                })
                
        # המלצה 3: חברות מטרה חדשות
        company_candidates = defaultdict(int)
        for match in connections['candidate_company_matches']:
            company_candidates[match['company']['name']] += 1
            
        for company, count in company_candidates.items():
            if count > 10:
                recommendations.append({
                    'type': 'target_company',
                    'company': company,
                    'candidate_count': count,
                    'action': 'company_focused_strategy'
                })
                
        return recommendations
        
    async def notify_agents(self, recommendations: List[Dict]):
        """הודעה לסוכנים רלוונטיים"""
        for rec in recommendations:
            if rec['type'] == 'hot_candidates':
                # הודעה ל-Auto Recruiter
                await self.send_to_agent('auto-recruiter', rec)
                
            elif rec['type'] == 'talent_pool':
                # הודעה ל-Talent Sourcer
                await self.send_to_agent('talent-sourcer', rec)
                
            elif rec['type'] == 'target_company':
                # הודעה ל-Profile Analyzer
                await self.send_to_agent('profile-analyzer', rec)
                
    async def send_to_agent(self, agent_name: str, data: Dict):
        """שליחת נתונים לסוכן"""
        # כאן צריך implementation של תקשורת עם הסוכנים
        logger.info(f"Sending recommendation to {agent_name}: {data['type']}")
        
    def update_dashboard(self):
        """עדכון דשבורד"""
        dashboard_data = {
            'timestamp': datetime.now().isoformat(),
            'tasks': [
                {
                    'name': task.name,
                    'last_run': task.last_run.isoformat() if task.last_run else None,
                    'success_rate': task.success_count / (task.success_count + task.failure_count) if (task.success_count + task.failure_count) > 0 else 0,
                    'average_runtime': task.average_runtime
                }
                for task in self.tasks
            ],
            'api_usage': self.api_limits,
            'recent_results': list(self.results_cache.values())[-10:]  # Last 10 results
        }
        
        with open('integration_dashboard.json', 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, ensure_ascii=False, indent=2)
            
        logger.info("📊 Dashboard updated")
        
    def match_company_size(self, preferred: str, actual: str) -> bool:
        """התאמת גודל חברה"""
        if not preferred or not actual:
            return False
            
        size_map = {
            'startup': ['1-50', '51-100'],
            'mid-size': ['100-500', '500-1000'],
            'enterprise': ['1000+', '5000+']
        }
        
        for pref_key in size_map:
            if pref_key in preferred.lower():
                return actual in size_map[pref_key]
                
        return False

async def main():
    """פונקציה ראשית"""
    orchestrator = SmartIntegrationOrchestrator()
    
    logger.info("🎭 Smart Integration Orchestrator Started")
    logger.info(f"Managing {len(orchestrator.tasks)} integration tasks")
    
    # הרצת האורקסטרציה
    await orchestrator.run_orchestration()

if __name__ == "__main__":
    asyncio.run(main()) 