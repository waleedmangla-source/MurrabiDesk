"use client";
import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Clock,
  User,
  Calendar,
  Loader2,
  ChevronLeft,
  BookOpen,
  Share2,
  RefreshCw,
  Type
} from 'lucide-react';
import { clsx } from 'clsx';

interface ArticleReaderModalProps {
  url: string;
  initialTitle: string;
  source: string;
  author?: string;
  summary?: string;
  onClose: () => void;
}

interface ExtractedArticle {
  title: string;
  author?: string;
  date?: string;
  source: string;
  url: string;
  heroImage?: string;
  contentHtml: string;
  wordCount: number;
  readingTimeMinutes: number;
}

export default function ArticleReaderModal({
  url,
  initialTitle,
  source,
  author: initialAuthor,
  summary: initialSummary,
  onClose
}: ArticleReaderModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<ExtractedArticle | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [copied, setCopied] = useState(false);

  // Determine domain for favicon
  const domain = source === 'Al Hakam'
    ? 'alhakam.org'
    : source === 'Review of Religions'
    ? 'reviewofreligions.org'
    : source === 'Al Islam'
    ? 'alislam.org'
    : 'alfazl.com';

  const fetchArticleContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/research/article-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, source })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract article content');
      }
      setArticle(data.article);
    } catch (err: any) {
      console.warn('[Article Reader] Extraction error:', err);
      setError(err.message || 'Unable to load article content inside reader.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleContent();
  }, [url]);

  // Handle ESC key to close and disable body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const copyCitation = () => {
    const art = article || { title: initialTitle, author: initialAuthor, source, date: undefined, url };
    const citation = `[${art.author ? `${art.author}, ` : ''}"${art.title}", ${art.source}${art.date ? ` (${art.date})` : ''}]\n${art.url}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTitle = article?.title || initialTitle;
  const currentAuthor = article?.author || initialAuthor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Dark Ambient Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Reader Dialog Shell */}
      <div className="relative w-full max-w-4xl h-[92vh] flex flex-col rounded-2xl md:rounded-3xl glass bg-[#050713]/95 dark:bg-[#020310]/95 border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* ── TOP STICKY READER TOOLBAR ── */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 glass bg-black/40 backdrop-blur-md select-none">
          {/* Left Wing: Back & Source Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1 text-xs font-bold shrink-0"
              title="Return to search results (Esc)"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="h-4 w-px bg-white/10 shrink-0" />

            <div className="flex items-center gap-2 truncate">
              <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                  alt={source}
                  className="w-3.5 h-3.5 object-contain rounded-sm"
                  loading="lazy"
                />
              </div>
              <span className="font-bold text-xs text-[var(--foreground)] truncate">
                {source}
              </span>
              {article?.readingTimeMinutes && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-medium">
                  • <Clock size={11} /> {article.readingTimeMinutes} min read
                </span>
              )}
            </div>
          </div>

          {/* Right Wing: Reading Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Font Size Adjuster */}
            <div className="flex items-center glass bg-white/5 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setFontSize('sm')}
                className={clsx(
                  "px-2 py-1 rounded-lg text-xs font-bold transition-all",
                  fontSize === 'sm' ? "bg-[var(--accent-main)] text-white" : "text-[var(--text-muted)] hover:text-white"
                )}
                title="Small text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={clsx(
                  "px-2 py-1 rounded-lg text-xs font-bold transition-all",
                  fontSize === 'base' ? "bg-[var(--accent-main)] text-white" : "text-[var(--text-muted)] hover:text-white"
                )}
                title="Default text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={clsx(
                  "px-2 py-1 rounded-lg text-xs font-bold transition-all",
                  fontSize === 'lg' ? "bg-[var(--accent-main)] text-white" : "text-[var(--text-muted)] hover:text-white"
                )}
                title="Large text"
              >
                A+
              </button>
            </div>

            {/* Citation Copy Button */}
            <button
              onClick={copyCitation}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--text-muted)] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Copy Citation"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Cite"}</span>
            </button>

            {/* External link button */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
              title="Open original website in new tab"
            >
              <ExternalLink size={14} />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors ml-1"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── ARTICLE SCROLLABLE READING PANE ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 md:px-16 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header / Taxonomy */}
            <div className="space-y-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--text-muted)]">
                <span className="px-2.5 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30 font-black uppercase text-[10px] tracking-wider">
                  {source}
                </span>
                {article?.readingTimeMinutes && (
                  <span className="flex items-center gap-1 font-semibold text-[11px]">
                    <Clock size={12} className="text-[var(--accent-main)]" />
                    {article.readingTimeMinutes} min read ({article.wordCount} words)
                  </span>
                )}
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--foreground)] tracking-tight leading-tight font-serif">
                {currentTitle}
              </h1>

              {/* Author & Published Date */}
              <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--text-muted)] pt-1">
                {currentAuthor && (
                  <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)]">
                    <User size={13} className="text-[var(--accent-main)]" />
                    <span>By {currentAuthor}</span>
                  </div>
                )}
                {article?.date && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar size={13} className="text-[var(--accent-main)]" />
                    <span>{article.date}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Hero Image */}
            {article?.heroImage && (
              <div className="rounded-2xl overflow-hidden border border-white/10 max-h-96 shadow-lg">
                <img
                  src={article.heroImage}
                  alt={currentTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 size={36} className="animate-spin text-[var(--accent-main)]" />
                <p className="text-sm font-bold text-[var(--text-muted)] tracking-wide">
                  Extracting article text from {source}...
                </p>
                {initialSummary && (
                  <div className="p-4 rounded-xl glass bg-white/5 border border-white/10 text-sm text-[var(--text-muted)] italic max-w-lg text-center mt-4">
                    "{initialSummary}"
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-4 my-8">
                <p className="text-sm font-bold text-red-400">
                  {error}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={fetchArticleContent}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} />
                    Try Again
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    Open on {source}
                  </a>
                </div>
              </div>
            )}

            {/* Full Article Content */}
            {!loading && !error && article && (
              <div
                className={clsx(
                  "article-reader-body select-text transition-all",
                  fontSize === 'sm' && "text-sm leading-relaxed",
                  fontSize === 'base' && "text-base leading-relaxed md:leading-loose",
                  fontSize === 'lg' && "text-lg leading-loose",
                  fontSize === 'xl' && "text-xl leading-loose"
                )}
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              />
            )}

            {/* Fallback to summary if no content HTML */}
            {!loading && !error && (!article || !article.contentHtml) && initialSummary && (
              <div className="p-6 rounded-2xl glass bg-white/5 border border-white/10 text-base leading-relaxed text-[var(--foreground)]">
                {initialSummary}
              </div>
            )}

            {/* Bottom Citation & Attribution Box */}
            {!loading && !error && (
              <div className="pt-8 pb-12 border-t border-white/10 mt-12 space-y-3">
                <div className="p-4 rounded-xl glass bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[var(--foreground)] block">
                      Published by {source}
                    </span>
                    <span className="text-[var(--text-muted)] text-[11px]">
                      Read and formatted in Murabbi Desk Research Reader
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyCitation}
                      className="px-3 py-1.5 rounded-lg bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copied ? "Copied" : "Copy Citation"}</span>
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg glass bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white border border-white/10 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <ExternalLink size={13} />
                      <span>Original</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
