---
description: Export and Package Murrabi Desk Native
---

// turbo-all

# Export Murrabi Desk Native (macOS)

This workflow automates the export of the Murrabi Desk Native application, applying all architectural fixes for Mach port crashes, routing, and packaging.

## 1. Environment & Setup
1. Validate `.env.local` exists for API services.
2. Ensure `node_modules` are installed.
3. Remove previous build artifacts.
```bash
rm -rf out .next dist
npm install
```

## 2. Pre-Build Verification (Mistake Prevention)
1. Verify `next.config.mjs` is set to `output: 'export'`.
2. Verify `main.js` contains the manual `.env.local` loader (`loadEnv`).
3. Verify `main.js` has the protocol handler for extensionless routes.
4. Verify `main.js` has `--no-sandbox` to prevent Mach port crashes.

## 3. Product Identity Update
**Manual Step:** If this is a new version or fix for a crashing build:
1. Increment `version` in `package.json`.
2. (Optional) If Mach port crashes persist, update `appId` in `package.json` to a unique suffix (e.g., `.v2`, `.v3`).

## 4. Execute Build & Export
1. Generate the static Next.js export:
```bash
npm run build
```
2. Verify the `out/` directory contains `.html` equivalents for all routes.

## 5. Generate Production Bundle
1. Package the Electron app into a DMG:
```bash
npm run dist
```
2. Locate the final installer in the `dist/` directory.

## 6. Post-Export Troubleshooting
- If UI is blank: Check `main.js` protocol handler logs.
- If assets fail to load: Check `next.config.mjs` path settings.
- If launch fails on macOS: Confirm `--no-sandbox` is enabled.
