#!/bin/bash

echo "🔍 MeUnique AI CEO System - Health Check"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Function to count files
count_files() {
    local count=$(find "$1" -name "$2" -type f 2>/dev/null | wc -l)
    echo "$count"
}

echo "📁 Checking Directory Structure..."
echo "--------------------------------"
check_dir "👑_CEO-System" "CEO System directory"
check_dir "👑_CEO-System/📁_Documents" "Documents directory"
check_dir "👑_CEO-System/🤖_Agents" "Agents directory"
check_dir "src" "Source directory"
check_dir "scripts" "Scripts directory"

echo ""
echo "📄 Checking Configuration Files..."
echo "--------------------------------"
check_file "package.json" "package.json"
check_file "tsconfig.json" "tsconfig.json"
check_file "tailwind.config.js" "tailwind.config.js"
check_file "next.config.js" "next.config.js"
check_file ".gitignore" ".gitignore"

echo ""
echo "🤖 Checking Agent Files..."
echo "--------------------------------"
config_count=$(count_files "👑_CEO-System/🤖_Agents" "config.json")
impl_count=$(count_files "👑_CEO-System/🤖_Agents" "implementation.ts")
readme_count=$(count_files "👑_CEO-System/🤖_Agents" "README.md")

echo "Config files: $config_count/14"
echo "Implementation files: $impl_count/14"
echo "README files: $readme_count/14"

echo ""
echo "🌐 Checking API Routes..."
echo "--------------------------------"
route_count=$(count_files "src/app/api/ai/smart" "route.ts")
echo "API routes: $route_count/14"

echo ""
echo "📚 Checking Documentation..."
echo "--------------------------------"
doc_count=$(count_files "👑_CEO-System/📁_Documents" "*.md")
echo "Documentation files: $doc_count"

echo ""
echo "🔧 Checking Scripts..."
echo "--------------------------------"
check_file "scripts/scan_backups.sh" "Backup scanner"
check_file "scripts/migrate_legacy.sh" "Legacy migrator"
check_file "scripts/cost_monitor.py" "Cost monitor"
check_file "scripts/verify_and_fix_agents.sh" "Agent verifier"

echo ""
echo "⚙️ Checking Settings..."
echo "--------------------------------"
check_file ".cursor/settings.json" "Cursor settings"
check_file ".vscode/settings.json" "VS Code settings"

echo ""
echo "🔐 Checking Environment..."
echo "--------------------------------"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local missing - create from template${NC}"
    echo "   Run: cp 👑_CEO-System/📁_Documents/deployment/env.example .env.local"
fi

echo ""
echo "📊 Summary..."
echo "--------------------------------"
total_expected=14
completion=$((config_count * 100 / total_expected))
echo "Agent configs: ${completion}%"

impl_completion=$((impl_count * 100 / total_expected))
echo "Implementations: ${impl_completion}%"

if [ $config_count -eq 14 ] && [ $route_count -eq 14 ]; then
    echo -e "${GREEN}✅ Core system ready!${NC}"
else
    echo -e "${YELLOW}⚠️  Some components missing${NC}"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Create .env.local if missing"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo "" 