export type TimelineEra = 'pre-birth' | 'early-childhood' | 'mecca-revelation' | 'medina' | 'after-fatah-mecca';

export interface EraColorConfig {
  id: TimelineEra;
  name: string;
  pastel: string;        // Light pastel color for SVG line
  accent: string;        // Deeper pastel tone for active state / border
  glow: string;          // Drop shadow glow
  bgChip: string;        // Tailwind classes for period badge
  textClass: string;     // Text color class
  dotColor: string;
}

export const ERA_CONFIGS: Record<TimelineEra, EraColorConfig> = {
  'pre-birth': {
    id: 'pre-birth',
    name: 'Pre-Birth (Year of the Elephant)',
    pastel: '#cbd5e1',     // Soft light pastel grey (Slate 300)
    accent: '#94a3b8',     // Slate 400
    glow: 'rgba(148, 163, 184, 0.45)',
    bgChip: 'bg-slate-200/80 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    textClass: 'text-slate-500 dark:text-slate-400',
    dotColor: '#94a3b8'
  },
  'early-childhood': {
    id: 'early-childhood',
    name: 'Childhood & Youth (Birth to Age 40)',
    pastel: '#fca5a5',     // Soft light pastel red / rose (Red 300)
    accent: '#f87171',     // Red 400
    glow: 'rgba(248, 113, 113, 0.45)',
    bgChip: 'bg-rose-100/90 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300/60 dark:border-rose-800/60',
    textClass: 'text-rose-600 dark:text-rose-400',
    dotColor: '#f87171'
  },
  'mecca-revelation': {
    id: 'mecca-revelation',
    name: 'Makkan Ministry (Revelation to Hijrah)',
    pastel: '#d8b4fe',     // Soft light pastel purple / lavender (Purple 300)
    accent: '#c084fc',     // Purple 400
    glow: 'rgba(192, 132, 252, 0.45)',
    bgChip: 'bg-purple-100/90 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300/60 dark:border-purple-800/60',
    textClass: 'text-purple-600 dark:text-purple-400',
    dotColor: '#c084fc'
  },
  'medina': {
    id: 'medina',
    name: 'Medina Era (1–8 A.H.)',
    pastel: '#86efac',     // Soft light pastel green / mint (Green 300)
    accent: '#4ade80',     // Green 400
    glow: 'rgba(74, 222, 128, 0.45)',
    bgChip: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800/60',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    dotColor: '#4ade80'
  },
  'after-fatah-mecca': {
    id: 'after-fatah-mecca',
    name: 'Post-Fatah Makkah (8–11 A.H.)',
    pastel: '#fdba74',     // Soft light pastel orange / peach (Orange 300)
    accent: '#fb923c',     // Orange 400
    glow: 'rgba(251, 146, 60, 0.45)',
    bgChip: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300/60 dark:border-amber-800/60',
    textClass: 'text-amber-600 dark:text-amber-400',
    dotColor: '#fb923c'
  }
};

export const getEventEra = (event: TimelineEvent): TimelineEra => {
  if (event.id === 'ashabul-fil') return 'pre-birth';
  
  const earlyChildhoodIds = [
    'birth-prophet',
    'fosterage-halimah',
    'demise-aminah',
    'demise-abdul-muttalib',
    'bahira-monk',
    'harb-e-fijar',
    'hilful-fudul',
    'marriage-khadijah',
    'arbitration-black-stone'
  ];
  if (earlyChildhoodIds.includes(event.id)) return 'early-childhood';
  
  const meccaRevelationIds = [
    'first-revelation',
    'first-believers',
    'dar-e-arqam',
    'persecution-slaves',
    'migration-abyssinia-1',
    'migration-abyssinia-2',
    'conversion-hamzah',
    'conversion-umar',
    'shib-abi-talib-boycott',
    'shaqqul-qamar',
    'year-of-grief',
    'journey-taif',
    'miraj-isra',
    'first-pledge-aqabah',
    'second-pledge-aqabah',
    'darun-nadwah-conspiracy',
    'suraqah-pursuit'
  ];
  if (meccaRevelationIds.includes(event.id)) return 'mecca-revelation';
  
  const postFatahIds = [
    'conquest-of-makkah',
    'battle-of-hunain',
    'expedition-of-tabuk',
    'year-of-delegations',
    'farewell-pilgrimage',
    'expedition-of-usamah',
    'demise-holy-prophet'
  ];
  if (postFatahIds.includes(event.id)) return 'after-fatah-mecca';
  
  return 'medina';
};

export interface LinkedKhutba {
  id: string;
  title: string;
  date: string;
  year: number;
  url: string;
  youtubeId?: string;
  thumbnailUrl: string;
  summary: string;
}

export interface LinkedHadith {
  id: string;
  collection: string;
  reference: string;
  narrator: string;
  textSnippet: string;
  url: string;
}

export interface LinkedArticle {
  id: string;
  source: 'Review of Religions' | 'Al Hakam' | 'Al Islam';
  title: string;
  author?: string;
  url: string;
  summary: string;
  dateOrIssue?: string;
}

