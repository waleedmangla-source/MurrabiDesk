import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { spreadsheetId, range, values } = await request.json();
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

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    let sid = spreadsheetId;

    if (!sid && !process.env.GOOGLE_SHEET_ID) {
       const rootSearch = await drive.files.list({
         q: `name = 'Murrabi Desk Drive' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
         fields: 'files(id)',
       });

       if (rootSearch.data.files && rootSearch.data.files.length > 0) {
         const rootId = rootSearch.data.files[0].id;
         const moduleSearch = await drive.files.list({
           q: `name = 'Expenses' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
           fields: 'files(id)',
         });

         if (moduleSearch.data.files && moduleSearch.data.files.length > 0) {
           const expensesFolderId = moduleSearch.data.files[0].id;
           const searchRes = await drive.files.list({
             q: `name = 'Murrabi Expenses Master' and '${expensesFolderId}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
             fields: 'files(id)',
           });

           if (searchRes.data.files && searchRes.data.files.length > 0) {
             sid = searchRes.data.files[0].id;
           }
         }
       }
    } else if (!sid) {
       sid = process.env.GOOGLE_SHEET_ID;
    }

    if (!sid) {
      throw new Error('Could not resolve Spreadsheet ID');
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: sid,
      range: range,
      valueInputOption: 'RAW',
      requestBody: {
        values: values,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Sheets Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
