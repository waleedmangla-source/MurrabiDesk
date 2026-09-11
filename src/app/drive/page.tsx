"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Folder,
  File,
  HardDrive,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  ChevronRight,
  ChevronLeft,
  Search,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  X,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import clsx from "clsx";
import { GoogleSyncService } from "@/lib/google-sync-service";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  size?: string;
  modifiedTime?: string;
}

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
type FilterType = 'all' | 'folders' | 'documents' | 'spreadsheets' | 'media' | 'archives';

// ─────────────────────────────────────────────────────────────
// Helpers (harmonized with Mail tab)
// ─────────────────────────────────────────────────────────────
function relativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (hrs < 48) return 'Yesterday';
  if (hrs < 168) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatBytes(bytes?: number | string, decimals = 1): string {
  if (!bytes) return '';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num <= 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function useHasGoogleToken(): boolean {
  const [hasToken, setHasToken] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('murabbi_guest_mode') === 'true') {
      setHasToken(false);
      return;
    }
    const token = localStorage.getItem('google_refresh_token_encrypted');
    setHasToken(Boolean(token));
  }, []);
  return hasToken;
}

function getFileIcon(mimeType: string) {
  if (mimeType === 'application/vnd.google-apps.folder') return <Folder size={15} className="text-blue-400" />;
  if (mimeType.includes('image/')) return <ImageIcon size={15} className="text-emerald-400" />;
  if (mimeType.includes('video/')) return <Video size={15} className="text-red-400" />;
  if (mimeType.includes('audio/')) return <Music size={15} className="text-purple-400" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('sheet') || mimeType.includes('csv')) {
    return <FileSpreadsheet size={15} className="text-emerald-500" />;
  }
  if (mimeType.includes('pdf') || mimeType.includes('text/') || mimeType.includes('document')) {
    return <FileText size={15} className="text-orange-400" />;
  }
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar') || mimeType.includes('archive')) {
    return <Archive size={15} className="text-yellow-400" />;
  }
  return <File size={15} className="text-white/60" />;
}

