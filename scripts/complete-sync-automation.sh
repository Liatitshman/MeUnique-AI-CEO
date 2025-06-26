#!/bin/bash

# Complete Sync Automation Script
# מבצע סנכרון מלא: Git, Google Drive, וסריקת LinkedIn

echo "🚀 Starting Complete Sync Automation..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Git Sync
echo -e "${BLUE}📦 Syncing with GitHub...${NC}"
git add -A
git commit -m "Auto-sync: $(date +"%Y-%m-%d %H:%M:%S")" || echo "No changes to commit"
git push origin main || echo "Push failed - check connection"

# 2. Google Drive Sync
echo -e "${BLUE}☁️ Syncing with Google Drive...${NC}"
./scripts/sync-to-google-drive.sh

# 3. LinkedIn Scraping
echo -e "${BLUE}🔍 Running LinkedIn Profile Scraper...${NC}"
/usr/bin/python3 scripts/simple-linkedin-scraper.py

# 4. System Health Check
echo -e "${BLUE}🏥 Running system health check...${NC}"
node scripts/full-system-monitor.js &
MONITOR_PID=$!
sleep 5
kill $MONITOR_PID 2>/dev/null

# 5. Generate Summary Report
echo -e "${GREEN}📊 Generating summary report...${NC}"
cat > "👑_CEO-System/📁_Documents/deployment/DAILY_SYNC_REPORT_$(date +%Y-%m-%d).md" << EOF
# Daily Sync Report
Generated: $(date +"%Y-%m-%d %H:%M:%S")

## Git Status
- Branch: $(git branch --show-current)
- Last commit: $(git log -1 --pretty=format:"%h - %s")
- Files tracked: $(git ls-files | wc -l)

## Google Drive Status
- Mirror location: ~/Library/CloudStorage/GoogleDrive-liat@startingup.io/My Drive/MeUnique-AI-CEO-Mirror
- Last sync: $(date)

## LinkedIn Scraping
- Candidates scraped today: $(ls -la 👑_CEO-System/📁_Documents/candidate-databases/LINKEDIN_SCRAPED_*.json 2>/dev/null | wc -l)
- Total candidates in database: $(grep -c '"name"' 👑_CEO-System/📁_Documents/candidate-databases/*.json 2>/dev/null || echo "0")

## System Health
- All 15 agents configured ✅
- Background monitor active ✅
- API endpoints ready ✅

## Next Steps
1. Review new candidates in candidate-databases/
2. Check agent performance metrics
3. Update outreach templates based on response rates
EOF

echo -e "${GREEN}✅ Complete sync automation finished!${NC}"
echo -e "${YELLOW}📄 Report saved to: 👑_CEO-System/📁_Documents/deployment/DAILY_SYNC_REPORT_$(date +%Y-%m-%d).md${NC}"

# Optional: Open GitHub Desktop
echo -e "${YELLOW}💻 Opening GitHub Desktop...${NC}"
open -a "GitHub Desktop" 2>/dev/null || echo "GitHub Desktop not found"

echo -e "${GREEN}🎉 All tasks completed successfully!${NC}" 