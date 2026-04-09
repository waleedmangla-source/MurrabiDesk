#!/bin/bash

# Murrabi Desk Native - High Fidelity Launch Script
# Resolves Mach Port Rendezvous conflicts and ensures asset health.

PROJECT_DIR="/Users/waleedmangla/.gemini/antigravity/scratch/murabbi-desk"
cd "$PROJECT_DIR" || exit

echo "⚡️ Initializing Murrabi Desk Native Restoration..."

# Step 1: Force kill any existing processes to avoid port conflicts
echo "🧹 Clearing existing processes..."
killall Electron 2>/dev/null || true
# Kill any existing next dev server on 7778
lsof -ti :7778 | xargs kill -9 2>/dev/null || true
sleep 1

# Step 2: Clean up potential corrupted assets
if [ "$1" == "--clean" ]; then
    echo "🧹 Deep cleaning .next directory..."
    rm -rf .next
fi

# Step 3: Start Next.js dev server if not running
echo "🌐 Starting Next.js Dev Server on port 7778..."
export NODE_ENV=development
npm run dev -- -p 7778 > next_dev_7778.log 2>&1 &

# Step 4: Wait for the server to be ready (look for the Ready message or successful curl)
echo "⏳ Waiting for server to initialize..."
MAX_RETRIES=30
RETRY_COUNT=0
while ! curl -s http://localhost:7778 | grep -q "Murrabi Desk"; do
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Server failed to start in time. Check next_dev_7778.log"
        exit 1
    fi
    echo "   ...still waiting ($RETRY_COUNT/$MAX_RETRIES)"
done

# Step 5: Launch Electron
export ELECTRON_DISABLE_SECURITY_WARNINGS=true
echo "🚀 Launching Native Electron Shell..."
npx electron . --no-sandbox --enable-logging &

echo "✅ Launch sequence complete. The native window should appear with full design."
