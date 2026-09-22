// ─────────────────────────────────────────────────────────────────────────────
// DSGT Phase 1: Context Disambiguation & Ontological Mapping
// Implements the Theological Lesk Algorithm without AI dependencies
// ─────────────────────────────────────────────────────────────────────────────

export interface OntologicalSense {
  id: string;
  primaryConcept: string;
  urduTerms: string[];
  arabicTerms: string[];
  gloss: string; // Theological definition & explanatory context
  scripturalAnchors: string[]; // Key Qur'an / Hadith references
  coreVolumes: number[]; // Ruhani Khazain volumes focused on this sense
  domain: 'Eschatology' | 'Prophethood' | 'SpiritualPhilosophy' | 'Jihad & Peace' | 'Exegesis' | 'LivingGod';
}

export interface DisambiguatedContext {
  query: string;
  winningSense?: OntologicalSense;
  confidenceScore: number;
  detectedDomain: string;
  intent: 'ScriptureProof' | 'ObjectionRebuttal' | 'HistoricalEvent' | 'DoctrinalDefinition' | 'GeneralExploration';
  extractedKeywords: string[];
  extractedScriptureRefs: string[];
}

// Comprehensive Ahmadiyya Theological Knowledge Ontology
export const THEOLOGICAL_ONTOLOGY: OntologicalSense[] = [
  {
    id: "wafat-e-masih",
    primaryConcept: "Natural Death of Jesus Christ (وفات مسیح)",
    urduTerms: ["وفات مسیح", "عیسیٰ", "مسیح", "صلیب", "کشمیر", "مزار عیسیٰ", "مرہم عیسیٰ", "روزہ بل", "سرینگر"],
    arabicTerms: ["توفی", "متوفيك", "ما قتلوه وما صلبوه", "مات المسيح"],
    gloss: "Theological proof and historical consensus establishing that Prophet Jesus (Hazrat Isa as) survived crucifixion, was treated with the Ointment of Jesus (Marham-e-Isa), traveled to India to gather the Lost Tribes of Israel, died a natural death at 120 years, and is buried in Roza Bal, Srinagar, Kashmir. Rebuttal of physical bodily ascension to heaven.",
    scripturalAnchors: ["Surah Al-Nisa 4:158", "Surah Al-e-Imran 3:56", "Surah Al-Ma'idah 5:118", "Surah Al-Mu'minun 23:51", "Bukhari Kitab-ut-Tafsir"],
    coreVolumes: [3, 14, 13, 8],
    domain: "Eschatology"
  },
  {
    id: "khatam-e-nabuwwat",
    primaryConcept: "The Seal of Prophethood (خاتم النبیین)",
    urduTerms: ["ختم نبوت", "خاتم النبیین", "امتی نبی", "بروزی نبوت", "ظلی نبوت", "نبوت تامہ", "لا نبی بعدی"],
    arabicTerms: ["خاتم النبيين", "امتي نبي", "لا نبي بعدي", "البروز والظل"],
    gloss: "Doctrinal exposition that the Holy Prophet Muhammad (sa) is the absolute Seal of the Prophets (Khatam-an-Nabiyyin) whose spiritual authority cannot be superseded. No new law-bearing or independent prophet can ever appear. Subordinate, non-law-bearing, reflective prophethood (Ummati/Zilli/Buruzi) attained through complete spiritual obedience to the Prophet (sa) continues as a living sign of Islam.",
    scripturalAnchors: ["Surah Al-Ahzab 33:41", "Surah Al-Nisa 4:70", "Surah Al-Fatihah 1:6-7", "Sahih Bukhari Bab Fazail Sahaba"],
    coreVolumes: [18, 22, 21, 1],
    domain: "Prophethood"
  },
  {
    id: "istijabat-e-dua",
    primaryConcept: "Philosophy of Prayer & Divine Acceptance (فلسفہ و استجابت دعا)",
    urduTerms: ["دعا", "استجابت دعا", "فلسفہ دعا", "تضرع", "اضطرار", "قبولیت دعا", "برکات الدعا", "قدرت ثانیہ"],
    arabicTerms: ["الدعاء هو العبادة", "اجيب دعوة الداع", "المضطر اذا دعاه"],
    gloss: "The divine mechanics and spiritual science of supplication (Dua). Sincere prayer acts as an active spiritual force connecting human yearning to divine grace. True acceptance requires agonizing spiritual anguish (Iztirar), moral purity, and persistence, producing living miracles through hidden physical and spiritual channels.",
    scripturalAnchors: ["Surah Al-Baqarah 2:187", "Surah Al-Mu'min 40:61", "Surah Al-Naml 27:63", "Jami at-Tirmidhi Kitab-ud-Dawat"],
    coreVolumes: [6, 13, 10, 2],
    domain: "LivingGod"
  },
  {
    id: "jihad-bil-qalam",
    primaryConcept: "The True Jihad of the Pen (جہاد بالقلم)",
    urduTerms: ["جہاد", "جہاد بالقلم", "جہاد اکبر", "عدم جبر", "امن عالم", "وضع الحرب", "تلوار کا جہاد"],
    arabicTerms: ["وجاهدهم به جهادا كبيرا", "لا اكراه في الدين", "يضع الحرب", "الجهاد الاكبر"],
    gloss: "Theological clarification that aggressive warfare, coercive conversion, and violence are strictly forbidden in Islam. Military defensive combat was granted strictly during persecution to protect all houses of worship (22:40). In the modern intellectual era, the Promised Messiah (as) abolished physical warfare ('Yada'ul Harb') and revived the superior Quranic Jihad of the Pen (Jihad bil-Qalam).",
    scripturalAnchors: ["Surah Al-Furqan 25:53", "Surah Al-Hajj 22:40", "Surah Al-Baqarah 2:257", "Sahih Bukhari Kitab Ahadith al-Anbiya"],
    coreVolumes: [17, 14, 6, 4],
    domain: "Jihad & Peace"
  },
  {
    id: "eclipses-mahdi",
    primaryConcept: "Celestial Signs of the Mahdi (علامات خسوف و کسوف)",
    urduTerms: ["کسوف", "خسوف", "رمضان", "دارقطنی", "چاند گرہن", "سورج گرہن", "نشان آسمانی", "علامات ظہور"],
    arabicTerms: ["ان لمهدينا آيتين", "خسف القمر", "كسفت الشمس", "دارقطني"],
    gloss: "The grand celestial prophecy recorded in Sunan Darqutni: the occurrence of lunar and solar eclipses in the holy month of Ramadan on specific appointed dates (the moon on the 13th and the sun on the 28th) as a sign of the Mahdi. Miraculously fulfilled in Ramadan 1311 AH (1894 CE Eastern Hemisphere, 1895 CE Western Hemisphere) following Hazrat Mirza Ghulam Ahmad's (as) divine proclamation.",
    scripturalAnchors: ["Surah Al-Qiyamah 75:9-10", "Sunan Darqutni Kitab-ul-Eidain"],
    coreVolumes: [8, 22, 23, 7],
    domain: "Eschatology"
  },
  {
    id: "khilafat-ala-minhaj",
    primaryConcept: "Khilafat upon the Precept of Prophethood (خلافت علی منہاج النبوۃ)",
    urduTerms: ["خلافت", "خلافت راشدہ", "قدرت ثانیہ", "الوصیت", "نظام خلافت", "خلیفۃ المسیح", "منہاج النبوۃ"],
    arabicTerms: ["خلافة على منهاج النبوة", "ليستخلفنهم في الارض", "الخلافة الراشدة"],
    gloss: "The institution of spiritual succession established by God Almighty to preserve, unify, and expand the divine mission of a Prophet after his departure. Established upon the demise of the Promised Messiah (as) in 1908, the Ahmadiyya Khilafat represents the promised Second Manifestation of Divine Power (Qudrat-e-Thaniyya) foretold in Surah Al-Nur (Ayat-ul-Istikhlaf).",
    scripturalAnchors: ["Surah Al-Nur 24:56", "Musnad Ahmad ibn Hanbal"],
    coreVolumes: [20, 6, 17],
    domain: "Prophethood"
  },
  {
    id: "divine-communion-revelation",
    primaryConcept: "Living Revelation & Divine Communion (وحی و الہام)",
    urduTerms: ["وحی", "الہام", "مکالمہ مخاطبہ الہیہ", "رویا", "مبشرات", "کشف", "زندہ خدا", "صداقت اسلام"],
    arabicTerms: ["تتنزل عليهم الملائكة", "ما كان لبشر ان يكلمه الله", "المبشرات"],
    gloss: "Ahmadiyya theological axiom that God Almighty speaks to righteous believers today just as He spoke in antiquity. Islam is a living faith where total obedience to the Holy Prophet Muhammad (sa) unlocks direct divine converse (Mukalama-o-Mukhawtaba Ilahiyya), prophetic visions, and empirical miracles.",
    scripturalAnchors: ["Surah Ha-Mim Al-Sajdah 41:31", "Surah Al-Shura 42:52", "Sahih Bukhari Kitab-ut-Ta'bir"],
    coreVolumes: [1, 22, 3, 21],
    domain: "LivingGod"
  }
];

