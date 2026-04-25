import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const tokenHeader = request.headers.get('x-murrabi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    // Initialize OAuth2 Client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Assuming the token is stored as plain text or base64 (since safeStorage is gone)
    // We will attempt to use it directly as a refresh token
    oauth2Client.setCredentials({ refresh_token: tokenHeader });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      labelIds: ['INBOX'],
    });

    const messages = res.data.messages || [];
    const emails = [];

    for (const msg of messages) {
      if (!msg.id) continue;
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      });

      const headers = msgRes.data.payload?.headers || [];
      const getHeader = (name: string) => headers.find(h => h.name === name)?.value || '';

      emails.push({
        id: msg.id,
        threadId: msg.threadId,
        snippet: msgRes.data.snippet,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        date: getHeader('Date'),
        isUnread: msgRes.data.labelIds?.includes('UNREAD') || false,
      });
    }

    return NextResponse.json(emails);
  } catch (error: any) {
    console.error('Gmail List Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
