import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface CommentaryNoteItem {
  ref: string;
  noteHtml: string;
  isImportantWords?: boolean;
}

export interface QuranCommentaryResponse {
  success: boolean;
  surah: number;
  verse: number;
  surahNameEnglish?: string;
  surahNameArabic?: string;
  arabicText?: string;
  englishTranslation?: string;
  urduTranslation?: string;
  conciseSummary?: string;
  fiveVolumeCommentary: CommentaryNoteItem[];
  shortCommentary: CommentaryNoteItem[];
  tafseerSagheer: CommentaryNoteItem[];
  citations: Array<{ title: string; slug: string; language: string }>;
  hadiths: Array<{ title: string; slug: string }>;
  error?: string;
}

function stripHtmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const surahStr = searchParams.get('surah');
  const verseStr = searchParams.get('verse');

  const surah = parseInt(surahStr || '', 10);
  const verse = parseInt(verseStr || '', 10);

  if (isNaN(surah) || isNaN(verse) || surah < 1 || surah > 114 || verse < 1) {
    return NextResponse.json({ success: false, error: 'Invalid surah or verse parameter' }, { status: 400 });
  }

  return fetchCommentary(surah, verse);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const surah = parseInt(body.surah, 10);
    const verse = parseInt(body.verse, 10);

    if (isNaN(surah) || isNaN(verse) || surah < 1 || surah > 114 || verse < 1) {
      return NextResponse.json({ success: false, error: 'Invalid surah or verse parameters' }, { status: 400 });
    }

    return fetchCommentary(surah, verse);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Malformed request body' }, { status: 400 });
  }
}

async function fetchCommentary(surah: number, verse: number) {
  try {
    const url = `https://api.readquran.app/chapter/${surah}:${verse}-${verse}`;
    const payload = { en: true, ur: true, v5: true, sc: true, ts: true };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: `Al Islam ReadQuran API responded with status ${res.status}`
      }, { status: 502 });
    }

    const data = await res.json();
    const verseData = data[String(verse)] || data['0'] || Object.values(data)[0] as any;

    if (!verseData) {
      return NextResponse.json({
        success: false,
        error: `Verse ${surah}:${verse} not found in commentary database`
      }, { status: 404 });
    }

    // 1. Process Five Volume Commentary Notes
    const fiveVolumeCommentary: CommentaryNoteItem[] = [];
    if (Array.isArray(verseData.v5?.notes)) {
      for (const n of verseData.v5.notes) {
        if (!n || !n.note) continue;
        const isImp = n.note.includes('Important Words');
        fiveVolumeCommentary.push({
          ref: String(n.ref || ''),
          noteHtml: n.note,
          isImportantWords: isImp
        });
      }
    }

    // 2. Process Short Commentary Notes
    const shortCommentary: CommentaryNoteItem[] = [];
    if (Array.isArray(verseData.sc?.notes)) {
      for (const n of verseData.sc.notes) {
        if (!n || !n.note) continue;
        shortCommentary.push({
          ref: String(n.ref || ''),
          noteHtml: n.note
        });
      }
    }

    // 3. Process Tafseer-e-Sagheer (Urdu)
    const tafseerSagheer: CommentaryNoteItem[] = [];
    if (Array.isArray(verseData.ts?.notes)) {
      for (const n of verseData.ts.notes) {
        if (!n || !n.note) continue;
        tafseerSagheer.push({
          ref: String(n.ref || ''),
          noteHtml: n.note
        });
      }
    }

    // 4. Extract Citations & Hadiths
    const citations = Array.isArray(verseData.citations) ? verseData.citations : [];
    const hadiths = Array.isArray(verseData.hadiths) ? verseData.hadiths : [];

    // 5. Build concise summary for inline display
    let conciseSummary = '';
    for (const item of fiveVolumeCommentary) {
      const text = stripHtmlToText(item.noteHtml);
      if (text.length > 50 && !/^[0-9:;\s]+$/.test(text)) {
        conciseSummary = text.slice(0, 300) + (text.length > 300 ? '...' : '');
        break;
      }
    }
    if (!conciseSummary && shortCommentary.length > 0) {
      for (const item of shortCommentary) {
        const text = stripHtmlToText(item.noteHtml);
        if (text.length > 40 && !/^[0-9:;\s]+$/.test(text)) {
          conciseSummary = text.slice(0, 300) + (text.length > 300 ? '...' : '');
          break;
        }
      }
    }

    const responseData: QuranCommentaryResponse = {
      success: true,
      surah,
      verse,
      arabicText: verseData.ar?.text || undefined,
      englishTranslation: verseData.en?.text || undefined,
      urduTranslation: verseData.ur?.text || undefined,
      conciseSummary: conciseSummary || undefined,
      fiveVolumeCommentary,
      shortCommentary,
      tafseerSagheer,
      citations,
      hadiths
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error(`[Quran Commentary API] Error fetching ${surah}:${verse}:`, err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to fetch commentary from Al Islam server'
    }, { status: 500 });
  }
}
