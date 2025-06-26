#!/bin/bash

echo "🔧 Fixing stuck domain issue..."

# Get your Vercel token
echo "📝 First, you need a Vercel token:"
echo "1. Go to: https://vercel.com/account/tokens"
echo "2. Create a new token"
echo "3. Copy and paste it here:"
read -p "Enter your Vercel token: " VERCEL_TOKEN

# Try to remove domain from all projects
echo "🔍 Searching for domain in all projects..."

# List all projects
projects=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects" | jq -r '.projects[].id')

# Try to remove domain from each project
for project in $projects; do
  echo "Checking project: $project"
  
  # Try to remove meunique.io
  curl -X DELETE \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v9/projects/$project/domains/meunique.io" \
    2>/dev/null
    
  # Try to remove www.meunique.io
  curl -X DELETE \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v9/projects/$project/domains/www.meunique.io" \
    2>/dev/null
done

echo "✅ Domain cleanup complete!"
echo ""
echo "Now try adding the domain again:"
echo "vercel domains add meunique.io" 