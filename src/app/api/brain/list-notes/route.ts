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
    
    // 1. Find the root folder
    const ROOT_NAME = 'Murrabi Desk Drive';
    const NOTES_FOLDER_NAME = 'Notes';
    
    const rootSearch = await drive.files.list({
      q: `name = '${ROOT_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });

    if (!rootSearch.data.files || rootSearch.data.files.length === 0) {
      return NextResponse.json([]); // No root, no notes
    }
    const rootId = rootSearch.data.files[0].id;

    // 2. Find the Notes folder inside Root
    const notesSearch = await drive.files.list({
      q: `name = '${NOTES_FOLDER_NAME}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });

    if (!notesSearch.data.files || notesSearch.data.files.length === 0) {
      return NextResponse.json([]);
    }
    const notesFolderId = notesSearch.data.files[0].id;

    // 3. List files in Notes folder
    const filesRes = await drive.files.list({
      q: `'${notesFolderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, modifiedTime)',
      orderBy: 'modifiedTime desc',
    });

    return NextResponse.json(filesRes.data.files || []);
  } catch (error: any) {
    console.error('List Notes Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
