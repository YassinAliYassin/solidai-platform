#!/bin/bash
# Hermes Tablet Sync Script - Run this on your tablet (Termux)
# Usage: bash hermes-tablet-sync.sh
#
# Keeps the *non-sensitive* reference helpers from the consolidated
# solidai-platform repo in sync on the tablet.
#
# NOTE: live agent config (profiles/, config.yaml, .env) is intentionally
# NOT committed to git. Sync those out-of-band from the laptop, e.g.:
#   scp -r yassin@100.75.107.78:.hermes/profiles ~/.hermes/
#   scp yassin@100.75.107.78:.hermes/config.yaml ~/.hermes/
#   scp yassin@100.75.107.78:.hermes/.env ~/.hermes/
# (Over Tailscale: laptop 100.75.107.78 / tablet 100.88.154.3)

set -euo pipefail

REPO_URL="https://github.com/YassinAliYassin/solidai-platform.git"
# The repo's GitHub default branch is "gh-pages" (a Pages artifact) and does
# NOT contain infra/backup. Pin to "main", where the source actually lives.
REPO_BRANCH="main"
SYNC_DIR="$HOME/hermes-sync"
TABLET_IP="100.88.154.3"
LAPTOP_IP="100.75.107.78"

echo "=== Hermes Tablet Sync ==="
echo "Tablet Tailscale IP: $TABLET_IP"
echo "Laptop Tailscale IP: $LAPTOP_IP"
echo ""

# Clone once, then pull on subsequent runs (idempotent).
if [ ! -d "$SYNC_DIR/.git" ]; then
    echo "Cloning solidai-platform (reference helpers only)..."
    if ! git clone --branch "$REPO_BRANCH" --single-branch "$REPO_URL" "$SYNC_DIR"; then
        echo "ERROR: clone failed. Check network/Tailscale and the repo URL." >&2
        exit 1
    fi
else
    echo "Updating local copy..."
    if ! git -C "$SYNC_DIR" pull --ff-only; then
        echo "ERROR: git pull failed (working tree dirty?). Aborting." >&2
        exit 1
    fi
fi

SRC="$SYNC_DIR/infra/backup"
if [ ! -d "$SRC" ]; then
    echo "ERROR: expected infra/backup/ not present in repo. Aborting." >&2
    exit 1
fi

mkdir -p ~/.hermes

# Sync non-sensitive reference artifacts.
echo "Syncing reference helpers from infra/backup/..."
cp "$SRC/hermes-dashboard.sh" ~/.hermes/hermes-dashboard.sh 2>/dev/null || true
cp "$SRC/bashrc-backup" ~/.hermes/bashrc-backup 2>/dev/null || true
echo "  • ~/.hermes/hermes-dashboard.sh"
echo "  • ~/.hermes/bashrc-backup"

echo ""
echo "✓ Reference helpers synced from $REPO_URL"
echo ""
echo "Remember: live config (profiles/config.yaml/.env) is NOT in git."
echo "Pull it from the laptop over Tailscale, e.g.:"
echo "  scp -r yassin@$LAPTOP_IP:.hermes/profiles ~/.hermes/"
echo "  scp yassin@$LAPTOP_IP:.hermes/config.yaml ~/.hermes/"
echo "  scp yassin@$LAPTOP_IP:.hermes/.env ~/.hermes/"
echo ""
echo "To connect to the laptop's Gateway from this tablet:"
echo "  http://$LAPTOP_IP:25808"
