#!/bin/bash
# Hermes Tablet Sync Script - Run this on your tablet (Termux)
# Usage: bash hermes-tablet-sync.sh

echo "=== Hermes Tablet Sync ==="
echo "Tablet Tailscale IP: 100.88.154.3"
echo "Laptop Tailscale IP: 100.75.107.78"
echo ""

# Pull latest configs from laptop via Tailscale
echo "Pulling Hermes configs from laptop..."
git clone https://github.com/YassinAliYassin/solid-cloud-backup.git ~/hermes-sync 2>/dev/null || (cd ~/hermes-sync && git pull)

# Sync to Hermes directory
mkdir -p ~/.hermes
cp -r ~/hermes-sync/profiles ~/.hermes/ 2>/dev/null
cp ~/hermes-sync/config.yaml ~/.hermes/ 2>/dev/null
cp ~/hermes-sync/.env ~/.hermes/ 2>/dev/null

echo ""
echo "✓ Synced! Now run: hermes"
echo ""
echo "To connect to laptop's Gateway from tablet:"
echo "  http://100.75.107.78:25808"
echo ""
echo "To SSH from tablet to laptop:"
echo "  ssh yassin@100.75.107.78"
