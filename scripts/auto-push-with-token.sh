#!/bin/bash

echo "🚀 Auto Push to GitHub with Token"
echo "================================="
echo ""

GITHUB_USERNAME="liattishman"
REPO_NAME="MeUnique-AI-CEO"

echo "צריך Personal Access Token מ-GitHub."
echo "1. לכי ל: https://github.com/settings/tokens"
echo "2. לחצי 'Generate new token (classic)'"
echo "3. בחרי 'repo' permissions"
echo "4. העתיקי את הטוקן"
echo ""

echo -n "הדביקי את הטוקן כאן: "
read -s GITHUB_TOKEN
echo ""

# הגדר את ה-URL עם הטוקן
git remote set-url origin "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "מנסה לדחוף..."
git push -u origin main

# נקה את הטוקן מה-URL לביטחון
git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "✅ סיימנו!"
echo "הפרויקט שלך זמין ב: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}" 