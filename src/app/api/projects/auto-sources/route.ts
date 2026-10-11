import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { executeResearchSearch } from '@/lib/research-search-engine';
import {
  MultiSourceSearchResult,
  QuranVerseResult,
  HadithResult,
  RuhaniKhazainSearchResult,
  BookItem,
  AlIslamArticleResult,
  PublicationResult
} from '@/lib/research-sources';
import { EssenceResult } from '@/lib/essence-data';
import { MalfuzatResult } from '@/lib/malfuzat-data';
import { TazkirahResult } from '@/lib/tazkirah-data';
import { THEOLOGICAL_TOPIC_MAP } from '@/lib/khazain-data';
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

// ── Query Decomposition via AI (acts as intelligent indexer for Research Tab) ──
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

Decompose this topic into targeted search queries to execute directly through the Murabbi Desk Research Tab search engine:
1. "verseRefs": Array of 2 to 4 precise Holy Qur'an chapter and verse references (e.g. ["2:186", "54:50", "25:3"]).
2. "hadithTerms": Array of 2 to 3 search phrases in English or Arabic for Sunnah/Hadith collections (e.g. ["bukhari divine decree", "supplication changes fate", "tirmidhi dua"]).
3. "khazainUrduTerms": Array of 2 to 4 Urdu terms or treatise concepts from Hazrat Masih-e-Maud (as) in Ruhani Khazain (e.g. ["تقدیر", "جبر و قدر", "دعا اور تقدیر", "مسئلہ قضا و قدر"]).
4. "essenceTerms": Array of 1 to 2 English concepts for The Essence of Islam series (e.g. ["Fate and Divine Decree", "Philosophy of Prayer"]).
5. "generalConcepts": Array of 2 to 3 primary thematic keywords (e.g. ["predestination", "free will", "supplication"]).

