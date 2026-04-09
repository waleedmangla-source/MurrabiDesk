"use client";

import React, { useState } from 'react';
import { 
  Send, 
  Mic, 
  Sparkles, 
  BookOpen, 
  ChevronLeft,
  Bot,
  User,
  History,
  Info,
  Settings,
  X,
  Volume2,
  Brain,
  Plus,
  Copy
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { getAIConfig, saveAIConfig, AIConfig } from '@/lib/ai-config-store';

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "As-salamu alaykum Murabbi. How can I assist you with your research or speech preparation today?" }
  ]);
  const [isIslamicMode, setIsIslamicMode] = useState(true);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<AIConfig>(getAIConfig());
  
  const [mockHistory] = useState([
    { id: 1, title: "Jumu'ah Khalifah Notes", date: "Today", type: "General" },
    { id: 2, title: "Refuting Materialism Research", date: "Yesterday", type: "Research" },
    { id: 3, title: "Waqf-e-Nau Syllabus Prep", date: "Mar 30", type: "General" },
    { id: 4, title: "Comparative Theology References", date: "Mar 28", type: "Research" },
  ]);

  const researchShortcuts = [
    { title: "Speech Builder", icon: <Mic size={14} />, prompt: "Help me build a 5-minute speech about: " },
    { title: "Dars Finder", icon: <BookOpen size={14} />, prompt: "Find a relevant dars topic regarding: " },
    { title: "Summarizer", icon: <Sparkles size={14} />, prompt: "Summarize the following notes and extract key action points: " },
    { title: "Crash Course", icon: <Brain size={14} />, prompt: "Provide a quick theological crash course on: " },
    { title: "Devil's Advocate", icon: <Info size={14} />, prompt: "Challenge my reasoning on this topic from an opposing viewpoint: " },
  ];

  const generalShortcuts = [
    { title: "Summarizer", icon: <Sparkles size={14} />, prompt: "Summarize this information into actionable bullet points: " },
    { title: "Devil's Advocate", icon: <Info size={14} />, prompt: "Analyze this for potential weaknesses or opposing arguments: " },
    { title: "Crash Course", icon: <Brain size={14} />, prompt: "Give me a high-level overview of: " },
    { title: "Translation", icon: <Volume2 size={14} />, prompt: "Translate the following while maintaining professional tone: " },
  ];

  const handleShortcutClick = (prompt: string) => {
    setInputText(prompt);
  };

  const updateConfig = (newConfig: Partial<AIConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    saveAIConfig(updated);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMessage = { role: 'user', content: inputText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText("");
    
    // Show "thinking..." indicator
    setMessages(prev => [...prev, { role: 'assistant', content: "thinking..." }]);

    try {
      let data;
      if (typeof window !== 'undefined' && (window as any).electron) {
        data = await (window as any).electron.generateChatResponse(newMessages, config);
      } else {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages,
            config: config
          })
        });
        data = await response.json();
      }
      
      // Replace "thinking..." with actual response
      setMessages(prev => {
        const withoutLast = prev.slice(0, -1);
        return [...withoutLast, data];
      });
    } catch (error) {
       console.error("AI Error:", error);
       setMessages(prev => {
        const withoutLast = prev.slice(0, -1);
        return [...withoutLast, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later." }];
      });
    }
  };

  return (
    <main className="main-content flex flex-col h-screen max-h-screen overflow-hidden pb-4 bg-transparent no-drag">
      {/* Draggable Header - Harmonized with Dashboard */}
      <header className="flex justify-between items-end mb-4 px-2 draggable-header shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-main mb-2 italic whitespace-nowrap">
                Murrabi AI
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-2 opacity-60">
                Active Intelligence • Identity: {config.userName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 no-drag mb-2">
          {/* Mode Toggle */}
          <div className="flex bg-black/20 p-1.5 rounded-[14px] border border-white/5">
            <button 
              onClick={() => setIsIslamicMode(false)}
              className={clsx(
                "text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-[14px] transition-all border flex items-center gap-2",
                !isIslamicMode ? "bg-red-600 text-white border-red-500 shadow-lg" : "text-white/30 border-transparent hover:bg-white/5"
              )}
            >
              <Bot size={12} />
              General
            </button>
            <button 
              onClick={() => setIsIslamicMode(true)}
              className={clsx(
                "text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-[14px] transition-all border flex items-center gap-2",
                isIslamicMode ? "bg-red-600 text-white border-red-500 shadow-lg" : "text-white/30 border-transparent hover:bg-white/5"
              )}
            >
              <BookOpen size={12} />
              Research
            </button>
          </div>
        </div>
      </header>

      {/* Main Mission Core Area with History Sidebar */}
      <div className="flex-grow flex gap-8 overflow-hidden relative">
        
        {/* Mission History Sidebar - Glassmorphic Sliding Panel */}
        <aside className={clsx(
          "h-full glass-card !p-0 border border-white/5 bg-white/[0.02] flex flex-col transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0 no-drag",
          isHistoryVisible ? "w-80 opacity-100" : "w-0 opacity-0 -mr-8 border-none"
        )}>
          <div className="card-hdr !bg-transparent border-b border-white/5 !text-red-500/60 font-black tracking-[0.2em] px-8 py-6 text-[10px] flex justify-between items-center whitespace-nowrap">
            <div className="flex items-center gap-4">
              <div className="dot !bg-red-500"></div>
              PREVIOUS MISSIONS
            </div>
            <button onClick={() => setIsHistoryVisible(false)} className="text-white/20 hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {mockHistory.map((mission) => (
              <button 
                key={mission.id}
                className="w-full text-left p-5 rounded-[1.25rem] bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-red-500/20 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1">
                    <p className="text-xs font-black text-v4-ink group-hover:text-v4-cream transition-colors line-clamp-1 pr-4">{mission.title}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-v4-ink-muted/50 mt-1">{mission.date} • {mission.type}</p>
                  </div>
                  {mission.type === 'Research' && <BookOpen size={12} className="text-red-500/30" />}
                </div>
                <div className="absolute right-0 top-0 w-1 h-full bg-red-600/0 group-hover:bg-red-600/40 transition-all" />
              </button>
            ))}
          </div>
          
          <div className="p-6 border-t border-white/5 bg-black/10">
             <button className="w-full h-12 rounded-[1rem] bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <Plus size={16} />
                New Objective
             </button>
          </div>
        </aside>

        {/* Chat Workspace */}
        <div className="flex-grow flex flex-col overflow-hidden relative">
          
          {/* Mission Shortcuts - Mode Specific Quick Actions (Only in Research Mode) */}
          {isIslamicMode && (
            <div className="relative shrink-0 overflow-hidden">
              <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              <div 
                className="flex gap-2 overflow-x-auto pb-4 no-drag hide-scrollbar px-8 relative"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 120px, black calc(100% - 120px), transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 120px, black calc(100% - 120px), transparent)'
                }}
              >
                {researchShortcuts.map((shortcut, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleShortcutClick(shortcut.prompt)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/5 hover:bg-red-600 hover:border-red-500 hover:text-white transition-all text-v4-ink/60 whitespace-nowrap group"
                  >
                    <span className="opacity-40 group-hover:opacity-100">{shortcut.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{shortcut.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area - Claude-style Refactor */}
          <div className="flex-grow overflow-y-auto pr-4 space-y-12 custom-scrollbar no-drag pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={clsx(
                "flex animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[95%]",
                msg.role === 'user' ? "flex-row-reverse gap-4 self-end" : "items-start"
              )}>
                {/* Icon Marker - Only for User */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xl border shrink-0 mt-1 bg-white/5 text-red-500/40 border-white/5">
                    <User size={16} />
                  </div>
                )}

                {/* Content Area */}
                <div className={clsx(
                  "transition-all font-serif",
                  msg.role === 'assistant' 
                    ? "text-v4-ink relative group/msg w-full" 
                    : "bg-red-600 text-white py-3 px-5 rounded-[1.25rem] rounded-tr-none shadow-2xl shadow-red-950/40 border border-red-400/20"
                )}>
                    <div className={clsx(
                      "leading-relaxed font-medium tracking-normal whitespace-pre-wrap flex items-end gap-3",
                      msg.role === 'assistant' ? "text-lg opacity-95" : "text-base"
                    )}>
                      <span className="flex-1">{msg.content}</span>
                      
                      {msg.role === 'assistant' && msg.content !== "thinking..." && (
                        <button 
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-white/5 text-v4-ink/20 hover:text-red-500 transition-all shrink-0 mb-1"
                          title="Copy session data"
                        >
                           <Sparkles size={12} className="mr-1 opacity-40 group-hover/msg:animate-pulse" />
                           <Copy size={12} />
                        </button>
                      )}
                    </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="mt-2 px-2 no-drag shrink-0 relative z-20">
            <div className="glass-card !bg-black/40 border border-white/5 p-1 rounded-[1.25rem] flex items-center gap-1.5 shadow-2xl focus-within:border-red-500/40 transition-all">
              <button 
                onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-white/10 transition-all shrink-0"
              >
                <History size={16} />
              </button>
              
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isIslamicMode ? "Deep research into theology, history, or archives..." : "Message Murrabi AI..."}
                className="flex-1 bg-transparent border-none outline-none text-v4-ink placeholder:text-v4-ink-muted/30 text-sm font-medium h-9"
              />
              
              <button 
                onClick={handleSend}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-red-500/40 hover:border-red-500 transition-all duration-500 shrink-0 group relative overflow-hidden active:opacity-50"
              >
                {/* Rainbow Aura Glow */}
                <div className="absolute inset-[-4px] bg-[conic-gradient(from_0deg,red,orange,yellow,green,blue,indigo,violet,red)] opacity-0 group-hover:opacity-30 blur-md animate-spin-slow transition-opacity duration-700" />
                
                {/* Color Rush Layers */}
                <div className="absolute top-0 left-0 w-full h-full bg-red-400 scale-0 opacity-0 group-hover:scale-150 group-hover:opacity-100 transition-all duration-300 ease-out origin-top-left" />
                <div className="absolute top-0 right-0 w-full h-full bg-red-800 scale-0 opacity-0 group-hover:scale-150 group-hover:opacity-100 transition-all duration-500 ease-out origin-top-right delay-75" />
                <div className="absolute bottom-0 left-0 w-full h-full bg-red-950 scale-0 opacity-0 group-hover:scale-150 group-hover:opacity-100 transition-all duration-700 ease-out origin-bottom-left delay-150" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-red-600 scale-0 opacity-0 group-hover:scale-150 group-hover:opacity-100 transition-all duration-300 ease-out origin-bottom-right" />
                
                <Send size={16} className="relative z-10 transition-all duration-300 group-hover:text-white group-active:translate-x-1 group-active:-translate-y-1" />
              </button>
            </div>
            
            {/* Disclaimer Protocol */}
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-v4-ink/20 text-center mt-3 mb-1">
              Murrabi AI may provide inaccurate information. Verify critical references independently.
            </p>
          </div>
        </div>
      </div>



      {/* LLM Customization Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-8 bg-red-950/40 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl glass-card !p-0 overflow-hidden shadow-[0_64px_256px_-32px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 border border-white/10 bg-black/40 rounded-[4rem]">
             <div className="bg-red-600 p-10 flex items-center justify-between text-white shadow-2xl">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-white/20 rounded-2xl border border-white/10">
                      <Brain size={32} />
                   </div>
                   <div>
                      <h2 className="text-lg font-black tracking-tight italic">AI Personality</h2>
                      <p className="text-[10px] text-red-100 uppercase font-black tracking-widest mt-1 italic">Protocol Optimization</p>
                   </div>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-4 hover:bg-white/20 rounded-2xl transition-all">
                   <X size={32} />
                </button>
             </div>

             <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* User Name */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-red-500/60 uppercase tracking-widest ml-2 flex items-center gap-3">
                      <User size={14} /> Mission Identity
                   </label>
                   <input 
                    type="text" 
                    value={config.userName}
                    onChange={(e) => updateConfig({ userName: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-3xl h-16 px-6 text-xl font-black focus:ring-4 ring-red-500/10 focus:border-red-500 outline-none transition-all text-white placeholder:text-white/5"
                    placeholder="e.g., Regional Murabbi"
                   />
                </div>

                {/* System Prompt / Instructions */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-red-500/60 uppercase tracking-widest ml-2 flex items-center gap-3">
                      <Bot size={14} /> Core Directives
                   </label>
                   <textarea 
                    rows={4}
                    value={config.systemPrompt}
                    onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-[2.5rem] p-8 text-base font-bold focus:ring-4 ring-red-500/10 focus:border-red-500 outline-none transition-all resize-none text-white placeholder:text-white/5 leading-relaxed"
                    placeholder="Define the AI's theological focus and concise output level..."
                   />
                </div>

                {/* Intelligence Selector */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-red-500/60 uppercase tracking-widest ml-2 flex items-center gap-3">
                      <Sparkles size={14} /> Processing Power
                   </label>
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                         onClick={() => updateConfig({ model: 'gemini-1.5-flash' })}
                         className={`p-6 rounded-[2rem] border transition-all text-left group ${config.model === 'gemini-1.5-flash' ? 'bg-red-600 text-white border-red-500 shadow-2xl shadow-red-900/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                      >
                         <p className="font-black text-xs uppercase tracking-widest group-hover:text-white">Active Strike</p>
                         <p className="text-[10px] opacity-40 font-bold mt-1 uppercase">Fast response for routine duty</p>
                      </button>
                      <button 
                         onClick={() => updateConfig({ model: 'gemini-1.5-pro' })}
                         className={`p-6 rounded-[2rem] border transition-all text-left group ${config.model === 'gemini-1.5-pro' ? 'bg-red-600 text-white border-red-500 shadow-2xl shadow-red-900/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                      >
                         <p className="font-black text-xs uppercase tracking-widest group-hover:text-white">Deep Research</p>
                         <p className="text-[10px] opacity-40 font-bold mt-1 uppercase">Profound reasoning & archives</p>
                      </button>
                   </div>
                </div>

                {/* Temperature Range */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-red-500/60 uppercase tracking-widest ml-2 flex items-center gap-3">
                      <Volume2 size={14} /> Creativity Variance
                   </label>
                   <input 
                    type="range" 
                    min="0" max="1" step="0.1"
                    value={config.temperature}
                    onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                    className="w-full accent-red-600 h-2 bg-white/5 rounded-full appearance-none shadow-inner"
                   />
                   <div className="flex justify-between text-[9px] text-red-500/30 font-black uppercase tracking-[0.2em] px-2">
                      <span>Scholarly Precision</span>
                      <span>Fluid Eloquence</span>
                   </div>
                </div>
             </div>

             <div className="p-10 bg-white/5 border-t border-white/10 flex gap-4">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="flex-grow h-16 bg-red-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-red-700 transition-all shadow-2xl shadow-red-900/40"
                >
                   APPLY PROTOCOLS
                </button>
                <button 
                  onClick={() => setConfig(getAIConfig())}
                  className="px-10 h-16 border border-white/10 rounded-2xl text-red-500/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
                >
                   RESET
                </button>
             </div>
          </div>
        </div>
      )}
    </main>
  );
}
