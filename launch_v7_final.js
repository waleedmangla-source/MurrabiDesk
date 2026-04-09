const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function launch() {
  console.log('--- Murrabi Desk V7: Clean Born Launch (M3 Pro) ---');
  
  // 1. Setup Env for Clean Shift
  const PORT = '7799';
  const V7_ID = 'com.murrabi.desk.v7.final';
  const V7_DATA = path.join(__dirname, '.electron-v7-final-data');

  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  process.env.PORT = PORT;
  process.env.NODE_ENV = 'development';

  if (!fs.existsSync(V7_DATA)) fs.mkdirSync(V7_DATA, { recursive: true });

  // 2. Start Next.js on the New Port
  console.log(`[1/3] Starting Next.js server on clean port ${PORT}...`);
  const next = spawn('npx', ['next', 'dev', '-p', PORT], {
    stdio: 'pipe',
    cwd: __dirname,
    env: { ...process.env, PORT }
  });

  next.stdout.on('data', (data) => {
    const out = data.toString();
    if (out.includes('Ready in') || out.includes('started server')) {
      console.log(`[SUCCESS] Next.js is operational on ${PORT}.`);
    }
  });

  // 3. Spawning Electron with Ad-Hoc Identity
  console.log(`[2/3] Spawning Electron V7 (Identity: ${V7_ID})...`);
  
  const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
  const mainPath = path.join(__dirname, 'main.js');

  const args = [
    mainPath,
    '--no-sandbox',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-features=MachPortRendezvous,SharedArrayBuffer',
    '--js-flags=--no-concurrent-recompilation --no-use-ic', 
    '--user-data-dir=' + V7_DATA
  ];

  const electron = spawn(electronPath, args, {
    stdio: 'inherit',
    env: { ...process.env, PORT, V7_MODE: 'true' }
  });

  electron.on('close', (code) => {
    console.log(`[3/3] Electron V7 exited with code ${code}`);
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
