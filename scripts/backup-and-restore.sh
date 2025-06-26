#!/bin/bash

# 🔄 MeUnique Backup & Restore Script
# תאריך: 26/12/2024

set -e

# צבעים
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# משתנים
PROJECT_DIR="/Users/liattishman/Desktop/MeUnique-AI-CEO"
BACKUP_DIR="/Users/liattishman/Desktop/MeUnique-Backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="meunique_backup_${TIMESTAMP}"

# פונקציות
print_header() {
    echo -e "${BLUE}==================================${NC}"
    echo -e "${BLUE}🔄 MeUnique Backup & Restore Tool${NC}"
    echo -e "${BLUE}==================================${NC}"
}

create_backup() {
    echo -e "${YELLOW}📦 יוצר גיבוי...${NC}"
    
    # יצירת תיקיית גיבויים
    mkdir -p "$BACKUP_DIR"
    
    # יצירת תיקיית גיבוי ספציפית
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$BACKUP_PATH"
    
    # גיבוי קבצי הגדרות
    echo -e "${GREEN}✓ מגבה קבצי הגדרות...${NC}"
    cp -r "$PROJECT_DIR/.env" "$BACKUP_PATH/" 2>/dev/null || true
    cp -r "$PROJECT_DIR/.env.local" "$BACKUP_PATH/" 2>/dev/null || true
    cp -r "$PROJECT_DIR/package.json" "$BACKUP_PATH/"
    cp -r "$PROJECT_DIR/package-lock.json" "$BACKUP_PATH/" 2>/dev/null || true
    
    # גיבוי סקריפטים
    echo -e "${GREEN}✓ מגבה סקריפטים...${NC}"
    cp -r "$PROJECT_DIR/scripts" "$BACKUP_PATH/"
    
    # גיבוי קוד
    echo -e "${GREEN}✓ מגבה קוד...${NC}"
    cp -r "$PROJECT_DIR/src" "$BACKUP_PATH/"
    cp -r "$PROJECT_DIR/👑_CEO-System" "$BACKUP_PATH/"
    
    # גיבוי Chrome Extension
    echo -e "${GREEN}✓ מגבה Chrome Extension...${NC}"
    cp -r "$PROJECT_DIR/chrome-extension" "$BACKUP_PATH/" 2>/dev/null || true
    
    # גיבוי דוקומנטציה
    echo -e "${GREEN}✓ מגבה דוקומנטציה...${NC}"
    cp "$PROJECT_DIR"/*.md "$BACKUP_PATH/" 2>/dev/null || true
    
    # יצירת קובץ מידע
    cat > "$BACKUP_PATH/backup_info.txt" << EOF
Backup Information
==================
Date: $(date)
Project: MeUnique AI CEO
Location: $PROJECT_DIR
Git Branch: $(cd "$PROJECT_DIR" && git branch --show-current)
Git Commit: $(cd "$PROJECT_DIR" && git rev-parse HEAD)
Node Version: $(node --version)
Python Version: $(python3 --version)

Files Backed Up:
- Configuration files (.env, package.json)
- Scripts (55 files)
- Source code (src/, CEO-System/)
- Chrome Extension
- Documentation (*.md)

Excluded:
- node_modules/
- .next/
- .git/
- build/
- dist/
EOF
    
    # דחיסת הגיבוי
    echo -e "${YELLOW}🗜️  דוחס גיבוי...${NC}"
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    echo -e "${GREEN}✅ גיבוי נוצר בהצלחה!${NC}"
    echo -e "${BLUE}📍 מיקום: $BACKUP_DIR/${BACKUP_NAME}.tar.gz${NC}"
    echo -e "${BLUE}📏 גודל: $(du -h "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" | cut -f1)${NC}"
}

list_backups() {
    echo -e "${YELLOW}📋 רשימת גיבויים:${NC}"
    if [ -d "$BACKUP_DIR" ]; then
        ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print $9, "-", $5}' || echo "אין גיבויים"
    else
        echo "אין גיבויים"
    fi
}

restore_backup() {
    list_backups
    echo
    echo -e "${YELLOW}הזן את שם קובץ הגיבוי (כולל .tar.gz):${NC}"
    read -r backup_file
    
    if [ ! -f "$BACKUP_DIR/$backup_file" ]; then
        echo -e "${RED}❌ קובץ גיבוי לא נמצא!${NC}"
        return 1
    fi
    
    echo -e "${RED}⚠️  אזהרה: פעולה זו תמחק את המצב הנוכחי!${NC}"
    echo -e "${YELLOW}האם להמשיך? (y/n):${NC}"
    read -r confirm
    
    if [ "$confirm" != "y" ]; then
        echo "ביטול..."
        return 0
    fi
    
    # יצירת גיבוי של המצב הנוכחי
    echo -e "${YELLOW}📸 יוצר snapshot של המצב הנוכחי...${NC}"
    SNAPSHOT_NAME="snapshot_before_restore_${TIMESTAMP}"
    create_backup
    mv "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" "$BACKUP_DIR/${SNAPSHOT_NAME}.tar.gz"
    
    # שחזור
    echo -e "${YELLOW}♻️  משחזר גיבוי...${NC}"
    cd "$BACKUP_DIR"
    tar -xzf "$backup_file"
    EXTRACTED_DIR=$(tar -tzf "$backup_file" | head -1 | cut -d'/' -f1)
    
    # העתקת קבצים
    echo -e "${GREEN}✓ משחזר קבצים...${NC}"
    cp -r "$EXTRACTED_DIR"/* "$PROJECT_DIR/"
    
    # ניקוי
    rm -rf "$EXTRACTED_DIR"
    
    echo -e "${GREEN}✅ השחזור הושלם!${NC}"
    echo -e "${BLUE}📸 Snapshot של המצב הקודם: ${SNAPSHOT_NAME}.tar.gz${NC}"
}

verify_system() {
    echo -e "${YELLOW}🔍 בודק תקינות מערכת...${NC}"
    
    # בדיקת לולאות
    echo -e "${GREEN}✓ בודק לולאות...${NC}"
    if find "$PROJECT_DIR" -name "MeUnique-AI-CEO" -type d 2>/dev/null | grep -v node_modules | grep -q .; then
        echo -e "${RED}❌ נמצאה לולאה!${NC}"
    else
        echo -e "${GREEN}✓ אין לולאות${NC}"
    fi
    
    # בדיקת קבצים קריטיים
    echo -e "${GREEN}✓ בודק קבצים קריטיים...${NC}"
    critical_files=(
        "package.json"
        "src/app/page.tsx"
        "👑_CEO-System/🤖_Agents"
        "scripts/smart-integration-orchestrator.py"
    )
    
    for file in "${critical_files[@]}"; do
        if [ -e "$PROJECT_DIR/$file" ]; then
            echo -e "  ${GREEN}✓${NC} $file"
        else
            echo -e "  ${RED}✗${NC} $file"
        fi
    done
    
    # בדיקת Git
    echo -e "${GREEN}✓ בודק Git...${NC}"
    cd "$PROJECT_DIR"
    echo -e "  Branch: $(git branch --show-current)"
    echo -e "  Status: $(git status --porcelain | wc -l) uncommitted changes"
}

# תפריט ראשי
print_header

PS3="בחר אפשרות: "
options=(
    "🔄 צור גיבוי חדש"
    "📋 הצג רשימת גיבויים"
    "♻️  שחזר גיבוי"
    "🔍 בדוק תקינות מערכת"
    "❌ יציאה"
)

select opt in "${options[@]}"
do
    case $opt in
        "🔄 צור גיבוי חדש")
            create_backup
            break
            ;;
        "📋 הצג רשימת גיבויים")
            list_backups
            break
            ;;
        "♻️  שחזר גיבוי")
            restore_backup
            break
            ;;
        "🔍 בדוק תקינות מערכת")
            verify_system
            break
            ;;
        "❌ יציאה")
            echo "להתראות!"
            break
            ;;
        *) echo "אפשרות לא חוקית";;
    esac
done 