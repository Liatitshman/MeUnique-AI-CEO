#!/bin/bash
# Create ASCII-friendly folder structure as alternative

echo "🔧 Creating ASCII-friendly folder structure..."

# Create main directories
mkdir -p CEO-System/Agents/{Stores,Management,Support}
mkdir -p CEO-System/Documents/{analysis,deployment,guides}
mkdir -p CEO-System/{Dashboard,Settings,Deploy}

# Create Store agent directories
STORES=(
    "Smart-Database"
    "Auto-Recruiter"
    "Culture-Matcher"
    "Ideal-Profiler"
    "Dictionary-Bot"
    "Profile-Analyzer"
    "Message-Crafter"
    "Talent-Sourcer"
)

for store in "${STORES[@]}"; do
    mkdir -p "CEO-System/Agents/Stores/$store"
    echo "✓ Created: CEO-System/Agents/Stores/$store"
done

# Create Management agent directories
MANAGEMENT=(
    "CEO"
    "CFO"
    "CTO"
    "CMO"
)

for mgmt in "${MANAGEMENT[@]}"; do
    mkdir -p "CEO-System/Agents/Management/$mgmt"
    echo "✓ Created: CEO-System/Agents/Management/$mgmt"
done

# Create Support agent directories
SUPPORT=(
    "Quality-Assurance"
    "Data-Analyst"
    "Customer-Success"
)

for support in "${SUPPORT[@]}"; do
    mkdir -p "CEO-System/Agents/Support/$support"
    echo "✓ Created: CEO-System/Agents/Support/$support"
done

# Create mapping file
cat > CEO-System/FOLDER_MAPPING.md << 'EOF'
# Folder Mapping Guide

## Unicode → ASCII Mapping

### Store Agents
- 💾_Smart-Database → Smart-Database
- ⚡_Auto-Recruiter → Auto-Recruiter
- 🎯_Culture-Matcher → Culture-Matcher
- 🏗️_Ideal-Profiler → Ideal-Profiler
- 🔤_Dictionary-Bot → Dictionary-Bot
- 🔬_Profile-Analyzer → Profile-Analyzer
- 📝_Message-Crafter → Message-Crafter
- 🕵️_Talent-Sourcer → Talent-Sourcer

### Management Agents
- 👑_CEO → CEO
- 💰_CFO → CFO
- 💻_CTO → CTO
- 📣_CMO → CMO

### Support Agents
- ✅_Quality-Assurance → Quality-Assurance
- 📊_Data-Analyst → Data-Analyst
- 🤝_Customer-Success → Customer-Success

### Main Directories
- 👑_CEO-System → CEO-System
- 🤖_Agents → Agents
- 🏪_7-Stores → Stores
- 👔_4-Management → Management
- 🛠️_3-Support → Support
- 📁_Documents → Documents
- 📊_Dashboard → Dashboard
- 🔧_Settings → Settings
- 🚀_Deploy → Deploy

## Usage
You can work with either structure. The ASCII version is guaranteed to work in all terminals.
EOF

echo ""
echo "✅ ASCII structure created successfully!"
echo "📍 You can now use: CEO-System/Agents/Stores/[agent-name]"
echo "📄 See CEO-System/FOLDER_MAPPING.md for complete mapping" 