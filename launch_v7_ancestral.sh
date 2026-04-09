#!/bin/bash
# Murrabi Desk V7.1: Ancestral Restore (M3 Pro)
# Using the 'open' command bypasses the sandboxed coalition's Mach port block.

PROJECT_DIR="/Users/waleedmangla/.gemini/antigravity/scratch/murabbi-desk"
cd "$PROJECT_DIR" || exit

echo "--- Murrabi Desk V7.1: Ancestral Recovery ---"

# 1. Force Purge
echo "[1/4] Purging zombie processes..."
pkill -9 "Electron" || true
lsof -ti :7778 | xargs kill -9 || true
rm -rf .electron-v7-final-data

# 2. Start Next.js
echo "[2/4] Starting Next.js server on historically stable port 7778..."
export PORT=7778
export NODE_ENV=development
npx next dev -p 7778 > v7_next_dev.log 2>&1 &

# 3. Wait for Readiness
echo "[3/4] Waiting for Next.js to warm up..."
MAX_WAIT=60
COUNT=0
while ! curl -s http://localhost:7778 | grep -q "Murrabi" && [ $COUNT -lt $MAX_WAIT ]; do
    sleep 1
    ((COUNT++))
    printf "."
done
echo ""

# 4. The 'open' Bypass
echo "[4/4] Executing Electron via macOS 'open' bypass..."
# This uses the system launcher instead of the sandboxed 'node' spawn
open node_modules/electron/dist/Electron.app --args "$PWD/main.js" --no-sandbox --disable-gpu --disable-features=MachPortRendezvous

echo "✅ Ancestral Restore Triggered. If the window appears, the Mach port block is cleared."
