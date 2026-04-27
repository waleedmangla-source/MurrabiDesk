import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { spreadsheetId, range } = await request.json();
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

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    let targetId = spreadsheetId;

    // If no spreadsheetId provided, find 'Murrabi Expenses Master' in 'Murrabi Desk Drive/Expenses'
    if (!targetId) {
       const ROOT_NAME = 'Murrabi Desk Drive';
       const MODULE_NAME = 'Expenses';
       
       const rootSearch = await drive.files.list({
         q: `name = '${ROOT_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
         fields: 'files(id)',
       });

       if (rootSearch.data.files && rootSearch.data.files.length > 0) {
         const rootId = rootSearch.data.files[0].id;
         const moduleSearch = await drive.files.list({
           q: `name = '${MODULE_NAME}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
           fields: 'files(id)',
         });

         if (moduleSearch.data.files && moduleSearch.data.files.length > 0) {
           const expensesFolderId = moduleSearch.data.files[0].id;
           const searchRes = await drive.files.list({
             q: `name = 'Murrabi Expenses Master' and '${expensesFolderId}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
             fields: 'files(id)',
           });

           if (searchRes.data.files && searchRes.data.files.length > 0) {
             targetId = searchRes.data.files[0].id;
           }
         }
       }
    }

    if (!targetId) {
      return NextResponse.json({ values: [] });
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: targetId,
      range: range || 'Sheet1!A2:Z1000',
    });

    return NextResponse.json({
      success: true,
      values: res.data.values || [],
      spreadsheetId: targetId
    });
  } catch (error: any) {
    console.error('Sheets Get Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
