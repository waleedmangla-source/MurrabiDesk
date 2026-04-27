import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { title, templateText, module = 'Writer' } = await request.json();
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
    
    // 0. Resolve Root Folder
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

    // 1. Resolve Module Folder (e.g., 'Writer')
    let parentId = rootId;
    if (module) {
      const moduleSearch = await drive.files.list({
        q: `name = '${module}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)',
      });

      if (moduleSearch.data.files && moduleSearch.data.files.length > 0) {
        parentId = moduleSearch.data.files[0].id!;
      } else {
        const moduleCreate = await drive.files.create({
          requestBody: {
            name: module,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [rootId]
          },
          fields: 'id',
        });
        parentId = moduleCreate.data.id!;
      }
    }

    // 2. Create Google Doc inside the module folder
    // Drive will convert 'text/html' to a Google Doc format automatically when mimeType is 'vnd.google-apps.document'
    const docCreate = await drive.files.create({
      requestBody: {
        name: title || 'Untitled Document',
        mimeType: 'application/vnd.google-apps.document',
        parents: [parentId],
      },
      media: {
        mimeType: 'text/html',
        body: templateText || '',
      },
      fields: 'id',
    });

    return NextResponse.json({
      success: true,
      documentId: docCreate.data.id,
      folderId: parentId
    });
  } catch (error: any) {
    console.error('Create Doc Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
