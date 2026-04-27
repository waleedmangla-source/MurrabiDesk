import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const tokenHeader = request.headers.get('x-murrabi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri
    );

    oauth2Client.setCredentials({ 
      refresh_token: tokenHeader,
      access_token: tokenHeader.startsWith('ya29.') ? tokenHeader : undefined
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const ROOT_NAME = 'Murrabi Desk Drive';
    const DASHBOARD_FOLDER = 'Dashboard';
    const FILE_NAME = 'mission_notes.html';
    
    // 0. Resolve Root
    const rootSearch = await drive.files.list({
      q: `name = '${ROOT_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });
    
    if (!rootSearch.data.files || rootSearch.data.files.length === 0) {
      return NextResponse.json({ content: '' });
    }
    const rootId = rootSearch.data.files[0].id!;

    // 1. Resolve Dashboard Folder
    const dashSearch = await drive.files.list({
      q: `name = '${DASHBOARD_FOLDER}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });
    
    if (!dashSearch.data.files || dashSearch.data.files.length === 0) {
      return NextResponse.json({ content: '' });
    }
    const dashId = dashSearch.data.files[0].id!;

    // 2. Search for file
    const fileSearch = await drive.files.list({
      q: `name = '${FILE_NAME}' and '${dashId}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    if (!fileSearch.data.files || fileSearch.data.files.length === 0) {
      return NextResponse.json({ content: '' });
    }

    const fileId = fileSearch.data.files[0].id!;
    const fileRes = await drive.files.get({
      fileId,
      alt: 'media',
    });

    return NextResponse.json({ content: fileRes.data });
  } catch (error: any) {
    console.error('Fetch Mission Notes Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
