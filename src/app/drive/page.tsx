"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ExternalLink
} from "lucide-react";
import clsx from "clsx";

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

function useGoogleToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    async function getToken() {
      if (typeof window === 'undefined') return;
      if (localStorage.getItem('murrabi_guest_mode') === 'true') return;
      const encrypted = localStorage.getItem('google_refresh_token_encrypted');
      if (!encrypted) return;
      try {
        const decRes = await fetch('/api/brain/decrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-murrabi-token': encrypted },
          body: JSON.stringify({ encrypted }),
        });
        const decData = await decRes.json();
        const refreshToken = decData?.decrypted;
        if (!refreshToken) return;
        const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '834945075004-a5rh91gdl55tqcplv91uh8gs3lajaauu.apps.googleusercontent.com';
        const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
          }).toString(),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          setToken(tokenData.access_token);
        }
      } catch (err) {
        console.error('Token fetch failed:', err);
      }
    }
    getToken();
  }, []);
  return token;
}

function getFileIcon(mimeType: string) {
  if (mimeType === 'application/vnd.google-apps.folder') return <Folder size={16} className="text-blue-400" />;
  if (mimeType.includes('image/')) return <ImageIcon size={16} className="text-emerald-400" />;
  if (mimeType.includes('video/')) return <Video size={16} className="text-red-400" />;
  if (mimeType.includes('audio/')) return <Music size={16} className="text-purple-400" />;
  if (mimeType.includes('pdf') || mimeType.includes('text/')) return <FileText size={16} className="text-orange-400" />;
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return <Archive size={16} className="text-yellow-400" />;
  return <File size={16} className="text-white/60" />;
}

export default function DrivePage() {
  const token = useGoogleToken();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [folderStack, setFolderStack] = useState<{id: string, name: string}[]>([{id: 'root', name: 'My Drive'}]);
  const [query, setQuery] = useState('');

  const currentFolder = folderStack[folderStack.length - 1];

  const fetchFiles = useCallback(async (folderId: string) => {
    if (!token) { setSyncStatus('offline'); return; }
    setSyncStatus('syncing');
    try {
      const tokenHeader = localStorage.getItem('google_refresh_token_encrypted') || '';
      const res = await fetch('/api/brain/drive-explore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-murrabi-token': tokenHeader
        },
        body: JSON.stringify({ folderId })
      });
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFiles(currentFolder.id);
    }
  }, [token, currentFolder.id, fetchFiles]);

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

  const filteredFiles = files.filter(f => 
    !query || f.name.toLowerCase().includes(query.toLowerCase())
  );

  const SyncIcon = syncStatus === 'syncing' ? Loader2
    : syncStatus === 'synced' ? CheckCircle
    : syncStatus === 'error' ? AlertCircle
    : RefreshCw;
  const syncColor = syncStatus === 'synced' ? 'text-emerald-400'
    : syncStatus === 'error' ? 'text-red-400'
    : syncStatus === 'offline' ? 'text-white/20'
    : 'text-white/30';

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-transparent">
      {/* File Browser Sidebar */}
      <div className="w-full lg:w-[320px] shrink-0 h-full border-r border-white/5 glass bg-black/20 flex flex-col z-10">
        <div className="px-5 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4 mt-8 lg:mt-6">
            <h1 className="text-2xl font-black italic tracking-tighter text-[var(--foreground)] uppercase flex items-center gap-2">
              <HardDrive size={20} className="text-[var(--accent-main)]" />
              Drive
            </h1>
            <button
              onClick={() => fetchFiles(currentFolder.id)}
              className={clsx("p-2 rounded-xl hover:bg-white/5 transition-all", syncColor)}
              title={syncStatus}
            >
              <SyncIcon size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
            {folderStack.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && <ChevronRight size={10} className="shrink-0" />}
                <button
                  onClick={() => handleNavigateToPath(index)}
                  className={clsx(
                    "hover:text-white transition-colors whitespace-nowrap px-1",
                    index === folderStack.length - 1 && "text-[var(--accent-main)]"
                  )}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="relative mt-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search in folder..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-white/30 outline-none focus:border-[var(--accent-main)]/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {folderStack.length > 1 && !query && (
            <button
              onClick={handleNavigateUp}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left group"
            >
              <ChevronLeft size={16} className="text-white/40 group-hover:text-white transition-colors" />
              <span className="text-xs font-bold text-white/70 group-hover:text-white">...</span>
            </button>
          )}

          {syncStatus === 'syncing' && files.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 size={24} className="animate-spin text-[var(--accent-main)]" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center p-8 text-xs text-white/40 font-medium">
              No files found in this folder.
            </div>
          ) : (
            filteredFiles.map(file => {
              const isSelected = selectedFile?.id === file.id;
              const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
              
              return (
                <button
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
                    isSelected 
                      ? "bg-[var(--accent-soft)] border border-[var(--accent-main)]/30" 
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="shrink-0 relative">
                    {file.thumbnailLink ? (
                      <div className="w-8 h-8 rounded border border-white/10 overflow-hidden bg-white/5">
                        <img src={file.thumbnailLink} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={clsx(
                        "w-8 h-8 rounded flex items-center justify-center",
                        isFolder ? "bg-blue-500/10" : "bg-white/5"
                      )}>
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      "text-xs font-bold truncate transition-colors",
                      isSelected ? "text-[var(--accent-main)]" : "text-white/80 group-hover:text-white"
                    )}>
                      {file.name}
                    </p>
                    {file.modifiedTime && (
                      <p className="text-[9px] text-white/40 mt-0.5">
                        {new Date(file.modifiedTime).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* File Viewer Main Area */}
      <div className="flex-1 flex flex-col h-full bg-black/10 relative overflow-hidden">
        {selectedFile ? (
          <div className="flex flex-col h-full w-full">
            <div className="shrink-0 p-4 border-b border-white/5 glass flex justify-between items-center z-10">
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(selectedFile.mimeType)}
                <h2 className="text-sm font-bold text-white truncate pr-4">{selectedFile.name}</h2>
              </div>
              <div className="flex gap-2 shrink-0">
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
              <h2 className="text-xl font-black italic tracking-tight text-white/80">
                GOOGLE DRIVE
              </h2>
              <p className="text-xs text-white/40 mt-2 max-w-sm font-medium">
                Select a file from the sidebar to preview its contents, or navigate through your folders.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
