// Verbatim Search & Phonetic / Translation Resolver for Murabbi Desk

/**
 * Normalizes Arabic/Urdu text for exact string comparison
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

export interface VerbatimEquivalents {
  original: string;
  exactQuery: string;
  isUrduOrArabic: boolean;
  translations: string[];
  phonetics: string[];
  allSearchTerms: string[];
}

export interface LexiconEntry {
  concept: string;
  english: string[];
  urdu: string[];
  arabic: string[];
  phonetic: string[];
}

/**
 * Curated Theological Lexicon for exact verbatim translation & phonetic transliteration bridging
 */
export const VERBATIM_THEOLOGICAL_LEXICON: LexiconEntry[] = [
  // ── 1. Prophethood & Seal of the Prophets ──
  {
    concept: 'Seal of the Prophets',
    english: ['seal of the prophets', 'seal of prophets', 'seal of prophethood', 'finality of prophethood', 'last of the prophets'],
    urdu: ['خاتم النبیین', 'ختم نبوت', 'خاتم الانبیاء'],
    arabic: ['خاتم النبيين', 'خاتم الانبياء', 'ختم النبوة', 'لا نبي بعدي'],
    phonetic: ['khatamun nabiyyin', 'khatam-un-nabiyyin', 'khatam un nabiyeen', 'khatmun nabiyyin', 'khatme nabuwat', 'khatam e nabuwwat', "la nabiyya ba'di", "la nabiya ba'di"]
  },
  {
    concept: 'Prophethood & Revelation',
    english: ['prophethood', 'prophet', 'messenger', 'revelation', 'divine inspiration', 'subordinate prophet'],
    urdu: ['نبوت', 'رسالت', 'نبی', 'رسول', 'وحی', 'الہام', 'امتی نبی', 'ظلی نبوت', 'بروزی نبوت', 'محدث'],
    arabic: ['نبوة', 'رسالة', 'نبي', 'رسول', 'وحي', 'الهام', 'محدث'],
    phonetic: ['nubuwwat', 'risalat', 'nabi', 'rasool', 'rasul', 'wahi', 'ilham', 'ummati nabi', 'zilli nubuwwat', 'buroozi nubuwwat', 'muhaddath']
  },

  // ── 2. Jesus Christ / Death of Jesus (Wafat-e-Masih) ──
  {
    concept: 'Death of Jesus',
    english: ['death of jesus', 'death of jesus christ', 'natural death of jesus', 'demise of jesus', 'passed away'],
    urdu: ['وفات مسیح', 'موت عیسی', 'وفات عیسی'],
    arabic: ['وفاة عيسى', 'موت عيسى', 'متوفيك', 'فلما توفيتني', 'قد خلت من قبله الرسل'],
    phonetic: ['wafat e masih', 'wafat-e-masih', 'wafate masih', 'maut e isa', 'mutawaffeeka', 'falamma tawaffaytani', 'qad khalat min qablihir rusul']
  },
  {
    concept: 'Crucifixion & Ascension',
    english: ['crucifixion', 'cross', 'survived the cross', 'breaking of the cross', 'ascension of jesus', 'bodily ascension'],
    urdu: ['صلیب', 'واقعہ صلیب', 'نجات از صلیب', 'کسر صلیب', 'رفع مسیح', 'آسمان پر زندہ'],
    arabic: ['صلب', 'ما قتلوه وما صلبوه', 'كسر الصليب', 'رفع', 'بل رفعه الله اليه'],
    phonetic: ['saleeb', 'waqia saleeb', 'kasr-e-saleeb', 'kasr e saleeb', 'raf e masih', 'rafa masih', 'ma qataloohu wa ma salaboohu']
  },
  {
    concept: 'Jesus in India & Tomb',
    english: ['jesus in india', 'tomb of jesus', 'grave of jesus', 'srinagar', 'kashmir', 'roza bal', 'khan yar'],
    urdu: ['مسیح ہندوستان میں', 'قبر مسیح', 'مزار عیسی', 'سری نگر', 'کشمیر', 'روضہ بل', 'خان یار'],
    arabic: ['المسيح في الهند', 'قبر عيسى', 'كشمير'],
    phonetic: ['masih hindustan mein', 'qabr e masih', 'roza bal', 'rozabal', 'khan yar', 'khanyar', 'kashmir', 'srinagar']
  },
  {
    concept: 'Jesus / Isa son of Mary',
    english: ['jesus', 'jesus christ', 'isa', 'son of mary', 'messiah'],
    urdu: ['عیسیٰ', 'عیسی', 'ابن مریم', 'مسیح', 'حضرت عیسی'],
    arabic: ['عيسى', 'عيسى ابن مريم', 'المسيح'],
    phonetic: ['isa', 'eesa', 'ibn maryam', 'ibne maryam', 'masih']
  },

  // ── 3. Promised Messiah & Mahdi ──
  {
    concept: 'Promised Messiah & Mahdi',
    english: ['promised messiah', 'imam mahdi', 'promised reformer', 'second coming', 'just arbiter'],
    urdu: ['مسیح موعود', 'حضرت مسیح موعود', 'امام مہدی', 'مصلح موعود', 'حکم عدل', 'مجدد'],
    arabic: ['المسيح الموعود', 'المهدي', 'حكم عدل', 'مجدد'],
    phonetic: ['masih maud', 'masih-e-maud', 'imam mahdi', 'musleh maud', 'musleh-e-maud', 'hakam adl', 'mujaddid']
  },
  {
    concept: 'Hazrat Mirza Ghulam Ahmad',
    english: ['mirza ghulam ahmad', 'hazrat mirza ghulam ahmad', 'promised messiah of qadian'],
    urdu: ['مرزا غلام احمد', 'حضرت مرزا غلام احمد', 'احمد قادیانی'],
    arabic: ['ميرزا غلام احمد', 'ميرزا غلام احمد القادياني'],
    phonetic: ['mirza ghulam ahmad', 'ghulam ahmad', 'ahmad qadiani']
  },
  {
    concept: "Bai'at & Khilafat",
    english: ['conditions of baiat', 'pledge of allegiance', 'initiation', 'khilafat', 'caliphate', 'caliph'],
    urdu: ['بیعت', 'شرائط بیعت', 'خلافت', 'خلیفہ', 'خلافت احمدیہ'],
    arabic: ['بيعة', 'شروط البيعة', 'خلافة', 'خليفة'],
    phonetic: ['baiat', "bai'at", 'bayah', 'sharayit e baiat', 'khilafat', 'khalifa', 'khilafat-e-ahmadiyya']
  },

  // ── 4. God & Divine Oneness (Tawheed) ──
  {
    concept: 'Tawheed & Living God',
    english: ['living god', 'oneness of god', 'unity of god', 'existence of god', 'reality of god', 'monotheism', 'allah'],
    urdu: ['زندہ خدا', 'توحید', 'ہستی باری تعالیٰ', 'خدا کا وجود', 'اللہ', 'خدا'],
    arabic: ['الله', 'توحيد', 'الحي القيوم', 'الواحد', 'الاحد', 'الصمد', 'لا اله الا الله'],
    phonetic: ['zinda khuda', 'tawheed', 'tauheed', 'hasti bari taala', 'allah', 'khuda', 'al-hayyul qayyum', 'ahad', 'samad']
  },
  {
    concept: 'Sufficiency of God (Alaisallahu)',
    english: ['is not allah sufficient for his servant', 'is allah not sufficient', 'alaisallahu bi kafin'],
    urdu: ['الیس اللہ بکاف عبدہ', 'کیا اللہ اپنے بندے کے لیے کافی نہیں'],
    arabic: ['أَلَيْسَ اللَّهُ بِكَافٍ عَبْدَهُ', 'اليس الله بكاف عبده'],
    phonetic: ['alaisallahu bi kafin abduhu', 'alaisallahu bi kafin', 'alaisallaho bikaf', 'alaisa allahu bi kafin']
  },
  {
    concept: 'Acceptance of Prayer & Supplication',
    english: ['prayer', 'supplication', 'acceptance of prayer', 'anguish in prayer', 'answering of prayers'],
    urdu: ['دعا', 'قبولیت دعا', 'برکات الدعا', 'اضطرار', 'التجا'],
    arabic: ['دعاء', 'اجابة الدعاء', 'اجيب دعوة الداع', 'استجابة'],
    phonetic: ['dua', "du'a", 'qabooliat e dua', 'qabuliyat dua', 'barakat-ud-dua', 'iztirar', "ujeebu da'wata d-da'i"]
  },

  // ── 5. Worship & Moral Conduct ──
  {
    concept: 'Namaz & Tahajjud',
    english: ['prayer', 'daily prayer', 'prescribed prayer', 'night prayer', 'voluntary night prayer', 'tahajjud prayer'],
    urdu: ['نماز', 'صلوٰۃ', 'صلوة', 'تہجد', 'نماز تہجد', 'قیام اللیل'],
    arabic: ['صلاة', 'صلوات', 'تهجد', 'قيام الليل'],
    phonetic: ['namaz', 'salat', 'salaat', 'tahajjud', 'qiyamul layl', 'qiyam-ul-layl']
  },
  {
    concept: 'Fasting & Ramadan',
    english: ['fasting', 'fast', 'ramadan', 'holy month of ramadan'],
    urdu: ['روزہ', 'صوم', 'رمضان', 'رمضان المبارک'],
    arabic: ['صوم', 'صيام', 'رمضان'],
    phonetic: ['roza', 'roze', 'sawm', 'siyam', 'ramadan', 'ramzan']
  },
  {
    concept: 'Taqwa & Righteousness',
    english: ['righteousness', 'fear of god', 'piety', 'taqwa', 'purity', 'virtue'],
    urdu: ['تقویٰ', 'تقوی', 'پرہیزگاری', 'نیکی', 'طہارت'],
    arabic: ['تقوى', 'متقين', 'بر', 'صالحات'],
    phonetic: ['taqwa', 'parhezgari', 'muttaqeen', 'birr', 'salihat']
  },
  {
    concept: 'Istighfar & Repentance',
    english: ['seeking forgiveness', 'repentance', 'istighfar', 'pardon'],
    urdu: ['استغفار', 'توبہ', 'معافی', 'استغفر اللہ'],
    arabic: ['استغفار', 'توبة', 'استغفر الله', 'غفران'],
    phonetic: ['istighfar', 'taubah', 'astaghfirullah', 'tauba']
  },
  {
    concept: 'Patience & Gratitude',
    english: ['patience', 'steadfastness', 'gratitude', 'thankfulness'],
    urdu: ['صبر', 'استقامت', 'شکر', 'سپاس'],
    arabic: ['صبر', 'شكر', 'استقامة', 'صابرين'],
    phonetic: ['sabr', 'istiqamat', 'shukr', 'sabireen']
  },

  // ── 6. Jihad & Peace ──
  {
    concept: 'Jihad of the Pen',
    english: ['jihad of the pen', 'spiritual jihad', 'peace', 'cessation of war', 'abrogation of sword jihad'],
    urdu: ['جہاد بالقلم', 'جہاد قلم', 'تلوار کا جہاد منسوخ', 'پیغام صلح', 'امن'],
    arabic: ['جهاد بالقلم', 'جهاد اكبر', 'وضع الحرب', 'سلام'],
    phonetic: ['jihad bil qalam', 'jihad-bil-qalam', 'jihad e akbar', 'paigham e sulh', 'aman', 'salam']
  },

  // ── 7. Foundational Treatises & Books ──
  {
    concept: 'Barahin-e-Ahmadiyya',
    english: ['barahin-e-ahmadiyya', 'barahin e ahmadiyya', 'proofs of ahmadiyya'],
    urdu: ['براہین احمدیہ', 'براہین'],
    arabic: ['البراهين الاحمدية'],
    phonetic: ['barahin-e-ahmadiyya', 'barahin e ahmadiyya', 'barahin']
  },
  {
    concept: 'Philosophy of the Teachings of Islam',
    english: ['philosophy of the teachings of islam', 'philosophy of teachings', 'islami usul ki philosophy'],
    urdu: ['اسلامی اصول کی فلاسفی', 'اسلامی اصول'],
    arabic: ['فلسفة تعاليم الاسلام'],
    phonetic: ['islami usul ki philosophy', 'islami usool ki philosophy']
  },
  {
    concept: 'Izala-e-Auham',
    english: ['izala-e-auham', 'izala e auham', 'removal of misconceptions'],
    urdu: ['ازالہ اوہام', 'ازالہ'],
    arabic: ['ازالة الاوهام'],
    phonetic: ['izala-e-auham', 'izala e auham', 'izalah auham']
  },
  {
    concept: "Kashti-e-Nuh (Noah's Ark)",
    english: ["noah's ark", 'kashti-e-nuh', 'kashti e nuh'],
    urdu: ['کشتی نوح'],
    arabic: ['سفينة نوح'],
    phonetic: ['kashti-e-nuh', 'kashti e nuh', 'kashti e nooh']
  },
  {
    concept: 'Malfuzat',
    english: ['malfuzat', 'discourses', 'sayings of the promised messiah'],
    urdu: ['ملفوظات', 'ملفوظات احمدیہ'],
    arabic: ['ملفوظات'],
    phonetic: ['malfuzat', 'malfoozat']
  },
  {
    concept: 'Tazkirah / Tadhkirah',
    english: ['tazkirah', 'tadhkirah', 'dreams and revelations of the promised messiah'],
    urdu: ['تذکرہ', 'تذکرۃ'],
    arabic: ['تذكرة'],
    phonetic: ['tazkirah', 'tadhkirah', 'tazkira']
  },
  {
    concept: 'The Will (Al-Wasiyyat)',
    english: ['the will', 'al-wasiyyat', 'al wasiyyat'],
    urdu: ['الوصیت', 'وصیت'],
    arabic: ['الوصية'],
    phonetic: ['al-wasiyyat', 'al wasiyyat', 'wasiyyat']
  }
];

