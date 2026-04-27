import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
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
    let rootId = '';
    const rootSearch = await drive.files.list({
      q: `name = '${ROOT_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });
    if (rootSearch.data.files && rootSearch.data.files.length > 0) {
      rootId = rootSearch.data.files[0].id!;
    } else {
      const rootCreate = await drive.files.create({
        requestBody: { name: ROOT_NAME, mimeType: 'application/vnd.google-apps.folder' },
        fields: 'id',
      });
      rootId = rootCreate.data.id!;
    }

    // 1. Resolve Dashboard Folder
    let parentId = rootId;
    const dashSearch = await drive.files.list({
      q: `name = '${DASHBOARD_FOLDER}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });
    if (dashSearch.data.files && dashSearch.data.files.length > 0) {
      parentId = dashSearch.data.files[0].id!;
    } else {
      const dashCreate = await drive.files.create({
        requestBody: { name: DASHBOARD_FOLDER, mimeType: 'application/vnd.google-apps.folder', parents: [rootId] },
        fields: 'id',
      });
      parentId = dashCreate.data.id!;
    }

    // 2. Search for existing file
    const fileSearch = await drive.files.list({
      q: `name = '${FILE_NAME}' and '${parentId}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    if (fileSearch.data.files && fileSearch.data.files.length > 0) {
      // Update
      await drive.files.update({
        fileId: fileSearch.data.files[0].id!,
        media: {
          mimeType: 'text/html',
          body: content || '',
        },
      });
    } else {
      // Create
      await drive.files.create({
        requestBody: {
          name: FILE_NAME,
          mimeType: 'text/html',
          parents: [parentId],
        },
        media: {
          mimeType: 'text/html',
          body: content || '',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Sync Mission Notes Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
