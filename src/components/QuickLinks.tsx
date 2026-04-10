"use client";
import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus, Trash2, Globe, BookOpen, Tv, Newspaper, X } from 'lucide-react';
import { clsx } from 'clsx';

interface QuickLink {
  id: string;
  name: string;
  url: string;
  isPreset?: boolean;
}

const PRESET_LINKS: QuickLink[] = [
  { id: 'mta', name: 'MTA.tv', url: 'https://www.mta.tv', isPreset: true },
  { id: 'alislam', name: 'Al Islam', url: 'https://www.alislam.org', isPreset: true },
  { id: 'alhakam', name: 'Al Hakam', url: 'https://www.alhakam.org', isPreset: true },
  { id: 'review', name: 'Review of Religions', url: 'https://www.reviewofreligions.org', isPreset: true },
  { id: 'alfazl', name: 'Al Fazl', url: 'https://www.alfazl.com', isPreset: true }
];

const PRESET_COLORS: Record<string, { glow: string, bg: string }> = {
  'mta': { glow: 'rgba(0, 75, 147, 0.4)', bg: 'rgba(0, 75, 147, 0.1)' },
  'alislam': { glow: 'rgba(45, 90, 39, 0.4)', bg: 'rgba(45, 90, 39, 0.1)' },
  'alhakam': { glow: 'rgba(255, 255, 255, 0.15)', bg: 'rgba(255, 255, 255, 0.05)' },
  'review': { glow: 'rgba(207, 162, 64, 0.4)', bg: 'rgba(207, 162, 64, 0.1)' },
  'alfazl': { glow: 'rgba(0, 128, 128, 0.4)', bg: 'rgba(0, 128, 128, 0.1)' }
};

interface QuickLinksProps {
  variant?: 'full' | 'compact';
}

