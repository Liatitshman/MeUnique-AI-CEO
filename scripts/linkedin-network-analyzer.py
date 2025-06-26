#!/usr/bin/env python3
"""
LinkedIn Network Analyzer - Advanced Connection Mapping
ניתוח מתקדם של רשת קשרים בלינקדאין
"""

import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple
import pandas as pd
import numpy as np
from collections import defaultdict, deque
import logging
import asyncio
import aiohttp
from dataclasses import dataclass, asdict
import networkx as nx
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import re

# הגדרת לוגינג
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class LinkedInConnection:
    """מודל קשר בלינקדאין"""
    id: str
    name: str
    headline: str
    degree: int  # 1st, 2nd, 3rd
    company: Optional[str] = None
    location: Optional[str] = None
    profile_url: Optional[str] = None
    mutual_connections: int = 0
    skills: List[str] = None
    tags: List[str] = None
    relevance_score: float = 0.0
    
    def __post_init__(self):
        if self.skills is None:
            self.skills = []
        if self.tags is None:
            self.tags = []

class LinkedInNetworkAnalyzer:
    """מנתח רשת קשרים בלינקדאין"""
    
    def __init__(self, session_cookie: Optional[str] = None):
        self.session_cookie = session_cookie or os.getenv('LINKEDIN_SESSION_COOKIE')
        self.connections_graph = nx.Graph()
        self.connections_data: Dict[str, LinkedInConnection] = {}
        self.analyzed_profiles: Set[str] = set()
        
        # הגדרות חיפוש
        self.target_companies = self.load_target_companies()
        self.target_skills = self.load_target_skills()
        self.target_locations = ['Israel', 'Tel Aviv', 'Jerusalem', 'Haifa']
        
    def load_target_companies(self) -> List[str]:
        """טעינת רשימת חברות יעד"""
        return [
            'Wiz', 'Monday.com', 'Gong', 'Snyk', 'Wix', 'Fiverr',
            'Taboola', 'Outbrain', 'SimilarWeb', 'IronSource',
            'Payoneer', 'Lemonade', 'OrCam', 'Mobileye',
            'Check Point', 'CyberArk', 'Imperva', 'Aqua Security',
            'Orca Security', 'Armis', 'Cato Networks', 'Tipalti',
            'Guesty', 'Bizzabo', 'Sisense', 'Kaltura', 'Playtika'
        ]
        
    def load_target_skills(self) -> Dict[str, List[str]]:
        """טעינת כישורים לפי קטגוריה"""
        return {
            'backend': ['Python', 'Java', 'Go', 'Node.js', 'Kubernetes', 'Docker', 'Microservices'],
            'frontend': ['React', 'Angular', 'Vue.js', 'TypeScript', 'JavaScript', 'Next.js'],
            'devops': ['AWS', 'Azure', 'GCP', 'Terraform', 'Jenkins', 'CI/CD', 'Ansible'],
            'data': ['Machine Learning', 'Data Science', 'SQL', 'Spark', 'Kafka', 'Airflow'],
            'security': ['Cybersecurity', 'SIEM', 'Penetration Testing', 'Cloud Security']
        }
        
    async def analyze_network(self, max_depth: int = 3):
        """ניתוח רשת הקשרים עד עומק מסוים"""
        logger.info(f"🔍 Starting network analysis up to {max_depth} degrees")
        
        # שלב 1: טעינת קשרים מדרגה ראשונה
        first_degree = await self.load_first_degree_connections()
        logger.info(f"Found {len(first_degree)} first-degree connections")
        
        # שלב 2: ניתוח קשרים מדרגה שנייה
        if max_depth >= 2:
            second_degree = await self.analyze_second_degree(first_degree)
            logger.info(f"Found {len(second_degree)} second-degree connections")
            
        # שלב 3: ניתוח קשרים מדרגה שלישית (selective)
        if max_depth >= 3:
            third_degree = await self.analyze_third_degree_selective(second_degree)
            logger.info(f"Found {len(third_degree)} relevant third-degree connections")
            
        # שלב 4: בניית גרף הקשרים
        self.build_connection_graph()
        
        # שלב 5: חישוב relevance scores
        self.calculate_relevance_scores()
        
        # שלב 6: זיהוי clusters וקהילות
        communities = self.identify_communities()
        
        # שלב 7: יצירת המלצות
        recommendations = self.generate_recommendations()
        
        return {
            'total_analyzed': len(self.connections_data),
            'by_degree': self.get_connections_by_degree(),
            'top_companies': self.get_top_companies(),
            'skill_distribution': self.get_skill_distribution(),
            'communities': communities,
            'recommendations': recommendations
        }
        
    async def load_first_degree_connections(self) -> List[LinkedInConnection]:
        """טעינת קשרים מדרגה ראשונה"""
        connections = []
        
        # כאן צריך להשתמש ב-LinkedIn API או Selenium
        # לצורך הדגמה, נטען נתונים מדומים
        
        # במציאות, נשתמש ב-Sales Navigator API או Selenium
        if self.session_cookie:
            connections = await self.fetch_connections_via_api(degree=1)
        else:
            # נתונים לדוגמה
            logger.warning("No session cookie provided, using sample data")
            connections = self.generate_sample_connections(100, degree=1)
            
        # הוספה למאגר
        for conn in connections:
            self.connections_data[conn.id] = conn
            self.connections_graph.add_node(conn.id, **asdict(conn))
            
        return connections
        
    async def analyze_second_degree(self, first_degree: List[LinkedInConnection]) -> List[LinkedInConnection]:
        """ניתוח קשרים מדרגה שנייה"""
        second_degree_connections = []
        
        # עבור כל קשר מדרגה ראשונה
        for connection in first_degree:
            # רק אם הקשר רלוונטי
            if self.is_relevant_connection(connection):
                # טעינת הקשרים שלו
                mutual_connections = await self.get_mutual_connections(connection)
                
                for mutual in mutual_connections:
                    if mutual.id not in self.connections_data:
                        mutual.degree = 2
                        second_degree_connections.append(mutual)
                        self.connections_data[mutual.id] = mutual
                        
                        # הוספת קשר בגרף
                        self.connections_graph.add_node(mutual.id, **asdict(mutual))
                        self.connections_graph.add_edge(connection.id, mutual.id)
                        
        return second_degree_connections
        
    async def analyze_third_degree_selective(self, second_degree: List[LinkedInConnection]) -> List[LinkedInConnection]:
        """ניתוח סלקטיבי של קשרים מדרגה שלישית"""
        third_degree_connections = []
        
        # רק עבור קשרים מדרגה שנייה עם relevance גבוה
        high_value_connections = [
            conn for conn in second_degree 
            if conn.relevance_score > 0.7
        ]
        
        for connection in high_value_connections[:50]:  # מגביל ל-50 הטובים
            extended_network = await self.get_extended_network(connection)
            
            for extended in extended_network:
                if extended.id not in self.connections_data:
                    extended.degree = 3
                    third_degree_connections.append(extended)
                    self.connections_data[extended.id] = extended
                    
                    # הוספת קשר בגרף
                    self.connections_graph.add_node(extended.id, **asdict(extended))
                    self.connections_graph.add_edge(connection.id, extended.id)
                    
        return third_degree_connections
        
    def is_relevant_connection(self, connection: LinkedInConnection) -> bool:
        """בדיקה האם קשר רלוונטי"""
        # בדיקת חברה
        if connection.company:
            for target_company in self.target_companies:
                if target_company.lower() in connection.company.lower():
                    return True
                    
        # בדיקת כישורים
        for skill_category, skills in self.target_skills.items():
            matching_skills = [s for s in connection.skills if s in skills]
            if len(matching_skills) >= 2:
                return True
                
        # בדיקת מיקום
        if connection.location:
            for target_location in self.target_locations:
                if target_location.lower() in connection.location.lower():
                    return True
                    
        # בדיקת headline
        tech_keywords = ['engineer', 'developer', 'architect', 'lead', 'manager', 'data', 'devops']
        headline_lower = connection.headline.lower()
        
        return any(keyword in headline_lower for keyword in tech_keywords)
        
    def calculate_relevance_scores(self):
        """חישוב ציוני רלוונטיות לכל קשר"""
        for conn_id, connection in self.connections_data.items():
            score = 0.0
            
            # ציון לפי דרגה
            degree_scores = {1: 0.3, 2: 0.2, 3: 0.1}
            score += degree_scores.get(connection.degree, 0)
            
            # ציון לפי חברה
            if connection.company:
                for i, target_company in enumerate(self.target_companies):
                    if target_company.lower() in connection.company.lower():
                        score += 0.3 * (1 - i/len(self.target_companies))  # חברות ראשונות ברשימה חשובות יותר
                        break
                        
            # ציון לפי כישורים
            skill_match_score = 0
            for category, skills in self.target_skills.items():
                matching = len([s for s in connection.skills if s in skills])
                skill_match_score = max(skill_match_score, matching * 0.1)
            score += min(skill_match_score, 0.3)
            
            # ציון לפי מספר קשרים משותפים
            if connection.mutual_connections > 0:
                score += min(connection.mutual_connections * 0.02, 0.2)
                
            # ציון לפי מרכזיות ברשת
            if conn_id in self.connections_graph:
                centrality = nx.degree_centrality(self.connections_graph).get(conn_id, 0)
                score += centrality * 0.1
                
            connection.relevance_score = min(score, 1.0)
            
    def identify_communities(self) -> Dict[str, List[str]]:
        """זיהוי קהילות ברשת"""
        communities = {}
        
        # זיהוי קהילות באמצעות אלגוריתם Louvain
        try:
            import community as community_louvain
            partition = community_louvain.best_partition(self.connections_graph)
            
            # ארגון לפי קהילות
            for node, comm_id in partition.items():
                comm_name = f"community_{comm_id}"
                if comm_name not in communities:
                    communities[comm_name] = []
                communities[comm_name].append(node)
                
        except ImportError:
            logger.warning("python-louvain not installed, using basic clustering")
            # Fallback to connected components
            for i, component in enumerate(nx.connected_components(self.connections_graph)):
                communities[f"community_{i}"] = list(component)
                
        # תיוג קהילות לפי מאפיינים
        labeled_communities = {}
        for comm_name, members in communities.items():
            # ניתוח מאפייני הקהילה
            companies = defaultdict(int)
            skills = defaultdict(int)
            
            for member_id in members:
                member = self.connections_data.get(member_id)
                if member:
                    if member.company:
                        companies[member.company] += 1
                    for skill in member.skills:
                        skills[skill] += 1
                        
            # תיוג לפי החברה/כישור הדומיננטי
            if companies:
                top_company = max(companies.items(), key=lambda x: x[1])[0]
                label = f"{top_company}_cluster"
            elif skills:
                top_skill = max(skills.items(), key=lambda x: x[1])[0]
                label = f"{top_skill}_cluster"
            else:
                label = comm_name
                
            labeled_communities[label] = {
                'members': members,
                'size': len(members),
                'top_companies': dict(sorted(companies.items(), key=lambda x: x[1], reverse=True)[:5]),
                'top_skills': dict(sorted(skills.items(), key=lambda x: x[1], reverse=True)[:10])
            }
            
        return labeled_communities
        
    def generate_recommendations(self) -> Dict[str, List[Dict]]:
        """יצירת המלצות חכמות"""
        recommendations = {
            'immediate_outreach': [],  # פנייה מיידית
            'warm_intro_possible': [],  # אפשרות להיכרות חמה
            'community_leaders': [],    # מובילי קהילות
            'hidden_gems': []          # אוצרות חבויים
        }
        
        # 1. מועמדים לפנייה מיידית
        immediate = sorted(
            [c for c in self.connections_data.values() if c.degree <= 2 and c.relevance_score > 0.8],
            key=lambda x: x.relevance_score,
            reverse=True
        )[:20]
        
        for conn in immediate:
            recommendations['immediate_outreach'].append({
                'name': conn.name,
                'company': conn.company,
                'reason': self.get_outreach_reason(conn),
                'mutual_connections': conn.mutual_connections,
                'suggested_approach': self.suggest_approach(conn)
            })
            
        # 2. אפשרויות להיכרות חמה
        for conn_id, connection in self.connections_data.items():
            if connection.degree == 2 and connection.relevance_score > 0.6:
                # מצא את הקשר המתווך
                paths = list(nx.all_shortest_paths(self.connections_graph, 'you', conn_id, cutoff=2))
                if paths:
                    intermediary_id = paths[0][1]
                    intermediary = self.connections_data.get(intermediary_id)
                    
                    if intermediary:
                        recommendations['warm_intro_possible'].append({
                            'target': connection.name,
                            'company': connection.company,
                            'via': intermediary.name,
                            'strength': self.calculate_intro_strength(intermediary, connection)
                        })
                        
        # 3. מובילי קהילות
        centrality = nx.degree_centrality(self.connections_graph)
        community_leaders = sorted(
            [(conn_id, score) for conn_id, score in centrality.items()],
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        for leader_id, centrality_score in community_leaders:
            leader = self.connections_data.get(leader_id)
            if leader and leader.relevance_score > 0.5:
                recommendations['community_leaders'].append({
                    'name': leader.name,
                    'company': leader.company,
                    'influence_score': centrality_score,
                    'connections_count': self.connections_graph.degree(leader_id),
                    'key_connections': self.get_key_connections(leader_id)
                })
                
        # 4. אוצרות חבויים - קשרים עם פוטנציאל גבוה אבל visibility נמוך
        hidden_gems = [
            conn for conn in self.connections_data.values()
            if conn.degree == 3 and 
            conn.relevance_score > 0.7 and
            len([c for c in conn.skills if c in sum(self.target_skills.values(), [])]) >= 3
        ][:10]
        
        for gem in hidden_gems:
            recommendations['hidden_gems'].append({
                'name': gem.name,
                'company': gem.company,
                'unique_skills': [s for s in gem.skills if s in sum(self.target_skills.values(), [])],
                'path_to_reach': self.find_best_path(gem.id)
            })
            
        return recommendations
        
    def get_outreach_reason(self, connection: LinkedInConnection) -> str:
        """יצירת סיבה לפנייה"""
        reasons = []
        
        if connection.company in self.target_companies:
            reasons.append(f"Works at {connection.company}")
            
        matching_skills = [s for s in connection.skills if s in sum(self.target_skills.values(), [])]
        if matching_skills:
            reasons.append(f"Expert in {', '.join(matching_skills[:3])}")
            
        if connection.mutual_connections > 5:
            reasons.append(f"{connection.mutual_connections} mutual connections")
            
        return " | ".join(reasons) if reasons else "High relevance score"
        
    def suggest_approach(self, connection: LinkedInConnection) -> str:
        """הצעת גישה למועמד"""
        if connection.degree == 1:
            return "Direct message - you're already connected"
        elif connection.mutual_connections > 10:
            return "Mention mutual connections and shared network"
        elif connection.company in self.target_companies[:5]:
            return "Reference company's recent achievements"
        else:
            return "Focus on specific technical interests"
            
    def save_results(self, results: Dict):
        """שמירת תוצאות הניתוח"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # שמירת נתוני קשרים
        connections_df = pd.DataFrame([asdict(c) for c in self.connections_data.values()])
        connections_df.to_csv(f'linkedin_connections_{timestamp}.csv', index=False)
        
        # שמירת תוצאות מלאות
        with open(f'network_analysis_{timestamp}.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        # שמירת גרף
        nx.write_gexf(self.connections_graph, f'connection_graph_{timestamp}.gexf')
        
        logger.info(f"✅ Results saved with timestamp {timestamp}")
        
    # פונקציות עזר
    def get_connections_by_degree(self) -> Dict[int, int]:
        """ספירת קשרים לפי דרגה"""
        degree_count = defaultdict(int)
        for conn in self.connections_data.values():
            degree_count[conn.degree] += 1
        return dict(degree_count)
        
    def get_top_companies(self, limit: int = 20) -> List[Tuple[str, int]]:
        """חברות מובילות ברשת"""
        company_count = defaultdict(int)
        for conn in self.connections_data.values():
            if conn.company:
                company_count[conn.company] += 1
        return sorted(company_count.items(), key=lambda x: x[1], reverse=True)[:limit]
        
    def get_skill_distribution(self) -> Dict[str, Dict[str, int]]:
        """התפלגות כישורים לפי קטגוריה"""
        distribution = {}
        
        for category, skills in self.target_skills.items():
            skill_count = defaultdict(int)
            for conn in self.connections_data.values():
                for skill in conn.skills:
                    if skill in skills:
                        skill_count[skill] += 1
            distribution[category] = dict(skill_count)
            
        return distribution
        
    # Placeholder functions - צריך implementation אמיתי
    async def fetch_connections_via_api(self, degree: int) -> List[LinkedInConnection]:
        """טעינת קשרים דרך API"""
        # כאן צריך implementation אמיתי עם LinkedIn API
        pass
        
    async def get_mutual_connections(self, connection: LinkedInConnection) -> List[LinkedInConnection]:
        """קבלת קשרים משותפים"""
        # כאן צריך implementation אמיתי
        return []
        
    async def get_extended_network(self, connection: LinkedInConnection) -> List[LinkedInConnection]:
        """קבלת רשת מורחבת"""
        # כאן צריך implementation אמיתי
        return []
        
    def generate_sample_connections(self, count: int, degree: int) -> List[LinkedInConnection]:
        """יצירת נתונים לדוגמה"""
        connections = []
        
        for i in range(count):
            conn = LinkedInConnection(
                id=f"conn_{degree}_{i}",
                name=f"Sample Connection {i}",
                headline=f"Senior Software Engineer at {np.random.choice(self.target_companies)}",
                degree=degree,
                company=np.random.choice(self.target_companies),
                location=np.random.choice(self.target_locations),
                profile_url=f"https://linkedin.com/in/sample{i}",
                mutual_connections=np.random.randint(0, 50),
                skills=list(np.random.choice(sum(self.target_skills.values(), []), size=5))
            )
            connections.append(conn)
            
        return connections

async def main():
    """פונקציה ראשית"""
    analyzer = LinkedInNetworkAnalyzer()
    
    # ניתוח הרשת
    results = await analyzer.analyze_network(max_depth=3)
    
    # הצגת תוצאות
    logger.info("\n" + "="*50)
    logger.info("📊 NETWORK ANALYSIS RESULTS")
    logger.info("="*50)
    
    logger.info(f"Total connections analyzed: {results['total_analyzed']}")
    logger.info(f"By degree: {results['by_degree']}")
    
    logger.info("\n🏢 Top Companies:")
    for company, count in results['top_companies'][:10]:
        logger.info(f"  {company}: {count}")
        
    logger.info("\n🎯 Immediate Outreach Targets:")
    for rec in results['recommendations']['immediate_outreach'][:5]:
        logger.info(f"  {rec['name']} @ {rec['company']} - {rec['reason']}")
        
    logger.info("\n🤝 Warm Intro Opportunities:")
    for rec in results['recommendations']['warm_intro_possible'][:5]:
        logger.info(f"  {rec['target']} via {rec['via']}")
        
    # שמירת התוצאות
    analyzer.save_results(results)
    
    logger.info("\n✅ Analysis complete!")

if __name__ == "__main__":
    asyncio.run(main()) 