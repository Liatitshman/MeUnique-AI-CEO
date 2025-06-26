# 🔄 Recovery & Migration Guide

## 🎯 Purpose
This document serves as the complete guide for recovering, migrating, or rebuilding the MeUnique AI CEO System from scratch.

---

## 🚨 Emergency Recovery

### If Terminal is Stuck
```bash
# Option 1: Kill processes
pkill -f node
pkill -f ngrok
lsof -ti:8080 | xargs kill -9

# Option 2: Use Python script
python3 scripts/fix_terminal_issue.py

# Option 3: Clean terminal
./scripts/clean_terminal.sh
```

### If Folders Won't Create
```bash
# Use ASCII structure
./scripts/create_ascii_structure.sh

# Work in ASCII folders
cd CEO-System/Agents/Stores/
```

---

## 🏗️ Complete Rebuild Guide

### Step 1: Environment Setup
```bash
# Create new project
mkdir MeUnique-AI-CEO
cd MeUnique-AI-CEO

# Initialize git
git init

# Create package.json
npm init -y

# Install dependencies
npm install next@latest react react-dom typescript @types/react @types/node
npm install -D tailwindcss postcss autoprefixer eslint
npm install axios openai @anthropic-ai/sdk
```

### Step 2: Create Base Structure
```bash
# Create directories
mkdir -p src/app/api/ai/smart
mkdir -p src/components
mkdir -p src/lib/agents
mkdir -p "👑_CEO-System/🤖_Agents/🏪_7-Stores"
mkdir -p "👑_CEO-System/🤖_Agents/👔_4-Management"
mkdir -p "👑_CEO-System/🤖_Agents/🛠️_3-Support"
mkdir -p "👑_CEO-System/📁_Documents"
mkdir -p scripts
```

### Step 3: Core Files
Create these files in order:

1. **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

2. **next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig
```

3. **tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#7C3AED',
      },
    },
  },
  plugins: [],
}
```

### Step 4: Agent Base Infrastructure

1. **src/lib/agents/agent-base.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export interface AgentConfig {
  name: string;
  emoji: string;
  priority: number;
  costPerUse: number;
}

export abstract class AgentBase {
  protected name: string;
  protected emoji: string;
  protected priority: number;
  protected costPerUse: number;

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.emoji = config.emoji;
    this.priority = config.priority;
    this.costPerUse = config.costPerUse;
  }

  abstract process(request: NextRequest): Promise<NextResponse>;

  protected trackCost(operation: string, additionalCost: number = 0): number {
    const totalCost = this.costPerUse + additionalCost;
    console.log(`[${this.name}] ${operation} - Cost: $${totalCost.toFixed(4)}`);
    return totalCost;
  }
}
```

2. **src/lib/agents/agent-communication.ts**
```typescript
type EventHandler = (data: any) => void;

export class EventBus {
  private static instance: EventBus;
  private events: Map<string, EventHandler[]> = new Map();

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }

  emit(event: string, data: any): void {
    const handlers = this.events.get(event) || [];
    handlers.forEach(handler => handler(data));

    // Handle wildcards
    const wildcardEvent = event.split(':')[0] + ':*';
    const wildcardHandlers = this.events.get(wildcardEvent) || [];
    wildcardHandlers.forEach(handler => handler({ event, data }));
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}
```

### Step 5: Create Each Agent

For each agent, create:
1. `config.json` in agent folder
2. `implementation.ts` in agent folder
3. API route in `/api/ai/smart/[agent-name]/route.ts`

Example structure:
```
👑_CEO-System/🤖_Agents/🏪_7-Stores/💾_Smart-Database/
├── config.json
├── implementation.ts
└── README.md
```

### Step 6: Environment Configuration

Create `.env.local`:
```env
# AI Services
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# Integrations
LINKEDIN_API_KEY=your-key-here
GITHUB_TOKEN=your-token-here

# Cost Control
DAILY_BUDGET_LIMIT=100
COST_ALERT_THRESHOLD=80
MAX_COST_PER_CANDIDATE=10

# System Settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
SUPPORT_RTL=true
DEFAULT_LANGUAGE=en

