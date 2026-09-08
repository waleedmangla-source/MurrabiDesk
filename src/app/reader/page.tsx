"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, BookOpen, Search, Info, ChevronLeft, ChevronRight, Wand2, ChevronDown, Bookmark, BookText } from 'lucide-react';
import { clsx } from 'clsx';

// Map of Ruhani Khazain Volumes to major books contained within them
const KHAZAIN_BOOKS: Record<number, { title: string; urduTitle: string; pageStart: number }[]> = {
  1: [
    { title: "Barahin-e-Ahmadiyya Part 1 & 2", urduTitle: "براہین احمدیہ حصہ اول و دوم", pageStart: 1 }
  ],
  2: [
    { title: "Barahin-e-Ahmadiyya Part 3", urduTitle: "براہین احمدیہ حصہ سوم", pageStart: 1 },
    { title: "Purani Tehrirain", urduTitle: "پرانی تحریریں", pageStart: 275 }
  ],
  3: [
    { title: "Fath-e-Islam", urduTitle: "فتح اسلام", pageStart: 1 },
    { title: "Taudih-e-Maram", urduTitle: "توضیح مرام", pageStart: 41 },
    { title: "Izala-e-Auham", urduTitle: "ازالہ اوہام", pageStart: 101 }
  ],
  4: [
    { title: "Al-Haq Mubahatha Ludhiana", urduTitle: "مباحثہ لدھیانہ", pageStart: 1 },
    { title: "Al-Haq Mubahatha Delhi", urduTitle: "مباحثہ دہلی", pageStart: 131 },
    { title: "Asmani Faislah", urduTitle: "آسمانی فیصلہ", pageStart: 311 },
    { title: "Nishan-e-Asmani", urduTitle: "نشان آسمانی", pageStart: 361 }
  ],
  5: [
    { title: "Aina-e-Kamalat-e-Islam", urduTitle: "آئینہ کمالات اسلام", pageStart: 1 }
  ],
  6: [
    { title: "Barakat-ud-Dua", urduTitle: "برکات الدعا", pageStart: 1 },
    { title: "Hujjat-ul-Islam", urduTitle: "حجۃ الاسلام", pageStart: 45 },
    { title: "Sachai Ka Izhar", urduTitle: "سچائی کا اظہار", pageStart: 77 },
    { title: "Jang-e-Muqaddas", urduTitle: "جنگ مقدس", pageStart: 93 }
  ],
  7: [
    { title: "Shahadat-ul-Quran", urduTitle: "شہادت القرآن", pageStart: 1 },
    { title: "Tuhfa-e-Baghdad", urduTitle: "تحفہ بغداد", pageStart: 127 },
    { title: "Karamat-us-Sadiqeen", urduTitle: "کرامات الصادقین", pageStart: 153 },
    { title: "Hamamat-ul-Bushra", urduTitle: "حمامة البشرى", pageStart: 179 }
  ],
  8: [
    { title: "Nur-ul-Haq Part 1 & 2", urduTitle: "نور الحق حصہ اول و دوم", pageStart: 1 },
    { title: "Itmam-ul-Hujjah", urduTitle: "اتمام الحجة", pageStart: 275 },
    { title: "Sirr-ul-Khilafah", urduTitle: "سر الخلافة", pageStart: 317 }
  ],
  9: [
    { title: "Anwar-ul-Islam", urduTitle: "انوار الاسلام", pageStart: 1 },
    { title: "Minan-ur-Rahman", urduTitle: "منن الرحمٰن", pageStart: 125 },
    { title: "Arya Dharam", urduTitle: "آریہ دھرم", pageStart: 181 },
    { title: "Zia-ul-Haq", urduTitle: "ضیاء الحق", pageStart: 221 }
  ],
  10: [
    { title: "Islami Usul Ki Philosophy", urduTitle: "اسلامی اصول کی فلاسفی", pageStart: 1 },
    { title: "Sat Bachan", urduTitle: "ست بچن", pageStart: 111 }
  ],
  11: [
    { title: "Anjam-e-Atham", urduTitle: "انجام آتھم", pageStart: 1 }
  ],
  12: [
    { title: "Siraj-e-Munir", urduTitle: "سراج منیر", pageStart: 1 },
    { title: "Hujjatullah", urduTitle: "حجة الله", pageStart: 109 },
    { title: "Tuhfa-e-Qaisariyyah", urduTitle: "تحفہ قیصریہ", pageStart: 251 },
    { title: "Kitab-ul-Bariyyah", urduTitle: "کتاب البریہ", pageStart: 289 }
  ],
  13: [
    { title: "Kitab-ul-Bariyyah (cont.)", urduTitle: "کتاب البریہ (تکملہ)", pageStart: 1 },
    { title: "Ayyam-us-Sulh", urduTitle: "ایام الصلح", pageStart: 231 }
  ],
  14: [
    { title: "Zarurat-ul-Imam", urduTitle: "ضرورۃ الامام", pageStart: 1 },
    { title: "Haqiqat-ul-Mahdi", urduTitle: "حقیقت المہدی", pageStart: 49 },
    { title: "Masih Hindustan Mein", urduTitle: "مسیح ہندوستان میں", pageStart: 167 }
  ],
  15: [
    { title: "Tiryaq-ul-Qulub", urduTitle: "تریاق القلوب", pageStart: 1 }
  ],
  16: [
    { title: "Khutba Ilhamiyya", urduTitle: "خطبہ الہامیہ", pageStart: 1 },
    { title: "Lujjat-un-Nur", urduTitle: "لجة النور", pageStart: 337 }
  ],
  17: [
    { title: "Tuhfat-un-Nadwah", urduTitle: "تحفۃ الندوہ", pageStart: 1 },
    { title: "Arbaeen", urduTitle: "اربعین", pageStart: 341 }
  ],
  18: [
    { title: "Ijaz-ul-Masih", urduTitle: "اعجاز المسیح", pageStart: 1 },
    { title: "Dafi-ul-Bala", urduTitle: "دافع البلاء", pageStart: 221 },
    { title: "Al-Huda Wat-Tabsirah", urduTitle: "الهدى والتبصرة", pageStart: 247 }
  ],
  19: [
    { title: "Kashti-e-Nuh", urduTitle: "کشتی نوح", pageStart: 1 },
    { title: "Tadhkirat-ush-Shahadatain", urduTitle: "تذکرۃ الشہادتین", pageStart: 265 }
  ],
  20: [
    { title: "Siraj-ud-Din Isai Ke 4 Sawal", urduTitle: "سراج الدین عیسائی کے چار سوال", pageStart: 1 },
    { title: "Lecture Lahore", urduTitle: "لیکچر لاہور", pageStart: 145 },
    { title: "Lecture Sialkot", urduTitle: "لیکچر سیالکوٹ", pageStart: 201 },
    { title: "Lecture Ludhiana", urduTitle: "لیکچر لدھیانہ", pageStart: 251 }
  ],
  21: [
    { title: "Barahin-e-Ahmadiyya Part 5", urduTitle: "براہین احمدیہ حصہ پنجم", pageStart: 1 }
  ],
  22: [
    { title: "Haqiqat-ul-Wahi", urduTitle: "حقیقت الوحی", pageStart: 1 }
  ],
  23: [
    { title: "Chashma-e-Masihi", urduTitle: "چشمہ مسیحی", pageStart: 1 },
    { title: "Chashma-e-Marifat", urduTitle: "چشمہ معرفت", pageStart: 93 },
    { title: "Paigham-e-Sulh", urduTitle: "پیغام صلح", pageStart: 437 }
  ]
};

