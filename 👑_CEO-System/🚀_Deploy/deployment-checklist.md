# 🚀 Deployment Checklist

## Pre-Deployment Checks

### 🔐 Security
- [ ] All API keys in environment variables
- [ ] No hardcoded secrets in code
- [ ] SSL certificates configured
- [ ] CORS settings reviewed
- [ ] Rate limiting enabled
- [ ] Authentication system tested

### 💾 Database
- [ ] Database migrations run
- [ ] Backup system configured
- [ ] Connection pooling optimized
- [ ] Indexes created for performance
- [ ] Data retention policies set

### 🤖 Agents
- [ ] All 15 agents tested individually
- [ ] Integration tests passed
- [ ] Cost tracking verified
- [ ] Error handling tested
- [ ] Fallback mechanisms working

### 📊 Monitoring
- [ ] Logging configured
- [ ] Error tracking (Sentry) setup
- [ ] Performance monitoring active
- [ ] Health checks configured
- [ ] Alerts configured

### 💰 Cost Control
- [ ] Budget limits set
- [ ] Cost tracking active
- [ ] Fallback models configured
- [ ] Alert thresholds configured
- [ ] Daily reports scheduled

## Deployment Steps

### 1. Environment Setup
```bash
# Set environment variables
export NODE_ENV=production
export DATABASE_URL=postgresql://...
export OPENAI_API_KEY=sk-...
export LINKEDIN_API_KEY=...
export GITHUB_TOKEN=ghp_...
```

### 2. Build Process
```bash
# Install dependencies
npm ci --production

# Run build
npm run build

# Run database migrations
npm run migrate:prod

# Verify build
npm run verify
```

### 3. Deployment Commands

#### Vercel Deployment
```bash
# Deploy to production
vercel --prod

# Set environment variables
vercel env add OPENAI_API_KEY production
vercel env add DATABASE_URL production
# ... add all required env vars
```

#### Docker Deployment
```bash
# Build Docker image
docker build -t meunique-ai-ceo:latest .

# Run container
docker run -d \
  --name meunique-ai-ceo \
  -p 3000:3000 \
  --env-file .env.production \
  meunique-ai-ceo:latest
```

#### PM2 Deployment
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### 4. Post-Deployment Verification

#### Health Checks
```bash
# Check system health
curl https://your-domain.com/api/health

# Check agent status
curl https://your-domain.com/api/agents/status

# Verify database connection
curl https://your-domain.com/api/db/status
```

#### Smoke Tests
- [ ] Can create new candidate
- [ ] Search functionality working
- [ ] Agent communication verified
- [ ] Cost tracking active
- [ ] UI loads correctly

### 5. Monitoring Setup

#### Real-time Monitoring
```bash
# View logs
pm2 logs meunique-ai-ceo

# Monitor performance
pm2 monit

# Check metrics
curl https://your-domain.com/api/metrics
```

#### Alerts Configuration
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Error rate alerts
- [ ] Cost threshold alerts
- [ ] Performance degradation alerts
- [ ] Security incident alerts

## Rollback Plan

### Quick Rollback
```bash
# Vercel
vercel rollback

# Docker
docker stop meunique-ai-ceo
docker run -d --name meunique-ai-ceo meunique-ai-ceo:previous

# PM2
pm2 reload ecosystem.config.js --update-env
```

### Database Rollback
```bash
# Revert last migration
npm run migrate:rollback

# Restore from backup
pg_restore -d meunique_prod backup_file.sql
```

## Production Configurations

### Recommended Server Specs
- **CPU**: 4+ cores
- **RAM**: 8GB minimum
- **Storage**: 100GB SSD
- **Network**: 1Gbps
- **OS**: Ubuntu 22.04 LTS

### Scaling Considerations
- Horizontal scaling ready
- Load balancer configuration
- Redis for session management
- CDN for static assets
- Database read replicas

## Security Hardening

### Network Security
```nginx
# Nginx configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

### Application Security
- [ ] HTTPS only
- [ ] Security headers configured
- [ ] Input validation active
- [ ] SQL injection prevention
- [ ] XSS protection enabled

## Maintenance Windows

### Scheduled Maintenance
- **Time**: Sunday 2-4 AM UTC
- **Frequency**: Monthly
- **Duration**: 2 hours max
- **Notification**: 48 hours advance

### Emergency Procedures
1. Notify stakeholders
2. Enable maintenance mode
3. Perform fixes
4. Verify functionality
5. Disable maintenance mode
6. Post-mortem report

## Documentation Updates

After deployment:
- [ ] Update API documentation
- [ ] Update user guides
- [ ] Update system architecture
- [ ] Update runbooks
- [ ] Update recovery procedures

---

**⚠️ IMPORTANT**: Always test in staging before production deployment!

*Last Updated: December 2024*
*Version: 1.0.0* 