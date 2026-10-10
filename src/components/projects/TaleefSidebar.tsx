"use client";

import React, { useState, useMemo } from 'react';
import {
  Feather,
  Mic,
  GraduationCap,
  FileText,
  Bookmark,
  Sparkles,
  CheckCircle,
  Cloud,
  RefreshCw,
  X,
  Search,
  Plus,
  Copy,
  Check,
  ChevronRight,
  Layers,
  ArrowRight
} from 'lucide-react';
import clsx from 'clsx';
import { MurabbiProject, ProjectType } from '@/lib/projects-storage';
import { ResearchBookmarkItem, BookmarkCategory } from '@/lib/research-storage';

export type TaleefFilter = 'all' | 'speech' | 'dars' | 'article' | 'drafted' | 'completed';

interface TaleefSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: MurabbiProject[];
  bookmarks: ResearchBookmarkItem[];
  activeFilter: TaleefFilter;
  onSelectFilter: (filter: TaleefFilter) => void;
  onNewWork: () => void;
  onStartWithBookmarks?: (bookmarks: ResearchBookmarkItem[]) => void;
  isDriveConnected?: boolean;
  isSyncing?: boolean;
}

export default function TaleefSidebar({
  isOpen,
  onClose,
  projects,
  bookmarks,
  activeFilter,
  onSelectFilter,
  onNewWork,
  onStartWithBookmarks,
  isDriveConnected = false,
  isSyncing = false
}: TaleefSidebarProps) {
  const [sidebarTab, setSidebarTab] = useState<'works' | 'research'>('works');
  const [filterQuery, setFilterQuery] = useState('');
  const [bookmarkCategory, setBookmarkCategory] = useState<'all' | BookmarkCategory>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(new Set());

  const copyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics counts for sidebar categories
  const counts = useMemo(() => {
    const total = projects.length;
    const speech = projects.filter(p => p.type === 'speech').length;
    const dars = projects.filter(p => p.type === 'dars').length;
    const article = projects.filter(p => p.type === 'article').length;
    const drafted = projects.filter(p => p.status === 'drafted' || !!p.aiDraft).length;
    const completed = projects.filter(p => p.status === 'completed').length;
    return { total, speech, dars, article, drafted, completed };
  }, [projects]);

  // Folder categories matching the Mail tab FOLDERS layout
  const WORK_FOLDERS: { id: TaleefFilter; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'all',       label: 'All Works',    icon: Feather,        count: counts.total },
    { id: 'speech',    label: 'Speeches',     icon: Mic,            count: counts.speech },
    { id: 'dars',      label: 'Dars Classes', icon: GraduationCap,  count: counts.dars },
    { id: 'article',   label: 'Articles',     icon: FileText,       count: counts.article },
    { id: 'drafted',   label: 'Manuscripts',  icon: Sparkles,       count: counts.drafted },
    { id: 'completed', label: 'Completed',    icon: CheckCircle,    count: counts.completed },
  ];

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const matchesCat = bookmarkCategory === 'all' || b.category === bookmarkCategory;
      const q = filterQuery.toLowerCase();
      const matchesSearch = !q ||
        b.title.toLowerCase().includes(q) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
        (b.snippet && b.snippet.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [bookmarks, bookmarkCategory, filterQuery]);

  const toggleSelectBookmark = (id: string) => {
    setSelectedBookmarkIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getCategoryBadge = (cat: BookmarkCategory) => {
    switch (cat) {
      case 'quran':
        return { label: "Qur'an", color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' };
      case 'ahadith':
        return { label: 'Hadith', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' };
      case 'khazain':
        return { label: 'Khazain', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' };
      case 'malfuzat':
        return { label: 'Malfuzat', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' };
      case 'tazkirah':
        return { label: 'Tadhkirah', color: 'bg-rose-500/15 text-rose-400 border-rose-500/25' };
      case 'essence':
        return { label: 'Essence', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' };
      default:
        return { label: cat.toUpperCase(), color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' };
    }
  };

  // Inner reusable sidebar content
  const sidebarInner = (
    <div className="flex flex-col h-full w-full overflow-hidden select-none">
      
      {/* ── Sidebar Title (Matching Email Sidebar Header) ── */}
      <div className="px-5 pt-8 pb-2 flex items-center justify-between">
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
          Taleef
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-black/20 text-[var(--text-dim)] hover:text-white transition-all"
            title="Close Sidebar"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Account / Sync Header (Matching Mail Account Header) ── */}
      <div className="px-5 pt-1 pb-4 border-b border-white/5 mb-2">
        <div className="flex items-center gap-2 px-0 py-2 overflow-hidden opacity-80">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-tight text-[var(--text-dim)] truncate flex items-center gap-1.5">
                <Cloud size={11} className={isDriveConnected ? "text-emerald-400" : "text-[var(--text-dim)]"} />
                {isDriveConnected ? (isSyncing ? "Syncing..." : "Drive Synced") : "Local Storage"}
              </span>
              <span className="text-[9px] font-mono font-bold text-white/40">
                {counts.total} Works
              </span>
            </div>
          </div>
        </div>

        {/* ── Animated Sidebar Tabs (Matching Mail Tab Pills) ── */}
        <div className="relative flex bg-[var(--text-dim)]/5 rounded-xl p-1 mt-4 border border-white/5">
          {/* Animated Background Pill */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-[8px] transition-all duration-300 ease-out shadow-sm"
            style={{
              left: sidebarTab === 'works' ? '0.25rem' : 'calc(50%)',
              background: 'var(--accent-main)'
            }}
          />
          {[
            { id: 'works', label: 'Works' },
            { id: 'research', label: 'Research' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setSidebarTab(t.id as any); setFilterQuery(''); }}
              className={clsx(
                "relative z-10 flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-colors duration-200 text-center",
                sidebarTab === t.id ? "text-white drop-shadow-md" : "text-[var(--text-dim)] hover:text-[var(--text-muted)]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sidebar Tab Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {sidebarTab === 'works' ? (
          /* ──────── TAB 1: WORKS NAVIGATION ──────── */
          <div className="flex flex-col flex-1">
            {/* Quick Compose Action Button */}
            <div className="px-4 py-2">
              <button
                onClick={() => {
                  onNewWork();
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
                }}
                className="w-full btn-ruby py-2 rounded-xl text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[var(--accent-glow)] transition-all hover:scale-[1.01]"
              >
                <Plus size={13} />
                <span>New Work</span>
              </button>
            </div>

            {/* Folder-style Navigation matching Mail */}
            <nav className="py-2 space-y-px flex-1">
              {WORK_FOLDERS.map(f => {
                const Icon = f.icon;
                const active = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSelectFilter(f.id);
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-6 py-3 transition-all text-left border-l-2",
                      active
                        ? "font-black text-white border-[var(--accent-main)]"
                        : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--foreground)] border-transparent"
                    )}
                    style={active ? { background: 'rgba(0, 0, 0, 0.2)' } : {}}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="text-xs font-bold flex-1">{f.label}</span>
                    {f.count > 0 && (
                      <span className={clsx(
                        "text-[9px] font-black px-1.5 py-0.5 rounded-full font-mono",
                        active ? "bg-white/20 text-white" : "bg-[var(--accent-soft)] text-[var(--accent-main)]"
                      )}>
                        {f.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ) : (
          /* ──────── TAB 2: RESEARCH BOOKMARKS BANK ──────── */
          <div className="p-4 flex flex-col flex-1">
            {/* Search Input matching Mail sidebar search */}
            <div className="mb-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 focus-within:border-white/10 transition-all">
                <Search size={12} className="text-[var(--text-dim)] shrink-0" />
                <input
                  type="text"
                  placeholder="Filter saved research..."
                  value={filterQuery}
                  onChange={e => setFilterQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[11px] text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none min-w-0"
                />
                {filterQuery && (
                  <button onClick={() => setFilterQuery('')}>
                    <X size={11} className="text-[var(--text-dim)] hover:text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Badges */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 mb-2 text-[9px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'quran', label: "Qur'an" },
                { id: 'ahadith', label: 'Hadith' },
                { id: 'khazain', label: 'Khazain' },
                { id: 'malfuzat', label: 'Malfuzat' },
                { id: 'tazkirah', label: 'Tadhkirah' },
                { id: 'essence', label: 'Essence' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setBookmarkCategory(tab.id as any)}
                  className={clsx(
                    "px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors",
                    bookmarkCategory === tab.id
                      ? "bg-[var(--accent-main)] text-white shadow-sm"
                      : "bg-white/5 text-[var(--text-dim)] hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Header info bar */}
            <div className="flex items-center justify-between pb-2 px-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)]">
                {filteredBookmarks.length} Saved Records
              </span>
              {selectedBookmarkIds.size > 0 && onStartWithBookmarks && (
                <button
                  onClick={() => {
                    const chosen = bookmarks.filter(b => selectedBookmarkIds.has(b.id));
                    onStartWithBookmarks(chosen);
                    setSelectedBookmarkIds(new Set());
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
                  }}
                  className="px-2 py-0.5 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--accent-hover)] text-[var(--accent-main)] hover:text-white text-[9px] font-bold border border-[var(--accent-main)]/30 flex items-center gap-1 transition-all"
                >
                  <span>Build ({selectedBookmarkIds.size})</span>
                  <ArrowRight size={9} />
                </button>
              )}
            </div>

            {/* Bookmarks List styled like Mail contact cards */}
            <div className="flex flex-col gap-2 pb-4">
              {filteredBookmarks.length === 0 ? (
                <div className="text-[10px] font-bold text-[var(--text-muted)] italic text-center py-8">
                  {filterQuery || bookmarkCategory !== 'all' ? "No matching saved items" : "No saved records yet"}
                </div>
              ) : (
                filteredBookmarks.map(b => {
                  const badge = getCategoryBadge(b.category);
                  const isSelected = selectedBookmarkIds.has(b.id);

                  return (
                    <div
                      key={b.id}
                      onClick={() => toggleSelectBookmark(b.id)}
                      className={clsx(
                        "flex flex-col gap-1.5 p-2.5 rounded-2xl border transition-all cursor-pointer group",
                        isSelected
                          ? "bg-[var(--accent-soft)] border-[var(--accent-main)] shadow-sm"
                          : "bg-white/5 border-white/5 hover:bg-black/10 hover:border-white/10"
                      )}
                    >
                      {/* Top: Category Pill & Actions */}
                      <div className="flex items-center justify-between gap-1">
                        <span className={clsx("px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border", badge.color)}>
                          {badge.label}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); copyCitation(b.citationText || b.title, b.id); }}
                            className="p-1 rounded-md text-[var(--text-dim)] hover:text-white hover:bg-white/5 transition-all"
                            title="Copy Citation"
                          >
                            {copiedId === b.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>

                      {/* Title & Reference */}
                      <div>
                        <div className="text-[11px] font-black tracking-tight text-[var(--foreground)] line-clamp-2 leading-tight group-hover:text-[var(--accent-main)] transition-colors">
                          {b.title}
                        </div>
                        {b.subtitle && (
                          <div className="text-[9px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                            {b.subtitle}
                          </div>
                        )}
                      </div>

                      {/* Snippet preview */}
                      {b.snippet && (
                        <p className="text-[10px] text-[var(--text-dim)] line-clamp-2 italic leading-relaxed border-l border-white/10 pl-2">
                          "{b.snippet}"
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* ── Panel: Stationary Desktop Sidebar — Exactly matching Mail tab [240px] ── */}
      <aside className="hidden lg:flex w-[240px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20 select-none">
        {sidebarInner}
      </aside>

      {/* ── Mobile Overlay Drawer (Sliding in from left on mobile) ── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-[280px] sm:w-[300px] h-full flex flex-col border-r border-white/10 glass bg-[#0a0f1d] z-10 shadow-2xl animate-in slide-in-from-left duration-300 select-none">
            {sidebarInner}
          </aside>
        </div>
      )}
    </>
  );
}
