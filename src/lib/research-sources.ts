// Ahmadiyya Multi-Source Theological Knowledge Base & Search Index
import { normalizeKhazainText, THEOLOGICAL_TOPIC_MAP } from './khazain-data';

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
}

export interface AlIslamArticleResult {
  id: string;
  title: string;
  author?: string;
  category: 'Article' | 'Book' | 'Friday Sermon' | 'Q&A' | 'Topic Portal';
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

export interface MultiSourceSearchResult {
  query: string;
  normalizedTerms: string[];
  ruhaniKhazain: RuhaniKhazainSearchResult[];
  quranVerses: QuranVerseResult[];
  alislamArticles: AlIslamArticleResult[];
  publications: PublicationResult[];
  dossier?: ResearchDossier;
  totalResults: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HOLY QUR'AN THEMATIC INDEX (Sher Ali translation & Ahmadiyya Commentary)
// ─────────────────────────────────────────────────────────────────────────────
export const THEMATIC_QURAN_VERSES: QuranVerseResult[] = [
  {
    surahNumber: 4,
    verseNumber: 158,
    surahNameArabic: "النساء",
    surahNameEnglish: "Al-Nisa",
    arabicText: "وَقَوْلِهِمْ إِنَّا قَتَلْنَا الْمَسِيحَ عِيسَى ابْنَ مَرْيَمَ رَسُولَ اللَّهِ وَمَا قَتَلُوهُ وَمَا صَلَبُوهُ وَلَكِن شُبِّهَ لَهُمْ",
    englishTranslation: "And their saying, 'We did kill the Messiah, Jesus, son of Mary, the Messenger of Allah;' whereas they slew him not, nor did they crucify him, but he was made to appear to them like one crucified.",
    urduTranslation: "اور ان کے اس قول کی وجہ سے کہ ہم نے اللہ کے رسول مسیح عیسیٰ ابن مریم کو قتل کر دیا، حالانکہ انہوں نے نہ اسے قتل کیا اور نہ اسے سولی پر چڑھایا بلکہ ان کے لیے معاملہ مشتبہ کر دیا گیا",
    commentaryNote: "Crucial proof that Jesus (as) survived the ordeal of the cross ('Ma Salabu'). Crucifixion signifies dying upon the cross. Jesus was saved alive in fulfillment of the Sign of Jonah.",
    topics: ["death of jesus", "crucifixion", "cross", "jesus", "isa", "salb", "وفات مسیح", "صلیب", "عیسیٰ"],
    url: "https://www.alislam.org/quran/4:158"
  },
  {
    surahNumber: 3,
    verseNumber: 56,
    surahNameArabic: "آل عمران",
    surahNameEnglish: "Al-e-Imran",
    arabicText: "إِذْ قَالَ اللَّهُ يَا عِيسَىٰ إِنِّي مُتَوَفِّيكَ وَرَافِعُكَ إِلَيَّ وَمُطَهِّرُكَ مِنَ الَّذِينَ كَفَرُوا",
    englishTranslation: "When Allah said, 'O Jesus, I will cause thee to die a natural death, and will exalt thee to Myself, and will clear thee from the charges of those who disbelieve.'",
    urduTranslation: "جب اللہ نے کہا اے عیسیٰ! میں تجھے طبعی موت دوں گا اور اپنی طرف تیرا رفع درجات کروں گا اور کافروں کے الزامات سے تجھے پاک کروں گا",
    commentaryNote: "The term 'Tawaffa' when God is the subject and a conscious being is the object always denotes taking the soul or causing natural death, followed by spiritual exaltation (Rafa).",
    topics: ["death of jesus", "tawaffa", "ascension", "rafa", "وفات مسیح", "توفی", "رفع عیسیٰ"],
    url: "https://www.alislam.org/quran/3:56"
  },
  {
    surahNumber: 5,
    verseNumber: 118,
    surahNameArabic: "المائدة",
    surahNameEnglish: "Al-Ma'idah",
    arabicText: "فَلَمَّا تَوَفَّيْتَنِي كُنتَ أَنتَ الرَّقِيبَ عَلَيْهِمْ وَأَنتَ عَلَىٰ كُلِّ شَيْءٍ شَهِيدٌ",
    englishTranslation: "'Since Thou didst cause me to die, Thou hast been the Watcher over them; and Thou art Witness over all things.'",
    urduTranslation: "پھر جب تو نے مجھے وفات دے دی تو تو ہی ان کا نگہبان تھا اور تو ہر چیز پر گواہ ہے",
    commentaryNote: "Jesus (as) testifies on Judgment Day that corruption occurred only after his death ('Tawaffaytani'), proving he has already passed away and has not witnessed Christian doctrine in bodily form.",
    topics: ["death of jesus", "tawaffa", "christianity", "shirk", "وفات مسیح", "توفیتنی"],
    url: "https://www.alislam.org/quran/5:118"
  },
  {
    surahNumber: 33,
    verseNumber: 41,
    surahNameArabic: "الأحزاب",
    surahNameEnglish: "Al-Ahzab",
    arabicText: "مَّا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِّن رِّجَالِكُمْ وَلَكِن رَّسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ وَكَانَ اللَّهُ بِكُلِّ شَيْءٍ عَلِيمًا",
    englishTranslation: "Muhammad is not the father of any of your men, but he is the Messenger of Allah and the Seal of the Prophets; and Allah has full knowledge of all things.",
    urduTranslation: "محمد (صلی اللہ علیہ وسلم) تمہارے مَردوں میں سے کسی کے باپ نہیں مگر وہ اللہ کے رسول ہیں اور تمام نبیوں کی مہر ہیں",
    commentaryNote: "Khatam-an-Nabiyyin designates the Holy Prophet Muhammad (sa) as the zenith and spiritual seal whose spiritual emulation alone grants blessings and through whose obedience subordinate non-law-bearing prophethood is sustained.",
    topics: ["seal of prophets", "khatam", "khatam-e-nabuwwat", "prophethood", "finality", "ختم نبوت", "خاتم النبیین", "نبوت"],
    url: "https://www.alislam.org/quran/33:41"
  },
  {
    surahNumber: 4,
    verseNumber: 70,
    surahNameArabic: "النساء",
    surahNameEnglish: "Al-Nisa",
    arabicText: "وَمَن يُطِعِ اللَّهَ وَالرَّسُولَ فَأُولَٰئِكَ مَعَ الَّذِينَ أَنْعَمَ اللَّهُ عَلَيْهِم مِّنَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ وَالصَّالِحِينَ",
    englishTranslation: "And whoso obeys Allah and this Messenger of His shall be among those on whom Allah has bestowed His blessings, namely, the Prophets, the Truthful, the Martyrs, and the Righteous.",
    urduTranslation: "اور جو اللہ اور اس رسول کی اطاعت کرے تو وہ ان لوگوں کے ساتھ ہوں گے جن پر اللہ نے انعام کیا یعنی انبیاء، صدیقین، شہداء اور صالحین",
    commentaryNote: "Explicit Quranic guarantee that obedience to the Holy Prophet (sa) opens the spiritual ranks of Siddiq, Shahid, Salih, and subordinate Prophet.",
    topics: ["prophethood", "obedience", "continuation of blessings", "ummati nabi", "نبوت", "اطاعت رسول"],
    url: "https://www.alislam.org/quran/4:70"
  },
  {
    surahNumber: 62,
    verseNumber: 3,
    surahNameArabic: "الجمعة",
    surahNameEnglish: "Al-Jumu'ah",
    arabicText: "هُوَ الَّذِي بَعَثَ فِي الْأُمِّيِّينَ رَسُولًا مِّنْهُمْ يَتْلُو عَلَيْهِمْ آيَاتِهِ وَيُزَكِّيهِمْ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ",
    englishTranslation: "He it is Who has raised among the Unlettered people a Messenger from among themselves, who recites unto them His Signs, and purifies them, and teaches them the Book and wisdom.",
    urduTranslation: "وہی ہے جس نے اُمّیوں میں انہی میں سے ایک رسول بھیجا جو ان پر اس کی آیات تلاوت کرتا ہے اور انہیں پاک کرتا ہے",
    commentaryNote: "Coupled with verse 4 ('Wa Akhareena Minhum Lamma Yalhaqoo Bihim') prophesying the Latter-Day advent of the Promised Messiah (as) in spiritual reflection (Buruz) of the Holy Prophet (sa).",
    topics: ["second coming", "promised messiah", "latter days", "mahdi", "مسیح موعود", "ظہور ثانی", "بروز"],
    url: "https://www.alislam.org/quran/62:3"
  },
  {
    surahNumber: 2,
    verseNumber: 187,
    surahNameArabic: "البقرة",
    surahNameEnglish: "Al-Baqarah",
    arabicText: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ",
    englishTranslation: "And when My servants ask thee about Me, say: 'I am near. I answer the prayer of the supplicant when he prays to Me. So they should hearken to Me and believe in Me, that they may follow the right way.'",
    urduTranslation: "اور جب میرے بندے تجھ سے میرے متعلق سوال کریں تو یقیناً میں قریب ہوں۔ میں دعا کرنے والے کی دعا قبول کرتا ہوں جب وہ مجھ سے دعا کرے",
    commentaryNote: "The foundational Islamic principle that Allah is a Living God who listens and responds to fervent prayer ('Istijabat-e-Dua').",
    topics: ["prayer", "dua", "acceptance of prayer", "existence of god", "دعا", "قبولیت دعا", "وجود باری تعالیٰ"],
    url: "https://www.alislam.org/quran/2:187"
  },
  {
    surahNumber: 22,
    verseNumber: 40,
    surahNameArabic: "الحج",
    surahNameEnglish: "Al-Hajj",
    arabicText: "أُذِنَ لِلَّذِينَ يُقَاتَلُونَ بِأَنَّهُمْ ظُلِمُوا وَإِنَّ اللَّهَ عَلَىٰ نَصْرِهِمْ لَقَدِيرٌ",
    englishTranslation: "Permission to fight is given to those against whom war is made, because they have been wronged, and Allah indeed has power to help them.",
    urduTranslation: "ان لوگوں کو جن کے خلاف جنگ چھیڑی جا رہی ہے لڑنے کی اجازت دی گئی ہے کیونکہ ان پر ظلم کیا گیا، اور یقیناً اللہ ان کی مدد پر قادر ہے",
    commentaryNote: "The Charter of Religious Freedom in Islam: Defensive warfare was permitted solely when innocent believers and houses of worship (cloisters, churches, synagogues, mosques) were endangered.",
    topics: ["jihad", "war", "peace", "religious freedom", "defense", "جہاد", "امن", "دفاع"],
    url: "https://www.alislam.org/quran/22:40"
  },
  {
    surahNumber: 23,
    verseNumber: 51,
    surahNameArabic: "المؤمنون",
    surahNameEnglish: "Al-Mu'minun",
    arabicText: "وَجَعَلْنَا ابْنَ مَرْيَمَ وَأُمَّهُ آيَةً وَآوَيْنَاهُمَا إِلَىٰ رَبْوَةٍ ذَاتِ قَرَارٍ وَمَعِينٍ",
    englishTranslation: "And We made the son of Mary and his mother a Sign, and gave them refuge on an elevated land, a place of quiet and springs of running water.",
    urduTranslation: "اور ہم نے ابن مریم اور اس کی ماں کو ایک نشان بنایا اور ہم نے ان دونوں کو ایک اونچی، پرسکون اور بہتے چشموں والی سرسبز جگہ پر پناہ دی",
    commentaryNote: "Prophesies Jesus (as) and Mary's migration following the cross to a fertile highland plateau with clear streams, historically fulfilled in Kashmir (the valley of Srinagar).",
    topics: ["jesus in india", "kashmir", "tomb", "migration", "death of jesus", "مزار عیسیٰ", "کشمیر", "ہجرت عیسیٰ"],
    url: "https://www.alislam.org/quran/23:51"
  },
  {
    surahNumber: 81,
    verseNumber: 7,
    surahNameArabic: "التکویر",
    surahNameEnglish: "At-Takwir",
    arabicText: "وَإِذَا النُّفُوسُ زُوِّجَتْ",
    englishTranslation: "And when people are brought together (united through modern communication and transport).",
    urduTranslation: "اور جب نفوس باہم ملائے جائیں گے",
    commentaryNote: "Prophecy of the latter-day globalized world, internet, global communication networks, and the universal mission of the Promised Messiah (as).",
    topics: ["latter days", "signs", "prophecy", "globalization", "علامات قیامت", "پیشگوئیاں"],
    url: "https://www.alislam.org/quran/81:7"
  }
];

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

/**
 * Searches Holy Qur'an thematic verses
 */
export function searchQuranVerses(query: string): QuranVerseResult[] {
  const normQuery = normalizeTopicQuery(query);
  const words = normQuery.split(/\s+/).filter(w => w.length >= 2);
  if (words.length === 0) return [];

  // Check alias mappings
  let expandedTerms: string[] = [normQuery, ...words];
  for (const [topicKey, urduList] of Object.entries(THEOLOGICAL_TOPIC_MAP)) {
    if (normQuery.includes(topicKey) || topicKey.includes(normQuery)) {
      expandedTerms.push(topicKey, ...urduList);
    }
  }

  return THEMATIC_QURAN_VERSES.filter(v => {
    return expandedTerms.some(term => {
      const termLower = term.toLowerCase();
      return (
        v.topics.some(t => t.toLowerCase().includes(termLower) || termLower.includes(t.toLowerCase())) ||
        v.englishTranslation.toLowerCase().includes(termLower) ||
        v.urduTranslation.includes(term) ||
        v.arabicText.includes(term) ||
        (v.commentaryNote && v.commentaryNote.toLowerCase().includes(termLower)) ||
        `${v.surahNumber}:${v.verseNumber}` === termLower
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
