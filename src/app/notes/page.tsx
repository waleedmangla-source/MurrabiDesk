"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Trash2,
  RefreshCw,
  Plus,
  Save,
  CloudOff,
  Cloud,
  Shield,
  Zap
} from "lucide-react";
import { clsx } from "clsx";
import { GoogleSyncService } from '@/lib/google-sync-service';

interface Note {
  id: string;
  name: string;
  content: string;
  modifiedTime?: string;
  isLocalOnly?: boolean;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const diagnosticChecks = [
    { label: "Archive Density", status: "STABLE", val: `${notes.length} Fragments`, icon: FileText, color: "text-blue-500" },
    { label: "Sync Status", status: isSyncing ? "SYNCING" : (isOnline ? "STABLE" : "OFFLINE"), val: isOnline ? "Cloud Active" : "Local Only", icon: RefreshCw, color: isOnline ? "text-emerald-500" : "text-red-500", animate: isSyncing },
    { label: "Storage Health", status: "VERIFIED", val: "99.9% Integrity", icon: Shield, color: "text-emerald-500" },
    { label: "Last Entry", status: "TIMESTAMPED", val: notes[0]?.modifiedTime ? new Date(notes[0].modifiedTime).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "N/A", icon: Zap, color: "text-v4-gold" }
  ];

  useEffect(() => {
    fetchNotes();
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const fetchNotes = async () => {
    setIsSyncing(true);
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        const driveNotes = await service.listNotes();
        const mappedNotes: Note[] = driveNotes.map((dn: any) => ({
           id: dn.id,
           name: dn.name.replace('.md', ''),
           content: '',
           modifiedTime: dn.modifiedTime
        }));
        setNotes(mappedNotes);
      } catch (err) {
        console.error('Notes sync failed:', err);
      }
    }
    setTimeout(() => {
       setIsSyncing(false);
       setIsLoading(false);
    }, 500);
  };

  const handleSelectNote = async (note: Note) => {
     if (selectedNote?.id === note.id) return;
     setIsSyncing(true);
     const service = await GoogleSyncService.fromLocalStorage();
     if (service) {
        try {
           const content = await service.getNoteContent(note.id);
           setSelectedNote({...note, content});
        } catch (err) {
           console.error('Failed to fetch content:', err);
        }
     }
     setIsSyncing(false);
  };

  const handleSave = async () => {
     if (!selectedNote) return;
     setIsSyncing(true);
     const service = await GoogleSyncService.fromLocalStorage();
     if (service) {
        try {
           await service.saveNote(selectedNote.name + '.md', selectedNote.content, selectedNote.id);
           fetchNotes();
        } catch (err) {
           console.error('Notes save failed:', err);
        }
     }
     setIsSyncing(false);
  };

