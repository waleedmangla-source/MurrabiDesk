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
  Bookmark,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Layers,
  ArrowRight,
  Filter,
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

export default function ResearchEngine() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveSourceFilter>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MultiSourceSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'ur-PK'>('en-US');
  const recognitionRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* ── HEADER / TITLE ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={12} /> Beta Protocol V1.0
          </span>
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Ahmadiyya Multi-Source Deep Search
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-[var(--foreground)]">
          Theological Research Engine
        </h1>
        <p className="text-sm font-medium text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Simultaneously query the 23-volume <span className="font-bold text-[var(--foreground)]">Ruhani Khazain</span>, the <span className="font-bold text-[var(--foreground)]">Holy Qur'an & Commentary</span>, <span className="font-bold text-[var(--foreground)]">Al Islam</span>, <span className="font-bold text-[var(--foreground)]">The Review of Religions</span>, and <span className="font-bold text-[var(--foreground)]">Al Hakam</span> with instant citations.
        </p>
      </div>

      {/* ── SEARCH COMMAND BOX ────────────────────────────────────────── */}
      <div className="glass-card p-4 md:p-6 rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-[var(--accent-glow)] rounded-full blur-3xl pointer-events-none -z-10" />

        <form onSubmit={handleFormSubmit} className="relative flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="absolute left-4 text-[var(--text-muted)] pointer-events-none" size={22} />

            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topic in English or Urdu (e.g., 'Death of Jesus', 'Khatam-e-Nabuwwat', 'وفات مسیح')..."
              className={clsx(
                "w-full pl-12 pr-28 py-4 rounded-[16px] text-base md:text-lg font-bold tracking-tight transition-all",
                "bg-black/20 border border-white/10 text-[var(--foreground)] placeholder:text-[var(--text-dim)]",
                "focus:outline-none focus:border-[var(--accent-main)] focus:ring-2 focus:ring-[var(--accent-glow)]"
              )}
            />

            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-14 text-[var(--text-muted)] hover:text-[var(--foreground)] p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            )}

            {/* Voice Search Button */}
            <div className="absolute right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleVoiceSearch}
                title={isListening ? "Listening... click to stop" : "Voice Search (Click to speak)"}
                className={clsx(
                  "p-2.5 rounded-xl transition-all flex items-center justify-center relative",
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
                    : "bg-white/10 hover:bg-white/20 text-[var(--foreground)] border border-white/10"
                )}
              >
                {isListening ? <Mic size={18} /> : <Mic size={18} className="opacity-70 group-hover:opacity-100" />}

                {/* Pulsing wave when listening */}
                {isListening && (
                  <span className="absolute -inset-1 rounded-xl bg-red-500/30 animate-ping -z-10" />
                )}
              </button>
            </div>
          </div>

          {/* Search Trigger Button */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={clsx(
              "w-full md:w-auto px-8 py-4 rounded-[16px] font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shrink-0",
              "bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-hover)] text-white shadow-lg shadow-[var(--accent-glow)]",
              "hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Research
              </>
            )}
          </button>
        </form>

        {/* Live Audio Listening Notification */}
        {isListening && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5 text-red-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Voice Signal Active: Speak your research question or topic now...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black text-red-300">Lang:</span>
              <button
                type="button"
                onClick={() => setVoiceLang(voiceLang === 'en-US' ? 'ur-PK' : 'en-US')}
                className="px-2 py-0.5 rounded bg-red-500/20 text-red-200 text-[10px] font-black uppercase"
              >
                {voiceLang === 'en-US' ? 'English (US)' : 'Urdu (اردو)'}
              </button>
            </div>
          </div>
        )}

        {/* Topic Discovery Pills */}
        <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1 mr-1">
            <Filter size={11} /> Trending Topics:
          </span>
          {TOPIC_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(preset.query);
                performSearch(preset.query);
              }}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[var(--foreground)] transition-all flex items-center gap-2 hover:border-[var(--accent-main)]/40 hover:scale-105 active:scale-95"
            >
              <span>{preset.label}</span>
              <span className="text-[10px] opacity-40 font-nastaleeq">{preset.urdu}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── ERROR STATE ──────────────────────────────────────────────── */}
      {error && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── SOURCE FILTER TABS ────────────────────────────────────────── */}
      {results && (
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
          {[
            { id: 'all', label: 'All Sources', count: counts.all, icon: Layers },
            { id: 'ruhani-khazain', label: 'Ruhani Khazain', count: counts.rk, icon: Scroll },
            { id: 'quran', label: 'Holy Qur\'an', count: counts.quran, icon: BookOpen },
            { id: 'alislam', label: 'Al Islam Library', count: counts.alislam, icon: Globe },
            { id: 'periodicals', label: 'Review & Hakam', count: counts.periodicals, icon: Newspaper },
            { id: 'dossier', label: 'AI Dossier', count: counts.dossier, icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as ActiveSourceFilter)}
                className={clsx(
                  "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 border",
                  active
                    ? "bg-[var(--accent-main)] text-white border-[var(--accent-main)] shadow-lg shadow-[var(--accent-glow)]"
                    : "bg-white/5 text-[var(--text-muted)] border-white/5 hover:bg-white/10 hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span
                  className={clsx(
                    "px-1.5 py-0.5 rounded-md text-[10px] font-black",
                    active ? "bg-black/20 text-white" : "bg-white/10 text-[var(--text-muted)]"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── RESULTS DISPLAY AREA ──────────────────────────────────────── */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <Loader2 size={40} className="animate-spin text-[var(--accent-main)] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-xl font-black italic tracking-tight text-[var(--foreground)]">
              Querying Theological Sources...
            </h3>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Scanning Ruhani Khazain Volumes 1-23 • Holy Qur'an • Al Islam • Research Journals
            </p>
          </div>
        </div>
      ) : results ? (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* 1. MURABBIAI THEOLOGICAL DOSSIER (Rendered on 'all' or 'dossier') */}
          {(activeFilter === 'all' || activeFilter === 'dossier') && results.dossier && (
            <div className="glass-card p-6 md:p-8 rounded-[24px] border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-white/5 to-transparent relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      MurabbiAI Theological Briefing
                    </span>
                    <h2 className="text-2xl font-black italic text-[var(--foreground)] tracking-tight">
                      {results.dossier.title}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const text = `${results.dossier?.title}\n\nTHESIS:\n${results.dossier?.theologicalThesis}\n\nKEY ARGUMENTS:\n${results.dossier?.keyArguments.map(a => `• ${a}`).join('\n')}`;
                    copyToClipboard(text, 'dossier-full');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-2 self-start md:self-auto transition-colors"
                >
                  {copiedId === 'dossier-full' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedId === 'dossier-full' ? "Dossier Copied" : "Copy Briefing"}</span>
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {/* Thesis */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                    Core Theological Thesis
                  </h4>
                  <p className="text-base font-medium text-[var(--foreground)] leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                    {results.dossier.theologicalThesis}
                  </p>
                </div>

                {/* Key Arguments */}
                {results.dossier.keyArguments && results.dossier.keyArguments.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                      Foundational Propositions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.dossier.keyArguments.map((arg, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-xs font-semibold text-[var(--foreground)] leading-relaxed">{arg}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quranic & Ruhani Khazain Citations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.dossier.quranicEvidence && results.dossier.quranicEvidence.length > 0 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                        <BookOpen size={13} /> Quranic Citations
                      </h4>
                      {results.dossier.quranicEvidence.map((ev, idx) => (
                        <div key={idx} className="text-xs border-l-2 border-emerald-500/40 pl-3 py-0.5">
                          <div className="font-black text-[var(--foreground)]">{ev.ref}</div>
                          <div className="text-[var(--text-muted)] mt-0.5">{ev.explanation}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.dossier.ruhaniKhazainCitations && results.dossier.ruhaniKhazainCitations.length > 0 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                        <Scroll size={13} /> Ruhani Khazain Proofs
                      </h4>
                      {results.dossier.ruhaniKhazainCitations.map((cit, idx) => (
                        <div key={idx} className="text-xs border-l-2 border-blue-500/40 pl-3 py-0.5">
                          <div className="font-black text-[var(--foreground)]">
                            {cit.book} <span className="opacity-60">(Vol. {cit.volume})</span>
                          </div>
                          <div className="text-[var(--text-muted)] mt-0.5">{cit.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Counter-Arguments & Answers to Critics */}
                {results.dossier.counterArguments && results.dossier.counterArguments.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3 flex items-center gap-1.5">
                      <HelpCircle size={13} /> Responses to Common Objections
                    </h4>
                    <div className="space-y-3">
                      {results.dossier.counterArguments.map((ca, i) => (
                        <div key={i} className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-2">
                          <div className="text-xs font-bold text-purple-300">
                            Objection: <span className="text-[var(--foreground)] font-normal">{ca.objection}</span>
                          </div>
                          <div className="text-xs font-semibold text-[var(--foreground)] bg-black/20 p-3 rounded-lg border border-white/5">
                            Rebuttal: {ca.rebuttal}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. RUHANI KHAZAIN SEARCH RESULTS */}
          {(activeFilter === 'all' || activeFilter === 'ruhani-khazain') && results.ruhaniKhazain.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Scroll size={20} className="text-[var(--accent-main)]" />
                  <h3 className="text-xl font-black italic text-[var(--foreground)] tracking-tight">
                    Ruhani Khazain Excerpts ({results.ruhaniKhazain.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Foundational Works of the Promised Messiah (as)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {results.ruhaniKhazain.map((item, index) => {
                  const itemKey = `rk-${item.volume}-${item.pageNum}-${index}`;
                  const citationString = `[Ruhani Khazain, Vol. ${item.volume}, "${item.bookTitle}", Page ${item.pageNum}]`;
                  return (
                    <div
                      key={itemKey}
                      className="glass-card p-6 rounded-[20px] border border-white/5 bg-white/5 hover:border-[var(--accent-main)]/30 transition-all group"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-main)] font-black text-xs">
                            Vol. {item.volume}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[var(--foreground)] font-bold text-xs">
                            Page {item.pageNum}
                          </span>
                          <span className="font-bold text-sm text-[var(--foreground)]">
                            {item.bookTitle}
                          </span>
                          <span className="font-nastaleeq text-sm text-[var(--text-muted)] mr-2">
                            ({item.bookUrduTitle})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(citationString, itemKey)}
                            title="Copy Citation"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                          >
                            {copiedId === itemKey ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                            <span className="hidden sm:inline">
                              {copiedId === itemKey ? "Copied" : "Cite"}
                            </span>
                          </button>

                          <button
                            onClick={() => router.push(item.readerUrl)}
                            className="px-3.5 py-2 rounded-xl bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)] transition-all"
                          >
                            <span>Open in Reader</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Excerpt text in Nastaleeq */}
                      <div className="p-4 rounded-xl bg-black/25 border border-white/5 text-right font-nastaleeq text-lg md:text-xl leading-loose text-[var(--foreground)] select-text">
                        <span>{item.snippetBefore}</span>
                        <mark className="bg-[var(--accent-main)] text-white font-bold px-2 py-0.5 rounded mx-1">
                          {item.matchedSlice}
                        </mark>
                        <span>{item.snippetAfter}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. HOLY QUR'AN THEMATIC VERSES */}
          {(activeFilter === 'all' || activeFilter === 'quran') && results.quranVerses.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-emerald-400" />
                  <h3 className="text-xl font-black italic text-[var(--foreground)] tracking-tight">
                    The Holy Qur'an & Commentary ({results.quranVerses.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Translation: Hazrat Maulvi Sher Ali (ra)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {results.quranVerses.map((verse, idx) => {
                  const verseKey = `quran-${verse.surahNumber}-${verse.verseNumber}-${idx}`;
                  const citationText = `[Holy Qur'an, Surah ${verse.surahNameEnglish} (${verse.surahNumber}:${verse.verseNumber})]\n"${verse.englishTranslation}"`;
                  return (
                    <div
                      key={verseKey}
                      className="glass-card p-6 md:p-8 rounded-[20px] border border-white/5 bg-white/5 space-y-5"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs">
                            Surah {verse.surahNameEnglish} ({verse.surahNumber}:{verse.verseNumber})
                          </span>
                          <span className="font-quran text-base text-[var(--foreground)] font-bold">
                            {verse.surahNameArabic}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(citationText, verseKey)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                          >
                            {copiedId === verseKey ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                            <span>{copiedId === verseKey ? "Copied" : "Cite Verse"}</span>
                          </button>

                          <a
                            href={verse.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1 text-xs"
                          >
                            <Globe size={14} />
                            <span>Al Islam</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>

                      {/* Arabic Verse */}
                      <div className="p-5 rounded-xl bg-black/20 border border-white/5 text-right font-quran text-2xl md:text-3xl leading-loose text-emerald-300">
                        {verse.arabicText}
                      </div>

                      {/* Translations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                            English Translation
                          </div>
                          <p className="text-[var(--foreground)] font-medium text-sm">
                            "{verse.englishTranslation}"
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1 text-right">
                          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                            اردو ترجمہ
                          </div>
                          <p className="font-nastaleeq text-base text-[var(--foreground)] leading-loose">
                            {verse.urduTranslation}
                          </p>
                        </div>
                      </div>

                      {/* Commentary Insight */}
                      {verse.commentaryNote && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200/90 leading-relaxed">
                          <span className="font-bold text-emerald-300 mr-1.5">Commentary Insight:</span>
                          {verse.commentaryNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. AL ISLAM ARTICLES & BOOKS */}
          {(activeFilter === 'all' || activeFilter === 'alislam') && results.alislamArticles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Globe size={20} className="text-blue-400" />
                  <h3 className="text-xl font-black italic text-[var(--foreground)] tracking-tight">
                    Al Islam Official Resources ({results.alislamArticles.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Official Portal of Ahmadiyya Muslim Community
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.alislamArticles.map((article) => (
                  <div
                    key={article.id}
                    className="glass-card p-6 rounded-[20px] border border-white/5 bg-white/5 hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                          {article.category}
                        </span>
                        {article.author && (
                          <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                            {article.author}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-black tracking-tight text-[var(--foreground)] leading-snug">
                        {article.title}
                      </h4>

                      <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                      >
                        <span>Open on Alislam.org</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. PERIODICALS & SCHOLARLY JOURNALS */}
          {(activeFilter === 'all' || activeFilter === 'periodicals') && results.publications.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Newspaper size={20} className="text-purple-400" />
                  <h3 className="text-xl font-black italic text-[var(--foreground)] tracking-tight">
                    Research Journals & Periodicals ({results.publications.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  The Review of Religions • Al Hakam • Al Fazl
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.publications.map((pub) => (
                  <div
                    key={pub.id}
                    className="glass-card p-6 rounded-[20px] border border-white/5 bg-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">
                          {pub.source}
                        </span>
                        {pub.date && (
                          <span className="text-[10px] font-bold text-[var(--text-muted)]">
                            {pub.date}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-black tracking-tight text-[var(--foreground)] leading-snug">
                        {pub.title}
                      </h4>

                      <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                        {pub.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[var(--text-muted)]">
                        {pub.author ? `By ${pub.author}` : pub.source}
                      </span>

                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black uppercase tracking-wider text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                      >
                        <span>Read Paper</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY RESULTS FALLBACK */}
          {results.totalResults === 0 && (
            <div className="glass-card p-12 rounded-[24px] border border-white/5 bg-white/5 text-center space-y-4">
              <BookOpen size={48} className="mx-auto text-[var(--text-dim)]" />
              <h3 className="text-xl font-black italic text-[var(--foreground)]">No Direct Records Found</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                No matching references found for "{query}". Try querying related theological topics or classical terms (e.g., 'Jesus', 'Khatam', 'Prayer', 'Wahi').
              </p>
              <div className="pt-2">
                <a
                  href={`https://www.alislam.org/?s=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black uppercase tracking-wider text-[var(--foreground)] transition-colors"
                >
                  <Globe size={14} />
                  <span>Search on Al Islam Digital Library</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* INITIAL STATE CARDS */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-main)] flex items-center justify-center">
              <Scroll size={20} />
            </div>
            <h4 className="text-base font-black italic text-[var(--foreground)]">Ruhani Khazain 23 Volumes</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Full-text indexed search across 80+ books written by Hazrat Mirza Ghulam Ahmad (as). Jump directly to the exact volume and page in the Reader.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <h4 className="text-base font-black italic text-[var(--foreground)]">Holy Qur'an & Commentary</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Thematic verses with original Arabic typography, English and Urdu translations, and commentary citations from Hazrat Khalifatul Masih.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-base font-black italic text-[var(--foreground)]">AI Theological Synthesis</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              MurabbiAI extracts core doctrinal arguments, answers common objections, and compiles instant research briefs for Dars, speeches, and articles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
