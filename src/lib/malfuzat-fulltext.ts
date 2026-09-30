import fs from 'fs';
import path from 'path';
import { MalfuzatResult, searchMalfuzat, getMalfuzatPdfUrl } from './malfuzat-data';
import { THEOLOGICAL_TOPIC_MAP } from './khazain-data';

interface MalfuzatPage {
  page_num: number | string;
  pdf_page: number;
  text: string;
  headings?: string[];
  dates?: string[];
}

interface MalfuzatVolume {
  volume: number;
  volumeRoman: string;
  title: string;
  dateRange: string;
  author: string;
  publisher: string;
  sourcePdfUrl: string;
  sourceUrl: string;
  totalPdfPages: number;
  totalPages: number;
  pages: MalfuzatPage[];
}

let cachedVolumes: MalfuzatVolume[] | null = null;

export function getMalfuzatEnglishVolumes(): MalfuzatVolume[] {
  if (cachedVolumes) return cachedVolumes;
  if (typeof window !== 'undefined') return []; // Server-side execution only

  try {
    const dir = path.join(process.cwd(), 'public', 'malfuzat-en');
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith('volume_') && f.endsWith('.json'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('volume_', '').replace('.json', ''), 10);
        const numB = parseInt(b.replace('volume_', '').replace('.json', ''), 10);
        return numA - numB;
      });

    cachedVolumes = files.map(file => {
      const fullPath = path.join(dir, file);
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      return data as MalfuzatVolume;
    });

    return cachedVolumes;
  } catch (err) {
    console.error('[Malfuzat FullText] Error loading English volumes:', err);
    return [];
  }
}

/**
 * Extracts a neat snippet around the matching query term with sentence context.
 */
function extractSnippet(text: string, term: string, maxLength = 320): string {
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const idx = lowerText.indexOf(lowerTerm);

  if (idx === -1) {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, idx - 140);
  const end = Math.min(text.length, idx + term.length + 180);

  let snippet = text.slice(start, end);

  // Clean boundary words
  if (start > 0) {
    const firstSpace = snippet.indexOf(' ');
    if (firstSpace !== -1 && firstSpace < 30) {
      snippet = '...' + snippet.slice(firstSpace + 1);
    } else {
      snippet = '...' + snippet;
    }
  }

  if (end < text.length) {
    const lastSpace = snippet.lastIndexOf(' ');
    if (lastSpace !== -1 && lastSpace > snippet.length - 30) {
      snippet = snippet.slice(0, lastSpace) + '...';
    } else {
      snippet = snippet + '...';
    }
  }

  return snippet.replace(/\s+/g, ' ').trim();
}

/**
 * High-speed full-text search across all 8 English translated volumes of Malfuzat.
 */