  const handleNewNote = async () => {
     const name = prompt('Archive Title:');
     if (!name) return;
     setIsSyncing(true);
     const service = await GoogleSyncService.fromLocalStorage();
     if (service) {
        try {
           await service.saveNote(name + '.md', '# ' + name + '\n\nMission Report started...');
           fetchNotes();
        } catch (err) {
           console.error('New note failed:', err);
        }
     }
     setIsSyncing(false);
  };

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      {/* Beta Tools Header Section */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Mission <span className="text-red-600">Archives</span></h1>
          <p className="text-white/30 max-w-xl mt-2 font-black uppercase tracking-[0.3em] text-[9px]">
             Secure Administrative Intelligence Storage Protocol
          </p>
        </div>
        
        <div className="flex gap-4">
           {isSyncing ? (
              <div className="flex items-center gap-3 px-6 text-red-500 animate-pulse">
                 <RefreshCw className="animate-spin" size={16} />
                 <span className="text-[10px] uppercase tracking-widest font-black">Syncing...</span>
              </div>
           ) : (
              <button 
                onClick={fetchNotes}
                className="btn-v4 px-6 flex items-center gap-3 active:scale-95 text-white/40 hover:text-white"
              >
                 <RefreshCw size={14} />
                 Refresh
              </button>
           )}
           <button 
             onClick={handleNewNote}
             className="btn-v4 px-8 flex items-center gap-3 active:scale-95"
           >
             <Plus size={16} />
             New Directive
           </button>
        </div>
      </div>

      {/* Primary Diagnostic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {diagnosticChecks.map((check) => (
          <div key={check.label} className="glass p-5 flex flex-col gap-3 relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <check.icon className={clsx(check.color, check.animate && "animate-spin")} size={20} />
              <span className={clsx("text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-black/40", check.color)}>
                {check.status}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">{check.label}</p>
              <h3 className="text-xl font-black text-white mt-1 tracking-tighter italic">{check.val}</h3>
            </div>
          </div>
        ))}
      </div>


      <div className="flex-1 flex gap-8 overflow-hidden pb-8">
        {/* Main Grid Log (Keep-inspired) */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
           {isLoading ? (
             <div className="grid grid-cols-3 gap-6 animate-pulse">
                {[1,2,3,4,5,6].map(i => (
                   <div key={i} className="h-64 glass border border-white/5 rounded-[32px]" />
                ))}
             </div>
           ) : (
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length === 0 ? (
                  <div className="col-span-full border-2 border-dashed border-white/5 rounded-[32px] p-20 flex flex-col items-center justify-center text-white/5 uppercase tracking-[0.3em]">
                    <FileText size={64} className="mb-6 opacity-10" />
                    Archive Empty
                  </div>
                ) : (
                  notes.map((note) => (
                    <button 
                       key={note.id}
                       onClick={() => handleSelectNote(note)}
                       className={clsx(
                          "group text-left p-8 border rounded-[32px] transition-all relative overflow-hidden h-fit shadow-xl",
                          selectedNote?.id === note.id 
                            ? "bg-red-600/10 border-red-500/30 ring-1 ring-red-500/20 shadow-red-950/40" 
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                       )}
                    >
                       <div className="absolute top-6 right-6 text-white/5 group-hover:text-red-500/40 transition-all">
                          <FileText size={24} />
                       </div>
                        <h3 className="font-black text-xl italic mb-3 truncate pr-12 group-hover:text-white transition-colors">{note.name}</h3>
                       <div className={clsx("h-[2px] w-12 mb-4 group-hover:w-full transition-all", selectedNote?.id === note.id ? "bg-red-600" : "bg-white/10")} />
                       <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-auto">
                          ID: {note.id.substring(0, 8)}... {note.modifiedTime ? " | " + new Date(note.modifiedTime).toLocaleDateString() : ''}
                       </p>
                    </button>
                  ))
                )}
             </div>
           )}
        </div>

        {/* Note Editor */}
        {selectedNote && (
          <div className="w-[500px] flex flex-col glass border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-xl">
               <div>
                 <h2 className="text-white font-black uppercase tracking-widest text-sm">{selectedNote.name}</h2>
                 <p className="text-[10px] text-white/20 font-black uppercase mt-1 tracking-widest">Official Mission Record</p>
               </div>
               <div className="flex gap-4">
                 <button 
                   onClick={handleSave}
                   className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-black hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
                 >
                    <Save size={20} />
                 </button>
                 <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-white/10 text-white/20 hover:bg-red-600/10 hover:text-red-500 transition-all">
                    <Trash2 size={20} />
                 </button>
               </div>
            </div>
            
            <textarea 
               value={selectedNote.content}
               onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
               className="flex-1 bg-transparent p-10 text-sm font-bold leading-relaxed text-white/80 resize-none outline-none placeholder:text-white/5 custom-scrollbar"
               placeholder="Initiate administrative archival data entry..."
            />
            
            <div className="p-6 bg-black/40 text-[9px] font-black uppercase tracking-[0.3em] text-white/10 text-center border-t border-white/5">
               Protocol 22-A Mission Logging Active
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