export default function RuhaniKhazainReader() {
  const [volumes, setVolumes] = useState<number[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<number | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown states for each volume book breakdown
  const [expandedVolumes, setExpandedVolumes] = useState<Record<number, boolean>>({ 1: true });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<{ summary: string, hardWords: {word: string, meaning: string}[] } | null>(null);

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
      {/* ── LEFT SIDEBAR: EXACT MAIL TAB PATTERN ── */}
      <div className="hidden lg:flex w-[260px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20">
        {/* Sidebar Title (identical to Mail tab) */}
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Reader
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)] opacity-70 mt-1">
            Ruhani Khazain
          </p>
        </div>

        {/* Currently Reading Top Section */}
        <div className="px-5 pt-2 pb-4 border-b border-white/5 mb-1">
          <div className="p-3 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/20 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)]">
                <Bookmark size={11} /> Currently Reading
              </span>
              <span className="text-[9px] font-mono font-bold text-[var(--accent-main)]">
                Vol {selectedVolume || 1} · P.{currentPage?.page_num || (currentPageIndex + 1)}
              </span>
            </div>

            {/* Current Book title */}
            {(() => {
              const currentBooks = KHAZAIN_BOOKS[selectedVolume || 1] || [];
              const activeBook = [...currentBooks].reverse().find(b => (currentPage?.page_num || (currentPageIndex + 1)) >= b.pageStart) || currentBooks[0];
              return (
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--foreground)] truncate">
                    {activeBook ? activeBook.title : `Volume ${selectedVolume || 1}`}
                  </span>
                  {activeBook && (
                    <span className="text-[11px] font-serif text-[var(--text-muted)] text-right" dir="rtl">
                      {activeBook.urduTitle}
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Volume & Book Breakdown Accordion List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">
            Volumes &amp; Books
          </div>

          {volumes.map(vol => {
            const isSelected = selectedVolume === vol;
            const isExpanded = !!expandedVolumes[vol];
            const books = KHAZAIN_BOOKS[vol] || [];

            return (
              <div key={vol} className="rounded-xl overflow-hidden transition-all">
                {/* Volume Header Row */}
                <div
                  onClick={() => setSelectedVolume(vol)}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer select-none group border",
                    isSelected
                      ? "bg-[var(--accent-soft)] text-[var(--accent-main)] font-black border-[var(--accent-main)]/30 shadow-sm"
                      : "border-transparent text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={clsx(
                      "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0",
                      isSelected ? "bg-[var(--accent-main)] text-white" : "bg-white/5 text-[var(--text-dim)]"
                    )}>
                      V{vol}
                    </span>
                    <span className="font-bold tracking-tight truncate">Volume {vol}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {books.length > 0 && (
                      <button
                        onClick={(e) => toggleVolumeDropdown(vol, e)}
                        className={clsx(
                          "p-1 rounded-lg hover:bg-white/10 transition-transform",
                          isExpanded ? "rotate-180 text-[var(--accent-main)]" : "opacity-40 hover:opacity-100"
                        )}
                        title="Toggle books"
                      >
                        <ChevronDown size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-books Dropdown List */}
                {isExpanded && books.length > 0 && (
                  <div className="ml-4 pl-2 my-1 border-l-2 border-white/10 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {books.map((book, idx) => {
                      const isCurrentBook = isSelected && (currentPage?.page_num || (currentPageIndex + 1)) >= book.pageStart;
                      return (
                        <button
                          key={idx}
                          onClick={async () => {
                            if (selectedVolume !== vol) {
                              setSelectedVolume(vol);
                            }
                            // Navigate to book start page if already loaded
                            const targetIdx = pages.findIndex(p => p.page_num === book.pageStart);
                            if (targetIdx !== -1) {
                              setCurrentPageIndex(targetIdx);
                              setAiData(null);
                            }
                          }}
                          className={clsx(
                            "w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all flex flex-col gap-0.5 group",
                            isCurrentBook
                              ? "bg-white/10 text-[var(--accent-main)] font-bold"
                              : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate flex-1">{book.title}</span>
                            <span className="text-[9px] font-mono opacity-50 shrink-0 ml-1">p.{book.pageStart}</span>
                          </div>
                          <span className="text-[10px] font-serif opacity-70 text-right" dir="rtl">
                            {book.urduTitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
