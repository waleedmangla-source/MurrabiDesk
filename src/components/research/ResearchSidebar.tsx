"use client";

import React, { useState } from 'react';
import {
  X,
  History,
  Bookmark,
  BookmarkCheck,
  Search,
  Trash2,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  Clock,
  ArrowRight,
  Filter,
  ShieldCheck,
  Scroll,
  FileText,
  Volume2,
  Video,
  BookMarked,
  Sparkles,
  Cloud,
  CloudOff,
  RefreshCw,
  ChevronLeft
} from 'lucide-react';
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
  isSyncing,
  isDriveConnected
}: ResearchSidebarProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'bookmarks'>('history');
  const [filterQuery, setFilterQuery] = useState('');
  const [bookmarkCategory, setBookmarkCategory] = useState<'all' | BookmarkCategory>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        return { label: 'Ahadith', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25', icon: Scroll };
      case 'khazain':
        return { label: 'Ruhani Khazain', color: 'bg-[var(--accent-soft)] text-[var(--accent-main)] border-[var(--accent-main)]/25', icon: ShieldCheck };
      case 'malfuzat':
        return { label: 'Malfuzat', color: 'bg-teal-500/15 text-teal-400 border-teal-500/25', icon: FileText };
      case 'tazkirah':
        return { label: 'Tadhkirah', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', icon: Sparkles };
      case 'essence':
        return { label: 'Essence of Islam', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25', icon: Bookmark };
      case 'books':
        return { label: 'Books', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25', icon: BookMarked };
      case 'articles':
        return { label: 'Articles', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25', icon: FileText };
      case 'audios':
        return { label: 'Audios', color: 'bg-pink-500/15 text-pink-400 border-pink-500/25', icon: Volume2 };
      case 'videos':
        return { label: 'Videos', color: 'bg-red-500/15 text-red-400 border-red-500/25', icon: Video };
      default:
        return { label: 'Research', color: 'bg-white/10 text-white/80 border-white/15', icon: Bookmark };
    }
  };

  // Reusable inner sidebar content styled exactly like the Mail tab
  const sidebarInner = (
    <div className="flex flex-col h-full w-full overflow-hidden select-none">
      {/* ── Sidebar Title (Matching Email Sidebar Header) ── */}
      <div className="px-5 pt-8 pb-2 flex items-center justify-between">
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
          Hub
        </h1>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-black/20 text-[var(--text-dim)] hover:text-white transition-all"
          title="Collapse Research Hub"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* ── Sync Status & Animated Tabs Header ── */}
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

        {/* Animated Sidebar Tabs (History vs Saved) */}
        <div className="relative flex bg-[var(--text-dim)]/5 rounded-xl p-1 mt-3 border border-white/5">
          {/* Animated Background Pill */}
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-[8px] transition-all duration-300 ease-out shadow-sm"
            style={{
              left: activeTab === 'history' ? '0.25rem' : 'calc(50%)',
              background: 'var(--accent-main)'
            }}
          />
          {[
            { id: 'history', label: `History (${history.length})` },
            { id: 'bookmarks', label: `Saved (${bookmarks.length})` }
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

      {/* ── Quick Search Filter Input ── */}
      <div className="px-4 py-2 border-b border-white/5">
        <div className="relative flex items-center">
          <Search size={12} className="absolute left-2.5 text-[var(--text-dim)]" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={activeTab === 'history' ? "Search history..." : "Search saved..."}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-6 py-1.5 text-xs text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none focus:border-[var(--accent-main)]"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2 p-0.5 text-[var(--text-dim)] hover:text-white"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* ── Category Sub-Filter Pills (Bookmarks tab only) ── */}
      {activeTab === 'bookmarks' && (
        <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px]">
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
      )}

      {/* ── Main Scrollable List ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-2 space-y-1.5">
        {activeTab === 'history' ? (
          /* ──────── HISTORY LIST ──────── */
          filteredHistory.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-dim)] space-y-2 px-4">
              <History size={28} className="mx-auto opacity-30" />
              <p className="text-xs font-semibold">
                {filterQuery ? "No matching searches" : "No previous searches"}
              </p>
              <p className="text-[10px] opacity-70">
                Searches are saved automatically and synced to Google Drive.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)] px-2 py-1">
                <span>Recent Searches</span>
                {history.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="hover:text-red-400 flex items-center gap-1 transition-colors"
                    title="Clear search history"
                  >
                    <Trash2 size={10} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {filteredHistory.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => onSelectHistory(entry)}
                  className="group p-2.5 rounded-xl bg-white/[0.02] hover:bg-black/20 hover:border-white/10 border border-white/5 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-white truncate group-hover:text-[var(--accent-main)] transition-colors">
                      "{entry.query}"
                    </span>
                    <span className="text-[9px] text-[var(--text-dim)] shrink-0 font-mono">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-[9px] text-[var(--text-dim)]">
                    {entry.searchMode === 'verbatim' && (
                      <span className="px-1 py-0.2 rounded bg-[var(--accent-soft)] text-[var(--accent-main)] font-bold">
                        Verbatim
                      </span>
                    )}
                    {entry.resultCounts && (
                      <span className="opacity-70">
                        {entry.resultCounts.all} results
                      </span>
                    )}
                    <ArrowRight size={10} className="ml-auto opacity-0 group-hover:opacity-100 text-[var(--accent-main)] transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ──────── BOOKMARKS LIST ──────── */
          filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-dim)] space-y-2 px-4">
              <BookmarkCheck size={28} className="mx-auto opacity-30" />
              <p className="text-xs font-semibold">
                {filterQuery || bookmarkCategory !== 'all' ? "No matching saved items" : "No saved records"}
              </p>
              <p className="text-[10px] opacity-70">
                Click the Save icon on any search result to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)] px-2 py-1">
                <span>{filteredBookmarks.length} Saved Records</span>
              </div>

              {filteredBookmarks.map(b => {
                const badge = getCategoryBadge(b.category);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={b.id}
                    className="group p-2.5 rounded-xl bg-white/[0.02] hover:bg-black/20 hover:border-white/10 border border-white/5 transition-all space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={clsx("px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1", badge.color)}>
                        <BadgeIcon size={9} />
                        <span>{badge.label}</span>
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemoveBookmark(b.id); }}
                        className="p-1 rounded text-[var(--text-dim)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    <div className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {b.title}
                    </div>
                    {b.subtitle && (
                      <div className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                        {b.subtitle}
                      </div>
                    )}
                    {b.snippet && (
                      <p className="text-[10px] text-[var(--text-dim)] line-clamp-2 italic leading-relaxed border-l border-white/10 pl-2">
                        "{b.snippet}"
                      </p>
                    )}

                    {/* Actions footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                      <div className="flex items-center gap-1">
                        {onOpenItemModal && (
                          <button
                            type="button"
                            onClick={() => onOpenItemModal(b)}
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[var(--foreground)] font-bold flex items-center gap-1 transition-colors"
                            title="Open Reader"
                          >
                            <BookOpen size={10} />
                            <span>Read</span>
                          </button>
                        )}
                        {b.url && (
                          <a
                            href={b.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-[var(--text-dim)] hover:text-white hover:bg-white/5 transition-colors"
                            title="Open Source URL"
                          >
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => copyCitation(b.citationText || b.title, b.id)}
                        className="px-1.5 py-0.5 rounded text-[var(--text-dim)] hover:text-white hover:bg-white/5 flex items-center gap-1 font-bold"
                        title="Copy Citation"
                      >
                        {copiedId === b.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                        <span>{copiedId === b.id ? "Copied" : "Cite"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Panel 1: Stationary Desktop Sidebar (Exactly like Mail tab) ── */}
      <aside
        className={clsx(
          "hidden lg:flex w-[260px] xl:w-[280px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20 select-none transition-all duration-300 ease-in-out relative z-20",
          isOpen
            ? "ml-0 opacity-100"
            : "-ml-[260px] xl:-ml-[280px] opacity-0 pointer-events-none w-0 overflow-hidden border-r-0"
        )}
      >
        {sidebarInner}
      </aside>

      {/* ── Mobile Overlay Drawer (Sliding in from the left on mobile/tablet) ── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-[280px] sm:w-[320px] h-full flex flex-col border-r border-white/10 glass bg-[#0a0f1d] z-10 shadow-2xl animate-in slide-in-from-left duration-300 select-none">
            {sidebarInner}
          </aside>
        </div>
      )}
    </>
  );
}
