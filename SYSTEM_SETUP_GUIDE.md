# 🚀 MeUnique AI CEO System - Complete Setup Guide

## 📋 Pre-Installation Checklist

### ✅ System Requirements
- Node.js 18+ 
- npm or yarn
- Git
- Terminal with UTF-8 support (for emoji folders)

### ✅ Required API Keys
- [ ] OpenAI API Key
- [ ] Anthropic (Claude) API Key
- [ ] Supabase Project URL & Keys
- [ ] LinkedIn API Credentials (optional)
- [ ] GitHub Token (optional)

## 🛠️ Installation Steps

### 1. Clone and Setup
```bash
# If you haven't cloned yet
git clone [your-repo-url]
cd MeUnique-AI-CEO

# Check system health
chmod +x scripts/system_health_check.sh
./scripts/system_health_check.sh
```

### 2. Environment Setup
```bash
# Create .env.local from template
cp 👑_CEO-System/📁_Documents/deployment/env.example .env.local

# Edit .env.local and add your keys
nano .env.local  # or use your preferred editor
```

### 3. Install Dependencies
```bash
# Install all packages
npm install

# If you encounter issues with emoji folders:
npm install --force
```

### 4. Database Setup (Supabase)
```sql
-- Run these in Supabase SQL editor

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  culture_analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Candidates table  
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  profile_data JSONB,
  personality_analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  title TEXT,
  requirements JSONB,
  ideal_profile JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
```

### 5. Verify Installation
```bash
# Run health check again
./scripts/system_health_check.sh

# Start development server
npm run dev
```

### 6. Access the System
- Main UI: http://localhost:3000/unified
- API Docs: http://localhost:3000/api/ai/smart/status

## 🔧 Troubleshooting

### Terminal Issues with Emoji Folders
If terminal freezes with emoji folders:
```bash
# Option 1: Use quotes
cd "👑_CEO-System"

# Option 2: Use tab completion
cd 👑[TAB]

# Option 3: Rename folders (last resort)
mv "👑_CEO-System" "CEO-System"
```

### Missing Implementation Files
The system works with just config files. Implementations can be added incrementally:
```bash
# Check what's missing
find 👑_CEO-System/🤖_Agents -name "implementation.ts" | wc -l

# Create stub implementations
./scripts/verify_and_fix_agents.sh
```

### Cost Monitoring Setup
```bash
# Start cost monitor in separate terminal
python3 scripts/cost_monitor.py

# Or run in background
nohup python3 scripts/cost_monitor.py > costs.log &
```

## 🎯 Quick Start Examples

### 1. Test Smart Database
```bash
curl -X POST http://localhost:3000/api/ai/smart/smart-database \
  -H "Content-Type: application/json" \
  -d '{"action": "map_resources", "data": {}}'
```

### 2. Test Culture Matcher
```bash
curl -X POST http://localhost:3000/api/ai/smart/culture-matcher \
  -H "Content-Type: application/json" \
  -d '{"action": "analyze", "company": "Example Corp"}'
```

### 3. Test Message Crafter
```bash
curl -X POST http://localhost:3000/api/ai/smart/message-crafter \
  -H "Content-Type: application/json" \
  -d '{"action": "craft", "candidate": "John Doe", "language": "he"}'
```

## 📊 System Status Commands

```bash
# Check all agents
curl http://localhost:3000/api/ai/smart/status

# Check costs
curl http://localhost:3000/api/ai/smart/cfo/costs

# Check health
curl http://localhost:3000/api/health
```

## 🔐 Security Notes

1. **Never commit .env.local**
2. **Rotate API keys regularly**
3. **Use environment-specific configs**
4. **Monitor costs daily**

## 📚 Additional Resources

- Full Documentation: `👑_CEO-System/📁_Documents/`
- API Reference: `src/app/api/ai/smart/README.md`
- Agent Configs: `👑_CEO-System/🤖_Agents/*/config.json`

## 🆘 Support

If you encounter issues:
1. Run `./scripts/system_health_check.sh`
2. Check logs in terminal
3. Verify all environment variables
4. Ensure database is connected

---

**Ready to revolutionize recruiting with AI!** 🚀 