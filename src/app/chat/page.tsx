"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, Send, Trash2, ChevronRight, ChevronLeft,
  Calendar, Receipt, FileText, Copy, Check, BookOpen,
  PenTool, MessageSquare, Globe, Loader2, AlertCircle, X
} from "lucide-react";
import { clsx } from "clsx";
import { QUICK_PROMPTS } from "@/lib/murrabiAI-system";
import { GoogleSyncService } from "@/lib/google-sync-service";
import Noise from "@/components/ui/Noise";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const STORAGE_KEY = "murrabi_ai_chat_v1";

// Simple markdown renderer
function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-black uppercase tracking-widest mt-4 mb-2 text-accent-main">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-base font-black mt-5 mb-2 text-white">$1</h2>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/`(.*?)`/g, '<code class="bg-black/40 px-1.5 py-0.5 rounded text-red-400 text-xs font-mono">$1</code>')
    .replace(/━+/g, '<hr class="border-white/10 my-3" />')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>');
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

export default function MurrabiAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ahmadiyyat");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeContexts, setActiveContexts] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const toSave = messages.slice(-50).filter(m => !m.isStreaming);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    if (!content || isLoading) return;

    setInput("");
    setApiError(null);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = { id: aiMsgId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true };
    setMessages(prev => [...prev, aiMsg]);

    const context = await fetchContext();
    const historyForApi = [...messages, userMsg].slice(-20).map(m => ({ role: m.role, content: m.content }));

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
        if (err.fallback) {
          setHasKey(false);
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: "⚠️ MurrabiAI requires a Google AI API key. Please add `GOOGLE_AI_API_KEY` to your `.env.local` file — get it free from [aistudio.google.com](https://aistudio.google.com). Then restart the dev server.", isStreaming: false } : m));
        } else {
          throw new Error(err.error || "API error");
        }
        setIsLoading(false);
        return;
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
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: accumulated } : m));
              }
            } catch {}
          }
        }
      }

      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
    } catch (err: any) {
      if (err.name !== "AbortError") {
        const errorMsg = err.message || "Something went wrong";
        setApiError(errorMsg);
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: `Error: ${errorMsg}`, isStreaming: false } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, activeContexts]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); sendMessage(); }
    else if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => { setMessages([]); localStorage.removeItem(STORAGE_KEY); setApiError(null); };

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
    <div className="flex h-full w-full overflow-hidden">
      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Noise Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div style={{ width: '1080px', height: '1080px', position: 'relative' }}>
            <Noise
              patternSize={25}
              patternScaleX={0.9}
              patternScaleY={0.9}
              patternRefreshInterval={8}
              patternAlpha={25}
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-8 pt-4 lg:pt-8 pb-3 lg:pb-4 shrink-0 relative z-10">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="relative">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/40">
                <Sparkles size={20} className={clsx("text-white transition-all", isLoading && "animate-pulse")} />
              </div>
              <span className={clsx("absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#020310] transition-colors", isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-500")} />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-black italic tracking-tighter text-white uppercase">MurrabiAI</h1>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-500/60">
                {isLoading ? "Generating..." : "Ahmadiyya Intelligence Protocol"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            {messages.length > 0 && (
              <button onClick={clearChat} className="p-2 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-600/10 transition-all" title="Clear conversation">
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={() => setIsPanelOpen(p => !p)} className="flex items-center gap-2 px-2.5 lg:px-3 py-2 rounded-xl glass border border-white/10 text-white/40 hover:text-white transition-all text-xs font-black">
              {isPanelOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              <span className="hidden sm:inline">{isPanelOpen ? "Hide" : "Prompts"}</span>
            </button>
          </div>
        </div>

        {/* API Key Warning */}
        {!hasKey && (
          <div className="mx-8 mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-black text-amber-400">API Key Required</p>
              <p className="text-[11px] text-amber-400/70 mt-1">Add <code className="bg-black/30 px-1 rounded">GOOGLE_AI_API_KEY</code> to your <code className="bg-black/30 px-1 rounded">.env.local</code> — get it free at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="underline">aistudio.google.com</a></p>
            </div>
            <button onClick={() => setHasKey(true)} className="ml-auto text-amber-400/40 hover:text-amber-400"><X size={14} /></button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 lg:px-8 pb-4 space-y-4 lg:space-y-6 relative z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 select-none">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600/20 to-red-900/5 border border-red-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-red-900/20">
                <Sparkles size={40} className="text-red-500/60" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter text-white/20 uppercase mb-2">Bismillah</h2>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/15 max-w-xs">
                Your AI assistant for Ahmadiyyat, mission work, and Murrabi Desk
              </p>
              <div className="mt-10 grid grid-cols-2 gap-3 max-w-md w-full">
                {[
                  "What are the duties of a Murrabi?",
                  "Help me prepare a Friday Khutba",
                  "Explain Khilafat-e-Ahmadiyya",
                  "Draft a Tabligh follow-up letter",
                ].map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="p-4 rounded-2xl glass border border-white/5 text-left hover:border-red-500/20 hover:bg-red-600/5 transition-all group">
                    <p className="text-[11px] font-bold text-white/30 group-hover:text-white/60 transition-colors leading-relaxed">{s}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={clsx("flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                {/* Avatar */}
                <div className={clsx("w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-black mt-1",
                  msg.role === "assistant" ? "bg-gradient-to-br from-red-600 to-red-900" : "bg-white/10 border border-white/10"
                )}>
                  {msg.role === "assistant" ? <Sparkles size={14} className={clsx(msg.isStreaming && "animate-pulse")} /> : "M"}
                </div>

                {/* Bubble */}
                <div className={clsx("flex flex-col gap-1 max-w-[78%]", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={clsx(
                    "px-5 py-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-red-600 text-white rounded-tr-sm"
                      : "glass border border-white/10 text-white/90 rounded-tl-sm"
                  )}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(msg.content)}</p>` }}
                      />
                    ) : msg.content}
                    {msg.isStreaming && (
                      <span className="inline-flex gap-1 ml-2 align-middle">
                        {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {msg.role === "assistant" && !msg.isStreaming && msg.content && (
                      <button onClick={() => copyMessage(msg.id, msg.content)} className="text-white/20 hover:text-white/50 transition-colors">
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
          <div className="relative glass rounded-2xl border border-white/10 overflow-hidden focus-within:border-red-500/30 transition-all">
            {activeContexts.size > 0 && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-1 border-b border-white/5">
                {Array.from(activeContexts).map(id => {
                  const opt = CONTEXT_OPTIONS.find(o => o.id === id);
                  return opt ? (
                    <span key={id} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/15 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-widest">
                      <opt.icon size={9} /> {opt.label}
                      <button onClick={() => toggleContext(id)} className="ml-0.5 text-red-400/50 hover:text-red-400"><X size={8} /></button>
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
              placeholder="Ask about Ahmadiyyat, Murrabi duties, draft documents... (Enter to send)"
              rows={2}
              className="w-full bg-transparent px-5 pt-4 pb-2 text-sm font-medium text-white/90 placeholder:text-white/20 resize-none focus:outline-none custom-scrollbar"
              style={{ maxHeight: "120px" }}
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/15">⌘ + Enter to send</span>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <button onClick={stopGeneration} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-black transition-all hover:bg-red-600/30">
                    <Loader2 size={12} className="animate-spin" /> Stop
                  </button>
                ) : (
                  <button onClick={() => sendMessage()} disabled={!input.trim()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 disabled:bg-white/5 disabled:text-white/20 text-white text-xs font-black transition-all hover:bg-red-700 active:scale-95 shadow-lg shadow-red-900/30">
                    <Send size={12} /> Send
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
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Mission Prompts</h3>
        </div>

        {/* Category tabs */}
        <div className="flex flex-col gap-0.5 p-3 border-b border-white/5 shrink-0">
          {PROMPT_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                activeCategory === cat.id ? "bg-white/5 border border-white/10" : "hover:bg-white/3"
              )}>
              <cat.icon size={14} className={clsx(cat.color, activeCategory === cat.id ? "opacity-100" : "opacity-40")} />
              <span className={clsx("text-[11px] font-black uppercase tracking-widest transition-colors", activeCategory === cat.id ? "text-white" : "text-white/30")}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Prompt chips */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {prompts.map((p, i) => (
            <button key={i} onClick={() => sendMessage(p.prompt)} disabled={isLoading}
              className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-red-500/20 hover:bg-red-600/5 transition-all group disabled:opacity-40 disabled:cursor-not-allowed">
              <p className="text-[11px] font-bold text-white/50 group-hover:text-white/80 transition-colors leading-relaxed">{p.label}</p>
            </button>
          ))}
        </div>

        {/* Context Attach */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-3">Attach App Data</p>
          <div className="space-y-2">
            {CONTEXT_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => toggleContext(opt.id)}
                className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left",
                  activeContexts.has(opt.id) ? "bg-red-600/10 border-red-500/30 text-red-400" : "border-white/5 bg-white/[0.02] text-white/30 hover:text-white/60 hover:border-white/10"
                )}>
                <opt.icon size={13} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-widest">{opt.label}</div>
                  <div className="text-[9px] opacity-60">{opt.desc}</div>
                </div>
                {activeContexts.has(opt.id) && <Check size={12} className="text-red-400 shrink-0" />}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-white/15 mt-3 leading-relaxed">Selected data will be sent with your next message.</p>
        </div>
      </div>
    </div>
  );
}
