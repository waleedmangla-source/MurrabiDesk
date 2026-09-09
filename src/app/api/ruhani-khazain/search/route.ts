import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { 
  normalizeKhazainText, 
  normalizeWithIndexMap, 
  getBookForPage, 
  THEOLOGICAL_TOPIC_MAP 
} from '@/lib/khazain-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CachedPage {
  page_num: number;
  text: string;
  norm: string;
  indexMap: number[];
}

interface CachedVolume {
  volume: number;
  pages: CachedPage[];
}

// In-memory module cache for high-speed corpus queries
const volumeCache: Map<number, CachedVolume> = new Map();
let staticDictionary: Record<string, { translit?: string; meaning: string }> | null = null;

function loadStaticDictionary() {
  if (staticDictionary) return staticDictionary;
  try {
    const dictPath = path.resolve(process.cwd(), 'public/ruhani-khazain/dictionary-en.json');
    if (fs.existsSync(dictPath)) {
      staticDictionary = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
    }
  } catch (err) {
    console.warn('[Search API] Failed to load static dictionary:', err);
  }
  return staticDictionary || {};
}

function getCachedVolume(volNum: number): CachedVolume | null {
  if (volumeCache.has(volNum)) {
    return volumeCache.get(volNum)!;
  }

  try {
    const filePath = path.resolve(process.cwd(), `public/ruhani-khazain/volume_${volNum}.json`);
    if (!fs.existsSync(filePath)) return null;

    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const pages: CachedPage[] = [];

    if (Array.isArray(rawData.pages)) {
      for (const p of rawData.pages) {
        if (!p.text) continue;
        const { norm, indexMap } = normalizeWithIndexMap(p.text);
        pages.push({
          page_num: p.page_num,
          text: p.text,
          norm,
          indexMap
        });
      }
    }

    const cached: CachedVolume = { volume: volNum, pages };
    volumeCache.set(volNum, cached);
    return cached;
  } catch (err) {
    console.error(`[Search API] Failed to load volume ${volNum}:`, err);
    return null;
  }
}

// Fallback Google AI API Key loader
function getApiKey(): string | null {
  let apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    try {
      const envPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const match = envFile.match(/^GOOGLE_AI_API_KEY=(.*)$/m);
        if (match) apiKey = match[1].trim();
      }
    } catch {}
  }
  return apiKey || null;
}

