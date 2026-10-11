"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Bookmark,
  Share2,
  Loader2,
  Search
} from 'lucide-react';
import { clsx } from 'clsx';

interface AhmadiyyaBookReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  initialPage?: number;
  bookTitle?: string;
  bookAuthor?: string;
  coverUrl?: string;
}

export default function AhmadiyyaBookReaderModal({
  isOpen,
  onClose,
  slug,
  initialPage = 1,
  bookTitle,
  bookAuthor,
  coverUrl
}: AhmadiyyaBookReaderModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [jumpPageInput, setJumpPageInput] = useState<string>(String(initialPage));
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageText, setPageText] = useState<string>('');
  const [title, setTitle] = useState<string>(bookTitle || '');
  const [author, setAuthor] = useState<string>(bookAuthor || '');
  const [alislamUrl, setAlislamUrl] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [cover, setCover] = useState<string | undefined>(coverUrl);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // In-book search state
  const [showInBookSearch, setShowInBookSearch] = useState<boolean>(false);
  const [inBookQuery, setInBookQuery] = useState<string>('');
  const [inBookMatches, setInBookMatches] = useState<Array<{ pageNum: number; snippet: string; alislamScanUrl?: string }>>([]);
  const [inBookLoading, setInBookLoading] = useState<boolean>(false);
  const [inBookSearched, setInBookSearched] = useState<boolean>(false);
  const inBookInputRef = useRef<HTMLInputElement>(null);

  // Sync initialPage when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(initialPage);
      setJumpPageInput(String(initialPage));
      if (bookTitle) setTitle(bookTitle);
      if (bookAuthor) setAuthor(bookAuthor);
      if (coverUrl) setCover(coverUrl);
      setShowInBookSearch(false);
      setInBookQuery('');
      setInBookMatches([]);
      setInBookSearched(false);
    }
  }, [isOpen, initialPage, bookTitle, bookAuthor, coverUrl]);

  // Execute in-book search
  const executeInBookSearch = useCallback(
    async (searchTerm: string) => {
      const clean = searchTerm.trim();
      if (!clean || !slug) {
        setInBookMatches([]);
        setInBookSearched(false);
        return;
      }
      setInBookLoading(true);
      setInBookSearched(true);
      try {
        const res = await fetch(`/api/research/in-book-search?slug=${encodeURIComponent(slug)}&query=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setInBookMatches(data.results);
        } else {
          setInBookMatches([]);
        }
      } catch (err) {
        console.error('[BookReader] In-book search error:', err);
        setInBookMatches([]);
      } finally {
        setInBookLoading(false);
      }
    },
    [slug]
  );

  // Auto-focus search input when search is toggled open
  useEffect(() => {
    if (showInBookSearch) {
      setTimeout(() => inBookInputRef.current?.focus(), 80);
    }
  }, [showInBookSearch]);

  // Fetch page content
  const fetchPage = useCallback(
    async (pageToLoad: number) => {
      if (!slug || !isOpen) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/research/book-page?slug=${encodeURIComponent(slug)}&page=${pageToLoad}`);
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to load page text');
        }
        setPageText(data.text || '');
        setCurrentPage(data.pageNum);
        setJumpPageInput(String(data.pageNum));
        setTotalPages(data.totalPages || 1);
        if (data.title) setTitle(data.title);
        if (data.author) setAuthor(data.author);
        if (data.alislamUrl) setAlislamUrl(data.alislamUrl);
        if (data.sourceUrl) setSourceUrl(data.sourceUrl);
        if (data.coverUrl) setCover(data.coverUrl);

        // Scroll back to top on page change
        if (contentScrollRef.current) {
          contentScrollRef.current.scrollTop = 0;
        }
      } catch (err: any) {
        console.error('[BookReader] Fetch error:', err);
        setError(err.message || 'Unable to connect to AhmadiyyaBooks.com reader.');
      } finally {
        setLoading(false);
      }
    },
    [slug, isOpen]
  );

  useEffect(() => {
    if (isOpen && slug) {
      fetchPage(currentPage);
    }
  }, [isOpen, slug, currentPage, fetchPage]);

  // Keyboard navigation: Arrow keys & Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle In-Book Search with Cmd+F / Ctrl+F
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowInBookSearch(prev => !prev);
        return;
      }

      // If user presses Escape while in-book search is open, close search first
      if (e.key === 'Escape' && showInBookSearch) {
        e.preventDefault();
        setShowInBookSearch(false);
        return;
      }

      // Don't intercept arrow keys if user is typing in any input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (currentPage > 1) {
          setCurrentPage(prev => Math.max(1, prev - 1));
        }
      } else if (e.key === 'ArrowRight') {
        if (currentPage < totalPages) {
          setCurrentPage(prev => Math.min(totalPages, prev + 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, totalPages, onClose, showInBookSearch]);

  if (!isOpen) return null;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setCurrentPage(target);
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  const copyPageCitation = () => {
    const citation = `"${title}", by ${author}, Page ${currentPage}. Source: ${alislamUrl || `https://www.alislam.org/book/${slug}/?page=${currentPage}`}`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const copyFullText = () => {
    navigator.clipboard.writeText(pageText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const isUrduOrArabic = (text: string) => {
    return /[\u0600-\u06FF\u0750-\u077F]/.test(text.slice(0, 300));
  };

  const isRtl = isUrduOrArabic(pageText);

  const renderHighlightedContent = (text: string, searchHighlight: string) => {
    if (!searchHighlight || searchHighlight.trim().length < 2) return text;
    const clean = searchHighlight.trim();
    const terms = clean
      .split(/\s+/)
      .filter(t => t.length >= 2)
      .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (terms.length === 0) return text;

    try {
      const regex = new RegExp(`(${terms.join('|')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-amber-400/35 text-white font-bold px-0.5 rounded border-b-2 border-amber-400"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={clsx(
          "relative flex flex-col bg-[#070b19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200",
          isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-4xl h-[92vh] max-h-[900px]"
        )}
      >
        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 glass bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {cover ? (
              <img
                src={cover}
                alt={title}
                className="w-8 h-11 object-cover rounded shadow border border-white/10 shrink-0"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-10 rounded bg-[var(--accent-soft)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)] shrink-0">
                <BookOpen size={16} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white truncate tracking-tight">
                {title || 'Canonical Ahmadiyya Literature'}
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] truncate font-semibold">
                By <span className="text-white/80">{author || 'Ahmadiyya Author'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Find in Book Button */}
            <button
              onClick={() => setShowInBookSearch(!showInBookSearch)}
              className={clsx(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all",
                showInBookSearch
                  ? "bg-[var(--accent-main)] text-white border-[var(--accent-main)] shadow-sm"
                  : "bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white border-white/10"
              )}
              title="Find in this book (Cmd+F / Ctrl+F)"
            >
              <Search size={13} />
              <span className="hidden sm:inline">Find</span>
              <kbd className="hidden md:inline px-1 py-0.2 rounded bg-black/40 text-[9px] font-mono text-white/70">⌘F</kbd>
            </button>

            {/* Font size toggle */}
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
              <button
                onClick={() => {
                  if (fontSize === 'xl') setFontSize('lg');
                  else if (fontSize === 'lg') setFontSize('base');
                  else if (fontSize === 'base') setFontSize('sm');
                }}
                disabled={fontSize === 'sm'}
                className="p-1 rounded text-[var(--text-muted)] hover:text-white disabled:opacity-30 transition-colors"
                title="Decrease font size"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[10px] font-bold text-[var(--text-muted)] px-1 uppercase tracking-wider">
                {fontSize}
              </span>
              <button
                onClick={() => {
                  if (fontSize === 'sm') setFontSize('base');
                  else if (fontSize === 'base') setFontSize('lg');
                  else if (fontSize === 'lg') setFontSize('xl');
                }}
                disabled={fontSize === 'xl'}
                className="p-1 rounded text-[var(--text-muted)] hover:text-white disabled:opacity-30 transition-colors"
                title="Increase font size"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors hidden sm:block"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
              title="Close Reader (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Subheader Controls Bar (Navigation & Actions) ── */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/40 text-xs shrink-0 flex-wrap gap-2">
          {/* Page Turn Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || loading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all font-bold text-xs"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Jump to Page Form */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
              <span className="text-[11px] text-[var(--text-muted)] font-bold">Page</span>
              <input
                type="text"
                value={jumpPageInput}
                onChange={e => setJumpPageInput(e.target.value)}
                onBlur={handleJumpSubmit}
                className="w-12 px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-center text-xs font-black text-white focus:border-[var(--accent-main)] focus:outline-none"
              />
              <span className="text-[11px] text-[var(--text-muted)] font-bold">of {totalPages}</span>
            </form>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || loading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all font-bold text-xs"
              title="Next Page (Right Arrow)"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick Citation & External Links */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={copyPageCitation}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white border border-white/10 text-[11px] font-bold transition-colors"
              title="Copy Citation"
            >
              {copiedCitation ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span className="hidden md:inline">{copiedCitation ? 'Copied' : 'Citation'}</span>
            </button>

            <button
              onClick={copyFullText}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white border border-white/10 text-[11px] font-bold transition-colors"
              title="Copy Page Text"
            >
              {copiedText ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span className="hidden md:inline">{copiedText ? 'Text Copied' : 'Copy Text'}</span>
            </button>

            {alislamUrl && (
              <a
                href={alislamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--accent-main)]/30 text-[var(--accent-main)] border border-[var(--accent-main)]/30 text-[11px] font-bold transition-colors"
                title="View original scanned book on Alislam.org"
              >
                <span>Al Islam Scan</span>
                <ExternalLink size={10} />
              </a>
            )}

            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white border border-white/10 text-[11px] font-bold transition-colors hidden sm:flex"
                title="View on AhmadiyyaBooks.com"
              >
                <span>AhmadiyyaBooks</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        {/* ── In-Book Search Drawer (Cmd+F) ── */}
        {showInBookSearch && (
          <div className="border-b border-white/10 bg-black/60 backdrop-blur-md px-4 py-3 shrink-0 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              <div className="relative flex-1 flex items-center">
                <Search size={14} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" />
                <input
                  ref={inBookInputRef}
                  type="text"
                  value={inBookQuery}
                  onChange={e => {
                    const val = e.target.value;
                    setInBookQuery(val);
                    if (val.trim().length >= 2) {
                      executeInBookSearch(val);
                    } else if (!val.trim()) {
                      setInBookMatches([]);
                      setInBookSearched(false);
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      executeInBookSearch(inBookQuery);
                    }
                  }}
                  placeholder="Find words, names, or quotes in this book..."
                  className="w-full pl-9 pr-8 py-1.5 bg-white/5 border border-white/15 rounded-xl text-xs font-semibold text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)]"
                />
                {inBookQuery && (
                  <button
                    onClick={() => {
                      setInBookQuery('');
                      setInBookMatches([]);
                      setInBookSearched(false);
                    }}
                    className="absolute right-2.5 p-0.5 text-[var(--text-muted)] hover:text-white rounded"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {inBookLoading && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] shrink-0 font-medium">
                  <Loader2 size={13} className="animate-spin text-[var(--accent-main)]" />
                  <span className="hidden sm:inline">Searching...</span>
                </div>
              )}

              <button
                onClick={() => setShowInBookSearch(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                title="Close search drawer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Results strip / drawer */}
            {inBookSearched && !inBookLoading && inBookMatches.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-white/10 max-w-3xl mx-auto">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1.5 font-bold">
                  <span>{inBookMatches.length} matching page{inBookMatches.length !== 1 ? 's' : ''} found:</span>
                  <span className="text-[10px] text-[var(--text-dim)]">Click any page to jump</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {inBookMatches.map((m) => {
                    const isSelected = m.pageNum === currentPage;
                    return (
                      <button
                        key={m.pageNum}
                        onClick={() => setCurrentPage(m.pageNum)}
                        className={clsx(
                          "flex flex-col text-left p-2 rounded-xl border shrink-0 w-56 md:w-64 transition-all text-xs",
                          isSelected
                            ? "bg-[var(--accent-main)]/20 border-[var(--accent-main)] shadow-sm ring-1 ring-[var(--accent-main)]"
                            : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className={clsx(
                            "px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                            isSelected ? "bg-[var(--accent-main)] text-white" : "bg-white/10 text-[var(--text-muted)]"
                          )}>
                            Page {m.pageNum}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-bold text-[var(--accent-main)]">Current</span>
                          )}
                        </div>
                        <p
                          className="text-[11px] text-white/80 line-clamp-2 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: m.snippet }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {inBookSearched && !inBookLoading && inBookMatches.length === 0 && inBookQuery.trim() && (
              <div className="mt-2 text-center text-xs text-[var(--text-muted)]">
                No indexed occurrences of &quot;{inBookQuery}&quot; found in this book.
              </div>
            )}
          </div>
        )}

        {/* ── Reading Content Canvas ── */}
        <div
          ref={contentScrollRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 md:p-12 selection:bg-[var(--accent-main)]/30 selection:text-white"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4 text-[var(--text-muted)]">
              <Loader2 size={32} className="animate-spin text-[var(--accent-main)]" />
              <p className="text-xs font-bold tracking-wide">
                Retrieving Page {currentPage} from AhmadiyyaBooks.com...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4 max-w-md mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <X size={24} />
              </div>
              <h3 className="text-sm font-bold text-white">Unable to Load Book Page</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{error}</p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => fetchPage(currentPage)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Retry Page</span>
                </button>
                {alislamUrl && (
                  <a
                    href={alislamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[var(--accent-main)] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Read on Al Islam</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Page Number Heading */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-[var(--text-muted)]">
                <span className="uppercase tracking-widest font-black text-[10px]">
                  {title} • Page {currentPage}
                </span>
                <span className="text-[10px] font-bold">
                  {totalPages > 0 ? `${Math.round((currentPage / totalPages) * 100)}% complete` : ''}
                </span>
              </div>

              {/* Main Reading Text */}
              <article
                dir={isRtl ? 'rtl' : 'ltr'}
                className={clsx(
                  "leading-loose whitespace-pre-line text-white/90 selection:bg-[var(--accent-main)]/40",
                  isRtl ? "font-urdu text-right" : "font-serif text-left",
                  fontSize === 'sm' && (isRtl ? "text-base" : "text-sm"),
                  fontSize === 'base' && (isRtl ? "text-lg" : "text-base"),
                  fontSize === 'lg' && (isRtl ? "text-xl" : "text-lg"),
                  fontSize === 'xl' && (isRtl ? "text-2xl" : "text-xl")
                )}
              >
                {renderHighlightedContent(pageText, inBookQuery)}
              </article>

              {/* Bottom Page Footer Citation */}
              <div className="pt-8 border-t border-white/10 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Page {currentPage} of {totalPages}</span>
                {alislamUrl && (
                  <a
                    href={alislamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-main)] hover:underline flex items-center gap-1"
                  >
                    <span>Original scan on Alislam.org</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Keyboard Shortcut Bar ── */}
        <div className="px-4 py-2 border-t border-white/5 bg-black/60 flex items-center justify-between text-[10px] text-[var(--text-dim)] shrink-0 font-medium">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">←</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">→</kbd> to turn pages</span>
            <span className="hidden sm:inline">•</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">⌘F</kbd> search inside book</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline"><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">Esc</kbd> to close</span>
          </div>
          <span>Ahmadiyya Library Integration</span>
        </div>
      </div>
    </div>
  );
}
