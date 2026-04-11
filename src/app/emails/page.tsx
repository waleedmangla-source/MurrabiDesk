"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Inbox, Star, Send, FileText, Trash2, Archive,
  Search, Edit3, RefreshCw, Loader2, CheckCircle,
  AlertCircle, X, Paperclip, ChevronDown, Reply,
  MailOpen, Mail, User, ArrowLeft
} from "lucide-react";
import clsx from "clsx";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Email {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  hasAttachments: boolean;
  labels: string[];
}

type Folder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash' | 'archive';
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface ComposeData {
  to: string;
  subject: string;
  body: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
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

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function avatarColor(name: string): string {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
    'bg-teal-500', 'bg-blue-500', 'bg-violet-500', 'bg-pink-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─────────────────────────────────────────────────────────────
// Brain API caller
// ─────────────────────────────────────────────────────────────
async function callBrain(action: string, data: any = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('google_refresh_token_encrypted') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['x-murrabi-token'] = token;
  const res = await fetch(`/api/brain/${action}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Avatar component
// ─────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={clsx("rounded-full flex items-center justify-center font-black text-white shrink-0", sz, avatarColor(name))}>
      {initials(name)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Compose Modal
// ─────────────────────────────────────────────────────────────
function ComposeModal({ onClose, onSend, initialTo = '' }: { onClose: () => void; onSend: (d: ComposeData) => Promise<void>; initialTo?: string }) {
  const [form, setForm] = useState<ComposeData>({ to: initialTo, subject: '', body: '' });
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!form.to || !form.subject) return;
    setSending(true);
    await onSend(form);
    setSending(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-end p-6 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-lg glass border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5" style={{ background: 'var(--accent-main)' }}>
          <span className="text-xs font-black uppercase tracking-widest text-white">New Message</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-all">
            <X size={14} className="text-white" />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-0 border-b border-white/5">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] w-12">To</span>
            <input
              type="email"
              placeholder="recipient@email.com"
              value={form.to}
              onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none"
            />
          </div>
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] w-12">Subject</span>
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none"
            />
          </div>
        </div>

        {/* Body */}
        <textarea
          placeholder="Write your message here..."
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          className="flex-1 bg-transparent px-5 py-4 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none resize-none min-h-[200px]"
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-white/5 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)]">
              <Paperclip size={15} />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !form.to || !form.subject}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white disabled:opacity-40 transition-all active:scale-95"
            style={{ background: 'var(--accent-main)' }}
          >
            {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Email Body Renderer (renders HTML emails with images & links)
// ─────────────────────────────────────────────────────────────
function EmailBody({ body, snippet }: { body: string; snippet: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isHtml = /<[a-z][\s\S]*>/i.test(body);
  const content = body || snippet || '';

  useEffect(() => {
    if (!isHtml || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    // Inject the email HTML with overrides so links open in new tab and it inherits no weird scrollbars
    const injected = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <base target="_blank"/>
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0; padding: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px; line-height: 1.6;
            color: #e5e7eb;
            background: transparent;
            word-break: break-word;
          }
          img { max-width: 100%; height: auto; display: inline-block; }
          a { color: #60a5fa; text-decoration: underline; }
          a:hover { color: #93c5fd; }
          pre, code { white-space: pre-wrap; word-break: break-all; }
          table { max-width: 100%; border-collapse: collapse; }
          td, th { word-break: break-word; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `;

    doc.open();
    doc.write(injected);
    doc.close();

    // Auto-resize iframe to fit content
    const resizeObserver = new ResizeObserver(() => {
      if (iframeRef.current && doc.body) {
        iframeRef.current.style.height = doc.body.scrollHeight + 32 + 'px';
      }
    });
    resizeObserver.observe(doc.body);
    return () => resizeObserver.disconnect();
  }, [content, isHtml]);

  if (!content) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--text-dim)] text-sm opacity-50">
        No content available.
      </div>
    );
  }

  if (isHtml) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        <iframe
          ref={iframeRef}
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          className="w-full border-0 min-h-[200px]"
          style={{ background: 'transparent', display: 'block' }}
          title="Email content"
        />
      </div>
    );
  }

  // Plain text fallback
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
      <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap opacity-80">
        {content}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Email Detail Panel