// ─────────────────────────────────────────────────────────────
// Drive Page Component
// ─────────────────────────────────────────────────────────────
export default function DrivePage() {
  const isConnected = useHasGoogleToken();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [rootFolderId, setRootFolderId] = useState<string>('');
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'Murabbi Desk' }
  ]);
  const [query, setQuery] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'folders' | 'filters'>('folders');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [discoveredSubfolders, setDiscoveredSubfolders] = useState<{ id: string; name: string }[]>([]);

  // Fetch user profile email
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cached = localStorage.getItem('cached_user_profile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.email) setUserEmail(parsed.email);
      } catch {}
    }
    GoogleSyncService.getUserProfile().then(p => {
      if (p?.email) setUserEmail(p.email);
    });

    const cachedRoot = localStorage.getItem('murabbi_drive_root_id');
    if (cachedRoot) {
      setRootFolderId(cachedRoot);
      setFolderStack(prev => {
        if (prev.length > 0 && prev[0].id === 'root') {
          const next = [...prev];
          next[0] = { id: cachedRoot, name: 'Murabbi Desk' };
          return next;
        }
        return prev;
      });
    }
  }, []);

  const currentFolder = folderStack[folderStack.length - 1];

  const fetchFiles = useCallback(async (folderId: string) => {
    if (typeof window === 'undefined') return;
    const tokenHeader = localStorage.getItem('google_refresh_token_encrypted');
    if (!tokenHeader || localStorage.getItem('murabbi_guest_mode') === 'true') {
      setSyncStatus('offline');
      return;
    }
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/brain/drive-explore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-murabbi-token': tokenHeader
        },
        body: JSON.stringify({ folderId })
      });
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
        setSyncStatus('synced');

        if (data.rootFolderId) {
          setRootFolderId(data.rootFolderId);
          localStorage.setItem('murabbi_drive_root_id', data.rootFolderId);
          setFolderStack(prev => {
            if (prev.length > 0 && (prev[0].id === 'root' || prev[0].id === data.rootFolderId)) {
              const next = [...prev];
              next[0] = { id: data.rootFolderId, name: 'Murabbi Desk' };
              return next;
            }
            return prev;
          });
        }

        // Cache subfolders discovered in root
        if (!folderId || folderId === 'root' || (data.rootFolderId && folderId === data.rootFolderId)) {
          const folders = data.files
            .filter((f: DriveFile) => f.mimeType === 'application/vnd.google-apps.folder')
            .map((f: DriveFile) => ({ id: f.id, name: f.name }));
          setDiscoveredSubfolders(folders);
        }
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchFiles(currentFolder.id);
    } else {
      setSyncStatus('offline');
    }
  }, [isConnected, currentFolder.id, fetchFiles]);

  const handleCopyEmail = () => {
    if (userEmail) {
      navigator.clipboard.writeText(userEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileClick = (file: DriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      setFolderStack(prev => [...prev, { id: file.id, name: file.name }]);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const handleNavigateUp = () => {
    if (folderStack.length > 1) {
      setFolderStack(prev => prev.slice(0, -1));
      setSelectedFile(null);
    }
  };

  const handleNavigateToPath = (index: number) => {
    setFolderStack(prev => prev.slice(0, index + 1));
    setSelectedFile(null);
  };

  // Filter logic
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      // 1. Search Query
      if (query && !f.name.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }

      // 2. Category Filter
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'folders') return f.mimeType === 'application/vnd.google-apps.folder';
      if (selectedFilter === 'documents') {
        return f.mimeType.includes('pdf') || f.mimeType.includes('document') || f.mimeType.includes('text');
      }
      if (selectedFilter === 'spreadsheets') {
        return f.mimeType.includes('spreadsheet') || f.mimeType.includes('sheet') || f.mimeType.includes('csv');
      }
      if (selectedFilter === 'media') {
        return f.mimeType.includes('image/') || f.mimeType.includes('video/') || f.mimeType.includes('audio/');
      }
      if (selectedFilter === 'archives') {
        return f.mimeType.includes('zip') || f.mimeType.includes('tar') || f.mimeType.includes('rar');
      }
      return true;
    });
  }, [files, query, selectedFilter]);

  const currentFolderDriveLink = currentFolder.id && currentFolder.id !== 'root'
    ? `https://drive.google.com/drive/folders/${currentFolder.id}`
    : (rootFolderId ? `https://drive.google.com/drive/folders/${rootFolderId}` : null);

  const isRootActive = folderStack.length === 1 && selectedFilter === 'all';

  const SyncIcon = syncStatus === 'syncing' ? Loader2
    : syncStatus === 'synced' ? CheckCircle
    : syncStatus === 'error' ? AlertCircle
    : RefreshCw;
  const syncColor = syncStatus === 'synced' ? 'text-emerald-400'
    : syncStatus === 'error' ? 'text-red-400'
    : syncStatus === 'offline' ? 'text-white/20'
    : 'text-white/30';

  const FILTER_OPTIONS: { id: FilterType; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Items', icon: HardDrive },
    { id: 'folders', label: 'Folders Only', icon: Folder },
    { id: 'documents', label: 'Documents & PDFs', icon: FileText },
    { id: 'spreadsheets', label: 'Sheets & Data', icon: FileSpreadsheet },
    { id: 'media', label: 'Media & Images', icon: ImageIcon },
    { id: 'archives', label: 'Archives & Zip', icon: Archive },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-dvh lg:h-screen lg:overflow-hidden bg-transparent">
      {/* ── Panel 1: Folder Sidebar — Desktop only (Following Mail tab structure) ── */}
      <div className="hidden lg:flex w-[240px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20">
        {/* Sidebar Title */}
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Drive</h1>
        </div>

        {/* Account Header */}
        <div className="px-5 pt-1 pb-4 border-b border-white/5 mb-2">
          <div className="flex items-center gap-2 px-0 py-2 overflow-hidden opacity-80">
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold tracking-tight text-[var(--text-dim)] truncate">
                  {userEmail || 'Murabbi Desk Drive'}
                </span>
                {userEmail && (
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 rounded-md hover:bg-black/20 text-[var(--text-dim)] hover:text-white transition-all shrink-0"
                    title="Copy email address"
                  >
                    {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Animated Sidebar Tabs */}
          <div className="relative flex bg-[var(--text-dim)]/5 rounded-xl p-1 mt-4 border border-white/5">
            {/* Animated Background Pill */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-[8px] transition-all duration-300 ease-out shadow-sm"
              style={{
                left: sidebarTab === 'folders' ? '0.25rem' : 'calc(50%)',
                background: 'var(--accent-main)'
              }}
            />
            {[
              { id: 'folders', label: 'Folders' },
              { id: 'filters', label: 'Filter' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSidebarTab(t.id as any)}
                className={clsx(
                  "relative z-10 flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-colors duration-200",
                  sidebarTab === t.id ? "text-white drop-shadow-md" : "text-[var(--text-dim)] hover:text-[var(--text-muted)]"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {sidebarTab === 'folders' ? (
            <nav className="py-2 space-y-px">
              {/* Root Murabbi Desk item */}
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setFolderStack([{ id: rootFolderId || 'root', name: 'Murabbi Desk' }]);
                  setSelectedFile(null);
                }}
                className={clsx(
                  "w-full flex items-center gap-3 px-6 py-3 transition-all text-left border-l-2",
                  isRootActive
                    ? "font-black text-white border-[var(--accent-main)]"
                    : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--foreground)] border-transparent"
                )}
                style={isRootActive ? { background: 'rgba(0, 0, 0, 0.2)' } : {}}
              >
                <HardDrive size={15} className="shrink-0 text-[var(--accent-main)]" />
                <span className="text-xs font-bold flex-1 truncate">Murabbi Desk</span>
                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
                  Root
                </span>
              </button>

              {/* Subfolders header */}
              {discoveredSubfolders.length > 0 && (
                <div className="pt-4 pb-1 px-6 text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)]">
                  Subdirectories
                </div>
              )}

              {/* Subfolders */}
              {discoveredSubfolders.map(sub => {
                const isSubActive = currentFolder.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedFilter('all');
                      setFolderStack([
                        { id: rootFolderId || 'root', name: 'Murabbi Desk' },
                        { id: sub.id, name: sub.name }
                      ]);
                      setSelectedFile(null);
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-6 py-2.5 transition-all text-left border-l-2",
                      isSubActive
                        ? "font-black text-white border-[var(--accent-main)]"
                        : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--foreground)] border-transparent"
                    )}
                    style={isSubActive ? { background: 'rgba(0, 0, 0, 0.2)' } : {}}
                  >
                    <Folder size={14} className="shrink-0 text-blue-400" />
                    <span className="text-xs font-bold flex-1 truncate">{sub.name}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            /* Filters Tab */
            <nav className="py-2 space-y-px">
              <div className="pt-2 pb-2 px-6 text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)]">
                Filter by Type
              </div>
              {FILTER_OPTIONS.map(f => {
                const active = selectedFilter === f.id;
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedFilter(f.id);
                      setSelectedFile(null);
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-6 py-2.5 transition-all text-left border-l-2",
                      active
                        ? "font-black text-white border-[var(--accent-main)]"
                        : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--foreground)] border-transparent"
                    )}
                    style={active ? { background: 'rgba(0, 0, 0, 0.2)' } : {}}
                  >
                    <Icon size={14} className="shrink-0 text-[var(--accent-main)]" />
                    <span className="text-xs font-bold flex-1">{f.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Bottom Action Button (Open in Drive) */}
        <div className="p-4 border-t border-white/5">
          {currentFolderDriveLink ? (
            <a
              href={currentFolderDriveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-md hover:brightness-110"
              style={{ background: 'var(--accent-main)' }}
            >
              <ExternalLink size={14} />
              Open in Drive
            </a>
          ) : (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white/40 bg-white/5"
            >
              <HardDrive size={14} />
              Murabbi Desk
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile Folder Strip — shown only on mobile/tablet (Harmonized with Mail) ── */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-b border-white/5 glass bg-black/10 shrink-0 no-scrollbar">
        <button
          onClick={() => {
            setFolderStack([{ id: rootFolderId || 'root', name: 'Murabbi Desk' }]);
            setSelectedFile(null);
          }}
          className={clsx(
            "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
            isRootActive ? "text-white" : "text-[var(--text-muted)] border border-white/10"
          )}
          style={isRootActive ? { background: 'var(--accent-main)' } : {}}
        >
          <HardDrive size={11} />
          Murabbi Desk
        </button>
        {discoveredSubfolders.map(sub => {
          const active = currentFolder.id === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setFolderStack([
                  { id: rootFolderId || 'root', name: 'Murabbi Desk' },
                  { id: sub.id, name: sub.name }
                ]);
                setSelectedFile(null);
              }}
              className={clsx(
                "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                active ? "text-white" : "text-[var(--text-muted)] border border-white/10"
              )}
              style={active ? { background: 'var(--accent-main)' } : {}}
            >
              <Folder size={11} />
              {sub.name}
            </button>
          );
        })}
      </div>

      {/* ── Panel 2: File List (Harmonized with Mail Panel 2) ── */}
      <div className={clsx(
        "flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-transparent overflow-hidden",
        selectedFile
          ? "hidden lg:flex lg:w-[340px] xl:w-[380px] lg:shrink-0 lg:h-full"
          : "flex w-full lg:w-[340px] xl:w-[380px] lg:flex-none lg:shrink-0 lg:h-full"
      )}>
        {/* List Header */}
        <div className="shrink-0 px-4 lg:px-5 pt-4 lg:pt-8 pb-4 border-b border-white/5">
          <h1 className="text-2xl lg:text-4xl font-black tracking-tighter text-white uppercase mb-3 truncate leading-none">
            {currentFolder.name}
          </h1>
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0 pr-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] truncate opacity-60">
                {userEmail || 'Murabbi Desk'}
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                {filteredFiles.length} {filteredFiles.length === 1 ? 'item' : 'items'}
                {selectedFilter !== 'all' && ` • ${selectedFilter}`}
              </p>
            </div>
            <button
              onClick={() => fetchFiles(currentFolder.id)}
              className="p-2 rounded-xl hover:bg-black/10 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)]"
              title="Refresh"
            >
              <SyncIcon size={15} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 glass bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Search size={13} className="text-[var(--text-dim)] shrink-0" />
            <input
              type="text"
              placeholder="Search in folder..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X size={12} className="text-[var(--text-dim)] hover:text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb Path Strip (when navigated into subfolders) */}
        {folderStack.length > 1 && (
          <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
            <button
              onClick={handleNavigateUp}
              className="flex items-center gap-1 hover:text-white transition-colors mr-1"
              title="Go up one level"
            >
              <ChevronLeft size={12} />
              <span>Up</span>
            </button>
            <span className="opacity-30">|</span>
            {folderStack.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && <ChevronRight size={10} className="shrink-0 opacity-40" />}
                <button
                  onClick={() => handleNavigateToPath(index)}
                  className={clsx(
                    "hover:text-white transition-colors whitespace-nowrap px-1",
                    index === folderStack.length - 1 ? "text-[var(--accent-main)] font-black" : "opacity-70"
                  )}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* File List Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {syncStatus === 'syncing' && files.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-dim)] p-8">
              <Loader2 size={24} className="animate-spin text-[var(--accent-main)]" />
              <p className="text-[10px] font-black uppercase tracking-widest">Loading files...</p>
            </div>
          )}

          {!isConnected && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
                <HardDrive size={24} style={{ color: 'var(--accent-main)' }} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-dim)]">
                Sign in with Google to view files
              </p>
            </div>
          )}

          {isConnected && filteredFiles.length === 0 && syncStatus !== 'syncing' && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
              <HardDrive size={32} className="text-[var(--text-dim)] opacity-30" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-dim)]">
                  {query ? 'No matching files found' : folderStack.length === 1 ? 'Murabbi Desk is empty' : 'Folder is empty'}
                </p>
                {!query && (
                  <p className="text-[10px] text-white/30 font-medium max-w-xs mx-auto mt-1">
                    Files created or uploaded to Murabbi Desk appear here.
                  </p>
                )}
              </div>
            </div>
          )}

          {filteredFiles.map(file => {
            const isSelected = selectedFile?.id === file.id;
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

            return (
              <button
                key={file.id}
                onClick={() => handleFileClick(file)}
                className={clsx(
                  "w-full flex items-start gap-3 px-4 py-3 border-b border-white/5 text-left transition-all group",
                  isSelected
                    ? "bg-black/40 border-l-2 border-l-[var(--accent-main)]"
                    : "hover:bg-black/10 border-l-2 border-l-transparent"
                )}
                style={isSelected ? { background: 'rgba(0, 0, 0, 0.4)' } : {}}
              >
                <div className="shrink-0 mt-0.5 relative">
                  {file.thumbnailLink ? (
                    <div className="w-8 h-8 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                      <img src={file.thumbnailLink} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={clsx(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isFolder ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-white/60"
                    )}>
                      {getFileIcon(file.mimeType)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={clsx(
                      "text-xs truncate transition-colors",
                      isSelected ? "font-black text-[var(--accent-main)]" : "font-bold text-white/90 group-hover:text-white"
                    )}>
                      {file.name}
                    </p>
                    {file.modifiedTime && (
                      <span className="text-[9px] text-[var(--text-dim)] shrink-0 font-bold">
                        {relativeTime(file.modifiedTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-[var(--text-dim)]">
                    {isFolder ? (
                      <span className="uppercase tracking-wider font-bold text-blue-400/80">Folder</span>
                    ) : (
                      <>
                        {file.size && <span>{formatBytes(file.size)}</span>}
                        {file.size && <span>•</span>}
                        <span className="truncate">{file.mimeType.split('.').pop() || file.mimeType.split('/').pop()}</span>
                      </>
                    )}
                  </div>
                </div>

                {isFolder && (
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 shrink-0 self-center transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Panel 3: File Viewer Main Area (Harmonized with Mail Panel 3) ── */}
      <div className={clsx(
        "flex-1 flex flex-col h-full bg-black/10 relative overflow-hidden",
        !selectedFile ? "hidden lg:flex" : "flex"
      )}>
        {selectedFile ? (
          <div className="flex flex-col h-full w-full">
            <div className="shrink-0 p-4 border-b border-white/5 glass flex justify-between items-center z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-all mr-1"
                  title="Back to file list"
                >
                  <ArrowLeft size={16} />
                </button>
                {getFileIcon(selectedFile.mimeType)}
                <h2 className="text-sm font-bold text-white truncate pr-4">{selectedFile.name}</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedFile.webViewLink && (
                  <a
                    href={selectedFile.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-white"
                  >
                    <ExternalLink size={14} />
                    Open in Drive
                  </a>
                )}
              </div>
            </div>

            <div className="flex-1 relative bg-black/40">
              {/* Google Drive Preview iframe */}
              <iframe
                src={`https://drive.google.com/file/d/${selectedFile.id}/preview`}
                className="w-full h-full border-0 absolute inset-0"
                allow="autoplay"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 animate-in fade-in zoom-in-95 duration-500 p-8">
            <div className="w-20 h-20 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-main)]/20 flex items-center justify-center">
              <HardDrive size={32} className="text-[var(--accent-main)]" />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-tight text-white/80 uppercase">
                Murabbi Desk Drive
              </h2>
              <p className="text-xs text-white/40 mt-2 max-w-sm font-medium">
                Select a file from the sidebar to preview its contents, or navigate through your Murabbi Desk folders.
              </p>
            </div>
            {currentFolderDriveLink && (
              <a
                href={currentFolderDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-bold transition-all uppercase tracking-wider"
              >
                <ExternalLink size={14} />
                Open in Google Drive
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
