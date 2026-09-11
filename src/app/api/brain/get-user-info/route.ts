import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const tokenHeader = request.headers.get('x-murabbi-token');
    
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
    const data: any = { ...res.data };

    try {
      const people = google.people({
        auth: oauth2Client,
        version: 'v1'
      });
      const peopleRes = await people.people.get({
        resourceName: 'people/me',
        personFields: 'birthdays'
      });
      const birthdays = peopleRes.data.birthdays;
      if (birthdays && birthdays.length > 0) {
        const primary = birthdays.find(b => b.metadata?.primary) || birthdays[0];
        if (primary?.date) {
          const { year, month, day } = primary.date;
          if (month && day) {
            const yyyy = year ? String(year).padStart(4, '0') : '1990';
            const mm = String(month).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            data.birthday = `${yyyy}-${mm}-${dd}`;
          }
        }
      }
    } catch (peopleErr) {
      // Birthday scope might not be granted yet on older tokens or not set; keep data.birthday optional
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get User Info Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
