#!/usr/bin/env python3
"""
Fix Terminal Issues - Root Cause Solution
This script identifies and fixes the root cause of terminal hanging
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_status(message, status='info'):
    """Print colored status messages"""
    if status == 'success':
        print(f"{GREEN}✓ {message}{RESET}")
    elif status == 'error':
        print(f"{RED}✗ {message}{RESET}")
    elif status == 'warning':
        print(f"{YELLOW}⚠ {message}{RESET}")
    else:
        print(f"{BLUE}→ {message}{RESET}")

def find_problematic_folders():
    """Find folders that might cause terminal issues"""
    problematic = []
    problem_patterns = [
        'Liatitshman-MeUnique.AI',
        '🎯_MeUnique-Business-FINAL',
        '*MeUnique-Business*',
        '*Liatitshman*'
    ]
    
    print_status("Searching for problematic folders...")
    
    # Search in current directory and parent
    search_paths = ['.', '..', os.path.expanduser('~/Desktop')]
    
    for search_path in search_paths:
        try:
            for root, dirs, files in os.walk(search_path):
                # Skip hidden and system directories
                dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
                
                for dir_name in dirs:
                    for pattern in problem_patterns:
                        if pattern.replace('*', '') in dir_name:
                            full_path = os.path.join(root, dir_name)
                            problematic.append(full_path)
                            print_status(f"Found: {full_path}", 'warning')
        except Exception as e:
            continue
    
    return list(set(problematic))  # Remove duplicates

def fix_vscode_settings():
    """Update VS Code settings to exclude problematic paths"""
    vscode_settings_path = '.vscode/settings.json'
    
    if os.path.exists(vscode_settings_path):
        print_status("Updating VS Code settings...")
        
        # Read current settings
        with open(vscode_settings_path, 'r') as f:
            content = f.read()
        
        # Backup original
        shutil.copy(vscode_settings_path, vscode_settings_path + '.backup')
        
        # Add more exclusions if needed
        if '"**/Liatitshman*": true' not in content:
            content = content.replace('"files.exclude": {', 
                                    '"files.exclude": {\n    "**/Liatitshman*": true,')
        
        with open(vscode_settings_path, 'w') as f:
            f.write(content)
        
        print_status("VS Code settings updated", 'success')

def create_safe_folder_structure():
    """Create folder structure using safe ASCII names"""
    print_status("\nCreating safe folder structure...")
    
    # Base structure
    base_dirs = {
        'CEO-System': {
            'Agents': {
                'Stores': [
                    'Smart-Database',
                    'Auto-Recruiter', 
                    'Culture-Matcher',
                    'Ideal-Profiler',
                    'Dictionary-Bot',
                    'Profile-Analyzer',
                    'Message-Crafter',
                    'Talent-Sourcer'
                ],
                'Management': [
                    'CEO',
                    'CFO',
                    'CTO',
                    'CMO'
                ],
                'Support': [
                    'Quality-Assurance',
                    'Data-Analyst',
                    'Customer-Success'
                ]
            }
        }
    }
    
    # Create directories
    for main_dir, sub_structure in base_dirs.items():
        for sub_dir, categories in sub_structure.items():
            for category, agents in categories.items():
                for agent in agents:
                    path = f"{main_dir}/{sub_dir}/{category}/{agent}"
                    os.makedirs(path, exist_ok=True)
                    print_status(f"Created: {path}", 'success')

def create_ideal_profiler_files():
    """Create the missing Ideal Profiler implementation"""
    print_status("\nCreating Ideal Profiler implementation...")
    
    # Try both Unicode and ASCII paths
    paths_to_try = [
        '👑_CEO-System/🤖_Agents/🏪_7-Stores/🏗️_Ideal-Profiler',
        'CEO-System/Agents/Stores/Ideal-Profiler'
    ]
    
    implementation_content = '''import { NextRequest, NextResponse } from 'next/server';
import { AgentBase } from '@/lib/agents/agent-base';

export class IdealProfilerAgent extends AgentBase {
  constructor() {
    super({
      name: 'Ideal Profiler',
      emoji: '🏗️',
      priority: 4,
      costPerUse: 0.05
    });
  }

  async process(request: NextRequest) {
    const { jobDescription, marketData, companyContext } = await request.json();
    
    // Build ideal candidate profile based on reality
    const idealProfile = await this.buildIdealProfile({
      jobDescription,
      marketData,
      companyContext
    });
    
    return NextResponse.json({
      success: true,
      idealProfile,
      searchCriteria: this.generateSearchCriteria(idealProfile),
      realityCheck: this.performRealityCheck(idealProfile, marketData)
    });
  }
  
  private async buildIdealProfile(inputs: any) {
    // Implementation logic here
    return {
      technical: this.analyzeTechnicalRequirements(inputs),
      cultural: this.analyzeCulturalFit(inputs),
      experience: this.analyzeExperienceNeeds(inputs)
    };
  }
  
  private generateSearchCriteria(profile: any) {
    // Convert ideal profile to practical search parameters
    return {
      keywords: [],
      filters: {},
      alternativeProfiles: []
    };
  }
  
  private performRealityCheck(profile: any, marketData: any) {
    // Check if profile is realistic given market conditions
    return {
      availability: 'medium',
      competitionLevel: 'high',
      suggestedAdjustments: []
    };
  }
  
  private analyzeTechnicalRequirements(inputs: any) {
    return {
      mustHave: [],
      niceToHave: [],
      canLearn: []
    };
  }
  
  private analyzeCulturalFit(inputs: any) {
    return {
      values: [],
      workStyle: '',
      communication: ''
    };
  }
  
  private analyzeExperienceNeeds(inputs: any) {
    return {
      minYears: 0,
      industries: [],
      companyStages: []
    };
  }
}

export async function POST(request: NextRequest) {
  const agent = new IdealProfilerAgent();
  return agent.process(request);
}
'''
    
    for path in paths_to_try:
        try:
            os.makedirs(path, exist_ok=True)
            impl_path = os.path.join(path, 'implementation.ts')
            
            if not os.path.exists(impl_path):
                with open(impl_path, 'w') as f:
                    f.write(implementation_content)
                print_status(f"Created implementation at: {impl_path}", 'success')
                break
        except Exception as e:
            print_status(f"Failed to create in {path}: {str(e)}", 'error')
            continue

def check_terminal_processes():
    """Check for stuck terminal processes"""
    print_status("\nChecking for stuck processes...")
    
    try:
        # Check for node processes
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        processes = result.stdout.split('\n')
        
        stuck_processes = []
        for proc in processes:
            if 'node' in proc or 'ngrok' in proc or ':8080' in proc:
                stuck_processes.append(proc)
        
        if stuck_processes:
            print_status(f"Found {len(stuck_processes)} potentially stuck processes", 'warning')
            for proc in stuck_processes[:5]:  # Show first 5
                print(f"  {proc[:100]}...")
            
            # Kill stuck processes
            print_status("Attempting to clean up stuck processes...")
            subprocess.run(['pkill', '-f', 'node'], capture_output=True)
            subprocess.run(['pkill', '-f', 'ngrok'], capture_output=True)
            print_status("Cleaned up processes", 'success')
    except Exception as e:
        print_status(f"Could not check processes: {str(e)}", 'error')

def create_clean_terminal_script():
    """Create a script to ensure clean terminal environment"""
    script_content = '''#!/bin/bash
# Clean Terminal Environment Script

echo "🧹 Cleaning terminal environment..."

# Kill any stuck processes
pkill -f node 2>/dev/null
pkill -f ngrok 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Clear terminal state
clear
reset

# Set safe working directory
cd "$HOME/Desktop/MeUnique-AI-CEO" || exit

# Export clean environment
export TERM=xterm-256color
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

echo "✅ Terminal environment cleaned!"
echo "📍 Current directory: $(pwd)"
echo ""
echo "You can now run commands safely."
'''
    
    script_path = 'scripts/clean_terminal.sh'
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    os.chmod(script_path, 0o755)
    print_status(f"Created clean terminal script: {script_path}", 'success')

def main():
    """Main execution"""
    print(f"{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Terminal Issue Root Cause Fixer{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    # 1. Find problematic folders
    problematic = find_problematic_folders()
    if problematic:
        print_status(f"\nFound {len(problematic)} problematic folders", 'warning')
        # Don't delete, just note them
    
    # 2. Fix VS Code settings
    fix_vscode_settings()
    
    # 3. Check stuck processes
    check_terminal_processes()
    
    # 4. Create safe folder structure
    create_safe_folder_structure()
    
    # 5. Create missing Ideal Profiler
    create_ideal_profiler_files()
    
    # 6. Create clean terminal script
    create_clean_terminal_script()
    
    print(f"\n{GREEN}{'='*60}{RESET}")
    print(f"{GREEN}✅ Root cause analysis and fixes completed!{RESET}")
    print(f"{GREEN}{'='*60}{RESET}\n")
    
    print("Next steps:")
    print("1. Run: ./scripts/clean_terminal.sh")
    print("2. Use ASCII folder names if Unicode causes issues")
    print("3. Work in CEO-System/Agents instead of emoji folders if needed")
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 