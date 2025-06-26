#!/usr/bin/env python3
"""
Cost Monitoring Dashboard for MeUnique
מערכת ניטור עלויות ומעקב אחר פעולות
"""

import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from dataclasses import dataclass
import logging
from collections import defaultdict
import numpy as np

# הגדרת לוגינג
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class CostEvent:
    """אירוע עלות במערכת"""
    timestamp: datetime
    agent: str
    operation: str
    cost: float
    details: Dict
    
@dataclass
class CostLimits:
    """הגבלות עלות"""
    daily_limit: float = 100.0
    weekly_limit: float = 500.0
    monthly_limit: float = 1500.0
    per_agent_daily: float = 20.0
    alert_threshold: float = 0.8  # התראה ב-80% מהמגבלה

class CostMonitor:
    """מערכת ניטור עלויות"""
    
    def __init__(self, config_file: str = "cost_config.json"):
        self.config_file = config_file
        self.events: List[CostEvent] = []
        self.load_config()
        self.load_events()
        
    def load_config(self):
        """טעינת הגדרות"""
        default_config = {
            "linkedin_navigator": {
                "monthly_cost": 100.0,
                "daily_searches": 100,
                "cost_per_search": 0.033
            },
            "sales_ql": {
                "included_emails": 100,
                "cost_per_extra": 0.10
            },
            "juicebox": {
                "included_lookups": 500,
                "cost_per_extra": 0.05
            },
            "agent_costs": {
                "smart_database": 0.05,
                "auto_recruiter": 0.10,
                "culture_matcher": 0.08,
                "ideal_profiler": 0.06,
                "dictionary_bot": 0.02,
                "profile_analyzer": 0.15,
                "message_crafter": 0.05,
                "team_matching_manager": 0.12
            },
            "free_sources": {
                "dev.to": 0.0,
                "reddit": 0.0,
                "github": 0.0,
                "stackoverflow": 0.0,
                "twitter": 0.0
            }
        }
        
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = default_config
            self.save_config()
            
        self.limits = CostLimits()
        
    def save_config(self):
        """שמירת הגדרות"""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
            
    def load_events(self):
        """טעינת אירועי עלות"""
        events_file = "cost_events.json"
        if os.path.exists(events_file):
            with open(events_file, 'r') as f:
                data = json.load(f)
                self.events = [
                    CostEvent(
                        timestamp=datetime.fromisoformat(e['timestamp']),
                        agent=e['agent'],
                        operation=e['operation'],
                        cost=e['cost'],
                        details=e['details']
                    )
                    for e in data
                ]
                
    def save_events(self):
        """שמירת אירועי עלות"""
        events_file = "cost_events.json"
        data = [
            {
                'timestamp': e.timestamp.isoformat(),
                'agent': e.agent,
                'operation': e.operation,
                'cost': e.cost,
                'details': e.details
            }
            for e in self.events
        ]
        with open(events_file, 'w') as f:
            json.dump(data, f, indent=2)
            
    def add_event(self, agent: str, operation: str, cost: float, details: Dict = None):
        """הוספת אירוע עלות"""
        event = CostEvent(
            timestamp=datetime.now(),
            agent=agent,
            operation=operation,
            cost=cost,
            details=details or {}
        )
        self.events.append(event)
        self.save_events()
        
        # בדיקת חריגות
        self.check_limits()
        
    def check_limits(self):
        """בדיקת חריגות מהמגבלות"""
        now = datetime.now()
        
        # עלות יומית
        daily_cost = self.get_cost_for_period(now - timedelta(days=1), now)
        if daily_cost > self.limits.daily_limit * self.limits.alert_threshold:
            self.send_alert(f"⚠️ Daily cost alert: ${daily_cost:.2f} / ${self.limits.daily_limit:.2f}")
            
        # עלות שבועית
        weekly_cost = self.get_cost_for_period(now - timedelta(days=7), now)
        if weekly_cost > self.limits.weekly_limit * self.limits.alert_threshold:
            self.send_alert(f"⚠️ Weekly cost alert: ${weekly_cost:.2f} / ${self.limits.weekly_limit:.2f}")
            
        # עלות חודשית
        monthly_cost = self.get_cost_for_period(now - timedelta(days=30), now)
        if monthly_cost > self.limits.monthly_limit * self.limits.alert_threshold:
            self.send_alert(f"⚠️ Monthly cost alert: ${monthly_cost:.2f} / ${self.limits.monthly_limit:.2f}")
            
        # עלות לפי סוכן
        agent_costs = self.get_agent_costs_today()
        for agent, cost in agent_costs.items():
            if cost > self.limits.per_agent_daily * self.limits.alert_threshold:
                self.send_alert(f"⚠️ Agent {agent} daily cost alert: ${cost:.2f}")
                
    def send_alert(self, message: str):
        """שליחת התראה"""
        logger.warning(message)
        # כאן אפשר להוסיף שליחת מייל/SMS/Slack
        
    def get_cost_for_period(self, start: datetime, end: datetime) -> float:
        """חישוב עלות לתקופה"""
        return sum(
            e.cost for e in self.events
            if start <= e.timestamp <= end
        )
        
    def get_agent_costs_today(self) -> Dict[str, float]:
        """עלויות לפי סוכן היום"""
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        agent_costs = defaultdict(float)
        
        for event in self.events:
            if event.timestamp >= today:
                agent_costs[event.agent] += event.cost
                
        return dict(agent_costs)
        
    def generate_dashboard(self):
        """יצירת דשבורד ויזואלי"""
        # הכנת נתונים
        df = pd.DataFrame([
            {
                'timestamp': e.timestamp,
                'agent': e.agent,
                'operation': e.operation,
                'cost': e.cost,
                'hour': e.timestamp.hour,
                'day': e.timestamp.date()
            }
            for e in self.events
        ])
        
        if df.empty:
            logger.info("No cost events to display")
            return
            
        # יצירת דשבורד
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('MeUnique Cost Monitoring Dashboard', fontsize=16)
        
        # 1. עלות לפי יום
        daily_costs = df.groupby('day')['cost'].sum()
        axes[0, 0].plot(daily_costs.index, daily_costs.values, marker='o')
        axes[0, 0].axhline(y=self.limits.daily_limit, color='r', linestyle='--', label='Daily Limit')
        axes[0, 0].set_title('Daily Costs')
        axes[0, 0].set_xlabel('Date')
        axes[0, 0].set_ylabel('Cost ($)')
        axes[0, 0].legend()
        axes[0, 0].tick_params(axis='x', rotation=45)
        
        # 2. עלות לפי סוכן
        agent_costs = df.groupby('agent')['cost'].sum().sort_values(ascending=False)
        axes[0, 1].bar(agent_costs.index, agent_costs.values)
        axes[0, 1].set_title('Total Cost by Agent')
        axes[0, 1].set_xlabel('Agent')
        axes[0, 1].set_ylabel('Total Cost ($)')
        axes[0, 1].tick_params(axis='x', rotation=45)
        
        # 3. התפלגות פעולות
        operation_counts = df['operation'].value_counts()
        axes[1, 0].pie(operation_counts.values, labels=operation_counts.index, autopct='%1.1f%%')
        axes[1, 0].set_title('Operations Distribution')
        
        # 4. עלות לפי שעה ביום
        hourly_costs = df.groupby('hour')['cost'].mean()
        axes[1, 1].bar(hourly_costs.index, hourly_costs.values)
        axes[1, 1].set_title('Average Cost by Hour')
        axes[1, 1].set_xlabel('Hour')
        axes[1, 1].set_ylabel('Average Cost ($)')
        
        plt.tight_layout()
        plt.savefig('cost_dashboard.png', dpi=300, bbox_inches='tight')
        logger.info("Dashboard saved to cost_dashboard.png")
        
    def generate_report(self) -> Dict:
        """יצירת דוח מפורט"""
        now = datetime.now()
        
        report = {
            'generated_at': now.isoformat(),
            'summary': {
                'total_events': len(self.events),
                'total_cost': sum(e.cost for e in self.events),
                'daily_cost': self.get_cost_for_period(now - timedelta(days=1), now),
                'weekly_cost': self.get_cost_for_period(now - timedelta(days=7), now),
                'monthly_cost': self.get_cost_for_period(now - timedelta(days=30), now)
            },
            'by_agent': {},
            'by_operation': {},
            'recommendations': []
        }
        
        # עלות לפי סוכן
        agent_costs = defaultdict(float)
        agent_operations = defaultdict(int)
        
        for event in self.events:
            agent_costs[event.agent] += event.cost
            agent_operations[event.agent] += 1
            
        for agent, cost in agent_costs.items():
            report['by_agent'][agent] = {
                'total_cost': cost,
                'operations': agent_operations[agent],
                'avg_cost_per_operation': cost / agent_operations[agent] if agent_operations[agent] > 0 else 0
            }
            
        # עלות לפי פעולה
        operation_costs = defaultdict(float)
        operation_counts = defaultdict(int)
        
        for event in self.events:
            operation_costs[event.operation] += event.cost
            operation_counts[event.operation] += 1
            
        for operation, cost in operation_costs.items():
            report['by_operation'][operation] = {
                'total_cost': cost,
                'count': operation_counts[operation],
                'avg_cost': cost / operation_counts[operation] if operation_counts[operation] > 0 else 0
            }
            
        # המלצות
        if report['summary']['daily_cost'] > self.limits.daily_limit * 0.8:
            report['recommendations'].append("Consider reducing daily operations - approaching daily limit")
            
        # זיהוי סוכנים יקרים
        expensive_agents = [
            agent for agent, data in report['by_agent'].items()
            if data['avg_cost_per_operation'] > 0.2
        ]
        if expensive_agents:
            report['recommendations'].append(f"Optimize operations for agents: {', '.join(expensive_agents)}")
            
        # שמירת הדוח
        with open('cost_report.json', 'w') as f:
            json.dump(report, f, indent=2)
            
        return report
        
    def optimize_costs(self) -> Dict:
        """המלצות לאופטימיזציה"""
        optimizations = {
            'use_free_sources': {
                'potential_savings': 0,
                'recommendations': []
            },
            'batch_operations': {
                'potential_savings': 0,
                'recommendations': []
            },
            'timing_optimization': {
                'potential_savings': 0,
                'recommendations': []
            }
        }
        
        # ניתוח שימוש במקורות בתשלום vs חינם
        paid_operations = sum(1 for e in self.events if e.cost > 0)
        total_operations = len(self.events)
        
        if paid_operations / total_operations > 0.5:
            optimizations['use_free_sources']['recommendations'].append(
                "Increase usage of free sources (Dev.to, Reddit, GitHub) before paid sources"
            )
            optimizations['use_free_sources']['potential_savings'] = paid_operations * 0.3 * 0.1
            
        # המלצות לאיחוד פעולות
        agent_frequency = defaultdict(list)
        for event in self.events:
            agent_frequency[event.agent].append(event.timestamp)
            
        for agent, timestamps in agent_frequency.items():
            # בדיקה אם יש פעולות קרובות מדי
            timestamps.sort()
            close_operations = 0
            for i in range(1, len(timestamps)):
                if (timestamps[i] - timestamps[i-1]).seconds < 60:
                    close_operations += 1
                    
            if close_operations > 10:
                optimizations['batch_operations']['recommendations'].append(
                    f"Batch operations for {agent} - {close_operations} operations within 1 minute"
                )
                optimizations['batch_operations']['potential_savings'] += close_operations * 0.02
                
        return optimizations

def main():
    """פונקציה ראשית"""
    monitor = CostMonitor()
    
    # הדגמה - הוספת אירועי עלות
    logger.info("Starting cost monitoring...")
    
    # יצירת דשבורד
    monitor.generate_dashboard()
    
    # יצירת דוח
    report = monitor.generate_report()
    logger.info(f"Total cost: ${report['summary']['total_cost']:.2f}")
    logger.info(f"Daily cost: ${report['summary']['daily_cost']:.2f}")
    
    # המלצות אופטימיזציה
    optimizations = monitor.optimize_costs()
    
    total_savings = sum(
        opt['potential_savings'] 
        for opt in optimizations.values()
    )
    
    logger.info(f"\n💡 Potential savings: ${total_savings:.2f}")
    
    for category, data in optimizations.items():
        if data['recommendations']:
            logger.info(f"\n{category}:")
            for rec in data['recommendations']:
                logger.info(f"  - {rec}")
    
if __name__ == "__main__":
    main() 