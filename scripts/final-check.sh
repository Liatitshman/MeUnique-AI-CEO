#!/bin/bash

echo "🔍 Running final checks before Git push..."
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0

# 1. Check for problematic folders
echo -e "\n📁 Checking for problematic folders..."
if find . -name "Liatitshman-MeUnique.AI" -o -name "🎯_MeUnique-Business-FINAL" | grep -q .; then
    echo -e "${RED}❌ Found problematic folders!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No problematic folders found${NC}"
fi

# 2. Check for duplicate MeUnique-AI-CEO folder
if [ -d "MeUnique-AI-CEO" ]; then
    echo -e "${RED}❌ Found duplicate MeUnique-AI-CEO folder!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No duplicate folders${NC}"
fi

# 3. Count total agents
echo -e "\n🤖 Checking agents..."
AGENT_COUNT=$(find 👑_CEO-System/🤖_Agents -name "implementation.ts" | wc -l)
echo -e "Found ${AGENT_COUNT} agents implemented"
if [ $AGENT_COUNT -eq 15 ]; then
    echo -e "${GREEN}✅ All 15 agents implemented${NC}"
else
    echo -e "${YELLOW}⚠️  Expected 15 agents, found $AGENT_COUNT${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. Check API routes
echo -e "\n🌐 Checking API routes..."
API_ROUTES=$(find src/app/api/ai/smart -name "route.ts" | wc -l)
echo -e "Found ${API_ROUTES} API routes"
if [ $API_ROUTES -ge 12 ]; then
    echo -e "${GREEN}✅ All API routes present${NC}"
else
    echo -e "${YELLOW}⚠️  Some API routes might be missing${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. Check for .env files in git
echo -e "\n🔒 Checking for sensitive files..."
if git ls-files | grep -E "\.env$|\.env\.local$" | grep -q .; then
    echo -e "${RED}❌ Found .env files in git!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No .env files in git${NC}"
fi

# 6. Check file sizes
echo -e "\n📊 Checking for large files..."
LARGE_FILES=$(find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.next/*" 2>/dev/null)
if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  Found large files:${NC}"
    echo "$LARGE_FILES"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No large files found${NC}"
fi

# 7. Check Git status
echo -e "\n📝 Git status:"
git status --short

# 8. Count total files
TOTAL_FILES=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.next/*" | wc -l)
echo -e "\n📈 Total project files: $TOTAL_FILES"

# Summary
echo -e "\n========================================"
echo -e "📊 FINAL CHECK SUMMARY"
echo -e "========================================"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

if [ $ERRORS -gt 0 ]; then
    echo -e "\n${RED}❌ Please fix errors before pushing!${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  Review warnings before pushing${NC}"
    echo -e "Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "\n${GREEN}✅ All checks passed! Ready to push.${NC}"
fi

echo -e "\n🚀 Next steps:"
echo "1. git add ."
echo "2. git commit -m \"Complete MeUnique AI CEO System - All 15 agents implemented\""
echo "3. git push origin main" 