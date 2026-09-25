// Malfuzat (ملفوظات) Corpus Catalog & Multilingual Search Index
// The Spoken Discourses, Sittings, and Extemporaneous Sayings of Hazrat Mirza Ghulam Ahmad, The Promised Messiah (as)
import { normalizeKhazainText, THEOLOGICAL_TOPIC_MAP } from './khazain-data';

export interface MalfuzatResult {
  id: string;
  volume: number; // Volume 1 to 10
  pageNum: number;
  dateStr: string; // e.g. "12 November 1898"
  hijriDate?: string;
  location: string; // e.g. "Qadian Dar-ul-Aman", "Lahore", "Sialkot", "Ludhiana"
  sittingContext?: string; // e.g. "After Maghrib Prayer", "Morning Walk", "Discussion with Arya visitor"
  title: string;
  urduTitle: string;
  urduText: string;
  englishTranslation: string;
  topics: string[];
  url: string;
  scribe?: string;
  periodicalSource?: string;
}

export const MALFUZAT_CATALOG: MalfuzatResult[] = [
  // ── VOLUME 1 ─────────────────────────────────────────────────────────────
  {
    id: "malfuzat-v1-dua-iztirar",
    volume: 1,
    pageNum: 4,
    dateStr: "1891",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Discourse on the Reality of True Supplication",
    title: "The Philosophy of Prayer and Anguish (Iztirar)",
    urduTitle: "دعا اور کیفیتِ اضطرار کا حقیقی مفہوم",
    urduText: "دعا حقیقت میں ایک موت ہے جس کے بعد زندگی ملتی ہے۔ جب تک انسان پر اضطرار کی حالت طاری نہ ہو، دعا میں وہ تاثیر پیدا نہیں ہوتی جو معجزانہ رنگ دکھاتی ہے۔ دعا محض زبان کی جنبش کا نام نہیں بلکہ یہ دل کا ایک گداز اور روح کا سجدہ ہے۔",
    englishTranslation: "Prayer in reality is a spiritual death followed by new life. Until a person enters a state of extreme agonizing anguish (Iztirar), prayer does not generate that miraculous potency. Prayer is not mere movement of the tongue; it is the melting of the heart and the prostration of the soul.",
    topics: ["prayer", "dua", "supplication", "iztirar", "anguish", "acceptance of prayer", "دعا", "اضطرار", "قبولیت دعا", "فلسفہ دعا", "روحانیت"],
    url: "https://www.alislam.org/book/malfuzat-volume-1/",
    scribe: "Hazrat Maulvi Abdul Karim Sialkoti (ra)",
    periodicalSource: "Al-Hakam, 1898"
  },
  {
    id: "malfuzat-v1-taqwa-essence",
    volume: 1,
    pageNum: 28,
    dateStr: "1898",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Sitting with Companions after Asr Prayer",
    title: "The Essence of Taqwa and Inner Righteousness",
    urduTitle: "تقویٰ کی اصل حقیقت اور روحانی پاکیزگی",
    urduText: "تقویٰ کے بغیر علم ایسا ہے جیسے بے روح کا جسم۔ متقی وہ ہے جو ہر قدم پھونک پھونک کر رکھے اور اللہ تعالیٰ کے حدود کو نہ توڑے، اور اپنے دل کے باریک ترین گوشوں کو بھی ریا اور کبر سے پاک رکھے۔",
    englishTranslation: "Knowledge without righteousness (Taqwa) is like a body without a soul. A truly righteous person walks with utmost circumspection, never transgresses the boundaries set by Allah Almighty, and cleanses the subtlest recesses of their heart from ostentation and arrogance.",
    topics: ["taqwa", "righteousness", "piety", "spiritual reform", "purity", "humility", "تقویٰ", "طہارت", "اخلاص", "کبر", "روحانی پاکیزگی"],
    url: "https://www.alislam.org/book/malfuzat-volume-1/",
    scribe: "Hazrat Maulvi Abdul Karim Sialkoti (ra)",
    periodicalSource: "Al-Hakam, Vol. 2"
  },
  {
    id: "malfuzat-v1-death-of-jesus",
    volume: 1,
    pageNum: 52,
    dateStr: "1898",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Discussion on Christian Doctrine and Quranic Exegesis",
    title: "The Death of Jesus Christ and Quranic Consensus",
    urduTitle: "وفاتِ مسیح اور قرآنی اجماع کا ثبوت",
    urduText: "قرآن مجید میں تیس سے زائد آیات ایسی ہیں جو حضرت عیسیٰ علیہ السلام کی طبعی وفات پر صاف اور بین شہادت دیتی ہیں۔ تمام صحابہ کرام کا پہلا اجماع جو سقیفہ بنی ساعدہ کے موقع پر ہوا، وہ تمام سابقہ انبیاء کی وفات پر ہی تھا۔ اگر حضرت عیسیٰ زندہ مانے جائیں تو قرآن کا اعجاز اور ختم نبوت دونوں پر حرف آتا ہے۔",
    englishTranslation: "There are more than thirty verses in the Holy Qur'an which furnish clear and unequivocal testimony to the natural death of Prophet Jesus (as). The very first unanimous consensus (Ijma) of the holy Companions (ra) at Saqifah Bani Sa'idah was established upon the demise of all past prophets. If Jesus is presumed alive, it infringes upon both the inimitability of the Quran and the Seal of Prophethood.",
    topics: ["death of jesus", "wafat masih", "crucifixion", "ijma", "sahaba", "christianity", "وفات مسیح", "عیسیٰ", "صلیب", "اجماع صحابہ", "ختم نبوت"],
    url: "https://www.alislam.org/book/malfuzat-volume-1/",
    scribe: "Hazrat Maulvi Abdul Karim Sialkoti (ra)",
    periodicalSource: "Al-Hakam, 1898"
  },

  // ── VOLUME 2 ─────────────────────────────────────────────────────────────
  {
    id: "malfuzat-v2-living-god",
    volume: 2,
    pageNum: 14,
    dateStr: "1899",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Address to Seekers of Truth",
    title: "Islam and the Manifestation of the Living God",
    urduTitle: "زندہ مذہب اور زندہ خدا کی نشانیاں",
    urduText: "ہمارا خدا زندہ خدا ہے جو اب بھی بولتا ہے جیسے پہلے بولتا تھا۔ جو شخص اس کی سچی اطاعت اختیار کرے، وہ اس پر اپنی رحمت اور کلام نازل فرماتا ہے۔ اسلام کی سچائی کی سب سے بڑی دلیل یہ ہے کہ اس کے ذریعے انسان خدا سے زندہ رابطہ قائم کر سکتا ہے۔",
    englishTranslation: "Our God is a Living God Who speaks today just as He spoke in the past. Whoever chooses sincere obedience to Him, He descends upon them His mercy and divine converse. The greatest proof of the truth of Islam is that through it, a human being establishes an active, living communion with God Almighty.",
    topics: ["living god", "communion with god", "revelation", "wahi", "truth of islam", "زندہ خدا", "مکالمہ مخاطبہ", "وحی", "صداقت اسلام"],
    url: "https://www.alislam.org/book/malfuzat-volume-2/",
    scribe: "Hazrat Maulvi Abdul Karim Sialkoti (ra)",
    periodicalSource: "Al-Hakam, 1899"
  },
  {
    id: "malfuzat-v2-baiat-conditions",
    volume: 2,
    pageNum: 67,
    dateStr: "1900",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Admonition to New Initiates",
    title: "The Responsibilities and Sacred Standard of Bai'at",
    urduTitle: "بیعت کی شرائط اور جماعت کے فرائض",
    urduText: "صرف میرے ہاتھ پر ہاتھ رکھ دینا کوئی نجات کا ذریعہ نہیں۔ بیعت کا مطلب ہے اپنے نفس کو خدا کی راہ میں بیچ دینا۔ جب تک اخلاق میں نمایاں تبدیلی پیدا نہ ہو اور انسان گناہ سے بیزار نہ ہو، بیعت کی رسم محض بے فائدہ ہے۔",
    englishTranslation: "Merely placing your hand in my hand is no vehicle for salvation. Bai'at means selling your ego and desires entirely for the sake of Allah. Unless a conspicuous transformation occurs in your moral character and a person feels genuine revulsion toward sin, the formal ceremony of pledge is of no benefit.",
    topics: ["baiat", "allegiance", "moral reform", "tawbah", "spiritual standards", "بیعت", "توبہ", "اصلاح نفس", "اخلاق", "جماعت"],
    url: "https://www.alislam.org/book/malfuzat-volume-2/",
    scribe: "Hazrat Mufti Muhammad Sadiq (ra)",
    periodicalSource: "Al-Badr, 1900"
  },

  // ── VOLUME 3 ─────────────────────────────────────────────────────────────
  {
    id: "malfuzat-v3-khatam-e-nabuwwat",
    volume: 3,
    pageNum: 112,
    dateStr: "1901",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Elucidation of the Station of the Holy Prophet (sa)",
    title: "Khatam-an-Nabiyyin: The Pinnacle and Seal of Prophetic Excellence",
    urduTitle: "خاتم النبیین کی روحانی عظمت اور بروزی نبوت",
    urduText: "آنحضرت صلی اللہ علیہ وسلم خاتم النبیین ہیں۔ آپ کی نبوت کے بعد کوئی نئی شریعت لانے والا نبی ہرگز نہیں آ سکتا۔ جو کچھ مجھے ملا ہے وہ آپ صلی اللہ علیہ وسلم کی غلامی اور کامل پیروی کے طفیل ملا ہے۔ میری نبوت آنحضرت صلی اللہ علیہ وسلم کی نبوت کا ہی ایک پرتو اور ظل ہے۔",
    englishTranslation: "The Holy Prophet Muhammad (peace and blessings of Allah be upon him) is the absolute Seal of the Prophets (Khatam-an-Nabiyyin). Following his advent, no new law-bearing prophet can ever appear. Whatever status I have attained has been granted purely through complete servitude and total obedience to him. My prophethood is merely a reflective image (Zill) and shadow of his supreme station.",
    topics: ["khatam-e-nabuwwat", "seal of prophethood", "holy prophet", "zilli nabuwwat", "prophethood", "خاتم النبیین", "ختم نبوت", "آنحضرت", "ظلی نبوت", "نبوت"],
    url: "https://www.alislam.org/book/malfuzat-volume-3/",
    scribe: "Hazrat Maulvi Abdul Karim Sialkoti (ra)",
    periodicalSource: "Al-Hakam, 1901"
  },
  {
    id: "malfuzat-v3-jihad-pen",
    volume: 3,
    pageNum: 176,
    dateStr: "1902",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Discussion on Defensive Warfare and Peaceful Jihad",
    title: "The True Nature of Islamic Jihad: The Jihad of the Pen",
    urduTitle: "جہاد کی اصل حقیقت اور تلوار کے جہاد کی موقوفی",
    urduText: "اسلام پر جو الزامات تلوار کے زور پر پھیلنے کے لگائے جاتے ہیں وہ سراسر بہتان ہیں۔ ابتدائی مسلمانوں نے تلوار صرف اپنے دفاع اور مظلوموں کے تحفظ کے لیے اٹھائی تھی۔ اب جبکہ قلم اور دلائل سے اسلام پر حملے ہو رہے ہیں، ہمارا فرض ہے کہ قلم اور دلائل کے ساتھ ہی اسلام کا دفاع کریں۔ یہی جہاد اکبر ہے۔",
    englishTranslation: "The allegations leveled against Islam claiming it spread by the sword are absolute fabrications. The early Muslims took up arms purely in self-defense and to safeguard religious freedom for the oppressed. In this contemporary age, where attacks against Islam are launched with the pen and intellectual arguments, our duty is to defend Islam with the pen and reason. This is the supreme Jihad (Jihad Akbar).",
    topics: ["jihad", "peace", "jihad of the pen", "religious freedom", "defense of islam", "جہاد", "جہاد بالقلم", "امن", "تلوار", "دفاع اسلام"],
    url: "https://www.alislam.org/book/malfuzat-volume-3/",
    scribe: "Hazrat Mufti Muhammad Sadiq (ra)",
    periodicalSource: "Al-Badr, 1902"
  },

  // ── VOLUME 4 ─────────────────────────────────────────────────────────────
  {
    id: "malfuzat-v4-fasting-ramadan",
    volume: 4,
    pageNum: 89,
    dateStr: "1903",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Spiritual Admonitions during the Month of Ramadan",
    title: "The Philosophy of Fasting and Spiritual Transformation",
    urduTitle: "روزہ کا فلسفہ اور باطنی تقویٰ کا حصول",
    urduText: "روزے سے مراد محض بھوکا پیاسا رہنا نہیں۔ اصل غرض یہ ہے کہ انسان جسمانی غذا کم کر کے روحانی غذا کی طرف متوجہ ہو اور اپنے تمام اعضاء کو گناہوں سے روکے۔ روزہ انسان کے اندر صبر اور قربانی کا مادہ پیدا کرتا ہے تاکہ وہ غریبوں کی تکالیف کو سمجھے۔",
    englishTranslation: "Fasting does not mean simply remaining hungry and thirsty. The true objective is that by diminishing physical sustenance, man turns toward spiritual nourishment and restrains all faculties from sin. Fasting instills perseverance and self-sacrifice so that one intimately understands the plight of the destitute.",
    topics: ["fasting", "ramadan", "sawm", "patience", "taqwa", "spiritual nourishment", "روزہ", "صوم", "رمضان", "صبر", "تقویٰ"],
    url: "https://www.alislam.org/book/malfuzat-volume-4/",
    scribe: "Hazrat Maulvi Abdul Karim Sialkoti (ra)",
    periodicalSource: "Al-Hakam, 1903"
  },
  {
    id: "malfuzat-v4-marriage-family",
    volume: 4,
    pageNum: 142,
    dateStr: "1903",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Counsel to Married Believers and Family Conduct",
    title: "Marital Harmony, Mutual Respect, and Rights of Women",
    urduTitle: "ازدواجی زندگی، باہمی حسن سلوک اور حقوق نسواں",
    urduText: "شریعت نے عورتوں کے حقوق کی جو حفاظت کی ہے وہ کسی دوسرے مذہب میں نہیں ملتی۔ شوہر کا فرض ہے کہ وہ اپنی بیوی کے ساتھ نرمی اور محبت کا برتاؤ کرے اور چھوٹی موٹی باتوں پر غصہ نہ کرے۔ گھر میں امن اور سکون تبھی قائم ہوتا ہے جب دونوں طرف سے درگزر اور الفت ہو۔",
    englishTranslation: "The protection that Islamic Shariah has granted to the rights of women is found in no other religious dispensation. It is the sacred duty of a husband to treat his wife with tenderness and compassion, never yielding to anger over trivial matters. Domestic peace and tranquility can only flourish where mutual forbearance and deep affection prevail.",
    topics: ["marriage", "nikah", "family", "women rights", "compassion", "peace", "نکاح", "ازدواج", "شادی", "حقوق نسواں", "عورت", "حسن سلوک"],
    url: "https://www.alislam.org/book/malfuzat-volume-4/",
    scribe: "Hazrat Mufti Muhammad Sadiq (ra)",
    periodicalSource: "Al-Badr, 1903"
  },

  // ── VOLUME 5 ─────────────────────────────────────────────────────────────
  {
    id: "malfuzat-v5-unity-community",
    volume: 5,
    pageNum: 301,
    dateStr: "1904",
    location: "Sialkot",
    sittingContext: "Address to the Community during the Visit to Sialkot",
    title: "Brotherhood, Mutual Love, and Unity of the Jama'at",
    urduTitle: "باہمی اخوت، پیار اور جماعت کی وحدت",
    urduText: "تم آپس میں ایسے بن جاؤ جیسے ایک وجود کے اعضاء۔ اگر ایک عضو کو درد ہو تو سارا جسم بے چین ہو جاتا ہے۔ آپس کے کینے، حسد اور رنجشوں کو مٹا دو اور خدا کے بندوں کے ساتھ ہمدردی کا سلوک کرو۔ یہی وہ چیز ہے جو جماعت کو دنیا میں ایک روشن نشان بنائے گی۔",
    englishTranslation: "Become among yourselves like the limbs of a single body. If one limb experiences pain, the entire body is consumed by restlessness. Eradicate mutual grievances, jealousy, and malice, and treat the servants of God with heartfelt sympathy. This alone will make this community a luminous sign throughout the world.",
    topics: ["brotherhood", "unity", "love", "community", "compassion", "jamaat", "اخوت", "وحدت", "محبت", "ہمدردی", "جماعت"],
    url: "https://www.alislam.org/book/malfuzat-volume-5/",
    scribe: "Hazrat Mufti Muhammad Sadiq (ra)",
    periodicalSource: "Al-Hakam, 1904"
  },

  // ── VOLUME 6 ─────────────────────────────────────────────────────────────
  {
    id: "malfuzat-v6-nature-of-sin",
    volume: 6,
    pageNum: 78,
    dateStr: "1904",
    location: "Lahore",
    sittingContext: "Discourse on Spiritual Maladies and Istighfar",
    title: "The Reality of Sin and the Protective Shield of Istighfar",
    urduTitle: "گناہ کی حقیقت اور استغفار کی حفاظتی طاقت",
    urduText: "استغفار دراصل ایک سپر ہے جو انسان کو گناہ کے زہر اور آفات سے محفوظ رکھتی ہے۔ گناہ ایک زہر ہے جو باطن کو ہلاک کر دیتا ہے، اور استغفار اس کا تریاق ہے۔ استغفار کے معنی ہیں کہ انسان اپنی کمزوری کا اعتراف کر کے خدا کی پناہ مانگے۔",
    englishTranslation: "Istighfar is in truth a protective shield that guards man from the poison of sin and spiritual catastrophes. Sin is a venom that destroys the inner soul, and Istighfar is its supreme antidote. Istighfar signifies that recognizing one's frailty, a person seeks refuge in the fortress of God's protection.",
    topics: ["sin", "istighfar", "forgiveness", "repentance", "spiritual cure", "استغفار", "توبہ", "گناہ", "مغفرت", "اصلاح"],
    url: "https://www.alislam.org/book/malfuzat-volume-6/",
    scribe: "Hazrat Maulvi Abdul Karim Sialkoti (ra)",
    periodicalSource: "Al-Badr, 1904"
  },

  // ── VOLUME 7 ─────────────────────────────────────────────────────────────
  {
    id: "malfuzat-v7-love-of-god",
    volume: 7,
    pageNum: 215,
    dateStr: "1905",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Discourse on the Ultimate Purpose of Human Creation",
    title: "True Divine Love and Renunciation of Worldly Idols",
    urduTitle: "خدا کی سچی محبت اور دنیاوی بتوں کی بیزاری",
    urduText: "جب تک انسان اپنے تمام دنیاوی معبودوں کو دل سے نہ نکالے، تب تک خدا کی سچی محبت دل میں داخل نہیں ہو سکتی۔ انسان کو چاہیے کہ وہ خدا کو اس کی تمام صفات کے ساتھ پہچانے اور اپنی تمام امیدیں صرف اسی کی ذات سے وابستہ کرے۔",
    englishTranslation: "Until a person completely expels all worldly false deities from their heart, true divine love can never enter. Man must recognize God Almighty with all His divine attributes and tie every aspiration exclusively to His exalted Being.",
    topics: ["love of god", "spiritual purpose", "tawheed", "worship", "faith", "خدا کی محبت", "توحید", "عبادت", "معرفت الہی"],
    url: "https://www.alislam.org/book/malfuzat-volume-7/",
    scribe: "Hazrat Mufti Muhammad Sadiq (ra)",
    periodicalSource: "Al-Hakam, 1905"
  },

  // ── VOLUME 8 ─────────────────────────────────────────────────────────────
  {
    id: "malfuzat-v8-quran-supremacy",
    volume: 8,
    pageNum: 45,
    dateStr: "1905",
    location: "Delhi",
    sittingContext: "Address regarding Scriptural Preservation and Guidance",
    title: "The Holy Qur'an: The Unmatched and Everlasting Guidance",
    urduTitle: "قرآن مجید کی عظمت اور دائمی رہنمائی",
    urduText: "قرآن مجید تمام آسمانی کتابوں پر مہیمن اور خاتم ہے۔ اس کی تعلیمات ہر زمانے کی ضرورتوں کو پورا کرتی ہیں۔ جو شخص قرآن کو چھوڑ کر کسی اور طرف جائے گا وہ ہلاک ہو جائے گا۔ ہمارا فرض ہے کہ ہم قرآن کے معارف کو دنیا میں پھیلائیں۔",
    englishTranslation: "The Holy Qur'an is the supreme guardian (Muhaymin) and seal of all heavenly scriptures. Its pristine teachings cater to the evolving needs of every era. Whoever abandons the Qur'an and seeks elsewhere will perish spiritually. Our solemn duty is to propagate its treasures of knowledge to the four corners of the earth.",
    topics: ["quran", "scripture", "guidance", "muhaymin", "revelation", "قرآن", "قرآن مجید", "کتاب اللہ", "ہدایت"],
    url: "https://www.alislam.org/book/malfuzat-volume-8/",
    scribe: "Hazrat Mufti Muhammad Sadiq (ra)",
    periodicalSource: "Al-Badr, 1905"
  },

  // ── VOLUME 9 ─────────────────────────────────────────────────────────────
  {
    id: "malfuzat-v9-honesty-wealth",
    volume: 9,
    pageNum: 182,
    dateStr: "1906",
    location: "Qadian Dar-ul-Aman",
    sittingContext: "Admonition on Commerce, Financial Purity, and Zakat",
    title: "Moral Integrity in Financial Dealings and Voluntary Sacrifice",
    urduTitle: "مالی معاملات میں دیانت داری اور مالی قربانی",
    urduText: "تجارت اور لین دین میں دیانت داری ایمان کا لازمی حصہ ہے۔ جو شخص بددیانتی کرتا ہے وہ خدا کی نظر سے گر جاتا ہے۔ مالی قربانی کے ذریعے انسان کا دل پاک ہوتا ہے اور اس کے مال میں برکت پیدا ہوتی ہے۔",
    englishTranslation: "Integrity in commerce and financial dealings is an indispensable constituent of faith. Whoever acts dishonestly forfeits favor in the sight of God. Through financial sacrifice in the cause of Allah, the human heart is purified and divine blessing is infused into one's wealth.",
    topics: ["financial sacrifice", "honesty", "commerce", "zakat", "infaq", "integrity", "دیانت داری", "مالی قربانی", "زکوٰۃ", "انفاق", "تجارت"],
    url: "https://www.alislam.org/book/malfuzat-volume-9/",
    scribe: "Hazrat Mufti Muhammad Sadiq (ra)",
    periodicalSource: "Al-Hakam, 1906"
  },

  // ── VOLUME 10 ────────────────────────────────────────────────────────────
  {
    id: "malfuzat-v10-final-admonition",
    volume: 10,
    pageNum: 450,
    dateStr: "May 1908",
    location: "Lahore (Ahmadiyya Buildings)",
    sittingContext: "Final Discourses and Exhortations prior to Demise",
    title: "Final Counsel: Steadfastness, Sincerity, and Prayer",
    urduTitle: "آخری وصایا اور نصائح: استقامت، اخلاص اور دعا",
    urduText: "میری جماعت یاد رکھے کہ تمہاری اصل طاقت دعاؤں میں ہے۔ دنیاوی اسباب پر تکیہ نہ کرو بلکہ ہر معاملے میں خدا کے حضور جھکو۔ اگر تم خدا کے ہو جاؤ گے تو خدا تمہارا ہو جائے گا اور کوئی طاقت تمہیں نقصان نہیں پہنچا سکے گی۔",
    englishTranslation: "Let my Community remember that your true, invincible strength lies in supplications. Do not place your ultimate reliance on material instruments; rather, in every circumstance, prostrate before God Almighty. If you become entirely devoted to God, God will be yours, and no earthly power will ever be able to harm you.",
    topics: ["final counsel", "steadfastness", "prayer", "reliance on god", "jamaat", "wasiyyat", "آخری وصیت", "استقامت", "دعا", "توکل", "اخلاص"],
    url: "https://www.alislam.org/book/malfuzat-volume-10/",
    scribe: "Hazrat Mufti Muhammad Sadiq (ra)",
    periodicalSource: "Al-Badr / Al-Hakam, May 1908"
  }
];

