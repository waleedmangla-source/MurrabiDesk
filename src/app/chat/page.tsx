
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Send, Trash2, ChevronRight, ChevronLeft,
  Calendar, Receipt, FileText, Copy, Check, BookOpen,
  PenTool, MessageSquare, Globe, Loader2, AlertCircle, X,
  Plus, Ghost, Paperclip, Image as ImageIcon, Music, File as FileIcon,
  Mic, MicOff
} from "lucide-react";
import { clsx } from "clsx";
import { QUICK_PROMPTS } from "@/lib/murabbiAI-system";
import { GoogleSyncService } from "@/lib/google-sync-service";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  data: string; // Base64 string
  previewUrl?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  attachments?: Attachment[];
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  isTemporary: boolean;
  updatedAt: number;
}

const STORAGE_KEY = "murabbi_ai_conversations_v1";
const OLD_STORAGE_KEY = "murabbi_ai_chat_v1";

function renderMarkdown(text: string) {
  if (!text) return "";

  let html = text;

  // Code blocks ```code```
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-black/90 text-emerald-400 p-3 rounded-xl text-xs font-mono my-2 overflow-x-auto border border-white/10"><code>$1</code></pre>');

  // Headers
  html = html.replace(/^#### (.*$)/gm, '<h4 class="text-xs font-black uppercase tracking-widest mt-3 mb-1 text-[var(--accent-main)]">$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-sm font-black uppercase tracking-widest mt-4 mb-2 text-[var(--accent-main)]">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-base font-black mt-5 mb-2 text-black">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-lg font-black mt-6 mb-2 text-black">$1</h1>');

  // Blockquotes (> or > )
  html = html.replace(/^(?:> ?)(.*$)/gm, '<blockquote class="border-l-4 border-[var(--accent-main)] pl-3 py-1 my-2 bg-black/5 italic rounded-r text-black/80">$1</blockquote>');

  // Bullet points (*, -, •, +) including indented sub-bullets
  html = html.replace(/^( *)([•*+\-]) (.*$)/gm, (match, indent, symbol, content) => {
    const spaceCount = indent.length;
    const marginClass = spaceCount >= 4 ? 'ml-8 list-circle' : spaceCount >= 2 ? 'ml-6 list-disc' : 'ml-4 list-disc';
    return `<li class="${marginClass} my-1 leading-relaxed">${content}</li>`;
  });

  // Numbered lists (1., 2., etc.)
  html = html.replace(/^( *)(\d+)\. (.*$)/gm, (match, indent, num, content) => {
    const spaceCount = indent.length;
    const marginClass = spaceCount >= 2 ? 'ml-8 list-decimal' : 'ml-4 list-decimal';
    return `<li class="${marginClass} my-1 leading-relaxed">${content}</li>`;
  });

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-black/10 text-[var(--accent-main)] px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');

  // Horizontal rules
  html = html.replace(/^[-*━_]{3,}$/gm, '<hr class="border-black/10 my-3" />');

  // Paragraph breaks & newlines
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');

  return html;
}

const CONTEXT_OPTIONS = [
  { id: "calendar", label: "Calendar", icon: Calendar, desc: "Today's events" },
  { id: "expenses", label: "Expenses", icon: Receipt, desc: "Pending expenses" },
  { id: "notes", label: "Notes", icon: FileText, desc: "Mission notes" },
];

const PROMPT_CATEGORIES = [
  { id: "ahmadiyyat", label: "Ahmadiyyat", icon: BookOpen, color: "text-emerald-400" },
  { id: "admin", label: "Admin", icon: PenTool, color: "text-blue-400" },
  { id: "writing", label: "Writing", icon: MessageSquare, color: "text-purple-400" },
  { id: "islamic", label: "Islamic", icon: Globe, color: "text-amber-400" },
];


const HoverMarquee = ({ text, className }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [shiftX, setShiftX] = useState(0);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const diff = textRef.current.scrollWidth - containerRef.current.clientWidth;
      setIsOverflowing(diff > 0);
      setShiftX(diff > 0 ? diff + 20 : 0);
    }
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={`overflow-hidden whitespace-nowrap group/marquee ${className || ''}`}
    >
      <div 
        ref={textRef} 
        className="inline-block transition-transform duration-[3000ms] ease-linear"
        style={{ transform: 'translateX(0px)' }}
        onMouseEnter={(e) => { if (isOverflowing) e.currentTarget.style.transform = `translateX(-${shiftX}px)`; }}
        onMouseLeave={(e) => { if (isOverflowing) e.currentTarget.style.transform = 'translateX(0px)'; }}
      >
        {text}
      </div>
    </div>
  );
};



