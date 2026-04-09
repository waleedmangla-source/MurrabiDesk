#!/bin/bash
# Murrabi Desk — Deep Isolation Patcher

APP_PATH="./Murrabi-Stabilized.app"
PLIST="${APP_PATH}/Contents/Info.plist"
NEW_ID="com.murrabi.desk.v13.final"
NEW_NAME="Murrabi Stabilized"

echo "🎨 Injecting identity: ${NEW_ID}..."

# 1. Update Bundle Identifier
plutil -replace CFBundleIdentifier -string "${NEW_ID}" "${PLIST}"
plutil -replace CFBundleName -string "${NEW_NAME}" "${PLIST}"
plutil -replace CFBundleDisplayName -string "${NEW_NAME}" "${PLIST}"

echo "🔏 Performing ad-hoc re-signing..."

# 2. Re-sign the entire bundle (deep)
#    -f forces replacement, -s - uses ad-hoc identity, --deep signs frameworks too
#    Note: remove __CodeSignature first if it exists to avoid conflicts
rm -rf "${APP_PATH}/Contents/_CodeSignature"
codesign --force --deep --sign - "${APP_PATH}"

echo "✅ Identity shift complete."
