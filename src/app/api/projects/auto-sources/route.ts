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
  searchSunnahHadith,
  searchAlIslamResources,
  QuranVerseResult,
  HadithResult
} from '@/lib/research-sources';
import { searchEssenceFullText } from '@/lib/essence-fulltext';
import { EssenceResult } from '@/lib/essence-data';
import { searchUnifiedMalfuzat } from '@/lib/malfuzat-fulltext';
import { MalfuzatResult } from '@/lib/malfuzat-data';
import { searchAhmadiyyaBooks } from '@/lib/books-catalog';
import { disambiguateTheologicalContext } from '@/lib/dsgt/context-disambiguation';
import { ResearchBookmarkItem } from '@/lib/research-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getGeminiApiKey(): string | null {
  let apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const match = envFile.match(/^GOOGLE_AI_API_KEY=(.*)$/m);
        if (match && match[1]) apiKey = match[1].trim();
      }
    } catch (e) {
      console.error('[Auto-Sources] Error reading .env.local for API key:', e);
    }
  }
  return apiKey || null;
}

// ── Ruhani Khazain In-Memory Volume Cache ──
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
    console.error(`[Auto-Sources] Failed to load RK volume ${volNum}:`, err);
    return null;
  }
}

// ── Query Decomposition via Gemini AI ──
interface DecomposedQueries {
  verseRefs: string[];
  hadithTerms: string[];
  khazainUrduTerms: string[];
  essenceTerms: string[];
  generalConcepts: string[];
}