// Stopwords for cleaner theological tokenization
const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did",
  "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have",
  "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into",
  "is", "it", "its", "itself", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on",
  "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she",
  "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then",
  "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
  "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you",
  "your", "yours", "yourself", "yourselves"
]);

/**
 * Tokenizes text into normalized lowercase alphanumeric words
 */
export function tokenizeQuery(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2 && !STOPWORDS.has(t));
}

/**
 * Detects specific scripture references like "4:158", "Surah Al-Nisa 158", "33:41"
 */
export function extractScriptureReferences(query: string): string[] {
  const refs: string[] = [];
  // Match chapter:verse patterns (e.g. 4:158, 24:56)
  const digitPattern = /\b([0-9]{1,3}):([0-9]{1,3})\b/g;
  let match;
  while ((match = digitPattern.exec(query)) !== null) {
    refs.push(`${match[1]}:${match[2]}`);
  }

  // Match Surah names with verse numbers
  const surahPattern = /\b(?:surah|surat|chapter)\s+([a-zA-Z\-]+)\s*([0-9]{1,3})?\b/gi;
  while ((match = surahPattern.exec(query)) !== null) {
    refs.push(match[0].trim());
  }

  return refs;
}

/**
 * The Theological Lesk Algorithm:
 * Evaluates the intersection overlap between the query context and the ontological gloss definitions.
 */
