// ─────────────────────────────────────────────────────────────────────────────
// DSGT Phase 3: Cross-Corpus Citation Graph & Snowball Traversal
// Maps scriptural, patristic, and analytical citation edges across Ahmadiyya literature
// ─────────────────────────────────────────────────────────────────────────────

export interface CitationNode {
  id: string; // e.g. "quran:4:158", "rk:vol14:masih-hindustan", "hadith:darqutni:eclipses"
  type: 'Quran' | 'RuhaniKhazain' | 'Hadith' | 'Periodical' | 'AlIslam';
  title: string;
  referenceLabel: string;
  sourceText?: string;
}

export interface CitationEdge {
  fromId: string;
  toId: string;
  relation: 'CitesScripture' | 'ExplicatesBook' | 'PropheticCorroboration' | 'HistoricalContext';
  weight: number; // 0.1 to 1.0
}

export interface CitationGraph {
  nodes: Map<string, CitationNode>;
  edges: CitationEdge[];
  inLinks: Map<string, string[]>;
  outLinks: Map<string, string[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical Cross-Corpus Citation Database
// Links foundational Quranic verses to the exact Ruhani Khazain books & Hadith
// ─────────────────────────────────────────────────────────────────────────────
const CANONICAL_CITATION_LINKS: Array<{
  quranVerse: string;
  quranSurahName: string;
  rkBook: string;
  rkVolume: number;
  hadithRef?: string;
  theme: string;
}> = [
  {
    quranVerse: "4:158",
    quranSurahName: "Al-Nisa",
    rkBook: "Izala-e-Auham",
    rkVolume: 3,
    hadithRef: "Sahih Bukhari Kitab-ut-Tafsir (Ibn Abbas: Mutawaffeeka means Mumituka)",
    theme: "Survival of crucifixion and natural death of Jesus"
  },
  {
    quranVerse: "4:158",
    quranSurahName: "Al-Nisa",
    rkBook: "Masih Hindustan Mein (Jesus in India)",
    rkVolume: 14,
    hadithRef: "Kanz-ul-Ummal (Jesus lived to 120 years)",
    theme: "Tomb in Kashmir and historical journey to India"
  },
  {
    quranVerse: "3:56",
    quranSurahName: "Al-e-Imran",
    rkBook: "Izala-e-Auham",
    rkVolume: 3,
    hadithRef: "Sahih Bukhari (Inni Mutawaffeeka)",
    theme: "Death of Jesus prior to spiritual elevation"
  },
  {
    quranVerse: "5:118",
    quranSurahName: "Al-Ma'idah",
    rkBook: "Kitab-ul-Bariyyah",
    rkVolume: 13,
    hadithRef: "Sahih Bukhari Kitab-ul-Anbiya (Ummati Ummati)",
    theme: "Jesus witnesses community deviations occurred only after his death"
  },
  {
    quranVerse: "33:41",
    quranSurahName: "Al-Ahzab",
    rkBook: "Aik Ghalti Ka Izala",
    rkVolume: 18,
    hadithRef: "Sahih Muslim (Nawas ibn Sam'an: 4x Nabiyyullah)",
    theme: "Khatam-an-Nabiyyin and reflective subordinate prophethood"
  },
  {
    quranVerse: "33:41",
    quranSurahName: "Al-Ahzab",
    rkBook: "Haqiqat-ul-Wahi",
    rkVolume: 22,
    hadithRef: "Musnad Ahmad (Hazrat Aisha: Say Khatam-al-Anbiya)",
    theme: "Living communion through obedience to the Prophet (sa)"
  },
  {
    quranVerse: "24:56",
    quranSurahName: "Al-Nur",
    rkBook: "Al-Wasiyyat (The Will)",
    rkVolume: 20,
    hadithRef: "Musnad Ahmad (Khilafat on the precept of prophethood)",
    theme: "Ayat-ul-Istikhlaf and permanence of Khilafat"
  },
  {
    quranVerse: "2:187",
    quranSurahName: "Al-Baqarah",
    rkBook: "Barakat-ud-Dua",
    rkVolume: 6,
    hadithRef: "Jami at-Tirmidhi (Dua is the essence of worship)",
    theme: "Philosophy of prayer and divine responsiveness"
  },
  {
    quranVerse: "25:53",
    quranSurahName: "Al-Furqan",
    rkBook: "The British Government and Jihad",
    rkVolume: 17,
    hadithRef: "Sahih Bukhari (Abolition of physical religious war)",
    theme: "Jihad of the Pen and intellectual victory of Islam"
  },
  {
    quranVerse: "75:9-10",
    quranSurahName: "Al-Qiyamah",
    rkBook: "Nur-ul-Haq (Part 2)",
    rkVolume: 8,
    hadithRef: "Sunan Darqutni (Eclipses of Ramadan 1894)",
    theme: "Celestial signs of the Mahdi"
  },
  {
    quranVerse: "41:31",
    quranSurahName: "Ha-Mim Al-Sajdah",
    rkBook: "Barahin-e-Ahmadiyya",
    rkVolume: 1,
    hadithRef: "Sahih Bukhari (Mubashshirat remain)",
    theme: "Living revelation and descent of angels upon believers"
  }
];

/**
 * Initializes and builds the cross-corpus citation graph
 */
export function buildCitationGraph(): CitationGraph {
  const nodes = new Map<string, CitationNode>();
  const edges: CitationEdge[] = [];
  const inLinks = new Map<string, string[]>();
  const outLinks = new Map<string, string[]>();

  function addNode(node: CitationNode) {
    if (!nodes.has(node.id)) {
      nodes.set(node.id, node);
      inLinks.set(node.id, []);
      outLinks.set(node.id, []);
    }
  }

  function addEdge(fromId: string, toId: string, relation: CitationEdge['relation'], weight: number) {
    edges.push({ fromId, toId, relation, weight });
    outLinks.get(fromId)?.push(toId);
    inLinks.get(toId)?.push(fromId);
  }

  for (const item of CANONICAL_CITATION_LINKS) {
    const quranId = `quran:${item.quranVerse}`;
    const rkId = `rk:vol${item.rkVolume}:${item.rkBook.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Register Quran node
    addNode({
      id: quranId,
      type: 'Quran',
      title: `Surah ${item.quranSurahName} (${item.quranVerse})`,
      referenceLabel: `Holy Qur'an ${item.quranVerse}`
    });

    // Register Ruhani Khazain node
    addNode({
      id: rkId,
      type: 'RuhaniKhazain',
      title: `${item.rkBook} (Volume ${item.rkVolume})`,
      referenceLabel: `Ruhani Khazain Vol. ${item.rkVolume}`
    });

    // Edge: Ruhani Khazain Cites Scripture
    addEdge(rkId, quranId, 'CitesScripture', 0.95);

    // If Hadith is present, register Hadith node and edges
    if (item.hadithRef) {
      const hadithId = `hadith:${item.quranVerse}:${item.hadithRef.slice(0, 15).replace(/\s+/g, '-').toLowerCase()}`;
      addNode({
        id: hadithId,
        type: 'Hadith',
        title: item.hadithRef,
        referenceLabel: item.hadithRef.split('(')[0].trim()
      });

      // Ruhani Khazain cites Hadith
      addEdge(rkId, hadithId, 'PropheticCorroboration', 0.9);
      // Hadith explicates Qur'an
      addEdge(hadithId, quranId, 'CitesScripture', 0.85);
    }
  }