async function decomposeTopicWithAI(
  topic: string,
  workType?: string,
  occasion?: string
): Promise<DecomposedQueries | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const prompt = `You are an elite Islamic theological scholar and indexer for Murabbi Desk (Ahmadiyya Muslim research platform).
A user is preparing a project on the topic: "${topic}"
Delivery Format: ${workType || 'Speech'}
Occasion/Setting: ${occasion || 'General'}

Analyze this topic and identify targeted search queries to query the Research Tab search index:
1. "verseRefs": Array of 2 to 4 precise Holy Qur'an chapter and verse references most relevant to this topic (e.g. ["2:186", "54:50", "25:3"]).
2. "hadithTerms": Array of 2 to 3 search phrases in English or Arabic for Sunnah/Hadith collections (e.g. ["bukhari divine decree", "supplication changes fate", "tirmidhi dua"]).
3. "khazainUrduTerms": Array of 2 to 4 Urdu terms or treatise concepts from Hazrat Masih-e-Maud (as) in Ruhani Khazain (e.g. ["تقدیر", "جبر و قدر", "دعا اور تقدیر", "مسئلہ قضا و قدر"]).
4. "essenceTerms": Array of 1 to 2 English concepts for The Essence of Islam series (e.g. ["Fate and Divine Decree", "Philosophy of Prayer"]).
5. "generalConcepts": Array of 2 to 3 primary thematic keywords (e.g. ["predestination", "free will", "supplication"]).

Return strictly valid JSON conforming to this schema without code fences or extra text:
{
  "verseRefs": ["string"],
  "hadithTerms": ["string"],
  "khazainUrduTerms": ["string"],
  "essenceTerms": ["string"],
  "generalConcepts": ["string"]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!res.ok) {
      console.warn('[Auto-Sources] Gemini decomposition returned status', res.status);
      return null;
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    return JSON.parse(rawText) as DecomposedQueries;
  } catch (err) {
    console.warn('[Auto-Sources] AI decomposition fallback to rule-based:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawTopic = String(body.topic || '').trim();
    const workType = body.workType || 'speech';
    const occasion = body.occasion || '';

    if (!rawTopic) {
      return NextResponse.json(
        { success: false, error: 'Topic / Central Thesis is required to find sources' },
        { status: 400 }
      );
    }

    // 1. Try AI-powered query decomposition first, then fallback to theological lexicon mapping
    const aiQueries = await decomposeTopicWithAI(rawTopic, workType, occasion);

    // Rule-based concepts extraction
    const dsgtCtx = disambiguateTheologicalContext(rawTopic);
    const topicLower = rawTopic.toLowerCase();
    const topicWords = topicLower.split(/[\s,.;:!?()"-]+/).filter(w => w.length > 2);

    const mappedUrduTerms: string[] = [];
    if (THEOLOGICAL_TOPIC_MAP[topicLower]) {
      mappedUrduTerms.push(...THEOLOGICAL_TOPIC_MAP[topicLower]);
    }
    for (const w of topicWords) {
      if (THEOLOGICAL_TOPIC_MAP[w]) {
        THEOLOGICAL_TOPIC_MAP[w].forEach(t => {
          if (!mappedUrduTerms.includes(t)) mappedUrduTerms.push(t);
        });
      }
    }

    // Unified search terms for the Research tab corpora
    const quranSearchQueries: string[] = [];
    if (aiQueries?.verseRefs?.length) {
      quranSearchQueries.push(...aiQueries.verseRefs);
    }
    quranSearchQueries.push(rawTopic);
    if (dsgtCtx.winningSense?.primaryConcept) {
      quranSearchQueries.push(dsgtCtx.winningSense.primaryConcept);
    }

    const hadithQueries: string[] = [];
    if (aiQueries?.hadithTerms?.length) {
      hadithQueries.push(...aiQueries.hadithTerms);
    }
    hadithQueries.push(rawTopic);
    if (dsgtCtx.winningSense?.primaryConcept) {
      hadithQueries.push(dsgtCtx.winningSense.primaryConcept);
    }

    const khazainTerms: string[] = [];
    if (aiQueries?.khazainUrduTerms?.length) {
      khazainTerms.push(...aiQueries.khazainUrduTerms);
    }
    khazainTerms.push(...mappedUrduTerms);
    if (dsgtCtx.winningSense?.scripturalAnchors?.length) {
      khazainTerms.push(...dsgtCtx.winningSense.scripturalAnchors);
    }
    const normTopic = normalizeKhazainText(rawTopic);
    if (normTopic && !khazainTerms.includes(normTopic)) {
      khazainTerms.push(normTopic);
    }

    const essenceQueries: string[] = [];
    if (aiQueries?.essenceTerms?.length) {
      essenceQueries.push(...aiQueries.essenceTerms);
    }
    essenceQueries.push(rawTopic);
    if (dsgtCtx.winningSense?.primaryConcept) {
      essenceQueries.push(dsgtCtx.winningSense.primaryConcept);
    }

    const discoveredBookmarks: ResearchBookmarkItem[] = [];
    const now = Date.now();

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Query Research Tab Feature: Holy Qur'an Corpus
    // ─────────────────────────────────────────────────────────────────────────
    const matchedVerses: QuranVerseResult[] = [];
    const seenVerseKeys = new Set<string>();

    for (const q of quranSearchQueries) {
      const verses = searchQuranVerses(q);
      for (const v of verses) {
        const key = `${v.surahNumber}:${v.verseNumber}`;
        if (!seenVerseKeys.has(key)) {
          seenVerseKeys.add(key);
          matchedVerses.push(v);
        }
      }
      if (matchedVerses.length >= 6) break;
    }

    // Take top 2 - 4 most relevant Qur'an verses
    const selectedVerses = matchedVerses.slice(0, 4);
    for (const v of selectedVerses) {
      const verseKey = `quran-${v.surahNumber}-${v.verseNumber}`;
      discoveredBookmarks.push({
        id: verseKey,
        category: 'quran',
        title: `Surah ${v.surahNameEnglish} (${v.surahNumber}:${v.verseNumber})`,
        subtitle: `Holy Qur'an — Surah ${v.surahNameArabic}`,
        snippet: v.englishTranslation,
        citationText: `[Holy Qur'an ${v.surahNumber}:${v.verseNumber} - Surah ${v.surahNameEnglish}]\n"${v.arabicText}"\n"${v.englishTranslation}"`,
        url: v.url || `https://www.alislam.org/quran/${v.surahNumber}:${v.verseNumber}`,
        metadata: {
          surahNumber: v.surahNumber,
          verseNumber: v.verseNumber,
          surahNameEnglish: v.surahNameEnglish,
          surahNameArabic: v.surahNameArabic,
          arabicText: v.arabicText,
          englishTranslation: v.englishTranslation,
          urduTranslation: v.urduTranslation
        },
        savedAt: now
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Query Research Tab Feature: Sunnah / Hadith Corpus
    // ─────────────────────────────────────────────────────────────────────────
    const matchedHadith: HadithResult[] = [];
    const seenHadithKeys = new Set<string>();

    for (const hq of hadithQueries) {
      try {
        const hadiths = await searchSunnahHadith(hq);
        for (const h of hadiths) {
          const key = h.id || `${h.book}-${h.hadithNumber}`;
          if (!seenHadithKeys.has(key)) {
            seenHadithKeys.add(key);
            matchedHadith.push(h);
          }
        }
        if (matchedHadith.length >= 4) break;
      } catch (e) {
        console.warn('[Auto-Sources] Hadith search error:', e);
      }
    }

    // Take top 2 - 3 Ahadith
    const selectedHadith = matchedHadith.slice(0, 3);
    for (const h of selectedHadith) {
      const hadithKey = `hadith-${h.id}`;
      const title = `${h.book}${h.hadithNumber ? ` #${h.hadithNumber}` : ''}`;
      const subtitle = h.narrator ? `Narrated by ${h.narrator}` : h.chapter || 'Hadith Collection';
      discoveredBookmarks.push({
        id: hadithKey,
        category: 'ahadith',
        title,
        subtitle,
        snippet: h.englishTranslation,
        citationText: `[${title}${h.narrator ? ` - ${h.narrator}` : ''}]\n"${h.arabicText || ''}"\n"${h.englishTranslation}"`,
        url: h.url || 'https://sunnah.com',
        metadata: {
          book: h.book,
          chapter: h.chapter,
          hadithNumber: h.hadithNumber,
          narrator: h.narrator,
          grade: h.grade,
          arabicText: h.arabicText,
          englishTranslation: h.englishTranslation,
          urduTranslation: h.urduTranslation,
          contextNote: h.contextNote
        },
        savedAt: now
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Query Research Tab Feature: Ruhani Khazain (23 Volumes Full-Text)
    // ─────────────────────────────────────────────────────────────────────────
    const matchedRk: Array<{
      volume: number;
      pageNum: number;
      bookTitle: string;
      bookUrduTitle?: string;
      snippet: string;
      readerUrl: string;
    }> = [];

    const activeKhazainTerms = khazainTerms.filter(t => t.length >= 2);
    if (activeKhazainTerms.length > 0) {
      // Prioritize primary theological treatises in RK (Vols 1, 3, 10, 14, 15, 17, 18, 19, 20, 22, 23)
      const priorityVols = [1, 3, 10, 14, 15, 17, 18, 19, 20, 22, 23, 2, 4, 5, 6, 7, 8, 9, 11, 12, 13, 16, 21];

      for (const volNum of priorityVols) {
        const volData = getCachedVolume(volNum);
        if (!volData) continue;

        for (const page of volData.pages) {
          for (const term of activeKhazainTerms) {
            const pos = page.norm.indexOf(term);
            if (pos !== -1) {
              const rawStart = page.indexMap[pos] ?? pos;
              const rawEnd = rawStart + term.length;
              const snipStart = Math.max(0, rawStart - 100);
              const snipEnd = Math.min(page.text.length, rawEnd + 120);

              const constituentBook = getBookForPage(volNum, page.page_num);
              const slice = page.text.slice(snipStart, snipEnd).replace(/\s+/g, ' ').trim();

              matchedRk.push({
                volume: volNum,
                pageNum: page.page_num,
                bookTitle: constituentBook.title,
                bookUrduTitle: constituentBook.urduTitle,
                snippet: slice,
                readerUrl: `/reader?volume=${volNum}&page=${page.page_num}`
              });
              break;
            }
          }
          if (matchedRk.length >= 3) break;
        }
        if (matchedRk.length >= 3) break;
      }
    }

    // Add top 2 - 3 Ruhani Khazain excerpts
    for (const rk of matchedRk.slice(0, 3)) {
      const rkKey = `rk-${rk.volume}-${rk.pageNum}`;
      discoveredBookmarks.push({
        id: rkKey,
        category: 'khazain',
        title: `Ruhani Khazain Vol. ${rk.volume}, p. ${rk.pageNum} — ${rk.bookTitle}`,
        subtitle: rk.bookUrduTitle ? `روحانی خزائن جلد ${rk.volume}: ${rk.bookUrduTitle}` : `Volume ${rk.volume}`,
        snippet: rk.snippet,
        citationText: `[Ruhani Khazain, Vol. ${rk.volume}, p. ${rk.pageNum} - ${rk.bookTitle}]\n"${rk.snippet}"`,
        url: rk.readerUrl,
        metadata: {
          volume: rk.volume,
          pageNum: rk.pageNum,
          bookTitle: rk.bookTitle,
          bookUrduTitle: rk.bookUrduTitle,
          readerUrl: rk.readerUrl
        },
        savedAt: now
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Query Research Tab Feature: The Essence of Islam (Volumes 1-5)
    // ─────────────────────────────────────────────────────────────────────────
    const matchedEssence: EssenceResult[] = [];
    for (const eq of essenceQueries) {
      const res = searchEssenceFullText(eq, 5);
      for (const e of res) {
        if (!matchedEssence.some(m => m.volume === e.volume && m.pageNum === e.pageNum)) {
          matchedEssence.push(e);
        }
      }
      if (matchedEssence.length >= 3) break;
    }

    for (const e of matchedEssence.slice(0, 2)) {
      const essenceKey = `essence-${e.volume}-${e.pageNum}`;
      discoveredBookmarks.push({
        id: essenceKey,
        category: 'essence',
        title: e.title,
        subtitle: `The Essence of Islam Vol. ${e.volumeRoman}, p. ${e.pageNum}`,
        snippet: e.excerpt,
        citationText: `[The Essence of Islam Vol. ${e.volumeRoman}, p. ${e.pageNum} - "${e.title}"]\n"${e.excerpt}"`,
        url: e.pdfUrl,
        metadata: {
          volume: e.volume,
          volumeRoman: e.volumeRoman,
          pageNum: e.pageNum,
          pdfPage: e.pdfPage,
          title: e.title,
          topic: e.topic,
          sourceTreatise: e.sourceTreatise,
          excerpt: e.excerpt,
          fullText: e.fullText
        },
        savedAt: now
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Query Research Tab Feature: Malfuzat (Volumes 1-10)
    // ─────────────────────────────────────────────────────────────────────────
    const matchedMalfuzat: MalfuzatResult[] = [];
    for (const eq of essenceQueries) {
      const res = searchUnifiedMalfuzat(eq);
      for (const m of res) {
        if (!matchedMalfuzat.some(item => item.volume === m.volume && item.pageNum === m.pageNum)) {
          matchedMalfuzat.push(m);
        }
      }
      if (matchedMalfuzat.length >= 2) break;
    }

    for (const m of matchedMalfuzat.slice(0, 2)) {
      const malfuzatKey = `malfuzat-${m.volume}-${m.pageNum}`;
      discoveredBookmarks.push({
        id: malfuzatKey,
        category: 'malfuzat',
        title: `Malfuzat Vol. ${m.volume}: ${m.title}`,
        subtitle: m.urduTitle || `Malfuzat Vol. ${m.volume}`,
        snippet: m.englishTranslation || m.urduText,
        citationText: `[Malfuzat Vol. ${m.volume}, p. ${m.pageNum} - "${m.title}"]\n"${m.englishTranslation || m.urduText || ''}"`,
        url: m.pdfPage ? `https://www.alislam.org/library/books/Malfuzat-Vol-${m.volume}.pdf#page=${m.pdfPage}` : undefined,
        metadata: {
          volume: m.volume,
          pageNum: m.pageNum,
          pdfPage: m.pdfPage,
          title: m.title,
          urduTitle: m.urduTitle,
          dateStr: m.dateStr,
          englishTranslation: m.englishTranslation,
          urduText: m.urduText
        },
        savedAt: now
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Query Research Tab Feature: Ahmadiyya Literature & Al Islam Articles
    // ─────────────────────────────────────────────────────────────────────────
    const matchedBooks = searchAhmadiyyaBooks(rawTopic);
    for (const b of matchedBooks.slice(0, 1)) {
      discoveredBookmarks.push({
        id: `book-${b.id}`,
        category: 'books',
        title: b.title,
        subtitle: `By ${b.author} (${b.year || 'Ahmadiyya Literature'})`,
        snippet: b.summary,
        citationText: `[${b.title} by ${b.author}]\nSource: ${b.url || 'Al Islam Library'}`,
        url: b.url,
        metadata: {
          title: b.title,
          author: b.author,
          year: b.year,
          summary: b.summary
        },
        savedAt: now
      });
    }

    const matchedArticles = searchAlIslamResources(rawTopic);
    for (const art of matchedArticles.slice(0, 1)) {
      discoveredBookmarks.push({
        id: `alislam-${art.id}`,
        category: 'articles',
        title: art.title,
        subtitle: art.author ? `Al Islam • ${art.author}` : 'Al Islam Article',
        snippet: art.summary,
        citationText: `[Al Islam: "${art.title}"${art.author ? ` by ${art.author}` : ''}]\n"${art.summary}"\nSource: ${art.url}`,
        url: art.url,
        metadata: {
          url: art.url,
          title: art.title,
          source: 'Al Islam',
          author: art.author,
          summary: art.summary
        },
        savedAt: now
      });
    }

    return NextResponse.json({
      success: true,
      topic: rawTopic,
      sources: discoveredBookmarks,
      count: discoveredBookmarks.length,
      message: `Found ${discoveredBookmarks.length} authoritative sources from the Research Tab library.`
    });

  } catch (err: any) {
    console.error('[Auto-Sources API] Unexpected error finding sources:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error searching research tab' },
      { status: 500 }
    );
  }
}
