#!/bin/bash
# Murrabi Desk OS — Production Stable Launcher (GUI Hardened)
# Refactored for LaunchServices/Dock context on macOS M3 Pro (arm64/x64).

APP_NAME="Murrabi Desk Liquid OS"
UI_PORT=3777
BRAIN_PORT=7780
LOG_FILE="/tmp/murrabi_bootstrap.log"

# 1. Environment & Path Discovery
# macOS GUI apps do not inherit terminal PATH. We must manually discover Node.
export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

NODE_BIN=$(which node)
if [ -z "$NODE_BIN" ]; then
    # Fallback to absolute paths if 'which' fails in minimal environment
    if [ -f "/usr/local/bin/node" ]; then NODE_BIN="/usr/local/bin/node";
    elif [ -f "/opt/homebrew/bin/node" ]; then NODE_BIN="/opt/homebrew/bin/node";
    elif [ -f "/usr/bin/node" ]; then NODE_BIN="/usr/bin/node";
    fi
fi

if [ -z "$NODE_BIN" ]; then
    echo "❌ Error: Node.js not found in standard paths." > "$LOG_FILE"
    exit 1
fi

# 2. Self-Locating Directory Setup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ "$SCRIPT_DIR" == *"Contents/MacOS"* ]]; then
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/../Resources/app" && pwd)"
else
    PROJECT_ROOT="$SCRIPT_DIR"
fi

cd "$PROJECT_ROOT" || exit 1
echo "🚀 Starting $APP_NAME [$(date)]" > "$LOG_FILE"
echo "📍 CWD: $PROJECT_ROOT" >> "$LOG_FILE"
echo "🟢 Node: $NODE_BIN" >> "$LOG_FILE"

# 3. Cleanup Zombie Processes
echo "🧹 Clearing existing processes..." >> "$LOG_FILE"
lsof -ti :$UI_PORT | xargs kill -9 2>/dev/null || true
lsof -ti :$BRAIN_PORT | xargs kill -9 2>/dev/null || true

# 4. Launch Services (Using absolute Node path and nohup)
export NODE_ENV=production

echo "🧠 Starting Sync Engine (Brain)..." >> "$LOG_FILE"
"$NODE_BIN" brain.js >> "$LOG_FILE" 2>&1 &
BRAIN_PID=$!

echo "🌐 Starting Next.js Production Server..." >> "$LOG_FILE"
# Direct call to Next.js source binary to avoid symlink resolution issues in bundles
"$NODE_BIN" ./node_modules/next/dist/bin/next start -p $UI_PORT >> "$LOG_FILE" 2>&1 &
NEXT_PID=$!

# 5. Readiness Polling
echo "⏳ Waiting for stability..." >> "$LOG_FILE"
MAX_RETRIES=40
COUNT=0
while ! curl -s "http://localhost:$UI_PORT" >/dev/null && [ $COUNT -lt $MAX_RETRIES ]; do
    sleep 1
    ((COUNT++))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Error: Timeout waiting for UI server." >> "$LOG_FILE"
    kill $BRAIN_PID $NEXT_PID 2>/dev/null
    exit 1
fi

# 6. Open Liquid Glass Window
echo "✨ Launching native shell window..." >> "$LOG_FILE"
open -a "Safari" "http://localhost:$UI_PORT"

# 7. Cleanup & Monitoring
cleanup() {
    echo "🛑 Shutting down $APP_NAME services..." >> "$LOG_FILE"
    kill $BRAIN_PID $NEXT_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Keep the launcher script alive as the "owner" of the app in the Dock
# If this exits, macOS thinks the app crashed/stopped.
while true; do
    if ! kill -0 $BRAIN_PID 2>/dev/null || ! kill -0 $NEXT_PID 2>/dev/null; then
        echo "⚠️  Service crashed. Exiting launcher." >> "$LOG_FILE"
        cleanup
    fi
    sleep 10
done
