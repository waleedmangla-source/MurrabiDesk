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
  Scroll,
  Volume2,
  Video,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Info
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

export default function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  initialSelectedBookmarks = []
}: CreateProjectModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('speech');
  const [targetAudience, setTargetAudience] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'english' | 'urdu' | 'arabic'>('english');
  const [autoGenerateAI, setAutoGenerateAI] = useState(true);

  // Bookmarks selection
  const [allBookmarks, setAllBookmarks] = useState<ResearchBookmarkItem[]>([]);
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(new Set());
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | BookmarkCategory>('all');

  // Load bookmarks on mount / open
  useEffect(() => {
    if (isOpen) {
      const bks = getLocalResearchBookmarks();
      setAllBookmarks(bks);

      // Pre-select if passed
      if (initialSelectedBookmarks.length > 0) {
        setSelectedBookmarkIds(new Set(initialSelectedBookmarks.map(b => b.id)));
      } else {
        // By default select all if there are a few, or let user pick
        setSelectedBookmarkIds(new Set());
      }
    }
  }, [isOpen, initialSelectedBookmarks]);

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
      case 'articles':
        return { label: 'Article', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      default:
        return { label: cat.toUpperCase(), color: 'bg-slate-500/10 text-slate-300 border-slate-500/20' };
    }
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    const chosenBookmarks = allBookmarks.filter(b => selectedBookmarkIds.has(b.id));

    const newProj = createNewProject({
      title: title.trim(),
      type: projectType,
      description: description.trim(),
      targetAudience: targetAudience.trim() || 'General Community',
      language,
      bookmarks: chosenBookmarks,
    });

    onProjectCreated(newProj, autoGenerateAI);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[16px] glass bg-[#0a0f1d]/95 border border-white/10 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)] shadow-lg shadow-[var(--accent-glow)]">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)]">
                  Project Creation Protocol
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/5 border border-white/10 text-white/60">
                  Step {step} of 2
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white">
                {step === 1 ? 'Configure Project Specifications' : 'Select Research Bookmarks Dossier'}
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
            /* ──────── STEP 1: SPECIFICATIONS ──────── */
            <div className="space-y-6">
              {/* Project Type Cards */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-white/70">
                  Select Project Format Type <span className="text-[var(--accent-main)]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* SPEECH */}
                  <button
                    type="button"
                    onClick={() => setProjectType('speech')}
                    className={clsx(
                      "p-4 rounded-xl border text-left transition-all duration-300 relative group flex flex-col justify-between h-36",
                      projectType === 'speech'
                        ? "bg-[var(--accent-soft)] border-[var(--accent-main)] shadow-lg shadow-[var(--accent-glow)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={clsx(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                        projectType === 'speech' ? "bg-[var(--accent-main)] text-white" : "bg-white/5 text-white/60 group-hover:text-white"
                      )}>
                        <Mic size={18} />
                      </div>
                      {projectType === 'speech' && (
                        <span className="w-5 h-5 rounded-full bg-[var(--accent-main)] text-white flex items-center justify-center text-[10px]">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">Speech / Taqreer</h4>
                      <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                        Oratorical structure with Hamd-o-Sana, emotional cadence, rhetorical crescendos & closing du'a.
                      </p>
                    </div>
                  </button>

                  {/* DARS */}
                  <button
                    type="button"
                    onClick={() => setProjectType('dars')}
                    className={clsx(
                      "p-4 rounded-xl border text-left transition-all duration-300 relative group flex flex-col justify-between h-36",
                      projectType === 'dars'
                        ? "bg-[var(--accent-soft)] border-[var(--accent-main)] shadow-lg shadow-[var(--accent-glow)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={clsx(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                        projectType === 'dars' ? "bg-[var(--accent-main)] text-white" : "bg-white/5 text-white/60 group-hover:text-white"
                      )}>
                        <GraduationCap size={18} />
                      </div>
                      {projectType === 'dars' && (
                        <span className="w-5 h-5 rounded-full bg-[var(--accent-main)] text-white flex items-center justify-center text-[10px]">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">Dars / Study Circle</h4>
                      <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                        Pedagogical exposition, verse breakdown, spiritual commentary & class discussion points.
                      </p>
                    </div>
                  </button>

                  {/* ARTICLE */}
                  <button
                    type="button"
                    onClick={() => setProjectType('article')}
                    className={clsx(
                      "p-4 rounded-xl border text-left transition-all duration-300 relative group flex flex-col justify-between h-36",
                      projectType === 'article'
                        ? "bg-[var(--accent-soft)] border-[var(--accent-main)] shadow-lg shadow-[var(--accent-glow)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={clsx(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                        projectType === 'article' ? "bg-[var(--accent-main)] text-white" : "bg-white/5 text-white/60 group-hover:text-white"
                      )}>
                        <FileText size={18} />
                      </div>
                      {projectType === 'article' && (
                        <span className="w-5 h-5 rounded-full bg-[var(--accent-main)] text-white flex items-center justify-center text-[10px]">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">Theological Article</h4>
                      <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                        Scholarly thesis, historical context, textual proofs, counter-arguments & academic citations.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-white/70">
                  Project Title / Theme <span className="text-[var(--accent-main)]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={
                    projectType === 'speech'
                      ? 'e.g., The Essence of True Brotherhood and Sacrifice'
                      : projectType === 'dars'
                      ? 'e.g., Dars on Surah Al-Kahf: The Spiritual Fortress'
                      : 'e.g., The Philosophical Necessity of Divine Revelation'
                  }
                  className="w-full px-4 py-3 rounded-[14px] bg-black/40 border border-white/10 focus:border-[var(--accent-main)] focus:outline-none text-white text-base font-bold placeholder:text-white/20 transition-colors"
                  autoFocus
                />
              </div>

              {/* Target Audience & Language Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70">
                    Target Audience / Setting
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value)}
                    placeholder="e.g., Khuddam Ijtema, Lajna Tarbiyat Class, General Public"
                    className="w-full px-4 py-2.5 rounded-[14px] bg-black/40 border border-white/10 focus:border-[var(--accent-main)] focus:outline-none text-white text-sm placeholder:text-white/20 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-white/70">
                    Language & Transliteration
                  </label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-[14px] bg-black/40 border border-white/10 focus:border-[var(--accent-main)] focus:outline-none text-white text-sm transition-colors"
                  >
                    <option value="english" className="bg-[#0a0f1d] text-white">English (with Arabic citations)</option>
                    <option value="urdu" className="bg-[#0a0f1d] text-white">Urdu / Roman Urdu</option>
                    <option value="arabic" className="bg-[#0a0f1d] text-white">Arabic & Academic English</option>
                  </select>
                </div>
              </div>

              {/* Topic Focus Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-white/70">
                  Focus Angle & Specific Instructions (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Specify key points you want highlighted, specific questions to address, or historical analogies to emphasize..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-[14px] bg-black/40 border border-white/10 focus:border-[var(--accent-main)] focus:outline-none text-white text-sm placeholder:text-white/20 resize-none transition-colors"
                />
              </div>

              {/* AI Generation Checkbox */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--accent-soft)] to-transparent border border-[var(--accent-main)]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-main)]/20 text-[var(--accent-main)] flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">Generate Mock Draft & Action Plan with MurabbiAI</h5>
                    <p className="text-[10px] text-white/60">
                      MurabbiAI will synthesize your selected bookmarks into a structured delivery roadmap and full draft.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoGenerateAI}
                  onChange={e => setAutoGenerateAI(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 accent-[var(--accent-main)] cursor-pointer"
                />
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
                    of {allBookmarks.length} saved bookmarks in Research Tab
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

                {/* Category selector */}
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
                    You can still create this project! MurabbiAI will synthesize authoritative scriptural citations automatically. To attach specific verses or quotes, visit the Research tab and click the Save icon on search results.
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
                        {/* Checkbox indicator */}
                        <div className={clsx(
                          "w-5 h-5 rounded-md border mt-0.5 shrink-0 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white"
                            : "border-white/20 bg-black/20 text-transparent"
                        )}>
                          <Check size={12} />
                        </div>

                        {/* Content */}
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

                          {b.citationText && (
                            <div className="text-[9px] font-mono text-white/40">
                              Ref: {b.citationText}
                            </div>
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
              Back to Configuration
            </button>
          ) : (
            <div className="text-[11px] text-white/40">
              {allBookmarks.length} bookmarks available in library
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
                  if (!title.trim()) return;
                  setStep(2);
                }}
                disabled={!title.trim()}
                className="btn-ruby px-5 py-2 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent-glow)]"
              >
                <span>Next: Select Bookmarks</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                disabled={!title.trim()}
                className="btn-ruby px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[var(--accent-glow)]"
              >
                <Sparkles size={14} />
                <span>Initialize Project</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
