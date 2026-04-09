import { NextRequest, NextResponse } from 'next/server';
import MainSyncService from '@/lib/main-sync-service';
import crypto from 'crypto';

// Dynamic execution required for stateful-ish logic in serverless
export const dynamic = 'force-dynamic';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'murrabi-default-secret';

// ENCRYPTION HELPERS (Synchronized with brain.js logic)
const ENCRYPTION_KEY = crypto.scryptSync(ENCRYPTION_SECRET, 'murrabi-salt', 32);
const IV_LENGTH = 16;

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift() || '', 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  const action = params.action;
  const body = await request.json();
  const origin = request.nextUrl.origin;
  // Ensure we use the proper scheme and host for Google's redirect URI
  const REDIRECT_URI = origin.includes('localhost') 
    ? `http://localhost:3001/api/auth/google/callback`
    : `${origin}/api/auth/google/callback`;

  console.log(`🧠 [BRAIN-API] Origin: ${origin} | Redirect: ${REDIRECT_URI}`);

  // Use token from request headers if available (Stateless mode)
  const tokenHeader = request.headers.get('x-murrabi-token');
  const refreshToken = (tokenHeader && tokenHeader !== 'null') ? decrypt(tokenHeader) : body.refreshToken;

  console.log(`🧠 [BRAIN-API] Action: ${action} | Env: ${process.env.NODE_ENV}`);

  try {
    const syncService = new (MainSyncService as any)(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    if (refreshToken) {
      syncService.setRefreshToken(refreshToken);
    }

    let result: any = { success: true };

    switch (action) {
      case 'health':
        result = { status: 'alive', identity: 'Murrabi Vercel API Brain' };
        break;

      case 'auth-exchange':
        const { tokens } = await syncService.oauth2Client.getToken(body.code);
        if (tokens.refresh_token) {
          result = { success: true, encryptedToken: encrypt(tokens.refresh_token) };
        } else {
          result = { success: false, error: 'No refresh token returned' };
        }
        break;

      case 'get-user-info':
        result = await syncService.getUserInfo();
        break;

      case 'calendar-list':
        result = await syncService.getCalendarEvents(body.timeMin, body.timeMax);
        break;

      case 'gmail-list':
        result = await syncService.getEmails();
        break;

      case 'fetch-mission-notes':
        result = await syncService.fetchMissionNotes();
        break;

      case 'sync-mission-notes':
        await syncService.syncMissionNotes(body.content);
        result = { success: true };
        break;

      case 'decrypt':
        result = { decrypted: decrypt(body.encrypted) };
        break;

      case 'encrypt':
        result = { encrypted: encrypt(body.plain) };
        break;

      default:
        return NextResponse.json({ error: 'Action Not Found' }, { status: 404 });
    }

    return NextResponse.json(result || { success: true });
  } catch (err: any) {
    console.error(`🧠 [BRAIN-API] Error in ${action}:`, err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
