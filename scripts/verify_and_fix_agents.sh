#!/bin/bash

echo "🔍 Verifying and fixing agent files..."

# Define all agents and their locations
declare -A STORES=(
    ["💾_Smart-Database"]="1"
    ["⚡_Auto-Recruiter"]="2"
    ["🎯_Culture-Matcher"]="3"
    ["🔬_Profile-Analyzer"]="5"
    ["📝_Message-Crafter"]="6"
    ["🕵️_Talent-Sourcer"]="7"
    ["🔤_Dictionary-Bot"]="4.5"
)

declare -A MANAGEMENT=(
    ["👑_CEO"]="8"
    ["💰_CFO"]="9"
    ["💻_CTO"]="10"
    ["📣_CMO"]="11"
)

declare -A SUPPORT=(
    ["✅_Quality-Assurance"]="12"
    ["📊_Data-Analyst"]="13"
    ["🤝_Customer-Success"]="14"
)

# Function to check and create missing files
check_and_create() {
    local base_path=$1
    local agent_name=$2
    local priority=$3
    local agent_type=$4
    
    echo "Checking $agent_name..."
    
    # Check if directory exists
    if [ ! -d "$base_path/$agent_name" ]; then
        echo "  ❌ Directory missing - creating..."
        mkdir -p "$base_path/$agent_name"
    fi
    
    # Check config.json
    if [ ! -f "$base_path/$agent_name/config.json" ]; then
        echo "  ❌ config.json missing"
        touch "$base_path/$agent_name/config.json"
        echo "{}" > "$base_path/$agent_name/config.json"
    else
        echo "  ✅ config.json exists"
    fi
    
    # Check implementation.ts
    if [ ! -f "$base_path/$agent_name/implementation.ts" ]; then
        echo "  ❌ implementation.ts missing - creating stub..."
        cat > "$base_path/$agent_name/implementation.ts" << EOF
// $agent_name Implementation
// Priority: $priority
// Type: $agent_type

export class ${agent_name//[_-]/ }Agent {
  constructor() {
    console.log('$agent_name initialized');
  }
  
  async execute(params: any) {
    // TODO: Implement
    return { status: 'pending' };
  }
}
EOF
    else
        echo "  ✅ implementation.ts exists"
    fi
    
    # Check README.md
    if [ ! -f "$base_path/$agent_name/README.md" ]; then
        echo "  ❌ README.md missing - creating..."
        cat > "$base_path/$agent_name/README.md" << EOF
# $agent_name

Priority: $priority
Type: $agent_type

## Description
TODO: Add description

## API
TODO: Document API
EOF
    else
        echo "  ✅ README.md exists"
    fi
}

# Check 7 Stores
echo "🏪 Checking 7 Stores..."
for agent in "${!STORES[@]}"; do
    check_and_create "👑_CEO-System/🤖_Agents/🏪_7-Stores" "$agent" "${STORES[$agent]}" "store"
done

# Check Management
echo "👔 Checking Management..."
for agent in "${!MANAGEMENT[@]}"; do
    check_and_create "👑_CEO-System/🤖_Agents/👔_4-Management" "$agent" "${MANAGEMENT[$agent]}" "management"
done

# Check Support
echo "🛠️ Checking Support..."
for agent in "${!SUPPORT[@]}"; do
    check_and_create "👑_CEO-System/🤖_Agents/🛠️_3-Support" "$agent" "${SUPPORT[$agent]}" "support"
done

# Count totals
echo ""
echo "📊 Summary:"
echo "Total config.json files: $(find 👑_CEO-System/🤖_Agents -name "config.json" | wc -l)"
echo "Total implementation.ts files: $(find 👑_CEO-System/🤖_Agents -name "implementation.ts" | wc -l)"
echo "Total README.md files: $(find 👑_CEO-System/🤖_Agents -name "README.md" | wc -l)"

echo ""
echo "✅ Verification complete!" 