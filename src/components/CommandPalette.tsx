"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Home, 
  Sparkles, 
  Mail, 
  Receipt, 
  X,
  Command
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const commands = [
    { id: 'dash', label: 'Go to Dashboard', icon: Home, action: () => router.push('/') },
    { id: 'ai', label: 'Ask AI Assistant', icon: Sparkles, action: () => router.push('/chat') },
    { id: 'email', label: 'Compose New Email', icon: Mail, action: () => router.push('/emails') },
    { id: 'expense', label: 'Log New Expense', icon: Receipt, action: () => router.push('/expenses') },
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Palette */}
      <div className="w-full max-w-xl glass-card bg-white/5 backdrop-blur-3xl shadow-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-200 border border-white/20">
        <div className="relative flex items-center p-6 border-b border-white/10">
          <Search className="text-white/40 mr-4" size={24} />
          <input 
            autoFocus
            className="w-full bg-transparent border-none focus:ring-0 text-xl font-bold text-white placeholder:text-white/20"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
               if (e.key === 'Enter' && filteredCommands[0]) {
                  filteredCommands[0].action();
                  setIsOpen(false);
               }
            }}
          />
          <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-[14px] text-[12px] font-black text-white/40 border border-white/10">
             <Command size={12} />
             <span>K</span>
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto p-4 custom-scrollbar">
           {filteredCommands.length === 0 ? (
              <div className="p-10 text-center text-white/30 font-bold italic">No commands found</div>
           ) : (
              filteredCommands.map((cmd) => (
                 <button
                   key={cmd.id}
                   onClick={() => {
                      cmd.action();
                      setIsOpen(false);
                   }}
                   className="w-full flex items-center gap-4 p-4 rounded-[14px] hover:bg-red-600 hover:text-white transition-all text-left group hover:shadow-xl hover:shadow-red-900/40 border border-transparent hover:border-white/20"
                 >
                    <div className="p-3 rounded-[14px] bg-white/5 border border-white/10 group-hover:bg-white/20 group-hover:border-white/40 transition-all">
                       <cmd.icon size={20} className="text-white/60 group-hover:text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white/90 group-hover:text-white">{cmd.label}</span>
                 </button>
              ))
           )}
        </div>
        
        <div className="p-4 border-t border-white/10 flex justify-between items-center text-[11px] text-white/40 font-black uppercase tracking-widest">
           <span className="flex items-center gap-2">Navigate with <span className="px-1.5 py-0.5 bg-white/10 rounded-[14px]">↑↓</span></span>
           <span className="flex items-center gap-2">Press <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-[14px]">Enter</span> to select</span>
        </div>
      </div>
    </div>
  );
}
