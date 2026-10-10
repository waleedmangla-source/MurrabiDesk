// Live Reader Library & Telemetry Data Models

export interface BookItem {
  id: string;
  title: string;
  urduTitle?: string;
  author: string;
  language: 'urdu' | 'english' | 'arabic' | 'other';
  category: 'ruhani-khazain' | 'english-classics' | 'custom';
  pdfUrl: string;
  volume?: number;
  year?: string;
  description?: string;
  totalPages?: number;
  isCustom?: boolean;
}

export interface PageNote {
  notes: string;
  timeSpentSeconds: number;
  bookmarked?: boolean;
  updatedAt: string;
}

export interface BookTelemetry {
  totalPagesRead: number;
  totalTimeSeconds: number;
  averagePageTimeSeconds: number;
}

export interface BookProgress {
  bookId: string;
  bookTitle: string;
  lastPage: number;
  totalPages: number;
  bookmarkedPages: number[];
  telemetry: BookTelemetry;
  pages: Record<string, PageNote>; // key is page number as string
  lastSynced?: string;
}

// Generate the 23 Volumes of Ruhani Khazain
export const RUHANI_KHAZAIN_BOOKS: BookItem[] = Array.from({ length: 23 }, (_, i) => {
  const vol = i + 1;
  const volStr = vol < 10 ? `0${vol}` : `${vol}`;
  const rawUrl = `https://files.alislam.cloud/urdu/pdf/Ruhani-Khazain-Vol-${volStr}.pdf`;
  return {
    id: `ruhani-khazain-vol-${volStr}`,
    title: `Ruhani Khazain Vol. ${vol}`,
    urduTitle: `روحانی خزائن جلد ${vol}`,
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    language: "urdu",
    category: "ruhani-khazain",
    volume: vol,
    pdfUrl: `/api/pdf-proxy?url=${encodeURIComponent(rawUrl)}`,
    description: `Volume ${vol} of the monumental 23-volume theological corpus of the Promised Messiah (as).`,
  };
});

// Curated English Classical Books
export const ENGLISH_CLASSICS_BOOKS: BookItem[] = [
  {
    id: "life-of-muhammad",
    title: "Life of Muhammad",
    author: "Hazrat Mirza Bashir-ud-Deen Mahmood Ahmad (ra)",
    language: "english",
    category: "english-classics",
    year: "1952",
    pdfUrl: "/Life-of-Muhammad.pdf",
    description: "An inspiring biography of the Holy Prophet Muhammad (sa), depicting his sublime character and unmatched moral leadership.",
  },
  {
    id: "philosophy-teachings-islam",
    title: "Philosophy of the Teachings of Islam",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    language: "english",
    category: "english-classics",
    year: "1896",
    pdfUrl: `/api/pdf-proxy?url=${encodeURIComponent("https://files.alislam.cloud/english/pdf/Philosophy-of-Teachings-of-Islam.pdf")}`,
    description: "A profound discourse addressing the physical, moral, and spiritual states of man delivered at the Conference of Religions in Lahore.",
  },
  {
    id: "jesus-in-india",
    title: "Jesus in India",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    language: "english",
    category: "english-classics",
    year: "1899",
    pdfUrl: `/api/pdf-proxy?url=${encodeURIComponent("https://files.alislam.cloud/english/pdf/Jesus-in-India.pdf")}`,
    description: "Compelling historical, medical, and biblical evidence detailing Jesus’ journey to Kashmir following his survival from crucifixion.",
  },
  {
    id: "noahs-ark",
    title: "Noah's Ark (Kashti-e-Nuh)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    language: "english",
    category: "english-classics",
    year: "1902",
    pdfUrl: `/api/pdf-proxy?url=${encodeURIComponent("https://files.alislam.cloud/english/pdf/Noahs-Ark.pdf")}`,
    description: "An essential treatise outlining the moral and spiritual requisites of the Bai'at to gain protection from physical and spiritual plagues.",
  },
  {
    id: "the-will",
    title: "The Will (Al-Wasiyyat)",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    language: "english",
    category: "english-classics",
    year: "1905",
    pdfUrl: `/api/pdf-proxy?url=${encodeURIComponent("https://files.alislam.cloud/english/pdf/The-Will.pdf")}`,
    description: "Prophetic testament establishing the everlasting institution of Khilafat and the divine system of Al-Wasiyyat.",
  },
  {
    id: "essence-of-islam-vol-1",
    title: "Essence of Islam Vol. 1",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    language: "english",
    category: "english-classics",
    year: "1979",
    pdfUrl: `/api/pdf-proxy?url=${encodeURIComponent("https://files.alislam.cloud/english/pdf/Essence-of-Islam-Vol-1.pdf")}`,
    description: "Extracts from the writings of the Promised Messiah (as) covering God, attributes of the Divine, and prayer.",
  },
  {
    id: "essence-of-islam-vol-2",
    title: "Essence of Islam Vol. 2",
    author: "Hazrat Mirza Ghulam Ahmad (as)",
    language: "english",
    category: "english-classics",
    year: "1981",
    pdfUrl: `/api/pdf-proxy?url=${encodeURIComponent("https://files.alislam.cloud/english/pdf/Essence-of-Islam-Vol-2.pdf")}`,
    description: "Extracts from the Promised Messiah (as) on Revelation, Prophethood, and the Holy Quran.",
  },
];

export const ALL_DEFAULT_BOOKS: BookItem[] = [
  ...ENGLISH_CLASSICS_BOOKS,
  ...RUHANI_KHAZAIN_BOOKS,
];

// Local Storage Keys
const PROGRESS_STORAGE_PREFIX = "murabbi_live_reader_prog_";
const CUSTOM_BOOKS_KEY = "murabbi_live_reader_custom_books";
const ACTIVE_BOOK_KEY = "murabbi_live_reader_active_book_id";

export function loadBookProgress(bookId: string): BookProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${PROGRESS_STORAGE_PREFIX}${bookId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveBookProgress(bookId: string, progress: BookProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${PROGRESS_STORAGE_PREFIX}${bookId}`, JSON.stringify(progress));
  } catch (err) {
    console.error("Failed to save book progress locally:", err);
  }
}

export function getAllInProgressBooks(): BookProgress[] {
  if (typeof window === "undefined") return [];
  const list: BookProgress[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PROGRESS_STORAGE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          list.push(parsed);
        }
      }
    }
  } catch (err) {
    console.error("Failed to load in-progress books:", err);
  }
  return list.sort((a, b) => {
    const timeA = new Date(a.lastSynced || 0).getTime();
    const timeB = new Date(b.lastSynced || 0).getTime();
    return timeB - timeA;
  });
}

export function loadCustomBooks(): BookItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_BOOKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomBook(book: BookItem): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadCustomBooks().filter((b) => b.id !== book.id);
    current.unshift(book);
    localStorage.setItem(CUSTOM_BOOKS_KEY, JSON.stringify(current));
  } catch (err) {
    console.error("Failed to save custom book:", err);
  }
}

export function getActiveBookId(): string {
  if (typeof window === "undefined") return "life-of-muhammad";
  return localStorage.getItem(ACTIVE_BOOK_KEY) || "life-of-muhammad";
}

export function setActiveBookId(bookId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_BOOK_KEY, bookId);
}

export function formatTimeSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs}h ${remMins < 10 ? "0" : ""}${remMins}m`;
  }
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
