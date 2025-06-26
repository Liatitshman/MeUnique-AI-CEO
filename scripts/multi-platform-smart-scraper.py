#!/usr/bin/env python3
"""
Multi-Platform Smart Scraper for MeUnique
מערכת סקרייפינג חכמה למציאת מועמדים בפלטפורמות מרובות
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple
import tweepy
import praw
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import pandas as pd
from tqdm import tqdm
import logging
from dataclasses import dataclass, asdict
import re
from collections import defaultdict
import time

# הגדרת לוגינג
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('multi_platform_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class Candidate:
    """מודל מועמד מאוחד"""
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    location: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    skills: List[str] = None
    bio: Optional[str] = None
    followers: int = 0
    engagement_score: float = 0.0
    sources: List[str] = None
    scraped_at: str = None
    metadata: Dict = None
    
    def __post_init__(self):
        if self.skills is None:
            self.skills = []
        if self.sources is None:
            self.sources = []
        if self.metadata is None:
            self.metadata = {}
        if self.scraped_at is None:
            self.scraped_at = datetime.now().isoformat()

class MultiPlatformScraper:
    """סקרייפר מרובה פלטפורמות"""
    
    def __init__(self):
        self.session = None
        self.driver = None
        self.candidates: Dict[str, Candidate] = {}
        self.processed_ids: Set[str] = set()
        
        # טעינת הגדרות
        self.load_config()
        
        # אתחול קליינטים
        self.init_clients()
        
    def load_config(self):
        """טעינת הגדרות מקובץ או משתני סביבה"""
        self.config = {
            'twitter': {
                'api_key': os.getenv('TWITTER_API_KEY'),
                'api_secret': os.getenv('TWITTER_API_SECRET'),
                'access_token': os.getenv('TWITTER_ACCESS_TOKEN'),
                'access_secret': os.getenv('TWITTER_ACCESS_SECRET'),
                'bearer_token': os.getenv('TWITTER_BEARER_TOKEN')
            },
            'reddit': {
                'client_id': os.getenv('REDDIT_CLIENT_ID'),
                'client_secret': os.getenv('REDDIT_CLIENT_SECRET'),
                'user_agent': 'MeUnique Talent Scraper 1.0'
            },
            'tech_keywords': [
                'developer', 'engineer', 'programmer', 'fullstack', 'frontend', 
                'backend', 'devops', 'react', 'python', 'javascript', 'golang',
                'kubernetes', 'docker', 'aws', 'azure', 'gcp', 'machine learning',
                'data scientist', 'architect', 'tech lead', 'senior', 'principal'
            ],
            'israeli_keywords': [
                'israel', 'tel aviv', 'jerusalem', 'haifa', 'herzliya',
                'raanana', 'netanya', 'israeli', 'idf', 'unit 8200',
                '🇮🇱', 'תל אביב', 'ישראל', 'הייטק'
            ]
        }
        
    def init_clients(self):
        """אתחול קליינטים לפלטפורמות השונות"""
        # Twitter/X Client
        if all(self.config['twitter'].values()):
            try:
                self.twitter_client = tweepy.Client(
                    bearer_token=self.config['twitter']['bearer_token'],
                    consumer_key=self.config['twitter']['api_key'],
                    consumer_secret=self.config['twitter']['api_secret'],
                    access_token=self.config['twitter']['access_token'],
                    access_token_secret=self.config['twitter']['access_secret']
                )
                logger.info("✅ Twitter client initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Twitter client: {e}")
                self.twitter_client = None
        
        # Reddit Client
        if all(self.config['reddit'].values()):
            try:
                self.reddit_client = praw.Reddit(
                    client_id=self.config['reddit']['client_id'],
                    client_secret=self.config['reddit']['client_secret'],
                    user_agent=self.config['reddit']['user_agent']
                )
                logger.info("✅ Reddit client initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Reddit client: {e}")
                self.reddit_client = None
    
    async def scrape_all_platforms(self, max_candidates: int = 10000):
        """סקרייפינג מכל הפלטפורמות"""
        logger.info(f"🚀 Starting multi-platform scraping for {max_candidates} candidates")
        
        tasks = []
        
        # Dev.to
        tasks.append(self.scrape_dev_to(max_candidates // 5))
        
        # Twitter/X
        if self.twitter_client:
            tasks.append(self.scrape_twitter(max_candidates // 5))
        
        # Reddit
        if self.reddit_client:
            tasks.append(self.scrape_reddit(max_candidates // 5))
        
        # Stack Overflow
        tasks.append(self.scrape_stackoverflow(max_candidates // 5))
        
        # Hashnode
        tasks.append(self.scrape_hashnode(max_candidates // 5))
        
        # Medium (Tech publications)
        tasks.append(self.scrape_medium_tech(max_candidates // 5))
        
        # הרצת כל המשימות במקביל
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # סיכום תוצאות
        total_found = len(self.candidates)
        logger.info(f"✅ Total candidates found: {total_found}")
        
        # שמירת התוצאות
        self.save_results()
        
        return self.candidates
    
    async def scrape_dev_to(self, limit: int = 2000):
        """סקרייפינג מ-Dev.to"""
        logger.info("🔍 Scraping Dev.to...")
        
        base_url = "https://dev.to/api"
        candidates_found = 0
        
        async with aiohttp.ClientSession() as session:
            # חיפוש משתמשים לפי תגיות רלוונטיות
            for keyword in self.config['tech_keywords']:
                if candidates_found >= limit:
                    break
                    
                try:
                    # חיפוש מאמרים לפי תגית
                    url = f"{base_url}/articles?tag={keyword}&per_page=100"
                    async with session.get(url) as response:
                        if response.status == 200:
                            articles = await response.json()
                            
                            for article in articles:
                                user = article.get('user', {})
                                user_id = f"devto_{user.get('username', '')}"
                                
                                if user_id not in self.processed_ids:
                                    # בדיקה אם המשתמש רלוונטי
                                    if self.is_relevant_candidate(user, article):
                                        candidate = await self.extract_devto_candidate(user, article)
                                        if candidate:
                                            self.candidates[user_id] = candidate
                                            self.processed_ids.add(user_id)
                                            candidates_found += 1
                                            
                                            if candidates_found % 100 == 0:
                                                logger.info(f"Dev.to: Found {candidates_found} candidates")
                    
                    await asyncio.sleep(1)  # כיבוד rate limits
                    
                except Exception as e:
                    logger.error(f"Error scraping Dev.to for {keyword}: {e}")
        
        logger.info(f"✅ Dev.to: Total {candidates_found} candidates found")
    
    async def extract_devto_candidate(self, user: Dict, article: Dict) -> Optional[Candidate]:
        """חילוץ מידע על מועמד מ-Dev.to"""
        try:
            # חילוץ כישורים מתגיות המאמר
            skills = article.get('tag_list', [])
            
            # ניתוח ביו
            bio = user.get('summary', '')
            location = self.extract_location(bio)
            
            # חישוב engagement score
            engagement = (
                article.get('positive_reactions_count', 0) * 2 +
                article.get('comments_count', 0) * 3
            ) / max(article.get('reading_time_minutes', 1), 1)
            
            return Candidate(
                id=f"devto_{user.get('username')}",
                name=user.get('name', user.get('username', '')),
                github_url=user.get('github_username', ''),
                twitter_handle=user.get('twitter_username', ''),
                location=location,
                bio=bio[:500],
                skills=skills[:10],
                engagement_score=engagement,
                sources=['dev.to'],
                metadata={
                    'profile_url': f"https://dev.to/{user.get('username')}",
                    'articles_count': 1,  # נוכל לעדכן בהמשך
                    'profile_image': user.get('profile_image', '')
                }
            )
        except Exception as e:
            logger.error(f"Error extracting Dev.to candidate: {e}")
            return None
    
    async def scrape_twitter(self, limit: int = 2000):
        """סקרייפינג מ-Twitter/X"""
        logger.info("🔍 Scraping Twitter/X...")
        
        if not self.twitter_client:
            logger.warning("Twitter client not initialized")
            return
        
        candidates_found = 0
        
        # חיפוש לפי מילות מפתח
        for keyword in self.config['tech_keywords'][:10]:  # מגבלת API
            if candidates_found >= limit:
                break
                
            try:
                # חיפוש טוויטים עם מילות מפתח
                query = f"{keyword} (developer OR engineer OR programmer) -is:retweet lang:en"
                
                tweets = self.twitter_client.search_recent_tweets(
                    query=query,
                    max_results=100,
                    tweet_fields=['author_id', 'created_at', 'public_metrics'],
                    user_fields=['name', 'username', 'description', 'location', 'public_metrics'],
                    expansions=['author_id']
                )
                
                if tweets.data:
                    users = {u.id: u for u in tweets.includes.get('users', [])}
                    
                    for tweet in tweets.data:
                        user = users.get(tweet.author_id)
                        if user:
                            user_id = f"twitter_{user.username}"
                            
                            if user_id not in self.processed_ids:
                                if self.is_relevant_twitter_user(user):
                                    candidate = self.extract_twitter_candidate(user)
                                    if candidate:
                                        self.candidates[user_id] = candidate
                                        self.processed_ids.add(user_id)
                                        candidates_found += 1
                
                await asyncio.sleep(2)  # Rate limiting
                
            except Exception as e:
                logger.error(f"Error searching Twitter for {keyword}: {e}")
        
        logger.info(f"✅ Twitter: Total {candidates_found} candidates found")
    
    def extract_twitter_candidate(self, user) -> Optional[Candidate]:
        """חילוץ מידע על מועמד מ-Twitter"""
        try:
            # ניתוח ביו לחילוץ כישורים
            bio = user.description or ''
            skills = self.extract_skills_from_text(bio)
            location = user.location or self.extract_location(bio)
            
            # חישוב engagement score
            metrics = user.public_metrics
            engagement = (
                metrics.get('followers_count', 0) * 0.1 +
                metrics.get('tweet_count', 0) * 0.01
            ) / max(1, (datetime.now() - user.created_at).days / 365)
            
            return Candidate(
                id=f"twitter_{user.username}",
                name=user.name,
                twitter_handle=user.username,
                location=location,
                bio=bio[:500],
                skills=skills[:10],
                followers=metrics.get('followers_count', 0),
                engagement_score=engagement,
                sources=['twitter'],
                metadata={
                    'profile_url': f"https://twitter.com/{user.username}",
                    'verified': getattr(user, 'verified', False),
                    'tweet_count': metrics.get('tweet_count', 0)
                }
            )
        except Exception as e:
            logger.error(f"Error extracting Twitter candidate: {e}")
            return None
    
    async def scrape_reddit(self, limit: int = 2000):
        """סקרייפינג מ-Reddit"""
        logger.info("🔍 Scraping Reddit...")
        
        if not self.reddit_client:
            logger.warning("Reddit client not initialized")
            return
        
        candidates_found = 0
        
        # סאב-רדיטים רלוונטיים
        subreddits = [
            'cscareerquestions', 'programming', 'webdev', 'javascript',
            'python', 'golang', 'devops', 'kubernetes', 'aws',
            'ExperiencedDevs', 'israeltech'
        ]
        
        for subreddit_name in subreddits:
            if candidates_found >= limit:
                break
                
            try:
                subreddit = self.reddit_client.subreddit(subreddit_name)
                
                # סריקת פוסטים חמים ואחרונים
                for submission in subreddit.hot(limit=100):
                    author = submission.author
                    if author and author.name != '[deleted]':
                        user_id = f"reddit_{author.name}"
                        
                        if user_id not in self.processed_ids:
                            # בדיקת רלוונטיות
                            if self.is_relevant_reddit_user(author, submission):
                                candidate = await self.extract_reddit_candidate(author, submission)
                                if candidate:
                                    self.candidates[user_id] = candidate
                                    self.processed_ids.add(user_id)
                                    candidates_found += 1
                                    
                                    if candidates_found % 100 == 0:
                                        logger.info(f"Reddit: Found {candidates_found} candidates")
                
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Error scraping Reddit {subreddit_name}: {e}")
        
        logger.info(f"✅ Reddit: Total {candidates_found} candidates found")
    
    async def extract_reddit_candidate(self, author, submission) -> Optional[Candidate]:
        """חילוץ מידע על מועמד מ-Reddit"""
        try:
            # ניסיון לקבל מידע נוסף על המשתמש
            user_data = {
                'karma': author.comment_karma + author.link_karma,
                'account_age': (datetime.now() - datetime.fromtimestamp(author.created_utc)).days
            }
            
            # ניתוח תוכן לחילוץ כישורים
            content = f"{submission.title} {submission.selftext}"
            skills = self.extract_skills_from_text(content)
            
            # חישוב engagement
            engagement = user_data['karma'] / max(user_data['account_age'], 1)
            
            return Candidate(
                id=f"reddit_{author.name}",
                name=author.name,
                bio=submission.selftext[:500] if submission.selftext else submission.title,
                skills=skills[:10],
                engagement_score=engagement,
                sources=['reddit'],
                metadata={
                    'profile_url': f"https://reddit.com/user/{author.name}",
                    'karma': user_data['karma'],
                    'subreddit': submission.subreddit.display_name
                }
            )
        except Exception as e:
            logger.error(f"Error extracting Reddit candidate: {e}")
            return None
    
    async def scrape_stackoverflow(self, limit: int = 2000):
        """סקרייפינג מ-Stack Overflow"""
        logger.info("🔍 Scraping Stack Overflow...")
        
        candidates_found = 0
        base_url = "https://api.stackexchange.com/2.3"
        
        async with aiohttp.ClientSession() as session:
            # חיפוש משתמשים לפי תגיות
            for tag in self.config['tech_keywords'][:20]:
                if candidates_found >= limit:
                    break
                    
                try:
                    # חיפוש משתמשים עם תגית ספציפית
                    params = {
                        'order': 'desc',
                        'sort': 'reputation',
                        'inname': tag,
                        'site': 'stackoverflow',
                        'pagesize': 100
                    }
                    
                    async with session.get(f"{base_url}/users", params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            for user in data.get('items', []):
                                user_id = f"stackoverflow_{user.get('user_id')}"
                                
                                if user_id not in self.processed_ids:
                                    if self.is_relevant_stackoverflow_user(user):
                                        candidate = self.extract_stackoverflow_candidate(user)
                                        if candidate:
                                            self.candidates[user_id] = candidate
                                            self.processed_ids.add(user_id)
                                            candidates_found += 1
                    
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error scraping Stack Overflow for {tag}: {e}")
        
        logger.info(f"✅ Stack Overflow: Total {candidates_found} candidates found")
    
    def extract_stackoverflow_candidate(self, user: Dict) -> Optional[Candidate]:
        """חילוץ מידע על מועמד מ-Stack Overflow"""
        try:
            # חילוץ מיקום
            location = user.get('location', '')
            
            # חישוב engagement score
            engagement = (
                user.get('reputation', 0) * 0.01 +
                user.get('accept_rate', 0) * 0.1
            ) / max(1, (datetime.now().timestamp() - user.get('creation_date', 0)) / 31536000)
            
            return Candidate(
                id=f"stackoverflow_{user.get('user_id')}",
                name=user.get('display_name', ''),
                location=location,
                bio=f"Stack Overflow user with {user.get('reputation', 0)} reputation",
                engagement_score=engagement,
                sources=['stackoverflow'],
                metadata={
                    'profile_url': user.get('link', ''),
                    'reputation': user.get('reputation', 0),
                    'badge_counts': user.get('badge_counts', {}),
                    'profile_image': user.get('profile_image', '')
                }
            )
        except Exception as e:
            logger.error(f"Error extracting Stack Overflow candidate: {e}")
            return None
    
    async def scrape_hashnode(self, limit: int = 1000):
        """סקרייפינג מ-Hashnode"""
        logger.info("🔍 Scraping Hashnode...")
        
        # Implementation for Hashnode scraping
        # Similar structure to Dev.to
        pass
    
    async def scrape_medium_tech(self, limit: int = 1000):
        """סקרייפינג מפרסומים טכניים ב-Medium"""
        logger.info("🔍 Scraping Medium tech publications...")
        
        # Implementation for Medium scraping
        # Focus on tech publications
        pass
    
    def is_relevant_candidate(self, user: Dict, article: Dict) -> bool:
        """בדיקה האם המועמד רלוונטי"""
        # בדיקת מילות מפתח בביו
        bio = user.get('summary', '').lower()
        title = article.get('title', '').lower()
        
        # בדיקת רלוונטיות טכנית
        for keyword in self.config['tech_keywords']:
            if keyword.lower() in bio or keyword.lower() in title:
                return True
        
        # בדיקת מיקום ישראלי
        for keyword in self.config['israeli_keywords']:
            if keyword.lower() in bio:
                return True
        
        return False
    
    def is_relevant_twitter_user(self, user) -> bool:
        """בדיקת רלוונטיות משתמש טוויטר"""
        bio = (user.description or '').lower()
        location = (user.location or '').lower()
        
        # בדיקת מילות מפתח טכניות
        tech_match = any(kw.lower() in bio for kw in self.config['tech_keywords'])
        
        # בדיקת מיקום ישראלי
        israel_match = any(kw.lower() in location or kw.lower() in bio 
                          for kw in self.config['israeli_keywords'])
        
        return tech_match or israel_match
    
    def is_relevant_reddit_user(self, author, submission) -> bool:
        """בדיקת רלוונטיות משתמש Reddit"""
        content = f"{submission.title} {submission.selftext}".lower()
        
        # בדיקת תוכן טכני
        tech_match = any(kw.lower() in content for kw in self.config['tech_keywords'])
        
        # בדיקת קארמה מינימלית
        min_karma = author.comment_karma + author.link_karma > 100
        
        return tech_match and min_karma
    
    def is_relevant_stackoverflow_user(self, user: Dict) -> bool:
        """בדיקת רלוונטיות משתמש Stack Overflow"""
        # רפוטציה מינימלית
        if user.get('reputation', 0) < 500:
            return False
        
        # בדיקת מיקום
        location = (user.get('location', '') or '').lower()
        israel_match = any(kw.lower() in location for kw in self.config['israeli_keywords'])
        
        return True  # או israel_match אם רוצים רק ישראלים
    
    def extract_skills_from_text(self, text: str) -> List[str]:
        """חילוץ כישורים מטקסט"""
        skills = []
        text_lower = text.lower()
        
        # רשימת כישורים לחיפוש
        tech_skills = [
            'python', 'javascript', 'typescript', 'react', 'angular', 'vue',
            'node.js', 'django', 'flask', 'fastapi', 'golang', 'rust',
            'java', 'kotlin', 'swift', 'kubernetes', 'docker', 'aws',
            'azure', 'gcp', 'terraform', 'jenkins', 'git', 'postgresql',
            'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest api',
            'machine learning', 'deep learning', 'nlp', 'computer vision'
        ]
        
        for skill in tech_skills:
            if skill in text_lower:
                skills.append(skill)
        
        return list(set(skills))
    
    def extract_location(self, text: str) -> Optional[str]:
        """חילוץ מיקום מטקסט"""
        text_lower = text.lower()
        
        # רשימת מיקומים
        locations = {
            'tel aviv': 'Tel Aviv',
            'jerusalem': 'Jerusalem',
            'haifa': 'Haifa',
            'herzliya': 'Herzliya',
            'raanana': "Ra'anana",
            'netanya': 'Netanya',
            'israel': 'Israel',
            'תל אביב': 'Tel Aviv',
            'ירושלים': 'Jerusalem',
            'חיפה': 'Haifa'
        }
        
        for pattern, location in locations.items():
            if pattern in text_lower:
                return location
        
        return None
    
    def save_results(self):
        """שמירת התוצאות"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # המרה ל-DataFrame
        df_data = []
        for candidate in self.candidates.values():
            row = asdict(candidate)
            row['skills'] = ', '.join(row['skills'])
            row['sources'] = ', '.join(row['sources'])
            df_data.append(row)
        
        df = pd.DataFrame(df_data)
        
        # שמירה ל-CSV
        csv_file = f'candidates_multi_platform_{timestamp}.csv'
        df.to_csv(csv_file, index=False, encoding='utf-8-sig')
        logger.info(f"💾 Saved {len(df)} candidates to {csv_file}")
        
        # שמירה ל-JSON
        json_file = f'candidates_multi_platform_{timestamp}.json'
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump([asdict(c) for c in self.candidates.values()], f, ensure_ascii=False, indent=2)
        logger.info(f"💾 Saved candidates to {json_file}")
        
        # סטטיסטיקות
        self.print_statistics()
    
    def print_statistics(self):
        """הדפסת סטטיסטיקות"""
        logger.info("\n📊 Scraping Statistics:")
        logger.info(f"Total candidates: {len(self.candidates)}")
        
        # סטטיסטיקות לפי מקור
        source_stats = defaultdict(int)
        for candidate in self.candidates.values():
            for source in candidate.sources:
                source_stats[source] += 1
        
        logger.info("\nCandidates by source:")
        for source, count in sorted(source_stats.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"  {source}: {count}")
        
        # סטטיסטיקות כישורים
        skill_stats = defaultdict(int)
        for candidate in self.candidates.values():
            for skill in candidate.skills:
                skill_stats[skill] += 1
        
        logger.info("\nTop 10 skills:")
        for skill, count in sorted(skill_stats.items(), key=lambda x: x[1], reverse=True)[:10]:
            logger.info(f"  {skill}: {count}")
        
        # סטטיסטיקות מיקום
        location_stats = defaultdict(int)
        for candidate in self.candidates.values():
            if candidate.location:
                location_stats[candidate.location] += 1
        
        logger.info("\nTop locations:")
        for location, count in sorted(location_stats.items(), key=lambda x: x[1], reverse=True)[:10]:
            logger.info(f"  {location}: {count}")

async def main():
    """פונקציה ראשית"""
    scraper = MultiPlatformScraper()
    
    # הרצת סקרייפינג
    await scraper.scrape_all_platforms(max_candidates=10000)
    
    logger.info("✅ Multi-platform scraping completed!")

if __name__ == "__main__":
    asyncio.run(main()) 