import fs from 'fs';
import path from 'path';
import { TazkirahResult, searchTazkirah, getTadhkirahPdfUrl } from './tazkirah-data';
import { normalizeKhazainText, THEOLOGICAL_TOPIC_MAP } from './khazain-data';

interface RawTadhkirahPage {
  page_num: number | string;
  pdf_page: number;
  year?: number;
  dateStr?: string;
  category?: string;
  text: string;
  arabicSnippets?: string[];
  headings?: string[];
  dates?: string[];
}

interface RawTadhkirahCorpus {
  title: string;
  urduTitle: string;
  author: string;
  publisher: string;
  edition: string;
  sourcePdfUrl: string;
  sourceUrl: string;
  totalPdfPages: number;
  totalPages: number;
  dateRange: string;
  pages: RawTadhkirahPage[];
}

let cachedCorpus: RawTadhkirahCorpus | null = null;

export function getTadhkirahCorpus(): RawTadhkirahCorpus | null {
  if (cachedCorpus) return cachedCorpus;
  if (typeof window !== 'undefined') return null; // Server-side only

  try {
    const filePath = path.join(process.cwd(), 'public', 'tadhkirah-en', 'tadhkirah.json');
    if (!fs.existsSync(filePath)) return null;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    cachedCorpus = data as RawTadhkirahCorpus;
    return cachedCorpus;
  } catch (err) {
    console.error('[Tadhkirah FullText] Error loading tadhkirah.json:', err);
    return null;
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

function normalizeTransliteration(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b([a-zA-Z]{2,})\s+([a-zA-Z])\b/g, '$1$2')
    .replace(/\s+([a-zA-Z])\b/g, '$1')
    .replace(/['’‘`]/g, '')
    .toLowerCase();
}

/**
 * High-speed full-text search across all 1,209 pages of the English Tadhkirah.
 */
export function searchTadhkirahFullText(query: string, maxResults = 25): TazkirahResult[] {
  if (!query || !query.trim()) return [];

  const rawClean = query.trim().toLowerCase();
  const normQuery = normalizeTransliteration(rawClean);
  const normUrdu = normalizeKhazainText(query);
  const queryTokens = rawClean.split(/\s+/).filter(t => t.length >= 2);
  if (queryTokens.length === 0) return [];

  const corpus = getTadhkirahCorpus();
  if (!corpus || !corpus.pages) return [];

  // Check year specific queries (e.g. "1886", "1894", "1905")
  const yearMatch = query.match(/\b(18[6-9][0-9]|190[0-8])\b/);
  const targetYear = yearMatch ? parseInt(yearMatch[1], 10) : null;

  // Generic Tadhkirah search detection
  const isGenericTadhkirahQuery =
    /(?:^|\b)(?:tadhkirah|tadhkira|tazkirah|tazkira|تذکرہ|revelations?|dreams?|visions?|ilham|ilhamaat|ruya|kashf)(?:\b|$)/i.test(rawClean);

  // Expand theological concepts if available
  const expandedTokens = new Set<string>();
  expandedTokens.add(rawClean);
  queryTokens.forEach(t => expandedTokens.add(t));

  for (const token of queryTokens) {
    if (THEOLOGICAL_TOPIC_MAP[token]) {
      THEOLOGICAL_TOPIC_MAP[token].forEach(term => {
        expandedTokens.add(term.toLowerCase());
        expandedTokens.add(normalizeKhazainText(term));
      });
    }
  }

  const scoredResults: Array<{
    result: TazkirahResult;
    score: number;
  }> = [];

  for (const page of corpus.pages) {
    const pageText = page.text;
    const lowerText = pageText.toLowerCase();
    const normPage = normalizeTransliteration(pageText);
    const headingsLower = (page.headings || []).join(' ').toLowerCase();
    const categoryLower = (page.category || '').toLowerCase();

    let score = 0;

    // Generic query bonus: showcase landmark historical revelations
    if (isGenericTadhkirahQuery) {
      score += 15;
      if (page.year === 1886 || page.year === 1876 || page.year === 1891 || page.year === 1905) {
        score += 40;
      }
    }

    // Direct targeted year match bonus
    if (targetYear && page.year === targetYear) {
      score += 80;
    }

    // Exact phrase match or transliterated match
    if (lowerText.includes(rawClean)) {
      score += 60;
    } else if (normPage.includes(normQuery)) {
      score += 55;
    }

    // Headings match
    if (headingsLower.includes(rawClean)) {
      score += 50;
    }

    // Category match
    if (categoryLower.includes(rawClean)) {
      score += 30;
    }

    // Token matching
    let matchedTokens = 0;
    for (const token of queryTokens) {
      if (token.length < 2) continue;
      let tokenFound = false;

      if (headingsLower.includes(token)) {
        score += 20;
        tokenFound = true;
      }
      if (lowerText.includes(token)) {
        score += 12;
        tokenFound = true;
      }

      if (tokenFound) matchedTokens++;
    }

    // Theological topic expansions
    for (const exp of Array.from(expandedTokens)) {
      if (exp.length < 3) continue;
      if (lowerText.includes(exp)) score += 10;
    }

    // Arabic / Urdu normalization match if query has Urdu/Arabic chars
    if (normUrdu && normUrdu.length >= 2) {
      const normPageText = normalizeKhazainText(pageText);
      if (normPageText.includes(normUrdu)) {
        score += 45;
      }
    }

    if (queryTokens.length >= 2 && matchedTokens === 0 && !isGenericTadhkirahQuery && !targetYear) {
      continue;
    }

    if (score > 15) {
      const heading = (page.headings && page.headings.length > 0)
        ? page.headings[0]
        : `Revelation (${page.dateStr || page.year || 'Historic'})`;

      const snippet = extractSnippet(pageText, rawClean);
      const pdfUrl = getTadhkirahPdfUrl(page.page_num, page.pdf_page);

      // Determine category format
      let cat: 'Revelation (Ilham)' | 'Dream (Ru\'ya)' | 'Vision (Kashf)' | 'Verbal Inspiration' = 'Revelation (Ilham)';
      if (page.category?.includes('Dream')) cat = "Dream (Ru'ya)";
      else if (page.category?.includes('Vision')) cat = "Vision (Kashf)";
      else if (page.category?.includes('Verbal')) cat = "Verbal Inspiration";

      const pageNumNumber = typeof page.page_num === 'number' ? page.page_num : undefined;

      scoredResults.push({
        score,
        result: {
          id: `tazkirah-page-${page.pdf_page}`,
          year: page.year || 1881,
          dateStr: page.dateStr || (page.year ? String(page.year) : "Undated"),
          title: heading,
          urduTitle: "",
          category: cat,
          originalText: (page.arabicSnippets && page.arabicSnippets[0]) || "",
          language: page.arabicSnippets && page.arabicSnippets.length > 0 ? "Arabic" : "English",
          englishTranslation: snippet,
          historicalContext: `Recorded in Tadhkirah (English Translation), page ${page.page_num} (PDF page ${page.pdf_page}). Year: ${page.year || 'c. 1880s'}.`,
          pageEnglish: pageNumNumber,
          pdfPage: page.pdf_page,
          pdfUrl,
          topics: ["tadhkirah", "revelation", String(page.year || '')].filter(Boolean),
          url: pdfUrl,
          relevanceScore: score
        }
      });
    }
  }

  return scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.result);
}

/**
 * Unified Tadhkirah search combining curated landmark revelations and exhaustive full-text pages.
 */
export function searchUnifiedTazkirah(query: string): TazkirahResult[] {
  // 1. Search full-text English Tadhkirah
  const fullTextResults = searchTadhkirahFullText(query, 25);

  // 2. Search curated landmark catalog
  const catalogResults = searchTazkirah(query);

  const corpus = getTadhkirahCorpus();

  const enrichPdfInfo = (item: TazkirahResult): TazkirahResult => {
    let pdfPage = item.pdfPage;
    if (!pdfPage && corpus && corpus.pages) {
      const match = corpus.pages.find(p => p.page_num === item.pageEnglish);
      if (match) {
        pdfPage = match.pdf_page;
      } else if (item.pageEnglish) {
        pdfPage = item.pageEnglish + 22;
      }
    }
    const pdfUrl = getTadhkirahPdfUrl(item.pageEnglish, pdfPage);
    return {
      ...item,
      pdfPage: pdfPage || (item.pageEnglish ? item.pageEnglish + 22 : 1),
      pdfUrl,
      url: pdfUrl
    };
  };

  const combined: TazkirahResult[] = [];
  const seenKeys = new Set<string>();

  // Curated landmark revelations first
  for (const item of catalogResults) {
    const key = `tazkirah-${item.id}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      combined.push(enrichPdfInfo(item));
    }
  }

  // Then add full-text page hits
  for (const item of fullTextResults) {
    const key = `tazkirah-p-${item.pageEnglish || item.pdfPage}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      combined.push(enrichPdfInfo(item));
    }
  }

  return combined;
}