/**
 * Normalizes punctuation and casing for verbatim exact comparisons
 */
export function normalizeForExactSearch(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[«»""''‘’“”]/g, '"')
    .replace(/[،,;:!?۔—\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Common phonetic transliteration mappings for Roman Urdu / Arabic words
 */
function generatePhoneticVariants(term: string): string[] {
  const clean = term.toLowerCase().trim();
  const variants = new Set<string>();
  variants.add(clean);

  // Hyphen to space and vice versa
  if (clean.includes('-')) {
    variants.add(clean.replace(/-/g, ' '));
  } else if (clean.includes(' ')) {
    variants.add(clean.replace(/\s+/g, '-'));
  }

  // Common vowel transliteration interchanges (ee <-> i, oo <-> u, aa <-> a)
  const v1 = clean.replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/aa/g, 'a');
  const v2 = clean.replace(/\bi\b/g, 'ee').replace(/u/g, 'oo');
  variants.add(v1);
  variants.add(v2);

  // Phonetic consonants (kh, gh, sh, ch, q, k)
  if (clean.includes('quran')) variants.add(clean.replace('quran', "qur'an"));
  if (clean.includes("qur'an")) variants.add(clean.replace("qur'an", 'quran'));

  return Array.from(variants).filter(v => v.length >= 2);
}

/**
 * Resolves a query into its verbatim original form, exact translations,
 * and phonetic transliterations using the bidirectional lexicon.
 */
export function resolveVerbatimEquivalents(query: string): VerbatimEquivalents {
  const original = query.trim();
  const normQuery = normalizeForExactSearch(original);
  const isUrduOrArabic = /[\u0600-\u06FF]/.test(original);

  const translations = new Set<string>();
  const phonetics = new Set<string>();
  const allSearchTerms = new Set<string>();

  // Always include the exact raw query and its normalized form
  allSearchTerms.add(original);
  if (normQuery && normQuery !== original.toLowerCase()) {
    allSearchTerms.add(normQuery);
  }

  // Add initial phonetic variants of the user query itself
  generatePhoneticVariants(original).forEach(p => {
    phonetics.add(p);
    allSearchTerms.add(p);
  });

  // Query tokens
  const queryTokens = normQuery.split(/\s+/).filter(t => t.length >= 3);

  // Match against the curated theological lexicon
  for (const entry of VERBATIM_THEOLOGICAL_LEXICON) {
    let matched = false;

    // 1. Check Urdu / Arabic matches
    if (isUrduOrArabic) {
      const cleanNormKhazain = normalizeKhazainText(original);
      for (const urdu of entry.urdu) {
        const cleanUrdu = normalizeKhazainText(urdu);
        if (cleanNormKhazain === cleanUrdu) {
          matched = true;
          break;
        }
        // Multi-word phrase check
        if (cleanUrdu.includes(' ') && (cleanNormKhazain.includes(cleanUrdu) || cleanUrdu.includes(cleanNormKhazain))) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        for (const ar of entry.arabic) {
          const cleanAr = normalizeKhazainText(ar);
          if (cleanNormKhazain === cleanAr) {
            matched = true;
            break;
          }
          if (cleanAr.includes(' ') && (cleanNormKhazain.includes(cleanAr) || cleanAr.includes(cleanNormKhazain))) {
            matched = true;
            break;
          }
        }
      }
    } else {
      // 2. Check English and Phonetic matches
      for (const en of entry.english) {
        const normEn = normalizeForExactSearch(en);
        if (normQuery === normEn) {
          matched = true;
          break;
        }
        if (normEn.includes(' ') && normQuery.includes(' ') && (normQuery.includes(normEn) || normEn.includes(normQuery))) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        for (const ph of entry.phonetic) {
          const normPh = normalizeForExactSearch(ph);
          if (normQuery === normPh) {
            matched = true;
            break;
          }
          if (normPh.includes(' ') && normQuery.includes(' ') && (normQuery.includes(normPh) || normPh.includes(normQuery))) {
            matched = true;
            break;
          }
        }
      }
    }

    if (matched) {
      // Add exact translations
      if (isUrduOrArabic) {
        entry.english.forEach(e => translations.add(e));
      } else {
        entry.urdu.forEach(u => translations.add(u));
        entry.arabic.forEach(a => translations.add(a));
      }

      // Add phonetics
      entry.phonetic.forEach(p => {
        phonetics.add(p);
        generatePhoneticVariants(p).forEach(v => phonetics.add(v));
      });

      // Also add primary language equivalents
      entry.english.forEach(e => allSearchTerms.add(e));
      entry.urdu.forEach(u => allSearchTerms.add(u));
      entry.arabic.forEach(a => allSearchTerms.add(a));
      entry.phonetic.forEach(p => allSearchTerms.add(p));
    }
  }

  // Remove exact duplicates matching the original query from translations/phonetics sets
  const lowerOriginal = original.toLowerCase();
  translations.delete(original);
  translations.delete(lowerOriginal);
  phonetics.delete(original);
  phonetics.delete(lowerOriginal);

  return {
    original,
    exactQuery: original,
    isUrduOrArabic,
    translations: Array.from(translations),
    phonetics: Array.from(phonetics),
    allSearchTerms: Array.from(allSearchTerms)
  };
}

/**
 * Checks if a candidate text string contains any verbatim term or its translation/phonetic variant.
 */
export function matchesVerbatim(
  text: string,
  equivalents: VerbatimEquivalents
): { matched: boolean; matchedTerm?: string } {
  if (!text) return { matched: false };
  const lowerText = text.toLowerCase();
  const normText = normalizeForExactSearch(text);
  const normKhazain = normalizeKhazainText(text);

  // 1. Direct raw query check
  if (text.includes(equivalents.original) || lowerText.includes(equivalents.original.toLowerCase())) {
    return { matched: true, matchedTerm: equivalents.original };
  }

  // 2. Check all verbatim terms, translations, and phonetics
  for (const term of equivalents.allSearchTerms) {
    if (!term || term.length < 2) continue;

    // Check Urdu / Arabic
    if (/[\u0600-\u06FF]/.test(term)) {
      const cleanTerm = normalizeKhazainText(term);
      if (normKhazain.includes(cleanTerm)) {
        return { matched: true, matchedTerm: term };
      }
    } else {
      // Latin / English check
      const lowerTerm = term.toLowerCase();
      if (lowerText.includes(lowerTerm)) {
        return { matched: true, matchedTerm: term };
      }
      const normTerm = normalizeForExactSearch(term);
      if (normTerm && normText.includes(normTerm)) {
        return { matched: true, matchedTerm: term };
      }
    }
  }

  return { matched: false };
}
