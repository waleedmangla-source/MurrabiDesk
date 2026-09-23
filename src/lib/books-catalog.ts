// Ahmadiyya Canonical Books & Literature Catalog (alislam.org/books)
import { THEOLOGICAL_TOPIC_MAP } from "./khazain-data";

export interface BookItem {
  id: string;
  title: string;
  urduTitle?: string;
  author: string;
  year?: string;
  category: "Promised Messiah" | "Khulafa-e-Ahmadiyya" | "Scholarly Classic" | "Contemporary";
  summary: string;
  url: string;
  topics: string[];
}

export const AHMADIYYA_BOOKS_CATALOG: BookItem[] = [
  // ── 1. BOOKS OF HAZRAT MIRZA GHULAM AHMAD, THE PROMISED MESSIAH (AS) ───────
  {
    id: "book-philosophy-teachings-islam",
    title: "The Philosophy of the Teachings of Islam",
    urduTitle: "اسلامی اصول کی فلاسفی (Islami Usul Ki Philosophy)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1896",
    category: "Promised Messiah",
    summary: "Renowned theological masterpiece delivered at the 1896 Lahore Conference of Religions. Answers five fundamental questions regarding the physical, moral, and spiritual states of man, life after death, and true union with God Almighty.",
    url: "https://www.alislam.org/book/philosophy-teachings-islam/",
    topics: ["philosophy", "spiritual states", "soul", "afterlife", "prayer", "morality", "god", "union with god", "فلسفہ", "روحانی حالتیں", "اخلاقی حالتیں", "اسلامی اصول کی فلاسفی"]
  },
  {
    id: "book-jesus-in-india",
    title: "Jesus in India",
    urduTitle: "مسیح ہندوستان میں (Masih Hindustan Mein)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1899",
    category: "Promised Messiah",
    summary: "Historical and medical treatise demonstrating that Jesus (as) survived the ordeal of crucifixion, escaped from Roman jurisdiction, and traveled through Persia and Afghanistan to Kashmir to minister to the Lost Tribes of Israel, dying a natural death in Srinagar.",
    url: "https://www.alislam.org/book/jesus-in-india/",
    topics: ["jesus in india", "crucifixion", "cross", "kashmir", "roza bal", "death of jesus", "lost tribes", "صلیب", "وفات مسیح", "کشمیر", "خان یار", "مسیح ہندوستان میں"]
  },
  {
    id: "book-barahin-e-ahmadiyya",
    title: "Barahin-e-Ahmadiyya (Parts 1 to 5)",
    urduTitle: "براہین احمدیہ (حصہ اول تا پنجم)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1880–1905",
    category: "Promised Messiah",
    summary: "The foundational magnum opus establishing the living truth, divine authority, and unmatched perfection of the Holy Qur'an and Islam through hundreds of rational arguments, divine revelations, and manifest heavenly signs.",
    url: "https://www.alislam.org/book/barahin-e-ahmadiyya/",
    topics: ["barahin", "arguments of islam", "quran", "revelation", "heavenly signs", "living god", "براہین احمدیہ", "دلائل اسلام", "وحی", "نشانات"]
  },
  {
    id: "book-noahs-ark",
    title: "Noah's Ark: An Invitation to Faith",
    urduTitle: "کشتی نوح (Kashti-e-Nuh)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1902",
    category: "Promised Messiah",
    summary: "Written during the devastation of the Indian plague as a spiritual haven. Delineates the essential moral code, high standard of righteousness, and the fundamental Conditions of Bai'at required for true membership in the Ahmadiyya Muslim Community.",
    url: "https://www.alislam.org/book/noahs-ark/",
    topics: ["noahs ark", "kashti-e-nuh", "conditions of baiat", "plague", "spiritual reform", "righteousness", "taqwa", "کشتی نوح", "بیعت کی شرائط", "طاعون", "تقویٰ"]
  },
  {
    id: "book-haqiqatul-wahi",
    title: "Haqiqatul-Wahi (The Philosophy of Divine Revelation)",
    urduTitle: "حقیقت الوحی (Haqiqat-ul-Wahi)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1907",
    category: "Promised Messiah",
    summary: "Monumental philosophical treatise defining the four categories of revelation, the reality of divine communion, and documenting over two hundred grand prophecies and heavenly signs vouchsafed to the Promised Messiah (as).",
    url: "https://www.alislam.org/book/haqiqatul-wahi/",
    topics: ["revelation", "wahi", "divine communion", "prophethood", "prophecies", "heavenly signs", "mukalama", "حقیقت الوحی", "وحی", "الہام", "پیشگوئیاں", "نشانات"]
  },
  {
    id: "book-al-wasiyyat",
    title: "The Will",
    urduTitle: "الوصیت (Al-Wasiyyat)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1905",
    category: "Promised Messiah",
    summary: "Prophetic testament foretelling the Promised Messiah's approaching demise, instituting the everlasting spiritual institution of Khilafat-e-Ahmadiyya (Qudrat-e-Saniyya / The Second Manifestation), and establishing the system of Al-Wasiyyat and Bahishti Maqbarah.",
    url: "https://www.alislam.org/book/the-will/",
    topics: ["the will", "al-wasiyyat", "khilafat", "second manifestation", "bahishti maqbarah", "financial sacrifice", "الوصیت", "خلافت", "قدرت ثانیہ", "بہشتی مقبرہ"]
  },
  {
    id: "book-fath-e-islam",
    title: "The Victory of Islam",
    urduTitle: "فتح اسلام (Fath-e-Islam)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1891",
    category: "Promised Messiah",
    summary: "Historical manifesto setting forth Huzoor's divine commission from Allah as the Promised Reformer and outlining the five grand branches for the defense and revival of Islam through literature, debates, guests, and prayers.",
    url: "https://www.alislam.org/book/victory-of-islam/",
    topics: ["victory of islam", "fath-e-islam", "reformer", "revival of islam", "branches of work", "فتح اسلام", "مجدد", "اشاعت اسلام"]
  },
  {
    id: "book-a-message-of-peace",
    title: "A Message of Peace",
    urduTitle: "پیغام صلح (Paigham-e-Sulh)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1908",
    category: "Promised Messiah",
    summary: "The final written work of the Promised Messiah (as), finished hours before his passing in Lahore. A passionate appeal to Muslims and Hindus for religious tolerance, mutual veneration of holy founders, and interfaith concord.",
    url: "https://www.alislam.org/book/message-of-peace/",
    topics: ["message of peace", "paigham-e-sulh", "hindu muslim unity", "interfaith harmony", "religious tolerance", "peace", "پیغام صلح", "رواداری", "امن"]
  },
  {
    id: "book-tiryaq-ul-qulub",
    title: "The Elixir of Life",
    urduTitle: "تریاق القلوب (Tiryaq-ul-Qulub)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1902",
    category: "Promised Messiah",
    summary: "Spiritual healing treatise chronicling heavenly signs, accepted prayers, miraculous cures, and refuting allegations of opponents concerning divine communion and prophethood.",
    url: "https://www.alislam.org/book/tiryaq-ul-qulub/",
    topics: ["elixir of life", "tiryaq-ul-qulub", "acceptance of prayer", "signs", "miracles", "تریاق القلوب", "استجابت دعا", "نشانات"]
  },
  {
    id: "book-british-gov-jihad",
    title: "The British Government and Jihad",
    urduTitle: "گورنمنٹ انگریزی اور جہاد (Government Angrezi Aur Jihad)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1900",
    category: "Promised Messiah",
    summary: "Clarifying the authentic Quranic philosophy of Jihad: demonstrating that physical warfare was strictly defensive to protect religious freedom, and declaring the cessation of aggressive war in favour of the peaceful 'Jihad of the Pen'.",
    url: "https://www.alislam.org/book/british-government-and-jihad/",
    topics: ["jihad", "jihad of the pen", "british government", "peace", "religious freedom", "جہاد", "جہاد بالقلم", "امن"]
  },
  {
    id: "book-chashma-e-marifat",
    title: "Fountain of Knowledge",
    urduTitle: "چشمہ معرفت (Chashma-e-Ma'rifat)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1908",
    category: "Promised Messiah",
    summary: "Comprehensive refutation of the Arya Samaj doctrines and Western secularism, demonstrating the living communion with God, the superiority of Quranic morality, and the divine origin of the universe.",
    url: "https://www.alislam.org/book/fountain-of-knowledge/",
    topics: ["chashma-e-marifat", "arya samaj", "existence of god", "quran", "vedas", "چشمہ معرفت", "آریہ سماج", "قرآن"]
  },
  {
    id: "book-tadhkirah",
    title: "Tadhkirah: Dreams, Visions and Verbal Revelations",
    urduTitle: "تذکرہ (Tadhkirah)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1969 (Compiled)",
    category: "Promised Messiah",
    summary: "The definitive compendium of the sacred dreams, visions, and verbal revelations vouchsafed to Hazrat Mirza Ghulam Ahmad (as) across his lifetime, arranged chronologically.",
    url: "https://www.alislam.org/book/tadhkirah/",
    topics: ["tadhkirah", "revelations", "dreams", "visions", "prophecies", "wahi", "ilham", "تذکرہ", "الہامات", "رویا", "کشوف", "پیشگوئیاں"]
  },
  {
    id: "book-malfuzat",
    title: "Malfuzat: Discourses of the Promised Messiah (Volumes 1–5)",
    urduTitle: "ملفوظات (Malfuzat)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    year: "1891–1908",
    category: "Promised Messiah",
    summary: "Treasury of spontaneous daily discourses, spiritual advice, theological answers, and Quranic exegesis delivered by the Promised Messiah (as) in his gatherings at Qadian.",
    url: "https://www.alislam.org/book/malfuzat/",
    topics: ["malfuzat", "discourses", "spiritual advice", "exegesis", "qadian", "answers", "ملفوظات", "نصائح", "روحانی ارشادات"]
  },

  // ── 2. BOOKS OF HAZRAT KHALIFATUL MASIH I (RA) ─────────────────────────────
  {
    id: "book-haqaiq-ul-furqan",
    title: "Haqaiq-ul-Furqan (Commentary on the Holy Qur'an, Volumes 1–4)",
    urduTitle: "حقائق الفرقان (Haqaiq-ul-Furqan)",
    author: "Hazrat Maulana Noor-ud-Deen, Khalifatul Masih I (ra)",
    year: "1910",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Profound four-volume Quranic exegesis compiled from the lectures, Dars, and notes of Hazrat Khalifatul Masih I (ra), renowned for linguistic precision and spiritual depth.",
    url: "https://www.alislam.org/book/haqaiq-ul-furqan/",
    topics: ["haqaiq-ul-furqan", "quran commentary", "tafsir", "noor-ud-deen", "exegesis", "حقائق الفرقان", "تفسیر قرآن", "نور الدین"]
  },
  {
    id: "book-mirqat-ul-yaqeen",
    title: "Mirqat-ul-Yaqeen (Steps to Certainty)",
    urduTitle: "مرقاۃ الیقین فی حیاۃ نور الدین",
    author: "Hazrat Maulana Noor-ud-Deen, Khalifatul Masih I (ra)",
    year: "1905",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Spiritual autobiography of Hazrat Khalifatul Masih I (ra) describing his tireless quest for divine truth, travels across Arabia and India, and complete devotion to the Holy Quran.",
    url: "https://www.alislam.org/book/mirqat-ul-yaqeen/",
    topics: ["mirqat-ul-yaqeen", "autobiography", "noor-ud-deen", "faith", "certainty", "مرقاۃ الیقین", "سوانح حیات"]
  },

  // ── 3. BOOKS OF HAZRAT KHALIFATUL MASIH II (RA) ─────────────────────────────
  {
    id: "book-ahmadiyyat-true-islam",
    title: "Ahmadiyyat or The True Islam",
    urduTitle: "احمدیت یعنی حقیقی اسلام",
    author: "Hazrat Mirza Bashir-ud-Din Mahmud Ahmad, Khalifatul Masih II (ra)",
    year: "1924",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Renowned paper presented at the 1924 Conference on Some Living Religions of the Empire in London. Expounds the Islamic conception of God, moral teachings, prayer, life after death, and the mission of the Promised Messiah (as).",
    url: "https://www.alislam.org/book/ahmadiyyat-or-the-true-islam/",
    topics: ["ahmadiyyat or true islam", "true islam", "beliefs", "conception of god", "spiritual life", "london conference", "احمدیت یعنی حقیقی اسلام", "عقائد"]
  },
  {
    id: "book-invitation-to-ahmadiyyat",
    title: "Invitation to Ahmadiyyat",
    urduTitle: "دعوت الامیر (Dawat-ul-Ameer)",
    author: "Hazrat Mirza Bashir-ud-Din Mahmud Ahmad, Khalifatul Masih II (ra)",
    year: "1926",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Compelling presentation of the claims of Hazrat Mirza Ghulam Ahmad (as), scriptural prophecies of the Second Coming from the Quran, Bible, and Ahadith, and the necessity of joining the Jama'at.",
    url: "https://www.alislam.org/book/invitation-to-ahmadiyyat/",
    topics: ["invitation to ahmadiyyat", "dawat-ul-ameer", "second coming", "messiah", "mahdi", "prophecies", "baiat", "دعوت الامیر", "مسیح موعود", "پیشگوئیاں"]
  },
  {
    id: "book-life-of-muhammad",
    title: "Life of Muhammad (sa)",
    urduTitle: "سیرت النبی ﷺ (Sirat-un-Nabi)",
    author: "Hazrat Mirza Bashir-ud-Din Mahmud Ahmad, Khalifatul Masih II (ra)",
    year: "1930",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Inspiring biographical account of the Holy Prophet Muhammad (sa), narrating his noble upbringing, the dawn of revelation, steadfast endurance through Makkan persecution, the Madinah commonwealth, and his unblemished character.",
    url: "https://www.alislam.org/book/life-of-muhammad/",
    topics: ["life of muhammad", "prophet muhammad", "seerah", "sirat", "makkah", "madinah", "character", "سیرت النبی", "آنحضرت", "سیرت"]
  },
  {
    id: "book-muhammad-liberator-of-women",
    title: "Muhammad (sa) The Liberator of Women",
    urduTitle: "محمد ﷺ عورتوں کے نجات دہندہ",
    author: "Hazrat Mirza Bashir-ud-Din Mahmud Ahmad, Khalifatul Masih II (ra)",
    year: "1940",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Historical study illustrating how the Holy Prophet (sa) transformed the status of women, granting unprecedented legal, spiritual, economic, and matrimonial rights centuries before modern reforms.",
    url: "https://www.alislam.org/book/muhammad-the-liberator-of-women/",
    topics: ["women", "rights of women", "prophet muhammad", "equality", "marriage", "inheritance", "عورتوں کے حقوق", "حقوق نسواں", "عصمت"]
  },
  {
    id: "book-remembrance-of-allah",
    title: "Remembrance of Allah (Zikr-e-Ilahi)",
    urduTitle: "ذکر الٰہی (Zikr-e-Ilahi)",
    author: "Hazrat Mirza Bashir-ud-Din Mahmud Ahmad, Khalifatul Masih II (ra)",
    year: "1916",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Spiritual guidebook detailing the four categories of Zikr, methods of maintaining divine consciousness, attaining inner peace, and the transformative impact of prayer on the soul.",
    url: "https://www.alislam.org/book/remembrance-of-allah/",
    topics: ["remembrance of allah", "zikr", "prayer", "spiritual peace", "soul", "tasbeeh", "ذکر الٰہی", "دعا", "سکون قلب"]
  },
  {
    id: "book-the-way-of-the-seekers",
    title: "The Way of the Seekers (Sair-e-Ruhani)",
    urduTitle: "سیر روحانی (Sair-e-Ruhani)",
    author: "Hazrat Mirza Bashir-ud-Din Mahmud Ahmad, Khalifatul Masih II (ra)",
    year: "1938",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Illuminating guide outlining the progressive stages of spiritual development, purifying the heart, overcoming self-deception, and drawing near to Allah Almighty.",
    url: "https://www.alislam.org/book/way-of-the-seekers/",
    topics: ["way of the seekers", "sair-e-ruhani", "spiritual stages", "purification", "spiritual journey", "سیر روحانی", "تزکیہ نفس"]
  },
  {
    id: "book-ten-proofs-god",
    title: "Ten Proofs for the Existence of God",
    urduTitle: "ہستی باری تعالیٰ کے دس ثبوت",
    author: "Hazrat Mirza Bashir-ud-Din Mahmud Ahmad, Khalifatul Masih II (ra)",
    year: "1928",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Clear logical exposition offering ten philosophical, scientific, and empirical arguments demonstrating the existence of the Supreme Living Creator.",
    url: "https://www.alislam.org/book/ten-proofs-for-existence-of-god/",
    topics: ["existence of god", "ten proofs", "atheism", "cosmology", "divine design", "وجود باری تعالیٰ", "توحید"]
  },

  // ── 4. BOOKS OF HAZRAT MIRZA BASHIR AHMAD (RA) ──────────────────────────────
  {
    id: "book-seal-of-prophets",
    title: "The Life & Character of the Seal of Prophets (Volumes 1–3)",
    urduTitle: "سیرت خاتم النبیین ﷺ (Sirat Khatam-un-Nabiyyin)",
    author: "Hazrat Mirza Bashir Ahmad (ra)",
    year: "1920",
    category: "Scholarly Classic",
    summary: "The definitive academic and devotional biography of the Holy Prophet Muhammad (sa). Rigorously addresses historical Orientalist critiques, verifies authentic hadith traditions, and details the Prophet's compassionate model.",
    url: "https://www.alislam.org/book/life-character-seal-of-prophets/",
    topics: ["seal of prophets", "sirat khatam-un-nabiyyin", "prophet muhammad", "seerah", "orientalism", "hadith", "history", "سیرت خاتم النبیین", "سیرت", "آنحضرت"]
  },
  {
    id: "book-our-god",
    title: "Our God (Hasti Bari Ta'ala)",
    urduTitle: "ہمارا خدا (Hamara Khuda)",
    author: "Hazrat Mirza Bashir Ahmad (ra)",
    year: "1935",
    category: "Scholarly Classic",
    summary: "Masterful theological defense of Tawheed (Divine Unity), analyzing divine attributes, prayer, communion with God, the problem of evil, and refuting materialistic philosophies.",
    url: "https://www.alislam.org/book/our-god/",
    topics: ["our god", "hamara khuda", "tawheed", "existence of god", "attributes of allah", "prayer", "ہمارا خدا", "توحید", "صفات باری تعالیٰ"]
  },
  {
    id: "book-forty-gems",
    title: "Forty Gems of Beauty (Chihal Roza)",
    urduTitle: "اربعین فی محاسن الاسلام",
    author: "Hazrat Mirza Bashir Ahmad (ra)",
    year: "1932",
    category: "Scholarly Classic",
    summary: "Selection of forty radiant Ahadith of the Holy Prophet Muhammad (sa) with insightful commentaries illuminating Islamic ethics, worship, honesty, and brotherhood.",
    url: "https://www.alislam.org/book/forty-gems-of-beauty/",
    topics: ["forty gems", "hadith", "ethics", "prophetic sayings", "moral guidance", "احادیث", "اخلاق"]
  },

  // ── 5. BOOKS OF HAZRAT KHALIFATUL MASIH IV (RH) ─────────────────────────────
  {
    id: "book-revelation-rationality",
    title: "Revelation, Rationality, Knowledge & Truth",
    urduTitle: "الہام، عقل، علم اور سچائی (Ilham, Aql, Ilm Aur Sachai)",
    author: "Hazrat Mirza Tahir Ahmad, Khalifatul Masih IV (rh)",
    year: "1998",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Monumental 700+ page intellectual work exploring the intersection of modern physics, cosmology, biological evolution, philosophy, and Quranic revelation, demonstrating the harmonious unity between science and divine truth.",
    url: "https://www.alislam.org/book/revelation-rationality-knowledge-truth/",
    topics: ["revelation rationality", "science and religion", "evolution", "cosmology", "physics", "big bang", "quran and science", "فلسفہ", "سائنس اور مذہب", "ارتقاء", "وحی اور عقل"]
  },
  {
    id: "book-murder-in-the-name-of-allah",
    title: "Murder in the Name of Allah",
    urduTitle: "مذہب کے نام پر خون (Mazhab Ke Naam Par Khoon)",
    author: "Hazrat Mirza Tahir Ahmad, Khalifatul Masih IV (rh)",
    year: "1989",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Hard-hitting critique exposing religious fundamentalism, state-sponsored persecution, and the anti-Ahmadiyya Ordinance XX in Pakistan, proving that Islam champions unconditional freedom of conscience.",
    url: "https://www.alislam.org/book/murder-in-the-name-of-allah/",
    topics: ["murder in name of allah", "religious freedom", "ordinance xx", "fundamentalism", "persecution", "freedom of conscience", "مذہب کے نام پر خون", "آزادی ضمیر"]
  },
  {
    id: "book-christianity-facts-to-fiction",
    title: "Christianity: A Journey from Facts to Fiction",
    urduTitle: "عیسائیت: حقیقت سے فسانہ تک",
    author: "Hazrat Mirza Tahir Ahmad, Khalifatul Masih IV (rh)",
    year: "1992",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Scholarly comparative religion treatise tracing how the simple unitarian teachings of Jesus (as) were altered by pagan influences into Trinitarianism, Original Sin, and the Atonement.",
    url: "https://www.alislam.org/book/christianity-journey-facts-fiction/",
    topics: ["christianity", "trinity", "atonement", "jesus", "original sin", "comparative religion", "عیسائیت", "تثلیث", "کفارہ"]
  },
  {
    id: "book-islam-contemporary-issues",
    title: "Islam's Response to Contemporary Issues",
    urduTitle: "عصر حاضر کے مسائل کا اسلامی حل",
    author: "Hazrat Mirza Tahir Ahmad, Khalifatul Masih IV (rh)",
    year: "1992",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Delivered at the Hurlingham Club in London. Provides Quranic solutions to social unrest, economic disparity, global governance, international conflict, and environmental degradation.",
    url: "https://www.alislam.org/book/islams-response-to-contemporary-issues/",
    topics: ["contemporary issues", "social justice", "economics", "peace", "global governance", "عصر حاضر کے مسائل", "عدل و انصاف"]
  },
  {
    id: "book-absolute-justice",
    title: "Absolute Justice, Kindness and Kinship",
    urduTitle: "عدل، احسان اور ایتاء ذی القربیٰ",
    author: "Hazrat Mirza Tahir Ahmad, Khalifatul Masih IV (rh)",
    year: "1996",
    category: "Khulafa-e-Ahmadiyya",
    summary: "Exegesis of Surah An-Nahl verse 91, exploring the three ascending tiers of human moral conduct: Adl (strict justice), Ihsan (benevolence), and Ita'i Dhil-Qurba (spontaneous familial love).",
    url: "https://www.alislam.org/book/absolute-justice-kindness-and-kinship/",
    topics: ["justice", "kindness", "kinship", "adl", "ihsan", "morality", "ethics", "عدل", "احسان", "ایتاء ذی القربیٰ"]
  },

  // ── 6. BOOKS OF HAZRAT KHALIFATUL MASIH V (ABA) ─────────────────────────────
  {
    id: "book-world-crisis-pathway-peace",
    title: "World Crisis and the Pathway to Peace",
    urduTitle: "عالمی بحران اور امن کی راہ",
    author: "Hazrat Mirza Masroor Ahmad, Khalifatul Masih V (aba)",
    year: "2012",
    category: "Contemporary",
    summary: "Compendium of historic addresses delivered at Capitol Hill, the European Parliament, the UK Parliament, and the Peace Symposium. Warns against nuclear catastrophe and demands absolute justice in international relations.",
    url: "https://www.alislam.org/book/world-crisis-pathway-to-peace/",
    topics: ["world crisis", "pathway to peace", "peace", "justice", "nuclear war", "international relations", "عالمی بحران", "امن", "عدل"]
  },
  {
    id: "book-conditions-of-baiat",
    title: "The Conditions of Bai'at & Responsibilities of an Ahmadi",
    urduTitle: "شرائط بیعت اور احمدی کی ذمہ داریاں",
    author: "Hazrat Mirza Masroor Ahmad, Khalifatul Masih V (aba)",
    year: "2004",
    category: "Contemporary",
    summary: "Detailed Friday sermon series by Huzoor (aba) providing extensive commentary and practical guidelines on each of the Ten Conditions of Bai'at laid down by the Promised Messiah (as).",
    url: "https://www.alislam.org/book/conditions-of-baiat-responsibilities-of-ahmadi/",
    topics: ["conditions of baiat", "responsibilities of an ahmadi", "baiat", "ten conditions", "tarbiyat", "morals", "شرائط بیعت", "احمدی کی ذمہ داریاں", "تربیت"]
  },
  {
    id: "book-in-defence-of-islam",
    title: "In Defence of Islam",
    urduTitle: "دفاع اسلام",
    author: "Hazrat Mirza Masroor Ahmad, Khalifatul Masih V (aba)",
    year: "2010",
    category: "Contemporary",
    summary: "Compelling responses by Huzoor (aba) to modern accusations regarding Islamic extremism, loyalty to one's nation, integration in Western society, and the true meaning of Jihad.",
    url: "https://www.alislam.org/book/in-defence-of-islam/",
    topics: ["in defence of islam", "loyalty", "jihad", "extremism", "integration", "دفاع اسلام", "جہاد"]
  }
];

export function searchAhmadiyyaBooks(query: string): BookItem[] {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return [];

  const queryWords = normQuery.split(/\s+/).filter(w => w.length >= 2);

  const expandedTerms = [normQuery, ...queryWords];
  for (const [topicKey, urduList] of Object.entries(THEOLOGICAL_TOPIC_MAP)) {
    if (normQuery.includes(topicKey) || topicKey.includes(normQuery)) {
      expandedTerms.push(topicKey, ...urduList);
    }
  }

  return AHMADIYYA_BOOKS_CATALOG.filter(book => {
    const hayText = `${book.title} ${book.urduTitle || ""} ${book.author} ${book.summary} ${book.topics.join(" ")} ${book.category}`.toLowerCase();
    
    if (hayText.includes(normQuery)) return true;

    return expandedTerms.some(term => {
      const termLower = term.toLowerCase();
      return (
        hayText.includes(termLower) ||
        (book.urduTitle && book.urduTitle.includes(term))
      );
    });
  });
}
