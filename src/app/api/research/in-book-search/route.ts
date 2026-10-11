import { NextRequest, NextResponse } from 'next/server';
import { searchWithinBook, isBookCrawled } from '@/lib/canonical-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = (searchParams.get('slug') || '').trim();
    const query = (searchParams.get('query') || '').trim();

    if (!slug || !query) {
      return NextResponse.json({ success: true, results: [] });
    }

    const matches = searchWithinBook(slug, query);
    return NextResponse.json({
      success: true,
      slug,
      query,
      count: matches.length,
      results: matches
    });
  } catch (err: any) {
    console.error('[In-Book Search API Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to search within book' },
      { status: 500 }
    );
  }
}
