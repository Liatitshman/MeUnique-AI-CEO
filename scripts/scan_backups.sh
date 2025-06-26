#!/bin/bash

# MeUnique Backup Scanner
# Scans Desktop and Downloads for backup files

echo "🔍 Scanning for MeUnique backup files..."

# Create backup directory if not exists
mkdir -p backups/legacy
mkdir -p backups/conversations
mkdir -p backups/downloads

# Function to scan and organize files
scan_and_organize() {
    local search_path=$1
    local file_pattern=$2
    local target_dir=$3
    
    echo "📁 Scanning $search_path for $file_pattern..."
    
    find "$search_path" -name "$file_pattern" -type f 2>/dev/null | while read -r file; do
        if [[ -f "$file" ]]; then
            filename=$(basename "$file")
            echo "  ✅ Found: $filename"
            
            # Copy to organized location
            cp "$file" "$target_dir/"
            
            # Log the finding
            echo "$(date): $file -> $target_dir/$filename" >> backups/scan_log.txt
        fi
    done
}

# Scan Desktop
echo "🖥️  Scanning Desktop..."
scan_and_organize ~/Desktop "*MeUnique*" "backups/legacy"
scan_and_organize ~/Desktop "*meunique*" "backups/legacy"
scan_and_organize ~/Desktop "*backup*" "backups/legacy"
scan_and_organize ~/Desktop "*conversation*" "backups/conversations"

# Scan Downloads
echo "⬇️  Scanning Downloads..."
scan_and_organize ~/Downloads "*MeUnique*" "backups/downloads"
scan_and_organize ~/Downloads "*meunique*" "backups/downloads"
scan_and_organize ~/Downloads "*backup*" "backups/downloads"
scan_and_organize ~/Downloads "*conversation*" "backups/conversations"

# Look for specific file types
echo "📄 Scanning for document types..."
scan_and_organize ~/Desktop "*.doc" "backups/legacy/docs"
scan_and_organize ~/Desktop "*.docx" "backups/legacy/docs"
scan_and_organize ~/Desktop "*.txt" "backups/legacy/docs"
scan_and_organize ~/Desktop "*.md" "backups/legacy/docs"

# Count results
echo ""
echo "📊 Scan Summary:"
echo "  Legacy files: $(find backups/legacy -type f | wc -l)"
echo "  Conversations: $(find backups/conversations -type f | wc -l)"
echo "  Downloads: $(find backups/downloads -type f | wc -l)"

echo ""
echo "✅ Scan complete! Check backups/ directory for organized files."
echo "📋 See backups/scan_log.txt for detailed log." 