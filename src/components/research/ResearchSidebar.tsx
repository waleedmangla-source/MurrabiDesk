"use client";

import React, { useState } from 'react';
import {
  X,
  History,
  Bookmark,
  Search,
  Trash2,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  Plus,
  ShieldCheck,
  Scroll,
  FileText,
  Volume2,
  Video,
  BookMarked,
  Sparkles,
  Cloud,
  RefreshCw,
  Feather
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  SearchHistoryEntry,
  ResearchBookmarkItem,
  BookmarkCategory
} from '@/lib/research-storage';

interface ResearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: SearchHistoryEntry[];
  bookmarks: ResearchBookmarkItem[];
  onSelectHistory: (entry: SearchHistoryEntry) => void;
  onClearHistory: () => void;
  onRemoveBookmark: (id: string) => void;
  onOpenItemModal?: (bookmark: ResearchBookmarkItem) => void;
  onNewSearch?: () => void;
  currentQuery?: string;
  isSyncing?: boolean;
  isDriveConnected?: boolean;
}

export default function ResearchSidebar({
  isOpen,
  onClose,
  history,
  bookmarks,
  onSelectHistory,
  onClearHistory,
  onRemoveBookmark,
  onOpenItemModal,
  onNewSearch,
  currentQuery,
  isSyncing,
  isDriveConnected
}: ResearchSidebarProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'bookmarks'>('history');
  const [filterQuery, setFilterQuery] = useState('');
  const [bookmarkCategory, setBookmarkCategory] = useState<'all' | BookmarkCategory>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  const copyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = history.filter(h =>
    h.query.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredBookmarks = bookmarks.filter(b => {
    const matchesCategory = bookmarkCategory === 'all' || b.category === bookmarkCategory;
    const matchesSearch =
      b.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (b.snippet && b.snippet.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getCategoryBadge = (cat: BookmarkCategory) => {
    switch (cat) {
      case 'quran':
        return { label: "Holy Qur'an", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", icon: BookOpen };
      case 'ahadith':
        return { label: 'Hadith', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25', icon: Scroll };
      case 'khazain':
        return { label: 'Ruhani Khazain', color: 'bg-[var(--accent-soft)] text-[var(--accent-main)] border-[var(--accent-main)]/25', icon: ShieldCheck };
      case 'malfuzat':
        return { label: 'Malfuzat', color: 'bg-teal-500/15 text-teal-400 border-teal-500/25', icon: FileText };
      case 'tazkirah':
        return { label: 'Tadhkirah', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', icon: Sparkles };
      case 'essence':
        return { label: 'Essence', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25', icon: Bookmark };
      case 'books':
        return { label: 'Books', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25', icon: BookMarked };
      case 'articles':
        return { label: 'Articles', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25', icon: FileText };
      case 'audios':
        return { label: 'Audios', color: 'bg-pink-500/15 text-pink-400 border-pink-500/25', icon: Volume2 };
      case 'videos':
        return { label: 'Videos', color: 'bg-red-500/15 text-red-400 border-red-500/25', icon: Video };
      default:
        return { label: 'Record', color: 'bg-white/10 text-white/80 border-white/15', icon: Bookmark };
    }
  };

  // Reusable inner sidebar content styled exactly like the Mail tab
  const sidebarInner = (
    <div className="flex flex-col h-full w-full overflow-hidden select-none">
      {/* ── Sidebar Title (Matching Email Sidebar Header) ── */}
      <div className="px-5 pt-8 pb-2 flex items-center justify-between">
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
          Research
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
              {isSyncing && (
                <RefreshCw size={10} className="animate-spin text-emerald-400 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* ── Animated Sidebar Tabs ── */}
        <div className="relative flex bg-[var(--text-dim)]/5 rounded-xl p-1 mt-4 border border-white/5">
          {/* Animated Background Pill */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-[8px] transition-all duration-300 ease-out shadow-sm"
            style={{
              left: activeTab === 'history' ? '0.25rem' : 'calc(50%)',
              background: 'var(--accent-main)'
            }}
          />
          {[
            { id: 'history', label: 'History' },
            { id: 'bookmarks', label: 'Saved' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); setFilterQuery(''); }}
              className={clsx(
                "relative z-10 flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-colors duration-200 text-center",
                activeTab === t.id ? "text-white drop-shadow-md" : "text-[var(--text-dim)] hover:text-[var(--text-muted)]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {activeTab === 'history' ? (
          <div className="flex-1 flex flex-col">
            {/* Search Input for History */}
            <div className="px-4 pt-1 pb-2">
              <div className="flex items-center gap-2 glass bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
                <Search size={12} className="text-[var(--text-dim)] shrink-0" />
                <input
                  type="text"
                  placeholder="Filter searches..."
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

            {/* Folder-style Navigation matching Mail */}
            <nav className="py-2 space-y-px flex-1">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-dim)] space-y-2 px-4">
                  <History size={24} className="mx-auto opacity-30" />
                  <p className="text-xs font-bold">
                    {filterQuery ? "No matching searches" : "No searches yet"}
                  </p>
                  <p className="text-[10px] opacity-70">
                    Recent searches will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)] px-6 py-2">
                    <span>Recent Searches</span>
                    {history.length > 0 && (
                      <button
                        onClick={onClearHistory}
                        className="hover:text-red-400 flex items-center gap-1 transition-colors lowercase font-normal tracking-normal text-[10px]"
                        title="Clear search history"
                      >
                        <Trash2 size={10} />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                  {filteredHistory.map(entry => {
                    const active = currentQuery?.trim().toLowerCase() === entry.query.trim().toLowerCase();
                    return (
                      <button
                        key={entry.id}
                        onClick={() => {
                          onSelectHistory(entry);
                          if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
                        }}
                        className={clsx(
                          "w-full flex items-center gap-3 px-6 py-3 transition-all text-left border-l-2 group",
                          active
                            ? "font-black text-white border-[var(--accent-main)]"
                            : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--foreground)] border-transparent"
                        )}
                        style={active ? { background: 'rgba(0, 0, 0, 0.2)' } : {}}
                      >
                        <History
                          size={15}
                          className={clsx(
                            "shrink-0 transition-colors",
                            active ? "text-[var(--accent-main)]" : "text-[var(--text-dim)] group-hover:text-white"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold truncate block group-hover:text-white transition-colors">
                            {entry.query}
                          </span>
                          <span className="text-[9px] text-[var(--text-dim)] block">
                            {formatRelativeTime(entry.timestamp)}
                          </span>
                        </div>
                        {entry.resultCounts && (
                          <span
                            className={clsx(
                              "text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0",
                              active
                                ? "bg-white/20 text-white"
                                : "bg-[var(--accent-soft)] text-[var(--accent-main)]"
                            )}
                          >
                            {entry.resultCounts.all}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </nav>
          </div>
        ) : (
          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)]">
                Saved Records
              </span>
              <span className="text-[9px] font-bold text-[var(--text-dim)]">
                {filteredBookmarks.length}
              </span>
            </div>

            {/* Filter Input for Saved Items */}
            <div className="mb-2">
              <div className="flex items-center gap-2 glass bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
                <Search size={12} className="text-[var(--text-dim)] shrink-0" />
                <input
                  type="text"
                  placeholder="Filter saved..."
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
                { id: 'books', label: 'Books' },
                { id: 'articles', label: 'Articles' },
                { id: 'audios', label: 'Audios' },
                { id: 'videos', label: 'Videos' }
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

            {/* Bookmarks Header with Build Project Action */}
            <div className="flex items-center justify-between pb-1 px-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)]">
                {filteredBookmarks.length} Saved Records
              </span>
              <button
                type="button"
                onClick={() => router.push('/projects')}
                className="px-2 py-0.5 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--accent-hover)] text-[var(--accent-main)] hover:text-white text-[9px] font-bold border border-[var(--accent-main)]/30 flex items-center gap-1 transition-all"
                title="Open Taleef (Compositions & Manuscripts)"
              >
                <Feather size={10} />
                <span>Taleef</span>
              </button>
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
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={b.id}
                      className="flex flex-col gap-1.5 p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-black/10 hover:border-white/10 transition-all group"
                    >
                      {/* Top: Category Pill & Actions */}
                      <div className="flex items-center justify-between gap-1">
                        <span className={clsx("px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border flex items-center gap-1", badge.color)}>
                          <BadgeIcon size={8} />
                          <span>{badge.label}</span>
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => copyCitation(b.citationText || b.title, b.id)}
                            className="p-1 rounded-md text-[var(--text-dim)] hover:text-white hover:bg-white/5 transition-all"
                            title="Copy Citation"
                          >
                            {copiedId === b.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onRemoveBookmark(b.id); }}
                            className="p-1 rounded-md text-[var(--text-dim)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Remove bookmark"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Reference */}
                      <div
                        onClick={() => {
                          if (onOpenItemModal) {
                            onOpenItemModal(b);
                          } else if (b.url) {
                            window.open(b.url, '_blank');
                          }
                        }}
                        className="cursor-pointer group/title"
                      >
                        <div className="text-[10px] font-black tracking-tight text-[var(--foreground)] line-clamp-2 leading-tight group-hover/title:text-[var(--accent-main)] transition-colors">
                          {b.title}
                        </div>
                        {b.subtitle && (
                          <div className="text-[9px] text-[var(--text-dim)] truncate mt-0.5">
                            {b.subtitle}
                          </div>
                        )}
                        {b.snippet && (
                          <p className="text-[9px] text-[var(--text-dim)] line-clamp-2 italic border-l border-white/10 pl-1.5 mt-1 leading-relaxed">
                            "{b.snippet}"
                          </p>
                        )}
                      </div>

                      {/* Bottom action link if modal or external link */}
                      {(onOpenItemModal || b.url) && (
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-0.5">
                          {onOpenItemModal && (
                            <button
                              type="button"
                              onClick={() => onOpenItemModal(b)}
                              className="text-[9px] font-bold text-[var(--accent-main)] hover:underline flex items-center gap-1"
                            >
                              <BookOpen size={9} />
                              <span>Open Reader</span>
                            </button>
                          )}
                          {b.url && (
                            <a
                              href={b.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-[var(--text-dim)] hover:text-white flex items-center gap-0.5 ml-auto"
                            >
                              <span>Source</span>
                              <ExternalLink size={8} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── New Search (Matching Mail Compose Button) ── */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => {
            if (onNewSearch) onNewSearch();
            if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-md shadow-[var(--accent-glow)]"
          style={{ background: 'var(--accent-main)' }}
        >
          <Plus size={14} />
          New Search
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Panel 1: Folder Sidebar — Desktop only (Matching Mail Tab w-[240px]) ── */}
      <aside
        className={clsx(
          "hidden lg:flex w-[240px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20 select-none transition-all duration-300 ease-in-out relative z-20",
          isOpen
            ? "ml-0 opacity-100"
            : "-ml-[240px] opacity-0 pointer-events-none w-0 overflow-hidden border-r-0"
        )}
      >
        {sidebarInner}
      </aside>

      {/* ── Mobile Overlay Drawer ── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-[240px] sm:w-[260px] h-full flex flex-col border-r border-white/10 glass bg-[#0a0f1d] z-10 shadow-2xl animate-in slide-in-from-left duration-300 select-none">
            {sidebarInner}
          </aside>
        </div>
      )}
    </>
  );
}
