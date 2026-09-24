"use client";
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Scroll,
  Layers,
  Book,
  Newspaper,
  Headphones,
  ShieldCheck,
  Check,
  Loader2,
  Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';

interface SearchStage {
  id: string;
  name: string;
  badge: string;
  description: string;
  activeText: string;
  doneText: string;
  icon: React.ElementType;
}

const STAGES: SearchStage[] = [
  {
    id: 'quran',
    name: "The Holy Qur'an & Tafsir",
    badge: '114 Surahs',
    description: 'Analyzing Arabic text, translations & 5-Volume Commentary',
    activeText: 'Parsing Arabic root morphology & classical exegesis...',
    doneText: 'Verses & 5-Vol. commentary matched',
    icon: BookOpen
  },
  {
    id: 'hadith',
    name: 'Canonical Ahadith',
    badge: 'Sunnah.com Database',
    description: 'Querying live authentic traditions across Bukhari, Muslim, Tirmidhi',
    activeText: 'Executing live queries against authentic Sunnah database...',
    doneText: 'Prophetic traditions retrieved',
    icon: Scroll
  },
  {
    id: 'khazain',
    name: 'Ruhani Khazain',
    badge: 'Volumes 1–23',
    description: 'Full-text indexing of the Promised Messiah (as) library',
    activeText: 'Scanning 23-volume library with exact page citations...',
    doneText: 'Primary theological writings indexed',
    icon: Layers
  },
  {
    id: 'literature',
    name: 'Published Literature Catalog',
    badge: 'Al Islam Books',
    description: 'Searching treatises, historical books & theological works',
    activeText: 'Reviewing published books, authors & topic catalogs...',
    doneText: 'Published literature catalog matched',
    icon: Book
  },
  {
    id: 'periodicals',
    name: 'Live Periodicals & Papers',
    badge: 'Al Hakam, RoR & Al Fazl',
    description: 'Scanning alhakam.org, reviewofreligions.org, alfazl.com & alislam.org',
    activeText: 'Connecting live to Al Hakam, Review of Religions & Al Fazl...',
    doneText: 'Periodical archives collected',
    icon: Newspaper
  },
  {
    id: 'media',
    name: 'Ask Islam & MTA Media',
    badge: 'Audio & Video',
    description: 'Searching audio Q&As and MTA video spoken transcripts',
    activeText: 'Matching spoken audio & video transcript timestamps...',
    doneText: 'Spoken media timestamps ready',
    icon: Headphones
  },
  {
    id: 'consensus',
    name: 'Theological Triangulation',
    badge: 'Consensus Matrix',
    description: 'Cross-referencing Quran, Hadith & Khazain theological consensus',
    activeText: 'Synthesizing cross-source theological consensus matrix...',
    doneText: 'Consensus verified',
    icon: ShieldCheck
  }
];

interface SearchStageTrackerProps {
  query: string;
  active: boolean;
}

export default function SearchStageTracker({ query, active }: SearchStageTrackerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0.0);

  useEffect(() => {
    if (!active) {
      setCurrentStep(STAGES.length);
      return;
    }

    setCurrentStep(0);
    setElapsedSec(0.0);
    const startMs = Date.now();

    // Elapsed timer
    const timerInterval = setInterval(() => {
      const now = Date.now();
      setElapsedSec(Number(((now - startMs) / 1000).toFixed(1)));
    }, 100);

    // Staged progression timetable
    const timeouts = [
      setTimeout(() => setCurrentStep(1), 320),
      setTimeout(() => setCurrentStep(2), 700),
      setTimeout(() => setCurrentStep(3), 1100),
      setTimeout(() => setCurrentStep(4), 1600),
      setTimeout(() => setCurrentStep(5), 2150),
      setTimeout(() => setCurrentStep(6), 2700),
    ];

    return () => {
      clearInterval(timerInterval);
      timeouts.forEach(clearTimeout);
    };
  }, [active]);

  // Overall progress percentage
  const progressPercent = active
    ? Math.min(95, Math.max(10, Math.round(((currentStep + 1) / STAGES.length) * 90)))
    : 100;

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-5 md:p-6 rounded-2xl glass bg-[#050713]/90 dark:bg-[#020310]/90 border border-white/10 shadow-2xl space-y-5">
        {/* Header Bar with Live Indicator & Elapsed Time */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Loader2 size={15} className="animate-spin text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black tracking-tight text-[var(--foreground)] flex items-center gap-1.5">
                <span>Multi-Source Search Engine</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  Live
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-medium truncate max-w-xs md:max-w-md">
                Searching for <strong className="text-[var(--foreground)]">"{query}"</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[var(--text-muted)] font-bold">
              {elapsedSec.toFixed(1)}s elapsed
            </span>
            <span className="text-emerald-400 font-bold hidden sm:inline">
              Step {Math.min(currentStep + 1, STAGES.length)} of {STAGES.length}
            </span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-1.5 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-300 ease-out shadow-sm shadow-emerald-500/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ── STAGE-BY-STAGE PIPELINE LIST ── */}
        <div className="divide-y divide-white/5 pt-1">
          {STAGES.map((stage, idx) => {
            const isDone = currentStep > idx || !active;
            const isActive = currentStep === idx && active;
            const isPending = currentStep < idx && active;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={clsx(
                  "py-3 flex items-center justify-between gap-3 transition-all duration-200",
                  isActive && "bg-white/[0.03] -mx-3 px-3 rounded-xl scale-[1.01]",
                  isPending && "opacity-40"
                )}
              >
                {/* Left: Icon & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={clsx(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                      isDone
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/20"
                        : isActive
                        ? "bg-teal-500/20 border-teal-400/50 text-teal-300 shadow-md shadow-teal-500/30"
                        : "bg-white/5 border-white/10 text-[var(--text-muted)]"
                    )}
                  >
                    {isDone ? (
                      <Check size={16} className="text-emerald-400 stroke-[3]" />
                    ) : isActive ? (
                      <Loader2 size={16} className="animate-spin text-teal-300" />
                    ) : (
                      <Icon size={15} />
                    )}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "text-xs md:text-sm font-bold tracking-tight",
                          isDone
                            ? "text-[var(--foreground)]"
                            : isActive
                            ? "text-teal-300 font-extrabold"
                            : "text-[var(--text-muted)]"
                        )}
                      >
                        {stage.name}
                      </span>
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] hidden sm:inline px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                        {stage.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {isActive ? (
                        <span className="text-teal-400 font-medium animate-pulse">
                          {stage.activeText}
                        </span>
                      ) : isDone ? (
                        <span className="text-emerald-400/80 font-medium">
                          {stage.doneText}
                        </span>
                      ) : (
                        <span>{stage.description}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: Stage Status Badge */}
                <div className="shrink-0 text-right">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Check size={11} className="stroke-[3]" />
                      <span>Ready</span>
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-teal-300 px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 animate-pulse">
                      <Loader2 size={10} className="animate-spin" />
                      <span>Scanning</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider px-2 py-0.5">
                      Queued
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
