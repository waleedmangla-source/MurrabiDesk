"use client";

import React, { useState } from 'react';
import { PenTool, Loader2, Feather, FileSignature, Mic, BookOpen, FilePlus } from 'lucide-react';
import { GoogleSyncService } from '@/lib/google-sync-service';

const TEMPLATES = [
  {
    id: "huzoor",
    title: "Letter to Huzoor",
    description: "Official structured template for correspondence with Hazrat Khalifatul Masih.",
    icon: FileSignature,
    color: "var(--accent-main)",
    templateText: "Bismillahir Rahmanir Raheem\n\nRespected Huzoor,\nAssalamu Alaikum wa Rahmatullah,\n\n[Your message here]\n\n\nHumbly Yours,\n[Your Name]\n"
  },
  {
    id: "amir",
    title: "Letter to Amir Sb",
    description: "Standard template for communicating with the National Amir.",
    icon: Feather,
    color: "var(--accent-main)",
    templateText: "Respected Amir Sahib,\nAssalamu Alaikum wa Rahmatullah,\n\n[Your message here]\n\n\nWassalam,\n[Your Name]\n"
  },
  {
    id: "speech",
    title: "Speech Writer",
    description: "Organized format for preparing speeches and addresses.",
    icon: Mic,
    color: "#f59e0b",
    templateText: "Speech Title: \nDate: \nAudience: \n\nIntroduction:\n- \n- \n\nMain Points:\n1. \n2. \n3. \n\nConclusion:\n- \n- \n"
  },
  {
    id: "khutba",
    title: "Khutba",
    description: "Layout tailored for Friday Sermons or similar addresses.",
    icon: BookOpen,
    color: "#10b981",
    templateText: "Khutba Title: \nDate: \nVerses Recited: \n\n[Sermon Content]\n"
  },
  {
    id: "blank",
    title: "Blank Document",
    description: "Start fresh with a clean, empty Google Doc.",
    icon: FilePlus,
    color: "#6b7280",
    templateText: ""
  }
];

export default function WriterPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleCreateDocument = async (template: typeof TEMPLATES[0]) => {
    try {
      setIsGenerating(true);
      setActiveId(template.id);
      
      const syncService = new GoogleSyncService();
      
      const res = await syncService.createGoogleDoc(
        `${template.title} - Draft`,
        template.templateText
      );
      
      if (res && res.documentId) {
        // Open the document securely in a new native window or tab
        window.open(`https://docs.google.com/document/d/${res.documentId}/edit`, '_blank');
      } else {
        throw new Error(res?.error || "Failed to generate document.");
      }
      
    } catch (error: any) {
      alert("Error creating document: " + (error.message || "Unknown error"));
      console.error(error);
    } finally {
      setIsGenerating(false);
      setActiveId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto px-8 py-12 custom-scrollbar bg-transparent">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-4xl font-black italic tracking-tighter text-[var(--foreground)] uppercase flex items-center gap-4">
          <PenTool size={36} style={{ color: 'var(--accent-main)' }} />
          Assistant <span style={{ color: 'var(--accent-main)' }}>Writer</span>
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] pl-1">
          Select a template to instantly generate and sync a Google Doc.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const isActive = activeId === t.id;
          
          return (
            <button
              key={t.id}
              onClick={() => handleCreateDocument(t)}
              disabled={isGenerating}
              className={`text-left p-6 rounded-3xl border border-white/5 glass transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:border-white/20 hover:bg-white/5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none`}
            >
              {/* Top Accent Bar */}
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
