"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Mic,
  BookOpen,
  Globe,
  Newspaper,
  Scroll,
  ExternalLink,
  Copy,
  Check,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Filter,
  ShieldCheck,
  Volume2,
  BookmarkCheck,
  LogIn,
  Home,
  PlayCircle,
  Video,
  Headphones,
  Radio
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MultiSourceSearchResult,
  RuhaniKhazainSearchResult,
  QuranVerseResult,
  HadithResult,
  AlIslamArticleResult,
  PublicationResult,
  TheologicalConsensusMatrix,
  AudioResult,
  VideoResult,
  MediaItemResult
} from '@/lib/research-sources';

type ActiveSourceFilter = 'all' | 'quran' | 'ahadith' | 'articles' | 'media';

const ITEMS_PER_PAGE = 10;

function getPaginationRange(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function ResearchEngine() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveSourceFilter>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MultiSourceSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<string>("0.12");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // Pagination & Articles Cache
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [periodicalsCache, setPeriodicalsCache] = useState<Record<number, PublicationResult[]>>({});
  const [alislamCache, setAlislamCache] = useState<Record<number, AlIslamArticleResult[]>>({});
  const [loadingPeriodicalPage, setLoadingPeriodicalPage] = useState<boolean>(false);

  useEffect(() => {
    const isAuth = !!localStorage.getItem("google_refresh_token_encrypted");
    const isGuest = localStorage.getItem("murabbi_guest_mode") === "true";
    setIsUserLoggedIn(isAuth || isGuest);
  }, []);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'ur-PK'>('en-US');
  const recognitionRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = voiceLang;

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setQuery(transcript);
          if (event.results[0].isFinal) {
            setIsListening(false);
            performSearch(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("[Voice Search] Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [voiceLang]);

  // Keyboard shortcut listener ('/' to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleVoiceSearch = () => {
    if (!speechSupported) {
      alert("Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = voiceLang;
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (e) {
        console.error("Failed to start voice recognition", e);
        setIsListening(false);
      }
    }
  };

  const performSearch = async (searchQuery?: string) => {
    const targetQuery = (searchQuery ?? query).trim();
    if (!targetQuery) return;

    setLoading(true);
    setError(null);
    setSubmittedQuery(targetQuery);
    setCurrentPage(1);
    const startTime = performance.now();

    try {
      const res = await fetch('/api/research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQuery })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Search failed");
      }

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setSearchTime(elapsed);
      setResults(data.data);
      if (data.data?.publications) {
        setPeriodicalsCache({
          1: data.data.publications
        });
      }
      if (data.data?.alislamArticles) {
        setAlislamCache({
          1: data.data.alislamArticles
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete multi-source query.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const resetToHome = () => {
    setResults(null);
    setSubmittedQuery("");
    setQuery("");
    setCurrentPage(1);
    setPeriodicalsCache({});
    setAlislamCache({});
  };

  // Media sub-filter: all, audio, video, transcripts
  const [mediaSubFilter, setMediaSubFilter] = useState<'all' | 'audio' | 'video' | 'transcripts'>('all');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTabChange = (newTab: ActiveSourceFilter) => {
    setActiveFilter(newTab);
    setCurrentPage(1);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Filter count badges
  const counts = useMemo(() => {
    const quranCount = results ? results.quranVerses.length : 0;
    const ahadithCount = results ? (results.ahadith?.length || 0) : 0;
    const alHakamCount = results?.totalAlHakamHits || 0;
    const rorCount = results?.totalRoRHits || 0;
    const alislamCount = results ? (results.totalAlIslamHits || results.alislamArticles.length) : 0;
    const periodicalsCount = results ? Math.max(results.publications.length, alHakamCount + rorCount) : 0;
    const articlesCount = results?.totalArticleHits || (alislamCount + periodicalsCount);
    const rkCount = results ? results.ruhaniKhazain.length : 0;
    const audiosCount = results?.audios?.length || 0;
    const videosCount = results?.videos?.length || 0;
    const mediaCount = results?.totalMediaHits || (results?.media?.length) || (audiosCount + videosCount);
    const allCount = rkCount + quranCount + ahadithCount + articlesCount + mediaCount;

    return {
      all: allCount,
      quran: quranCount,
      ahadith: ahadithCount,
      articles: articlesCount,
      media: mediaCount,
      audios: audiosCount,
      videos: videosCount,
      rk: rkCount,
      alislam: alislamCount,
      periodicals: periodicalsCount
    };
  }, [results]);

  const allMediaItems = useMemo<MediaItemResult[]>(() => {
    if (!results) return [];
    if (results.media && results.media.length > 0) return results.media;
    const list: MediaItemResult[] = [];
    if (results.audios) {
      list.push(...results.audios.map(a => ({ mediaType: 'audio' as const, ...a })));
    }
    if (results.videos) {
      list.push(...results.videos.map(v => ({ mediaType: 'video' as const, ...v })));
    }
    return list;
  }, [results]);

  const filteredMediaItems = useMemo<MediaItemResult[]>(() => {
    if (mediaSubFilter === 'audio') {
      return allMediaItems.filter(m => m.mediaType === 'audio');
    }
    if (mediaSubFilter === 'video') {
      return allMediaItems.filter(m => m.mediaType === 'video');
    }
    if (mediaSubFilter === 'transcripts') {
      return allMediaItems.filter(m => m.mediaType === 'video' && !!m.transcriptSnippet);
    }
    return allMediaItems;
  }, [allMediaItems, mediaSubFilter]);

  // Compute total pages based on the currently active filter
  const totalPages = useMemo(() => {
    if (!results) return 1;
    switch (activeFilter) {
      case 'quran':
        return Math.max(1, Math.ceil(results.quranVerses.length / ITEMS_PER_PAGE));
      case 'ahadith':
        return Math.max(1, Math.ceil((results.ahadith?.length || 0) / ITEMS_PER_PAGE));
      case 'articles': {
        const sourcePages = Math.max(
          results.totalPagesAlHakam || Math.ceil((results.totalAlHakamHits || 0) / 10),
          results.totalPagesRoR || Math.ceil((results.totalRoRHits || 0) / 30),
          results.totalPagesAlIslam || Math.ceil((results.totalAlIslamHits || results.alislamArticles.length) / 20)
        );
        return Math.max(1, sourcePages);
      }
      case 'media':
        return Math.max(1, Math.ceil(filteredMediaItems.length / ITEMS_PER_PAGE));
      case 'all': {
        const rkPages = Math.ceil(results.ruhaniKhazain.length / ITEMS_PER_PAGE);
        const sourcePages = Math.max(
          results.totalPagesAlHakam || Math.ceil((results.totalAlHakamHits || 0) / 10),
          results.totalPagesRoR || Math.ceil((results.totalRoRHits || 0) / 30),
          results.totalPagesAlIslam || Math.ceil((results.totalAlIslamHits || results.alislamArticles.length) / 20)
        );
        const hadithPages = Math.ceil((results.ahadith?.length || 0) / ITEMS_PER_PAGE);
        const mediaPages = Math.ceil(allMediaItems.length / ITEMS_PER_PAGE);
        return Math.max(1, Math.max(rkPages, sourcePages, hadithPages, mediaPages));
      }
      default:
        return 1;
    }
  }, [results, activeFilter, filteredMediaItems, allMediaItems]);

  // Paginated slices for each corpus
  const displayedRuhaniKhazain = useMemo(() => {
    if (!results) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.ruhaniKhazain.slice(start, start + ITEMS_PER_PAGE);
  }, [results, currentPage]);

  const displayedQuran = useMemo(() => {
    if (!results) return [];
    if (activeFilter === 'all') {
      return currentPage === 1 ? results.quranVerses : [];
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.quranVerses.slice(start, start + ITEMS_PER_PAGE);
  }, [results, currentPage, activeFilter]);

  const displayedAhadith = useMemo(() => {
    if (!results || !results.ahadith) return [];
    if (activeFilter === 'all') {
      return currentPage === 1 ? results.ahadith : [];
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.ahadith.slice(start, start + ITEMS_PER_PAGE);
  }, [results, currentPage, activeFilter]);

  const displayedAlIslam = useMemo(() => {
    if (!results) return [];
    if (alislamCache[currentPage]) {
      return alislamCache[currentPage];
    }
    if (activeFilter === 'all') {
      return currentPage === 1 ? results.alislamArticles.slice(0, ITEMS_PER_PAGE) : [];
    }
    if (activeFilter === 'articles') {
      if (currentPage === 1) return results.alislamArticles;
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return results.alislamArticles.slice(start, start + ITEMS_PER_PAGE);
    }
    return [];
  }, [results, currentPage, activeFilter, alislamCache]);

  const displayedPublications = useMemo(() => {
    if (!results) return [];
    if (periodicalsCache[currentPage]) {
      return periodicalsCache[currentPage];
    }
    if (currentPage === 1) {
      return results.publications;
    }
    return [];
  }, [results, currentPage, periodicalsCache]);

  const displayedMedia = useMemo(() => {
    if (!results) return [];
    if (activeFilter === 'all') {
      return currentPage === 1 ? allMediaItems.slice(0, 6) : [];
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMediaItems.slice(start, start + ITEMS_PER_PAGE);
  }, [results, currentPage, activeFilter, allMediaItems, filteredMediaItems]);

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);

    // Fetch on-demand page for all articles (Al Hakam, Review of Religions, Al Islam) if not cached
    if ((activeFilter === 'articles' || activeFilter === 'all') && (!periodicalsCache[newPage] || !alislamCache[newPage])) {
      setLoadingPeriodicalPage(true);
      try {
        const res = await fetch('/api/research/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: submittedQuery,
            articlePage: newPage - 1
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.publications) {
            setPeriodicalsCache(prev => ({
              ...prev,
              [newPage]: data.data.publications
            }));
          }
          if (data.data.alislamArticles) {
            setAlislamCache(prev => ({
              ...prev,
              [newPage]: data.data.alislamArticles
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to fetch article page:', err);
      } finally {
        setLoadingPeriodicalPage(false);
      }
    }

    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const hasSearched = !!results || loading;

  // ═══════════════════════════════════════════════════════════════════════════
  // MURABBI DESK UI: INITIAL STATE (Google Structure + Murabbi OS Design System)
  // ═══════════════════════════════════════════════════════════════════════════
  if (!hasSearched) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 select-none relative w-full">
        {/* Top Header Bar for Landing View */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          {isUserLoggedIn ? (
            <Link
              href="/"
              className="px-4 py-2 rounded-full text-xs font-bold glass bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <Home size={14} className="text-emerald-400" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white transition-all shadow-md shadow-[var(--accent-glow)] flex items-center gap-1.5 active:scale-95"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Ambient atmospheric glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-glow)] rounded-full blur-[130px] pointer-events-none -z-10 opacity-70" />

        {/* Murabbi Desk Text Logo */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in zoom-in-95 duration-500">
          <div
            className="relative flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
            onClick={resetToHome}
          >
            <div className="absolute -inset-6 bg-[var(--accent-glow)] rounded-full blur-2xl opacity-40 pointer-events-none" />
            <img
              src="/text-logo.png"
              alt="Murabbi Desk"
              className="h-[80px] md:h-[110px] w-auto object-contain transition-all duration-300 invert mix-blend-multiply select-none drop-shadow-2xl relative z-10"
            />
            <div className="flex items-center gap-2 mt-2 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] px-3 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30">
                Research Protocol
              </span>
            </div>
          </div>

          <p className="text-xs md:text-sm font-semibold text-[var(--text-muted)] tracking-wide mt-3 text-center max-w-lg">
            Unified Theological Intelligence & Multi-Source Ahmadiyya Corpus Search
          </p>
        </div>

        {/* Murabbi Form V4 / Google-Style Search Pill Box (Dead-Centered) */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center relative">
          <form onSubmit={handleFormSubmit} className="relative">
            <div
              className={clsx(
                "relative flex items-center w-full rounded-2xl md:rounded-full transition-all duration-300",
                "glass bg-black/25 dark:bg-black/40 border border-white/10 dark:border-white/15 shadow-2xl hover:border-[var(--accent-main)]/40",
                "focus-within:border-[var(--accent-main)] focus-within:ring-2 focus-within:ring-[var(--accent-glow)]"
              )}
            >
              <div className="pl-5 pr-3 text-[var(--text-muted)]">
                <Search size={20} />
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, books, verses, or press mic to speak..."
                className="w-full py-4 bg-transparent text-base md:text-lg font-bold text-[var(--foreground)] placeholder:text-[var(--text-dim)] focus:outline-none"
              />

              {/* Clear button */}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] mr-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              )}

              {/* Voice Search Microphone */}
              <div className="pr-4 flex items-center">
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  title="Search by voice"
                  className={clsx(
                    "p-2.5 rounded-xl md:rounded-full transition-all flex items-center justify-center relative",
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
                      : "text-[var(--accent-main)] hover:bg-[var(--accent-soft)]"
                  )}
                >
                  <Mic size={20} />
                  {isListening && (
                    <span className="absolute -inset-1 rounded-full bg-red-500/30 animate-ping -z-10" />
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Voice active prompt */}
          {isListening && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2.5 text-red-500 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Listening for theological query... Speak now</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceLang(voiceLang === 'en-US' ? 'ur-PK' : 'en-US')}
                className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider"
              >
                {voiceLang === 'en-US' ? 'English (US)' : 'Urdu (اردو)'}
              </button>
            </div>
          )}

          {/* Murabbi Desk Action Button (Centered) */}
          <div className="flex items-center justify-center mt-6">
            <button
              onClick={() => performSearch()}
              disabled={!query.trim()}
              className="px-8 py-3 rounded-[14px] bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-hover)] text-white shadow-lg shadow-[var(--accent-glow)] font-black text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              Murabbi Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MURABBI DESK UI: RESULTS STATE (Google Structure + Murabbi OS Aesthetics)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* ── TOP HEADER (Murabbi Desk Logo + Centered Search Bar + Auth CTA) ───────────── */}
      <div className="sticky top-0 z-30 glass bg-black/25 dark:bg-[#020310]/90 backdrop-blur-xl border-b border-white/5 pt-3 pb-0 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[208px_1fr_208px] items-center gap-4">
          {/* Left Wing: Navbar text logo */}
          <div className="w-full flex items-center justify-center md:justify-start">
            <div
              onClick={resetToHome}
              className="flex items-center cursor-pointer shrink-0 select-none group py-0.5"
              title="Murabbi Desk"
            >
              <img
                src="/text-logo.png"
                alt="Murabbi Desk"
                className="h-8 md:h-9 w-auto object-contain transition-all duration-300 invert mix-blend-multiply active:scale-95 group-hover:opacity-90"
              />
            </div>
          </div>

          {/* Center Wing: Centered Search Pill Bar */}
          <div className="w-full max-w-2xl mx-auto flex justify-center">
            <form onSubmit={handleFormSubmit} className="relative w-full">
              <div
                className={clsx(
                  "relative flex items-center w-full rounded-[14px] md:rounded-full transition-all",
                  "glass bg-black/20 dark:bg-black/35 border border-white/10 shadow-sm",
                  "focus-within:border-[var(--accent-main)] focus-within:ring-2 focus-within:ring-[var(--accent-glow)]"
                )}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Ahmadiyya resources..."
                  className="w-full pl-5 pr-20 py-2.5 bg-transparent text-sm md:text-base font-bold text-[var(--foreground)] placeholder:text-[var(--text-dim)] focus:outline-none"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--foreground)]"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Voice search button */}
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  className={clsx(
                    "p-2 rounded-xl mr-1 transition-colors",
                    isListening
                      ? "text-red-500 animate-pulse"
                      : "text-[var(--accent-main)] hover:bg-[var(--accent-soft)]"
                  )}
                >
                  <Mic size={18} />
                </button>

                {/* Search submit button */}
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="p-2 pr-3 text-[var(--accent-main)] hover:opacity-80"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Right Wing: Auth / Dashboard CTA (Balanced with left wing) */}
          <div className="w-full flex items-center justify-center md:justify-end gap-2">
            {isUserLoggedIn ? (
              <Link
                href="/"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold glass border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Home size={13} className="text-emerald-400" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/onboarding"
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white transition-all shadow-md shadow-[var(--accent-glow)] flex items-center gap-1.5 active:scale-95"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── GOOGLE SEARCH TABS (Centered) ─────────────── */}
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 md:gap-6 overflow-x-auto custom-scrollbar mt-3 select-none text-xs md:text-sm">
          {[
            { id: 'all', label: 'All Sources', count: counts.all, icon: Search },
            { id: 'quran', label: 'Holy Qur\'an', count: counts.quran, icon: BookOpen },
            { id: 'ahadith', label: 'Ahadith', count: counts.ahadith, icon: Scroll },
            { id: 'articles', label: 'Articles', count: counts.articles, icon: Newspaper },
            { id: 'media', label: 'Media', count: counts.media, icon: PlayCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as ActiveSourceFilter)}
                className={clsx(
                  "pb-2.5 flex items-center gap-1.5 border-b-2 transition-all shrink-0 font-bold",
                  active
                    ? "border-[var(--accent-main)] text-[var(--accent-main)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={clsx(
                      "px-1.5 py-0.2 rounded-md text-[10px] font-black",
                      active ? "bg-[var(--accent-soft)] text-[var(--accent-main)]" : "bg-white/10 text-[var(--text-muted)]"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RESULTS BODY (Centered) ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-4 flex-1">
        {/* Search Statistics */}
        {results && !loading && (
          <div className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6 max-w-5xl mx-auto text-center md:text-left flex flex-wrap items-center justify-between gap-2">
            <span>
              Found {counts.all} records in {searchTime}s for <span className="text-[var(--foreground)]">"{submittedQuery}"</span>
            </span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 text-center space-y-4 max-w-2xl mx-auto">
            <Loader2 size={36} className="animate-spin text-[var(--accent-main)] mx-auto" />
            <p className="text-sm font-bold text-[var(--text-muted)] tracking-wide">
              Scanning Ruhani Khazain 1–23, Qur'an, Al Islam, and Periodicals...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 rounded-[14px] bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-6 font-bold">
            {error}
          </div>
        )}

        {/* Results Container (Centered) */}
        {results && !loading && (
          <div className="flex justify-center max-w-3xl mx-auto w-full">
            {/* Results Stream */}
            <div className="w-full space-y-8">
              {/* ── Confidence Score Bar ── */}
              {activeFilter === 'all' && results.consensusMatrix && (
                <div className="p-4 rounded-[14px] glass bg-white/[0.02] border border-white/10 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-black">
                      Confidence
                    </span>
                    <span className="text-emerald-400 font-mono text-sm font-black">
                      {results.consensusMatrix.confidenceScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[var(--accent-main)] transition-all duration-700"
                      style={{ width: `${results.consensusMatrix.confidenceScore}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ── 1. RUHANI KHAZAIN RESULTS ───────────────────────────────── */}
              {activeFilter === 'all' && displayedRuhaniKhazain.map((item, idx) => {
                const itemKey = `rk-${item.volume}-${item.pageNum}-${idx}`;
                const citation = `[Ruhani Khazain, Vol. ${item.volume}, "${item.bookTitle}", p. ${item.pageNum}]`;
                return (
                  <div key={itemKey} className="space-y-2 group pb-6 border-b border-black/10 dark:border-white/10 last:border-b-0">
                    {/* Breadcrumb Header */}
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[var(--accent-soft)] text-[var(--accent-main)] flex items-center justify-center font-black text-[10px] shrink-0">
                          RK
                        </div>
                        <div className="flex items-center gap-1.5 truncate font-semibold uppercase text-[10px] tracking-wider">
                          <span className="text-[var(--foreground)]">Ruhani Khazain</span>
                          <span>›</span>
                          <span>Vol {item.volume}</span>
                          <span>›</span>
                          <span className="truncate">{item.bookTitle}</span>
                        </div>
                      </div>

                      {results.hitsRankings && results.hitsRankings.authorities.some(a => a.nodeId.includes(`rk:vol${item.volume}`)) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/20 flex items-center gap-1 shrink-0">
                          <ShieldCheck size={11} />
                          HITS Root Authority
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg md:text-xl font-black italic tracking-tight text-[var(--foreground)] leading-snug">
                      <a href={item.readerUrl} className="hover:text-[var(--accent-main)] transition-colors">
                        Volume {item.volume}, Page {item.pageNum} — {item.bookTitle}
                      </a>
                    </h3>

                    {/* Urdu Snippet Excerpt */}
                    <div
                      dir="rtl"
                      className="p-4 rounded-[14px] glass bg-white/[0.02] border border-white/5 text-base md:text-lg leading-loose font-urdu text-[var(--foreground)] text-right"
                    >
                      <span>{item.snippetBefore}</span>
                      <mark className="bg-[var(--accent-main)] text-white px-1.5 py-0.5 rounded mx-1 font-bold">
                        {item.matchedSlice}
                      </mark>
                      <span>{item.snippetAfter}</span>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-3">
                        <Link
                          href={item.readerUrl}
                          className="px-3 py-1.5 rounded-[10px] bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <BookOpen size={13} />
                          Open in Reader
                          <ArrowRight size={11} />
                        </Link>
                        <span className="text-xs text-[var(--text-muted)] font-semibold hidden sm:inline">
                          constituent work: {item.bookUrduTitle}
                        </span>
                      </div>

                      <button
                        onClick={() => copyToClipboard(`${citation}\n"${item.snippetBefore} [${item.matchedSlice}] ${item.snippetAfter}"`, itemKey)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-white/5 flex items-center gap-1 font-bold"
                        title="Copy Citation"
                      >
                        {copiedId === itemKey ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        <span className="text-[11px] uppercase tracking-wider">{copiedId === itemKey ? "Copied" : "Cite"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Ruhani Khazain Note for 'all' tab */}
              {activeFilter === 'all' && results.ruhaniKhazain.length > ITEMS_PER_PAGE && (
                <div className="p-3.5 rounded-xl glass bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-medium">
                    Showing page {currentPage} ({displayedRuhaniKhazain.length} of {results.ruhaniKhazain.length} matches across 23 volumes of Ruhani Khazain)
                  </span>
                </div>
              )}

              {/* ── 2. HOLY QUR'AN THEMATIC RESULTS ─────────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'quran') && displayedQuran.map((v) => {
                const verseKey = `quran-${v.surahNumber}-${v.verseNumber}`;
                const quranCitation = `[Holy Qur'an, Surah ${v.surahNameEnglish} (${v.surahNumber}:${v.verseNumber})]\n"${v.arabicText}"\nTranslation: "${v.englishTranslation}"`;
                return (
                  <div key={verseKey} className="space-y-3 group pb-6 border-b border-black/10 dark:border-white/10 last:border-b-0">
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px] shrink-0">
                          HQ
                        </div>
                        <div className="flex items-center gap-1.5 truncate font-semibold uppercase text-[10px] tracking-wider">
                          <span className="text-emerald-400 font-bold">Holy Qur'an</span>
                          <span>›</span>
                          <span className="text-[var(--foreground)]">Surah {v.surahNameEnglish}</span>
                          <span>•</span>
                          <span>Verse {v.verseNumber}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                        <ShieldCheck size={11} />
                        Canonical Root Authority
                      </span>
                    </div>

                    {/* Arabic Text */}
                    <div
                      dir="rtl"
                      className="text-right font-arabic text-xl md:text-2xl text-[var(--foreground)] leading-loose py-2 tracking-wide font-normal"
                    >
                      {v.arabicText}
                    </div>

                    {/* English Translation */}
                    <p className="text-sm md:text-base text-[var(--foreground)]/90 leading-relaxed font-medium italic border-l-2 border-emerald-500/40 pl-3">
                      "{v.englishTranslation}"
                    </p>

                    {/* Commentary note */}
                    {v.commentaryNote && (
                      <div className="text-xs text-[var(--text-muted)] leading-relaxed bg-white/[0.02] p-3 rounded-[10px] border border-white/5 font-medium">
                        <span className="text-emerald-400 font-bold mr-1">Tafsir Context:</span>
                        {v.commentaryNote}
                      </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-[10px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Globe size={13} />
                        Al Islam Qur'an
                        <ExternalLink size={11} className="opacity-60" />
                      </a>

                      <button
                        onClick={() => copyToClipboard(quranCitation, verseKey)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-white/5 flex items-center gap-1 font-bold"
                        title="Copy Citation"
                      >
                        {copiedId === verseKey ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        <span className="text-[11px] uppercase tracking-wider">{copiedId === verseKey ? "Copied" : "Cite"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ── 3. CANONICAL AHADITH RESULTS ────────────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'ahadith') && displayedAhadith.map((h, idx) => {
                const hadithKey = `hadith-${h.id || idx}`;
                const citationText = `[Hadith: ${h.book}${h.chapter ? `, ${h.chapter}` : ''}${h.hadithNumber ? ` (Hadith #${h.hadithNumber})` : ''}${h.narrator ? ` — Narrated by ${h.narrator}` : ''}]\n"${h.arabicText ? `${h.arabicText}\n` : ''}${h.englishTranslation}"`;
                return (
                  <div key={hadithKey} className="space-y-3 group pb-6 border-b border-black/10 dark:border-white/10 last:border-b-0">
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-[10px] shrink-0">
                          HD
                        </div>
                        <div className="flex items-center gap-1.5 truncate font-semibold uppercase text-[10px] tracking-wider">
                          <span className="text-amber-400 font-bold">Ahadith</span>
                          <span>›</span>
                          <span className="text-[var(--foreground)]">{h.book}</span>
                          {h.chapter && (
                            <>
                              <span>•</span>
                              <span className="truncate">{h.chapter}</span>
                            </>
                          )}
                          {h.hadithNumber && (
                            <>
                              <span>•</span>
                              <span>No. {h.hadithNumber}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 shrink-0">
                        <ShieldCheck size={11} />
                        Prophetic Tradition
                      </span>
                    </div>

                    {/* Narrator if available */}
                    {h.narrator && (
                      <div className="text-xs font-bold text-[var(--text-muted)] tracking-wide">
                        Narrated by <span className="text-[var(--foreground)]">{h.narrator}</span>
                      </div>
                    )}

                    {/* Arabic Text if available */}
                    {h.arabicText && (
                      <div
                        dir="rtl"
                        className="text-right font-arabic text-xl md:text-2xl text-[var(--foreground)] leading-loose py-2 tracking-wide font-normal"
                      >
                        {h.arabicText}
                      </div>
                    )}

                    {/* English Translation */}
                    <p className="text-sm md:text-base text-[var(--foreground)]/90 leading-relaxed font-medium italic border-l-2 border-amber-500/40 pl-3">
                      "{h.englishTranslation}"
                    </p>

                    {/* Urdu Translation if available */}
                    {h.urduTranslation && (
                      <div
                        dir="rtl"
                        className="p-3 rounded-[12px] glass bg-white/[0.02] border border-white/5 text-sm md:text-base leading-loose font-urdu text-[var(--foreground)] text-right"
                      >
                        {h.urduTranslation}
                      </div>
                    )}

                    {/* Context Note if available */}
                    {h.contextNote && (
                      <div className="text-xs text-[var(--text-muted)] leading-relaxed bg-white/[0.02] p-3 rounded-[10px] border border-white/5 font-medium">
                        <span className="text-amber-400 font-bold mr-1">Contextual Exegesis:</span>
                        {h.contextNote}
                      </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      {h.url ? (
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-[10px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Globe size={13} />
                          Explore Tradition
                          <ExternalLink size={11} className="opacity-60" />
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] font-semibold">
                          {h.book}
                        </span>
                      )}

                      <button
                        onClick={() => copyToClipboard(citationText, hadithKey)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-white/5 flex items-center gap-1 font-bold"
                        title="Copy Citation"
                      >
                        {copiedId === hadithKey ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        <span className="text-[11px] uppercase tracking-wider">{copiedId === hadithKey ? "Copied" : "Cite"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ── 4. ARTICLES: AL ISLAM & PERIODICALS ──────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'articles') && displayedAlIslam.map((art) => (
                <div key={art.id} className="space-y-2 group pb-6 border-b border-black/10 dark:border-white/10 last:border-b-0">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                      <img
                        src="https://www.google.com/s2/favicons?domain=alislam.org&sz=128"
                        alt="Al Islam"
                        className="w-4 h-4 object-contain rounded-sm"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 truncate font-semibold uppercase text-[10px] tracking-wider">
                      <span className="text-[var(--foreground)]">alislam.org</span>
                      <span>›</span>
                      <span>{art.category.toLowerCase()}</span>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-black italic tracking-tight text-[var(--foreground)] leading-snug">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--accent-main)] transition-colors inline-flex items-center gap-1.5 group/link"
                    >
                      <span>{art.title}</span>
                      <ExternalLink size={13} className="opacity-40 group-hover/link:opacity-100 group-hover/link:text-[var(--accent-main)] transition-all shrink-0" />
                    </a>
                  </h3>

                  <p className="text-sm text-[var(--foreground)]/80 leading-relaxed font-medium">
                    {art.summary}
                  </p>

                  {art.author && (
                    <div className="text-xs text-[var(--text-muted)] font-semibold pt-0.5">
                      By {art.author}
                    </div>
                  )}
                </div>
              ))}

              {/* ── 5. PERIODICALS & PAPERS ─────────────────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'articles') && (
                <div className="space-y-6">
                  {/* Live Online Article Archives Callout Banner */}
                  {(results.totalAlHakamHits || results.totalRoRHits || results.totalAlIslamHits) && (
                    <div className="p-4 rounded-[16px] glass bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-3 text-xs shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center -space-x-1 shrink-0">
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
                              <img
                                src="https://www.google.com/s2/favicons?domain=alhakam.org&sz=128"
                                alt="Al Hakam"
                                className="w-4 h-4 object-contain rounded-sm"
                                loading="lazy"
                              />
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
                              <img
                                src="https://www.google.com/s2/favicons?domain=reviewofreligions.org&sz=128"
                                alt="Review of Religions"
                                className="w-4 h-4 object-contain rounded-sm"
                                loading="lazy"
                              />
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
                              <img
                                src="https://www.google.com/s2/favicons?domain=alislam.org&sz=128"
                                alt="Al Islam"
                                className="w-4 h-4 object-contain rounded-sm"
                                loading="lazy"
                              />
                            </div>
                          </div>
                          <div>
                            <span className="font-black text-emerald-400 text-sm">
                              Live Article Archives: {(results.totalArticleHits || ((results.totalAlHakamHits || 0) + (results.totalRoRHits || 0) + (results.totalAlIslamHits || 0)))} results found
                            </span>
                            <p className="text-[var(--text-muted)] text-[11px] font-medium">
                              Aggregated live from alhakam.org, reviewofreligions.org, and alislam.org with complete pagination
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Source breakdown pills with direct search links */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-500/20">
                        {typeof results.totalAlHakamHits === 'number' && results.totalAlHakamHits > 0 && (
                          <a
                            href={`https://www.alhakam.org/search?q=${encodeURIComponent(submittedQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-emerald-500/20 text-white/90 hover:text-emerald-300 font-semibold text-[11px] flex items-center gap-1.5 transition-colors border border-white/10"
                          >
                            <img
                              src="https://www.google.com/s2/favicons?domain=alhakam.org&sz=128"
                              alt="Al Hakam"
                              className="w-3.5 h-3.5 object-contain"
                            />
                            <span>Al Hakam: <strong className="text-emerald-400">{results.totalAlHakamHits}</strong></span>
                            <ExternalLink size={10} className="opacity-60" />
                          </a>
                        )}
                        {typeof results.totalRoRHits === 'number' && results.totalRoRHits > 0 && (
                          <a
                            href={`https://www.reviewofreligions.org/?s=${encodeURIComponent(submittedQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-emerald-500/20 text-white/90 hover:text-emerald-300 font-semibold text-[11px] flex items-center gap-1.5 transition-colors border border-white/10"
                          >
                            <img
                              src="https://www.google.com/s2/favicons?domain=reviewofreligions.org&sz=128"
                              alt="Review of Religions"
                              className="w-3.5 h-3.5 object-contain"
                            />
                            <span>Review of Religions: <strong className="text-emerald-400">{results.totalRoRHits}</strong></span>
                            <ExternalLink size={10} className="opacity-60" />
                          </a>
                        )}
                        {typeof results.totalAlIslamHits === 'number' && results.totalAlIslamHits > 0 && (
                          <a
                            href={`https://www.alislam.org/?s=${encodeURIComponent(submittedQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-emerald-500/20 text-white/90 hover:text-emerald-300 font-semibold text-[11px] flex items-center gap-1.5 transition-colors border border-white/10"
                          >
                            <img
                              src="https://www.google.com/s2/favicons?domain=alislam.org&sz=128"
                              alt="Al Islam"
                              className="w-3.5 h-3.5 object-contain"
                            />
                            <span>Al Islam: <strong className="text-emerald-400">{results.totalAlIslamHits}+</strong></span>
                            <ExternalLink size={10} className="opacity-60" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {loadingPeriodicalPage ? (
                    <div className="py-16 text-center space-y-3 glass rounded-2xl border border-emerald-500/20 p-8 my-4">
                      <Loader2 size={32} className="animate-spin text-emerald-400 mx-auto" />
                      <p className="text-sm font-bold text-emerald-400">
                        Loading Article Archives Page {currentPage} of {totalPages}...
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Retrieving verified live articles from reviewofreligions.org, alhakam.org, and alislam.org
                      </p>
                    </div>
                  ) : (
                    displayedPublications.map((pub) => {
                      const isAlHakam = pub.source === 'Al Hakam';
                      const isRoR = pub.source === 'Review of Religions';

                      return (
                        <div key={pub.id} className="space-y-2 group pb-6 border-b border-black/10 dark:border-white/10 last:border-b-0">
                          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                                <img
                                  src={`https://www.google.com/s2/favicons?domain=${isAlHakam ? 'alhakam.org' : isRoR ? 'reviewofreligions.org' : 'alfazl.com'}&sz=128`}
                                  alt={pub.source}
                                  className="w-4 h-4 object-contain rounded-sm"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex items-center gap-1.5 truncate font-semibold uppercase text-[10px] tracking-wider">
                                <span className="text-[var(--foreground)]">{pub.source}</span>
                                <span>›</span>
                                <span>{pub.date || (isAlHakam ? 'Weekly Newspaper' : 'Monthly Magazine')}</span>
                              </div>
                            </div>
                          </div>

                          <h3 className="text-lg md:text-xl font-black italic tracking-tight text-[var(--foreground)] leading-snug">
                            <a
                              href={pub.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[var(--accent-main)] transition-colors inline-flex items-center gap-1.5 group/link"
                            >
                              <span>{pub.title}</span>
                              <ExternalLink size={13} className="opacity-40 group-hover/link:opacity-100 group-hover/link:text-[var(--accent-main)] transition-all shrink-0" />
                            </a>
                          </h3>

                          <p className="text-sm text-[var(--foreground)]/80 leading-relaxed font-medium">
                            {pub.summary}
                          </p>

                          {pub.author && (
                            <div className="text-xs text-[var(--text-muted)] font-semibold pt-0.5">
                              By {pub.author}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Articles Tab Jump Banner for 'all' tab */}
                  {activeFilter === 'all' && (results.totalArticleHits || results.totalAlHakamHits || results.publications.length) > ITEMS_PER_PAGE && (
                    <div className="p-3.5 rounded-xl glass bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-[var(--text-muted)] font-medium">
                        Showing page {currentPage} of Article Archives ({(results.totalArticleHits || results.totalAlHakamHits || results.publications.length)} total articles available)
                      </span>
                      <button
                        onClick={() => handleTabChange('articles')}
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 active:scale-95 transition-all self-start sm:self-auto"
                      >
                        <span>Browse all {results.totalArticleHits || results.totalAlHakamHits || results.publications.length} in Articles tab</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── 6. MEDIA RESULTS: ASK ISLAM, YOUTUBE & MTA.TV ────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'media') && displayedMedia.length > 0 && (
                <div className="space-y-6">
                  {/* Media Sub-filter pills (only in 'media' tab) */}
                  {activeFilter === 'media' && (
                    <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-black/10 dark:border-white/10 mb-4 select-none">
                      <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] mr-2 flex items-center gap-1.5">
                        <Filter size={12} />
                        Filter:
                      </span>
                      {[
                        { id: 'all', label: `All Media (${allMediaItems.length})` },
                        { id: 'audio', label: `Audios (${results?.audios?.length || 0})` },
                        { id: 'video', label: `Videos (${results?.videos?.length || 0})` },
                        { id: 'transcripts', label: `Transcript Matches (${allMediaItems.filter(m => m.mediaType === 'video' && !!m.transcriptSnippet).length})` }
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setMediaSubFilter(sub.id as any);
                            setCurrentPage(1);
                          }}
                          className={clsx(
                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                            mediaSubFilter === sub.id
                              ? "bg-[var(--accent-main)] text-white shadow-md shadow-[var(--accent-glow)] scale-105"
                              : "glass bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--foreground)] border border-white/10"
                          )}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Media Stream Items */}
                  {displayedMedia.map((item, idx) => {
                    const itemKey = `media-${item.mediaType}-${item.id || idx}`;

                    // ── AUDIO ITEM: ASK ISLAM (askislam.org) ──
                    if (item.mediaType === 'audio') {
                      const citation = `[Ask Islam: Q&A with Hazrat Mirza Tahir Ahmad (rh) — "${item.title}"]\nListen: ${item.audioUrl}\nSource: ${item.url}`;

                      return (
                        <div key={itemKey} className="space-y-3 group pb-6 border-b border-black/10 dark:border-white/10 last:border-b-0">
                          {/* Breadcrumb Header */}
                          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                                <img
                                  src="https://www.google.com/s2/favicons?domain=askislam.org&sz=128"
                                  alt="Ask Islam"
                                  className="w-4 h-4 object-contain rounded-sm"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex items-center gap-1.5 truncate font-semibold uppercase text-[10px] tracking-wider">
                                <span className="text-[var(--foreground)]">askislam.org</span>
                                <span>›</span>
                                <span>Audio Q&A</span>
                                <span>›</span>
                                <span className="truncate">{item.category}</span>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1 shrink-0">
                              <Headphones size={11} />
                              Audio Recording
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg md:text-xl font-black italic tracking-tight text-[var(--foreground)] leading-snug">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[var(--accent-main)] transition-colors inline-flex items-center gap-1.5 group/link"
                            >
                              <span>{item.title}</span>
                              <ExternalLink size={13} className="opacity-40 group-hover/link:opacity-100 group-hover/link:text-[var(--accent-main)] transition-all shrink-0" />
                            </a>
                          </h3>

                          {/* Speaker Tag */}
                          <div className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-2">
                            <span>Speaker: <strong className="text-[var(--foreground)]">{item.speaker}</strong></span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>Category: {item.category}</span>
                          </div>

                          {/* Inline HTML5 Audio Player */}
                          <div className="pt-1 pb-1">
                            <audio
                              controls
                              preload="none"
                              src={item.audioUrl}
                              className="w-full h-10 rounded-xl bg-white/5 border border-white/10"
                            />
                          </div>

                          {/* Bottom Actions */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <div className="flex items-center gap-2">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 text-[var(--foreground)] border border-white/10 font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <Globe size={13} />
                                View on Ask Islam
                                <ExternalLink size={11} className="opacity-60" />
                              </a>
                              <a
                                href={item.audioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-[10px] bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/20 font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <Headphones size={13} />
                                Direct MP3 Stream
                              </a>
                            </div>

                            <button
                              onClick={() => copyToClipboard(citation, itemKey)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-white/5 flex items-center gap-1 font-bold"
                              title="Copy Citation"
                            >
                              {copiedId === itemKey ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                              <span className="text-[11px] uppercase tracking-wider">{copiedId === itemKey ? "Copied" : "Cite"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // ── VIDEO ITEM: YOUTUBE & MTA.TV ──
                    const isYouTube = item.source === 'YouTube';
                    const videoCitation = `[Video: "${item.title}" — ${item.channel} (${item.source})]\nWatch: ${item.url}${item.transcriptSnippet ? `\nTranscript Quote: ${item.transcriptSnippet}` : ''}`;

                    return (
                      <div key={itemKey} className="space-y-3 group pb-6 border-b border-black/10 dark:border-white/10 last:border-b-0">
                        {/* Breadcrumb Header */}
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${isYouTube ? 'youtube.com' : 'mta.tv'}&sz=128`}
                                alt={item.source}
                                className="w-4 h-4 object-contain rounded-sm"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 truncate font-semibold uppercase text-[10px] tracking-wider">
                              <span className="text-[var(--foreground)]">{isYouTube ? 'YouTube' : 'MTA.tv'}</span>
                              <span>›</span>
                              <span className="truncate">{item.channel}</span>
                              {item.published && (
                                <>
                                  <span>•</span>
                                  <span>{item.published}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {item.transcriptSnippet ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1 shrink-0">
                              <Volume2 size={11} />
                              Spoken Transcript Match
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 shrink-0">
                              <Video size={11} />
                              Video
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg md:text-xl font-black italic tracking-tight text-[var(--foreground)] leading-snug">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--accent-main)] transition-colors inline-flex items-center gap-1.5 group/link"
                          >
                            <span>{item.title}</span>
                            <ExternalLink size={13} className="opacity-40 group-hover/link:opacity-100 group-hover/link:text-[var(--accent-main)] transition-all shrink-0" />
                          </a>
                        </h3>

                        {/* Card Layout: Thumbnail + Description */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {item.thumbnail && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative rounded-xl overflow-hidden group/thumb shrink-0 w-full sm:w-48 aspect-video bg-black/40 border border-white/10 shadow-sm block"
                            >
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/10 transition-colors flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                                  <PlayCircle size={20} />
                                </div>
                              </div>
                              {item.duration && (
                                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-bold tracking-wider">
                                  {item.duration}
                                </span>
                              )}
                            </a>
                          )}

                          <div className="flex-1 space-y-2">
                            {item.description && (
                              <p className="text-sm text-[var(--foreground)]/80 leading-relaxed font-medium line-clamp-3">
                                {item.description}
                              </p>
                            )}

                            {/* Spoken Transcript Highlight Box with Clickable Timestamp */}
                            {item.transcriptSnippet && (
                              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs space-y-1.5">
                                <div className="flex items-center justify-between text-amber-400 font-black uppercase text-[10px] tracking-wider">
                                  <div className="flex items-center gap-1.5">
                                    <Volume2 size={13} />
                                    <span>Spoken in Video Transcript</span>
                                  </div>
                                  {item.transcriptTimestampSec !== undefined && (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-[10px] font-bold transition-colors flex items-center gap-1 active:scale-95"
                                    >
                                      <span>Jump to {item.transcriptSnippet.match(/\[([0-9:]+)\]/)?.[1] || 'Timestamp'}</span>
                                      <ExternalLink size={9} />
                                    </a>
                                  )}
                                </div>
                                <p className="text-[var(--foreground)]/90 italic font-medium leading-relaxed">
                                  {item.transcriptSnippet}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={clsx(
                              "px-3 py-1.5 rounded-[10px] font-bold flex items-center gap-1.5 transition-colors",
                              isYouTube
                                ? "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20"
                                : "bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20"
                            )}
                          >
                            <PlayCircle size={13} />
                            <span>{isYouTube ? 'Watch on YouTube' : 'Watch on MTA.tv'}</span>
                            <ExternalLink size={11} className="opacity-60" />
                          </a>

                          <button
                            onClick={() => copyToClipboard(videoCitation, itemKey)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-white/5 flex items-center gap-1 font-bold"
                            title="Copy Citation"
                          >
                            {copiedId === itemKey ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            <span className="text-[11px] uppercase tracking-wider">{copiedId === itemKey ? "Copied" : "Cite"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Media Tab Jump Banner for 'all' tab */}
                  {activeFilter === 'all' && allMediaItems.length > 6 && (
                    <div className="p-3.5 rounded-xl glass bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-[var(--text-muted)] font-medium">
                        Showing top media results ({allMediaItems.length} total audios & videos available)
                      </span>
                      <button
                        onClick={() => handleTabChange('media')}
                        className="text-[var(--accent-main)] hover:brightness-110 font-bold flex items-center gap-1 active:scale-95 transition-all self-start sm:self-auto"
                      >
                        <span>Browse all {allMediaItems.length} in Media tab</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── 7. GOOGLE-STYLE CANONICAL PAGINATION CONTROLS ─────────── */}
              {totalPages > 1 && (
                <div className="pt-8 pb-4 flex flex-col items-center gap-3 border-t border-white/10 select-none">
                  {/* Page indicator info */}
                  <div className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-2">
                    <span>
                      Page <span className="text-[var(--foreground)] font-bold">{currentPage}</span> of{' '}
                      <span className="text-[var(--foreground)] font-bold">{totalPages}</span>
                    </span>
                    {activeFilter === 'quran' && (
                      <span className="text-emerald-400 font-bold">
                        • {results.quranVerses.length} verses from the Holy Qur'an
                      </span>
                    )}
                    {activeFilter === 'ahadith' && (
                      <span className="text-amber-400 font-bold">
                        • {results.ahadith?.length || 0} prophetic traditions
                      </span>
                    )}
                    {activeFilter === 'articles' && (
                      <span className="text-emerald-400 font-bold">
                        • {counts.articles} total articles (Review of Religions, Al Hakam & Al Islam)
                      </span>
                    )}
                    {activeFilter === 'media' && (
                      <span className="text-[var(--accent-main)] font-bold">
                        • {filteredMediaItems.length} recordings & videos (Ask Islam, YouTube & MTA.tv)
                      </span>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-center">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={clsx(
                        "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border",
                        currentPage === 1
                          ? "opacity-30 cursor-not-allowed border-transparent text-[var(--text-muted)]"
                          : "glass bg-white/5 hover:bg-white/10 border-white/10 text-[var(--foreground)] hover:border-[var(--accent-main)]/40 active:scale-95"
                      )}
                    >
                      <ChevronLeft size={14} />
                      <span>Previous</span>
                    </button>

                    {/* Page Numbers */}
                    {getPaginationRange(currentPage, totalPages).map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] font-black text-xs">
                            ...
                          </span>
                        );
                      }
                      const num = p as number;
                      const isActive = num === currentPage;
                      return (
                        <button
                          key={`page-${num}`}
                          type="button"
                          onClick={() => handlePageChange(num)}
                          className={clsx(
                            "w-9 h-9 md:w-10 md:h-10 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center",
                            isActive
                              ? "bg-[var(--accent-main)] text-white shadow-lg shadow-[var(--accent-glow)] ring-2 ring-[var(--accent-main)]/50 scale-105"
                              : "glass bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-[var(--accent-main)]/30 active:scale-95"
                          )}
                        >
                          {num}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={clsx(
                        "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border",
                        currentPage === totalPages
                          ? "opacity-30 cursor-not-allowed border-transparent text-[var(--text-muted)]"
                          : "glass bg-white/5 hover:bg-white/10 border-white/10 text-[var(--foreground)] hover:border-[var(--accent-main)]/40 active:scale-95"
                      )}
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* End of results padding */}
              <div className="pb-12" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