export interface TimelineEvent {
  id: string;
  vol: 1 | 2 | 3;
  period: "Makkan Era" | "Early Medina" | "Late Medina / Treaties";
  year: string;
  date: string;
  title: string;
  category: "Milestone" | "Battle / Expedition" | "Treaty & Diplomatic" | "Revelation & Law" | "Personal & Family";
  desc: string;
  source: string;
  tags: string[];
  khutbas?: LinkedKhutba[];
  hadiths?: LinkedHadith[];
  articles?: LinkedArticle[];
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    "id": "ashabul-fil",
    "vol": 1,
    "period": "Makkan Era",
    "year": "570 A.D.",
    "date": "Circa 570 A.D. (Year of the Elephant)",
    "title": "The Year of the Elephant (Ashabul-Fil)",
    "category": "Milestone",
    "desc": "Abrahah al-Ashram, the Christian Viceroy of Yemen, marched upon Makkah with a formidable army and war elephants to demolish the Holy Ka'bah. God the Almighty miraculously destroyed Abrahah's legions with swarms of birds hurling stones of baked clay (Sijjin), as immortalized in Surah Al-Fil. Exactly 25 days after this miraculous deliverance, the Holy Prophet (sa) was born.",
    "source": "Seal of the Prophets Vol. I, Ch. III, pp. 146–148",
    "tags": [
      "Ka'bah",
      "Abrahah",
      "Elephant",
      "Miracle",
      "Al-Fil"
    ],
    "khutbas": [],
    "articles": [
      {
        "id": "ror-ashabul-fil-abrahah",
        "source": "Review of Religions",
        "title": "The Year of the Elephant: Abrahah's Expedition and Archaeological Corroboration",
        "author": "Research Cell Review of Religions",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Historical analysis of South Arabian epigraphic inscriptions, the campaign of Abrahah al-Ashram, and the divine intervention delivering the Ka'bah right before the Prophet's (sa) birth.",
        "dateOrIssue": "Historical Studies"
      },
      {
        "id": "alhakam-surah-fil-commentary",
        "source": "Al Hakam",
        "title": "Surah Al-Fil: The Destruction of the People of the Elephant",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "Theological exposition and historical context of the miraculous destruction of the invading Axumite army and its significance for the advent of Islam.",
        "dateOrIssue": "Quranic Exegesis"
      }
    ]
  },
  {
    "id": "birth-prophet",
    "vol": 1,
    "period": "Makkan Era",
    "year": "570 / 571 A.D.",
    "date": "12 Rabi‘ul-Awwal (20 Aug 570 A.D.) / 9 Rabi‘ul-Awwal (20 Apr 571 A.D.)",
    "title": "Auspicious Birth of the Holy Prophet (sa)",
    "category": "Milestone",
    "desc": "The Holy Prophet Muhammad (sa) was born in the Valley of Banu Hashim in Makkah on a Monday morning. His father, 'Abdullah bin 'Abdul-Muttalib, had passed away months prior in Yathrib. His grandfather, 'Abdul-Muttalib, joyfully took the newborn to the Ka'bah and named him 'Muhammad' (The Praised One)—a rare and auspicious name signifying that his praise would echo throughout the earth.",
    "source": "Seal of the Prophets Vol. I, Ch. IV, pp. 153–154",
    "tags": [
      "Birth",
      "Aminah",
      "Abdul-Muttalib",
      "Muhammad",
      "Makkah"
    ],
    "khutbas": [
      {
        "id": "2023-07-07",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Jul 7, 2023",
        "year": 2023,
        "url": "https://www.alislam.org/friday-sermon/2023-07-07.html",
        "youtubeId": "m3ShYvhQ8Pw",
        "thumbnailUrl": "https://img.youtube.com/vi/m3ShYvhQ8Pw/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad (aba) said that in the previous sermon, he had been mentioning the awe that the Muslims had over the disbelievers of Makkah, in the course of which he mentioned the dispute between Abu Jahl and Utbah."
      },
      {
        "id": "2023-06-16",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Jun 16, 2023",
        "year": 2023,
        "url": "https://www.alislam.org/friday-sermon/2023-06-16.html",
        "youtubeId": "w89XyrboFKU",
        "thumbnailUrl": "https://img.youtube.com/vi/w89XyrboFKU/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta’awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that the he would continue mentioning the preparations that were undertaken in preparation for battle with the disbelievers of Makkah."
      }
    ],
    "articles": [
      {
        "id": "ror-prophet-birth-prophecies",
        "source": "Review of Religions",
        "title": "The Auspicious Birth of the Holy Prophet Muhammad (sa) and Prophecies in World Scriptures",
        "author": "Maulana Muhammad Din",
        "url": "https://www.reviewofreligions.org/",
        "summary": "How ancient prophetic traditions across Biblical, Zoroastrian, and Hindu scriptures converged on the auspicious dawn in the Valley of Banu Hashim in 570/571 AD.",
        "dateOrIssue": "Seerat-un-Nabi Special"
      },
      {
        "id": "alislam-life-of-muhammad-intro",
        "source": "Al Islam",
        "title": "Life of Muhammad: The Dawn of Prophethood and Early Life",
        "author": "Hazrat Mirza Bashiruddin Mahmud Ahmad (ra)",
        "url": "https://www.alislam.org/book/life-of-muhammad/",
        "summary": "Detailed monograph chronicling the lineage, auspicious naming, and divine signs accompanying the birth of the Holy Prophet (sa) in Makkah.",
        "dateOrIssue": "Classic Biography"
      }
    ]
  },
  {
    "id": "fosterage-halimah",
    "vol": 1,
    "period": "Makkan Era",
    "year": "Age 0–4",
    "date": "571 – 575 A.D.",
    "title": "Fosterage in the Desert of Banu Sa‘d",
    "category": "Personal & Family",
    "desc": "In accordance with noble Quraysh customs, the infant Muhammad (sa) was entrusted to Hadrat Halimah as-Sa‘diyyah of the Banu Sa‘d tribe in the open, pure desert atmosphere. Here he acquired the purest Arabic dialect. Remarkable spiritual and material blessings enveloped Halimah's household during his stay, demonstrating divine favor from infancy.",
    "source": "Seal of the Prophets Vol. I, Ch. IV, pp. 154–158",
    "tags": [
      "Halimah",
      "Banu Sa‘d",
      "Fosterage",
      "Childhood"
    ],
    "khutbas": [],
    "articles": [
      {
        "id": "alhakam-halimah-saadiyyah",
        "source": "Al Hakam",
        "title": "Hazrat Halimah Sa'diyyah: Fosterage of the Holy Prophet (sa) in the Desert",
        "author": "Al Hakam Research Desk",
        "url": "https://www.alhakam.org/",
        "summary": "A review of the pure dialect, moral upbringing, and the abundant divine blessings manifested in the household of Banu Sa'd during the Prophet's (sa) infancy.",
        "dateOrIssue": "Seerat Series"
      }
    ]
  },
  {
    "id": "demise-aminah",
    "vol": 1,
    "period": "Makkan Era",
    "year": "Age 6",
    "date": "576 A.D.",
    "title": "Demise of Hadrat Aminah at Abwa’",
    "category": "Personal & Family",
    "desc": "His mother, Hadrat Aminah, journeyed with the six-year-old Muhammad (sa) and faithful maidservant Umm Ayman to Yathrib to visit her husband 'Abdullah's resting place. On the return journey back to Makkah, Aminah fell grievously ill and passed away at Abwa', leaving the child completely orphaned in the care of God.",
    "source": "Seal of the Prophets Vol. I, Ch. IV, pp. 159–161",
    "tags": [
      "Aminah",
      "Abwa",
      "Orphan",
      "Umm Ayman"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "muslim-976",
        "collection": "Sahih Muslim",
        "reference": "Book 11, Hadith 135",
        "narrator": "Narrated Abu Huraira",
        "textSnippet": "The Apostle of Allah (sa) visited the grave of his mother and he wept, and moved others around him to tears...",
        "url": "https://sunnah.com/muslim:976"
      }
    ],
    "articles": [
      {
        "id": "ror-the-orphan-prophet",
        "source": "Review of Religions",
        "title": "The Orphan of Makkah: Spiritual Lessons from the Prophet's (sa) Early Losses",
        "author": "Dr. Ijaz Ahmad",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Exploring the profound wisdom behind the Prophet (sa) losing both parents and grandfather in tender childhood, cultivated solely under direct Divine guardianship.",
        "dateOrIssue": "Historical Analysis"
      }
    ]
  },
  {
    "id": "demise-abdul-muttalib",
    "vol": 1,
    "period": "Makkan Era",
    "year": "Age 8",
    "date": "578 A.D.",
    "title": "Guardianship & Demise of ‘Abdul-Muttalib",
    "category": "Personal & Family",
    "desc": "For two tender years, his venerable grandfather 'Abdul-Muttalib poured extraordinary love upon the young Muhammad (sa), seating him upon his exclusive rug beside the Ka'bah. Upon 'Abdul-Muttalib's deathbed at age 82, he formally bequeathed the young child to his noble son Abu Talib, brother of 'Abdullah by the same mother.",
    "source": "Seal of the Prophets Vol. I, Ch. IV, pp. 161–162",
    "tags": [
      "Abdul-Muttalib",
      "Abu Talib",
      "Guardianship"
    ],
    "khutbas": []
  },
  {
    "id": "bahira-monk",
    "vol": 1,
    "period": "Makkan Era",
    "year": "Age 12",
    "date": "582 A.D.",
    "title": "Journey to Syria & Bahira the Monk",
    "category": "Milestone",
    "desc": "Accompanying his uncle Abu Talib with a merchant caravan to Busra in Syria, they halted near the hermitage of Bahira the Christian monk. Bahira observed prophetic signs—a cloud shading the boy and tree branches bowing—and recognized in him the marks of the promised prophet mentioned in biblical scriptures, cautioning Abu Talib to safeguard him from malevolent hands.",
    "source": "Seal of the Prophets Vol. I, Ch. IV, pp. 162–165",
    "tags": [
      "Bahira",
      "Busra",
      "Syria",
      "Abu Talib",
      "Prophecy"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "tirmidhi-3620",
        "collection": "Jami' at-Tirmidhi",
        "reference": "Vol. 1, Book 46, Hadith 3620",
        "narrator": "Narrated Abu Musa al-Ash'ari",
        "textSnippet": "Abu Talib departed to Ash-Sham, and the Prophet (sa) left with him... The monk said, 'This is the master of the worlds... Allah will send him as a mercy to the worlds.'",
        "url": "https://sunnah.com/tirmidhi:3620"
      }
    ],
    "articles": [
      {
        "id": "ror-bahira-monk-rebuttal",
        "source": "Review of Religions",
        "title": "Bahira the Christian Monk: Rebutting Orientalist Myths of Christian Borrowing",
        "author": "Syed Mir Mahmood Ahmad Nasir",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Rigorous scholastic analysis refuting Western claims that a brief childhood meeting with monk Bahira at Busra was the genesis of Islamic monotheism.",
        "dateOrIssue": "Scholarly Research"
      },
      {
        "id": "alhakam-syria-caravan-bahira",
        "source": "Al Hakam",
        "title": "The Trade Journey to Syria and the Testimonies of Bahira",
        "author": "Al Hakam History Desk",
        "url": "https://www.alhakam.org/",
        "summary": "How Bahira identified biblical marks of prophethood and counselled Abu Talib to shield the young Muhammad (sa) from malevolent factions.",
        "dateOrIssue": "Historical Archive"
      }
    ]
  },
  {
    "id": "harb-e-fijar",
    "vol": 1,
    "period": "Makkan Era",
    "year": "Age 15–20",
    "date": "Circa 585–590 A.D.",
    "title": "Harb-e-Fijar (The Sacrilegious War)",
    "category": "Milestone",
    "desc": "A bitter war erupted between the Quraysh-Kinana alliance and the Hawazin tribe during sacred months within the sacred sanctuary. The youth Muhammad (sa) participated strictly non-violently by collecting enemy arrows aimed at his uncles and returning them, witnessing firsthand the cruel horrors of tribal bloodshed.",
    "source": "Seal of the Prophets Vol. I, Ch. IV, pp. 167–168",
    "tags": [
      "Harb-e-Fijar",
      "Tribal War",
      "Hawazin",
      "Kinana"
    ],
    "khutbas": []
  },
  {
    "id": "hilful-fudul",
    "vol": 1,
    "period": "Makkan Era",
    "year": "Age 20",
    "date": "Circa 590 A.D.",
    "title": "Hilful-Fudul (The League of the Virtuous)",
    "category": "Treaty & Diplomatic",
    "desc": "Deeply moved by an injustice inflicted upon a Yemeni merchant by 'As bin Wa'il, noble chiefs assembled in the house of 'Abdullah bin Jud‘an and swore a solemn pact to champion every oppressed person in Makkah, native or foreigner. The Holy Prophet (sa) was a prominent signatory and later affirmed in Medina: 'I would not exchange my presence at that pact for red camels, and if summoned to it in Islam, I would respond.'",
    "source": "Seal of the Prophets Vol. I, Ch. IV, pp. 168–169",
    "tags": [
      "Hilful-Fudul",
      "Justice",
      "Alliance",
      "Human Rights"
    ],
    "khutbas": [],
    "articles": [
      {
        "id": "ror-hilful-fudul-human-rights",
        "source": "Review of Religions",
        "title": "Hilful-Fudul (League of the Virtuous): The First Human Rights Coalition in Arabia",
        "author": "Asif M. Basit",
        "url": "https://www.reviewofreligions.org/",
        "summary": "How the Holy Prophet's (sa) participation in Hilful-Fudul established the Islamic archetype of defending all oppressed individuals regardless of race, status, or religion.",
        "dateOrIssue": "Ethics & Governance"
      },
      {
        "id": "alhakam-league-of-virtuous",
        "source": "Al Hakam",
        "title": "The League of the Virtuous: Early Foundations of Islamic Civic Justice",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "An examination of the Holy Prophet's affirmation in Medina: 'If summoned to such a pact in Islam, I would respond without hesitation.'",
        "dateOrIssue": "Jurisprudence & History"
      }
    ]
  },
  {
    "id": "marriage-khadijah",
    "vol": 1,
    "period": "Makkan Era",
    "year": "Age 25",
    "date": "595 A.D.",
    "title": "Marriage to Hadrat Khadijah bint Khuwailid (ra)",
    "category": "Personal & Family",
    "desc": "Impressed by his immaculate honesty (Al-Amin) and extraordinary business acumen while managing her trade caravan to Busra alongside her slave Maisarah, the noble and wealthy Qurayshite widow Hadrat Khadijah (ra) proposed marriage. Despite her being 40 and him 25, their 25-year union was a bastion of unparalleled love, fidelity, mutual respect, and profound spiritual solace.",
    "source": "Seal of the Prophets Vol. I, Ch. IV, pp. 170–173",
    "tags": [
      "Khadijah",
      "Marriage",
      "Al-Amin",
      "Maisarah"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "bukhari-3820",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 63, Hadith 46",
        "narrator": "Narrated 'Aisha",
        "textSnippet": "I did not feel jealous of any of the wives of the Prophet (sa) as much as I did of Khadija though I did not see her, but the Prophet (sa) used to mention her very often...",
        "url": "https://sunnah.com/bukhari:3820"
      }
    ],
    "articles": [
      {
        "id": "ror-hazrat-khadijah-paragon",
        "source": "Review of Religions",
        "title": "Hazrat Khadijat-ul-Kubra (ra): The First Believer and Fortress of Devotion",
        "author": "Amatul Hadi Ahmad",
        "url": "https://www.reviewofreligions.org/",
        "summary": "A deep psychological and spiritual study of the 25-year matrimonial bond between the Holy Prophet (sa) and Hadrat Khadijah (ra), embodying absolute fidelity and mutual elevation.",
        "dateOrIssue": "Women in Islam"
      },
      {
        "id": "alhakam-khadijah-business-nobility",
        "source": "Al Hakam",
        "title": "Al-Amin and the Caravan of Khadijah: Honesty That Won a Queen of Quraysh",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "How spotless integrity (Al-Amin) in managing the commercial caravans to Busra became the spiritual foundation for Islam's earliest home.",
        "dateOrIssue": "Historical Studies"
      }
    ]
  },
  {
    "id": "arbitration-black-stone",
    "vol": 1,
    "period": "Makkan Era",
    "year": "Age 35",
    "date": "605 A.D.",
    "title": "Reconstruction of the Ka‘bah & The Black Stone Arbitration",
    "category": "Milestone",
    "desc": "When a sudden flood damaged the Ka'bah, the Quraysh rebuilt it but nearly drew swords over who would have the supreme honor of placing the Black Stone (Hajar-e-Aswad). Agreeing to appoint the next person entering the sanctuary as arbiter, Muhammad (sa) walked in to shouts of 'Here is Al-Amin, we are well pleased!' He spread his cloak, set the stone upon it, had chiefs of all four confederations raise it collectively, and set it into position with his own hands, averting civil war.",
    "source": "Seal of the Prophets Vol. I, Ch. IV, pp. 174–176",
    "tags": [
      "Ka'bah",
      "Black Stone",
      "Hajar-e-Aswad",
      "Arbitration",
      "Al-Amin"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "musnad-ahmad-15504",
        "collection": "Musnad Ahmad",
        "reference": "Hadith 15504",
        "narrator": "Narrated Ibn Abbas",
        "textSnippet": "...The Quraysh said: 'Let the first man to enter through the gate be our judge.' The Messenger of Allah (sa) was the first to enter. They said: 'This is the trustworthy one (Al-Amin).' ...",
        "url": "https://sunnah.com/ahmad/70"
      }
    ],
    "articles": [
      {
        "id": "alhakam-rebuilding-kabah-arbitration",
        "source": "Al Hakam",
        "title": "Rebuilding of the Holy Ka'bah and the Prophet's (sa) Masterclass in Dispute Resolution",
        "author": "Al Hakam Research Desk",
        "url": "https://www.alhakam.org/",
        "summary": "How the 35-year-old Muhammad (sa) averted an imminent tribal civil war by laying the Black Stone on his mantle and uniting all four Makkan confederations.",
        "dateOrIssue": "Diplomacy & Conflict Resolution"
      }
    ]
  },
  {
    "id": "first-revelation",
    "vol": 1,
    "period": "Makkan Era",
    "year": "Age 40 / 1 Nabawi",
    "date": "Ramadan / August 610 A.D.",
    "title": "The First Revelation in the Cave of Hira",
    "category": "Revelation & Law",
    "desc": "Retiring to the lonely Mount Hira for deep meditation and prayers, the Archangel Gabriel appeared and commanded: 'Iqra’' (Recite!). When the Prophet replied he knew not how to recite, Gabriel embraced him forcefully three times and delivered the first revelation: 'Recite in the name of thy Lord Who created...' (Surah Al-Alaq 96:2–6). Shaken by the weight of divine responsibility, he returned home to Khadijah (ra), who comforted him with historical words: 'By Allah, God will never humiliate you, for you maintain ties of kinship, assist the weak, honor guests, and support the afflicted.'",
    "source": "Seal of the Prophets Vol. I, Ch. VI, pp. 191–193",
    "tags": [
      "Hira",
      "First Revelation",
      "Gabriel",
      "Iqra",
      "Khadijah"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "bukhari-3",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 1, Hadith 3",
        "narrator": "Narrated 'Aisha",
        "textSnippet": "The commencement of the Divine Inspiration to Allah's Messenger (sa) was in the form of good dreams which came true like bright daylight, and then the love of seclusion was bestowed upon him.",
        "url": "https://sunnah.com/bukhari:3"
      }
    ],
    "articles": [
      {
        "id": "ror-mount-hira-psychology-revelation",
        "source": "Review of Religions",
        "title": "Mount Hira and the Psychology of Prophetic Revelation: Demystifying Gabriel's Descent",
        "author": "Hazrat Mirza Tahir Ahmad (rh)",
        "url": "https://www.reviewofreligions.org/",
        "summary": "The reality of 'Iqra' in the Cave of Hira, answering modern naturalistic critiques and examining Hazrat Khadijah's monumental historical testimony.",
        "dateOrIssue": "Theological Studies"
      },
      {
        "id": "alhakam-first-revelation-hira",
        "source": "Al Hakam",
        "title": "The Solitude of Mount Hira: The Commencement of Divine Inspiration",
        "author": "Al Hakam Research Desk",
        "url": "https://www.alhakam.org/",
        "summary": "Chronicle of Ramadan 610 AD, the trembling of the mortal vessel under divine weight, and the eternal solace: 'By God, Allah will never humiliate you.'",
        "dateOrIssue": "Revelation & Prophethood"
      }
    ]
  },
  {
    "id": "first-believers",
    "vol": 1,
    "period": "Makkan Era",
    "year": "1 Nabawi",
    "date": "Late 610 A.D.",
    "title": "The First Believers (Al-Sabiqun Al-Awwalun)",
    "category": "Milestone",
    "desc": "Hadrat Khadijah (ra) embraced Islam instantly without a heartbeat's hesitation, followed by his cousin Hadrat 'Ali (ra), his loyal freedman Hadrat Zaid bin Harithah (ra), and his lifelong confidant Hadrat Abu Bakr (ra). Abu Bakr immediately reached out to prominent noble companions who entered Islam: Hadrat 'Uthman bin 'Affan, 'Abdur-Rahman bin 'Auf, Sa‘d bin Abi Waqqas, Talhah bin ‘Ubaidillah, and Zubair bin al-Awwam (ra).",
    "source": "Seal of the Prophets Vol. I, Ch. VI, pp. 196–201",
    "tags": [
      "Khadijah",
      "Abu Bakr",
      "Ali",
      "Zaid",
      "Uthman",
      "Pioneers"
    ],
    "khutbas": [
      {
        "id": "2022-06-03",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Jun 3, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-06-03.html",
        "youtubeId": "UNaiBLqekLE",
        "thumbnailUrl": "https://img.youtube.com/vi/UNaiBLqekLE/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra) and his battles with the hypocrites after the demise of the Holy Prophet(sa)."
      }
    ],
    "articles": [
      {
        "id": "alhakam-pioneers-dar-e-arqam",
        "source": "Al Hakam",
        "title": "Al-Sabiqun Al-Awwalun: The Undaunted Faith of Islam's First Converts",
        "author": "Al Hakam History Desk",
        "url": "https://www.alhakam.org/",
        "summary": "Profiles of Hazrat Abu Bakr, Hazrat Khadijah, Hazrat Ali, and Hazrat Zaid bin Harithah (ra), and their immediate acceptance without questioning.",
        "dateOrIssue": "Companions of the Prophet"
      }
    ]
  },
  {
    "id": "dar-e-arqam",
    "vol": 1,
    "period": "Makkan Era",
    "year": "3–4 Nabawi",
    "date": "613–614 A.D.",
    "title": "Establishment of Dar-e-Arqam",
    "category": "Milestone",
    "desc": "As open preaching began upon the revelation of 'Warn thy nearest kinsmen' (26:215) and the Prophet's address from Mount Safa, fierce persecution intensified. The Holy Prophet (sa) established the secluded house of Arqam bin Abi al-Arqam near Mount Safa as the secret central sanctuary for Islamic instruction, congregational worship, and spreading the divine message.",
    "source": "Seal of the Prophets Vol. I, Ch. VI, pp. 206–208",
    "tags": [
      "Dar-e-Arqam",
      "Mount Safa",
      "Safa",
      "Preaching"
    ],
    "khutbas": [],
    "articles": [
      {
        "id": "ror-dar-e-arqam-academy",
        "source": "Review of Religions",
        "title": "Dar-e-Arqam: The Secluded Nursery of the Islamic World",
        "author": "M. A. Saqi",
        "url": "https://www.reviewofreligions.org/",
        "summary": "How the private home of a young believer beneath Mount Safa functioned as the world's most transformative secret academy of moral reformation.",
        "dateOrIssue": "Education & History"
      }
    ]
  },
  {
    "id": "persecution-slaves",
    "vol": 1,
    "period": "Makkan Era",
    "year": "4–5 Nabawi",
    "date": "614–615 A.D.",
    "title": "Cruel Persecution of Early Muslim Converts",
    "category": "Milestone",
    "desc": "The Quraysh unleashed barbaric torture upon defenseless believers. Hadrat Bilal al-Habashi (ra) was dragged across scorching sands beneath heavy burning boulders, proclaiming uninterruptedly: 'Ahad, Ahad' (God is One). Hadrat Yasir and his wife Sumayyah were brutally murdered, becoming the first martyrs of Islam. Hadrat Khabbab bin al-Aratt was pressed onto glowing coals. Hadrat Abu Bakr (ra) spent fortunes buying and manumitting enslaved converts.",
    "source": "Seal of the Prophets Vol. I, Ch. VI, pp. 219–225",
    "tags": [
      "Bilal",
      "Sumayyah",
      "Yasir",
      "Khabbab",
      "Persecution",
      "Martyrs"
    ],
    "khutbas": [
      {
        "id": "2022-08-26",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Aug 26, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-08-26.html",
        "youtubeId": "-3jDw2JNudg",
        "thumbnailUrl": "https://img.youtube.com/vi/-3jDw2JNudg/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra) and the armies he sent towards Syria in order to stop the enemy."
      },
      {
        "id": "2021-09-24",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Sep 24, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-09-24.html",
        "youtubeId": "VgtJi6fNUUM",
        "thumbnailUrl": "https://img.youtube.com/vi/VgtJi6fNUUM/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Umar(ra)."
      },
      {
        "id": "2020-09-25",
        "title": "Men of Excellence : Hazrat Bilal (ra)",
        "date": "Sep 25, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-09-25.html",
        "youtubeId": "tP-HyA6wp4U",
        "thumbnailUrl": "https://img.youtube.com/vi/tP-HyA6wp4U/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta`awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said he would continue highlighting the life of Hazrat Bilal bin Rabah(ra)."
      },
      {
        "id": "2020-09-18",
        "title": "Men of Excellence : Hazrat Bilal (ra)",
        "date": "Sep 18, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-09-18.html",
        "youtubeId": "_DuykOWoGuQ",
        "thumbnailUrl": "https://img.youtube.com/vi/_DuykOWoGuQ/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta’awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Bilal bin Rabah(ra)."
      }
    ],
    "hadiths": [
      {
        "id": "bukhari-3856",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 63, Hadith 82",
        "narrator": "Narrated Khabbab bin Al-Aratt",
        "textSnippet": "We complained to Allah's Messenger (sa) (of the persecution inflicted on us by the infidels) while he was sitting in the shade of the Ka'ba... He said, 'Among those who were before you a (believer) used to be seized... but that would not make him give up his religion.'",
        "url": "https://sunnah.com/bukhari:3856"
      }
    ],
    "articles": [
      {
        "id": "ror-bilal-martyrs-makkah",
        "source": "Review of Religions",
        "title": "Ahad, Ahad: Hazrat Bilal and the Enslaved Martyrs under Makkan Torture",
        "author": "Review of Religions Research Desk",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Documenting the excruciating trials of Hazrat Bilal, Sumayyah, Yasir, and Khabbab (ra) and how unyielding monotheism shattered the bondage of Makkan aristocracy.",
        "dateOrIssue": "Martyrs & Steadfastness"
      },
      {
        "id": "alhakam-abu-bakr-manumission",
        "source": "Al Hakam",
        "title": "The Emancipator: How Hazrat Abu Bakr (ra) Purchased Freedom for Slaves",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "An exposition on Islamic abolitionism in 7th century Arabia, where wealth was liquidized purely to liberate suffering believers from torture.",
        "dateOrIssue": "Human Liberty"
      }
    ]
  },
  {
    "id": "migration-abyssinia-1",
    "vol": 1,
    "period": "Makkan Era",
    "year": "5 Nabawi",
    "date": "Rajab / April 615 A.D.",
    "title": "First Migration to Abyssinia (Habashah)",
    "category": "Milestone",
    "desc": "To save his companions from unendurable agony, the Holy Prophet (sa) instructed a party of eleven men and four women—including Hadrat 'Uthman bin 'Affan and the Prophet's daughter Hadrat Ruqayyah (ra)—to migrate across the Red Sea to Abyssinia, where the righteous Christian king, the Negus (Najashi), ruled without oppressing anyone.",
    "source": "Seal of the Prophets Vol. I, Ch. VII, pp. 229–230",
    "tags": [
      "Abyssinia",
      "Negus",
      "Najashi",
      "Migration",
      "Uthman",
      "Ruqayyah"
    ],
    "khutbas": [
      {
        "id": "2021-01-22",
        "title": "Men of Excellence : Hazrat Uthman Ibn Affan (ra)",
        "date": "Jan 22, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-01-22.html",
        "youtubeId": "X8-HWx91i3g",
        "thumbnailUrl": "https://img.youtube.com/vi/X8-HWx91i3g/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would begin highlighting incidents from the life of Hazrat Uthman(ra)."
      },
      {
        "id": "2021-12-17",
        "title": "Men of Excellence : Hazrat Abu Bakr (ra)",
        "date": "Dec 17, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-12-17.html",
        "youtubeId": "mJT64jjqgBU",
        "thumbnailUrl": "https://img.youtube.com/vi/mJT64jjqgBU/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) continued highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      }
    ],
    "articles": [
      {
        "id": "alhakam-first-hijra-abyssinia",
        "source": "Al Hakam",
        "title": "The First Hijrah: Crossing the Red Sea to the Christian Realm of Abyssinia",
        "author": "Al Hakam Research Desk",
        "url": "https://www.alhakam.org/",
        "summary": "The journey of the initial 15 Muslim refugees led by Hazrat Uthman and Ruqayyah (ra) and the righteous protection offered by the Negus.",
        "dateOrIssue": "Historical Chronicles"
      }
    ]
  },
  {
    "id": "migration-abyssinia-2",
    "vol": 1,
    "period": "Makkan Era",
    "year": "5–6 Nabawi",
    "date": "Late 615 A.D.",
    "title": "Second Migration to Abyssinia & Ja‘far’s Defense",
    "category": "Treaty & Diplomatic",
    "desc": "A larger group of 83 Muslim men and 18 women migrated to Abyssinia. The Quraysh sent envoys, 'Amr bin al-'As and 'Abdullah bin Abi Rabi‘ah, loaded with gifts to induce the Negus to deport the refugees. In royal court, Hadrat Ja‘far bin Abi Talib (ra) delivered a timeless defense of Islamic virtue and recited Surah Maryam. The Negus wept until his beard was soaked, declaring that this message and Jesus' message emanate from the identical fountain of divine light, and granted permanent royal protection.",
    "source": "Seal of the Prophets Vol. I, Ch. VII, pp. 238–240",
    "tags": [
      "Jafar",
      "Negus",
      "Najashi",
      "Surah Maryam",
      "Amr bin al-As"
    ],
    "khutbas": [
      {
        "id": "2021-12-17",
        "title": "Men of Excellence : Hazrat Abu Bakr (ra)",
        "date": "Dec 17, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-12-17.html",
        "youtubeId": "mJT64jjqgBU",
        "thumbnailUrl": "https://img.youtube.com/vi/mJT64jjqgBU/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) continued highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      },
      {
        "id": "2021-01-22",
        "title": "Men of Excellence : Hazrat Uthman Ibn Affan (ra)",
        "date": "Jan 22, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-01-22.html",
        "youtubeId": "X8-HWx91i3g",
        "thumbnailUrl": "https://img.youtube.com/vi/X8-HWx91i3g/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would begin highlighting incidents from the life of Hazrat Uthman(ra)."
      }
    ],
    "hadiths": [
      {
        "id": "musnad-ahmad-1740",
        "collection": "Musnad Ahmad",
        "reference": "Hadith 1740",
        "narrator": "Narrated Umm Salama",
        "textSnippet": "Ja'far bin Abi Talib said to the Negus, 'We were a people of ignorance... until Allah sent to us a Messenger from among ourselves... He commanded us to speak the truth, fulfill the trust, maintain ties of kinship, and be good to neighbors.'",
        "url": "https://sunnah.com/ahmad:1740"
      }
    ],
    "articles": [
      {
        "id": "ror-jafar-negus-defense",
        "source": "Review of Religions",
        "title": "The Royal Court of Axum: Hazrat Ja'far bin Abi Talib's Defense of Islam",
        "author": "Syed Ataul Wahid",
        "url": "https://www.reviewofreligions.org/",
        "summary": "A timeless diplomatic masterpiece: How reciting Surah Maryam brought tears to the Negus' eyes, bridging true Christianity and Islam against Quraysh diplomacy.",
        "dateOrIssue": "Comparative Religion"
      },
      {
        "id": "alhakam-negus-king-asylum",
        "source": "Al Hakam",
        "title": "King Najashi of Abyssinia: The Just Monarch Who Embraced Truth",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "An exploration of the Holy Prophet's (sa) absentee funeral prayer (Salat al-Gha'ib) for the Negus upon his demise.",
        "dateOrIssue": "Christian-Muslim Relations"
      }
    ]
  },
  {
    "id": "conversion-hamzah",
    "vol": 1,
    "period": "Makkan Era",
    "year": "6 Nabawi",
    "date": "Late 615 A.D.",
    "title": "Acceptance of Islam by Hadrat Hamzah (ra)",
    "category": "Milestone",
    "desc": "Abu Jahl verbally abused and violently insulted the Holy Prophet (sa) near Safa. When a maidservant informed Hamzah bin 'Abdul-Muttalib upon his return from hunting, the mighty warrior went straight to the Ka'bah, struck Abu Jahl across the head with his bow, and proclaimed: 'You dare insult him when I follow his religion?! Let anyone who can challenge me do so!' Hamzah's conversion provided an immense shield of prestige to the fledgling community.",
    "source": "Seal of the Prophets Vol. I, Ch. VII, pp. 241–243",
    "tags": [
      "Hamzah",
      "Abu Jahl",
      "Conversion",
      "Safa"
    ],
    "khutbas": [
      {
        "id": "2022-12-30",
        "title": "Men of Excellence: Hazrat Hamza (ra)",
        "date": "Dec 30, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-12-30.html",
        "youtubeId": "_Op_L74dQzg",
        "thumbnailUrl": "https://img.youtube.com/vi/_Op_L74dQzg/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta`awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that after completing mention of the life of Hazrat Abu Bakr(ra), he mentioned that there were some Companions regarding whom there were further details that would be added once the series of sermons was published. However, His Holiness(aba) "
      }
    ],
    "articles": [
      {
        "id": "alhakam-lion-of-god-hamzah",
        "source": "Al Hakam",
        "title": "The Lion of Allah: The Dramatic Conversion of Hazrat Hamzah (ra)",
        "author": "Al Hakam History Desk",
        "url": "https://www.alhakam.org/",
        "summary": "How a bold response to Abu Jahl's insolence transformed Hamzah from a neutral huntsman into the fiercest shield of early Islam.",
        "dateOrIssue": "Men of Excellence"
      }
    ]
  },
  {
    "id": "conversion-umar",
    "vol": 1,
    "period": "Makkan Era",
    "year": "6 Nabawi",
    "date": "Dhu’l-Hijjah / 615–616 A.D.",
    "title": "Acceptance of Islam by Hadrat ‘Umar bin al-Khattab (ra)",
    "category": "Milestone",
    "desc": "Hadrat 'Umar girded his sword with the explicit resolve to assassinate the Holy Prophet (sa). Intercepted and told that his sister Fatimah and brother-in-law Sa‘id had embraced Islam, he barged into their house, beat them, but was stricken with remorse at the sight of his sister's blood. He read the verses of Surah Ta-Ha (20:15–16), broke down in tears, and proceeded directly to Dar-e-Arqam to accept Islam before the Prophet (sa). Muslims openly prayed at the Ka'bah for the very first time.",
    "source": "Seal of the Prophets Vol. I, Ch. VII, pp. 243–246",
    "tags": [
      "Umar",
      "Surah Ta-Ha",
      "Dar-e-Arqam",
      "Conversion",
      "Kaaba"
    ],
    "khutbas": [
      {
        "id": "2021-04-23",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Apr 23, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-04-23.html",
        "youtubeId": "-KFTmChKsjY",
        "thumbnailUrl": "https://img.youtube.com/vi/-KFTmChKsjY/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would highlight incidents from the life of Hazrat Umar bin al-Khattab(ra)."
      }
    ],
    "hadiths": [
      {
        "id": "bukhari-3863",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 63, Hadith 89",
        "narrator": "Narrated 'Abdullah bin Mas'ud",
        "textSnippet": "We have been powerful since 'Umar embraced Islam.",
        "url": "https://sunnah.com/bukhari:3863"
      }
    ],
    "articles": [
      {
        "id": "ror-conversion-hazrat-umar",
        "source": "Review of Religions",
        "title": "From Assassin to Ameer-ul-Mu'mineen: The Miraculous Transformation of Hazrat Umar (ra)",
        "author": "Maulana Dost Muhammad Shahid",
        "url": "https://www.reviewofreligions.org/",
        "summary": "The recitation of Surah Ta-Ha, the tears of remorse in Fatima bint al-Khattab's home, and the seismic shift allowing public prayer at the Ka'bah.",
        "dateOrIssue": "Historical Treatise"
      },
      {
        "id": "alhakam-umar-farooc-conversion",
        "source": "Al Hakam",
        "title": "The Prayer of the Prophet (sa) Answered: Hazrat Umar Embraces Islam",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "The fulfillment of the Holy Prophet's supplication: 'O Allah, strengthen Islam with whichever of the two men is more beloved to You, Abu Jahl or Umar ibn al-Khattab.'",
        "dateOrIssue": "Biographical Review"
      }
    ]
  },
  {
    "id": "shib-abi-talib-boycott",
    "vol": 1,
    "period": "Makkan Era",
    "year": "7–10 Nabawi",
    "date": "Muharram 7 – Muharram 10 Nabawi (616–619 A.D.)",
    "title": "Social Boycott & Confinement in Shi‘b Abi Talib",
    "category": "Milestone",
    "desc": "Frustrated by Islam's growth, all tribes of Quraysh drew a cruel charter boycotting the Banu Hashim and Banu Muttalib, barring all marriage, trade, and social contact. Confined in the rugged mountain ravine of Shi‘b Abi Talib for three agonizing years, Muslims and children were reduced to boiling dry leaves and hides. The boycott finally dissolved when termite insects consumed the parchment hanging inside the Ka'bah, leaving only the words: 'Bismika Allahumma' (In Thy Name, O God).",
    "source": "Seal of the Prophets Vol. I, Ch. VII, pp. 253–256",
    "tags": [
      "Boycott",
      "Shib Abi Talib",
      "Parchment",
      "Abu Talib",
      "Persecution"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "bukhari-1590",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 25, Hadith 76",
        "narrator": "Narrated Abu Huraira",
        "textSnippet": "The Prophet (sa) said, 'Tomorrow our encampment will be at Khaif Bani Kinana where the Quraish took an oath of Kufr (i.e. boycotting Banu Hashim).' ",
        "url": "https://sunnah.com/bukhari:1590"
      }
    ],
    "articles": [
      {
        "id": "ror-ravine-shib-abi-talib",
        "source": "Review of Religions",
        "title": "Three Years in the Valley of Death: The Boycott of Banu Hashim in Shi'b Abi Talib",
        "author": "Fazal Ahmad",
        "url": "https://www.reviewofreligions.org/",
        "summary": "The agonizing economic blockade, the crying of starving infants, eating dry tree leaves, and the miraculous termite sign eating the parchment in the Ka'bah.",
        "dateOrIssue": "Historical Trials"
      }
    ]
  },
  {
    "id": "shaqqul-qamar",
    "vol": 1,
    "period": "Makkan Era",
    "year": "9 Nabawi",
    "date": "Circa 618 A.D.",
    "title": "The Sign of the Splitting of the Moon (Shaqqul-Qamar)",
    "category": "Milestone",
    "desc": "When the Qurayshite leaders demanded a grand heavenly sign, God granted the magnificent visual phenomenon of the splitting of the moon into two distinct parts over Mount Abu Qubais. The Holy Prophet (sa) called out: 'Bear witness! Bear witness!' fulfilling the Quranic prophecy in Surah Al-Qamar (54:2): 'The Hour has drawn nigh, and the moon is rent asunder.'",
    "source": "Seal of the Prophets Vol. I, Ch. VII, pp. 257–261",
    "tags": [
      "Moon",
      "Shaqqul-Qamar",
      "Miracle",
      "Surah Al-Qamar"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "bukhari-3868",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 63, Hadith 94",
        "narrator": "Narrated Anas bin Malik",
        "textSnippet": "The people of Mecca asked Allah's Messenger (sa) to show them a miracle. So he showed them the moon split in two halves between which they saw the Hiram mountain.",
        "url": "https://sunnah.com/bukhari:3868"
      }
    ],
    "articles": [
      {
        "id": "ror-splitting-of-moon-miracle",
        "source": "Review of Religions",
        "title": "The Splitting of the Moon: Literal Miracle or Visionary Sign?",
        "author": "Hazrat Mirza Ghulam Ahmad (as)",
        "url": "https://www.reviewofreligions.org/",
        "summary": "A profound theological and astronomical exposition from the Promised Messiah (as) reconciling Surah Al-Qamar with historical records and optics.",
        "dateOrIssue": "Theological Classic"
      },
      {
        "id": "alhakam-shaqqul-qamar-prophecy",
        "source": "Al Hakam",
        "title": "Shaqqul-Qamar: Fulfilling the Grand Prophecy of the Hour",
        "author": "Al Hakam Research Desk",
        "url": "https://www.alhakam.org/",
        "summary": "The Quranic declaration 'The Hour has drawn nigh and the moon is rent asunder' and its historical witnesses in 7th century Arabia.",
        "dateOrIssue": "Miracles & Prophecies"
      }
    ]
  },
  {
    "id": "year-of-grief",
    "vol": 1,
    "period": "Makkan Era",
    "year": "10 Nabawi",
    "date": "Ramadan / Shawwal 10 Nabawi (619 A.D.)",
    "title": "The Year of Grief (‘Amul-Huzn)",
    "category": "Personal & Family",
    "desc": "Within months of leaving the ravine of confinement, Abu Talib—the Prophet's loyal uncle and external defender—passed away. Soon after, Hadrat Khadijah (ra)—the Prophet's noble wife, emotional fortress, and earliest companion—also passed away at age 65. Bereft of his two greatest human supports, this year was titled 'The Year of Grief'. Soon after, the Prophet married Hadrat Saudah (ra) and was betrothed to Hadrat 'A'ishah (ra).",
    "source": "Seal of the Prophets Vol. I, Ch. VII, pp. 261–266",
    "tags": [
      "Amul-Huzn",
      "Khadijah",
      "Abu Talib",
      "Saudah",
      "Aisha",
      "Grief"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "bukhari-1360",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 23, Hadith 119",
        "narrator": "Narrated Al-Musaiyab",
        "textSnippet": "When Abu Talib was on his deathbed, the Prophet (sa) went to him and said, 'O uncle! Say: None has the right to be worshipped but Allah, a sentence with which I shall be a witness for you before Allah.'",
        "url": "https://sunnah.com/bukhari:1360"
      }
    ],
    "articles": [
      {
        "id": "ror-amul-huzn-year-of-grief",
        "source": "Review of Religions",
        "title": "The Year of Grief ('Amul-Huzn): Navigating Bereavement at the Zenith of Persecution",
        "author": "Sarah Waseem",
        "url": "https://www.reviewofreligions.org/",
        "summary": "How the dual departures of Abu Talib and Hazrat Khadijah (ra) left the Prophet (sa) completely defenseless humanly, paving the way for divine celestial elevation.",
        "dateOrIssue": "Spiritual Resilience"
      }
    ]
  },
  {
    "id": "journey-taif",
    "vol": 1,
    "period": "Makkan Era",
    "year": "10 Nabawi",
    "date": "Shawwal 10 Nabawi / May–June 619 A.D.",
    "title": "The Journey to Ta’if & Sublime Forgiveness",
    "category": "Milestone",
    "desc": "Accompanied by Zaid bin Harithah (ra), the Holy Prophet (sa) walked 50 miles over rugged mountainous terrain to invite the Banu Thaqif chieftains in Ta'if. They scorned him and incited ruffians and street urchins who chased him for miles, pelting stones until his shoes filled with blood. Reaching the orchard of 'Utbah and Shaibah, Gabriel offered to crush the city between the two mountains. The Prophet replied with immortal mercy: 'Nay, I hope God will bring forth from their loins those who will worship Him alone.'",
    "source": "Seal of the Prophets Vol. I, Ch. VIII, pp. 276–280",
    "tags": [
      "Taif",
      "Thaqif",
      "Zaid",
      "Forgiveness",
      "Supplication"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "bukhari-3231",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 59, Hadith 42",
        "narrator": "Narrated 'Aisha",
        "textSnippet": "I asked the Prophet, 'Have you encountered a day harder than the day of Uhud?' He replied, 'Your tribes have troubled me a lot, and the worse trouble was the trouble on the day of 'Aqaba when I presented myself to Ibn 'Abd-Yalail bin 'Abd-Kulal and he did not respond to my demand.'",
        "url": "https://sunnah.com/bukhari:3231"
      }
    ],
    "articles": [
      {
        "id": "ror-taif-sublime-forgiveness",
        "source": "Review of Religions",
        "title": "The Bloodied Shoes of Ta'if: The Apex of Prophetic Mercy and Forgiveness",
        "author": "Hazrat Mirza Bashiruddin Mahmud Ahmad (ra)",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Refusing the Angel of the Mountains and praying for the progeny of his persecutors: the unforgettable spiritual standard set at the orchard of Utbah.",
        "dateOrIssue": "Seerat-un-Nabi Special"
      },
      {
        "id": "alhakam-taif-mercy-to-mankind",
        "source": "Al Hakam",
        "title": "The Journey to Ta'if: When Mercy Conquered Wrath",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "An inspiring study of the prayer: 'O Allah, unto Thee do I complain of my weakness, helplessness and insignificance before men.'",
        "dateOrIssue": "Prophetic Character"
      }
    ]
  },
  {
    "id": "miraj-isra",
    "vol": 1,
    "period": "Makkan Era",
    "year": "11 Nabawi",
    "date": "Rajab / 620 A.D.",
    "title": "Al-Isra’ and Al-Mi‘raj (The Heavenly Ascent)",
    "category": "Revelation & Law",
    "desc": "The glorious spiritual journey from the Sacred Mosque (Makkah) to the Distant Mosque (Jerusalem) and the celestial ascent through the seven heavens to the Divine Presence (Sidratul-Muntaha). Here, the Holy Prophet (sa) met past prophets and received the supreme gift of the Five Daily Prayers for his Ummah. Abu Bakr (ra) was titled 'As-Siddiq' (The Truthful) for instantly validating the vision without hesitation.",
    "source": "Seal of the Prophets Vol. I, Ch. VIII, pp. 285–306",
    "tags": [
      "Miraj",
      "Isra",
      "Jerusalem",
      "Prayers",
      "Salat",
      "As-Siddiq"
    ],
    "khutbas": [
      {
        "id": "2023-10-13",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Oct 13, 2023",
        "year": 2023,
        "url": "https://www.alislam.org/friday-sermon/2023-10-13.html",
        "youtubeId": "EN-Rv-DKqZI",
        "thumbnailUrl": "https://img.youtube.com/vi/EN-Rv-DKqZI/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he had been narrating incidents from the life of the Holy Prophet(sa) relating to the Battle of Badr or events that took place thereafter."
      }
    ],
    "hadiths": [
      {
        "id": "bukhari-3207",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 59, Hadith 18",
        "narrator": "Narrated Malik bin Sasaa",
        "textSnippet": "The Prophet (sa) said, 'While I was at the House in a state midway between sleep and wakefulness, (an angel recognized me) ... Then a white animal which was smaller than a mule and bigger than a donkey was brought to me.'",
        "url": "https://sunnah.com/bukhari:3207"
      }
    ],
    "articles": [
      {
        "id": "ror-isra-miraj-spiritual-ascension",
        "source": "Review of Religions",
        "title": "Al-Isra and Al-Mi'raj: The Spiritual Reality of the Heavenly Ascent",
        "author": "Hazrat Mirza Tahir Ahmad (rh)",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Why the journey to Jerusalem and the ascent to Sidratul-Muntaha was a supreme spiritual vision ('Ru'ya') and the eternal gift of the five daily prayers.",
        "dateOrIssue": "Theology & Philosophy"
      },
      {
        "id": "alhakam-miraj-gift-of-salat",
        "source": "Al Hakam",
        "title": "The Ascent to Sidratul-Muntaha and the Five Daily Prayers",
        "author": "Al Hakam Research Desk",
        "url": "https://www.alhakam.org/",
        "summary": "The celestial encounters with Abraham, Moses, and Jesus, and how Salat became the personal Mi'raj of every believing Muslim.",
        "dateOrIssue": "Spiritual Practices"
      }
    ]
  },
  {
    "id": "first-pledge-aqabah",
    "vol": 1,
    "period": "Makkan Era",
    "year": "12 Nabawi",
    "date": "Dhu’l-Hijjah / July 621 A.D.",
    "title": "The First Pledge of ‘Aqabah (Bai‘at-e-‘Aqabah Ula)",
    "category": "Treaty & Diplomatic",
    "desc": "Twelve emissaries from Yathrib (Aus and Khazraj tribes) secretly met the Holy Prophet (sa) at 'Aqabah during Hajj. They pledged absolute adherence to Islamic monotheism, renouncing idolatry, theft, adultery, murder, and falsehood—the First Pledge of 'Aqabah. The Prophet dispatched Hadrat Mus‘ab bin ‘Umair (ra) with them to Medina as the first teacher of Islam, where the faith rapidly took root.",
    "source": "Seal of the Prophets Vol. I, Ch. IX, pp. 326–328",
    "tags": [
      "Aqabah",
      "Yathrib",
      "Pledge",
      "Musab bin Umair",
      "Medina"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "bukhari-3892",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 63, Hadith 118",
        "narrator": "Narrated 'Ubada bin As-Samit",
        "textSnippet": "I gave the pledge of allegiance to the Prophet (sa) with a group of people, and he said, 'I take your pledge that you will not worship anything besides Allah, will not steal, will not commit illegal sexual intercourse...'",
        "url": "https://sunnah.com/bukhari:3892"
      }
    ],
    "articles": [
      {
        "id": "alhakam-first-aqabah-yathrib",
        "source": "Al Hakam",
        "title": "The First Pledge of 'Aqabah: The Seeds of Islam Planted in Yathrib",
        "author": "Al Hakam History Desk",
        "url": "https://www.alhakam.org/",
        "summary": "The covenant of the 12 emissaries renouncing idolatry, theft, and bloodshed, and the pioneering mission of Hazrat Mus'ab bin Umair (ra).",
        "dateOrIssue": "Historical Diplomacy"
      }
    ]
  },
  {
    "id": "second-pledge-aqabah",
    "vol": 1,
    "period": "Makkan Era",
    "year": "13 Nabawi",
    "date": "Dhu’l-Hijjah / June 622 A.D.",
    "title": "The Second Pledge of ‘Aqabah & Invitation to Medina",
    "category": "Treaty & Diplomatic",
    "desc": "Seventy-three men and two women from Yathrib met the Prophet (sa) at dead of night near 'Aqabah, accompanied by his uncle 'Abbas. They took a historic covenant to welcome the Prophet and Makkan Muslims, pledging to defend him as they would defend their own wives and children. Twelve tribal leaders (Naqibs) were selected to represent them, laying the diplomatic foundation for the Islamic state.",
    "source": "Seal of the Prophets Vol. I, Ch. IX, pp. 331–337",
    "tags": [
      "Aqabah",
      "Naqib",
      "Medina",
      "Pledge",
      "Abbas",
      "Hijrah"
    ],
    "khutbas": [],
    "hadiths": [
      {
        "id": "bukhari-3889",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 63, Hadith 115",
        "narrator": "Narrated Jabir bin 'Abdullah",
        "textSnippet": "The Prophet (sa) said (at 'Aqaba), 'Will you pledge allegiance to me?' We said, 'Yes, O Messenger of Allah!' So we pledged our allegiance to him.",
        "url": "https://sunnah.com/bukhari:3889"
      }
    ],
    "articles": [
      {
        "id": "ror-second-pledge-aqabah-state",
        "source": "Review of Religions",
        "title": "The Second Pledge of 'Aqabah: The Foundation Stone of the Medina Commonwealth",
        "author": "Shahzad Ahmed",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Seventy-five Ansaris pledging their lives and families at dead of night, instituting the 12 Naqibs (representatives) that birthed the Islamic state.",
        "dateOrIssue": "Political Theology"
      }
    ]
  },
  {
    "id": "darun-nadwah-conspiracy",
    "vol": 1,
    "period": "Makkan Era",
    "year": "14 Nabawi / 622 A.D.",
    "date": "Safar 14 Nabawi / September 622 A.D.",
    "title": "Conspiracy of Darun-Nadwah & The Cave of Thaur",
    "category": "Milestone",
    "desc": "Alarmed by the Muslim migration to Yathrib, Qurayshite elders convened in Darun-Nadwah. Abu Jahl proposed that one youth from every single tribe jointly strike Muhammad (sa) with swords so blood-guilt would be dispersed. Gabriel warned the Prophet. Hadrat 'Ali (ra) slept in the Prophet's bed, while the Prophet and Abu Bakr (ra) slipped past the besiegers and hid in the Cave of Thaur for three nights. When pursuers stood at the cave mouth, Abu Bakr feared for the Prophet's safety, to which he replied: 'Grieve not, for Allah is with us' (Surah At-Taubah 9:40).",
    "source": "Seal of the Prophets Vol. I, Ch. IX, pp. 342–346",
    "tags": [
      "Darun-Nadwah",
      "Thaur",
      "Cave",
      "Abu Bakr",
      "Ali",
      "Conspiracy"
    ],
    "khutbas": [
      {
        "id": "2022-01-14",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra) ; Suraqa bin Malik and the Bracelets of Khusrow",
        "date": "Jan 14, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-01-14.html",
        "youtubeId": "5MCQlXm5KPY",
        "thumbnailUrl": "https://img.youtube.com/vi/5MCQlXm5KPY/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      },
      {
        "id": "2021-12-24",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Dec 24, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-12-24.html",
        "youtubeId": "C2HyLTTkcq4",
        "thumbnailUrl": "https://img.youtube.com/vi/C2HyLTTkcq4/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta`awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad (aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr (ra)."
      },
      {
        "id": "2021-12-17",
        "title": "Men of Excellence : Hazrat Abu Bakr (ra)",
        "date": "Dec 17, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-12-17.html",
        "youtubeId": "mJT64jjqgBU",
        "thumbnailUrl": "https://img.youtube.com/vi/mJT64jjqgBU/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) continued highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      }
    ],
    "hadiths": [
      {
        "id": "bukhari-3905",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 63, Hadith 131",
        "narrator": "Narrated 'Aisha",
        "textSnippet": "The Prophet (sa) said to Muslims, 'I have been shown the place of your emigration.' ... Abu Bakr went to the Prophet and they left together and hid in the cave of Thaur for three nights.",
        "url": "https://sunnah.com/bukhari:3905"
      }
    ],
    "articles": [
      {
        "id": "ror-cave-thaur-divine-deliverance",
        "source": "Review of Religions",
        "title": "The Cave of Thaur: 'Grieve Not, For Allah Is With Us'",
        "author": "Maulana Ataul Mujeeb Rashed",
        "url": "https://www.reviewofreligions.org/",
        "summary": "The Quraysh conspiracy at Darun-Nadwah, Hazrat Ali in the Prophet's bed, the three nights in the cave, and the miracle of Surah At-Taubah (9:40).",
        "dateOrIssue": "Spiritual Deliverance"
      },
      {
        "id": "alhakam-suraqah-pursuit-bracelets",
        "source": "Al Hakam",
        "title": "Suraqah bin Malik: The Royal Bracelets of Chosroes Prophecy",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "How a lone bounty hunter's horse sank in desert sands and was promised the golden bracelets of the Persian Emperor by a hunted refugee.",
        "dateOrIssue": "Fulfilled Prophecies"
      }
    ]
  },
  {
    "id": "suraqah-pursuit",
    "vol": 1,
    "period": "Makkan Era",
    "year": "622 A.D.",
    "date": "Rabi‘ul-Awwal 1 A.H. / September 622 A.D.",
    "title": "Pursuit of Suraqah bin Malik & Prophecy of Persian Bracelets",
    "category": "Milestone",
    "desc": "Enticed by the bounty of 100 red camels offered by Quraysh, master horseman Suraqah bin Malik pursued the Prophet (sa) and Abu Bakr across the desert. As he closed in, his stallion sank up to its knees in hard sand repeatedly. Awed, Suraqah begged for mercy and protection. The Holy Prophet (sa) promised him amnesty and gave the miraculous prophecy: 'How wilt thou feel, O Suraqah, when the gold bangles of Chosroes (Emperor of Persia) shall be placed upon thy wrists?'—a prophecy fulfilled verbatim sixteen years later during Hadrat 'Umar's Caliphate.",
    "source": "Seal of the Prophets Vol. I, Ch. IX, pp. 346–350",
    "tags": [
      "Suraqah",
      "Chosroes",
      "Bracelets",
      "Prophecy",
      "Pursuit"
    ],
    "khutbas": [
      {
        "id": "2022-01-14",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra) ; Suraqa bin Malik and the Bracelets of Khusrow",
        "date": "Jan 14, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-01-14.html",
        "youtubeId": "5MCQlXm5KPY",
        "thumbnailUrl": "https://img.youtube.com/vi/5MCQlXm5KPY/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      }
    ]
  },
  {
    "id": "arrival-quba",
    "vol": 2,
    "period": "Early Medina",
    "year": "1 A.H.",
    "date": "8 Rabi‘ul-Awwal 1 A.H. / 20 September 622 A.D.",
    "title": "Arrival in Quba’ & Foundation of Masjid Quba",
    "category": "Milestone",
    "desc": "The Holy Prophet (sa) and Abu Bakr (ra) arrived safely at Quba on the southern outskirts of Yathrib, staying at the home of Kulthum bin Hadam. Here, the Prophet founded Masjid Quba, the first mosque in Islamic history founded upon righteousness (Taqwa). Hadrat 'Ali (ra) rejoined them after returning all trusts in Makkah.",
    "source": "Seal of the Prophets Vol. II, Ch. I, pp. 29–31",
    "tags": [
      "Quba",
      "Masjid Quba",
      "Ali",
      "Taqwa",
      "Arrival"
    ],
    "khutbas": [
      {
        "id": "2022-01-14",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra) ; Suraqa bin Malik and the Bracelets of Khusrow",
        "date": "Jan 14, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-01-14.html",
        "youtubeId": "5MCQlXm5KPY",
        "thumbnailUrl": "https://img.youtube.com/vi/5MCQlXm5KPY/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      }
    ]
  },
  {
    "id": "entry-medina-friday",
    "vol": 2,
    "period": "Early Medina",
    "year": "1 A.H.",
    "date": "12 Rabi‘ul-Awwal 1 A.H. / 24 September 622 A.D.",
    "title": "Entry into Medina & First Friday Sermon",
    "category": "Milestone",
    "desc": "Departing Quba on Friday morning, the Prophet (sa) offered the first formal Friday Prayer (Salatul-Jumu‘ah) in the valley of Banu Salim with a hundred believers. Entering Medina, joyful crowds, men, women, and little girls of Banu Najjar climbed rooftops singing: 'Tala‘al-Badru ‘Alayna'. He allowed his camel Qaswa to choose his residence, which knelt at the land of two orphan boys, Sahl and Suhail, in front of the home of Abu Ayyub al-Ansari (ra).",
    "source": "Seal of the Prophets Vol. II, Ch. I, pp. 32–35",
    "tags": [
      "Medina",
      "Jumuah",
      "Talaal-Badru",
      "Qaswa",
      "Abu Ayyub"
    ],
    "khutbas": [
      {
        "id": "2020-11-20",
        "title": "Men of Excellence : `Auf bin Harith (ra); Abu Ayyub Ansari (ra)",
        "date": "Nov 20, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-11-20.html",
        "youtubeId": "7Q3dW5iirBY",
        "thumbnailUrl": "https://img.youtube.com/vi/7Q3dW5iirBY/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz, and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would be highlighting incident from the life of Hazrat ‘Auf bin Harith bin Rifa‘ah Ansari, a companion who took part in the Battle of Badr."
      }
    ]
  },
  {
    "id": "masjid-nabawi-building",
    "vol": 2,
    "period": "Early Medina",
    "year": "1 A.H.",
    "date": "1 A.H. / 622 A.D.",
    "title": "Construction of Masjid-e-Nabawi & Suffah",
    "category": "Milestone",
    "desc": "The Holy Prophet (sa) purchased the plot from the orphans and personally hauled mud bricks alongside his companions to build the Prophet's Mosque (Masjid-e-Nabawi). He instituted the shaded platform known as As-Suffah for destitute student companions (Ashabus-Suffah) like Abu Hurairah (ra), who dedicated their days and nights exclusively to learning and memorizing divine teachings.",
    "source": "Seal of the Prophets Vol. II, Ch. I, pp. 36–39",
    "tags": [
      "Masjid-e-Nabawi",
      "Suffah",
      "Abu Hurairah",
      "Ashabus-Suffah"
    ],
    "khutbas": []
  },
  {
    "id": "commencement-adhan",
    "vol": 2,
    "period": "Early Medina",
    "year": "1 A.H.",
    "date": "1 A.H. / 622 A.D.",
    "title": "Commencement of the Adhan (Call to Prayer)",
    "category": "Revelation & Law",
    "desc": "Seeking a dignified way to summon believers for prayer, companions suggested trumpets, bells, or signal fires. That night, Hadrat 'Abdullah bin Zaid (ra) saw a vision in which an angel taught him the resonant words of the Adhan. When he related it, Hadrat 'Umar affirmed seeing the exact same dream. The Prophet instructed Hadrat Bilal (ra) to call the Adhan due to his deep, melodious voice.",
    "source": "Seal of the Prophets Vol. II, Ch. I, pp. 39–40",
    "tags": [
      "Adhan",
      "Bilal",
      "Abdullah bin Zaid",
      "Umar",
      "Call to Prayer"
    ],
    "khutbas": [
      {
        "id": "2021-09-24",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Sep 24, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-09-24.html",
        "youtubeId": "VgtJi6fNUUM",
        "thumbnailUrl": "https://img.youtube.com/vi/VgtJi6fNUUM/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Umar(ra)."
      },
      {
        "id": "2021-05-07",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "May 7, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-05-07.html",
        "youtubeId": "98Gtvk4AADg",
        "thumbnailUrl": "https://img.youtube.com/vi/98Gtvk4AADg/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Umar(ra)."
      },
      {
        "id": "2022-08-26",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Aug 26, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-08-26.html",
        "youtubeId": "-3jDw2JNudg",
        "thumbnailUrl": "https://img.youtube.com/vi/-3jDw2JNudg/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra) and the armies he sent towards Syria in order to stop the enemy."
      },
      {
        "id": "2020-09-25",
        "title": "Men of Excellence : Hazrat Bilal (ra)",
        "date": "Sep 25, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-09-25.html",
        "youtubeId": "tP-HyA6wp4U",
        "thumbnailUrl": "https://img.youtube.com/vi/tP-HyA6wp4U/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta`awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said he would continue highlighting the life of Hazrat Bilal bin Rabah(ra)."
      }
    ]
  },
  {
    "id": "muakhat-brotherhood",
    "vol": 2,
    "period": "Early Medina",
    "year": "1 A.H.",
    "date": "1 A.H. / 622–623 A.D.",
    "title": "Pact of Brotherhood (Mu’akhat)",
    "category": "Treaty & Diplomatic",
    "desc": "In the house of Anas bin Malik (ra), the Prophet (sa) instituted a sacred brotherhood pairing ninety Muhajirin (Emigrants) and Ansar (Helpers). Ansar companions exemplified unprecedented sacrifice, offering to divide their homes, lands, and wealth half-and-half. Emigrants like 'Abdur-Rahman bin 'Auf politely declined charity, asking only: 'Direct me to the marketplace', setting an eternal benchmark of self-reliance.",
    "source": "Seal of the Prophets Vol. II, Ch. I, pp. 46–49",
    "tags": [
      "Muakhat",
      "Brotherhood",
      "Ansar",
      "Muhajirin",
      "Abdur-Rahman bin Auf"
    ],
    "khutbas": [
      {
        "id": "2022-01-21",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Jan 21, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-01-21.html",
        "youtubeId": "lhZfPdbAuHc",
        "thumbnailUrl": "https://img.youtube.com/vi/lhZfPdbAuHc/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      },
      {
        "id": "2020-11-20",
        "title": "Men of Excellence : `Auf bin Harith (ra); Abu Ayyub Ansari (ra)",
        "date": "Nov 20, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-11-20.html",
        "youtubeId": "7Q3dW5iirBY",
        "thumbnailUrl": "https://img.youtube.com/vi/7Q3dW5iirBY/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz, and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would be highlighting incident from the life of Hazrat ‘Auf bin Harith bin Rifa‘ah Ansari, a companion who took part in the Battle of Badr."
      }
    ]
  },
  {
    "id": "charter-medina",
    "vol": 2,
    "period": "Early Medina",
    "year": "1 A.H.",
    "date": "1 A.H. / 623 A.D.",
    "title": "Charter of Medina (Mithaq-e-Madinah)",
    "category": "Treaty & Diplomatic",
    "desc": "The Prophet (sa) drafted the world's first written constitution, uniting the Muslims, Jewish tribes (Banu Qainuqa, Banu Nadir, Banu Quraizah), and pagan Arabs under a single confederate republic. It guaranteed absolute religious freedom, civil equality, equal judicial protection, and established a mutual defense obligation against external aggressors.",
    "source": "Seal of the Prophets Vol. II, Ch. I, pp. 49–51",
    "tags": [
      "Charter of Medina",
      "Mithaq",
      "Constitution",
      "Jews",
      "Alliance"
    ],
    "khutbas": [],
    "articles": [
      {
        "id": "ror-charter-medina-constitution",
        "source": "Review of Religions",
        "title": "The Constitution of Medina: The World's First Pluralistic Democratic Charter",
        "author": "Farhan Iqbal",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Exhaustive legal and sociological study of the treaty uniting Muslims, Jewish tribes, and pagans under equal civic rights, religious freedom, and common defense.",
        "dateOrIssue": "Governance & Law"
      },
      {
        "id": "alhakam-charter-medina-pluralism",
        "source": "Al Hakam",
        "title": "Religious Freedom and Civic Harmony in the Charter of Medina",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "A contemporary defense showing how the Prophet (sa) guaranteed complete autonomy to Jewish tribes according to their own religious law.",
        "dateOrIssue": "Human Rights"
      }
    ]
  },
  {
    "id": "permission-jihad",
    "vol": 2,
    "period": "Early Medina",
    "year": "2 A.H.",
    "date": "Safar 2 A.H. / August 623 A.D.",
    "title": "Divine Permission for Defensive Combat (Jihad bi-Saif)",
    "category": "Revelation & Law",
    "desc": "After thirteen years of patient endurance under relentless torture and expulsion, God revealed the historic first verse permitting armed self-defense: 'Permission to fight is given to those against whom war is made, because they have been wronged' (Surah Al-Hajj 22:40–41). The verse explicitly declares that defense is granted to protect all houses of worship—cloisters, churches, synagogues, and mosques—from violent destruction.",
    "source": "Seal of the Prophets Vol. II, Ch. II, pp. 85–93",
    "tags": [
      "Jihad",
      "Defense",
      "Surah Al-Hajj",
      "Religious Freedom"
    ],
    "khutbas": []
  },
  {
    "id": "early-patrols-waddan",
    "vol": 2,
    "period": "Early Medina",
    "year": "2 A.H.",
    "date": "Safar 2 A.H. / August 623 A.D.",
    "title": "Early Patrols: Ghazwah of Waddan (Al-Abwa’)",
    "category": "Battle / Expedition",
    "desc": "The Prophet (sa) led his first defensive reconnaissance expedition of 60 Muhajirin to Waddan to patrol the trade routes threatened by Qurayshite belligerence. No combat occurred; instead, the Prophet negotiated a pact of mutual peace and non-aggression with the chieftain Makhshi bin 'Amr ad-Damri of the Banu Damrah tribe.",
    "source": "Seal of the Prophets Vol. II, Ch. III, pp. 121–123",
    "tags": [
      "Waddan",
      "Abwa",
      "Banu Damrah",
      "Treaty",
      "Patrol"
    ],
    "khutbas": []
  },
  {
    "id": "sariyyah-nakhlah",
    "vol": 2,
    "period": "Early Medina",
    "year": "2 A.H.",
    "date": "Rajab 2 A.H. / January 624 A.D.",
    "title": "Sariyyah of ‘Abdullah bin Jahsh to Nakhlah",
    "category": "Battle / Expedition",
    "desc": "Dispatched with sealed instructions to scout Qurayshite troop movements at Nakhlah between Makkah and Ta'if, 'Abdullah bin Jahsh and his men clashed with an armed merchant escort on the final day of Rajab. One man was killed and two captured. The Prophet (sa) sternly reprimanded the squad for fighting near a sacred month until divine revelation in Surah Al-Baqarah (2:218) affirmed that while fighting in sacred months is grave, driving believers from their homes and persecution is far more monstrous.",
    "source": "Seal of the Prophets Vol. II, Ch. III, pp. 126–132",
    "tags": [
      "Nakhlah",
      "Abdullah bin Jahsh",
      "Sacred Months",
      "Surah Al-Baqarah"
    ],
    "khutbas": []
  },
  {
    "id": "alteration-qiblah",
    "vol": 2,
    "period": "Early Medina",
    "year": "2 A.H.",
    "date": "Sha‘ban 2 A.H. / February 624 A.D.",
    "title": "Alteration of the Qiblah to the Ka‘bah",
    "category": "Revelation & Law",
    "desc": "While leading prayer at the mosque of Banu Salamah (Masjid al-Qiblatain), the Prophet (sa) received the divine revelation: 'Turn then thy face towards the Sacred Mosque' (Surah Al-Baqarah 2:145). The congregation seamlessly turned 180 degrees from Jerusalem (Baitul-Muqaddas) toward the Ka'bah in Makkah mid-prayer, fulfilling the ancient prayer of Abraham (as).",
    "source": "Seal of the Prophets Vol. II, Ch. III, pp. 132–135",
    "tags": [
      "Qiblah",
      "Masjid Qiblatain",
      "Kaaba",
      "Jerusalem",
      "Baqarah"
    ],
    "khutbas": []
  },
  {
    "id": "fasting-ramadan-zakat",
    "vol": 2,
    "period": "Early Medina",
    "year": "2 A.H.",
    "date": "Sha‘ban 2 A.H. / February–March 624 A.D.",
    "title": "Ordainment of Fasting in Ramadan & Zakat",
    "category": "Revelation & Law",
    "desc": "Fasting during the entire month of Ramadan was made obligatory upon all adult believers through Surah Al-Baqarah (2:184). Concurrently, the formal institutional collection of Zakat (obligatory almsgiving) and Sadaqat-ul-Fitr was mandated to cleanse wealth and provide a universal social safety net for the poor, orphan, and traveler.",
    "source": "Seal of the Prophets Vol. II, Ch. III, pp. 135–138",
    "tags": [
      "Ramadan",
      "Fasting",
      "Zakat",
      "Sadaqatul-Fitr",
      "Pillars"
    ],
    "khutbas": []
  },
  {
    "id": "battle-of-badr",
    "vol": 2,
    "period": "Early Medina",
    "year": "2 A.H.",
    "date": "17 Ramadan 2 A.H. / 13 March 624 A.D.",
    "title": "The Battle of Badr (Yaumul-Furqan)",
    "category": "Battle / Expedition",
    "desc": "A massive, heavily armored army of 1,000 elite Quraysh under Abu Jahl marched to eradicate Islam. The Holy Prophet (sa) met them at the wells of Badr with only 313 poorly equipped men (possessing only two horses and 70 camels). After a night of tearful supplication in his tent (Arish), a divine host of angels descended. The Quraysh suffered a crushing defeat: 70 top chieftains including Abu Jahl, 'Utbah, Shaibah, and Umayyah bin Khalaf were slain, and 70 captured. Fourteen Muslims were martyred. The Quran designated this turning point 'The Day of Discrimination' (Yaumul-Furqan).",
    "source": "Seal of the Prophets Vol. II, Ch. IV, pp. 155–196",
    "tags": [
      "Badr",
      "Abu Jahl",
      "Yaumul-Furqan",
      "Angels",
      "313",
      "Miracle"
    ],
    "khutbas": [
      {
        "id": "2020-11-20",
        "title": "Men of Excellence : `Auf bin Harith (ra); Abu Ayyub Ansari (ra)",
        "date": "Nov 20, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-11-20.html",
        "youtubeId": "7Q3dW5iirBY",
        "thumbnailUrl": "https://img.youtube.com/vi/7Q3dW5iirBY/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz, and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would be highlighting incident from the life of Hazrat ‘Auf bin Harith bin Rifa‘ah Ansari, a companion who took part in the Battle of Badr."
      },
      {
        "id": "2023-07-07",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Jul 7, 2023",
        "year": 2023,
        "url": "https://www.alislam.org/friday-sermon/2023-07-07.html",
        "youtubeId": "m3ShYvhQ8Pw",
        "thumbnailUrl": "https://img.youtube.com/vi/m3ShYvhQ8Pw/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad (aba) said that in the previous sermon, he had been mentioning the awe that the Muslims had over the disbelievers of Makkah, in the course of which he mentioned the dispute between Abu Jahl and Utbah."
      },
      {
        "id": "2020-11-13",
        "title": "Men of Excellence : Abdullah bin Amr (ra); Abu Dujana (ra)",
        "date": "Nov 13, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-11-13.html",
        "youtubeId": "UCAB4W9koh4",
        "thumbnailUrl": "https://img.youtube.com/vi/UCAB4W9koh4/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would highlight incidents from the lives of Companions of the Holy Prophet(sa) who took part in the battle of Badr."
      },
      {
        "id": "2023-11-10",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Nov 10, 2023",
        "year": 2023,
        "url": "https://www.alislam.org/friday-sermon/2023-11-10.html",
        "youtubeId": "jMDrH3KjxX8",
        "thumbnailUrl": "https://img.youtube.com/vi/jMDrH3KjxX8/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he had been mentioning incidents from the life of the Holy Prophet(sa) which took place after the Battle of Badr."
      }
    ],
    "articles": [
      {
        "id": "ror-battle-badr-day-of-criterion",
        "source": "Review of Religions",
        "title": "The Battle of Badr (Yaum-ul-Furqan): The Day of Criterion That Altered World History",
        "author": "Hazrat Mirza Bashir Ahmad (ra)",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Three hundred and thirteen ill-equipped believers confronting a thousand heavily armed Makkan warriors, the night-long prayers of the Prophet (sa), and divine fulfillment.",
        "dateOrIssue": "Military History"
      },
      {
        "id": "alhakam-badr-pow-treatment",
        "source": "Al Hakam",
        "title": "Unprecedented Mercy: The Treatment of Prisoners of War at Badr",
        "author": "Al Hakam Research Desk",
        "url": "https://www.alhakam.org/",
        "summary": "Feeding prisoners fresh bread while Muslims ate dates, teaching literate captives to gain freedom by instructing Muslim children.",
        "dateOrIssue": "Rules of War"
      }
    ]
  },
  {
    "id": "humane-treatment-pow",
    "vol": 2,
    "period": "Early Medina",
    "year": "2 A.H.",
    "date": "Shawwal 2 A.H. / April 624 A.D.",
    "title": "Humane Treatment & Ransom of Prisoners of War",
    "category": "Treaty & Diplomatic",
    "desc": "Setting an unprecedented standard in human history, the Prophet (sa) ordered companions to feed the prisoners bread while eating mere dates themselves. Literate prisoners who could not afford ransom were released on the condition that each taught ten Muslim children of Medina how to read and write, initiating a revolution in literacy.",
    "source": "Seal of the Prophets Vol. II, Ch. V, pp. 240–248",
    "tags": [
      "Prisoners",
      "POWs",
      "Literacy",
      "Education",
      "Mercy"
    ],
    "khutbas": [
      {
        "id": "2020-11-20",
        "title": "Men of Excellence : `Auf bin Harith (ra); Abu Ayyub Ansari (ra)",
        "date": "Nov 20, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-11-20.html",
        "youtubeId": "7Q3dW5iirBY",
        "thumbnailUrl": "https://img.youtube.com/vi/7Q3dW5iirBY/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz, and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would be highlighting incident from the life of Hazrat ‘Auf bin Harith bin Rifa‘ah Ansari, a companion who took part in the Battle of Badr."
      },
      {
        "id": "2021-05-21",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "May 21, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-05-21.html",
        "youtubeId": "v1rWtw867W0",
        "thumbnailUrl": "https://img.youtube.com/vi/v1rWtw867W0/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting the life of Hazrat Umar(ra) and the battles and expeditions which he took part in."
      }
    ]
  },
  {
    "id": "marriage-ali-fatimah",
    "vol": 2,
    "period": "Early Medina",
    "year": "2 A.H.",
    "date": "Dhu’l-Hijjah 2 A.H. / June 624 A.D.",
    "title": "Marriage of Hadrat ‘Ali and Hadrat Fatimah (ra)",
    "category": "Personal & Family",
    "desc": "The blessed marriage between Hadrat 'Ali bin Abi Talib (ra) and the Prophet's beloved youngest daughter Hadrat Fatimatuz-Zahra (ra) took place with utmost simplicity. Her dowry consisted of a simple mattress of date-palm fiber, a waterskin, and two stone hand-mills, forming the pure lineage of the Ahle Bait.",
    "source": "Seal of the Prophets Vol. II, Ch. VII, pp. 305–308",
    "tags": [
      "Ali",
      "Fatimah",
      "Marriage",
      "Ahle Bait"
    ],
    "khutbas": [
      {
        "id": "2020-12-04",
        "title": "Men of Excellence : Hazrat Ali (ra)",
        "date": "Dec 4, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-12-04.html",
        "youtubeId": "WsWQfzvoA7g",
        "thumbnailUrl": "https://img.youtube.com/vi/WsWQfzvoA7g/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz, and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said he would continue highlighting incidents from the life of Hazrat Ali(ra)."
      },
      {
        "id": "2021-05-21",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "May 21, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-05-21.html",
        "youtubeId": "v1rWtw867W0",
        "thumbnailUrl": "https://img.youtube.com/vi/v1rWtw867W0/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting the life of Hazrat Umar(ra) and the battles and expeditions which he took part in."
      }
    ]
  },
  {
    "id": "ghazwah-qainuqa",
    "vol": 2,
    "period": "Early Medina",
    "year": "2 A.H.",
    "date": "Shawwal 2 A.H. / April 624 A.D.",
    "title": "Ghazwah of Banu Qainuqa‘ & Their Exile",
    "category": "Battle / Expedition",
    "desc": "The Jewish goldsmith tribe of Banu Qainuqa broke their treaty by publicly humiliating a Muslim woman in their market and murdering a Muslim who came to her defense. When besieged for fifteen days in their fortresses, they surrendered unconditionally. Instead of executing the combatants, the Prophet (sa) magnanimously spared their lives and permitted them to emigrate peacefully to Syria with their movable property.",
    "source": "Seal of the Prophets Vol. II, Ch. VII, pp. 308–315",
    "tags": [
      "Banu Qainuqa",
      "Siege",
      "Exile",
      "Treaty Breach"
    ],
    "khutbas": []
  },
  {
    "id": "ghazwah-sawiq",
    "vol": 2,
    "period": "Early Medina",
    "year": "2 A.H.",
    "date": "Dhu’l-Hijjah 2 A.H. / June–July 624 A.D.",
    "title": "Ghazwah As-Sawiq (The Expedition of the Parched Barley)",
    "category": "Battle / Expedition",
    "desc": "Humiliated by the defeat at Badr, Abu Sufyan vowed not to bathe until he struck Medina. Under cover of night, he led 200 cavalrymen to the outskirts of Medina (Al-‘Uraid), murdered an innocent Ansari farmer named Ma‘bad bin ‘Amr and his laborer, and torched date-palm orchards. When the Holy Prophet (sa) was alerted, he immediately led a Muslim force in pursuit. To lighten their load and flee at frantic speed, the Meccans abandoned sacks of parched barley meal (Sawiq), which the Muslims gathered upon their return. Thus, this pursuit was named Ghazwah As-Sawiq.",
    "source": "Seal of the Prophets Vol. II, Ch. VII, pp. 315–317",
    "tags": [
      "Sawiq",
      "Abu Sufyan",
      "Pursuit",
      "Medina",
      "Expedition"
    ],
    "khutbas": [
      {
        "id": "2023-10-27",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Oct 27, 2023",
        "year": 2023,
        "url": "https://www.alislam.org/friday-sermon/2023-10-27.html",
        "youtubeId": "c2Z4pL_88U8",
        "thumbnailUrl": "https://img.youtube.com/vi/c2Z4pL_88U8/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) recounted details of Ghazwah As-Sawiq and Abu Sufyan’s covert raid on the outskirts of Medina."
      }
    ],
    "articles": [
      {
        "id": "ror-ghazwah-sawiq-pursuit",
        "source": "Review of Religions",
        "title": "Ghazwah As-Sawiq: The Vow of Abu Sufyan and the Pursuit by the Holy Prophet (sa)",
        "author": "Research Cell Review of Religions",
        "url": "https://www.reviewofreligions.org/?s=Ghazwah+Sawiq",
        "summary": "Analysis of the aftermath of Badr, Abu Sufyan’s nocturnal raid on the orchards of Medina, and the swift tactical pursuit by the Muslims.",
        "dateOrIssue": "Historical Studies"
      }
    ]
  },
  {
    "id": "execution-kab-ashraf",
    "vol": 2,
    "period": "Early Medina",
    "year": "3 A.H.",
    "date": "Rabi‘ul-Awwal 3 A.H. / September 624 A.D.",
    "title": "Execution of Ka‘b bin Ashraf for High Treason",
    "category": "Milestone",
    "desc": "Ka‘b bin Ashraf, a wealthy Jewish poet chieftain of Medina, traveled to Makkah after Badr to incite the Quraysh to launch war against Medina, composed obscene satirical verses slandering noble Muslim women, and plotted to assassinate the Prophet (sa). As sovereign head of state, the Prophet authorized Muhammad bin Maslamah (ra) to execute him for high treason and inciting war.",
    "source": "Seal of the Prophets Vol. II, Ch. VII, pp. 321–331",
    "tags": [
      "Kab bin Ashraf",
      "Treason",
      "Muhammad bin Maslamah",
      "National Security"
    ],
    "khutbas": []
  },
  {
    "id": "battle-of-uhud",
    "vol": 2,
    "period": "Early Medina",
    "year": "3 A.H.",
    "date": "7 Shawwal 3 A.H. / 23 March 625 A.D.",
    "title": "The Battle of Uhud & Martyrdom of Hamzah (ra)",
    "category": "Battle / Expedition",
    "desc": "An avenging Qurayshite army of 3,000 warriors under Abu Sufyan attacked Medina. The Prophet (sa) marched with 1,000 men, but hypocrite chief 'Abdullah bin Ubayy deserted with 300 men, leaving 700 believers. The Prophet stationed 50 archers on Mount Rumat under 'Abdullah bin Jubair with strict orders never to leave their post. Muslims routed the enemy initially, but when 40 archers abandoned their post to gather booty, Khalid bin al-Walid led a lethal cavalry ambush from the rear. Hadrat Hamzah (ra) was martyred by Wahshi. The Prophet (sa) was struck in the face, his tooth chipped, and his helmet rings driven into his cheek. A resolute ring of companions, including Talhah and Nusaybah, shielded him with their bare bodies until they rallied at the foot of Mount Uhud. Seventy Muslims were martyred.",
    "source": "Seal of the Prophets Vol. II, Ch. VIII, pp. 343–374",
    "tags": [
      "Uhud",
      "Hamzah",
      "Archers",
      "Mount Rumat",
      "Khalid bin Walid",
      "Talhah",
      "Martyrs"
    ],
    "khutbas": [
      {
        "id": "2024-04-19",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Apr 19, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-04-19.html",
        "youtubeId": "3LDrA8FsNGc",
        "thumbnailUrl": "https://img.youtube.com/vi/3LDrA8FsNGc/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta’awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue mentioning incidents from the Battle of Uhud, which further highlight the beautiful aspects of the life of the Holy Prophet(sa)."
      },
      {
        "id": "2024-03-08",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Mar 8, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-03-08.html",
        "youtubeId": "xcbUYk7G0YY",
        "thumbnailUrl": "https://img.youtube.com/vi/xcbUYk7G0YY/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that there is an incident from the Battle of Uhud in which the Holy Prophet(sa) prayed for the Hazrat Sa’d’s(ra) prayers to be accepted."
      },
      {
        "id": "2024-03-01",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Mar 1, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-03-01.html",
        "youtubeId": "vSTxwMxO1fc",
        "thumbnailUrl": "https://img.youtube.com/vi/vSTxwMxO1fc/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) continued narrating incidents from the Battle of Uhud."
      },
      {
        "id": "2024-02-16",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Feb 16, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-02-16.html",
        "youtubeId": "wCVjhUBKcFw",
        "thumbnailUrl": "https://img.youtube.com/vi/wCVjhUBKcFw/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue mentioning the life of the Holy Prophet(sa) and the companions’ love and devotion for the Holy Prophet(sa) with reference to the Battle of Uhud."
      }
    ],
    "articles": [
      {
        "id": "ror-battle-uhud-martyrs-lessons",
        "source": "Review of Religions",
        "title": "The Slopes of Mount Uhud: Discipline, Sacrifice, and the Martyrdom of Hazrat Hamzah",
        "author": "Fazal Ahmad",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Analyzing the archers' departure from the pass, Khalid bin Walid's flank attack, the human wall protecting the wounded Prophet, and eternal lessons in obedience.",
        "dateOrIssue": "Military Ethics"
      }
    ]
  },
  {
    "id": "hamra-al-asad",
    "vol": 2,
    "period": "Early Medina",
    "year": "3 A.H.",
    "date": "8 Shawwal 3 A.H. / 24 March 625 A.D.",
    "title": "Expedition of Hamra’ul-Asad",
    "category": "Battle / Expedition",
    "desc": "The morning immediately after Uhud, despite severe wounds, the Holy Prophet (sa) ordered the exhausted companions to pursue the retreating Quraysh. They marched to Hamra'ul-Asad, 8 miles from Medina, lighting 500 fires at night. Intimidated by this display of indomitable morale, Abu Sufyan's forces hastily fled back to Makkah.",
    "source": "Seal of the Prophets Vol. II, Ch. VIII, pp. 374–377",
    "tags": [
      "Hamraul-Asad",
      "Pursuit",
      "Abu Sufyan",
      "Morale"
    ],
    "khutbas": [
      {
        "id": "2024-05-03",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "May 3, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-05-03.html",
        "youtubeId": "mILTkmjmBT4",
        "thumbnailUrl": "https://img.youtube.com/vi/mILTkmjmBT4/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he had been mentioning the Expedition of Hamra’ al-Asad."
      },
      {
        "id": "2024-04-26",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Apr 26, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-04-26.html",
        "youtubeId": "SeWu4x3WV3E",
        "thumbnailUrl": "https://img.youtube.com/vi/SeWu4x3WV3E/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta`awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he had mentioned the background and reasons leading to the expedition of Hamra’ al-Asad in the previous sermon."
      },
      {
        "id": "2021-06-04",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Jun 4, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-06-04.html",
        "youtubeId": "ZJWSexwIs-M",
        "thumbnailUrl": "https://img.youtube.com/vi/ZJWSexwIs-M/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Umar(ra)."
      }
    ]
  },
  {
    "id": "prohibition-alcohol",
    "vol": 2,
    "period": "Early Medina",
    "year": "4 A.H.",
    "date": "4 A.H. / 625 A.D.",
    "title": "Absolute Prohibition of Alcohol & Gambling",
    "category": "Revelation & Law",
    "desc": "Following gradual preliminary steps, God revealed the decisive prohibition in Surah Al-Ma'idah (5:91–92), classifying intoxicants and gambling as an abomination of Satan's handiwork. The moment the verse was announced in Medina, companions shattered their wine casks instantly in the streets, spilling vintages until the alleys flowed like streams.",
    "source": "Seal of the Prophets Vol. II, Ch. VIII, pp. 381–384",
    "tags": [
      "Alcohol",
      "Prohibition",
      "Gambling",
      "Surah Al-Maidah",
      "Law"
    ],
    "khutbas": []
  },
  {
    "id": "tragedy-raji",
    "vol": 2,
    "period": "Early Medina",
    "year": "4 A.H.",
    "date": "Safar 4 A.H. / July 625 A.D.",
    "title": "The Tragedy of Al-Raji‘",
    "category": "Milestone",
    "desc": "The tribes of 'Adal and Qarah requested teachers of the Quran. The Prophet sent a delegation of ten righteous Quranic scholars led by 'Asim bin Thabit (ra). At the well of Raji‘, Banu Lihyan betrayed them with 200 armed warriors. Seven companions died fighting heroically; Khubaib bin 'Adi and Zaid bin ad-Dathinah were captured and sold to Quraysh in Makkah to be publicly crucified. Before execution, Khubaib instituted the two rak‘ahs of prayer prior to martyrdom.",
    "source": "Seal of the Prophets Vol. II, Ch. VIII, pp. 386–391",
    "tags": [
      "Raji",
      "Khubaib bin Adi",
      "Martyrdom",
      "Banu Lihyan",
      "Betrayal"
    ],
    "khutbas": [
      {
        "id": "2024-05-17",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "May 17, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-05-17.html",
        "youtubeId": "hV2OTZPMmTQ",
        "thumbnailUrl": "https://img.youtube.com/vi/hV2OTZPMmTQ/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he had been mentioning the expedition of Raji’."
      }
    ]
  },
  {
    "id": "tragedy-bir-maunah",
    "vol": 2,
    "period": "Early Medina",
    "year": "4 A.H.",
    "date": "Safar 4 A.H. / July 625 A.D.",
    "title": "The Massacre of Bi’r Ma‘unah",
    "category": "Milestone",
    "desc": "Abu Bara' Amir bin Malik requested instructors for the people of Najd, guaranteeing personal protection. The Prophet sent 70 foremost Quranic scholars (Qurra) from the Companions of the Suffah led by Mundhir bin 'Amr. At Bi'r Ma‘unah, 'Amir bin Tufail incited the Sulaim tribes of Ri‘l, Dhakwan, and 'Usayyah, who surrounded and butchered 69 scholars in cold blood. The Prophet (sa) mourned this massacre intensely, offering Qunut Nazilah in dawn prayers for an entire month.",
    "source": "Seal of the Prophets Vol. II, Ch. VIII, pp. 391–398",
    "tags": [
      "Bir Maunah",
      "Qurra",
      "Suffah",
      "Massacre",
      "Qunut Nazilah"
    ],
    "khutbas": []
  },
  {
    "id": "exile-banu-nadir",
    "vol": 2,
    "period": "Early Medina",
    "year": "4 A.H.",
    "date": "Rabi‘ul-Awwal 4 A.H. / August 625 A.D.",
    "title": "Treachery & Exile of Banu Nadir",
    "category": "Battle / Expedition",
    "desc": "When the Prophet (sa) visited the Jewish tribe of Banu Nadir to seek treaty-stipulated blood money contributions, they conspired to drop a massive millstone onto him from a rooftop. Divinely alerted, the Prophet departed immediately. After being besieged in their fortresses for ten days, Banu Nadir surrendered and were expelled. They departed for Khaibar and Syria, packing their camels with goods even to dismantling their lintels and doorframes, as described in Surah Al-Hashr.",
    "source": "Seal of the Prophets Vol. II, Ch. IX, pp. 401–409",
    "tags": [
      "Banu Nadir",
      "Exile",
      "Surah Al-Hashr",
      "Khaibar",
      "Millstone"
    ],
    "khutbas": [
      {
        "id": "2024-06-28",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Jun 28, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-06-28.html",
        "youtubeId": "KtBqfgr9pYM",
        "thumbnailUrl": "https://img.youtube.com/vi/KtBqfgr9pYM/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue mentioning the expedition of Banu Nadir."
      },
      {
        "id": "2024-06-21",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Jun 21, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-06-21.html",
        "youtubeId": "wgc6BAyrX5U",
        "thumbnailUrl": "https://img.youtube.com/vi/wgc6BAyrX5U/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue narrating incidents regarding the Jewish tribe of Banu Nadir and their plot to kill the Holy Prophet(sa)."
      },
      {
        "id": "2024-06-14",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Jun 14, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-06-14.html",
        "youtubeId": "zCcRkVsaZjA",
        "thumbnailUrl": "https://img.youtube.com/vi/zCcRkVsaZjA/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would mention details regarding the Expedition of Banu Nadir."
      }
    ]
  },
  {
    "id": "ghazwah-dhatur-riqa",
    "vol": 2,
    "period": "Early Medina",
    "year": "4 A.H.",
    "date": "Jumada al-Ula 4 A.H. / October 625 A.D.",
    "title": "Ghazwah Dhatur-Riqa‘ (Expedition of the Patched Garments) & Salat-ul-Khauf",
    "category": "Battle / Expedition",
    "desc": "Following intelligence that Bedouin tribes of Najd (Banu Muharib and Banu Tha‘labah) were massing to raid Medina, the Prophet (sa) led 400 companions through rugged mountainous terrain. The terrain was so merciless that the companions’ feet bled and they wrapped rags and patches of cloth around their feet, giving the expedition its name. Here, the Fear Prayer (Salat-ul-Khauf) was first instituted so Muslims prayed in alternating shifts under arms. During this journey, a bedouin warrior named Ghaurath bin al-Harith approached the Prophet while he rested alone under a tree, unsheathed a sword, and asked: 'Who will save you from me?' The Prophet calmly answered: 'Allah!' Stricken with awe, the sword fell from the assailant’s hand, and the Prophet magnanimously spared him, leading to his transformation.",
    "source": "Seal of the Prophets Vol. II, Ch. IX, pp. 410–415; Sahih Bukhari 4136, 4139",
    "tags": [
      "Dhatur-Riqa",
      "Salat-ul-Khauf",
      "Ghaurath bin al-Harith",
      "Najd",
      "Forgiveness"
    ],
    "khutbas": [
      {
        "id": "2024-08-09",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Aug 9, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-08-09.html",
        "youtubeId": "c2Z4pL_88U8",
        "thumbnailUrl": "https://img.youtube.com/vi/c2Z4pL_88U8/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) narrated the inspiring incident of Ghaurath bin al-Harith under the tree during Ghazwah Dhatur-Riqa‘ and the Prophet’s unshakeable trust in Allah."
      }
    ],
    "hadiths": [
      {
        "id": "bukhari-dhatur-riqa-tree",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 64, Hadith 181 (Hadith 4136)",
        "narrator": "Jabir bin ‘Abdullah (ra)",
        "textSnippet": "...We accompanied the Prophet (sa) in the campaign of Dhat-ur-Riqa‘. The Prophet rested under a shady acacia tree and hung his sword on it. A polytheist took the sword while the Prophet slept and said: 'Are you afraid of me?' He replied, 'No.' The man said, 'Who will save you from me?' He said, 'Allah!' The sword dropped from his hand...",
        "url": "https://sunnah.com/bukhari:4136"
      }
    ],
    "articles": [
      {
        "id": "ror-ghazwah-dhatur-riqa",
        "source": "Review of Religions",
        "title": "Ghazwah Dhatur-Riqa‘: Divine Reliance and the Exemplary Mercy of Prophet Muhammad (sa)",
        "author": "Research Cell Review of Religions",
        "url": "https://www.reviewofreligions.org/?s=Dhatur-Riqa",
        "summary": "The extraordinary circumstances of Dhatur-Riqa‘, the institutionalization of Salat-ul-Khauf, and the forbearance shown to the would-be assassin Ghaurath.",
        "dateOrIssue": "Historical Analysis"
      }
    ]
  },
  {
    "id": "badr-al-mawid",
    "vol": 2,
    "period": "Early Medina",
    "year": "4 A.H.",
    "date": "Sha‘ban 4 A.H. / January 626 A.D.",
    "title": "Ghazwah Badr al-Maw‘id (The Promised Badr)",
    "category": "Battle / Expedition",
    "desc": "At the conclusion of the Battle of Uhud, Abu Sufyan had publicly shouted a challenge to the Muslims: 'Our appointment with you is next year at Badr!' When the appointed month of Sha‘ban arrived, the Holy Prophet (sa) resolved to fulfill the pledge and marched out of Medina with 1,500 companions and 10 horses, camping at Badr for eight days while engaging in peaceful annual trade. Abu Sufyan assembled 2,000 Meccans and 50 cavalry, but gripped by demoralizing fear, halted at Marr az-Zahran and retreated under the pretext of drought. The bloodless expedition restored complete Muslim prestige across the Arabian Peninsula and shattered the illusion of Meccan supremacy.",
    "source": "Seal of the Prophets Vol. II, Ch. IX, pp. 415–418; Sirat Ibn Hisham Vol. 2",
    "tags": [
      "Badr al-Mawid",
      "Second Badr",
      "Abu Sufyan",
      "Pledge",
      "Moral Victory"
    ],
    "khutbas": [
      {
        "id": "2024-08-16",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Aug 16, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-08-16.html",
        "youtubeId": "c2Z4pL_88U8",
        "thumbnailUrl": "https://img.youtube.com/vi/c2Z4pL_88U8/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) detailed the expedition of Badr al-Maw‘id, Abu Sufyan’s retreat, and the profound strategic and moral impact on Arabia."
      }
    ],
    "articles": [
      {
        "id": "alhakam-badr-al-mawid",
        "source": "Al Hakam",
        "title": "Badr al-Maw‘id: Fulfilling the Challenge and Establishing Moral Superiority",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/?s=Badr+al-Mawid",
        "summary": "How the Holy Prophet’s steadfast adherence to his promise at Badr al-Maw‘id revealed the psychological triumph of faith over fear.",
        "dateOrIssue": "Historical Studies"
      }
    ]
  },
  {
    "id": "ghazwah-banu-mustaliq",
    "vol": 2,
    "period": "Early Medina",
    "year": "5 A.H.",
    "date": "Sha‘ban 5 A.H. / December 626 A.D.",
    "title": "Ghazwah of Banu Mustaliq & Marriage to Juwairiyah (ra)",
    "category": "Battle / Expedition",
    "desc": "The Banu Mustaliq tribe under Harith bin Abi Dirar rallied tribes to march on Medina. The Prophet (sa) made a preemptive strike at the spring of Muraisi‘, routing them. Among the captives was Harith's daughter, Juwairiyah (ra). When the Prophet paid her ransom and married her, companions freed a hundred captive families out of respect for the Prophet's new in-laws, causing the entire tribe to accept Islam.",
    "source": "Seal of the Prophets Vol. II, Ch. IX, pp. 450–456, 467–468",
    "tags": [
      "Banu Mustaliq",
      "Muraisi",
      "Juwairiyah",
      "Marriage"
    ],
    "khutbas": [
      {
        "id": "2024-07-12",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Jul 12, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-07-12.html",
        "youtubeId": "sT1F6R6C59A",
        "thumbnailUrl": "https://img.youtube.com/vi/sT1F6R6C59A/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would mention the Expedition of Banu Mustaliq, also known as the Expedition of Muraisi’."
      },
      {
        "id": "2024-08-16",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Aug 16, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-08-16.html",
        "youtubeId": "O2EwFpnWkS0",
        "thumbnailUrl": "https://img.youtube.com/vi/O2EwFpnWkS0/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue mentioning the Expedition of Banu Mustaliq."
      },
      {
        "id": "2024-08-09",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Aug 9, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-08-09.html",
        "youtubeId": "PkMlREKnMog",
        "thumbnailUrl": "https://img.youtube.com/vi/PkMlREKnMog/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that prior to the Jalsa, he had been mentioning the expedition of Muraisi’, and it had been mentioned that Abdullah bin Ubayy said unbecoming things about the Holy Prophet(sa) and adopted hypocritical ways."
      },
      {
        "id": "2024-07-19",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Jul 19, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-07-19.html",
        "youtubeId": "3fvx6jONBh8",
        "thumbnailUrl": "https://img.youtube.com/vi/3fvx6jONBh8/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue mentioning the Expedition of Banu Mustaliq."
      }
    ]
  },
  {
    "id": "incident-of-ifk",
    "vol": 2,
    "period": "Early Medina",
    "year": "5 A.H.",
    "date": "Sha‘ban 5 A.H. / December 626 A.D.",
    "title": "The Great Calumny (Waqi‘at al-Ifk)",
    "category": "Milestone",
    "desc": "Returning from Banu Mustaliq, Hadrat 'A'ishah (ra) was inadvertently left behind while searching for her lost necklace. Safwan bin al-Mu‘attal (ra) found her and guided her camel to Medina. Hypocrite chief 'Abdullah bin Ubayy fabricated a malicious slander against her purity. After a month of agonizing distress, God revealed ten sublime verses in Surah An-Nur (24:12–21) vindicating Hadrat 'A'ishah's spotless chastity and establishing severe punishments for false accusers.",
    "source": "Seal of the Prophets Vol. II, Ch. IX, pp. 457–466",
    "tags": [
      "Ifk",
      "Aisha",
      "Abdullah bin Ubayy",
      "Surah An-Nur",
      "Chastity"
    ],
    "khutbas": [
      {
        "id": "2024-08-30",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Aug 30, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-08-30.html",
        "youtubeId": "jTVnBvZBGjs",
        "thumbnailUrl": "https://img.youtube.com/vi/jTVnBvZBGjs/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta`awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that with reference to the life of the Holy Prophet(sa) he would continue narrating the incident of the Great Calumny against Hazrat A’ishah(ra)."
      },
      {
        "id": "2022-11-18",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Nov 18, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-11-18.html",
        "youtubeId": "HQC7Fko_q60",
        "thumbnailUrl": "https://img.youtube.com/vi/HQC7Fko_q60/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      },
      {
        "id": "2022-01-28",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Jan 28, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-01-28.html",
        "youtubeId": "D359Km444Xo",
        "thumbnailUrl": "https://img.youtube.com/vi/D359Km444Xo/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      }
    ]
  },
  {
    "id": "battle-of-ditch",
    "vol": 2,
    "period": "Early Medina",
    "year": "5 A.H.",
    "date": "Shawwal 5 A.H. / February–March 627 A.D.",
    "title": "The Battle of the Confederates / The Ditch (Ahzab / Khandaq)",
    "category": "Battle / Expedition",
    "desc": "Instigated by exiled leaders of Banu Nadir, a colossal confederacy of 10,000 warriors—uniting Quraysh, Ghatafan, Banu Asad, and Bedouin tribes—marched to wipe Medina off the map. On the tactical counsel of Hadrat Salman al-Farsi (ra), 3,000 Muslims dug an impassable trench 5.5 meters deep along the exposed northern edge of Medina in twenty days of bitter winter cold. When the Prophet struck a stubborn boulder, sparks flew, revealing visions of the fall of Persian, Byzantine, and Yemeni palaces. Besieged for a grueling month with provisions depleted, God dispatched an icy hurricane and invisible angelic hosts that overturned enemy tents, cooking pots, and morale, driving the Confederates into frantic retreat.",
    "source": "Seal of the Prophets Vol. II, Ch. X, pp. 473–506",
    "tags": [
      "Khandaq",
      "Ditch",
      "Ahzab",
      "Salman al-Farsi",
      "Trench",
      "Miracle"
    ],
    "khutbas": [
      {
        "id": "2024-09-06",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Sep 6, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-09-06.html",
        "youtubeId": "Ms9uAz5qLvc",
        "thumbnailUrl": "https://img.youtube.com/vi/Ms9uAz5qLvc/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would mention the Battle of Khandaq, also known as the Battle of Ahzab (Battle of the Trench). This battle took place in 5 AH, or February/March 627 AD."
      },
      {
        "id": "2024-09-27",
        "title": "Muhammad (sa): The Great Examplar",
        "date": "Sep 27, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-09-27.html",
        "youtubeId": "DaTvyfjQQCo",
        "thumbnailUrl": "https://img.youtube.com/vi/DaTvyfjQQCo/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta`awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue narrating incidents from the Battle of Ahzab."
      },
      {
        "id": "2024-09-20",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Sep 20, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-09-20.html",
        "youtubeId": "j50pghx5Gxo",
        "thumbnailUrl": "https://img.youtube.com/vi/j50pghx5Gxo/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he was mentioning the Battle of Ahzab with reference to the life of the Holy Prophet(sa)."
      },
      {
        "id": "2024-09-13",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Sep 13, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-09-13.html",
        "youtubeId": "il7s4t2Smxk",
        "thumbnailUrl": "https://img.youtube.com/vi/il7s4t2Smxk/hqdefault.jpg",
        "summary": "After reciting Tashahhud, T‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he had been mentioning details about the Battle of Ahzab and how the the treachery of the Jews of Khaibar led to the formation of an army of the disbelievers intending to attack and eliminate the Muslims."
      }
    ]
  },
  {
    "id": "ghazwah-quraizah",
    "vol": 2,
    "period": "Early Medina",
    "year": "5 A.H.",
    "date": "Dhu’l-Qa‘dah 5 A.H. / March–April 627 A.D.",
    "title": "Ghazwah of Banu Quraizah & Judgment of Sa‘d (ra)",
    "category": "Battle / Expedition",
    "desc": "During the desperate siege of the Ditch, the Jewish tribe of Banu Quraizah committed high treason by tearing up their defense pact with Muslims to coordinate a rear attack with the 10,000 Confederates. Following the siege of their fortress, Banu Quraizah refused the Prophet's judgment and insisted on being judged by their former ally, Hadrat Sa‘d bin Mu‘adh (ra). Sa‘d judged them strictly according to their own biblical law (Deuteronomy 20:10–14). Sa‘d bin Mu‘adh died soon after from his Uhud wound, regarding whom the Prophet declared: 'The Throne of the Gracious God shook at the death of Sa‘d.'",
    "source": "Seal of the Prophets Vol. II, Ch. XI, pp. 509–535",
    "tags": [
      "Banu Quraizah",
      "Sad bin Muadh",
      "Treason",
      "Deuteronomy",
      "Judgment"
    ],
    "khutbas": [
      {
        "id": "2024-11-01",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Nov 1, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-11-01.html",
        "youtubeId": "_lfRB9LyIlQ",
        "thumbnailUrl": "https://img.youtube.com/vi/_lfRB9LyIlQ/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the Expedition of Banu Quraizah."
      },
      {
        "id": "2024-10-25",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Oct 25, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-10-25.html",
        "youtubeId": "s3YTE_Hlots",
        "thumbnailUrl": "https://img.youtube.com/vi/s3YTE_Hlots/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue mentioning the siege of the Banu Quraizah after the Battle of the Confederates, due to their treachery."
      },
      {
        "id": "2022-02-04",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Feb 4, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-02-04.html",
        "youtubeId": "pay7J-DhUZU",
        "thumbnailUrl": "https://img.youtube.com/vi/pay7J-DhUZU/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta’awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      },
      {
        "id": "2020-07-10",
        "title": "Men of Excellence",
        "date": "Jul 10, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-07-10.html",
        "youtubeId": "vN6XktJgc60",
        "thumbnailUrl": "https://img.youtube.com/vi/vN6XktJgc60/hqdefault.jpg",
        "summary": "In today’s Friday Sermon, His Holiness(aba) continued to narrate accounts from the life of Hazrat Sa`d bin Mu’adh. His Holiness(aba) stated that as mentioned in the previous Sermon, after the Battle of Ahzab, the Holy Prophet(sa) was given the Divine command to head towards the Banu Quraizah and deal with their treachery."
      }
    ]
  },
  {
    "id": "sariyyah-qurta-thumamah",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Muharram 6 A.H. / May–June 627 A.D.",
    "title": "Sariyyah of Qurta & Acceptance of Thumamah bin Uthal",
    "category": "Milestone",
    "desc": "A detachment under Muhammad bin Maslamah (ra) captured Thumamah bin Uthal, the fierce chieftain of the Banu Hanifah in Yamamah. Bound to a pillar inside Masjid-e-Nabawi, Thumamah observed the Muslims' prayers, egalitarian brotherhood, and the Prophet's personal kindness for three days. When the Prophet unconditionally freed him, Thumamah walked to a nearby palm grove, bathed, returned to declare the Shahadah, and imposed a grain embargo from Yamamah on the Quraysh until they begged the Prophet for relief.",
    "source": "Seal of the Prophets Vol. III, Ch. I, pp. 23–27",
    "tags": [
      "Thumamah",
      "Yamamah",
      "Masjid-e-Nabawi",
      "Forgiveness",
      "Grain Embargo"
    ],
    "khutbas": [
      {
        "id": "2024-12-13",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Dec 13, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-12-13.html",
        "youtubeId": "Qyi3u-nl67A",
        "thumbnailUrl": "https://img.youtube.com/vi/Qyi3u-nl67A/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would mention another expedition from the life of the Holy Prophet(sa), called the Expedition of Qurta."
      }
    ]
  },
  {
    "id": "expeditions-zaid-6ah",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Rabi‘ul-Akhir – Jamadi’ul-Akhir 6 A.H. / 627 A.D.",
    "title": "Expeditions of Zaid bin Harithah to Dhul-Qassah & ‘Is",
    "category": "Battle / Expedition",
    "desc": "The Prophet dispatched series of defensive patrols led by his beloved freedman Hadrat Zaid bin Harithah (ra) to secure trade corridors against predatory desert raiders. At 'Is, Zaid intercepting a Qurayshite caravan resulted in the repatriation and subsequent sincere conversion to Islam of Abul-'As bin ar-Rabi‘, the noble husband of the Prophet's eldest daughter Hadrat Zainab (ra).",
    "source": "Seal of the Prophets Vol. III, Ch. I, pp. 30–38",
    "tags": [
      "Zaid bin Harithah",
      "Abul-As",
      "Zainab",
      "Patrols"
    ],
    "khutbas": [
      {
        "id": "2024-12-20",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Dec 20, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-12-20.html",
        "youtubeId": "CZTetQQMXIk",
        "thumbnailUrl": "https://img.youtube.com/vi/CZTetQQMXIk/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he has been mentioning the various battles and expeditions from the life of the Holy Prophet(sa). In this regard, His Holiness(aba) said we also find mention of the Expedition of Ukashah bin Mihsan."
      }
    ]
  },
  {
    "id": "ghazwah-banu-lihyan",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Jamadi’ul-Ula 6 A.H. / September 627 A.D.",
    "title": "Ghazwah of Banu Lihyan",
    "category": "Battle / Expedition",
    "desc": "The Holy Prophet (sa) led an army of 200 companions deep into Hijaz toward the territory of Banu Lihyan to bring to account the murderers of the Muslim teachers martyred at Raji‘. Banu Lihyan fled into high mountain crags. The Prophet visited the graves of the martyrs and prayed for them.",
    "source": "Seal of the Prophets Vol. III, Ch. I, pp. 38–40",
    "tags": [
      "Banu Lihyan",
      "Raji",
      "Expedition",
      "Justice"
    ],
    "khutbas": [
      {
        "id": "2024-05-17",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "May 17, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-05-17.html",
        "youtubeId": "hV2OTZPMmTQ",
        "thumbnailUrl": "https://img.youtube.com/vi/hV2OTZPMmTQ/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he had been mentioning the expedition of Raji’."
      }
    ]
  },
  {
    "id": "sariyyah-fadak-ali",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Sha‘ban 6 A.H. / December 627 A.D.",
    "title": "Sariyyah of Hadrat ‘Ali (ra) to Fadak",
    "category": "Battle / Expedition",
    "desc": "Upon learning that the Banu Sa‘d of Fadak were massing weapons and warriors to assist the Jewish strongholds of Khaibar against Medina, the Prophet dispatched Hadrat 'Ali (ra) with 100 men. 'Ali captured their herds and scouts, scattering their armed coalition before they could launch their planned offensive.",
    "source": "Seal of the Prophets Vol. III, Ch. II, pp. 90–91",
    "tags": [
      "Ali",
      "Fadak",
      "Khaibar",
      "Preemptive Defense"
    ],
    "khutbas": []
  },
  {
    "id": "killing-abu-rafi",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Ramadan 6 A.H. / January 628 A.D.",
    "title": "Neutralization of Abu Rafi‘ the Intriguer of Khaibar",
    "category": "Milestone",
    "desc": "Abu Rafi‘ (Sallam bin Abi al-Huqaiq), the mastermind who financed and assembled the 10,000-strong Confederate army against Medina, continued financing Arab mercenaries to attack the Prophet (sa). An intrepid five-man unit led by Hadrat 'Abdullah bin 'Atik (ra) infiltrated his fortress in Khaibar at night and neutralized him, terminating his seditious warmongering.",
    "source": "Seal of the Prophets Vol. III, Ch. II, pp. 97–102",
    "tags": [
      "Abu Rafi",
      "Abdullah bin Atik",
      "Khaibar",
      "Ahzab"
    ],
    "khutbas": [
      {
        "id": "2024-09-13",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Sep 13, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-09-13.html",
        "youtubeId": "il7s4t2Smxk",
        "thumbnailUrl": "https://img.youtube.com/vi/il7s4t2Smxk/hqdefault.jpg",
        "summary": "After reciting Tashahhud, T‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he had been mentioning details about the Battle of Ahzab and how the the treachery of the Jews of Khaibar led to the formation of an army of the disbelievers intending to attack and eliminate the Muslims."
      }
    ]
  },
  {
    "id": "drought-prayer-water",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "6 A.H. / 628 A.D.",
    "title": "Drought in Medina & The Prophet’s Prayer for Rain",
    "category": "Milestone",
    "desc": "A terrible drought gripped Medina, drying crops and decimating livestock. A Bedouin pleaded during the Friday sermon for rain. The Holy Prophet (sa) raised his blessed hands in supplication; instantly, clouds gathered over Mount Sal‘ and rain poured for an entire week until the same man requested prayer to abate the downpour.",
    "source": "Seal of the Prophets Vol. III, Ch. II, pp. 102–104",
    "tags": [
      "Drought",
      "Salat-ul-Istisqa",
      "Rain",
      "Prayer",
      "Miracle"
    ],
    "khutbas": []
  },
  {
    "id": "journey-hudaibiyyah",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Dhu’l-Qa‘dah 6 A.H. / March 628 A.D.",
    "title": "The Peaceful Pilgrimage to Hudaibiyyah",
    "category": "Treaty & Diplomatic",
    "desc": "Prompted by a divine vision that he was performing circumambulation around the Ka'bah, the Holy Prophet (sa) set out for Makkah with 1,500 companions in pilgrim garb (Ihram), carrying only sheathed traveler's swords and driving 70 sacrificial camels. When Quraysh dispatched Khalid bin al-Walid with 200 cavalry to block them violently, the Prophet diverted through rugged mountain passes to encamp at Hudaibiyyah.",
    "source": "Seal of the Prophets Vol. III, Ch. IV, pp. 135–139",
    "tags": [
      "Hudaibiyyah",
      "Umrah",
      "Ihram",
      "Vision",
      "Peace"
    ],
    "khutbas": []
  },
  {
    "id": "miracle-water-hudaibiyyah",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Dhu’l-Qa‘dah 6 A.H. / March 628 A.D.",
    "title": "The Miracle of the Springs of Water at Hudaibiyyah",
    "category": "Milestone",
    "desc": "At Hudaibiyyah, the single desert well quickly ran completely dry, plunging the 1,500 pilgrims and their mounts into acute thirst. The Prophet (sa) took an arrow from his quiver, threw it into the dry well, and made supplication. Fresh, sparkling water gushed forth abundantly until the entire company quenched their thirst, filled every vessel, and watered all beasts.",
    "source": "Seal of the Prophets Vol. III, Ch. IV, pp. 139–141",
    "tags": [
      "Hudaibiyyah",
      "Miracle",
      "Water",
      "Thirst",
      "Well"
    ],
    "khutbas": []
  },
  {
    "id": "baiat-e-ridwan",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Dhu’l-Qa‘dah 6 A.H. / March 628 A.D.",
    "title": "Bai‘at-e-Ridwan (The Pledge of the Tree)",
    "category": "Treaty & Diplomatic",
    "desc": "The Prophet (sa) dispatched Hadrat 'Uthman bin 'Affan (ra) as his ambassador to Makkah to reassure the Quraysh that Muslims came solely for peaceful pilgrimage. False rumors swept the camp that 'Uthman had been murdered. Beneath an acacia tree, the Prophet summoned all 1,500 companions to pledge their lives never to turn back. Placing his left hand upon his right, the Prophet declared: 'This is the hand of 'Uthman.' God revealed supreme satisfaction with the participants in Surah Al-Fath (48:19): 'Verily, Allah was well pleased with the believers when they swore allegiance to thee under the Tree.'",
    "source": "Seal of the Prophets Vol. III, Ch. IV, pp. 150–154",
    "tags": [
      "Baiat-e-Ridwan",
      "Tree",
      "Uthman",
      "Pledge",
      "Surah Al-Fath"
    ],
    "khutbas": [
      {
        "id": "2022-08-19",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Aug 19, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-08-19.html",
        "youtubeId": "36CaCNY_sbo",
        "thumbnailUrl": "https://img.youtube.com/vi/36CaCNY_sbo/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta`awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue mentioning incidents from the life of Hazrat Abu Bakr(ra), particularly regarding advancements towards Syria."
      },
      {
        "id": "2022-03-04",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Mar 4, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-03-04.html",
        "youtubeId": "R3xzDYRlLpU",
        "thumbnailUrl": "https://img.youtube.com/vi/R3xzDYRlLpU/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) continued highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      },
      {
        "id": "2021-06-11",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Jun 11, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-06-11.html",
        "youtubeId": "3C-qMIX1E1M",
        "thumbnailUrl": "https://img.youtube.com/vi/3C-qMIX1E1M/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Umar(ra)."
      },
      {
        "id": "2021-01-29",
        "title": "Men of Excellence : Hazrat Uthman Ibn Affan (ra)",
        "date": "Jan 29, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-01-29.html",
        "youtubeId": "zH8FrvU2Tq4",
        "thumbnailUrl": "https://img.youtube.com/vi/zH8FrvU2Tq4/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Uthman(ra) and the battles in which he took part."
      }
    ]
  },
  {
    "id": "treaty-of-hudaibiyyah",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Dhu’l-Qa‘dah 6 A.H. / March 628 A.D.",
    "title": "The Historic Treaty of Hudaibiyyah (Sulh-e-Hudaibiyyah)",
    "category": "Treaty & Diplomatic",
    "desc": "Suhail bin 'Amr represented the Quraysh. When Suhail objected to 'Bismillahir-Rahmanir-Rahim' and the title 'Muhammad Rasulullah', the Prophet selflessly instructed Hadrat 'Ali to erase it and wrote 'Muhammad bin 'Abdullah'. A ten-year armistice was concluded: Muslims would return without entering Makkah that year, anyone escaping from Makkah to Medina without guardian permission would be returned, but apostates fleeing to Makkah would not. Though seemingly one-sided to emotional companions like Hadrat 'Umar (ra), the Prophet recognized it as a profound diplomatic triumph.",
    "source": "Seal of the Prophets Vol. III, Ch. IV, pp. 154–163",
    "tags": [
      "Hudaibiyyah",
      "Treaty",
      "Sulh",
      "Suhail bin Amr",
      "Armistice"
    ],
    "khutbas": [
      {
        "id": "2024-11-22",
        "title": "Muhammad (sa): The Great Exemplar; Treaty of Hudaibiyah",
        "date": "Nov 22, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-11-22.html",
        "youtubeId": "FPwVVb-pkvA",
        "thumbnailUrl": "https://img.youtube.com/vi/FPwVVb-pkvA/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue to mention about the Treaty of Hudaibiyyah."
      },
      {
        "id": "2024-11-15",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Nov 15, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-11-15.html",
        "youtubeId": "glSnTs8_0qc",
        "thumbnailUrl": "https://img.youtube.com/vi/glSnTs8_0qc/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would begin mention of the Treaty of Hudaibiyyah."
      },
      {
        "id": "2024-12-06",
        "title": "Muhammad (sa): The Great Exemplar; Treaty of Hudaibiyah",
        "date": "Dec 6, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-12-06.html",
        "youtubeId": "TKvSQVaeskc",
        "thumbnailUrl": "https://img.youtube.com/vi/TKvSQVaeskc/hqdefault.jpg",
        "summary": "His Holiness(aba) quoted Hazrat Mirza Bashir Ahmad(ra) who writes:"
      },
      {
        "id": "2024-11-29",
        "title": "Muhammad (sa): The Great Exemplar; Treaty of Hudaibiyah",
        "date": "Nov 29, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-11-29.html",
        "youtubeId": "PPzjXwMUwyQ",
        "thumbnailUrl": "https://img.youtube.com/vi/PPzjXwMUwyQ/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awuuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue mentioning details regarding the Treaty of Hudaibiyah."
      }
    ],
    "articles": [
      {
        "id": "ror-hudaibiyyah-clear-victory",
        "source": "Review of Religions",
        "title": "The Treaty of Hudaibiyyah: The Apparent Defeat That Became Islam's Greatest Victory",
        "author": "Hazrat Mirza Bashiruddin Mahmud Ahmad (ra)",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Masterclass in strategic peace: Agreeing to ostensibly one-sided terms to establish a decade of non-violence that allowed Islam to quadruple in numbers.",
        "dateOrIssue": "Peace & Diplomacy"
      },
      {
        "id": "alhakam-fathum-mubin-hudaibiyyah",
        "source": "Al Hakam",
        "title": "'Inna Fatahna Laka Fatham Mubeena': When Peace Was Called the Greatest Victory",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "Why the Holy Quran hailed a peace pact rather than a military conquest as the 'Fath-e-Mubin' (Manifest Victory).",
        "dateOrIssue": "Quranic Studies"
      }
    ]
  },
  {
    "id": "revelation-fathum-mubin",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Dhu’l-Qa‘dah 6 A.H. / March 628 A.D.",
    "title": "Revelation of Surah Al-Fath: The Clear Victory",
    "category": "Revelation & Law",
    "desc": "En route back to Medina, heavy sadness hung over the companions. Suddenly, divine revelation descended upon the Prophet, radiant with celestial joy: 'Verily, We have granted thee a clear victory (Fathan Mubina)' (Surah Al-Fath 48:2). When Hadrat 'Umar asked: 'Is this a victory, O Messenger of Allah?' The Prophet affirmed: 'Yes, by Him in Whose hand is my life, this is the greatest victory!' Peace permitted unhindered dialogue; within two years, more people entered Islam than in the preceding eighteen years combined.",
    "source": "Seal of the Prophets Vol. III, Ch. IV, pp. 163–165",
    "tags": [
      "Surah Al-Fath",
      "Fathum Mubin",
      "Umar",
      "Victory",
      "Peace"
    ],
    "khutbas": [
      {
        "id": "2021-06-04",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Jun 4, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-06-04.html",
        "youtubeId": "ZJWSexwIs-M",
        "thumbnailUrl": "https://img.youtube.com/vi/ZJWSexwIs-M/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Umar(ra)."
      },
      {
        "id": "2021-10-15",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Oct 15, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-10-15.html",
        "youtubeId": "gUTJqwf4cDw",
        "thumbnailUrl": "https://img.youtube.com/vi/gUTJqwf4cDw/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Umar(ra)."
      },
      {
        "id": "2021-08-27",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Aug 27, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-08-27.html",
        "youtubeId": "DONMyvDslXI",
        "thumbnailUrl": "https://img.youtube.com/vi/DONMyvDslXI/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Umar(ra)."
      },
      {
        "id": "2021-07-30",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Jul 30, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-07-30.html",
        "youtubeId": "l6c8EYi8hOM",
        "thumbnailUrl": "https://img.youtube.com/vi/l6c8EYi8hOM/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Umar(ra)."
      }
    ]
  },
  {
    "id": "incident-abu-basir",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Late 6 A.H. / 628 A.D.",
    "title": "The Escape of Abu Basir & The Sea Coast Encampment",
    "category": "Treaty & Diplomatic",
    "desc": "When persecuted convert Abu Basir escaped Makkah to Medina, the Prophet faithfully fulfilled the treaty terms and handed him to the two Qurayshite pursuers. On the way back, Abu Basir overpowered his captors and escaped to the Red Sea coast (Al-'Is). Persecuted Makkan converts like Abu Jandal escaped and joined him, forming an autonomous camp of 300 men who choked Qurayshite trade caravans until the Quraysh themselves begged the Prophet to scrap the extradition clause and admit them into Medina.",
    "source": "Seal of the Prophets Vol. III, Ch. IV, pp. 168–172",
    "tags": [
      "Abu Basir",
      "Abu Jandal",
      "Extradition",
      "Caravan Route",
      "Treaty"
    ],
    "khutbas": [
      {
        "id": "2024-12-06",
        "title": "Muhammad (sa): The Great Exemplar; Treaty of Hudaibiyah",
        "date": "Dec 6, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-12-06.html",
        "youtubeId": "TKvSQVaeskc",
        "thumbnailUrl": "https://img.youtube.com/vi/TKvSQVaeskc/hqdefault.jpg",
        "summary": "His Holiness(aba) quoted Hazrat Mirza Bashir Ahmad(ra) who writes:"
      },
      {
        "id": "2024-11-29",
        "title": "Muhammad (sa): The Great Exemplar; Treaty of Hudaibiyah",
        "date": "Nov 29, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-11-29.html",
        "youtubeId": "PPzjXwMUwyQ",
        "thumbnailUrl": "https://img.youtube.com/vi/PPzjXwMUwyQ/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awuuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue mentioning details regarding the Treaty of Hudaibiyah."
      },
      {
        "id": "2024-11-22",
        "title": "Muhammad (sa): The Great Exemplar; Treaty of Hudaibiyah",
        "date": "Nov 22, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-11-22.html",
        "youtubeId": "FPwVVb-pkvA",
        "thumbnailUrl": "https://img.youtube.com/vi/FPwVVb-pkvA/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue to mention about the Treaty of Hudaibiyyah."
      },
      {
        "id": "2024-11-15",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Nov 15, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-11-15.html",
        "youtubeId": "glSnTs8_0qc",
        "thumbnailUrl": "https://img.youtube.com/vi/glSnTs8_0qc/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would begin mention of the Treaty of Hudaibiyyah."
      }
    ]
  },
  {
    "id": "royal-seal-prepared",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Late 6 A.H. / Spring 628 A.D.",
    "title": "Preparation of the Silver Prophetic Seal Ring",
    "category": "Milestone",
    "desc": "Deciding to address royal missives to the supreme monarchs of the world, the Prophet was advised that foreign empires only accepted letters bearing an official seal. He had a silver signet ring cast engraved with three lines: 'Muhammad' / 'Rasul' / 'Allah', read from bottom to top so that the name of God remained uppermost.",
    "source": "Seal of the Prophets Vol. III, Ch. VI, pp. 199–200",
    "tags": [
      "Seal",
      "Signet Ring",
      "Silver",
      "Diplomacy",
      "Rasulullah"
    ],
    "khutbas": []
  },
  {
    "id": "letter-caesar-heraclius",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Muharram 7 A.H. / May 628 A.D.",
    "title": "Letter to Caesar Heraclius of the Byzantine Empire",
    "category": "Treaty & Diplomatic",
    "desc": "Carried by Hadrat Dihyah bin Khalifah al-Kalbi (ra), the royal letter summoned Byzantine Emperor Heraclius to Islam: 'In the name of Allah... From Muhammad, servant and messenger of Allah, to Heraclius, ruler of Rome: Peace upon him who follows guidance... Accept Islam and thou shalt be safe; God will give thee a twofold reward.' In Jerusalem, Heraclius interrogated Abu Sufyan (then still a fierce enemy), recognized the unshakeable veracity of the Prophet, but hesitated to forfeit his throne.",
    "source": "Seal of the Prophets Vol. III, Ch. VI, pp. 205–218",
    "tags": [
      "Heraclius",
      "Caesar",
      "Byzantine",
      "Rome",
      "Dihyah al-Kalbi",
      "Abu Sufyan"
    ],
    "khutbas": [
      {
        "id": "2022-09-02",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Sep 2, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-09-02.html",
        "youtubeId": "a2P2VOjqOSI",
        "thumbnailUrl": "https://img.youtube.com/vi/a2P2VOjqOSI/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting the life of Hazrat Abu Bakr(ra) and the battles that took part during his era. His Holiness(aba) said that today he would mention the Conquest of Damascus, which was the last battle that took place during h"
      },
      {
        "id": "2022-08-26",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Aug 26, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-08-26.html",
        "youtubeId": "-3jDw2JNudg",
        "thumbnailUrl": "https://img.youtube.com/vi/-3jDw2JNudg/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra) and the armies he sent towards Syria in order to stop the enemy."
      }
    ]
  },
  {
    "id": "letter-chosroes-persia",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Muharram 7 A.H. / May 628 A.D.",
    "title": "Letter to Chosroes Parvez & The Fall of the Sasanian Empire",
    "category": "Treaty & Diplomatic",
    "desc": "Delivered by Hadrat 'Abdullah bin Hudhafah as-Sahmi (ra) to Chosroes Parvez, Emperor of Persia. Furious that the Prophet placed his own name before the Emperor's, Chosroes arrogantly tore the letter to shreds. When the Prophet heard of this sacrilege, he prophesied: 'Even so will God tear his empire into pieces.' Chosroes was overthrown and murdered by his own son Sheroyeh within months, and the mighty Sasanian empire dissolved.",
    "source": "Seal of the Prophets Vol. III, Ch. VI, pp. 218–224",
    "tags": [
      "Chosroes",
      "Parvez",
      "Persia",
      "Sasanian",
      "Prophecy",
      "Abdullah bin Hudhafah"
    ],
    "khutbas": [
      {
        "id": "2022-07-22",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Jul 22, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-07-22.html",
        "youtubeId": "JafHCkANoAM",
        "thumbnailUrl": "https://img.youtube.com/vi/JafHCkANoAM/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad (aba) said that as he mentioned in the previous sermon, he would highlight the expeditions against the Persian Empire during the era of Hazrat Abu Bakr (ra)."
      },
      {
        "id": "2022-07-08",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Jul 8, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-07-08.html",
        "youtubeId": "XIaYLOqfeLY",
        "thumbnailUrl": "https://img.youtube.com/vi/XIaYLOqfeLY/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting the life of Hazrat Abu Bakr(ra) and the expeditions during his era against the rebels."
      },
      {
        "id": "2021-07-23",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Jul 23, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-07-23.html",
        "youtubeId": "FpVHIcz6nBk",
        "thumbnailUrl": "https://img.youtube.com/vi/FpVHIcz6nBk/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz, and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Umar(ra)."
      }
    ]
  },
  {
    "id": "letter-muqawqis-egypt",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Muharram 7 A.H. / May 628 A.D.",
    "title": "Letter to Muqawqis (Coptic Ruler of Egypt)",
    "category": "Treaty & Diplomatic",
    "desc": "Envoys led by Hadrat Hatib bin Abi Balta‘ah (ra) brought the Prophet's letter to the Muqawqis of Alexandria. The Egyptian viceroy received the letter with immense reverence, placed it in an ivory casket, and sent honorable gifts including two Coptic noblewomen (Hadrat Mariyah al-Qibtiyyah, who bore the Prophet his son Ibrahim, and her sister Sirin), a white mule named Duldul, and robes of Egyptian linen.",
    "source": "Seal of the Prophets Vol. III, Ch. VI, pp. 224–231",
    "tags": [
      "Muqawqis",
      "Egypt",
      "Hatib bin Abi Baltaah",
      "Mariyah al-Qibtiyyah",
      "Duldul"
    ],
    "khutbas": [
      {
        "id": "2021-10-01",
        "title": "Men of Excellence : Hazrat Umar ibn al-Khaṭṭāb (ra)",
        "date": "Oct 1, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-10-01.html",
        "youtubeId": "g7v43PUnMF8",
        "thumbnailUrl": "https://img.youtube.com/vi/g7v43PUnMF8/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that once, the Second Caliph(ra) said in a sermon regarding Hazrat Umar(ra) that often, in the battles that took place after the demise of the Holy Prophet(sa), there would be a shortage of Muslims in the army."
      }
    ]
  },
  {
    "id": "letter-negus-abyssinia",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Muharram 7 A.H. / May 628 A.D.",
    "title": "Letter to the Negus (As-hamah of Abyssinia)",
    "category": "Treaty & Diplomatic",
    "desc": "Dispatched with Hadrat 'Amr bin Umayyah ad-Damri (ra). The Negus placed the sacred missive upon his eyes, stepped down from his throne onto the floor in humble adoration, and formally declared his conversion to Islam at the hands of Hadrat Ja‘far bin Abi Talib (ra). He chartered two ships repatriating all remaining Abyssinian Muslim emigrants to Medina.",
    "source": "Seal of the Prophets Vol. III, Ch. VI, pp. 231–237",
    "tags": [
      "Negus",
      "Najashi",
      "Abyssinia",
      "Amr bin Umayyah",
      "Jafar"
    ],
    "khutbas": [
      {
        "id": "2021-12-17",
        "title": "Men of Excellence : Hazrat Abu Bakr (ra)",
        "date": "Dec 17, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-12-17.html",
        "youtubeId": "mJT64jjqgBU",
        "thumbnailUrl": "https://img.youtube.com/vi/mJT64jjqgBU/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) continued highlighting incidents from the life of Hazrat Abu Bakr(ra)."
      },
      {
        "id": "2021-01-22",
        "title": "Men of Excellence : Hazrat Uthman Ibn Affan (ra)",
        "date": "Jan 22, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-01-22.html",
        "youtubeId": "X8-HWx91i3g",
        "thumbnailUrl": "https://img.youtube.com/vi/X8-HWx91i3g/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would begin highlighting incidents from the life of Hazrat Uthman(ra)."
      }
    ]
  },
  {
    "id": "letter-king-ghassan",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Muharram 7 A.H. / May 628 A.D.",
    "title": "Letter to the King of Ghassan (Al-Harith bin Abi Shamir)",
    "category": "Treaty & Diplomatic",
    "desc": "Delivered by Hadrat Shuja‘ bin Wahb (ra) to the Christian Arab monarch of Ghassan under Roman vassalage in Damascus. The haughty king threw the letter down and threatened to march on Medina, but Caesar forbade him from reckless aggression.",
    "source": "Seal of the Prophets Vol. III, Ch. VI, pp. 237–238",
    "tags": [
      "Ghassan",
      "Damascus",
      "Shuja bin Wahb",
      "Diplomacy"
    ],
    "khutbas": []
  },
  {
    "id": "letter-chief-yamamah",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "6 A.H.",
    "date": "Muharram 7 A.H. / May 628 A.D.",
    "title": "Letter to the Chieftain of Yamamah (Haudhah bin ‘Ali)",
    "category": "Treaty & Diplomatic",
    "desc": "Carried by Hadrat Sulait bin 'Amr (ra). Haudhah bin 'Ali of the Banu Hanifah responded with conditioned arrogance, offering to accept Islam only if given half of Arabia to rule. The Prophet rejected political bargaining, declaring: 'If he asked me for even an unripe date, I would not give it to him.' Haudhah died soon after without honor.",
    "source": "Seal of the Prophets Vol. III, Ch. VI, pp. 238–240",
    "tags": [
      "Yamamah",
      "Haudhah",
      "Sulait bin Amr",
      "Diplomacy"
    ],
    "khutbas": [
      {
        "id": "2022-06-17",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Jun 17, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-06-17.html",
        "youtubeId": "xHPyWK2Ejz8",
        "thumbnailUrl": "https://img.youtube.com/vi/xHPyWK2Ejz8/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that in the previous sermon, he stated that the incidents regarding the Battle of Yamamah and Musailimah and his followers were complete. There were also ten other expeditions to combat the rebellion raised by the hypocrites."
      },
      {
        "id": "2022-06-10",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Jun 10, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-06-10.html",
        "youtubeId": "5msf9gr-3wQ",
        "thumbnailUrl": "https://img.youtube.com/vi/5msf9gr-3wQ/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue narrating incidents from the life of Hazrat Abu Bakr(ra) pertaining to the Battle of Yamamah."
      },
      {
        "id": "2022-06-03",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Jun 3, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-06-03.html",
        "youtubeId": "UNaiBLqekLE",
        "thumbnailUrl": "https://img.youtube.com/vi/UNaiBLqekLE/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue highlighting incidents from the life of Hazrat Abu Bakr(ra) and his battles with the hypocrites after the demise of the Holy Prophet(sa)."
      },
      {
        "id": "2022-05-20",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "May 20, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-05-20.html",
        "youtubeId": "Dn7Z-6q1DBk",
        "thumbnailUrl": "https://img.youtube.com/vi/Dn7Z-6q1DBk/hqdefault.jpg",
        "summary": "After reciting Tashahhud, Ta`awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he would continue mention of the Battle of Yamamah which took place during the time of Hazrat Abu Bakr(ra)."
      }
    ]
  },
  {
    "id": "conquest-of-khaibar",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "7 A.H. / 628 A.D.",
    "date": "Muharram–Safar 7 A.H. / May–June 628 A.D.",
    "title": "The Conquest of Khaibar (Ghazwah Khaibar) & Valour of Hadrat ‘Ali (ra)",
    "category": "Battle / Expedition",
    "desc": "Khaibar was the heavily fortified bastion of northern Jewish tribes, serving as the central hub of political conspiracies and financial backing for the confederate siege against Medina. Following Hudaibiyyah, the Prophet (sa) marched with 1,400 companions to eliminate this existential threat. After reducing several fortresses, the formidable Citadel of Qamus resisted repeated assaults. The Prophet (sa) famously proclaimed: 'Tomorrow I shall give the banner to a man who loves Allah and His Messenger, and whom Allah and His Messenger love; through his hands Allah will grant victory.' The next morning he summoned Hadrat ‘Ali (ra), treated his eye infection with blessed saliva, and handed him the banner. ‘Ali slew the giant Jewish champion Marhab in single combat and breached the citadel gates. Khaibar was conquered, and its agricultural lands were left in Jewish custody under a fair 50% harvest-sharing agreement.",
    "source": "Seal of the Prophets Vol. III, Ch. VII, pp. 289–318; Sahih Bukhari 3701, Sahih Muslim 1807",
    "tags": [
      "Khaibar",
      "Ali",
      "Marhab",
      "Qamus",
      "Citadel",
      "Jewish Fortresses"
    ],
    "khutbas": [
      {
        "id": "2020-12-11",
        "title": "Men of Excellence: Hazrat Ali (ra)",
        "date": "Dec 11, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-12-11.html",
        "youtubeId": "WsWQfzvoA7g",
        "thumbnailUrl": "https://img.youtube.com/vi/WsWQfzvoA7g/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) detailed the conquest of Khaibar, Hadrat ‘Ali’s heroic duel with Marhab, and the Prophet’s profound spiritual endorsement of him."
      },
      {
        "id": "2024-08-23",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Aug 23, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-08-23.html",
        "youtubeId": "c2Z4pL_88U8",
        "thumbnailUrl": "https://img.youtube.com/vi/c2Z4pL_88U8/hqdefault.jpg",
        "summary": "Detailed account of the expedition of Khaibar, the siege of Qamus fortress, and the compassionate terms granted to the people of Khaibar."
      }
    ],
    "hadiths": [
      {
        "id": "bukhari-khaibar-ali-flag",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 64, Hadith 243 (Hadith 3701)",
        "narrator": "Sahl bin Sa‘d (ra)",
        "textSnippet": "...The Prophet (sa) said: 'Tomorrow I will give the flag to somebody by whose hands Allah will grant victory, and who loves Allah and His Messenger, and whom Allah and His Messenger love.' People spent the night wondering who would be given the flag... In the morning, he called ‘Ali bin Abi Talib...",
        "url": "https://sunnah.com/bukhari:3701"
      }
    ],
    "articles": [
      {
        "id": "ror-conquest-of-khaibar",
        "source": "Review of Religions",
        "title": "The Siege and Conquest of Khaibar: Defusing the Northern Threat to Islam",
        "author": "Research Cell Review of Religions",
        "url": "https://www.reviewofreligions.org/?s=Conquest+of+Khaibar",
        "summary": "A deep historical and strategic examination of the battle of Khaibar, defensive warfare principles, and the agricultural treaty instituted by Prophet Muhammad (sa).",
        "dateOrIssue": "Historical Warfare"
      },
      {
        "id": "alhakam-ali-khaibar-marhab",
        "source": "Al Hakam",
        "title": "Hazrat Ali (ra) at Khaibar: The Unlocking of Al-Qamus",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/?s=Hazrat+Ali+Khaibar+Marhab",
        "summary": "The legendary single combat between Hadrat Ali and Marhab, and the spiritual secrets behind the Prophet’s entrustment of the standard.",
        "dateOrIssue": "Companions of the Prophet"
      }
    ]
  },
  {
    "id": "return-jafar-abyssinia",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "7 A.H. / 628 A.D.",
    "date": "Safar 7 A.H. / June 628 A.D.",
    "title": "Return of Ja‘far bin Abi Talib (ra) & the Abyssinian Emigrants",
    "category": "Milestone",
    "desc": "While the Holy Prophet (sa) was concluding the affairs of Khaibar, Hadrat Ja‘far bin Abi Talib (ra) and the remaining emigrants who had resided in Abyssinia since the fifth year of Nabawi arrived, accompanied by Abu Musa al-Ash‘ari and his companions who had sailed across the Red Sea. Overwhelmed with joy upon seeing his beloved cousin Ja‘far after fifteen years of exile, the Holy Prophet kissed him between the eyes and embraced him warmly, uttering the legendary words: 'I do not know what delights me more: the conquest of Khaibar or the arrival of Ja‘far!' This reunion marked the emotional closure of the earliest phase of Makkan persecution.",
    "source": "Seal of the Prophets Vol. III, Ch. VII, pp. 318–322; Sunan Tirmidhi 2732; Sirat Ibn Hisham Vol. 2",
    "tags": [
      "Jafar bin Abi Talib",
      "Abyssinia",
      "Return",
      "Reunion",
      "Abu Musa al-Ashari"
    ],
    "khutbas": [
      {
        "id": "2020-11-06",
        "title": "Men of Excellence: Hazrat Jafar bin Abi Talib (ra)",
        "date": "Nov 6, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-11-06.html",
        "youtubeId": "WsWQfzvoA7g",
        "thumbnailUrl": "https://img.youtube.com/vi/WsWQfzvoA7g/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) expounded on the character of Hadrat Ja‘far bin Abi Talib, his leadership in Abyssinia, and the emotional reunion at Khaibar."
      }
    ],
    "hadiths": [
      {
        "id": "tirmidhi-jafar-return",
        "collection": "Jami‘ at-Tirmidhi",
        "reference": "Book 42, Hadith 2732",
        "narrator": "Jabir bin ‘Abdullah / ‘A’ishah (ra)",
        "textSnippet": "...When Ja‘far arrived from Abyssinia, the Messenger of Allah (sa) embraced him and kissed him between his eyes, saying: 'I know not whether I am more rejoiced with the conquest of Khaibar or with the arrival of Ja‘far.'...",
        "url": "https://sunnah.com/tirmidhi:2732"
      }
    ],
    "articles": [
      {
        "id": "alhakam-jafar-abyssinia-reunion",
        "source": "Al Hakam",
        "title": "Hazrat Ja‘far bin Abi Talib: The Winged Emigrant and the Envoy to the Negus",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/?s=Jafar+bin+Abi+Talib+Abyssinia",
        "summary": "The story of Hadrat Ja‘far’s diplomatic eloquence before Negus, his steadfast 15-year exile in Abyssinia, and his triumphant reunion with the Holy Prophet (sa).",
        "dateOrIssue": "Historical Biographies"
      }
    ]
  },
  {
    "id": "umratul-qada",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "7 A.H. / 629 A.D.",
    "date": "Dhu’l-Qa‘dah 7 A.H. / March 629 A.D.",
    "title": "Umratul-Qada (The Fulfilled / Compensatory ‘Umrah)",
    "category": "Milestone",
    "desc": "Exactly one year after the Treaty of Hudaibiyyah, the Holy Prophet (sa) and 2,000 companions who had attended Hudaibiyyah set out for Makkah to perform the compensatory pilgrimage. In accordance with the treaty, the Muslims entered bearing only sheathed swords, while the Quraysh evacuated the city and watched in awe from Mount Abu Qubais. The Muslims performed Tawaf, Sa‘y, and offered the Adhan atop the Ka‘bah through Bilal (ra). The awe-inspiring spiritual dignity, radiant unity, and moral discipline of the Muslims profoundly impressed the onlookers. During this pilgrimage, the Prophet married Hadrat Maimunah bint al-Harith (ra), further cementing ties with prominent Makkan clans.",
    "source": "Seal of the Prophets Vol. III, Ch. VII, pp. 325–334; Sahih Bukhari 4251, Sahih Muslim 1780",
    "tags": [
      "Umratul-Qada",
      "Hudaibiyyah",
      "Maimunah",
      "Bilal",
      "Tawaf",
      "Fulfilled Promise"
    ],
    "khutbas": [
      {
        "id": "2024-09-20",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Sep 20, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-09-20.html",
        "youtubeId": "c2Z4pL_88U8",
        "thumbnailUrl": "https://img.youtube.com/vi/c2Z4pL_88U8/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) detailed the events of Umratul-Qada, the emotional entry of the Muslims into the sacred sanctuary, and its impact on the Quraysh."
      }
    ],
    "hadiths": [
      {
        "id": "bukhari-umratul-qada-treaty",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 64, Hadith 289 (Hadith 4251)",
        "narrator": "Al-Bara’ bin ‘Azib (ra)",
        "textSnippet": "...When the Prophet (sa) entered Makkah in Dhul-Qa‘dah for ‘Umrah, he remained for three days. When the third day ended, the Meccans told ‘Ali: 'Tell your companion to leave our city, for the time has passed.' And the Prophet departed without hesitation...",
        "url": "https://sunnah.com/bukhari:4251"
      }
    ],
    "articles": [
      {
        "id": "ror-umratul-qada-fulfillment",
        "source": "Review of Religions",
        "title": "Umratul-Qada: The Triumph of Peaceful Adherence and Divine Fulfillment",
        "author": "Research Cell Review of Religions",
        "url": "https://www.reviewofreligions.org/?s=Umratul-Qada",
        "summary": "How the rigorous peaceful execution of Umratul-Qada exposed the moral bankruptcy of pagan Makkah and prepared the psychological grounds for Fatah Makkah.",
        "dateOrIssue": "Prophetic Character"
      }
    ]
  },
  {
    "id": "conversion-khalid-amr",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "7–8 A.H. / 629 A.D.",
    "date": "Safar 8 A.H. / May–June 629 A.D.",
    "title": "Acceptance of Islam by Khalid bin al-Walid & ‘Amr bin al-‘As",
    "category": "Milestone",
    "desc": "Directly influenced by the sublime majesty witnessed during Umratul-Qada, Makkah’s two greatest military masterminds and statesmen made the momentous decision to embrace Islam. Khalid bin al-Walid (the military genius behind Uhud) and ‘Amr bin al-‘As (the master diplomat who had pursued the emigrants to Abyssinia), along with ‘Uthman bin Talhah (keeper of the Ka‘bah keys), rode together to Medina. When the Holy Prophet (sa) saw them approaching, his face lit up with radiant joy and he remarked to his companions: 'Makkah has cast to you the innermost treasures of its heart (the pieces of its liver)!' Khalid pledged allegiance, asking forgiveness for his past warfare against Muslims, to which the Prophet replied: 'Islam obliterates whatever sins preceded it.'",
    "source": "Seal of the Prophets Vol. III, Ch. VII, pp. 335–340; Sirat Ibn Hisham Vol. 2; Al-Bidayah wan-Nihayah",
    "tags": [
      "Khalid bin Walid",
      "Amr bin al-As",
      "Conversion",
      "Sword of Allah",
      "Makkah"
    ],
    "khutbas": [
      {
        "id": "2024-09-27",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Sep 27, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-09-27.html",
        "youtubeId": "c2Z4pL_88U8",
        "thumbnailUrl": "https://img.youtube.com/vi/c2Z4pL_88U8/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) expounded on the acceptance of Islam by Khalid bin al-Walid and ‘Amr bin al-‘As, and the Holy Prophet’s immense joy and grace."
      }
    ],
    "hadiths": [
      {
        "id": "muslim-amr-conversion",
        "collection": "Sahih Muslim",
        "reference": "Book 1, Hadith 220 (Hadith 121)",
        "narrator": "‘Amr bin al-‘As (ra)",
        "textSnippet": "...When Allah placed the love of Islam in my heart, I came to the Prophet (sa) and said: 'Stretch out your right hand so I may pledge allegiance.'... He said: 'Did you not know that Islam obliterates whatever sins preceded it, and Hijrah obliterates whatever came before it?'...",
        "url": "https://sunnah.com/muslim:121"
      }
    ],
    "articles": [
      {
        "id": "ror-conversion-khalid-amr",
        "source": "Review of Religions",
        "title": "From Bitter Adversaries to Champions of Islam: The Conversion of Khalid bin Walid and Amr bin al-As",
        "author": "Research Cell Review of Religions",
        "url": "https://www.reviewofreligions.org/?s=Khalid+bin+Walid+conversion",
        "summary": "Historical transformation of Arabia’s most formidable generals into stalwarts of the faith, and how their conversion signaled the inevitable collapse of pagan resistance.",
        "dateOrIssue": "Historical Transformation"
      }
    ]
  },
  {
    "id": "battle-of-mutah",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "8 A.H. / 629 A.D.",
    "date": "Jumada al-Ula 8 A.H. / September 629 A.D.",
    "title": "The Battle of Mu’tah & Martyrdom of the Three Commanders",
    "category": "Battle / Expedition",
    "desc": "When the Prophet’s envoy Harith bin ‘Umair al-Azdi was brutally murdered by the Ghassanid Christian governor Shurahbil bin ‘Amr—a flagrant violation of international diplomatic immunity—the Prophet dispatched an army of 3,000 men to the Syrian borders. The Muslims found themselves facing a colossal force of over 100,000 Byzantine imperial soldiers and Arab Christian auxiliaries. In fierce combat at Mu’tah, the designated commanders fell one after another: first Zaid bin Harithah, then Ja‘far bin Abi Talib (who fought until both his arms were severed, earning the title Ja‘far at-Tayyar 'The Two-Winged'), and then ‘Abdullah bin Rawahah. With the ranks destabilized, Khalid bin al-Walid took the standard, broke nine swords in furious combat, reorganized the formations overnight using psychological tactics, and executed a masterful defensive withdrawal, preserving the Muslim army. The Prophet wept in Medina as he divinely witnessed the battle, proclaiming Khalid as 'A Sword from among the Swords of Allah' (Saifullah).",
    "source": "Seal of the Prophets Vol. III, Ch. VIII, pp. 341–356; Sahih Bukhari 4261, 4262",
    "tags": [
      "Mutah",
      "Zaid bin Harithah",
      "Jafar at-Tayyar",
      "Abdullah bin Rawahah",
      "Khalid bin Walid",
      "Saifullah",
      "Martyrs"
    ],
    "khutbas": [
      {
        "id": "2024-10-11",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Oct 11, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-10-11.html",
        "youtubeId": "c2Z4pL_88U8",
        "thumbnailUrl": "https://img.youtube.com/vi/c2Z4pL_88U8/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) narrated the heart-rending events of the Battle of Mu’tah, the martyrdoms of Zaid, Ja‘far, and Ibn Rawahah, and Khalid’s tactical genius."
      },
      {
        "id": "2020-11-06-mutah",
        "title": "Men of Excellence: Hazrat Jafar bin Abi Talib (ra)",
        "date": "Nov 6, 2020",
        "year": 2020,
        "url": "https://www.alislam.org/friday-sermon/2020-11-06.html",
        "youtubeId": "WsWQfzvoA7g",
        "thumbnailUrl": "https://img.youtube.com/vi/WsWQfzvoA7g/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) described the supreme sacrifice of Hadrat Ja‘far bin Abi Talib at the Battle of Mu’tah and his heavenly station as Ja‘far at-Tayyar."
      }
    ],
    "hadiths": [
      {
        "id": "bukhari-mutah-commanders",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 64, Hadith 298 (Hadith 4261)",
        "narrator": "Anas bin Malik (ra)",
        "textSnippet": "...The Prophet (sa) announced the deaths of Zaid, Ja‘far, and Ibn Rawahah before the news had reached them, saying while tears flowed from his eyes: 'Zaid took the flag and was martyred, then Ja‘far took it and was martyred, then Ibn Rawahah took it and was martyred... until one of Allah’s swords took it, until Allah granted them victory.'...",
        "url": "https://sunnah.com/bukhari:4261"
      },
      {
        "id": "bukhari-mutah-nine-swords",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 64, Hadith 300 (Hadith 4265)",
        "narrator": "Khalid bin al-Walid (ra)",
        "textSnippet": "...On the day of Mu’tah, nine swords were broken in my hand, and nothing remained in my hand except a broad Yemeni blade...",
        "url": "https://sunnah.com/bukhari:4265"
      }
    ],
    "articles": [
      {
        "id": "ror-battle-of-mutah",
        "source": "Review of Religions",
        "title": "The Battle of Mu’tah: Diplomatic Sanctity, Heroism, and the Sword of Allah",
        "author": "Research Cell Review of Religions",
        "url": "https://www.reviewofreligions.org/?s=Battle+of+Mutah",
        "summary": "Comprehensive analysis of the causes of Mu’tah, the martyrdom of the three revered commanders, and Khalid bin al-Walid’s legendary defensive maneuver against overwhelming Byzantine numbers.",
        "dateOrIssue": "Military History"
      },
      {
        "id": "alhakam-jafar-tayyar-mutah",
        "source": "Al Hakam",
        "title": "Ja‘far at-Tayyar: The Flying Martyr of the Battle of Mu’tah",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/?s=Jafar+Tayyar+Mutah",
        "summary": "The eternal legacy of Hadrat Ja‘far bin Abi Talib at Mu’tah and the vision seen by the Holy Prophet (sa) of Ja‘far flying with angels in Paradise.",
        "dateOrIssue": "Heroes of Islam"
      }
    ]
  },
  {
    "id": "conquest-of-makkah",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "8 A.H. / 630 A.D.",
    "date": "20 Ramadan 8 A.H. (11 Jan 630 A.D.)",
    "title": "The Peaceful Conquest of Makkah (Fatah Makkah)",
    "category": "Milestone",
    "desc": "Following the Quraysh's breach of the Treaty of Hudaibiyyah by assisting Banu Bakr against Banu Khuza'ah, the Holy Prophet (sa) advanced with 10,000 saintly companions. Entering his birthplace with head bowed so low in humility upon his mount that his beard touched the saddle, he granted universal amnesty to his bitterest persecutors: 'No retribution shall be upon you this day; go, for you are all free!' Purifying the Ka'bah of 360 idols, he recited: 'Truth has come and falsehood has vanished.'",
    "source": "Life of Muhammad by Hadrat Mirza Bashir-ud-Din Mahmud Ahmad (ra), pp. 156–165; Bukhari & Muslim",
    "tags": [
      "Conquest",
      "Makkah",
      "Fatah Makkah",
      "Ka'bah",
      "Amnesty",
      "Idols"
    ],
    "khutbas": [
      {
        "id": "2023-07-28",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Jul 28, 2023",
        "year": 2023,
        "url": "https://www.alislam.org/friday-sermon/2023-07-28.html",
        "youtubeId": "s_KkZl3L9h8",
        "thumbnailUrl": "https://img.youtube.com/vi/s_KkZl3L9h8/hqdefault.jpg",
        "summary": "His Holiness, Hazrat Mirza Masroor Ahmad (aba) expounded upon the unparalleled moral grandeur and sublime mercy of the Holy Prophet (sa) during the Conquest of Makkah, granting forgiveness to those who had brutally persecuted the Muslims for decades."
      }
    ],
    "articles": [
      {
        "id": "ror-conquest-makkah-general-amnesty",
        "source": "Review of Religions",
        "title": "The Bloodless Conquest of Makkah: General Amnesty to a City of Persecutors",
        "author": "Dr. Ijaz Ahmad",
        "url": "https://www.reviewofreligions.org/",
        "summary": "Entering with head bowed touching the camel's saddle, declaring 'No blame shall lie upon you today' to those who had murdered and expelled Muslims for two decades.",
        "dateOrIssue": "Ethics of Victory"
      },
      {
        "id": "alhakam-fatah-makkah-idols-removed",
        "source": "Al Hakam",
        "title": "Purification of the Ka'bah: Truth Has Arrived and Falsehood Has Vanished",
        "author": "Al Hakam History Desk",
        "url": "https://www.alhakam.org/",
        "summary": "The dismantling of 360 idols without vengeance or retribution, establishing eternal monotheism in the Arabian peninsula.",
        "dateOrIssue": "Historical Milestones"
      }
    ]
  },
  {
    "id": "battle-of-hunain",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "8 A.H. / 630 A.D.",
    "date": "Shawwal 8 A.H. / Feb 630 A.D.",
    "title": "The Battle of Hunain & Siege of Ta’if",
    "category": "Battle / Expedition",
    "desc": "The warlike confederacy of Hawazin and Thaqif ambushed the Muslim army in the narrow defiles of Hunain. As the vanguard recoiled, the Holy Prophet (sa) advanced intrepidly on his white mule, proclaiming: 'I am the Prophet without falsehood; I am the son of Abdul-Muttalib!' Rallied by Hadrat Abbas's thunderous call, the Muslims turned the tide and secured a decisive victory, followed by the siege of Ta'if and generous restitution of captives.",
    "source": "Life of Muhammad, pp. 166–172; Sirat Khatam-un-Nabiyyin",
    "tags": [
      "Hunain",
      "Hawazin",
      "Taif",
      "Abbas",
      "Bravery"
    ],
    "khutbas": []
  },
  {
    "id": "expedition-of-tabuk",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "9 A.H. / 630 A.D.",
    "date": "Rajab 9 A.H. / Oct 630 A.D.",
    "title": "The Expedition of Tabuk (Jaishul-‘Usrah)",
    "category": "Battle / Expedition",
    "desc": "In intense summer heat, the Holy Prophet (sa) led 30,000 Muslims on a 500-kilometer march to the Syrian border against Byzantine mobilization. Hadrat Uthman (ra) outfitted a third of the army with immense wealth, and Hadrat Abu Bakr (ra) donated everything he possessed. Awed by Muslim resolve, Byzantine forces retreated northward without engagement, firmly securing the northern Arabian borders.",
    "source": "Life of Muhammad, pp. 176–184; Bukhari",
    "tags": [
      "Tabuk",
      "Byzantine",
      "Jaishul-Usrah",
      "Abu Bakr",
      "Uthman"
    ],
    "khutbas": []
  },
  {
    "id": "year-of-delegations",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "9–10 A.H. / 630–631 A.D.",
    "date": "9–10 A.H. (Year of Delegations)",
    "title": "The Year of Delegations (‘Amul-Wufud)",
    "category": "Treaty & Diplomatic",
    "desc": "Tribal delegations and kings from every corner of the Arabian Peninsula journeyed to Medina to embrace Islam and pledge loyalty to the Holy Prophet (sa). Over seventy embassies, including the Christians of Najran, were received with gracious hospitality in the Prophet's Mosque, establishing universal peace and ending tribal blood feuds across the peninsula.",
    "source": "Life of Muhammad, pp. 185–192; Sirat Khatam-un-Nabiyyin",
    "tags": [
      "Delegations",
      "Amul-Wufud",
      "Arabia",
      "Najran",
      "Peace"
    ],
    "khutbas": []
  },
  {
    "id": "farewell-pilgrimage",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "10 A.H. / 632 A.D.",
    "date": "9 Dhul-Hijjah 10 A.H. (6 March 632 A.D.)",
    "title": "The Farewell Pilgrimage & Sermon of Mount ‘Arafat",
    "category": "Milestone",
    "desc": "Before 124,000 companions, the Holy Prophet (sa) performed his sole Hajj and delivered the historic Sermon on the Mount of Mercy (Jabal ar-Rahmah) in 'Arafat: proclaiming complete racial equality ('an Arab has no superiority over a non-Arab'), the sanctity of life and property, the elimination of usury, and the fundamental rights of women. Here God revealed: 'This day have I perfected your religion for you and completed My favour upon you and have chosen for you Islam as religion' (5:4).",
    "source": "Life of Muhammad, pp. 193–204; Muslim & Tirmidhi",
    "tags": [
      "Farewell Hajj",
      "Hajjat-ul-Wada",
      "Arafat",
      "Human Rights",
      "Equality"
    ],
    "khutbas": [
      {
        "id": "2024-03-08",
        "title": "Muhammad (sa): The Great Exemplar",
        "date": "Mar 8, 2024",
        "year": 2024,
        "url": "https://www.alislam.org/friday-sermon/2024-03-08.html",
        "youtubeId": "zF0J_hH3e1Y",
        "thumbnailUrl": "https://img.youtube.com/vi/zF0J_hH3e1Y/hqdefault.jpg",
        "summary": "His Holiness, Hazrat Mirza Masroor Ahmad (aba) expounded on the universal Charter of Human Rights delivered by the Holy Prophet (sa) during the Farewell Pilgrimage, emphasizing absolute racial equality and universal justice."
      }
    ],
    "articles": [
      {
        "id": "ror-farewell-address-human-rights",
        "source": "Review of Religions",
        "title": "The Farewell Sermon at Arafat: The Universal Manifesto of Human Rights and Equality",
        "author": "Hazrat Mirza Tahir Ahmad (rh)",
        "url": "https://www.reviewofreligions.org/",
        "summary": "'No Arab has superiority over a non-Arab... nor white over black': The eternal declaration dismantling racism, usury, and the subjugation of women.",
        "dateOrIssue": "Human Dignity"
      },
      {
        "id": "alhakam-hajjat-ul-wada-summary",
        "source": "Al Hakam",
        "title": "Hajjat-ul-Wada: The Perfection of Faith on the Plains of Mount Arafat",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/",
        "summary": "The revelation of 'Al-Yauma akmaltu lakum deenakum' and the final testament left to the Muslim Ummah.",
        "dateOrIssue": "Final Testaments"
      }
    ]
  },
  {
    "id": "expedition-of-usamah",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "11 A.H. / 632 A.D.",
    "date": "Safar 11 A.H. / May–June 632 A.D.",
    "title": "The Expedition of Usamah bin Zaid (ra)",
    "category": "Battle / Expedition",
    "desc": "In Safar 11 A.H., shortly before his final illness, the Holy Prophet (sa) ordered the mobilization of a massive army to secure the northern frontiers towards Syria, where Zaid bin Harithah had fallen. To obliterate social class and age prejudices, the Prophet appointed nineteen-year-old Usamah bin Zaid (ra) as supreme commander over senior elder companions including Hadrat ‘Umar bin al-Khattab and Abu ‘Ubaidah bin al-Jarrah. When some whispered regarding Usamah’s youth, the Prophet mounted the pulpit and declared: 'If you question his leadership, you questioned the leadership of his father before him! By Allah, he was worthy of leadership, and he is among the dearest of men to me.' When the Prophet passed away, Medina was gripped by crisis and rebellions, yet Hadrat Abu Bakr (ra) steadfastly insisted: 'By Allah, even if wild beasts drag my body through Medina, I will not disband an army commissioned by the Messenger of Allah!' The army marched, secured the borders, and returned victorious without a single casualty, establishing the authority of the nascent Caliphate.",
    "source": "Seal of the Prophets Vol. III, Ch. IX; Life of Muhammad by Hadrat Mirza Bashir-ud-Din Mahmud Ahmad (ra), pp. 210–215; Bukhari 4469",
    "tags": [
      "Usamah bin Zaid",
      "Northern Border",
      "Leadership",
      "Meritocracy",
      "Abu Bakr",
      "Caliphate"
    ],
    "khutbas": [
      {
        "id": "2022-05-27",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "May 27, 2022",
        "year": 2022,
        "url": "https://www.alislam.org/friday-sermon/2022-05-27.html",
        "youtubeId": "xHPyWK2Ejz8",
        "thumbnailUrl": "https://img.youtube.com/vi/xHPyWK2Ejz8/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) described the absolute resolve of Hadrat Abu Bakr (ra) in dispatching Usamah bin Zaid’s army despite all domestic perils, fulfilling the Holy Prophet’s final instruction."
      },
      {
        "id": "2019-06-14",
        "title": "Men of Excellence: Hazrat Usamah bin Zaid (ra)",
        "date": "Jun 14, 2019",
        "year": 2019,
        "url": "https://www.alislam.org/friday-sermon/2019-06-14.html",
        "youtubeId": "WsWQfzvoA7g",
        "thumbnailUrl": "https://img.youtube.com/vi/WsWQfzvoA7g/hqdefault.jpg",
        "summary": "Hazrat Khalifatul-Masih V (aba) detailed the life of Hadrat Usamah bin Zaid, the Prophet’s profound love for him, and the wisdom behind appointing him as army commander."
      }
    ],
    "hadiths": [
      {
        "id": "bukhari-usamah-leadership",
        "collection": "Sahih al-Bukhari",
        "reference": "Book 64, Hadith 489 (Hadith 4469)",
        "narrator": "‘Abdullah bin ‘Umar (ra)",
        "textSnippet": "...The Messenger of Allah (sa) appointed Usamah as the commander of an army. The people spoke critically of his leadership. The Prophet said: 'If you criticize his command, you have criticized the command of his father before him. By Allah, his father was fit for command, and this one is among the most beloved of people to me after him.'...",
        "url": "https://sunnah.com/bukhari:4469"
      }
    ],
    "articles": [
      {
        "id": "ror-expedition-of-usamah",
        "source": "Review of Religions",
        "title": "The Expedition of Usamah bin Zaid: Meritocracy in Islam and the Unshakable Resolve of Abu Bakr",
        "author": "Research Cell Review of Religions",
        "url": "https://www.reviewofreligions.org/?s=Usamah+bin+Zaid",
        "summary": "How the appointment of youth over elder statesmen dismantled tribal hierarchy, and how Abu Bakr’s fidelity in dispatching the expedition stabilized the Muslim world.",
        "dateOrIssue": "Leadership & Faith"
      },
      {
        "id": "alhakam-hazrat-usamah-beloved",
        "source": "Al Hakam",
        "title": "Hazrat Usamah bin Zaid: The Beloved Son of the Beloved",
        "author": "Al Hakam Editorial",
        "url": "https://www.alhakam.org/?s=Usamah+bin+Zaid",
        "summary": "A tribute to Usamah bin Zaid’s steadfastness, tactical victory at the Syrian border, and the lessons of obedience to Khilafat.",
        "dateOrIssue": "Companions of the Prophet"
      }
    ]
  },
  {
    "id": "demise-holy-prophet",
    "vol": 3,
    "period": "Late Medina / Treaties",
    "year": "11 A.H. / 632 A.D.",
    "date": "12 Rabi‘ul-Awwal 11 A.H. (8 June 632 A.D.)",
    "title": "Demise of the Holy Prophet (sa) to the Supreme Companion",
    "category": "Milestone",
    "desc": "After a brief fever, the Holy Prophet (sa) passed away in the apartment of Hadrat 'A'ishah (ra), his final whispered words being: 'Bal ar-Rafiq al-A‘la' (Nay, rather with the Supreme Companion on High). As anguish enveloped Medina, Hadrat Abu Bakr (ra) delivered his famous consoling address: 'O people! Whosoever worshipped Muhammad, let him know Muhammad is dead; but whosoever worships Allah, Allah is alive and never dies.' Hadrat Abu Bakr was unanimously elected as the first Rightly Guided Caliph (Khalifatul-Masih).",
    "source": "Life of Muhammad, pp. 205–218; Bukhari & Sirat Khatam-un-Nabiyyin",
    "tags": [
      "Demise",
      "Wafat",
      "Abu Bakr",
      "Aishah",
      "Khilafat-e-Rashidah"
    ],
    "khutbas": [
      {
        "id": "2021-12-10",
        "title": "Men of Excellence: Hazrat Abu Bakr (ra)",
        "date": "Dec 10, 2021",
        "year": 2021,
        "url": "https://www.alislam.org/friday-sermon/2021-12-10.html",
        "youtubeId": "u8u95vj6V2o",
        "thumbnailUrl": "https://img.youtube.com/vi/u8u95vj6V2o/hqdefault.jpg",
        "summary": "His Holiness (aba) narrated the momentous events surrounding the demise of the Holy Prophet (sa) and the steadfast leadership displayed by Hazrat Abu Bakr (ra) in anchoring the believers and guiding the Muslim Ummah."
      }
    ],
    "articles": [
      {
        "id": "ror-demise-highest-companion",
        "source": "Review of Religions",
        "title": "To the Highest Companion: The Demise of the Holy Prophet (sa) and Abu Bakr's Leadership",
        "author": "Maulana Dost Muhammad Shahid",
        "url": "https://www.reviewofreligions.org/",
        "summary": "The historic address: 'Whoso worshipped Muhammad, let him know that Muhammad is dead; but whoso worshipped Allah, Allah is alive and never dies.'",
        "dateOrIssue": "Final Hours & Succession"
      }
    ]
  }
];
