"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Mic,
  Sparkles,
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
  ArrowRight,
  Filter,
  Layers,
  HelpCircle,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import {
  MultiSourceSearchResult,
  RuhaniKhazainSearchResult,
  QuranVerseResult,
  AlIslamArticleResult,
  PublicationResult,
  ResearchDossier
} from '@/lib/research-sources';

type ActiveSourceFilter = 'all' | 'ruhani-khazain' | 'quran' | 'alislam' | 'periodicals' | 'dossier';

const TOPIC_PRESETS = [
  { label: "Death of Jesus", urdu: "وفات مسیح", query: "Death of Jesus" },
  { label: "Seal of Prophets", urdu: "خاتم النبیین", query: "Khatam-e-Nabuwwat" },
  { label: "Philosophy of Prayer", urdu: "فلسفہ دعا", query: "Philosophy of Prayer" },
  { label: "Jihad of the Pen", urdu: "جہاد بالقلم", query: "Jihad of the Pen" },
  { label: "Tomb in Kashmir", urdu: "مزار عیسیٰ", query: "Tomb of Jesus Kashmir" },
  { label: "Eclipse Prophecy", urdu: "کسوف و خسوف", query: "Eclipse" },
  { label: "Existence of God", urdu: "وجود باری تعالیٰ", query: "Existence of God" },
  { label: "Zarurat-ul-Imam", urdu: "ضرورت الامام", query: "Zarurat-ul-Imam" }
];

const PEOPLE_ALSO_ASK = [
  {
    question: "What is the Ahmadiyya theological perspective on the crucifixion of Jesus (as)?",
    answer: "Ahmadi Muslims believe Jesus (as) was placed upon the cross but was taken down alive in a swoon, fulfilling the 'Sign of Jonah' (entering the tomb alive and leaving alive). He was treated with Marham-e-Isa (Ointment of Jesus) and migrated east to search for the Lost Tribes of Israel, living to the age of 120 and dying a natural death in Srinagar, Kashmir where his tomb (Roza Bal) remains."
  },
  {
    question: "Which Quranic verse explicitly refutes the physical killing and crucifixion of Jesus?",
    answer: "Surah Al-Nisa (4:158): 'Wa Ma Qatallohu Wa Ma Salaboohu Wa Lakin Shubbiha Lahum' — 'And they slew him not, nor did they crucify him, but he was made to appear to them like one crucified.' In Arabic jurisprudence, crucifixion specifically denotes dying upon the wood; Jesus survived."
  },
  {
    question: "What does 'Khatam-an-Nabiyyin' signify according to the Promised Messiah (as)?",
    answer: "Hazrat Mirza Ghulam Ahmad (as) explained that 'Khatam' signifies the Seal, the Signet-Ring, and the Ultimate Perfection. The Holy Prophet Muhammad (sa) brought the final law and spiritual apex. Any subordinate non-law-bearing prophethood is attained solely through complete obedience and spiritual reflection (Zill) of the Holy Prophet (sa)."
  },
  {
    question: "What was the divine sign of the Solar and Lunar Eclipses?",
    answer: "In accordance with the grand prophecy of Imam Darqutni, in Ramadan 1311 Hijri (1894 CE in the East and 1895 CE in the West), the moon eclipsed on the 13th of Ramadan (first possible night) and the sun eclipsed on the 28th of Ramadan (middle possible day), miraculously confirming the Promised Messiah and Mahdi (as)."
  }
];

