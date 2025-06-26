#!/bin/bash

# 🔧 Fix Recursive Folders Issue
# ==============================

echo "🔍 מחפש תיקיות בעייתיות..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Find and remove problematic folders
PROBLEMATIC_FOLDERS=(
    "MeUnique-AI-CEO"
    "Liatitshman-MeUnique.AI"
    "🎯_MeUnique-Business-FINAL"
)

for folder in "${PROBLEMATIC_FOLDERS[@]}"; do
    echo -e "${YELLOW}בודק: $folder${NC}"
    
    # Find all instances except the root
    find . -type d -name "$folder" -not -path "./$folder" -not -path "./$folder/*" 2>/dev/null | while read -r dir; do
        echo -e "${RED}נמצא: $dir${NC}"
        rm -rf "$dir"
        echo -e "${GREEN}✅ נמחק${NC}"
    done
done

# Update git to ignore these patterns
echo ""
echo "📝 מעדכן .gitignore..."

# Add patterns if not already present
patterns=(
    "# Prevent self-referencing loops"
    "MeUnique-AI-CEO/"
    "/MeUnique-AI-CEO/"
    "**/MeUnique-AI-CEO/"
    "Liatitshman-MeUnique.AI/"
    "/Liatitshman-MeUnique.AI/"
    "**/Liatitshman-MeUnique.AI/"
    "🎯_MeUnique-Business-FINAL/"
    "/🎯_MeUnique-Business-FINAL/"
    "**/🎯_MeUnique-Business-FINAL/"
)

for pattern in "${patterns[@]}"; do
    if ! grep -Fxq "$pattern" .gitignore 2>/dev/null; then
        echo "$pattern" >> .gitignore
    fi
done

# Create a pre-commit hook to prevent this issue
echo ""
echo "🔒 יוצר hook למניעת הבעיה..."

mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Prevent committing problematic folders

PROBLEMATIC_FOLDERS=(
    "MeUnique-AI-CEO"
    "Liatitshman-MeUnique.AI"
    "🎯_MeUnique-Business-FINAL"
)

for folder in "${PROBLEMATIC_FOLDERS[@]}"; do
    if find . -type d -name "$folder" -not -path "./$folder" -not -path "./$folder/*" 2>/dev/null | grep -q .; then
        echo "❌ שגיאה: נמצאה תיקייה בעייתית: $folder"
        echo "הרץ: ./scripts/fix-recursive-folders.sh"
        exit 1
    fi
done

exit 0
EOF

chmod +x .git/hooks/pre-commit

# Clean up any broken symlinks
echo ""
echo "🧹 מנקה קישורים שבורים..."
find . -type l -exec test ! -e {} \; -delete 2>/dev/null

# Verify structure
echo ""
echo "✅ בודק מבנה תקין..."

if [ -d "👑_CEO-System" ] && [ -d "src" ] && [ -d "scripts" ]; then
    echo -e "${GREEN}✅ המבנה תקין!${NC}"
else
    echo -e "${RED}❌ בעיה במבנה הפרויקט${NC}"
fi

# Final cleanup
echo ""
echo "🧹 ניקוי סופי..."
find . -name ".DS_Store" -delete 2>/dev/null
find . -name "*.bak" -delete 2>/dev/null

echo ""
echo -e "${GREEN}✅ הסקריפט הושלם!${NC}"
echo ""
echo "💡 טיפים למניעת הבעיה:"
echo "1. אל תעתיקי את תיקיית הפרויקט לתוך עצמה"
echo "2. השתמשי ב-git clone במקום העתקה ידנית"
echo "3. הימנעי משימוש ב-'cp -r .' ללא יעד ספציפי" 