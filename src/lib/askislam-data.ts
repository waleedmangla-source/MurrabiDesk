// Ask Islam (askislam.org) Audio Index & Search Engine
import catalog from './askislam-catalog.json';
import { AudioResult } from './research-sources';
import { THEOLOGICAL_TOPIC_MAP } from './khazain-data';

interface AskIslamCatalogItem {
  id: string;
  title: string;
  category: string;
  url: string;
  audioUrl?: string;
  speaker?: string;
}

const ASK_ISLAM_CATALOG: AskIslamCatalogItem[] = catalog as AskIslamCatalogItem[];

// Thematic semantic mapping for Ask Islam English categories & topics
const CONCEPT_SYNONYM_MAP: Record<string, string[]> = {
  marriage: ['marriage', 'nikah', 'wedding', 'spouse', 'wife', 'husband', 'divorce', 'talaq', 'khula', 'dowry', 'mehr', 'walima', 'نکاح', 'شادی', 'ازدواج', 'طلاق'],
  prayer: ['prayer', 'salat', 'namaz', 'sujud', 'supplication', 'dua', 'wudu', 'tahajjud', 'نماز', 'دعا', 'سجدہ'],
  fasting: ['fasting', 'fast', 'ramadan', 'ramzan', 'roza', 'sawm', 'sehri', 'iftar', 'روزہ', 'رمضان', 'صوم'],
  jesus: ['jesus', 'isa', 'christ', 'crucifixion', 'cross', 'kashmir', 'roza bal', 'death of jesus', 'وفات مسیح', 'عیسیٰ', 'صلیب'],
  prophethood: ['prophet', 'prophethood', 'khatam', 'nabuwwat', 'seal of prophets', 'revelation', 'wahi', 'messiah', 'mahdi', 'ختم نبوت', 'نبوت', 'مہدی'],
  god: ['god', 'allah', 'creator', 'existence of god', 'tawheed', 'unity', 'attributes', 'خدا', 'اللہ', 'توحید', 'وجود باری تعالیٰ'],
  women: ['women', 'woman', 'purdah', 'hijab', 'veil', 'modesty', 'polygamy', 'rights of women', 'پردہ', 'حجاب', 'عورت'],
  jihad: ['jihad', 'war', 'peace', 'violence', 'holy war', 'defensive', 'jihad of the pen', 'جہاد', 'امن', 'جہاد بالقلم'],
  quran: ['quran', 'koran', 'holy quran', 'scripture', 'revelation', 'surah', 'verse', 'قرآن', 'قرآن مجید'],
  hadith: ['hadith', 'sunnah', 'tradition', 'saying', 'حديث', 'سنت'],
  khilafat: ['khilafat', 'caliph', 'caliphate', 'successor', 'guidance', 'خلافت', 'خلیفہ'],
  soul: ['soul', 'spirit', 'afterlife', 'death', 'heaven', 'hell', 'resurrection', 'روح', 'جنت', 'جہنم', 'قیامت'],
  science: ['science', 'evolution', 'universe', 'creation', 'big bang', 'earth', 'سائنس', 'ارتقاء']
};

/**
 * Searches the 528 Ask Islam Q&A audio recordings
 */
export function searchAskIslamAudios(query: string, limit = 50): AudioResult[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const rawWords = clean.split(/\s+/).filter(w => w.length >= 2);
  const searchTokens: string[] = [clean, ...rawWords];

  // Expand with theological topic map
  for (const [topicKey, urduList] of Object.entries(THEOLOGICAL_TOPIC_MAP)) {
    if (clean.includes(topicKey) || topicKey.includes(clean)) {
      searchTokens.push(topicKey, ...urduList);
    }
    for (const u of urduList) {
      if (clean.includes(u) || u.includes(clean)) {
        searchTokens.push(topicKey, ...urduList);
        break;
      }
    }
  }

  // Expand with concept synonym map
  for (const [conceptKey, synList] of Object.entries(CONCEPT_SYNONYM_MAP)) {
    if (synList.some(s => clean.includes(s) || s.includes(clean))) {
      searchTokens.push(conceptKey, ...synList);
    }
  }

  const uniqueTokens = Array.from(new Set(searchTokens.map(t => t.toLowerCase())));

  const scored: Array<{ item: AskIslamCatalogItem; score: number }> = [];

  for (const item of ASK_ISLAM_CATALOG) {
    if (!item.audioUrl) continue;

    const titleLower = item.title.toLowerCase();
    const catLower = item.category.toLowerCase();
    let score = 0;

    // Exact full query match
    if (titleLower.includes(clean)) {
      score += 100;
    }

    // Token scoring
    for (const token of uniqueTokens) {
      if (!token) continue;
      if (titleLower.includes(token)) {
        score += token.length >= 4 ? 20 : 10;
        // Exact word boundary bonus
        const regex = new RegExp(`\\b${token}\\b`, 'i');
        if (regex.test(titleLower)) score += 15;
      }
      if (catLower.includes(token)) {
        score += 8;
      }
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ item }) => ({
    id: `askislam-${item.id}`,
    source: 'Ask Islam',
    title: item.title,
    speaker: item.speaker || 'Hazrat Mirza Tahir Ahmad (rh)',
    category: item.category,
    url: item.url,
    audioUrl: item.audioUrl || `https://askislam.org/${item.id}`,
    topics: [item.category]
  }));
}
