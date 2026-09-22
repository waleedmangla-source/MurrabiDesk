"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Mic,
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
  ShieldCheck,
  Volume2,
  BookmarkCheck,
  LogIn,
  Home
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MultiSourceSearchResult,
  RuhaniKhazainSearchResult,
  QuranVerseResult,
  AlIslamArticleResult,
  PublicationResult,
  ResearchDossier,
  TheologicalConsensusMatrix
} from '@/lib/research-sources';

type ActiveSourceFilter = 'all' | 'ruhani-khazain' | 'quran' | 'alislam' | 'periodicals' | 'dossier';

export default function ResearchEngine() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveSourceFilter>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MultiSourceSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<string>("0.12");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const isAuth = !!localStorage.getItem("google_refresh_token_encrypted");
    const isGuest = localStorage.getItem("murabbi_guest_mode") === "true";
    setIsUserLoggedIn(isAuth || isGuest);
  }, []);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'ur-PK'>('en-US');
  const recognitionRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Provenance Trail state for DSGT
  const [showProvenance, setShowProvenance] = useState(false);

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
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 select-none relative w-full">
        {/* Top Header Bar for Landing View */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          {isUserLoggedIn ? (
            <Link
              href="/"
              className="px-4 py-2 rounded-full text-xs font-bold glass bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <Home size={14} className="text-emerald-400" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white transition-all shadow-md shadow-[var(--accent-glow)] flex items-center gap-1.5 active:scale-95"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Ambient atmospheric glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-glow)] rounded-full blur-[130px] pointer-events-none -z-10 opacity-70" />

        {/* Murabbi Desk Text Logo */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in zoom-in-95 duration-500">
          <div
            className="relative flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
            onClick={resetToHome}
          >
            <div className="absolute -inset-6 bg-[var(--accent-glow)] rounded-full blur-2xl opacity-40 pointer-events-none" />
            <img
              src="/text-logo.png"
              alt="Murabbi Desk"
              className="h-[80px] md:h-[110px] w-auto object-contain transition-all duration-300 invert mix-blend-multiply select-none drop-shadow-2xl relative z-10"
            />
            <div className="flex items-center gap-2 mt-2 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] px-3 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30">
                Research Protocol
              </span>
            </div>
          </div>

          <p className="text-xs md:text-sm font-semibold text-[var(--text-muted)] tracking-wide mt-3 text-center max-w-lg">
            Unified Theological Intelligence & Multi-Source Ahmadiyya Corpus Search
          </p>
        </div>

        {/* Murabbi Form V4 / Google-Style Search Pill Box (Dead-Centered) */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center relative">
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

          {/* Murabbi Desk Action Button (Centered) */}
          <div className="flex items-center justify-center mt-6">
            <button
              onClick={() => performSearch()}
              disabled={!query.trim()}
              className="px-8 py-3 rounded-[14px] bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-hover)] text-white shadow-lg shadow-[var(--accent-glow)] font-black text-xs uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              Murabbi Search
            </button>
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
      {/* ── TOP HEADER (Murabbi Desk Logo + Centered Search Bar + Auth CTA) ───────────── */}
      <div className="sticky top-0 z-30 glass bg-black/25 dark:bg-[#020310]/90 backdrop-blur-xl border-b border-white/5 pt-3 pb-0 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[208px_1fr_208px] items-center gap-4">
          {/* Left Wing: Navbar text logo */}
          <div className="w-full flex items-center justify-center md:justify-start">
            <div
              onClick={resetToHome}
              className="flex items-center cursor-pointer shrink-0 select-none group py-0.5"
              title="Murabbi Desk"
            >
              <img
                src="/text-logo.png"
                alt="Murabbi Desk"
                className="h-8 md:h-9 w-auto object-contain transition-all duration-300 invert mix-blend-multiply active:scale-95 group-hover:opacity-90"
              />
            </div>
          </div>

          {/* Center Wing: Centered Search Pill Bar */}
          <div className="w-full max-w-2xl mx-auto flex justify-center">
            <form onSubmit={handleFormSubmit} className="relative w-full">
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

          {/* Right Wing: Auth / Dashboard CTA (Balanced with left wing) */}
          <div className="w-full flex items-center justify-center md:justify-end gap-2">
            {isUserLoggedIn ? (
              <Link
                href="/"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold glass border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Home size={13} className="text-emerald-400" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/onboarding"
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white transition-all shadow-md shadow-[var(--accent-glow)] flex items-center gap-1.5 active:scale-95"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── GOOGLE SEARCH TABS (Centered) ─────────────── */}
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 md:gap-6 overflow-x-auto custom-scrollbar mt-3 select-none text-xs md:text-sm">
          {[
            { id: 'all', label: 'All Sources', count: counts.all, icon: Search },
            { id: 'ruhani-khazain', label: 'Ruhani Khazain', count: counts.rk, icon: Scroll },
            { id: 'quran', label: 'Holy Qur\'an', count: counts.quran, icon: BookOpen },
            { id: 'alislam', label: 'Al Islam', count: counts.alislam, icon: Globe },
            { id: 'periodicals', label: 'Periodicals', count: counts.periodicals, icon: Newspaper },
            { id: 'dossier', label: 'Scholarly Overview', count: counts.dossier, icon: BookmarkCheck }
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

      {/* ── RESULTS BODY (Centered) ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-4 flex-1">
        {/* Search Statistics */}
        {results && !loading && (
          <div className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6 max-w-5xl mx-auto text-center md:text-left">
            Found {counts.all} theological records in {searchTime} seconds for <span className="text-[var(--foreground)]">"{submittedQuery}"</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 text-center space-y-4 max-w-2xl mx-auto">
            <Loader2 size={36} className="animate-spin text-[var(--accent-main)] mx-auto" />
            <p className="text-sm font-bold text-[var(--text-muted)] tracking-wide">
              Scanning Ruhani Khazain 1–23, Qur'an, Al Islam, and Periodicals...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 rounded-[14px] bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-6 font-bold">
            {error}
          </div>
        )}

        {/* Results Container (Centered) */}
        {results && !loading && (
          <div className="flex flex-col lg:flex-row justify-center gap-10 max-w-5xl mx-auto">
            {/* Left Column: Results Stream */}
            <div className="flex-1 max-w-2xl space-y-8">
              {/* ── 0. DSGT CONSENSUS TRIANGULATION MATRIX (Mathematical Corroboration) ── */}
              {(activeFilter === 'all' || activeFilter === 'dossier') && results.consensusMatrix && (
                <div className="glass-card p-6 md:p-7 rounded-[18px] border border-[var(--accent-main)]/35 bg-gradient-to-br from-[var(--accent-soft)]/50 via-white/5 to-transparent relative overflow-hidden shadow-xl space-y-5">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/40 flex items-center justify-center text-[var(--accent-main)] shadow-sm shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black italic tracking-tight text-[var(--foreground)] flex items-center gap-2">
                          Consensus Triangulation Matrix
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Deterministic DSGT
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-[var(--text-muted)]">
                          Kleinberg HITS Graph • Cross-Corpus Corroboration Engine
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-main)]/30 text-xs font-black text-[var(--accent-main)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{results.consensusMatrix.confidenceScore}% Corroborated</span>
                      </div>
                      <button
                        onClick={() => {
                          const matrixTxt = `[CONSENSUS TRIANGULATION: ${results.consensusMatrix?.topicTitle}]\nConsensus Level: ${results.consensusMatrix?.consensusLevel} (${results.consensusMatrix?.confidenceScore}%)\nCorroborated Layers: ${results.consensusMatrix?.corroboratedLayersCount}/4\n\nThesis:\n${results.consensusMatrix?.theologicalThesis}\n\nEvidence Provenance:\n${results.consensusMatrix?.provenanceChain.join('\n')}`;
                          copyToClipboard(matrixTxt, 'dsgt-matrix');
                        }}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] p-1.5 rounded-lg hover:bg-white/5 transition-colors font-bold"
                        title="Copy Matrix"
                      >
                        {copiedId === 'dsgt-matrix' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Consensus Level & Confidence Meter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[var(--foreground)]">
                        Theological Verdict: <span className="text-[var(--accent-main)] font-black">{results.consensusMatrix.consensusLevel}</span>
                      </span>
                      <span className="text-[var(--text-muted)] text-[11px]">
                        {results.consensusMatrix.corroboratedLayersCount} of 4 Literature Pillars Corroborated
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/5 p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[var(--accent-main)] to-[var(--accent-main)] transition-all duration-700"
                        style={{ width: `${results.consensusMatrix.confidenceScore}%` }}
                      />
                    </div>
                  </div>

                  {/* The 4 Corroboration Pillars Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {results.consensusMatrix.layers.map((layer, idx) => {
                      const isCorroborated = layer.corroborated;
                      return (
                        <div
                          key={idx}
                          className={clsx(
                            "p-3.5 rounded-[14px] border transition-all text-xs space-y-1.5",
                            isCorroborated
                              ? "bg-white/5 border-white/15 text-[var(--foreground)]"
                              : "bg-white/2 border-white/5 text-[var(--text-muted)] opacity-60"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5">
                              <span className={clsx(
                                "w-2 h-2 rounded-full",
                                isCorroborated ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-neutral-600"
                              )} />
                              {layer.name}
                            </span>
                            <span className={clsx(
                              "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                              isCorroborated ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-[var(--text-muted)]"
                            )}>
                              {isCorroborated ? `${layer.matchCount} Matches` : "Uncorroborated"}
                            </span>
                          </div>

                          {layer.primaryReference && (
                            <div className="text-[11px] font-semibold text-[var(--accent-main)] truncate">
                              {layer.primaryReference}
                            </div>
                          )}

                          {layer.excerptSnippet && (
                            <div className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                              "{layer.excerptSnippet}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Algorithmic Provenance Audit Trail (Collapsible) */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => setShowProvenance(!showProvenance)}
                      className="w-full flex items-center justify-between text-xs font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] py-1 transition-colors"
                    >
                      <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-[var(--accent-main)]">
                        <Layers size={13} />
                        Deterministic Algorithmic Provenance Trail
                      </span>
                      {showProvenance ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showProvenance && (
                      <div className="mt-3 p-3.5 rounded-[12px] bg-black/40 border border-white/5 font-mono text-[11px] text-[var(--text-muted)] space-y-2">
                        {results.consensusMatrix.provenanceChain.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-[var(--accent-main)] font-bold shrink-0">[{idx + 1}]</span>
                            <span className="leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── 1. SCHOLARLY OVERVIEW (Deterministic Theological Synthesis) */}
              {(activeFilter === 'all' || activeFilter === 'dossier') && results.dossier && (
                <div className="glass-card p-6 md:p-7 rounded-[18px] border border-[var(--accent-main)]/30 bg-gradient-to-br from-[var(--accent-soft)] via-white/5 to-transparent relative overflow-hidden shadow-xl">
                  {/* Scholarly Overview Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)] shadow-sm">
                        <BookmarkCheck size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-black italic tracking-tight text-[var(--foreground)] flex items-center gap-2">
                          Scholarly Overview
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)] opacity-70">
                            • Theological Synthesis
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const copyTxt = `${results.dossier?.title}\n\n${results.dossier?.theologicalThesis}\n\nKey Points:\n${results.dossier?.keyArguments.map(a => `- ${a}`).join('\n')}`;
                        copyToClipboard(copyTxt, 'scholarly-overview');
                      }}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors font-bold"
                      title="Copy Overview"
                    >
                      {copiedId === 'scholarly-overview' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span className="text-[11px] uppercase tracking-wider">{copiedId === 'scholarly-overview' ? "Copied" : "Copy Briefing"}</span>
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
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-2">
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

                      {results.hitsRankings && results.hitsRankings.authorities.some(a => a.nodeId.includes(`rk:vol${item.volume}`)) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/20 flex items-center gap-1 shrink-0">
                          <ShieldCheck size={11} />
                          HITS Root Authority
                        </span>
                      )}
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
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-2">
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

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                        <ShieldCheck size={11} />
                        Canonical Scriptural Authority (1.00)
                      </span>
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

              {/* End of results padding */}
              <div className="pb-12" />
            </div>

            {/* Right Column: Knowledge Panel (Desktop) */}
            {(results.dossier || results.consensusMatrix) && (
              <div className="hidden lg:block w-80 shrink-0 space-y-4">
                {/* DSGT Quick Stats Card */}
                {results.consensusMatrix && (
                  <div className="glass-card p-5 rounded-[18px] border border-[var(--accent-main)]/30 bg-gradient-to-br from-[var(--accent-soft)]/40 to-transparent shadow-xl space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)]">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={13} />
                        Consensus Engine
                      </span>
                      <span className="text-emerald-400 font-bold">{results.consensusMatrix.confidenceScore}%</span>
                    </div>

                    <div className="text-sm font-black italic tracking-tight text-[var(--foreground)]">
                      {results.consensusMatrix.consensusLevel}
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      Deterministic verification across {results.consensusMatrix.corroboratedLayersCount} of 4 canonical literature layers.
                    </p>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)]">
                      <span>Corroborated Sources:</span>
                      <span className="text-[var(--accent-main)] font-black">{results.consensusMatrix.totalCorroboratedSources} citations</span>
                    </div>
                  </div>
                )}

                {results.dossier && (
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
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
