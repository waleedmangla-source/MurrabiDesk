#!/bin/bash

APP_NAME="Murrabi Desk Liquid"
APP_BUNDLE="${APP_NAME}.app"
CONTENTS="${APP_BUNDLE}/Contents"
MACOS="${CONTENTS}/MacOS"
RESOURCES="${CONTENTS}/Resources"

echo "Creating Liquid Glass Bundle: ${APP_BUNDLE}..."

# 1. Create Structure
mkdir -p "${MACOS}"
mkdir -p "${RESOURCES}"

# 2. Create Launcher Script
# This launcher simply tells Safari (Native/Stable) to open our local frontend.
cat << 'EOF' > "${MACOS}/Murrabi Desk Liquid"
#!/bin/bash
# Murrabi Desk — Native Safari Shell
# Bypasses Electron Renderer SIGTRAP on M3 Pro

# Ensure the app is running in stand-alone mode as much as possible
open -a "Safari" "http://localhost:3777"
EOF

chmod +x "${MACOS}/Murrabi Desk Liquid"

# 3. Create Info.plist
cat << EOF > "${CONTENTS}/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Murrabi Desk Liquid</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.murrabi.desk.liquid.v1</string>
    <key>CFBundleName</key>
    <string>Murrabi Desk Liquid</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
</dict>
</plist>
EOF

# 4. Generate High-Quality Icons
ICON_512="public/icons/icon-512x512.png"
if [ -f "$ICON_512" ]; then
    echo "💎 Generating High-Fidelity Icons..."
    mkdir -p Murrabi.iconset
    sips -z 16 16     "$ICON_512" --out Murrabi.iconset/icon_16x16.png > /dev/null 2>&1
    sips -z 32 32     "$ICON_512" --out Murrabi.iconset/icon_16x16@2x.png > /dev/null 2>&1
    sips -z 32 32     "$ICON_512" --out Murrabi.iconset/icon_32x32.png > /dev/null 2>&1
    sips -z 64 64     "$ICON_512" --out Murrabi.iconset/icon_32x32@2x.png > /dev/null 2>&1
    sips -z 128 128   "$ICON_512" --out Murrabi.iconset/icon_128x128.png > /dev/null 2>&1
    sips -z 256 256   "$ICON_512" --out Murrabi.iconset/icon_128x128@2x.png > /dev/null 2>&1
    sips -z 256 256   "$ICON_512" --out Murrabi.iconset/icon_256x256.png > /dev/null 2>&1
    sips -z 512 512   "$ICON_512" --out Murrabi.iconset/icon_256x256@2x.png > /dev/null 2>&1
    sips -z 512 512   "$ICON_512" --out Murrabi.iconset/icon_512x512.png > /dev/null 2>&1
    sips -z 1024 1024 "$ICON_512" --out Murrabi.iconset/icon_512x512@2x.png > /dev/null 2>&1
    
    iconutil -c icns Murrabi.iconset -o "${RESOURCES}/AppIcon.icns" > /dev/null 2>&1
    rm -rf Murrabi.iconset
fi

echo "✅ Liquid Glass Bundle ready: ${APP_BUNDLE}"

