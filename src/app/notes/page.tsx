"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, Grid3X3, List, Pin, Tag, Trash2, X,
  RefreshCw, CheckCircle, AlertCircle, Loader2, Edit3,
  ChevronDown, Palette, Clock, FileText
} from "lucide-react";
import clsx from "clsx";
interface Note {
  id: string;
  _driveId?: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
type ViewMode = 'grid' | 'list';
const NOTE_COLORS: { key: string; label: string; bg: string; border: string; text: string }[] = [
  { key: 'default',  label: 'Default',   bg: 'bg-white/5',         border: 'border-white/10', text: 'text-white' },
  { key: 'red',      label: 'Berry',     bg: 'bg-red-900/30',      border: 'border-red-500/30', text: 'text-red-100' },
  { key: 'orange',   label: 'Desert',    bg: 'bg-orange-900/30',   border: 'border-orange-500/30', text: 'text-orange-100' },
  { key: 'yellow',   label: 'Gold',      bg: 'bg-yellow-900/30',   border: 'border-yellow-500/30', text: 'text-yellow-100' },
  { key: 'green',    label: 'Sage',      bg: 'bg-emerald-900/30',  border: 'border-emerald-500/30', text: 'text-emerald-100' },
  { key: 'teal',     label: 'Teal',      bg: 'bg-teal-900/30',     border: 'border-teal-500/30', text: 'text-teal-100' },
  { key: 'blue',     label: 'Ocean',     bg: 'bg-blue-900/30',     border: 'border-blue-500/30', text: 'text-blue-100' },
  { key: 'purple',   label: 'Lavender',  bg: 'bg-purple-900/30',   border: 'border-purple-500/30', text: 'text-purple-100' },
  { key: 'pink',     label: 'Rose',      bg: 'bg-pink-900/30',     border: 'border-pink-500/30', text: 'text-pink-100' },
  { key: 'gray',     label: 'Stone',     bg: 'bg-slate-800/40',    border: 'border-slate-500/30', text: 'text-slate-200' },
];
function getColor(key: string) {
  return NOTE_COLORS.find(c => c.key === key) || NOTE_COLORS[0];
}
function formatNoteDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch {
    return 'Recently';
  }
}
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
        console.error('[NOTES] Token fetch failed:', err);
      }
    }
    getToken();
  }, []);
  return token;
}
function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function ColorPicker({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest no-drag"
        title="Change color"
      >
        <Palette size={14} />
        <span className="hidden sm:inline">Color</span>
        <ChevronDown size={12} className={clsx("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 p-3 glass border border-white/10 rounded-2xl shadow-2xl grid grid-cols-5 gap-2 w-36">
          {NOTE_COLORS.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => { onChange(c.key); setOpen(false); }}
              className={clsx(
                "w-6 h-6 rounded-full border transition-all",
                c.bg, c.border,
                value === c.key && "ring-2 ring-white ring-offset-1 ring-offset-black/50 scale-110"
              )}
              title={c.label}
            />
          ))}
        </div>
      )}
    </div>
  );
}
function NoteCard({
  note, viewMode, onEdit, onPin, onDelete
}: {
  note: Note;
  viewMode: ViewMode;
  onEdit: (n: Note) => void;
  onPin: (n: Note) => void;
  onDelete: (n: Note) => void;
}) {
  const color = getColor(note.color);
  if (viewMode === 'list') {
    return (
      <div
        className={clsx(
          "glass border rounded-2xl px-5 py-4 flex items-start gap-4 group transition-all cursor-pointer",
          color.bg, color.border
        )}
        onClick={() => onEdit(note)}
      >
        <div className="flex-1 min-w-0">
          {note.title && (
            <p className={clsx("text-sm font-black uppercase tracking-tight truncate", color.text)}>
              {note.title}
            </p>
          )}
          {note.content && (
            <p className={clsx("text-xs mt-1 line-clamp-2 leading-relaxed", color.text, "opacity-60")}>
              {note.content}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {note.labels.map(tag => (
              <span key={tag} className="text-[9px] font-black uppercase tracking-wider text-[var(--accent-main)] bg-[var(--accent-soft)] border border-[var(--accent-soft)] px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
            <span className={clsx("text-[9px] font-bold uppercase tracking-wider opacity-30", color.text)}>{relativeTime(note.updatedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
          {note.pinned && <Pin size={13} className="text-[var(--accent-main)]" />}
          <button onClick={e => { e.stopPropagation(); onPin(note); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-all" title={note.pinned ? "Unpin" : "Pin"}>
            <Pin size={13} className={clsx(note.pinned ? "text-[var(--accent-main)]" : "text-white/30")} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(note); }} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all">
            <Trash2 size={13} className="text-white/30 hover:text-red-400" />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      className={clsx(
        "glass border rounded-2xl p-5 flex flex-col gap-3 group transition-all cursor-pointer break-inside-avoid",
        color.bg, color.border
      )}
      onClick={() => onEdit(note)}
    >
      {note.title && (
        <p className={clsx("text-sm font-black uppercase tracking-tight", color.text)}>
          {note.title}
        </p>
      )}
      {note.content && (
        <p className={clsx("text-xs leading-relaxed line-clamp-8", color.text, "opacity-70")}>
          {note.content}
        </p>
      )}
      {note.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {note.labels.map(tag => (
            <span key={tag} className="text-[9px] font-black uppercase tracking-wider text-[var(--accent-main)] bg-[var(--accent-soft)] border border-[var(--accent-soft)] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-white/5">
        <span className={clsx("text-[9px] font-bold uppercase tracking-wider opacity-30", color.text)}>
          {relativeTime(note.updatedAt)}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={e => { e.stopPropagation(); onPin(note); }} className="p-1 rounded-lg hover:bg-white/10 transition-all" title={note.pinned ? "Unpin" : "Pin"}>
            <Pin size={12} className={clsx(note.pinned ? "text-[var(--accent-main)]" : "text-white/30")} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(note); }} className="p-1 rounded-lg hover:bg-red-500/20 transition-all">
            <Trash2 size={12} className="text-white/30 hover:text-red-400" />
          </button>
        </div>
      </div>
      {note.pinned && <Pin size={12} className="absolute top-3 right-3 text-[var(--accent-main)]" />}
    </div>
  );
}
function NoteModal({
  note, onClose, onSave, onDelete
}: {
  note: Partial<Note>;
  onClose: () => void;
  onSave: (n: Partial<Note>) => void;
  onDelete: (n: Partial<Note>) => void;
}) {
  const [form, setForm] = useState<Partial<Note>>({ color: 'default', pinned: false, labels: [], ...note });
  const [labelInput, setLabelInput] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { contentRef.current?.focus(); }, []);
  function handleLabel(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && labelInput.trim()) {
      e.preventDefault();
      setForm(f => ({ ...f, labels: [...(f.labels || []), labelInput.trim()] }));
      setLabelInput('');
    }
  }
  function removeLabel(tag: string) {
    setForm(f => ({ ...f, labels: (f.labels || []).filter(l => l !== tag) }));
  }
  const color = getColor(form.color || 'default');
  const isNew = !note.id;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-12 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className={clsx("w-full max-w-2xl flex flex-col gap-4 glass border rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto", color.bg, color.border)}
        onClick={e => e.stopPropagation()}
      >
        {}
        <div className="flex items-center justify-between">
          <h2 className={clsx("text-sm font-black uppercase tracking-widest", color.text)}>
            {isNew ? 'New Note' : 'Edit Note'}
          </h2>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button onClick={() => onDelete(form)} className="p-2 rounded-xl hover:bg-red-500/20 transition-all" title="Delete note">
                <Trash2 size={16} className="text-white/30 hover:text-red-400" />
              </button>
            )}
            <button
              onClick={() => { if (form.title || form.content) setForm(f => ({ ...f, pinned: !f.pinned })); }}
              className={clsx("p-2 rounded-xl transition-all", form.pinned ? "bg-[var(--accent-soft)]" : "hover:bg-white/10")}
              title={form.pinned ? "Unpin" : "Pin"}
            >
              <Pin size={16} className={clsx(form.pinned ? "text-[var(--accent-main)]" : "text-white/30")} />
            </button>
            <ColorPicker value={form.color || 'default'} onChange={c => setForm(f => ({ ...f, color: c }))} />
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-all">
              <X size={16} className="text-white/40" />
            </button>
          </div>
        </div>
        {}
        <input
          type="text"
          placeholder="Title"
          value={form.title || ''}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className={clsx("w-full bg-transparent text-lg font-black uppercase tracking-tight outline-none placeholder-white/20 border-b border-white/5 pb-3", color.text)}
        />
        {}
        <textarea
          ref={contentRef}
          placeholder="Take a note..."
          value={form.content || ''}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          rows={8}
          className={clsx("w-full bg-transparent text-sm leading-relaxed outline-none resize-none placeholder-white/20", color.text, "opacity-80 focus:opacity-100")}
        />
        {}
        <div className="flex flex-wrap gap-2 items-center">
          {(form.labels || []).map(tag => (
            <span key={tag} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)] bg-[var(--accent-soft)] border border-[var(--accent-soft)] px-2 py-0.5 rounded-full">
              {tag}
              <button type="button" onClick={() => removeLabel(tag)}>
                <X size={10} />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <Tag size={11} className="text-white/30" />
            <input
              type="text"
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              onKeyDown={handleLabel}
              placeholder="Add label, press Enter"
              className="bg-transparent text-[10px] font-bold text-white/60 uppercase tracking-wider outline-none w-36 placeholder-white/20"
            />
          </div>
        </div>
        {}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <p className={clsx("text-[9px] font-bold uppercase tracking-widest opacity-30", color.text)}>
            {form.updatedAt ? `Last edited ${relativeTime(form.updatedAt)}` : 'New note'}
          </p>
          <button
            type="button"
            onClick={() => { if (form.title || form.content) onSave(form); else onClose(); }}
            className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all active:scale-95"
            style={{ background: 'var(--accent-main)' }}
          >
            {isNew ? 'Create Note' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function NotesPage() {
  const token = useGoogleToken();
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);
  const fetchNotes = useCallback(async () => {
    if (!token) { setSyncStatus('offline'); return; }
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/notes', { headers: headers() });
      const data = await res.json();
      if (data.notes) {
        setNotes(data.notes.sort((a: Note, b: Note) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ));
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
  }, [token, headers]);
  useEffect(() => { fetchNotes(); }, [fetchNotes]);
  async function handleSave(form: Partial<Note>) {
    setSyncStatus('syncing');
    const isUpdate = !!form._driveId;
    const method = isUpdate ? 'PATCH' : 'POST';
    if (isUpdate) {
      setNotes(prev => prev.map(n => n._driveId === form._driveId ? { ...n, ...form, updatedAt: new Date().toISOString() } as Note : n));
    } else {
      const tempNote: Note = {
        id: `temp_${Date.now()}`,
        title: form.title || '',
        content: form.content || '',
        color: form.color || 'default',
        pinned: form.pinned || false,
        labels: form.labels || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes(prev => [tempNote, ...prev]);
    }
    setEditingNote(null);
    try {
      const res = await fetch('/api/notes', { method, headers: headers(), body: JSON.stringify(form) });
      const data = await res.json();
      if (data.note) {
        if (isUpdate) {
          setNotes(prev => prev.map(n => n._driveId === form._driveId ? data.note : n));
        } else {
          setNotes(prev => [data.note, ...prev.filter(n => !n.id.startsWith('temp_'))]);
        }
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
  }
  async function handlePin(note: Note) {
    await handleSave({ ...note, pinned: !note.pinned });
  }
  async function handleDelete(note: Partial<Note>) {
    setNotes(prev => prev.filter(n => n._driveId !== note._driveId));
    setEditingNote(null);
    setSyncStatus('syncing');
    try {
      await fetch('/api/notes', { method: 'DELETE', headers: headers(), body: JSON.stringify({ _driveId: note._driveId }) });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }
  const allLabels = Array.from(new Set(notes.flatMap(n => n.labels)));
  const filtered = notes.filter(n => {
    const q = query.toLowerCase();
    const matchesQuery = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    const matchesLabel = !activeLabel || n.labels.includes(activeLabel);
    return matchesQuery && matchesLabel;
  });
  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);
  const SyncIcon = syncStatus === 'syncing' ? Loader2
    : syncStatus === 'synced' ? CheckCircle
    : syncStatus === 'error' ? AlertCircle
    : RefreshCw;
  const syncColor = syncStatus === 'synced' ? 'text-emerald-400'
    : syncStatus === 'error' ? 'text-red-400'
    : syncStatus === 'offline' ? 'text-white/20'
    : 'text-white/30';
  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {}
      <div className="w-[240px] shrink-0 h-full border-r border-white/5 glass bg-black/20 flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="px-5 pt-12 pb-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[var(--accent-main)] text-white">
              <Plus size={12} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Inventory</span>
          </div>
          <span className="text-[9px] font-bold text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full">{notes.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <div className="space-y-1">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => setEditingNote(note)}
                className={clsx(
                  "w-full text-left px-3 py-3 rounded-xl transition-all group/item border border-transparent",
                  editingNote?.id === note.id 
                    ? "bg-[var(--accent-soft)] border-[var(--accent-soft)]" 
                    : "hover:bg-white/5 hover:border-white/5"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className={clsx("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", getColor(note.color).bg.replace('bg-', 'bg-opacity-100 bg-'))} style={{ backgroundColor: note.color !== 'default' ? undefined : 'var(--accent-main)' }} />
                  <div className="flex-1 min-w-0">
                    <h4 className={clsx(
                      "text-xs font-bold truncate transition-colors",
                      editingNote?.id === note.id ? "text-[var(--accent-main)]" : "text-white/80 group-hover/item:text-white"
                    )}>
                      {note.title || 'Untitled Note'}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 text-[9px] font-medium text-white/30">
                      <Clock size={9} />
                      <span>{formatNoteDate(note.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
      {}
      <div className="shrink-0 px-8 pt-12 pb-6 border-b border-white/5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-[var(--foreground)] uppercase">
              Mission <span style={{ color: 'var(--accent-main)' }}>Notes</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchNotes}
              className={clsx("p-2 rounded-xl hover:bg-white/5 transition-all", syncColor)}
              title={syncStatus}
            >
              <SyncIcon size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            </button>
            <div className="flex items-center glass border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx("p-2.5 transition-all", viewMode === 'grid' ? "bg-[var(--accent-main)] text-white" : "text-white/30 hover:text-white hover:bg-white/5")}
              >
                <Grid3X3 size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx("p-2.5 transition-all", viewMode === 'list' ? "bg-[var(--accent-main)] text-white" : "text-white/30 hover:text-white hover:bg-white/5")}
              >
                <List size={15} />
              </button>
            </div>
            <button
              onClick={() => setEditingNote({ color: 'default', pinned: false, labels: [] })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-lg"
              style={{ background: 'var(--accent-main)' }}
            >
              <Plus size={15} />
              New Note
            </button>
          </div>
        </div>
        {}
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-3 glass bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <Search size={15} className="text-[var(--text-dim)] shrink-0" />
            <input
              type="text"
              placeholder="Search notes..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none font-medium"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X size={14} className="text-[var(--text-dim)] hover:text-[var(--foreground)] transition-colors" />
              </button>
            )}
          </div>
          {}
          {allLabels.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto max-w-sm">
              <Tag size={12} className="text-[var(--text-dim)] shrink-0" />
              {allLabels.map(label => (
                <button
                  key={label}
                  onClick={() => setActiveLabel(activeLabel === label ? null : label)}
                  className={clsx(
                    "text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border transition-all shrink-0",
                    activeLabel === label
                      ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white"
                      : "text-[var(--accent-main)] bg-[var(--accent-soft)] border-[var(--accent-soft)] hover:opacity-80"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {}
      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
        {notes.length === 0 && syncStatus !== 'syncing' && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full border border-[var(--accent-soft)] flex items-center justify-center relative" style={{ background: 'var(--accent-soft)' }}>
              <Edit3 size={32} style={{ color: 'var(--accent-main)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter text-[var(--foreground)] uppercase">
                No Notes Yet
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] mt-2">
                {token ? 'Your notes will sync with Google Drive' : 'Sign in to enable sync'}
              </p>
            </div>
            <button
              onClick={() => setEditingNote({ color: 'default', pinned: false, labels: [] })}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all active:scale-95"
              style={{ background: 'var(--accent-main)' }}
            >
              <Plus size={16} />
              Create First Note
            </button>
          </div>
        )}
        {syncStatus === 'syncing' && notes.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={32} className="animate-spin text-[var(--accent-main)]" />
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-dim)]">
                Syncing from Google Drive...
              </p>
            </div>
          </div>
        )}
        {}
        {pinned.length > 0 && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <Pin size={11} style={{ color: 'var(--accent-main)' }} />
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Pinned</p>
            </div>
            {viewMode === 'grid' ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {pinned.map(note => (
                  <NoteCard key={note.id} note={note} viewMode={viewMode} onEdit={setEditingNote} onPin={handlePin} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pinned.map(note => (
                  <NoteCard key={note.id} note={note} viewMode={viewMode} onEdit={setEditingNote} onPin={handlePin} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}
        {}
        {unpinned.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {pinned.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Others</p>
              </div>
            )}
            {viewMode === 'grid' ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {unpinned.map(note => (
                  <NoteCard key={note.id} note={note} viewMode={viewMode} onEdit={setEditingNote} onPin={handlePin} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {unpinned.map(note => (
                  <NoteCard key={note.id} note={note} viewMode={viewMode} onEdit={setEditingNote} onPin={handlePin} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {}
      {editingNote !== null && (
        <NoteModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  </div>
);
}
