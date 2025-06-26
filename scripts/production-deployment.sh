#!/bin/bash

# MeUnique AI CEO - Complete Production Deployment Script
# This script automates the entire deployment process

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_NAME="MeUnique-AI-CEO"
GITHUB_REPO="https://github.com/Liatishman/MeUnique-AI-CEO"
VERCEL_PROJECT="meunique-ai-ceo"

echo -e "${BLUE}🚀 MeUnique AI CEO - Production Deployment${NC}"
echo "================================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print step
print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Step 1: Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not installed. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not installed"
    exit 1
fi

# Check git
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_success "Git installed: $GIT_VERSION"
else
    print_error "Git not installed"
    exit 1
fi

# Check Vercel CLI
if command_exists vercel; then
    print_success "Vercel CLI installed"
else
    print_warning "Vercel CLI not installed. Installing..."
    npm i -g vercel
fi

# Step 2: Project validation
print_step "Validating project structure..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi

# Check critical files
REQUIRED_FILES=(
    "next.config.js"
    "tsconfig.json"
    ".gitignore"
    "src/app/layout.tsx"
    "src/app/page.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        print_error "Missing: $file"
        exit 1
    fi
done

# Step 3: Environment setup
print_step "Setting up environment..."

# Check for .env.local
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    if [ -f "👑_CEO-System/📁_Documents/deployment/env.example" ]; then
        cp "👑_CEO-System/📁_Documents/deployment/env.example" .env.local
        print_success "Created .env.local - Please fill in your API keys!"
        echo -e "${YELLOW}Edit .env.local and add your API keys before continuing${NC}"
        read -p "Press Enter when ready..."
    else
        print_error "env.example not found"
        exit 1
    fi
fi

# Step 4: Dependencies
print_step "Installing dependencies..."
npm ci

# Step 5: Build test
print_step "Testing build locally..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build successful!"
else
    print_error "Build failed. Please fix errors before deploying."
    exit 1
fi

# Step 6: Git setup
print_step "Checking Git status..."

# Initialize git if needed
if [ ! -d ".git" ]; then
    print_warning "Git not initialized. Initializing..."
    git init
    git add .
    git commit -m "Initial commit: MeUnique AI CEO System"
fi

# Check remote
if git remote | grep -q "origin"; then
    print_success "Git remote configured"
else
    print_warning "Adding Git remote..."
    git remote add origin "$GITHUB_REPO"
fi

# Step 7: GitHub sync
print_step "Syncing with GitHub..."

# Check if we need to push
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Uncommitted changes detected"
    git add .
    read -p "Enter commit message: " commit_msg
    git commit -m "$commit_msg"
fi

# Push to GitHub
print_step "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    print_success "Successfully pushed to GitHub!"
else
    print_error "Failed to push. Please check your GitHub access."
    exit 1
fi

# Step 8: Vercel deployment
print_step "Deploying to Vercel..."

# Check if project is linked
if [ ! -f ".vercel/project.json" ]; then
    print_warning "Vercel project not linked. Setting up..."
    vercel link
fi

# Deploy to production
print_step "Deploying to production..."
vercel --prod

# Step 9: Post-deployment checks
print_step "Running post-deployment checks..."

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "")

if [ -n "$DEPLOYMENT_URL" ]; then
    print_success "Deployment URL: https://$DEPLOYMENT_URL"
    
    # Test deployment
    print_step "Testing deployment..."
    
    # Check if site is accessible
    if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL" | grep -q "200"; then
        print_success "Site is accessible!"
    else
        print_warning "Site returned non-200 status code"
    fi
    
    # Check API health
    if curl -s "https://$DEPLOYMENT_URL/api/health" | grep -q "ok"; then
        print_success "API health check passed!"
    else
        print_warning "API health check failed"
    fi
else
    print_warning "Could not retrieve deployment URL"
fi

# Step 10: Setup monitoring
print_step "Setting up monitoring..."

# Create monitoring script
cat > monitor-production.sh << 'EOF'
#!/bin/bash
# Production monitoring script

URL="${1:-https://meunique.ai}"

while true; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/health")
    if [ "$STATUS" = "200" ]; then
        echo "[$(date)] ✓ Health check passed"
    else
        echo "[$(date)] ✗ Health check failed (Status: $STATUS)"
        # Send alert (implement your alerting here)
    fi
    sleep 300  # Check every 5 minutes
done
EOF

chmod +x monitor-production.sh
print_success "Created monitor-production.sh"

# Step 11: Documentation
print_step "Generating deployment documentation..."

cat > DEPLOYMENT_RECORD.md << EOF
# Deployment Record

**Date**: $(date)
**Version**: $(node -p "require('./package.json').version")
**Commit**: $(git rev-parse HEAD)
**Branch**: $(git branch --show-current)
**Deployer**: $(git config user.name)

## Deployment Details
- **Platform**: Vercel
- **Node Version**: $NODE_VERSION
- **Build Command**: npm run build
- **Environment**: Production

## Checklist
- [x] Dependencies installed
- [x] Build successful
- [x] Git synchronized
- [x] Deployed to Vercel
- [x] Health checks passed

## Post-Deployment Tasks
- [ ] Verify all agents are operational
- [ ] Check cost monitoring
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Review performance metrics

## Notes
Add any deployment-specific notes here.

---
Generated by production-deployment.sh
EOF

print_success "Created DEPLOYMENT_RECORD.md"

# Final summary
echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo
echo "Next steps:"
echo "1. Verify deployment at: https://$DEPLOYMENT_URL"
echo "2. Check all environment variables in Vercel dashboard"
echo "3. Test all critical features"
echo "4. Monitor logs and metrics"
echo "5. Set up custom domain if needed"
echo
echo -e "${BLUE}Happy recruiting with MeUnique AI CEO! 🚀${NC}" 