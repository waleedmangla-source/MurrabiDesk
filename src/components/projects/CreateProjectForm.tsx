"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Mic,
  GraduationCap,
  Users,
  Megaphone,
  FileText,
  Clock,
  Sparkles,
  Bookmark,
  Check,
  Search,
  ArrowLeft,
  Copy,
  Edit3,
  Flame,
  Zap,
  BookOpen,
  PartyPopper,
  AlertCircle,
  Sprout,
  CheckCircle,
  ChevronDown,
  X
} from 'lucide-react';
import clsx from 'clsx';
import {
  ProjectType,
  MurabbiProject,
  createNewProject
} from '@/lib/projects-storage';
import {
  ResearchBookmarkItem,
  BookmarkCategory,
  getLocalResearchBookmarks
} from '@/lib/research-storage';

interface CreateProjectFormProps {
  onCancel: () => void;
  onProjectCreated: (newProject: MurabbiProject, shouldGenerateAI: boolean) => void;
  initialSelectedBookmarks?: ResearchBookmarkItem[];
  initialType?: ProjectType;
}

export type AudienceOption = 'lajna' | 'khuddam' | 'atfal' | 'ansar' | 'nasirat' | 'all';
export type SpeechToneOption =
  | 'inspirational'
  | 'direct'
  | 'scholarly'
  | 'celebratory'
  | 'urgent'
  | 'gentle';