export function disambiguateTheologicalContext(rawQuery: string): DisambiguatedContext {
  const cleanQuery = rawQuery.trim();
  const tokens = tokenizeQuery(cleanQuery);
  const scriptureRefs = extractScriptureReferences(cleanQuery);

  // Classify query intent using deterministic linguistic cues
  let intent: DisambiguatedContext['intent'] = 'GeneralExploration';
  const queryLower = cleanQuery.toLowerCase();
  
  if (scriptureRefs.length > 0 || queryLower.includes("verse") || queryLower.includes("ayat") || queryLower.includes("proof")) {
    intent = 'ScriptureProof';
  } else if (queryLower.includes("objection") || queryLower.includes("allegation") || queryLower.includes("refut") || queryLower.includes("rebut") || queryLower.includes("contra")) {
    intent = 'ObjectionRebuttal';
  } else if (queryLower.includes("date") || queryLower.includes("year") || queryLower.includes("when") || queryLower.includes("eclipse") || queryLower.includes("history")) {
    intent = 'HistoricalEvent';
  } else if (queryLower.includes("what is") || queryLower.includes("define") || queryLower.includes("meaning") || queryLower.includes("concept")) {
    intent = 'DoctrinalDefinition';
  }

  // If no tokens, return default
  if (tokens.length === 0) {
    return {
      query: cleanQuery,
      confidenceScore: 0,
      detectedDomain: 'General',
      intent,
      extractedKeywords: [],
      extractedScriptureRefs: scriptureRefs
    };
  }

  let bestSense: OntologicalSense | undefined = undefined;
  let highestOverlap = 0;

  for (const sense of THEOLOGICAL_ONTOLOGY) {
    let overlapScore = 0;
    const glossTokens = new Set(tokenizeQuery(sense.gloss));
    const allUrduTokens = new Set(sense.urduTerms.flatMap(u => tokenizeQuery(u)));
    const allArabicTokens = new Set(sense.arabicTerms.flatMap(a => tokenizeQuery(a)));
    const anchorTokens = new Set(sense.scripturalAnchors.flatMap(s => tokenizeQuery(s)));

    for (const token of tokens) {
      // Direct Urdu / Arabic term match is weighted heavily (3x)
      if (allUrduTokens.has(token) || allArabicTokens.has(token)) {
        overlapScore += 3.5;
      }
      // Gloss definition match (1x)
      if (glossTokens.has(token)) {
        overlapScore += 1.0;
      }
      // Scriptural anchor match (2x)
      if (anchorTokens.has(token)) {
        overlapScore += 2.0;
      }
      // Substring check in primary concept (2x)
      if (sense.primaryConcept.toLowerCase().includes(token)) {
        overlapScore += 2.5;
      }
    }

    // Check scripture reference matches
    for (const ref of scriptureRefs) {
      if (sense.scripturalAnchors.some(a => a.includes(ref))) {
        overlapScore += 4.0;
      }
    }

    if (overlapScore > highestOverlap) {
      highestOverlap = overlapScore;
      bestSense = sense;
    }
  }

  // Calculate normalized confidence score (0 to 1)
  const confidenceScore = tokens.length > 0 ? Math.min(1.0, highestOverlap / (tokens.length * 2.5)) : 0;

  return {
    query: cleanQuery,
    winningSense: bestSense,
    confidenceScore: parseFloat(confidenceScore.toFixed(3)),
    detectedDomain: bestSense?.domain || 'General Theological Study',
    intent,
    extractedKeywords: tokens,
    extractedScriptureRefs: scriptureRefs
  };
}
