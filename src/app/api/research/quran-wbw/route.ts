import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface QuranWordToken {
  ar: string;
  translation?: string;
  isVerseMarker?: boolean;
}

export interface QuranVerseWbwData {
  surah: number;
  verse: number;
  ar: string;
  tokens: QuranWordToken[];
}

// In-memory cache for word-by-word data
const wbwCache = new Map<string, QuranVerseWbwData>();

/**
 * Parses raw ReadQuran API verse response into structured word tokens
 */
function parseVerseTokens(surah: number, verse: number, verseData: any): QuranVerseWbwData {
  const arText = String(verseData.ar || '').trim();
  const arTokens = arText ? arText.split(' ') : [];
  const words = Array.isArray(verseData.words) ? verseData.words : [];

  const tokens: QuranWordToken[] = arTokens.map((ar, idx) => {
    const rawT = words[idx]?.t;
    const cleanT = rawT && typeof rawT === 'string' ? rawT.trim() : undefined;
    // Check if token is an ayah marker like ﴿۱﴾
    const isVerseMarker = /[﴿﴾]/.test(ar);

    return {
      ar,
      translation: cleanT && cleanT.length > 0 ? cleanT : undefined,
      isVerseMarker
    };
  });

  return {
    surah,
    verse,
    ar: arText,
    tokens
  };
}

/**
 * Fetches word-for-word data for a single verse from api.readquran.app
 */
async function fetchSingleVerseWbw(surah: number, verse: number): Promise<QuranVerseWbwData | null> {
  const cacheKey = `${surah}:${verse}`;
  if (wbwCache.has(cacheKey)) {
    return wbwCache.get(cacheKey)!;
  }

  try {
    const url = `https://api.readquran.app/chapter/${surah}:${verse}-${verse}`;
    const payload = { hover: 0, f: 1, en: true };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MurabbiDesk/2.0; +https://alislam.org)'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Quran WBW] Al Islam API returned HTTP ${res.status} for ${surah}:${verse}`);
      return null;
    }

    const data = await res.json();
    const verseData = Array.isArray(data) ? data[0] : (data[String(verse)] || Object.values(data)[0]);

    if (!verseData) return null;

    const result = parseVerseTokens(surah, verse, verseData);
    wbwCache.set(cacheKey, result);
    return result;
  } catch (err: any) {
    console.error(`[Quran WBW] Error fetching ${surah}:${verse}:`, err.message);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const surahStr = searchParams.get('surah');
  const verseStr = searchParams.get('verse');

  const surah = parseInt(surahStr || '', 10);
  const verse = parseInt(verseStr || '', 10);

  if (isNaN(surah) || isNaN(verse) || surah < 1 || surah > 114 || verse < 1) {
    return NextResponse.json({ success: false, error: 'Invalid surah or verse parameter' }, { status: 400 });
  }

  const data = await fetchSingleVerseWbw(surah, verse);
  if (!data) {
    return NextResponse.json({ success: false, error: `Verse ${surah}:${verse} not found or unavailable` }, { status: 404 });
  }

  return NextResponse.json(
    { success: true, data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400'
      }
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Case 1: Batch request for multiple verses
    if (Array.isArray(body.verses)) {
      const uniqueVerses: Array<{ surah: number; verse: number }> = [];
      const seen = new Set<string>();

      for (const item of body.verses) {
        const s = parseInt(item.surah, 10);
        const v = parseInt(item.verse, 10);
        if (!isNaN(s) && !isNaN(v) && s >= 1 && s <= 114 && v >= 1) {
          const k = `${s}:${v}`;
          if (!seen.has(k)) {
            seen.add(k);
            uniqueVerses.push({ surah: s, verse: v });
          }
        }
      }

      // Limit batch size to 10 verses per call for safety and fast response
      const clamped = uniqueVerses.slice(0, 10);
      const results: Record<string, QuranVerseWbwData> = {};

      await Promise.all(
        clamped.map(async ({ surah, verse }) => {
          const res = await fetchSingleVerseWbw(surah, verse);
          if (res) {
            results[`${surah}:${verse}`] = res;
          }
        })
      );

      return NextResponse.json(
        { success: true, verses: results },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400'
          }
        }
      );
    }

    // Case 2: Single verse request
    const surah = parseInt(body.surah, 10);
    const verse = parseInt(body.verse, 10);

    if (isNaN(surah) || isNaN(verse) || surah < 1 || surah > 114 || verse < 1) {
      return NextResponse.json({ success: false, error: 'Invalid surah or verse parameters' }, { status: 400 });
    }

    const data = await fetchSingleVerseWbw(surah, verse);
    if (!data) {
      return NextResponse.json({ success: false, error: `Verse ${surah}:${verse} not found or unavailable` }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Malformed request body' }, { status: 400 });
  }
}
