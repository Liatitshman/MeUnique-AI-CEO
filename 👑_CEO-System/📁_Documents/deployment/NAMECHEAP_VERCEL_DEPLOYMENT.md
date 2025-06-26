# 🚀 Namecheap + Vercel Complete Deployment Guide

## 📋 Overview
מדריך מלא להעלאת MeUnique AI CEO לפרודקשן עם Namecheap ו-Vercel

## 🌐 Step 1: Domain Setup (Namecheap)

### 1.1 Purchase Domain
```
Domain suggestions:
- meunique.ai ✨ (recommended)
- meunique.io
- meunique.app
- meunique.co.il (for Israeli market)
```

### 1.2 DNS Configuration
Login to Namecheap → Domain List → Manage → Advanced DNS

#### Remove Default Records
Delete all existing records except:
- URL Redirect Record
- TXT Record for domain verification

#### Add Vercel DNS Records
```
Type: A
Host: @
Value: 76.76.21.21
TTL: Automatic

Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

#### For Subdomains (Optional)
```
Type: CNAME
Host: app
Value: cname.vercel-dns.com
TTL: Automatic

Type: CNAME
Host: api
Value: cname.vercel-dns.com
TTL: Automatic
```

## 🔧 Step 2: Vercel Setup

### 2.1 Import from GitHub
```bash
# Ensure your repo is pushed to GitHub first
git push origin main
```

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select: Liatishman/MeUnique-AI-CEO
4. Configure:
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 2.2 Environment Variables (Critical!)
Add ALL these in Vercel Dashboard → Settings → Environment Variables:

```env
# 🤖 AI Services (Required)
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...

# 🔗 LinkedIn (Required for sourcing)
LINKEDIN_CLIENT_ID=86...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=https://meunique.ai/api/auth/linkedin/callback

# 📧 Email Service
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=hello@meunique.ai
SENDGRID_REPLY_TO=support@meunique.ai

# 💾 Database
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# 🔐 Security
NEXTAUTH_URL=https://meunique.ai
NEXTAUTH_SECRET=generate-32-chars-here
ENCRYPTION_KEY=another-32-chars-here

# 📊 Monitoring
SENTRY_DSN=https://...@sentry.io/...
GA_MEASUREMENT_ID=G-...

# 💰 Cost Control
DAILY_BUDGET_LIMIT=100
MONTHLY_BUDGET_LIMIT=2500
COST_ALERT_THRESHOLD=80

# 🌍 System Config
DEFAULT_LANGUAGE=he
SUPPORT_RTL=true
ENABLE_HEBREW_SUPPORT=true
DEFAULT_TIMEZONE=Asia/Jerusalem

# 🚀 Features
ENABLE_COST_MONITORING=true
ENABLE_DARK_MODE=true
ENABLE_A_B_TESTING=true
MAX_CONCURRENT_AGENTS=10
```

### 2.3 Domain Connection
1. Go to Vercel Dashboard → Settings → Domains
2. Add domain: `meunique.ai`
3. Add www: `www.meunique.ai`
4. Vercel will verify DNS (takes 5-30 minutes)

## 📱 Step 3: SSL & Security

### 3.1 SSL Certificate
✅ Vercel provides automatic SSL - no action needed!

### 3.2 Security Headers
Create/update `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

## 🔄 Step 4: Continuous Deployment

### 4.1 Auto-Deploy Setup
Vercel automatically deploys on:
- Push to `main` branch → Production
- Pull requests → Preview deployments

### 4.2 GitHub Actions (Optional Enhancement)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🌐 Step 5: Network Fallback (WiFi/Hotspot)

### 5.1 Auto-Network Script
Create `scripts/network-fallback.sh`:
```bash
#!/bin/bash

# Network fallback for macOS
PRIMARY_WIFI="YourWiFiName"
HOTSPOT_NAME="iPhone"

check_network() {
  if ! ping -c 1 google.com &> /dev/null; then
    echo "Primary network down, switching to hotspot..."
    networksetup -setairportnetwork en0 "$HOTSPOT_NAME" "password"
  fi
}

# Run every 30 seconds
while true; do
  check_network
  sleep 30
done
```

### 5.2 LaunchD Service
Create `~/Library/LaunchAgents/com.meunique.network.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.meunique.network</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/liattishman/Desktop/MeUnique-AI-CEO/scripts/network-fallback.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load service:
```bash
launchctl load ~/Library/LaunchAgents/com.meunique.network.plist
```

## 📊 Step 6: Production Monitoring

### 6.1 Vercel Analytics
- Automatically enabled
- View at: https://vercel.com/[your-team]/meunique-ai-ceo/analytics

### 6.2 Custom Monitoring Dashboard
Create `pages/api/status.ts`:
```typescript
export default async function handler(req, res) {
  const status = {
    agents: await checkAgentsHealth(),
    database: await checkDatabaseConnection(),
    apis: await checkAPIKeys(),
    cost: await getCurrentCost(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  };
  
  res.status(200).json(status);
}
```

### 6.3 Uptime Monitoring
1. Sign up at https://uptimerobot.com
2. Add monitor:
   - URL: https://meunique.ai/api/health
   - Check every: 5 minutes
   - Alert contacts: Your email/SMS

## 🚀 Step 7: Go Live Checklist

### Pre-Launch
- [ ] All environment variables set in Vercel
- [ ] Domain DNS propagated (check with `nslookup meunique.ai`)
- [ ] SSL certificate active (green padlock)
- [ ] Test all API endpoints
- [ ] Verify agent health checks
- [ ] Cost monitoring active
- [ ] Error tracking (Sentry) receiving events

### Launch Day
- [ ] Announce on social media
- [ ] Enable Google Analytics
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify cost tracking

### Post-Launch (First Week)
- [ ] Daily cost review
- [ ] Performance optimization
- [ ] User feedback collection
- [ ] A/B test results
- [ ] Scale if needed

## 🔧 Troubleshooting

### Common Issues

#### Domain Not Working
```bash
# Check DNS propagation
nslookup meunique.ai
dig meunique.ai

# Clear DNS cache (macOS)
sudo dscacheutil -flushcache
```

#### Build Failures
```bash
# Check build logs in Vercel
# Common fixes:
- Verify all dependencies in package.json
- Check for missing environment variables
- Ensure no hardcoded localhost URLs
```

#### Slow Performance
```javascript
// Add caching headers
res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
```

## 📱 Mobile Optimization

### PWA Configuration
Create `public/manifest.json`:
```json
{
  "name": "MeUnique AI CEO",
  "short_name": "MeUnique",
  "description": "AI-powered recruitment with 45%+ response rates",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🎉 Success Metrics

### Week 1 Goals
- [ ] 100+ daily active users
- [ ] < 2% error rate
- [ ] < 3s page load time
- [ ] 45%+ response rate maintained
- [ ] Cost per candidate < $1.50

### Month 1 Goals
- [ ] 1000+ candidates processed
- [ ] 10+ successful hires
- [ ] 99.9% uptime
- [ ] Positive user feedback
- [ ] ROI demonstrated

---

**🚀 Your MeUnique AI CEO is now LIVE at https://meunique.ai!**

*For support: support@meunique.ai*
*Documentation: https://docs.meunique.ai* 