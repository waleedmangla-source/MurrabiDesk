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
    
    // Default spreadsheet ID if not provided
    const DEFAULT_SPREADSHEET_ID = '1Z_k5W9_7_7YvY9m_9X7vY9X7vY9X7vY9X7vY9X7vY'; // Placeholder
    // Actually, we should probably use the one from env or pass it from frontend
    const sid = spreadsheetId || process.env.GOOGLE_SHEET_ID;

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
