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
    activeText: "Searching Holy Qur'an...",
    doneText: 'Verses & 5-Vol. commentary matched',
    icon: BookOpen
  },
  {
    id: 'hadith',
    name: 'Canonical Ahadith',
    badge: 'Sunnah.com Database',
    description: 'Querying live authentic traditions across Bukhari, Muslim, Tirmidhi',
    activeText: 'Searching Ahadith...',
    doneText: 'Prophetic traditions retrieved',
    icon: Scroll
  },
  {
    id: 'khazain',
    name: 'Ruhani Khazain, Malfuzat, Tadhkirah & Essence of Islam',
    badge: '23 Vols RK, 10 Vols Malfuzat, Tadhkirah & 5 Vols Essence',
    description: 'Indexing written treatises, spoken discourses, divine revelations & thematic extracts',
    activeText: 'Searching Ruhani Khazain & Malfuzat...',
    doneText: 'Treatises, discourses, revelations & thematic extracts matched',
    icon: Layers
  },
  {
    id: 'literature',
    name: 'Published Literature Catalog',
    badge: 'Al Islam Books',
    description: 'Searching treatises, historical books & theological works',
    activeText: 'Searching Literature...',
    doneText: 'Published literature catalog matched',
    icon: Book
  },
  {
    id: 'periodicals',
    name: 'Live Periodicals & Papers',
    badge: 'Al Hakam, RoR & Al Fazl',
    description: 'Scanning alhakam.org, reviewofreligions.org, alfazl.com & alislam.org',
    activeText: 'Searching Periodicals & Papers...',
    doneText: 'Periodical archives collected',
    icon: Newspaper
  },
  {
    id: 'media',
    name: 'Ask Islam & MTA Media',
    badge: 'Audio & Video',
    description: 'Searching audio Q&As and MTA video spoken transcripts',
    activeText: 'Searching Media & Audios...',
    doneText: 'Spoken media timestamps ready',
    icon: Headphones
  },
  {
    id: 'consensus',
    name: 'Theological Triangulation',
    badge: 'Consensus Matrix',
    description: 'Cross-referencing Quran, Hadith & Khazain theological consensus',
    activeText: 'Searching Theological Insights...',
    doneText: 'Consensus verified',
    icon: ShieldCheck
  }
];

interface SearchStageTrackerProps {
  query: string;
  active: boolean;
  searchMode?: 'contextual' | 'verbatim';
}

export default function SearchStageTracker({ query, active, searchMode }: SearchStageTrackerProps) {
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

  const activeStage = STAGES[Math.min(currentStep, STAGES.length - 1)];

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 animate-in fade-in duration-300">
      <div className="p-6 md:p-8 rounded-2xl glass bg-[#050713]/90 dark:bg-[#020310]/90 border border-white/10 shadow-2xl space-y-6 text-center">
        {/* Simple single pulsing loader & stage title */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Loader2 size={20} className="animate-spin text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {activeStage?.name || "Searching sources..."}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
              Searching for <strong className="text-[var(--foreground)]">"{query}"</strong>
            </p>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-1.5 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>{activeStage?.activeText || "Searching sources..."}</span>
            <span>{elapsedSec.toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
