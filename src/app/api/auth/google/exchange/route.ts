import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { code, redirectUri } = await request.json();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // We prefer the refresh_token for persistent login
    const tokenToStore = tokens.refresh_token || tokens.access_token;

    if (!tokenToStore) {
      throw new Error('No valid token returned from Google.');
    }

    // Automatically ensure the Murabbi Desk folder exists on user's Google Drive
    let rootFolderId = '';
    try {
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const { getOrCreateMurabbiDeskRoot } = await import('@/lib/drive-root');
      const rootFolder = await getOrCreateMurabbiDeskRoot(drive);
      rootFolderId = rootFolder.id;
    } catch (driveErr) {
      console.warn('Drive folder auto-creation warning during exchange:', driveErr);
    }

    return NextResponse.json({ token: tokenToStore, rootFolderId });
  } catch (error: any) {
    console.error('Exchange error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
