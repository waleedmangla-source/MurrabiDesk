"use client";
import React from 'react';
import { 
  Calendar, 
  Receipt, 
  Sun,
  Moon,
  Clock,
  PenTool,
  MessageSquare,
  User,
  BookOpen,
  Mail,
  Download,
  Globe,
  Save,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  Zap,
  Shield,
  Activity,
  Timer,
  RefreshCw
} from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { clsx } from "clsx";
import { GoogleSyncService } from '@/lib/google-sync-service';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import WorldClock from '@/components/WorldClock';
import DashboardCalendar from '@/components/DashboardCalendar';
import PrayerTimes from '@/components/PrayerTimes';
import QuickLinks from '@/components/QuickLinks';

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeHubTab, setActiveHubTab] = useState<'notes' | 'links'>('notes');
  const [isConnected, setIsConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notes, setNotes] = useState('');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [dashboardSettings, setDashboardSettings] = useState({
    showWorldClock: true,
    showPrayerTimes: true,
    showAIPrompts: true,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    immediatelyRender: false,
    content: '',
    onUpdate: ({ editor }) => {
      setNotes(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] p-6 text-sm leading-relaxed custom-scrollbar prose prose-invert max-w-none text-v4-ink',
      },
    },
  });

  useEffect(() => {
    const syncStatus = localStorage.getItem('google_sync_status');
    
    if (syncStatus === 'connected') {
      setIsConnected(true);
      fetchDashboardData();
      loadMissionNotes();
    }

    const savedSettings = localStorage.getItem('murrabi_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setDashboardSettings({
        showWorldClock: parsed.showWorldClock ?? true,
        showPrayerTimes: parsed.showPrayerTimes ?? true,
        showAIPrompts: parsed.showAIPrompts ?? true,
      });
    }
  }, []);

  const fetchDashboardData = async () => {
    setIsSyncing(true);
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        const events = await service.getCalendarEvents();
        setLiveEvents(events);
      } catch (err) {
        console.error('Dashboard sync failed:', err);
      }
    }
    setIsSyncing(false);
  };

  const loadMissionNotes = async () => {
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        const cloudNotes = await service.fetchMissionNotes();
        if (cloudNotes) {
          setNotes(cloudNotes);
          if (editor) editor.commands.setContent(cloudNotes);
        }
      } catch (err) {
        console.error('Failed to load mission notes:', err);
      }
    }
  };

  const handleManualSync = async () => {
    if (!isConnected || !notes) return;
    
    setIsCloudSyncing(true);
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        await service.syncMissionNotes(notes);
      } catch (err) {
        console.error('Cloud sync failed:', err);
      }
    }
    setTimeout(() => setIsCloudSyncing(false), 1000);
  };

  const diagnosticChecks = [
    { label: "System Status", status: "OPERATIONAL", val: "Active Duty", icon: Activity, color: "text-emerald-500" },
    { label: "Active Objectives", status: liveEvents.length + " SYNCED", val: `${liveEvents.length} Tasks Today`, icon: Timer, color: "text-v4-gold" },
    { label: "System Sync", status: isSyncing ? "SYNCING" : "STABLE", val: "Cloud Protocol 4.0", icon: RefreshCw, color: "text-blue-500", animate: isSyncing },
    { label: "Field Integrity", status: "VERIFIED", val: "99.9% Readiness", icon: Shield, color: "text-red-500" }
  ];

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Dashboard</h1>
        </div>
        
        {dashboardSettings.showAIPrompts && (
          <div className="hidden lg:block">
            <QuickLinks variant="compact" />
          </div>
        )}
      </div>

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


      {dashboardSettings.showWorldClock && (
        <section className="flex flex-wrap gap-4 no-drag px-2">
          <WorldClock city="London" timezone="Europe/London" />
          <WorldClock city="New York" timezone="America/New_York" />
          <WorldClock city="Rabwah" timezone="Asia/Karachi" />
          <WorldClock city="Toronto" timezone="America/Toronto" />
        </section>
      )}

      <div className="grid grid-cols-12 gap-12 no-drag form-v4">
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-12 overflow-hidden">
          <section className="glass rounded-[32px] overflow-hidden flex flex-col h-full border border-white/5 shadow-2xl">
            <div className="card-hdr !bg-red-600 !text-white border-b-0 shadow-lg relative z-10 flex items-center gap-3">
              <div className="dot !bg-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]"></div>
              MISSION PROTOCOL • CALENDAR GRID
            </div>
            <div className="card-body">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-v4-rule/30">
                <h2 className="text-xl font-black flex items-center gap-3 text-v4-ink">
                  <Calendar className="text-red-500" size={24} />
                  Operational Log
                </h2>
                <div className="flex bg-black/20 p-1.5 rounded-[14px] border border-white/5">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={clsx(
                      "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-[14px] transition-all border shrink-0",
                      viewMode === 'list' ? "bg-red-600 text-white border-red-500 shadow-lg" : "text-white/30 border-transparent hover:bg-white/5"
                    )}
                  >
                    List
                  </button>
                  <button 
                    onClick={() => setViewMode('calendar')}
                    className={clsx(
                      "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-[14px] transition-all border shrink-0",
                      viewMode === 'calendar' ? "bg-red-600 text-white border-red-500 shadow-lg" : "text-white/30 border-transparent hover:bg-white/5"
                    )}
                  >
                    Grid
                  </button>
                </div>
              </div>
              
              {viewMode === 'list' ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {isConnected && liveEvents.length > 0 ? (
                    liveEvents.map((event: any, i: number) => {
                      const startDate = new Date(event.start?.dateTime || event.start?.date || '');
                      
                      const getGCalColor = (id: string) => {
                        const colors: Record<string, string> = {
                          '1': '#7986cb',
                          '2': '#33b679',
                          '3': '#8e24aa',
                          '4': '#e67c73',
                          '5': '#fbc02d',
                          '6': '#f4511e',
                          '7': '#039be5',
                          '8': '#616161',
                          '9': '#3f51b5',
                          '10': '#0b8043',
                          '11': '#d50000',
                        };
                        return colors[id] || '#d4af37';
                      };

                      const eventColor = event.backgroundColor || getGCalColor(event.colorId);

                      return (
                        <div 
                          key={event.id || i} 
                          className="flex items-start gap-4 p-5 rounded-[12px] bg-white/[0.03] border border-white/5 transition-all duration-500 hover:shadow-xl group no-drag hover:bg-white/[0.05]"
                          style={{ borderColor: `${eventColor}20` }}
                        >
                          <div 
                            className="w-1 rounded-full h-10 transition-all duration-500" 
                            style={{ 
                              backgroundColor: eventColor,
                              boxShadow: `0 0 15px ${eventColor}40`
                            }} 
                          />
                          <div>
                            <h3 className="text-base font-black text-v4-ink tracking-tight group-hover:text-v4-cream transition-colors">
                              {event.summary || 'Untitled Objective'}
                            </h3>
                            <p className="text-[9px] font-black opacity-60 mt-1 uppercase tracking-widest" style={{ color: eventColor }}>
                               {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               {event.location && ` • ${event.location}`}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="flex items-start gap-4 p-5 rounded-[12px] bg-red-600/5 border border-red-500/10 transition-all duration-500 hover:shadow-xl group no-drag">
                        <div className="w-1 bg-red-500 h-10 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                        <div>
                          <h3 className="text-base font-black text-v4-ink tracking-tight">Dhuhr Prayer</h3>
                          <p className="text-[9px] font-black text-red-500/80 mt-1 uppercase tracking-widest">12:45 PM • Main Prayer Hall</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="pt-2">
                  <DashboardCalendar />
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 overflow-hidden">
           {dashboardSettings.showPrayerTimes && <PrayerTimes />}

            <section className="glass rounded-[32px] flex flex-col !p-0 overflow-hidden shadow-2xl group hover:border-red-500/30 transition-all flex-1 border border-white/5">
              <div className="card-hdr !bg-red-600 !text-white border-b-0 shadow-lg relative z-10 flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "dot !bg-white transition-all duration-700 shadow-[0_0_10px_rgba(255,255,255,0.4)]",
                    isCloudSyncing && "animate-pulse scale-150 shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                  )}></div>
                  MISSION NOTES
                </div>

                <div className="flex items-center gap-4">
                  {isConnected && (
                    <button 
                      onClick={handleManualSync}
                      disabled={isCloudSyncing}
                      className={clsx(
                        "px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 active:scale-95",
                        isCloudSyncing ? "bg-accent-soft text-accent-main" : "bg-accent-main text-white shadow-lg shadow-accent-soft hover:bg-accent-hover"
                      )}
                    >
                      {isCloudSyncing ? "Syncing..." : (
                        <>
                          <Save size={10} />
                          Save Dashboard Config
                        </>
                      )}
                    </button>
                  )}
                  <div className="flex items-center gap-2 pr-2 border-l border-white/20 pl-4 ml-2">
                    {isCloudSyncing ? (
                      <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white animate-pulse">Syncing...</span>
                    ) : isConnected && notes ? (
                      <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/50">
                        Stored in Cloud
                      </span>
                    ) : (
                      <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/40">Local Only</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] border-b border-white/5 p-2 flex items-center gap-1">
                <button 
                  onClick={() => editor?.chain().focus().toggleBold().run()} 
                  className={clsx("p-2 rounded hover:bg-accent-main/10 transition-all", editor?.isActive('bold') ? "text-accent-main bg-accent-main/5" : "text-white/40")}
                >
                  <BoldIcon size={14} />
                </button>
                <button 
                  onClick={() => editor?.chain().focus().toggleItalic().run()} 
                  className={clsx("p-2 rounded hover:bg-accent-main/10 transition-all", editor?.isActive('italic') ? "text-accent-main bg-accent-main/5" : "text-white/40")}
                >
                  <ItalicIcon size={14} />
                </button>
                <button 
                  onClick={() => editor?.chain().focus().toggleUnderline().run()} 
                  className={clsx("p-2 rounded hover:bg-accent-main/10 transition-all", editor?.isActive('underline') ? "text-accent-main bg-accent-main/5" : "text-white/40")}
                >
                  <UnderlineIcon size={14} />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button 
                  onClick={() => editor?.chain().focus().toggleBulletList().run()} 
                  className={clsx("p-2 rounded hover:bg-accent-main/10 transition-all", editor?.isActive('bulletList') ? "text-accent-main bg-accent-main/5" : "text-white/40")}
                >
                  <ListIcon size={14} />
                </button>
              </div>
              
              <div className="card-body flex-1 p-0 relative bg-black/20">
                <EditorContent editor={editor} />
                <div className={clsx(
                  "absolute bottom-4 right-6 pointer-events-none transition-all duration-700",
                  isCloudSyncing ? "opacity-30 scale-110 text-v4-gold" : "opacity-10 scale-100"
                )}>
                  <PenTool size={40} />
                </div>
              </div>
            </section>
        </div>

        <div className="col-span-12 h-full">
          <section className="glass rounded-[32px] shadow-xl no-drag h-full border border-white/5 overflow-hidden">
             <div className="card-hdr !bg-red-600 !text-white border-b-0 shadow-lg relative z-10 flex items-center gap-3">
               <div className="dot !bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]"></div>
               MISSION TRANSACTION LOG • AUDIT TRAIL
             </div>
             <div className="card-body h-full p-10">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { icon: PenTool, title: "Mission report saved", time: "10m ago" },
                    { icon: Calendar, title: "Jamat schedule sync", time: "1h ago" },
                    { icon: Mail, title: "Guidance email sent", time: "25m ago" },
                    { icon: Receipt, title: "Expense protocol filed", time: "3h ago" }
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                       <div className="w-12 h-12 bg-accent-soft rounded-xl flex items-center justify-center text-accent-main group-hover:bg-accent-main group-hover:text-white transition-all">
                         <activity.icon size={24} />
                       </div>
                       <div>
                          <p className="font-bold text-v4-ink text-sm tracking-tight">{activity.title}</p>
                          <p className="text-[9px] font-black text-v4-ink-muted uppercase tracking-[0.2em] mt-1">{activity.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