/**
 * Searches the Malfuzat Catalog across English, transliterated, and Urdu terms.
 */
export function searchMalfuzat(query: string): MalfuzatResult[] {
  if (!query || !query.trim()) return [];

  const rawClean = query.trim().toLowerCase();
  const normUrduQuery = normalizeKhazainText(query);
  const queryTokens = rawClean.split(/\s+/).filter(t => t.length >= 2);

  // Check volume specific queries (e.g. "volume 3", "vol 1", "جلد ۳", "جلد اول")
  const volMatch = query.match(/(?:volume|vol|جلد)\s*([0-9]{1,2})/i);
  const targetVol = volMatch ? parseInt(volMatch[1], 10) : null;

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

  const resultsWithScore = MALFUZAT_CATALOG.map((entry) => {
    let score = 0;

    // Direct volume match bonus
    if (targetVol && entry.volume === targetVol) {
      score += 40;
    }

    const normUrduText = normalizeKhazainText(entry.urduText);
    const normUrduTitle = normalizeKhazainText(entry.urduTitle);
    const titleLower = entry.title.toLowerCase();
    const translationLower = entry.englishTranslation.toLowerCase();
    const locationLower = entry.location.toLowerCase();
    const dateLower = entry.dateStr.toLowerCase();

    // 1. Direct raw query phrase match
    if (titleLower.includes(rawClean)) score += 30;
    if (translationLower.includes(rawClean)) score += 20;

    // 2. Normalized Urdu matching
    if (normUrduQuery && normUrduQuery.length >= 2) {
      if (normUrduTitle.includes(normUrduQuery)) score += 35;
      if (normUrduText.includes(normUrduQuery)) score += 25;
    }

    // 3. Token level matching
    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 10;
      if (translationLower.includes(token)) score += 5;
      if (locationLower.includes(token)) score += 8;
      if (dateLower.includes(token)) score += 8;
      if (entry.topics.some(t => t.toLowerCase() === token)) score += 12;
    }

    // 4. Theological Topic expansion matching
    for (const term of Array.from(expandedTerms)) {
      if (term.length < 2) continue;
      if (entry.topics.some(t => t.toLowerCase().includes(term))) {
        score += 15;
      }
      if (normUrduText.includes(term)) {
        score += 12;
      }
    }

    return { entry, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.entry);

  return resultsWithScore;
}
