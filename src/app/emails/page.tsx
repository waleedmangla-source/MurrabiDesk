"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, 
  Trash2, 
  ChevronLeft,
  Search,
  CheckCircle2,
  Clock,
  Layout,
  FileText,
  Mail,
  Shield,
  Zap,
  MoreVertical,
  Paperclip,
  Eye,
  RefreshCw,
  Archive,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { GoogleSyncService } from '@/lib/google-sync-service';
import WorldClock from '@/components/WorldClock';
import QuickLinks from '@/components/QuickLinks';
import EventModal, { EventType } from '@/components/EventModal';

export default function EmailPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimer, setUndoTimer] = useState(3);
  const [isConnected, setIsConnected] = useState(false);
  const [gmailMessages, setGmailMessages] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [showTaskifyModal, setShowTaskifyModal] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem('google_refresh_token_encrypted');
    if (isAuth) {
      setIsConnected(true);
      fetchGmail();
    }
  }, []);

  const fetchGmail = async () => {
    setIsSyncing(true);
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        const messages = await service.getEmails();
        // Extract headers for easier processing
        const processed = messages.map((m: any) => {
          const headers = m.payload.headers;
          return {
            id: m.id,
            threadId: m.threadId,
            snippet: m.snippet,
            subject: headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)',
            from: headers.find((h: any) => h.name === 'From')?.value || 'Unknown',
            date: headers.find((h: any) => h.name === 'Date')?.value || '',
            payload: m.payload,
            unread: m.labelIds?.includes('UNREAD')
          };
        });
        setGmailMessages(processed);
        if (!selectedEmail && processed.length > 0) setSelectedEmail(processed[0]);
      } catch (err) {
        console.error('Gmail fetch failed:', err);
      }
    }
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date());
    }, 800);
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return gmailMessages;
    return gmailMessages.filter(m => 
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [gmailMessages, searchQuery]);

  const handleSend = async () => {
    if (!recipient || !subject || !message) return;
    setIsSending(true);
    setShowUndo(true);
    setUndoTimer(3);
  };

  const handleCancel = () => {
    setIsSending(false);
    setShowUndo(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showUndo && undoTimer > 0) {
      interval = setInterval(() => {
        setUndoTimer((prev) => prev - 1);
      }, 1000);
    } else if (undoTimer === 0) {
      const transmit = async () => {
        if (isConnected) {
          const service = await GoogleSyncService.fromLocalStorage();
          if (service) {
            try {
              await service.sendEmail(recipient, subject, message);
              setShowCompose(false);
              setRecipient("");
              setSubject("");
              setMessage("");
            } catch (err) {
              console.error('Transmission failed:', err);
            }
          }
        }
        setShowUndo(false);
        setIsSending(false);
      };
      transmit();
    }
    return () => clearInterval(interval);
  }, [showUndo, undoTimer, isConnected, recipient, subject, message]);

  // Taskify Helper: Convert Email to Mission
  const handleTaskify = async () => {
    if (!selectedEmail) return;
    setShowTaskifyModal(true);
  };

  const handleArchive = async () => {
    if (!selectedEmail) return;
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      await service.archiveEmail(selectedEmail.id);
      fetchGmail();
    }
  };

  const handleTrash = async () => {
    if (!selectedEmail) return;
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      await service.trashEmail(selectedEmail.id);
      fetchGmail();
    }
  };

  useEffect(() => {
    if (selectedEmail?.unread) {
      const markRead = async () => {
        const service = await GoogleSyncService.fromLocalStorage();
        if (service) {
          await service.markAsRead(selectedEmail.id);
          // Update local state to remove unread dot without full refresh
          setGmailMessages(prev => prev.map(m => m.id === selectedEmail.id ? { ...m, unread: false } : m));
        }
      };
      markRead();
    }
  }, [selectedEmail]);

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      {/* Beta Tools Header Section */}
      <div className="flex items-end justify-between mb-2 px-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Mission <span className="text-red-600">Inbox</span></h1>
          <p className="text-white/30 max-w-xl mt-2 font-black uppercase tracking-[0.3em] text-[9px]">
            Experimental Administrative Communication Protocol
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Filter threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-red-600/40 w-64 transition-all placeholder:text-white/10"
            />
          </div>
          <button 
            onClick={() => setShowCompose(true)}
            className="btn-v4 px-8 flex items-center gap-3 active:scale-95"
          >
            <Plus size={16} />
            Dispatch
          </button>
        </div>
      </div>

      {/* Diagnostic Communication Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
        {[
          { label: "Inbound Load", value: gmailMessages.length, status: gmailMessages.filter(m => m.unread).length + " UNREAD", icon: Mail, color: "text-red-500" },
          { label: "Sync Pulse", value: isSyncing ? "SYNCING..." : "IDLE", status: isSyncing ? "ACTIVE" : "STABLE", icon: RefreshCw, color: isSyncing ? "text-amber-500" : "text-emerald-500", animate: isSyncing },
          { label: "Node Status", value: isConnected ? "AUTHORIZED" : "DISCONNECTED", status: isConnected ? "ENCRYPTED" : "REBINDING", icon: Shield, color: isConnected ? "text-emerald-500" : "text-red-500" },
          { label: "Last Checkpoint", value: lastSync ? lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A", status: "VERIFIED", icon: Zap, color: "text-blue-500" }
        ].map((stat, i) => (
          <div key={i} className="glass p-5 flex flex-col gap-3 relative overflow-hidden group">
            <stat.icon className={clsx(stat.color, stat.animate && "animate-spin")} size={20} />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
              <h3 className="text-xl font-black text-white mt-1 tracking-tighter italic">{stat.value}</h3>
              <span className={clsx("text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-black/40 mt-2 inline-block", stat.color)}>
                {stat.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dual-Pane Content */}
      <div className="flex-1 flex gap-6 min-h-0 px-2 pb-8">
        {/* LEFT PANE: Mission Feed */}
        <aside className="w-[400px] glass rounded-[32px] flex flex-col overflow-hidden shrink-0 border border-white/5 shadow-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Identified Threads</span>
            <button 
              onClick={fetchGmail}
              className={clsx("p-2 rounded-lg hover:bg-white/5 text-white/20 transition-all", isSyncing && "animate-spin text-red-500")}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-3">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedEmail(m)}
                  className={clsx(
                    "w-full p-5 rounded-[24px] border transition-all duration-300 text-left relative overflow-hidden group/item",
                    selectedEmail?.id === m.id 
                      ? "bg-red-600/10 border-red-500/30 shadow-2xl shadow-red-950/20" 
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 transition-all",
                        selectedEmail?.id === m.id ? "bg-red-600 text-white" : "bg-white/5 text-white/40"
                      )}>
                        {m.from?.[0] || 'G'}
                      </div>
                      <h4 className={clsx(
                        "text-xs font-black truncate tracking-tight text-white/60",
                        selectedEmail?.id === m.id && "!text-white"
                      )}>
                        {m.from.split('<')[0]}
                      </h4>
                    </div>
                    {m.unread && (
                      <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse mt-1" />
                    )}
                  </div>
                  <h3 className={clsx(
                    "text-sm font-black mb-2 line-clamp-1 italic",
                    selectedEmail?.id === m.id ? "text-white" : "text-white/80"
                  )}>
                    {m.subject}
                  </h3>
                  <p className="text-[11px] font-bold text-white/20 line-clamp-2 leading-relaxed tracking-tight group-hover/item:text-white/40 transition-colors">
                    {m.snippet}
                  </p>
                </button>
              ))
            ) : (
                <div className="flex flex-col items-center justify-center h-48 opacity-10">
                    <Mail size={32} />
                    <p className="text-[9px] font-black uppercase tracking-widest mt-4">Safe & Sound</p>
                </div>
            )}
          </div>
        </aside>

        {/* RIGHT PANE: Mission Briefing */}
        <section className="flex-1 glass rounded-[32px] flex flex-col overflow-hidden relative border border-white/5 shadow-2xl">
           {selectedEmail ? (
             <>
               {/* Detail Header */}
               <div className="p-8 border-b border-white/5 bg-black/20 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                       {selectedEmail.from?.[0] || 'G'}
                     </div>
                     <div>
                       <h2 className="text-xl font-black text-white tracking-tight">{selectedEmail.subject}</h2>
                       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">SOURCE: {selectedEmail.from}</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={handleTaskify} className="p-3 rounded-xl glass hover:bg-white/5 text-amber-500 transition-all border border-white/5" title="Taskify">
                        <Zap size={18} />
                     </button>
                     <button onClick={handleArchive} className="p-3 rounded-xl glass hover:bg-white/5 text-emerald-500 transition-all border border-white/5" title="Archive">
                       <Archive size={18} />
                     </button>
                     <button onClick={handleTrash} className="p-3 rounded-xl glass hover:bg-white/5 text-red-500 transition-all border border-white/5" title="Trash">
                       <Trash2 size={18} />
                     </button>
                   </div>
                 </div>
               </div>

               {/* Email Body */}
               <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-black/10">
                 <div className="max-w-3xl mx-auto">
                    <div 
                      className="text-white/80 leading-relaxed font-medium text-lg prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: GmailContentParser.parse(selectedEmail.payload) }}
                    />
                 </div>
               </div>

               {/* Quick Response Bar */}
               <div className="p-6 px-10 border-t border-white/5 bg-black/20 shrink-0">
                  <div className="flex items-center gap-4">
                     <input 
                       type="text" 
                       placeholder="Enter operational response..."
                       className="flex-grow bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-red-600/40"
                     />
                     <button className="p-4 rounded-2xl bg-white text-black hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95">
                        <Send size={18} />
                     </button>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-grow flex flex-col items-center justify-center text-center p-12 opacity-10">
               <Mail size={120} className="text-white/10 mb-8" strokeWidth={0.5} />
               <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/60">No thread selected for decryption</p>
             </div>
           )}
        </section>
      </div>

      {/* Composition Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl">
           <div className="w-full max-w-2xl glass rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                       <Send size={20} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white italic tracking-tighter">Dispatch Protocol</h3>
                       <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">Encrypted Relay v4.0</p>
                    </div>
                 </div>
                 <button onClick={() => setShowCompose(false)} className="p-2 rounded-xl glass text-white/20 hover:text-white transition-all">
                    <Plus className="rotate-45" size={20} />
                 </button>
              </div>
              <div className="p-8 flex flex-col gap-4">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-2">Recipient Identity</label>
                    <input 
                      placeholder="identity@example.com" 
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-red-600/30 transition-all font-bold placeholder:text-white/10" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-2">Subject Header</label>
                    <input 
                      placeholder="MISSION_SUBJECT" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-red-600/30 transition-all font-bold placeholder:text-white/10" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-2">Intelligence Briefing</label>
                    <textarea 
                      placeholder="SECURE_CONTENT..." 
                      rows={8} 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 p-6 rounded-3xl text-white outline-none focus:border-red-600/30 transition-all font-medium placeholder:text-white/10 resize-none custom-scrollbar" 
                    />
                 </div>
              </div>
              <div className="p-8 border-t border-white/5 flex justify-end relative">
                 <button 
                  onClick={handleSend} 
                  disabled={isSending || !recipient || !message}
                  className="btn-v4 px-12 h-14 active:scale-95"
                 >
                    {isSending ? <RefreshCw size={18} className="animate-spin" /> : "Transmit Dispatch"}
                 </button>

                 {showUndo && (
                    <div className="absolute inset-0 bg-red-950 flex items-center justify-between px-10 z-10 animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center gap-3">
                            <RefreshCw size={16} className="animate-spin text-red-500" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Recall in {undoTimer}s</span>
                        </div>
                        <button onClick={handleCancel} className="btn-v4 bg-red-600 h-10 px-6">Abort</button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Taskify Integration */}
      {showTaskifyModal && selectedEmail && (
        <EventModal 
          onClose={() => setShowTaskifyModal(false)}
          initialData={{
            summary: `Email: ${selectedEmail.subject}`,
            description: `Reference: ${selectedEmail.from}\n---\n${selectedEmail.snippet}`
          }}
        />
      )}
    </div>
  );
}

// Gmail Content Parser Utility
const GmailContentParser = {
  parse(payload: any): string {
    if (!payload) return "";
    if (payload.body?.data) {
      return this.decode(payload.body.data);
    }
    if (payload.parts) {
      const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
      if (htmlPart) return this.parse(htmlPart);
      const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
      if (plainPart) return this.parse(plainPart);
      return payload.parts.map((p: any) => this.parse(p)).join("");
    }
    return "";
  },
  decode(data: string): string {
    try {
      return decodeURIComponent(escape(atob(data.replace(/-/g, '+').replace(/_/g, '/'))));
    } catch (e) {
      return "Unable to decrypt content.";
    }
  }
};
