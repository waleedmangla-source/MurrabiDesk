import React from 'react';
import { Construction, Sparkles, AlertCircle } from 'lucide-react';

interface DevelopmentPlaceholderProps {
  title: string;
}

export default function DevelopmentPlaceholder({ title }: DevelopmentPlaceholderProps) {
  return (
    <div className="main-content flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-1000">
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full group-hover:bg-red-600/30 transition-all duration-700" />
        
        {/* Glass Card */}
        <div className="relative glass border border-white/10 p-12 rounded-[40px] flex flex-col items-center max-w-lg text-center gap-6 shadow-2xl backdrop-blur-3xl">
          <div className="w-20 h-20 rounded-3xl bg-red-600/10 flex items-center justify-center border border-red-600/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Construction size={40} className="text-red-500 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase italic">
              {title} <span className="text-red-600">Protocol</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-red-500/60 font-black uppercase tracking-[0.3em] text-[9px]">
              <AlertCircle size={10} />
              Status: Research & Development
            </div>
          </div>

          <p className="text-white/40 text-sm font-medium leading-relaxed">
            The <span className="text-white font-bold">{title}</span> module is currently being re-engineered for <span className="text-red-500 font-bold italic">Protocol 4.0</span>. 
            We are fine-tuning the liquid synchronization and neural interface for a premium administrative experience.
          </p>

          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent w-full animate-[loading-bar_3s_linear_infinite]" />
          </div>

          <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest mt-4">
            <Sparkles size={12} className="text-red-500/40" />
            Estimated Completion: Soon
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
