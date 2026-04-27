import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { module, category } = await request.json();
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
    
    const ROOT_NAME = 'Murrabi Desk Drive';
    
    const getFolderId = async (name: string, parentId?: string) => {
      let q = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      if (parentId) q += ` and '${parentId}' in parents`;
      const res = await drive.files.list({ q, fields: 'files(id)' });
      return res.data.files?.[0]?.id;
    };

    const rootId = await getFolderId(ROOT_NAME);
    if (!rootId) return NextResponse.json([]);

    let targetId = rootId;
    if (module) {
      const moduleId = await getFolderId(module, targetId);
      if (moduleId) {
        targetId = moduleId;
        if (category) {
          const catId = await getFolderId(category, targetId);
          if (catId) targetId = catId;
        }
      }
    }

    const filesRes = await drive.files.list({
      q: `'${targetId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name, mimeType, modifiedTime)',
      orderBy: 'modifiedTime desc',
    });

    return NextResponse.json(filesRes.data.files || []);
  } catch (error: any) {
    console.error('List Drive Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