export default function MurabbiAIPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ahmadiyyat");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeContexts, setActiveContexts] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const toggleVoiceTyping = () => {
    if (typeof window === "undefined") return;

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice typing is not supported in this browser environment.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          }
        }
        if (finalTranscript) {
          setInput(prev => (prev ? (prev.endsWith(" ") ? prev : prev + " ") + finalTranscript.trim() : finalTranscript.trim()));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const processFile = async (file: File): Promise<Attachment | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64Data = dataUrl.split(",")[1] || "";
        resolve({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: file.type.startsWith("image/") ? "image" : file.type.includes("pdf") ? "pdf" : file.type.startsWith("audio/") ? "audio" : "doc",
          mimeType: file.type || "application/octet-stream",
          data: base64Data,
          previewUrl: file.type.startsWith("image/") ? dataUrl : undefined
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newAtts: Attachment[] = [];
    for (const f of files) {
      const att = await processFile(f);
      if (att) newAtts.push(att);
    }
    setPendingAttachments(prev => [...prev, ...newAtts]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newAtts: Attachment[] = [];
      for (const f of files) {
        const att = await processFile(f);
        if (att) newAtts.push(att);
      }
      setPendingAttachments(prev => [...prev, ...newAtts]);
    }
  };

  // Load from localStorage
  useEffect(() => {
    try {
      let loadedConvs: Conversation[] = [];
      const saved = localStorage.getItem(STORAGE_KEY);
      
      if (saved) {
        const parsed = JSON.parse(saved);
        loadedConvs = parsed.map((c: any) => ({
          ...c,
          messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
      } else {
        // Migration from old storage
        const oldSaved = localStorage.getItem(OLD_STORAGE_KEY);
        if (oldSaved) {
          const oldMsgs = JSON.parse(oldSaved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
          if (oldMsgs.length > 0) {
            loadedConvs = [{
              id: Date.now().toString(),
              title: oldMsgs.find((m: any) => m.role === "user")?.content.slice(0, 30) || "Previous Chat",
              messages: oldMsgs,
              isTemporary: false,
              updatedAt: Date.now()
            }];
          }
        }
      }
      
      setConversations(loadedConvs);
      if (loadedConvs.length > 0) {
        setCurrentConvId(loadedConvs[0].id);
      } else {
        handleNewChat(false);
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      const toSave = conversations
        .filter(c => !c.isTemporary)
        .map(c => ({
          ...c,
          messages: c.messages.slice(-50).filter(m => !m.isStreaming)
        }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }
  }, [conversations]);

  const currentConversation = conversations.find(c => c.id === currentConvId);
  const messages = currentConversation?.messages || [];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = (isTemporary: boolean) => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: isTemporary ? "Temporary Chat" : "New Chat",
      messages: [],
      isTemporary,
      updatedAt: Date.now()
    };
    setConversations(prev => {
      const filtered = isTemporary ? prev.filter(c => !c.isTemporary) : prev;
      return [newConv, ...filtered];
    });
    setCurrentConvId(newConv.id);
    setApiError(null);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConvId === id) {
      setCurrentConvId(conversations.find(c => c.id !== id)?.id || null);
    }
  };

  const updateCurrentConvMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    setConversations(prev => prev.map(c => {
      if (c.id === currentConvId) {
        const updatedMessages = typeof newMessages === "function" ? newMessages(c.messages) : newMessages;
        const newTitle = c.title === "New Chat" && updatedMessages.length > 0
          ? updatedMessages.find(m => m.role === "user")?.content.split("\n")[0].trim() || "New Chat"
          : c.title;
        return { ...c, messages: updatedMessages, title: newTitle, updatedAt: Date.now() };
      }
      return c;
    }));
  };

  const fetchContext = async (): Promise<string> => {
    if (activeContexts.size === 0) return "";
    const parts: string[] = [];
    const service = await GoogleSyncService.fromLocalStorage();

    if (activeContexts.has("calendar") && service) {
      try {
        const events = await service.getCalendarEvents();
        const today = new Date().toDateString();
        const todayEvents = events.filter((e: any) => {
          const d = new Date(e.start?.dateTime || e.start?.date || "");
          return d.toDateString() === today;
        });
        parts.push(`CALENDAR (Today, ${today}):\n${todayEvents.map((e: any) => `- ${e.summary} at ${new Date(e.start?.dateTime || e.start?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`).join("\n") || "No events today."}`);
      } catch {}
    }

    if (activeContexts.has("expenses")) {
      try {
        const res = await fetch("/api/expenses");
        const data = await res.json();
        const pending = (data.history || []).filter((f: any) => f.isSheet && !f.refunded);
        parts.push(`EXPENSES (Pending):\n${pending.map((e: any) => `- ${e.description || e.category}: £${e.total}`).join("\n") || "No pending expenses."}`);
      } catch {}
    }

    if (activeContexts.has("notes") && service) {
      try {
        const notes = await service.fetchMissionNotes();
        if (notes) parts.push(`MISSION NOTES:\n${notes.replace(/<[^>]+>/g, "").substring(0, 800)}...`);
      } catch {}
    }

    return parts.join("\n\n---\n\n");
  };

  const sendMessage = useCallback(async (overrideContent?: string) => {
    const content = (overrideContent ?? input).trim();
    const hasAtts = pendingAttachments.length > 0;
    if ((!content && !hasAtts) || isLoading || !currentConvId) return;

    const currentAtts = [...pendingAttachments];
    setPendingAttachments([]);
    setInput("");
    setApiError(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      attachments: currentAtts.length > 0 ? currentAtts : undefined
    };
    updateCurrentConvMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = { id: aiMsgId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true };
    updateCurrentConvMessages(prev => [...prev, aiMsg]);

    const context = await fetchContext();
    const historyForApi = [...messages, userMsg].slice(-20).map(m => ({
      role: m.role,
      content: m.content,
      attachments: m.attachments ? m.attachments.map(a => ({ mimeType: a.mimeType, data: a.data, name: a.name })) : undefined
    }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi, context }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "API error");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                updateCurrentConvMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: accumulated } : m));
              }
            } catch {}
          }
        }
      }

      updateCurrentConvMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
    } catch (err: any) {
      if (err.name !== "AbortError") {
        const errorMsg = err.message || "Something went wrong";
        setApiError(errorMsg);
        updateCurrentConvMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: `Error: ${errorMsg}`, isStreaming: false } : m));
      } else {
        updateCurrentConvMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, activeContexts, currentConvId, pendingAttachments]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); sendMessage(); }
    else if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stopGeneration = () => { abortRef.current?.abort(); setIsLoading(false); };

  const toggleContext = (id: string) => {
    setActiveContexts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const prompts = QUICK_PROMPTS[activeCategory as keyof typeof QUICK_PROMPTS] || [];

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-transparent">
      
      {/* ── LEFT PANEL (CONVERSATIONS) ── */}
      <div className="hidden lg:flex w-[240px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20">
        <div className="px-5 pt-8 pb-4 border-b border-white/5">
          <h1 className="text-3xl font-black italic tracking-tighter text-black uppercase leading-none">MurabbiAI</h1>
        </div>
        
        <div className="p-3 border-b border-white/5 flex flex-col gap-2">
          <button 
            onClick={() => handleNewChat(false)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-md hover:opacity-90"
            style={{ background: 'var(--accent-main)' }}
          >
            <Plus size={14} /> New Chat
          </button>
          <button 
            onClick={() => handleNewChat(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black/60 transition-all active:scale-95 border border-black/10 hover:bg-[var(--accent-soft)] hover:text-[var(--accent-main)] hover:border-[var(--accent-main)]/30"
          >
            <Ghost size={14} /> Temporary Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {conversations.map(conv => (
            <div key={conv.id} className="relative group">
              <button
                onClick={() => setCurrentConvId(conv.id)}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-3 rounded-xl text-left transition-all",
                  currentConvId === conv.id 
                    ? "bg-black/10 font-bold text-black" 
                    : "text-black/50 hover:bg-black/5 hover:text-black/80"
                )}
              >
                <MessageSquare size={13} className={clsx("shrink-0", conv.isTemporary && "text-[var(--accent-main)]")} />
                <div className="flex-1 min-w-0">
                  <HoverMarquee text={conv.title} className="text-xs w-full block" />
                  <p className="text-[9px] uppercase tracking-widest opacity-60">
                    {new Date(conv.updatedAt).toLocaleDateString()} {conv.isTemporary && "(Temp)"}
                  </p>
                </div>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                className={clsx(
                  "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-red-500/70 hover:text-red-600 hover:bg-red-500/10 transition-all",
                  currentConvId === conv.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                title="Delete Chat"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="text-center p-4 text-[10px] font-bold text-black/30 uppercase tracking-widest">
              No conversations
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-8 pt-4 lg:pt-8 pb-3 lg:pb-4 shrink-0 relative z-10 border-b border-white/5 lg:border-none">
          <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0 overflow-hidden pr-4">
            <div className="flex-1 min-w-0 overflow-hidden">
              <HoverMarquee text={currentConversation?.title || ""} className="text-xl lg:text-2xl font-black italic tracking-tighter text-black uppercase block" />
              {(isLoading || currentConversation?.isTemporary) && (
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--accent-main)]/80">
                  {isLoading ? "Generating..." : "Temporary Chat"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={() => setIsPanelOpen(p => !p)} className="flex items-center gap-2 px-2.5 lg:px-3 py-2 rounded-xl glass border border-white/10 text-black/40 hover:text-black hover:border-[var(--accent-main)]/30 transition-all text-xs font-black">
              {isPanelOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              <span className="hidden sm:inline">{isPanelOpen ? "Hide" : "Prompts"}</span>
            </button>
          </div>
        </div>


        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 lg:px-8 pb-4 space-y-4 lg:space-y-6 relative z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 select-none">
              <div className="w-24 h-24 rounded-full border flex items-center justify-center mb-6 shadow-2xl" style={{ background: 'var(--accent-soft)', borderColor: 'rgba(var(--accent-rgb, 16, 185, 129), 0.25)' }}>
                <Sparkles size={40} style={{ color: 'var(--accent-main)' }} />
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter text-black/20 uppercase mb-2">MurabbiAI</h2>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/15 max-w-xs">
                Your AI assistant for Ahmadiyyat, mission work, and Murabbi Desk
              </p>
              <div className="mt-10 grid grid-cols-2 gap-3 max-w-md w-full">
                {[
                  "What are the duties of a Murabbi?",
                  "Help me prepare a Friday Khutba",
                  "Explain Khilafat-e-Ahmadiyya",
                  "Draft a Tabligh follow-up letter",
                ].map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="p-4 rounded-2xl glass border border-white/5 text-left hover:border-[var(--accent-main)]/30 hover:bg-[var(--accent-soft)] transition-all group">
                    <p className="text-[11px] font-bold text-black/30 group-hover:text-black/60 transition-colors leading-relaxed">{s}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={clsx("flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                {/* Bubble */}
                <div className={clsx("flex flex-col gap-1 max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={clsx(
                    "px-5 py-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "text-white rounded-tr-sm"
                      : "glass border border-white/10 text-black/90 rounded-tl-sm"
                  )}
                  style={msg.role === "user" ? { background: 'var(--accent-main)' } : {}}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose max-w-none text-sm leading-relaxed text-black"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : msg.content}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.attachments.map(att => (
                          <div key={att.id} className="flex flex-col gap-1">
                            {att.previewUrl ? (
                              <img src={att.previewUrl} alt={att.name} className="max-w-[240px] max-h-[180px] rounded-xl border border-white/20 object-cover shadow-sm" />
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/10 border border-white/20 text-xs font-bold">
                                <FileText size={14} className="shrink-0" />
                                <span className="truncate max-w-[160px]">{att.name}</span>
                                <span className="text-[9px] opacity-70 font-normal">{formatBytes(att.size)}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.isStreaming && (
                      <span className="inline-flex gap-1 ml-2 align-middle">
                        {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/20">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {msg.role === "assistant" && !msg.isStreaming && msg.content && (
                      <button onClick={() => copyMessage(msg.id, msg.content)} className="text-black/20 hover:text-black/50 transition-colors">
                        {copiedId === msg.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 lg:px-8 pb-4 lg:pb-6 pt-3 lg:pt-4 shrink-0 relative z-10">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept="image/*,application/pdf,text/*,.doc,.docx,.csv,.json,.md,.mp3,.wav,.m4a"
          />
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={clsx(
              "relative glass rounded-2xl border transition-all overflow-hidden",
              isDragging ? "border-[var(--accent-main)] bg-[var(--accent-soft)]/20" : "border-white/10 focus-within:border-[var(--accent-main)]/40"
            )}
          >
            {pendingAttachments.length > 0 && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-2 overflow-x-auto custom-scrollbar border-b border-black/5">
                {pendingAttachments.map(att => (
                  <div key={att.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/5 border border-black/10 text-xs shrink-0 max-w-[200px]">
                    {att.previewUrl ? (
                      <img src={att.previewUrl} alt={att.name} className="w-6 h-6 rounded object-cover shrink-0" />
                    ) : (
                      <FileText size={14} className="text-[var(--accent-main)] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-black truncate">{att.name}</p>
                      <p className="text-[9px] text-black/40">{formatBytes(att.size)}</p>
                    </div>
                    <button type="button" onClick={() => removeAttachment(att.id)} className="p-0.5 rounded hover:bg-black/10 text-black/40 hover:text-black">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {activeContexts.size > 0 && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1 border-b border-white/5">
                {Array.from(activeContexts).map(id => {
                  const opt = CONTEXT_OPTIONS.find(o => o.id === id);
                  return opt ? (
                    <span key={id} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-main)]/30 text-[9px] font-black text-[var(--accent-main)] uppercase tracking-widest">
                      <opt.icon size={9} /> {opt.label}
                      <button onClick={() => toggleContext(id)} className="ml-0.5 text-[var(--accent-main)]/60 hover:text-[var(--accent-main)]"><X size={8} /></button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isDragging ? "Drop files here to attach..." : "Ask about Ahmadiyyat, Murabbi duties, draft documents... (Enter to send)"}
              rows={2}
              className="w-full bg-transparent px-5 pt-4 pb-2 text-sm font-medium text-black placeholder:text-black/50 resize-none focus:outline-none custom-scrollbar"
              style={{ maxHeight: "120px" }}
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-black/40 hover:text-[var(--accent-main)] hover:bg-[var(--accent-soft)] transition-all"
                  title="Attach File (Images, PDFs, Audio, Documents)"
                >
                  <Paperclip size={16} />
                </button>
                <button
                  type="button"
                  onClick={toggleVoiceTyping}
                  className={clsx(
                    "p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold",
                    isListening
                      ? "bg-red-500/15 border border-red-500/30 text-red-500 animate-pulse"
                      : "text-black/40 hover:text-[var(--accent-main)] hover:bg-[var(--accent-soft)]"
                  )}
                  title={isListening ? "Stop Voice Typing" : "Voice Typing"}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  {isListening && <span className="text-[10px] font-black uppercase tracking-wider text-red-500">Listening...</span>}
                </button>
              </div>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <button onClick={stopGeneration} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-black transition-all hover:bg-red-600/20">
                    <Loader2 size={12} className="animate-spin" /> Stop
                  </button>
                ) : (
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() && pendingAttachments.length === 0}
                    className={clsx(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md",
                      (!input.trim() && pendingAttachments.length === 0)
                        ? "bg-black/5 text-black/20 cursor-not-allowed"
                        : "text-white ai-send-button"
                    )}
                  >
                    <Send size={12} className={clsx((input.trim() || pendingAttachments.length > 0) && "animate-pulse")} /> Send
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={clsx(
        "min-h-0 glass border-l border-white/5 flex flex-col shrink-0 transition-all duration-500 overflow-hidden",
        "fixed lg:relative right-0 top-0 h-full z-[200] lg:z-auto shadow-2xl lg:shadow-none",
        isPanelOpen ? "w-[280px] lg:w-[300px] opacity-100" : "w-0 opacity-0 pointer-events-none"
      )}>
        <div className="px-5 pt-8 pb-4 border-b border-white/5 shrink-0">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Mission Prompts</h3>
        </div>

        {/* Category tabs */}
        <div className="flex flex-col gap-0.5 p-3 border-b border-white/5 shrink-0">
          {PROMPT_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                activeCategory === cat.id ? "bg-black/5 border border-black/10" : "hover:bg-black/5"
              )}>
              <cat.icon size={14} className={clsx(cat.color, activeCategory === cat.id ? "opacity-100" : "opacity-40")} />
              <span className={clsx("text-[11px] font-black uppercase tracking-widest transition-colors", activeCategory === cat.id ? "text-black" : "text-black/30")}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Prompt chips */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {prompts.map((p, i) => (
            <button key={i} onClick={() => sendMessage(p.prompt)} disabled={isLoading}
              className="w-full text-left p-3 rounded-xl bg-black/[0.02] border border-black/5 hover:border-[var(--accent-main)]/30 hover:bg-[var(--accent-soft)] transition-all group disabled:opacity-40 disabled:cursor-not-allowed">
              <p className="text-[11px] font-bold text-black/50 group-hover:text-[var(--accent-main)] transition-colors leading-relaxed">{p.label}</p>
            </button>
          ))}
        </div>

        {/* Context Attach */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/25 mb-3">Attach App Data</p>
          <div className="space-y-2">
            {CONTEXT_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => toggleContext(opt.id)}
                className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left",
                  activeContexts.has(opt.id) ? "bg-[var(--accent-soft)] border-[var(--accent-main)]/40 text-[var(--accent-main)] font-bold" : "border-black/5 bg-black/[0.02] text-black/50 hover:text-black/80 hover:border-black/10"
                )}>
                <opt.icon size={13} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-widest">{opt.label}</div>
                  <div className="text-[9px] opacity-60">{opt.desc}</div>
                </div>
                {activeContexts.has(opt.id) && <Check size={12} className="text-[var(--accent-main)] shrink-0" />}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-black/30 mt-3 leading-relaxed">Selected data will be sent with your next message.</p>
        </div>
      </div>
    </div>
  );
}
