import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { conversation } = await request.json();
    const tokenHeader = request.headers.get('x-murabbi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!conversation || !conversation.id || conversation.isTemporary) {
      return NextResponse.json({ error: 'Invalid or temporary conversation' }, { status: 400 });
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
    
    const CHATS_FOLDER_NAME = 'MurabbiAI';
    
    const { getOrCreateMurabbiDeskRoot } = await import('@/lib/drive-root');
    const rootFolder = await getOrCreateMurabbiDeskRoot(drive);
    const rootId = rootFolder.id;

    let targetFolderId = '';

    // Find or create MurabbiAI folder inside Root
    const folderSearch = await drive.files.list({
      q: `name = '${CHATS_FOLDER_NAME}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });

    if (folderSearch.data.files && folderSearch.data.files.length > 0) {
      targetFolderId = folderSearch.data.files[0].id!;
    } else {
      const createdFolder = await drive.files.create({
        requestBody: {
          name: CHATS_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootId],
        },
        fields: 'id',
      });
      targetFolderId = createdFolder.data.id!;
    }

    const fileName = `${conversation.id}.json`;
    const jsonContent = JSON.stringify(conversation, null, 2);

    // Search if file already exists
    const fileSearch = await drive.files.list({
      q: `name = '${fileName}' and '${targetFolderId}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    const media = {
      mimeType: 'application/json',
      body: Readable.from([jsonContent]),
    };

    let fileId = '';

    if (fileSearch.data.files && fileSearch.data.files.length > 0) {
      fileId = fileSearch.data.files[0].id!;
      await drive.files.update({
        fileId,
        media,
      });
    } else {
      const createdFile = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: 'application/json',
          parents: [targetFolderId],
        },
        media,
        fields: 'id',
      });
      fileId = createdFile.data.id!;
    }

    return NextResponse.json({ success: true, fileId, id: conversation.id });
  } catch (error: any) {
    console.error('Save Chat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
