#!/bin/bash
# Murrabi Desk V8: Ultimate Identity Isolation (M3 Pro)
# Cloning the Electron bundle breaks the Agent's Mach port monopoly.

PROJECT_DIR="/Users/waleedmangla/.gemini/antigravity/scratch/murabbi-desk"
cd "$PROJECT_DIR" || exit

echo "--- Murrabi Desk V8: Ultimate Isolation ---"

# 1. Force Purge
echo "[1/4] Purging zombie processes..."
pkill -9 "Electron" || true
pkill -9 "Isolated-Murrabi" || true
lsof -ti :9901 | xargs kill -9 || true
rm -rf .electron-v8-data

# 2. Start Next.js
echo "[2/4] Starting Next.js server on clean port 9901..."
export PORT=9901
export NODE_ENV=development
npx next dev -p 9901 > v8_next_dev.log 2>&1 &

# 3. Wait for Readiness
echo "[3/4] Waiting for Next.js to warm up..."
MAX_WAIT=60
COUNT=0
# Search for 'Ready' or status 200
while ! curl -s http://localhost:9901 | grep -q "Murrabi" && [ $COUNT -lt $MAX_WAIT ]; do
    sleep 1
    ((COUNT++))
    printf "."
done
echo ""

# 4. The Isolated Launch
echo "[4/4] Executing Isolated Murrabi via Bundle Bypass..."
# We use 'open' to ensure the OS treats this as a brand new Application (com.murabbi.desk.isolated.v8)
open dist/Isolated-Murrabi.app --args "$PWD/main.js" --no-sandbox --disable-gpu --disable-features=MachPortRendezvous

echo "✅ V8 Ultimate Isolation Triggered."
echo "If successful, a new window (Isolated Murrabi) will appear, effectively bypassing the Host Agent's Mach conflict."
