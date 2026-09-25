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
  // ── 1876: CONSOLATION ON FATHER'S DEMISE ──────────────────────────────────
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
    topics: ["alaisallahu", "father demise", "trust in god", "tawakkul", "sufficiency of god", "signet ring", "الیس اللہ بکاف عبدہ", "توکل", "کفایت الہی", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1880: BARAHIN-E-AHMADIYYA REVELATIONS ─────────────────────────────────
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
    topics: ["prayer", "dua", "acceptance of prayer", "supplication", "ujibu dawata", "barahin", "استجابت دعا", "دعا", "قبولیت دعا", "قرب الہی", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },
  {
    id: "tazkirah-1880-divine-praise-angels",
    year: 1880,
    dateStr: "1880",
    title: "Heavenly Praise and Spiritual Station (Yusalluna Alaika)",
    urduTitle: "فرشتوں کا درود اور آسمانی نصرت کی نوید (يصلون عليك)",
    category: "Revelation (Ilham)",
    originalText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ... يُصَلُّونَ عَلَيْكَ أَهْلُ السَّمَاءِ... إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوْا",
    language: "Arabic",
    englishTranslation: "Holy is Allah and worthy of all praise; Holy is Allah, the Great... The dwellers of heaven pray for thee... Surely Allah is with those who are righteous.",
    historicalContext: "Published in Barahin-e-Ahmadiyya Part 4, revealing that the angelic realm and heavenly forces are dedicated to assisting the cause of the Promised Messiah (as).",
    pageUrdu: 38,
    pageEnglish: 62,
    topics: ["angels", "praise of god", "righteousness", "taqwa", "barahin", "اہل السماء", "تقویٰ", "تسبیح", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1882: DIVINE COMMISSION AS MUJADDID ───────────────────────────────────
  {
    id: "tazkirah-1882-divine-commission-mujaddid",
    year: 1882,
    dateStr: "March 1882",
    title: "Divine Commission as the Reformer of the 14th Century (Mujaddid)",
    urduTitle: "بطور مجدد چودھویں صدی ماموریت الہیہ کا الہام",
    category: "Revelation (Ilham)",
    originalText: "يَا أَحْمَدُ بَارَكَ اللَّهُ فِيكَ... قُلْ إِنِّي أُمِرْتُ وَأَنَا أَوَّلُ الْمُؤْمِنِينَ... الرَّحْمَنُ عَلَّمَ الْقُرْآنَ",
    language: "Arabic",
    englishTranslation: "O Ahmad! God has blessed thee... Say: 'I have been commanded by God and I am the first of believers.' The Gracious God has taught the Qur'an.",
    historicalContext: "Received in March 1882, marking the momentous divine commission as the Mujaddid (Reformer) of the 14th Islamic Century, recorded later in Barahin-e-Ahmadiyya Part 3.",
    pageUrdu: 44,
    pageEnglish: 71,
    topics: ["divine commission", "mujaddid", "reformer", "barahin", "ya ahmad", "ماموریت", "مجدد", "براہین احمدیہ", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1883: THE SIGN OF RED INK DROPS ───────────────────────────────────────
  {
    id: "tazkirah-1883-red-drops",
    year: 1883,
    dateStr: "1883",
    title: "The Heavenly Vision of the Red Ink Drops (Surkh Qatray)",
    urduTitle: "سرخ چھینٹوں کا محیر العقول نشان (رویا و کشف)",
    category: "Vision (Kashf)",
    originalText: "حضرت اقدس نے دیکھا کہ اللہ تعالیٰ نے ایک کاغذ پر دستخط فرمائے اور قلم جھٹکا تو سرخ سیاہی کے قطرے آپ کے کرتے اور میاں عبداللہ سنوری کے کرتے پر گرے۔",
    language: "Urdu",
    englishTranslation: "In a state of vision, the Promised Messiah (as) saw God Almighty sign a decree and flick the pen, causing drops of fresh red ink to fall upon his own shirt and the shirt of his companion, Mian Abdullah Sanauri (ra).",
    historicalContext: "A physical, tangible miracle witnessed by Mian Abdullah Sanauri (ra), who preserved the sacred shirt with the red ink drops as physical evidence of supernatural divine communion.",
    pageUrdu: 86,
    pageEnglish: 132,
    topics: ["red drops", "surkh qatray", "miracle", "abdullah sanauri", "kashf", "vision", "سرخ قطرے", "نشان", "کشف", "رویا", "معجزہ", "تذکرہ", "tazkirah", "tadhkirah"],
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
    originalText: "بَشَّرَكَ اللَّهُ بِغُلَامٍ زَكِيٍّ... کَانَّ اللّٰہَ نَزَلَ مِنَ السَّمَاءِ... هُوَ نُورُ اللَّهِ... وَيَمْلَأُ الْأَرْضَ عَدْلًا",
    language: "Multilingual",
    englishTranslation: "God announces to thee a pure son... He will be extremely intelligent and understanding... as if Allah had descended from heaven... He will be the Light of God, and will fill the earth with justice.",
    historicalContext: "Vouchsafed after 40 days of secluded spiritual retreat and agonizing prayer at Hoshiarpur. Miraculously fulfilled in the person of Hazrat Mirza Bashir-ud-Din Mahmood Ahmad (ra), Khalifatul Masih II.",
    pageUrdu: 115,
    pageEnglish: 176,
    topics: ["musleh maud", "promised reformer", "hoshiarpur", "pure son", "light of god", "prophecy", "prayer", "dua", "مصلح موعود", "پیشگوئی", "ہوشیار پور", "نشان رحمت", "بشارت", "دعا", "چلہ", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1888: INITIATION OF BAI'AT ───────────────────────────────────────────
  {
    id: "tazkirah-1888-baiat-command",
    year: 1888,
    dateStr: "1 December 1888",
    title: "Divine Command to Take Bai'at (Oath of Allegiance)",
    urduTitle: "بیعت لینے کا الہی حکم اور جماعت احمدیہ کا قیام",
    category: "Revelation (Ilham)",
    originalText: "إِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ... وَاصْنَعِ الْفُلْكَ بِأَعْيُنِنَا وَوَحْيِنَا",
    language: "Arabic",
    englishTranslation: "When thou hast determined, put thy trust in Allah... And build the Ark under Our eyes and according to Our revelation.",
    historicalContext: "Revealed on 1 December 1888, instructing Hazrat Ahmad (as) to initiate an official Community of believers by taking the oath of allegiance (Bai'at), first solemnized on 23 March 1889 at Ludhiana.",
    pageUrdu: 151,
    pageEnglish: 212,
    topics: ["baiat", "covenant", "ark of noah", "allegiance", "ludhiana", "jamaat", "بیعت", "کشتی نوح", "عہد بیعت", "تاسیس جماعت", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
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
    originalText: "الْمَسِيحُ ابْنُ مَرْيَمَ مَاتَ وَأَنْتَ جِئْتَ فِي وَقْتِهِ عَلَى نَعْتِهِ... قُلْ إِنِّي بُعِثْتُ عَلَى رَأْسِ الْمِائَةِ",
    language: "Arabic",
    englishTranslation: "The Messiah, son of Mary, has died, and thou hast appeared in his spirit and in his character in accordance with the promise. Say: 'I have been raised at the head of the century.'",
    historicalContext: "Published in Fath-e-Islam and Izala-e-Auham in 1891, proclaiming under direct divine command that Prophet Jesus (as) passed away naturally and that Hazrat Ahmad (as) is the Promised Messiah and Mahdi.",
    pageUrdu: 183,
    pageEnglish: 245,
    topics: ["promised messiah", "wafat masih", "mahdi", "death of jesus", "advent", "مسیح موعود", "مہدی", "وفات مسیح", "ماموریت", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1893: TRIALS, DEBATES, AND VICTORY ───────────────────────────────────
  {
    id: "tazkirah-1893-deliverance-trials",
    year: 1893,
    dateStr: "1893",
    title: "Divine Promise of Deliverance and Global Victory",
    urduTitle: "نصرت الہیہ اور عالمگیر غلبہ اسلام کی بشارت",
    category: "Revelation (Ilham)",
    originalText: "إِنِّي مَعَكَ يَا مَسْرُورُ... يَأْتِيكَ نَصْرِي بَغْتَةً... نَحْنُ نَنْصُرُ رُسُلَنَا",
    language: "Arabic",
    englishTranslation: "I am with thee, O joyful one... My help will come to thee suddenly and unexpectedly... We surely help Our Messengers.",
    historicalContext: "Received during turbulent periods of intense religious opposition, legal persecution, and the historic debate Jang-e-Muqaddas with Christian adversary Abdullah Atham.",
    pageUrdu: 210,
    pageEnglish: 288,
    topics: ["deliverance", "victory of islam", "divine help", "trials", "atham", "نصرت", "غلبہ", "تسلی", "فتح اسلام", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1894: CELESTIAL SIGNS (LUNAR & SOLAR ECLIPSES) ────────────────────────
  {
    id: "tazkirah-1894-eclipses-sign",
    year: 1894,
    dateStr: "Ramadan 1311 AH / April 1894",
    title: "Heavenly Corroboration of the Lunar and Solar Eclipses",
    urduTitle: "رمضان المبارک میں چاند اور سورج گرہن کا آسمانی نشان",
    category: "Revelation (Ilham)",
    originalText: "نَمُدُّ لَهُمْ مَدًّا... آيَتَانِ لِمَهْدِينَا لَمْ تَكُونَا مُنْذُ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ",
    language: "Arabic",
    englishTranslation: "We shall grant them respite... For our Mahdi there are two signs which have never appeared since the creation of the heavens and the earth.",
    historicalContext: "Corroborating the miraculous fulfillment of the prophecy of Sunan Darqutni in Ramadan 1894 (Eastern hemisphere) and 1895 (Western hemisphere), when both eclipses occurred on the specified dates of Ramadan.",
    pageUrdu: 228,
    pageEnglish: 312,
    topics: ["eclipses", "ramadan", "darqutni", "mahdi sign", "celestial sign", "خسوف و کسوف", "رمضان", "دارقطنی", "مہدی", "آسمانی نشان", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1897: FULFILLMENT OF LEKH RAM PROPHECY ────────────────────────────────
  {
    id: "tazkirah-1897-lekh-ram-prophecy",
    year: 1897,
    dateStr: "6 March 1897",
    title: "The Sign of Lekh Ram: A Calamitous Fate Fulfilled",
    urduTitle: "پنڈت لیکھرام کی ہلاکت کا نشان اور الہامی پیشگوئی",
    category: "Revelation (Ilham)",
    originalText: "عِجْلٌ جَسَدٌ لَهُ خُوَارٌ... فَتَرَبَّصُوا إِنَّا مَعَكُمْ مُتَرَبِّصُونَ... قُولُوا لِلظَّالِمِينَ هَذَا يَوْمُكُمْ",
    language: "Arabic",
    englishTranslation: "A miserable calf, a mere lifeless body making a hollow sound... Wait then, and We too are waiting with you... Say to the transgressors: This is your fateful day!",
    historicalContext: "Forewarning the violent demise of the foul-mouthed Arya Samaj leader Pandit Lekh Ram exactly within the five-year timeframe foretold in 1893, on the day after Eid (6 March 1897).",
    pageUrdu: 275,
    pageEnglish: 382,
    topics: ["lekh ram", "prophecy fulfilled", "arya samaj", "divine justice", "لیکھرام", "پیشگوئی", "نشان صداقت", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
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
    historicalContext: "Revealed when the Promised Messiah (as) was living in the remote, unknown village of Qadian without postal rail or printing facilities, miraculously fulfilled today worldwide through MTA, translations, and global missions.",
    pageUrdu: 295,
    pageEnglish: 410,
    topics: ["ends of earth", "tabligh", "propagation", "mta", "global mission", "زمین کے کناروں تک", "تبلیغ", "اشاعت اسلام", "نشان اعظم", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1900: KHUTBA ILHAMIYYA (THE REVEALED SERMON) ─────────────────────────
  {
    id: "tazkirah-1900-khutba-ilhamiyya",
    year: 1900,
    dateStr: "11 April 1900",
    title: "Khutba Ilhamiyya: The Miraculously Revealed Sermon on Eid-ul-Adha",
    urduTitle: "خطبہ الہامیہ: عید الاضحیٰ پر فی البدیہہ عربی خطبہ کا معجزہ",
    category: "Verbal Inspiration",
    originalText: "يَا عِبَادَ اللَّهِ، فَقِّهُوا أَنْفُسَكُمْ فِي حَقِيقَةِ التَّضْحِيَةِ... هَذَا كَلَامٌ أُلْهِمْتُهُ مِنَ السَّمَاءِ",
    language: "Arabic",
    englishTranslation: "O servants of Allah, understand the true reality of sacrifice... These words have been directly inspired into my heart from heaven.",
    historicalContext: "Delivered extemporaneously in eloquent, pristine Arabic on Eid-ul-Adha morning in Masjid Aqsa, Qadian, under intense divine inspiration while Maulvi Nur-ud-Din and Maulvi Abdul Karim (ra) took notes in awe.",
    pageUrdu: 335,
    pageEnglish: 452,
    topics: ["khutba ilhamiyya", "eid", "arabic miracle", "sacrifice", "verbal inspiration", "خطبہ الہامیہ", "عید الاضحیٰ", "عربی اعجاز", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1901: PROPHETHOOD (NABIULLAH) WITHOUT A NEW LAW ───────────────────────
  {
    id: "tazkirah-1901-prophethood-definition",
    year: 1901,
    dateStr: "November 1901",
    title: "Divine Attribution as Prophet (Nabi) Subordinate to Muhammad (sa)",
    urduTitle: "نبوتِ غیر تشریعی اور ظلی نبی کا الہامِ عظیم",
    category: "Revelation (Ilham)",
    originalText: "جَرَى اللَّهُ فِي فُلْكِكَ... هُوَ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَى... نَبِيٌّ وَلَكِنْ لَا بِشَرِيعَةٍ جَدِيدَةٍ",
    language: "Arabic",
    englishTranslation: "Allah has steered thy ark... He it is Who has sent His Messenger with guidance... A prophet, yet not bringing any new law; rather an obedient servant of Muhammad (sa).",
    historicalContext: "Recorded around the publication of the momentous treatise 'Aik Ghalati Ka Izala' (A Misconception Removed), clarifying the nature of Zilli (reflective) and Ummati Prophethood subordinate to Khatam-an-Nabiyyin.",
    pageUrdu: 360,
    pageEnglish: 488,
    topics: ["prophethood", "nabi", "zilli nabi", "aik ghalati ka izala", "khatam-un-nabiyyin", "نبوت", "ظلی نبی", "امتی نبی", "ایک غلطی کا ازالہ", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1902: REVELATIONS ON THE PLAGUE & KASHTI-E-NUH ─────────────────────────
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
    historicalContext: "Revealed during the raging devastating epidemic of the Indian bubonic plague. Recorded in Kashti-e-Nuh (Noah's Ark) as a divine sign of preservation for the righteous followers of the Promised Messiah (as).",
    pageUrdu: 380,
    pageEnglish: 512,
    topics: ["plague", "taun", "kashti-e-nuh", "protection", "sanctuary", "طاعون", "کشتی نوح", "حفاظت", "احافظ کل من فی الدار", "تذکرہ", "tazkirah", "tadhkirah"],
    url: "https://www.alislam.org/book/tadhkirah/"
  },

  // ── 1903: PROPHECY CONCERNING DR. ALEXANDER DOWIE ─────────────────────────
  {
    id: "tazkirah-1903-dowie-prophecy",
    year: 1903,
    dateStr: "1903",
    title: "Prophecy Concerning Dr. John Alexander Dowie of Zion City",
    urduTitle: "امریکی جھوٹے نبی ڈاکٹر ڈوئی کی عبرتناک ہلاکت کی پیشگوئی",
    category: "Revelation (Ilham)",
    originalText: "إِنِّي أَرَى مَوْتَ رَجُلٍ يَدَّعِي النُّبُوَّةَ كَاذِبًا... فَسَوْفَ يُهْلَكُ فِي حَيَاتِكَ",
    language: "Arabic",
    englishTranslation: "I see the death of a man who falsely claims prophethood and vilifies Islam... He shall perish in calamity within thy own lifetime.",
    historicalContext: "Issued in response to the blasphemous American preacher Dr. John Alexander Dowie who sought the destruction of Islam. Dowie suffered severe paralysis, loss of Zion City, and died in misery in March 1907.",
    pageUrdu: 418,
    pageEnglish: 574,
    topics: ["dowie", "zion city", "prophecy fulfilled", "false prophet", "christianity", "ڈوئی", "پیشگوئی", "امریکہ", "ہلاکت", "الہام", "تذکرہ", "tazkirah", "tadhkirah"],
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
    topics: ["al-wasiyyat", "khilafat", "second manifestation", "qudrat-e-saniyya", "the will", "الوصیت", "خلافت", "قدرت ثانیہ", "قرب وفات", "تذکرہ", "tazkirah", "tadhkirah"],
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
    topics: ["earthquake", "kangra", "zalzala", "prophecy", "cataclysm", "زلزلہ", "نشان", "پیشگوئی", "کانگڑہ", "تذکرہ", "tazkirah", "tadhkirah"],
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
    topics: ["english revelation", "i love you", "divine affection", "miracle", "انگریزی الہام", "محبت الہی", "معجزہ", "تذکرہ", "tazkirah", "tadhkirah"],
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
    originalText: "الرَّحِيلُ ثُمَّ الرَّحِيلُ... وَالْمَوْتُ أَقْرَبُ... سَلَامٌ قَوْلًا مِنْ رَبٍّ رَحِيمٍ... لَا إِلَهَ إِلَّا اللَّهُ",
    language: "Arabic",
    englishTranslation: "Departure, then departure... And death is close at hand... Peace, a word of greeting from the Merciful Lord... There is none worthy of worship except Allah.",
    historicalContext: "Received in Lahore in late May 1908 just days prior to his peaceful demise on 26 May 1908, returning to his Lord in full spiritual radiance and triumph.",
    pageUrdu: 590,
    pageEnglish: 802,
    topics: ["final revelation", "departure", "al-rahil", "demise", "meeting with god", "الرحیل", "وفات", "لقائے الہی", "آخری الہام", "سلام قولا", "تذکرہ", "tazkirah", "tadhkirah"],
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

  // Check if user is searching generically for Tazkirah, revelations, or visions
  const isGenericTazkirahQuery =
    /(?:^|\b)(?:tadhkirah|tadhkira|tazkirah|tazkira|تذکرہ|تذکره|revelations?|dreams?|visions?|ilham|ilhamaat|ilhamat|ruya|ru'ya|kashf|الہام|الہامات|کشف|رویا|وحی|بشارت)(?:\b|$)/i.test(rawClean) ||
    normUrduQuery.includes("تذکرہ") || normUrduQuery.includes("الہام") || normUrduQuery.includes("کشف");

  // Check year specific queries (e.g. "1886", "1894", "1905", "1908")
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

    // Base score for generic queries to ensure revelations are populated
    if (isGenericTazkirahQuery) {
      score += 50;
      if (targetYear && entry.year === targetYear) {
        score += 100;
      }
    }

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
  .sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.year - b.entry.year;
  })
  .map(item => item.entry);

  return resultsWithScore;
}
