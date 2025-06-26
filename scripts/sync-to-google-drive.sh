#!/bin/bash

# Google Drive Sync Script for MeUnique-AI-CEO
# Created: $(date +"%Y-%m-%d")

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Define paths
PROJECT_DIR="/Users/liattishman/Desktop/MeUnique-AI-CEO"
GDRIVE_DIR="/Users/liattishman/Library/CloudStorage/GoogleDrive-liat@startingup.io/My Drive/MeUnique-AI-CEO-Mirror"

echo -e "${GREEN}🚀 Starting Google Drive Sync for MeUnique-AI-CEO${NC}"

# Create mirror directory if it doesn't exist
if [ ! -d "$GDRIVE_DIR" ]; then
    echo -e "${YELLOW}📁 Creating Google Drive mirror directory...${NC}"
    mkdir -p "$GDRIVE_DIR"
fi

# Clean up old/stuck files in Google Drive
echo -e "${YELLOW}🧹 Cleaning up old/stuck files in Google Drive...${NC}"
find "$GDRIVE_DIR" -name "*.tmp" -o -name "*.crdownload" -o -name "*.part" | xargs rm -f 2>/dev/null

# Sync files using rsync (excludes large files and temporary files)
echo -e "${GREEN}📤 Syncing files to Google Drive...${NC}"
rsync -av --delete \
    --exclude='node_modules/' \
    --exclude='.git/' \
    --exclude='*.log' \
    --exclude='*.tmp' \
    --exclude='*.zip' \
    --exclude='*.tar' \
    --exclude='*.gz' \
    --exclude='backups/legacy/' \
    --exclude='logs/' \
    --exclude='.env*' \
    --exclude='*.cache' \
    --exclude='dist/' \
    --exclude='build/' \
    --exclude='.next/' \
    --progress \
    "$PROJECT_DIR/" "$GDRIVE_DIR/"

# Check if sync was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Sync completed successfully!${NC}"
    
    # Create sync status file
    echo "Last sync: $(date)" > "$GDRIVE_DIR/SYNC_STATUS.txt"
    echo "Source: $PROJECT_DIR" >> "$GDRIVE_DIR/SYNC_STATUS.txt"
    echo "Files synced: $(find "$GDRIVE_DIR" -type f | wc -l)" >> "$GDRIVE_DIR/SYNC_STATUS.txt"
    
    # Show summary
    echo -e "${GREEN}📊 Sync Summary:${NC}"
    echo "- Total files: $(find "$GDRIVE_DIR" -type f | wc -l)"
    echo "- Total size: $(du -sh "$GDRIVE_DIR" | cut -f1)"
    echo "- Location: $GDRIVE_DIR"
else
    echo -e "${RED}❌ Sync failed! Please check the errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Google Drive sync complete!${NC}" 