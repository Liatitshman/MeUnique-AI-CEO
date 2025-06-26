#!/bin/bash

echo "🧹 Clearing Vercel Cache and Redeploying..."
echo "=========================================="

# Remove .vercel directory
echo "📁 Removing .vercel directory..."
rm -rf .vercel

# Clear Next.js cache
echo "🗑️  Clearing Next.js cache..."
rm -rf .next

# Rebuild
echo "🔨 Rebuilding project..."
npm run build

# Deploy fresh
echo "🚀 Deploying fresh to Vercel..."
vercel --prod --force

echo ""
echo "✅ Fresh deployment complete!"
echo "🌐 Your updated site will be live in 1-2 minutes at:"
echo "   https://meunique-ai-liats-projects-dcef7e18.vercel.app/mall"
echo ""
echo "💡 Clear your browser cache (Cmd+Shift+R) to see changes!" 