Return strictly valid JSON without markdown wrapping or code blocks:
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
      console.warn('[Auto-Sources] Gemini query decomposition returned status', res.status);
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

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 1: Query Formulation for Research Tab Search Engine
    // ─────────────────────────────────────────────────────────────────────────
    const aiQueries = await decomposeTopicWithAI(rawTopic, workType, occasion);
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

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 2: Execute Search through Shared Research Tab Engine Core
    // All research queries flow directly through executeResearchSearch!
    // As the Research Tab evolves (new corpora, better HITS, triangulation,
    // Rocchio expansion, new volumes), Auto-Sources automatically inherits every update!
    // ─────────────────────────────────────────────────────────────────────────
    const searchPromises: Promise<MultiSourceSearchResult>[] = [
      executeResearchSearch({ query: rawTopic, searchMode: 'contextual' })
    ];

    // Additional targeted queries formulated from topic analysis
    const extraQueriesToRun: string[] = [];
    if (aiQueries?.verseRefs && aiQueries.verseRefs.length > 0) {
      extraQueriesToRun.push(aiQueries.verseRefs[0]);
    }
    if (aiQueries?.khazainUrduTerms && aiQueries.khazainUrduTerms.length > 0) {
      extraQueriesToRun.push(aiQueries.khazainUrduTerms[0]);
    } else if (mappedUrduTerms.length > 0) {
      extraQueriesToRun.push(mappedUrduTerms[0]);
    }
    if (aiQueries?.hadithTerms && aiQueries.hadithTerms.length > 0) {
      extraQueriesToRun.push(aiQueries.hadithTerms[0]);
    }

    // Limit extra queries to top 2 to preserve speed
    for (const eq of extraQueriesToRun.slice(0, 2)) {
      if (eq.toLowerCase() !== rawTopic.toLowerCase()) {
        searchPromises.push(executeResearchSearch({ query: eq, searchMode: 'contextual' }));
      }
    }

    const searchResultsList = await Promise.all(searchPromises);
    const primaryResult = searchResultsList[0];

    // Combine all results from Research Tab engine executions
    const allQuranVerses: QuranVerseResult[] = [];
    const allAhadith: HadithResult[] = [];
    const allRuhaniKhazain: RuhaniKhazainSearchResult[] = [];
    const allBooks: BookItem[] = [];
    const allMalfuzat: MalfuzatResult[] = [];
    const allTazkirah: TazkirahResult[] = [];
    const allEssence: EssenceResult[] = [];
    const allAlIslamArticles: AlIslamArticleResult[] = [];
    const allPublications: PublicationResult[] = [];

    const seenQuran = new Set<string>();
    const seenHadith = new Set<string>();
    const seenRk = new Set<string>();
    const seenBook = new Set<string>();
    const seenMalfuzat = new Set<string>();
    const seenTazkirah = new Set<string>();
    const seenEssence = new Set<string>();
    const seenArticle = new Set<string>();

    for (const res of searchResultsList) {
      // Holy Quran
      res.quranVerses.forEach(v => {
        const k = `${v.surahNumber}:${v.verseNumber}`;
        if (!seenQuran.has(k)) {
          seenQuran.add(k);
          allQuranVerses.push(v);
        }
      });
      // Ahadith
      res.ahadith.forEach(h => {
        const k = h.id || `${h.book}-${h.hadithNumber}`;
        if (!seenHadith.has(k)) {
          seenHadith.add(k);
          allAhadith.push(h);
        }
      });
      // Ruhani Khazain
      res.ruhaniKhazain.forEach(rk => {
        const k = `${rk.volume}-${rk.pageNum}`;
        if (!seenRk.has(k)) {
          seenRk.add(k);
          allRuhaniKhazain.push(rk);
        }
      });
      // Books
      res.books.forEach(b => {
        const k = b.id || b.title;
        if (!seenBook.has(k)) {
          seenBook.add(k);
          allBooks.push(b);
        }
      });
      // Malfuzat
      res.malfuzat.forEach(m => {
        const k = `${m.volume}-${m.pageNum}`;
        if (!seenMalfuzat.has(k)) {
          seenMalfuzat.add(k);
          allMalfuzat.push(m);
        }
      });
      // Tazkirah
      res.tazkirah.forEach(t => {
        const k = t.id || `${t.pageEnglish || t.pageUrdu || ''}-${t.dateStr}`;
        if (!seenTazkirah.has(k)) {
          seenTazkirah.add(k);
          allTazkirah.push(t);
        }
      });
      // The Essence of Islam
      res.essenceOfIslam.forEach(e => {
        const k = `${e.volume}-${e.pageNum}`;
        if (!seenEssence.has(k)) {
          seenEssence.add(k);
          allEssence.push(e);
        }
      });
      // Articles & Periodicals
      res.alislamArticles.forEach(a => {
        if (!seenArticle.has(a.id)) {
          seenArticle.add(a.id);
          allAlIslamArticles.push(a);
        }
      });
      res.publications.forEach(p => {
        if (!seenArticle.has(p.id)) {
          seenArticle.add(p.id);
          allPublications.push(p);
        }
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Phase 3: Research Tab Triangulation & Authority Scoring
    // Use the Research Tab's Consensus Triangulation Matrix & HITS authority
    // scores to prioritize sources with highest theological convergence!
    // ─────────────────────────────────────────────────────────────────────────
    const consensusMatrix = primaryResult.consensusMatrix;
    const hitsRankings = primaryResult.hitsRankings || {};

    const corroboratedCitations = new Set<string>();
    if (consensusMatrix?.evidencePoints) {
      consensusMatrix.evidencePoints.forEach(ep => {
        if (ep.citation) corroboratedCitations.add(ep.citation.toLowerCase());
      });
    }

    const now = Date.now();
    const discoveredBookmarks: ResearchBookmarkItem[] = [];

    // 1. Select Holy Qur'an Verses (top 2 - 4)
    allQuranVerses.sort((a, b) => {
      const aRef = `${a.surahNumber}:${a.verseNumber}`;
      const bRef = `${b.surahNumber}:${b.verseNumber}`;
      const aCorrob = corroboratedCitations.has(aRef) ? 100 : 0;
      const bCorrob = corroboratedCitations.has(bRef) ? 100 : 0;
      return (bCorrob + (b.relevanceScore || 0)) - (aCorrob + (a.relevanceScore || 0));
    });

    for (const v of allQuranVerses.slice(0, 4)) {
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
          urduTranslation: v.urduTranslation,
          consensusCorroborated: corroboratedCitations.has(`${v.surahNumber}:${v.verseNumber}`)
        },
        savedAt: now
      });
    }

    // 2. Select Hadith traditions (top 2 - 3)
    for (const h of allAhadith.slice(0, 3)) {
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

    // 3. Select Ruhani Khazain excerpts (top 2 - 3, ranked by HITS authority score)
    allRuhaniKhazain.sort((a, b) => {
      const aAuth = (hitsRankings[`volume_${a.volume}`] || 0) + (hitsRankings[a.bookTitle] || 0);
      const bAuth = (hitsRankings[`volume_${b.volume}`] || 0) + (hitsRankings[b.bookTitle] || 0);
      return bAuth - aAuth;
    });

    for (const rk of allRuhaniKhazain.slice(0, 3)) {
      const rkKey = `rk-${rk.volume}-${rk.pageNum}`;
      const snippet = `${rk.snippetBefore} [${rk.matchedSlice}] ${rk.snippetAfter}`.replace(/\s+/g, ' ').trim();
      discoveredBookmarks.push({
        id: rkKey,
        category: 'khazain',
        title: `Ruhani Khazain Vol. ${rk.volume}, p. ${rk.pageNum} — ${rk.bookTitle}`,
        subtitle: rk.bookUrduTitle ? `روحانی خزائن جلد ${rk.volume}: ${rk.bookUrduTitle}` : `Volume ${rk.volume}`,
        snippet,
        citationText: `[Ruhani Khazain, Vol. ${rk.volume}, p. ${rk.pageNum} - ${rk.bookTitle}]\n"${snippet}"`,
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

    // 4. Select The Essence of Islam (top 1 - 2)
    for (const e of allEssence.slice(0, 2)) {
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

    // 5. Select Malfuzat (top 1 - 2)
    for (const m of allMalfuzat.slice(0, 2)) {
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

    // 6. Select Canonical Ahmadiyya Books (top 1)
    for (const b of allBooks.slice(0, 1)) {
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

    // 7. Select Al Islam Articles / Periodicals (top 1)
    const topArticle = allAlIslamArticles[0] || allPublications[0];
    if (topArticle) {
      discoveredBookmarks.push({
        id: `article-${topArticle.id}`,
        category: 'articles',
        title: topArticle.title,
        subtitle: (topArticle as any).source ? `${(topArticle as any).source} • ${topArticle.author || ''}` : `Al Islam • ${topArticle.author || ''}`,
        snippet: topArticle.summary,
        citationText: `["${topArticle.title}"${topArticle.author ? ` by ${topArticle.author}` : ''}]\n"${topArticle.summary}"\nSource: ${topArticle.url}`,
        url: topArticle.url,
        metadata: {
          url: topArticle.url,
          title: topArticle.title,
          author: topArticle.author,
          summary: topArticle.summary
        },
        savedAt: now
      });
    }

    return NextResponse.json({
      success: true,
      topic: rawTopic,
      sources: discoveredBookmarks,
      count: discoveredBookmarks.length,
      consensus: consensusMatrix ? {
        confidenceScore: consensusMatrix.confidenceScore,
        consensusLevel: consensusMatrix.consensusLevel,
        corroboratedLayersCount: consensusMatrix.corroboratedLayersCount
      } : null,
      message: `Found ${discoveredBookmarks.length} authentic sources triangulated directly through the Research Tab search engine.`
    });

  } catch (err: any) {
    console.error('[Auto-Sources API] Unexpected error finding sources via Research Tab:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error querying research tab search engine' },
      { status: 500 }
    );
  }
}
