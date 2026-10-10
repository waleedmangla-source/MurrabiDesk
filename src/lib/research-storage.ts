import { SearchFilters } from './research-sources';

export interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: number;
  filters: SearchFilters;
  searchMode: 'contextual' | 'verbatim';
  resultCounts?: {
    all: number;
    quran: number;
    ahadith: number;
    literature: number;
    articles: number;
    audios: number;
    videos: number;
  };
}

export type BookmarkCategory = 
  | 'quran'
  | 'ahadith'
  | 'khazain'
  | 'malfuzat'
  | 'tazkirah'
  | 'essence'
  | 'books'
  | 'articles'
  | 'audios'
  | 'videos';

export interface ResearchBookmarkItem {
  id: string; // unique key (e.g. quran-2-184, rk-1-12, hadith-bukhari-3)
  category: BookmarkCategory;
  title: string;
  subtitle?: string;
  snippet?: string;
  citationText?: string;
  url?: string;
  metadata?: Record<string, any>;
  savedAt: number;
}

export interface ResearchDriveData {
  history: SearchHistoryEntry[];
  bookmarks: ResearchBookmarkItem[];
}

const HISTORY_LOCAL_KEY = 'murabbi_research_history_v1';
const BOOKMARKS_LOCAL_KEY = 'murabbi_research_bookmarks_v1';

export function getLocalResearchHistory(): SearchHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local research history', e);
    return [];
  }
}

export function saveLocalResearchHistory(history: SearchHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_LOCAL_KEY, JSON.stringify(history.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to save local research history', e);
  }
}

export function getLocalResearchBookmarks(): ResearchBookmarkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local research bookmarks', e);
    return [];
  }
}

export function saveLocalResearchBookmarks(bookmarks: ResearchBookmarkItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOOKMARKS_LOCAL_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.warn('Failed to save local research bookmarks', e);
  }
}

let syncTimeout: NodeJS.Timeout | null = null;

/**
 * Triggers background upload to Google Drive for history and/or bookmarks.
 * Debounced to prevent excessive Google Drive API calls.
 */
export function triggerDriveSync(payload: { history?: SearchHistoryEntry[]; bookmarks?: ResearchBookmarkItem[] }) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('google_refresh_token_encrypted');
  if (!token || localStorage.getItem('murabbi_guest_mode') === 'true') {
    return;
  }

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      await fetch('/api/brain/research-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-murabbi-token': token
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('[Research Storage] Google Drive sync error:', err);
    }
  }, 1000);
}

/**
 * Fetches latest history and bookmarks from Google Drive and merges them with localStorage.
 */
export async function syncResearchFromDrive(): Promise<{
  history: SearchHistoryEntry[];
  bookmarks: ResearchBookmarkItem[];
}> {
  const localHistory = getLocalResearchHistory();
  const localBookmarks = getLocalResearchBookmarks();

  if (typeof window === 'undefined') {
    return { history: localHistory, bookmarks: localBookmarks };
  }

  const token = localStorage.getItem('google_refresh_token_encrypted');
  if (!token || localStorage.getItem('murabbi_guest_mode') === 'true') {
    return { history: localHistory, bookmarks: localBookmarks };
  }

  try {
    const res = await fetch('/api/brain/research-sync', {
      method: 'GET',
      headers: {
        'x-murabbi-token': token
      }
    });

    if (!res.ok) {
      return { history: localHistory, bookmarks: localBookmarks };
    }

    const data: ResearchDriveData = await res.json();
    const driveHistory = Array.isArray(data.history) ? data.history : [];
    const driveBookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : [];

    // Merge history (union by query or id, sort by timestamp desc)
    const historyMap = new Map<string, SearchHistoryEntry>();
    [...driveHistory, ...localHistory].forEach(item => {
      const key = `${item.query.trim().toLowerCase()}_${item.searchMode}`;
      const existing = historyMap.get(key);
      if (!existing || item.timestamp > existing.timestamp) {
        historyMap.set(key, item);
      }
    });
    const mergedHistory = Array.from(historyMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);

    // Merge bookmarks (union by id, sort by savedAt desc)
    const bookmarkMap = new Map<string, ResearchBookmarkItem>();
    [...driveBookmarks, ...localBookmarks].forEach(item => {
      const existing = bookmarkMap.get(item.id);
      if (!existing || item.savedAt > existing.savedAt) {
        bookmarkMap.set(item.id, item);
      }
    });
    const mergedBookmarks = Array.from(bookmarkMap.values())
      .sort((a, b) => b.savedAt - a.savedAt);

    // Update local storage with merged truth
    saveLocalResearchHistory(mergedHistory);
    saveLocalResearchBookmarks(mergedBookmarks);

    return { history: mergedHistory, bookmarks: mergedBookmarks };
  } catch (err) {
    console.warn('[Research Storage] Failed to fetch from drive:', err);
    return { history: localHistory, bookmarks: localBookmarks };
  }
}
