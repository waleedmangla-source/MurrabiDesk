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
    const ROOT_FOLDER_NAME = 'Murrabi Desk Drive';

    // 1. Search for root folder
    const searchRes = await drive.files.list({
      q: `name = '${ROOT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
    });

    let rootId = '';
    if (searchRes.data.files && searchRes.data.files.length > 0) {
      rootId = searchRes.data.files[0].id!;
    } else {
      // 2. Create it
      const createRes = await drive.files.create({
        requestBody: {
          name: ROOT_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      rootId = createRes.data.id!;
    }

    return NextResponse.json({ rootId });
  } catch (error: any) {
    console.error('Init Drive Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
