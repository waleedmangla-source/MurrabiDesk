import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, content, mimeType, folderName, folderId: explicitFolderId } = await request.json();
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
    
    // 0. Ensure Root Folder is resolved
    const ROOT_NAME = 'Murrabi Desk Drive';
    let rootFolderId = '';
    const rootSearch = await drive.files.list({
      q: `name = '${ROOT_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
    });
    if (rootSearch.data.files && rootSearch.data.files.length > 0) {
      rootFolderId = rootSearch.data.files[0].id!;
    } else {
      const rootCreate = await drive.files.create({
        requestBody: { name: ROOT_NAME, mimeType: 'application/vnd.google-apps.folder' },
        fields: 'id',
      });
      rootFolderId = rootCreate.data.id!;
    }

    let targetFolderId = explicitFolderId;

    // 1. Resolve Sub-Folder if folderName provided
    if (folderName && !targetFolderId) {
      const folderRes = await drive.files.list({
        q: `name = '${folderName}' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (folderRes.data.files && folderRes.data.files.length > 0) {
        targetFolderId = folderRes.data.files[0].id;
      } else {
        // Create sub-folder inside Root
        const createFolderRes = await drive.files.create({
          requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [rootFolderId],
          },
          fields: 'id',
        });
        targetFolderId = createFolderRes.data.id;
      }
    }

    // Default to root if no subfolder specified
    if (!targetFolderId) {
      targetFolderId = rootFolderId;
    }

    // 2. Upload File
    // If content is base64 (common for PDFs/Images), we need to convert it
    let body: any = content;
    if (typeof content === 'string' && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
      const base64Data = content.split(',')[1] || content;
      body = Buffer.from(base64Data, 'base64');
    }

    const fileMetadata: any = {
      name: name,
    };
    if (targetFolderId) {
      fileMetadata.parents = [targetFolderId];
    }

    const media = {
      mimeType: mimeType,
      body: body,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    return NextResponse.json({
      success: true,
      fileId: file.data.id,
      link: file.data.webViewLink,
      folderId: targetFolderId
    });
  } catch (error: any) {
    console.error('Drive Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
