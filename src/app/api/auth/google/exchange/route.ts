import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { code, redirectUri } = await request.json();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // We prefer the refresh_token for persistent login
    const tokenToStore = tokens.refresh_token || tokens.access_token;

    if (!tokenToStore) {
      throw new Error('No valid token returned from Google.');
    }

    return NextResponse.json({ token: tokenToStore });
  } catch (error: any) {
    console.error('Exchange error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
