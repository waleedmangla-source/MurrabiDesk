import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { folderId } = await request.json().catch(() => ({}));
    const tokenHeader = request.headers.get('x-murrabi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`
    );

    oauth2Client.setCredentials({ 
      refresh_token: tokenHeader,
      access_token: tokenHeader.startsWith('ya29.') ? tokenHeader : undefined
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // If folderId is not provided, use 'root'
    const targetFolderId = folderId || 'root';

    const filesRes = await drive.files.list({
      q: `'${targetFolderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, iconLink, thumbnailLink, size, modifiedTime)',
      orderBy: 'folder, modifiedTime desc',
      pageSize: 100,
    });

    return NextResponse.json({ files: filesRes.data.files || [] });
  } catch (error: any) {
    console.error('Explore Drive Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
