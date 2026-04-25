"use client";
import React, { useState } from 'react';
import { PenTool, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TEMPLATES } from './templates';
export default function WriterPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const handleSelectTemplate = (templateId: string) => {
    setActiveId(templateId);
    setTimeout(() => {
      router.push(`/writer/editor?templateId=${templateId}`);
    }, 150);
  };
  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto px-8 py-12 custom-scrollbar bg-transparent">
      {}
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-4xl font-black italic tracking-tighter text-[var(--foreground)] uppercase flex items-center gap-4">
          <PenTool size={36} style={{ color: 'var(--accent-main)' }} />
          Assistant <span style={{ color: 'var(--accent-main)' }}>Writer</span>
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] pl-1">
          Select a template to instantly generate and sync a Google Doc.
        </p>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const isActive = activeId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelectTemplate(t.id)}
              className={`text-left p-6 rounded-3xl border border-white/5 glass transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:border-white/20 hover:bg-white/5 active:scale-95`}
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 opacity-50 group-hover:opacity-100"
                style={{ backgroundColor: t.color }}
              />
              <div className="flex flex-col h-full gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${t.color}20` }}
                >
                  {isActive ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                  ) : (
                    <Icon size={24} style={{ color: t.color }} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-[var(--accent-main)] transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs font-medium text-[var(--text-dim)] mt-2 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}
