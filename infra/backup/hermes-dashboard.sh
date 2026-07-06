#!/bin/bash
# Hermes Agent Dashboard - Live Monitor
# Usage: hermes-dashboard (auto-refresh every 5s)

PROFILES=("default" "fresh-people" "solid-solutions" "solid-cloud")
REFRESH=5

trap "echo ''; exit 0" INT

while true; do
    clear
    echo "══════════════════════════════════════════════════════"
    echo "       HERMES AGENT DASHBOARD - LIVE"
    echo "       $(date '+%Y-%m-%d %H:%M:%S')"
    echo "══════════════════════════════════════════════════════"
    echo ""

    # System stats
    echo "SYSTEM:"
    echo "  CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')% | RAM: $(free -h | awk '/Mem:/ {print $3"/"$2}') | Disk: $(df -h ~ | awk 'NR==2 {print $3"/"$2" ("$5")"}')"
    echo ""

    # Profile stats
    echo "AGENTS:"
    for profile in "${PROFILES[@]}"; do
        config_path="$HOME/.hermes/profiles/$profile/config.yaml"
        [[ "$profile" == "default" ]] && config_path="$HOME/.hermes/config.yaml"
        
        # Model - handle both quoted and unquoted YAML values
        model=$(grep -A1 "^model:" "$config_path" 2>/dev/null | grep "default:" | sed 's/.*default:[[:space:]]*//' | tr -d '"' | tr -d "'")
        [ -z "$model" ] && model="tencent/hy3-preview:free"
        
        # Gateway status
        gw_status=$(systemctl --user is-active hermes-gateway 2>/dev/null || echo "inactive")
        [ "$gw_status" = "active" ] && gw_icon="✓" || gw_icon="✗"
        
        # Sessions
        sess_count=$(find "$HOME/.hermes/profiles/$profile/sessions/" -name "*.jsonl" 2>/dev/null | wc -l)
        [[ "$profile" == "default" ]] && sess_count=$(find "$HOME/.hermes/sessions/" -name "*.jsonl" 2>/dev/null | wc -l)
        
        # Skills count
        skills_count=$(ls "$HOME/.hermes/profiles/$profile/skills/" 2>/dev/null | wc -l)
        [[ "$profile" == "default" ]] && skills_count=$(ls "$HOME/.hermes/skills/" 2>/dev/null | wc -l)
        
        # Memory file size
        memory_file="$HOME/.hermes/profiles/$profile/memory.json"
        [[ "$profile" == "default" ]] && memory_file="$HOME/.hermes/memory.json"
        if [ -f "$memory_file" ]; then
            memory_size=$(du -h "$memory_file" 2>/dev/null | awk '{print $1}')
        else
            memory_size="0B"
        fi
        
        echo "• $profile"
        echo "    Model: $model"
        echo "    Gateway: $gw_icon $gw_status"
        echo "    Sessions: $sess_count | Skills: $skills_count | Memory: $memory_size"
        echo ""
    done

    echo "══════════════════════════════════════════════════════"
    echo "QUICK COMMANDS:"
    echo "  fresh-people chat | solid-solutions chat | solid-cloud chat"
    echo "  hermes -p <profile> gateway start/stop/restart"
    echo "  Ctrl+C to exit"
    echo "══════════════════════════════════════════════════════"
    echo ""
    echo "Refreshing in $REFRESH seconds..."
    
    sleep $REFRESH
done
