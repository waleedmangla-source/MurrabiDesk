const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8877;
const APP_DIR = __dirname;
const ELECTRON_BIN = path.join(APP_DIR, 'node_modules', '.bin', 'electron');
const LOG_FILE = path.join(APP_DIR, 'restoration_v5.log');
const DATA_DIR = path.join(APP_DIR, '.electron-v6-stable-data');

function log(msg) {
  const timestamp = new Date().toISOString();
  const formattedMsg = `[${timestamp}] ${msg}\n`;
  console.log(msg);
  fs.appendFileSync(LOG_FILE, formattedMsg);
}

function cleanupPorts() {
  log(`🧹 Purging potential port conflicts...`);
  // Hard Kill all potential conflicts including 8899 explicitly
  const ports = [PORT, 1212, 5858, 7777, 7778, 7779];
  for (const p of ports) {
    try {
      // More robust lsof cleanup
      const pids = execSync(`lsof -t -i :${p}`).toString().trim();
      if (pids) {
        log(`🧹 Found PIDs on port ${p}: ${pids.split('\n').join(', ')}`);
        execSync(`kill -9 ${pids.split('\n').join(' ')}`, { stdio: 'ignore' });
        log(`✅ Cleared port ${p}`);
      }
    } catch (e) {}
  }
}

async function launch() {
  fs.writeFileSync(LOG_FILE, '');
  log(`⚡️ STABILIZING Murrabi Desk OS (Purist Electron Mode)...`);
  
  cleanupPorts();

  log(`🌐 Initializing Next.js Environment (Port ${PORT})...`);
  const nextProcess = spawn('npm', ['run', 'dev', '--', '-p', PORT.toString()], {
    cwd: APP_DIR,
    stdio: 'inherit',
    env: { ...process.env, PORT: PORT.toString() }
  });

  log(`⏳ Waiting 12s for Next.js environment to stabilize...`);
  setTimeout(() => {
    log(`🚀 Launching Official Notarized Electron Shell...`);
    
    // Using standard launch flags on the official signed binary
    const electronProcess = spawn(ELECTRON_BIN, [
      '.', 
      '--no-sandbox', 
      '--disable-gpu', 
      '--disable-software-rasterizer',
      '--disable-features=MachPortRendezvous'
    ], {
      cwd: APP_DIR,
      env: { ...process.env, PORT: PORT.toString(), NODE_ENV: 'development' },
      stdio: 'inherit'
    });

    electronProcess.on('exit', (code) => {
      log(`🛑 Electron shell exited with code ${code}. Cleaning up...`);
      nextProcess.kill();
      process.exit(code || 0);
    });

  }, 12000);
}

launch().catch(err => {
  log(`\n💥 Fatal Error: ${err.message}`);
  process.exit(1);
});
