import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const tokenHeader = request.headers.get('x-murrabi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: tokenHeader });

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const res = await oauth2.userinfo.get();
    
    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error('Get User Info Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
