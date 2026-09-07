"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Youtube,
  Download,
  Music,
  Video,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Clock,
  ThumbsUp,
  Eye,
  CheckCircle2,
  Activity,
  Terminal as TerminalIcon,
  Globe,
  Code,
  FileText,
  ChevronRight,
  Zap,
  Cpu,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Command,
  Shield,
  Box,
  CornerDownLeft,
  Send,
  Trash2,
  Play,
  ScanText,
  QrCode as QrCodeIcon
} from "lucide-react";
import { clsx } from "clsx";
import { QRCodeSVG } from 'qrcode.react';

type BetaTab = 'overview' | 'ai-chat' | 'yt-dlp' | 'scraper' | 'ocr';

const Sparkles = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

export default function BetaToolsPage() {
  const [activeTab, setActiveTab] = useState<BetaTab>('overview');

  // YT-DLP State
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Scrapy State
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeData, setScrapeData] = useState<any>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  // OCR State
  const [ocrSessionId, setOcrSessionId] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'waiting' | 'processing' | 'completed' | 'error'>('idle');
  const [ocrResultText, setOcrResultText] = useState<string | null>(null);

  // AI Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiModel, setAiModel] = useState<'gemini' | 'nemotron'>('gemini');
  const recognitionRef = useRef<any>(null);

  // Terminal State
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM] Murabbi Experimental Protocol Initialized...",
    "[SECURE] Lab Environment: Operational",
    "[STATUS] Waiting for user command..."
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setChatInput(transcript);
          setIsListening(false);
          addTerminalLog(`[AUDIO] Voice input detected: "${transcript}"`);
          // Automatically submit after speaking
          setTimeout(() => {
             const form = document.getElementById('chat-form');
             if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }, 500);
        };

        recognitionRef.current.onerror = (event: any) => {
          addTerminalLog(`[ERROR] Microphone error: ${event.error}`);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Select a better voice
      const voices = window.speechSynthesis.getVoices();
      // Try to find a premium/natural sounding English voice
      const preferredVoice = voices.find(v => 
        v.name.includes('Google US English') || 
        v.name.includes('Samantha') || 
        v.name.includes('Daniel') || 
        (v.lang.startsWith('en-') && !v.localService)
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playRawPcmAudio = (base64Pcm: string) => {
    try {
      const binaryString = atob(base64Pcm);
      const len = binaryString.length;
      const bytes = new Int16Array(len / 2);
      const dataView = new DataView(new ArrayBuffer(len));
      for (let i = 0; i < len; i++) {
        dataView.setUint8(i, binaryString.charCodeAt(i));
      }
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = dataView.getInt16(i * 2, true); // Little endian
      }

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = audioCtx.createBuffer(1, bytes.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < bytes.length; i++) {
        channelData[i] = bytes[i] / 32768.0;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      
      setIsSpeaking(true);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (e) {
      console.error("[PCM Audio] Error playing Gemini native audio:", e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      addTerminalLog("[AUDIO] Microphone turned off.");
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          addTerminalLog("[AUDIO] Listening for voice input...");
        } catch (e) {
          addTerminalLog("[ERROR] Microphone access denied or already listening.");
        }
      } else {
        addTerminalLog("[ERROR] Speech Recognition API not supported in this browser.");
      }
    }
  };

  const fetchVideoInfo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);
    setDownloadSuccess(false);

    try {
      const res = await fetch("/api/yt-dlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const result = await res.json();
      if (result.success) {
        setVideoInfo(result.data);
        addTerminalLog(`[yt-dlp] Inspection successful: ${result.data.title}`);
      } else {
        setError(result.error || "Failed to fetch video information.");
        addTerminalLog(`[ERROR] yt-dlp: ${result.error || "Inspection failed"}`);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'video' | 'audio') => {
    if (!videoInfo) return;
    setDownloading(true);
    addTerminalLog(`[yt-dlp] Initializing ${format} extraction sequence...`);

    try {
      window.location.href = `/api/yt-dlp?url=${encodeURIComponent(url)}&type=${format}`;
      setTimeout(() => {
        setDownloading(false);
        setDownloadSuccess(true);
        addTerminalLog(`[yt-dlp] ${format} extraction sequence completed.`);
      }, 3000);
    } catch (err) {
      setError("Failed to initialize download sequence.");
      setDownloading(false);
    }
  };

  const handleScrape = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scrapeUrl) return;

    setScrapeLoading(true);
    setScrapeError(null);
    setScrapeData(null);
    addTerminalLog(`[SCRAPY] Dispatching crawler to: ${scrapeUrl}`);

    try {
      const res = await fetch("/api/scrapy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl }),
      });

      const result = await res.json();
      if (result.success) {
        setScrapeData(result.data);
        addTerminalLog(`[SCRAPY] Data extraction successful. Nodes found: ${result.data.links_count}`);
      } else {
        setScrapeError(result.error || "Extraction failed. Check if Scrapy is installed.");
        addTerminalLog(`[ERROR] Scrapy: ${result.error || "Crawler failure"}`);
      }
    } catch (err) {
      setScrapeError("Extraction protocol error.");
    } finally {
      setScrapeLoading(false);
    }
  };

  const addTerminalLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setTerminalLogs(prev => [...prev, `[${timestamp}] ${log}`]);
  };

  const generateOcrSession = async () => {
    setOcrStatus('idle');
    setOcrResultText(null);
    addTerminalLog(`[OCR] Initializing new session sequence...`);
    try {
      const res = await fetch('/api/ocr/create-session', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setOcrSessionId(data.sessionId);
        setOcrStatus('waiting');
        addTerminalLog(`[OCR] Session ${data.sessionId} initialized. Awaiting mobile scan.`);
      }
    } catch (e) {
      addTerminalLog(`[ERROR] Failed to initialize OCR session`);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (ocrSessionId && (ocrStatus === 'waiting' || ocrStatus === 'processing')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/ocr/${ocrSessionId}/status`);
          const data = await res.json();
          if (data.success) {
            if (data.status !== ocrStatus) {
              setOcrStatus(data.status);
              addTerminalLog(`[OCR] Status update: ${data.status.toUpperCase()}`);
            }
            if (data.status === 'completed') {
              setOcrResultText(data.textResult);
              addTerminalLog(`[OCR] Extraction successful. Length: ${data.textResult.length} chars`);
            } else if (data.status === 'error') {
              setOcrResultText(data.textResult);
            }
          }
        } catch (e) {
          // ignore
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [ocrSessionId, ocrStatus]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    addTerminalLog(`$ ${terminalInput}`);
    
    if (cmd === 'clear') {
      setTerminalLogs(["[SYSTEM] Terminal Cleared."]);
    } else if (cmd === 'help') {
      addTerminalLog("Available Commands: clear, help, status, reload, ping");
    } else if (cmd === 'status') {
      addTerminalLog("[STATUS] All engines operational. Pulse: 99.2%");
    } else {
      addTerminalLog(`[UNKNOWN] Command not recognized: ${cmd}`);
    }
    
    setTerminalInput("");
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/beta/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiModel, messages: [...chatMessages, { role: 'user', content: userMsg }] })
      });
      const data = await res.json();
      
      if (data.text) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        addTerminalLog(`[NEURAL] Processed query: ${userMsg.substring(0, 20)}...`);

        if (data.audioBase64) {
          playRawPcmAudio(data.audioBase64);
        } else {
          speakText(data.text);
        }
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "[ERROR] " + (data.error || "Unknown error") }]);
        addTerminalLog(`[ERROR] Neural Engine: ${data.error || "Unknown error"}`);
      }
      setIsChatLoading(false);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "[ERROR] Connection failed" }]);
      addTerminalLog(`[ERROR] Neural Engine connection failed`);
      setIsChatLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Lab Overview', icon: LayoutDashboard, color: 'text-blue-500', desc: 'System Diagnostic' },
    { id: 'ai-chat', label: 'Neural Engine', icon: Sparkles, color: 'text-purple-500', desc: 'MurabbiAI Beta' },
    { id: 'yt-dlp', label: 'Media Extraction', icon: Youtube, color: 'text-red-600', desc: 'yt-dlp Engine' },
    { id: 'scraper', label: 'Web Crawler', icon: Globe, color: 'text-emerald-600', desc: 'Scrapy Module' },
    { id: 'ocr', label: 'OCR Scanner', icon: ScanText, color: 'text-amber-500', desc: 'Mobile Link' }
  ];

  return (
    <div className="main-content flex h-screen overflow-hidden p-0">
      {/* SECONDARY SIDEBAR (Standard Theme) */}
      <div className="w-[240px] glass bg-black/20 border-r border-white/5 flex flex-col h-full shrink-0 z-20">
        <div className="px-6 pt-14 pb-5 border-b border-white/5">
          <h2 className="text-lg font-black tracking-tighter text-[var(--foreground)]">Beta Lab</h2>
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)]/60 mt-0.5">Experimental Protocol</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as BetaTab)}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group",
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent-main)]"
                    : "text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={16} className={clsx("shrink-0", active ? "text-[var(--accent-main)]" : tab.color)} />
                <div className="flex-1 min-w-0">
                  <div className={clsx("text-xs font-black truncate", active ? "text-[var(--accent-main)]" : "text-[var(--foreground)]")}>
                    {tab.label}
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-widest truncate text-[var(--text-dim)]">{tab.desc}</div>
                </div>
                <ChevronRight 
                  size={12} 
                  className={clsx(
                    "shrink-0 transition-all duration-300",
                    active ? "opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" : "opacity-0"
                  )} 
                />
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="p-4 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-[var(--accent-main)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)]">Pulse</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-black text-[var(--accent-main)]">99.2%</span>
              <Activity size={14} className="text-[var(--accent-main)] opacity-50 mb-1" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-10 animate-in fade-in slide-in-from-right-4 duration-500 relative">
        {activeTab === 'overview' && (
          <div className="space-y-12 max-w-5xl">
            <div>
              <h2 className="text-5xl font-black tracking-tighter mb-4" style={{ color: 'var(--foreground)' }}>Lab Overview</h2>
              <p className="text-sm font-medium opacity-40 max-w-2xl leading-relaxed">
                Welcome to the Murabbi Experimental Infrastructure. Here we deploy and test new extraction engines, 
                diagnostic tools, and automated scrapers before they are promoted to the core OS protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Neural Engine', val: 'Active', icon: Cpu, col: 'blue' },
                { title: 'Data Pipeline', val: 'Optimal', icon: Layers, col: 'emerald' },
                { title: 'API Gateway', val: 'Synchronized', icon: Globe, col: 'purple' }
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 border border-white/5 bg-white/5 rounded-3xl flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl bg-${stat.col}-500/10 flex items-center justify-center text-${stat.col}-500`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.title}</h4>
                    <p className="text-xl font-black tracking-tight">{stat.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-10 border border-white/5 bg-white/5 rounded-[40px] relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tight mb-4">Development Protocol</h3>
                <div className="space-y-4">
                  {[
                    'Phase 1: Feature sandbox and local environment testing.',
                    'Phase 2: Performance profiling and memory leak analysis.',
                    'Phase 3: Integration with Murabbi Core and Global Context.',
                    'Phase 4: Public release and documentation deployment.'
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black">{i+1}</div>
                      <p className="text-sm font-bold tracking-tight">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              <TerminalIcon size={200} className="absolute -bottom-12 -right-12 opacity-[0.02] transform rotate-12" />
            </div>
          </div>
        )}

        {activeTab === 'ai-chat' && (
          <div className="h-full flex flex-col max-w-4xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">Neural Engine</h2>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-500 text-[8px] font-black uppercase tracking-widest">Protocol V4</span>
                  <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">LLM Sandbox environment</span>
                </div>
              </div>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setAiModel('gemini')}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                    aiModel === 'gemini' ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                  )}
                >
                  Gemini
                </button>
                <button
                  onClick={() => setAiModel('nemotron')}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                    aiModel === 'nemotron' ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                  )}
                >
                  Nemotron
                </button>
              </div>
            </div>

            <div className="flex-1 glass-card border border-white/5 bg-white/5 rounded-[32px] overflow-hidden flex flex-col mb-6">
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <Sparkles size={48} className="mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest italic">Awaiting Input Signal</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className={clsx(
                      "flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <div className={clsx(
                        "max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-[var(--accent-main)] text-white rounded-br-none" 
                          : "bg-white/5 border border-white/10 text-[var(--foreground)] rounded-bl-none"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-30">
                        {msg.role === 'user' ? "Tactical Operator" : "Neural Unit 01"}
                      </span>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex items-start gap-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-bl-none">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 flex flex-col gap-4">
                <form id="chat-form" onSubmit={handleChatSubmit} className="relative flex gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={clsx(
                      "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                      isListening ? "bg-red-500 animate-pulse text-white" : "bg-white/5 hover:bg-white/10 text-white/50"
                    )}
                  >
                    <div className={clsx("w-3 h-3 rounded-full", isListening ? "bg-white" : "bg-red-500")}></div>
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={isListening ? "Listening..." : "Input mission query (or press Mic to talk)..."}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 placeholder:opacity-20 focus:outline-none focus:border-purple-500/50 transition-all font-bold text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:opacity-20 text-white rounded-xl flex items-center justify-center transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
                {isSpeaking && (
                  <div className="flex items-center justify-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                    <Activity size={14} /> Agent Speaking
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'yt-dlp' && (
          <div className="grid grid-cols-12 gap-10 max-w-6xl">
            <div className="col-span-12 xl:col-span-5 space-y-6">
              <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] h-fit">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600">
                    <Youtube size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Media Extraction</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest leading-none mt-1 opacity-40">yt-dlp Implementation 2.0</p>
                  </div>
                </div>

                <form onSubmit={fetchVideoInfo} className="space-y-6">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Paste YouTube Link Here..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 placeholder:opacity-10 focus:outline-none focus:border-red-600/50 transition-all font-bold"
                    />
                    <button
                      type="submit"
                      disabled={loading || !url}
                      className="absolute right-2 top-2 bottom-2 px-6 bg-red-600 hover:bg-red-700 disabled:bg-white/5 disabled:text-white/20 text-white rounded-xl font-medium tracking-widest text-[10px] transition-all flex items-center gap-2"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      Inspect
                    </button>
                  </div>
                  {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 text-xs font-bold">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-7">
              {videoInfo ? (
                <div className="glass-card p-0 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] animate-in fade-in slide-in-from-right-8 duration-700">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-10 right-10">
                      <h2 className="text-2xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">{videoInfo.title}</h2>
                      <div className="flex items-center gap-6 mt-4 text-white/60 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Eye size={12} className="text-red-600" /> {videoInfo.view_count?.toLocaleString()} Views</div>
                        <div className="flex items-center gap-2"><ThumbsUp size={12} className="text-red-600" /> {videoInfo.like_count?.toLocaleString()} Likes</div>
                        <div className="flex items-center gap-2"><Clock size={12} className="text-red-600" /> {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-10 space-y-10">
                    <div className="grid grid-cols-2 gap-6">
                      <button onClick={() => handleDownload('video')} disabled={downloading} className="group relative flex flex-col items-center gap-4 p-8 rounded-[24px] bg-white text-black hover:bg-red-600 hover:text-white transition-all duration-500 overflow-hidden border border-black/5 shadow-xl">
                        <Video size={32} />
                        <span className="text-xs font-black uppercase tracking-widest">Download Video</span>
                        {downloading && <div className="absolute inset-0 bg-red-600 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-white" /></div>}
                      </button>
                      <button onClick={() => handleDownload('audio')} disabled={downloading} className="group relative flex flex-col items-center gap-4 p-8 rounded-[24px] bg-white/5 border border-white/10 hover:border-red-600/50 hover:bg-red-600/10 transition-all duration-500">
                        <Music size={32} className="text-red-600" />
                        <span className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]">Extract Audio</span>
                        {downloading && <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center"><Loader2 size={24} className="animate-spin text-red-600" /></div>}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-card border border-white/5 bg-white/5 rounded-[32px] p-20 text-center">
                  <Youtube size={48} className="opacity-10 mb-8" />
                  <h3 className="text-xl font-black italic tracking-tight opacity-20 uppercase">Awaiting Link</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'scraper' && (
          <div className="grid grid-cols-12 gap-10 max-w-6xl">
            <div className="col-span-12 xl:col-span-5 space-y-6">
              <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] h-fit">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Web Scraper</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest leading-none mt-1 opacity-40">Scrapy Crawler Engine</p>
                  </div>
                </div>

                <form onSubmit={handleScrape} className="space-y-6">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Paste Website URL..."
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 placeholder:opacity-10 focus:outline-none focus:border-emerald-600/50 transition-all font-bold"
                    />
                    <button
                      type="submit"
                      disabled={scrapeLoading || !scrapeUrl}
                      className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-white/5 disabled:text-white/20 text-white rounded-xl font-medium tracking-widest text-[10px] transition-all flex items-center gap-2"
                    >
                      {scrapeLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      Scrape
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-7">
              {scrapeData ? (
                <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] animate-in fade-in slide-in-from-right-8 duration-700 h-full overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600"><CheckCircle2 size={24} /></div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight">Scrape Successful</h2>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Module: Scrapy v2.11</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Page Title</span>
                      <h3 className="text-lg font-bold">{scrapeData.title || "No Title Found"}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1"><Code size={12} className="text-emerald-600" /><span className="text-[10px] font-black uppercase tracking-widest opacity-40">Links</span></div>
                        <div className="text-xl font-black">{scrapeData.links_count}</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1"><FileText size={12} className="text-emerald-600" /><span className="text-[10px] font-black uppercase tracking-widest opacity-40">H1 Headers</span></div>
                        <div className="text-xl font-black">{scrapeData.h1?.length || 0}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Text Content</span>
                      <div className="p-6 rounded-2xl bg-black/20 border border-white/5 font-mono text-[11px] opacity-60 italic">{scrapeData.text_preview}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-card border border-white/5 bg-white/5 rounded-[32px] p-20 text-center">
                  <Globe size={48} className="opacity-10 mb-8" />
                  <h3 className="text-xl font-black italic tracking-tight opacity-20 uppercase">Engine Ready</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ocr' && (
          <div className="grid grid-cols-12 gap-10 max-w-6xl">
            <div className="col-span-12 xl:col-span-5 space-y-6">
              <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] h-fit flex flex-col items-center text-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                    <ScanText size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black tracking-tight">OCR Scanner</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest leading-none mt-1 opacity-40">Mobile Lens Link</p>
                  </div>
                </div>

                {!ocrSessionId ? (
                  <div className="mt-8">
                    <p className="text-sm font-medium opacity-60 mb-6">Initialize a secure bridge to your mobile device to scan physical documents directly into the Murabbi environment.</p>
                    <button
                      onClick={generateOcrSession}
                      className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 mx-auto"
                    >
                      <QrCodeIcon size={16} />
                      Generate Bridge Link
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col items-center">
                    {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                      <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
                        <AlertCircle size={16} className="inline mr-2 mb-0.5" />
                        Warning: You are accessing this on 'localhost'. <br/>
                        The QR code below points to localhost, which your phone cannot reach. <br/>
                        Please access this dashboard using your computer's local network IP address (e.g., http://192.168.1.X:3001) for the scanner to work!
                      </div>
                    )}
                    <div className="bg-white p-4 rounded-3xl mb-6">
                      <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : ''}/ocr-capture/${ocrSessionId}`} size={200} />
                    </div>
                    <p className="text-xs font-bold opacity-60 mb-2">Scan this QR code with your mobile device.</p>
                    <p className="text-[10px] font-mono opacity-40 mb-6 break-all max-w-[250px]">{`${typeof window !== 'undefined' ? window.location.origin : ''}/ocr-capture/${ocrSessionId}`}</p>
                    
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5 w-full justify-center">
                      {(ocrStatus === 'waiting' || ocrStatus === 'idle') && <><Loader2 size={16} className="text-amber-500 animate-spin" /><span className="text-xs font-bold uppercase tracking-widest text-amber-500">Waiting for Scan...</span></>}
                      {ocrStatus === 'processing' && <><Loader2 size={16} className="text-blue-500 animate-spin" /><span className="text-xs font-bold uppercase tracking-widest text-blue-500">Extracting Text...</span></>}
                      {ocrStatus === 'completed' && <><CheckCircle2 size={16} className="text-emerald-500" /><span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Extraction Complete</span></>}
                      {ocrStatus === 'error' && <><AlertCircle size={16} className="text-red-500" /><span className="text-xs font-bold uppercase tracking-widest text-red-500">Error Encountered</span></>}
                    </div>

                    <button
                      onClick={generateOcrSession}
                      className="mt-6 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                    >
                      Reset Session
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-12 xl:col-span-7">
              {ocrStatus === 'completed' && ocrResultText ? (
                <div className="glass-card p-10 relative border border-white/5 bg-white/5 rounded-[32px] animate-in fade-in slide-in-from-right-8 duration-700 h-full max-h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between mb-8 shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><CheckCircle2 size={24} /></div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight">Digitized Text</h2>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Tesseract OCR Engine</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 border border-white/5 rounded-2xl p-6 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {ocrResultText}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-card border border-white/5 bg-white/5 rounded-[32px] p-20 text-center">
                  <ScanText size={48} className="opacity-10 mb-8" />
                  <h3 className="text-xl font-black italic tracking-tight opacity-20 uppercase">No Document Data</h3>
                  <p className="text-sm opacity-10 mt-2 font-bold max-w-[200px]">Scan a document via mobile to digitize text here.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--accent-main);
          opacity: 0.2;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--accent-main);
          opacity: 0.4;
        }
      `}</style>
    </div>
  );
}
