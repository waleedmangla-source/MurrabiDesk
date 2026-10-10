"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Mic,
  GraduationCap,
  FileText,
  Search,
  Check,
  CheckSquare,
  Square,
  Bookmark,
  Layers,
  Feather,
  Clock,
  Users,
  Languages,
  Flame,
  Target,
  Building,
  Copy,
  Edit3,
  ArrowRight,
  Info,
  Sliders,
  Volume2,
  Megaphone,
  HeartHandshake
} from 'lucide-react';
import clsx from 'clsx';
import {
  ResearchBookmarkItem,
  BookmarkCategory,
  getLocalResearchBookmarks
} from '@/lib/research-storage';
import {
  ProjectType,
  MurabbiProject,
  createNewProject
} from '@/lib/projects-storage';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: MurabbiProject, shouldGenerateAI: boolean) => void;
  initialSelectedBookmarks?: ResearchBookmarkItem[];
}

// ─────────────────────────────────────────────────────────────
// Questionnaire Configuration Options
// ─────────────────────────────────────────────────────────────
const WORK_TYPES: { id: ProjectType; label: string; icon: React.ElementType; desc: string; color: string }[] = [
  {
    id: 'speech',
    label: 'Speech / Taqreer',
    icon: Mic,
    desc: 'Formal oratorical address, Jalsa speech, or Friday sermon with Hamd-o-Sana and emotional cadence.',
    color: 'border-red-500/30 bg-red-500/10 text-red-400'
  },
  {
    id: 'dars',
    label: 'Dars-ul-Quran / Hadith',
    icon: GraduationCap,
    desc: 'Pedagogical study circle, verse recitation, linguistic nuances & moral reflections.',
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
  },
  {
    id: 'ijlas',
    label: 'Ijlas / Meeting Session',
    icon: Building,
    desc: 'General meeting or Tarbiyati session with agenda discussion, presidential remarks & concluding Dua.',
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-400'
  },
  {
    id: 'announcement',
    label: 'Announcement / I\'laan',
    icon: Megaphone,
    desc: 'High-impact official notice, financial appeal (Tehrik-e-Jadid), or urgent event mobilization call.',
    color: 'border-amber-500/30 bg-amber-500/10 text-amber-400'
  },
];

const AUDIENCE_OPTIONS = [
  { id: 'lajna',   label: 'Lajna',   fullName: "Lajna Ima'illah" },
  { id: 'khuddam', label: 'Khuddam', fullName: 'Majlis Khuddam-ul-Ahmadiyya' },
  { id: 'atfal',   label: 'Atfal',   fullName: 'Majlis Atfal-ul-Ahmadiyya' },
  { id: 'ansar',   label: 'Ansar',   fullName: 'Majlis Ansarullah' },
  { id: 'nasirat', label: 'Nasirat', fullName: 'Nasirat-ul-Ahmadiyya' },
  { id: 'all',     label: 'All',     fullName: 'General Community / Universal' },
];

const SPEECH_TONES = [
  { id: 'inspirational', label: 'Inspirational & Heartfelt', desc: 'Roohani, uplifting, faith-building, emotional connection' },
  { id: 'direct',        label: 'Direct & Admonishing',      desc: 'Firm Tarbiyat, adherence to Nizam, moral vigilance' },
  { id: 'scholarly',     label: 'Scholarly & Analytical',    desc: 'Textual proofs, academic tafseer, theological evidence' },
  { id: 'celebratory',   label: 'Celebratory & Commemorative', desc: 'Khilafat Day, Musleh Maud Day, Jalsa anniversary' },
  { id: 'urgent',        label: 'Urgent & Action-Oriented',  desc: 'Immediate appeal, deadlines, chanda, Waqar-e-Amal' },
  { id: 'pedagogical',   label: 'Gentle & Pedagogical',      desc: 'Compassionate, interactive, practical daily advice' },
];

const DURATION_PRESETS = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30];

