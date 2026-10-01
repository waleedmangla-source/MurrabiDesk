import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const tokenHeader = request.headers.get('x-murabbi-token');
    
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
    
    const CHATS_FOLDER_NAME = 'MurabbiAI';
    
    const { getOrCreateMurabbiDeskRoot } = await import('@/lib/drive-root');
    const rootFolder = await getOrCreateMurabbiDeskRoot(drive);
    const rootId = rootFolder.id;

    if (!rootId) {
      return NextResponse.json([]);
    }

    // Find the MurabbiAI folder inside Root
    const folderSearch = await drive.files.list({
      q: `name = '${CHATS_FOLDER_NAME}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });

    if (!folderSearch.data.files || folderSearch.data.files.length === 0) {
      return NextResponse.json([]);
    }
    const folderId = folderSearch.data.files[0].id;

    // List all JSON files in MurabbiAI folder
    const filesRes = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/json' and trashed = false`,
      fields: 'files(id, name, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    });

    const files = filesRes.data.files || [];

    // Download content for all chat JSON files in parallel for maximum speed
    const conversations = (await Promise.all(
      files.map(async (file) => {
        if (!file.id) return null;
        try {
          const fileContentRes = await drive.files.get({
            fileId: file.id,
            alt: 'media',
          }, { responseType: 'json' });

          if (fileContentRes.data) {
            return {
              ...fileContentRes.data,
              fileId: file.id,
            };
          }
        } catch (readErr) {
          console.warn(`Could not read chat file ${file.name}:`, readErr);
        }
        return null;
      })
    )).filter(Boolean);

    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error('List Chats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
