#!/usr/bin/env python3
"""
MeUnique Cost Monitor
Real-time cost tracking and budget protection
"""

import os
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests

# Configuration
MAX_DAILY_SPEND = float(os.getenv("MAX_DAILY_SPEND", "500"))
ALERT_THRESHOLD = float(os.getenv("COST_ALERT_THRESHOLD", "100"))
FALLBACK_THRESHOLD = 0.2  # Switch to free models at 20% budget

# Model pricing (per 1K tokens)
MODEL_PRICING = {
    "gpt-4-turbo": 0.06,
    "gpt-4": 0.06,
    "gpt-3.5-turbo": 0.002,
    "claude-3-opus": 0.08,
    "claude-3-sonnet": 0.03,
    "ollama/llama3": 0.0,  # Free
    "ollama/mixtral": 0.0,  # Free
    "ollama/codellama": 0.0,  # Free
}

class CostMonitor:
    def __init__(self):
        self.daily_costs = {}
        self.load_cost_history()
        
    def load_cost_history(self):
        """Load cost history from file"""
        try:
            with open("costs/daily_costs.json", "r") as f:
                self.daily_costs = json.load(f)
        except FileNotFoundError:
            self.daily_costs = {}
    
    def save_cost_history(self):
        """Save cost history to file"""
        os.makedirs("costs", exist_ok=True)
        with open("costs/daily_costs.json", "w") as f:
            json.dump(self.daily_costs, f, indent=2)
    
    def log_usage(self, model: str, tokens: int, agent: str):
        """Log API usage and cost"""
        today = datetime.now().strftime("%Y-%m-%d")
        cost = self.calculate_cost(model, tokens)
        
        if today not in self.daily_costs:
            self.daily_costs[today] = {
                "total": 0,
                "by_model": {},
                "by_agent": {},
                "api_calls": 0
            }
        
        # Update totals
        self.daily_costs[today]["total"] += cost
        self.daily_costs[today]["api_calls"] += 1
        
        # Update by model
        if model not in self.daily_costs[today]["by_model"]:
            self.daily_costs[today]["by_model"][model] = {"cost": 0, "tokens": 0}
        self.daily_costs[today]["by_model"][model]["cost"] += cost
        self.daily_costs[today]["by_model"][model]["tokens"] += tokens
        
        # Update by agent
        if agent not in self.daily_costs[today]["by_agent"]:
            self.daily_costs[today]["by_agent"][agent] = 0
        self.daily_costs[today]["by_agent"][agent] += cost
        
        # Check thresholds
        self.check_thresholds(today)
        
        # Save
        self.save_cost_history()
        
        return cost
    
    def calculate_cost(self, model: str, tokens: int) -> float:
        """Calculate cost for tokens"""
        price_per_1k = MODEL_PRICING.get(model, 0.002)  # Default to GPT-3.5 price
        return (tokens / 1000) * price_per_1k
    
    def get_daily_spend(self) -> float:
        """Get today's total spend"""
        today = datetime.now().strftime("%Y-%m-%d")
        return self.daily_costs.get(today, {}).get("total", 0)
    
    def get_remaining_budget(self) -> float:
        """Get remaining daily budget"""
        return MAX_DAILY_SPEND - self.get_daily_spend()
    
    def select_model(self, priority: str = "medium", agent: str = "unknown") -> str:
        """Select best model based on budget and priority"""
        remaining = self.get_remaining_budget()
        budget_percent = remaining / MAX_DAILY_SPEND
        
        # Emergency stop
        if budget_percent <= 0.05:
            print("🚨 EMERGENCY: Budget nearly exhausted! Using free models only.")
            return "ollama/llama3"
        
        # Fallback to free models
        if budget_percent <= FALLBACK_THRESHOLD:
            print(f"⚠️  Low budget ({budget_percent:.1%}). Using free models.")
            return "ollama/mixtral"
        
        # Normal operation
        if priority == "high" and budget_percent > 0.5:
            return "gpt-4-turbo"
        elif priority == "low" or budget_percent < 0.3:
            return "gpt-3.5-turbo"
        else:
            return "gpt-3.5-turbo"  # Default
    
    def check_thresholds(self, date: str):
        """Check cost thresholds and alert if needed"""
        total = self.daily_costs[date]["total"]
        
        if total >= MAX_DAILY_SPEND * 0.95:
            self.send_alert("CRITICAL", f"Daily spend at 95%: ${total:.2f}")
        elif total >= ALERT_THRESHOLD:
            self.send_alert("WARNING", f"Daily spend exceeded alert threshold: ${total:.2f}")
    
    def send_alert(self, level: str, message: str):
        """Send cost alert"""
        print(f"{'🚨' if level == 'CRITICAL' else '⚠️'} {level}: {message}")
        
        # Send to Slack if configured
        slack_webhook = os.getenv("SLACK_WEBHOOK_URL")
        if slack_webhook:
            try:
                requests.post(slack_webhook, json={
                    "text": f"{level}: {message}",
                    "channel": "#cost-alerts"
                })
            except:
                pass
    
    def get_report(self) -> Dict:
        """Generate cost report"""
        today = datetime.now().strftime("%Y-%m-%d")
        daily_data = self.daily_costs.get(today, {})
        
        return {
            "date": today,
            "total_spend": daily_data.get("total", 0),
            "remaining_budget": self.get_remaining_budget(),
            "budget_used_percent": (self.get_daily_spend() / MAX_DAILY_SPEND) * 100,
            "api_calls": daily_data.get("api_calls", 0),
            "by_model": daily_data.get("by_model", {}),
            "by_agent": daily_data.get("by_agent", {}),
            "recommended_model": self.select_model(),
            "alerts": []
        }

def main():
    """Run cost monitor as standalone service"""
    monitor = CostMonitor()
    
    print("💰 MeUnique Cost Monitor Started")
    print(f"📊 Daily Budget: ${MAX_DAILY_SPEND}")
    print(f"🚨 Alert Threshold: ${ALERT_THRESHOLD}")
    print("")
    
    while True:
        report = monitor.get_report()
        
        # Clear screen
        os.system('clear' if os.name == 'posix' else 'cls')
        
        # Display report
        print("💰 MeUnique Cost Monitor")
        print("=" * 50)
        print(f"📅 Date: {report['date']}")
        print(f"💵 Total Spend: ${report['total_spend']:.2f}")
        print(f"💰 Remaining: ${report['remaining_budget']:.2f}")
        print(f"📊 Budget Used: {report['budget_used_percent']:.1f}%")
        print(f"🔧 API Calls: {report['api_calls']}")
        print(f"🤖 Recommended Model: {report['recommended_model']}")
        print("")
        
        if report['by_model']:
            print("📈 By Model:")
            for model, data in report['by_model'].items():
                print(f"  {model}: ${data['cost']:.2f} ({data['tokens']:,} tokens)")
        
        if report['by_agent']:
            print("\n🤖 By Agent:")
            for agent, cost in sorted(report['by_agent'].items(), key=lambda x: x[1], reverse=True):
                print(f"  {agent}: ${cost:.2f}")
        
        # Sleep for 30 seconds
        time.sleep(30)

if __name__ == "__main__":
    main() 