#!/bin/bash

# Legacy File Migration Script
# Converts old formats to markdown and integrates into system

echo "🔄 Starting legacy file migration..."

# Create directories
mkdir -p packages/legacy_docs
mkdir -p packages/legacy_docs/converted
mkdir -p packages/legacy_docs/originals

# Function to convert text files to markdown
convert_to_markdown() {
    local input_file=$1
    local output_dir=$2
    local filename=$(basename "$input_file")
    local name_without_ext="${filename%.*}"
    local output_file="$output_dir/${name_without_ext}.md"
    
    echo "  📄 Converting: $filename"
    
    # Add markdown header
    echo "# $name_without_ext" > "$output_file"
    echo "" >> "$output_file"
    echo "**Original file**: $filename" >> "$output_file"
    echo "**Converted on**: $(date)" >> "$output_file"
    echo "" >> "$output_file"
    echo "---" >> "$output_file"
    echo "" >> "$output_file"
    
    # Convert content based on file type
    case "${filename##*.}" in
        txt)
            # Plain text - just copy
            cat "$input_file" >> "$output_file"
            ;;
        doc|docx)
            # Try to extract text (requires textutil on macOS)
            if command -v textutil &> /dev/null; then
                textutil -convert txt -stdout "$input_file" >> "$output_file" 2>/dev/null
            else
                echo "⚠️  Cannot convert .doc files - textutil not found" >> "$output_file"
            fi
            ;;
        rtf)
            # RTF files
            if command -v textutil &> /dev/null; then
                textutil -convert txt -stdout "$input_file" >> "$output_file" 2>/dev/null
            fi
            ;;
        *)
            # Unknown format
            echo "Unknown format - original content preserved" >> "$output_file"
            cat "$input_file" >> "$output_file" 2>/dev/null || echo "Could not read file"
            ;;
    esac
    
    # Copy original to archive
    cp "$input_file" "packages/legacy_docs/originals/"
    
    echo "    ✅ Converted to: $output_file"
}

# Process all legacy files
echo "📁 Processing legacy files..."

# Convert files from backups/legacy
if [[ -d "backups/legacy" ]]; then
    find backups/legacy -type f \( -name "*.txt" -o -name "*.doc" -o -name "*.docx" -o -name "*.rtf" \) | while read -r file; do
        convert_to_markdown "$file" "packages/legacy_docs/converted"
    done
fi

# Create index file
echo "📚 Creating documentation index..."
cat > "packages/legacy_docs/INDEX.md" << EOF
# Legacy Documentation Index

This directory contains converted legacy documentation from the MeUnique system.

## Converted Files

EOF

# Add links to all converted files
find packages/legacy_docs/converted -name "*.md" -type f | sort | while read -r file; do
    filename=$(basename "$file")
    echo "- [${filename%.md}](converted/$filename)" >> "packages/legacy_docs/INDEX.md"
done

# Create integration manifest
echo "🔗 Creating integration manifest..."
cat > "packages/legacy_docs/manifest.json" << EOF
{
  "name": "legacy_docs",
  "version": "1.0.0",
  "description": "Converted legacy documentation",
  "convertedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "files": [
EOF

# Add file entries to manifest
first=true
find packages/legacy_docs/converted -name "*.md" -type f | while read -r file; do
    if [ "$first" = true ]; then
        first=false
    else
        echo "," >> "packages/legacy_docs/manifest.json"
    fi
    filename=$(basename "$file")
    filesize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
    printf '    {
      "name": "%s",
      "path": "converted/%s",
      "size": %s,
      "type": "markdown"
    }' "$filename" "$filename" "$filesize" >> "packages/legacy_docs/manifest.json"
done

echo "
  ]
}" >> "packages/legacy_docs/manifest.json"

# Summary
echo ""
echo "📊 Migration Summary:"
echo "  Original files: $(find packages/legacy_docs/originals -type f | wc -l)"
echo "  Converted files: $(find packages/legacy_docs/converted -name "*.md" | wc -l)"
echo ""
echo "✅ Migration complete!"
echo "📁 Check packages/legacy_docs/ for results"
echo "📋 See packages/legacy_docs/INDEX.md for documentation index" 