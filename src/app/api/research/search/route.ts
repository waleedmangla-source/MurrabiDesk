import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  normalizeKhazainText,
  normalizeWithIndexMap,
  getBookForPage,
  THEOLOGICAL_TOPIC_MAP
} from '@/lib/khazain-data';
import {
  searchQuranVerses,
  searchAlIslamResources,
  searchPeriodicals,
  findTheologicalDossier,
  synthesizeSmartTheologicalResponse,
  MultiSourceSearchResult,
  RuhaniKhazainSearchResult,
  ResearchDossier
} from '@/lib/research-sources';

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

const volumeCache: Map<number, CachedVolume> = new Map();

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
    console.error(`[Research API] Failed to load volume ${volNum}:`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawQuery = String(body.query || '').trim();

    if (!rawQuery) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const requestedSources: string[] = Array.isArray(body.sources) && body.sources.length > 0 
      ? body.sources 
      : ['ruhani-khazain', 'quran', 'alislam', 'periodicals', 'dossier'];

    // 1. Resolve search terms for Ruhani Khazain
    const hasLatin = /[a-zA-Z]/.test(rawQuery);
    const searchTerms: string[] = [];
    const queryClean = rawQuery.toLowerCase();

    if (hasLatin) {
      if (THEOLOGICAL_TOPIC_MAP[queryClean]) {
        searchTerms.push(...THEOLOGICAL_TOPIC_MAP[queryClean]);
      } else {
        const queryWords = queryClean.split(/\s+/).filter(w => w.length > 2);
        for (const word of queryWords) {
          if (THEOLOGICAL_TOPIC_MAP[word]) {
            searchTerms.push(...THEOLOGICAL_TOPIC_MAP[word]);
          }
        }
      }
      // If no mapping found, use rawQuery
      if (searchTerms.length === 0) {
        searchTerms.push(rawQuery);
      }
    } else {
      const normQuery = normalizeKhazainText(rawQuery);
      if (normQuery) searchTerms.push(normQuery);
      const words = normQuery.split(/\s+/).filter(w => w.length >= 3);
      if (words.length > 1) {
        words.forEach(w => {
          if (!searchTerms.includes(w)) searchTerms.push(w);
        });
      }
    }

    const normalizedTerms = Array.from(new Set(searchTerms.map(t => normalizeKhazainText(t)).filter(Boolean)));

    // 2. Parallel Multi-Source Execution
    const ruhaniKhazainPromise: Promise<RuhaniKhazainSearchResult[]> = (async () => {
      if (!requestedSources.includes('ruhani-khazain')) return [];
      const matches: RuhaniKhazainSearchResult[] = [];
      const primaryTerm = normalizedTerms[0] || normalizeKhazainText(rawQuery);
      if (!primaryTerm) return [];

      // Search all 23 volumes of Ruhani Khazain
      for (let volNum = 1; volNum <= 23; volNum++) {
        const volData = getCachedVolume(volNum);
        if (!volData) continue;

        for (const page of volData.pages) {
          let pos = page.norm.indexOf(primaryTerm);
          let matchedTerm = primaryTerm;

          if (pos === -1 && normalizedTerms.length > 1) {
            for (let i = 1; i < normalizedTerms.length; i++) {
              pos = page.norm.indexOf(normalizedTerms[i]);
              if (pos !== -1) {
                matchedTerm = normalizedTerms[i];
                break;
              }
            }
          }

          if (pos !== -1) {
            const rawStart = page.indexMap[pos] ?? pos;
            const endNormPos = Math.min(page.indexMap.length - 1, pos + matchedTerm.length - 1);
            const rawEnd = (page.indexMap[endNormPos] ?? rawStart + matchedTerm.length - 1) + 1;

            const snippetStart = Math.max(0, rawStart - 120);
            const snippetEnd = Math.min(page.text.length, rawEnd + 120);

            const constituentBook = getBookForPage(volNum, page.page_num);

            matches.push({
              volume: volNum,
              pageNum: page.page_num,
              bookTitle: constituentBook.title,
              bookUrduTitle: constituentBook.urduTitle,
              snippetBefore: page.text.slice(snippetStart, rawStart),
              matchedSlice: page.text.slice(rawStart, rawEnd),
              snippetAfter: page.text.slice(rawEnd, snippetEnd),
              matchedTerm,
              isExactPhrase: matchedTerm === primaryTerm,
              readerUrl: `/reader?volume=${volNum}&page=${page.page_num}`
            });

            if (matches.length >= 30) break; // Keep top 30 Ruhani Khazain hits for fast response
          }
        }
        if (matches.length >= 30) break;
      }

      return matches;
    })();

    const quranPromise: Promise<any[]> = (async () => {
      if (!requestedSources.includes('quran')) return [];
      return searchQuranVerses(rawQuery);
    })();

    const alislamPromise: Promise<any[]> = (async () => {
      if (!requestedSources.includes('alislam')) return [];
      return searchAlIslamResources(rawQuery);
    })();

    const periodicalsPromise: Promise<any[]> = (async () => {
      if (!requestedSources.includes('periodicals')) return [];
      return searchPeriodicals(rawQuery);
    })();

    const [rkResults, quranResults, alislamResults, periodicalsResults] = await Promise.all([
      ruhaniKhazainPromise,
      quranPromise,
      alislamPromise,
      periodicalsPromise
    ]);

    // Deterministic Smart Scholarly Response (Zero AI / LLM latency or quota dependencies)
    let dossierResult: ResearchDossier | undefined = undefined;
    if (requestedSources.includes('dossier')) {
      const preSynthesized = findTheologicalDossier(rawQuery);
      if (preSynthesized) {
        dossierResult = preSynthesized;
      } else {
        const synthesized = synthesizeSmartTheologicalResponse(
          rawQuery,
          rkResults,
          quranResults,
          alislamResults,
          periodicalsResults
        );
        if (synthesized) dossierResult = synthesized;
      }
    }

    const totalResults = rkResults.length + quranResults.length + alislamResults.length + periodicalsResults.length + (dossierResult ? 1 : 0);

    const payload: MultiSourceSearchResult = {
      query: rawQuery,
      normalizedTerms,
      ruhaniKhazain: rkResults,
      quranVerses: quranResults,
      alislamArticles: alislamResults,
      publications: periodicalsResults,
      dossier: dossierResult,
      totalResults
    };

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
