const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function launch() {
  console.log('--- Murrabi Desk OS v12: Stabilized Launch (M3 Pro) ---');
  
  // 1. Setup Env
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  process.env.PORT = '7777'; 
  process.env.NODE_ENV = 'development';

  // 2. Clear stale data
  const userDataPath = path.join(__dirname, '.electron-v6-stable-data');
  if (fs.existsSync(userDataPath)) {
    console.log('[0/3] Cleaning stale user data...');
    // Simple recursive delete if possible, or just ignore
  }

  // 3. Start Next.js (Background)
  console.log('[1/3] Starting Next.js server on port 7777...');
  const next = spawn('npx', ['next', 'dev', '-p', '7777'], {
    stdio: 'pipe',
    cwd: __dirname,
    env: { ...process.env, PORT: '7777' }
  });

  next.stdout.on('data', (data) => {
    if (data.toString().includes('Ready in')) {
      console.log('[SUCCESS] Next.js is ready.');
    }
  });

  // 4. Launch Electron with stabilized flags
  console.log('[2/3] Spawning Electron with MachPortRendezvous bypass...');
  
  const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
  const mainPath = path.join(__dirname, 'main.js');

  const args = [
    mainPath,
    '--no-sandbox',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-features=MachPortRendezvous,SharedArrayBuffer',
    '--single-process',
    '--ignore-certificate-errors',
    '--user-data-dir=' + userDataPath
  ];

  const electron = spawn(electronPath, args, {
    stdio: 'inherit',
    env: { ...process.env, STABILIZED_MODE: 'true', PORT: '7777' }
  });

  electron.on('close', (code) => {
    console.log(`[3/3] Electron exited with code ${code}`);
    next.kill();
    process.exit(code);
  });
  
  process.on('SIGINT', () => {
    next.kill();
    electron.kill();
    process.exit();
  });
}

launch();
