#!/bin/bash

# MeUnique Network Auto-Switch
# Automatically switches between WiFi and iPhone hotspot when network fails

# Configuration
PRIMARY_WIFI="Liat_Home"  # שם הרשת הביתית שלך
HOTSPOT_NAME="iPhone של ליאת"  # שם ההוטספוט של האייפון
HOTSPOT_PASSWORD="your_password"  # סיסמת ההוטספוט

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="$HOME/Library/Logs/MeUnique/network-switch.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check internet connectivity
check_internet() {
    # Try multiple servers to ensure it's not just one server down
    if ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1 || \
       ping -c 1 -W 2 1.1.1.1 > /dev/null 2>&1 || \
       ping -c 1 -W 2 google.com > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to get current WiFi network
get_current_network() {
    /System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | grep ' SSID' | awk '{print $2}'
}

# Function to connect to WiFi network
connect_to_network() {
    local network_name="$1"
    local password="$2"
    
    log_message "Attempting to connect to $network_name..."
    
    if [ -z "$password" ]; then
        networksetup -setairportnetwork en0 "$network_name"
    else
        networksetup -setairportnetwork en0 "$network_name" "$password"
    fi
    
    # Wait for connection
    sleep 5
    
    # Verify connection
    current_network=$(get_current_network)
    if [ "$current_network" = "$network_name" ]; then
        log_message "${GREEN}✓ Successfully connected to $network_name${NC}"
        return 0
    else
        log_message "${RED}✗ Failed to connect to $network_name${NC}"
        return 1
    fi
}

# Function to switch networks
switch_network() {
    current_network=$(get_current_network)
    
    if [ "$current_network" = "$PRIMARY_WIFI" ]; then
        # Currently on primary WiFi, switch to hotspot
        log_message "${YELLOW}Switching from $PRIMARY_WIFI to $HOTSPOT_NAME...${NC}"
        connect_to_network "$HOTSPOT_NAME" "$HOTSPOT_PASSWORD"
    else
        # Try to connect back to primary WiFi
        log_message "${YELLOW}Attempting to reconnect to primary WiFi: $PRIMARY_WIFI...${NC}"
        connect_to_network "$PRIMARY_WIFI" ""
    fi
}

# Main monitoring loop
main() {
    log_message "🚀 MeUnique Network Monitor Started"
    log_message "Primary WiFi: $PRIMARY_WIFI"
    log_message "Backup Hotspot: $HOTSPOT_NAME"
    
    consecutive_failures=0
    check_interval=30  # Check every 30 seconds
    
    while true; do
        if check_internet; then
            # Internet is working
            if [ $consecutive_failures -gt 0 ]; then
                log_message "${GREEN}✓ Internet connection restored${NC}"
                consecutive_failures=0
            fi
            
            # If we're on hotspot but primary is available, switch back
            current_network=$(get_current_network)
            if [ "$current_network" = "$HOTSPOT_NAME" ]; then
                # Check if primary WiFi is available
                if networksetup -getairportnetwork en0 | grep -q "$PRIMARY_WIFI"; then
                    log_message "Primary WiFi detected, switching back..."
                    connect_to_network "$PRIMARY_WIFI" ""
                fi
            fi
        else
            # Internet is not working
            consecutive_failures=$((consecutive_failures + 1))
            log_message "${RED}✗ Internet check failed (attempt $consecutive_failures)${NC}"
            
            # After 3 consecutive failures, switch network
            if [ $consecutive_failures -ge 3 ]; then
                log_message "${YELLOW}⚠️  Multiple failures detected, switching network...${NC}"
                switch_network
                consecutive_failures=0
                
                # Give the new connection time to establish
                sleep 10
            fi
        fi
        
        # Wait before next check
        sleep $check_interval
    done
}

# Handle script termination
cleanup() {
    log_message "🛑 MeUnique Network Monitor Stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    echo "Please don't run this script as root"
    exit 1
fi

# Start the monitor
main 