// ─────────────────────────────────────────────────────────────
function EmailDetail({
  email, onBack, onArchive, onTrash, onToggleStar
}: {
  email: Email;
  onBack: () => void;
  onArchive: (id: string) => void;
  onTrash: (id: string) => void;
  onToggleStar: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Detail Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <button onClick={onBack} className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)] mr-2">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-sm font-black text-[var(--foreground)] flex-1 truncate pr-4">{email.subject}</h2>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleStar(email.id)}
            className={clsx("p-2 rounded-xl hover:bg-white/5 transition-all", email.starred ? "text-amber-400" : "text-[var(--text-dim)]")}
          >
            <Star size={15} fill={email.starred ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onArchive(email.id)} className="p-2 rounded-xl hover:bg-white/5 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)]" title="Archive">
            <Archive size={15} />
          </button>
          <button onClick={() => onTrash(email.id)} className="p-2 rounded-xl hover:bg-red-500/20 transition-all text-[var(--text-dim)] hover:text-red-400" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Sender Info */}
      <div className="shrink-0 px-6 py-5 border-b border-white/5 flex items-start gap-4">
        <Avatar name={email.fromName || email.from} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-[var(--foreground)] truncate">{email.fromName || email.from}</p>
          <p className="text-xs text-[var(--text-dim)] truncate mt-0.5">{email.from}</p>
          <p className="text-xs text-[var(--text-dim)] mt-0.5">to {email.to}</p>
        </div>
        <div className="text-[10px] text-[var(--text-dim)] shrink-0 mt-1 font-bold">
          {new Date(email.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <EmailBody body={email.body} snippet={email.snippet} />
      </div>

      {/* Reply Bar */}
      <div className="shrink-0 px-6 py-4 border-t border-white/5">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/10 text-sm text-[var(--text-dim)] hover:text-[var(--foreground)] hover:border-white/20 transition-all text-left"
        >
          <Reply size={14} />
          <span className="text-xs font-bold uppercase tracking-widest">Reply to {email.fromName || email.from}</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Emails Page
// ─────────────────────────────────────────────────────────────
const FOLDERS: { id: Folder; label: string; icon: React.ElementType }[] = [
  { id: 'inbox',   label: 'Inbox',   icon: Inbox },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'sent',    label: 'Sent',    icon: Send },
  { id: 'drafts',  label: 'Drafts',  icon: FileText },
  { id: 'trash',   label: 'Deleted', icon: Trash2 },
  { id: 'archive', label: 'Archive', icon: Archive },
];

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [folder, setFolder] = useState<Folder>('inbox');
  const [selected, setSelected] = useState<Email | null>(null);
  const [composing, setComposing] = useState(false);
  const [composingTo, setComposingTo] = useState<string>('');
  const [sidebarTab, setSidebarTab] = useState<'folders' | 'quick-mail'>('folders');
  const [query, setQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const isGuest = typeof window !== 'undefined' && localStorage.getItem('murrabi_guest_mode') === 'true';

  // ── Fetch ──
  const fetchEmails = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const data = await callBrain('gmail-list');
      const raw: any[] = Array.isArray(data) ? data : (data?.emails || data?.messages || []);
      
      const normalized: Email[] = raw.map((e: any) => {
        const headers = e.payload?.headers || [];
        const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
        
        const fromRaw = getHeader('From');
        const subject = getHeader('Subject') || '(no subject)';
        const date = getHeader('Date') || e.internalDate;
        const to = getHeader('To');

        // Extract body - handling multi-part or simple body
        let body = '';
        if (e.payload?.parts) {
          // Look for text/plain or text/html
          const textPart = e.payload.parts.find((p: any) => p.mimeType === 'text/plain') || e.payload.parts[0];
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString();
          }
        } else if (e.payload?.body?.data) {
          body = Buffer.from(e.payload.body.data, 'base64').toString();
        }

        return {
          id: e.id || String(Math.random()),
          threadId: e.threadId || '',
          from: fromRaw,
          fromName: fromRaw.split('<')[0]?.trim() || fromRaw || 'Unknown',
          to: to,
          subject: subject,
          snippet: e.snippet || body.slice(0, 120) || '',
          body: body,
          date: date,
          read: !(e.labelIds || []).includes('UNREAD'),
          starred: (e.labelIds || []).includes('STARRED'),
          hasAttachments: !!(e.payload?.parts?.some((p: any) => p.filename)),
          labels: e.labelIds || [],
        };
      });
      
      setEmails(normalized);
      setSyncStatus('synced');
    } catch (err) {
      console.error('[GMAIL FETCH ERROR]', err);
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!isGuest) fetchEmails();
    else setSyncStatus('idle');
  }, [fetchEmails, isGuest]);

  // ── Actions ──
  async function handleArchive(id: string) {
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selected?.id === id) setSelected(null);
    await callBrain('gmail-archive', { id });
  }

  async function handleTrash(id: string) {
    setEmails(prev => prev.filter(e => e.id !== id));
    if (selected?.id === id) setSelected(null);
    await callBrain('gmail-trash', { id });
  }

  function handleToggleStar(id: string) {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, starred: !prev.starred } : null);
  }

  async function handleSelect(email: Email) {
    setSelected(email);
    if (!email.read) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
      callBrain('gmail-mark-read', { id: email.id });
    }
  }

  async function handleSend(data: ComposeData) {
    await callBrain('gmail-send', { to: data.to, subject: data.subject, body: data.body, attachments: [] });
  }

  // ── Filter ──
  const filtered = emails.filter(e => {
    const q = query.toLowerCase();
    const matchesQuery = !q || e.subject.toLowerCase().includes(q) || e.fromName.toLowerCase().includes(q) || e.snippet.toLowerCase().includes(q);
    const matchesFolder = folder === 'inbox' ? !e.labels.includes('TRASH') && !e.labels.includes('SENT')
      : folder === 'starred' ? e.starred
      : folder === 'sent' ? e.labels.includes('SENT')
      : folder === 'drafts' ? e.labels.includes('DRAFT')
      : folder === 'trash' ? e.labels.includes('TRASH')
      : folder === 'archive' ? e.labels.includes('ARCHIVE')
      : true;
    return matchesQuery && matchesFolder;
  });

  const frequentRecipients = useMemo(() => {
    const counts: Record<string, { count: number; name: string; email: string }> = {};
    emails.forEach(e => {
      const email = e.from;
      const name = e.fromName || email;
      if (!counts[email]) counts[email] = { count: 0, name, email };
      counts[email].count++;
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [emails]);

  const handleQuickMail = (email: string) => {
    setComposingTo(email);
    setComposing(true);
  };

  const unread = emails.filter(e => !e.read && !e.labels.includes('TRASH') && !e.labels.includes('SENT')).length;

  const SyncIcon = syncStatus === 'syncing' ? Loader2 : syncStatus === 'synced' ? CheckCircle : syncStatus === 'error' ? AlertCircle : RefreshCw;

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* ── Panel 1: Folder Sidebar ── */}
      <div className="w-[240px] shrink-0 h-full flex flex-col border-r border-white/5 glass bg-black/20">
        {/* Account Header */}
        <div className="px-5 pt-12 pb-5 border-b border-white/5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl mt-1" style={{ background: 'var(--accent-main)' }}>
            <Mail size={14} className="text-white shrink-0" />
            <span className="text-xs font-black uppercase tracking-tight text-white truncate">Gmail</span>
            <ChevronDown size={12} className="text-white/60 ml-auto" />
          </div>

          {/* Sidebar Tabs */}
          <div className="flex bg-white/5 rounded-xl p-0.5 mt-4 border border-white/5">
            {[
              { id: 'folders', label: 'Folders' },
              { id: 'quick-mail', label: 'Quick' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSidebarTab(t.id as any)}
                className={clsx(
                  "flex-1 py-1.5 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all",
                  sidebarTab === t.id ? "bg-white/10 text-white shadow-sm" : "text-[var(--text-dim)] hover:text-white"
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
            <nav className="px-3 py-4 space-y-0.5">
              {FOLDERS.map(f => {
                const count = f.id === 'inbox' ? unread : 0;
                const Icon = f.icon;
                const active = folder === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => { setFolder(f.id); setSelected(null); }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                      active
                        ? "font-black text-white"
                        : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                    )}
                    style={active ? { background: 'var(--accent-main)' } : {}}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="text-xs font-bold flex-1">{f.label}</span>
                    {count > 0 && (
                      <span className={clsx("text-[9px] font-black px-1.5 py-0.5 rounded-full", active ? "bg-white/20 text-white" : "bg-[var(--accent-soft)] text-[var(--accent-main)]")}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="p-4 flex flex-col flex-1">
              <div className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)] mb-4 shrink-0">Frequent Recipients</div>
              <div className="grid grid-cols-2 gap-2 pb-4">
                {frequentRecipients.length === 0 ? (
                  <div className="col-span-2 text-[10px] font-bold text-[var(--text-muted)] italic text-center py-8">
                    No frequent contacts yet
                  </div>
                ) : (
                  frequentRecipients.map(recipient => (
                    <button
                      key={recipient.email}
                      onClick={() => handleQuickMail(recipient.email)}
                      className="aspect-square flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                    >
                      <Avatar name={recipient.name} size="md" />
                      <div className="mt-2 text-[10px] font-black tracking-tight text-[var(--foreground)] truncate w-full text-center group-hover:text-[var(--accent-main)] transition-colors">
                        {recipient.name.split(' ')[0]}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Compose */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setComposing(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95"
            style={{ background: 'var(--accent-main)' }}
          >
            <Edit3 size={14} />
            Compose
          </button>
        </div>
      </div>

      {/* ── Panel 2: Email List ── */}
      <div className={clsx(
        "flex flex-col border-r border-white/5 bg-transparent h-full overflow-hidden",
        selected ? "hidden lg:flex lg:w-[340px] xl:w-[380px] shrink-0" : "flex-1 lg:w-[340px] xl:w-[380px] lg:flex-none lg:shrink-0"
      )}>
        {/* List Header */}
        <div className="shrink-0 px-5 pt-12 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight text-[var(--foreground)] capitalize">{folder}</h1>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                {filtered.length} messages{unread > 0 ? `, ${unread} unread` : ''}
              </p>
            </div>
            <button
              onClick={fetchEmails}
              className="p-2 rounded-xl hover:bg-white/5 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)]"
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
              placeholder="Search emails..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none"
            />
            {query && <button onClick={() => setQuery('')}><X size={12} className="text-[var(--text-dim)]" /></button>}
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {syncStatus === 'syncing' && emails.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-dim)]">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-main)' }} />
              <p className="text-[10px] font-black uppercase tracking-widest">Loading emails...</p>
            </div>
          )}

          {isGuest && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
                <Mail size={24} style={{ color: 'var(--accent-main)' }} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-dim)]">Sign in with Google to view emails</p>
            </div>
          )}

          {!isGuest && syncStatus !== 'syncing' && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
              <Inbox size={32} className="text-[var(--text-dim)] opacity-30" />
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-dim)]">No emails found</p>
            </div>
          )}

          {filtered.map(email => (
            <button
              key={email.id}
              onClick={() => handleSelect(email)}
              className={clsx(
                "w-full flex items-start gap-3 px-4 py-4 border-b border-white/5 text-left transition-all group",
                selected?.id === email.id ? "bg-[var(--accent-soft)]" : "hover:bg-white/5",
                !email.read && "border-l-2 border-l-[var(--accent-main)]"
              )}
            >
              <Avatar name={email.fromName || email.from} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className={clsx("text-xs truncate", email.read ? "font-medium text-[var(--text-muted)]" : "font-black text-[var(--foreground)]")}>
                    {email.fromName || email.from}
                  </p>
                  <span className="text-[9px] text-[var(--text-dim)] shrink-0 font-bold">{relativeTime(email.date)}</span>
                </div>
                <p className={clsx("text-xs truncate mb-1", email.read ? "text-[var(--text-muted)]" : "font-bold text-[var(--foreground)]")}>
                  {email.subject}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-[var(--text-dim)] truncate flex-1">{email.snippet}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    {email.hasAttachments && <Paperclip size={10} className="text-[var(--text-dim)]" />}
                    {email.starred && <Star size={10} className="text-amber-400" fill="currentColor" />}
                    {!email.read && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-main)' }} />}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel 3: Email Detail ── */}
      <div className={clsx("flex-1 h-full overflow-hidden", selected ? "flex" : "hidden lg:flex")}>
        {selected ? (
          <EmailDetail
            email={selected}
            onBack={() => setSelected(null)}
            onArchive={handleArchive}
            onTrash={handleTrash}
            onToggleStar={handleToggleStar}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center border border-[var(--accent-soft)]" style={{ background: 'var(--accent-soft)' }}>
              <MailOpen size={32} style={{ color: 'var(--accent-main)' }} />
            </div>
            <div>
              <p className="text-lg font-black italic uppercase tracking-tighter text-[var(--foreground)]">
                Select an <span style={{ color: 'var(--accent-main)' }}>Email</span>
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] mt-1">
                Choose a message from the left to read it
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Compose Modal ── */}
      {composing && (
        <ComposeModal
          onClose={() => { setComposing(false); setComposingTo(''); }}
          onSend={handleSend}
          initialTo={composingTo}
        />
      )}
    </div>
  );
}