export default function QuickLinks({ variant = 'full' }: QuickLinksProps) {
  const [links, setLinks] = useState<QuickLink[]>(PRESET_LINKS);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('murrabi_quick_links');
    if (saved) {
      try {
        const customLinks = JSON.parse(saved);
        const filteredCustom = customLinks.filter((cl: QuickLink) => !PRESET_LINKS.find(p => p.url === cl.url));
        setLinks([...PRESET_LINKS, ...filteredCustom]);
      } catch (e) {
        console.error("Failed to load custom links", e);
      }
    }
  }, []);

  const saveCustomLinks = (updatedLinks: QuickLink[]) => {
    const customOnly = updatedLinks.filter(l => !l.isPreset);
    localStorage.setItem('murrabi_quick_links', JSON.stringify(customOnly));
  };

  const addLink = () => {
    const customLinksCount = links.filter(l => !l.isPreset).length;
    if (customLinksCount >= 6) {
      alert("Command Hub capacity reached. Maximum 6 additional nodes allowed.");
      return;
    }

    if (!newName || !newUrl) return;
    
    let formattedUrl = newUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newLink: QuickLink = {
      id: Date.now().toString(),
      name: newName,
      url: formattedUrl
    };

    const updated = [...links, newLink];
    setLinks(updated);
    saveCustomLinks(updated);
    setNewName('');
    setNewUrl('');
    setIsAdding(false);
  };

  const removeLink = (id: string) => {
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    saveCustomLinks(updated);
  };

  const getLogo = (id: string, url: string) => {
    const domain = new URL(url).hostname;
    // High-res favicon service
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center h-full gap-4 no-drag relative">
        <div className="flex items-center gap-2">
          {links.map((link) => (
            <div key={link.id} className="relative group/pod">
               <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                title={link.name}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/5  transition-all shadow-xl  overflow-hidden group-hover/pod:scale-110 active:scale-95 group-hover/pod:bg-white/10"
               >
                 <img 
                    src={getLogo(link.id, link.url)} 
                    alt="" 
                    className="w-7 h-7 object-cover rounded-full transition-all duration-500 scale-110 group-hover/pod:scale-125" 
                 />
               </a>
               {!link.isPreset && (
                 <button 
                  onClick={() => removeLink(link.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover/pod:opacity-100 transition-opacity z-20 shadow-lg"
                 >
                   <X size={8} />
                 </button>
               )}
            </div>
          ))}
          
          {links.filter(l => !l.isPreset).length < 6 && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center w-11 h-11 rounded-full border border-dashed border-white/10 text-white/10    transition-all active:scale-95"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {isAdding && (
          <div className="absolute right-0 top-14 z-50 p-6 rounded-[24px] glass border border-white/10 shadow-2xl w-72 animate-in fade-in slide-in-from-top-4 backdrop-blur-3xl">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600 mb-4 flex items-center gap-2">
               <Globe size={10} />
               Add Protocol Resource
            </h4>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Interface Name" 
                autoFocus
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-v4-ink focus:border-red-600/30 focus:ring-0 transition-all"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Domain / URL" 
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-v4-ink/60 focus:border-red-600/30 focus:ring-0 transition-all"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
              />
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-white/30  transition-colors">Cancel</button>
                <button onClick={addLink} className="bg-red-600 text-white px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20  active:scale-95 transition-all">Establish</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col no-drag w-full h-full">
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {links.map((link) => {
          const colorSet = PRESET_COLORS[link.id] || { glow: 'rgba(255,255,255,0.1)', bg: 'rgba(255,255,255,0.02)' };
          return (
            <div key={link.id} className="flex flex-col items-center gap-4">
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  '--hover-glow': colorSet.glow,
                  '--hover-bg': colorSet.bg
                } as any}
                className="group relative w-32 h-32 rounded-full glass border border-white/10 bg-white/5 transition-all duration-700 (--hover-glow)]  overflow-hidden shadow-2xl flex items-center justify-center"
              >
                {/* Background Identity Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--hover-bg)] to-transparent opacity-0  transition-opacity duration-700" />
                
                {/* Logo Pod (Cropped) */}
                <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-700 ">
                    <img 
                      src={getLogo(link.id, link.url)} 
                      alt={link.name} 
                      className="w-[85%] h-[85%] object-cover rounded-full transition-all duration-700  _0_40px_var(--hover-glow)]" 
                    />
                </div>

                {/* External Protocol Icon */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0  transition-all duration-500 backdrop-blur-[2px]">
                    <div className="scale-150 text-white translate-y-4  transition-transform duration-500">
                        <ExternalLink size={16} />
                    </div>
                </div>

                {/* Remove Trigger */}
                {!link.isPreset && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeLink(link.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0  transition-all z-20 shadow-lg  active:scale-95"
                    >
                      <Trash2 size={12} />
                    </button>
                )}
              </a>
              <div className="text-center  transition-transform duration-500">
                <h3 className="text-[10px] font-black text-white italic tracking-tight uppercase">{link.name}</h3>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 font-mono">{new URL(link.url).hostname}</p>
              </div>
            </div>
          );
        })}

        {/* Create Node */}
        {links.filter(l => !l.isPreset).length < 6 && (
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsAdding(true)}
              className="w-32 h-32 rounded-full border-2 border-dashed border-white/5 text-white/10    transition-all group flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full border border-dashed border-white/10 flex items-center justify-center  transition-transform">
                <Plus size={24} />
              </div>
            </button>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Init Node</span>
          </div>
        )}
       </div>

       {/* Add Portal Overlay */}
       {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500 pointer-events-none">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setIsAdding(false)} />
             <div className="relative z-[110] glass p-10 rounded-[40px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] w-full max-w-md animate-in zoom-in-95 pointer-events-auto">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                         <Plus size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">New Command Node</h3>
                         <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Connect External Intelligence</p>
                      </div>
                   </div>
                   <button onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full  flex items-center justify-center text-white/20  transition-all">
                      <X size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-v4-ink-muted px-2">Interface Alias</label>
                      <input 
                        type="text" 
                        placeholder="e.g. MISSION HQ"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-v4-ink focus:border-red-600/30 focus:ring-0 transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-v4-ink-muted px-2">Protocol Uniform (URL)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. hq.alislam.org"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-v4-ink/60 focus:border-red-600/30 focus:ring-0 transition-all font-mono"
                      />
                   </div>
                   
                   <button 
                     onClick={addLink}
                     className="w-full h-16 mt-4 bg-red-600 rounded-[22px] font-black uppercase tracking-[0.3em] text-[11px] text-white shadow-2xl shadow-red-900/40   active:scale-[0.98] transition-all"
                   >
                     Initiate Link Connection
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}
