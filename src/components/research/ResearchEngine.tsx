"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Mic,
  MicOff,
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
  Clock,
  Share2,
  CheckCircle2
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
    answer: "Ahmadi Muslims believe Jesus (as) was placed upon the cross but was taken down alive in a swoon, fulfilling the 'Sign of Jonah' (entering the tomb alive and leaving alive). He was treated with Marham-e-Isa (Ointment of Jesus) and migrated east to search for the Lost Tribes of Israel, living to the age of 120 and dying a natural death in Srinagar, Kashmir."
  },
  {
    question: "Which Quranic verse explicitly refutes the physical killing and crucifixion of Jesus?",
    answer: "Surah Al-Nisa (4:158): 'Wa Ma Qatallohu Wa Ma Salaboohu Wa Lakin Shubbiha Lahum' — 'And they slew him not, nor did they crucify him, but he was made to appear to them like one crucified.' In Arabic jurisprudence, crucifixion specifically denotes dying upon the wood."
  },
  {
    question: "What does 'Khatam-an-Nabiyyin' signify in classical Arabic according to the Promised Messiah (as)?",
    answer: "Hazrat Mirza Ghulam Ahmad (as) explained that 'Khatam' signifies the Seal, the Signet-Ring, and the Ultimate Perfection. The Holy Prophet Muhammad (sa) brought the final law and spiritual apex. Any subordinate non-law-bearing prophethood is attained solely through complete obedience and spiritual reflection (Zill) of the Holy Prophet (sa)."
  },
  {
    question: "What was the divine prophecy of the Solar and Lunar Eclipses?",
    answer: "In accordance with the famous Hadith of Imam Darqutni, in Ramadan 1311 Hijri (1894 CE in the Eastern Hemisphere and 1895 CE in the Western Hemisphere), the moon eclipsed on the first of the possible eclipse nights (13th Ramadan) and the sun eclipsed on the middle of the possible eclipse days (28th Ramadan), serving as a celestial sign for the Mahdi."
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

  // Accordion states for People Also Ask
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
  // GOOGLE HOMEPAGE / INITIAL STATE (When no search has been submitted)
  // ═══════════════════════════════════════════════════════════════════════════
  if (!hasSearched) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 -mt-10 select-none">
        {/* Google-Style Logo */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center gap-1 text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-[#4285F4] dark:text-[#8ab4f8]">M</span>
            <span className="text-[#EA4335] dark:text-[#f28b82]">u</span>
            <span className="text-[#FBBC05] dark:text-[#fdd663]">r</span>
            <span className="text-[#4285F4] dark:text-[#8ab4f8]">a</span>
            <span className="text-[#34A853] dark:text-[#81c995]">b</span>
            <span className="text-[#EA4335] dark:text-[#f28b82]">b</span>
            <span className="text-[var(--accent-main)]">i</span>
            <span className="text-xl md:text-2xl font-black italic tracking-tighter ml-2.5 px-2 py-0.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30 self-center">
              Research
            </span>
          </div>
          <p className="text-xs md:text-sm font-semibold text-[var(--text-muted)] mt-2">
            Ahmadiyya Multi-Source Search & Theological Knowledge Engine
          </p>
        </div>

        {/* Google-Style Search Pill Box */}
        <div className="w-full max-w-2xl relative">
          <form onSubmit={handleFormSubmit} className="relative">
            <div
              className={clsx(
                "relative flex items-center w-full rounded-full transition-all duration-300",
                "bg-white dark:bg-[#202124] border border-gray-200 dark:border-gray-700/80 shadow-md hover:shadow-lg focus-within:shadow-xl",
                "focus-within:border-transparent focus-within:ring-2 focus-within:ring-[var(--accent-main)]"
              )}
            >
              <div className="pl-5 pr-3 text-gray-400">
                <Search size={20} />
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Ahmadiyya resources or ask a question..."
                className="w-full py-4 bg-transparent text-base md:text-lg font-medium text-[var(--foreground)] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
              />

              {/* Clear button */}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1"
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
                    "p-2.5 rounded-full transition-all flex items-center justify-center relative",
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
                  )}
                >
                  {isListening ? (
                    <Mic size={20} className="text-white" />
                  ) : (
                    <div className="flex items-center justify-center">
                      <Mic size={20} className="text-[#4285F4] dark:text-[#8ab4f8]" />
                    </div>
                  )}

                  {isListening && (
                    <span className="absolute -inset-1 rounded-full bg-red-500/30 animate-ping -z-10" />
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Voice active prompt */}
          {isListening && (
            <div className="mt-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2.5 text-red-500 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Listening... Speak your topic now</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceLang(voiceLang === 'en-US' ? 'ur-PK' : 'en-US')}
                className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-black uppercase"
              >
                {voiceLang === 'en-US' ? 'English (US)' : 'Urdu (اردو)'}
              </button>
            </div>
          )}

          {/* Google Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => performSearch()}
              disabled={!query.trim()}
              className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-transparent hover:border-gray-300 dark:hover:border-white/20 text-sm font-medium text-[var(--foreground)] transition-all active:scale-95 disabled:opacity-40"
            >
              Murabbi Search
            </button>
            <button
              onClick={handleFeelingInspired}
              className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-transparent hover:border-gray-300 dark:hover:border-white/20 text-sm font-medium text-[var(--foreground)] transition-all active:scale-95"
            >
              I'm Feeling Inspired
            </button>
          </div>

          {/* Language & Scope Offering */}
          <div className="text-center mt-6 text-xs text-[var(--text-muted)]">
            Ahmadiyya resources in:{" "}
            <button
              onClick={() => { setQuery("وفات مسیح"); performSearch("وفات مسیح"); }}
              className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline mx-1 font-nastaleeq"
            >
              اردو
            </button>
            •
            <button
              onClick={() => { setQuery("ختم النبیین"); performSearch("ختم النبیین"); }}
              className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline mx-1 font-quran"
            >
              العربية
            </button>
            •
            <span className="mx-1 text-[var(--foreground)] font-semibold">English</span>
          </div>

          {/* Trending Discovery Chips */}
          <div className="mt-10 pt-6 border-t border-gray-200/50 dark:border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 text-center">
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
                  className="px-3.5 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-[var(--foreground)] hover:border-[var(--accent-main)] hover:bg-[var(--accent-soft)] transition-all"
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
  // GOOGLE RESULTS STATE (Standard Google Search Layout with AI Overview)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* ── GOOGLE TOP HEADER ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#18191c]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 pt-3 pb-0 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
          {/* Logo on the left */}
          <div
            onClick={resetToHome}
            className="flex items-center gap-1 text-2xl font-bold tracking-tight cursor-pointer shrink-0 select-none group"
            title="Murabbi Research Home"
          >
            <span className="text-[#4285F4] dark:text-[#8ab4f8]">M</span>
            <span className="text-[#EA4335] dark:text-[#f28b82]">u</span>
            <span className="text-[#FBBC05] dark:text-[#fdd663]">r</span>
            <span className="text-[#4285F4] dark:text-[#8ab4f8]">a</span>
            <span className="text-[#34A853] dark:text-[#81c995]">b</span>
            <span className="text-[#EA4335] dark:text-[#f28b82]">b</span>
            <span className="text-[var(--accent-main)]">i</span>
            <span className="text-xs font-black italic tracking-tighter ml-1.5 px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30">
              Beta
            </span>
          </div>

          {/* Search Pill Bar in Top Header */}
          <div className="flex-1 max-w-2xl relative">
            <form onSubmit={handleFormSubmit} className="relative">
              <div
                className={clsx(
                  "relative flex items-center w-full rounded-full transition-all",
                  "bg-white dark:bg-[#202124] border border-gray-200 dark:border-gray-700/80 shadow-sm hover:shadow-md",
                  "focus-within:border-transparent focus-within:ring-2 focus-within:ring-[var(--accent-main)]"
                )}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Ahmadiyya resources..."
                  className="w-full pl-5 pr-20 py-2.5 bg-transparent text-sm md:text-base font-medium text-[var(--foreground)] focus:outline-none"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Voice search button */}
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  className={clsx(
                    "p-2 rounded-full mr-1.5 transition-colors",
                    isListening
                      ? "text-red-500 animate-pulse"
                      : "text-[#4285F4] dark:text-[#8ab4f8] hover:bg-gray-100 dark:hover:bg-white/10"
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

        {/* ── GOOGLE SEARCH TABS ────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto custom-scrollbar mt-3 md:ml-32 select-none text-xs md:text-sm">
          {[
            { id: 'all', label: 'All', count: counts.all, icon: Search },
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
                  "pb-2.5 flex items-center gap-1.5 border-b-2 transition-all shrink-0 font-medium",
                  active
                    ? "border-[var(--accent-main)] text-[var(--accent-main)] font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={clsx(
                      "px-1.5 py-0.2 rounded-full text-[10px]",
                      active ? "bg-[var(--accent-soft)] text-[var(--accent-main)]" : "bg-gray-100 dark:bg-white/10 text-gray-500"
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
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-6 md:ml-32">
            About {counts.all} results ({searchTime} seconds) for <span className="font-semibold text-[var(--foreground)]">"{submittedQuery}"</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 text-center space-y-4 md:ml-32 max-w-2xl">
            <Loader2 size={36} className="animate-spin text-[var(--accent-main)] mx-auto" />
            <p className="text-sm font-medium text-gray-500">
              Querying Ruhani Khazain, Qur'an, Al Islam, and journals...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="md:ml-32 max-w-2xl p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Results Container */}
        {results && !loading && (
          <div className="flex flex-col lg:flex-row gap-10 md:ml-32">
            {/* Left Column: Google Results Stream */}
            <div className="flex-1 max-w-2xl space-y-8">
              {/* ── 1. GOOGLE AI OVERVIEW (SGE BOX) ─────────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'dossier') && results.dossier && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/70 via-purple-50/40 to-emerald-50/60 dark:from-white/[0.04] dark:via-white/[0.02] dark:to-transparent border border-blue-200/60 dark:border-white/10 shadow-sm relative overflow-hidden">
                  {/* AI Overview Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                          AI Overview
                          <span className="text-[10px] font-normal text-gray-400">• MurabbiAI Synthesis</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const copyTxt = `${results.dossier?.title}\n\n${results.dossier?.theologicalThesis}\n\nKey Points:\n${results.dossier?.keyArguments.map(a => `- ${a}`).join('\n')}`;
                        copyToClipboard(copyTxt, 'ai-overview');
                      }}
                      className="text-xs text-gray-500 hover:text-[var(--foreground)] flex items-center gap-1 p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Copy Overview"
                    >
                      {copiedId === 'ai-overview' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span className="text-[11px]">{copiedId === 'ai-overview' ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  {/* Core Thesis Paragraph */}
                  <p className="text-sm md:text-base text-[var(--foreground)] leading-relaxed font-normal mb-4">
                    {results.dossier.theologicalThesis}
                  </p>

                  {/* Bullet Points */}
                  {results.dossier.keyArguments && results.dossier.keyArguments.length > 0 && (
                    <div className="space-y-2 mb-5">
                      {results.dossier.keyArguments.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-main)] mt-2 shrink-0" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Google AI Source Citation Chips */}
                  <div className="pt-3 border-t border-black/5 dark:border-white/10 flex flex-wrap gap-2">
                    {results.dossier.quranicEvidence?.map((q, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                      >
                        <BookOpen size={11} />
                        {q.ref}
                      </span>
                    ))}
                    {results.dossier.ruhaniKhazainCitations?.map((c, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1"
                      >
                        <Scroll size={11} />
                        {c.book} (Vol {c.volume})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 2. RUHANI KHAZAIN GOOGLE-STYLE RESULTS ───────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'ruhani-khazain') && results.ruhaniKhazain.map((item, idx) => {
                const itemKey = `rk-${item.volume}-${item.pageNum}-${idx}`;
                const citation = `[Ruhani Khazain, Vol. ${item.volume}, "${item.bookTitle}", p. ${item.pageNum}]`;
                return (
                  <div key={itemKey} className="space-y-1.5 group">
                    {/* Google URL / Breadcrumb header */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        RK
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <span className="font-medium text-[var(--foreground)]">Ruhani Khazain</span>
                        <span>›</span>
                        <span>Volume {item.volume}</span>
                        <span>›</span>
                        <span className="truncate">{item.bookTitle}</span>
                      </div>
                    </div>

                    {/* Google Blue / Accent Clickable Title */}
                    <h3
                      onClick={() => router.push(item.readerUrl)}
                      className="text-lg md:text-xl font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug"
                    >
                      {item.bookTitle} — Volume {item.volume}, Page {item.pageNum} ({item.bookUrduTitle})
                    </h3>

                    {/* Urdu Snippet with Google bold highlighting */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/70 dark:border-white/5 text-right font-nastaleeq text-lg leading-loose text-gray-800 dark:text-gray-200 select-text">
                      <span>{item.snippetBefore}</span>
                      <strong className="font-bold text-[var(--accent-main)] bg-[var(--accent-soft)] px-1 py-0.5 rounded mx-1">
                        {item.matchedSlice}
                      </strong>
                      <span>{item.snippetAfter}</span>
                    </div>

                    {/* Google Action Sitelinks */}
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <button
                        onClick={() => router.push(item.readerUrl)}
                        className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline flex items-center gap-1 font-medium"
                      >
                        <BookOpen size={13} />
                        Open in Reader
                      </button>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <button
                        onClick={() => copyToClipboard(citation, itemKey)}
                        className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
                      >
                        {copiedId === itemKey ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        <span>{copiedId === itemKey ? "Copied" : "Copy Citation"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ── 3. HOLY QUR'AN GOOGLE-STYLE RESULTS ─────────────────────── */}
              {(activeFilter === 'all' || activeFilter === 'quran') && results.quranVerses.map((verse, idx) => {
                const verseKey = `quran-${verse.surahNumber}-${verse.verseNumber}-${idx}`;
                const quranCitation = `[Holy Qur'an, Surah ${verse.surahNameEnglish} (${verse.surahNumber}:${verse.verseNumber})] "${verse.englishTranslation}"`;
                return (
                  <div key={verseKey} className="space-y-2 group">
                    {/* Google URL / Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        HQ
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <span className="font-medium text-[var(--foreground)]">Holy Qur'an</span>
                        <span>›</span>
                        <span>Surah {verse.surahNameEnglish}</span>
                        <span>›</span>
                        <span>Ayah {verse.verseNumber}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline leading-snug">
                      <a href={verse.url} target="_blank" rel="noopener noreferrer">
                        Surah {verse.surahNameEnglish} ({verse.surahNameArabic}) — Chapter {verse.surahNumber}, Verse {verse.verseNumber}
                      </a>
                    </h3>

                    {/* Arabic Verse Box */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/20 text-right font-quran text-2xl leading-loose text-emerald-800 dark:text-emerald-300">
                      {verse.arabicText}
                    </div>

                    {/* English and Urdu Snippets */}
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 mr-1.5">Translation:</span>
                      "{verse.englishTranslation}"
                    </p>

                    <div className="text-right font-nastaleeq text-base text-gray-700 dark:text-gray-300 leading-loose">
                      {verse.urduTranslation}
                    </div>

                    {/* Action row */}
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <a
                        href={verse.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline flex items-center gap-1 font-medium"
                      >
                        <Globe size={13} />
                        View on Al Islam Qur'an
                        <ExternalLink size={11} />
                      </a>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <button
                        onClick={() => copyToClipboard(quranCitation, verseKey)}
                        className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1"
                      >
                        {copiedId === verseKey ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        <span>{copiedId === verseKey ? "Copied" : "Copy Verse"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ── 4. AL ISLAM ARTICLES GOOGLE-STYLE RESULTS ───────────────── */}
              {(activeFilter === 'all' || activeFilter === 'alislam') && results.alislamArticles.map((art) => (
                <div key={art.id} className="space-y-1.5 group">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      AL
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <span className="font-medium text-[var(--foreground)]">alislam.org</span>
                      <span>›</span>
                      <span>{art.category.toLowerCase()}</span>
                      <span>›</span>
                      <span className="truncate">{art.id}</span>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline leading-snug">
                    <a href={art.url} target="_blank" rel="noopener noreferrer">
                      {art.title}
                    </a>
                  </h3>

                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {art.summary}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Globe size={13} />
                      Read on Al Islam
                      <ExternalLink size={11} />
                    </a>
                    {art.author && (
                      <>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <span className="text-gray-500">By {art.author}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* ── 5. PERIODICALS & PAPERS GOOGLE-STYLE RESULTS ────────────── */}
              {(activeFilter === 'all' || activeFilter === 'periodicals') && results.publications.map((pub) => (
                <div key={pub.id} className="space-y-1.5 group">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      RoR
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <span className="font-medium text-[var(--foreground)]">{pub.source.toLowerCase()}</span>
                      <span>›</span>
                      <span>research</span>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline leading-snug">
                    <a href={pub.url} target="_blank" rel="noopener noreferrer">
                      {pub.title}
                    </a>
                  </h3>

                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {pub.summary}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Newspaper size={13} />
                      Open Paper
                      <ExternalLink size={11} />
                    </a>
                    {pub.author && (
                      <>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <span className="text-gray-500">By {pub.author}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* ── GOOGLE "PEOPLE ALSO ASK" ACCORDION ───────────────────────── */}
              <div className="pt-6 border-t border-gray-200 dark:border-white/10">
                <h4 className="text-base font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <HelpCircle size={18} className="text-blue-500" />
                  People also ask
                </h4>

                <div className="rounded-xl border border-gray-200 dark:border-white/10 divide-y divide-gray-200 dark:divide-white/10 overflow-hidden bg-white dark:bg-white/[0.02]">
                  {PEOPLE_ALSO_ASK.map((item, i) => {
                    const isExpanded = expandedFaq === i;
                    return (
                      <div key={i}>
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : i)}
                          className="w-full text-left p-3.5 flex items-center justify-between text-sm font-medium text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <span>{item.question}</span>
                          {isExpanded ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-white/[0.01]">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── RELATED SEARCHES ─────────────────────────────────────────── */}
              <div className="pt-6 pb-12 border-t border-gray-200 dark:border-white/10">
                <h4 className="text-sm font-bold text-[var(--foreground)] mb-3">
                  Related searches
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TOPIC_PRESETS.slice(0, 6).map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(preset.query);
                        performSearch(preset.query);
                      }}
                      className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border border-gray-200/60 dark:border-white/5 flex items-center gap-3 text-left transition-colors"
                    >
                      <Search size={15} className="text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-[var(--foreground)]">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Google Knowledge Card (Desktop) */}
            {results.dossier && (
              <div className="hidden lg:block w-80 shrink-0 space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 shadow-sm space-y-4 sticky top-24">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <BookOpen size={14} className="text-[var(--accent-main)]" />
                    Knowledge Panel
                  </div>

                  <h3 className="text-lg font-bold text-[var(--foreground)] leading-snug">
                    {results.dossier.title.replace('Theological Dossier: ', '')}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {results.dossier.theologicalThesis.slice(0, 180)}...
                  </p>

                  <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-2 text-xs">
                    <div className="font-semibold text-[var(--foreground)]">Primary Corpus:</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Ruhani Khazain (Volumes 1–23)
                    </div>
                  </div>

                  {results.dossier.hadithTraditions && results.dossier.hadithTraditions.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-1 text-xs">
                      <div className="font-semibold text-[var(--foreground)]">Prophetic Tradition:</div>
                      <div className="text-gray-600 dark:text-gray-400 italic">
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
                      className="w-full py-2 px-3 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--accent-main)] hover:text-white text-[var(--accent-main)] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
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
