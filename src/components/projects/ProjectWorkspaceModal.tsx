"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Mic,
  GraduationCap,
  FileText,
  Copy,
  Check,
  Edit3,
  Clock,
  BookOpen,
  Bookmark,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Save,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileDown,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';
import {
  MurabbiProject,
  ProjectType,
  ProjectStatus,
  ProjectAIPlan,
  updateProjectInStorage,
  deleteProjectFromStorage
} from '@/lib/projects-storage';
import {
  ResearchBookmarkItem,
  BookmarkCategory,
  getLocalResearchBookmarks
} from '@/lib/research-storage';

interface ProjectWorkspaceModalProps {
  project: MurabbiProject;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: (updated: MurabbiProject) => void;
  onProjectDeleted: (id: string) => void;
  autoTriggerGenerate?: boolean;
}

export default function ProjectWorkspaceModal({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
  onProjectDeleted,
  autoTriggerGenerate = false
}: ProjectWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<'draft' | 'plan' | 'bookmarks' | 'notes'>('draft');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftContent, setDraftContent] = useState(project.aiDraft || '');
  const [userNotes, setUserNotes] = useState(project.userNotes || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(project.title);
  const [status, setStatus] = useState<ProjectStatus>(project.status);

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bookmark Attachment Picker Modal
  const [isAddingBookmarks, setIsAddingBookmarks] = useState(false);
  const [availableBookmarks, setAvailableBookmarks] = useState<ResearchBookmarkItem[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());

  // Copy feedback
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  const [notesExportSuccess, setNotesExportSuccess] = useState(false);

  // Sync state with incoming project
  useEffect(() => {
    setDraftContent(project.aiDraft || '');
    setUserNotes(project.userNotes || '');
    setTitleText(project.title);
    setStatus(project.status);
    if (!project.aiDraft && !project.aiPlan) {
      setActiveTab('plan');
    }
  }, [project]);

  // Handle auto-trigger AI generation on open
  useEffect(() => {
    if (isOpen && autoTriggerGenerate && !project.aiDraft && !isGenerating) {
      handleGenerateAI();
    }
  }, [isOpen, autoTriggerGenerate]);

  // Load available bookmarks when opening attachment picker
  useEffect(() => {
    if (isAddingBookmarks) {
      const all = getLocalResearchBookmarks();
      const currentIds = new Set(project.bookmarks.map(b => b.id));
      const unattached = all.filter(b => !currentIds.has(b.id));
      setAvailableBookmarks(unattached);
      setSelectedToAdd(new Set());
    }
  }, [isAddingBookmarks, project.bookmarks]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationStep('Ingesting theological sources & bookmarks...');

    try {
      const timer1 = setTimeout(() => {
        setGenerationStep('Structuring strategic rhetorical outline...');
      }, 2000);

      const timer2 = setTimeout(() => {
        setGenerationStep('Synthesizing manuscript with Quranic & Hadith citations...');
      }, 5500);

      const res = await fetch('/api/ai/project-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          type: project.type,
          description: project.description,
          targetAudience: project.targetAudience,
          language: project.language,
          bookmarks: project.bookmarks,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Generation failed: ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate content');
      }

      const updated = updateProjectInStorage(project.id, {
        aiPlan: data.plan,
        aiDraft: data.mockDraft,
        status: 'drafted',
      });

      if (updated) {
        onProjectUpdated(updated);
        setDraftContent(data.mockDraft);
        setActiveTab('draft');
      }
    } catch (err: any) {
      console.error('[Project Workspace] AI Generation error:', err);
      setErrorMsg(err.message || 'Generation encountered an error');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleSaveDraft = () => {
    const updated = updateProjectInStorage(project.id, {
      aiDraft: draftContent,
    });
    if (updated) onProjectUpdated(updated);
    setIsEditingDraft(false);
  };

  const handleSaveNotes = () => {
    const updated = updateProjectInStorage(project.id, {
      userNotes,
    });
    if (updated) onProjectUpdated(updated);
  };

  const handleSaveTitle = () => {
    if (!titleText.trim()) return;
    const updated = updateProjectInStorage(project.id, {
      title: titleText.trim(),
    });
    if (updated) onProjectUpdated(updated);
    setIsEditingTitle(false);
  };

  const handleStatusChange = (newStatus: ProjectStatus) => {
    setStatus(newStatus);
    const updated = updateProjectInStorage(project.id, {
      status: newStatus,
    });
    if (updated) onProjectUpdated(updated);
  };

  const handleRemoveBookmark = (bookmarkId: string) => {
    const updatedBookmarks = project.bookmarks.filter(b => b.id !== bookmarkId);
    const updated = updateProjectInStorage(project.id, {
      bookmarks: updatedBookmarks,
    });
    if (updated) onProjectUpdated(updated);
  };

  const handleAttachBookmarks = () => {
    const toAdd = availableBookmarks.filter(b => selectedToAdd.has(b.id));
    const merged = [...project.bookmarks, ...toAdd];
    const updated = updateProjectInStorage(project.id, {
      bookmarks: merged,
    });
    if (updated) onProjectUpdated(updated);
    setIsAddingBookmarks(false);
  };

  const copyDraftToClipboard = () => {
    if (!draftContent) return;
    navigator.clipboard.writeText(draftContent);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const copyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitationId(id);
    setTimeout(() => setCopiedCitationId(null), 2000);
  };

  const exportToNotes = () => {
    try {
      const existingRaw = localStorage.getItem('murabbi_notes_v1');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const newNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: `[${project.type.toUpperCase()}] ${project.title}`,
        content: draftContent || project.description || '',
        color: project.type === 'speech' ? 'red' : project.type === 'dars' ? 'green' : 'blue',
        pinned: false,
        labels: ['Project', project.type],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('murabbi_notes_v1', JSON.stringify([newNote, ...existing]));
      setNotesExportSuccess(true);
      setTimeout(() => setNotesExportSuccess(false), 2500);
    } catch (e) {
      console.warn('Failed to export to notes', e);
    }
  };

  // Estimate word count and speech minutes
  const wordCount = (draftContent || '').trim() ? (draftContent || '').trim().split(/\s+/).length : 0;
  const estimatedMins = Math.ceil(wordCount / 130); // Average speaking pace ~130 wpm

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Main Workspace Modal */}
      <div className="relative w-full max-w-6xl h-[94vh] flex flex-col rounded-[18px] glass bg-[#070b14]/95 border border-white/10 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* ──────── TOP WORKSPACE HEADER ──────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02] gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Format Icon Badge */}
            <div className={clsx(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-lg",
              project.type === 'speech' && "bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/10",
              project.type === 'dars' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10",
              project.type === 'article' && "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-blue-500/10"
            )}>
              {project.type === 'speech' && <Mic size={20} />}
              {project.type === 'dars' && <GraduationCap size={20} />}
              {project.type === 'article' && <FileText size={20} />}
            </div>

            {/* Title & Metadata */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)]">
                  {project.type === 'speech' ? 'Speech Project' : project.type === 'dars' ? 'Dars Project' : 'Theological Article'}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-[10px] text-white/50 font-mono">
                  {project.bookmarks.length} Bookmarks Attached
                </span>
                {wordCount > 0 && (
                  <>
                    <span className="text-white/20">•</span>
                    <span className="text-[10px] text-white/50 font-mono">
                      {wordCount} words (~{estimatedMins} min)
                    </span>
                  </>
                )}
              </div>

              {isEditingTitle ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="text"
                    value={titleText}
                    onChange={e => setTitleText(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-black/50 border border-[var(--accent-main)] text-white text-base font-bold focus:outline-none"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1 rounded bg-[var(--accent-main)] text-white text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-lg sm:text-xl font-black italic tracking-tight text-white truncate cursor-pointer hover:text-[var(--accent-main)] transition-colors group flex items-center gap-2"
                  title="Click to edit title"
                >
                  <span>{project.title}</span>
                  <Edit3 size={13} className="opacity-0 group-hover:opacity-60 text-white" />
                </h2>
              )}
            </div>
          </div>

          {/* Action Controls & Status */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Selector */}
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-[11px] font-bold focus:outline-none focus:border-[var(--accent-main)]"
            >
              <option value="drafting" className="bg-[#0a0f1d]">Drafting</option>
              <option value="drafted" className="bg-[#0a0f1d]">Drafted</option>
              <option value="planned" className="bg-[#0a0f1d]">Planned</option>
              <option value="in_progress" className="bg-[#0a0f1d]">In Progress</option>
              <option value="completed" className="bg-[#0a0f1d]">Completed</option>
            </select>

            {/* Regenerate AI button */}
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="btn-ruby px-3.5 py-1.5 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)] disabled:opacity-50"
              title="Regenerate mock draft and approach plan with MurabbiAI"
            >
              <Sparkles size={13} className={clsx(isGenerating && "animate-spin")} />
              <span>{isGenerating ? 'Synthesizing...' : 'Regenerate'}</span>
            </button>

            {/* Export To Notes */}
            <button
              onClick={exportToNotes}
              className="p-2 rounded-xl glass border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all relative"
              title="Export Draft to Murabbi Notes"
            >
              {notesExportSuccess ? <Check size={16} className="text-emerald-400" /> : <FileDown size={16} />}
            </button>

            {/* Delete Project */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this project?')) {
                  deleteProjectFromStorage(project.id);
                  onProjectDeleted(project.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl glass border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete Project"
            >
              <Trash2 size={16} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl glass border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ──────── WORKSPACE NAVIGATION TABS ──────── */}
        <div className="flex items-center justify-between px-6 border-b border-white/10 shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('draft')}
              className={clsx(
                "px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2",
                activeTab === 'draft'
                  ? "border-[var(--accent-main)] text-white bg-white/[0.03]"
                  : "border-transparent text-white/40 hover:text-white/70"
              )}
            >
              <FileText size={14} />
              <span>Mock Draft Manuscript</span>
              {draftContent && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={clsx(
                "px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2",
                activeTab === 'plan'
                  ? "border-[var(--accent-main)] text-white bg-white/[0.03]"
                  : "border-transparent text-white/40 hover:text-white/70"
              )}
            >
              <Layers size={14} />
              <span>Strategic Plan & Approach</span>
              {project.aiPlan && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={clsx(
                "px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2",
                activeTab === 'bookmarks'
                  ? "border-[var(--accent-main)] text-white bg-white/[0.03]"
                  : "border-transparent text-white/40 hover:text-white/70"
              )}
            >
              <Bookmark size={14} />
              <span>Research Dossier</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-white/10 text-white/80">
                {project.bookmarks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={clsx(
                "px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2",
                activeTab === 'notes'
                  ? "border-[var(--accent-main)] text-white bg-white/[0.03]"
                  : "border-transparent text-white/40 hover:text-white/70"
              )}
            >
              <Edit3 size={14} />
              <span>Working Notes</span>
            </button>
          </div>

          {/* Quick Sub-Actions */}
          {activeTab === 'draft' && draftContent && (
            <div className="flex items-center gap-2 py-2">
              <button
                onClick={() => {
                  if (isEditingDraft) handleSaveDraft();
                  else setIsEditingDraft(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-bold flex items-center gap-1 border border-white/10 transition-colors"
              >
                {isEditingDraft ? <Save size={12} className="text-emerald-400" /> : <Edit3 size={12} />}
                <span>{isEditingDraft ? 'Save Edits' : 'Edit Draft'}</span>
              </button>

              <button
                onClick={copyDraftToClipboard}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[11px] font-bold flex items-center gap-1 border border-white/10 transition-colors"
              >
                {copiedDraft ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <button
              onClick={() => setIsAddingBookmarks(true)}
              className="px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--accent-hover)] text-[var(--accent-main)] hover:text-white text-[11px] font-bold flex items-center gap-1 border border-[var(--accent-main)]/30 transition-colors"
            >
              <Plus size={12} />
              <span>Attach More Bookmarks</span>
            </button>
          )}
        </div>

        {/* ──────── AI GENERATING PROGRESS OVERLAY ──────── */}
        {isGenerating && (
          <div className="p-6 bg-gradient-to-r from-[var(--accent-soft)] via-black/40 to-[var(--accent-soft)] border-b border-[var(--accent-main)]/30 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="text-[var(--accent-main)] animate-spin" />
              <div>
                <h4 className="font-black text-sm text-white">MurabbiAI Generation Protocol Active</h4>
                <p className="text-xs text-[var(--accent-main)] font-mono">{generationStep}</p>
              </div>
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              Model: gemini-3.6-flash
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="p-4 bg-red-900/30 border-b border-red-500/30 text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-white/60 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ──────── WORKSPACE TAB CONTENTS ──────── */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: MOCK DRAFT MANUSCRIPT */}
          {activeTab === 'draft' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {!draftContent && !isGenerating ? (
                /* Empty state CTA */
                <div className="text-center py-16 px-6 rounded-2xl glass border border-white/10 bg-white/[0.02] space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-main)] flex items-center justify-center mx-auto border border-[var(--accent-main)]/30 shadow-xl shadow-[var(--accent-glow)]">
                    <Sparkles size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black italic tracking-tight text-white">
                      Draft Manuscript Not Yet Initialized
                    </h3>
                    <p className="text-xs text-white/60 max-w-md mx-auto">
                      Click below to have MurabbiAI synthesize your attached research bookmarks into a comprehensive, publication-ready {project.type} manuscript.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="btn-ruby px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-[var(--accent-glow)]"
                  >
                    <Sparkles size={14} />
                    <span>Generate Manuscript with MurabbiAI</span>
                  </button>
                </div>
              ) : isEditingDraft ? (
                /* Editable text area */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>Editing manuscript markdown directly</span>
                    <span>{wordCount} words</span>
                  </div>
                  <textarea
                    value={draftContent}
                    onChange={e => setDraftContent(e.target.value)}
                    rows={26}
                    className="w-full p-5 rounded-2xl bg-black/60 border border-white/20 text-white font-mono text-sm leading-relaxed focus:outline-none focus:border-[var(--accent-main)] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingDraft(false)}
                      className="px-4 py-2 rounded-xl glass border border-white/10 text-white/60 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      className="btn-ruby px-5 py-2 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Save size={14} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Rendered Manuscript View */
                <div className="space-y-6">
                  {/* Manuscript stats card */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4 text-white/60">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[var(--accent-main)]" />
                        <span>~{estimatedMins} min delivery time</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText size={13} className="text-[var(--accent-main)]" />
                        <span>{wordCount} words</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bookmark size={13} className="text-[var(--accent-main)]" />
                        <span>{project.bookmarks.length} theological sources synthesized</span>
                      </div>
                    </div>

                    <button
                      onClick={copyDraftToClipboard}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors"
                    >
                      {copiedDraft ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedDraft ? 'Copied to Clipboard' : 'Copy Full Manuscript'}</span>
                    </button>
                  </div>

                  {/* Formatted Markdown Content */}
                  <div className="p-8 sm:p-10 rounded-2xl glass bg-white/[0.015] border border-white/10 shadow-xl space-y-6 text-white/90 leading-relaxed font-sans select-text">
                    {draftContent.split('\n\n').map((paragraph, pIdx) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return null;

                      // Level 1 Heading
                      if (trimmed.startsWith('# ')) {
                        return (
                          <h1 key={pIdx} className="text-2xl sm:text-3xl font-black italic tracking-tight text-white border-b border-white/10 pb-3 pt-2 text-[var(--accent-main)]">
                            {trimmed.replace('# ', '')}
                          </h1>
                        );
                      }

                      // Level 2 Heading
                      if (trimmed.startsWith('## ')) {
                        return (
                          <h2 key={pIdx} className="text-xl sm:text-2xl font-black italic tracking-tight text-white pt-4 text-white">
                            {trimmed.replace('## ', '')}
                          </h2>
                        );
                      }

                      // Level 3 Heading
                      if (trimmed.startsWith('### ')) {
                        return (
                          <h3 key={pIdx} className="text-base sm:text-lg font-bold text-[var(--accent-main)] pt-2 uppercase tracking-wider">
                            {trimmed.replace('### ', '')}
                          </h3>
                        );
                      }

                      // Blockquote / Arabic recitation
                      if (trimmed.startsWith('>')) {
                        const quoteContent = trimmed.replace(/^>\s*/gm, '');
                        return (
                          <div
                            key={pIdx}
                            className="my-4 p-4 rounded-xl bg-[var(--accent-soft)] border-l-4 border-[var(--accent-main)] text-white/95 italic leading-relaxed space-y-1"
                          >
                            <p className="font-serif text-sm sm:text-base">{quoteContent}</p>
                          </div>
                        );
                      }

                      // Bullet list
                      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        const items = trimmed.split('\n').map(line => line.replace(/^[-*]\s*/, ''));
                        return (
                          <ul key={pIdx} className="space-y-2 my-3 pl-4 list-disc list-outside text-white/80 text-sm">
                            {items.map((it, iIdx) => (
                              <li key={iIdx} className="leading-relaxed">
                                {it}
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      // Standard paragraph
                      return (
                        <p key={pIdx} className="text-sm sm:text-base leading-relaxed text-white/85">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STRATEGIC PLAN & APPROACH */}
          {activeTab === 'plan' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {!project.aiPlan ? (
                /* Empty Plan state */
                <div className="text-center py-16 px-6 rounded-2xl glass border border-white/10 bg-white/[0.02] space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-main)] flex items-center justify-center mx-auto border border-[var(--accent-main)]/30 shadow-xl shadow-[var(--accent-glow)]">
                    <Layers size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black italic tracking-tight text-white">
                      Strategic Action Plan Not Yet Generated
                    </h3>
                    <p className="text-xs text-white/60 max-w-md mx-auto">
                      Generate the AI roadmap to receive pedagogical instructions, delivery strategies, and phased timeline allocations.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="btn-ruby px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-[var(--accent-glow)]"
                  >
                    <Sparkles size={14} />
                    <span>Generate Strategic Plan</span>
                  </button>
                </div>
              ) : (
                /* Rendered Plan */
                <div className="space-y-6">
                  {/* Objective & Target Audience Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl glass bg-white/[0.02] border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)]">
                        <Lightbulb size={12} />
                        <span>Core Strategic Objective</span>
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {project.aiPlan.objective}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl glass bg-white/[0.02] border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)]">
                        <GraduationCap size={12} />
                        <span>Target Audience Adaptation</span>
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {project.aiPlan.targetAudience}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Strategy Card */}
                  {project.aiPlan.deliveryStrategy && (
                    <div className="p-6 rounded-2xl glass bg-gradient-to-r from-[var(--accent-soft)] to-transparent border border-[var(--accent-main)]/30 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)]">
                        <Mic size={14} />
                        <span>
                          {project.type === 'speech' ? 'Oratorical & Delivery Protocol' : project.type === 'dars' ? 'Classroom & Pedagogical Protocol' : 'Scholarly Writing & Academic Tone'}
                        </span>
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed font-sans">
                        {project.aiPlan.deliveryStrategy}
                      </p>
                    </div>
                  )}

                  {/* Key Themes Chips */}
                  {project.aiPlan.keyThemes && project.aiPlan.keyThemes.length > 0 && (
                    <div className="p-5 rounded-2xl glass bg-white/[0.02] border border-white/10 space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                        Theological Anchor Themes
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.aiPlan.keyThemes.map((thm, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-main)]" />
                            <span>{thm}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phased Timeline / Structure Breakdown */}
                  {project.aiPlan.structureBreakdown && project.aiPlan.structureBreakdown.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-white/60 px-1">
                        <span>Phased Delivery Breakdown</span>
                        <span>{project.aiPlan.structureBreakdown.length} Stages</span>
                      </div>

                      <div className="space-y-3">
                        {project.aiPlan.structureBreakdown.map((sec, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-5 rounded-2xl glass bg-white/[0.02] border border-white/10 space-y-3 hover:border-white/20 transition-all"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/30 text-xs font-mono font-black flex items-center justify-center">
                                  {sIdx + 1}
                                </span>
                                <h4 className="font-bold text-base text-white">
                                  {sec.title}
                                </h4>
                              </div>

                              {sec.durationOrWords && (
                                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-white/70">
                                  {sec.durationOrWords}
                                </span>
                              )}
                            </div>

                            {sec.summary && (
                              <p className="text-xs text-white/70 italic">
                                {sec.summary}
                              </p>
                            )}

                            {/* Talking points */}
                            {sec.talkingPoints && sec.talkingPoints.length > 0 && (
                              <div className="space-y-1.5 pl-2 border-l border-white/10">
                                {sec.talkingPoints.map((tp, tpIdx) => (
                                  <div key={tpIdx} className="text-xs text-white/80 flex items-start gap-2">
                                    <ChevronRight size={12} className="text-[var(--accent-main)] shrink-0 mt-0.5" />
                                    <span>{tp}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Referenced bookmarks */}
                            {sec.referencedBookmarks && sec.referencedBookmarks.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] text-white/50">
                                <span className="font-mono">Sources:</span>
                                {sec.referencedBookmarks.map((rb, rbIdx) => (
                                  <span key={rbIdx} className="px-2 py-0.5 rounded bg-white/5 text-[var(--accent-main)] font-mono font-bold border border-white/5">
                                    {rb}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips & Pitfalls Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pedagogical Tips */}
                    {project.aiPlan.pedagogicalTips && project.aiPlan.pedagogicalTips.length > 0 && (
                      <div className="p-5 rounded-2xl glass bg-white/[0.02] border border-white/10 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                          <CheckCircle size={13} />
                          <span>Key Recommendations</span>
                        </div>
                        <ul className="space-y-2 text-xs text-white/80">
                          {project.aiPlan.pedagogicalTips.map((tip, tipIdx) => (
                            <li key={tipIdx} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pitfalls to Avoid */}
                    {project.aiPlan.pitfallsToAvoid && project.aiPlan.pitfallsToAvoid.length > 0 && (
                      <div className="p-5 rounded-2xl glass bg-white/[0.02] border border-white/10 space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                          <AlertTriangle size={13} />
                          <span>Pitfalls & Traps to Avoid</span>
                        </div>
                        <ul className="space-y-2 text-xs text-white/80">
                          {project.aiPlan.pitfallsToAvoid.map((pf, pfIdx) => (
                            <li key={pfIdx} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{pf}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATTACHED RESEARCH DOSSIER */}
          {activeTab === 'bookmarks' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black italic tracking-tight text-white">
                    Attached Research Evidence ({project.bookmarks.length})
                  </h3>
                  <p className="text-xs text-white/50">
                    Citations and theological texts actively backing this project.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingBookmarks(true)}
                  className="btn-ruby px-3.5 py-1.5 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)]"
                >
                  <Plus size={13} />
                  <span>Attach More Bookmarks</span>
                </button>
              </div>

              {project.bookmarks.length === 0 ? (
                <div className="text-center py-16 px-6 rounded-2xl glass border border-white/10 bg-white/[0.02] space-y-3">
                  <Bookmark size={32} className="mx-auto text-white/20" />
                  <h4 className="font-bold text-sm text-white">No Research Bookmarks Attached</h4>
                  <p className="text-xs text-white/50 max-w-sm mx-auto">
                    You can attach saved verses, hadith narrations, or Ruhani Khazain excerpts from your research library at any time.
                  </p>
                  <button
                    onClick={() => setIsAddingBookmarks(true)}
                    className="px-4 py-2 rounded-xl glass border border-white/10 text-white text-xs font-bold hover:bg-white/5"
                  >
                    Select Bookmarks from Library
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {project.bookmarks.map(b => {
                    const badge = getCategoryBadge(b.category);

                    return (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl glass bg-white/[0.02] border border-white/10 space-y-3 hover:border-white/20 transition-all text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={clsx("px-2 py-0.5 rounded text-[9px] font-bold border", badge.color)}>
                              {badge.label}
                            </span>
                            <h4 className="font-bold text-sm text-white">
                              {b.title}
                            </h4>
                            {b.subtitle && (
                              <span className="text-xs text-white/50">
                                • {b.subtitle}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => copyCitation(b.citationText || b.title, b.id)}
                              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-bold flex items-center gap-1 border border-white/5 transition-colors"
                              title="Copy Citation"
                            >
                              {copiedCitationId === b.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                              <span>{copiedCitationId === b.id ? 'Copied' : 'Cite'}</span>
                            </button>

                            {b.url && (
                              <a
                                href={b.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                                title="Open Source URL"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}

                            <button
                              onClick={() => handleRemoveBookmark(b.id)}
                              className="p-1 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Remove bookmark from project"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {b.snippet && (
                          <p className="text-xs text-white/80 italic leading-relaxed border-l-2 border-[var(--accent-main)]/50 pl-3">
                            "{b.snippet}"
                          </p>
                        )}

                        {b.citationText && (
                          <div className="text-[10px] font-mono text-white/40">
                            Reference: {b.citationText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WORKING NOTES */}
          {activeTab === 'notes' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black italic tracking-tight text-white">
                    Personal Scratchpad & Working Notes
                  </h3>
                  <p className="text-xs text-white/50">
                    Private prep notes, stage cues, or speech reminders.
                  </p>
                </div>

                <button
                  onClick={handleSaveNotes}
                  className="btn-ruby px-4 py-1.5 rounded-xl text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>Save Notes</span>
                </button>
              </div>

              <textarea
                value={userNotes}
                onChange={e => setUserNotes(e.target.value)}
                placeholder="Write preparation notes, personal reflections, timing cues, or points to follow up on..."
                rows={18}
                className="w-full p-5 rounded-2xl bg-black/50 border border-white/10 text-white text-sm leading-relaxed focus:outline-none focus:border-[var(--accent-main)] resize-none"
              />
            </div>
          )}

        </div>

      </div>

      {/* ──────── SUB-MODAL: ATTACH MORE BOOKMARKS ──────── */}
      {isAddingBookmarks && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsAddingBookmarks(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl glass bg-[#0a0f1d] border border-white/20 shadow-2xl z-10 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-black italic text-lg text-white">
                  Attach Saved Research Bookmarks
                </h3>
                <p className="text-xs text-white/50">
                  Select items from your Research library to add to this project.
                </p>
              </div>
              <button
                onClick={() => setIsAddingBookmarks(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {availableBookmarks.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-xs">
                All saved bookmarks in your library are already attached to this project!
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px] pr-1">
                {availableBookmarks.map(b => {
                  const isSelected = selectedToAdd.has(b.id);
                  const badge = getCategoryBadge(b.category);

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedToAdd(prev => {
                          const n = new Set(prev);
                          if (n.has(b.id)) n.delete(b.id);
                          else n.add(b.id);
                          return n;
                        });
                      }}
                      className={clsx(
                        "p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                        isSelected
                          ? "bg-[var(--accent-soft)] border-[var(--accent-main)]"
                          : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className={clsx(
                        "w-4 h-4 rounded mt-0.5 flex items-center justify-center border",
                        isSelected
                          ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white"
                          : "border-white/20"
                      )}>
                        {isSelected && <Check size={10} />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={clsx("px-1.5 py-0.2 rounded text-[8px] font-bold border", badge.color)}>
                            {badge.label}
                          </span>
                          <span className="font-bold text-xs text-white truncate">
                            {b.title}
                          </span>
                        </div>
                        {b.snippet && (
                          <p className="text-[10px] text-white/60 line-clamp-1 italic">
                            "{b.snippet}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-white/50">
                {selectedToAdd.size} bookmarks selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingBookmarks(false)}
                  className="px-3 py-1.5 rounded-xl glass border border-white/10 text-white/60 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAttachBookmarks}
                  disabled={selectedToAdd.size === 0}
                  className="btn-ruby px-4 py-1.5 rounded-xl text-white text-xs font-black uppercase tracking-wider disabled:opacity-40"
                >
                  Attach to Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