export default function CreateProjectForm({
  onCancel,
  onProjectCreated,
  initialSelectedBookmarks = [],
  initialType = 'speech'
}: CreateProjectFormProps) {
  // Form State
  const [workType, setWorkType] = useState<ProjectType>(initialType);
  const [topic, setTopic] = useState('');
  const [selectedAudiences, setSelectedAudiences] = useState<AudienceOption[]>(['all']);
  const [language, setLanguage] = useState<'english' | 'urdu' | 'both'>('english');
  const [speechTone, setSpeechTone] = useState<SpeechToneOption>('inspirational');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [occasion, setOccasion] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [autoGenerateAI, setAutoGenerateAI] = useState(true);

  // Bookmarks State
  const [allBookmarks, setAllBookmarks] = useState<ResearchBookmarkItem[]>([]);
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(new Set());
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | BookmarkCategory>('all');

  // Prompt customization state
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Sync initial type if provided
  useEffect(() => {
    if (initialType) setWorkType(initialType);
  }, [initialType]);

  // Load bookmarks from local storage
  useEffect(() => {
    const bks = getLocalResearchBookmarks();
    setAllBookmarks(bks);

    if (initialSelectedBookmarks && initialSelectedBookmarks.length > 0) {
      setSelectedBookmarkIds(new Set(initialSelectedBookmarks.map(b => b.id)));
    }
  }, [initialSelectedBookmarks]);

  // Delivery Formats Definition
  const WORK_TYPES: {
    id: ProjectType;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badgeColor: string;
  }[] = [
    {
      id: 'speech',
      label: 'Speech / Taqreer',
      sublabel: 'Hamd-o-Sana, rhetorical arcs & time pacing',
      icon: Mic,
      badgeColor: 'text-red-400'
    },
    {
      id: 'dars',
      label: 'Dars / Class',
      sublabel: 'Verse recitation, tafseer & discussion points',
      icon: GraduationCap,
      badgeColor: 'text-emerald-400'
    },
    {
      id: 'ijlas',
      label: 'Ijlas / Meeting',
      sublabel: 'Presidential remarks, agenda & tarbiyat',
      icon: Users,
      badgeColor: 'text-purple-400'
    },
    {
      id: 'announcement',
      label: "Announcement / I'laan",
      sublabel: 'Urgent directives, event logistics & appeals',
      icon: Megaphone,
      badgeColor: 'text-amber-400'
    },
    {
      id: 'article',
      label: 'Theological Article',
      sublabel: 'Scholarly proofs, counter-arguments & citations',
      icon: FileText,
      badgeColor: 'text-blue-400'
    }
  ];

  const selectedFormat = WORK_TYPES.find(t => t.id === workType) || WORK_TYPES[0];
  const FormatIcon = selectedFormat.icon;

  // Audiences
  const AUDIENCES: { id: AudienceOption; label: string; desc: string }[] = [
    { id: 'all', label: 'All / General Jama’at', desc: 'Combined congregation' },
    { id: 'khuddam', label: 'Majlis Khuddamul Ahmadiyya', desc: 'Youth & young men (15-40)' },
    { id: 'lajna', label: 'Lajna Ima’illah', desc: 'Ahmadi Muslim women' },
    { id: 'atfal', label: 'Majlis Atfalul Ahmadiyya', desc: 'Boys under 15' },
    { id: 'nasirat', label: 'Nasirat-ul-Ahmadiyya', desc: 'Girls under 15' },
    { id: 'ansar', label: 'Majlis Ansarullah', desc: 'Men over 40' }
  ];

  // Delivery Tones
  const TONES: {
    id: SpeechToneOption;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      id: 'inspirational',
      label: 'Inspirational & Uplifting',
      description: 'Ignites spiritual energy, love for Khilafat, and dedication to God.',
      icon: Flame,
      color: 'text-amber-400'
    },
    {
      id: 'direct',
      label: 'Direct & Admonishing / Tarbiyati',
      description: 'Clear moral exhortation, spiritual accountability, and urgent reform.',
      icon: Zap,
      color: 'text-rose-400'
    },
    {
      id: 'scholarly',
      label: 'Scholarly & Analytical',
      description: 'Evidence-based theological argumentation, classical Arabic & texts.',
      icon: BookOpen,
      color: 'text-blue-400'
    },
    {
      id: 'celebratory',
      label: 'Celebratory & Joyful',
      description: 'Jalsa, Eid, or Amin celebrations with gratitude and spiritual joy.',
      icon: PartyPopper,
      color: 'text-emerald-400'
    },
    {
      id: 'urgent',
      label: 'Urgent & Action-Oriented',
      description: 'High-energy rallying call for events, chanda appeals, or deadlines.',
      icon: AlertCircle,
      color: 'text-orange-400'
    },
    {
      id: 'gentle',
      label: 'Gentle & Pedagogical',
      description: 'Warm, nurturing instruction suited for Atfal, youth, and new converts.',
      icon: Sprout,
      color: 'text-teal-400'
    }
  ];

  // Audience toggle logic
  const handleAudienceToggle = (id: AudienceOption) => {
    if (id === 'all') {
      if (selectedAudiences.includes('all')) {
        setSelectedAudiences(['khuddam']);
      } else {
        setSelectedAudiences(['all']);
      }
      return;
    }

    const withoutAll = selectedAudiences.filter(a => a !== 'all');
    let next: AudienceOption[];
    if (withoutAll.includes(id)) {
      next = withoutAll.filter(a => a !== id);
      if (next.length === 0) next = ['all'];
    } else {
      next = [...withoutAll, id];
    }
    setSelectedAudiences(next);
  };

  // Live Auto-Generated Prompt Brief
  const generatedPrompt = useMemo(() => {
    const audNames = selectedAudiences.includes('all')
      ? 'General Jama’at (All members)'
      : selectedAudiences.map(a => a.toUpperCase()).join(', ');

    const toneDesc = TONES.find(t => t.id === speechTone)?.label || speechTone;
    const langDesc = language === 'both' ? 'Bilingual (English with Urdu/Arabic terms)' : language.toUpperCase();
    const estWords = Math.round(durationMinutes * 130);

    let brief = `DELIVERABLE FORMAT: ${workType.toUpperCase()}
TOPIC / CENTRAL THESIS: "${topic || 'Untitled Theological Theme'}"
TARGET AUDIENCE: ${audNames}
LANGUAGE: ${langDesc}
DELIVERY TONE & FEEL: ${toneDesc}
LENGTH: Exactly ${durationMinutes} minute(s) (~${estWords} words)
`;

    if (occasion.trim()) {
      brief += `OCCASION / SETTING: ${occasion.trim()}\n`;
    }
    if (callToAction.trim()) {
      brief += `DESIRED OUTCOME / CALL-TO-ACTION: ${callToAction.trim()}\n`;
    }

    brief += `\nINSTRUCTIONS FOR MURABBIAI:
1. Ground the manuscript firmly in Holy Quranic verses and Hadith, incorporating classical commentary from the Promised Messiah (as) and Khulafa-e-Ahmadiyyat.
2. Structure the delivery pacing strictly for a ${durationMinutes}-minute time frame with clear oratorical milestones.
3. Adhere to the requested ${speechTone} tone and address the specific spiritual needs of ${audNames}.`;

    return brief;
  }, [workType, topic, selectedAudiences, language, speechTone, durationMinutes, occasion, callToAction]);

  // Sync customPrompt with generatedPrompt if not manually edited
  useEffect(() => {
    if (!isEditingPrompt) {
      setCustomPrompt(generatedPrompt);
    }
  }, [generatedPrompt, isEditingPrompt]);

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(customPrompt || generatedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Bookmarks helper handlers
  const toggleSelectBookmark = (id: string) => {
    setSelectedBookmarkIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredBookmarks = useMemo(() => {
    return allBookmarks.filter(b => {
      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      const matchesSearch =
        !bookmarkSearch.trim() ||
        b.title.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(bookmarkSearch.toLowerCase())) ||
        (b.snippet && b.snippet.toLowerCase().includes(bookmarkSearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allBookmarks, selectedCategory, bookmarkSearch]);

  const selectAllFiltered = () => {
    setSelectedBookmarkIds(prev => {
      const next = new Set(prev);
      filteredBookmarks.forEach(b => next.add(b.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedBookmarkIds(prev => {
      const next = new Set(prev);
      filteredBookmarks.forEach(b => next.delete(b.id));
      return next;
    });
  };

  const getCategoryBadge = (cat: BookmarkCategory) => {
    switch (cat) {
      case 'quran':
        return { label: 'Quran', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'ahadith':
        return { label: 'Hadith', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'khazain':
        return { label: 'Ruhani Khazain', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'malfuzat':
        return { label: 'Malfuzat', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'tazkirah':
        return { label: 'Tazkirah', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'essence':
        return { label: 'Essence of Islam', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      default:
        return { label: cat.toUpperCase(), color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    }
  };

  const handleCreate = () => {
    if (!topic.trim()) return;

    const chosenBookmarks = allBookmarks.filter(b => selectedBookmarkIds.has(b.id));
    const finalPrompt = customPrompt.trim() || generatedPrompt;

    const newProj = createNewProject({
      title: topic.trim(),
      type: workType,
      description: `Tone: ${speechTone} • Length: ${durationMinutes} min • Occasion: ${occasion || 'N/A'}`,
      targetAudience: selectedAudiences.join(', '),
      audiences: selectedAudiences,
      language,
      speechTone,
      durationMinutes,
      occasion: occasion.trim(),
      callToAction: callToAction.trim(),
      generatedPrompt: finalPrompt,
      customPrompt: isEditingPrompt ? finalPrompt : undefined,
      bookmarks: chosenBookmarks
    });

    onProjectCreated(newProj, autoGenerateAI);
  };

  return (
    <div className="flex flex-col gap-6 pb-16 animate-in fade-in slide-in-from-bottom-8 duration-500 w-full px-4 sm:px-6 md:px-10 pt-6 max-w-7xl mx-auto">
      
      {/* ──────── FORM-V4 CONTAINER (Authentic Murabbi Desk Expense Card Form) ──────── */}
      <div className="w-full space-y-6 form-v4 no-drag">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

          {/* ════════ CARD 1: GENERAL SPECIFICATIONS & TOPIC ════════ */}
          <div className="card" id="general-info-card">
            <div className="card-hdr">
              <div className="dot"></div>
              <span>GENERAL SPECIFICATIONS & TOPIC</span>
            </div>

            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                
                {/* Left Column: Format Dropdown & Occasion */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Deliverable Format / Type</span>
                      <span className="text-[10px] text-[var(--accent-main)] font-mono font-bold uppercase tracking-wider">
                        {selectedFormat.label.split('/')[0].trim()}
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--accent-main)] flex items-center">
                        <FormatIcon size={16} />
                      </div>
                      <select
                        value={workType}
                        onChange={e => setWorkType(e.target.value as ProjectType)}
                        className="cursor-pointer appearance-none !pl-10 !pr-10"
                      >
                        {WORK_TYPES.map(type => (
                          <option
                            key={type.id}
                            value={type.id}
                            className="bg-neutral-900 text-neutral-100"
                          >
                            {type.label} — {type.sublabel}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-dim)]"
                      />
                    </div>
                    <p className="text-[10px] text-[var(--text-dim)] italic">
                      {selectedFormat.sublabel}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl">Occasion / Setting (Optional)</label>
                    <input
                      type="text"
                      value={occasion}
                      onChange={e => setOccasion(e.target.value)}
                      placeholder="e.g. Friday Sermon, Jalsa Salana, National Ijtema, Local Halqa Dars"
                    />
                  </div>
                </div>

                {/* Right Column: Topic with 150-char limit */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Topic / Central Thesis</span>
                      <span className={clsx(
                        "font-mono font-bold normal-case tracking-normal text-[10px]",
                        topic.length >= 150 ? "text-amber-500" : "text-[var(--text-dim)]"
                      )}>
                        {topic.length} / 150 letters
                      </span>
                    </label>
                    <input
                      type="text"
                      value={topic}
                      maxLength={150}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. The Philosophy of Divine Decree & Free Will according to the Promised Messiah (as)"
                      className="font-medium"
                    />
                    <p className="text-[10px] text-[var(--text-dim)] italic">
                      Strict 150-character limit to ensure crisp, focused doctrinal alignment.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ════════ CARD 2: AUDIENCE, LANGUAGE & DURATION PACING ════════ */}
          <div className="card" id="audience-metrics-card">
            <div className="card-hdr">
              <div className="dot"></div>
              <span>TARGET AUDIENCE, LANGUAGE & DURATION PACING</span>
            </div>

            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                
                {/* Left: Audience Multi-select & Language */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Target Audience</span>
                      <span className="text-[10px] text-[var(--text-dim)] font-mono normal-case">
                        Multi-select allowed
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {AUDIENCES.map(aud => {
                        const isSelected = selectedAudiences.includes(aud.id);
                        return (
                          <div
                            key={aud.id}
                            onClick={() => handleAudienceToggle(aud.id)}
                            className={clsx(
                              "px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 select-none",
                              isSelected
                                ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-[var(--accent-main)] font-bold"
                                : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent-main)]/30"
                            )}
                          >
                            <div className={clsx(
                              "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-[10px]",
                              isSelected ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white" : "border-[var(--glass-border)]"
                            )}>
                              {isSelected && <Check size={10} />}
                            </div>
                            <span className="truncate">{aud.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl">Delivery Language</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'english', label: 'English', desc: 'Standard english speech' },
                        { id: 'urdu', label: 'Urdu', desc: 'اردو فصیح تقریر' },
                        { id: 'both', label: 'Both (Bilingual)', desc: 'English with Arabic/Urdu' }
                      ].map(lang => (
                        <div
                          key={lang.id}
                          onClick={() => setLanguage(lang.id as any)}
                          className={clsx(
                            "p-2.5 rounded-xl border text-center cursor-pointer transition-all select-none",
                            language === lang.id
                              ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-[var(--accent-main)] font-bold"
                              : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent-main)]/30"
                          )}
                        >
                          <div className="text-xs font-bold">{lang.label}</div>
                          <div className="text-[9px] text-[var(--text-dim)] mt-0.5">{lang.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Duration Slider & Call-To-Action */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Target Delivery Length</span>
                      <span className="font-mono text-xs text-[var(--accent-main)] font-black">
                        {durationMinutes} min (~{Math.round(durationMinutes * 130)} words)
                      </span>
                    </label>

                    {/* Range Slider */}
                    <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] space-y-2">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={durationMinutes}
                        onChange={e => setDurationMinutes(parseInt(e.target.value, 10))}
                        className="w-full accent-[var(--accent-main)] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-[var(--text-dim)]">
                        <span>1 min (Brief)</span>
                        <span>15 min (Speech)</span>
                        <span>30 min (Keynote)</span>
                      </div>
                    </div>
                  </div>

                  {/* Call to action */}
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl">Desired Call-to-Action / Outcome (Optional)</label>
                    <input
                      type="text"
                      value={callToAction}
                      onChange={e => setCallToAction(e.target.value)}
                      placeholder="e.g. Inspire youth to commit to daily Tahajjud prayer and submit Tahrik-e-Jadid pledges"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ════════ CARD 3: DELIVERY TONE & EMOTIONAL CADENCE ════════ */}
          <div className="card" id="tone-card">
            <div className="card-hdr">
              <div className="dot"></div>
              <span>DELIVERY TONE & EMOTIONAL CADENCE</span>
            </div>

            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TONES.map(tone => {
                  const Icon = tone.icon;
                  const isSelected = speechTone === tone.id;
                  return (
                    <div
                      key={tone.id}
                      onClick={() => setSpeechTone(tone.id)}
                      className={clsx(
                        "p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 select-none",
                        isSelected
                          ? "bg-[var(--accent-soft)] border-[var(--accent-main)] shadow-md shadow-[var(--accent-glow)]/20"
                          : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-main)]/30 hover:bg-[var(--accent-soft)]/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={clsx("p-2 rounded-lg bg-[var(--accent-soft)]", tone.color)}>
                          <Icon size={16} />
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[var(--accent-main)]" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[var(--text-main)]">
                          {tone.label}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-1">
                          {tone.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ════════ CARD 4: RESEARCH DOSSIER & CITATIONS ════════ */}
          <div className="card" id="citations-card">
            <div className="card-hdr flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="dot"></div>
                <span>RESEARCH DOSSIER & CITATIONS ({selectedBookmarkIds.size} SELECTED)</span>
              </div>
              <span className="text-[9px] font-mono lowercase tracking-normal text-[var(--text-dim)]">
                from Research Library
              </span>
            </div>

            <div className="card-body space-y-4">
              
              {/* Category Filter & Search Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[var(--glass-border)]">
                
                {/* Search in bookmarks */}
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    type="text"
                    value={bookmarkSearch}
                    onChange={e => setBookmarkSearch(e.target.value)}
                    placeholder="Search bookmarks by topic, book or verse..."
                    className="!pl-9 !py-2 text-xs"
                  />
                  {bookmarkSearch && (
                    <button
                      type="button"
                      onClick={() => setBookmarkSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)]"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Selection helper buttons */}
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--accent-soft)] text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--glass-border)] transition-colors"
                  >
                    Select All ({filteredBookmarks.length})
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllFiltered}
                    className="px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--accent-soft)] text-[11px] font-bold text-[var(--text-dim)] hover:text-[var(--text-main)] border border-[var(--glass-border)] transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Bookmarks Grid / Empty State */}
              {allBookmarks.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] space-y-2">
                  <Bookmark size={28} className="mx-auto text-[var(--text-dim)]" />
                  <div className="font-bold text-xs text-[var(--text-main)]">No Bookmarks Saved in Research Tab Yet</div>
                  <p className="text-[11px] text-[var(--text-muted)] max-w-md mx-auto">
                    You can still initialize this work! MurabbiAI will synthesize authoritative scriptural citations automatically based on your prompt brief.
                  </p>
                </div>
              ) : filteredBookmarks.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-dim)] text-xs">
                  No bookmarks match your search filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {filteredBookmarks.map(b => {
                    const isSelected = selectedBookmarkIds.has(b.id);
                    const badge = getCategoryBadge(b.category);

                    return (
                      <div
                        key={b.id}
                        onClick={() => toggleSelectBookmark(b.id)}
                        className={clsx(
                          "p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none",
                          isSelected
                            ? "bg-[var(--accent-soft)] border-[var(--accent-main)]/70 shadow-sm"
                            : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-main)]/30 hover:bg-[var(--accent-soft)]/20"
                        )}
                      >
                        <div className={clsx(
                          "w-5 h-5 rounded-md border mt-0.5 shrink-0 flex items-center justify-center transition-colors text-xs",
                          isSelected
                            ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white"
                            : "border-[var(--glass-border)]"
                        )}>
                          {isSelected && <Check size={12} />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={clsx("px-1.5 py-0.5 rounded text-[9px] font-bold border", badge.color)}>
                              {badge.label}
                            </span>
                            <span className="font-bold text-xs text-[var(--text-main)] truncate">
                              {b.title}
                            </span>
                          </div>

                          {b.subtitle && (
                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 font-mono">
                              {b.subtitle}
                            </p>
                          )}

                          {b.snippet && (
                            <p className="text-[10px] text-[var(--text-dim)] line-clamp-2 italic leading-relaxed">
                              "{b.snippet}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ════════ CARD 5: MURABBIAI PROMPT BRIEF & GENERATION PROTOCOL ════════ */}
          <div className="card" id="prompt-card">
            <div className="card-hdr flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="dot"></div>
                <span>MURABBIAI PROMPT BRIEF & SYNTHESIS</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPrompt(prev => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--accent-soft)] text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--glass-border)] flex items-center gap-1 transition-colors"
                >
                  <Edit3 size={11} />
                  <span>{isEditingPrompt ? 'Auto-Sync' : 'Customize'}</span>
                </button>
                <button
                  type="button"
                  onClick={copyPromptToClipboard}
                  className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--accent-soft)] text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--glass-border)] flex items-center gap-1 transition-colors"
                >
                  {copiedPrompt ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="card-body space-y-4">
              {isEditingPrompt ? (
                <textarea
                  rows={7}
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  className="w-full !p-3.5 !rounded-xl !bg-[var(--glass-bg)] !border-[var(--accent-main)]/50 text-[var(--text-main)] font-mono text-xs leading-relaxed"
                />
              ) : (
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] font-mono text-xs text-[var(--text-main)] whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
                  {generatedPrompt}
                </div>
              )}

              {/* Auto Generate Checkbox */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[var(--text-main)]">Generate Mock Draft & Action Plan with MurabbiAI</h5>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      MurabbiAI will synthesize your selected bookmarks into a structured delivery roadmap and full draft.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={autoGenerateAI}
                  onChange={e => setAutoGenerateAI(e.target.checked)}
                  className="w-5 h-5 rounded border-[var(--glass-border)] accent-[var(--accent-main)] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* ════════ BOTTOM SUBMIT ACTIONS BAR ════════ */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3.5 glass rounded-[18px] border border-[var(--glass-border)] hover:border-[var(--accent-main)]/30 hover:bg-[var(--accent-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Works</span>
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={!topic.trim()}
              className="btn-ruby px-8 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-[var(--accent-glow)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles size={16} />
              <span>{autoGenerateAI ? "Initialize & Generate Draft" : "Save Taleef Work"}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
