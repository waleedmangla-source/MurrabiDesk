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

    // Fast-path: On-demand page retrieval for Al Hakam Archive
    if (typeof body.alhakamPage === 'number') {
      const pageNum = Math.max(0, Math.floor(body.alhakamPage));
      const alHakamData = await fetchLiveAlHakam(rawQuery, pageNum);
      return NextResponse.json({
        success: true,
        data: {
          query: rawQuery,
          publications: alHakamData.results,
          totalAlHakamHits: alHakamData.totalHits,
          totalPages: alHakamData.totalPages,
          currentPage: pageNum + 1
        }
      });
    }

    const requestedSources: string[] = Array.isArray(body.sources) && body.sources.length > 0 
      ? body.sources 
      : ['ruhani-khazain', 'quran', 'alislam', 'periodicals', 'dossier'];

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

    const alislamPromise: Promise<AlIslamArticleResult[]> = (async () => {
      if (!requestedSources.includes('alislam')) return [];
      const localResults = searchAlIslamResources(rawQuery);
      if (localResults.length === 0 && dsgtContext.winningSense) {
        const extra = searchAlIslamResources(dsgtContext.winningSense.primaryConcept);
        for (const item of extra) {
          if (!localResults.some(r => r.id === item.id)) localResults.push(item);
        }
      }

      // Query live Al Islam search in parallel with fallback
      try {
        const liveArticles = await fetchLiveAlIslam(rawQuery);
        const merged: AlIslamArticleResult[] = [...localResults];
        const seenUrls = new Set(localResults.map(r => r.url.toLowerCase()));

        for (const art of liveArticles) {
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

    let totalAlHakamHits = 0;
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
        const [alHakamData, liveRoR] = await Promise.all([
          fetchLiveAlHakam(rawQuery, 0),
          fetchLiveReviewOfReligions(rawQuery)
        ]);

        totalAlHakamHits = alHakamData.totalHits;

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
        for (const pub of liveRoR) {
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

    const [rkResults, quranResults, alislamResults, periodicalsResults] = await Promise.all([
      ruhaniKhazainPromise,
      quranPromise,
      alislamPromise,
      periodicalsPromise
    ]);

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

    // Scholarly Dossier
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

    const totalResults = rkResults.length + quranResults.length + alislamResults.length + Math.max(periodicalsResults.length, totalAlHakamHits) + (dossierResult ? 1 : 0);

    const payload: MultiSourceSearchResult = {
      query: rawQuery,
      normalizedTerms,
      ruhaniKhazain: rkResults,
      quranVerses: quranResults,
      alislamArticles: alislamResults,
      publications: periodicalsResults,
      dossier: dossierResult,
      consensusMatrix,
      hitsRankings,
      totalResults,
      totalAlHakamHits
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
