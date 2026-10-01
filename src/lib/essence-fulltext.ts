import fs from 'fs';
import path from 'path';
import { EssenceResult, getEssencePdfUrl, ESSENCE_VOLUMES_METADATA } from './essence-data';
import { THEOLOGICAL_TOPIC_MAP } from './khazain-data';

interface RawEssencePage {
  page_num: number | string;
  pdf_page: number;
  topic?: string;
  sourceTreatise?: string;
  text: string;
  headings?: string[];
}

interface RawEssenceVolume {
  volume: number;
  volumeRoman: string;
  title: string;
  author: string;
  translator: string;
  publisher: string;
  sourcePdfUrl: string;
  sourceUrl: string;
  totalPdfPages: number;
  totalPages: number;
  topics: string[];
  pages: RawEssencePage[];
}

let cachedVolumes: RawEssenceVolume[] | null = null;

export function getEssenceVolumes(): RawEssenceVolume[] {
  if (cachedVolumes) return cachedVolumes;
  if (typeof window !== 'undefined') return []; // Server-side only

  try {
    const dir = path.join(process.cwd(), 'public', 'essence-of-islam-en');
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
      return data as RawEssenceVolume;
    });

    return cachedVolumes;
  } catch (err) {
    console.error('[Essence FullText] Error loading volumes:', err);
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

function normalizeTransliteration(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b([a-zA-Z]{2,})\s+([a-zA-Z])\b/g, '$1$2')
    .replace(/\s+([a-zA-Z])\b/g, '$1')
    .replace(/['’‘`]/g, '')
    .toLowerCase();
}

/**
 * High-speed full-text search across all 5 volumes of The Essence of Islam series.
 */
export function searchEssenceFullText(query: string, maxResults = 25): EssenceResult[] {
  if (!query || !query.trim()) return [];

  const rawClean = query.trim().toLowerCase();
  const normQuery = normalizeTransliteration(rawClean);
  const queryTokens = rawClean.split(/\s+/).filter(t => t.length >= 2);
  if (queryTokens.length === 0) return [];

  const volumes = getEssenceVolumes();
  if (volumes.length === 0) return [];

  // Check volume target (e.g. "volume 3", "vol 1", "essence 2")
  const volMatch = query.match(/(?:volume|vol|essence)\s*([1-5])/i);
  const targetVol = volMatch ? parseInt(volMatch[1], 10) : null;

  // Generic Essence of Islam search detection
  const isGenericEssenceQuery =
    /(?:^|\b)(?:essence\s+of\s+islam|essence|eoi)(?:\b|$)/i.test(rawClean);

  // Expand theological concepts if available
  const expandedTokens = new Set<string>();
  expandedTokens.add(rawClean);
  queryTokens.forEach(t => expandedTokens.add(t));

  for (const token of queryTokens) {
    if (THEOLOGICAL_TOPIC_MAP[token]) {
      THEOLOGICAL_TOPIC_MAP[token].forEach(term => {
        expandedTokens.add(term.toLowerCase());
      });
    }
  }

  const scoredResults: Array<{
    result: EssenceResult;
    score: number;
  }> = [];

  for (const vol of volumes) {
    if (targetVol !== null && vol.volume !== targetVol) {
      continue;
    }

    const volBonus = (targetVol === vol.volume) ? 100 : 0;
    const volMeta = ESSENCE_VOLUMES_METADATA[vol.volume];

    for (const page of vol.pages) {
      const pageText = page.text;
      const lowerText = pageText.toLowerCase();
      const normPage = normalizeTransliteration(pageText);
      const topicLower = (page.topic || '').toLowerCase();
      const treatiseLower = (page.sourceTreatise || '').toLowerCase();
      const headingsLower = (page.headings || []).join(' ').toLowerCase();

      let score = volBonus;

      // Generic query bonus: showcase essential extracts
      if (isGenericEssenceQuery) {
        if (typeof page.page_num === 'number' && page.page_num >= 1 && page.page_num <= 25) {
          score += 45;
        } else {
          score += 15;
        }
      }

      // Exact phrase match in full text or transliterated match
      if (lowerText.includes(rawClean)) {
        score += 70;
      } else if (normPage.includes(normQuery)) {
        score += 65;
      }

      // Topic header match
      if (topicLower.includes(rawClean)) {
        score += 80;
      }

      // Headings match
      if (headingsLower.includes(rawClean)) {
        score += 65;
      }

      // Source treatise match (e.g. "Brahin-e-Ahmadiyya", "Philosophy of the Teachings")
      if (treatiseLower.includes(rawClean)) {
        score += 75;
      }

      // Individual token matches
      let matchedTokens = 0;
      for (const token of queryTokens) {
        if (token.length < 2) continue;
        let tokenFound = false;

        if (topicLower.includes(token)) {
          score += 25;
          tokenFound = true;
        }
        if (treatiseLower.includes(token)) {
          score += 20;
          tokenFound = true;
        }
        if (headingsLower.includes(token)) {
          score += 18;
          tokenFound = true;
        }
        if (lowerText.includes(token)) {
          score += 12;
          tokenFound = true;
        }

        if (tokenFound) matchedTokens++;
      }

      // Expanded theological concepts
      for (const exp of Array.from(expandedTokens)) {
        if (exp.length < 3) continue;
        if (topicLower.includes(exp)) score += 15;
        if (treatiseLower.includes(exp)) score += 12;
        if (lowerText.includes(exp)) score += 8;
      }

      // If multiple tokens query, require token coverage
      if (queryTokens.length >= 2 && matchedTokens === 0 && !isGenericEssenceQuery) {
        continue;
      }

      if (score > 10) {
        // Construct neat title from section heading or topic
        const mainHeading = (page.headings && page.headings.length > 0)
          ? page.headings[0]
          : (page.topic || `Volume ${vol.volumeRoman}`);

        const snippet = extractSnippet(pageText, rawClean);
        const pdfUrl = getEssencePdfUrl(vol.volume, page.page_num, page.pdf_page);

        scoredResults.push({
          score,
          result: {
            id: `essence-vol-${vol.volume}-p-${page.page_num}`,
            volume: vol.volume,
            volumeRoman: vol.volumeRoman,
            pageNum: page.page_num,
            pdfPage: page.pdf_page,
            title: mainHeading,
            topic: page.topic || volMeta?.topics[0] || "The Essence of Islam",
            sourceTreatise: page.sourceTreatise,
            excerpt: snippet,
            fullText: pageText,
            headings: page.headings,
            topics: ["essence of islam", `volume ${vol.volume}`, page.topic || ''].filter(Boolean),
            pdfUrl,
            sourceUrl: vol.sourceUrl,
            relevanceScore: score
          }
        });
      }
    }
  }

  return scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.result);
}
