// Canonical Holy Qur'an Corpus & Cross-Lingual Semantic Search Engine
// Supports: Exact Word, Translations, Transliterations, and Synonyms in Arabic, Urdu, and English

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

export interface SemanticConceptEntry {
  concept: string;
  englishTerms: string[];
  urduTerms: string[];
  arabicTerms: string[];
  transliterations: string[];
}

/**
 * Normalizes Arabic text by removing diacritical marks (tashkeel/harakat),
 * tatweel, and standardizing varied letter forms (alif, ya, ta marbuta).
 */
export function normalizeArabicForSearch(text: string): string {
  if (!text) return "";
  return text
    // Remove Arabic diacritics / tashkeel
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    // Remove tatweel / kashida
    .replace(/\u0640/g, "")
    // Normalize alif forms
    .replace(/[أإآٱ]/g, "ا")
    // Normalize ya / alif maqsura
    .replace(/ى/g, "ي")
    // Normalize ta marbuta
    .replace(/ة/g, "ه")
    // Standardize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes Urdu text for robust scriptural matching
 */
export function normalizeUrduForSearch(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/ے/g, "ی")
    .replace(/[ہۂ]/g, "ه")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes English text
 */
export function normalizeEnglishForSearch(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Multi-lingual Semantic Lexicon:
 * Connects English synonyms, Urdu translations & synonyms,
 * Arabic translations, roots & Quranic vocabulary, and common phonetic transliterations.
 */
export const QURAN_SEMANTIC_LEXICON: SemanticConceptEntry[] = [
  {
    concept: "marriage",
    englishTerms: [
      "marriage", "marry", "married", "marrying", "matrimony", "wedding", "spousal",
      "wedlock", "spouse", "spouses", "husband", "wife", "wives", "consort", "mate",
      "mates", "garment", "garments", "chastity", "single", "bachelor", "dower",
      "dowry", "mehr", "bride", "groom", "companion", "companionship", "family"
    ],
    urduTerms: [
      "نکاح", "شادی", "ازدواج", "عقد", "بیوی", "شوہر", "خاندان", "زوجین",
      "ولیمہ", "مہر", "حق مہر", "زوج", "زوجہ", "طہارت", "مجرد", "پاکدامنی"
    ],
    arabicTerms: [
      "نكاح", "ازواج", "زوج", "بعل", "اهل", "عقد", "حلائل", "نساء",
      "حصان", "محصنات", "صدقاتهن", "نحلة", "مودة", "لتسكنوا", "الايامى", "لباس"
    ],
    transliterations: [
      "nikah", "nikaah", "nekaah", "shadi", "shaadi", "azdawaj", "zawj", "zawja",
      "mehr", "mahr", "walima", "waleema", "aqd", "libas", "mawaddah", "sukun"
    ]
  },
  {
    concept: "patience",
    englishTerms: [
      "patience", "patient", "steadfast", "steadfastness", "perseverance", "endurance",
      "forbearance", "constancy", "endure", "persevere", "persevering", "unshakeable"
    ],
    urduTerms: [
      "صبر", "استقامت", "برداشت", "ثبات قدم", "صابر", "صابرین", "ثابت قدم", "حلم"
    ],
    arabicTerms: [
      "صبر", "اصبروا", "صابرين", "صابور", "استقامة", "صابرون", "رابطوا", "تفلحون"
    ],
    transliterations: [
      "sabr", "saber", "sabir", "sabireen", "istiqamat", "isbiru", "sabar"
    ]
  },
  {
    concept: "forgiveness",
    englishTerms: [
      "forgiveness", "forgive", "forgiving", "pardon", "pardoning", "remission",
      "absolution", "clemency", "overlook", "excuse", "mercy", "repentance", "sin"
    ],
    urduTerms: [
      "مغفرت", "بخشش", "معافی", "توبہ", "استغفار", "عفو", "درگزر", "غفور", "معاف"
    ],
    arabicTerms: [
      "مغفرة", "غفور", "استغفار", "توبة", "عفو", "غفران", "يعفو", "يغفر",
      "تواب", "فاغفر", "الغفار", "توبوا"
    ],
    transliterations: [
      "istighfar", "maghfirah", "maghfirat", "ghafur", "afw", "tawbah", "tauba", "astaghfirullah"
    ]
  },
  {
    concept: "mercy",
    englishTerms: [
      "mercy", "merciful", "compassion", "compassionate", "grace", "gracious",
      "benevolence", "kindness", "tender", "tenderness", "affection", "loving"
    ],
    urduTerms: [
      "رحمت", "رحم", "شفقت", "فضل", "کرم", "رحیم", "رحمن", "مہربانی", "عنایت"
    ],
    arabicTerms: [
      "رحمة", "رحيم", "رحمن", "رافة", "رءوف", "فضل", "ارحم", "الراحمين", "مودة"
    ],
    transliterations: [
      "rahmah", "rehmat", "rahim", "raheem", "rahman", "rehman", "rauf", "arham"
    ]
  },
  {
    concept: "prayer",
    englishTerms: [
      "prayer", "pray", "praying", "supplication", "supplicant", "worship", "invocation",
      "petition", "salat", "namaz", "devotion", "remembrance", "prostration", "bowing",
      "near", "call", "beseech"
    ],
    urduTerms: [
      "دعا", "نماز", "صلوٰۃ", "عبادت", "تضرع", "استجابت دعا", "مناجات", "ذکر",
      "سجدہ", "رکوع", "قبولیت دعا", "قریب"
    ],
    arabicTerms: [
      "دعاء", "صلاة", "صلوة", "عبادة", "تضرع", "قنوت", "ادعوني", "استجب",
      "سجود", "ركوع", "ذكر", "اقم الصلاة", "قريب"
    ],
    transliterations: [
      "dua", "duaa", "namaz", "salat", "salah", "salaat", "ibadah", "tazarru",
      "sajdah", "ruku", "zikr", "dhikr", "istijabat"
    ]
  },
  {
    concept: "fasting",
    englishTerms: [
      "fasting", "fast", "fasts", "abstinence", "ramadan", "ramadhan", "ramzan",
      "shield", "hunger", "thirst", "destiny", "night of decree", "night of power"
    ],
    urduTerms: [
      "روزہ", "روزے", "صوم", "سیام", "رمضان", "رمضان المبارک", "سحری", "افطاری",
      "شب قدر", "لیلۃ القدر", "پرہیزگاری"
    ],
    arabicTerms: [
      "صوم", "صيام", "الصيام", "رمضان", "ليلة القدر", "فليصمه", "كتب عليكم الصيام"
    ],
    transliterations: [
      "sawm", "saum", "siyam", "roza", "roze", "ramadan", "ramzan", "ramadhan", "laylatul qadr"
    ]
  },
  {
    concept: "parents",
    englishTerms: [
      "parents", "father", "mother", "maternal", "paternal", "kindred", "filial",
      "childhood", "upbringing", "old age", "respect", "honour"
    ],
    urduTerms: [
      "والدین", "ماں باپ", "ماں", "باپ", "والد", "والدہ", "امی", "ابو",
      "حسن سلوک", "بڑھاپا", "خدمت"
    ],
    arabicTerms: [
      "والدين", "والد", "والدة", "اب", "ام", "ابوان", "بر الوالدين", "كرها", "وهنا"
    ],
    transliterations: [
      "walidain", "walidayn", "walid", "walidah", "abawain"
    ]
  },
  {
    concept: "charity",
    englishTerms: [
      "charity", "alms", "zakat", "poor-rate", "sadaqah", "giving", "spend", "spending",
      "benevolence", "welfare", "needy", "poor", "wealth", "destitute", "wayfarer",
      "usury", "interest", "riba"
    ],
    urduTerms: [
      "زکوٰۃ", "صدقہ", "صدقات", "خیرات", "انفاق", "سخاوت", "امداد", "مساکین",
      "غرباء", "فقراء", "ربا", "سود", "مال"
    ],
    arabicTerms: [
      "زكاة", "صدقة", "صدقات", "انفاق", "ينفقون", "فقراء", "مساكين",
      "سبيل الله", "الربا", "اموال"
    ],
    transliterations: [
      "zakat", "zakah", "zakaat", "sadaqah", "sadqa", "infaq", "riba", "fuqara", "masakeen"
    ]
  },
  {
    concept: "justice",
    englishTerms: [
      "justice", "just", "equity", "fairness", "impartiality", "witness", "witnesses",
      "truth", "truthful", "veracity", "honesty", "right", "scale", "balance"
    ],
    urduTerms: [
      "عدل", "انصاف", "قسط", "سچائی", "حق", "راستی", "گواہی", "دیانت",
      "امانت", "صادقین", "سچ", "میزان"
    ],
    arabicTerms: [
      "عدل", "قسط", "حق", "ميزان", "شهداء", "اعدلوا", "صدق", "صادقين", "الحق"
    ],
    transliterations: [
      "adl", "qist", "haqq", "haq", "sidq", "sadiq", "sadiqin", "shuhada", "mizan"
    ]
  },
  {
    concept: "knowledge",
    englishTerms: [
      "knowledge", "know", "knowing", "learning", "wisdom", "wise", "insight",
      "understanding", "scholar", "scholars", "pen", "read", "intellect", "reflect"
    ],
    urduTerms: [
      "علم", "حکمت", "دانائی", "معرفت", "بصیرت", "عالم", "علماء", "قلم",
      "پڑھو", "سمجھ", "غور و فکر"
    ],
    arabicTerms: [
      "علم", "حكمة", "علماء", "يعلمون", "اقرا", "القلم", "الباب", "فهم", "بصيرة"
    ],
    transliterations: [
      "ilm", "hikmah", "hikmat", "alim", "ulama", "iqra", "qalam", "tadabbur"
    ]
  },
  {
    concept: "modesty",
    englishTerms: [
      "modesty", "modest", "chastity", "chaste", "veil", "veils", "hijab", "purdah",
      "gaze", "decency", "honor", "private parts", "purity", "eyes"
    ],
    urduTerms: [
      "حیا", "پردہ", "حجاب", "طہارت", "پاکدامنی", "عفت", "نگاہ نیچی", "غض بصر", "شرمگاہ"
    ],
    arabicTerms: [
      "حياء", "عفاف", "حجاب", "جلابيبهن", "خمرهن", "يغضوا", "ابصارهم", "فروجهم", "محصنات"
    ],
    transliterations: [
      "haya", "purdah", "parda", "hijab", "ghadul basar", "iffat", "taharat"
    ]
  },
  {
    concept: "peace",
    englishTerms: [
      "peace", "peaceful", "reconciliation", "safety", "security", "calm", "serenity",
      "brotherhood", "harmony", "treaty", "tranquility"
    ],
    urduTerms: [
      "امن", "سلامتی", "صلح", "سلام", "سکون", "اطمینان", "آشتی", "بھائی چارہ", "اخوت"
    ],
    arabicTerms: [
      "سلام", "سلم", "صلح", "سكينة", "امن", "امان", "اخوة", "الف", "حبل الله"
    ],
    transliterations: [
      "salam", "salaam", "silm", "sulh", "sakina", "sukun", "ukhuwwah"
    ]
  },
  {
    concept: "death",
    englishTerms: [
      "death", "die", "dying", "mortal", "mortality", "passing", "demise", "soul",
      "souls", "spirit", "resurrection", "grave", "barrier", "barzakh", "natural death"
    ],
    urduTerms: [
      "موت", "وفات", "انتقال", "اجل", "توفی", "روح", "نفوس", "برزخ", "قبر", "حشر", "مرنا"
    ],
    arabicTerms: [
      "موت", "وفاة", "توفی", "متوفيك", "توفيتني", "اجل", "نفس", "روح", "برزخ", "يبعثون", "يميتكم"
    ],
    transliterations: [
      "mawt", "mot", "wafat", "tawaffa", "tawaffaytani", "ruh", "rooh", "nafs", "barzakh"
    ]
  },
  {
    concept: "paradise",
    englishTerms: [
      "paradise", "heaven", "garden", "gardens", "bliss", "eternal", "rivers",
      "delight", "reward", "peaceful abode"
    ],
    urduTerms: [
      "جنت", "بہشت", "باغ", "فردوس", "نعمت", "نہریں", "انعام", "جنت الفردوس"
    ],
    arabicTerms: [
      "جنة", "جنات", "فردوس", "نعيم", "عدن", "انهار", "دار السلام"
    ],
    transliterations: [
      "jannah", "jannat", "firdaws", "firdaus", "naim", "adn"
    ]
  },
  {
    concept: "hell",
    englishTerms: [
      "hell", "fire", "punishment", "torment", "chastisement", "blaze", "doom", "retribution"
    ],
    urduTerms: [
      "جہنم", "دوزخ", "عذاب", "آگ", "نار", "سزا"
    ],
    arabicTerms: [
      "نار", "جهنم", "عذاب", "سعير", "حريق", "لظى", "مرصادا"
    ],
    transliterations: [
      "jahannam", "dozakh", "azab", "adhab", "nar", "naar", "sair"
    ]
  },
  {
    concept: "tawheed",
    englishTerms: [
      "god", "allah", "lord", "creator", "oneness", "unity", "monotheism", "independent",
      "deity", "worship", "alone", "one"
    ],
    urduTerms: [
      "خدا", "اللہ", "رب", "توحید", "باری تعالیٰ", "خالق", "معبود", "لا الہ الا اللہ", "یکتا"
    ],
    arabicTerms: [
      "الله", "رب", "الواحد", "الاحد", "الصمد", "توحيد", "لا اله الا الله", "الخالق", "القيوم"
    ],
    transliterations: [
      "tawheed", "tauheed", "allah", "khuda", "rabb", "ahad", "samad", "qayyum"
    ]
  },
  {
    concept: "jihad",
    englishTerms: [
      "jihad", "strive", "striving", "struggle", "defense", "defensive", "fighting",
      "war", "religious freedom", "compulsion", "pen", "great striving"
    ],
    urduTerms: [
      "جہاد", "کوشش", "جدوجہد", "دفاع", "لڑائی", "جنگ", "امن", "جہاد اکبر", "جہاد بالقلم", "لا اکراہ"
    ],
    arabicTerms: [
      "جهاد", "جاهدوا", "يقاتلون", "سبيل الله", "حرب", "لا اكراه في الدين", "جهادا كبيرا"
    ],
    transliterations: [
      "jihad", "jehad", "mujahid", "harb", "qital"
    ]
  },
  {
    concept: "prophethood",
    englishTerms: [
      "prophet", "prophets", "prophethood", "messenger", "messengers", "seal of prophets",
      "apostle", "warners", "covenant", "obedience", "continuation"
    ],
    urduTerms: [
      "نبی", "انبیاء", "رسول", "رسل", "نبوت", "رسالت", "خاتم النبیین", "ختم نبوت",
      "امتی نبی", "پیغمبر", "اطاعت"
    ],
    arabicTerms: [
      "نبي", "انبياء", "رسول", "رسل", "نبوة", "رسالة", "خاتم النبيين", "ميثاق النبيين"
    ],
    transliterations: [
      "nabi", "anbiya", "rasul", "rusul", "nabuwwat", "khatam", "khatam-un-nabiyyin", "khatme nabuwwat"
    ]
  },
  {
    concept: "khilafat",
    englishTerms: [
      "khilafat", "caliphate", "caliph", "successor", "successors", "succession",
      "second manifestation", "promise"
    ],
    urduTerms: [
      "خلافت", "خلیفہ", "خلفاء", "جانشین", "نیابت", "قدرت ثانیہ"
    ],
    arabicTerms: [
      "خلافة", "خليفة", "خلفاء", "ليستخلفنهم"
    ],
    transliterations: [
      "khilafat", "caliphate", "khalifa", "khulafa", "istikhlaf"
    ]
  },
  {
    concept: "jesus",
    englishTerms: [
      "jesus", "isa", "messiah", "christ", "mary", "crucifixion", "cross",
      "survived", "kashmir", "tomb", "natural death"
    ],
    urduTerms: [
      "عیسیٰ", "مسیح", "ابن مریم", "مریم", "صلیب", "سولی", "وفات مسیح", "کشمیر", "مزار عیسیٰ"
    ],
    arabicTerms: [
      "عيسى", "المسيح", "ابن مريم", "صلبوه", "شبه لهم", "متوفيك", "توفيتني", "ربوة"
    ],
    transliterations: [
      "isa", "eesa", "masih", "maseeh", "maryam", "salb", "saleeb", "tawaffa"
    ]
  },
  {
    concept: "gratitude",
    englishTerms: [
      "gratitude", "thankful", "thankfulness", "thanks", "grateful", "praise", "favors", "bounties"
    ],
    urduTerms: [
      "شکر", "احسان مندی", "حمد", "سپاس", "شکرگزاری", "نعمتیں", "فضل"
    ],
    arabicTerms: [
      "شكر", "شاكرين", "لازيدنكم", "حمد", "الحمد لله", "اشكروا"
    ],
    transliterations: [
      "shukr", "shakir", "shakireen", "hamd", "alhamdulillah"
    ]
  },
  {
    concept: "humility",
    englishTerms: [
      "arrogance", "arrogant", "pride", "proud", "haughtiness", "haughty", "humility", "humble", "boastful"
    ],
    urduTerms: [
      "تکبر", "غرور", "سرکشی", "خود پسندی", "عاجزی", "انکساری", "فخر"
    ],
    arabicTerms: [
      "كبر", "استكبار", "مختال", "فخور", "هونا", "مرحا"
    ],
    transliterations: [
      "kibr", "takabbur", "ghuroor", "inqisari", "ajizi"
    ]
  },
  {
    concept: "trust",
    englishTerms: [
      "trust", "trusts", "covenant", "covenants", "pledge", "promise", "promises", "treaty", "faithful"
    ],
    urduTerms: [
      "امانت", "امانتیں", "عہد", "وعدہ", "میثاق", "پیمان", "وفا", "پاسداری"
    ],
    arabicTerms: [
      "امانة", "امانات", "عهد", "ميثاق", "وعد", "اوفوا"
    ],
    transliterations: [
      "amanah", "ahd", "meesaq", "waada", "wafa"
    ]
  },
  {
    concept: "creation",
    englishTerms: [
      "creation", "universe", "cosmos", "heavens", "earth", "sun", "moon", "stars",
      "orbit", "expanding", "nature", "big bang", "signs"
    ],
    urduTerms: [
      "تخلیق", "پیدائش", "کائنات", "آسمان", "زمین", "سورج", "چاند", "ستارے", "فلک", "مدار", "وسعت"
    ],
    arabicTerms: [
      "خلق", "سماوات", "ارض", "شمس", "قمر", "فلك", "موسعون", "رتقا", "ففتقناهما"
    ],
    transliterations: [
      "khalq", "samawat", "ard", "shams", "qamar", "falak"
    ]
  },
  {
    concept: "taqwa",
    englishTerms: [
      "righteousness", "righteous", "piety", "pious", "god-fearing", "taqwa", "virtue", "virtuous", "fear"
    ],
    urduTerms: [
      "تقویٰ", "پرہیزگاری", "نیکی", "صالح", "صالحین", "متقی", "خوف خدا"
    ],
    arabicTerms: [
      "تقوى", "تتقون", "متقين", "صالحين", "بر", "اتقوا"
    ],
    transliterations: [
      "taqwa", "muttaqi", "muttaqeen", "salih", "saliheen", "birr"
    ]
  }
];

/**
 * Helper to match an English or Latin concept term with query tokens or exact strings
 */
function matchConcept(queryNormalized: string, termNormalized: string): boolean {
  if (!queryNormalized || !termNormalized) return false;
  if (queryNormalized === termNormalized) return true;
  const qTokens = queryNormalized.split(/\s+/);
  if (qTokens.includes(termNormalized)) return true;
  const tTokens = termNormalized.split(/\s+/);
  if (tTokens.length > 1 && queryNormalized.includes(termNormalized)) return true;
  if (queryNormalized.length >= 4 && termNormalized.length >= 4) {
    if (queryNormalized.startsWith(termNormalized) || termNormalized.startsWith(queryNormalized)) {
      return true;
    }
  }
  return false;
}

/**
 * Helper to match Arabic or Urdu terms, handling optional definite article 'ال' (al-)
 */
function matchArabicOrUrduConcept(queryNormalized: string, termNormalized: string): boolean {
  if (!queryNormalized || !termNormalized) return false;
  if (queryNormalized === termNormalized) return true;

  const qTokens = queryNormalized.split(/\s+/);
  if (qTokens.includes(termNormalized)) return true;

  const tTokens = termNormalized.split(/\s+/);
  if (tTokens.length > 1 && queryNormalized.includes(termNormalized)) return true;

  const stripAl = (s: string) => (s.startsWith("ال") && s.length > 3 ? s.slice(2) : s);
  const qClean = stripAl(queryNormalized);
  const tClean = stripAl(termNormalized);
  if (qClean === tClean) return true;
  if (qTokens.map(stripAl).includes(tClean)) return true;

  return false;
}

/**
 * Expands any search query into related cross-lingual synonyms,
 * translations, and transliterations using the semantic lexicon.
 */
export function expandQuranQuery(query: string): {
  normalizedQuery: string;
  exactTerms: string[];
  expandedTerms: string[];
  arabicTerms: string[];
  urduTerms: string[];
} {
  const normEnglish = normalizeEnglishForSearch(query);
  const normArabic = normalizeArabicForSearch(query);
  const normUrdu = normalizeUrduForSearch(query);

  const exactTerms = new Set<string>();
  if (query.trim()) exactTerms.add(query.trim());
  if (normEnglish) exactTerms.add(normEnglish);
  if (normArabic) exactTerms.add(normArabic);
  if (normUrdu) exactTerms.add(normUrdu);

  // Individual tokens
  const tokens = query.split(/[\s,;:._-]+/).filter(t => t.length >= 2);
  tokens.forEach(t => exactTerms.add(t));

  const expandedTerms = new Set<string>();
  const arabicTerms = new Set<string>();
  const urduTerms = new Set<string>();

  // Check matching concepts in the lexicon
  for (const entry of QURAN_SEMANTIC_LEXICON) {
    let matches = false;

    // Check English synonyms & concept
    if (normEnglish) {
      for (const term of entry.englishTerms) {
        if (matchConcept(normEnglish, term.toLowerCase())) {
          matches = true;
          break;
        }
      }

      // Check transliterations
      if (!matches) {
        for (const trans of entry.transliterations) {
          if (matchConcept(normEnglish, trans.toLowerCase())) {
            matches = true;
            break;
          }
        }
      }
    }

    // Check Urdu terms
    if (!matches && normUrdu) {
      for (const urdu of entry.urduTerms) {
        const cleanUrdu = normalizeUrduForSearch(urdu);
        if (matchArabicOrUrduConcept(normUrdu, cleanUrdu)) {
          matches = true;
          break;
        }
      }
    }

    // Check Arabic terms
    if (!matches && normArabic) {
      for (const ar of entry.arabicTerms) {
        const cleanAr = normalizeArabicForSearch(ar);
        if (matchArabicOrUrduConcept(normArabic, cleanAr)) {
          matches = true;
          break;
        }
      }
    }

    if (matches) {
      entry.englishTerms.forEach(t => expandedTerms.add(t));
      entry.transliterations.forEach(t => expandedTerms.add(t));
      entry.urduTerms.forEach(t => {
        urduTerms.add(t);
        expandedTerms.add(t);
      });
      entry.arabicTerms.forEach(t => {
        arabicTerms.add(t);
        expandedTerms.add(t);
        expandedTerms.add(normalizeArabicForSearch(t));
      });
    }
  }

  return {
    normalizedQuery: normEnglish || normUrdu || normArabic,
    exactTerms: Array.from(exactTerms),
    expandedTerms: Array.from(expandedTerms),
    arabicTerms: Array.from(arabicTerms),
    urduTerms: Array.from(urduTerms)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL HOLY QUR'AN DATASET (Sher Ali translation & Ahmadiyya Commentary)
// ─────────────────────────────────────────────────────────────────────────────
export const QURAN_CORPUS: QuranVerseResult[] = [
  // ── 1. Matrimony, Marriage & Family Life ──
  {
    surahNumber: 30,
    verseNumber: 22,
    surahNameArabic: "الروم",
    surahNameEnglish: "Al-Rum",
    arabicText: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ",
    englishTranslation: "And one of His Signs is this: that He has created for you wives from among yourselves that you may find peace of mind in them, and He has put love and tenderness between you. In that surely are Signs for a people who reflect.",
    urduTranslation: "اور اس کے نشانات میں سے یہ ہے کہ اس نے تمہارے لیے تمہاری ہی جنس سے جوڑے بنائے تاکہ تم ان سے سکون حاصل کرو اور اس نے تمہارے درمیان محبت اور رحمت پیدا کر دی۔ یقیناً اس میں غور و فکر کرنے والوں کے لیے بہت سے نشانات ہیں",
    commentaryNote: "The Quranic definition of matrimonial purpose: psychological tranquility (Sukun), mutual love (Mawaddah), and reciprocal mercy (Rahmah). Marriage is a divine sign reflecting God's benevolence.",
    topics: ["marriage", "nikah", "wedding", "spouse", "wife", "husband", "family", "love", "peace", "نکاح", "ازدواج", "شادی", "زوجہ", "محبت", "سکون"],
    url: "https://www.alislam.org/quran/30:22"
  },
  {
    surahNumber: 2,
    verseNumber: 188,
    surahNameArabic: "البقرة",
    surahNameEnglish: "Al-Baqarah",
    arabicText: "أُحِلَّ لَكُمْ لَيْلَةَ الصِّيَامِ الرَّفَثُ إِلَىٰ نِسَائِكُمْ هُنَّ لِبَاسٌ لَّكُمْ وَأَنتُمْ لِبَاسٌ لَّهُنَّ",
    englishTranslation: "They are a garment for you, and you are a garment for them.",
    urduTranslation: "وہ تمہارے لیے لباس ہیں اور تم ان کے لیے لباس ہو",
    commentaryNote: "The profound metaphor of garments (Libas): Spouses protect each other's honor, provide mutual warmth and beauty, conceal human frailties, and serve as close companions.",
    topics: ["marriage", "spouse", "husband", "wife", "libas", "nikah", "family", "نکاح", "لباس", "زوجین", "شوہر", "بیوی"],
    url: "https://www.alislam.org/quran/2:188"
  },
  {
    surahNumber: 4,
    verseNumber: 20,
    surahNameArabic: "النساء",
    surahNameEnglish: "Al-Nisa",
    arabicText: "وَعَاشِرُوهُنَّ بِالْمَعْرُوفِ فَإِن كَرِهْتُمُوهُنَّ فَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَيَجْعَلَ اللَّهُ فِيهِ خَيْرًا كَثِيرًا",
    englishTranslation: "And consort with them in kindness; and if you dislike them, it may be that you dislike a thing wherein Allah has placed much good.",
    urduTranslation: "اور ان کے ساتھ اچھے طریقے سے زندگی بسر کرو، اور اگر تم انہیں ناپسند کرو تو عین ممکن ہے کہ تم ایک چیز کو ناپسند کرو اور اللہ اس میں بہت سی بھلائی رکھ دے",
    commentaryNote: "The fundamental commandment of 'Mu'asharat bil-Ma'ruf' (benevolent companionship): Men are commanded to treat their wives with gentleness, patience, and honor regardless of personal moods.",
    topics: ["marriage", "wife", "husband", "kindness", "family", "rights of women", "nikah", "حسن سلوک", "عورتوں کے حقوق", "نکاح"],
    url: "https://www.alislam.org/quran/4:20"
  },
  {
    surahNumber: 24,
    verseNumber: 33,
    surahNameArabic: "النور",
    surahNameEnglish: "Al-Nur",
    arabicText: "وَأَنكِحُوا الْأَيَامَىٰ مِنكُمْ وَالصَّالِحِينَ مِنْ عِبَادِكُمْ وَإِمَائِكُمْ إِن يَكُونُوا فُقَرَاءَ يُغْنِهِمُ اللَّهُ مِن فَضْلِهِ وَاللَّهُ وَاسِعٌ عَلِيمٌ",
    englishTranslation: "And marry those among you who are single, and the righteous of your male and female servants. If they be poor, Allah will grant them means out of His grace; and Allah is Bountiful, All-Knowing.",
    urduTranslation: "اور تم میں سے جو مجرد ہوں ان کے نکاح کر دیا کرو اور اپنے غلاموں اور لونڈیوں میں سے جو نیک ہوں ان کے بھی۔ اگر وہ نادار ہوں گے تو اللہ اپنے فضل سے انہیں غنی کر دے گا اور اللہ بڑی وسعت والا اور دائمی علم رکھنے والا ہے",
    commentaryNote: "Islam encourages universal matrimony, condemning involuntary bachelorhood and celibacy. Financial hardship should not hinder marriage, as Allah guarantees blessings and provision to the righteous.",
    topics: ["marriage", "nikah", "celibacy", "chastity", "provision", "نکاح", "شادی", "طہارت"],
    url: "https://www.alislam.org/quran/24:33"
  },
  {
    surahNumber: 4,
    verseNumber: 5,
    surahNameArabic: "النساء",
    surahNameEnglish: "Al-Nisa",
    arabicText: "وَآتُوا النِّسَاءَ صَدُقَاتِهِنَّ نِحْلَةً فَإِن طِبْنَ لَكُمْ عَن شَيْءٍ مِّنْهُ نَفْسًا فَكُلُوهُ هَنِيئًا مَّرِيئًا",
    englishTranslation: "And give women their dowries (Mehr) as a free gift; but if they of their own pleasure remit any part thereof to you, take it and consume it with good pleasure.",
    urduTranslation: "اور عورتوں کو ان کے مہر خوش دلی سے دیا کرو، پھر اگر وہ اپنی خوشی سے اس میں سے کچھ تمہیں چھوڑ دیں تو اسے مزے سے کھاؤ",
    commentaryNote: "The obligation of Mehr (dower): An unconditional financial settlement owned solely by the bride, underscoring female financial autonomy and dignity in Islam.",
    topics: ["mehr", "dowry", "marriage", "women", "rights of women", "nikah", "مہر", "حق مہر", "نکاح"],
    url: "https://www.alislam.org/quran/4:5"
  },
  {
    surahNumber: 25,
    verseNumber: 75,
    surahNameArabic: "الفرقان",
    surahNameEnglish: "Al-Furqan",
    arabicText: "وَالَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    englishTranslation: "And those who say: 'Our Lord, grant us of our spouses and our children the delight of our eyes, and make us a leader for the righteous.'",
    urduTranslation: "اور وہ جو دعا کرتے ہیں کہ اے ہمارے رب! ہمیں ہمارے جیون ساتھیوں اور ہماری اولاد سے آنکھوں کی ٹھنڈک عطا کر اور ہمیں متقیوں کا امام بنا",
    commentaryNote: "The quintessential Quranic prayer for marital felicity and the spiritual righteousness of progeny.",
    topics: ["marriage", "children", "family", "prayer", "righteousness", "spouse", "نکاح", "اولاد", "خاندان", "دعا"],
    url: "https://www.alislam.org/quran/25:75"
  },

  // ── 2. Prayer & Supplication (Dua, Salat, Namaz) ──
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
    surahNumber: 40,
    verseNumber: 61,
    surahNameArabic: "المؤمن",
    surahNameEnglish: "Al-Mu'min",
    arabicText: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ إِنَّ الَّذِينَ يَسْتَكْبِرُونَ عَنْ عِبَادَتِي سَيَدْخُلُونَ جَهَنَّمَ دَاخِرِينَ",
    englishTranslation: "And your Lord said: 'Pray unto Me; I will answer your prayer.' Surely, those who are too proud to worship Me will enter Hell, despised.",
    urduTranslation: "اور تمہارے رب نے فرمایا مجھ سے دعا کرو میں تمہاری دعا قبول کروں گا۔ یقیناً جو لوگ میری عبادت سے تکبر کرتے ہیں وہ عنقریب ذلیل ہو کر جہنم میں داخل ہوں گے",
    commentaryNote: "Direct divine invitation to invoke God; supplication is equated with the very core of true worship.",
    topics: ["prayer", "dua", "supplication", "worship", "humility", "دعا", "استجابت دعا", "عبادت"],
    url: "https://www.alislam.org/quran/40:61"
  },
  {
    surahNumber: 29,
    verseNumber: 46,
    surahNameArabic: "العنكبوت",
    surahNameEnglish: "Al-Ankabut",
    arabicText: "اتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ وَأَقِمِ الصَّلَاةَ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ وَلَذِكْرُ اللَّهِ أَكْبَرُ",
    englishTranslation: "Recite that which has been revealed to thee of the Book, and observe Prayer. Surely, Prayer restrains one from indecency and that which is uncongenial; and the remembrance of Allah is the greatest virtue.",
    urduTranslation: "کتاب میں سے جو تیری طرف وحی کی گئی ہے اس کی تلاوت کر اور نماز قائم کر۔ یقیناً نماز بے حیائی اور ناپسندیدہ باتوں سے روکتی ہے اور یقیناً اللہ کا ذکر سب سے بڑا ہے",
    commentaryNote: "The transformative moral power of Salat: Regular congregation and conscious remembrance shield the believer from moral and spiritual decay.",
    topics: ["prayer", "namaz", "salat", "worship", "remembrance", "نماز", "صلوٰۃ", "ذکر الٰہی"],
    url: "https://www.alislam.org/quran/29:46"
  },
  {
    surahNumber: 27,
    verseNumber: 63,
    surahNameArabic: "النمل",
    surahNameEnglish: "Al-Naml",
    arabicText: "أَمَّن يُجِيبُ الْمُضْطَرَّ إِذَا دَعَاهُ وَيَكْشِفُ السُّوءَ وَيَجْعَلُكُمْ خُلَفَاءَ الْأَرْضِ أَإِلَٰهٌ مَّعَ اللَّهِ قَلِيلًا مَّا تَذَكَّرُونَ",
    englishTranslation: "Or, Who answers the distressed soul when he calls on Him and relieves the sorrow, and makes you successors in the earth? Is there a God besides Allah? Little is it that you reflect!",
    urduTranslation: "بھلا کون ہے جو بے قرار کی دعا سنتا ہے جب وہ اسے پکارے اور اس کی تکلیف دور کرتا ہے اور تمہیں زمین کے جانشین بناتا ہے؟ کیا اللہ کے ساتھ کوئی دوسرا معبود بھی ہے؟",
    commentaryNote: "Allah uniquely responds to genuine distress (Iztirar) and saves the supplicant from deep calamity.",
    topics: ["prayer", "dua", "distress", "iztirar", "relief", "دعا", "اضطرار", "استجابت"],
    url: "https://www.alislam.org/quran/27:63"
  },

  // ── 3. Patience, Perseverance & Steadfastness (Sabr / Istiqamat) ──
  {
    surahNumber: 2,
    verseNumber: 154,
    surahNameArabic: "البقرة",
    surahNameEnglish: "Al-Baqarah",
    arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    englishTranslation: "O ye who believe! Seek help with patience and Prayer; surely, Allah is with the steadfast.",
    urduTranslation: "اے وہ لوگو جو ایمان لائے ہو! صبر اور نماز سے مدد چاہو۔ یقیناً اللہ صبر کرنے والوں کے ساتھ ہے",
    commentaryNote: "The twin pillars of spiritual and moral triumph in Islam: internal steadfast endurance (Sabr) coupled with divine petition (Salat).",
    topics: ["patience", "sabr", "steadfastness", "prayer", "salat", "صبر", "استقامت", "نماز"],
    url: "https://www.alislam.org/quran/2:154"
  },
  {
    surahNumber: 2,
    verseNumber: 156,
    surahNameArabic: "البقرة",
    surahNameEnglish: "Al-Baqarah",
    arabicText: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ وَبَشِّرِ الصَّابِرِينَ",
    englishTranslation: "And We will surely test you with something of fear and hunger, and loss of wealth and lives and fruits; but give glad tidings to the patient,",
    urduTranslation: "اور ہم ضرور تمہیں کچھ خوف اور بھوک اور اموال اور جانوں اور پھلوں کے نقصان سے آزمائیں گے اور صبر کرنے والوں کو خوشخبری دے دو",
    commentaryNote: "Life trials are divine catalysts for spiritual elevation. Those who remain patient through tribulation receive glad tidings of divine grace.",
    topics: ["patience", "sabr", "trials", "tribulations", "perseverance", "صبر", "آزمائش", "ثبات"],
    url: "https://www.alislam.org/quran/2:156"
  },
  {
    surahNumber: 3,
    verseNumber: 201,
    surahNameArabic: "آل عمران",
    surahNameEnglish: "Al-e-Imran",
    arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ",
    englishTranslation: "O ye who believe! Be steadfast and strive to excel in steadfastness and be on your guard and fear Allah that you may prosper.",
    urduTranslation: "اے لوگو جو ایمان لائے ہو! صبر کرو اور صبر میں دوسروں سے بازی لے جاؤ اور ہمہ وقت تیار رہو اور اللہ کا تقویٰ اختیار کرو تاکہ تم فلاح پاؤ",
    commentaryNote: "Commands believers to display collective endurance, mutual vigilance, and Taqwa to secure eternal prosperity.",
    topics: ["patience", "sabr", "steadfastness", "taqwa", "prosperity", "صبر", "استقامت", "تقویٰ"],
    url: "https://www.alislam.org/quran/3:201"
  },
  {
    surahNumber: 39,
    verseNumber: 11,
    surahNameArabic: "الزمر",
    surahNameEnglish: "Al-Zumar",
    arabicText: "قُلْ يَا عِبَادِ الَّذِينَ آمَنُوا اتَّقُوا رَبَّكُمْ لِلَّذِينَ أَحْسَنُوا فِي هَٰذِهِ الدُّنْيَا حَسَنَةٌ وَأَرْضُ اللَّهِ وَاسِعَةٌ إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ",
    englishTranslation: "...Verily, the steadfast shall have their reward given them without measure.",
    urduTranslation: "...یقیناً صبر کرنے والوں کو ان کا اجر بے حساب دیا جائے گا",
    commentaryNote: "While other good deeds carry defined rewards, the steadfast enduring hardship for Allah receive boundless, unmeasured blessings.",
    topics: ["patience", "sabr", "reward", "steadfastness", "صبر", "اجر", "استقامت"],
    url: "https://www.alislam.org/quran/39:11"
  },

  // ── 4. Forgiveness, Mercy & Repentance (Maghfirah / Rahmah / Tawbah) ──
  {
    surahNumber: 39,
    verseNumber: 54,
    surahNameArabic: "الزمر",
    surahNameEnglish: "Al-Zumar",
    arabicText: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ",
    englishTranslation: "Say, 'O My servants who have committed excesses against their own souls! Despair not of the mercy of Allah, surely Allah forgives all sins. Verily, He is Most Forgiving, Merciful.'",
    urduTranslation: "کہہ دے اے میرے بندو جنہوں نے اپنی جانوں پر زیادتی کی ہے! اللہ کی رحمت سے مایوس نہ ہو۔ یقیناً اللہ تمام گناہوں کو بخش دیتا ہے۔ یقیناً وہ بہت بخشنے والا اور بار بار رحم کرنے والا ہے",
    commentaryNote: "The most hope-inspiring verse in the Holy Quran, reassuring even the most grievous sinner of Allah's infinite forgiveness upon repentance.",
    topics: ["forgiveness", "mercy", "repentance", "hope", "sin", "مغفرت", "رحمت", "توبہ", "بخشش", "عفو"],
    url: "https://www.alislam.org/quran/39:54"
  },
  {
    surahNumber: 3,
    verseNumber: 135,
    surahNameArabic: "آل عمران",
    surahNameEnglish: "Al-e-Imran",
    arabicText: "الَّذِينَ يُنفِقُونَ فِي السَّرَّاءِ وَالضَّرَّاءِ وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ",
    englishTranslation: "Those who spend in prosperity and adversity, and those who suppress anger and pardon men; and Allah loves the doers of good.",
    urduTranslation: "وہ جو آسودگی اور تنگی دونوں حالتوں میں خرچ کرتے ہیں اور غصہ پی جانے والے ہیں اور لوگوں کو معاف کرنے والے ہیں، اور اللہ احسان کرنے والوں سے محبت کرتا ہے",
    commentaryNote: "Defines the lofty moral status of forgiving personal grievances, curbing natural rage, and conferring benevolence upon offenders.",
    topics: ["forgiveness", "pardon", "charity", "anger", "benevolence", "معافی", "عفو", "احسان", "درگزر"],
    url: "https://www.alislam.org/quran/3:135"
  },
  {
    surahNumber: 42,
    verseNumber: 26,
    surahNameArabic: "الشورى",
    surahNameEnglish: "Al-Shura",
    arabicText: "وَهُوَ الَّذِي يَقْبَلُ التَّوْبَةَ عَنْ عِبَادِهِ وَيَعْفُو عَنِ السَّيِّئَاتِ وَيَعْلَمُ مَا تَفْعَلُونَ",
    englishTranslation: "And He it is Who accepts repentance from His servants and forgives sins and knows what you do.",
    urduTranslation: "اور وہی ہے جو اپنے بندوں کی توبہ قبول کرتا ہے اور گناہوں کو معاف فرماتا ہے اور جانتا ہے جو تم کرتے ہو",
    commentaryNote: "Reaffirms that genuine remorse (Tawbah) washes away spiritual stains and restores intimacy with the Divine.",
    topics: ["repentance", "forgiveness", "tawbah", "sins", "توبہ", "مغفرت", "بخشش"],
    url: "https://www.alislam.org/quran/42:26"
  },
  {
    surahNumber: 7,
    verseNumber: 157,
    surahNameArabic: "الأعراف",
    surahNameEnglish: "Al-A'raf",
    arabicText: "وَاكْتُبْ لَنَا فِي هَٰذِهِ الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ إِنَّا هُدْنَا إِلَيْكَ قَالَ عَذَابِي أُصِيبُ بِهِ مَنْ أَشَاءُ وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ",
    englishTranslation: "...He said: 'As for My punishment, I afflict therewith whom I will, but My mercy encompasses all things...'",
    urduTranslation: "...اللہ نے فرمایا: میرا عذاب میں جس کو چاہوں پہنچاتا ہوں جبکہ میری رحمت ہر چیز پر محیط ہے...",
    commentaryNote: "Affirms the supremacy of divine grace: While punishment is specific and disciplinary, Allah's mercy is all-embracing and universal.",
    topics: ["mercy", "grace", "rahmah", "all-encompassing", "رحمت", "فضل", "کرم"],
    url: "https://www.alislam.org/quran/7:157"
  },

  // ── 5. Filial Piety & Parents (Walidain) ──
  {
    surahNumber: 17,
    verseNumber: 24,
    surahNameArabic: "الإسراء",
    surahNameEnglish: "Al-Isra",
    arabicText: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا",
    englishTranslation: "Thy Lord has commanded, 'Worship none but Him, and show kindness to parents. If one or both of them attain old age with thee, say not 'Fie' unto them nor chide them, but speak to them noble words.'",
    urduTranslation: "اور تیرے رب نے یہ حکم دیا ہے کہ تم اس کے سوا کسی کی عبادت نہ کرو اور والدین کے ساتھ حسن سلوک کرو۔ اگر ان میں سے کوئی ایک یا دونوں تیرے سامنے بڑھاپے کو پہنچ جائیں تو انہیں اف تک نہ کہو اور نہ انہیں جھڑکو اور ان سے ادب و احترام سے بات کرو",
    commentaryNote: "The golden Islamic standard of filial piety, placing benevolent care of parents immediately below the worship of Allah.",
    topics: ["parents", "family", "mother", "father", "kindness", "ethics", "والدین", "ماں باپ", "حسن سلوک", "خاندان"],
    url: "https://www.alislam.org/quran/17:24"
  },
  {
    surahNumber: 31,
    verseNumber: 15,
    surahNameArabic: "لقمان",
    surahNameEnglish: "Luqman",
    arabicText: "وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ وَفِصَالُهُ فِي عَامَيْنِ أَنِ اشْكُرْ لِي وَلِوَالِدَيْكَ إِلَيَّ الْمَصِيرُ",
    englishTranslation: "And We have enjoined on man concerning his parents—his mother bears him in weakness upon weakness, and his weaning is in two years—'Give thanks to Me and to thy parents. Unto Me is the final return.'",
    urduTranslation: "اور ہم نے انسان کو اس کے والدین کے متعلق تاکیدی نصیحت کی—اس کی ماں نے دکھ پر دکھ اٹھا کر اسے پیٹ میں رکھا اور اس کا دودھ چھڑانا دو سال میں ہوا—کہ میرا بھی شکر ادا کر اور اپنے والدین کا بھی۔ میری ہی طرف لوٹنا ہے",
    commentaryNote: "Highlights the extraordinary sacrifices of the mother in gestation and infancy, binding gratitude to parents directly with gratitude to Allah.",
    topics: ["parents", "mother", "father", "gratitude", "sacrifice", "والدین", "ماں", "شکر", "احسان"],
    url: "https://www.alislam.org/quran/31:15"
  },

  // ── 6. Charity, Social Welfare & Wealth (Zakat / Sadaqah / Infaq) ──
  {
    surahNumber: 2,
    verseNumber: 262,
    surahNameArabic: "البقرة",
    surahNameEnglish: "Al-Baqarah",
    arabicText: "مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ وَاللَّهُ يُضَاعِفُ لِمَن يَشَاءُ وَاللَّهُ وَاسِعٌ عَلِيمٌ",
    englishTranslation: "The similitude of those who spend their wealth in the way of Allah is as the similitude of a grain of corn which grows seven ears, in every ear a hundred grains. And Allah multiplies it further for whomsoever He pleases; and Allah is Bountiful, All-Knowing.",
    urduTranslation: "ان لوگوں کی مثال جو اپنے اموال اللہ کی راہ میں خرچ کرتے ہیں اس دانے کی سی ہے جس نے سات بالیں اگائیں، ہر بال میں سو دانے ہوں۔ اور اللہ جس کے لیے چاہتا ہے بڑھاتا ہے اور اللہ بڑی وسعت والا اور دائمی علم رکھنے والا ہے",
    commentaryNote: "The spiritual economics of charity: Spending with pure motives yields a 700-fold or infinite harvest in divine grace.",
    topics: ["charity", "zakat", "spending", "infaq", "wealth", "صدقہ", "انفاق", "سخاوت", "خیرات"],
    url: "https://www.alislam.org/quran/2:262"
  },
  {
    surahNumber: 9,
    verseNumber: 60,
    surahNameArabic: "التوبة",
    surahNameEnglish: "Al-Tawbah",
    arabicText: "إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ",
    englishTranslation: "The alms are only for the poor and the needy, and for those employed in connection therewith, and for those whose hearts are to be reconciled, and for the freeing of slaves, and for those in debt, and for the cause of Allah, and for the wayfarer.",
    urduTranslation: "صدقات تو محض فقراء اور مساکین کے لیے ہیں اور ان کے وصول کرنے والے کارکنوں کے لیے اور ان کے لیے جن کی تالیف قلب مقصود ہو اور گردنیں چھڑانے میں اور قرض داروں کے لیے اور اللہ کی راہ میں اور مسافر کے لیے",
    commentaryNote: "The eight constitutional categories of Zakat distribution establishing social welfare, debt alleviation, and human liberation.",
    topics: ["zakat", "charity", "alms", "sadaqah", "poverty", "social welfare", "زکوٰۃ", "صدقہ", "انفاق"],
    url: "https://www.alislam.org/quran/9:60"
  },
  {
    surahNumber: 3,
    verseNumber: 93,
    surahNameArabic: "آل عمران",
    surahNameEnglish: "Al-e-Imran",
    arabicText: "لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ وَمَا تُنفِقُوا مِن شَيْءٍ فَإِنَّ اللَّهَ بِهِ عَلِيمٌ",
    englishTranslation: "Never shall you attain to righteousness unless you spend out of that which you love; and whatever you spend, Allah surely knows it well.",
    urduTranslation: "تم ہرگز نیکی کو نہیں پہنچ سکتے جب تک تم اس میں سے خرچ نہ کرو جس سے تم محبت کرتے ہو۔ اور تم جو کچھ بھی خرچ کرو گے یقیناً اللہ اس کا پورا علم رکھنے والا ہے",
    commentaryNote: "True piety requires parting with cherished possessions for the welfare of others, eradicating materialism from the heart.",
    topics: ["charity", "righteousness", "sacrifice", "spending", "infaq", "نیکی", "انفاق", "قربانی"],
    url: "https://www.alislam.org/quran/3:93"
  },

  // ── 7. Fasting & Ramadan (Sawm / Roza) ──
  {
    surahNumber: 2,
    verseNumber: 184,
    surahNameArabic: "البقرة",
    surahNameEnglish: "Al-Baqarah",
    arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
    englishTranslation: "O ye who believe! Fasting is prescribed for you, as it was prescribed for those before you, that you may become righteous and attain Taqwa.",
    urduTranslation: "اے وہ لوگو جو ایمان لائے ہو! تم پر روزے اسی طرح فرض کیے گئے ہیں جس طرح تم سے پہلوں پر فرض کیے گئے تھے تاکہ تم تقویٰ اختیار کرو",
    commentaryNote: "Fasting is a universal spiritual discipline instituted across religions to restrain base desires and attain the ultimate station of Taqwa.",
    topics: ["fasting", "roza", "ramadan", "taqwa", "sawm", "روزہ", "صوم", "تقویٰ", "رمضان"],
    url: "https://www.alislam.org/quran/2:184"
  },
  {
    surahNumber: 2,
    verseNumber: 186,
    surahNameArabic: "البقرة",
    surahNameEnglish: "Al-Baqarah",
    arabicText: "شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ",
    englishTranslation: "The month of Ramadan is that in which the Qur'an was sent down as a guidance for mankind with clear proofs of guidance and discrimination. Therefore, whosoever of you is present at home in this month, let him fast therein.",
    urduTranslation: "رمضان کا مہینہ وہ ہے جس میں قرآن انسانوں کے لیے کھلی کھلی رہنمائی اور حق و باطل میں امتیاز کے واضح دلائل کے ساتھ نازل کیا گیا۔ پس تم میں سے جو بھی اس مہینے میں موجود ہو وہ اس کے روزے رکھے",
    commentaryNote: "The sacred connection between Ramadan and the revelation of the Holy Quran, designating the month as a time of intensive scriptural reflection.",
    topics: ["ramadan", "quran", "fasting", "guidance", "رمضان", "قرآن", "روزہ", "ہدایت"],
    url: "https://www.alislam.org/quran/2:186"
  },
  {
    surahNumber: 97,
    verseNumber: 1,
    surahNameArabic: "القدر",
    surahNameEnglish: "Al-Qadr",
    arabicText: "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ",
    englishTranslation: "Surely, We sent it down on the Night of Destiny. And what should make thee know what the Night of Destiny is? The Night of Destiny is better than a thousand months.",
    urduTranslation: "یقیناً ہم نے اسے شب قدر میں اتارا ہے۔ اور تجھے کیا معلوم کہ شب قدر کیا ہے؟ شب قدر ہزار مہینوں سے بہتر ہے",
    commentaryNote: "The Night of Decree represents both the annual spiritual culmination of Ramadan and the grand spiritual era of a Prophet's advent.",
    topics: ["laylatul qadr", "ramadan", "night of decree", "fasting", "شب قدر", "لیلۃ القدر", "رمضان"],
    url: "https://www.alislam.org/quran/97:1"
  },

  // ── 8. Absolute Justice, Honesty & Truth (Adl / Qist / Sidq) ──
  {
    surahNumber: 4,
    verseNumber: 136,
    surahNameArabic: "النساء",
    surahNameEnglish: "Al-Nisa",
    arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ بِالْقِسْطِ شُهَدَاءَ لِلَّهِ وَلَوْ عَلَىٰ أَنفُسِكُمْ أَوِ الْوَالِدَيْنِ وَالْأَقْرَبِينَ إِن يَكُنْ غَنِيًّا أَوْ فَقِيرًا فَاللَّهُ أَوْلَىٰ بِهِمَا",
    englishTranslation: "O ye who believe! Be strict in observing justice, and be witnesses for Allah, even though it be against yourselves or against parents and kindred. Whether he be rich or poor, Allah is more regardful of them both than you are.",
    urduTranslation: "اے لوگو جو ایمان لائے ہو! انصاف پر مضبوطی سے قائم رہتے ہوئے اللہ کی خاطر گواہ بن جاؤ خواہ خود اپنے خلاف ہو یا والدین اور قریبی رشتہ داروں کے خلاف ہو، خواہ کوئی امیر ہو یا غریب، اللہ ہی ان دونوں کا سب سے زیادہ خیر خواہ ہے",
    commentaryNote: "The uncompromising Quranic charter of absolute justice (Adl): Integrity supersedes all familial and self-serving bias.",
    topics: ["justice", "honesty", "truth", "witness", "morality", "عدل", "انصاف", "سچائی"],
    url: "https://www.alislam.org/quran/4:136"
  },
  {
    surahNumber: 5,
    verseNumber: 9,
    surahNameArabic: "المائدة",
    surahNameEnglish: "Al-Ma'idah",
    arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ لِلَّهِ شُهَدَاءَ بِالْقِسْطِ وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ",
    englishTranslation: "O ye who believe! Be steadfast in the cause of Allah, bearing witness in equity; and let not a people's enmity incite you to act otherwise than with justice. Be always just, that is nearer to righteousness.",
    urduTranslation: "اے لوگو جو ایمان لائے ہو! اللہ کی خاطر مضبوطی سے کھڑے ہوتے ہوئے انصاف کے ساتھ گواہی دینے والے بن جاؤ اور کسی قوم کی دشمنی تمہیں اس بات پر آمادہ نہ کرے کہ تم عدل نہ کرو۔ ہمیشہ عدل کرو، یہ تقویٰ کے سب سے زیادہ قریب ہے",
    commentaryNote: "The summit of Islamic ethics: Hostility from adversaries must never justify prejudice or unjust retaliation.",
    topics: ["justice", "equity", "fairness", "taqwa", "enemies", "عدل", "انصاف", "قسط", "تقویٰ"],
    url: "https://www.alislam.org/quran/5:9"
  },
  {
    surahNumber: 16,
    verseNumber: 91,
    surahNameArabic: "النحل",
    surahNameEnglish: "Al-Nahl",
    arabicText: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ وَيَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ وَالْبَغْيِ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ",
    englishTranslation: "Verily, Allah enjoins justice, and the doing of good to others, and giving like kindred; and forbids indecency, and manifest evil, and wrongful transgression. He admonishes you that you may take heed.",
    urduTranslation: "یقیناً اللہ عدل کا اور احسان کا اور قریبی رشتہ داروں کی طرح دینے کا حکم دیتا ہے اور بے حیائی اور ناپسندیدہ باتوں اور سرکشی سے روکتا ہے۔ وہ تمہیں نصیحت کرتا ہے تاکہ تم عبرت پکڑو",
    commentaryNote: "The master architectural verse of Islamic ethics recited in every Friday sermon, defining the 3 ascending stages of virtue: Adl (justice), Ihsan (beneficence), and Ita'i Dhil Qurba (unconditional spontaneous love).",
    topics: ["justice", "ihsan", "ethics", "benevolence", "kinship", "عدل", "احسان", "حسن اخلاق"],
    url: "https://www.alislam.org/quran/16:91"
  },
  {
    surahNumber: 9,
    verseNumber: 119,
    surahNameArabic: "التوبة",
    surahNameEnglish: "Al-Tawbah",
    arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ",
    englishTranslation: "O ye who believe! Fear Allah and be with the truthful.",
    urduTranslation: "اے لوگو جو ایمان لائے ہو! اللہ کا تقویٰ اختیار کرو اور سچوں کے ساتھ ہو جاؤ",
    commentaryNote: "Spiritual purification requires not only personal truthfulness but active companionship with truthful, guided souls (Sadiqin).",
    topics: ["truth", "truthfulness", "honesty", "taqwa", "companionship", "سچائی", "صدق", "صادقین", "تقویٰ"],
    url: "https://www.alislam.org/quran/9:119"
  },

  // ── 9. Knowledge, Wisdom & Intellectual Inquiry (Ilm / Hikmah) ──
  {
    surahNumber: 20,
    verseNumber: 115,
    surahNameArabic: "طه",
    surahNameEnglish: "Ta-Ha",
    arabicText: "فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ وَلَا تَعْجَلْ بِالْقُرْآنِ مِن قَبْلِ أَن يُقْضَىٰ إِلَيْكَ وَحْيُهُ وَقُل رَّبِّ زِدْنِي عِلْمًا",
    englishTranslation: "...And say, 'O my Lord, increase me in knowledge.'",
    urduTranslation: "...اور دعا کیا کر کہ اے میرے رب! میرے علم میں اضافہ فرما",
    commentaryNote: "The eternal prayer for intellectual and spiritual illumination, commanding perpetual learning and humility.",
    topics: ["knowledge", "learning", "wisdom", "prayer", "ilm", "علم", "حکمت", "دعا", "دانائی"],
    url: "https://www.alislam.org/quran/20:115"
  },
  {
    surahNumber: 2,
    verseNumber: 270,
    surahNameArabic: "البقرة",
    surahNameEnglish: "Al-Baqarah",
    arabicText: "يُؤْتِي الْحِكْمَةَ مَن يَشَاءُ وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا وَمَا يَذَّكَّرُ إِلَّا أُولُو الْأَلْبَابِ",
    englishTranslation: "He grants wisdom to whom He pleases, and whoever is granted wisdom has indeed been granted abundant good; and none take heed except those endowed with understanding.",
    urduTranslation: "وہ جس کو چاہتا ہے حکمت عطا فرماتا ہے اور جسے حکمت دی جائے تو اسے بہت زیادہ بھلائی عطا کی گئی، اور نصیحت صرف وہی پکڑتے ہیں جو عقل و فہم والے ہیں",
    commentaryNote: "Wisdom (Hikmah) is defined as the crowning spiritual treasure, harmonizing profound spiritual truth with rational clarity.",
    topics: ["wisdom", "knowledge", "understanding", "hikmah", "حکمت", "علم", "دانائی"],
    url: "https://www.alislam.org/quran/2:270"
  },
  {
    surahNumber: 96,
    verseNumber: 1,
    surahNameArabic: "العلق",
    surahNameEnglish: "Al-Alaq",
    arabicText: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ اقْرَأْ وَرَبُّكَ الْأَكْرَمُ الَّذِي عَلَّمَ بِالْقَلَمِ عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ",
    englishTranslation: "Read in the name of thy Lord Who created; created man from a clot. Read, and thy Lord is the Most Bounteous, Who taught by the pen, taught man what he knew not.",
    urduTranslation: "اپنے اس رب کے نام کے ساتھ پڑھ جس نے پیدا کیا۔ اس نے انسان کو ایک لوتھڑے سے پیدا کیا۔ پڑھ اور تیرا رب سب سے زیادہ عزت والا ہے جس نے قلم کے ذریعے سکھایا، انسان کو وہ سکھایا جو وہ نہ جانتا تھا",
    commentaryNote: "The primordial first revelation inaugurating Islam with literacy, scientific research, and intellectual enlightenment.",
    topics: ["knowledge", "read", "pen", "creation", "science", "علم", "قلم", "پڑھو", "اقرا"],
    url: "https://www.alislam.org/quran/96:1"
  },

  // ── 10. Modesty, Chastity & Decency (Haya / Purdah / Hijab) ──
  {
    surahNumber: 24,
    verseNumber: 31,
    surahNameArabic: "النور",
    surahNameEnglish: "Al-Nur",
    arabicText: "قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ذَٰلِكَ أَزْكَىٰ لَهُمْ إِنَّ اللَّهَ خَبِيرٌ بِمَا يَصْنَعُونَ",
    englishTranslation: "Say to the believing men that they restrain their eyes and guard their private parts. That is purer for them. Surely, Allah is well aware of what they do.",
    urduTranslation: "مومن مردوں سے کہہ دے کہ وہ اپنی نگاہیں نیچی رکھیں اور اپنی شرمگاہوں کی حفاظت کریں۔ یہ ان کے لیے زیادہ پاکیزہ ہے۔ یقیناً اللہ اس سے خوب باخبر ہے جو وہ کرتے ہیں",
    commentaryNote: "The injunction of modesty (Ghad-ul-Basar): Restraining glances is mandated for men prior to women, establishing mutual responsibility in maintaining social purity.",
    topics: ["modesty", "purdah", "hijab", "chastity", "eyes", "حیا", "پردہ", "طہارت", "غض بصر"],
    url: "https://www.alislam.org/quran/24:31"
  },
  {
    surahNumber: 24,
    verseNumber: 32,
    surahNameArabic: "النور",
    surahNameEnglish: "Al-Nur",
    arabicText: "وَقُل لِّلْمُؤْمِنَاتِ يَغْضُضْنَ مِنْ أَبْصَارِهِنَّ وَيَحْفَظْنَ فُرُوجَهُنَّ وَلَا يُبْدِينَ زِينَتَهُنَّ إِلَّا مَا ظَهَرَ مِنْهَا وَلْيَضْرِبْنَ بِخُمُرِهِنَّ عَلَىٰ جُيُوبِهِنَّ",
    englishTranslation: "And say to the believing women that they restrain their eyes and guard their private parts, and that they display not their beauty except that which is apparent thereof, and that they draw their head-coverings over their bosoms...",
    urduTranslation: "اور مومن عورتوں سے کہہ دے کہ وہ بھی اپنی نگاہیں نیچی رکھا کریں اور اپنی شرمگاہوں کی حفاظت کریں اور اپنی زینت کو ظاہر نہ کریں سوائے اس کے جو خود ظاہر ہو جائے اور اپنے دوپٹے اپنے گریبانوں پر ڈالے رکھیں...",
    commentaryNote: "Establishes female modesty and dignity, shielding women from predatory gazes and objectification.",
    topics: ["modesty", "hijab", "purdah", "women", "chastity", "حجاب", "پردہ", "حیا", "پاکدامنی"],
    url: "https://www.alislam.org/quran/24:32"
  },

  // ── 11. Peace, Reconciliation & Global Brotherhood (Salam / Sulh) ──
  {
    surahNumber: 49,
    verseNumber: 11,
    surahNameArabic: "الحجرات",
    surahNameEnglish: "Al-Hujurat",
    arabicText: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُرْحَمُونَ",
    englishTranslation: "Surely all believers are brothers; so make peace between your two brothers, and fear Allah that mercy may be shown to you.",
    urduTranslation: "یقیناً مومن سب بھائی بھائی ہیں۔ پس اپنے دو بھائیوں کے درمیان صلح کروا دیا کرو اور اللہ کا تقویٰ اختیار کرو تاکہ تم پر رحم کیا جائے",
    commentaryNote: "Universal brotherhood transcending tribe, race, and nationality; mandates active arbitration and reconciliation in disputes.",
    topics: ["peace", "brotherhood", "reconciliation", "unity", "اخوت", "صلح", "امن", "بھائی چارہ"],
    url: "https://www.alislam.org/quran/49:11"
  },
  {
    surahNumber: 41,
    verseNumber: 35,
    surahNameArabic: "حم السجدة",
    surahNameEnglish: "Ha-Mim Al-Sajdah",
    arabicText: "وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ",
    englishTranslation: "And good and evil are not alike. Repel evil with that which is best. And lo, he between whom and thee was enmity will become as though he were a warm friend.",
    urduTranslation: "اور نیکی اور بدی برابر نہیں ہو سکتیں۔ بدی کو ایسی چیز سے دور کر جو بہترین ہو۔ تب اچانک وہ شخص جس کے اور تیرے درمیان دشمنی تھی ایسا ہو جائے گا جیسے وہ جگری دوست ہو",
    commentaryNote: "The supreme strategy of moral diplomacy: Overcoming hatred through radiant kindness transforms sworn adversaries into loyal companions.",
    topics: ["peace", "kindness", "enemies", "forgiveness", "ethics", "امن", "حسن سلوک", "صلح", "محبت"],
    url: "https://www.alislam.org/quran/41:35"
  },

  // ── 12. Life, Death, Soul & Resurrection (Mawt / Wafat / Rooh) ──
  {
    surahNumber: 3,
    verseNumber: 186,
    surahNameArabic: "آل عمران",
    surahNameEnglish: "Al-e-Imran",
    arabicText: "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ الْقِيَامَةِ فَمَن زُحْزِحَ عَنِ النَّارِ وَأُدْخِلَ الْجَنَّةَ فَقَدْ فَازَ وَمَا الْحَيَاةُ الدُّنْيَا إِلَّا مَتَاعُ الْغُرُورِ",
    englishTranslation: "Every soul shall taste of death; and you shall only be paid your full reward on the Day of Resurrection. Then whoso is saved from the Fire and is made to enter the Garden has indeed attained his goal. And the life of this world is nothing but an illusion of enjoyment.",
    urduTranslation: "ہر جان موت کا ذائقہ چکھنے والی ہے اور تمہیں تمہارے پورے پورے اجر قیامت کے دن ہی دیے جائیں گے۔ پس جو آگ سے بچا لیا گیا اور جنت میں داخل کر دیا گیا تو وہ کامیاب ہو گیا اور دنیا کی زندگی تو محض دھوکے کا سامان ہے",
    commentaryNote: "Universal mortal law: Physical life is finite and probationary; true salvation consists in deliverance from spiritual fire into the Garden.",
    topics: ["death", "soul", "resurrection", "afterlife", "paradise", "hell", "موت", "وفات", "قیامت", "آخرت", "جنت"],
    url: "https://www.alislam.org/quran/3:186"
  },
  {
    surahNumber: 89,
    verseNumber: 28,
    surahNameArabic: "الفجر",
    surahNameEnglish: "Al-Fajr",
    arabicText: "يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً فَادْخُلِي فِي عِبَادِي وَادْخُلِي جَنَّتِي",
    englishTranslation: "O thou soul at peace! Return unto thy Lord, well pleased with Him and He well pleased with thee. So enter thou among My chosen servants, and enter thou My Garden.",
    urduTranslation: "اے اطمینان پانے والی روح! اپنے رب کی طرف لوٹ آ، تو اس سے راضی وہ تجھ سے راضی۔ پس میرے برگزیدہ بندوں میں شامل ہو جا اور میری جنت میں داخل ہو جا",
    commentaryNote: "The culmination of spiritual evolution: The purified soul attains permanent tranquility (Al-Nafs al-Mutma'innah) and eternal union with Allah.",
    topics: ["soul", "peace", "death", "paradise", "afterlife", "روح", "نفس مطمئنہ", "موت", "جنت"],
    url: "https://www.alislam.org/quran/89:28"
  },

  // ── 13. Natural Demise of Jesus & Refutation of Bodily Ascension ──
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

  // ── 14. Seal of Prophethood & Continuation of Blessings ──
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
    arabicText: "هُوَ الَّذِي بَعَثَ فِي الْأُمِّيِّينَ رَسُولًا مِّنْهُمْ يَتْلُو عَلَيْهِمْ آيَاتِهِ وَيُزَكِّيهِمْ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ وَآخَرِينَ مِنْهُمْ لَمَّا يَلْحَقُوا بِهِمْ",
    englishTranslation: "He it is Who has raised among the Unlettered people a Messenger from among themselves, who recites unto them His Signs, and purifies them... And He will raise him among others from among them who have not yet joined them.",
    urduTranslation: "وہی ہے جس نے اُمّیوں میں انہی میں سے ایک رسول بھیجا جو ان پر اس کی آیات تلاوت کرتا ہے اور انہیں پاک کرتا ہے... اور ان میں سے دوسروں میں بھی جو ابھی ان سے نہیں ملے",
    commentaryNote: "Coupled with verse 4 ('Wa Akhareena Minhum Lamma Yalhaqoo Bihim') prophesying the Latter-Day advent of the Promised Messiah (as) in spiritual reflection (Buruz) of the Holy Prophet (sa).",
    topics: ["second coming", "promised messiah", "latter days", "mahdi", "مسیح موعود", "ظہور ثانی", "بروز"],
    url: "https://www.alislam.org/quran/62:3"
  },

  // ── 15. The Divine Institution of Khilafat ──
  {
    surahNumber: 24,
    verseNumber: 56,
    surahNameArabic: "النور",
    surahNameEnglish: "Al-Nur",
    arabicText: "وَعَدَ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَعَمِلُوا الصَّالِحَاتِ لَيَسْتَخْلِفَنَّهُمْ فِي الْأَرْضِ كَمَا اسْتَخْلَفَ الَّذِينَ مِن قَبْلِهِمْ وَلَيُمَكِّنَنَّ لَهُمْ دِينَهُمُ الَّذِي ارْتَضَىٰ لَهُمْ",
    englishTranslation: "Allah has promised to those among you who believe and do good works that He will surely make them Successors in the earth, as He made Successors from among those who were before them; and that He will surely establish for them their religion which He has chosen for them...",
    urduTranslation: "اللہ نے تم میں سے ان لوگوں سے جو ایمان لائے اور نیک عمل کیے وعدہ کیا ہے کہ وہ ضرور انہیں زمین میں خلیفہ بنائے گا جیسا کہ اس نے ان سے پہلے لوگوں کو خلیفہ بنایا تھا اور ضرور ان کے لیے ان کے اس دین کو مضبوطی سے قائم کرے گا جو اس نے ان کے لیے پسند کیا...",
    commentaryNote: "Ayat-ul-Istikhlaf: The divine pledge establishing Khilafat as the perpetual spiritual succession safeguarding believers in peace and unity.",
    topics: ["khilafat", "caliphate", "successorship", "unity", "خلافت", "خلیفہ", "جانشینی"],
    url: "https://www.alislam.org/quran/24:56"
  },

  // ── 16. Jihad & Defensive Warfare ──
  {
    surahNumber: 22,
    verseNumber: 40,
    surahNameArabic: "الحج",
    surahNameEnglish: "Al-Hajj",
    arabicText: "أُذِنَ لِلَّذِينَ يُقَاتَلُونَ بِأَنَّهُمْ ظُلِمُوا وَإِنَّ اللَّهَ عَلَىٰ نَصْرِهِمْ لَقَدِيرٌ الَّذِينَ أُخْرِجُوا مِن دِيَارِهِم بِغَيْرِ حَقٍّ إِلَّا أَن يَقُولُوا رَبُّنَا اللَّهُ",
    englishTranslation: "Permission to fight is given to those against whom war is made, because they have been wronged, and Allah indeed has power to help them—those who have been driven out of their homes unjustly only because they said: 'Our Lord is Allah.'",
    urduTranslation: "ان لوگوں کو جن کے خلاف جنگ چھیڑی جا رہی ہے لڑنے کی اجازت دی گئی ہے کیونکہ ان پر ظلم کیا گیا، اور یقیناً اللہ ان کی مدد پر قادر ہے—وہ لوگ جنہیں ان کے گھروں سے ناحق نکالا گیا صرف اس لیے کہ وہ کہتے تھے ہمارا رب اللہ ہے",
    commentaryNote: "The Charter of Religious Freedom in Islam: Defensive warfare was permitted solely when innocent believers and houses of worship (cloisters, churches, synagogues, mosques) were endangered.",
    topics: ["jihad", "war", "peace", "religious freedom", "defense", "جہاد", "امن", "دفاع"],
    url: "https://www.alislam.org/quran/22:40"
  },
  {
    surahNumber: 25,
    verseNumber: 53,
    surahNameArabic: "الفرقان",
    surahNameEnglish: "Al-Furqan",
    arabicText: "فَلَا تُطِعِ الْكَافِرِينَ وَجَاهِدْهُم بِهِ جِهَادًا كَبِيرًا",
    englishTranslation: "So obey not the disbelievers and strive against them therewith (with the Qur'an) a great striving (Jihadan Kabeera).",
    urduTranslation: "پس تو کافروں کی بات نہ مان اور اس (قرآن) کے ذریعے ان کے خلاف ایک بڑا جہاد کر",
    commentaryNote: "Establishes that the greatest Jihad is an intellectual, moral, and spiritual striving carried out through the teachings and proofs of the Holy Quran.",
    topics: ["jihad", "quran", "great jihad", "jihad of the pen", "جہاد", "جہاد کبیر", "جہاد بالقلم"],
    url: "https://www.alislam.org/quran/25:53"
  },
  {
    surahNumber: 2,
    verseNumber: 257,
    surahNameArabic: "البقرة",
    surahNameEnglish: "Al-Baqarah",
    arabicText: "لَا إِكْرَاهَ فِي الدِّينِ قَد تَّبَيَّنَ الرُّشْدُ مِنَ الْغَيِّ",
    englishTranslation: "There shall be no compulsion in religion. Surely, right has become distinct from wrong.",
    urduTranslation: "دین میں کوئی زبردستی نہیں۔ یقیناً ہدایت گمراہی سے کھل کر واضح ہو چکی ہے",
    commentaryNote: "Categorical Quranic prohibition against forced conversion, intellectual coercion, or military expansion under the guise of faith.",
    topics: ["religious freedom", "tolerance", "no compulsion", "peace", "لا اکراہ فی الدین", "مذہبی آزادی", "امن"],
    url: "https://www.alislam.org/quran/2:257"
  },

  // ── 17. Creation, Universe & Astronomy (Cosmology) ──
  {
    surahNumber: 3,
    verseNumber: 191,
    surahNameArabic: "آل عمران",
    surahNameEnglish: "Al-e-Imran",
    arabicText: "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا",
    englishTranslation: "In the creation of the heavens and the earth and in the alternation of the night and the day there are indeed Signs for men of understanding, who remember Allah standing and sitting and lying on their sides, and ponder over the creation of the heavens and the earth, saying: 'Our Lord, Thou hast not created this in vain...'",
    urduTranslation: "یقیناً آسمانوں اور زمین کی پیدائش میں اور رات اور دن کے الٹ پھیر میں عقل والوں کے لیے بہت سے نشانات ہیں۔ جو کھڑے اور بیٹھے اور اپنے پہلوؤں کے بل اللہ کو یاد کرتے ہیں اور آسمانوں اور زمین کی پیدائش میں غور و فکر کرتے ہیں کہ اے ہمارے رب! تو نے یہ سب بے مقصد پیدا نہیں کیا...",
    commentaryNote: "Harmonizes scientific inquiry with deep spirituality: Pondering astrophysics, cosmological constants, and natural laws draws the mind to the Grand Designer.",
    topics: ["creation", "universe", "astronomy", "science", "cosmology", "heavens", "earth", "تخلیق", "کائنات", "زمین و آسمان", "سائنس"],
    url: "https://www.alislam.org/quran/3:191"
  },
  {
    surahNumber: 21,
    verseNumber: 31,
    surahNameArabic: "الأنبياء",
    surahNameEnglish: "Al-Anbiya",
    arabicText: "أَوَلَمْ يَرَ الَّذِينَ كَفَرُوا أَنَّ السَّمَاوَاتِ وَالْأَرْضَ كَانَتَا رَتْقًا فَفَتَقْنَاهُمَا وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ أَفَلَا يُؤْمِنُونَ",
    englishTranslation: "Do not the disbelievers see that the heavens and the earth were a closed-up mass, then We opened them out? And We made from water every living thing. Will they not then believe?",
    urduTranslation: "کیا ان لوگوں نے جنہوں نے کفر کیا یہ نہیں دیکھا کہ آسمان اور زمین دونوں باہم ملے ہوئے تھے پھر ہم نے ان کو پھاڑ کر الگ کیا؟ اور ہم نے پانی سے ہر زندہ چیز بنائی۔ کیا پھر بھی وہ ایمان نہیں لاتے؟",
    commentaryNote: "Explicit Quranic description of cosmological singularity ('Ratqan Fa Fataqnahuma' / Big Bang) and the aquatic origin of all biological life on Earth.",
    topics: ["creation", "big bang", "cosmology", "water", "science", "origin of life", "تخلیق کائنات", "سائنس", "پیدائش"],
    url: "https://www.alislam.org/quran/21:31"
  },
  {
    surahNumber: 51,
    verseNumber: 48,
    surahNameArabic: "الذاريات",
    surahNameEnglish: "Al-Dhariyat",
    arabicText: "وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ",
    englishTranslation: "And the heaven We built with Our own hands, and truly We are expanding it.",
    urduTranslation: "اور آسمان کو ہم نے اپنے ہاتھوں سے بنایا اور یقیناً ہم اسے وسعت دینے والے ہیں",
    commentaryNote: "Direct Quranic foretelling of the expanding universe ('Wa Inna La Moosi'oon') fourteen centuries before Hubble's astronomical observations.",
    topics: ["universe", "expanding universe", "astronomy", "cosmology", "science", "کائنات", "توسیع کائنات", "سائنس"],
    url: "https://www.alislam.org/quran/51:48"
  },

  // ── 18. Divine Oneness (Tawheed) & The Reality of God ──
  {
    surahNumber: 2,
    verseNumber: 256,
    surahNameArabic: "البقرة",
    surahNameEnglish: "Al-Baqarah",
    arabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ",
    englishTranslation: "Allah—there is no God but He, the Living, the Self-Subsisting and All-Sustaining. Slumber seizes Him not, nor sleep. To Him belongs whatsoever is in the heavens and whatsoever is in the earth. Who is he that will intercede with Him except by His permission?...",
    urduTranslation: "اللہ! اس کے سوا کوئی معبود نہیں، وہ ہمیشہ زندہ رہنے والا اور سب کو قائم رکھنے والا ہے۔ نہ اسے اونگھ آتی ہے اور نہ نیند۔ اسی کا ہے جو کچھ آسمانوں میں ہے اور جو کچھ زمین میں ہے۔ کون ہے جو اس کی اجازت کے بغیر اس کے حضور سفارش کر سکے؟...",
    commentaryNote: "Ayat al-Kursi (The Verse of the Throne): The most sublime summary of Tawheed and transcendent divine sovereignty.",
    topics: ["tawheed", "god", "ayat al kursi", "oneness", "allah", "existence of god", "توحید", "آیت الکرسی", "اللہ", "خدا"],
    url: "https://www.alislam.org/quran/2:256"
  },
  {
    surahNumber: 112,
    verseNumber: 1,
    surahNameArabic: "الإخلاص",
    surahNameEnglish: "Al-Ikhlas",
    arabicText: "قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    englishTranslation: "Say, 'He is Allah, the One; Allah, the Independent and Besought of all. He begets not, nor is He begotten; and there is none like unto Him.'",
    urduTranslation: "کہہ دے وہ اللہ ایک ہے۔ اللہ بے نیاز ہے۔ نہ اس نے کسی کو جنا اور نہ وہ جنا گیا اور کوئی بھی اس کا ہمسر نہیں",
    commentaryNote: "Surah Al-Ikhlas: The pure essence of monotheism, utterly dismantling polytheistic pantheons, ancestral deities, and filial dogmas.",
    topics: ["tawheed", "oneness", "ikhlas", "allah", "monotheism", "god", "توحید", "اخلاص", "خدا", "اللہ"],
    url: "https://www.alislam.org/quran/112:1"
  }
];

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesEnglishWord(verseText: string, term: string): boolean {
  if (!verseText || !term) return false;
  if (term.length <= 4) {
    return new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(verseText);
  }
  return verseText.toLowerCase().includes(term.toLowerCase());
}

function matchesArabicWord(verseText: string, term: string): boolean {
  if (!verseText || !term) return false;
  if (term.length <= 3) {
    return new RegExp(`(?:^|\\s)(?:و|ف|ب|ك|ل)?(?:ال)?${escapeRegExp(term)}(?:$|\\s|[،۔])`, "u").test(verseText);
  }
  return verseText.includes(term);
}

function matchesUrduWord(verseText: string, term: string): boolean {
  if (!verseText || !term) return false;
  if (term.length <= 3) {
    return new RegExp(`(?:^|\\s)${escapeRegExp(term)}(?:$|\\s|[،۔])`, "u").test(verseText);
  }
  return verseText.includes(term);
}

/**
 * Searches the canonical Holy Qur'an with complete cross-lingual semantic matching:
 * 1. Exact verse reference (e.g. "4:158" or "30:22")
 * 2. Exact word / phrase in Arabic, Urdu, or English
 * 3. Translation of terms between English, Urdu, and Arabic
 * 4. Transliterations (e.g. "nikah", "sabr", "taqwa", "dua", "salat")
 * 5. Synonyms across all three languages
 * 6. Diacritic-tolerant matching for Arabic and Urdu
 */
export function searchQuranVerses(query: string): QuranVerseResult[] {
  if (!query || !query.trim()) return [];

  const rawQuery = query.trim();
  const lowerQuery = rawQuery.toLowerCase();

  // 1. Direct Verse Reference Check (e.g. "4:158", "30:22", "Surah 4:158")
  const refMatch = lowerQuery.match(/(?:surah\s*)?(\d+)\s*[:\.]\s*(\d+)/i);
  if (refMatch) {
    const sNum = parseInt(refMatch[1], 10);
    const vNum = parseInt(refMatch[2], 10);
    const matched = QURAN_CORPUS.filter(v => v.surahNumber === sNum && v.verseNumber === vNum);
    if (matched.length > 0) {
      return matched.map(v => ({ ...v, relevanceScore: 1000 }));
    }
  }

  // 2. Expand Query into Synonyms, Translations, and Transliterations
  const expanded = expandQuranQuery(rawQuery);
  const searchTerms = [
    ...expanded.exactTerms,
    ...expanded.expandedTerms
  ];

  const cleanArabicQuery = normalizeArabicForSearch(rawQuery);
  const cleanUrduQuery = normalizeUrduForSearch(rawQuery);
  const cleanEnglishQuery = normalizeEnglishForSearch(rawQuery);

  const scoredMatches: Array<{ verse: QuranVerseResult; score: number }> = [];

  for (const v of QURAN_CORPUS) {
    let score = 0;

    const normArabicVerse = normalizeArabicForSearch(v.arabicText);
    const normUrduVerse = normalizeUrduForSearch(v.urduTranslation);
    const normEnglishVerse = normalizeEnglishForSearch(v.englishTranslation);
    const normCommentary = v.commentaryNote ? normalizeEnglishForSearch(v.commentaryNote) : "";
    const normSurahEnglish = normalizeEnglishForSearch(v.surahNameEnglish);
    const normSurahArabic = normalizeArabicForSearch(v.surahNameArabic);

    // ── Exact query matches ──
    if (cleanArabicQuery && matchesArabicWord(normArabicVerse, cleanArabicQuery)) {
      score += 60;
    }
    if (cleanUrduQuery && matchesUrduWord(normUrduVerse, cleanUrduQuery)) {
      score += 50;
    }
    if (cleanEnglishQuery && matchesEnglishWord(normEnglishVerse, cleanEnglishQuery)) {
      score += 50;
    }

    // ── Exact multi-word phrase match bonus ──
    if (cleanArabicQuery && cleanArabicQuery.includes(" ") && normArabicVerse.includes(cleanArabicQuery)) {
      score += 150;
    }
    if (cleanUrduQuery && cleanUrduQuery.includes(" ") && normUrduVerse.includes(cleanUrduQuery)) {
      score += 150;
    }
    if (cleanEnglishQuery && cleanEnglishQuery.includes(" ") && normEnglishVerse.includes(cleanEnglishQuery)) {
      score += 150;
    }

    if (
      (cleanEnglishQuery && cleanEnglishQuery.length >= 3 && normSurahEnglish.includes(cleanEnglishQuery)) ||
      (cleanArabicQuery && cleanArabicQuery.length >= 3 && normSurahArabic.includes(cleanArabicQuery))
    ) {
      score += 40;
    }

    // ── Topics exact match ──
    const topicMatch = v.topics.some(t => {
      const tLower = t.toLowerCase();
      return (
        (cleanEnglishQuery && tLower === cleanEnglishQuery) ||
        t === rawQuery ||
        (cleanEnglishQuery && cleanEnglishQuery.length >= 3 && tLower.includes(cleanEnglishQuery)) ||
        (cleanUrduQuery && t === cleanUrduQuery) ||
        (cleanArabicQuery && t === cleanArabicQuery)
      );
    });
    if (topicMatch) {
      score += 45;
    }

    // ── Expanded synonyms, translations, and transliterations ──
    for (const term of searchTerms) {
      if (!term || term.length < 2) continue;

      const termLower = term.toLowerCase();
      const termNormAr = normalizeArabicForSearch(term);
      const termNormUr = normalizeUrduForSearch(term);

      // Check topics
      if (v.topics.some(t => t.toLowerCase() === termLower || t === term)) {
        score += 25;
      }

      // Check English translation
      if (matchesEnglishWord(normEnglishVerse, termLower)) {
        score += 15;
      }

      // Check Urdu translation
      if (termNormUr && matchesUrduWord(normUrduVerse, termNormUr)) {
        score += 15;
      }

      // Check Arabic text
      if (termNormAr && matchesArabicWord(normArabicVerse, termNormAr)) {
        score += 20;
      }

      // Check commentary note
      if (normCommentary && matchesEnglishWord(normCommentary, termLower)) {
        score += 10;
      }
    }

    if (score > 0) {
      scoredMatches.push({
        verse: { ...v, relevanceScore: score },
        score
      });
    }
  }

  // Sort by highest relevance score first
  scoredMatches.sort((a, b) => b.score - a.score);

  return scoredMatches.map(m => m.verse);
}
