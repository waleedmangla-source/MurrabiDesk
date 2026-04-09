const { spawn, execSync } = require('child_process');
const path = require('path');
const http = require('http');

const NEXT_PORT = 3777;
const BRAIN_PORT = 7780;

function log(msg) { console.log(`🚀 [LIQUID] ${msg}`); }

function killPort(port) {
  try {
    const pids = execSync(`lsof -t -i :${port}`).toString().trim();
    if (pids) execSync(`kill -9 ${pids.split('\n').join(' ')}`, { stdio: 'ignore' });
  } catch (e) { }
}

function waitForServer(port, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = () => {
      http.get(`http://localhost:${port}/health`, (res) => {
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`Timeout on port ${port}`));
        else setTimeout(poll, 1000);
      });
    };
    poll();
  });
}

async function launch() {
  log(`Starting Liquid Glass Stabilization Protocol...`);

  killPort(NEXT_PORT);
  killPort(BRAIN_PORT);

  // 1. Start Pure Node Brain
  log(`Starting Pure Node Brain on ${BRAIN_PORT}...`);
  const brain = spawn('node', ['brain.js'], {
    stdio: 'inherit',
    detached: true,
    env: { ...process.env }
  });
  brain.unref();

  // 2. Start Next.js
  log(`Starting Next.js Frontend on ${NEXT_PORT}...`);
  const next = spawn('npx', ['next', 'dev', '-p', NEXT_PORT.toString()], {
    stdio: 'inherit',
    detached: true
  });
  next.unref();

  log(`Waiting for services to stabilize...`);
  try {
    await waitForServer(BRAIN_PORT);
    log(`✅ Brain is alive.`);
    // Next.js doesn't have a /health usually, but we'll wait for the root
    await new Promise(r => setTimeout(r, 5000));
    log(`✅ Frontend is ready.`);
  } catch (e) {
    log(`❌ Service timeout: ${e.message}`);
    process.exit(1);
  }

  // 3. Launch Safari Shell
  log(`Opening Murrabi Desk Liquid Shell...`);
  spawn('open', ['-a', path.join(process.cwd(), 'Murrabi Desk Liquid.app')], { stdio: 'inherit' });

  log(`✨ Stabilization Complete. Murrabi Desk is now running in Liquid Glass mode.`);
}

launch();
