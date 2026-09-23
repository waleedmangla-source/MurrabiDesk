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
  searchHadithTraditions,
  searchSunnahHadith,
  searchAlIslamResources,
  searchPeriodicals,
  MultiSourceSearchResult,
  RuhaniKhazainSearchResult,
  HadithResult,
  ResearchDossier,
  AudioResult,
  VideoResult,
  MediaItemResult,
  BookItem,
  searchAhmadiyyaBooks
} from '@/lib/research-sources';
import { searchAskIslamAudios } from '@/lib/askislam-data';
import { searchMediaVideos } from '@/lib/video-search';
import { disambiguateTheologicalContext } from '@/lib/dsgt/context-disambiguation';
import { expandQueryVector } from '@/lib/dsgt/query-expansion';
import { getCitationGraph, snowballTraverse } from '@/lib/dsgt/citation-graph';
import { computeHitsRankings } from '@/lib/dsgt/hits-engine';
import { computeConsensusTriangulation } from '@/lib/dsgt/triangulation-engine';
import {
  fetchLiveAlHakam,
  fetchLiveReviewOfReligions,
  fetchLiveAlIslam
} from '@/lib/external-sources';
import { PublicationResult, AlIslamArticleResult } from '@/lib/research-sources';

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

    // Fast-path: On-demand page retrieval for Articles (Al Hakam, Review of Religions, Al Islam)
    if (
      typeof body.articlePage === 'number' ||
      typeof body.alhakamPage === 'number' ||
      typeof body.periodicalPage === 'number'
    ) {
      const pageIndex = Math.max(0, Math.floor(body.articlePage ?? body.alhakamPage ?? body.periodicalPage));
      const humanPage = pageIndex + 1;

      // Extract winning concept if query is non-Latin (Urdu/Arabic)
      const hasLatinQuery = /[a-zA-Z]/.test(rawQuery);
      let englishSearchQuery = rawQuery;
      if (!hasLatinQuery) {
        const dsgtCtx = disambiguateTheologicalContext(rawQuery);
        if (dsgtCtx.winningSense?.primaryConcept) {
          englishSearchQuery = dsgtCtx.winningSense.primaryConcept;
        }
      }

      let [alHakamData, rorData, alIslamData] = await Promise.all([
        fetchLiveAlHakam(rawQuery, pageIndex),
        fetchLiveReviewOfReligions(englishSearchQuery, humanPage),
        fetchLiveAlIslam(rawQuery, humanPage)
      ]);

      if (alHakamData.results.length === 0 && englishSearchQuery !== rawQuery) {
        alHakamData = await fetchLiveAlHakam(englishSearchQuery, pageIndex);
      }
      if (alIslamData.results.length === 0 && englishSearchQuery !== rawQuery) {
        alIslamData = await fetchLiveAlIslam(englishSearchQuery, humanPage);
      }

      const publications: PublicationResult[] = [
        ...alHakamData.results,
        ...rorData.results
      ];

      const totalAlHakamHits = alHakamData.totalHits;
      const totalRoRHits = rorData.totalHits;
      const totalAlIslamHits = alIslamData.totalHits;
      const totalArticleHits = totalAlHakamHits + totalRoRHits + totalAlIslamHits;
      const totalPages = Math.max(alHakamData.totalPages, rorData.totalPages, alIslamData.totalPages);

      return NextResponse.json({
        success: true,
        data: {
          query: rawQuery,
          publications,
          alislamArticles: alIslamData.results,
          totalAlHakamHits,
          totalRoRHits,
          totalAlIslamHits,
          totalArticleHits,
          totalPagesAlHakam: alHakamData.totalPages,
          totalPagesRoR: rorData.totalPages,
          totalPagesAlIslam: alIslamData.totalPages,
          totalPages,
          currentPage: humanPage
        }
      });
    }

    const requestedSources: string[] = Array.isArray(body.sources) && body.sources.length > 0 
      ? body.sources 
      : ['ruhani-khazain', 'quran', 'ahadith', 'alislam', 'periodicals'];

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 1: Theological Lesk Context Disambiguation
    // ─────────────────────────────────────────────────────────────────────────
    const dsgtContext = disambiguateTheologicalContext(rawQuery);

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 2: Rocchio Algebraic Query Expansion & Cross-Lingual Vector Bridging
    // ─────────────────────────────────────────────────────────────────────────
    const dsgtExpanded = expandQueryVector(dsgtContext);

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

    // Add Rocchio-expanded Urdu Khazain terms
    if (dsgtExpanded.urduKhazainTerms && dsgtExpanded.urduKhazainTerms.length > 0) {
      for (const term of dsgtExpanded.urduKhazainTerms) {
        if (!searchTerms.includes(term)) {
          searchTerms.push(term);
        }
      }
    }

    const normalizedTerms = Array.from(new Set(searchTerms.map(t => normalizeKhazainText(t)).filter(Boolean)))
      .sort((a, b) => {
        const aIsUrdu = /[\u0600-\u06FF]/.test(a);
        const bIsUrdu = /[\u0600-\u06FF]/.test(b);
        if (aIsUrdu && !bIsUrdu) return -1;
        if (!aIsUrdu && bIsUrdu) return 1;
        return 0;
      });

    // Prioritize target volumes identified by the DSGT expansion
    const volumeOrder: number[] = [];
    if (dsgtExpanded.targetVolumes && dsgtExpanded.targetVolumes.length > 0) {
      for (const v of dsgtExpanded.targetVolumes) {
        if (v >= 1 && v <= 23 && !volumeOrder.includes(v)) {
          volumeOrder.push(v);
        }
      }
    }
    for (let v = 1; v <= 23; v++) {
      if (!volumeOrder.includes(v)) {
        volumeOrder.push(v);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 3 & 4: Cross-Corpus Citation Graph, Snowballing & Kleinberg HITS
    // ─────────────────────────────────────────────────────────────────────────
    const graph = getCitationGraph();
    const seedIds: string[] = [];

    // Match scripture refs
    const graphNodeKeys = Array.from(graph.nodes.keys());
    for (const ref of dsgtContext.extractedScriptureRefs) {
      const cleanRef = ref.replace(/\s+/g, '');
      for (const nodeId of graphNodeKeys) {
        if (nodeId.includes(cleanRef)) seedIds.push(nodeId);
      }
    }

    // Match priority volumes
    for (const vol of dsgtExpanded.targetVolumes) {
      for (const nodeId of graphNodeKeys) {
        if (nodeId.startsWith(`rk:vol${vol}:`)) seedIds.push(nodeId);
      }
    }

    // Match sense keywords
    const winningSenseTerms = [
      dsgtContext.winningSense?.primaryConcept || '',
      ...(dsgtContext.winningSense?.urduTerms || []),
      ...(dsgtContext.winningSense?.arabicTerms || [])
    ].map(s => s.toLowerCase());

    const graphNodeEntries = Array.from(graph.nodes.entries());
    for (const [nodeId, node] of graphNodeEntries) {
      const nodeText = `${node.title} ${node.referenceLabel}`.toLowerCase();
      if (
        dsgtContext.extractedKeywords.some(t => t.length > 3 && nodeText.includes(t.toLowerCase())) ||
        winningSenseTerms.some(st => st.length > 3 && nodeText.includes(st))
      ) {
        seedIds.push(nodeId);
      }
    }

    if (seedIds.length === 0) {
      seedIds.push(...graphNodeKeys.slice(0, 10));
    }

    const traversedNodeIds = snowballTraverse(seedIds, 2);
    const hitsRankings = computeHitsRankings(Array.from(traversedNodeIds));

    // ─────────────────────────────────────────────────────────────────────────
    // Multi-Source Parallel Execution
    // ─────────────────────────────────────────────────────────────────────────
    const ruhaniKhazainPromise: Promise<RuhaniKhazainSearchResult[]> = (async () => {
      if (!requestedSources.includes('ruhani-khazain')) return [];
      const matches: RuhaniKhazainSearchResult[] = [];
      const urduTerms = normalizedTerms.filter(t => /[\u0600-\u06FF]/.test(t));
      const activeSearchTerms = urduTerms.length > 0 ? urduTerms : normalizedTerms;
      const primaryTerm = activeSearchTerms[0] || normalizeKhazainText(rawQuery);
      if (!primaryTerm) return [];

      // Search priority volumes first, then remaining
      for (const volNum of volumeOrder) {
        const volData = getCachedVolume(volNum);
        if (!volData) continue;

        for (const page of volData.pages) {
          let pos = page.norm.indexOf(primaryTerm);
          let matchedTerm = primaryTerm;

          if (pos === -1 && activeSearchTerms.length > 1) {
            for (let i = 1; i < activeSearchTerms.length; i++) {
              pos = page.norm.indexOf(activeSearchTerms[i]);
              if (pos !== -1) {
                matchedTerm = activeSearchTerms[i];
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

            if (matches.length >= 1000) break; // Generous ceiling for safety
          }
        }
        if (matches.length >= 1000) break;
      }

      return matches;
    })();

    const quranPromise: Promise<any[]> = (async () => {
      if (!requestedSources.includes('quran')) return [];
      const results = searchQuranVerses(rawQuery);
      if (results.length === 0 && dsgtExpanded.arabicQuranTerms.length > 0) {
        for (const arabicTerm of dsgtExpanded.arabicQuranTerms) {
          const extra = searchQuranVerses(arabicTerm);
          for (const item of extra) {
            if (!results.some(r => r.surahNumber === item.surahNumber && r.verseNumber === item.verseNumber)) {
              results.push(item);
            }
          }
        }
      }
      if (results.length === 0 && dsgtContext.winningSense) {
        for (const anchor of dsgtContext.winningSense.scripturalAnchors) {
          const extra = searchQuranVerses(anchor);
          for (const item of extra) {
            if (!results.some(r => r.surahNumber === item.surahNumber && r.verseNumber === item.verseNumber)) {
              results.push(item);
            }
          }
        }
      }
      return results;
    })();

    const hadithPromise: Promise<HadithResult[]> = (async () => {
      if (!requestedSources.includes('ahadith')) return [];
      try {
        const results = await searchSunnahHadith(rawQuery);
        if (results.length < 3 && dsgtContext.winningSense?.primaryConcept) {
          const extra = await searchSunnahHadith(dsgtContext.winningSense.primaryConcept);
          for (const item of extra) {
            if (!results.some(r => r.id === item.id || (r.url && r.url === item.url))) {
              results.push(item);
            }
          }
        }
        return results;
      } catch (e) {
        console.warn('[Research API] Sunnah.com search fallback error:', e);
        return searchHadithTraditions(rawQuery);
      }
    })();

    let totalAlHakamHits = 0;
    let totalRoRHits = 0;
    let totalAlIslamHits = 0;
    let totalPagesAlHakam = 0;
    let totalPagesRoR = 0;
    let totalPagesAlIslam = 0;

    const alislamPromise: Promise<AlIslamArticleResult[]> = (async () => {
      if (!requestedSources.includes('alislam')) return [];
      const localResults = searchAlIslamResources(rawQuery);
      if (localResults.length === 0 && dsgtContext.winningSense) {
        const extra = searchAlIslamResources(dsgtContext.winningSense.primaryConcept);
        for (const item of extra) {
          if (!localResults.some(r => r.id === item.id)) localResults.push(item);
        }
      }

      // Query live Al Islam search with pagination support
      try {
        let liveAlIslam = await fetchLiveAlIslam(rawQuery, 1);
        if (liveAlIslam.results.length === 0 && !hasLatin && dsgtContext.winningSense?.primaryConcept) {
          liveAlIslam = await fetchLiveAlIslam(dsgtContext.winningSense.primaryConcept, 1);
        }

        totalAlIslamHits = liveAlIslam.totalHits;
        totalPagesAlIslam = liveAlIslam.totalPages;

        const merged: AlIslamArticleResult[] = [...localResults];
        const seenUrls = new Set(localResults.map(r => r.url.toLowerCase()));

        for (const art of liveAlIslam.results) {
          const normUrl = art.url.toLowerCase();
          if (!seenUrls.has(normUrl)) {
            seenUrls.add(normUrl);
            merged.push(art);
          }
        }
        return merged;
      } catch (e) {
        console.warn('[Research API] Live Al Islam fallback to local:', e);
        return localResults;
      }
    })();

    const periodicalsPromise: Promise<PublicationResult[]> = (async () => {
      if (!requestedSources.includes('periodicals')) return [];
      const localResults = searchPeriodicals(rawQuery);
      if (localResults.length === 0 && dsgtContext.winningSense) {
        const extra = searchPeriodicals(dsgtContext.winningSense.primaryConcept);
        for (const item of extra) {
          if (!localResults.some(r => r.id === item.id)) localResults.push(item);
        }
      }

      // Query live Al Hakam Official API and Review of Religions in parallel
      try {
        const englishSearchQuery = (!hasLatin && dsgtContext.winningSense?.primaryConcept)
          ? dsgtContext.winningSense.primaryConcept
          : rawQuery;

        let [alHakamData, rorData] = await Promise.all([
          fetchLiveAlHakam(rawQuery, 0),
          fetchLiveReviewOfReligions(englishSearchQuery, 1)
        ]);

        if (alHakamData.results.length === 0 && englishSearchQuery !== rawQuery) {
          alHakamData = await fetchLiveAlHakam(englishSearchQuery, 0);
        }

        totalAlHakamHits = alHakamData.totalHits;
        totalPagesAlHakam = alHakamData.totalPages;
        totalRoRHits = rorData.totalHits;
        totalPagesRoR = rorData.totalPages;

        const merged: PublicationResult[] = [...localResults];
        const seenUrls = new Set(localResults.map(r => r.url.toLowerCase()));

        // Incorporate live Al Hakam articles
        for (const pub of alHakamData.results) {
          const normUrl = pub.url.toLowerCase();
          if (!seenUrls.has(normUrl)) {
            seenUrls.add(normUrl);
            merged.push(pub);
          }
        }

        // Incorporate live Review of Religions articles
        for (const pub of rorData.results) {
          const normUrl = pub.url.toLowerCase();
          if (!seenUrls.has(normUrl)) {
            seenUrls.add(normUrl);
            merged.push(pub);
          }
        }

        return merged;
      } catch (e) {
        console.warn('[Research API] Live periodicals fallback to local:', e);
        return localResults;
      }
    })();

    const askIslamPromise: Promise<AudioResult[]> = (async () => {
      try {
        return searchAskIslamAudios(rawQuery);
      } catch (e) {
        console.warn('[Research API] Ask Islam search failed:', e);
        return [];
      }
    })();

    const videosPromise: Promise<VideoResult[]> = (async () => {
      try {
        return await searchMediaVideos(rawQuery);
      } catch (e) {
        console.warn('[Research API] Video search failed:', e);
        return [];
      }
    })();

    const booksPromise: Promise<BookItem[]> = (async () => {
      try {
        const localBooks = searchAhmadiyyaBooks(rawQuery);
        if (localBooks.length === 0 && dsgtContext.winningSense?.primaryConcept) {
          const extra = searchAhmadiyyaBooks(dsgtContext.winningSense.primaryConcept);
          for (const item of extra) {
            if (!localBooks.some(b => b.id === item.id)) localBooks.push(item);
          }
        }
        return localBooks;
      } catch (e) {
        console.warn('[Research API] Books search failed:', e);
        return [];
      }
    })();

    const [rkResults, quranResults, hadithResults, alislamResults, periodicalsResults, askIslamResults, videoResults, booksResults] = await Promise.all([
      ruhaniKhazainPromise,
      quranPromise,
      hadithPromise,
      alislamPromise,
      periodicalsPromise,
      askIslamPromise,
      videosPromise,
      booksPromise
    ]);

    // Merge any live Al Islam results identified as books
    const mergedBooks: BookItem[] = [...booksResults];
    const seenBookUrls = new Set(booksResults.map(b => b.url.toLowerCase()));

    for (const art of alislamResults) {
      if (art.category === 'Book' || art.url.includes('/book/')) {
        const normUrl = art.url.toLowerCase();
        if (!seenBookUrls.has(normUrl)) {
          seenBookUrls.add(normUrl);
          mergedBooks.push({
            id: art.id,
            title: art.title,
            author: art.author || 'Hazrat Mirza Ghulam Ahmad (as) / Khulafa',
            category: 'Contemporary',
            summary: art.summary,
            url: art.url,
            topics: art.topics
          });
        }
      }
    }

    const media: MediaItemResult[] = [
      ...askIslamResults.map(a => ({ mediaType: 'audio' as const, ...a })),
      ...videoResults.map(v => ({ mediaType: 'video' as const, ...v }))
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 5: Consensus Triangulation Matrix & Evidence Verifier
    // ─────────────────────────────────────────────────────────────────────────
    const consensusMatrix = computeConsensusTriangulation(
      dsgtContext,
      quranResults,
      rkResults,
      alislamResults,
      periodicalsResults,
      hitsRankings
    );

    const totalArticleHits = (totalAlHakamHits || 0) + (totalRoRHits || 0) + (totalAlIslamHits || 0);
    const totalResults = rkResults.length + quranResults.length + hadithResults.length + mergedBooks.length + Math.max(alislamResults.length + periodicalsResults.length, totalArticleHits) + media.length;

    const payload: MultiSourceSearchResult = {
      query: rawQuery,
      normalizedTerms,
      ruhaniKhazain: rkResults,
      quranVerses: quranResults,
      ahadith: hadithResults,
      books: mergedBooks,
      totalBookHits: mergedBooks.length,
      alislamArticles: alislamResults,
      publications: periodicalsResults,
      audios: askIslamResults,
      videos: videoResults,
      media,
      totalMediaHits: media.length,
      consensusMatrix,
      hitsRankings,
      totalResults,
      totalAlHakamHits,
      totalRoRHits,
      totalAlIslamHits,
      totalArticleHits,
      totalPagesAlHakam,
      totalPagesRoR,
      totalPagesAlIslam
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
