import { NextRequest, NextResponse } from 'next/server';
import { executeResearchSearch } from '@/lib/research-search-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawQuery = String(body.query || '').trim();

    if (!rawQuery) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const payload = await executeResearchSearch({
      query: rawQuery,
      searchMode: body.searchMode === 'verbatim' ? 'verbatim' : 'contextual',
      yearFrom: typeof body.yearFrom === 'number' ? body.yearFrom : null,
      yearTo: typeof body.yearTo === 'number' ? body.yearTo : null,
      language: ['en', 'ar', 'ur'].includes(body.language) ? body.language : 'all',
      sources: Array.isArray(body.sources) ? body.sources : undefined,
      articlePage: body.articlePage,
      alhakamPage: body.alhakamPage,
      periodicalPage: body.periodicalPage
    });

    return NextResponse.json({
      success: true,
      data: payload
    });
  } catch (err: any) {
    console.error('[Research API] Error processing search:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal research search error'
    }, { status: 500 });
  }
}