export default function ResearchEngine() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveSourceFilter>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MultiSourceSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<string>("0.12");

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'ur-PK'>('en-US');
  const recognitionRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Accordion state for People Also Ask
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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

  const handleFeelingInspired = () => {
    const randomTopic = TOPIC_PRESETS[Math.floor(Math.random() * TOPIC_PRESETS.length)];
    setQuery(randomTopic.query);
    performSearch(randomTopic.query);
  };

  const resetToHome = () => {
    setResults(null);
    setSubmittedQuery("");
    setQuery("");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter count badges
  const counts = useMemo(() => {
    return {
      all: results ? results.totalResults : 0,
      rk: results ? results.ruhaniKhazain.length : 0,
      quran: results ? results.quranVerses.length : 0,
      alislam: results ? results.alislamArticles.length : 0,
      periodicals: results ? results.publications.length : 0,
      dossier: results?.dossier ? 1 : 0
    };
  }, [results]);

  const hasSearched = !!results || loading;

  // ═══════════════════════════════════════════════════════════════════════════
  // MURABBI DESK UI: INITIAL STATE (Google Structure + Murabbi OS Design System)
  // ═══════════════════════════════════════════════════════════════════════════
  if (!hasSearched) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 -mt-6 select-none relative">
        {/* Ambient atmospheric glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-glow)] rounded-full blur-[130px] pointer-events-none -z-10 opacity-70" />

        {/* Murabbi Desk Emblem & Logo Branding */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative group cursor-pointer active:scale-95 transition-transform mb-3" onClick={resetToHome}>
            <div className="absolute -inset-3 bg-[var(--accent-glow)] rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
            <img
              src="/logo.png"
              alt="Murabbi Desk"
              className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10 drop-shadow-2xl"
            />
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-[var(--foreground)]">
              Murabbi Research
            </h1>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30">
              Beta Protocol
            </span>
          </div>

          <p className="text-xs md:text-sm font-semibold text-[var(--text-muted)] tracking-wide mt-2 text-center max-w-lg">
            Unified Theological Intelligence & Multi-Source Ahmadiyya Corpus Search
          </p>
        </div>

        {/* Murabbi Form V4 / Google-Style Search Pill Box */}
        <div className="w-full max-w-2xl relative">
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

          {/* Murabbi Desk Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => performSearch()}
              disabled={!query.trim()}
              className="px-6 py-3 rounded-[14px] bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-hover)] text-white shadow-lg shadow-[var(--accent-glow)] font-black text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              Murabbi Search
            </button>
            <button
              onClick={handleFeelingInspired}
              className="px-6 py-3 rounded-[14px] glass border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-[var(--foreground)] transition-all active:scale-95"
            >
              I'm Feeling Inspired
            </button>
          </div>

          {/* Language & Scope Offering */}
          <div className="text-center mt-6 text-xs text-[var(--text-muted)] font-medium">
            Search Ahmadiyya resources in:{" "}
            <button
              onClick={() => { setQuery("وفات مسیح"); performSearch("وفات مسیح"); }}
              className="text-[var(--accent-main)] hover:underline mx-1 font-nastaleeq"
            >
              اردو
            </button>
            •
            <button
              onClick={() => { setQuery("ختم النبیین"); performSearch("ختم النبیین"); }}
              className="text-[var(--accent-main)] hover:underline mx-1 font-quran"
            >
              العربية
            </button>
            •
            <span className="mx-1 text-[var(--foreground)] font-bold">English</span>
          </div>

          {/* Trending Discovery Chips */}
          <div className="mt-10 pt-6 border-t border-white/5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)] opacity-70 mb-3 text-center">
              Trending Theological Topics
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {TOPIC_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(preset.query);
                    performSearch(preset.query);
                  }}
                  className="px-3.5 py-1.5 rounded-[12px] glass border border-white/10 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--accent-main)] hover:bg-[var(--accent-soft)] transition-all"
                >
                  {preset.label} <span className="opacity-40 font-nastaleeq text-[10px] ml-1">{preset.urdu}</span>
                </button>
              ))}
            </div>
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
      {/* ── TOP HEADER (Murabbi Desk Logo + Search Pill Bar) ───────────── */}
      <div className="sticky top-0 z-30 glass bg-black/25 dark:bg-[#020310]/90 backdrop-blur-xl border-b border-white/5 pt-3 pb-0 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
          {/* Logo on the left with official emblem */}
          <div
            onClick={resetToHome}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
            title="Murabbi Research Home"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-[var(--accent-glow)] rounded-full blur-md opacity-40 group-hover:opacity-100 transition-opacity" />
              <img
                src="/logo.png"
                alt="Murabbi Desk"
                className="w-8 h-8 object-contain drop-shadow-md group-hover:scale-105 transition-transform relative z-10"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black italic tracking-tighter text-[var(--foreground)]">
                Murabbi
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30">
                Research
              </span>
            </div>
          </div>

          {/* Search Pill Bar in Top Header */}
          <div className="flex-1 max-w-2xl relative">
            <form onSubmit={handleFormSubmit} className="relative">
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
        </div>

        {/* ── GOOGLE SEARCH TABS (Themed to Murabbi Desk) ─────────────── */}
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto custom-scrollbar mt-3 md:ml-36 select-none text-xs md:text-sm">
          {[
            { id: 'all', label: 'All Sources', count: counts.all, icon: Search },
            { id: 'ruhani-khazain', label: 'Ruhani Khazain', count: counts.rk, icon: Scroll },
            { id: 'quran', label: 'Holy Qur\'an', count: counts.quran, icon: BookOpen },
            { id: 'alislam', label: 'Al Islam', count: counts.alislam, icon: Globe },
            { id: 'periodicals', label: 'Periodicals', count: counts.periodicals, icon: Newspaper },
            { id: 'dossier', label: 'AI Overview', count: counts.dossier, icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as ActiveSourceFilter)}
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

      {/* ── RESULTS BODY ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-4 flex-1">
        {/* Search Statistics */}
        {results && !loading && (
          <div className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6 md:ml-36">
            Found {counts.all} theological records in {searchTime} seconds for <span className="text-[var(--foreground)]">"{submittedQuery}"</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 text-center space-y-4 md:ml-36 max-w-2xl">
            <Loader2 size={36} className="animate-spin text-[var(--accent-main)] mx-auto" />
            <p className="text-sm font-bold text-[var(--text-muted)] tracking-wide">
              Scanning Ruhani Khazain 1–23, Qur'an, Al Islam, and Periodicals...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="md:ml-36 max-w-2xl p-4 rounded-[14px] bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-6 font-bold">
            {error}
          </div>
        )}

        {/* Results Container */}
        {results && !loading && (
          <div className="flex flex-col lg:flex-row gap-10 md:ml-36">
            {/* Left Column: Google Results Stream */}
            <div className="flex-1 max-w-2xl space-y-8">
              {/* ── 1. MURABBIAI OVERVIEW (Google SGE Layout + Murabbi Aesthetic) */}
              {(activeFilter === 'all' || activeFilter === 'dossier') && results.dossier && (
                <div className="glass-card p-6 md:p-7 rounded-[18px] border border-[var(--accent-main)]/30 bg-gradient-to-br from-[var(--accent-soft)] via-white/5 to-transparent relative overflow-hidden shadow-xl">
                  {/* AI Overview Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)] shadow-sm">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-black italic tracking-tight text-[var(--foreground)] flex items-center gap-2">
                          MurabbiAI Overview
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)] opacity-70">
                            • Theological Synthesis
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const copyTxt = `${results.dossier?.title}\n\n${results.dossier?.theologicalThesis}\n\nKey Points:\n${results.dossier?.keyArguments.map(a => `- ${a}`).join('\n')}`;
                        copyToClipboard(copyTxt, 'ai-overview');
                      }}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors font-bold"
                      title="Copy Overview"
                    >
                      {copiedId === 'ai-overview' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span className="text-[11px] uppercase tracking-wider">{copiedId === 'ai-overview' ? "Copied" : "Copy Briefing"}</span>
                    </button>
                  </div>

                  {/* Core Thesis Paragraph */}
                  <p className="text-sm md:text-base text-[var(--foreground)] leading-relaxed font-medium mb-4">
                    {results.dossier.theologicalThesis}
                  </p>

                  {/* Bullet Points */}
                  {results.dossier.keyArguments && results.dossier.keyArguments.length > 0 && (
                    <div className="space-y-2.5 mb-5">
                      {results.dossier.keyArguments.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-[var(--foreground)]/90">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-main)] mt-2 shrink-0" />
                          <span className="font-medium leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Citation Chips */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
                    {results.dossier.quranicEvidence?.map((q, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-[10px] bg-white/5 border border-white/10 text-[11px] font-bold text-[var(--accent-main)] flex items-center gap-1"
                      >
                        <BookOpen size={11} />
                        {q.ref}
                      </span>
                    ))}
                    {results.dossier.ruhaniKhazainCitations?.map((c, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-[10px] bg-white/5 border border-white/10 text-[11px] font-bold text-[var(--foreground)] flex items-center gap-1"
                      >
                        <Scroll size={11} className="text-[var(--accent-main)]" />
                        {c.book} (Vol {c.volume})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 2. RUHANI KHAZAIN RESULTS ───────────────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'ruhani-khazain') && results.ruhaniKhazain.map((item, idx) => {
                const itemKey = `rk-${item.volume}-${item.pageNum}-${idx}`;
                const citation = `[Ruhani Khazain, Vol. ${item.volume}, "${item.bookTitle}", p. ${item.pageNum}]`;
                return (
                  <div key={itemKey} className="space-y-2 group">
                    {/* Breadcrumb Header */}
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
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

                    {/* Clickable Title */}
                    <h3
                      onClick={() => router.push(item.readerUrl)}
                      className="text-lg md:text-xl font-black italic tracking-tight text-[var(--foreground)] hover:text-[var(--accent-main)] cursor-pointer leading-snug transition-colors"
                    >
                      {item.bookTitle} — Volume {item.volume}, Page {item.pageNum} <span className="font-nastaleeq text-base text-[var(--text-muted)] not-italic font-normal">({item.bookUrduTitle})</span>
                    </h3>

                    {/* Urdu Snippet in Nastaleeq */}
                    <div className="p-4 rounded-[14px] glass bg-black/25 dark:bg-black/35 border border-white/5 text-right font-nastaleeq text-lg md:text-xl leading-loose text-[var(--foreground)] select-text">
                      <span>{item.snippetBefore}</span>
                      <strong className="font-bold text-[var(--accent-main)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded-md mx-1 border border-[var(--accent-main)]/20">
                        {item.matchedSlice}
                      </strong>
                      <span>{item.snippetAfter}</span>
                    </div>

                    {/* Action Sitelinks */}
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <button
                        onClick={() => router.push(item.readerUrl)}
                        className="px-3 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5 hover:border-[var(--accent-main)]/40 transition-colors"
                      >
                        <BookOpen size={13} className="text-[var(--accent-main)]" />
                        Open in Reader
                        <ArrowRight size={11} className="opacity-60" />
                      </button>

                      <button
                        onClick={() => copyToClipboard(citation, itemKey)}
                        className="px-3 py-1.5 rounded-[10px] glass border border-white/10 hover:bg-white/5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 transition-colors"
                      >
                        {copiedId === itemKey ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        <span>{copiedId === itemKey ? "Copied" : "Copy Citation"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ── 3. HOLY QUR'AN RESULTS ──────────────────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'quran') && results.quranVerses.map((verse, idx) => {
                const verseKey = `quran-${verse.surahNumber}-${verse.verseNumber}-${idx}`;
                const quranCitation = `[Holy Qur'an, Surah ${verse.surahNameEnglish} (${verse.surahNumber}:${verse.verseNumber})] "${verse.englishTranslation}"`;
                return (
                  <div key={verseKey} className="space-y-2.5 group">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px] shrink-0">
                        HQ
                      </div>
                      <div className="flex items-center gap-1.5 truncate font-semibold uppercase text-[10px] tracking-wider">
                        <span className="text-[var(--foreground)]">Holy Qur'an</span>
                        <span>›</span>
                        <span>Surah {verse.surahNameEnglish}</span>
                        <span>›</span>
                        <span>Ayah {verse.verseNumber}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-black italic tracking-tight text-[var(--foreground)] leading-snug">
                      <a href={verse.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-main)] transition-colors">
                        Surah {verse.surahNameEnglish} ({verse.surahNameArabic}) — Chapter {verse.surahNumber}, Verse {verse.verseNumber}
                      </a>
                    </h3>

                    {/* Arabic Verse Box */}
                    <div className="p-4 md:p-5 rounded-[14px] glass bg-black/30 border border-white/5 text-right font-quran text-2xl md:text-3xl leading-loose text-emerald-400 dark:text-emerald-300">
                      {verse.arabicText}
                    </div>

                    {/* English and Urdu Snippets */}
                    <p className="text-sm text-[var(--foreground)]/90 leading-relaxed font-medium">
                      <span className="font-bold text-[var(--accent-main)] mr-1.5">Translation:</span>
                      "{verse.englishTranslation}"
                    </p>

                    <div className="text-right font-nastaleeq text-base text-[var(--text-muted)] leading-loose">
                      {verse.urduTranslation}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <a
                        href={verse.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5 hover:border-[var(--accent-main)]/40 transition-colors"
                      >
                        <Globe size={13} className="text-emerald-400" />
                        Al Islam Qur'an
                        <ExternalLink size={11} className="opacity-60" />
                      </a>

                      <button
                        onClick={() => copyToClipboard(quranCitation, verseKey)}
                        className="px-3 py-1.5 rounded-[10px] glass border border-white/10 hover:bg-white/5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 transition-colors"
                      >
                        {copiedId === verseKey ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        <span>{copiedId === verseKey ? "Copied" : "Copy Verse"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ── 4. AL ISLAM OFFICIAL ARTICLES ───────────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'alislam') && results.alislamArticles.map((art) => (
                <div key={art.id} className="space-y-2 group">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-[10px] shrink-0">
                      AL
                    </div>
                    <div className="flex items-center gap-1.5 truncate font-semibold uppercase text-[10px] tracking-wider">
                      <span className="text-[var(--foreground)]">alislam.org</span>
                      <span>›</span>
                      <span>{art.category.toLowerCase()}</span>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-black italic tracking-tight text-[var(--foreground)] leading-snug">
                    <a href={art.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-main)] transition-colors">
                      {art.title}
                    </a>
                  </h3>

                  <p className="text-sm text-[var(--foreground)]/80 leading-relaxed font-medium">
                    {art.summary}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5 hover:border-[var(--accent-main)]/40 transition-colors"
                    >
                      <Globe size={13} className="text-blue-400" />
                      Read on Al Islam
                      <ExternalLink size={11} className="opacity-60" />
                    </a>
                    {art.author && (
                      <span className="text-xs text-[var(--text-muted)] font-semibold">
                        By {art.author}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* ── 5. PERIODICALS & PAPERS ─────────────────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'periodicals') && results.publications.map((pub) => (
                <div key={pub.id} className="space-y-2 group">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-[10px] shrink-0">
                      RoR
                    </div>
                    <div className="flex items-center gap-1.5 truncate font-semibold uppercase text-[10px] tracking-wider">
                      <span className="text-[var(--foreground)]">{pub.source}</span>
                      <span>›</span>
                      <span>Research Paper</span>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-black italic tracking-tight text-[var(--foreground)] leading-snug">
                    <a href={pub.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-main)] transition-colors">
                      {pub.title}
                    </a>
                  </h3>

                  <p className="text-sm text-[var(--foreground)]/80 leading-relaxed font-medium">
                    {pub.summary}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5 hover:border-[var(--accent-main)]/40 transition-colors"
                    >
                      <Newspaper size={13} className="text-purple-400" />
                      Read Paper
                      <ExternalLink size={11} className="opacity-60" />
                    </a>
                    {pub.author && (
                      <span className="text-xs text-[var(--text-muted)] font-semibold">
                        By {pub.author}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* ── PEOPLE ALSO ASK (Google Layout + Glass Cards) ───────────── */}
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-base font-black italic tracking-tight text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <HelpCircle size={18} className="text-[var(--accent-main)]" />
                  People Also Ask
                </h4>

                <div className="rounded-[14px] glass border border-white/10 divide-y divide-white/5 overflow-hidden">
                  {PEOPLE_ALSO_ASK.map((item, i) => {
                    const isExpanded = expandedFaq === i;
                    return (
                      <div key={i}>
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : i)}
                          className="w-full text-left p-4 flex items-center justify-between text-sm font-bold text-[var(--foreground)] hover:bg-white/5 transition-colors"
                        >
                          <span>{item.question}</span>
                          {isExpanded ? <ChevronUp size={16} className="text-[var(--accent-main)] shrink-0" /> : <ChevronDown size={16} className="text-[var(--text-muted)] shrink-0" />}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed bg-black/20">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── RELATED SEARCHES ─────────────────────────────────────────── */}
              <div className="pt-6 pb-12 border-t border-white/10">
                <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Related Searches
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TOPIC_PRESETS.slice(0, 6).map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(preset.query);
                        performSearch(preset.query);
                      }}
                      className="p-3.5 rounded-[12px] glass bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3 text-left transition-colors"
                    >
                      <Search size={15} className="text-[var(--accent-main)] shrink-0" />
                      <span className="text-sm font-bold text-[var(--foreground)]">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Knowledge Panel (Desktop) */}
            {results.dossier && (
              <div className="hidden lg:block w-80 shrink-0 space-y-4">
                <div className="glass-card p-6 rounded-[18px] border border-white/10 shadow-xl space-y-4 sticky top-24">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)]">
                    <BookOpen size={14} />
                    Knowledge Panel
                  </div>

                  <h3 className="text-lg font-black italic tracking-tight text-[var(--foreground)] leading-snug">
                    {results.dossier.title.replace('Theological Dossier: ', '')}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                    {results.dossier.theologicalThesis.slice(0, 180)}...
                  </p>

                  <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
                    <div className="font-bold text-[var(--foreground)] uppercase text-[10px] tracking-wider text-[var(--accent-main)]">
                      Primary Corpus
                    </div>
                    <div className="text-[var(--text-muted)] font-medium">
                      Ruhani Khazain (Volumes 1–23) • Holy Qur'an
                    </div>
                  </div>

                  {results.dossier.hadithTraditions && results.dossier.hadithTraditions.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                      <div className="font-bold text-[var(--foreground)] uppercase text-[10px] tracking-wider text-[var(--accent-main)]">
                        Prophetic Tradition
                      </div>
                      <div className="text-[var(--text-muted)] italic font-medium leading-relaxed">
                        "{results.dossier.hadithTraditions[0].text}"
                      </div>
                    </div>
                  )}

                  <div className="pt-3">
                    <button
                      onClick={() => {
                        const copyAll = `[THEOLOGICAL DOSSIER: ${results.dossier?.topic}]\n\n${results.dossier?.theologicalThesis}\n\nEvidence:\n${results.dossier?.keyArguments.join('\n')}`;
                        copyToClipboard(copyAll, 'kp-copy');
                      }}
                      className="w-full py-2.5 px-3 rounded-[12px] bg-[var(--accent-soft)] hover:bg-[var(--accent-main)] hover:text-white text-[var(--accent-main)] font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      {copiedId === 'kp-copy' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedId === 'kp-copy' ? "Copied" : "Copy Complete Briefing"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
