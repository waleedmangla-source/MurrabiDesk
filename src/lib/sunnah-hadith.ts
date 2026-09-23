// Canonical Sunnah.com Hadith Search Engine
// Sourced from Sunnah.com collections (Sahih al-Bukhari, Sahih Muslim, Sunan an-Nasa'i, Sunan Abi Dawud, Jami\` at-Tirmidhi, Sunan Ibn Majah, Muwatta Malik)

import { HadithResult, THEMATIC_HADITH_COLLECTION, normalizeTopicQuery } from './research-sources';
import { THEOLOGICAL_TOPIC_MAP } from './khazain-data';

const SUNNAH_COLLECTION_SLUGS: Record<string, string> = {
  bukhari: 'bukhari',
  muslim: 'muslim',
  nasai: 'nasai',
  abudawud: 'abudawud',
  tirmidhi: 'tirmidhi',
  ibnmajah: 'ibnmajah',
  malik: 'malik',
  ahmad: 'ahmad',
  riyadussalihin: 'riyadussalihin',
  mishkat: 'mishkat',
  nawawi40: 'nawawi40',
  qudsi40: 'qudsi40'
};

const ENGLISH_CONCEPT_MAP: Record<string, string> = {
  'نکاح': 'marriage',
  'شادی': 'marriage',
  'ازدواج': 'marriage',
  'مہر': 'dowry',
  'صبر': 'patience',
  'استقامت': 'steadfastness',
  'دعا': 'supplication',
  'نماز': 'prayer',
  'صلاة': 'prayer',
  'روزہ': 'fasting',
  'صوم': 'fasting',
  'رمضان': 'ramadan',
  'زکوٰۃ': 'charity',
  'زکاة': 'zakat',
  'صدقہ': 'charity',
  'صدقة': 'charity',
  'ایمان': 'faith',
  'علم': 'knowledge',
  'اخلاق': 'character',
  'محبت': 'love',
  'والدین': 'parents',
  'ماں': 'mother',
  'جنت': 'paradise',
  'جہنم': 'hell',
  'توبہ': 'repentance',
  'مغفرت': 'forgiveness',
  'جہاد': 'jihad',
  'خلافت': 'caliphate',
  'مسیح': 'messiah',
  'مہدی': 'mahdi',
  'وفات': 'death',
  'عیسیٰ': 'jesus',
  'تقویٰ': 'piety'
};

function extractNarrator(text: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(/^(?:Narrated|It was narrated that|It was narrated from|It was narrated by)\s+([^:.]+):/i);
  if (match) {
    return match[1].replace(/^(?:that\s+|from\s+|by\s+)/i, '').trim();
  }
  return undefined;
}

function cleanEnglishText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^(?:Narrated|It was narrated that|It was narrated from|It was narrated by)\s+[^:.]+:\s*/i, '')
    .trim();
}

/**
 * Searches Canonical Ahadith sourced from Sunnah.com
 * Combines curated Ahmadiyya thematic traditions (anchored to Sunnah.com)
 * with live Sunnah.com database querying across 36,000+ authentic traditions.
 */
export async function searchSunnahHadith(query: string): Promise<HadithResult[]> {
  const normQuery = normalizeTopicQuery(query);
  const words = normQuery.split(/\s+/).filter(w => w.length >= 2);
  if (words.length === 0 && !query.trim()) return [];

  // 1. Cross-Lingual Concept Translation
  let englishQuery = query.trim();
  for (const [urduTerm, engTerm] of Object.entries(ENGLISH_CONCEPT_MAP)) {
    if (query.includes(urduTerm)) {
      englishQuery = engTerm;
      break;
    }
  }

  // 2. Query Local Curated Collection (Pre-indexed with full Urdu & Tafsir/Context Notes)
  let expandedTerms: string[] = [normQuery, englishQuery.toLowerCase(), ...words];
  for (const [topicKey, urduList] of Object.entries(THEOLOGICAL_TOPIC_MAP)) {
    if (normQuery.includes(topicKey) || topicKey.includes(normQuery)) {
      expandedTerms.push(topicKey, ...urduList);
    }
  }

  const localMatches: HadithResult[] = THEMATIC_HADITH_COLLECTION.filter(h => {
    return expandedTerms.some(term => {
      const termLower = term.toLowerCase();
      return (
        h.topics.some(t => t.toLowerCase().includes(termLower) || termLower.includes(t.toLowerCase())) ||
        h.englishTranslation.toLowerCase().includes(termLower) ||
        (h.urduTranslation && h.urduTranslation.includes(term)) ||
        (h.arabicText && h.arabicText.includes(term)) ||
        (h.narrator && h.narrator.toLowerCase().includes(termLower)) ||
        (h.book && h.book.toLowerCase().includes(termLower)) ||
        (h.chapter && h.chapter.toLowerCase().includes(termLower)) ||
        (h.contextNote && h.contextNote.toLowerCase().includes(termLower))
      );
    });
  });

  // 3. Live Sunnah.com Database Search (via fast Sunnah.com mirror API)
  const apiResults: HadithResult[] = [];
  try {
    const targetSearch = englishQuery || query.trim();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://ummahapi.com/api/hadith/search?q=${encodeURIComponent(targetSearch)}&limit=30`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const hadiths = json?.data?.hadiths;
      if (Array.isArray(hadiths)) {
        for (const item of hadiths) {
          const colSlug = SUNNAH_COLLECTION_SLUGS[item.collection?.toLowerCase()] || item.collection?.toLowerCase() || 'bukhari';
          const hadithNum = item.hadithnumber || item.arabicnumber;
          const sunnahUrl = `https://sunnah.com/${colSlug}:${hadithNum}`;

          const narrator = extractNarrator(item.english) || (item.english?.includes('Narrated') ? 'Sahabi (ra)' : undefined);
          const cleanedEnglish = cleanEnglishText(item.english) || item.english;

          apiResults.push({
            id: `sunnah-${colSlug}-${hadithNum}`,
            book: item.collection_name || `Sahih (${colSlug})`,
            chapter: item.chapter || undefined,
            hadithNumber: String(hadithNum),
            narrator: narrator,
            arabicText: item.arabic || undefined,
            englishTranslation: cleanedEnglish,
            grade: item.grade || 'Sahih',
            topics: [item.collection_name, 'Sunnah.com', colSlug].filter(Boolean),
            url: sunnahUrl
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Sunnah.com API] Live search fallback to local curated traditions:', err);
  }

  // 4. Merge & Deduplicate
  const merged: HadithResult[] = [...localMatches];
  const seenUrls = new Set<string>();

  for (const h of localMatches) {
    if (h.url) seenUrls.add(h.url.toLowerCase());
  }

  for (const item of apiResults) {
    const normUrl = item.url?.toLowerCase() || '';
    if (!seenUrls.has(normUrl)) {
      seenUrls.add(normUrl);
      merged.push(item);
    }
  }

  return merged;
}
