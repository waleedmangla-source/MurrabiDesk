import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { to, subject, body, attachments } = await request.json();
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

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Create Nodemailer transport (not for sending, but for generating the raw MIME)
    const transporter = nodemailer.createTransport({
       streamTransport: true,
       newline: 'unix',
       buffer: true,
    });

    const mailOptions = {
       from: 'me',
       to: to,
       subject: subject,
       html: body, // Use html instead of text for rich formatting
       attachments: (attachments || []).map((a: any) => {
          // Handle different property names (data vs content) and potential data URLs
          const rawContent = a.content || a.data || '';
          const base64Data = rawContent.includes(',') ? rawContent.split(',')[1] : rawContent;
          
          return {
             filename: a.filename,
             content: base64Data,
             encoding: 'base64',
             contentType: a.mimeType || a.contentType
          };
       })
    };

    const info: any = await transporter.sendMail(mailOptions);
    const raw = info.message.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const res = await gmail.users.messages.send({
       userId: 'me',
       requestBody: {
          raw: raw
       }
    });

    return NextResponse.json({
      success: true,
      messageId: res.data.id,
      threadId: res.data.threadId
    });
  } catch (error: any) {
    console.error('Gmail Send Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
