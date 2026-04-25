import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirect_uri = `${url.origin}/api/auth/google/callback`;

  // We fall back to localhost defaults if env vars are missing so the build doesn't crash,
  // but they must be set in Vercel for production.
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || 'MISSING_CLIENT_ID',
    process.env.GOOGLE_CLIENT_SECRET || 'MISSING_CLIENT_SECRET',
    redirect_uri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });

  return NextResponse.redirect(authUrl);
}
