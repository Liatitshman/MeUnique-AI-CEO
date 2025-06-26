#!/bin/bash

echo "🚀 Quick Deploy to Production"
echo "============================"

# Check if there are changes
if [[ -z $(git status -s) ]]; then
    echo "✅ No changes to deploy"
    echo "💡 Make some changes first, then run this script again"
    exit 0
fi

echo "📝 Changes detected:"
git status -s
echo ""

# Commit changes
read -p "📌 Enter commit message: " commit_msg
git add .
git commit -m "$commit_msg"

# Deploy to Vercel
echo ""
echo "🔄 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site is live at:"
echo "   https://meunique-ai-liats-projects-dcef7e18.vercel.app"
echo ""
echo "💡 Tip: Changes take 1-2 minutes to appear" 