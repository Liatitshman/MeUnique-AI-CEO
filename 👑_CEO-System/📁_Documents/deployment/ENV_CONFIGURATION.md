# 🔐 Environment Configuration Guide

## 📋 Overview
This document contains all environment variables and configuration needed for the MeUnique AI CEO System.

## 🔑 Required Environment Variables

### Create a `.env.local` file in the root directory:

```env
# ===========================
# 🤖 AI/ML Services
# ===========================

# OpenAI Configuration
OPENAI_API_KEY=sk-...your-key-here
OPENAI_ORG_ID=org-...your-org-id
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Claude/Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-...your-key-here
CLAUDE_MODEL=claude-3-opus-20240229

# ===========================
# 🔗 Integration APIs
# ===========================

# LinkedIn Integration
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
LINKEDIN_SALES_NAV_API_KEY=your-sales-nav-key

# GitHub Integration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_ACCESS_TOKEN=ghp_...your-token

# ===========================
# ☁️ Google Cloud Services
# ===========================

# Google Cloud Platform
GOOGLE_CLOUD_PROJECT_ID=meunique-ai-ceo
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json

# Google Services
GOOGLE_MAPS_API_KEY=AIza...your-maps-key
GOOGLE_TRANSLATE_API_KEY=AIza...your-translate-key
GOOGLE_CUSTOM_SEARCH_API_KEY=AIza...your-search-key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your-cse-id

# Google Cloud Billing (for cost monitoring)
GOOGLE_CLOUD_BILLING_ACCOUNT_ID=your-billing-account
GOOGLE_CLOUD_BILLING_BUDGET_ID=your-budget-id

# ===========================
# 📧 Communication Services
# ===========================

# Email Service (SendGrid)
SENDGRID_API_KEY=SG...your-key
SENDGRID_FROM_EMAIL=noreply@meunique.ai
SENDGRID_REPLY_TO=support@meunique.ai

# WhatsApp Business
WHATSAPP_BUSINESS_API_KEY=your-whatsapp-key
WHATSAPP_BUSINESS_PHONE_ID=your-phone-id

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=AC...your-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# ===========================
# 💾 Database Configuration
# ===========================

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Redis (for caching)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# ===========================
# 🔐 Security & Auth
# ===========================

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-minimum-32-chars

# Encryption
ENCRYPTION_KEY=your-32-char-encryption-key
JWT_SECRET=your-jwt-secret

# ===========================
# 📊 Monitoring & Analytics
# ===========================

# Sentry (Error Tracking)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=meunique
SENTRY_PROJECT=ai-ceo-system

# Google Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Mixpanel
MIXPANEL_TOKEN=your-mixpanel-token

# ===========================
# 💰 Payment & Billing
# ===========================

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ===========================
# 🚀 Deployment
# ===========================

# Vercel
VERCEL_URL=https://meunique-ai.vercel.app
VERCEL_ENV=production

# Feature Flags
ENABLE_COST_MONITORING=true
ENABLE_HEBREW_SUPPORT=true
ENABLE_DARK_MODE=true
ENABLE_A_B_TESTING=true

# ===========================
# 🎯 System Configuration
# ===========================

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=100

# Cost Limits
DAILY_COST_LIMIT=500
MONTHLY_COST_LIMIT=10000
COST_ALERT_THRESHOLD=100

# Performance
MAX_CONCURRENT_AGENTS=10
AGENT_TIMEOUT_SECONDS=30
CACHE_TTL_SECONDS=3600

# ===========================
# 🌍 Localization
# ===========================

# Supported Languages
DEFAULT_LANGUAGE=he
SUPPORTED_LANGUAGES=he,en
RTL_LANGUAGES=he,ar

# Timezone
DEFAULT_TIMEZONE=Asia/Jerusalem
```

## 🛡️ Security Best Practices

### 1. Never commit `.env.local` to git
Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

### 2. Use different keys for different environments
- Development: `.env.local`
- Staging: `.env.staging`
- Production: `.env.production`

### 3. Rotate keys regularly
- API keys: Every 90 days
- Encryption keys: Every 180 days
- Passwords: Every 60 days

### 4. Use secrets management in production
- Vercel Environment Variables
- AWS Secrets Manager
- Google Secret Manager

## 🔄 Environment Setup Script

Create `scripts/setup-env.js`:
```javascript
const fs = require('fs');
const path = require('path');

const envTemplate = `
# Copy this file to .env.local and fill in your values
${fs.readFileSync('.env.example', 'utf8')}
`;

if (!fs.existsSync('.env.local')) {
  fs.writeFileSync('.env.local', envTemplate);
  console.log('✅ Created .env.local file');
  console.log('📝 Please fill in your API keys');
} else {
  console.log('⚠️  .env.local already exists');
}
```

## 🧪 Validation Script

Create `scripts/validate-env.js`:
```javascript
const required = [
  'OPENAI_API_KEY',
  'LINKEDIN_CLIENT_ID',
  'GOOGLE_CLOUD_PROJECT_ID',
  'SUPABASE_URL',
  'NEXTAUTH_SECRET'
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
}
```

## 📊 Cost Monitoring Configuration

### Google Cloud Billing Alerts
```javascript
// config/billing.js
export const billingConfig = {
  alerts: [
    { threshold: 100, channel: 'email' },
    { threshold: 500, channel: 'sms' },
    { threshold: 1000, channel: 'slack' }
  ],
  
  quotas: {
    openai: { daily: 100, monthly: 2000 },
    linkedin: { daily: 50, monthly: 1000 },
    google: { daily: 30, monthly: 500 }
  }
};
```

## 🚀 Production Checklist

- [ ] All API keys are production keys
- [ ] Encryption keys are strong and unique
- [ ] Rate limits are configured
- [ ] Cost monitoring is enabled
- [ ] Error tracking is connected
- [ ] Analytics are configured
- [ ] Backup systems are in place
- [ ] Security headers are set

---

*Remember: Security is not optional. Treat API keys like passwords!* 🔐 