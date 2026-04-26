import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, content, fileId } = await request.json();
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
    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    
    // 1. Ensure Root Folder exists
    const ROOT_NAME = 'Murrabi Desk Drive';
    const NOTES_FOLDER_NAME = 'Notes';
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

    // 2. Ensure Notes Folder exists inside Root
    let notesFolderId = '';
    const notesSearch = await drive.files.list({
      q: `name = '${NOTES_FOLDER_NAME}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });

    if (notesSearch.data.files && notesSearch.data.files.length > 0) {
      notesFolderId = notesSearch.data.files[0].id!;
    } else {
      const notesCreate = await drive.files.create({
        requestBody: { 
          name: NOTES_FOLDER_NAME, 
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootId]
        },
        fields: 'id',
      });
      notesFolderId = notesCreate.data.id!;
    }

    if (fileId) {
      // Update existing Doc
      // Google Docs API update is complex, often easier to update via Drive for simple content if it's text/html
      // But for real Docs, we use documents.batchUpdate.
      // For simplicity, we'll replace the content if it's a simple text doc, or use drive.files.update
      await drive.files.update({
        fileId: fileId,
        media: {
          mimeType: 'text/plain', // Drive will convert this to Doc content if it was a Doc
          body: content,
        },
      });
      return NextResponse.json({ success: true, fileId });
    } else {
      // Create new Doc
      const res = await drive.files.create({
        requestBody: {
          name: name || 'Untitled Note',
          mimeType: 'application/vnd.google-apps.document',
          parents: [notesFolderId],
        },
        media: {
          mimeType: 'text/plain',
          body: content,
        },
      });
      return NextResponse.json({ success: true, fileId: res.data.id });
    }
  } catch (error: any) {
    console.error('Save Note Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
