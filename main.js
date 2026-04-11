const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');
const MainSyncService = require('./main-sync-service');

// --- MURRABI DESK OS ---
app.commandLine.appendSwitch('disable-gpu');


// Load .env.local manually for Electron
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

if (process.platform === 'darwin') {
  const userDataPath = path.join(process.cwd(), '.electron-v6-stable-data');
  if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });
  app.setPath('userData', userDataPath);
}

// Global Sync Service Instance
let syncService = null;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3001/api/auth/google/callback';

function createWindow() {
  const port = process.env.PORT || 7778;
  console.log(`[ELECTRON] Creating window at http://localhost:${port}`);
  
  const win = new BrowserWindow({
    title: 'Murrabi Desk OS',
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'public/icons/icon.png'),
    transparent: true,
    vibrancy: 'under-window',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      webSecurity: false // Necessary for local file asar/out cross-loading fonts
    },
    show: false
  });

  // --- GOOGLE AUTH INTERCEPTOR (Frontend Hand-off) ---
  const { session } = require('electron');
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ['http://localhost:3001/api/auth/google/callback*'] },
    (details, callback) => {
      const url = new URL(details.url);
      const code = url.searchParams.get('code');
      
      if (code) {
        console.log('[ELECTRON] Intercepted OAuth code. Redirecting to onboarding hand-off...');
        callback({ redirectURL: `http://localhost:3001/onboarding?code=${code}` });
      } else {
        callback({});
      }
    }
  );

  const url = 'http://localhost:3001';
  console.log(`[ELECTRON] Loading application interface: ${url}`);
  win.loadURL(url);

  win.once('ready-to-show', () => {
    // Startup Animation Sequence
    const { screen } = require('electron');
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    const tw = 1200, th = 800;
    const swin = 720, shin = 480;
    
    win.setBounds({ x: Math.round((sw - swin) / 2), y: Math.round((sh - shin) / 2), width: swin, height: shin });
    win.setOpacity(0);
    win.show();
    
    let step = 0;
    const anim = setInterval(() => {
      step++;
      const t = step / 20;
      const eased = 1 - Math.pow(1 - t, 3);
      const cw = Math.round(swin + (tw - swin) * eased);
      const ch = Math.round(shin + (th - shin) * eased);
      win.setBounds({ x: Math.round((sw - cw) / 2), y: Math.round((sh - ch) / 2), width: cw, height: ch });
      win.setOpacity(eased);
      if (step >= 20) {
        clearInterval(anim);
        win.setOpacity(1);
      }
    }, 20);
  });
}

// --- IPC HANDLERS ---

// Window Controls
ipcMain.on('window-min', (event) => BrowserWindow.fromWebContents(event.sender).minimize());
ipcMain.on('window-max', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win.isMaximized()) win.unmaximize(); else win.maximize();
});
ipcMain.on('window-close', (event) => BrowserWindow.fromWebContents(event.sender).close());

// Auth & Sync
ipcMain.handle('auth:exchange-code', async (event, code) => {
  console.log('[ELECTRON] IPC Hand-off: Exchanging code for token...');
  try {
    if (!syncService) syncService = new MainSyncService(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    const { tokens } = await syncService.oauth2Client.getToken(code);
    
    if (tokens.refresh_token) {
      syncService.setRefreshToken(tokens.refresh_token);
      // Return encrypted token to frontend for localStorage storage
      return { 
        success: true, 
        encryptedToken: safeStorage.encryptString(tokens.refresh_token).toString('base64') 
      };
    }
    return { success: false, error: 'No refresh token' };
  } catch (err) {
    console.error('[ELECTRON] Exchange Error:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('sync-init', async (event, refreshToken) => {
  if (!syncService) syncService = new MainSyncService(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  syncService.setRefreshToken(refreshToken);
  return { success: true };
});

ipcMain.handle('logout', async () => {
  if (syncService) {
    syncService.oauth2Client.setCredentials({}); // Clear credentials
    syncService = null;
  }
  return { success: true };
});

ipcMain.handle('get-user-info', async () => syncService?.getUserInfo());

// Security
ipcMain.handle('decrypt-string', async (event, encrypted) => {
  if (!safeStorage.isEncryptionAvailable()) return encrypted;
  return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
});

ipcMain.handle('encrypt-string', async (event, plain) => {
  if (!safeStorage.isEncryptionAvailable()) return plain;
  return safeStorage.encryptString(plain).toString('base64');
});

// Storage
const STORAGE_PATH = path.join(app.getPath('userData'), 'local_cache');
if (!fs.existsSync(STORAGE_PATH)) fs.mkdirSync(STORAGE_PATH);

ipcMain.handle('local-store-save', async (event, { key, value }) => {
  fs.writeFileSync(path.join(STORAGE_PATH, `${key}.json`), JSON.stringify(value));
  return true;
});

ipcMain.handle('local-store-load', async (event, key) => {
  const p = path.join(STORAGE_PATH, `${key}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
});

// Google Service Bridges
ipcMain.handle('calendar-list', async (event, params) => {
  return syncService?.getCalendarEvents(params?.timeMin, params?.timeMax);
});
ipcMain.handle('calendar-insert', async (event, payload) => syncService?.createCalendarEvent(payload));
ipcMain.handle('gmail-list', async () => syncService?.getEmails());
ipcMain.handle('gmail-send', async (event, payload) => syncService?.sendEmail(payload.to, payload.subject, payload.body, payload.attachments));
ipcMain.handle('gmail-archive', async (event, id) => syncService?.archiveEmail(id));
ipcMain.handle('gmail-trash', async (event, id) => syncService?.trashEmail(id));
ipcMain.handle('gmail-mark-read', async (event, id) => syncService?.markAsRead(id));
ipcMain.handle('list-notes', async () => syncService?.listNotes());
ipcMain.handle('get-note-content', async (event, fileId) => syncService?.getNoteContent(fileId));
ipcMain.handle('save-note', async (event, payload) => syncService?.saveNote(payload.name, payload.content, payload.fileId));
ipcMain.handle('fetch-mission-notes', async () => syncService?.fetchMissionNotes());
ipcMain.handle('sync-mission-notes', async (event, content) => syncService?.syncMissionNotes(content));
ipcMain.handle('drive-upload', async (event, payload) => syncService?.uploadFile(payload.name, payload.content, payload.mimeType, payload.folderName));

// Namaz Sync Protocol
ipcMain.handle('prayer-times:fetch', async () => {
  return {
    Fajr: "05:30",
    Sunrise: "06:50",
    Zuhr: "13:15",
    Asr: "16:45",
    Sunset: "19:40",
    Maghrib: "19:55",
    Isha: "21:15"
  };
});

// --- CORE: Wait for Next.js server to be ready before opening window ---
const http = require('http');

function waitForServer(url, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = () => {
      http.get(url, (res) => {
        if (res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server at ${url} did not respond within ${timeoutMs}ms`));
        } else {
          retry();
        }
      });
    };
    const retry = () => setTimeout(poll, 500);
    poll();
  });
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    const iconPath = path.join(__dirname, 'public/icons/icon.png');
    if (fs.existsSync(iconPath)) app.dock.setIcon(iconPath);
  }

  console.log('[ELECTRON] Application Ready. Initializing static bridge...');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
