"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Search,
  BookOpen,
  Send,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  BookMarked,
  ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';

interface CitationItem {
  pageId: string;
  bookSlug: string;
  title: string;
  author: string;
  pageNum: number;
  collection?: string;
  snippet?: string;
  alislamScanUrl?: string;
}

interface VerificationResult {
  totalQuotes: number;
  verifiedQuotes: number;
  unverifiedQuotes: string[];
  allVerified: boolean;
}

interface AskMurabbiAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBook: (slug: string, pageNum: number, title?: string, author?: string) => void;
  initialQuery?: string;
}

const SAMPLE_QUESTIONS = [
  {
    title: "Existence of God",
    q: "How does the Promised Messiah (as) establish the existence of God in Barahin-e-Ahmadiyya?"
  },
  {
    title: "Three States of Man",
    q: "Explain the natural, moral, and spiritual states of man in The Philosophy of the Teachings of Islam."
  },
  {
    title: "Jesus in India",
    q: "What evidence does the Promised Messiah (as) present in Jesus in India regarding the Rozabal tomb in Kashmir?"
  },
  {
    title: "True Prayer & Istighfar",
    q: "What is the true nature and philosophy of prayer according to the writings of the Promised Messiah (as)?"
  }
];

export default function AskMurabbiAIModal({
  isOpen,
  onClose,
  onOpenBook,
  initialQuery = ''
}: AskMurabbiAIModalProps) {
  const [query, setQuery] = useState<string>(initialQuery);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [answerText, setAnswerText] = useState<string>('');
  const [citations, setCitations] = useState<CitationItem[]>([]);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery && !hasSearched) {
        setQuery(initialQuery);
        handleAsk(initialQuery);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialQuery]);

  // Handle escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAsk = async (userQuestion: string) => {
    const clean = userQuestion.trim();
    if (!clean) return;

    setIsLoading(true);
    setError(null);
    setAnswerText('');
    setCitations([]);
    setVerification(null);
    setHasSearched(true);

    try {
      const res = await fetch('/api/research/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean, stream: true })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error ${res.status}`);
      }

      // Check if response is stream
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader();
        if (!reader) throw new Error('Streaming failed to start');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (payload.chunk) {
                  setAnswerText(prev => prev + payload.chunk);
                  if (chatScrollRef.current) {
                    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
                  }
                }
                if (payload.done) {
                  if (payload.citations) setCitations(payload.citations);
                  if (payload.verification) setVerification(payload.verification);
                }
              } catch (e) {
                // Ignore parse errors for split chunks
              }
            }
          }
        }
      } else {
        // Fallback standard JSON
        const data = await res.json();
        setAnswerText(data.answer || '');
        if (data.citations) setCitations(data.citations);
        if (data.verification) setVerification(data.verification);
      }
    } catch (err: any) {
      console.error('[AskMurabbiAI] Error:', err);
      setError(err.message || 'Failed to synthesize canonical response. Please verify Google AI API Key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  /**
   * Helper to render citations in markdown text as clickable buttons
   */
  const renderFormattedMarkdown = (text: string) => {
    // Break into paragraphs
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      // Check for headings
      if (para.startsWith('### ')) {
        return (
          <h4 key={pIdx} className="text-sm font-black text-white mt-4 mb-2 tracking-wide uppercase text-[var(--accent-main)]">
            {para.replace('### ', '')}
          </h4>
        );
      }
      if (para.startsWith('## ')) {
        return (
          <h3 key={pIdx} className="text-base font-black text-white mt-5 mb-2.5">
            {para.replace('## ', '')}
          </h3>
        );
      }
      if (para.startsWith('# ')) {
        return (
          <h2 key={pIdx} className="text-lg font-black text-white mt-6 mb-3">
            {para.replace('# ', '')}
          </h2>
        );
      }

      // Check for blockquotes
      if (para.startsWith('> ')) {
        return (
          <blockquote
            key={pIdx}
            className="my-3 pl-4 border-l-2 border-[var(--accent-main)] italic text-white/90 bg-[var(--accent-soft)]/20 p-3 rounded-r-xl text-xs sm:text-sm leading-relaxed"
          >
            {para.replace(/^>\s*/gm, '')}
          </blockquote>
        );
      }

      // Parse inline citations e.g. [Philosophy of the Teachings of Islam, Page 42]
      const citationRegex = /\[([^\]]+,\s*Page\s*\d+)\]/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = citationRegex.exec(para)) !== null) {
        if (match.index > lastIndex) {
          parts.push(para.slice(lastIndex, match.index));
        }

        const citationRaw = match[1];
        const pageMatch = citationRaw.match(/Page\s*(\d+)/i);
        const targetPage = pageMatch ? parseInt(pageMatch[1], 10) : 1;

        // Find citation in retrieved list
        const matchedCitation = citations.find(c =>
          citationRaw.toLowerCase().includes(c.title.toLowerCase().slice(0, 15)) ||
          c.pageNum === targetPage
        );

        parts.push(
          <button
            key={`cite-${match.index}`}
            onClick={() => {
              if (matchedCitation) {
                onOpenBook(matchedCitation.bookSlug, targetPage, matchedCitation.title, matchedCitation.author);
              }
            }}
            className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md bg-[var(--accent-soft)] hover:bg-[var(--accent-main)]/30 border border-[var(--accent-main)]/40 text-[var(--accent-main)] font-bold text-[11px] transition-all hover:scale-105"
            title={`Jump to ${citationRaw} in canonical reader`}
          >
            <BookOpen size={10} />
            <span>{citationRaw}</span>
          </button>
        );

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < para.length) {
        parts.push(para.slice(lastIndex));
      }

      return (
        <p key={pIdx} className="text-xs sm:text-sm text-white/90 leading-relaxed my-2.5">
          {parts.length > 0 ? parts : para}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col bg-[#070b19] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl h-[92vh] max-h-[850px] overflow-hidden">
        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--accent-main)] to-amber-500/80 flex items-center justify-center text-white shadow-lg shadow-[var(--accent-glow)]">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">Ask Murabbi AI</h2>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30">
                  Canonical RAG
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                Grounded in 1,531 Canonical Texts • Page-Level Citations • Verbatim Quote Verified
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Chat & Results Scroll Canvas ── */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 space-y-6"
        >
          {/* Welcome CTA when no search has been executed */}
          {!hasSearched && (
            <div className="max-w-2xl mx-auto py-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] flex items-center justify-center mx-auto shadow-2xl shadow-[var(--accent-glow)]">
                <Sparkles size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Scholarly Research Synthesis
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-lg mx-auto">
                  Ask theological, historical, and philosophical questions. Every answer is synthesized exclusively from canonical pages with exact word-for-word citations and zero hallucinations.
                </p>
              </div>

              {/* Sample Question Cards */}
              <div className="pt-4 text-left">
                <div className="text-[11px] font-black uppercase tracking-wider text-[var(--text-dim)] mb-3 text-center">
                  Suggested Research Topics
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SAMPLE_QUESTIONS.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(sq.q);
                        handleAsk(sq.q);
                      }}
                      className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--accent-main)]/50 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-[var(--accent-main)] mb-1">
                        <span>{sq.title}</span>
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-white/80 line-clamp-2 leading-snug">
                        {sq.q}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active / Completed Research Synthesis */}
          {hasSearched && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Question Banner */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                    <Search size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">Research Inquiry</div>
                    <div className="text-sm font-black text-white truncate">{query}</div>
                  </div>
                </div>

                {answerText && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors shrink-0"
                    title="Copy response"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {/* Error display */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <div className="flex-1 leading-relaxed">{error}</div>
                  <button
                    onClick={() => handleAsk(query)}
                    className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-bold text-xs shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Streaming loading state */}
              {isLoading && !answerText && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-[var(--text-muted)]">
                  <Loader2 size={28} className="animate-spin text-[var(--accent-main)]" />
                  <p className="text-xs font-bold tracking-wide">
                    Retrieving canonical pages from SQLite FTS5 & synthesizing citations...
                  </p>
                </div>
              )}

              {/* Synthesis Output Body */}
              {answerText && (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                      Grounded Theological Synthesis
                    </span>
                    {isLoading && (
                      <span className="flex items-center gap-1.5 text-[11px] text-[var(--accent-main)] font-bold animate-pulse">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Streaming...</span>
                      </span>
                    )}
                  </div>

                  <div className="prose prose-invert max-w-none text-white/90">
                    {renderFormattedMarkdown(answerText)}
                  </div>
                </div>
              )}

              {/* Verbatim Verification & Integrity Box */}
              {verification && (
                <div className="p-4 rounded-xl border bg-black/40 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>Verbatim Quote Verification Engine</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {verification.allVerified ? '100% Passed' : 'Checked'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {verification.totalQuotes > 0
                          ? `${verification.verifiedQuotes} of ${verification.totalQuotes} quotation(s) programmatically verified character-for-character against canonical source corpus.`
                          : 'All statements anchored directly to referenced primary source pages.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Citations Grid */}
              {citations.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                      <BookMarked size={14} className="text-[var(--accent-main)]" />
                      <span>Cited Canonical Sources ({citations.length})</span>
                    </h4>
                    <span className="text-[10px] text-[var(--text-dim)] font-medium">Click to open exact page in reader</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {citations.map((cite, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-white/10 bg-white/5 hover:border-[var(--accent-main)]/40 transition-all flex flex-col justify-between gap-2.5 group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30">
                              Page {cite.pageNum}
                            </span>
                            {cite.collection && (
                              <span className="text-[10px] font-semibold text-[var(--text-muted)] truncate max-w-[120px]">
                                {cite.collection}
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs font-black text-white group-hover:text-[var(--accent-main)] transition-colors line-clamp-1">
                            {cite.title}
                          </h5>
                          <p className="text-[10px] text-[var(--text-muted)] font-medium mb-2">
                            By {cite.author}
                          </p>
                          {cite.snippet && (
                            <p
                              className="text-[11px] text-white/70 line-clamp-2 leading-relaxed italic bg-black/30 p-2 rounded-lg border border-white/5"
                              dangerouslySetInnerHTML={{ __html: cite.snippet }}
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                          <button
                            onClick={() => onOpenBook(cite.bookSlug, cite.pageNum, cite.title, cite.author)}
                            className="flex-1 py-1 px-2.5 rounded-lg bg-[var(--accent-main)] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                          >
                            <BookOpen size={12} />
                            <span>Read Page {cite.pageNum}</span>
                          </button>
                          {cite.alislamScanUrl && (
                            <a
                              href={cite.alislamScanUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white border border-white/10 transition-colors"
                              title="Original Alislam Scan"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom Query Submission Bar ── */}
        <div className="p-4 border-t border-white/10 bg-black/60 backdrop-blur-md shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAsk(query);
            }}
            className="flex items-center gap-2.5 max-w-3xl mx-auto"
          >
            <div className="relative flex-1 flex items-center">
              <Search size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask a theological, historical, or scriptural question..."
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] focus:ring-1 focus:ring-[var(--accent-main)] disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-main)] to-amber-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md shadow-[var(--accent-glow)] shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="hidden sm:inline">Synthesizing...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span className="hidden sm:inline">Ask AI</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
