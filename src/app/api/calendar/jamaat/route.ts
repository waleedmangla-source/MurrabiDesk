import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export async function GET() {
  try {
    const res = await fetch(
      'https://ahmadiyya.ca/wp-json/tribe/events/v1/events?per_page=50&status=publish',
      {
        headers: {
          'User-Agent': 'MurrabiDesk/1.0',
          Accept: 'application/json',
        },
        next: { revalidate: 3600 }, // Cache on server for 1 hour
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from ahmadiyya.ca: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawEvents = data.events || [];

    const mappedEvents = rawEvents.map((ev: any) => {
      // Build start and end ISO timestamps
      let startISO: string;
      let endISO: string;

      if (ev.utc_start_date) {
        startISO = new Date(ev.utc_start_date.replace(' ', 'T') + 'Z').toISOString();
      } else if (ev.start_date) {
        startISO = new Date(ev.start_date.replace(' ', 'T')).toISOString();
      } else {
        startISO = new Date().toISOString();
      }

      if (ev.utc_end_date) {
        endISO = new Date(ev.utc_end_date.replace(' ', 'T') + 'Z').toISOString();
      } else if (ev.end_date) {
        endISO = new Date(ev.end_date.replace(' ', 'T')).toISOString();
      } else {
        endISO = startISO;
      }

      const categoryName = ev.categories?.[0]?.name ? decodeHtmlEntities(ev.categories[0].name) : undefined;
      const venueName = ev.venue?.venue ? decodeHtmlEntities(ev.venue.venue) : undefined;
      const venueCity = ev.venue?.city ? decodeHtmlEntities(ev.venue.city) : undefined;
      const location = [venueName, venueCity].filter(Boolean).join(', ') || 'Canada (National)';

      const cleanDesc = (ev.description || ev.excerpt || '')
        .replace(/<[^>]*>?/gm, '')
        .trim();

      return {
        id: `jamaat-${ev.id}`,
        title: decodeHtmlEntities(ev.title || "Jama'at Event"),
        start: startISO,
        end: endISO,
        location,
        description: cleanDesc,
        allDay: Boolean(ev.all_day),
        color: 'mint',
        calendar: "Jama'at",
        url: ev.url || 'https://ahmadiyya.ca/events/month/',
        category: categoryName,
      };
    });

    return NextResponse.json(mappedEvents);
  } catch (error: any) {
    console.error('Jamaat Calendar Fetch Error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
