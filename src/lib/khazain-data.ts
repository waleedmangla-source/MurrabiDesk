// Ruhani Khazain Corpus Metadata, Book Mappings, and Multilingual Topic Dictionary

export interface KhazainBookEntry {
  title: string;
  urduTitle: string;
  pageStart: number;
}

export const KHAZAIN_BOOKS: Record<number, KhazainBookEntry[]> = {
  1: [
    { title: "Barahin-e-Ahmadiyya Part 1", urduTitle: "براہین احمدیہ حصہ اول", pageStart: 1 },
    { title: "Barahin-e-Ahmadiyya Part 2", urduTitle: "براہین احمدیہ حصہ دوم", pageStart: 55 }
  ],
  2: [
    { title: "Barahin-e-Ahmadiyya Part 3", urduTitle: "براہین احمدیہ حصہ سوم", pageStart: 1 },
    { title: "Purani Tehrirain", urduTitle: "پرانی تحریریں", pageStart: 275 }
  ],
  3: [
    { title: "Fath-e-Islam", urduTitle: "فتح اسلام", pageStart: 1 },
    { title: "Taudih-e-Maram", urduTitle: "توضیح مرام", pageStart: 41 },
    { title: "Izala-e-Auham", urduTitle: "ازالہ اوہام", pageStart: 101 }
  ],
  4: [
    { title: "Al-Haq Mubahatha Ludhiana", urduTitle: "مباحثہ لدھیانہ", pageStart: 1 },
    { title: "Al-Haq Mubahatha Delhi", urduTitle: "مباحثہ دہلی", pageStart: 131 },
    { title: "Asmani Faislah", urduTitle: "آسمانی فیصلہ", pageStart: 311 },
    { title: "Nishan-e-Asmani", urduTitle: "نشان آسمانی", pageStart: 361 }
  ],
  5: [
    { title: "Aina-e-Kamalat-e-Islam", urduTitle: "آئینہ کمالات اسلام", pageStart: 1 }
  ],
  6: [
    { title: "Barakat-ud-Dua", urduTitle: "برکات الدعا", pageStart: 1 },
    { title: "Hujjat-ul-Islam", urduTitle: "حجۃ الاسلام", pageStart: 45 },
    { title: "Sachai Ka Izhar", urduTitle: "سچائی کا اظہار", pageStart: 77 },
    { title: "Jang-e-Muqaddas", urduTitle: "جنگ مقدس", pageStart: 93 }
  ],
  7: [
    { title: "Shahadat-ul-Quran", urduTitle: "شہادت القرآن", pageStart: 1 },
    { title: "Tuhfa-e-Baghdad", urduTitle: "تحفہ بغداد", pageStart: 127 },
    { title: "Karamat-us-Sadiqeen", urduTitle: "کرامات الصادقین", pageStart: 153 },
    { title: "Hamamat-ul-Bushra", urduTitle: "حمامة البشرى", pageStart: 179 }
  ],
  8: [
    { title: "Nur-ul-Haq Part 1 & 2", urduTitle: "نور الحق حصہ اول و دوم", pageStart: 1 },
    { title: "Itmam-ul-Hujjah", urduTitle: "اتمام الحجة", pageStart: 275 },
    { title: "Sirr-ul-Khilafah", urduTitle: "سر الخلافة", pageStart: 317 }
  ],
  9: [
    { title: "Anwar-ul-Islam", urduTitle: "انوار الاسلام", pageStart: 1 },
    { title: "Minan-ur-Rahman", urduTitle: "منن الرحمٰن", pageStart: 125 },
    { title: "Arya Dharam", urduTitle: "آریہ دھرم", pageStart: 181 },
    { title: "Zia-ul-Haq", urduTitle: "ضیاء الحق", pageStart: 221 }
  ],
  10: [
    { title: "Islami Usul Ki Philosophy", urduTitle: "اسلامی اصول کی فلاسفی", pageStart: 1 },
    { title: "Sat Bachan", urduTitle: "ست بچن", pageStart: 111 }
  ],
  11: [
    { title: "Anjam-e-Atham", urduTitle: "انجام آتھم", pageStart: 1 }
  ],
  12: [
    { title: "Siraj-e-Munir", urduTitle: "سراج منیر", pageStart: 1 },
    { title: "Hujjatullah", urduTitle: "حجة الله", pageStart: 109 },
    { title: "Tuhfa-e-Qaisariyyah", urduTitle: "تحفہ قیصریہ", pageStart: 251 },
    { title: "Kitab-ul-Bariyyah", urduTitle: "کتاب البریہ", pageStart: 289 }
  ],
  13: [
    { title: "Kitab-ul-Bariyyah (cont.)", urduTitle: "کتاب البریہ (تکملہ)", pageStart: 1 },
    { title: "Ayyam-us-Sulh", urduTitle: "ایام الصلح", pageStart: 231 }
  ],
  14: [
    { title: "Zarurat-ul-Imam", urduTitle: "ضرورۃ الامام", pageStart: 1 },
    { title: "Haqiqat-ul-Mahdi", urduTitle: "حقیقت المہدی", pageStart: 49 },
    { title: "Masih Hindustan Mein", urduTitle: "مسیح ہندوستان میں", pageStart: 167 }
  ],
  15: [
    { title: "Tiryaq-ul-Qulub", urduTitle: "تریاق القلوب", pageStart: 1 }
  ],
  16: [
    { title: "Khutba Ilhamiyya", urduTitle: "خطبہ الہامیہ", pageStart: 1 },
    { title: "Lujjat-un-Nur", urduTitle: "لجة النور", pageStart: 337 }
  ],
  17: [
    { title: "Tuhfat-un-Nadwah", urduTitle: "تحفۃ الندوہ", pageStart: 1 },
    { title: "Arbaeen", urduTitle: "اربعین", pageStart: 341 }
  ],
  18: [
    { title: "Ijaz-ul-Masih", urduTitle: "اعجاز المسیح", pageStart: 1 },
    { title: "Dafi-ul-Bala", urduTitle: "دافع البلاء", pageStart: 221 },
    { title: "Al-Huda Wat-Tabsirah", urduTitle: "الهدى والتبصرة", pageStart: 247 }
  ],
  19: [
    { title: "Kashti-e-Nuh", urduTitle: "کشتی نوح", pageStart: 1 },
    { title: "Tadhkirat-ush-Shahadatain", urduTitle: "تذکرۃ الشہادتین", pageStart: 265 }
  ],
  20: [
    { title: "Siraj-ud-Din Isai Ke 4 Sawal", urduTitle: "سراج الدین عیسائی کے چار سوال", pageStart: 1 },
    { title: "Lecture Lahore", urduTitle: "لیکچر لاہور", pageStart: 145 },
    { title: "Lecture Sialkot", urduTitle: "لیکچر سیالکوٹ", pageStart: 201 },
    { title: "Lecture Ludhiana", urduTitle: "لیکچر لدھیانہ", pageStart: 251 }
  ],
  21: [
    { title: "Barahin-e-Ahmadiyya Part 5", urduTitle: "براہین احمدیہ حصہ پنجم", pageStart: 1 }
  ],
  22: [
    { title: "Haqiqat-ul-Wahi", urduTitle: "حقیقت الوحی", pageStart: 1 }
  ],
  23: [
    { title: "Chashma-e-Masihi", urduTitle: "چشمہ مسیحی", pageStart: 1 },
    { title: "Chashma-e-Marifat", urduTitle: "چشمہ معرفت", pageStart: 93 },
    { title: "Paigham-e-Sulh", urduTitle: "پیغام صلح", pageStart: 437 }
  ]
};

