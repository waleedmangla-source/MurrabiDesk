"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Loader2, 
  BookOpen, 
  Search, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Wand2, 
  ChevronDown, 
  Bookmark, 
  BookText, 
  ExternalLink, 
  Globe, 
  X, 
  Sparkles,
  Library,
  CheckCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { URDU_STOPWORDS } from '@/lib/urdu-stopwords';
import AIBlobIcon from '@/components/AIBlobIcon';
import { 
  KHAZAIN_BOOKS, 
  ENGLISH_BOOKS,
  getBookForPage, 
  normalizeKhazainText, 
  normalizeWithIndexMap 
} from '@/lib/khazain-data';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

import { 
  parsePageToBlocks, 
  PageBlock, 
  Couplet 
} from '@/lib/poetry-parser';

interface SelectedWordInfo {
  word: string;
  translit?: string;
  englishMeaning?: string;
  rekhtaUrl: string;
  googleUrl: string;
  loading?: boolean;
}

interface SearchResult {
  volume: number;
  pageNum: number;
  bookTitle: string;
  bookUrduTitle: string;
  snippetBefore: string;
  matchedSlice: string;
  snippetAfter: string;
  matchedTerm: string;
  isExactPhrase: boolean;
}

function toUrduNumerals(num: number | string): string {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => urduDigits[parseInt(d, 10)]);
}

function highlightSegments(text: string, searchTerms: string[]) {
  if (!searchTerms || searchTerms.length === 0) return [{ text, isMatch: false }];

  const { norm, indexMap } = normalizeWithIndexMap(text);
  const matches: { start: number; end: number; term: string }[] = [];

  for (const term of searchTerms) {
    const normTerm = normalizeKhazainText(term);
    if (!normTerm || normTerm.length < 2) continue;

    let pos = 0;
    while ((pos = norm.indexOf(normTerm, pos)) !== -1) {
      const rawStart = indexMap[pos] ?? pos;
      const endPosInNorm = Math.min(indexMap.length - 1, pos + normTerm.length - 1);
      const rawEnd = (indexMap[endPosInNorm] ?? rawStart + normTerm.length - 1) + 1;
      matches.push({ start: rawStart, end: rawEnd, term });
      pos += normTerm.length;
    }
  }

  if (matches.length === 0) return [{ text, isMatch: false }];

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Deduplicate and merge overlapping intervals
  const merged: { start: number; end: number }[] = [];
  for (const m of matches) {
    if (merged.length === 0) {
      merged.push({ start: m.start, end: m.end });
    } else {
      const last = merged[merged.length - 1];
      if (m.start <= last.end) {
        last.end = Math.max(last.end, m.end);
      } else {
        merged.push({ start: m.start, end: m.end });
      }
    }
  }

  const segments: { text: string; isMatch: boolean }[] = [];
  let cursor = 0;
  for (const m of merged) {
    if (m.start > cursor) {
      segments.push({ text: text.slice(cursor, m.start), isMatch: false });
    }
    segments.push({ text: text.slice(m.start, m.end), isMatch: true });
    cursor = m.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), isMatch: false });
  }

  return segments;
}

