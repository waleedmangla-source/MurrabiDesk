"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen, Search, Info, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function RuhaniKhazainReader() {
  const [volumes, setVolumes] = useState<number[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<number | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<{ summary: string, hardWords: {word: string, meaning: string}[] } | null>(null);
  
  useEffect(() => {
    // We know we processed volumes 1-23. Let's list them.
    const vols = Array.from({length: 23}, (_, i) => i + 1);
    setVolumes(vols);
    setSelectedVolume(1);
  }, []);

  useEffect(() => {
    if (selectedVolume === null) return;
    
    const fetchVolume = async () => {
      setLoading(true);
      setError(null);
      setAiData(null);
      try {
        const res = await fetch(`/ruhani-khazain/volume_${selectedVolume}.json`);
        if (!res.ok) throw new Error('Volume not found');
        const data = await res.json();
        setPages(data.pages || []);
        setCurrentPageIndex(0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVolume();
  }, [selectedVolume]);

  const currentPage = pages[currentPageIndex];

  const handleAnalyze = async () => {
    if (!currentPage?.text) return;
    setAiLoading(true);
    setAiData(null);
    try {
      const res = await fetch('/api/beta/khazain-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentPage.text })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper to render text with tooltips for hard words
  const renderText = (text: string) => {
    if (!aiData?.hardWords || aiData.hardWords.length === 0) {
      return <span>{text}</span>;
    }
    
    let rendered = text;
    // VERY simple string replacement (has flaws with sub-word matching but works for prototype)
    // A better approach would be regex word boundaries, but Urdu word boundaries can be tricky.
    
    // Sort words by length descending so longer words get replaced first
    const sortedWords = [...aiData.hardWords].sort((a, b) => b.word.length - a.word.length);
    
    // Using a simple split/map to avoid regex issues with Arabic/Urdu chars
    // This is a naive approach, let's refine:
    
    // For now, we'll just return it as a single element, but in React we need an array of elements.
    // Let's do a safer pass:
    let elements: React.ReactNode[] = [text];
    
    sortedWords.forEach(({ word, meaning }) => {
      const newElements: React.ReactNode[] = [];
      elements.forEach(element => {
        if (typeof element === 'string') {
          const parts = element.split(word);
          parts.forEach((part, i) => {
            newElements.push(part);
            if (i < parts.length - 1) {
              newElements.push(
                <span key={`${word}-${i}`} className="group relative inline-block cursor-help text-indigo-800 font-bold border-b-2 border-indigo-500/60 hover:bg-indigo-50 rounded px-1 transition-colors">
                  {word}
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-white text-zinc-900 border border-zinc-200 shadow-xl text-xs font-medium p-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 text-right leading-relaxed" dir="rtl">
                    {meaning}
                  </span>
                </span>
              );
            }
          });
        } else {
          newElements.push(element);
        }
      });
      elements = newElements;
    });

    return <>{elements.map((el, i) => <React.Fragment key={i}>{el}</React.Fragment>)}</>;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-transparent">
      {/* ── LEFT SIDEBAR: VOLUME NAVIGATION ── */}
      <div className="w-full lg:w-[260px] shrink-0 h-auto lg:h-full flex flex-col border-r border-white/5 glass bg-black/20">
        <div className="px-5 pt-7 pb-4 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-[var(--foreground)] uppercase leading-none">
              Reader
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)] opacity-70 mt-1">
              Ruhani Khazain
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {volumes.map(vol => {
            const isSelected = selectedVolume === vol;
            return (
              <button
                key={vol}
                onClick={() => setSelectedVolume(vol)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left group",
                  isSelected
                    ? "bg-[var(--accent-soft)] text-[var(--accent-main)] font-black border border-[var(--accent-main)]/30 shadow-sm"
                    : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={clsx(
                    "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md",
                    isSelected ? "bg-[var(--accent-main)] text-white" : "bg-white/5 text-[var(--text-dim)]"
                  )}>
                    V{vol}
                  </span>
                  <span className="font-bold tracking-tight">Volume {vol}</span>
                </div>
                <ChevronRight 
                  size={14} 
                  className={clsx(
                    "transition-transform opacity-40 group-hover:opacity-100",
                    isSelected && "opacity-100 text-[var(--accent-main)] translate-x-0.5"
                  )} 
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT: BOOK READING VIEW ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-black/10">
        {/* Top Control Bar */}
        <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between glass bg-black/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)] opacity-75">
                Current Volume
              </span>
              <h2 className="text-sm font-black italic tracking-tight text-[var(--foreground)]">
                {loading ? "Loading..." : `Volume ${selectedVolume || 1}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setCurrentPageIndex(Math.max(0, currentPageIndex - 1)); setAiData(null); }}
              disabled={currentPageIndex === 0 || loading}
              className="p-2 rounded-xl glass border border-white/10 text-[var(--foreground)] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
              title="Previous Page"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="px-3 py-1.5 rounded-xl glass border border-white/5 bg-white/5 text-xs font-mono font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <span>Page</span>
              <span className="text-[var(--accent-main)]">{currentPage?.page_num || (currentPageIndex + 1)}</span>
              <span className="opacity-30">/</span>
              <span className="opacity-60">{pages.length || "..."}</span>
            </div>

            <button 
              onClick={() => { setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1)); setAiData(null); }}
              disabled={currentPageIndex === pages.length - 1 || loading}
              className="p-2 rounded-xl glass border border-white/10 text-[var(--foreground)] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
              title="Next Page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Reading Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex justify-center">
          {loading ? (
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
            <div className="w-full max-w-3xl my-auto">
              {/* Paper Sheet Container */}
              <div className="bg-[#fbf8f1] text-zinc-900 shadow-2xl rounded-xl p-8 md:p-14 border border-[#e5decb] relative">
                {/* Page Number Watermark / Header in Book */}
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 mb-8 text-[11px] font-mono text-zinc-500 select-none">
                  <span>Ruhani Khazain · Vol {selectedVolume}</span>
                  <span className="font-bold text-zinc-800">Page {currentPage.page_num || (currentPageIndex + 1)}</span>
                </div>

                <div 
                  className="text-2xl md:text-[26px] leading-[2.6] font-serif text-justify text-zinc-950 whitespace-pre-wrap select-text tracking-wide" 
                  dir="rtl"
                  style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
                >
                  {renderText(currentPage.text)}
                </div>

                {/* Page Bottom Footer */}
                <div className="mt-10 pt-4 border-t border-zinc-200/70 flex justify-center text-[10px] font-mono text-zinc-400 select-none">
                  — {currentPage.page_num || (currentPageIndex + 1)} —
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
      </div>

      {/* ── RIGHT PANEL: AI CONTEXT & VOCABULARY ── */}
      <div className="w-full lg:w-[320px] shrink-0 border-l border-white/5 glass bg-black/20 flex flex-col h-auto lg:h-full">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
              <Wand2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black italic tracking-tight text-[var(--foreground)] uppercase">
                AI Assistant
              </h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] opacity-70">
                Context & Meaning
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          <button
            onClick={handleAnalyze}
            disabled={aiLoading || !currentPage}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg hover:opacity-90"
            style={{ background: 'var(--accent-main)' }}
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {aiLoading ? "Analyzing Page..." : "Analyze Current Page"}
          </button>

          {aiData && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              {/* Summary Card */}
              <div className="glass-card p-4 rounded-xl border border-white/5 bg-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)]">
                  <Info size={13} />
                  <span>Page Synopsis</span>
                </div>
                <p className="text-xs text-[var(--foreground)]/90 leading-relaxed font-medium">
                  {aiData.summary}
                </p>
              </div>

              {/* Hard Words Gloss */}
              {aiData.hardWords && aiData.hardWords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)] opacity-70">
                      Difficult Words ({aiData.hardWords.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {aiData.hardWords.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="glass p-3 rounded-xl border border-white/5 bg-white/5 text-right flex flex-col items-end gap-1 group hover:border-[var(--accent-main)]/30 transition-colors" 
                        dir="rtl"
                      >
                        <span className="font-bold text-[var(--accent-main)] text-base font-serif">
                          {item.word}
                        </span>
                        <span className="text-xs text-[var(--foreground)]/80 leading-normal font-sans">
                          {item.meaning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!aiData && !aiLoading && (
            <div className="p-6 text-center text-xs text-[var(--text-dim)] border border-dashed border-white/10 rounded-xl">
              Tap &ldquo;Analyze Current Page&rdquo; to extract archaic vocabulary definitions and an executive summary.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
