// Tazkirah (تذکرہ) Corpus Catalog & Multilingual Search Index
// The Complete Compendium of Dreams, Visions, and Verbal Revelations Vouchsafed to Hazrat Mirza Ghulam Ahmad, The Promised Messiah (as)
import { normalizeKhazainText, THEOLOGICAL_TOPIC_MAP } from './khazain-data';

export interface TazkirahResult {
  id: string;
  year: number; // 1869 to 1908
  dateStr: string; // e.g. "20 February 1886"
  title: string;
  urduTitle: string;
  category: 'Revelation (Ilham)' | 'Dream (Ru\'ya)' | 'Vision (Kashf)' | 'Verbal Inspiration';
  originalText: string;
  language: 'Arabic' | 'Urdu' | 'Persian' | 'English' | 'Multilingual';
  englishTranslation: string;
  historicalContext: string;
  pageUrdu?: number; // Page in Tadhkirah 4th Urdu Edition
  pageEnglish?: number; // Page in Tadhkirah 2019 English Edition
  topics: string[];
  url: string;
}

export const TAZKIRAH_CATALOG: TazkirahResult[] = [
  // ── EARLY REVELATIONS & DIVINE COMMISSION ─────────────────────────────────
  {
    id: "tazkirah-1876-father-demise",
    year: 1876,
    dateStr: "1876",
    title: "Consolation on the Demise of His Father (Alaisallahu Bi Kafin)",
    urduTitle: "والد محترم کی وفات پر تسلی بخش الہام (الیس الله بکاف عبده)",
    category: "Revelation (Ilham)",
    originalText: "أَلَيْسَ اللَّهُ بِكَافٍ عَبْدَهُ",
    language: "Arabic",
    englishTranslation: "Is not Allah sufficient for His servant?",
    historicalContext: "Received at the critical moment of his venerable father's demise when worldly anxieties concerning livelihood surfaced. God Almighty comforted him with this majestic verse from Surah Al-Zumar, engraved soon after on a signet ring.",
    pageUrdu: 21,
    pageEnglish: 34,
    topics: ["alaisallahu", "father demise", "trust in god", "tawakkul", "sufficiency of god", "signet ring", "الیس اللہ بکاف عبدہ", "توکل", "کفایت الہی", "الہام"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },
  {
    id: "tazkirah-1882-divine-commission-mujaddid",
    year: 1882,
    dateStr: "March 1882",
    title: "Divine Commission as the Reformer of the 14th Century (Mujaddid)",
    urduTitle: "بطور مجدد چودھویں صدی ماموریت الہیہ کا الہام",
    category: "Revelation (Ilham)",
    originalText: "يَا أَحْمَدُ بَارَكَ اللَّهُ فِيكَ... قُلْ إِنِّي أُمِرْتُ وَأَنَا أَوَّلُ الْمُؤْمِنِينَ",
    language: "Arabic",
    englishTranslation: "O Ahmad! God has blessed thee... Say: 'I have been commanded by God and I am the first of believers.'",
    historicalContext: "Received in March 1882, marking the momentous divine commission as the Mujaddid (Reformer) of the 14th Islamic Century, recorded later in Barahin-e-Ahmadiyya Part 3.",
    pageUrdu: 44,
    pageEnglish: 71,
    topics: ["divine commission", "mujaddid", "reformer", "barahin", "ya ahmad", "ماموریت", "مجدد", "براہین احمدیہ", "الہام"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },
  {
    id: "tazkirah-1880-dua-acceptance",
    year: 1880,
    dateStr: "1880",
    title: "Divine Promise of Prayer Acceptance (Ujibu Da'wata)",
    urduTitle: "استجابتِ دعا اور قربِ الہی کی بشارت (اجیب دعوة الداع)",
    category: "Revelation (Ilham)",
    originalText: "إِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ... تُرَدُّ إِلَيْكَ رُوحُ الْفَهْمِ",
    language: "Arabic",
    englishTranslation: "I am near; I answer the prayer of the supplicant when he prays to Me... The spirit of understanding will be returned to thee.",
    historicalContext: "Received during periods of intense solitary devotion and worship in Qadian. Recorded in Barahin-e-Ahmadiyya Part 4, demonstrating that Islam is a living faith where God directly answers prayers.",
    pageUrdu: 35,
    pageEnglish: 56,
    topics: ["prayer", "dua", "acceptance of prayer", "supplication", "ujibu dawata", "barahin", "استجابت دعا", "دعا", "قبولیت دعا", "قرب الہی", "الہام"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1886: THE GRAND PROPHECY OF MUSLEH MAUD ───────────────────────────────
  {
    id: "tazkirah-1886-musleh-maud",
    year: 1886,
    dateStr: "20 February 1886",
    title: "The Grand Prophecy of the Promised Reformer (Musleh Maud)",
    urduTitle: "عظیم الشان پیشگوئی مصلح موعود (نشانِ رحمت)",
    category: "Revelation (Ilham)",
    originalText: "بَشَّرَكَ اللَّهُ بِغُلَامٍ زَكِيٍّ... کَانَّ اللّٰہَ نَزَلَ مِنَ السَّمَاءِ... هُوَ نُورُ اللَّهِ",
    language: "Multilingual",
    englishTranslation: "God announces to thee a pure son... He will be extremely intelligent and understanding... as if Allah had descended from heaven... He will be the Light of God.",
    historicalContext: "Vouchsafed after 40 days of secluded spiritual retreat and agonizing prayer at Hoshiarpur. Miraculously fulfilled in the person of Hazrat Mirza Bashir-ud-Din Mahmood Ahmad (ra), Khalifatul Masih II.",
    pageUrdu: 115,
    pageEnglish: 176,
    topics: ["musleh maud", "promised reformer", "hoshiarpur", "pure son", "light of god", "prophecy", "prayer", "dua", "مصلح موعود", "پیشگوئی", "ہوشیار پور", "نشان رحمت", "بشارت", "دعا", "چلہ"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1891: CLAIM OF THE PROMISED MESSIAH & MAHDI ───────────────────────────
  {
    id: "tazkirah-1891-messiah-commission",
    year: 1891,
    dateStr: "1891",
    title: "Divine Proclamation of the Advent of the Promised Messiah",
    urduTitle: "مسیح موعود اور مہدی وقت ہونے کا الہامِ خاص",
    category: "Revelation (Ilham)",
    originalText: "الْمَسِيحُ ابْنُ مَرْيَمَ مَاتَ وَأَنْتَ جِئْتَ فِي وَقْتِهِ عَلَى نَعْتِهِ",
    language: "Arabic",
    englishTranslation: "The Messiah, son of Mary, has died, and thou hast appeared in his spirit and in his character in accordance with the promise.",
    historicalContext: "Published in Fath-e-Islam and Izala-e-Auham in 1891, proclaiming under direct divine command that Prophet Jesus (as) passed away naturally and that Hazrat Ahmad (as) is the Promised Messiah and Mahdi.",
    pageUrdu: 183,
    pageEnglish: 245,
    topics: ["promised messiah", "wafat masih", "mahdi", "death of jesus", "advent", "مسیح موعود", "مہدی", "وفات مسیح", "ماموریت", "الہام"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1893: TRIALS & DEBATES ───────────────────────────────────────────────
  {
    id: "tazkirah-1893-deliverance-trials",
    year: 1893,
    dateStr: "1893",
    title: "Divine Promise of Deliverance and Global Victory",
    urduTitle: "نصرت الہیہ اور عالمگیر غلبہ اسلام کی بشارت",
    category: "Revelation (Ilham)",
    originalText: "إِنِّي مَعَكَ يَا مَسْرُورُ... يَأْتِيكَ نَصْرِي بَغْتَةً",
    language: "Arabic",
    englishTranslation: "I am with thee, O joyful one... My help will come to thee suddenly and unexpectedly.",
    historicalContext: "Received during turbulent periods of intense religious opposition, legal persecution, and debates with Christian and Arya adversaries.",
    pageUrdu: 210,
    pageEnglish: 288,
    topics: ["deliverance", "victory of islam", "divine help", "trials", "نصرت", "غلبہ", "تسلی", "فتح اسلام"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1894: CELESTIAL SIGNS (ECLIPSES) ──────────────────────────────────────
  {
    id: "tazkirah-1894-eclipses-sign",
    year: 1894,
    dateStr: "Ramadan 1311 AH / April 1894",
    title: "Heavenly Corroboration of the Lunar and Solar Eclipses",
    urduTitle: "رمضان المبارک میں چاند اور سورج گرہن کا آسمانی نشان",
    category: "Revelation (Ilham)",
    originalText: "نَمُدُّ لَهُمْ مَدًّا... آيَتَانِ لِمَهْدِينَا",
    language: "Arabic",
    englishTranslation: "We shall grant them respite... For our Mahdi there are two signs which have never appeared since the creation of the heavens and the earth.",
    historicalContext: "Corroborating the miraculous fulfillment of the prophecy of Sunan Darqutni in Ramadan 1894 (Eastern hemisphere) and 1895 (Western hemisphere).",
    pageUrdu: 228,
    pageEnglish: 312,
    topics: ["eclipses", "ramadan", "darqutni", "mahdi sign", "celestial sign", "خسوف و کسوف", "رمضان", "دارقطنی", "مہدی", "آسمانی نشان"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1898: SPREAD OF MESSAGE TO CORNERS OF THE EARTH ──────────────────────
  {
    id: "tazkirah-1898-corners-of-earth",
    year: 1898,
    dateStr: "1898",
    title: "I Shall Convey Thy Message to the Ends of the Earth",
    urduTitle: "میں تیری تبلیغ کو زمین کے کناروں تک پہنچاؤں گا",
    category: "Revelation (Ilham)",
    originalText: "إِنِّي رَافِعُكَ إِلَيَّ... وَإِنِّي جَاعِلُ الَّذِينَ اتَّبَعُوكَ فَوْقَ الَّذِينَ كَفَرُوا إِلَى يَوْمِ الْقِيَامَةِ... میں تیری تبلیغ کو زمین کے کناروں تک پہنچاؤں گا",
    language: "Multilingual",
    englishTranslation: "I shall convey thy message to the ends of the earth... and I shall place those who follow thee above those who disbelieve until the Day of Judgment.",
    historicalContext: "Revealed when the Promised Messiah (as) was living in the remote, unknown village of Qadian without postal rail or printing facilities, miraculously fulfilled today worldwide through MTA and global missions.",
    pageUrdu: 295,
    pageEnglish: 410,
    topics: ["ends of earth", "tabligh", "propagation", "mta", "global mission", "زمین کے کناروں تک", "تبلیغ", "اشاعت اسلام", "نشان اعظم"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1902: REVELATIONS ON THE PLAGUE ───────────────────────────────────────
  {
    id: "tazkirah-1902-plague-sanctuary",
    year: 1902,
    dateStr: "1902",
    title: "Sanctuary from the Bubonic Plague (Inni Uhافظ Kullam Man)",
    urduTitle: "طاعون سے حفاظت کا الہام (انی احافظ کل من فی الدار)",
    category: "Revelation (Ilham)",
    originalText: "إِنِّي أُحَافِظُ كُلَّ مَنْ فِي الدَّارِ... إِلَّا مَنْ طَغَى وَاسْتَكْبَرَ",
    language: "Arabic",
    englishTranslation: "I shall safeguard all those who are within the four walls of this house, except those who act arrogantly and rebelliously.",
    historicalContext: "Revealed during the raging devastating epidemic of the Indian bubonic plague. Recorded in Kashti-e-Nuh (Noah's Ark) as a divine sign of preservation.",
    pageUrdu: 380,
    pageEnglish: 512,
    topics: ["plague", "taun", "kashti-e-nuh", "protection", "sanctuary", "طاعون", "کشتی نوح", "حفاظت", "احافظ کل من فی الدار"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1905: THE WILL & KHILAFAT ─────────────────────────────────────────────
  {
    id: "tazkirah-1905-al-wasiyyat-khilafat",
    year: 1905,
    dateStr: "November 1905",
    title: "Intimation of Approaching Demise and Advent of Khilafat",
    urduTitle: "قرب وفات اور قدرت ثانیہ (خلافت) کی بشارت کا الہام",
    category: "Revelation (Ilham)",
    originalText: "قَرُبَ أَجَلُكَ الْمُقَدَّرُ... وَلَا نُبْقِي لَكَ شَيْئًا تَرْغَبُ فِيهِ... قدرت ثانیہ کا ظاہر ہونا ضروری ہے",
    language: "Multilingual",
    englishTranslation: "The appointed time of thy demise has drawn close... And We shall leave behind no remembrance of which thou wouldst feel sorrow... It is necessary that the Second Manifestation (Khilafat) should be revealed unto you.",
    historicalContext: "Received in late 1905, leading directly to the publication of the momentous book Al-Wasiyyat (The Will), laying the eternal spiritual foundation of Khilafat-e-Ahmadiyya.",
    pageUrdu: 472,
    pageEnglish: 648,
    topics: ["al-wasiyyat", "khilafat", "second manifestation", "qudrat-e-saniyya", "the will", "الوصیت", "خلافت", "قدرت ثانیہ", "قرب وفات"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1905: THE 1905 EARTHQUAKE PROPHECY ─────────────────────────────────────
  {
    id: "tazkirah-1905-earthquake-sign",
    year: 1905,
    dateStr: "Spring 1905",
    title: "Prophecy of the Mighty Cataclysmic Earthquake (Kangra)",
    urduTitle: "زلزلے کا عظیم الشان نشان اور آسمانی انتباہ",
    category: "Revelation (Ilham)",
    originalText: "جَاءَ وَقْتُ الصَّلَاةِ... زَلْزَلَةُ السَّاعَةِ... پھر بہار آئی خدا کی بات پھر پوری ہوئی",
    language: "Multilingual",
    englishTranslation: "The time of prayer has arrived... The earthquake of the ultimate hour... Once again the spring has arrived, and once again God's decree has been fulfilled.",
    historicalContext: "Foretold in precise detail before the cataclysmic Kangra earthquake of 4 April 1905, shaking the Himalayas and providing unmistakable empirical proof of divine inspiration.",
    pageUrdu: 450,
    pageEnglish: 618,
    topics: ["earthquake", "kangra", "zalzala", "prophecy", "cataclysm", "زلزلہ", "نشان", "پیشگوئی", "کانگڑہ"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1906: I LOVE YOU (ENGLISH REVELATION) ──────────────────────────────────
  {
    id: "tazkirah-1906-i-love-you",
    year: 1906,
    dateStr: "1906",
    title: "Affectionate Revelations in English: 'I Love You'",
    urduTitle: "انگریزی الہام: I love you اور تسلی بخش بشارات",
    category: "Verbal Inspiration",
    originalText: "I love you... I am with you... I shall help you.",
    language: "English",
    englishTranslation: "I love you. I am with you. I shall help you. Life of pain.",
    historicalContext: "The Promised Messiah (as) was unfamiliar with the English language, yet received clear, articulate divine phrases in English, serving as a remarkable sign of divine origin.",
    pageUrdu: 512,
    pageEnglish: 704,
    topics: ["english revelation", "i love you", "divine affection", "miracle", "انگریزی الہام", "محبت الہی", "معجزہ"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1908: FINAL DIVINE REVELATIONS ────────────────────────────────────────
  {
    id: "tazkirah-1908-final-revelations",
    year: 1908,
    dateStr: "May 1908",
    title: "Final Revelations: The Appointed Call (Al-Rahil)",
    urduTitle: "آخری الہامات: سفرِ آخرت اور لقائے الہی کی پکار (الرحيل)",
    category: "Revelation (Ilham)",
    originalText: "الرَّحِيلُ ثُمَّ الرَّحِيلُ... وَالْمَوْتُ أَقْرَبُ... لَا إِلَهَ إِلَّا اللَّهُ",
    language: "Arabic",
    englishTranslation: "Departure, then departure... And death is close at hand... There is none worthy of worship except Allah.",
    historicalContext: "Received in Lahore in late May 1908 just days prior to his peaceful demise on 26 May 1908, returning to his Lord in full spiritual radiance and triumph.",
    pageUrdu: 590,
    pageEnglish: 802,
    topics: ["final revelation", "departure", "al-rahil", "demise", "meeting with god", "الرحیل", "وفات", "لقائے الہی", "آخری الہام"],
    url: "https://www.alislam.org/book/tadhkirah/"
  }
];

/**
 * Searches the Tazkirah Catalog across English, Arabic, and Urdu terms.
 */
export function searchTazkirah(query: string): TazkirahResult[] {
  if (!query || !query.trim()) return [];

  const rawClean = query.trim().toLowerCase();
  const normUrduQuery = normalizeKhazainText(query);
  const queryTokens = rawClean.split(/\s+/).filter(t => t.length >= 2);

  // Check year specific queries (e.g. "1886", "1894", "1905")
  const yearMatch = query.match(/\b(18[6-9][0-9]|190[0-8])\b/);
  const targetYear = yearMatch ? parseInt(yearMatch[1], 10) : null;

  // Resolve topic expansions
  const expandedTerms = new Set<string>();
  expandedTerms.add(rawClean);
  queryTokens.forEach(t => expandedTerms.add(t));

  for (const token of queryTokens) {
    if (THEOLOGICAL_TOPIC_MAP[token]) {
      THEOLOGICAL_TOPIC_MAP[token].forEach(term => {
        expandedTerms.add(term.toLowerCase());
        expandedTerms.add(normalizeKhazainText(term));
      });
    }
  }

  const resultsWithScore = TAZKIRAH_CATALOG.map((entry) => {
    let score = 0;

    // Direct year match bonus
    if (targetYear && entry.year === targetYear) {
      score += 40;
    }

    const normOriginal = normalizeKhazainText(entry.originalText);
    const normUrduTitle = normalizeKhazainText(entry.urduTitle);
    const titleLower = entry.title.toLowerCase();
    const translationLower = entry.englishTranslation.toLowerCase();
    const contextLower = entry.historicalContext.toLowerCase();
    const categoryLower = entry.category.toLowerCase();

    // 1. Direct raw query phrase match
    if (titleLower.includes(rawClean)) score += 30;
    if (translationLower.includes(rawClean)) score += 25;
    if (contextLower.includes(rawClean)) score += 15;
    if (categoryLower.includes(rawClean)) score += 10;

    // 2. Normalized Arabic/Urdu matching
    if (normUrduQuery && normUrduQuery.length >= 2) {
      if (normUrduTitle.includes(normUrduQuery)) score += 35;
      if (normOriginal.includes(normUrduQuery)) score += 30;
    }

    // 3. Token level matching
    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 10;
      if (translationLower.includes(token)) score += 8;
      if (contextLower.includes(token)) score += 6;
      if (entry.topics.some(t => t.toLowerCase() === token)) score += 12;
    }

    // 4. Topic expansion matching
    for (const term of Array.from(expandedTerms)) {
      if (term.length < 2) continue;
      if (entry.topics.some(t => t.toLowerCase().includes(term))) {
        score += 15;
      }
      if (normOriginal.includes(term)) {
        score += 15;
      }
    }

    return { entry, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.entry);

  return resultsWithScore;
}
