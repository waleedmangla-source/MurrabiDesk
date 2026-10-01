// The Essence of Islam (Volumes 1-5) Data Models & Helpers
// Comprehensive thematic compendium of Ruhani Khazain writings

export interface EssenceResult {
  id: string;
  volume: number; // 1 to 5
  volumeRoman: string; // "I" to "V"
  pageNum: number | string; // Printed page number
  pdfPage: number; // 1-based physical page in PDF
  title: string;
  topic: string;
  sourceTreatise?: string; // Cited Ruhani Khazain treatise
  excerpt: string;
  fullText?: string;
  headings?: string[];
  topics: string[];
  pdfUrl: string;
  sourceUrl: string;
  relevanceScore?: number;
}

export interface EssenceVolumeMeta {
  volume: number;
  volumeRoman: string;
  title: string;
  author: string;
  translator: string;
  sourcePdfUrl: string;
  sourceUrl: string;
  totalPdfPages: number;
  totalPages: number;
  topics: string[];
}

/**
 * Generates the official Al Islam CDN PDF URL for The Essence of Islam with exact #page=N jumping.
 * Note: Volume 3 uses lowercase 'essence-3.pdf' on CDN.
 */
export function getEssencePdfUrl(volume: number, pageNum?: number | string, pdfPage?: number): string {
  const filename = volume === 3 ? 'essence-3.pdf' : `Essence-${volume}.pdf`;
  const baseUrl = `https://files.alislam.cloud/pdf/${filename}`;
  const targetPage = pdfPage || (typeof pageNum === 'number' ? pageNum : 1);
  return `${baseUrl}#page=${targetPage}`;
}

export const ESSENCE_VOLUMES_METADATA: Record<number, EssenceVolumeMeta> = {
  1: {
    volume: 1,
    volumeRoman: "I",
    title: "The Essence of Islam – Volume I",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    translator: "Muhammad Zafrulla Khan",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Essence-1.pdf",
    sourceUrl: "https://www.alislam.org/book/essence-islam-volume-1/",
    totalPdfPages: 543,
    totalPages: 507,
    topics: ["Islam", "Allah the Exalted", "The Holy Prophet (sa)", "The Holy Quran"]
  },
  2: {
    volume: 2,
    volumeRoman: "II",
    title: "The Essence of Islam – Volume II",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    translator: "Muhammad Zafrulla Khan",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Essence-2.pdf",
    sourceUrl: "https://www.alislam.org/book/essence-islam-volume-2/",
    totalPdfPages: 505,
    totalPages: 493,
    topics: ["Prayer", "Remembrance of God", "Angels", "Destiny", "Life After Death", "Repentance", "Patience"]
  },
  3: {
    volume: 3,
    volumeRoman: "III",
    title: "The Essence of Islam – Volume III",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    translator: "Muhammad Zafrulla Khan",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/essence-3.pdf",
    sourceUrl: "https://www.alislam.org/book/essence-islam-volume-3/",
    totalPdfPages: 487,
    totalPages: 471,
    topics: ["Natural, Moral and Spiritual States of Man", "Faith and Insight", "Prophethood in Islam", "The Messiah and Second Coming", "Dajjal", "Women", "The Veil"]
  },
  4: {
    volume: 4,
    volumeRoman: "IV",
    title: "The Essence of Islam – Volume IV",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    translator: "Muhammad Zafrulla Khan",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Essence-4.pdf",
    sourceUrl: "https://www.alislam.org/book/essence-islam-volume-4/",
    totalPdfPages: 334,
    totalPages: 288,
    topics: ["Status and Claim of the Promised Messiah", "Signs and Prophecies", "Instructions for the Jama'at", "Ahmadiyya Community"]
  },
  5: {
    volume: 5,
    volumeRoman: "V",
    title: "The Essence of Islam – Volume V",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    translator: "Muhammad Zafrulla Khan",
    sourcePdfUrl: "https://files.alislam.cloud/pdf/Essence-5.pdf",
    sourceUrl: "https://www.alislam.org/book/essence-islam-volume-5/",
    totalPdfPages: 240,
    totalPages: 226,
    topics: ["The Living Miracle of the Quran", "Jihad", "Religious Tolerance", "Spiritual Realities"]
  }
};
