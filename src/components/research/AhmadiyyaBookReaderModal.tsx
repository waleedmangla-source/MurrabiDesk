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
  Loader2
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

  // Sync initialPage when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(initialPage);
      setJumpPageInput(String(initialPage));
      if (bookTitle) setTitle(bookTitle);
      if (bookAuthor) setAuthor(bookAuthor);
      if (coverUrl) setCover(coverUrl);
    }
  }, [isOpen, initialPage, bookTitle, bookAuthor, coverUrl]);

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
      // Don't intercept if user is typing in the jump input
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
  }, [isOpen, currentPage, totalPages, onClose]);

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
                {pageText}
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
            <span className="hidden sm:inline"><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">Esc</kbd> to close</span>
          </div>
          <span>Ahmadiyya Library Integration</span>
        </div>
      </div>
    </div>
  );
}