// Expand English / topic queries to classical Urdu keywords via Gemini if needed
async function expandEnglishQueryWithGemini(query: string, apiKey: string): Promise<string[]> {
  const prompt = `The user is searching the 23-volume classical Urdu/Arabic Islamic theological corpus "Ruhani Khazain" by Hazrat Mirza Ghulam Ahmad of Qadian, the Promised Messiah (as).
Convert this English search query or topic into 2 to 4 classical Urdu/Arabic keywords/phrases that would appear in the actual text: "${query}".
Return ONLY a valid JSON array of strings (no explanation, no markdown backticks), for example: ["وفات مسیح", "عیسیٰ"]`;

  const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
            responseMimeType: "application/json"
          }
        })
      });

      clearTimeout(timeoutId);
      if (!res.ok) continue;

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => String(s).trim()).filter(Boolean);
        }
      }
    } catch (e) {
      // Continue to next model or fallback
    }
  }

  return [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || '').trim();
    const scope = (body.scope === 'library' || body.scope === 'all') ? 'library' : 'volume';
    const currentVolume = Math.min(23, Math.max(1, parseInt(body.volume, 10) || 1));
    const limit = Math.min(150, Math.max(10, parseInt(body.limit, 10) || 80));

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const hasLatin = /[a-zA-Z]/.test(query);
    const searchTerms: string[] = [];
    const queryClean = query.toLowerCase();

    if (hasLatin) {
      // 1. Check pre-compiled theological topic dictionary
      if (THEOLOGICAL_TOPIC_MAP[queryClean]) {
        searchTerms.push(...THEOLOGICAL_TOPIC_MAP[queryClean]);
      } else {
        // Multi-word / partial matching against topic dictionary
        const queryWords = queryClean.split(/\s+/).filter(w => w.length > 2);
        for (const word of queryWords) {
          if (THEOLOGICAL_TOPIC_MAP[word]) {
            searchTerms.push(...THEOLOGICAL_TOPIC_MAP[word]);
          }
        }
      }

      // 2. Search definitions in dictionary-en.json
      const dict = loadStaticDictionary();
      let dictMatches = 0;
      for (const [urduWord, info] of Object.entries(dict)) {
        if (info.meaning && info.meaning.toLowerCase().includes(queryClean)) {
          searchTerms.push(urduWord);
          dictMatches++;
          if (dictMatches >= 5) break;
        }
      }

      // 3. Dynamic expansion via Gemini if terms are still sparse
      if (searchTerms.length < 2) {
        const apiKey = getApiKey();
        if (apiKey) {
          try {
            const aiTerms = await expandEnglishQueryWithGemini(query, apiKey);
            searchTerms.push(...aiTerms);
          } catch {}
        }
      }
    } else {
      // Arabic or Urdu input
      const normQuery = normalizeKhazainText(query);
      if (normQuery) {
        searchTerms.push(normQuery);
      }
      // If it is a multi-word phrase, also consider significant individual terms (words with 3+ chars)
      const words = normQuery.split(/\s+/).filter(w => w.length >= 3 && !['اور', 'میں', 'سے', 'کے', 'کی', 'کو', 'پر', 'کہ'].includes(w));
      if (words.length > 1) {
        words.forEach(w => {
          if (!searchTerms.includes(w)) searchTerms.push(w);
        });
      }
    }

    // Deduplicate and normalize all search terms
    const normalizedTerms = Array.from(new Set(searchTerms.map(t => normalizeKhazainText(t)).filter(Boolean)));

    if (normalizedTerms.length === 0) {
      return NextResponse.json({
        success: true,
        query,
        scope,
        volume: currentVolume,
        searchTerms: [],
        totalMatches: 0,
        results: []
      });
    }

    // Determine target volumes based on scope
    const targetVolumes = scope === 'library' 
      ? Array.from({ length: 23 }, (_, i) => i + 1)
      : [currentVolume];

    const results: Array<{
      volume: number;
      pageNum: number;
      bookTitle: string;
      bookUrduTitle: string;
      snippetBefore: string;
      matchedSlice: string;
      snippetAfter: string;
      matchedTerm: string;
      isExactPhrase: boolean;
      score: number;
    }> = [];

    const primaryTerm = normalizedTerms[0];

    for (const volNum of targetVolumes) {
      const volData = getCachedVolume(volNum);
      if (!volData) continue;

      const constituentBooks = getBookForPage(volNum, 1);

      for (const page of volData.pages) {
        // Test primary term first, then fallbacks
        let matchedTerm = '';
        let matchPos = -1;
        let isExactPhrase = false;

        // Check exact match for primary term
        const primaryPos = page.norm.indexOf(primaryTerm);
        if (primaryPos !== -1) {
          matchedTerm = primaryTerm;
          matchPos = primaryPos;
          isExactPhrase = true;
        } else {
          // Check other terms
          for (let i = 1; i < normalizedTerms.length; i++) {
            const term = normalizedTerms[i];
            const pos = page.norm.indexOf(term);
            if (pos !== -1) {
              matchedTerm = term;
              matchPos = pos;
              isExactPhrase = false;
              break;
            }
          }
        }

        if (matchPos !== -1 && page.indexMap.length > 0) {
          const rawStart = page.indexMap[matchPos] ?? matchPos;
          const matchEndInNorm = Math.min(page.indexMap.length - 1, matchPos + matchedTerm.length - 1);
          const rawEnd = (page.indexMap[matchEndInNorm] ?? rawStart + matchedTerm.length) + 1;

          const matchedSlice = page.text.slice(rawStart, rawEnd) || matchedTerm;

          // Excerpt snippet context: ~60 characters before, ~70 characters after
          const snipStart = Math.max(0, rawStart - 65);
          const snipEnd = Math.min(page.text.length, rawEnd + 75);

          const rawBefore = page.text.slice(snipStart, rawStart).replace(/\s+/g, ' ');
          const rawAfter = page.text.slice(rawEnd, snipEnd).replace(/\s+/g, ' ');

          const snippetBefore = (snipStart > 0 ? '...' : '') + rawBefore;
          const snippetAfter = rawAfter + (snipEnd < page.text.length ? '...' : '');

          const bookInfo = getBookForPage(volNum, page.page_num);

          results.push({
            volume: volNum,
            pageNum: page.page_num,
            bookTitle: bookInfo.title,
            bookUrduTitle: bookInfo.urduTitle,
            snippetBefore,
            matchedSlice,
            snippetAfter,
            matchedTerm,
            isExactPhrase,
            score: (isExactPhrase ? 100 : 50) + (volNum === currentVolume ? 10 : 0)
          });
        }
      }
    }

    // Sort: highest score first, then volume ascending, then page ascending
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.volume !== b.volume) return a.volume - b.volume;
      return a.pageNum - b.pageNum;
    });

    const totalMatches = results.length;
    const paginatedResults = results.slice(0, limit);

    return NextResponse.json({
      success: true,
      query,
      scope,
      volume: currentVolume,
      searchTerms: normalizedTerms,
      totalMatches,
      results: paginatedResults
    });

  } catch (err: any) {
    console.error('[Ruhani Khazain Search API Error]:', err);
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || searchParams.get('query') || '';
  const scope = searchParams.get('scope') || 'volume';
  const volume = searchParams.get('volume') || '1';
  const limit = searchParams.get('limit') || '80';

  return POST(new NextRequest(req.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, scope, volume, limit })
  }));
}
