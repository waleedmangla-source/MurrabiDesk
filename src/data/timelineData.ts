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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
        "summary": "After reciting Tashahhud, Ta‘awwuz and Surah al-Fatihah, His Holiness, Hazrat Mirza Masroor Ahmad(aba) said that he had been narrating incidents from the life of the Holy Prophet(sa) relating to the Battle of Badr or events that took place thereafter."
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
    "khutbas": []
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
    "khutbas": []
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
    "khutbas": []
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
    ]
  }
];
