"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  Mic,
  GraduationCap,
  FileText,
  Bookmark,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Filter,
  RefreshCw,
  ArrowRight,
  FolderKanban
} from 'lucide-react';
import clsx from 'clsx';
import {
  MurabbiProject,
  ProjectType,
  ProjectStatus,
  getLocalProjects,
  syncProjectsFromDrive
} from '@/lib/projects-storage';
import {
  ResearchBookmarkItem,
  BookmarkCategory,
  getLocalResearchBookmarks,
  syncResearchFromDrive
} from '@/lib/research-storage';
import CreateProjectModal from './CreateProjectModal';
import ProjectWorkspaceModal from './ProjectWorkspaceModal';

export default function ProjectsManager() {
  const [projects, setProjects] = useState<MurabbiProject[]>([]);
  const [bookmarks, setBookmarks] = useState<ResearchBookmarkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | ProjectType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectStatus>('all');

  // Modals & Active Project
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [preSelectedBookmarks, setPreSelectedBookmarks] = useState<ResearchBookmarkItem[]>([]);
  const [activeProject, setActiveProject] = useState<MurabbiProject | null>(null);
  const [autoTriggerGenerateOnOpen, setAutoTriggerGenerateOnOpen] = useState(false);

  // Saved Bookmarks Sidebar Drawer
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState<'all' | BookmarkCategory>('all');
  const [drawerSearch, setDrawerSearch] = useState('');
  const [selectedInDrawer, setSelectedInDrawer] = useState<Set<string>>(new Set());

  // Cloud sync status
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize
  useEffect(() => {
    // 1. Load locally immediately
    const localProjs = getLocalProjects();
    const localBks = getLocalResearchBookmarks();
    setProjects(localProjs);
    setBookmarks(localBks);

    // 2. Sync from Drive in background
    setIsSyncing(true);
    Promise.all([
      syncProjectsFromDrive(),
      syncResearchFromDrive()
    ]).then(([syncedProjs, syncedResearch]) => {
      if (syncedProjs) setProjects(syncedProjs);
      if (syncedResearch?.bookmarks) setBookmarks(syncedResearch.bookmarks);
    }).catch(err => {
      console.warn('[ProjectsManager] Sync error:', err);
    }).finally(() => {
      setIsSyncing(false);
    });
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesType = filterType === 'all' || p.type === filterType;
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesSearch = !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.targetAudience && p.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [projects, filterType, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = projects.length;
    const speeches = projects.filter(p => p.type === 'speech').length;
    const dars = projects.filter(p => p.type === 'dars').length;
    const articles = projects.filter(p => p.type === 'article').length;
    const totalAttachedBookmarks = projects.reduce((acc, p) => acc + p.bookmarks.length, 0);
    return { total, speeches, dars, articles, totalAttachedBookmarks };
  }, [projects]);

  // Filtered Bookmarks in Drawer
  const filteredDrawerBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const matchesCat = drawerCategory === 'all' || b.category === drawerCategory;
      const matchesSearch = !drawerSearch.trim() ||
        b.title.toLowerCase().includes(drawerSearch.toLowerCase()) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(drawerSearch.toLowerCase())) ||
        (b.snippet && b.snippet.toLowerCase().includes(drawerSearch.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [bookmarks, drawerCategory, drawerSearch]);

  const handleOpenCreateWithSelected = () => {
    const chosen = bookmarks.filter(b => selectedInDrawer.has(b.id));
    setPreSelectedBookmarks(chosen);
    setIsCreateModalOpen(true);
  };

  const handleProjectCreated = (newProject: MurabbiProject, shouldGenerateAI: boolean) => {
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    setAutoTriggerGenerateOnOpen(shouldGenerateAI);
  };

  const handleProjectUpdated = (updated: MurabbiProject) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (activeProject && activeProject.id === updated.id) {
      setActiveProject(updated);
    }
  };

  const handleProjectDeleted = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject && activeProject.id === id) {
      setActiveProject(null);
    }
  };

  const getFormatDetails = (type: ProjectType) => {
    switch (type) {
      case 'speech':
        return {
          label: 'Speech / Taqreer',
          icon: Mic,
          badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
          accentColor: 'text-red-400',
        };
      case 'dars':
        return {
          label: 'Dars / Class',
          icon: GraduationCap,
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          accentColor: 'text-emerald-400',
        };
      case 'article':
        return {
          label: 'Theological Article',
          icon: FileText,
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          accentColor: 'text-blue-400',
        };
    }
  };

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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--background)] select-none">
      
      {/* ──────── PAGE HEADER ──────── */}
      <header className="px-6 sm:px-10 py-6 border-b border-white/5 shrink-0 bg-white/[0.01]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)]">
                Theological Composition Protocol
              </span>
              {isSyncing && (
                <span className="flex items-center gap-1 text-[9px] font-mono text-white/40">
                  <RefreshCw size={10} className="animate-spin" />
                  <span>Syncing Drive</span>
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-white">
              TALEEF
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl font-sans">
              Synthesize saved research bookmarks into structured speeches, study circles, and scholarly treatises with AI planning.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBookmarksDrawer(prev => !prev)}
              className={clsx(
                "px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all",
                showBookmarksDrawer
                  ? "bg-white/10 border-white/20 text-white"
                  : "glass border-white/10 text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <Bookmark size={15} className="text-[var(--accent-main)]" />
              <span>Research Bank</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/10 text-white/90">
                {bookmarks.length}
              </span>
            </button>

            <button
              onClick={() => {
                setPreSelectedBookmarks([]);
                setIsCreateModalOpen(true);
              }}
              className="btn-ruby px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[var(--accent-glow)] transition-all hover:scale-[1.02]"
            >
              <Plus size={16} />
              <span>New Work</span>
            </button>
          </div>
        </div>

        {/* ──────── METRICS SUMMARY ROW ──────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          <div className="p-3.5 rounded-xl glass bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-white/40">Total Projects</div>
            <div className="text-2xl font-black italic text-white font-mono">{stats.total}</div>
          </div>
          <div className="p-3.5 rounded-xl glass bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-red-400/80 flex items-center gap-1">
              <Mic size={11} />
              <span>Speeches</span>
            </div>
            <div className="text-2xl font-black italic text-red-400 font-mono">{stats.speeches}</div>
          </div>
          <div className="p-3.5 rounded-xl glass bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400/80 flex items-center gap-1">
              <GraduationCap size={11} />
              <span>Dars Classes</span>
            </div>
            <div className="text-2xl font-black italic text-emerald-400 font-mono">{stats.dars}</div>
          </div>
          <div className="p-3.5 rounded-xl glass bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-blue-400/80 flex items-center gap-1">
              <FileText size={11} />
              <span>Articles</span>
            </div>
            <div className="text-2xl font-black italic text-blue-400 font-mono">{stats.articles}</div>
          </div>
          <div className="p-3.5 rounded-xl glass bg-white/[0.02] border border-white/5 space-y-1 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]/80 flex items-center gap-1">
              <Bookmark size={11} />
              <span>Attached Sources</span>
            </div>
            <div className="text-2xl font-black italic text-[var(--accent-main)] font-mono">{stats.totalAttachedBookmarks}</div>
          </div>
        </div>
      </header>

      {/* ──────── FILTER & SEARCH CONTROLS ──────── */}
      <div className="px-6 sm:px-10 py-3.5 border-b border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.01]">
        {/* Format tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
              filterType === 'all'
                ? "bg-[var(--accent-soft)] text-white border border-[var(--accent-main)]/40 shadow-sm"
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            All Formats ({projects.length})
          </button>
          <button
            onClick={() => setFilterType('speech')}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
              filterType === 'speech'
                ? "bg-red-500/10 text-red-300 border border-red-500/30"
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <Mic size={12} />
            <span>Speeches</span>
          </button>
          <button
            onClick={() => setFilterType('dars')}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
              filterType === 'dars'
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <GraduationCap size={12} />
            <span>Dars</span>
          </button>
          <button
            onClick={() => setFilterType('article')}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
              filterType === 'article'
                ? "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <FileText size={12} />
            <span>Articles</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or topic..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 focus:border-[var(--accent-main)] focus:outline-none text-white text-xs placeholder:text-white/30"
          />
        </div>
      </div>

      {/* ──────── MAIN CONTENT AREA ──────── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Projects Grid */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10">
          {projects.length === 0 ? (
            /* Empty State: Guide & Quick-starters */
            <div className="max-w-3xl mx-auto py-12 text-center space-y-8 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30 flex items-center justify-center mx-auto shadow-2xl shadow-[var(--accent-glow)]">
                <FolderKanban size={32} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white">
                  No Taleef Works Initialized Yet
                </h2>
                <p className="text-sm text-white/60 max-w-lg mx-auto">
                  Taleef enables you to assemble your saved Quran, Hadith, and Ruhani Khazain research bookmarks into structured speeches, dars lessons, and scholarly articles with AI-crafted drafts.
                </p>
              </div>

              {/* Quick Starter Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4">
                <button
                  onClick={() => {
                    setPreSelectedBookmarks([]);
                    setIsCreateModalOpen(true);
                  }}
                  className="p-5 rounded-2xl glass bg-white/[0.02] border border-white/10 hover:border-red-500/40 hover:bg-red-500/[0.02] transition-all group space-y-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                    <Mic size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white group-hover:text-red-400 transition-colors">
                      Start a Speech / Taqreer
                    </h4>
                    <p className="text-[11px] text-white/50 mt-1 leading-snug">
                      Draft a Friday sermon or Jalsa speech with Hamd-o-Sana, rhetorical arcs, and time pacing.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-red-400 flex items-center gap-1 pt-1">
                    <span>Create Speech</span>
                    <ArrowRight size={12} />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setPreSelectedBookmarks([]);
                    setIsCreateModalOpen(true);
                  }}
                  className="p-5 rounded-2xl glass bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-all group space-y-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white group-hover:text-emerald-400 transition-colors">
                      Start a Dars Class
                    </h4>
                    <p className="text-[11px] text-white/50 mt-1 leading-snug">
                      Build an interactive study circle with verse recitation, linguistic nuances & discussion questions.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 pt-1">
                    <span>Create Dars</span>
                    <ArrowRight size={12} />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setPreSelectedBookmarks([]);
                    setIsCreateModalOpen(true);
                  }}
                  className="p-5 rounded-2xl glass bg-white/[0.02] border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all group space-y-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white group-hover:text-blue-400 transition-colors">
                      Write an Article
                    </h4>
                    <p className="text-[11px] text-white/50 mt-1 leading-snug">
                      Compose an academic theological paper with systematic proofs and academic citations.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1 pt-1">
                    <span>Create Article</span>
                    <ArrowRight size={12} />
                  </div>
                </button>
              </div>

              {bookmarks.length > 0 && (
                <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/30 text-xs text-white/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark size={15} className="text-[var(--accent-main)]" />
                    <span>You already have <strong>{bookmarks.length}</strong> bookmarks saved in the Research tab ready to attach!</span>
                  </div>
                  <button
                    onClick={() => setShowBookmarksDrawer(true)}
                    className="font-black text-[var(--accent-main)] hover:underline flex items-center gap-1"
                  >
                    <span>View Bookmarks Bank</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 text-white/40 text-xs">
              No projects match your active search or filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map(proj => {
                const format = getFormatDetails(proj.type);
                const FormatIcon = format.icon;
                const hasDraft = !!proj.aiDraft;

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setActiveProject(proj);
                      setAutoTriggerGenerateOnOpen(false);
                    }}
                    className="p-5 rounded-2xl glass bg-white/[0.015] border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer flex flex-col justify-between group space-y-4 hover:shadow-xl relative overflow-hidden"
                  >
                    {/* Top Card Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={clsx("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border flex items-center gap-1", format.badgeColor)}>
                          <FormatIcon size={10} />
                          <span>{format.label}</span>
                        </span>

                        <span className={clsx(
                          "px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase",
                          proj.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          proj.status === 'drafted' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          proj.status === 'in_progress' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-white/5 text-white/50 border border-white/10"
                        )}>
                          {proj.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="font-black text-base sm:text-lg text-white group-hover:text-[var(--accent-main)] transition-colors line-clamp-2 italic tracking-tight">
                        {proj.title}
                      </h3>

                      {proj.description && (
                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    {/* Card Middle: Attached Bookmarks preview */}
                    <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span className="flex items-center gap-1 font-mono">
                          <Bookmark size={11} className="text-[var(--accent-main)]" />
                          <span>{proj.bookmarks.length} Bookmarks Attached</span>
                        </span>
                        <span className="font-mono text-[10px]">
                          {formatRelativeTime(proj.updatedAt)}
                        </span>
                      </div>

                      {/* Pill tags of bookmark sources */}
                      {proj.bookmarks.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {proj.bookmarks.slice(0, 3).map(b => (
                            <span
                              key={b.id}
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-white/70 truncate max-w-[140px]"
                            >
                              {b.title}
                            </span>
                          ))}
                          {proj.bookmarks.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/40 font-mono">
                              +{proj.bookmarks.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-1.5">
                        {hasDraft ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                            <CheckCircle size={12} />
                            <span>Manuscript Ready</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400/80 font-bold">
                            <Sparkles size={12} />
                            <span>Needs AI Generation</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-white/50 group-hover:text-white font-bold text-xs transition-colors">
                        <span>Workspace</span>
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* ──────── SAVED RESEARCH BOOKMARKS LIBRARY DRAWER ──────── */}
        {showBookmarksDrawer && (
          <aside className="w-80 lg:w-96 border-l border-white/10 glass bg-[#070b14]/95 flex flex-col shrink-0 z-20 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Bookmark size={16} className="text-[var(--accent-main)]" />
                <h3 className="font-black italic text-sm text-white">
                  Research Bookmarks Bank ({bookmarks.length})
                </h3>
              </div>
              <button
                onClick={() => setShowBookmarksDrawer(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Drawer Filter Controls */}
            <div className="p-3 border-b border-white/5 space-y-2 bg-white/[0.01]">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={e => setDrawerSearch(e.target.value)}
                  placeholder="Filter saved citations..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>

              <select
                value={drawerCategory}
                onChange={e => setDrawerCategory(e.target.value as any)}
                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="all">All Saved Categories</option>
                <option value="quran">Holy Quran</option>
                <option value="ahadith">Ahadith</option>
                <option value="khazain">Ruhani Khazain</option>
                <option value="malfuzat">Malfuzat</option>
                <option value="tazkirah">Tazkirah</option>
                <option value="essence">Essence of Islam</option>
                <option value="articles">Articles</option>
              </select>
            </div>

            {/* Bookmarks List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredDrawerBookmarks.length === 0 ? (
                <div className="text-center py-16 text-white/40 text-xs">
                  No saved bookmarks found.
                </div>
              ) : (
                filteredDrawerBookmarks.map(b => {
                  const isSelected = selectedInDrawer.has(b.id);

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedInDrawer(prev => {
                          const n = new Set(prev);
                          if (n.has(b.id)) n.delete(b.id);
                          else n.add(b.id);
                          return n;
                        });
                      }}
                      className={clsx(
                        "p-2.5 rounded-xl border transition-all cursor-pointer space-y-1",
                        isSelected
                          ? "bg-[var(--accent-soft)] border-[var(--accent-main)]"
                          : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent-main)]">
                          {b.category}
                        </span>
                        <div className={clsx(
                          "w-3.5 h-3.5 rounded border flex items-center justify-center",
                          isSelected ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white" : "border-white/20"
                        )}>
                          {isSelected && <CheckCircle size={9} />}
                        </div>
                      </div>

                      <div className="font-bold text-xs text-white truncate">
                        {b.title}
                      </div>

                      {b.snippet && (
                        <p className="text-[10px] text-white/60 line-clamp-2 italic">
                          "{b.snippet}"
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02] space-y-2">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>{selectedInDrawer.size} selected</span>
                {selectedInDrawer.size > 0 && (
                  <button
                    onClick={() => setSelectedInDrawer(new Set())}
                    className="text-[10px] text-white/40 hover:text-white"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <button
                onClick={handleOpenCreateWithSelected}
                className="w-full btn-ruby py-2 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[var(--accent-glow)]"
              >
                <Plus size={13} />
                <span>
                  {selectedInDrawer.size > 0
                    ? `Start Project with (${selectedInDrawer.size}) Bookmarks`
                    : 'Start New Project'}
                </span>
              </button>
            </div>
          </aside>
        )}

      </div>

      {/* ──────── CREATE PROJECT MODAL ──────── */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
        initialSelectedBookmarks={preSelectedBookmarks}
      />

      {/* ──────── PROJECT WORKSPACE MODAL ──────── */}
      {activeProject && (
        <ProjectWorkspaceModal
          project={activeProject}
          isOpen={!!activeProject}
          onClose={() => setActiveProject(null)}
          onProjectUpdated={handleProjectUpdated}
          onProjectDeleted={handleProjectDeleted}
          autoTriggerGenerate={autoTriggerGenerateOnOpen}
        />
      )}

    </div>
  );
}