export default function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  initialSelectedBookmarks = []
}: CreateProjectModalProps) {
  // Stepper: 1: Specifications Questionnaire, 2: Bookmarks Dossier
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [workType, setWorkType] = useState<ProjectType>('speech');
  const [topic, setTopic] = useState('');
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['khuddam']);
  const [language, setLanguage] = useState<'english' | 'urdu' | 'both'>('english');
  const [speechTone, setSpeechTone] = useState('inspirational');
  const [durationMinutes, setDurationMinutes] = useState(5);
  
  // Suggested Enhancement Fields
  const [occasion, setOccasion] = useState('');
  const [callToAction, setCallToAction] = useState('');
  
  // Prompt Preview & Editing
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // AI Toggle
  const [autoGenerateAI, setAutoGenerateAI] = useState(true);

  // Bookmarks Selection
  const [allBookmarks, setAllBookmarks] = useState<ResearchBookmarkItem[]>([]);
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(new Set());
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | BookmarkCategory>('all');

  // Load bookmarks on modal open
  useEffect(() => {
    if (isOpen) {
      const bks = getLocalResearchBookmarks();
      setAllBookmarks(bks);

      if (initialSelectedBookmarks.length > 0) {
        setSelectedBookmarkIds(new Set(initialSelectedBookmarks.map(b => b.id)));
      } else {
        setSelectedBookmarkIds(new Set());
      }
    }
  }, [isOpen, initialSelectedBookmarks]);

  // Handle Audience Selection (Multi-select or All)
  const toggleAudience = (id: string) => {
    if (id === 'all') {
      if (selectedAudiences.includes('all')) {
        setSelectedAudiences([]);
      } else {
        setSelectedAudiences(['all', 'lajna', 'khuddam', 'atfal', 'ansar', 'nasirat']);
      }
      return;
    }

    setSelectedAudiences(prev => {
      const withoutAll = prev.filter(x => x !== 'all');
      if (withoutAll.includes(id)) {
        return withoutAll.filter(x => x !== id);
      } else {
        const next = [...withoutAll, id];
        if (next.length === 5) return ['all', ...next];
        return next;
      }
    });
  };

  // Generate dynamic prompt brief from questionnaire
  const generatedPrompt = useMemo(() => {
    const audNames = selectedAudiences.includes('all')
      ? 'General Ahmadiyya Community (Universal: Lajna, Khuddam, Ansar, Atfal, Nasirat)'
      : selectedAudiences.map(id => AUDIENCE_OPTIONS.find(a => a.id === id)?.fullName || id).join(', ') || 'General Audience';

    const toneObj = SPEECH_TONES.find(t => t.id === speechTone);
    const toneDesc = toneObj ? `${toneObj.label} (${toneObj.desc})` : speechTone;

    const langDesc = language === 'both' ? 'Bilingual (Urdu & English blend with classical Arabic recitations)' : language === 'urdu' ? 'Urdu' : 'English with Arabic scriptural citations';

    const estWords = durationMinutes * 130;

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

  const filteredBookmarks = useMemo(() => {
    return allBookmarks.filter(b => {
      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      const matchesSearch = !bookmarkSearch.trim() ||
        b.title.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(bookmarkSearch.toLowerCase())) ||
        (b.snippet && b.snippet.toLowerCase().includes(bookmarkSearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allBookmarks, selectedCategory, bookmarkSearch]);

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
      bookmarks: chosenBookmarks,
    });

    onProjectCreated(newProj, autoGenerateAI);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[18px] glass bg-[#070b14]/95 border border-white/10 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)] shadow-lg shadow-[var(--accent-glow)]">
              <Feather size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)]">
                  Taleef Composition Protocol
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-white/5 border border-white/10 text-white/60">
                  Step {step} of 2
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white">
                {step === 1 ? 'New Theological Work Questionnaire' : 'Attach Researched Bookmarks'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl glass border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 ? (
            /* ──────── STEP 1: COMPREHENSIVE QUESTIONNAIRE ──────── */
            <div className="space-y-6">
              
              {/* 1. TYPE SELECTOR */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <Layers size={13} className="text-[var(--accent-main)]" />
                  <span>1. Type of Work</span>
                  <span className="text-[var(--accent-main)]">*</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {WORK_TYPES.map(wt => {
                    const Icon = wt.icon;
                    const isSelected = workType === wt.id;

                    return (
                      <button
                        key={wt.id}
                        type="button"
                        onClick={() => setWorkType(wt.id)}
                        className={clsx(
                          "p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-28 relative group",
                          isSelected
                            ? "bg-[var(--accent-soft)] border-[var(--accent-main)] shadow-md shadow-[var(--accent-glow)]"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className={clsx(
                            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                            isSelected ? "bg-[var(--accent-main)] text-white" : "bg-white/5 text-white/60 group-hover:text-white"
                          )}>
                            <Icon size={14} />
                          </div>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[var(--accent-main)] text-white flex items-center justify-center text-[9px]">
                              <Check size={10} />
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white leading-tight">{wt.label}</h4>
                          <p className="text-[10px] text-white/40 leading-snug line-clamp-2 mt-0.5">
                            {wt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. TOPIC (IN 150 CHARACTERS) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <Edit3 size={13} className="text-[var(--accent-main)]" />
                    <span>2. Topic / Central Theme (Max 150 letters)</span>
                    <span className="text-[var(--accent-main)]">*</span>
                  </label>
                  <span className={clsx(
                    "text-[10px] font-mono font-bold",
                    topic.length >= 140 ? "text-amber-400" : topic.length >= 150 ? "text-red-400" : "text-white/40"
                  )}>
                    {topic.length} / 150
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={150}
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder={
                    workType === 'speech' ? 'e.g., The Spirit of Selfless Devotion and Loyalty to Khilafat' :
                    workType === 'dars' ? 'e.g., Exposition of Surah Al-Baqarah Verses 153-157 on Patience' :
                    workType === 'ijlas' ? 'e.g., Annual Tarbiyat Deliberation on Daily Congregational Salat' :
                    'e.g., Mobilization Appeal for Tehrik-e-Jadid Pledges and Waqf-e-Arzi'
                  }
                  className="w-full px-4 py-3 rounded-[14px] bg-black/40 border border-white/10 focus:border-[var(--accent-main)] focus:outline-none text-white text-sm font-bold placeholder:text-white/20 transition-colors"
                  autoFocus
                />
              </div>

              {/* 3. AUDIENCE (MULTI-SELECT OR ALL) */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <Users size={13} className="text-[var(--accent-main)]" />
                  <span>3. Target Audience (Select one, multiple, or All)</span>
                  <span className="text-[var(--accent-main)]">*</span>
                </label>

                <div className="flex flex-wrap gap-2">
                  {AUDIENCE_OPTIONS.map(aud => {
                    const isSelected = selectedAudiences.includes(aud.id);
                    return (
                      <button
                        key={aud.id}
                        type="button"
                        onClick={() => toggleAudience(aud.id)}
                        className={clsx(
                          "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
                          isSelected
                            ? "bg-[var(--accent-soft)] text-white border-[var(--accent-main)] shadow-sm"
                            : "bg-white/[0.02] text-white/60 border-white/10 hover:border-white/20 hover:text-white"
                        )}
                      >
                        <div className={clsx(
                          "w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px]",
                          isSelected ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white" : "border-white/20"
                        )}>
                          {isSelected && <Check size={9} />}
                        </div>
                        <span>{aud.label}</span>
                        {aud.id !== 'all' && (
                          <span className="text-[10px] text-white/30 hidden sm:inline">
                            ({aud.fullName})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. LANGUAGE & 5. LENGTH ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* LANGUAGE */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <Languages size={13} className="text-[var(--accent-main)]" />
                    <span>4. Language</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'english', label: 'English' },
                      { id: 'urdu',    label: 'Urdu' },
                      { id: 'both',    label: 'Both (Bilingual)' },
                    ].map(l => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLanguage(l.id as any)}
                        className={clsx(
                          "py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center",
                          language === l.id
                            ? "bg-[var(--accent-soft)] text-white border-[var(--accent-main)] shadow-sm"
                            : "bg-white/[0.02] text-white/50 border-white/10 hover:border-white/20 hover:text-white"
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LENGTH (IN TIME: 1 MIN TO 30 MIN) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                      <Clock size={13} className="text-[var(--accent-main)]" />
                      <span>5. Length in Time</span>
                    </label>
                    <span className="text-xs font-mono font-black text-[var(--accent-main)]">
                      {durationMinutes} min (~{durationMinutes * 130} words)
                    </span>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full accent-[var(--accent-main)] cursor-pointer"
                  />

                  {/* Preset Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                    {DURATION_PRESETS.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDurationMinutes(m)}
                        className={clsx(
                          "px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 transition-colors border",
                          durationMinutes === m
                            ? "bg-[var(--accent-main)] text-white border-[var(--accent-main)]"
                            : "bg-white/5 text-white/50 border-white/5 hover:text-white"
                        )}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. SPEECH TYPE / FEEL CATEGORIES */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <Flame size={13} className="text-[var(--accent-main)]" />
                  <span>5. Delivery Feel / Tone</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {SPEECH_TONES.map(st => {
                    const isSelected = speechTone === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSpeechTone(st.id)}
                        className={clsx(
                          "p-2.5 rounded-xl border text-left transition-all",
                          isSelected
                            ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-white shadow-sm"
                            : "bg-white/[0.02] border-white/5 hover:border-white/15 text-white/60 hover:text-white"
                        )}
                      >
                        <div className="font-bold text-xs text-white leading-tight">{st.label}</div>
                        <div className="text-[10px] text-white/40 leading-snug mt-0.5">{st.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. SUGGESTED ITEMS: OCCASION & CALL TO ACTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <Building size={12} className="text-white/40" />
                    <span>Occasion / Setting (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={e => setOccasion(e.target.value)}
                    placeholder="e.g., Local Ijtema, Friday Gathering, Tahajjud Class, Family Halaqa"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[var(--accent-main)] placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <Target size={12} className="text-white/40" />
                    <span>Key Call-to-Action / Outcome (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={callToAction}
                    onChange={e => setCallToAction(e.target.value)}
                    placeholder="e.g., Daily Salat on time, Tahajjud pledge, Event attendance, Chanda clearance"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[var(--accent-main)] placeholder:text-white/20"
                  />
                </div>
              </div>

              {/* 7. LIVE GENERATED PROMPT BOX */}
              <div className="p-4 rounded-2xl glass bg-white/[0.02] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--accent-main)]" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-white">
                      Live Generated MurabbiAI Brief & Prompt
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingPrompt(prev => !prev)}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/70 hover:text-white border border-white/10 flex items-center gap-1 transition-colors"
                    >
                      <Edit3 size={10} />
                      <span>{isEditingPrompt ? 'Auto-Sync' : 'Customize'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={copyPromptToClipboard}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/70 hover:text-white border border-white/10 flex items-center gap-1 transition-colors"
                    >
                      {copiedPrompt ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {isEditingPrompt ? (
                  <textarea
                    rows={6}
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/60 border border-[var(--accent-main)]/50 text-white font-mono text-xs leading-relaxed focus:outline-none"
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-white/80 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {generatedPrompt}
                  </div>
                )}
                <p className="text-[10px] text-white/40 italic">
                  This prompt is auto-compiled from your selections above and will be dispatched to MurabbiAI upon submission.
                </p>
              </div>

            </div>
          ) : (
            /* ──────── STEP 2: BOOKMARK SELECTION ──────── */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30 text-xs font-mono font-black">
                    {selectedBookmarkIds.size} Selected
                  </span>
                  <span className="text-xs text-white/60">
                    of {allBookmarks.length} saved bookmarks in Research Library
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-[11px] font-bold flex items-center gap-1 border border-white/10 transition-colors"
                  >
                    <CheckSquare size={13} />
                    <span>Select All Filtered</span>
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllFiltered}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-[11px] font-bold flex items-center gap-1 border border-white/10 transition-colors"
                  >
                    <Square size={13} />
                    <span>Deselect All</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search Controls */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={bookmarkSearch}
                    onChange={e => setBookmarkSearch(e.target.value)}
                    placeholder="Search saved research by title, book, or keywords..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-[var(--accent-main)] focus:outline-none text-white text-xs placeholder:text-white/30"
                  />
                  {bookmarkSearch && (
                    <button
                      onClick={() => setBookmarkSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-[var(--accent-main)] focus:outline-none text-white text-xs"
                >
                  <option value="all" className="bg-[#0a0f1d]">All Sources ({allBookmarks.length})</option>
                  <option value="quran" className="bg-[#0a0f1d]">Holy Quran</option>
                  <option value="ahadith" className="bg-[#0a0f1d]">Hadith Narrations</option>
                  <option value="khazain" className="bg-[#0a0f1d]">Ruhani Khazain</option>
                  <option value="malfuzat" className="bg-[#0a0f1d]">Malfuzat</option>
                  <option value="tazkirah" className="bg-[#0a0f1d]">Tazkirah</option>
                  <option value="essence" className="bg-[#0a0f1d]">Essence of Islam</option>
                  <option value="articles" className="bg-[#0a0f1d]">Scholastic Articles</option>
                </select>
              </div>

              {/* Bookmarks List */}
              {allBookmarks.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-3">
                  <Bookmark size={36} className="mx-auto text-white/20" />
                  <h4 className="font-bold text-sm text-white">No Bookmarks Saved in Research Tab Yet</h4>
                  <p className="text-xs text-white/50 max-w-md mx-auto">
                    You can still initialize this work! MurabbiAI will synthesize authoritative scriptural citations automatically based on your prompt.
                  </p>
                </div>
              ) : filteredBookmarks.length === 0 ? (
                <div className="text-center py-10 text-white/40 text-xs">
                  No saved bookmarks match your search filters.
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                  {filteredBookmarks.map(b => {
                    const isSelected = selectedBookmarkIds.has(b.id);
                    const badge = getCategoryBadge(b.category);

                    return (
                      <div
                        key={b.id}
                        onClick={() => toggleSelectBookmark(b.id)}
                        className={clsx(
                          "p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none text-left",
                          isSelected
                            ? "bg-[var(--accent-soft)] border-[var(--accent-main)]/60 shadow-sm"
                            : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                        )}
                      >
                        <div className={clsx(
                          "w-5 h-5 rounded-md border mt-0.5 shrink-0 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white"
                            : "border-white/20 bg-black/20 text-transparent"
                        )}>
                          <Check size={12} />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={clsx("px-1.5 py-0.5 rounded text-[9px] font-bold border", badge.color)}>
                              {badge.label}
                            </span>
                            <span className="font-bold text-xs text-white truncate">
                              {b.title}
                            </span>
                            {b.subtitle && (
                              <span className="text-[10px] text-white/50 truncate">
                                • {b.subtitle}
                              </span>
                            )}
                          </div>

                          {b.snippet && (
                            <p className="text-[11px] text-white/70 line-clamp-2 italic leading-relaxed border-l-2 border-white/10 pl-2">
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
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 shrink-0 bg-white/[0.02]">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl glass border border-white/10 text-white/70 hover:text-white text-xs font-bold transition-colors"
            >
              Back to Questionnaire
            </button>
          ) : (
            <div className="text-[11px] text-white/40">
              {allBookmarks.length} research bookmarks ready to attach
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl glass border border-white/10 text-white/60 hover:text-white text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            {step === 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (!topic.trim()) return;
                  setStep(2);
                }}
                disabled={!topic.trim()}
                className="btn-ruby px-5 py-2 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent-glow)]"
              >
                <span>Next: Attach Citations</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                disabled={!topic.trim()}
                className="btn-ruby px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[var(--accent-glow)]"
              >
                <Sparkles size={14} />
                <span>Initialize & Generate Draft</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
