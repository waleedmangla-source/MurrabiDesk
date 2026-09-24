"use client";
import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  ZoomIn,
  ZoomOut,
  Scroll,
  Layers,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { clsx } from 'clsx';
import type { QuranCommentaryResponse, CommentaryNoteItem } from '@/app/api/research/quran-commentary/route';
import QuranVerseWithHover from './QuranVerseWithHover';

interface QuranCommentaryModalProps {
  surah: number;
  verse: number;
  surahNameEnglish?: string;
  surahNameArabic?: string;
  initialArabicText?: string;
  initialEnglishText?: string;
  initialUrduText?: string;
  onClose: () => void;
}

type CommentaryTab = 'v5' | 'sc' | 'ts' | 'citations';

export default function QuranCommentaryModal({
  surah,
  verse,
  surahNameEnglish,
  surahNameArabic,
  initialArabicText,
  initialEnglishText,
  initialUrduText,
  onClose
}: QuranCommentaryModalProps) {
  const [data, setData] = useState<QuranCommentaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CommentaryTab>('v5');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch commentary on-demand
  useEffect(() => {
    let isMounted = true;
    async function fetchDetails() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/research/quran-commentary?surah=${surah}&verse=${verse}`);
        const json: QuranCommentaryResponse = await res.json();
        if (isMounted) {
          if (!json.success) {
            setError(json.error || 'Failed to load commentary.');
          } else {
            setData(json);
            // Default to short commentary if 5-volume is empty
            if (json.fiveVolumeCommentary.length === 0 && json.shortCommentary.length > 0) {
              setActiveTab('sc');
            } else if (json.fiveVolumeCommentary.length === 0 && json.shortCommentary.length === 0 && json.tafseerSagheer.length > 0) {
              setActiveTab('ts');
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Network error fetching commentary.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDetails();
    return () => { isMounted = false; };
  }, [surah, verse]);

  const copyCommentary = () => {
    const textToCopy = [
      `[Tafsir: Holy Qur'an Chapter ${surah}, Verse ${verse}]`,
      initialArabicText || data?.arabicText || '',
      `"${initialEnglishText || data?.englishTranslation || ''}"`,
      '',
      `Source: https://www.alislam.org/quran/${surah}:${verse}`
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const arabicText = data?.arabicText || initialArabicText;
  const englishText = data?.englishTranslation || initialEnglishText;
  const urduText = data?.urduTranslation || initialUrduText;

  const fontClasses = {
    sm: 'text-xs md:text-sm leading-relaxed',
    base: 'text-sm md:text-base leading-relaxed',
    lg: 'text-base md:text-lg leading-relaxed'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl glass bg-[#0f141a]/95 dark:bg-[#0c1015]/95 border border-white/10 shadow-2xl shadow-black/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold shrink-0 shadow-inner">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">
                  {surahNameEnglish ? `Surah ${surahNameEnglish}` : `Chapter ${surah}`} ({surah}:{verse})
                </h2>
                {surahNameArabic && (
                  <span className="text-xs font-arabic text-emerald-400/90 font-medium hidden sm:inline">
                    {surahNameArabic}
                  </span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                <span>Holy Qur'an Commentary</span>
                <span>•</span>
                <span className="text-emerald-400">Islam International Publications</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Font Size controls */}
            <div className="hidden sm:flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5 mr-1">
              <button
                type="button"
                onClick={() => setFontSize('sm')}
                className={clsx(
                  "p-1.5 rounded text-xs font-bold transition-all",
                  fontSize === 'sm' ? "bg-white/20 text-white" : "text-[var(--text-muted)] hover:text-white"
                )}
                title="Small text"
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={() => setFontSize('base')}
                className={clsx(
                  "p-1.5 rounded text-xs font-bold transition-all",
                  fontSize === 'base' ? "bg-white/20 text-white" : "text-[var(--text-muted)] hover:text-white"
                )}
                title="Normal text"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('lg')}
                className={clsx(
                  "p-1.5 rounded text-xs font-bold transition-all",
                  fontSize === 'lg' ? "bg-white/20 text-white" : "text-[var(--text-muted)] hover:text-white"
                )}
                title="Large text"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            <button
              type="button"
              onClick={copyCommentary}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all flex items-center gap-1 text-xs font-bold"
              title="Copy Citation"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Cite"}</span>
            </button>

            <a
              href={`https://www.alislam.org/quran/${surah}:${verse}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all flex items-center gap-1 text-xs font-bold"
              title="View on Al Islam"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Al Islam</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all ml-1"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6">
          {/* Scripture Card (Arabic + Translations) */}
          <div className="p-4 sm:p-5 rounded-xl glass bg-white/[0.03] border border-white/10 space-y-3.5">
            {arabicText && (
              <QuranVerseWithHover
                surahNumber={surah}
                verseNumber={verse}
                fallbackArabicText={arabicText}
                className={clsx(
                  "tracking-wide",
                  fontSize === 'sm' && "text-lg sm:text-xl",
                  fontSize === 'base' && "text-xl sm:text-2xl",
                  fontSize === 'lg' && "text-2xl sm:text-3xl"
                )}
              />
            )}

            {englishText && (
              <p className="text-sm sm:text-base text-[var(--foreground)]/90 leading-relaxed font-medium italic border-l-2 border-emerald-500/50 pl-3">
                "{englishText}"
              </p>
            )}

            {urduText && (
              <div
                dir="rtl"
                className="pt-2 border-t border-white/5 text-right font-urdu text-sm sm:text-base text-[var(--foreground)]/80 leading-loose"
              >
                {urduText}
              </div>
            )}
          </div>

          {/* Commentary Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar select-none text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('v5')}
              className={clsx(
                "px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0",
                activeTab === 'v5'
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
              )}
            >
              <Layers size={13} />
              <span>5-Volume Commentary</span>
              {data?.fiveVolumeCommentary?.length ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">
                  {data.fiveVolumeCommentary.length}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sc')}
              className={clsx(
                "px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0",
                activeTab === 'sc'
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
              )}
            >
              <BookMarked size={13} />
              <span>Short Commentary</span>
              {data?.shortCommentary?.length ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">
                  {data.shortCommentary.length}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ts')}
              className={clsx(
                "px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0",
                activeTab === 'ts'
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
              )}
            >
              <Scroll size={13} />
              <span>Tafseer-e-Sagheer (اُردو)</span>
              {data?.tafseerSagheer?.length ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">
                  {data.tafseerSagheer.length}
                </span>
              ) : null}
            </button>

            {Boolean(data?.citations?.length || data?.hadiths?.length) && (
              <button
                type="button"
                onClick={() => setActiveTab('citations')}
                className={clsx(
                  "px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0",
                  activeTab === 'citations'
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                )}
              >
                <Sparkles size={13} />
                <span>Cross References</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
                  {(data?.citations?.length || 0) + (data?.hadiths?.length || 0)}
                </span>
              </button>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
              <Loader2 size={28} className="animate-spin text-emerald-400" />
              <span className="text-xs font-semibold tracking-wider uppercase">
                Loading Five Volume Commentary from Al Islam...
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Tab 1: 5-Volume Commentary */}
          {!loading && !error && activeTab === 'v5' && (
            <div className="space-y-4">
              {data?.fiveVolumeCommentary && data.fiveVolumeCommentary.length > 0 ? (
                data.fiveVolumeCommentary.map((noteItem, idx) => (
                  <div
                    key={`v5-note-${idx}`}
                    className="p-4 sm:p-5 rounded-xl glass bg-white/[0.02] border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400/90 pb-2 border-b border-white/5">
                      <span>
                        {noteItem.isImportantWords ? '📖 Important Words Analysis' : `Five Volume Commentary (Note #${noteItem.ref})`}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        fontClasses[fontSize],
                        "text-[var(--foreground)]/90 prose prose-invert max-w-none prose-p:my-2 prose-headings:text-emerald-400 prose-strong:text-emerald-300"
                      )}
                      dangerouslySetInnerHTML={{ __html: noteItem.noteHtml }}
                    />
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] font-medium">
                  No extended Five Volume Commentary note recorded for this verse. Please check the Short Commentary tab.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Short Commentary */}
          {!loading && !error && activeTab === 'sc' && (
            <div className="space-y-4">
              {data?.shortCommentary && data.shortCommentary.length > 0 ? (
                data.shortCommentary.map((noteItem, idx) => (
                  <div
                    key={`sc-note-${idx}`}
                    className="p-4 sm:p-5 rounded-xl glass bg-white/[0.02] border border-white/10 space-y-2.5"
                  >
                    <div className="text-xs font-bold text-emerald-400/90 pb-2 border-b border-white/5">
                      Short Commentary by Malik Ghulam Farid (Note #{noteItem.ref})
                    </div>
                    <div
                      className={clsx(
                        fontClasses[fontSize],
                        "text-[var(--foreground)]/90 prose prose-invert max-w-none prose-p:my-2 prose-headings:text-emerald-400 prose-strong:text-emerald-300"
                      )}
                      dangerouslySetInnerHTML={{ __html: noteItem.noteHtml }}
                    />
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] font-medium">
                  No Short Commentary note available for this verse.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Tafseer-e-Sagheer (Urdu) */}
          {!loading && !error && activeTab === 'ts' && (
            <div className="space-y-4" dir="rtl">
              {data?.tafseerSagheer && data.tafseerSagheer.length > 0 ? (
                data.tafseerSagheer.map((noteItem, idx) => (
                  <div
                    key={`ts-note-${idx}`}
                    className="p-4 sm:p-5 rounded-xl glass bg-white/[0.02] border border-white/10 space-y-2.5 text-right font-urdu"
                  >
                    <div className="text-xs font-bold text-emerald-400/90 pb-2 border-b border-white/5">
                      تفسیر صغیر — نوٹ نمبر {noteItem.ref}
                    </div>
                    <div
                      className={clsx(
                        fontClasses[fontSize],
                        "text-[var(--foreground)]/90 leading-loose prose prose-invert max-w-none"
                      )}
                      dangerouslySetInnerHTML={{ __html: noteItem.noteHtml }}
                    />
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] font-medium">
                  اس آیت کے لیے تفسیر صغیر کا تفصیلی حاشیہ دستیاب نہیں ہے۔
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Connected Citations & Hadiths */}
          {!loading && !error && activeTab === 'citations' && (
            <div className="space-y-4">
              {data?.citations && data.citations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Jama'at & Promised Messiah (as) Literature Cross-References:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.citations.map((c, i) => (
                      <div
                        key={`cite-${i}`}
                        className="p-3 rounded-xl glass bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-[var(--foreground)]">{c.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-[var(--text-muted)]">
                          {c.slug}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data?.hadiths && data.hadiths.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Ahadith Traditions Connected to this Verse:
                  </h4>
                  <div className="space-y-1.5">
                    {data.hadiths.map((h, i) => (
                      <div
                        key={`hadith-${i}`}
                        className="p-3 rounded-xl glass bg-amber-500/5 border border-amber-500/15 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-[var(--foreground)]">{h.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400">
                          {h.slug}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
