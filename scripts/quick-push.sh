#!/bin/bash
# Quick push with saved token
if [ -f ~/.meunique-github-token ]; then
    source ~/.meunique-github-token
    TEMP_URL=$(git remote get-url origin)
    git remote set-url origin "https://Liatishman:${GITHUB_TOKEN}@github.com/Liatishman/MeUnique-AI-CEO.git"
    git push
    git remote set-url origin "$TEMP_URL"
else
    echo "No saved token. Run ./scripts/github-full-setup.sh first"
fi
