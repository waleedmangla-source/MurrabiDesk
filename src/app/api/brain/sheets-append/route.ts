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
    
    let targetId = spreadsheetId;

    // If no spreadsheetId provided, we search for one named 'Murrabi Expenses Master' inside the module folder
    if (!targetId) {
       const drive = google.drive({ version: 'v3', auth: oauth2Client });
       
       // 0. Resolve Root Folder
       const ROOT_NAME = 'Murrabi Desk Drive';
       const MODULE_NAME = 'Expenses';
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

       // 1. Resolve Expenses Folder
       let expensesFolderId = '';
       const moduleSearch = await drive.files.list({
         q: `name = '${MODULE_NAME}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
         fields: 'files(id)',
       });
       if (moduleSearch.data.files && moduleSearch.data.files.length > 0) {
         expensesFolderId = moduleSearch.data.files[0].id!;
       } else {
         const moduleCreate = await drive.files.create({
           requestBody: { 
             name: MODULE_NAME, 
             mimeType: 'application/vnd.google-apps.folder',
             parents: [rootId]
           },
           fields: 'id',
         });
         expensesFolderId = moduleCreate.data.id!;
       }

       const searchRes = await drive.files.list({
         q: `name = 'Murrabi Expenses Master' and '${expensesFolderId}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
         fields: 'files(id)',
       });

       if (searchRes.data.files && searchRes.data.files.length > 0) {
         targetId = searchRes.data.files[0].id;
       } else {
         // Create it
         const createRes = await sheets.spreadsheets.create({
           requestBody: {
             properties: { title: 'Murrabi Expenses Master' },
           }
         });
         targetId = createRes.data.spreadsheetId;

         // Move to Expenses Folder
         await drive.files.update({
           fileId: targetId!,
           addParents: expensesFolderId,
           removeParents: 'root',
           fields: 'id, parents',
         });

         // Initialize header row
         await sheets.spreadsheets.values.update({
           spreadsheetId: targetId!,
           range: 'Sheet1!A1',
           valueInputOption: 'RAW',
           requestBody: {
             values: [['Date', 'Member Name', 'Member Code', 'Month', 'Cheque #', 'Total Amount', 'HST Total', 'Purpose', 'Posting Type', 'Posting Location', 'Status', 'Comments', 'Drive Folder', 'Email Sent']]
           }
         });
       }
    }

    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: targetId!,
      range: range || 'Sheet1!A2',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values,
      },
    });

    return NextResponse.json({
      success: true,
      spreadsheetId: targetId,
      updates: res.data.updates
    });
  } catch (error: any) {
    console.error('Sheets Append Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