  return { nodes, edges, inLinks, outLinks };
}

// Global in-memory singleton citation graph
let globalCitationGraph: CitationGraph | null = null;
export function getCitationGraph(): CitationGraph {
  if (!globalCitationGraph) {
    globalCitationGraph = buildCitationGraph();
  }
  return globalCitationGraph;
}

/**
 * Snowball Traversal:
 * Given a set of seed document IDs or concepts, traverses outward up to maxHops
 * to discover all interconnected authoritative texts, scriptures, and treatises.
 */
export function snowballTraverse(seedIds: string[], maxHops = 2): Set<string> {
  const graph = getCitationGraph();
  const visited = new Set<string>(seedIds);
  let frontier = [...seedIds];

  for (let hop = 0; hop < maxHops; hop++) {
    const nextFrontier: string[] = [];
    for (const currentId of frontier) {
      // Traverse outLinks (e.g. book citing verses)
      const outgoing = graph.outLinks.get(currentId) || [];
      for (const targetId of outgoing) {
        if (!visited.has(targetId)) {
          visited.add(targetId);
          nextFrontier.push(targetId);
        }
      }

      // Traverse inLinks (e.g. all books citing this verse)
      const incoming = graph.inLinks.get(currentId) || [];
      for (const sourceId of incoming) {
        if (!visited.has(sourceId)) {
          visited.add(sourceId);
          nextFrontier.push(sourceId);
        }
      }
    }
    frontier = nextFrontier;
    if (frontier.length === 0) break;
  }

  return visited;
}