export function getBookForPage(volume: number, pageNum: number): KhazainBookEntry {
  const books = KHAZAIN_BOOKS[volume] || [];
  return [...books].reverse().find(b => pageNum >= b.pageStart) || books[0] || {
    title: `Volume ${volume}`,
    urduTitle: `روحانی خزائن جلد ${volume}`,
    pageStart: 1
  };
}

/**
 * Normalizes Arabic and Urdu script:
 * - Strips Tashkeel / aerab (zer, zabar, pesh, tanween, shaddah, sukoon, superscript alef)
 * - Strips Tatweel (kashida)
 * - Normalizes Alef variants (آ, أ, إ, ٱ -> ا)
 * - Normalizes Arabic Kaf (ك -> ک)
 * - Normalizes Arabic Yeh variants (ي, ى, ئ -> ی)
 * - Normalizes Arabic Ta Marbuta & Ha (ة, ه -> ہ)
 * - Strips zero-width joiners/non-joiners
 */
export function normalizeKhazainText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/[ك]/g, 'ک')
    .replace(/[يىئ]/g, 'ی')
    .replace(/[ةه]/g, 'ہ')
    .replace(/[\u200C\u200D]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Normalizes text while preserving an exact 1-to-1 character index map back to the raw string.
 * This allows extracting original text excerpts with intact Tashkeel and exact offsets.
 */
export function normalizeWithIndexMap(raw: string): { norm: string; indexMap: number[] } {
  if (!raw) return { norm: '', indexMap: [] };

  let norm = '';
  const indexMap: number[] = [];

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    // Skip diacritics and tatweel
    if (/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u200C\u200D]/.test(ch)) {
      continue;
    }

    let normCh = ch;
    if (/[آأإٱ]/.test(ch)) normCh = 'ا';
    else if (ch === 'ك') normCh = 'ک';
    else if (/[يىئ]/.test(ch)) normCh = 'ی';
    else if (/[ةه]/.test(ch)) normCh = 'ہ';

    norm += normCh.toLowerCase();
    indexMap.push(i);
  }

  return { norm, indexMap };
}