# Database (future)
DATABASE_URL=postgresql://user:password@localhost:5432/meunique
```

---

## 📊 Data Migration

### From Old System
1. Export all candidate data
2. Export all job postings
3. Export all message templates
4. Export all success metrics

### Import Process
```typescript
// scripts/migrate-data.ts
import { readFileSync, writeFileSync } from 'fs';

const migrateData = async () => {
  // Read old data
  const oldData = JSON.parse(readFileSync('old-backup.json', 'utf-8'));
  
  // Transform to new format
  const newData = {
    candidates: transformCandidates(oldData.candidates),
    jobs: transformJobs(oldData.jobs),
    templates: transformTemplates(oldData.templates),
    metrics: oldData.metrics
  };
  
  // Save to new system
  writeFileSync('migrated-data.json', JSON.stringify(newData, null, 2));
};
```

---

## 🔍 Verification Checklist

### System Health Check
```bash
# Run health check script
./scripts/system_health_check.sh

# Expected output:
# ✓ All agents configured
# ✓ API routes accessible
# ✓ Environment variables set
# ✓ Dependencies installed
```

### Manual Verification
- [ ] Can access unified interface at `/unified`
- [ ] All 15 agents show in dashboard
- [ ] API endpoints respond correctly
- [ ] Cost tracking works
- [ ] Event bus communication works

---

## 🚀 Production Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
# ... etc
```

### Docker Alternative
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📱 Backup Strategy

### Automated Backups
```bash
# Create backup script
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$TIMESTAMP"

mkdir -p $BACKUP_DIR

# Backup code
cp -r src $BACKUP_DIR/
cp -r "👑_CEO-System" $BACKUP_DIR/

# Backup data
pg_dump $DATABASE_URL > $BACKUP_DIR/database.sql

# Create archive
tar -czf "backup_$TIMESTAMP.tar.gz" $BACKUP_DIR

echo "Backup created: backup_$TIMESTAMP.tar.gz"
EOF

chmod +x scripts/backup.sh
```

### Recovery from Backup
```bash
# Extract backup
tar -xzf backup_20240101_120000.tar.gz

# Restore code
cp -r backup/src/* src/
cp -r "backup/👑_CEO-System/*" "👑_CEO-System/"

# Restore database
psql $DATABASE_URL < backup/database.sql
```

---

## 🆘 Troubleshooting

### Common Issues

#### Issue: Agents not communicating
**Solution**: Check EventBus initialization in each agent

#### Issue: High costs
**Solution**: 
- Check CFO agent logs
- Adjust DAILY_BUDGET_LIMIT
- Review agent costPerUse settings

#### Issue: Poor response rates
**Solution**:
- Review Message Crafter templates
- Check personalization scores
- A/B test different approaches

#### Issue: Slow performance
**Solution**:
- Enable parallel agent execution
- Optimize database queries
- Use caching for repeated operations

---

## 📞 Support Resources

### Documentation
- Master Knowledge Archive: `MASTER_KNOWLEDGE_ARCHIVE.md`
- Conversation History: `COMPLETE_CONVERSATION_HISTORY.md`
- System Status: `FINAL_SYSTEM_STATUS.md`

### Scripts
- `fix_terminal_issue.py` - Terminal problems
- `create_ascii_structure.sh` - Folder structure
- `system_health_check.sh` - Health verification
- `cost_monitor.py` - Cost tracking

### Key Files
- Agent configs: `*/config.json`
- Agent implementations: `*/implementation.ts`
- API routes: `/api/ai/smart/*/route.ts`
- Unified interface: `/app/unified/page.tsx`

---

## ✅ Final Verification

Before considering the system recovered:

1. **All agents operational**: Check each agent responds
2. **Cost tracking active**: Verify CFO oversight
3. **Event bus working**: Test agent communication
4. **API accessible**: Test all endpoints
5. **UI functional**: Access unified interface
6. **Data migrated**: Verify all historical data
7. **Backups configured**: Ensure backup script runs
8. **Monitoring active**: Check health monitoring

---

*This guide ensures complete system recovery and migration capability. Keep it updated with any system changes.* 