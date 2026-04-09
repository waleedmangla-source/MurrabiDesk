const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = 3001;
const APP_DIR = __dirname;

function log(msg) {
  console.log(msg);
}

function killPort(port) {
  try {
    const pids = execSync(`lsof -t -i :${port}`).toString().trim();
    if (pids) execSync(`kill -9 ${pids.split('\n').join(' ')}`, { stdio: 'ignore' });
    log(`🧹 Cleared zombie processes on Port ${port}.`);
  } catch (e) {}
}

function waitForServer(port, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = () => {
      http.get(`http://localhost:${port}`, (res) => {
        if (res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout: Server on port ${port} never became ready.`));
        } else {
          retry();
        }
      });
    };
    const retry = () => setTimeout(poll, 500);
    poll();
  });
}

async function launch() {
  log(`⚡️ Murrabi Desk OS — Stable Launch Protocol`);
  
  // 1. Clear lingering port processes
  killPort(PORT);

  // 2. Start Next.js as a background process (not a child we wait on)
  log(`🌐 Starting Next.js on port ${PORT}...`);
  const nextProcess = spawn('npx', ['next', 'dev', '-p', PORT.toString(), '-H', 'localhost'], {
    cwd: APP_DIR,
    stdio: 'inherit',
    env: { ...process.env },
    detached: false
  });

  nextProcess.on('error', (err) => log(`❌ Next.js error: ${err.message}`));

  // 3. Poll until Next.js is ready
  log(`⏳ Waiting for server at localhost:${PORT}...`);
  try {
    await waitForServer(PORT);
  } catch (err) {
    log(`❌ ${err.message}`);
    nextProcess.kill();
    process.exit(1);
  }

  log(`✅ Server ready! Launching Electron...`);

  // 4. Launch Isolated Electron Binary
  log(`🚀 Murrabi Desk OS — Launching Deep Isolated Binary...`);
  const electronBin = path.join(APP_DIR, 'Murrabi-Stabilized.app', 'Contents', 'MacOS', 'Electron');
  const electronProcess = spawn(electronBin, [
    '.',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-features=MachPortRendezvous,SharedArrayBuffer',
    '--single-process'
  ], {
    cwd: APP_DIR,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development', ELECTRON_DISABLE_SECURITY_WARNINGS: 'true' },
    detached: true
  });

  electronProcess.unref(); // Let this script exit without killing Electron

  log(`🚀 Murrabi Desk OS is live.`);
}

launch().catch(err => {
  log(`💥 Fatal: ${err.message}`);
  process.exit(1);
});
