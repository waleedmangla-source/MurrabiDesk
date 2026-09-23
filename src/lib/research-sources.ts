// Ahmadiyya Multi-Source Theological Knowledge Base & Search Index
import { normalizeKhazainText, THEOLOGICAL_TOPIC_MAP } from './khazain-data';
import {
  QURAN_CORPUS,
  searchQuranVerses,
  expandQuranQuery,
  normalizeArabicForSearch,
  normalizeUrduForSearch
} from './quran-corpus';

export { searchQuranVerses, expandQuranQuery, normalizeArabicForSearch, normalizeUrduForSearch };

export interface QuranVerseResult {
  surahNumber: number;
  verseNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  arabicText: string;
  englishTranslation: string;
  urduTranslation: string;
  commentaryNote?: string;
  topics: string[];
  url: string;
  relevanceScore?: number;
}

export interface AlIslamArticleResult {
  id: string;
  title: string;
  author?: string;
  category: 'Article' | 'Book' | 'Friday Sermon' | 'Q&A' | 'Topic Portal' | 'Video';
  summary: string;
  url: string;
  date?: string;
  topics: string[];
}

export interface PublicationResult {
  id: string;
  source: 'Review of Religions' | 'Al Hakam' | 'Al Fazl' | 'MTA';
  title: string;
  author?: string;
  summary: string;
  url: string;
  date?: string;
  topics: string[];
}

export interface HadithResult {
  id: string;
  book: string;
  chapter?: string;
  hadithNumber?: string;
  narrator?: string;
  arabicText?: string;
  englishTranslation: string;
  urduTranslation?: string;
  contextNote?: string;
  grade?: string;
  topics: string[];
  url?: string;
}

export interface RuhaniKhazainSearchResult {
  volume: number;
  pageNum: number;
  bookTitle: string;
  bookUrduTitle: string;
  snippetBefore: string;
  matchedSlice: string;
  snippetAfter: string;
  matchedTerm: string;
  isExactPhrase: boolean;
  readerUrl: string;
}

export interface AudioResult {
  id: string;
  source: 'Ask Islam';
  title: string;
  speaker: string;
  category: string;
  url: string;
  audioUrl: string;
  duration?: string;
  topics?: string[];
}

export interface VideoResult {
  id: string;
  source: 'YouTube' | 'MTA.tv';
  title: string;
  channel: string;
  duration?: string;
  published?: string;
  url: string;
  thumbnail: string;
  transcriptSnippet?: string;
  transcriptTimestampSec?: number;
  description?: string;
}

export type MediaItemResult = 
  | ({ mediaType: 'audio' } & AudioResult)
  | ({ mediaType: 'video' } & VideoResult);

export interface ResearchDossier {
  topic: string;
  title: string;
  theologicalThesis: string;
  keyArguments: string[];
  quranicEvidence?: Array<{ ref: string; explanation: string }>;
  ruhaniKhazainCitations?: Array<{ book: string; volume: number; description: string }>;
  hadithTraditions?: Array<{ source: string; text: string }>;
  counterArguments?: Array<{ objection: string; rebuttal: string }>;
}

import type { TheologicalConsensusMatrix, TriangulationLayerStatus } from './dsgt/triangulation-engine';
import type { HitsRankings } from './dsgt/hits-engine';

export type { TheologicalConsensusMatrix, TriangulationLayerStatus, HitsRankings };

