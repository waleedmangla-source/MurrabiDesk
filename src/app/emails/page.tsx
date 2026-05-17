"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Inbox, Star, Send, FileText, Trash2, Archive,
  Search, Edit3, RefreshCw, Loader2, CheckCircle,
  AlertCircle, X, Paperclip, ChevronDown, Reply,
  MailOpen, Mail, User, ArrowLeft, Shield, Download, ExternalLink, Copy, Check
} from "lucide-react";
import clsx from "clsx";
import { GoogleSyncService } from '@/lib/google-sync-service';
import { liquid } from '@/lib/sync/bridge';
import RichTextEditor from "@/components/RichTextEditor";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface Email {
  id: string;
  threadId: string;
  messageId?: string;
  references?: string;
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
  attachments?: EmailAttachment[];
  labels: string[];
}

type Folder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash' | 'archive' | 'gs' | 'mic';
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface ComposeData {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
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

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ─────────────────────────────────────────────────────────────
// Brain API caller
// ─────────────────────────────────────────────────────────────
async function callBrain(action: string, data: any = {}) {
  return liquid.invoke(action, data);
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
function ComposeModal({ 
  onClose, 
  onSend, 
  initialTo = '', 
  initialSubject = '', 
  initialBody = '', 
  threadId, 
  inReplyTo 
}: { 
  onClose: () => void; 
  onSend: (d: ComposeData) => Promise<void>; 
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}) {
  const [form, setForm] = useState<ComposeData>({ 
    to: initialTo, 
    subject: initialSubject, 
    body: initialBody,
    threadId,
    inReplyTo,
    references
  });
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
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)]">Protocol: Compose</span>
          <div className="flex items-center gap-1">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)]">
              <X size={14} />
            </button>
          </div>
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

        {/* Body (Rich Text) */}
        <div className="flex-1 px-5 py-2 overflow-hidden flex flex-col">
          <RichTextEditor
            content={form.body}
            onChange={(html) => setForm(f => ({ ...f, body: html }))}
            placeholder="Write your premium message..."
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-black/10 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)]">
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
  email, onBack, onArchive, onTrash, onToggleStar, onReply, onForward, onMarkUnread, onDownloadAttachment
}: {
  email: Email;
  onBack: () => void;
  onArchive: (id: string) => void;
  onTrash: (id: string) => void;
  onToggleStar: (id: string) => void;
  onReply: (email: Email, all?: boolean) => void;
  onForward: (email: Email) => void;
  onMarkUnread: (id: string) => void;
  onDownloadAttachment: (msgId: string, attId: string, filename: string, mimeType: string, open?: boolean) => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Detail Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <button onClick={onBack} className="lg:hidden p-2 rounded-xl hover:bg-black/10 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)] mr-2">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-sm font-black text-[var(--foreground)] flex-1 truncate pr-4">{email.subject}</h2>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleStar(email.id)}
            className={clsx("p-2 rounded-xl hover:bg-black/10 transition-all", email.starred ? "text-amber-400" : "text-[var(--text-dim)]")}
          >
            <Star size={15} fill={email.starred ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => onMarkUnread(email.id)}
            className="p-2 rounded-xl hover:bg-black/10 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)]"
            title="Mark as Unread"
          >
            <Mail size={15} />
          </button>
          <button onClick={() => onArchive(email.id)} className="p-2 rounded-xl hover:bg-black/10 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)]" title="Archive">
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
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-[var(--foreground)] truncate">{email.fromName || email.from}</p>
            {email.hasAttachments && <Paperclip size={12} className="text-[var(--text-dim)]" />}
          </div>
          <p className="text-xs text-[var(--text-dim)] truncate mt-0.5">{email.from}</p>
          <p className="text-xs text-[var(--text-dim)] mt-0.5">to {email.to}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-[10px] text-[var(--text-dim)] font-bold">
            {new Date(email.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onReply(email)}
              className="p-1.5 rounded-lg hover:bg-black/10 text-[var(--text-dim)] hover:text-[var(--foreground)] transition-all"
              title="Reply"
            >
              <Reply size={14} />
            </button>
            <button 
              onClick={() => onForward(email)}
              className="p-1.5 rounded-lg hover:bg-black/10 text-[var(--text-dim)] hover:text-[var(--foreground)] transition-all"
              title="Forward"
            >
              <Send size={14} className="rotate-[-45deg] translate-y-[-1px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <EmailBody body={email.body} snippet={email.snippet} />
        
        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="shrink-0 px-6 py-4 bg-black/10 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-3">Attachments ({email.attachments.length})</p>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map(att => (
                <div key={att.id} className="flex items-center gap-3 p-2 pl-3 rounded-xl glass border border-white/10 hover:border-white/20 transition-all min-w-[200px] max-w-[300px]">
                  <div className="p-2 rounded-lg bg-white/5 text-[var(--accent-main)]">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--foreground)] truncate">{att.filename}</p>
                    <p className="text-[9px] text-[var(--text-dim)] font-medium mt-0.5">{formatBytes(att.size)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onDownloadAttachment(email.id, att.id, att.filename, att.mimeType, true)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--foreground)] transition-all"
                      title="Open in new tab"
                    >
                      <ExternalLink size={12} />
                    </button>
                    <button 
                      onClick={() => onDownloadAttachment(email.id, att.id, att.filename, att.mimeType, false)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--foreground)] transition-all"
                      title="Download"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reply Bar */}
      <div className="shrink-0 px-6 py-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onReply(email)}
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/10 text-sm text-[var(--text-dim)] hover:text-[var(--foreground)] hover:border-white/20 transition-all text-left"
          >
            <Reply size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">Reply to {email.fromName || email.from}</span>
          </button>
          <button
            onClick={() => onForward(email)}
            className="p-3 rounded-xl glass border border-white/10 text-[var(--text-dim)] hover:text-[var(--foreground)] hover:border-white/20 transition-all"
            title="Forward"
          >
            <Send size={14} className="rotate-[-45deg]" />
          </button>
        </div>
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
  { id: 'gs',      label: 'General Secretary', icon: User },
  { id: 'mic',     label: 'Missionary In-Charge', icon: Shield },
];

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [folder, setFolder] = useState<Folder>('inbox');
  const [selected, setSelected] = useState<Email | null>(null);
  const [composing, setComposing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'folders' | 'quick-mail'>('folders');
  const [query, setQuery] = useState('');
  const [composingInitial, setComposingInitial] = useState<Partial<ComposeData>>({});
  const [userEmail, setUserEmail] = useState('...');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const isGuest = typeof window !== 'undefined' && localStorage.getItem('murrabi_guest_mode') === 'true';

  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);

  // ── Fetch ──
  const fetchEmails = useCallback(async (token: string | null = null, append = false) => {
    if (token) setLoadingMore(true);
    else if (append) return;
    else setSyncStatus('syncing');

    try {
      // Map folder to Gmail query
      let gmailQuery = '';
      if (folder === 'inbox') gmailQuery = 'label:inbox';
      else if (folder === 'starred') gmailQuery = 'is:starred';
      else if (folder === 'sent') gmailQuery = 'is:sent';
      else if (folder === 'drafts') gmailQuery = 'is:draft';
      else if (folder === 'trash') gmailQuery = 'is:trash';
      else if (folder === 'archive') gmailQuery = '-label:inbox -is:trash -is:spam';
      else if (folder === 'gs') gmailQuery = 'from:gs@ahmadiyya.ca';
      else if (folder === 'mic') gmailQuery = 'from:missionary.incharge@ahmadiyya.ca';

      // Add user search query if present
      if (query) gmailQuery += ` ${query}`;

      const data = await callBrain('gmail-list', { pageToken: token, query: gmailQuery });
      
      if (data?.error) {
        throw new Error(data.error);
      }

      const raw: any[] = data?.emails || [];
      const newToken = data?.nextPageToken || null;
      
      const normalizeEmail = (e: any): Email => {
        const headers = e.payload?.headers || [];
        const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
        const fromRaw = getHeader('From');
        
        const base64UrlDecode = (str: string) => {
          if (!str) return '';
          // Convert base64url to base64
          const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
          try {
            return decodeURIComponent(atob(base64).split('').map(c => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
          } catch (e) {
            return atob(base64); // Fallback for non-unicode
          }
        };

        let body = '';
        const findBody = (parts: any[]): string => {
          const htmlPart = parts.find((p: any) => p.mimeType === 'text/html');
          if (htmlPart?.body?.data) return base64UrlDecode(htmlPart.body.data);
          const textPart = parts.find((p: any) => p.mimeType === 'text/plain');
          if (textPart?.body?.data) return base64UrlDecode(textPart.body.data);
          for (const part of parts) {
            if (part.parts) {
              const res = findBody(part.parts);
              if (res) return res;
            }
          }
          return '';
        };

        if (e.payload?.parts) body = findBody(e.payload.parts);
        else if (e.payload?.body?.data) body = base64UrlDecode(e.payload.body.data);

        const findAttachments = (parts: any[]): EmailAttachment[] => {
          let attached: EmailAttachment[] = [];
          for (const part of parts) {
            if (part.filename && part.body?.attachmentId) {
              attached.push({
                id: part.body.attachmentId,
                filename: part.filename,
                mimeType: part.mimeType,
                size: part.body.size || 0
              });
            }
            if (part.parts) {
              attached = [...attached, ...findAttachments(part.parts)];
            }
          }
          return attached;
        };

        const attachments = e.payload?.parts ? findAttachments(e.payload.parts) : [];

        return {
          id: e.id || String(Math.random()),
          threadId: e.threadId || '',
          messageId: getHeader('Message-ID'),
          references: getHeader('References'),
          from: fromRaw,
          fromName: fromRaw.split('<')[0]?.trim() || fromRaw || 'Unknown',
          to: getHeader('To'),
          subject: getHeader('Subject') || '(no subject)',
          snippet: e.snippet || body.slice(0, 120) || '',
          body: body,
          date: getHeader('Date') || e.internalDate,
          read: !(e.labelIds || []).includes('UNREAD'),
          starred: (e.labelIds || []).includes('STARRED'),
          hasAttachments: attachments.length > 0,
          attachments: attachments,
          labels: e.labelIds || [],
        };
      };

      const normalized = raw.map(normalizeEmail);
      
      if (append) {
        setEmails(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const netNew = normalized.filter(n => !existingIds.has(n.id));
          return [...prev, ...netNew];
        });
      } else {
        setEmails(normalized);
      }

      setNextPageToken(newToken);
      setSyncStatus('synced');
    } catch (err: any) {
      console.error('[GMAIL FETCH ERROR]', err);
      setSyncStatus('error');
      
      const errMsg = err?.message || String(err);
      if (errMsg.includes('invalid_grant') || errMsg.includes('401') || errMsg.includes('token') || errMsg.includes('Brain Error')) {
        // Token is likely invalid or old Electron encrypted token
        localStorage.removeItem('google_refresh_token_encrypted');
        alert("Your login session has expired or is invalid. Please log in again.");
        window.location.reload();
      }
    } finally {
      setLoadingMore(false);
      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [folder, query]); // Added folder and query as deps

  const loadMore = useCallback(() => {
    if (nextPageToken && !loadingMore && syncStatus !== 'syncing') {
      fetchEmails(nextPageToken, true);
    }
  }, [nextPageToken, loadingMore, syncStatus, fetchEmails]);

  // ── Pull to Refresh Logic ──
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].pageY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;
    if (diff > 0 && scrollContainerRef.current?.scrollTop === 0) {
      // Damping effect
      setPullDistance(Math.min(diff * 0.4, 80));
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      fetchEmails();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  // ── Trackpad/Mouse Wheel Pull to Refresh ──
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0 && e.deltaY < 0) {
      setIsPulling(true);
      setPullDistance(prev => Math.min(prev + Math.abs(e.deltaY) * 0.5, 80));

      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      
      wheelTimeout.current = setTimeout(() => {
        setPullDistance(prev => {
          if (prev > 60) {
            setIsRefreshing(true);
            fetchEmails();
          }
          return 0;
        });
        setIsPulling(false);
      }, 300); // Wait for wheel events to settle
    } else if (isPulling && e.deltaY > 0) {
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      setPullDistance(0);
      setIsPulling(false);
    }
  };


  // ── Infinite Scroll Observer ──
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  useEffect(() => {
    if (!isGuest) fetchEmails();
    else setSyncStatus('idle');

    GoogleSyncService.getUserProfile().then(profile => {
      if (profile?.email) setUserEmail(profile.email);
    });
  }, [isGuest, folder]); // Added folder to deps to re-fetch on folder change

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

  async function handleToggleStar(id: string) {
    const email = emails.find(e => e.id === id);
    if (!email) return;
    const newState = !email.starred;
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: newState } : e));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, starred: newState } : null);
    await callBrain('gmail-star', { id, starred: newState });
  }

  async function handleSelect(email: Email) {
    setSelected(email);
    if (!email.read) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
      callBrain('gmail-mark-read', { id: email.id });
    }
  }

  async function handleSend(data: ComposeData) {
    await callBrain('gmail-send', { 
      to: data.to, 
      subject: data.subject, 
      body: data.body, 
      attachments: [],
      threadId: data.threadId,
      inReplyTo: data.inReplyTo,
      references: data.references
    });
  }

  function handleReply(email: Email) {
    const subject = email.subject.toLowerCase().startsWith('re:') ? email.subject : `Re: ${email.subject}`;
    const quotedBody = `<br/><br/><blockquote>On ${new Date(email.date).toLocaleString()}, ${email.from} wrote:<br/>${email.body}</blockquote>`;
    setComposingInitial({
      to: email.from,
      subject,
      body: quotedBody,
      threadId: email.threadId,
      inReplyTo: email.messageId,
      references: email.references ? `${email.references} ${email.messageId}` : email.messageId
    });
    setComposing(true);
  }

  function handleForward(email: Email) {
    const subject = email.subject.toLowerCase().startsWith('fwd:') ? email.subject : `Fwd: ${email.subject}`;
    const forwardBody = `<br/><br/>---------- Forwarded message ---------<br/>From: ${email.from}<br/>Date: ${new Date(email.date).toLocaleString()}<br/>Subject: ${email.subject}<br/>To: ${email.to}<br/><br/>${email.body}`;
    setComposingInitial({
      subject,
      body: forwardBody
    });
    setComposing(true);
  }

  async function handleMarkUnread(id: string) {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: false } : e));
    if (selected?.id === id) setSelected(null);
    await callBrain('gmail-mark-read', { id, read: false });
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

  const handleDownloadAttachment = async (messageId: string, attachmentId: string, filename: string, mimeType: string, open = false) => {
    try {
      const data = await callBrain('gmail-get-attachment', { messageId, attachmentId });
      if (data?.error) throw new Error(data.error);
      
      const base64 = data.data.replace(/-/g, '+').replace(/_/g, '/');
      const binStr = atob(base64);
      const len = binStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
      
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      if (open) {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err: any) {
      console.error('Download failed:', err);
      alert('Failed to download attachment');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-dvh lg:h-screen lg:overflow-hidden bg-transparent">
      {/* ── Panel 1: Folder Sidebar — Desktop only ── */}
      <div className="hidden lg:flex w-[240px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20">
        {/* Sidebar Title */}
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Email</h1>
        </div>
        
        {/* Account Header */}
        <div className="px-5 pt-1 pb-4 border-b border-white/5 mb-2">
          <div className="flex items-center gap-2 px-0 py-2 overflow-hidden opacity-80">
            <Mail size={12} className="text-[var(--accent-main)] shrink-0" />
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold tracking-tight text-[var(--text-dim)] truncate">
                  {userEmail}
                </span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(userEmail);
                  }}
                  className="p-1 rounded-md hover:bg-black/20 text-[var(--text-dim)] hover:text-white transition-all"
                  title="Copy email address"
                >
                  <Copy size={10} />
                </button>
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
              { id: 'quick-mail', label: 'Quick' }
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
            <nav className="py-4 space-y-px">
              {FOLDERS.map(f => {
                const count = f.id === 'inbox' ? unread : 0;
                const Icon = f.icon;
                const active = folder === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => { setFolder(f.id); setSelected(null); }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-6 py-3 transition-all text-left border-l-2",
                      active
                        ? "font-black text-white border-[var(--accent-main)]"
                        : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--foreground)] border-transparent"
                    )}
                    style={active ? { background: 'rgba(0, 0, 0, 0.2)' } : {}}
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
                      onClick={() => { setComposingInitial({ to: recipient.email }); setComposing(true); }}
                      className="aspect-square flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-black/10 hover:border-white/10 transition-all group"
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
            onClick={() => { setComposingInitial({}); setComposing(true); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95"
            style={{ background: 'var(--accent-main)' }}
          >
            <Edit3 size={14} />
            Compose
          </button>
        </div>
      </div>

      {/* ── Mobile Folder Strip — shown only on mobile/tablet ── */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-b border-white/5 glass bg-black/10 shrink-0 no-scrollbar">
        <button
          onClick={() => { setComposingInitial({}); setComposing(true); }}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
          style={{ background: 'var(--accent-main)' }}
        >
          <Edit3 size={12} />
          Compose
        </button>
        {FOLDERS.map(f => {
          const count = f.id === 'inbox' ? unread : 0;
          const Icon = f.icon;
          const active = folder === f.id;
          return (
            <button
              key={f.id}
              onClick={() => { setFolder(f.id); setSelected(null); }}
              className={clsx(
                "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                active
                  ? "text-white"
                  : "text-[var(--text-muted)] border border-white/10"
              )}
              style={active ? { background: 'var(--accent-main)' } : {}}
            >
              <Icon size={11} />
              {f.label}
              {count > 0 && <span className="ml-1 text-[8px] font-black">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Panel 2: Email List ── */}
      <div className={clsx(
        "flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-transparent overflow-hidden",
        selected
          ? "hidden lg:flex lg:w-[340px] xl:w-[380px] lg:shrink-0 lg:h-full"
          : "flex w-full lg:w-[340px] xl:w-[380px] lg:flex-none lg:shrink-0 lg:h-full"
      )}>
        {/* List Header */}
        <div className="shrink-0 px-4 lg:px-5 pt-4 lg:pt-8 pb-4 border-b border-white/5">
          <h1 className="text-2xl lg:text-4xl font-black tracking-tighter text-white uppercase mb-3 truncate leading-none">
            {FOLDERS.find(f => f.id === folder)?.label || folder}
          </h1>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] truncate opacity-60">{userEmail}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                {filtered.length} messages{unread > 0 ? `, ${unread} unread` : ''}
              </p>
            </div>
            <button
              onClick={() => fetchEmails()}
              className="p-2 rounded-xl hover:bg-black/10 transition-all text-[var(--text-dim)] hover:text-[var(--foreground)]"
              title="Refresh"
            >
              <SyncIcon size={15} className={(syncStatus === 'syncing' || isRefreshing) ? 'animate-spin' : ''} />
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
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {/* Pull to Refresh Indicator */}
          <div 
            className="flex items-center justify-center overflow-hidden transition-all duration-200 bg-white/5"
            style={{ height: pullDistance > 0 ? pullDistance : 0, opacity: pullDistance > 0 ? pullDistance / 60 : 0 }}
          >
            <div className="flex items-center gap-2">
              <RefreshCw size={14} className={clsx("text-[var(--accent-main)]", pullDistance > 60 ? "animate-spin" : "")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                {pullDistance > 60 ? "Release to refresh" : "Pull to refresh"}
              </span>
            </div>
          </div>

          {isRefreshing && (
            <div className="py-4 flex flex-col items-center justify-center gap-2 border-b border-white/5">
              <Loader2 size={16} className="animate-spin text-[var(--accent-main)]" />
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Refreshing...</p>
            </div>
          )}

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

          {!isGuest && syncStatus !== 'syncing' && !isRefreshing && filtered.length === 0 && (
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
                selected?.id === email.id ? "" : "hover:bg-black/10",
                !email.read && "border-l-2 border-l-[var(--accent-main)]"
              )}
              style={selected?.id === email.id ? { background: 'rgba(0, 0, 0, 0.2)' } : {}}
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

          {loadingMore && (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <Loader2 size={20} className="animate-spin text-[var(--accent-main)]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">Loading more messages...</p>
            </div>
          )}

          {!loadingMore && nextPageToken && filtered.length > 0 && (
            <div className="py-8 flex justify-center">
              <button 
                onClick={loadMore}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] hover:text-[var(--accent-main)] transition-colors px-6 py-2 rounded-full border border-white/5 hover:border-[var(--accent-main)]/20"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Panel 3: Email Detail ── */}
      <div className={clsx(
        "flex-1 overflow-hidden bg-black/10",
        selected ? "flex flex-col" : "hidden lg:flex lg:flex-col"
      )}>
        {selected ? (
          <EmailDetail
            email={selected}
            onBack={() => setSelected(null)}
            onArchive={handleArchive}
            onTrash={handleTrash}
            onToggleStar={handleToggleStar}
            onReply={handleReply}
            onForward={handleForward}
            onMarkUnread={handleMarkUnread}
            onDownloadAttachment={handleDownloadAttachment}
          />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 w-full text-center gap-4 animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-full flex items-center justify-center border border-white/5" style={{ background: 'var(--accent-soft)' }}>
              <MailOpen size={32} style={{ color: 'var(--accent-main)' }} />
            </div>
            <div className="max-w-xs">
              <p className="text-xl font-black italic uppercase tracking-tighter text-[var(--foreground)]">
                Select an <span style={{ color: 'var(--accent-main)' }}>Email</span>
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] mt-2 leading-relaxed">
                Choose a message from the left<br/>to read its full content protocol
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Compose Modal ── */}
      {composing && (
        <ComposeModal
          onClose={() => { setComposing(false); setComposingInitial({}); }}
          onSend={handleSend}
          initialTo={composingInitial.to}
          initialSubject={composingInitial.subject}
          initialBody={composingInitial.body}
          threadId={composingInitial.threadId}
          inReplyTo={composingInitial.inReplyTo}
          references={composingInitial.references}
        />
      )}
    </div>
  );
}
