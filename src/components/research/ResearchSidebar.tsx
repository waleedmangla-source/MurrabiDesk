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
  RefreshCw
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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#0a0f1d] border-l border-white/10 shadow-2xl flex flex-col h-full z-10 text-[var(--foreground)]">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3 bg-black/20">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Research Hub</span>
            </h2>
            {/* Cloud Sync Status Indicator */}
            <div
              className={clsx(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                isDriveConnected
                  ? isSyncing
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-white/5 text-[var(--text-muted)] border-white/10"
              )}
              title={
                isDriveConnected
                  ? isSyncing
                    ? "Syncing with Google Drive..."
                    : "Synced with Google Drive (Murabbi Desk/Research)"
                  : "Local storage only (Connect Google Drive to backup cloud JSON files)"
              }
            >
              {isDriveConnected ? (
                isSyncing ? (
                  <RefreshCw size={10} className="animate-spin text-amber-400" />
                ) : (
                  <Cloud size={10} className="text-emerald-400" />
                )
              ) : (
                <CloudOff size={10} />
              )}
              <span>{isDriveConnected ? (isSyncing ? 'Syncing' : 'Drive Synced') : 'Local'}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
            title="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: History vs Bookmarks */}
        <div className="p-3 border-b border-white/5 bg-black/10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('history'); setFilterQuery(''); }}
            className={clsx(
              "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border",
              activeTab === 'history'
                ? "bg-[var(--accent-main)] text-white border-[var(--accent-main)] shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-[var(--text-muted)] border-white/5"
            )}
          >
            <History size={14} />
            <span>History</span>
            <span className={clsx(
              "px-1.5 py-0.2 rounded-full text-[10px] font-black",
              activeTab === 'history' ? "bg-black/25 text-white" : "bg-white/10 text-[var(--text-muted)]"
            )}>
              {history.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('bookmarks'); setFilterQuery(''); }}
            className={clsx(
              "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border",
              activeTab === 'bookmarks'
                ? "bg-[var(--accent-main)] text-white border-[var(--accent-main)] shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-[var(--text-muted)] border-white/5"
            )}
          >
            <BookmarkCheck size={14} />
            <span>Bookmarks</span>
            <span className={clsx(
              "px-1.5 py-0.2 rounded-full text-[10px] font-black",
              activeTab === 'bookmarks' ? "bg-black/25 text-white" : "bg-white/10 text-[var(--text-muted)]"
            )}>
              {bookmarks.length}
            </span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="p-3 border-b border-white/5">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-[var(--text-muted)]" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={activeTab === 'history' ? "Filter search history..." : "Search saved bookmarks..."}
              className="w-full pl-8 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)]"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-2.5 p-1 text-[var(--text-muted)] hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (Bookmarks tab only) */}
        {activeTab === 'bookmarks' && (
          <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar select-none text-[11px]">
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
                  "px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-colors",
                  bookmarkCategory === tab.id
                    ? "bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30"
                    : "bg-white/5 text-[var(--text-muted)] hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {activeTab === 'history' ? (
            /* ──────── HISTORY LIST ──────── */
            filteredHistory.length === 0 ? (
              <div className="text-center py-16 text-[var(--text-muted)] space-y-2">
                <History size={32} className="mx-auto opacity-30" />
                <p className="text-xs font-semibold">
                  {filterQuery ? "No matching queries in history" : "No previous searches yet"}
                </p>
                <p className="text-[11px] opacity-70">
                  Searches you perform will be saved here and synced to Google Drive.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] px-1">
                  <span>{filteredHistory.length} Previous Searches</span>
                  {history.length > 0 && (
                    <button
                      onClick={onClearHistory}
                      className="hover:text-red-400 flex items-center gap-1 transition-colors"
                      title="Clear all search history"
                    >
                      <Trash2 size={11} />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {filteredHistory.map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => {
                      onSelectHistory(entry);
                      onClose();
                    }}
                    className="group p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-[var(--accent-main)]/40 transition-all cursor-pointer space-y-2 select-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-sm text-white truncate group-hover:text-[var(--accent-main)] transition-colors">
                          "{entry.query}"
                        </span>
                        {entry.searchMode === 'verbatim' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/20 shrink-0">
                            Verbatim
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0 flex items-center gap-1 font-mono">
                        <Clock size={10} />
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>

                    {/* Result Counts Breakdown */}
                    {entry.resultCounts && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-[var(--text-muted)]">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/90 font-bold">
                          {entry.resultCounts.all} records
                        </span>
                        {entry.resultCounts.quran > 0 && (
                          <span className="text-emerald-400">HQ: {entry.resultCounts.quran}</span>
                        )}
                        {entry.resultCounts.ahadith > 0 && (
                          <span className="text-amber-400">Hadith: {entry.resultCounts.ahadith}</span>
                        )}
                        {entry.resultCounts.literature > 0 && (
                          <span className="text-purple-400">Lit: {entry.resultCounts.literature}</span>
                        )}
                        {entry.resultCounts.articles > 0 && (
                          <span className="text-blue-400">Articles: {entry.resultCounts.articles}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ──────── BOOKMARKS LIST ──────── */
            filteredBookmarks.length === 0 ? (
              <div className="text-center py-16 text-[var(--text-muted)] space-y-2">
                <BookmarkCheck size={32} className="mx-auto opacity-30" />
                <p className="text-xs font-semibold">
                  {filterQuery || bookmarkCategory !== 'all' ? "No matching bookmarks" : "No saved bookmarks yet"}
                </p>
                <p className="text-[11px] opacity-70 max-w-xs mx-auto">
                  Click the Bookmark icon on any search result to save it for research. It will sync automatically to Google Drive.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] px-1">
                  <span>{filteredBookmarks.length} Saved Records</span>
                </div>

                {filteredBookmarks.map(b => {
                  const badge = getCategoryBadge(b.category);
                  const Icon = badge.icon;
                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all space-y-2"
                    >
                      {/* Badge & Category Header */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1", badge.color)}>
                          <Icon size={11} />
                          <span>{badge.label}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {formatRelativeTime(b.savedAt)}
                          </span>
                          <button
                            onClick={() => onRemoveBookmark(b.id)}
                            className="p-1 text-[var(--text-muted)] hover:text-red-400 transition-colors ml-1"
                            title="Remove bookmark"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                        {b.title}
                      </h4>

                      {/* Subtitle / Reference */}
                      {b.subtitle && (
                        <p className="text-[11px] font-medium text-emerald-400/90 truncate">
                          {b.subtitle}
                        </p>
                      )}

                      {/* Excerpt Snippet */}
                      {b.snippet && (
                        <p className="text-[11px] text-[var(--foreground)]/70 italic line-clamp-3 leading-relaxed border-l border-white/10 pl-2">
                          "{b.snippet}"
                        </p>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {onOpenItemModal && (
                            <button
                              type="button"
                              onClick={() => {
                                onOpenItemModal(b);
                                onClose();
                              }}
                              className="px-2 py-1 rounded-md bg-[var(--accent-soft)] hover:bg-[var(--accent-main)] hover:text-white text-[var(--accent-main)] font-bold transition-all flex items-center gap-1 active:scale-95 text-[10px]"
                            >
                              <BookOpen size={11} />
                              <span>Open</span>
                            </button>
                          )}

                          {b.url && (
                            <a
                              href={b.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                              title="Open original external URL"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => copyCitation(b.citationText || b.title, b.id)}
                          className="px-2 py-1 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-white/5 flex items-center gap-1 font-bold text-[10px]"
                          title="Copy Citation"
                        >
                          {copiedId === b.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
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
    </div>
  );
}