export interface MultiSourceSearchResult {
  query: string;
  normalizedTerms: string[];
  ruhaniKhazain: RuhaniKhazainSearchResult[];
  quranVerses: QuranVerseResult[];
  ahadith: HadithResult[];
  books?: BookItem[];
  alislamArticles: AlIslamArticleResult[];
  publications: PublicationResult[];
  audios?: AudioResult[];
  videos?: VideoResult[];
  media?: MediaItemResult[];
  totalMediaHits?: number;
  totalBookHits?: number;
  dossier?: ResearchDossier;
  totalResults: number;
  totalAlHakamHits?: number;
  totalRoRHits?: number;
  totalAlIslamHits?: number;
  totalArticleHits?: number;
  totalPagesAlHakam?: number;
  totalPagesRoR?: number;
  totalPagesAlIslam?: number;
  consensusMatrix?: TheologicalConsensusMatrix;
  hitsRankings?: HitsRankings;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HOLY QUR'AN THEMATIC INDEX (Sher Ali translation & Ahmadiyya Commentary)
// ─────────────────────────────────────────────────────────────────────────────
export const THEMATIC_QURAN_VERSES: QuranVerseResult[] = QURAN_CORPUS;

// ─────────────────────────────────────────────────────────────────────────────
// 2. AL ISLAM TOPICS, BOOKS & ARTICLES (alislam.org)
// ─────────────────────────────────────────────────────────────────────────────
export const ALISLAM_RESOURCES: AlIslamArticleResult[] = [
  {
    id: "alislam-death-of-jesus-topic",
    title: "Death of Hazrat Jesus (as) — Comprehensive Topic Guide",
    category: "Topic Portal",
    summary: "Complete theological compilation covering Quranic evidence (30 verses), Hadith traditions, medical evidence of the crucifixion, and historical documentation of Jesus in India.",
    url: "https://www.alislam.org/topics/death-of-jesus/",
    topics: ["death of jesus", "crucifixion", "cross", "tomb", "kashmir", "وفات مسیح"]
  },
  {
    id: "alislam-30-verses-death-of-jesus",
    title: "30 Verses of the Holy Quran Proving the Natural Death of Jesus Christ",
    author: "Hazrat Mirza Tahir Ahmad (rh)",
    category: "Article",
    summary: "Systematic exegesis of thirty distinct Quranic verses demonstrating that Jesus (as) passed away naturally, dismantling dogmas of bodily ascension.",
    url: "https://www.alislam.org/articles/30-verses-holy-quran-prove-natural-death-jesus-christ/",
    topics: ["death of jesus", "30 verses", "quran", "tawaffa", "وفات مسیح"]
  },
  {
    id: "alislam-khatam-e-nabuwwat-topic",
    title: "The True Meaning of Khatam-e-Nabuwwat (Seal of Prophethood)",
    category: "Topic Portal",
    summary: "Elucidating the station of the Holy Prophet Muhammad (sa) as Khatam-an-Nabiyyin, the superiority of the Islamic dispensation, and subordinate prophethood in Islam.",
    url: "https://www.alislam.org/topics/khatme-nubuwwat/",
    topics: ["seal of prophets", "khatam", "khatam-e-nabuwwat", "prophethood", "ختم نبوت"]
  },
  {
    id: "alislam-philosophy-of-teachings-of-islam",
    title: "The Philosophy of the Teachings of Islam (Islami Usul Ki Philosophy)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    category: "Book",
    summary: "Masterpiece delivered at the 1896 Lahore Conference of Religions detailing the physical, moral, and spiritual states of man, life after death, and true union with God.",
    url: "https://www.alislam.org/book/philosophy-teachings-islam/",
    topics: ["philosophy", "spiritual states", "soul", "god", "prayer", "اسلامی اصول کی فلاسفی"]
  },
  {
    id: "alislam-jesus-in-india-book",
    title: "Jesus in India (Masih Hindustan Mein)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    category: "Book",
    summary: "Groundbreaking historical investigation demonstrating Jesus' escape from the cross, journey across Persia and Afghanistan to Kashmir to gather the Lost Tribes of Israel, and his tomb at Roza Bal in Srinagar.",
    url: "https://www.alislam.org/book/jesus-in-india/",
    topics: ["jesus in india", "kashmir", "roza bal", "death of jesus", "crucifixion", "مسیح ہندوستان میں"]
  },
  {
    id: "alislam-true-concept-of-jihad",
    title: "True Concept of Jihad — Peaceful Struggle and Jihad of the Pen",
    category: "Article",
    summary: "Clarifying Islamic jurisprudence on defensive struggle, the refutation of militant ideology, and the modern imperative of Jihad of the Pen.",
    url: "https://www.alislam.org/articles/true-concept-of-jihad/",
    topics: ["jihad", "jihad of the pen", "peace", "holy war", "جہاد", "جہاد بالقلم"]
  },
  {
    id: "alislam-lunar-solar-eclipse",
    title: "The Heavenly Signs: The Solar and Lunar Eclipses of 1894 & 1895",
    category: "Article",
    summary: "The miraculous fulfillment of the grand Hadith of Darqutni on the 13th and 28th of Ramadan 1311 Hijri, confirming the truth of the Promised Messiah and Mahdi (as).",
    url: "https://www.alislam.org/articles/solar-and-lunar-eclipses/",
    topics: ["eclipse", "signs", "prophecy", "darqutni", "ramadan", "کسوف و خسوف", "نشانات"]
  },
  {
    id: "alislam-existence-of-god",
    title: "Our God — An Exposition on the Existence, Unity, and Attributes of Allah",
    author: "Hazrat Mirza Bashir Ahmad (ra)",
    category: "Book",
    summary: "Rational and spiritual proofs for the existence of the Supreme Creator, divine attributes, and the reality of divine communion.",
    url: "https://www.alislam.org/book/our-god/",
    topics: ["existence of god", "tawheed", "unity of god", "attributes of god", "وجود باری تعالیٰ", "توحید"]
  },
  {
    id: "alislam-noah-ark",
    title: "Noah's Ark (Kashti-e-Nuh) — An Invitation to Faith",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    category: "Book",
    summary: "A solemn moral treatise containing Huzoor's (as) essential conditions for Bai'at, teachings on moral purity, and divine protection during the plague.",
    url: "https://www.alislam.org/book/noahs-ark/",
    topics: ["kashti-e-nuh", "conditions of baiat", "plague", "spiritual reform", "کشتی نوح"]
  },
  {
    id: "alislam-barahin-e-ahmadiyya",
    title: "Barahin-e-Ahmadiyya (The Arguments of the Ahmadiyya)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    category: "Book",
    summary: "Monumental magnum opus proving the living truth and divine perfection of the Holy Quran and Islam through hundreds of rational arguments and living signs.",
    url: "https://www.alislam.org/book/barahin-e-ahmadiyya/",
    topics: ["barahin", "arguments of islam", "quranic perfection", "revelation", "براہین احمدیہ"]
  },
  {
    id: "alislam-marriage-system-topic",
    title: "Islamic Marriage System & Guidelines (Nikah)",
    category: "Topic Portal",
    summary: "Exhaustive compilation on Islamic matrimony, spousal rights and obligations, dowry (Mehr), marital harmony, and the philosophical purpose of family life.",
    url: "https://www.alislam.org/topics/marriage/",
    topics: ["marriage", "nikah", "wedding", "spouse", "family", "dowry", "mehr", "walima", "husband", "wife", "نکاح", "شادی", "ازدواج"]
  },
  {
    id: "alislam-sacred-union-marriage",
    title: "The Sacred Union: Philosophy of Marriage in Islam",
    author: "Hazrat Mirza Tahir Ahmad (rh)",
    category: "Book",
    summary: "Deep theological discourse explaining the moral necessity of marriage, the spiritual protection afforded by spousal companionship, and rebuttals of ascetic celibacy.",
    url: "https://www.alislam.org/articles/islamic-marriage-system/",
    topics: ["marriage", "family", "chastity", "husband", "wife", "rights of women", "nikah", "طہارت", "عصمت"]
  },
  {
    id: "alislam-garments-for-each-other",
    title: "Garments for Each Other: Mutual Spousal Rights in Islam",
    category: "Article",
    summary: "Exegesis of Surah Al-Baqarah 2:188 detailing reciprocal affection, emotional sanctuary, forgiveness, and practical dispute resolution in married life.",
    url: "https://www.alislam.org/articles/garments-for-each-other/",
    topics: ["marriage", "spouse", "family", "husband", "wife", "divorce", "ازدواج", "زوجین", "نکاح"]
  },
  {
    id: "alislam-women-status-portal",
    title: "Status and Rights of Women in Islam & Purdah",
    category: "Topic Portal",
    summary: "Comprehensive exploration of female inheritance, financial independence, spiritual equality, and the philosophy of modesty (Hijab and Purdah).",
    url: "https://www.alislam.org/topics/women/",
    topics: ["women", "rights of women", "hijab", "purdah", "modesty", "chastity", "inheritance", "عورتوں کے حقوق", "پردہ", "حیا"]
  },
  {
    id: "alislam-ramadan-fasting-portal",
    title: "The Philosophy of Islamic Fasting & Ramadan (Sawm)",
    category: "Article",
    summary: "The inner spiritual reality of fasting, health dimensions, attainment of Taqwa, and spiritual communion during the sacred month of Ramadan.",
    url: "https://www.alislam.org/articles/ramadan-fasting-philosophy/",
    topics: ["fasting", "ramadan", "roza", "taqwa", "sawm", "روزہ", "رمضان", "تقویٰ"]
  },
  {
    id: "alislam-zakat-socio-economic",
    title: "Zakat: The Socio-Economic System of Islam",
    category: "Article",
    summary: "Economic principles of wealth redistribution, elimination of poverty, and the distinction between mandatory Zakat and voluntary financial sacrifice (Chanda/Infaq).",
    url: "https://www.alislam.org/articles/zakat-socio-economic-system/",
    topics: ["zakat", "charity", "sadaqah", "infaq", "economics", "financial sacrifice", "زکوٰۃ", "صدقہ", "انفاق"]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. THE REVIEW OF RELIGIONS & AL HAKAM (reviewofreligions.org & alhakam.org)
// ─────────────────────────────────────────────────────────────────────────────
export const PERIODICAL_ARCHIVES: PublicationResult[] = [
  {
    id: "ror-shroud-of-turin",
    source: "Review of Religions",
    title: "The Shroud of Turin: Scientific Proof That Jesus Survived the Cross",
    author: "Dr. Majid Khan",
    summary: "Scientific analysis of physiological trauma, blood flow patterns, and heart function on the Turin Shroud proving the victim was still alive when taken down from the cross.",
    url: "https://www.reviewofreligions.org/10531/the-shroud-of-turin-scientific-proof-jesus-survived-the-cross/",
    date: "Research Treatise",
    topics: ["shroud of turin", "death of jesus", "crucifixion", "science and religion", "صلیب", "کفن تورین"]
  },
  {
    id: "ror-roza-bal-investigation",
    source: "Review of Religions",
    title: "Roza Bal: The Tomb of Jesus in Srinagar, Kashmir — An Archaeological Overview",
    author: "Arif Khan",
    summary: "Comprehensive architectural, inscriptional, and anthropological review of the tomb of Yuz Asaf at Khanyar, Srinagar.",
    url: "https://www.reviewofreligions.org/1572/roza-bal-tomb-of-jesus/",
    date: "Historical Research",
    topics: ["roza bal", "kashmir", "tomb of jesus", "yuz asaf", "مزار عیسیٰ", "خان یار"]
  },
  {
    id: "ror-concept-of-god-science",
    source: "Review of Religions",
    title: "Fine-Tuning the Cosmos: Why Modern Astrophysics Points to a Divine Creator",
    author: "Zia H. Shah, MD",
    summary: "Anthropic principle, fundamental cosmological constants, and Quranic perspectives on divine order in the cosmos.",
    url: "https://www.reviewofreligions.org/11790/fine-tuning-the-cosmos/",
    date: "Science & Theology",
    topics: ["existence of god", "science", "cosmology", "fine tuning", "وجود باری تعالیٰ"]
  },
  {
    id: "alhakam-answers-everyday-issues",
    source: "Al Hakam",
    title: "Answers to Everyday Issues — Hazrat Khalifatul Masih V (aa)",
    author: "Hazrat Mirza Masroor Ahmad (aa)",
    summary: "Guidance on contemporary theological dilemmas, Islamic jurisprudence, prayers, modern ethics, and family life.",
    url: "https://www.alhakam.org/answers-to-everyday-issues/",
    date: "Weekly Guidance Series",
    topics: ["khilafat", "guidance", "fiqh", "everyday issues", "حضرت خلیفۃ المسیح الخامس"]
  },
  {
    id: "alhakam-history-of-prophethood",
    source: "Al Hakam",
    title: "The True Nature of Prophethood in Islam and the Station of the Promised Messiah (as)",
    author: "Al Hakam Research Desk",
    summary: "Detailed historical and theological exposition on the continuations of spiritual blessings, the rank of Ummati Nabi, and Hazrat Promised Messiah's obedience to the Holy Prophet (sa).",
    url: "https://www.alhakam.org/prophethood-in-islam/",
    date: "Theological Review",
    topics: ["prophethood", "khatam-e-nabuwwat", "seal of prophets", "ummati nabi", "نبوت"]
  },
  {
    id: "alfazl-tazkiya-nafs",
    source: "Al Fazl",
    title: "تزکیہ نفس اور استقامت فی الدین (Purification of the Soul and Steadfastness)",
    author: "ادارۃ الفضل انٹرنیشنل",
    summary: "روحانی منازل، نماز باجماعت کی برکات، اور تلاوت قرآن مجید کے ذریعے دل کی صفائی کے رہنما اصول۔",
    url: "https://www.alfazl.com/",
    date: "روحانی مضامین",
    topics: ["tazkiya", "prayer", "spiritual purification", "تزکیہ نفس", "دعا"]
  },
  {
    id: "ror-marriage-psychology",
    source: "Review of Religions",
    title: "The Psychological and Spiritual Dynamics of Islamic Marriage",
    author: "Review of Religions Research Desk",
    summary: "Analyzing the spiritual bond between husband and wife, conflict resolution through Islamic principles, and the Quranic ideal of mutual tranquility (Sukun).",
    url: "https://www.reviewofreligions.org/marriage-in-islam/",
    date: "Theological & Social Review",
    topics: ["marriage", "nikah", "psychology", "family", "chastity", "husband", "wife", "نکاح", "شادی", "خاندان"]
  },
  {
    id: "alhakam-fiqh-matrimony",
    source: "Al Hakam",
    title: "The Fiqh of Matrimony: Guidance of Hazrat Khalifatul Masih (aa)",
    author: "Al Hakam Editorial",
    summary: "Practical jurisprudential questions on Nikah announcements, simple Walima, the rights of the bride, dowry (Mehr), and resolving marital disputes in accordance with the Sunnah.",
    url: "https://www.alhakam.org/fiqh-matrimony-marriage/",
    date: "Jurisprudence Series",
    topics: ["marriage", "fiqh", "nikah", "walima", "dowry", "mehr", "guidance", "حق مہر", "نکاح"]
  },
  {
    id: "ror-ramadan-health-spirituality",
    source: "Review of Religions",
    title: "Fasting in Islam: Spiritual Purification and Biological Renewal",
    author: "Medical & Spiritual Research Team",
    summary: "How intermittent fasting during Ramadan triggers cellular autophagy, mental clarity, and profound proximity to Allah Almighty.",
    url: "https://www.reviewofreligions.org/health-benefits-ramadan/",
    date: "Science & Faith",
    topics: ["fasting", "ramadan", "health", "science", "roza", "taqwa", "روزہ", "رمضان"]
  },
  {
    id: "alhakam-women-status-rebuttal",
    source: "Al Hakam",
    title: "Women in Islam: Rebutting Western Misconceptions of Subjugation",
    author: "Al Hakam Research Desk",
    summary: "A historical and scriptural overview of women's rights in Islam, examining property ownership, divorce rights (Khula), educational advancement, and the true meaning of Hijab.",
    url: "https://www.alhakam.org/status-of-women-islam/",
    date: "Apologetics & History",
    topics: ["women", "rights of women", "purdah", "hijab", "equality", "khula", "حقوق نسواں", "عورت"]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. PRE-SYNTHESIZED SCHOLARLY THEOLOGICAL DOSSIERS (Instant Offline / Base)
// ─────────────────────────────────────────────────────────────────────────────
export const THEOLOGICAL_DOSSIERS: Record<string, ResearchDossier> = {
  "death of jesus": {
    topic: "death of jesus",
    title: "Theological Dossier: Natural Death of Jesus Christ (وفات مسیح)",
    theologicalThesis: "According to Ahmadiyya theology, Jesus Christ (Hazrat Isa as) did not die on the cross, nor was he raised bodily to heaven. He survived the ordeal of crucifixion, migrated eastward to search for the Lost 10 Tribes of Israel, and lived to a ripe old age, dying a natural human death in Srinagar, Kashmir where his tomb (Roza Bal) remains to this day.",
    keyArguments: [
      "Crucifixion by definition signifies dying of traumatic asphyxiation on the wood; since Jesus was taken down alive before expiration, the cross failed ('Ma Salabu').",
      "Sign of Jonah: Jonah entered the belly of the fish alive and emerged alive; Jesus prophesied he would fulfill this exact sign in the heart of the earth.",
      "The Quranic verb 'Tawaffa' when God is the subject and a human is the object universally denotes causing natural death.",
      "The verse 'Wa In Min Ahlil Kitabi' applies contextually to historical Jews and Christians prior to Jesus' natural expiration."
    ],
    quranicEvidence: [
      { ref: "Surah Al-Nisa (4:158)", explanation: "Neither killed nor crucified, but the matter was made ambiguous to the persecutors." },
      { ref: "Surah Al-e-Imran (3:56)", explanation: "'Inni Mutawaffeeka' — 'I will cause thee to die a natural death and raise thee in spiritual rank.'" },
      { ref: "Surah Al-Ma'idah (5:118)", explanation: "Jesus testifies on Judgment Day that deviations in his community occurred after his death." }
    ],
    ruhaniKhazainCitations: [
      { book: "Masih Hindustan Mein (Jesus in India)", volume: 14, description: "Detailed historical and medical evidence of Jesus' survival and tomb in Kashmir." },
      { book: "Izala-e-Auham (Removal of Suspicions)", volume: 3, description: "Masterful exegesis of 30 Quranic verses and Arabic lexicon on Tawaffa." },
      { book: "Kitab-ul-Bariyyah", volume: 13, description: "Historical refutations of Christian and orthodox dogmas regarding bodily ascension." }
    ],
    hadithTraditions: [
      { source: "Sahih Bukhari, Kitab-ut-Tafsir", text: "Hazrat Ibn Abbas (ra) explicitly explained: 'Mutawaffeeka means Mumituka (causing thee to die).'" },
      { source: "Kanz-ul-Ummal", text: "The Holy Prophet (sa) stated: 'Had Moses and Jesus been alive, they would have had no choice but to follow me.'" },
      { source: "Hujaj-ul-Kiramah", text: "The Holy Prophet (sa) stated that Jesus lived to the age of 120 years." }
    ],
    counterArguments: [
      {
        objection: "Does not 'Bal Rafa'ahu Allahu Ilayh' mean bodily ascension to heaven?",
        rebuttal: "No. Physical ascension contradicts Surah Al-Isra (17:94) where the Holy Prophet (sa) refused to ascend bodily because he was a mortal messenger. 'Rafa' when applied to prophets always signifies spiritual elevation and exaltation of honor."
      },
      {
        objection: "If Jesus died, who will descend in the Latter Days?",
        rebuttal: "The prophecy of the descent of the Messiah is metaphorical and spiritual, just as the return of Elijah (Ilyas) was spiritually fulfilled in John the Baptist (Hazrat Yahya as), as Jesus himself clarified in Matthew 17:11-13. Hazrat Mirza Ghulam Ahmad (as) is that spiritual likeness (Mathil-e-Isa)."
      }
    ]
  },

  "khatam-e-nabuwwat": {
    topic: "khatam-e-nabuwwat",
    title: "Theological Dossier: The Seal of Prophethood (خاتم النبیین)",
    theologicalThesis: "The Holy Prophet Muhammad (sa) is the absolute Khatam-an-Nabiyyin — the Seal and Apex of all Prophets. No law-bearing prophet, independent prophet, or new scripture can ever come after him. However, subordinate, non-law-bearing prophethood earned strictly through complete spiritual obedience and self-annihilation in the Holy Prophet (sa) ('Ummati Nabi' / 'Buruzi Nabuwwat') is not only possible but promised in the Holy Qur'an to preserve the living vitality of Islam.",
    keyArguments: [
      "The Arabic word 'Khatam' means seal, signet-ring, and ultimate perfection, signifying that the Holy Prophet's (sa) spiritual authority verifies and seals all divine truth.",
      "A subordinate prophet who brings no new sharia and receives divine converse purely through the Holy Prophet's light does not violate Khatam-e-Nabuwwat; rather, he demonstrates the living miracle of the Prophet's seal.",
      "If Jesus (as) of 2000 years ago returned bodily, he would be an independent Israelite prophet of the Mosaic order appearing after the Holy Prophet (sa), which would genuinely contradict Khatam-e-Nabuwwat."
    ],
    quranicEvidence: [
      { ref: "Surah Al-Ahzab (33:41)", explanation: "Muhammad is the Messenger of Allah and Khatam-an-Nabiyyin." },
      { ref: "Surah Al-Nisa (4:70)", explanation: "Whoso obeys Allah and the Messenger can attain the stations of Nabiyyin, Siddiqin, Shuhada, and Salihin." },
      { ref: "Surah Al-Fatihah (1:6-7)", explanation: "The daily Muslim prayer 'Ihdinas-Sirat al-Mustaqim, Siratalladhina An'amta Alayhim' asking for the blessings of previous guided souls." }
    ],
    ruhaniKhazainCitations: [
      { book: "Aik Ghalti Ka Izala (A Misconception Removed)", volume: 18, description: "Defining the exact nature of Zilli and Buruzi prophethood within the fold of the Holy Prophet (sa)." },
      { book: "Haqiqat-ul-Wahi", volume: 22, description: "Hundreds of living signs and divine revelations proving spiritual communion through obedience to the Prophet (sa)." },
      { book: "Barahin-e-Ahmadiyya Part 5", volume: 21, description: "Philosophical proof of why divine communion must remain alive in Islam." }
    ],
    hadithTraditions: [
      { source: "Sahih Bukhari & Sahih Muslim", text: "The Holy Prophet (sa) designated the Promised Messiah explicitly as 'Nabiyyullah' (Prophet of Allah) 4 times in the famous Hadith of Nawas ibn Sam'an." },
      { source: "Ibn Majah", text: "When his son Ibrahim passed away, the Holy Prophet (sa) said: 'Had he lived, he would have been a righteous prophet.'" },
      { source: "Musnad Ahmad", text: "Hazrat Aisha (ra) warned: 'Say he is Khatam-al-Anbiya, but do not say there is no prophet after him.'" }
    ],
    counterArguments: [
      {
        objection: "Does not the Hadith 'La Nabiyya Ba'di' mean absolutely no prophet under any circumstance?",
        rebuttal: "No. 'La Nabiyya Ba'di' means no prophet with a new law or independent of my allegiance, just as the Prophet (sa) said 'La Kisra Ba'dahu' (there is no Caesar after him), which meant no hostile tyrannical Caesar would overcome the believers."
      },
      {
        objection: "How can Hazrat Mirza Ghulam Ahmad (as) be both a follower and a prophet?",
        rebuttal: "Because his prophethood is entirely reflective (Zilli) and derivative, possessing no personal claim outside the Holy Prophet's (sa) spiritual reflection, as a mirror reflects the rays of the sun."
      }
    ]
  },

  "philosophy of prayer": {
    topic: "philosophy of prayer",
    title: "Theological Dossier: Philosophy of Prayer & Acceptance (فلسفہ و استجابت دعا)",
    theologicalThesis: "Prayer (Dua) in Ahmadiyya theology is not a mere customary ritual; it is a profound spiritual law of attraction between the soul and God Almighty. Just as physical causes yield physical effects, sincere, heartfelt, agonizing prayer acts as a magnetic spiritual force that draws divine grace, transforms the spiritual realm, and produces tangible, living miracles.",
    keyArguments: [
      "Prayer produces a mutual spiritual communion (Mukalama-o-Mukhawtaba) proving that God is Living and Responsive in every age.",
      "The acceptance of prayer requires perseverance, purity of heart, and spiritual anguish (Iztirar).",
      "True prayer does not oppose natural laws; rather, God employs hidden subtle physical and spiritual laws to answer the supplications of His chosen ones."
    ],
    quranicEvidence: [
      { ref: "Surah Al-Baqarah (2:187)", explanation: "'I am near; I answer the prayer of the supplicant when he prays to Me.'" },
      { ref: "Surah Al-Mu'min (40:61)", explanation: "'Pray unto Me; I will answer your prayer.'" },
      { ref: "Surah Al-Naml (27:63)", explanation: "'Or, Who answers the distressed soul when he calls on Him?'" }
    ],
    ruhaniKhazainCitations: [
      { book: "Barakat-ud-Dua (The Blessings of Prayer)", volume: 6, description: "Masterful refutation of naturalistic skeptics proving the reality and divine mechanics of prayer." },
      { book: "Ayyam-us-Sulh", volume: 13, description: "The philosophy of why prayers are accepted and why certain tribulations occur." },
      { book: "Islami Usul Ki Philosophy", volume: 10, description: "The three stages of the soul and the transformative role of supplication." }
    ],
    hadithTraditions: [
      { source: "Jami' at-Tirmidhi", text: "'Ad-Dua'u Huwal 'Ibadah' (Supplication is the very essence of worship)." },
      { source: "Sunan Abi Dawud", text: "'Allah is Shy and Generous; when His servant raises his hands, He feels shy to return them empty.'" }
    ],
    counterArguments: [
      {
        objection: "If everything is pre-destined (Taqdir), what is the benefit of prayer?",
        rebuttal: "Hazrat Promised Messiah (as) explained that prayer itself is part of Taqdir. Just as thirst is cured by drinking water by divine decree, divine decree has also established that certain graces are manifested solely through the catalyst of earnest prayer."
      }
    ]
  },

  "jihad of the pen": {
    topic: "jihad of the pen",
    title: "Theological Dossier: Jihad in Islam & The Jihad of the Pen (جہاد بالقلم)",
    theologicalThesis: "Islam strictly forbids aggressive war, forced conversion, and terrorism. The Quran permits military combat only under strict defensive conditions when religious freedom is physically attacked. In the modern era, where Islam is assailed not by swords but by intellectual, literary, and ideological attacks, the divinely mandated duty is the 'Jihad of the Pen' (Jihad bil-Qalam) championed by the Promised Messiah (as).",
    keyArguments: [
      "The Holy Prophet (sa) prophesied that the Promised Messiah would 'lay down the weapons of physical war' (Yada'ul Harb), meaning combat in the name of religion would cease.",
      "The greatest Jihad declared in the Quran is 'Jihadan Kabeera' carried out with the Holy Quran itself (Surah Al-Furqan 25:53).",
      "True Jihad is the conquest of self (Jihad-e-Akbar) and the intellectual defense of truth."
    ],
    quranicEvidence: [
      { ref: "Surah Al-Furqan (25:53)", explanation: "'And strive against them therewith (the Quran) a great striving (Jihadan Kabeera).'" },
      { ref: "Surah Al-Hajj (22:40)", explanation: "Permission to fight given strictly to victims of aggression to protect all houses of worship." },
      { ref: "Surah Al-Baqarah (2:257)", explanation: "'There shall be no compulsion in religion.'" }
    ],
    ruhaniKhazainCitations: [
      { book: "The British Government and Jihad", volume: 17, description: "Rebutting militant misconceptions and demonstrating the peaceful essence of Islam." },
      { book: "Haqiqat-ul-Mahdi", volume: 14, description: "Clarifying that the Mahdi will not shed blood but will conquer hearts with divine proofs." },
      { book: "Jang-e-Muqaddas (The Holy War)", volume: 6, description: "Historic 15-day theological debate with Christian scholar Abdullah Atham." }
    ],
    hadithTraditions: [
      { source: "Sahih Bukhari", text: "The Holy Prophet (sa) stated regarding the Promised Messiah: 'Wa Yada'ul Harba' (And he will abolish physical religious warfare)." },
      { source: "Musnad Ahmad", text: "The Prophet (sa) said: 'The Mujahid is he who strives against his own self in the obedience of Allah.'" }
    ],
    counterArguments: [
      {
        objection: "Did the Promised Messiah (as) abrogate Jihad?",
        rebuttal: "Never. He revitalized the true Quranic Jihad. Offensive war was never permitted in Islam. The condition for defensive military Jihad was physical persecution blocking freedom of worship; since that condition was absent under peaceful legal systems, the appropriate and superior weapon is the pen."
      }
    ]
  },

  "celestial signs & eclipses": {
    topic: "celestial signs & eclipses",
    title: "Theological Dossier: Solar & Lunar Eclipses as Signs of the Mahdi (علامت کسوف و خسوف)",
    theologicalThesis: "The Holy Prophet Muhammad (sa) foretold a grand celestial sign for the truth of the Mahdi: lunar and solar eclipses occurring in the holy month of Ramadan on specific appointed dates (the moon on the 1st of the eclipse nights, i.e., 13th Ramadan, and the sun on the middle day, i.e., 28th Ramadan). This unprecedented prophecy was fulfilled with celestial precision in 1894 in the Eastern Hemisphere and in 1895 in the Western Hemisphere after the Promised Messiah (as) had proclaimed his divine claim.",
    keyArguments: [
      "The prophecy recorded in Sunan Darqutni states: 'For our Mahdi there are two signs which have never appeared since the creation of the heavens and earth... the moon will be eclipsed on the first night and the sun on the middle day of its eclipse days in Ramadan.'",
      "According to celestial laws, lunar eclipses can only occur on the 13th, 14th, or 15th of the lunar month, and solar eclipses on the 27th, 28th, or 29th. The prophecy specified the 13th for the moon and 28th for the sun.",
      "The sign was not merely an astronomical occurrence; it was specifically tied to an individual who had already laid claim to being the Mahdi before its manifestation."
    ],
    quranicEvidence: [
      { ref: "Surah Al-Qiyamah (75:9-10)", explanation: "'And the moon is eclipsed, and the sun and the moon are brought together.'" }
    ],
    ruhaniKhazainCitations: [
      { book: "Nur-ul-Haq (Part 2)", volume: 8, description: "Detailed scientific, astronomical, and scriptural analysis of the Ramadan 1894 eclipses." },
      { book: "Haqiqat-ul-Wahi", volume: 22, description: "Enumeration of the eclipse as one of the great heavenly testimonies." },
      { book: "Chashma-e-Ma'rifat", volume: 23, description: "Refutation of critics denying the authenticity of the Darqutni tradition." }
    ],
    hadithTraditions: [
      { source: "Sunan Darqutni, Kitab-ul-Eidain", text: "Hazrat Imam Muhammad Baqir (rh) related from the Holy Prophet (sa): 'Inna Li Mahdiyyina Ayathaini...'" }
    ],
    counterArguments: [
      {
        objection: "Haven't solar and lunar eclipses occurred together in Ramadan before?",
        rebuttal: "Eclipses have occurred in Ramadan historically, but never has an eclipse occurred on those specific designated nights in conjunction with a claimant to the office of the Mahdi who invited the world to witness it as his divine proof."
      }
    ]
  },

  "khilafat": {
    topic: "khilafat",
    title: "Theological Dossier: Khilafat upon the Precept of Prophethood (خلافت علی منہاج النبوۃ)",
    theologicalThesis: "Khilafat is a divine covenant and system of spiritual succession established by Allah Almighty to consolidate, preserve, and globalize the teachings of a Prophet after his departure. Established upon the demise of the Promised Messiah (as) in 1908, the Ahmadiyya Khilafat represents the promised Second Manifestation of Divine Power (Qudrat-e-Thaniyya), uniting a worldwide community under one spiritual leader.",
    keyArguments: [
      "The Holy Qur'an (Surah Al-Nur 24:56) guarantees that God Himself appoints and establishes Khilafat for the believers who do good deeds ('Ayat-ul-Istikhlaf').",
      "The Holy Prophet (sa) prophesied that after periods of tyranny and monarchies, 'There will be Khilafat upon the precept of prophethood (Khilafatan 'ala Minhaj-in-Nubuwwah).' (Musnad Ahmad)",
      "Hazrat Promised Messiah (as) authored the historic treatise 'Al-Wasiyyat' (The Will) foretelling that God would manifest His Second Power to keep the community united and safeguarded forever."
    ],
    quranicEvidence: [
      { ref: "Surah Al-Nur (24:56)", explanation: "'Allah has promised to those among you who believe and do good works that He will surely make them Successors in the earth.'" }
    ],
    ruhaniKhazainCitations: [
      { book: "Al-Wasiyyat (The Will)", volume: 20, description: "The foundational charter establishing the permanent institution of Khilafat and the Sadr Anjuman Ahmadiyya." },
      { book: "Shahadat-ul-Quran", volume: 6, description: "Explaining the eternal need for divine spiritual guides and caliphs to preserve Islam." }
    ],
    hadithTraditions: [
      { source: "Musnad Ahmad ibn Hanbal", text: "The Holy Prophet (sa) stated: 'Then there will emerge Khilafat on the precept of prophethood, and then he remained silent.'" }
    ],
    counterArguments: [
      {
        objection: "Is Khilafat chosen by people or appointed by God?",
        rebuttal: "While the electors cast votes in the Electoral College, the Quran declares 'He will make them Successors.' Believers are guided by the Holy Spirit to select the individual already chosen in divine decree, ensuring divine hand over human agency."
      }
    ]
  },

  "divine communion & revelation": {
    topic: "divine communion & revelation",
    title: "Theological Dossier: Living Revelation & Divine Communion (وحی و الہام)",
    theologicalThesis: "Ahmadiyya theology resolutely affirms that God Almighty speaks to His righteous servants today just as He spoke in the past. Islam is not a fossilized or dead religion based on historical tales; its crowning glory is that sincere obedience to the Holy Prophet Muhammad (sa) elevates human consciousness to experience the living voice of God (Mukalama-o-Mukhawtaba Ilahiyya) and witness true visions.",
    keyArguments: [
      "If divine revelation ceased entirely, religion would reduce to hearsay, and certainty of God's existence would gradually extinguish in the face of scientific skepticism.",
      "The Quran guarantees that the angels descend upon believers, stating: 'Fear not, nor grieve; but rejoice in the Garden that you were promised' (Surah Ha-Mim Al-Sajdah 41:31).",
      "The Promised Messiah (as) presented hundreds of verified fulfilled prophecies as living empirical evidence that the God of Islam speaks."
    ],
    quranicEvidence: [
      { ref: "Surah Ha-Mim Al-Sajdah (41:31)", explanation: "'As for those who say: Our Lord is Allah, and then remain steadfast, the angels descend on them.'" },
      { ref: "Surah Al-Shura (42:52)", explanation: "The three modes of divine communication with humans: revelation, from behind a veil, or through a sent messenger." }
    ],
    ruhaniKhazainCitations: [
      { book: "Barahin-e-Ahmadiyya Parts 1-4", volume: 1, description: "Monumental defense proving the necessity of living divine revelation against Arya Samaj and atheist critics." },
      { book: "Haqiqat-ul-Wahi", volume: 22, description: "Philosophical categorization of dreams, visions, and the four categories of divine converse." }
    ],
    hadithTraditions: [
      { source: "Sahih Bukhari", text: "The Holy Prophet (sa) stated: 'Nothing remains of Prophethood except Mubashshirat (true glad tidings/visions).'" }
    ],
    counterArguments: [
      {
        objection: "Does claiming divine converse imply bringing a new sharia?",
        rebuttal: "No. The mother of Moses (as) and Maryam (as) received divine inspiration without being lawgivers. Divine converse to righteous Muslims is purely subordinate to the Holy Quran and testifies to the truth of the Prophet (sa)."
      }
    ]
  },

  "marriage": {
    topic: "marriage",
    title: "Theological Dossier: Islamic Matrimony & Marriage Philosophy (نکاح و فلسفہ ازدواج)",
    theologicalThesis: "In Ahmadiyya theology, marriage (Nikah) is a sacred spiritual covenant and moral fortress designed for mutual tranquility (Sukun), the preservation of chastity, reciprocal emotional fulfillment, and the righteous upbringing of future generations. Islam categorically rejects monastic celibacy and emphasizes that marital companionship is essential for elevating human morality into spiritual virtue.",
    keyArguments: [
      "The Holy Quran defines spouses as 'garments for each other' (Hunna libasun lakum wa antum libasun lahunna, 2:188), signifying mutual protection, comfort, dignity, and concealment of frailties.",
      "Marriage is designated as a divine Sign (Ayat) grounded in reciprocal affection (Mawaddah) and mercy (Rahmah) (Surah Al-Rum 30:22).",
      "The Holy Prophet Muhammad (sa) declared: 'Marriage is part of my Sunnah; whoever turns away from my Sunnah is not of me', explicitly forbidding artificial celibacy and ascetic withdrawal.",
      "Islam guarantees absolute financial autonomy to the wife, obligating the groom to provide an unconditional Mehr (dower) directly to the bride as her sole property (4:5)."
    ],
    quranicEvidence: [
      { ref: "Surah Al-Rum (30:22)", explanation: "'He has created for you mates from among yourselves that you may find peace of mind in them, and He has put love and tenderness between you.'" },
      { ref: "Surah Al-Baqarah (2:188)", explanation: "'They are a garment for you, and you are a garment for them.'" },
      { ref: "Surah Al-Nisa (4:20)", explanation: "'And consort with them in kindness (Mu'asharat bil-Ma'ruf).'" },
      { ref: "Surah Al-Nur (24:33)", explanation: "'And marry those among you who are single... If they be poor, Allah will grant them means out of His grace.'" }
    ],
    ruhaniKhazainCitations: [
      { book: "Islami Usul Ki Philosophy (Philosophy of the Teachings of Islam)", volume: 10, description: "Profound philosophical exposition on human passions, the sanctity of chastity (Ihsan), and how marriage transforms animalistic drives into refined moral virtues." },
      { book: "Chashma-e-Ma'rifat", volume: 23, description: "Rebuttal of unnatural ascetic celibacy and Niyoga, demonstrating that Quranic marriage preserves genealogical purity and human sanctity." },
      { book: "Arya Dharam", volume: 10, description: "Defense of Islamic marital jurisprudence, mutual spousal rights, and divorce ethics against contemporary criticisms." }
    ],
    hadithTraditions: [
      { source: "Sunan Ibn Majah, Kitab-un-Nikah", text: "The Holy Prophet (sa) said: 'Al-Nikahu min Sunnati fa man raghiba 'an Sunnati falaysa minni' (Marriage is part of my Sunnah; whoever does not follow my Sunnah is not of me)." },
      { source: "Sahih Bukhari, Kitab-un-Nikah", text: "The Prophet (sa) said: 'O gathering of young men, whoever among you has the means, let him marry, for it restrains the gaze and protects chastity.'" },
      { source: "Jami' at-Tirmidhi", text: "The Prophet (sa) stated: 'Khayrukum khayrukum li-ahlihi' (The best among you is the one who is best to his family, and I am the best to my family)." }
    ],
    counterArguments: [
      {
        objection: "Does Islam permit forced marriage or matrimonial compulsion?",
        rebuttal: "Absolutely forbidden. Islamic jurisprudence strictly mandates explicit and free consent (Ijab-o-Qubul) from both bride and groom. The Holy Prophet (sa) explicitly invalidated marriages contracted without the bride's voluntary consent (Sahih Bukhari Bab La Yunkahu al-Bikr)."
      },
      {
        objection: "Why does Islam allow divorce if marriage is a holy covenant?",
        rebuttal: "While the Prophet (sa) described divorce as the most detested of lawful things in the sight of Allah, Islam pragmatically recognizes that forcing incompatible spouses into permanent legal bondage produces misery and abuse. When reconciliation fails, graceful dissolution (Talaq / Khula) is permitted."
      }
    ]
  },

  "fasting": {
    topic: "fasting",
    title: "Theological Dossier: Fasting & The Sacred Month of Ramadan (صوم و رمضان)",
    theologicalThesis: "Fasting (Sawm) in Islam is a profound spiritual discipline aimed at cultivating Taqwa (God-consciousness), subduing lower animalistic instincts, awakening compassionate empathy for the hungry, and achieving intimate proximity to Allah through intensive prayer and Quranic reflection.",
    keyArguments: [
      "The Quran states fasting was prescribed for earlier religious communities to emphasize its universal necessity for moral purification (2:184).",
      "Fasting starves the physical appetites so that the spiritual faculties may feast upon divine remembrance and moral renewal.",
      "Ramadan is the month of the descent of the Holy Quran, celebrated with intense congregational devotion, Tahajjud, and spiritual seclusion (Itikaf)."
    ],
    quranicEvidence: [
      { ref: "Surah Al-Baqarah (2:184)", explanation: "'Fasting is prescribed for you, as it was prescribed for those before you, that you may attain Taqwa.'" },
      { ref: "Surah Al-Baqarah (2:186)", explanation: "'The month of Ramadan is that in which the Qur'an was revealed as a guidance for mankind.'" }
    ],
    ruhaniKhazainCitations: [
      { book: "Islami Usul Ki Philosophy", volume: 10, description: "Explaining how physical restraint in food and drink directly influences the spiritual soul." },
      { book: "Barahin-e-Ahmadiyya Part 5", volume: 21, description: "The inner reality of hunger for the sake of Allah and the heavenly rewards bestowed upon the fasting believer." }
    ],
    hadithTraditions: [
      { source: "Sahih Bukhari", text: "The Holy Prophet (sa) said: 'As-Sawmu Junnah' (Fasting is a protective shield against sin)." },
      { source: "Sahih Bukhari", text: "Allah Almighty says: 'Every deed of the son of Adam is for himself, except fasting; it is for Me and I Myself will reward it.'" }
    ],
    counterArguments: [
      {
        objection: "Does fasting harm physical health or overburden the sick?",
        rebuttal: "Islam explicitly exempts the sick, travelers, pregnant or nursing mothers, and the elderly (2:185), commanding them to feed the poor (Fidya) or make up missed days when healthy."
      }
    ]
  },

  "status of women": {
    topic: "status of women",
    title: "Theological Dossier: Rights & Dignity of Women in Islam (حقوق نسواں)",
    theologicalThesis: "Islam revolutionized the status of women by conferring full spiritual equality, legal personhood, property rights, educational entitlement, and matrimonial autonomy fourteen centuries before modern legal reforms. Purdah and modesty serve not as tools of subjugation, but as protective moral armor safeguarding personal dignity.",
    keyArguments: [
      "Women possess complete spiritual equality: the Quran repeatedly addresses believing men and believing women alike (33:36).",
      "Islam granted women unilateral property ownership and inheritance rights (4:8, 4:12) that cannot be infringed upon by husband or father.",
      "Modesty (Hijab and Purdah) is preceded in the Quran by the commandment for men to lower their gazes (24:31)."
    ],
    quranicEvidence: [
      { ref: "Surah Al-Baqarah (2:229)", explanation: "'And women have rights similar to those against them in a just manner.'" },
      { ref: "Surah Al-Nisa (4:8)", explanation: "'For men is a share of what the parents and near relatives leave, and for women a share.'" }
    ],
    ruhaniKhazainCitations: [
      { book: "Islami Usul Ki Philosophy", volume: 10, description: "The social philosophy of modesty and protection of female rights and dignity." },
      { book: "Chashma-e-Ma'rifat", volume: 23, description: "Comparing Islamic egalitarian rights of women with ancient religious traditions." }
    ],
    hadithTraditions: [
      { source: "Sunan an-Nasa'i", text: "The Holy Prophet (sa) said: 'Al-Jannatu tahta aqdam-il-ummahat' (Paradise lies beneath the feet of mothers)." }
    ],
    counterArguments: [
      {
        objection: "Is Purdah oppressive to women?",
        rebuttal: "Purdah is a moral safeguard that shifts social evaluation from physical appearance to intellectual, moral, and spiritual character, liberating women from societal objectification."
      }
    ]
  }
};

/**
 * Normalizes query string for topic matching
 */
export function normalizeTopicQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, '')
    .trim();
}


// ─────────────────────────────────────────────────────────────────────────────
// 1b. CANONICAL AHADITH THEMATIC COLLECTION (Authentic Traditions)
// ─────────────────────────────────────────────────────────────────────────────
export const THEMATIC_HADITH_COLLECTION: HadithResult[] = [
  // ── Marriage & Family ──
  {
    id: "hadith-nikah-sunnah",
    book: "Sunan Ibn Majah",
    chapter: "Kitab an-Nikah (Book of Marriage)",
    hadithNumber: "1846",
    grade: "Hasan",
    narrator: "Hazrat Aisha (ra)",
    arabicText: "النِّكَاحُ مِنْ سُنَّتِي فَمَنْ لَمْ يَعْمَلْ بِسُنَّتِي فَلَيْسَ مِنِّي وَتَزَوَّجُوا فَإِنِّي مُكَاثِرٌ بِكُمُ الأُمَمَ",
    englishTranslation: "Marriage is part of my Sunnah, and whoever does not follow my Sunnah has nothing to do with me. Get married, for I will be proud of your great numbers before the other nations.",
    urduTranslation: "نکاح میری سنت میں سے ہے، پس جو میری سنت پر عمل نہ کرے اس کا مجھ سے کوئی تعلق نہیں۔ اور تم نکاح کرو کیونکہ میں دوسری امتوں کے سامنے تمہاری کثرت پر فخر کروں گا۔",
    contextNote: "The foundational Hadith prohibiting celibacy and affirming that matrimony is an essential Sunnah for spiritual and moral elevation.",
    topics: ["marriage", "nikah", "sunnah", "family", "celibacy", "نکاح", "سنت", "شادی", "ازدواج"],
    url: "https://sunnah.com/ibnmajah:1846"
  },
  {
    id: "hadith-youth-marriage",
    book: "Sahih al-Bukhari",
    chapter: "Kitab an-Nikah",
    hadithNumber: "5066",
    grade: "Sahih",
    narrator: "Hazrat Abdullah ibn Mas'ud (ra)",
    arabicText: "يَا مَعْشَرَ الشَّبَابِ مَنِ اسْتَطَاعَ مِنْكُمُ الْبَاءَةَ فَلْيَتَزَوَّجْ فَإِنَّهُ أَغَضُّ لِلْبَصَرِ وَأَحْصَنُ لِلْفَرْجِ",
    englishTranslation: "O young men! Whoever among you has the means to marry, let him marry, for it is more protective of the gaze and more guarding of one's chastity.",
    urduTranslation: "اے نوجوانو! تم میں سے جو نکاح کی استطاعت رکھتا ہو وہ ضرور نکاح کرے کیونکہ یہ نگاہ کو نیچی رکھنے اور شرمگاہ کی حفاظت کا سب سے بہترین ذریعہ ہے۔",
    contextNote: "Direct prophetic counsel on safeguarding personal chastity, mental tranquility, and moral health through timely marriage.",
    topics: ["marriage", "nikah", "youth", "chastity", "gaze", "purdah", "حیا", "طہارت", "نکاح"],
    url: "https://sunnah.com/bukhari:5066"
  },
  {
    id: "hadith-best-to-wives",
    book: "Jami' at-Tirmidhi",
    chapter: "Kitab ar-Rada'",
    hadithNumber: "1162",
    grade: "Hasan Sahih",
    narrator: "Hazrat Abu Hurairah (ra)",
    arabicText: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا وَخِيَارُكُمْ خِيَارُكُمْ لِنِسَائِهِمْ",
    englishTranslation: "The most complete believer in faith is the one with the best moral character, and the best of you are those who are best to their wives.",
    urduTranslation: "ایمان کے اعتبار سے مومنوں میں سب سے کامل وہ شخص ہے جو اخلاق میں سب سے اچھا ہو، اور تم میں سے بہترین وہ ہیں جو اپنی بیویوں کے حق میں بہترین ہوں۔",
    contextNote: "Establishes benevolent, honorable treatment of one's wife as the ultimate barometer of true faith and spiritual maturity.",
    topics: ["marriage", "wife", "husband", "character", "ethics", "kindness", "rights of women", "حسن سلوک", "بیوی", "اخلاق"],
    url: "https://sunnah.com/tirmidhi:1162"
  },
  {
    id: "hadith-four-criteria-marriage",
    book: "Sahih al-Bukhari",
    chapter: "Kitab an-Nikah",
    hadithNumber: "5090",
    grade: "Sahih",
    narrator: "Hazrat Abu Hurairah (ra)",
    arabicText: "تُنْكَحُ الْمَرْأَةُ لأَرْبَعٍ: لِمَالِهَا وَلِحَسَبِهَا وَجَمَالِهَا وَلِدِينِهَا، فَاظْفَرْ بِذَاتِ الدِّينِ تَرِبَتْ يَدَاكَ",
    englishTranslation: "A woman is married for four reasons: her wealth, her lineage, her beauty, and her piety. Give preference to the one with piety, that you may prosper.",
    urduTranslation: "عورت سے نکاح چار چیزوں کی بنا پر کیا جاتا ہے: اس کے مال، خاندانی وقار، حسن و جمال اور دینداری کی بنا پر۔ پس تم دیندار کو ترجیح دو، تمہارے ہاتھ خاک آلود ہوں (کامیاب رہو گے)۔",
    contextNote: "Spiritual guidance for prospective spouses to prioritize righteous piety (Din) and inner Taqwa above transitory material considerations.",
    topics: ["marriage", "nikah", "piety", "taqwa", "spouse", "selection", "دینداری", "نکاح", "انتخاب"],
    url: "https://sunnah.com/bukhari:5090"
  },
  {
    id: "hadith-public-announcement-marriage",
    book: "Jami' at-Tirmidhi",
    chapter: "Kitab an-Nikah",
    hadithNumber: "1089",
    grade: "Hasan",
    narrator: "Hazrat Aisha (ra)",
    arabicText: "أَعْلِنُوا هَذَا النِّكَاحَ وَاجْعَلُوهُ فِي الْمَسَاجِدِ وَاضْرِبُوا عَلَيْهِ بِالدُّفُوفِ",
    englishTranslation: "Make this marriage public, conduct it in mosques, and announce it with the beating of the tambourine (daff).",
    urduTranslation: "اس نکاح کا علانیہ اعلان کرو، اسے مساجد میں منعقد کرو اور اس موقع پر دف بجا کر اعلان کرو۔",
    contextNote: "The Islamic requirement for public transparency and societal celebration of matrimonial unions to distinguish Nikah from secret affairs.",
    topics: ["marriage", "nikah", "announcement", "walima", "mosque", "اعلان نکاح", "شادی"],
    url: "https://sunnah.com/tirmidhi:1089"
  },
  {
    id: "hadith-easy-dowry-mehr",
    book: "Sunan Abi Dawud",
    chapter: "Kitab an-Nikah",
    hadithNumber: "2117",
    grade: "Sahih",
    narrator: "Hazrat Uqbah ibn Amir (ra)",
    arabicText: "خَيْرُ الصَّدَاقِ أَيْسَرُهُ",
    englishTranslation: "The best dowry (Mehr) is that which is easiest and least burdensome.",
    urduTranslation: "بہترین مہر وہ ہے جو سب سے آسان اور سبک ہو۔",
    contextNote: "Condemns ostentation, exorbitant bridal demands, and unnecessary delays, promoting modest and facilitated marriages.",
    topics: ["marriage", "mehr", "dowry", "simplicity", "nikah", "مہر", "حق مہر", "آسانی"],
    url: "https://sunnah.com/abudawud:2117"
  },

  // ── Prayer, Dua & Worship ──
  {
    id: "hadith-dua-essence-worship",
    book: "Jami' at-Tirmidhi",
    chapter: "Kitab ad-Da'awat",
    hadithNumber: "3371",
    grade: "Hasan Sahih",
    narrator: "Hazrat Nu'man ibn Bashir (ra)",
    arabicText: "الدُّعَاءُ هُوَ الْعِبَادَةُ",
    englishTranslation: "Supplication (Dua) is the very essence of worship.",
    urduTranslation: "دعا ہی تو اصل عبادت ہے۔",
    contextNote: "Highlights that true communion and heartfelt supplication are the foundational soul of all Islamic devotions.",
    topics: ["prayer", "dua", "worship", "acceptance of prayer", "دعا", "عبادت", "قبولیت دعا"],
    url: "https://sunnah.com/tirmidhi:3371"
  },
  {
    id: "hadith-nearest-in-prostration",
    book: "Sahih Muslim",
    chapter: "Kitab as-Salat",
    hadithNumber: "482",
    grade: "Sahih",
    narrator: "Hazrat Abu Hurairah (ra)",
    arabicText: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ فَأَكْثِرُوا الدُّعَاءَ",
    englishTranslation: "The closest that a servant comes to his Lord is when he is in prostration (Sujud), so supplicate much therein.",
    urduTranslation: "بندہ اپنے رب کے سب سے زیادہ قریب اس وقت ہوتا ہے جب وہ سجدے میں ہو، پس سجدے میں کثرت سے دعا کیا کرو۔",
    contextNote: "The station of ultimate spiritual humility: Prostration as the most proximate communion between human consciousness and God Almighty.",
    topics: ["prayer", "salat", "sujud", "dua", "namaz", "نماز", "سجدہ", "قرب الٰہی"],
    url: "https://sunnah.com/muslim:482"
  },
  {
    id: "hadith-generous-lord-empty-hands",
    book: "Sunan Abi Dawud",
    chapter: "Kitab as-Salat",
    hadithNumber: "1488",
    grade: "Sahih",
    narrator: "Hazrat Salman al-Farsi (ra)",
    arabicText: "إِنَّ رَبَّكُمْ حَيِيٌّ كَرِيمٌ يَسْتَحْيِي مِنْ عَبْدِهِ إِذَا رَفَعَ يَدَيْهِ إِلَيْهِ أَنْ يَرُدَّهُمَا صِفْرًا",
    englishTranslation: "Indeed, your Lord is Modest and Generous; when His servant raises his hands to Him in prayer, He feels shy to return them empty.",
    urduTranslation: "یقیناً تمہارا رب حیا والا اور سخی ہے، جب اس کا بندہ اس کے آگے اپنے دونوں ہاتھ اٹھاتا ہے تو وہ اس بات سے حیا فرماتا ہے کہ انہیں خالی لوٹا دے۔",
    contextNote: "Divine promise that sincere prayers never go in vain and are met with divine grace.",
    topics: ["prayer", "dua", "generosity", "supplication", "دعا", "فضل الٰہی"],
    url: "https://sunnah.com/abudawud:1488"
  },

  // ── Fasting & Ramadan ──
  {
    id: "hadith-fasting-is-shield",
    book: "Sahih al-Bukhari",
    chapter: "Kitab as-Sawm",
    hadithNumber: "1894",
    grade: "Sahih",
    narrator: "Hazrat Abu Hurairah (ra)",
    arabicText: "الصِّيَامُ جُنَّةٌ فَلاَ يَرْفُثْ وَلاَ يَجْهَلْ وَإِنِ امْرُؤٌ قَاتَلَهُ أَوْ شَاتَمَهُ فَلْيَقُلْ إِنِّي صَائِمٌ",
    englishTranslation: "Fasting is a protective shield. Let no one engage in obscenity or foolishness. If someone quarrels with him or insults him, let him say: 'I am fasting.'",
    urduTranslation: "روزہ ایک ڈھال ہے۔ پس روزہ دار نہ فحش کلامی کرے اور نہ جہالت کی بات۔ اور اگر کوئی شخص اس سے لڑے یا اسے گالی دے تو وہ کہہ دے کہ میں روزہ دار ہوں۔",
    contextNote: "Fasting as a spiritual fortress protecting moral dignity and training human temperance.",
    topics: ["fasting", "ramadan", "roza", "taqwa", "patience", "روزہ", "رمضان", "صوم", "صبر"],
    url: "https://sunnah.com/bukhari:1894"
  },

  // ── Death of Jesus & Prophetic Traditions ──
  {
    id: "hadith-ibn-abbas-mutawaffeeka",
    book: "Sahih al-Bukhari",
    chapter: "Kitab ut-Tafsir, Surah Al-Ma'idah",
    hadithNumber: "4622",
    grade: "Sahih",
    narrator: "Hazrat Abdullah ibn Abbas (ra)",
    arabicText: "وَقَالَ ابْنُ عَبَّاسٍ: مُتَوَفِّيكَ مُمِيتُكَ",
    englishTranslation: "Hazrat Ibn Abbas (ra) explicitly declared: 'Mutawaffeeka (in Surah Al-e-Imran 3:56) means Mumituka (causing thee to die a natural death).'",
    urduTranslation: "اور حضرت ابن عباس رضی اللہ عنہ نے فرمایا: 'متوفیک' کا معنی ہے 'ممیتک' (یعنی میں تجھے طبعی موت دینے والا ہوں)۔",
    contextNote: "The premier scriptural authority on the Arabic language confirms that the term Tawaffa denotes natural death, refuting physical ascension dogmas.",
    topics: ["death of jesus", "tawaffa", "ibn abbas", "tafsir", "وفات مسیح", "توفی", "بخاری"],
    url: "https://sunnah.com/bukhari:4622"
  },
  {
    id: "hadith-moses-jesus-alive",
    book: "Kanz al-Ummal & Al-Yawaqit wal-Jawahir",
    grade: "Hasan",
    chapter: "Bab Nuzul Isa",
    hadithNumber: "32259",
    narrator: "Hazrat Jabir ibn Abdullah (ra)",
    arabicText: "لَوْ كَانَ مُوسَى وَعِيسَى حَيَّيْنِ لَمَا وَسِعَهُمَا إِلَّا اتِّبَاعِي",
    englishTranslation: "The Holy Prophet (sa) stated: 'Had Moses and Jesus been alive, they would have had no choice but to follow me.'",
    urduTranslation: "آنحضرت صلی اللہ علیہ وسلم نے فرمایا: اگر موسیٰ اور عیسیٰ دونوں زندہ ہوتے تو ان کے پاس سوائے میری پیروی کے کوئی چارہ نہ ہوتا۔",
    contextNote: "The conditional particle 'Law' in Arabic denotes that the premise is non-existent, conclusively establishing that Jesus (as) had already passed away.",
    topics: ["death of jesus", "prophets", "obedience", "وفات مسیح", "عیسیٰ", "موسیٰ"],
    url: "https://sunnah.com/search?q=Moses+and+Jesus+alive"
  },
  {
    id: "hadith-jesus-age-120",
    book: "Hujaj al-Kiramah / Kanz al-Ummal",
    grade: "Hasan",
    chapter: "Ahadith Wafat Isa",
    hadithNumber: "1028",
    narrator: "Hazrat Aisha (ra) & Hazrat Fatimah (ra)",
    arabicText: "إِنَّ عِيسَى ابْنَ مَرْيَمَ عَاشَ عِشْرِينَ وَمِائَةَ سَنَةٍ",
    englishTranslation: "The Holy Prophet (sa) disclosed in his final illness: 'Jesus, son of Mary, lived to the age of one hundred and twenty years.'",
    urduTranslation: "آنحضرت صلی اللہ علیہ وسلم نے اپنی وفات کے وقت فرمایا: حضرت عیسیٰ ابن مریم نے ایک سو بیس سال کی عمر پائی۔",
    contextNote: "Conclusive historical Hadith proving Jesus survived the cross at age 33 and lived a long, blessed life in his eastward migration to Kashmir.",
    topics: ["death of jesus", "kashmir", "age of jesus", "وفات مسیح", "عمر عیسیٰ"],
    url: "https://sunnah.com/search?q=Jesus+hundred+and+twenty+years"
  },

  // ── Advent of the Promised Messiah & Eclipses ──
  {
    id: "hadith-darqutni-eclipses",
    book: "Sunan al-Darqutni",
    chapter: "Kitab al-Eidain",
    hadithNumber: "1880",
    grade: "Sahih",
    narrator: "Hazrat Imam Muhammad Baqir (rh)",
    arabicText: "إِنَّ لِمَهْدِيِّنَا آيَتَيْنِ لَمْ تَكُونَا مُنْذُ خَلْقِ السَّمَاوَاتِ وَالأَرْضِ: تَنْكَسِفُ الْقَمَرُ لأَوَّلِ لَيْلَةٍ مِنْ رَمَضَانَ، وَتَنْكَسِفُ الشَّمْسُ فِي النِّصْفِ مِنْهُ",
    englishTranslation: "For our Mahdi there are two celestial signs which have never appeared since the creation of the heavens and earth: the moon will be eclipsed on the first of its appointed eclipse nights in Ramadan (13th), and the sun will be eclipsed on the middle of its eclipse days (28th).",
    urduTranslation: "ہمارے مہدی کے لیے دو ایسے نشان ہیں جو زمین و آسمان کی پیدائش کے وقت سے کبھی ظاہر نہیں ہوئے: چاند کا رمضان کی پہلی رات (۱۳ویں) گرہن ہونا، اور سورج کا اس کے درمیانی دن (۲۸ویں) گرہن ہونا۔",
    contextNote: "Fulfilled in 1894 and 1895 as a celestial divine testimony for the advent of Hazrat Mirza Ghulam Ahmad of Qadian (as).",
    topics: ["eclipses", "celestial signs", "mahdi", "promised messiah", "ramadan", "کسوف", "خسوف", "مہدی", "علامات"],
    url: "https://sunnah.com/search?q=Darqutni+1880"
  },
  {
    id: "hadith-imam-from-among-yourselves",
    book: "Sahih al-Bukhari",
    chapter: "Kitab Ahadith al-Anbiya",
    hadithNumber: "3449",
    grade: "Sahih",
    narrator: "Hazrat Abu Hurairah (ra)",
    arabicText: "كَيْفَ أَنْتُمْ إِذَا نَزَلَ ابْنُ مَرْيَمَ فِيكُمْ وَإِمَامُكُمْ مِنْكُمْ",
    englishTranslation: "How joyful will you be when the Son of Mary descends among you and he will be your Imam from among yourselves!",
    urduTranslation: "تمہارا کیا حال ہوگا جب ابن مریم تم میں نازل ہوگا اور وہ تمہارا ہی امام تم ہی میں سے ہوگا۔",
    contextNote: "Explicitly states 'Imamukum minkum' — clarifying that the latter-day Messiah is an Ummati Muslim leader born within the Muslim Ummah, not an ancient Israelite prophet descending physically.",
    topics: ["promised messiah", "second coming", "imam", "latter days", "مسیح موعود", "امامکم منکم"],
    url: "https://sunnah.com/bukhari:3449"
  },
  {
    id: "hadith-abolish-religious-war",
    book: "Sahih al-Bukhari",
    chapter: "Kitab al-Mazalim",
    hadithNumber: "2476",
    grade: "Sahih",
    narrator: "Hazrat Abu Hurairah (ra)",
    arabicText: "وَالَّذِي نَفْسِي بِيَدِهِ لَيُوشِكَنَّ أَنْ يَنْزِلَ فِيكُمُ ابْنُ مَرْيَمَ حَكَمًا عَدْلاً... وَيَضَعَ الْحَرْبَ",
    englishTranslation: "By Him in Whose Hands my life is, surely the Son of Mary will soon descend among you as a just judge... and he will abolish physical religious war (Yada'ul Harb).",
    urduTranslation: "اس ذات کی قسم جس کے ہاتھ میں میری جان ہے، یقیناً قریب ہے کہ تم میں ابن مریم ایک منصف حاکم بن کر نازل ہو... اور وہ جنگ کو موقوف کر دے گا۔",
    contextNote: "Prophesies that the Promised Messiah will institute the intellectual Jihad of the Pen, declaring that the era of bloodshed in the name of religion has ended.",
    topics: ["promised messiah", "jihad", "peace", "yadaul harb", "جہاد", "امن", "مسیح موعود"],
    url: "https://sunnah.com/bukhari:2476"
  },

  // ── Seal of Prophethood & Khilafat ──
  {
    id: "hadith-khilafat-ala-minhaj",
    book: "Musnad Ahmad ibn Hanbal",
    chapter: "Ahadith al-Khilafah",
    hadithNumber: "18406",
    grade: "Sahih",
    narrator: "Hazrat Hudhayfah ibn al-Yaman (ra)",
    arabicText: "ثُمَّ تَكُونُ خِلاَفَةٌ عَلَى مِنْهَاجِ النُّبُوَّةِ، ثُمَّ سَكَتَ",
    englishTranslation: "Then there will emerge Khilafat upon the precept of prophethood (Khilafatan 'ala Minhaj-in-Nubuwwah), and then the Holy Prophet (sa) remained silent.",
    urduTranslation: "پھر نبوت کے طریقے پر خلافت قائم ہوگی، پھر آپ صلی اللہ علیہ وسلم خاموش ہو گئے۔",
    contextNote: "Divine prophecy announcing the permanent re-establishment of spiritual Khilafat in the Latter Days following the advent of the Promised Messiah (as).",
    topics: ["khilafat", "prophethood", "succession", "latter days", "خلافت", "خلافت علی منہاج النبوۃ"],
    url: "https://sunnah.com/ahmad:18406"
  },
  {
    id: "hadith-righteous-prophet-ibrahim",
    book: "Sunan Ibn Majah",
    chapter: "Kitab al-Jana'iz",
    hadithNumber: "1511",
    grade: "Sahih",
    narrator: "Hazrat Anas ibn Malik (ra)",
    arabicText: "لَوْ عَاشَ إِبْرَاهِيمُ لَكَانَ صِدِّيقًا نَبِيًّا",
    englishTranslation: "Upon the demise of his infant son Ibrahim, the Holy Prophet (sa) stated: 'Had Ibrahim lived, he would have been a truthful prophet.'",
    urduTranslation: "آنحضرت صلی اللہ علیہ وسلم نے اپنے صاحبزادے حضرت ابراہیم کی وفات پر فرمایا: اگر ابراہیم زندہ رہتا تو وہ ایک سچا نبی ہوتا۔",
    contextNote: "Demonstrates that Khatam-e-Nabuwwat does not preclude subordinate, spiritual non-law-bearing prophethood within the Prophet's spiritual household.",
    topics: ["khatam-e-nabuwwat", "prophethood", "ibrahim", "ختم نبوت", "نبوت"],
    url: "https://sunnah.com/ibnmajah:1511"
  },

  // ── Women, Parents & Ethics ──
  {
    id: "hadith-paradise-beneath-mothers",
    book: "Sunan an-Nasa'i",
    chapter: "Kitab al-Jihad",
    hadithNumber: "3104",
    grade: "Hasan Sahih",
    narrator: "Hazrat Mu'awiyah ibn Jahima (ra)",
    arabicText: "فَالْزَمْهَا فَإِنَّ الْجَنَّةَ تَحْتَ رِجْلَيْهَا",
    englishTranslation: "The Holy Prophet (sa) commanded a seeker: 'Remain devoted in the service of your mother, for surely Paradise lies beneath her feet.'",
    urduTranslation: "آپ صلی اللہ علیہ وسلم نے فرمایا: اپنی ماں کی خدمت کو لازم پکڑو کیونکہ یقیناً جنت اس کے قدموں تلے ہے۔",
    contextNote: "The golden standard of female reverence and filial duty in Islam, honoring maternal sacrifice above voluntary exploits.",
    topics: ["parents", "mother", "women", "paradise", "ethics", "ماں", "والدین", "جنت", "حقوق نسواں"],
    url: "https://sunnah.com/nasai:3104"
  },
  {
    id: "hadith-love-for-brother",
    book: "Sahih al-Bukhari",
    chapter: "Kitab al-Iman",
    hadithNumber: "13",
    grade: "Sahih",
    narrator: "Hazrat Anas ibn Malik (ra)",
    arabicText: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    englishTranslation: "None of you truly believes until he loves for his brother what he loves for himself.",
    urduTranslation: "تم میں سے کوئی شخص اس وقت تک مومن نہیں ہو سکتا جب تک کہ وہ اپنے بھائی کے لیے بھی وہی پسند نہ کرے جو اپنے لیے پسند کرتا ہے۔",
    contextNote: "The supreme Islamic universal ethic of empathy, fraternal love, and selfless benevolence.",
    topics: ["brotherhood", "faith", "love", "ethics", "justice", "ایمان", "اخوت", "محبت", "ہمدردی"],
    url: "https://sunnah.com/bukhari:13"
  }
];

/**
 * Searches Canonical Ahadith traditions
 */
export function searchHadithTraditions(query: string): HadithResult[] {
  const normQuery = normalizeTopicQuery(query);
  const words = normQuery.split(/\s+/).filter(w => w.length >= 2);
  if (words.length === 0) return [];

  let expandedTerms: string[] = [normQuery, ...words];
  for (const [topicKey, urduList] of Object.entries(THEOLOGICAL_TOPIC_MAP)) {
    if (normQuery.includes(topicKey) || topicKey.includes(normQuery)) {
      expandedTerms.push(topicKey, ...urduList);
    }
  }

  return THEMATIC_HADITH_COLLECTION.filter(h => {
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
}

/**
 * Searches Al Islam articles & topic guides
 */
export function searchAlIslamResources(query: string): AlIslamArticleResult[] {
  const normQuery = normalizeTopicQuery(query);
  const words = normQuery.split(/\s+/).filter(w => w.length >= 2);
  if (words.length === 0) return [];

  return ALISLAM_RESOURCES.filter(r => {
    const hay = `${r.title} ${r.summary} ${r.topics.join(' ')} ${r.author || ''}`.toLowerCase();
    return words.some(w => hay.includes(w)) || r.topics.some(t => t.toLowerCase().includes(normQuery));
  });
}

/**
 * Searches Review of Religions & Al Hakam publications
 */
export function searchPeriodicals(query: string): PublicationResult[] {
  const normQuery = normalizeTopicQuery(query);
  const words = normQuery.split(/\s+/).filter(w => w.length >= 2);
  if (words.length === 0) return [];

  return PERIODICAL_ARCHIVES.filter(p => {
    const hay = `${p.title} ${p.summary} ${p.topics.join(' ')} ${p.author || ''} ${p.source}`.toLowerCase();
    return words.some(w => hay.includes(w)) || p.topics.some(t => t.toLowerCase().includes(normQuery));
  });
}

/**
 * Finds pre-synthesized or matched theological dossier
 */
export function findTheologicalDossier(query: string): ResearchDossier | null {
  const clean = normalizeTopicQuery(query);
  for (const [key, dossier] of Object.entries(THEOLOGICAL_DOSSIERS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return dossier;
    }
    // Check against key keywords
    if (key === "marriage" && (clean.includes("marriage") || clean.includes("nikah") || clean.includes("wedding") || clean.includes("spouse") || clean.includes("wife") || clean.includes("husband") || clean.includes("divorce") || clean.includes("mehr") || clean.includes("walima") || clean.includes("نکاح") || clean.includes("ازدواج") || clean.includes("شادی"))) {
      return dossier;
    }
    if (key === "fasting" && (clean.includes("fasting") || clean.includes("fast") || clean.includes("roza") || clean.includes("ramadan") || clean.includes("ramzan") || clean.includes("sawm") || clean.includes("روزہ") || clean.includes("صوم") || clean.includes("رمضان"))) {
      return dossier;
    }
    if (key === "status of women" && (clean.includes("women") || clean.includes("woman") || clean.includes("purdah") || clean.includes("hijab") || clean.includes("modesty") || clean.includes("پردہ") || clean.includes("حجاب") || clean.includes("عورت"))) {
      return dossier;
    }
    if (key === "death of jesus" && (clean.includes("jesus") || clean.includes("isa") || clean.includes("cross") || clean.includes("وفات") || clean.includes("مسیح") || clean.includes("صلیب") || clean.includes("kashmir") || clean.includes("roza bal"))) {
      return dossier;
    }
    if (key === "khatam-e-nabuwwat" && (clean.includes("khatam") || clean.includes("prophet") || clean.includes("seal") || clean.includes("ختم") || clean.includes("نبوت") || clean.includes("ummati") || clean.includes("buruzi"))) {
      return dossier;
    }
    if (key === "philosophy of prayer" && (clean.includes("prayer") || clean.includes("dua") || clean.includes("دعا") || clean.includes("استجابت") || clean.includes("supplication"))) {
      return dossier;
    }
    if (key === "jihad of the pen" && (clean.includes("jihad") || clean.includes("war") || clean.includes("peace") || clean.includes("جہاد") || clean.includes("qalam"))) {
      return dossier;
    }
    if (key === "celestial signs & eclipses" && (clean.includes("eclipse") || clean.includes("darqutni") || clean.includes("moon") || clean.includes("sun") || clean.includes("ramadan") || clean.includes("کسوف") || clean.includes("خسوف") || clean.includes("علامت"))) {
      return dossier;
    }
    if (key === "khilafat" && (clean.includes("khilafat") || clean.includes("caliph") || clean.includes("wasiyyat") || clean.includes("خلافت") || clean.includes("خلیفہ") || clean.includes("istikhlaf"))) {
      return dossier;
    }
    if (key === "divine communion & revelation" && (clean.includes("revelation") || clean.includes("wahi") || clean.includes("communion") || clean.includes("mukalama") || clean.includes("الہام") || clean.includes("وحی"))) {
      return dossier;
    }
  }
  return null;
}

/**
 * Deterministic, instant Smart Scholarly Synthesizer (Zero AI, Pure Corpus Grounded)
 */
export function synthesizeSmartTheologicalResponse(
  query: string,
  rkMatches: RuhaniKhazainSearchResult[],
  quranMatches: QuranVerseResult[],
  alislamMatches: AlIslamArticleResult[],
  periodicalMatches: PublicationResult[]
): ResearchDossier | null {
  if (quranMatches.length === 0 && rkMatches.length === 0 && alislamMatches.length === 0 && periodicalMatches.length === 0) {
    return null;
  }

  const primaryQuran = quranMatches[0];
  const primaryRk = rkMatches[0];
  const primaryAlislam = alislamMatches[0];
  const primaryPeriodical = periodicalMatches[0];

  const title = `Scholarly Briefing: ${query.charAt(0).toUpperCase() + query.slice(1)}`;
  
  let theologicalThesis = "";
  if (primaryQuran?.commentaryNote) {
    theologicalThesis = primaryQuran.commentaryNote;
  } else if (primaryAlislam?.summary) {
    theologicalThesis = primaryAlislam.summary;
  } else if (primaryPeriodical?.summary) {
    theologicalThesis = primaryPeriodical.summary;
  } else if (primaryRk) {
    const rkSnippet = `${primaryRk.snippetBefore} ${primaryRk.matchedSlice} ${primaryRk.snippetAfter}`.trim();
    theologicalThesis = `Scholarly exposition in Ruhani Khazain (Vol. ${primaryRk.volume}, ${primaryRk.bookTitle}): "${rkSnippet.slice(0, 200)}..."`;
  } else {
    theologicalThesis = `Authoritative thematic citations and theological evidence identified across the Ahmadiyya corpus for "${query}".`;
  }

  const keyArguments: string[] = [];
  if (primaryQuran) {
    keyArguments.push(`Quranic Foundation: Established through Surah ${primaryQuran.surahNameEnglish} (${primaryQuran.surahNumber}:${primaryQuran.verseNumber}).`);
  }
  if (primaryRk) {
    keyArguments.push(`Promised Messiah's (as) Treatise: Addressed in "${primaryRk.bookTitle}" (Ruhani Khazain Vol. ${primaryRk.volume}).`);
  }
  if (primaryAlislam) {
    keyArguments.push(`Doctrinal Study: "${primaryAlislam.title}" (${primaryAlislam.category}).`);
  }
  if (primaryPeriodical) {
    keyArguments.push(`Historical Exposition: Published in ${primaryPeriodical.source}${primaryPeriodical.date ? ` (${primaryPeriodical.date})` : ''}.`);
  }

  const quranicEvidence = quranMatches.slice(0, 3).map(q => ({
    ref: `Surah ${q.surahNameEnglish} (${q.surahNumber}:${q.verseNumber})`,
    explanation: q.commentaryNote || q.englishTranslation
  }));

  const ruhaniKhazainCitations = rkMatches.slice(0, 3).map(r => {
    const textSnippet = `${r.snippetBefore} [${r.matchedSlice}] ${r.snippetAfter}`.trim();
    return {
      book: r.bookTitle,
      volume: r.volume,
      description: textSnippet ? `${textSnippet.slice(0, 160)}...` : `Comprehensive theological discourse in Volume ${r.volume}, page ${r.pageNum}.`
    };
  });

  return {
    topic: query,
    title,
    theologicalThesis,
    keyArguments,
    quranicEvidence: quranicEvidence.length > 0 ? quranicEvidence : undefined,
    ruhaniKhazainCitations: ruhaniKhazainCitations.length > 0 ? ruhaniKhazainCitations : undefined,
    hadithTraditions: [],
    counterArguments: []
  };
}

export { searchSunnahHadith } from './sunnah-hadith';
export type { BookItem } from './books-catalog';
export { AHMADIYYA_BOOKS_CATALOG, searchAhmadiyyaBooks } from './books-catalog';
