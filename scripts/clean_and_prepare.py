#!/usr/bin/env python3
"""
MeUnique AI CEO System - Clean and Prepare for Git
This script prepares the project for a fresh git push without terminal dependencies
"""

import os
import shutil
import json
from pathlib import Path

def clean_project():
    """Clean unnecessary files and prepare for git"""
    
    print("🧹 Starting project cleanup...")
    
    # Define files and directories to remove
    to_remove = [
        '.DS_Store',
        '.cursor',
        '.vscode',
        '.next',
        'node_modules/.cache',
        '.git-config-backup',
        'Thumbs.db'
    ]
    
    # Remove each item
    for item in to_remove:
        path = Path(item)
        if path.exists():
            try:
                if path.is_file():
                    path.unlink()
                    print(f"✅ Removed file: {item}")
                elif path.is_dir():
                    shutil.rmtree(path)
                    print(f"✅ Removed directory: {item}")
            except Exception as e:
                print(f"⚠️  Could not remove {item}: {e}")
    
    print("\n📋 Creating deployment checklist...")
    
    # Create deployment checklist
    checklist = """# 🚀 Deployment Checklist

## Pre-Deployment Steps

### 1. GitHub Setup
- [ ] Create new repository at https://github.com/new
- [ ] Name: `meunique-ai-ceo`
- [ ] Description: "AI-powered recruitment platform with 45%+ response rates"
- [ ] Public/Private: Your choice
- [ ] Do NOT initialize with README

### 2. Local Git Setup (Use GitHub Desktop or VS Code)
- [ ] Open GitHub Desktop
- [ ] File → Add Local Repository
- [ ] Select this folder
- [ ] If prompted about existing git, choose "Create New Repository"

### 3. Initial Commit
- [ ] Review changes (should show all files)
- [ ] Commit message: "Initial commit: MeUnique AI CEO System v1.0"
- [ ] Click "Commit to main"

### 4. Push to GitHub
- [ ] Click "Publish repository"
- [ ] Verify repository name
- [ ] Choose visibility (public/private)
- [ ] Click "Publish repository"

### 5. Vercel Deployment
- [ ] Go to https://vercel.com/new
- [ ] Import Git Repository
- [ ] Select your new repository
- [ ] Configure project:
  - Framework Preset: Next.js
  - Root Directory: ./
  - Build Command: `npm run build`
  - Output Directory: `.next`

### 6. Environment Variables (Add in Vercel)
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LINKEDIN_API_KEY=...
GITHUB_TOKEN=ghp_...
DAILY_BUDGET_LIMIT=100
COST_ALERT_THRESHOLD=80
SUPPORT_RTL=true
DEFAULT_LANGUAGE=en
```

### 7. Post-Deployment
- [ ] Test deployment URL
- [ ] Verify all agents load
- [ ] Test API endpoints
- [ ] Set up custom domain (optional)

## 🎉 Success Indicators
- ✅ Build completes without errors
- ✅ All pages load correctly
- ✅ API routes respond
- ✅ No console errors

## 🆘 Troubleshooting
- If build fails: Check environment variables
- If agents don't load: Verify API keys
- If styles broken: Clear cache and rebuild
"""
    
    with open('DEPLOYMENT_CHECKLIST.md', 'w', encoding='utf-8') as f:
        f.write(checklist)
    
    print("✅ Created DEPLOYMENT_CHECKLIST.md")
    
    # Create a simple git attributes file
    gitattributes = """# Auto detect text files and perform LF normalization
* text=auto

# Denote all files that are truly binary and should not be modified
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.pdf binary

# Force text files to use LF
*.js text eol=lf
*.jsx text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.json text eol=lf
*.md text eol=lf
*.css text eol=lf
*.html text eol=lf
"""
    
    with open('.gitattributes', 'w', encoding='utf-8') as f:
        f.write(gitattributes)
    
    print("✅ Created .gitattributes")
    
    # Update package.json scripts
    package_path = Path('package.json')
    if package_path.exists():
        with open(package_path, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
        
        # Ensure all necessary scripts
        package_data['scripts']['prepare'] = "echo 'Project ready for deployment'"
        package_data['scripts']['clean'] = "rm -rf .next node_modules/.cache"
        
        with open(package_path, 'w', encoding='utf-8') as f:
            json.dump(package_data, f, indent=2)
        
        print("✅ Updated package.json scripts")
    
    print("\n🎉 Project cleaned and prepared!")
    print("\n📋 Next steps:")
    print("1. Review DEPLOYMENT_CHECKLIST.md")
    print("2. Use GitHub Desktop or VS Code Git integration")
    print("3. Follow the deployment steps")
    print("\n✨ Your project is ready for a fresh start!")

if __name__ == "__main__":
    clean_project() 