export function searchMalfuzatFullText(query: string, maxResults = 25): MalfuzatResult[] {
  if (!query || !query.trim()) return [];

  const rawClean = query.trim().toLowerCase();
  const queryTokens = rawClean.split(/\s+/).filter(t => t.length >= 2);
  if (queryTokens.length === 0) return [];

  // Check volume target (e.g. "volume 3", "vol 1")
  const volMatch = query.match(/(?:volume|vol)\s*([0-9]{1,2})/i);
  const targetVol = volMatch ? parseInt(volMatch[1], 10) : null;

  // Generic Malfuzat search detection
  const isGenericMalfuzatQuery =
    /(?:^|\b)(?:malfuzat|malfoozat|discourses?|sayings?)(?:\b|$)/i.test(rawClean);

  // Expand theological concepts if available
  const expandedTokens = new Set<string>();
  expandedTokens.add(rawClean);
  queryTokens.forEach(t => expandedTokens.add(t));

  for (const token of queryTokens) {
    if (THEOLOGICAL_TOPIC_MAP[token]) {
      // THEOLOGICAL_TOPIC_MAP contains Urdu keywords, also keep original token
      expandedTokens.add(token);
    }
  }

  const volumes = getMalfuzatEnglishVolumes();
  if (!volumes || volumes.length === 0) return [];

  interface ScoredHit {
    volume: number;
    volumeRoman: string;
    pageNum: number | string;
    pdfPage: number;
    title: string;
    text: string;
    snippet: string;
    dateStr: string;
    score: number;
    sourceUrl: string;
    headings: string[];
  }

  const hits: ScoredHit[] = [];

  for (const vol of volumes) {
    // If user explicitly queried a volume, filter by that volume
    if (targetVol && vol.volume !== targetVol) continue;

    for (const page of vol.pages) {
      // Skip purely non-content front matter unless specifically searched
      const isFront = typeof page.page_num === 'string' && page.page_num.startsWith('front');
      if (isFront && !isGenericMalfuzatQuery && rawClean.length < 5) continue;

      const pageText = page.text;
      const lowerPage = pageText.toLowerCase();
      let score = 0;
      let primaryMatchedTerm = rawClean;

      // 1. Exact phrase match
      if (lowerPage.includes(rawClean)) {
        score += 50;
        primaryMatchedTerm = rawClean;
      }

      // 2. Heading matches
      if (page.headings && page.headings.length > 0) {
        for (const h of page.headings) {
          const lowerH = h.toLowerCase();
          if (lowerH.includes(rawClean)) {
            score += 40;
            break;
          }
          for (const token of queryTokens) {
            if (lowerH.includes(token)) score += 15;
          }
        }
      }

      // 3. Multi-token match
      let matchedTokens = 0;
      for (const token of queryTokens) {
        if (lowerPage.includes(token)) {
          matchedTokens++;
          score += 10;
        }
      }

      // Bonus if all tokens matched
      if (queryTokens.length > 1 && matchedTokens === queryTokens.length) {
        score += 25;
      }

      // 4. Generic query bonus
      if (isGenericMalfuzatQuery) {
        score += 20;
        if (!isFront) score += 15;
      }

      if (score > 0) {
        const snippet = extractSnippet(pageText, primaryMatchedTerm);
        const headingTitle = page.headings && page.headings.length > 0 ? page.headings[0] : null;
        const pageTitle = headingTitle
          ? `${headingTitle} (Malfuzat Vol. ${vol.volumeRoman}, p. ${page.page_num})`
          : `Malfuzat Volume ${vol.volumeRoman}, Page ${page.page_num}`;

        const directPdfUrl = `${vol.sourcePdfUrl || `https://files.alislam.cloud/pdf/Malfuzat-${vol.volume}.pdf`}#page=${page.pdf_page}`;

        hits.push({
          volume: vol.volume,
          volumeRoman: vol.volumeRoman,
          pageNum: page.page_num,
          pdfPage: page.pdf_page,
          title: pageTitle,
          text: pageText,
          snippet,
          dateStr: page.dates && page.dates.length > 0 ? page.dates[0] : vol.dateRange,
          score,
          sourceUrl: directPdfUrl,
          headings: page.headings || []
        });
      }
    }
  }

  // Sort by score descending, then by volume and page ascending
  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.volume !== b.volume) return a.volume - b.volume;
    const pA = typeof a.pageNum === 'number' ? a.pageNum : 9999;
    const pB = typeof b.pageNum === 'number' ? b.pageNum : 9999;
    return pA - pB;
  });

  const topHits = hits.slice(0, maxResults);

  return topHits.map((hit) => {
    const numericPage = typeof hit.pageNum === 'number' ? hit.pageNum : hit.pdfPage;
    return {
      id: `malfuzat-en-v${hit.volume}-p${hit.pageNum}`,
      volume: hit.volume,
      pageNum: numericPage,
      pdfPage: hit.pdfPage,
      dateStr: hit.dateStr,
      location: "Discourses of the Promised Messiah (as)",
      sittingContext: `Malfuzat Volume ${hit.volumeRoman} (${hit.volume === 1 ? '1891–1898' : hit.volume === 2 ? '1899–1900' : hit.volume === 3 ? '1900–1901' : hit.volume === 4 ? '1901' : hit.volume === 7 ? '1904–1905' : hit.volume === 8 ? '1905–1906' : hit.volume === 9 ? '1906–1907' : '1907–1908'})`,
      title: hit.title,
      urduTitle: `ملفوظات جلد ${hit.volume} صفحہ ${hit.pageNum}`,
      urduText: "",
      englishTranslation: hit.snippet,
      topics: ["malfuzat", `volume ${hit.volume}`, ...hit.headings.slice(0, 3)],
      url: hit.sourceUrl,
      pdfUrl: hit.sourceUrl,
      scribe: "Islam International Publications Ltd.",
      periodicalSource: `Official English Translation, Malfuzat Vol. ${hit.volumeRoman}, p. ${hit.pageNum} (PDF p. ${hit.pdfPage})`
    };
  });
}

/**
 * Unified Malfuzat Search combining curated bilingual landmarks and exhaustive full-text pages.
 */
export function searchUnifiedMalfuzat(query: string): MalfuzatResult[] {
  // 1. Search full-text English volumes
  const fullTextResults = searchMalfuzatFullText(query, 25);

  // 2. Search curated catalog
  const catalogResults = searchMalfuzat(query);

  const volumes = getMalfuzatEnglishVolumes();

  const enrichPdfUrl = (item: MalfuzatResult): MalfuzatResult => {
    if (item.pdfPage && item.pdfUrl) return item;
    const volData = volumes.find(v => v.volume === item.volume);
    let pdfPage: number | undefined = undefined;
    if (volData) {
      const match = volData.pages.find(p => p.page_num === item.pageNum && p.pdf_page >= item.pageNum);
      if (match) pdfPage = match.pdf_page;
    }
    const pdfUrl = getMalfuzatPdfUrl(item.volume, item.pageNum, pdfPage);
    return {
      ...item,
      pdfPage: pdfPage || item.pdfPage,
      pdfUrl,
      url: pdfUrl
    };
  };

  // Combine and deduplicate
  const combined: MalfuzatResult[] = [];
  const seenKeys = new Set<string>();

  // Curated landmark discourses first if high relevance
  for (const item of catalogResults) {
    const key = `vol-${item.volume}-p-${item.pageNum}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      combined.push(enrichPdfUrl(item));
    }
  }

  // Then add full-text page hits
  for (const item of fullTextResults) {
    const key = `vol-${item.volume}-p-${item.pageNum}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      combined.push(enrichPdfUrl(item));
    }
  }

  return combined;
}
