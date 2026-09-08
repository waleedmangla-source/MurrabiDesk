import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory cache for fast repeated lookups
const lookupCache = new Map<string, { meaning: string; translit?: string }>();

function cleanUrduWord(word: string): string {
  return word
    .trim()
    .replace(/[۔،؛؟!:\(\)\[\]"'\-_«»]/g, '')
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove Arabic tashkeel / diacritics
    .trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawWord = searchParams.get('word');

    if (!rawWord) {
      return NextResponse.json({ error: 'Word query parameter required' }, { status: 400 });
    }

    const word = cleanUrduWord(rawWord);
    if (!word) {
      return NextResponse.json({ error: 'Invalid word format' }, { status: 400 });
    }

    const rekhtaUrl = `https://www.rekhtadictionary.com/search?keyword=${encodeURIComponent(word)}`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(word + ' urdu meaning in english')}`;

    // Check memory cache first
    if (lookupCache.has(word)) {
      const cached = lookupCache.get(word)!;
      return NextResponse.json({
        word,
        englishMeaning: cached.meaning,
        transliteration: cached.translit,
        rekhtaUrl,
        googleUrl,
        source: 'cache'
      });
    }

    // Query Rekhta Dictionary live
    try {
      const response = await fetch(rekhtaUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8'
        },
        next: { revalidate: 86400 } // Cache for 24h
      });

      if (response.ok) {
        const html = await response.text();

        // Extract transliteration / English pronunciation: e.g. <div class='rdWordCard' id='...'><h3>mabsuut</h3>
        let translitMatch = html.match(/<div class=['"]rdWordCard['"][^>]*>\s*<h3>([^<]+)<\/h3>/i);
        const translit = translitMatch ? translitMatch[1].trim() : undefined;

        // Extract English meaning: <p class='rdWrdCrdMeaning '> spread out, spacious...</p>
        let meaningMatch = html.match(/<p class=['"]rdWrdCrdMeaning\s*['"]>([^<]+)<\/p>/i);
        if (meaningMatch && meaningMatch[1].trim()) {
          const meaning = meaningMatch[1].trim().replace(/\s+/g, ' ');

          lookupCache.set(word, { meaning, translit });

          return NextResponse.json({
            word,
            englishMeaning: meaning,
            transliteration: translit,
            rekhtaUrl,
            googleUrl,
            source: 'rekhta'
          });
        }
      }
    } catch (networkErr) {
      console.warn('[Dictionary Lookup] Rekhta fetch error:', networkErr);
    }

    // If Rekhta did not return a definition, return structured URLs and clear indication
    return NextResponse.json({
      word,
      englishMeaning: 'Detailed entry available on Rekhta or Google Search.',
      transliteration: undefined,
      rekhtaUrl,
      googleUrl,
      source: 'web_links_only'
    });

  } catch (err: any) {
    console.error('[Dictionary Lookup] Fatal error:', err);
    return NextResponse.json({ error: err.message || 'Lookup failed' }, { status: 500 });
  }
}
