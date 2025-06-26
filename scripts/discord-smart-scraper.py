#!/usr/bin/env python3
"""
Discord Smart Scraper
סורק Discord servers ישראליים לאיתור מפתחים
"""

import discord
import asyncio
import json
from datetime import datetime, timedelta
from typing import List, Dict
import re

class DiscordTalentScraper:
    def __init__(self):
        self.israeli_tech_servers = {
            "React Israel": {
                "invite": "https://discord.gg/react-il",
                "channels": ["general", "jobs", "help", "showcase"],
                "expected_members": 1200,
                "tech_focus": ["React", "JavaScript", "Frontend"]
            },
            "Node.js IL": {
                "invite": "https://discord.gg/nodejs-il",
                "channels": ["general", "jobs", "questions"],
                "expected_members": 800,
                "tech_focus": ["Node.js", "Backend", "JavaScript"]
            },
            "DevOps Israel": {
                "invite": "https://discord.gg/devops-il",
                "channels": ["general", "kubernetes", "aws", "jobs"],
                "expected_members": 600,
                "tech_focus": ["Kubernetes", "Docker", "AWS", "CI/CD"]
            },
            "Python IL": {
                "invite": "https://discord.gg/python-il",
                "channels": ["general", "django", "data-science", "jobs"],
                "expected_members": 900,
                "tech_focus": ["Python", "Django", "FastAPI", "Data Science"]
            }
        }
        
        self.valuable_signals = {
            "expertise": [
                r"I work(ed)? (at|for|with)",
                r"my experience with",
                r"I built",
                r"deployed to production",
                r"years of experience"
            ],
            "availability": [
                r"looking for",
                r"open to",
                r"considering",
                r"interested in",
                r"freelance",
                r"part[- ]time"
            ],
            "technical": [
                r"react|vue|angular",
                r"node|python|go|rust",
                r"kubernetes|k8s|docker",
                r"aws|gcp|azure",
                r"postgresql|mongodb|redis"
            ]
        }
        
    async def scrape_server(self, server_name: str, guild: discord.Guild) -> List[Dict]:
        """סורק שרת Discord ומחלץ פרופילים"""
        print(f"🔍 Scraping {server_name}...")
        
        members_data = []
        active_threshold = datetime.now() - timedelta(days=30)
        
        # אסוף חברים פעילים
        for member in guild.members:
            if member.bot:
                continue
                
            member_info = {
                "discord_id": str(member.id),
                "username": member.name,
                "display_name": member.display_name,
                "joined_at": member.joined_at.isoformat() if member.joined_at else None,
                "roles": [role.name for role in member.roles if role.name != "@everyone"],
                "server": server_name,
                "tech_signals": [],
                "activity_score": 0
            }
            
            # נתח פעילות אחרונה
            activity_data = await self.analyze_member_activity(member, guild, active_threshold)
            member_info.update(activity_data)
            
            # חשב ציון רלוונטיות
            member_info["relevance_score"] = self.calculate_relevance(member_info)
            
            if member_info["relevance_score"] > 0.3:  # סף מינימלי
                members_data.append(member_info)
                
        return members_data
    
    async def analyze_member_activity(self, member: discord.Member, guild: discord.Guild, since: datetime) -> Dict:
        """מנתח פעילות של חבר בשרת"""
        activity_data = {
            "messages_count": 0,
            "technical_messages": 0,
            "help_given": 0,
            "projects_shared": 0,
            "last_active": None,
            "extracted_skills": set(),
            "potential_linkedin": None
        }
        
        # סרוק ערוצים רלוונטיים
        for channel in guild.text_channels:
            if channel.permissions_for(guild.me).read_message_history:
                try:
                    async for message in channel.history(after=since, limit=1000):
                        if message.author == member:
                            activity_data["messages_count"] += 1
                            
                            # נתח תוכן
                            content = message.content.lower()
                            
                            # חפש אזכורים טכניים
                            for tech_pattern in self.valuable_signals["technical"]:
                                if re.search(tech_pattern, content):
                                    activity_data["technical_messages"] += 1
                                    # חלץ את הטכנולוגיה
                                    match = re.search(tech_pattern, content)
                                    if match:
                                        activity_data["extracted_skills"].add(match.group())
                            
                            # חפש עזרה לאחרים
                            if any(word in content for word in ["try", "you can", "use", "check"]):
                                activity_data["help_given"] += 1
                            
                            # חפש שיתוף פרויקטים
                            if any(word in content for word in ["github.com", "my project", "i built"]):
                                activity_data["projects_shared"] += 1
                            
                            # חפש LinkedIn
                            linkedin_match = re.search(r'linkedin\.com/in/([a-zA-Z0-9-]+)', content)
                            if linkedin_match:
                                activity_data["potential_linkedin"] = linkedin_match.group(1)
                            
                            # עדכן תאריך אחרון
                            if not activity_data["last_active"] or message.created_at > activity_data["last_active"]:
                                activity_data["last_active"] = message.created_at.isoformat()
                                
                except discord.Forbidden:
                    pass
                    
        # המר set לרשימה
        activity_data["extracted_skills"] = list(activity_data["extracted_skills"])
        
        return activity_data
    
    def calculate_relevance(self, member_info: Dict) -> float:
        """מחשב ציון רלוונטיות למועמד"""
        score = 0.0
        
        # פעילות (30%)
        if member_info["messages_count"] > 50:
            score += 0.15
        elif member_info["messages_count"] > 20:
            score += 0.10
        elif member_info["messages_count"] > 5:
            score += 0.05
            
        # מומחיות טכנית (40%)
        if member_info["technical_messages"] > 10:
            score += 0.20
        elif member_info["technical_messages"] > 5:
            score += 0.15
        elif member_info["technical_messages"] > 0:
            score += 0.10
            
        skills_count = len(member_info["extracted_skills"])
        if skills_count > 5:
            score += 0.20
        elif skills_count > 3:
            score += 0.15
        elif skills_count > 0:
            score += 0.10
            
        # תרומה לקהילה (20%)
        if member_info["help_given"] > 10:
            score += 0.15
        elif member_info["help_given"] > 5:
            score += 0.10
        elif member_info["help_given"] > 0:
            score += 0.05
            
        # פרויקטים (10%)
        if member_info["projects_shared"] > 0:
            score += 0.10
            
        return min(score, 1.0)
    
    def enrich_with_linkedin(self, members: List[Dict]) -> List[Dict]:
        """מעשיר פרופילים עם מידע מ-LinkedIn"""
        enriched = []
        
        for member in members:
            if member.get("potential_linkedin"):
                # כאן נחבר ל-LinkedIn API או Sales QL
                member["linkedin_profile"] = f"https://linkedin.com/in/{member['potential_linkedin']}"
                member["enrichment_status"] = "pending"
            else:
                # ננסה לחפש לפי שם
                member["linkedin_search_query"] = f"{member['display_name']} Israel developer"
                member["enrichment_status"] = "needs_search"
                
            enriched.append(member)
            
        return enriched
    
    def generate_outreach_strategy(self, member: Dict) -> Dict:
        """יוצר אסטרטגיית approach למועמד"""
        strategy = {
            "channel": "Discord DM",
            "approach": "technical_discussion",
            "personalization_points": []
        }
        
        # אם תרם הרבה לקהילה
        if member["help_given"] > 10:
            strategy["approach"] = "community_contributor"
            strategy["personalization_points"].append("Thank for helping others")
            
        # אם שיתף פרויקטים
        if member["projects_shared"] > 0:
            strategy["approach"] = "project_based"
            strategy["personalization_points"].append("Reference their project")
            
        # לפי skills
        if "react" in member.get("extracted_skills", []):
            strategy["personalization_points"].append("React expertise match")
        if "kubernetes" in member.get("extracted_skills", []):
            strategy["personalization_points"].append("DevOps skills valuable")
            
        # הודעה מומלצת
        strategy["message_template"] = self.craft_discord_message(member, strategy)
        
        return strategy
    
    def craft_discord_message(self, member: Dict, strategy: Dict) -> str:
        """יוצר הודעת Discord מותאמת אישית"""
        name = member["display_name"]
        
        if strategy["approach"] == "community_contributor":
            return f"""
Hey {name}! 👋

I've noticed how helpful you've been in the {member['server']} community - your answers about {', '.join(member['extracted_skills'][:2])} really show deep expertise.

I'm working with some exciting Israeli tech companies looking for talented developers like you. Would you be open to hearing about some opportunities that match your skills?

No pressure at all - just thought it might interest you! 
            """
        elif strategy["approach"] == "project_based":
            return f"""
Hi {name}! 

Saw your project work in {member['server']} - impressive stuff with {', '.join(member['extracted_skills'][:2])}! 

I help Israeli tech companies find talented developers, and your profile really stands out. Interested in exploring some opportunities?

Happy to share more details if you're curious!
            """
        else:
            return f"""
Hey {name}! 

Your technical discussions in {member['server']} caught my attention - especially around {', '.join(member['extracted_skills'][:2])}.

I'm connected with several Israeli tech companies hiring developers with your skillset. Open to a quick chat about potential opportunities?

Let me know if you'd like to hear more!
            """
    
    async def save_results(self, all_members: List[Dict]):
        """שומר את התוצאות"""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"👑_CEO-System/📁_Documents/candidate-databases/DISCORD_SCRAPE_{timestamp}.json"
        
        # סטטיסטיקות
        stats = {
            "scrape_date": timestamp,
            "total_members_found": len(all_members),
            "high_relevance": len([m for m in all_members if m["relevance_score"] > 0.7]),
            "medium_relevance": len([m for m in all_members if 0.4 <= m["relevance_score"] <= 0.7]),
            "with_linkedin": len([m for m in all_members if m.get("potential_linkedin")]),
            "by_server": {}
        }
        
        # סטטיסטיקות לפי שרת
        for server in self.israeli_tech_servers:
            server_members = [m for m in all_members if m["server"] == server]
            stats["by_server"][server] = {
                "count": len(server_members),
                "avg_relevance": sum(m["relevance_score"] for m in server_members) / len(server_members) if server_members else 0
            }
        
        # שמור
        output = {
            "metadata": stats,
            "members": sorted(all_members, key=lambda x: x["relevance_score"], reverse=True)
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Saved {len(all_members)} Discord profiles to {filename}")
        return filename


# דוגמה לשימוש (ללא חיבור אמיתי ל-Discord)
def demo_discord_scraping():
    """הדגמה של תוצאות סריקה"""
    print("🎮 Discord Scraping Demo")
    print("=" * 50)
    
    # דוגמה לתוצאות
    sample_results = [
        {
            "discord_id": "123456789",
            "username": "david_dev",
            "display_name": "David Cohen",
            "server": "React Israel",
            "messages_count": 156,
            "technical_messages": 89,
            "help_given": 34,
            "extracted_skills": ["react", "typescript", "node.js", "docker"],
            "relevance_score": 0.85,
            "potential_linkedin": "david-cohen-dev"
        },
        {
            "discord_id": "987654321",
            "username": "sarah_k",
            "display_name": "Sarah Katz",
            "server": "DevOps Israel",
            "messages_count": 234,
            "technical_messages": 156,
            "help_given": 67,
            "extracted_skills": ["kubernetes", "terraform", "aws", "python"],
            "relevance_score": 0.92,
            "potential_linkedin": None
        }
    ]
    
    print("\n📊 Sample Results:")
    for member in sample_results:
        print(f"\n👤 {member['display_name']} (@{member['username']})")
        print(f"   Server: {member['server']}")
        print(f"   Skills: {', '.join(member['extracted_skills'])}")
        print(f"   Relevance: {member['relevance_score']:.0%}")
        print(f"   LinkedIn: {'✅ Found' if member['potential_linkedin'] else '❌ Need to search'}")
    
    print("\n💡 Next Steps:")
    print("1. Enrich profiles with LinkedIn data")
    print("2. Cross-reference with existing database")
    print("3. Generate personalized outreach")
    print("4. Track response rates")
    
    return sample_results

if __name__ == "__main__":
    # הרץ דוגמה
    results = demo_discord_scraping()
    
    print("\n🚀 To run actual Discord scraping:")
    print("1. Install: pip install discord.py")
    print("2. Get bot token from Discord Developer Portal")
    print("3. Join target servers")
    print("4. Run: python discord-smart-scraper.py --token YOUR_TOKEN") 