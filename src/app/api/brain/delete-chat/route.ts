import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { id, fileId } = await request.json();
    const tokenHeader = request.headers.get('x-murabbi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id && !fileId) {
      return NextResponse.json({ error: 'Missing chat ID or file ID' }, { status: 400 });
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
    
    let targetFileId = fileId;

    if (!targetFileId && id) {
      const CHATS_FOLDER_NAME = 'MurabbiAI';
      const { getOrCreateMurabbiDeskRoot } = await import('@/lib/drive-root');
      const rootFolder = await getOrCreateMurabbiDeskRoot(drive);
      const rootId = rootFolder.id;

      if (rootId) {
        const folderSearch = await drive.files.list({
          q: `name = '${CHATS_FOLDER_NAME}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id)',
        });

        if (folderSearch.data.files && folderSearch.data.files.length > 0) {
          const folderId = folderSearch.data.files[0].id;
          const fileName = `${id}.json`;

          const fileSearch = await drive.files.list({
            q: `name = '${fileName}' and '${folderId}' in parents and trashed = false`,
            fields: 'files(id)',
          });

          if (fileSearch.data.files && fileSearch.data.files.length > 0) {
            targetFileId = fileSearch.data.files[0].id;
          }
        }
      }
    }

    if (targetFileId) {
      await drive.files.delete({ fileId: targetFileId });
    }

    return NextResponse.json({ success: true, id, fileId: targetFileId });
  } catch (error: any) {
    console.error('Delete Chat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
