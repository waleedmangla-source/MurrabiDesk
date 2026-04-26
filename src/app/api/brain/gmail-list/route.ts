import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { pageToken, query } = await request.json();
    const tokenHeader = request.headers.get('x-murrabi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const url = new URL(request.url);
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri
    );

    // We set it as both since some older logins might have stored an access_token instead.
    // googleapis will try to use it correctly.
    oauth2Client.setCredentials({ 
      refresh_token: tokenHeader,
      access_token: tokenHeader.startsWith('ya29.') ? tokenHeader : undefined
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Fetch message list
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      pageToken: pageToken || undefined,
      q: query || 'label:INBOX',
    });

    const messages = listRes.data.messages || [];
    const fullEmails = [];

    // Fetch full details for each message because the frontend expects the payload
    for (const msg of messages) {
      if (!msg.id) continue;
      const detailRes = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
      });
      fullEmails.push(detailRes.data);
    }

    return NextResponse.json({
      emails: fullEmails,
      nextPageToken: listRes.data.nextPageToken || null,
    });
  } catch (error: any) {
    console.error('Gmail List Error:', error);
    try {
      require('fs').writeFileSync('/Users/waleedmangla/.gemini/antigravity/scratch/murabbi-desk/gmail_error.log', String(error.message) + '\n' + String(error.stack));
    } catch (e) {}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
