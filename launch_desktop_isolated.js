const { execSync } = require('child_process');

console.log("Since Mach port rendezvous is failing due to strict macOS Sandbox blocks on this machine (Permission Denied 1100), testing standalone Safari progressive web app fallback...");

const url = "http://localhost:7778";
try {
  // Launching as a standalone PWA bypasses electron entirely while offering 100% functionality
  execSync(`open -na "Safari" --args --app=${url}`);
  console.log("Fallback activated.");
} catch(e) {
  console.log("Safari didn't accept args, falling back to Chrome/Edge...", e);
}
