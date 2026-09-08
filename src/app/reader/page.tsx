"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Loader2, BookOpen, Search, Info, ChevronLeft, ChevronRight, Wand2, ChevronDown, Bookmark, BookText, ExternalLink, Globe, X } from 'lucide-react';
import { clsx } from 'clsx';
import { URDU_STOPWORDS } from '@/lib/urdu-stopwords';

interface SelectedWordInfo {
  word: string;
  translit?: string;
  englishMeaning?: string;
  rekhtaUrl: string;
  googleUrl: string;
  loading?: boolean;
}

function toUrduNumerals(num: number | string): string {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => urduDigits[parseInt(d, 10)]);
}

// Map of Ruhani Khazain Volumes to major books contained within them
const KHAZAIN_BOOKS: Record<number, { title: string; urduTitle: string; pageStart: number }[]> = {
  1: [
    { title: "Barahin-e-Ahmadiyya Part 1", urduTitle: "براہین احمدیہ حصہ اول", pageStart: 1 },
    { title: "Barahin-e-Ahmadiyya Part 2", urduTitle: "براہین احمدیہ حصہ دوم", pageStart: 55 }
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

  // Pre-compiled English dictionary & Selected Word Inspector
  const [dictionary, setDictionary] = useState<Record<string, { translit?: string; meaning: string }>>({});
  const [selectedWord, setSelectedWord] = useState<SelectedWordInfo | null>(null);

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

    // Fast binary search to find maximum font size (10px to 21px in 0.5px steps)
    // where content fits inside the available inner Jadwal frame
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

  // Auto-fit text whenever the current page, volume, or page text changes
  useEffect(() => {
    fitTextToPage();
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        fitTextToPage();
      });
    }
  }, [fitTextToPage, currentPageIndex, selectedVolume, pages, currentPage?.text]);

  // Re-fit text on container resize (e.g., window resizing or sidebar toggle)
  useEffect(() => {
    const container = innerContainerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      fitTextToPage();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [fitTextToPage]);

  // Select a word to inspect in the right-hand panel & fetch live definition if needed
  const handleSelectWord = useCallback(async (rawWord: string) => {
    const word = rawWord.trim().replace(/[۔،؛؟!:\(\)\[\]"'\-_«»]/g, '').trim();
    if (!word) return;

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
  }, [dictionary]);

  // Helper to render text with automatic vocabulary tooltips and click-to-inspect
  const renderText = (text: string) => {
    if (!text) return null;

    const paragraphs = text.split('\n');

    return (
      <>
        {paragraphs.map((para, pIdx) => {
          if (!para.trim()) {
            return <div key={pIdx} className="h-2" />;
          }

          // Split line into words and delimiters while preserving spaces & punctuation
          const tokens = para.split(/(\s+|[۔،؛؟!:\(\)\[\]"'\-_«»]+)/);

          return (
            <p key={pIdx} className="mb-1 sm:mb-1.5 indent-6 sm:indent-8 leading-[1.82] text-justify">
              {tokens.map((token, tIdx) => {
                const clean = token.trim().replace(/[۔،؛؟!:\(\)\[\]"'\-_«»]/g, '');
                if (!clean) {
                  return <React.Fragment key={tIdx}>{token}</React.Fragment>;
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
                      key={tIdx}
                      onClick={() => handleSelectWord(clean)}
                      className={clsx(
                        "group relative inline cursor-pointer px-0.5 rounded transition-all select-text",
                        isSelected
                          ? "bg-[var(--accent-soft)] text-[var(--accent-main)] font-black ring-2 ring-[var(--accent-main)]/50"
                          : "text-black font-bold border-b border-indigo-500/70 hover:bg-indigo-50/80 transition-colors"
                      )}
                    >
                      {token}
                      {/* White Tooltip Bubble with English definition & Rekhta/Google links */}
                      <span
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 md:w-72 bg-white text-zinc-900 border border-zinc-200 shadow-2xl p-3.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 text-left font-sans cursor-default pointer-events-none group-hover:pointer-events-auto select-none"
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

                // Regular word: also clickable to inspect in the right-hand panel
                return (
                  <span
                    key={tIdx}
                    onClick={() => handleSelectWord(clean)}
                    className={clsx(
                      "cursor-pointer hover:bg-zinc-100 rounded px-0.5 transition-colors select-text text-black",
                      isSelected && "bg-[var(--accent-soft)] text-[var(--accent-main)] font-bold ring-2 ring-[var(--accent-main)]/50"
                    )}
                  >
                    {token}
                  </span>
                );
              })}
            </p>
          );
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-transparent">
      {/* ── Panel 1: Folder Sidebar — Desktop only (Identical to Mail Tab) ── */}
      <div className="hidden lg:flex w-[240px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20">
        {/* Sidebar Title */}
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Reader
          </h1>
        </div>

        {/* Currently Reading Header */}
        <div className="px-5 pt-1 pb-4 border-b border-white/5 mb-2">
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
              const pageNum = currentPage?.page_num || (currentPageIndex + 1);
              const activeBook = [...currentBooks].reverse().find(b => pageNum >= b.pageStart) || currentBooks[0];
              return (
                <div className="flex flex-col pt-0.5">
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

        {/* Tab Content & Volumes Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <nav className="py-2 space-y-px">
            {volumes.map(vol => {
              const isSelected = selectedVolume === vol;
              const isExpanded = !!expandedVolumes[vol];
              const books = KHAZAIN_BOOKS[vol] || [];

              return (
                <div key={vol} className="flex flex-col">
                  {/* Volume Navigation Row (Identical to Mail Folder Row) */}
                  <div
                    onClick={() => setSelectedVolume(vol)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-5 py-3 transition-all text-left border-l-2 cursor-pointer select-none group",
                      isSelected
                        ? "font-black text-white border-[var(--accent-main)]"
                        : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--foreground)] border-transparent"
                    )}
                    style={isSelected ? { background: 'rgba(0, 0, 0, 0.2)' } : {}}
                  >
                    <BookOpen size={15} className={clsx("shrink-0", isSelected ? "text-[var(--accent-main)]" : "opacity-60")} />
                    <span className="text-xs font-bold flex-1 truncate">Volume {vol}</span>

                    {/* Volume Pill Badge */}
                    <span className={clsx(
                      "text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0",
                      isSelected ? "bg-white/20 text-white" : "bg-[var(--accent-soft)] text-[var(--accent-main)]"
                    )}>
                      V{vol}
                    </span>

                    {/* Book Dropdown Chevron Toggle */}
                    {books.length > 0 && (
                      <button
                        onClick={(e) => toggleVolumeDropdown(vol, e)}
                        className="p-1 rounded hover:bg-white/10 text-[var(--text-dim)] hover:text-white transition-all ml-0.5"
                        title="Toggle books"
                      >
                        <ChevronDown 
                          size={12} 
                          className={clsx("transition-transform duration-200", isExpanded && "rotate-180 text-[var(--accent-main)]")} 
                        />
                      </button>
                    )}
                  </div>

                  {/* Sub-books Dropdown List */}
                  {isExpanded && books.length > 0 && (
                    <div className="bg-black/10 py-1 space-y-0.5 border-l-2 border-[var(--accent-main)]/30 ml-5 pl-2">
                      {books.map((book, idx) => {
                        const isCurrentBook = isSelected && (currentPage?.page_num || (currentPageIndex + 1)) >= book.pageStart;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (selectedVolume !== vol) {
                                setSelectedVolume(vol);
                              }
                              const targetIdx = pages.findIndex(p => p.page_num === book.pageStart);
                              if (targetIdx !== -1) {
                                setCurrentPageIndex(targetIdx);
                              }
                            }}
                            className={clsx(
                              "w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-between group",
                              isCurrentBook
                                ? "font-bold text-white bg-white/10"
                                : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-white/5"
                            )}
                          >
                            <span className="truncate flex-1 font-medium">{book.title}</span>
                            <span className="text-[10px] font-serif text-[var(--text-dim)] group-hover:text-[var(--text-muted)] ml-1 shrink-0" dir="rtl">
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
          </nav>
        </div>
      </div>

      {/* ── MAIN CONTENT: BOOK READING VIEW ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-black/10 relative overflow-hidden">
        {/* Top Control Bar (Clean header with volume title) */}
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
            <div className="px-3 py-1.5 rounded-xl glass border border-white/5 bg-white/5 text-xs font-mono font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <span>Page</span>
              <span className="text-[var(--accent-main)]">{currentPage?.page_num || (currentPageIndex + 1)}</span>
              <span className="opacity-30">/</span>
              <span className="opacity-60">{pages.length || "..."}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Reading Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-28 flex justify-center">
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
                      const currentBooks = KHAZAIN_BOOKS[selectedVolume || 1] || [];
                      const pageNum = currentPage?.page_num || (currentPageIndex + 1);
                      const active = [...currentBooks].reverse().find(b => pageNum >= b.pageStart) || currentBooks[0];
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
                        className="text-justify text-black select-text w-full flex-1 flex flex-col justify-start" 
                        dir="rtl"
                        style={{ 
                          fontFamily: "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Regular', 'Noto Nastaliq Urdu', serif",
                          textAlignLast: 'right',
                          lineHeight: 1.82,
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
        {currentPage && !loading && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center">
            <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl glass bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.02]">
              {/* Previous Page Button */}
              <button 
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0 || loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--foreground)] border border-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 group"
                title="Previous Page"
              >
                <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                <span className="text-xs font-bold uppercase tracking-wider">Prev</span>
              </button>

              {/* Page Indicator Badge */}
              <div className="px-3 py-1 text-xs font-mono font-black text-white flex items-center gap-1.5 border-x border-white/10">
                <span className="text-[var(--accent-main)]">{currentPage?.page_num || (currentPageIndex + 1)}</span>
                <span className="opacity-30">/</span>
                <span className="opacity-60">{pages.length || "..."}</span>
              </div>

              {/* Next Page Button */}
              <button 
                onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === pages.length - 1 || loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--foreground)] border border-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 group"
                title="Next Page"
              >
                <span className="text-xs font-bold uppercase tracking-wider">Next</span>
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: CURRENTLY SELECTED WORD ONLY ── */}
      <div className="w-full lg:w-[320px] shrink-0 border-l border-white/5 glass bg-black/20 flex flex-col h-auto lg:h-full">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
              <Search size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black italic tracking-tight text-[var(--foreground)] uppercase">
                Word Inspector
              </h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] opacity-70">
                Selected Term
              </p>
            </div>
          </div>

          {selectedWord && (
            <button
              onClick={() => setSelectedWord(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--foreground)] transition-colors"
              title="Clear selection"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
          {selectedWord ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
              {/* Word Header Card */}
              <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
                <div className="text-4xl font-serif font-bold text-[var(--foreground)] py-1 select-text" dir="rtl">
                  {selectedWord.word}
                </div>
                {selectedWord.translit && (
                  <span className="text-xs font-mono italic text-[var(--accent-main)] font-semibold mt-1">
                    /{selectedWord.translit}/
                  </span>
                )}
              </div>

              {/* English Definition Card */}
              <div className="glass-card p-5 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)] flex items-center gap-1.5">
                  <BookText size={12} /> English Definition
                </span>

                {selectedWord.loading ? (
                  <div className="flex items-center gap-2.5 py-4 text-xs text-[var(--text-muted)]">
                    <Loader2 size={16} className="animate-spin text-[var(--accent-main)]" />
                    <span>Searching Rekhta Dictionary...</span>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--foreground)] leading-relaxed font-medium pt-1 select-text">
                    {selectedWord.englishMeaning || "Detailed entry available on Rekhta or Google Search."}
                  </p>
                )}
              </div>

              {/* Web Search & External Dictionary Links */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] px-1">
                  External Dictionaries
                </span>

                <a
                  href={selectedWord.rekhtaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl glass border border-white/10 bg-white/5 hover:border-[var(--accent-main)]/40 hover:bg-white/10 text-[var(--foreground)] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                      RD
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold flex items-center gap-1 group-hover:text-[var(--accent-main)]">
                        <span>Rekhta Dictionary</span>
                      </div>
                      <p className="text-[9px] text-[var(--text-dim)]">English, Urdu & Hindi meanings</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>

                <a
                  href={selectedWord.googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl glass border border-white/10 bg-white/5 hover:border-[var(--accent-main)]/40 hover:bg-white/10 text-[var(--foreground)] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                      G
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold flex items-center gap-1 group-hover:text-[var(--accent-main)]">
                        <span>Google Search</span>
                      </div>
                      <p className="text-[9px] text-[var(--text-dim)]">Find literary & historical contexts</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center p-6 border border-dashed border-white/10 rounded-2xl opacity-60">
              <Search size={32} className="text-[var(--accent-main)] mb-3 opacity-60" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)] mb-1">
                No Word Selected
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed max-w-[200px]">
                Click any word in the text to inspect its English definition and explore it in Rekhta or Google.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
