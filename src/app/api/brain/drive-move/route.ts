import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const ROOT_NAME = 'Murrabi Desk Drive';

export async function POST(request: Request) {
  try {
    const { folderName, module, sourceCategory, targetCategory } = await request.json();
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

    const getFolderId = async (name: string, parentId?: string) => {
      let q = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      if (parentId) q += ` and '${parentId}' in parents`;
      const res = await drive.files.list({ q, fields: 'files(id)' });
      return res.data.files?.[0]?.id;
    };

    const getOrCreateFolderId = async (name: string, parentId?: string) => {
      let id = await getFolderId(name, parentId);
      if (!id) {
        const res = await drive.files.create({
          requestBody: {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : [],
          },
          fields: 'id',
        });
        id = res.data.id;
      }
      return id;
    };

    // 1. Resolve Root
    const rootId = await getOrCreateFolderId(ROOT_NAME);
    if (!rootId) throw new Error('Root folder not found/created');

    // 2. Resolve Module
    const moduleId = await getOrCreateFolderId(module, rootId);
    if (!moduleId) throw new Error(`Module folder ${module} not found/created`);

    // 3. Resolve Source and Target Categories
    const sourceId = await getOrCreateFolderId(sourceCategory, moduleId);
    const targetId = await getOrCreateFolderId(targetCategory, moduleId);

    if (!sourceId || !targetId) {
      throw new Error(`Categories ${sourceCategory} or ${targetCategory} not found/created`);
    }

    // 4. Find the Folder to move
    const folderToMoveId = await getFolderId(folderName, sourceId);
    if (!folderToMoveId) {
      // Maybe it's already in the target or missing
      return NextResponse.json({ success: true, message: 'Folder not found in source, skipping move' });
    }

    // 5. Move the folder
    await drive.files.update({
      fileId: folderToMoveId,
      addParents: targetId,
      removeParents: sourceId,
      fields: 'id, parents',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Move Drive Folder Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
