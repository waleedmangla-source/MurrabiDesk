const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

// 1. STABLE KEY DERIVATION (Mac Machine-Specific)
function getMachineSecret() {
  try {
    const serial = execSync('ioreg -rd1 -c IOPlatformExpertDevice | grep -i "IOPlatformSerialNumber"').toString();
    const match = serial.match(/"IOPlatformSerialNumber"\s*=\s*"(.*)"/);
    return match ? match[1] : 'murrabi-static-fallback';
  } catch (e) {
    return 'murrabi-static-fallback';
  }
}

const MACHINE_SECRET = getMachineSecret();
const ENCRYPTION_KEY = crypto.scryptSync(MACHINE_SECRET, 'murrabi-salt', 32); // 256-bit key
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// 2. MOCK ELECTRON PLUMBING (Mocking what MainSyncService expects)
// We need to Mock the parts of electron that MainSyncService imports but doesn't use for GUI.
// (Luckily, MainSyncService was already quite clean).
const MainSyncService = require('./src/lib/main-sync-service');

// 3. ENV & PATHS
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) process.env[key.trim()] = value.trim();
    });
  }
}
loadEnv();

const DATA_PATH = path.join(process.cwd(), '.murrabi-headless-data');
if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true });

let syncService = null;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3001/api/auth/google/callback';

const PORT = 7780;

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const data = body ? JSON.parse(body) : {};
      const action = req.url.slice(1);
      
      console.log(`🧠 [BRAIN-NODE] Action: ${action}`);
      let result = { success: true };

      switch (action) {
        case 'health':
          result = { status: 'alive', identity: 'Murrabi Pure Node Brain' };
          break;

        case 'auth-exchange':
          if (!syncService) syncService = new MainSyncService(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
          const { tokens } = await syncService.oauth2Client.getToken(data.code);
          if (tokens.refresh_token) {
            syncService.setRefreshToken(tokens.refresh_token);
            result = { success: true, encryptedToken: encrypt(tokens.refresh_token) };
          } else {
            result = { success: false, error: 'No refresh token returned' };
          }
          break;

        case 'sync-init':
          if (!syncService) syncService = new MainSyncService(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
          syncService.setRefreshToken(data.refreshToken);
          result = { success: true };
          break;

        case 'get-user-info':
          result = await syncService?.getUserInfo();
          break;

        case 'calendar-list':
          result = await syncService?.getCalendarEvents(data.timeMin, data.timeMax);
          break;

        case 'gmail-list':
          result = await syncService?.getEmails();
          break;

        case 'fetch-mission-notes':
          result = await syncService?.fetchMissionNotes();
          break;

        case 'sync-mission-notes':
          await syncService?.syncMissionNotes(data.content);
          result = { success: true };
          break;

        case 'decrypt':
          result = { decrypted: decrypt(data.encrypted) };
          break;

        case 'encrypt':
          result = { encrypted: encrypt(data.plain) };
          break;

        case 'logout':
          syncService = null;
          result = { success: true };
          break;

        default:
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Not Found' }));
          return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result || { success: false, error: 'Empty state' }));
    } catch (err) {
      console.error(`🧠 [BRAIN-NODE] Error: ${err.message}`);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  });
});

server.listen(PORT, 'localhost', () => {
  console.log(`🧠 [BRAIN-NODE] Pure Node.js Sync Engine live on http://localhost:${PORT}`);
});
