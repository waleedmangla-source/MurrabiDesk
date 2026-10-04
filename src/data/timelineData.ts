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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
];
