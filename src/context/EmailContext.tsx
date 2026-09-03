"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { GoogleSyncService } from '@/lib/google-sync-service';
import { liquid } from '@/lib/sync/bridge';

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface Email {
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

export type Folder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash' | 'archive' | 'gs' | 'mic';
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface ComposeData {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}

interface EmailContextType {
  emails: Email[];
  setEmails: React.Dispatch<React.SetStateAction<Email[]>>;
  folder: Folder;
  setFolder: (f: Folder) => void;
  selected: Email | null;
  setSelected: (e: Email | null) => void;
  composing: boolean;
  setComposing: (c: boolean) => void;
  sidebarTab: 'folders' | 'quick-mail';
  setSidebarTab: (t: 'folders' | 'quick-mail') => void;
  query: string;
  setQuery: (q: string) => void;
  composingInitial: Partial<ComposeData>;
  setComposingInitial: React.Dispatch<React.SetStateAction<Partial<ComposeData>>>;
  userEmail: string;
  setUserEmail: (email: string) => void;
  syncStatus: SyncStatus;
  setSyncStatus: (s: SyncStatus) => void;
  nextPageToken: string | null;
  setNextPageToken: (t: string | null) => void;
  loadingMore: boolean;
  setLoadingMore: (l: boolean) => void;
  isRefreshing: boolean;
  setIsRefreshing: (r: boolean) => void;
  fetchEmails: (token?: string | null, append?: boolean) => Promise<void>;
  loadMore: () => void;
  handleArchive: (id: string) => Promise<void>;
  handleTrash: (id: string) => Promise<void>;
  handleToggleStar: (id: string) => Promise<void>;
  handleSelect: (email: Email) => Promise<void>;
  handleSend: (data: ComposeData) => Promise<void>;
  handleMarkUnread: (id: string) => Promise<void>;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

async function callBrain(action: string, data: any = {}) {
  return liquid.invoke(action, data);
}

export function EmailProvider({ children }: { children: React.ReactNode }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [folder, setFolderState] = useState<Folder>('inbox');
  const [selected, setSelected] = useState<Email | null>(null);
  const [composing, setComposing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'folders' | 'quick-mail'>('folders');
  const [query, setQueryState] = useState('');
  const [composingInitial, setComposingInitial] = useState<Partial<ComposeData>>({});
  const [userEmail, setUserEmail] = useState('...');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const folderRef = useRef(folder);
  folderRef.current = folder;
  const queryRef = useRef(query);
  queryRef.current = query;

  const setFolder = (f: Folder) => {
    setFolderState(f);
  };

  const setQuery = (q: string) => {
    setQueryState(q);
  };

  const fetchEmails = useCallback(async (token: string | null = null, append = false) => {
    if (token) setLoadingMore(true);
    else if (append) return;
    else setSyncStatus('syncing');

    const activeFolder = folderRef.current;
    const activeQuery = queryRef.current;

    try {
      let gmailQuery = '';
      if (activeFolder === 'inbox') gmailQuery = 'label:inbox';
      else if (activeFolder === 'starred') gmailQuery = 'is:starred';
      else if (activeFolder === 'sent') gmailQuery = 'is:sent';
      else if (activeFolder === 'drafts') gmailQuery = 'is:draft';
      else if (activeFolder === 'trash') gmailQuery = 'is:trash';
      else if (activeFolder === 'archive') gmailQuery = '-label:inbox -is:trash -is:spam';
      else if (activeFolder === 'gs') gmailQuery = 'from:gs@ahmadiyya.ca';
      else if (activeFolder === 'mic') gmailQuery = 'from:missionary.incharge@ahmadiyya.ca';

      if (activeQuery) gmailQuery += ` ${activeQuery}`;

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
          const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
          try {
            return decodeURIComponent(atob(base64).split('').map(c => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
          } catch (e) {
            return atob(base64);
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
        localStorage.removeItem('google_refresh_token_encrypted');
        alert("Your login session has expired or is invalid. Please log in again.");
        window.location.reload();
      }
    } finally {
      setLoadingMore(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (nextPageToken && !loadingMore && syncStatus !== 'syncing') {
      fetchEmails(nextPageToken, true);
    }
  }, [nextPageToken, loadingMore, syncStatus, fetchEmails]);

  // Preload emails on start & whenever folder/query changes
  useEffect(() => {
    const isGuest = typeof window !== 'undefined' && localStorage.getItem('murrabi_guest_mode') === 'true';
    if (!isGuest) {
      fetchEmails();
    } else {
      setSyncStatus('idle');
    }
  }, [folder, query, fetchEmails]);

  // Load user profile on start
  useEffect(() => {
    GoogleSyncService.getUserProfile().then(profile => {
      if (profile?.email) setUserEmail(profile.email);
    });
  }, []);

  // Heartbeat sync or background sync: we can listen for google sync status
  // or sync emails every 5 minutes in background
  useEffect(() => {
    const isGuest = typeof window !== 'undefined' && localStorage.getItem('murrabi_guest_mode') === 'true';
    if (isGuest) return;

    const interval = setInterval(() => {
      if (navigator.onLine && syncStatus !== 'syncing') {
        fetchEmails();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchEmails, syncStatus]);

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

  async function handleMarkUnread(id: string) {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: false } : e));
    if (selected?.id === id) setSelected(null);
    await callBrain('gmail-mark-read', { id, read: false });
  }

  return (
    <EmailContext.Provider value={{
      emails, setEmails,
      folder, setFolder,
      selected, setSelected,
      composing, setComposing,
      sidebarTab, setSidebarTab,
      query, setQuery,
      composingInitial, setComposingInitial,
      userEmail, setUserEmail,
      syncStatus, setSyncStatus,
      nextPageToken, setNextPageToken,
      loadingMore, setLoadingMore,
      isRefreshing, setIsRefreshing,
      fetchEmails, loadMore,
      handleArchive, handleTrash, handleToggleStar, handleSelect, handleSend, handleMarkUnread
    }}>
      {children}
    </EmailContext.Provider>
  );
}

export function useEmails() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmails must be used within an EmailProvider');
  }
  return context;
}
