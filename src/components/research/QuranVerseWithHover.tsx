"use client";

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import type { QuranWordToken, QuranVerseWbwData } from '@/app/api/research/quran-wbw/route';

// Global client-side in-memory cache
const clientWbwCache = new Map<string, QuranVerseWbwData>();
const pendingFetches = new Map<string, Promise<QuranVerseWbwData | null>>();

/**
 * Prefetches word-by-word data for an array of verses in batch
 */
export async function prefetchQuranWords(verses: Array<{ surah: number; verse: number }>) {
  if (typeof window === 'undefined' || !verses.length) return;

  const needed = verses.filter(({ surah, verse }) => {
    const key = `${surah}:${verse}`;
    return !clientWbwCache.has(key) && !pendingFetches.has(key);
  });

  if (needed.length === 0) return;

  try {
    const res = await fetch('/api/research/quran-wbw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verses: needed })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.verses) {
        Object.entries(json.verses).forEach(([k, data]) => {
          clientWbwCache.set(k, data as QuranVerseWbwData);
        });
      }
    }
  } catch (err) {
    // Non-blocking background prefetch
  }
}

async function fetchSingleVerse(surah: number, verse: number): Promise<QuranVerseWbwData | null> {
  const key = `${surah}:${verse}`;
  if (clientWbwCache.has(key)) return clientWbwCache.get(key)!;
  if (pendingFetches.has(key)) return pendingFetches.get(key)!;

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`/api/research/quran-wbw?surah=${surah}&verse=${verse}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (json.success && json.data) {
        clientWbwCache.set(key, json.data);
        return json.data as QuranVerseWbwData;
      }
      return null;
    } catch {
      return null;
    } finally {
      pendingFetches.delete(key);
    }
  })();

  pendingFetches.set(key, fetchPromise);
  return fetchPromise;
}

interface QuranVerseWithHoverProps {
  surahNumber: number;
  verseNumber: number;
  fallbackArabicText: string;
  className?: string;
  showBadge?: boolean;
}

function QuranVerseWithHoverComponent({
  surahNumber,
  verseNumber,
  fallbackArabicText,
  className,
  showBadge = false
}: QuranVerseWithHoverProps) {
  const key = `${surahNumber}:${verseNumber}`;
  const [wbwData, setWbwData] = useState<QuranVerseWbwData | null>(() => clientWbwCache.get(key) || null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync if cache gets updated externally (e.g. by background prefetch)
  useEffect(() => {
    const currentKey = `${surahNumber}:${verseNumber}`;
    if (!wbwData && clientWbwCache.has(currentKey)) {
      setWbwData(clientWbwCache.get(currentKey)!);
    }
  }, [surahNumber, verseNumber, wbwData]);

  // Load word-for-word data lazily on first hover/touch/interaction
  const ensureLoaded = React.useCallback(() => {
    const currentKey = `${surahNumber}:${verseNumber}`;
    if (clientWbwCache.has(currentKey)) {
      setWbwData(clientWbwCache.get(currentKey)!);
      return;
    }
    if (wbwData || isLoading) return;

    setIsLoading(true);
    fetchSingleVerse(surahNumber, verseNumber).then(data => {
      setIsLoading(false);
      if (data) {
        setWbwData(data);
      }
    }).catch(() => {
      setIsLoading(false);
    });
  }, [surahNumber, verseNumber, wbwData, isLoading]);

  // Click outside to dismiss active touch tooltip on mobile
  useEffect(() => {
    if (hoveredIndex === null) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setHoveredIndex(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [hoveredIndex]);

  // Fallback rendering while loading or if data is missing
  if (!wbwData || !wbwData.tokens || wbwData.tokens.length === 0) {
    return (
      <div
        ref={containerRef}
        onMouseEnter={ensureLoaded}
        onTouchStart={ensureLoaded}
        dir="rtl"
        className={clsx("text-right font-arabic select-text cursor-pointer", className)}
        title="Hover to view word-for-word translation"
      >
        {fallbackArabicText}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={ensureLoaded}
      onTouchStart={ensureLoaded}
      className="relative group/verse"
    >
      <div
        dir="rtl"
        className={clsx("text-right font-arabic select-text leading-loose", className)}
      >
        {wbwData.tokens.map((token, idx) => {
          const hasTranslation = Boolean(token.translation);
          const isHovered = hoveredIndex === idx;

          if (!hasTranslation) {
            return (
              <React.Fragment key={`token-${idx}`}>
                <span
                  className={clsx(
                    "inline-block px-0.5",
                    token.isVerseMarker ? "text-emerald-500/80 font-bold" : "text-[var(--foreground)]/70"
                  )}
                >
                  {token.ar}
                </span>
                {" "}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={`token-${idx}`}>
              <span
                className="relative inline-block group/word cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredIndex(prev => prev === idx ? null : idx);
                }}
              >
                <span
                  className={clsx(
                    "px-1 py-0.5 rounded transition-all duration-150 inline-block",
                    isHovered
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "hover:bg-emerald-500/10 hover:text-emerald-300"
                  )}
                >
                  {token.ar}
                </span>

                {/* Floating Tooltip with exact Al Islam translation */}
                {isHovered && token.translation && (
                  <span
                    dir="ltr"
                    className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 flex flex-col items-center animate-in fade-in-0 zoom-in-95 duration-150 select-none whitespace-normal"
                    style={{ minWidth: '110px', maxWidth: '260px' }}
                  >
                    <span className="bg-[#070b18]/95 dark:bg-[#070b18]/95 backdrop-blur-md border border-emerald-500/40 text-white px-3 py-1.5 rounded-xl shadow-2xl shadow-black/80 text-center w-full">
                      <span className="block text-[9px] uppercase tracking-wider font-extrabold text-emerald-400">
                        Al Islam • Word Translation
                      </span>
                      <span className="block text-xs sm:text-sm font-semibold text-zinc-100 mt-0.5 font-sans leading-snug">
                        {token.translation}
                      </span>
                    </span>
                    <span className="w-2.5 h-2.5 bg-[#070b18] border-r border-b border-emerald-500/40 rotate-45 -mt-1.5" />
                  </span>
                )}
              </span>
              {" "}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const QuranVerseWithHover = React.memo(QuranVerseWithHoverComponent);
export default QuranVerseWithHover;
