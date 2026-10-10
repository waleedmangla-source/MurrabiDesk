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
  Feather,
  Menu,
  X
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
import TaleefSidebar, { TaleefFilter } from './TaleefSidebar';

export default function ProjectsManager() {
  const [projects, setProjects] = useState<MurabbiProject[]>([]);
  const [bookmarks, setBookmarks] = useState<ResearchBookmarkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaleefFilter>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals & Active Project
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [preSelectedBookmarks, setPreSelectedBookmarks] = useState<ResearchBookmarkItem[]>([]);
  const [activeProject, setActiveProject] = useState<MurabbiProject | null>(null);
  const [autoTriggerGenerateOnOpen, setAutoTriggerGenerateOnOpen] = useState(false);

  // Cloud sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  // Initialize
  useEffect(() => {
    // 1. Load locally immediately
    const localProjs = getLocalProjects();
    const localBks = getLocalResearchBookmarks();
    setProjects(localProjs);
    setBookmarks(localBks);

    const hasToken = typeof window !== 'undefined' &&
      !!localStorage.getItem("google_refresh_token_encrypted") &&
      localStorage.getItem("murabbi_guest_mode") !== "true";
    setIsDriveConnected(hasToken);

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

  // Filtered projects based on sidebar selection & search query
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      let matchesFilter = true;
      if (activeFilter === 'speech') matchesFilter = p.type === 'speech';
      else if (activeFilter === 'dars') matchesFilter = p.type === 'dars';
      else if (activeFilter === 'article') matchesFilter = p.type === 'article';
      else if (activeFilter === 'drafted') matchesFilter = p.status === 'drafted' || !!p.aiDraft;
      else if (activeFilter === 'completed') matchesFilter = p.status === 'completed';

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.targetAudience && p.targetAudience.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [projects, activeFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = projects.length;
    const speeches = projects.filter(p => p.type === 'speech').length;
    const dars = projects.filter(p => p.type === 'dars').length;
    const articles = projects.filter(p => p.type === 'article').length;
    const totalAttachedBookmarks = projects.reduce((acc, p) => acc + p.bookmarks.length, 0);
    return { total, speeches, dars, articles, totalAttachedBookmarks };
  }, [projects]);

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
    <div className="flex flex-col lg:flex-row h-screen h-dvh overflow-hidden bg-transparent select-none">
      
      {/* ── SECONDARY SIDEBAR: EXACTLY MATCHING MAIL TAB [240px] ── */}
      <TaleefSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        projects={projects}
        bookmarks={bookmarks}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        onNewWork={() => {
          setPreSelectedBookmarks([]);
          setIsCreateModalOpen(true);
        }}
        onStartWithBookmarks={(selected) => {
          setPreSelectedBookmarks(selected);
          setIsCreateModalOpen(true);
        }}
        isDriveConnected={isDriveConnected}
        isSyncing={isSyncing}
      />

      {/* ── MAIN WORKSPACE CONTENT PANE ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--background)]">
        
        {/* Top Header */}
        <header className="px-6 sm:px-8 py-5 border-b border-white/5 shrink-0 bg-white/[0.01]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Title & Mobile Sidebar Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl glass border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                title="Open Sidebar"
              >
                <Menu size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)]">
                    Theological Composition Protocol
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-[10px] font-mono text-white/40 capitalize">
                    {activeFilter === 'all' ? 'All Works' : activeFilter === 'drafted' ? 'Manuscripts' : activeFilter}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white">
                  {activeFilter === 'all' ? 'Taleef Library' :
                   activeFilter === 'speech' ? 'Speeches & Khutbat' :
                   activeFilter === 'dars' ? 'Dars Classes' :
                   activeFilter === 'article' ? 'Articles & Treatises' :
                   activeFilter === 'drafted' ? 'Manuscripts Ready' : 'Completed Works'}
                </h1>
              </div>
            </div>

            {/* Top Right: Search and New Work Action */}
            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search works..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 focus:border-[var(--accent-main)] focus:outline-none text-white text-xs placeholder:text-white/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* New Work Button */}
              <button
                onClick={() => {
                  setPreSelectedBookmarks([]);
                  setIsCreateModalOpen(true);
                }}
                className="btn-ruby px-4 py-2 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)] shrink-0 transition-all hover:scale-[1.02]"
              >
                <Plus size={14} />
                <span>New Work</span>
              </button>
            </div>
          </div>
        </header>

        {/* Works Grid Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {projects.length === 0 ? (
            /* Empty State: Guide & Quick-starters */
            <div className="max-w-3xl mx-auto py-12 text-center space-y-8 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30 flex items-center justify-center mx-auto shadow-2xl shadow-[var(--accent-glow)]">
                <Feather size={32} />
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
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 text-white/40 text-xs">
              No works match your active filter or search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
      </div>

      {/* ──────── CREATE WORK MODAL ──────── */}
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