export default function RuhaniKhazainReader() {
  const [volumes, setVolumes] = useState<number[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<number | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [pageInput, setPageInput] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown states for each volume book breakdown
  const [expandedVolumes, setExpandedVolumes] = useState<Record<number, boolean>>({ 1: true });

  // Language toggle for reader: 'urdu' | 'english' | 'test'
  const [bookLanguage, setBookLanguage] = useState<'urdu' | 'english' | 'test'>('urdu');
  const [selectedEnglishBookId, setSelectedEnglishBookId] = useState<string | null>('philosophy-teachings-islam');
  
  // OCR & PDF States for Test Tab
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [currentOcrText, setCurrentOcrText] = useState('');
  const [pdfNumPages, setPdfNumPages] = useState<number | null>(null);
  const [pdfPageNumber, setPdfPageNumber] = useState(1);

  const handlePdfRenderSuccess = async () => {
    // Small delay to ensure the canvas is fully mounted in the DOM
    setTimeout(async () => {
      const canvas = document.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
      if (!canvas) return;
  
      setIsOcrLoading(true);
      setCurrentOcrText('');
      
      try {
        const imageBase64 = canvas.toDataURL('image/jpeg');
        const res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64 }),
        });
        const data = await res.json();
        if (data.text) {
          setCurrentOcrText(data.text);
        } else {
          setCurrentOcrText('OCR Failed or returned empty text.');
        }
      } catch (err) {
        console.error('OCR error:', err);
        setCurrentOcrText('Error connecting to OCR API.');
      } finally {
        setIsOcrLoading(false);
      }
    }, 100);
  };


  // Secondary Sidebar Collection Dropdown & Book Search Filter
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(true);
  const [sidebarBookSearch, setSidebarBookSearch] = useState<string>('');

  // Suggest a Book modal state
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestBookName, setSuggestBookName] = useState('');
  const [suggestBookUrl, setSuggestBookUrl] = useState('');
  const [suggestSubmitted, setSuggestSubmitted] = useState(false);

  const handleSuggestBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestBookName.trim() || !suggestBookUrl.trim()) return;

    const newSuggestion = {
      id: Date.now().toString(),
      bookName: suggestBookName.trim(),
      bookUrl: suggestBookUrl.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('murabbi_book_suggestions') || '[]');
      existing.unshift(newSuggestion);
      localStorage.setItem('murabbi_book_suggestions', JSON.stringify(existing));
    } catch {
      // ignore localStorage errors
    }

    setSuggestSubmitted(true);
  };

  // Filtered volumes and constituent books for the secondary sidebar
  const filteredVolumeData = useMemo(() => {
    const q = sidebarBookSearch.trim().toLowerCase();
    const qNorm = normalizeKhazainText(sidebarBookSearch);

    if (!q) {
      return volumes.map(vol => ({
        vol,
        matchingBooks: KHAZAIN_BOOKS[vol] || [],
        allBooks: KHAZAIN_BOOKS[vol] || [],
        isMatchByBook: false
      }));
    }

    const list: {
      vol: number;
      matchingBooks: { title: string; urduTitle: string; pageStart: number }[];
      allBooks: { title: string; urduTitle: string; pageStart: number }[];
      isMatchByBook: boolean;
    }[] = [];

    for (const vol of volumes) {
      const books = KHAZAIN_BOOKS[vol] || [];
      const isVolMatch =
        q === String(vol) ||
        q === `vol ${vol}` ||
        q === `volume ${vol}` ||
        q === `v${vol}` ||
        `volume ${vol}`.includes(q);

      const matchingBooks = books.filter(b => {
        const enMatch = b.title.toLowerCase().includes(q);
        const urduMatch = qNorm ? normalizeKhazainText(b.urduTitle).includes(qNorm) : false;
        return enMatch || urduMatch;
      });

      if (isVolMatch || matchingBooks.length > 0) {
        list.push({
          vol,
          matchingBooks: matchingBooks.length > 0 ? matchingBooks : books,
          allBooks: books,
          isMatchByBook: matchingBooks.length > 0
        });
      }
    }

    return list;
  }, [volumes, sidebarBookSearch]);

  // Filtered English books for the secondary sidebar
  const filteredEnglishBooks = useMemo(() => {
    const q = sidebarBookSearch.trim().toLowerCase();
    if (!q) return ENGLISH_BOOKS;
    return ENGLISH_BOOKS.filter(
      b => b.title.toLowerCase().includes(q) || (b.year && b.year.includes(q))
    );
  }, [sidebarBookSearch]);

  // Pre-compiled English dictionary & Selected Word Inspector
  const [dictionary, setDictionary] = useState<Record<string, { translit?: string; meaning: string }>>({});
  const [selectedWord, setSelectedWord] = useState<SelectedWordInfo | null>(null);

  // MurrabiAI Page Context Analysis state
  const [aiData, setAiData] = useState<{
    summary?: string;
    theologicalInsight?: string;
    themes?: string[];
    hardWords?: { word: string; meaning: string; urduMeaning?: string }[];
  } | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiCache, setAiCache] = useState<Record<string, any>>({});

  // Right Panel Tab Navigation: 'ai' (MurabbiAI Context) | 'search' (Book & Library Search)
  const [activeRightTab, setActiveRightTab] = useState<'ai' | 'search'>('ai');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'volume' | 'library'>('volume');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTotalMatches, setSearchTotalMatches] = useState<number | null>(null);
  const [activeSearchTerms, setActiveSearchTerms] = useState<string[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // On-screen highlighting state
  const [highlightTerms, setHighlightTerms] = useState<string[]>([]);
  const pendingTargetPageRef = useRef<number | null>(null);

  // Dynamic font sizing to fit the 9x11 sheet of paper
  const [fontSize, setFontSize] = useState<number>(15.5);
  const innerContainerRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  // Dynamically fit text to the 9x11 aspect ratio sheet without overflow
  const fitTextToPage = useCallback(() => {
    const container = innerContainerRef.current;
    const content = textContentRef.current;
    if (!container || !content) return;

    const computed = window.getComputedStyle(container);
    const paddingTop = parseFloat(computed.paddingTop) || 0;
    const paddingBottom = parseFloat(computed.paddingBottom) || 0;
    const maxAllowedHeight = container.clientHeight - paddingTop - paddingBottom;

    if (maxAllowedHeight <= 60) return;

    let low = 10;
    let high = 21;
    let best = 14.5;

    for (let i = 0; i < 7; i++) {
      const mid = Math.round(((low + high) / 2) * 2) / 2;
      content.style.fontSize = `${mid}px`;
      
      if (content.scrollHeight <= maxAllowedHeight + 2) {
        best = mid;
        low = mid + 0.5;
      } else {
        high = mid - 0.5;
      }
    }

    content.style.fontSize = `${best}px`;
    setFontSize(best);
  }, []);

  // Load static English dictionary on mount
  useEffect(() => {
    fetch('/ruhani-khazain/dictionary-en.json')
      .then(res => res.json())
      .then(data => setDictionary(data || {}))
      .catch(err => console.warn('Could not load dictionary-en.json:', err));
  }, []);

  // Currently reading persistence in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('murabbi_reader_current');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.volume) setSelectedVolume(parsed.volume);
        if (typeof parsed.pageIndex === 'number') setCurrentPageIndex(parsed.pageIndex);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (selectedVolume !== null) {
      try {
        localStorage.setItem('murabbi_reader_current', JSON.stringify({
          volume: selectedVolume,
          pageIndex: currentPageIndex
        }));
      } catch {}
    }
  }, [selectedVolume, currentPageIndex]);

  const toggleVolumeDropdown = (vol: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedVolumes(prev => ({
      ...prev,
      [vol]: !prev[vol]
    }));
  };
  
  useEffect(() => {
    const vols = Array.from({length: 23}, (_, i) => i + 1);
    setVolumes(vols);
    setSelectedVolume(1);
  }, []);

  useEffect(() => {
    if (selectedVolume === null) return;
    
    const fetchVolume = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/ruhani-khazain/volume_${selectedVolume}.json`);
        if (!res.ok) throw new Error('Volume not found');
        const data = await res.json();
        const newPages = data.pages || [];
        setPages(newPages);

        if (pendingTargetPageRef.current !== null) {
          const targetIdx = newPages.findIndex((p: any) => p.page_num === pendingTargetPageRef.current);
          setCurrentPageIndex(targetIdx !== -1 ? targetIdx : 0);
          pendingTargetPageRef.current = null;
        } else {
          setCurrentPageIndex(0);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVolume();
  }, [selectedVolume]);

  const currentPage = pages[currentPageIndex];

  // Auto-fit text whenever the current page, volume, or page text changes
  useEffect(() => {
    fitTextToPage();
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        fitTextToPage();
      });
    }
  }, [fitTextToPage, currentPageIndex, selectedVolume, pages, currentPage?.text, highlightTerms]);

  // Re-fit text on container resize
  useEffect(() => {
    const container = innerContainerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      fitTextToPage();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [fitTextToPage]);

  // Sync pageInput with current page
  useEffect(() => {
    if (currentPage) {
      setPageInput(String(currentPage.page_num || (currentPageIndex + 1)));
    }
  }, [currentPage?.page_num, currentPageIndex]);

  // Jump to specific page number typed by user
  const handleJumpToPage = useCallback((customVal?: string) => {
    const rawVal = (customVal !== undefined ? customVal : pageInput).trim();
    const urduArabicMap: Record<string, string> = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    const cleaned = rawVal.replace(/[۰-۹٠-٩]/g, d => urduArabicMap[d] || d).replace(/[^0-9]/g, '');
    const num = parseInt(cleaned, 10);

    if (isNaN(num) || pages.length === 0) {
      if (currentPage) {
        setPageInput(String(currentPage.page_num || (currentPageIndex + 1)));
      }
      return;
    }

    // Try finding by page_num
    let targetIdx = pages.findIndex(p => p.page_num === num);
    if (targetIdx === -1) {
      // Fallback: 1-indexed clamped index
      targetIdx = Math.max(0, Math.min(pages.length - 1, num - 1));
    }

    setCurrentPageIndex(targetIdx);
    const targetPage = pages[targetIdx];
    setPageInput(String(targetPage?.page_num || (targetIdx + 1)));
  }, [pageInput, pages, currentPage, currentPageIndex]);

  // Reset selected word when navigating pages or volumes so no word is preselected on the new page
  useEffect(() => {
    setSelectedWord(null);
  }, [currentPageIndex, selectedVolume]);

  // Select a word to inspect in the right-hand panel & fetch live definition if needed
  const handleSelectWord = useCallback(async (rawWord: string) => {
    const word = rawWord.trim().replace(/[۔،؛؟!:\(\)\[\]"'\-_«»]/g, '').trim();
    if (!word) return;

    // Toggle off if clicking the already selected word
    if (selectedWord?.word === word) {
      setSelectedWord(null);
      return;
    }

    const rekhtaUrl = `https://www.rekhtadictionary.com/search?keyword=${encodeURIComponent(word)}`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(word + ' urdu meaning in english')}`;

    const localEntry = dictionary[word];
    setSelectedWord({
      word,
      translit: localEntry?.translit,
      englishMeaning: localEntry?.meaning,
      rekhtaUrl,
      googleUrl,
      loading: !localEntry?.meaning
    });

    // Make sure user sees the inspected word
    setActiveRightTab('ai');

    if (!localEntry?.meaning) {
      try {
        const res = await fetch(`/api/dictionary/lookup?word=${encodeURIComponent(word)}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedWord({
            word,
            translit: data.transliteration,
            englishMeaning: data.englishMeaning,
            rekhtaUrl: data.rekhtaUrl || rekhtaUrl,
            googleUrl: data.googleUrl || googleUrl,
            loading: false
          });
          if (data.englishMeaning) {
            setDictionary(prev => ({
              ...prev,
              [word]: { translit: data.transliteration, meaning: data.englishMeaning }
            }));
          }
        } else {
          setSelectedWord(prev => prev ? { ...prev, loading: false } : null);
        }
      } catch {
        setSelectedWord(prev => prev ? { ...prev, loading: false } : null);
      }
    }
  }, [dictionary, selectedWord]);

  // Analyze current page with MurrabiAI
  const handleAnalyzePage = useCallback(async () => {
    if (!currentPage?.text) return;

    const cacheKey = `${selectedVolume || 1}-${currentPageIndex}`;
    if (aiCache[cacheKey]) {
      setAiData(aiCache[cacheKey]);
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const pageNum = currentPage?.page_num || (currentPageIndex + 1);
      const activeBook = getBookForPage(selectedVolume || 1, pageNum);

      const res = await fetch('/api/beta/khazain-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentPage.text,
          volume: selectedVolume || 1,
          pageNum,
          bookTitle: activeBook?.title,
          bookUrduTitle: activeBook?.urduTitle
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed (${res.status})`);
      }

      const data = await res.json();
      setAiData(data);
      setAiCache(prev => ({ ...prev, [cacheKey]: data }));

      if (Array.isArray(data.hardWords) && data.hardWords.length > 0) {
        setDictionary(prev => {
          const next = { ...prev };
          data.hardWords.forEach((hw: any) => {
            if (hw.word && hw.meaning && !next[hw.word]) {
              next[hw.word] = { meaning: hw.meaning };
            }
          });
          return next;
        });
      }
    } catch (err: any) {
      console.error('[MurabbiAI Analyze error]:', err);
      setAiError(err.message || 'Failed to analyze page');
    } finally {
      setAiLoading(false);
    }
  }, [currentPage?.text, selectedVolume, currentPageIndex, aiCache]);

  // Sync AI data from cache when page changes
  useEffect(() => {
    const cacheKey = `${selectedVolume || 1}-${currentPageIndex}`;
    if (aiCache[cacheKey]) {
      setAiData(aiCache[cacheKey]);
    } else {
      setAiData(null);
    }
    setAiError(null);
  }, [selectedVolume, currentPageIndex, aiCache]);

  // Execute Search across Book or Entire Library
  const handleExecuteSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const res = await fetch('/api/ruhani-khazain/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          scope: searchScope,
          volume: selectedVolume || 1,
          limit: 100
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Search failed (${res.status})`);
      }

      const data = await res.json();
      setSearchResults(data.results || []);
      setSearchTotalMatches(data.totalMatches ?? (data.results?.length || 0));
      setActiveSearchTerms(data.searchTerms || []);

      // If matches exist, automatically highlight primary search terms on screen
      if (data.searchTerms && data.searchTerms.length > 0) {
        setHighlightTerms(data.searchTerms);
      }
    } catch (err: any) {
      console.error('[Search Error]:', err);
      setSearchError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Jump to specific search result on screen & highlight term
  const handleSelectSearchResult = (result: SearchResult) => {
    const matched = result.matchedTerm || activeSearchTerms[0];
    if (matched) {
      setHighlightTerms([matched]);
    }

    if (selectedVolume !== result.volume) {
      pendingTargetPageRef.current = result.pageNum;
      setSelectedVolume(result.volume);
    } else {
      const targetIdx = pages.findIndex(p => p.page_num === result.pageNum);
      if (targetIdx !== -1) {
        setCurrentPageIndex(targetIdx);
      }
    }
  };

  // Helper to render inline words/tokens with search highlights and vocabulary tooltips
  const renderLineContent = (content: string) => {
    if (!content) return null;

    const segments = highlightTerms.length > 0
      ? highlightSegments(content, highlightTerms)
      : [{ text: content, isMatch: false }];

    return segments.map((seg, sIdx) => {
      if (seg.isMatch) {
        return (
          <mark
            key={sIdx}
            onClick={() => {
              handleSelectWord(seg.text.trim());
              setActiveRightTab('ai');
            }}
            className="bg-amber-300 text-amber-950 font-black px-1.5 py-0.5 rounded shadow-sm ring-2 ring-amber-400/80 cursor-pointer select-text mx-0.5 transition-all inline hover:ring-amber-500 hover:bg-amber-400"
            title="Click to inspect this word in MurabbiAI"
          >
            {seg.text}
          </mark>
        );
      }

      // Non-match segment: tokenize for vocabulary tooltips & click-to-inspect
      const tokens = seg.text.split(/(\s+|[۔،؛؟!:\(\)\[\]"'\-_«»]+)/);

      return tokens.map((token, tIdx) => {
        const clean = token.trim().replace(/[۔،؛؟!:\(\)\[\]"'\-_«»]/g, '');
        if (!clean) {
          return <React.Fragment key={`${sIdx}-${tIdx}`}>{token}</React.Fragment>;
        }

        const dictEntry = dictionary[clean];
        const isSelected = selectedWord?.word === clean;

        // Word is in pre-identified vocabulary dictionary
        if (dictEntry) {
          const meaning = dictEntry.meaning;
          const translit = dictEntry.translit;
          const rekhtaUrl = `https://www.rekhtadictionary.com/search?keyword=${encodeURIComponent(clean)}`;
          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(clean + ' urdu meaning in english')}`;

          return (
            <span
              key={`${sIdx}-${tIdx}`}
              onClick={() => handleSelectWord(clean)}
              className={clsx(
                "group relative inline cursor-pointer px-0.5 rounded transition-all select-text",
                isSelected
                  ? "font-bold underline underline-offset-4 decoration-2 decoration-[var(--accent-main)] text-[var(--accent-main)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent-main)]/40"
                  : "text-black font-normal hover:bg-zinc-100/80 transition-colors"
              )}
            >
              {token}
              {/* Tooltip Bubble */}
              <span
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 md:w-72 bg-white text-zinc-900 border border-zinc-200 shadow-2xl p-3.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 text-left font-sans cursor-default pointer-events-none group-hover:pointer-events-auto select-none font-normal"
                dir="ltr"
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-lg text-zinc-900" dir="rtl">
                      {clean}
                    </span>
                    {translit && (
                      <span className="text-[11px] font-mono italic text-zinc-500">
                        ({translit})
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    Vocabulary
                  </span>
                </div>

                <p className="text-xs text-zinc-700 font-medium leading-relaxed mb-2.5">
                  {meaning}
                </p>

                <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100 text-[10px] font-bold">
                  <a
                    href={rekhtaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/60 transition-colors"
                    title="Open entry in Rekhta Dictionary"
                  >
                    <Globe size={11} />
                    <span>Rekhta</span>
                    <ExternalLink size={9} />
                  </a>
                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/60 transition-colors"
                    title="Search meaning on Google"
                  >
                    <Search size={11} />
                    <span>Google</span>
                    <ExternalLink size={9} />
                  </a>
                </div>
              </span>
            </span>
          );
        }

        // Regular word: clickable to inspect in the right-hand panel
        return (
          <span
            key={`${sIdx}-${tIdx}`}
            onClick={() => handleSelectWord(clean)}
            className={clsx(
              "cursor-pointer rounded px-0.5 transition-colors select-text text-black",
              isSelected
                ? "font-bold underline underline-offset-4 decoration-2 decoration-[var(--accent-main)] text-[var(--accent-main)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent-main)]/40"
                : "font-normal hover:bg-zinc-100/80"
            )}
          >
            {token}
          </span>
        );
      });
    });
  };

  // Helper to render text structured into prose paragraphs and authentic Urdu literature couplets
  const renderText = (text: string) => {
    if (!text) return null;

    const blocks = parsePageToBlocks(text);

    return (
      <>
        {blocks.map((block, bIdx) => {
          if (block.type === 'empty') {
            return <div key={bIdx} className="h-1.5 sm:h-2" />;
          }

          if (block.type === 'prose') {
            return (
              <p key={bIdx} className="mb-1 sm:mb-1.5 leading-[1.82] text-justify">
                {renderLineContent(block.text)}
              </p>
            );
          }

          if (block.type === 'poetry') {
            return (
              <div 
                key={bIdx} 
                className={clsx(
                  "w-full flex flex-col items-center justify-center select-text",
                  block.isEmbedded 
                    ? "my-3 sm:my-4 py-1 px-2" 
                    : "my-2 sm:my-3 px-1"
                )}
              >
                {block.couplets.map((couplet, cIdx) => {
                  // Side-by-side couplet (when original line had spaced misras)
                  if (couplet.isSideBySide) {
                    return (
                      <div
                        key={cIdx}
                        className="w-full max-w-[94%] sm:max-w-[88%] mx-auto my-1.5 sm:my-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4 text-center"
                      >
                        {/* First Misra (Right in RTL) */}
                        <div className="flex-1 w-full text-center font-serif leading-[2] tracking-normal text-black font-medium">
                          {renderLineContent(couplet.misra1)}
                        </div>

                        {/* Classical ornament */}
                        <div className="shrink-0 flex items-center justify-center opacity-40 select-none text-[10px] text-zinc-600 px-1">
                          <span>✤</span>
                        </div>

                        {/* Second Misra (Left in RTL) */}
                        {couplet.misra2 && (
                          <div className="flex-1 w-full text-center font-serif leading-[2] tracking-normal text-black font-medium">
                            {renderLineContent(couplet.misra2)}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Classic Stacked Urdu Literature Couplet (شعر / بیت)
                  return (
                    <div
                      key={cIdx}
                      className="w-full max-w-[92%] sm:max-w-[85%] mx-auto my-1 sm:my-1.5 flex flex-col items-center justify-center text-center group/couplet"
                    >
                      {/* Misra 1 (مصرعِ اوّل) */}
                      <div className="w-full text-center font-serif leading-[2] tracking-normal text-black font-medium">
                        {renderLineContent(couplet.misra1)}
                      </div>

                      {/* Misra 2 (مصرعِ ثانی) */}
                      {couplet.misra2 && (
                        <div className="w-full text-center font-serif leading-[2] tracking-normal text-black font-medium mt-0.5 sm:mt-1">
                          {renderLineContent(couplet.misra2)}
                        </div>
                      )}

                      {/* Classical Stanza Separator between couplets */}
                      {cIdx < block.couplets.length - 1 && (
                        <div className="flex items-center justify-center gap-2 my-1.5 opacity-30 select-none text-[9px] text-zinc-500">
                          <span className="w-3 sm:w-5 h-px bg-zinc-400 inline-block" />
                          <span>❦</span>
                          <span className="w-3 sm:w-5 h-px bg-zinc-400 inline-block" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }

          return null;
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-transparent">
      {/* ── Panel 1: Folder Sidebar — Desktop only (Identical to Mail Tab) ── */}
      <div className="hidden lg:flex w-[250px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20">
        {/* Sidebar Title */}
        <div className="px-5 pt-8 pb-3">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Reader
          </h1>
        </div>

        {/* Sidebar Book & Volume Search Input */}
        <div className="px-5 pb-3">
          <div className="relative">
            <input
              type="text"
              value={sidebarBookSearch}
              onChange={(e) => setSidebarBookSearch(e.target.value)}
              placeholder="Search books or volumes..."
              className="w-full px-3 py-2 pr-7 rounded-xl glass bg-white/5 border border-white/10 text-xs text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)]/50 focus:ring-1 focus:ring-[var(--accent-main)]/30 transition-all font-medium"
            />
            {sidebarBookSearch && (
              <button
                onClick={() => setSidebarBookSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--text-dim)] hover:text-white"
                title="Clear filter"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Currently Reading Header */}
        <div className="px-5 pb-4 border-b border-white/5 mb-2">
          <div className="p-3 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/20 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)]">
                Now Reading
              </span>
              <span className="text-[9px] font-mono font-bold text-white px-1.5 py-0.5 rounded bg-white/10">
                {bookLanguage === 'english' ? 'English' : `Vol ${selectedVolume || 1}`}
              </span>
            </div>
            {(() => {
              if (bookLanguage === 'english') {
                const activeEngBook = ENGLISH_BOOKS.find(b => b.id === selectedEnglishBookId) || ENGLISH_BOOKS[0];
                return (
                  <div className="flex flex-col pt-0.5">
                    <span className="text-xs font-bold text-[var(--foreground)] truncate">
                      {activeEngBook ? activeEngBook.title : 'English Library'}
                    </span>
                  </div>
                );
              }
              const pageNum = currentPage?.page_num || (currentPageIndex + 1);
              const activeBook = getBookForPage(selectedVolume || 1, pageNum);
              return (
                <div className="flex flex-col pt-0.5">
                  <span className="text-xs font-bold text-[var(--foreground)] truncate">
                    {activeBook ? activeBook.title : `Volume ${selectedVolume || 1}`}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Language Toggle: Urdu / English Books ── */}
        <div className="px-5 pb-3">
          <div className="relative flex bg-white/5 rounded-xl p-1 border border-white/10">
            {/* Animated Background Pill */}
            <div 
              className="absolute top-1 bottom-1 w-[calc(33.333%-0.25rem)] rounded-[8px] transition-all duration-300 ease-out shadow-sm bg-[var(--accent-main)]"
              style={{
                left: bookLanguage === 'urdu' ? '0.25rem' : bookLanguage === 'english' ? 'calc(33.333% + 0.125rem)' : 'calc(66.666%)',
              }}
            />
            <button
              type="button"
              onClick={() => setBookLanguage('urdu')}
              className={clsx(
                "relative z-10 flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-wider transition-colors duration-200 text-center",
                bookLanguage === 'urdu' ? "text-white font-black" : "text-[var(--text-dim)] hover:text-white"
              )}
            >
              Urdu
            </button>
            <button
              type="button"
              onClick={() => setBookLanguage('english')}
              className={clsx(
                "relative z-10 flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-wider transition-colors duration-200 text-center",
                bookLanguage === 'english' ? "text-white font-black" : "text-[var(--text-dim)] hover:text-white"
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setBookLanguage('test')}
              className={clsx(
                "relative z-10 flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-wider transition-colors duration-200 text-center",
                bookLanguage === 'test' ? "text-white font-black" : "text-[var(--text-dim)] hover:text-white"
              )}
            >
              Test
            </button>
          </div>
        </div>

        {/* Tab Content & Library Dropdown Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <nav className="py-2 space-y-1">
            {/* ── Parent Collection Dropdown: Library ── */}
            <div className="flex flex-col">
              <div
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className="w-full flex items-center justify-between px-6 py-3 transition-all text-left border-l-2 border-transparent hover:bg-white/5 cursor-pointer select-none group"
              >
                <span className="text-xs font-black uppercase tracking-wider text-white truncate group-hover:text-[var(--accent-main)] transition-colors">
                  Library
                </span>

                <ChevronDown 
                  size={13} 
                  className={clsx(
                    "transition-transform duration-200 text-[var(--text-dim)] group-hover:text-white shrink-0 ml-2",
                    (isLibraryOpen || !!sidebarBookSearch.trim()) && "rotate-180 text-[var(--accent-main)]"
                  )} 
                />
              </div>

              {/* ── Collapsible Books (Urdu or English) ── */}
              {(isLibraryOpen || !!sidebarBookSearch.trim()) && (
                <div className="w-full flex flex-col space-y-px bg-black/15 py-1">
                  {bookLanguage === 'urdu' ? (
                    filteredVolumeData.length === 0 ? (
                      <div className="px-6 py-4 text-center text-xs text-[var(--text-dim)]">
                        No books found matching &quot;{sidebarBookSearch}&quot;
                      </div>
                    ) : (
                      filteredVolumeData.map(({ vol, matchingBooks, isMatchByBook }) => {
                        const isSelectedVolume = selectedVolume === vol;
                        const isExpanded = isMatchByBook || !!expandedVolumes[vol];
                        const books = matchingBooks;
                        const hasSubBooks = books.length > 0;

                        // Determine active book for this volume
                        const pageNum = currentPage?.page_num || (currentPageIndex + 1);
                        const activeBook = isSelectedVolume ? getBookForPage(vol, pageNum) : null;

                        // The volume row is only selected if it's the active volume AND its sub-books are not expanded
                        const isVolumeRowSelected = isSelectedVolume && (!hasSubBooks || !isExpanded);

                        return (
                          <div key={vol} className="w-full flex flex-col">
                            {/* Volume Navigation Row (Spans edge-to-edge) */}
                            <div
                              onClick={() => setSelectedVolume(vol)}
                              className={clsx(
                                "w-full flex items-center justify-between pl-9 pr-6 py-2.5 transition-all text-left border-l-2 cursor-pointer select-none group",
                                isVolumeRowSelected
                                  ? "font-black text-white border-[var(--accent-main)] bg-white/10"
                                  : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--foreground)] border-transparent"
                              )}
                            >
                              <span className="text-xs flex-1 truncate">Volume {vol}</span>

                              {/* Book Dropdown Chevron Toggle */}
                              {hasSubBooks && (
                                <button
                                  onClick={(e) => toggleVolumeDropdown(vol, e)}
                                  className="p-1 rounded hover:bg-white/10 text-[var(--text-dim)] hover:text-white transition-all ml-1 shrink-0"
                                  title="Toggle books"
                                >
                                  <ChevronDown 
                                    size={12} 
                                    className={clsx("transition-transform duration-200", isExpanded && "rotate-180 text-[var(--accent-main)]")} 
                                  />
                                </button>
                              )}
                            </div>

                            {/* Sub-books Dropdown List (Spans edge-to-edge) */}
                            {isExpanded && hasSubBooks && (
                              <div className="w-full flex flex-col bg-black/25 py-0.5 space-y-px">
                                {books.map((book, idx) => {
                                  const isCurrentBook = isSelectedVolume && activeBook?.title === book.title;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        if (selectedVolume !== vol) {
                                          pendingTargetPageRef.current = book.pageStart;
                                          setSelectedVolume(vol);
                                        } else {
                                          const targetIdx = pages.findIndex(p => p.page_num === book.pageStart);
                                          if (targetIdx !== -1) {
                                            setCurrentPageIndex(targetIdx);
                                          }
                                        }
                                      }}
                                      className={clsx(
                                        "w-full text-left pl-12 pr-6 py-2 transition-all flex items-center justify-between text-[11px] border-l-2 group",
                                        isCurrentBook
                                          ? "font-bold text-white border-[var(--accent-main)] bg-white/10"
                                          : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-white/5"
                                      )}
                                    >
                                      <span className="truncate flex-1 font-medium">{book.title}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )
                  ) : (
                    filteredEnglishBooks.length === 0 ? (
                      <div className="px-6 py-4 text-center text-xs text-[var(--text-dim)]">
                        No English books found matching &quot;{sidebarBookSearch}&quot;
                      </div>
                    ) : (
                      filteredEnglishBooks.map((book) => {
                        const isCurrentBook = selectedEnglishBookId === book.id;
                        return (
                          <button
                            key={book.id}
                            type="button"
                            onClick={() => {
                              setSelectedEnglishBookId(book.id);
                            }}
                            className={clsx(
                              "w-full text-left pl-9 pr-6 py-2.5 transition-all flex items-center justify-between text-xs border-l-2 group",
                              isCurrentBook
                                ? "font-bold text-white border-[var(--accent-main)] bg-white/10"
                                : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-white/5"
                            )}
                          >
                            <span className="truncate flex-1 font-medium">{book.title}</span>
                            {book.year && (
                              <span className="text-[10px] font-mono text-[var(--text-dim)] ml-2 shrink-0">
                                {book.year}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Suggest a Book Button Pinned to Bottom */}
        <div className="p-3.5 border-t border-white/5 shrink-0 bg-black/20">
          <button
            type="button"
            onClick={() => {
              setSuggestSubmitted(false);
              setSuggestBookName('');
              setSuggestBookUrl('');
              setIsSuggestModalOpen(true);
            }}
            className="w-full py-2.5 px-3 rounded-xl border border-white/10 glass bg-white/5 hover:bg-white/10 hover:border-white/20 text-xs font-bold text-white transition-all active:scale-[0.98] text-center"
          >
            Suggest a Book
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT: BOOK READING VIEW ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-black/10 relative overflow-hidden">
        {/* Floating Search Highlight Pill (only appears when a search highlight is active) */}
        {highlightTerms.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-2xl glass bg-black/70 backdrop-blur-md border border-amber-400/30 text-amber-300 text-xs shadow-lg animate-in fade-in duration-200">
            <Search size={12} className="text-amber-400" />
            <span className="text-[10px] font-sans text-amber-300/80">Highlight:</span>
            <span className="font-serif font-bold text-sm text-amber-200" dir="rtl">
              {highlightTerms[0]}
            </span>
            <button
              onClick={() => setHighlightTerms([])}
              className="p-1 rounded hover:bg-white/10 text-amber-400 hover:text-white transition-colors ml-0.5"
              title="Clear highlight"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Scrollable Reading Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-28 flex justify-center">
          {bookLanguage === 'english' ? (
            (() => {
              const activeEngBook = ENGLISH_BOOKS.find(b => b.id === selectedEnglishBookId) || ENGLISH_BOOKS[0];
              return (
                <div className="w-full max-w-2xl my-auto flex flex-col glass bg-zinc-950/80 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl gap-6 animate-in fade-in duration-300">
                  <div className="flex flex-col gap-2 border-b border-white/10 pb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)]">
                        English Publication
                      </span>
                      {activeEngBook?.year && (
                        <span className="text-xs font-mono font-bold text-[var(--text-muted)] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          Published {activeEngBook.year}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {activeEngBook?.title}
                    </h1>
                    <p className="text-xs text-[var(--text-muted)] font-medium">
                      Hazrat Mirza Ghulam Ahmad, The Promised Messiah &amp; Mahdi (as)
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                      About this Book
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {activeEngBook?.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    {activeEngBook?.url && (
                      <a
                        href={activeEngBook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-main)] to-emerald-600 hover:opacity-90 active:scale-95 text-xs font-bold text-white shadow-lg shadow-[var(--accent-main)]/20 transition-all"
                      >
                        <ExternalLink size={14} />
                        <span>Read on Alislam.org</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSuggestBookName(activeEngBook?.title || '');
                        setSuggestBookUrl(activeEngBook?.url || '');
                        setSuggestSubmitted(false);
                        setIsSuggestModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 glass bg-white/5 hover:bg-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all active:scale-95"
                    >
                      <span>Suggest Digital Edition / Scans</span>
                    </button>
                  </div>
                </div>
              );
            })()
          ) : bookLanguage === 'test' ? (
            <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-300">
              <Document 
                file="https://files.alislam.cloud/urdu/pdf/Ruhani-Khazain-Vol-01.pdf"
                onLoadSuccess={({ numPages }) => setPdfNumPages(numPages)}
                className={isOcrLoading || currentOcrText ? "hidden" : "block shadow-2xl"}
                loading={
                  <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-main)]" />
                    <p className="text-[var(--text-dim)] font-medium text-sm">Loading PDF...</p>
                  </div>
                }
              >
                <Page 
                  pageNumber={pdfPageNumber} 
                  onRenderSuccess={handlePdfRenderSuccess}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={Math.min(640, typeof window !== 'undefined' ? window.innerWidth - 32 : 640)}
                />
              </Document>
              
              {isOcrLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-main)]" />
                  <p className="text-[var(--text-dim)] font-medium text-sm">Extracting Urdu text via OCR...</p>
                </div>
              )}

              {currentOcrText && !isOcrLoading && (
                <div 
                  className="w-full my-auto flex justify-center py-2 animate-in fade-in duration-300"
                  style={{
                    maxWidth: 'min(640px, calc((100vh - 170px) * 9 / 11))'
                  }}
                >
                  <div className="w-full aspect-[9/11] bg-white text-black shadow-2xl p-3.5 sm:p-5 md:p-6 relative select-text border border-zinc-300 flex flex-col justify-between">
                    <div className="border-[2px] sm:border-[2.5px] border-black bg-white flex flex-col flex-1 min-h-0">
                      <div className="p-[2.5px] sm:p-[3px] bg-white flex flex-col flex-1 min-h-0">
                        <div className="border border-black p-2.5 sm:p-3.5 md:p-4 flex flex-col flex-1 min-h-0 bg-white relative">
                          <div 
                            className="text-black select-text w-full flex-1 flex flex-col justify-start" 
                            dir="rtl"
                            style={{ 
                              fontFamily: "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Regular', 'Noto Nastaliq Urdu', serif",
                              fontSize: `${fontSize}px`
                            }}
                          >
                            {renderText(currentOcrText)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center gap-3 h-full my-auto opacity-70">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-main)]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Initializing Core...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full my-auto text-center p-6">
              <p className="text-red-400 font-bold text-sm">{error}</p>
            </div>
          ) : currentPage ? (
            <div 
              className="w-full my-auto flex justify-center py-2"
              style={{
                maxWidth: 'min(640px, calc((100vh - 170px) * 9 / 11))'
              }}
            >
              {/* Authentic Ruhani Khazain Printed Lithograph Page Sheet (9x11 Aspect Ratio) */}
              <div 
                className="w-full aspect-[9/11] bg-white text-black shadow-2xl p-3.5 sm:p-5 md:p-6 relative select-text border border-zinc-300 flex flex-col justify-between"
                style={{ aspectRatio: '9 / 11' }}
              >
                {/* ── Classic Khazain Jadwal (Outer Frame) ── */}
                <div className="border-[2px] sm:border-[2.5px] border-black bg-white flex flex-col flex-1 min-h-0">
                  {/* Running Header Bar (Book Title, Urdu Page Number, Ruhani Khazain Volume) */}
                  <div 
                    className="flex items-center justify-between px-3 py-1 sm:py-1.5 border-b-[1.5px] border-black text-black select-none shrink-0" 
                    dir="rtl"
                    style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Regular', 'Noto Nastaliq Urdu', serif" }}
                  >
                    {/* Right in RTL: Series & Volume */}
                    <span className="text-xs sm:text-sm md:text-base font-bold">
                      روحانی خزائن جلد {toUrduNumerals(selectedVolume || 1)}
                    </span>

                    {/* Center: Page Number in Urdu Numerals */}
                    <span className="text-sm sm:text-base md:text-lg font-bold tracking-widest px-2">
                      {toUrduNumerals(currentPage?.page_num || (currentPageIndex + 1))}
                    </span>

                    {/* Left in RTL: Current Book Title */}
                    {(() => {
                      const pageNum = currentPage?.page_num || (currentPageIndex + 1);
                      const active = getBookForPage(selectedVolume || 1, pageNum);
                      return (
                        <span className="text-xs sm:text-sm md:text-base font-bold truncate max-w-[45%] text-left">
                          {active?.urduTitle || "براہین احمدیہ"}
                        </span>
                      );
                    })()}
                  </div>

                  {/* ~3px White Border Gap between Outer Frame and Inner Frame */}
                  <div className="p-[2.5px] sm:p-[3px] bg-white flex flex-col flex-1 min-h-0">
                    {/* Inner Thin Border Box Framing Body Text */}
                    <div 
                      ref={innerContainerRef}
                      className="border border-black p-2.5 sm:p-3.5 md:p-4 flex flex-col flex-1 min-h-0 bg-white relative"
                    >
                      <div 
                        ref={textContentRef}
                        className="text-black select-text w-full flex-1 flex flex-col justify-start" 
                        dir="rtl"
                        style={{ 
                          fontFamily: "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Regular', 'Noto Nastaliq Urdu', serif",
                          fontSize: `${fontSize}px`
                        }}
                      >
                        {renderText(currentPage.text)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full my-auto opacity-40 text-center">
              <BookOpen size={40} className="mb-3 text-[var(--accent-main)]" />
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                Select a volume to begin reading
              </p>
            </div>
          )}
        </div>

        {/* ── FLOATING BOTTOM-CENTER PAGE CONTROLS ── */}
        {bookLanguage === 'urdu' && currentPage && !loading && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center">
            <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-2xl glass bg-black/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
              {/* Previous Page Button */}
              <button 
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0 || loading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--foreground)] border border-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 group"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
              </button>

              {/* Page Indicator & Direct Page Input */}
              <div className="px-2 py-0.5 text-xs font-mono font-black text-white flex items-center gap-1.5 border-x border-white/10">
                <input
                  type="text"
                  inputMode="numeric"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleJumpToPage();
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  onBlur={() => handleJumpToPage()}
                  onFocus={(e) => e.target.select()}
                  className="w-12 text-center py-0.5 px-1 rounded-lg bg-white/10 text-[var(--accent-main)] font-mono font-black text-xs border border-white/15 focus:border-[var(--accent-main)] focus:bg-black/40 focus:ring-1 focus:ring-[var(--accent-main)] focus:outline-none transition-all cursor-pointer select-all"
                  title="Click to type page number and press Enter"
                  aria-label="Current Page Number"
                />
                <span className="opacity-30 select-none">/</span>
                <span className="opacity-60 select-none">{pages.length || "..."}</span>
              </div>

              {/* Next Page Button */}
              <button 
                onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === pages.length - 1 || loading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--foreground)] border border-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 group"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── FLOATING BOTTOM-CENTER PAGE CONTROLS (TEST MODE) ── */}
        {bookLanguage === 'test' && pdfNumPages && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center">
            <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-2xl glass bg-black/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all">
              {/* Previous Page Button */}
              <button 
                onClick={() => {
                   setPdfPageNumber(Math.max(1, pdfPageNumber - 1));
                   setIsOcrLoading(false);
                   setCurrentOcrText('');
                }}
                disabled={pdfPageNumber <= 1 || isOcrLoading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--foreground)] border border-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 group"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="px-2 py-0.5 text-xs font-mono font-black text-white flex items-center gap-1.5 border-x border-white/10">
                <span className="text-[var(--accent-main)] px-1">{pdfPageNumber}</span>
                <span className="opacity-30 select-none">/</span>
                <span className="opacity-60 select-none">{pdfNumPages}</span>
              </div>

              {/* Next Page Button */}
              <button 
                onClick={() => {
                   setPdfPageNumber(Math.min(pdfNumPages, pdfPageNumber + 1));
                   setIsOcrLoading(false);
                   setCurrentOcrText('');
                }}
                disabled={pdfPageNumber >= pdfNumPages || isOcrLoading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--foreground)] border border-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 group"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: MurrabiAI & Multilingual Search ── */}
      <div className="w-full lg:w-[350px] shrink-0 border-l border-white/5 glass bg-black/20 flex flex-col h-auto lg:h-full">
        {/* Panel Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-main)]/20 flex items-center justify-center">
              <AIBlobIcon size={18} active={true} />
            </div>
            <div>
              <h2 className="text-sm font-black italic tracking-tight text-white uppercase flex items-center gap-1.5">
                <span>MurrabiAI</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent-main)] lowercase">
                  intel
                </span>
              </h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] opacity-70">
                Analysis & Search Core
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {selectedWord && (
              <button
                onClick={() => setSelectedWord(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-dim)] hover:text-white transition-colors"
                title="Clear selected word"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher: MurabbiAI Analysis vs Search */}
        <div className="px-4 py-2 border-b border-white/5 bg-black/15 shrink-0">
          <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveRightTab('ai')}
              className={clsx(
                "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                activeRightTab === 'ai'
                  ? "bg-white/15 text-white shadow-sm border border-white/10"
                  : "text-[var(--text-muted)] hover:text-white"
              )}
            >
              <AIBlobIcon size={13} active={activeRightTab === 'ai'} />
              <span>MurabbiAI</span>
            </button>
            <button
              onClick={() => setActiveRightTab('search')}
              className={clsx(
                "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                activeRightTab === 'search'
                  ? "bg-[var(--accent-main)] text-white shadow-sm font-bold"
                  : "text-[var(--text-muted)] hover:text-white"
              )}
            >
              <Search size={13} />
              <span>Search</span>
              {searchResults.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-black/30 text-white font-bold">
                  {searchResults.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── TAB 1: MURABBIAI ANALYSIS & VOCABULARY ── */}
        {activeRightTab === 'ai' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
            {/* Action: Analyze Page Context Button */}
            <div className="space-y-2">
              <button
                onClick={handleAnalyzePage}
                disabled={aiLoading || !currentPage}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--accent-main)] to-emerald-600 hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-main)]/15 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {aiLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Analyzing Page Context...</span>
                  </>
                ) : (
                  <>
                    <AIBlobIcon size={15} active={true} />
                    <span>{aiData ? "Re-Analyze Page Context" : "Analyze Page & Context"}</span>
                  </>
                )}
              </button>

              {aiError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>

            {/* Selected Term Card (if any word is selected) */}
            {selectedWord && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200 border-b border-white/10 pb-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)] flex items-center gap-1.5">
                    <Search size={11} /> Selected Term
                  </span>
                  <button
                    onClick={() => setSelectedWord(null)}
                    className="text-[10px] text-[var(--text-dim)] hover:text-white flex items-center gap-0.5"
                  >
                    <X size={11} /> Dismiss
                  </button>
                </div>

                {/* Word Header Card */}
                <div className="glass-card p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
                  <div className="text-3xl font-serif font-bold text-[var(--foreground)] py-1 select-text" dir="rtl">
                    {selectedWord.word}
                  </div>
                  {selectedWord.translit && (
                    <span className="text-xs font-mono italic text-[var(--accent-main)] font-semibold mt-0.5">
                      /{selectedWord.translit}/
                    </span>
                  )}
                </div>

                {/* English Definition Card */}
                <div className="glass-card p-4 rounded-xl border border-white/10 bg-white/5 space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1">
                    <BookText size={11} /> English Definition
                  </span>

                  {selectedWord.loading ? (
                    <div className="flex items-center gap-2 py-2 text-xs text-[var(--text-muted)]">
                      <Loader2 size={14} className="animate-spin text-[var(--accent-main)]" />
                      <span>Searching Rekhta...</span>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--foreground)] leading-relaxed font-medium select-text">
                      {selectedWord.englishMeaning || "Detailed entry available on Rekhta or Google Search."}
                    </p>
                  )}
                </div>

                {/* External Links */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={selectedWord.rekhtaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl glass border border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-amber-500/10 text-[var(--foreground)] transition-all text-xs font-bold group"
                  >
                    <Globe size={13} className="text-amber-400" />
                    <span>Rekhta</span>
                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100" />
                  </a>

                  <a
                    href={selectedWord.googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl glass border border-white/10 bg-white/5 hover:border-blue-500/40 hover:bg-blue-500/10 text-[var(--foreground)] transition-all text-xs font-bold group"
                  >
                    <Search size={13} className="text-blue-400" />
                    <span>Google</span>
                    <ExternalLink size={10} className="opacity-40 group-hover:opacity-100" />
                  </a>
                </div>
              </div>
            )}

            {/* Page Context & Analysis Content */}
            {aiData ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* MurabbiAI Context & Synopsis */}
                {aiData.summary && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)] flex items-center gap-1.5">
                        <BookOpen size={12} /> MurabbiAI Synopsis & Context
                      </span>
                      <span className="text-[9px] font-mono text-[var(--text-dim)]">
                        Vol {selectedVolume || 1} · P.{currentPage?.page_num || (currentPageIndex + 1)}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl glass border border-white/10 bg-white/5 text-xs text-[var(--foreground)] leading-relaxed select-text space-y-3">
                      <p>{aiData.summary}</p>

                      {aiData.theologicalInsight && (
                        <div className="pt-2.5 mt-2.5 border-t border-white/10 text-[11px] text-[var(--foreground)] bg-[var(--accent-soft)] p-3 rounded-xl border border-[var(--accent-main)]/20">
                          <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[9px] text-[var(--accent-main)] mb-1">
                            <Info size={11} /> Theological Logic & Murabbi Takeaway
                          </div>
                          <p className="opacity-90 leading-relaxed font-medium">
                            {aiData.theologicalInsight}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Themes */}
                {Array.isArray(aiData.themes) && aiData.themes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                      Central Themes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiData.themes.map((theme, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Identified Classical Terms on this Page */}
                {Array.isArray(aiData.hardWords) && aiData.hardWords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] flex items-center justify-between">
                      <span>Key Terms Identified</span>
                      <span className="font-mono text-[9px] text-[var(--accent-main)]">
                        {aiData.hardWords.length} terms
                      </span>
                    </span>

                    <div className="space-y-1.5">
                      {aiData.hardWords.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectWord(item.word)}
                          className="w-full p-2.5 rounded-xl glass border border-white/5 bg-white/5 hover:border-[var(--accent-main)]/30 hover:bg-white/10 transition-all flex items-center justify-between text-left group"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-[11px] text-[var(--text-muted)] group-hover:text-[var(--foreground)] truncate">
                              {item.meaning}
                            </p>
                            {item.urduMeaning && (
                              <p className="text-[10px] font-serif text-[var(--text-dim)] text-right" dir="rtl">
                                {item.urduMeaning}
                              </p>
                            )}
                          </div>
                          <span className="font-serif font-bold text-sm text-[var(--accent-main)] shrink-0" dir="rtl">
                            {item.word}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !selectedWord && (
                <div className="flex flex-col items-center justify-center min-h-[260px] text-center p-5 border border-dashed border-white/10 rounded-2xl opacity-70">
                  <AIBlobIcon size={32} active={true} className="mb-3" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)] mb-1">
                    MurrabiAI Context Engine
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed max-w-[220px]">
                    Click <span className="font-bold text-white">"Analyze Page & Context"</span> to generate an English synthesis of the arguments and key concepts, or click any word to inspect its definition.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* ── TAB 2: MULTILINGUAL BOOK & LIBRARY SEARCH ── */}
        {activeRightTab === 'search' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {/* Search Input and Scope Toggle Form */}
            <form onSubmit={handleExecuteSearch} className="space-y-3">
              {/* Scope Selector: Current Book vs Entire 23 Volumes */}
              <div className="p-1 bg-black/40 rounded-xl border border-white/10 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSearchScope('volume')}
                  className={clsx(
                    "flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center text-[11px] flex items-center justify-center gap-1.5",
                    searchScope === 'volume'
                      ? "bg-[var(--accent-main)] text-white shadow"
                      : "text-[var(--text-muted)] hover:text-white"
                  )}
                >
                  <BookOpen size={12} />
                  <span>This Book (Vol {selectedVolume || 1})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchScope('library')}
                  className={clsx(
                    "flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center text-[11px] flex items-center justify-center gap-1.5",
                    searchScope === 'library'
                      ? "bg-[var(--accent-main)] text-white shadow"
                      : "text-[var(--text-muted)] hover:text-white"
                  )}
                >
                  <Library size={12} />
                  <span>Entire Library (23 Vols)</span>
                </button>
              </div>

              {/* Multilingual Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topic or word (Urdu, English, Arabic)..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl glass bg-white/5 border border-white/10 text-xs text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] transition-all font-medium"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setHasSearched(false); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--text-dim)] hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Submit Search Button */}
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-[var(--accent-main)] to-emerald-600 hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[var(--accent-main)]/15 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {isSearching ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Searching {searchScope === 'library' ? 'All 23 Volumes' : `Volume ${selectedVolume || 1}`}...</span>
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    <span>{searchScope === 'library' ? 'Search Entire Library' : `Search Volume ${selectedVolume || 1}`}</span>
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {searchError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Search Summary & Keyword Chips */}
            {hasSearched && !isSearching && (
              <div className="space-y-2 border-b border-white/10 pb-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[var(--foreground)]">
                    {searchTotalMatches === 0
                      ? 'No matches found'
                      : `${searchTotalMatches} match${searchTotalMatches === 1 ? '' : 'es'} found`}
                  </span>
                  <span className="text-[10px] text-[var(--text-dim)] font-mono">
                    {searchScope === 'library' ? 'Across 23 Volumes' : `In Volume ${selectedVolume || 1}`}
                  </span>
                </div>

                {/* Expanded Search Terms / Chips */}
                {activeSearchTerms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">Terms:</span>
                    {activeSearchTerms.map((term, tIdx) => (
                      <button
                        key={tIdx}
                        onClick={() => setHighlightTerms([term])}
                        className={clsx(
                          "px-2 py-0.5 rounded text-[11px] font-serif font-bold transition-all",
                          highlightTerms.includes(term)
                            ? "bg-amber-400/25 border border-amber-400/50 text-amber-300"
                            : "bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-white"
                        )}
                        dir="rtl"
                        title="Click to highlight on screen"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Results List */}
            <div className="space-y-2.5">
              {searchResults.map((res, rIdx) => {
                const isCurrentPage = (selectedVolume === res.volume) && 
                  (currentPage?.page_num === res.pageNum);

                return (
                  <button
                    key={rIdx}
                    onClick={() => handleSelectSearchResult(res)}
                    className={clsx(
                      "w-full p-3 rounded-xl glass border transition-all text-left group flex flex-col gap-2 cursor-pointer",
                      isCurrentPage
                        ? "bg-amber-500/10 border-amber-400/60 shadow-md ring-1 ring-amber-400/30"
                        : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    {/* Card Header: Book title, Volume, and Page pill */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white group-hover:text-[var(--accent-main)] truncate">
                          {res.bookTitle}
                        </span>
                        <span className="text-[10px] font-serif text-[var(--text-dim)] text-right" dir="rtl">
                          {res.bookUrduTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[var(--text-muted)]">
                          Vol {res.volume}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/20">
                          P. {res.pageNum}
                        </span>
                      </div>
                    </div>

                    {/* Excerpt Snippet with Matched Keyword */}
                    <div 
                      className="text-xs text-[var(--foreground)] leading-relaxed font-serif text-justify border-t border-white/5 pt-1.5 w-full select-text"
                      dir="rtl"
                    >
                      <span className="text-[var(--text-dim)]">{res.snippetBefore}</span>
                      <span className="bg-amber-300 text-amber-950 px-1 py-0.2 mx-0.5 rounded font-black shadow-sm">
                        {res.matchedSlice}
                      </span>
                      <span className="text-[var(--text-dim)]">{res.snippetAfter}</span>
                    </div>
                  </button>
                );
              })}

              {/* Initial empty state */}
              {!hasSearched && !isSearching && (
                <div className="flex flex-col items-center justify-center min-h-[220px] text-center p-5 border border-dashed border-white/10 rounded-2xl opacity-70">
                  <Search size={28} className="mb-2.5 text-[var(--accent-main)]" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)] mb-1">
                    Book & Library Search
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed max-w-[220px]">
                    Search any word or theological topic in <span className="text-white font-bold">Urdu, English, or Arabic</span>.
                    Toggle to search the current volume or all 23 volumes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Suggest a Book Modal ── */}
      {isSuggestModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSuggestModalOpen(false)}
        >
          <div 
            className="w-full max-w-md glass bg-zinc-950/95 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Suggest a Book</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Recommend a book to be added to the Murabbi reader.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(false)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {suggestSubmitted ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                  <CheckCircle size={24} />
                </div>
                <h4 className="text-sm font-bold text-white">Suggestion Received!</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
                  Thank you for suggesting <span className="text-white font-semibold">{suggestBookName}</span>. Your request has been recorded.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSuggestModalOpen(false)}
                  className="mt-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSuggestBookSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Book Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={suggestBookName}
                    onChange={(e) => setSuggestBookName(e.target.value)}
                    placeholder="e.g. The Philosophy of the Teachings of Islam"
                    className="w-full px-3.5 py-2.5 rounded-xl glass bg-white/5 border border-white/10 text-xs text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">
                    Book URL <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={suggestBookUrl}
                    onChange={(e) => setSuggestBookUrl(e.target.value)}
                    placeholder="https://alislam.org/book/..."
                    className="w-full px-3.5 py-2.5 rounded-xl glass bg-white/5 border border-white/10 text-xs text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsSuggestModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-[var(--text-muted)] hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!suggestBookName.trim() || !suggestBookUrl.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-main)] to-emerald-600 hover:opacity-90 active:scale-95 text-xs font-bold text-white shadow-md shadow-[var(--accent-main)]/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Submit Suggestion
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