/**
 * Comprehensive theological topic-to-Urdu keyword dictionary for English and transliterated queries.
 */
export const THEOLOGICAL_TOPIC_MAP: Record<string, string[]> = {
  // Jesus / Isa (as) / Crucifixion
  "jesus": ["مسیح", "عیسی", "ابن مریم"],
  "jesus christ": ["حضرت عیسی", "مسیح ابن مریم", "مسیح"],
  "death of jesus": ["وفات مسیح", "عیسی", "وفات", "صلیب"],
  "crucifixion": ["صلیب", "مصلوب", "واقعه صلیب"],
  "cross": ["صلیب", "کسر صلیب"],
  "tomb": ["قبر", "مزار", "کشمیر", "خان یار"],
  "tomb of jesus": ["کشمیر", "خان یار", "قبر عیسی", "مزار"],
  "ascension": ["رفع مسیح", "آسمان", "صعود"],

  // Promised Messiah & Mahdi
  "messiah": ["مسیح موعود", "مسیح"],
  "promised messiah": ["مسیح موعود", "حضرت مسیح موعود"],
  "mahdi": ["امام مہدی", "مہدی"],
  "second coming": ["نزول مسیح", "آمد ثانی"],
  "reform": ["اصلاح", "تجدید", "مجدد"],
  "reformer": ["مجدد", "مصلح"],

  // Prophethood & Seal of the Prophets
  "prophethood": ["نبوت", "رسالت", "نبی"],
  "prophet": ["نبی", "رسول", "پیغمبر"],
  "khatam": ["خاتم النبیین", "ختم نبوت"],
  "seal of prophets": ["خاتم النبیین", "خاتم الانبیاء"],
  "seal of prophethood": ["ختم نبوت", "خاتم النبیین"],
  "revelation": ["وحی", "الہام", "کلام الٰہی"],
  "wahi": ["وحی", "وحی الٰہی"],
  "ilham": ["الہام", "مکالمہ ومخاطبہ"],
  "communion": ["مکالمہ و مخاطبہ الٰہیہ", "شرف مکالمہ"],

  // Jihad & Peace
  "jihad": ["جہاد", "جہاد بالقلم", "جہاد تلوار"],
  "holy war": ["جہاد", "تلوار"],
  "jihad of the pen": ["جہاد بالقلم", "قلم"],
  "peace": ["صلح", "امن", "سلامتی"],
  "reconciliation": ["صلح", "پیغام صلح", "اتفاق"],

  // Signs & Prophecies
  "signs": ["نشان", "آسمانی نشان", "آیات"],
  "miracle": ["معجزہ", "نشان", "خوارق"],
  "miracles": ["معجزات", "نشانات"],
  "prophecy": ["پیشگوئی", "خبر غیب"],
  "prophecies": ["پیشگوئیاں", "نشانات"],
  "eclipse": ["کسوف", "خسوف", "گرہن"],
  "lunar eclipse": ["خسوف", "قمر"],
  "solar eclipse": ["کسوف", "شمس"],
  "plague": ["طاعون", "وبا"],

  // God & Tawheed
  "god": ["خدا", "اللہ", "باری تعالیٰ"],
  "existence of god": ["وجود باری تعالیٰ", "ہستی باری تعالیٰ"],
  "unity of god": ["توحید", "لا الہ الا اللہ"],
  "tawheed": ["توحید"],
  "prayer": ["دعا", "استجابت دعا", "تضرع"],
  "dua": ["دعا", "استجابت دعا"],
  "acceptance of prayer": ["استجابت دعا", "قبولیت دعا"],

  // Holy Scriptures
  "quran": ["قرآن", "قرآن مجید", "فرقان"],
  "holy quran": ["قرآن شریف", "قرآن کریم", "کلام اللہ"],
  "hadith": ["حدیث", "احادیث", "روایت"],
  "sunnah": ["سنت"],
  "vedas": ["وید", "ویدوں"],
  "torah": ["تورات"],
  "gospel": ["انجیل", "اناجیل"],
  "bible": ["بائبل", "انجیل"],

  // Comparative Religion
  "christianity": ["عیسائیت", "نصاریٰ", "مسیحی"],
  "christians": ["عیسائی", "نصاریٰ", "پادری"],
  "trinity": ["تثلیث", "تین خدا"],
  "atonement": ["کفارہ"],
  "son of god": ["ابن اللہ", "بیٹا"],
  "hinduism": ["ہندو", "آریہ"],
  "arya samaj": ["آریہ سماج", "آریہ"],
  "lekh ram": ["لیکھرام", "پنڈت لیکھرام"],
  "dayanand": ["دیانند"],
  "niyog": ["نیوگ"],
  "islam": ["اسلام", "دین اسلام"],

  // Spirituality & Ethics
  "morals": ["اخلاق", "حسن اخلاق"],
  "righteousness": ["تقویٰ", "طہارت"],
  "taqwa": ["تقویٰ", "پرہیزگاری"],
  "purification": ["تزکیہ نفس", "طہارت"],
  "repentance": ["توبہ", "استغفار"],
  "salvation": ["نجات", "فلاح"],
  "soul": ["روح", "نفوس"],
  "afterlife": ["آخرت", "حشر", "بعث بعد الموت"],
  "heaven": ["جنت", "بہشت"],
  "hell": ["دوزخ", "جہنم"],
  "angels": ["ملائکہ", "فرشتے"],

  // Key Books
  "barahin": ["براہین احمدیہ"],
  "barahin-e-ahmadiyya": ["براہین احمدیہ"],
  "izala": ["ازالہ اوہام"],
  "izala-e-auham": ["ازالہ اوہام"],
  "fath-e-islam": ["فتح اسلام"],
  "philosophy": ["اسلامی اصول کی فلاسفی"],
  "philosophy of teachings": ["اسلامی اصول کی فلاسفی"],
  "kashti-e-nuh": ["کشتی نوح"],
  "noah's ark": ["کشتی نوح"],
  "haqiqat-ul-wahi": ["حقیقت الوحی"],
  "chashma": ["چشمہ معرفت", "چشمہ مسیحی"],
  "paigham-e-sulh": ["پیغام صلح"]
};
