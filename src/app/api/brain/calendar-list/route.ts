import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const tokenHeader = request.headers.get('x-murrabi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const { timeMin, timeMax } = await request.json().catch(() => ({}));

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: tokenHeader });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || (new Date()).toISOString(),
      timeMax: timeMax,
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json(res.data.items || []);
  } catch (error: any) {
    console.error('Calendar List Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
