"use client";
import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Calendar, 
  Table as TableIcon, 
  Activity, 
  Save, 
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutDashboard,
  Cloud,
  CloudOff,
  Minus,
  BookOpen,
  Moon,
  Home
} from "lucide-react";
import { clsx } from "clsx";
import { GoogleSyncService } from '@/lib/google-sync-service';

// --- Types ---
type HabitType = 'toggle' | 'counter';

interface Habit {
  id: string;
  name: string;
  category: 'Spiritual' | 'Scholarly' | 'Health' | 'Admin';
  type: HabitType;
  unit?: string;
  max?: number;
  archived?: boolean;
}

interface HabitLog {
  date: string; // YYYY-MM-DD
  metrics: Record<string, number | boolean>; // habitId -> value
  notes?: string;
}

// --- Default Mission Protocols ---
const DEFAULT_PROTOCOLS: Habit[] = [
  { id: 'prayers_total', name: 'Total Prayers', category: 'Spiritual', type: 'counter', max: 5, unit: 'offered' },
  { id: 'prayers_mosque', name: 'Mosque Attendance', category: 'Spiritual', type: 'counter', max: 5, unit: 'prayers' },
  { id: 'rk_pages', name: 'Ruhani Khazain', category: 'Scholarly', type: 'counter', unit: 'pages' },
  { id: 'tahajjud', name: 'Tahajjud Protocol', category: 'Spiritual', type: 'toggle' },
];

export default function HabitsPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'table' | 'overview'>('form');
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_PROTOCOLS);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  
  // Daily Report State
  const [todayMetrics, setTodayMetrics] = useState<Record<string, number | boolean>>({});
  const [todayNotes, setTodayNotes] = useState('');
  
  // New Habit State
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    name: '',
    category: 'Spiritual',
    type: 'toggle'
  });

  useEffect(() => {
    setIsGuest(localStorage.getItem('murrabi_guest_mode') === 'true');
    loadData();
  }, []);

  const loadData = async () => {
    setIsSyncing(true);
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        // Load Config (Custom Habits)
        const configFiles = await service.listDriveFiles('Habits', 'Config');
        if (configFiles && configFiles.length > 0) {
          const content = await service.getDriveFileContent(configFiles[0].id);
          if (content) {
            const customHabits = JSON.parse(content);
            const merged = [...DEFAULT_PROTOCOLS];
            customHabits.forEach((ch: Habit) => {
              if (!merged.find(m => m.id === ch.id)) merged.push(ch);
            });
            setHabits(merged);
          }
        }

        // Load Logs
        const logFiles = await service.listDriveFiles('Habits', 'Logs');
        if (logFiles && logFiles.length > 0) {
          const content = await service.getDriveFileContent(logFiles[0].id);
          if (content) {
            const parsedLogs = JSON.parse(content);
            setLogs(parsedLogs);
            
            const today = new Date().toISOString().split('T')[0];
            const found = parsedLogs.find((l: HabitLog) => l.date === today);
            if (found) {
              setTodayMetrics(found.metrics || {});
              setTodayNotes(found.notes || '');
            } else {
              const initial: any = {};
              habits.forEach(h => {
                initial[h.id] = h.type === 'counter' ? 0 : false;
              });
              setTodayMetrics(initial);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load habit data:', err);
      }
    }
    setIsSyncing(false);
  };

  const calculateStats = () => {
    if (!logs || logs.length === 0) return { streak: 0, integrity: 0 };

    // Calculate Streak
    let streak = 0;
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let checkDate = (sortedLogs[0]?.date === today) ? today : (sortedLogs[0]?.date === yesterday ? yesterday : null);
    
    if (checkDate) {
      let currentDate = new Date(checkDate);
      for (const log of sortedLogs) {
        const logDate = log.date;
        const expectedDateStr = currentDate.toISOString().split('T')[0];
        if (logDate === expectedDateStr) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate Integrity (Last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const recentLogs = logs.filter(l => l.date >= thirtyDaysAgo);
    const spiritualHabits = habits.filter(h => h.category === 'Spiritual');
    
    let totalScore = 0;
    recentLogs.forEach(log => {
      let dailyScore = 0;
      const relevantSpiritual = spiritualHabits.filter(h => !h.archived || log.metrics[h.id] !== undefined);
      relevantSpiritual.forEach(h => {
        const val = log.metrics[h.id];
        if (typeof val === 'boolean' && val) dailyScore++;
        else if (typeof val === 'number') {
          dailyScore += h.max ? Math.min(1, val / h.max) : (val > 0 ? 1 : 0);
        }
      });
      totalScore += relevantSpiritual.length > 0 ? (dailyScore / relevantSpiritual.length) : 0;
    });

    const integrity = recentLogs.length > 0 ? Math.round((totalScore / recentLogs.length) * 100) : 0;

    return { streak, integrity };
  };

  const { streak, integrity } = calculateStats();

  const saveData = async (updatedHabits?: Habit[], updatedLogs?: HabitLog[]) => {
    setIsSyncing(true);
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        if (updatedHabits) {
          // Only save custom habits to config
          const customOnly = updatedHabits.filter(h => !DEFAULT_PROTOCOLS.find(d => d.id === h.id));
          await service.uploadFile('habit_config.json', JSON.stringify(customOnly), 'application/json', undefined, 'Habits', 'Config');
        }
        if (updatedLogs) {
          await service.uploadFile('habit_logs.json', JSON.stringify(updatedLogs), 'application/json', undefined, 'Habits', 'Logs');
        }
      } catch (err) {
        console.error('Failed to sync data:', err);
      }
    }
    setIsSyncing(false);
  };

  const commitToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    const newLog: HabitLog = {
      date: today,
      metrics: todayMetrics,
      notes: todayNotes
    };

    const existingIdx = logs.findIndex(l => l.date === today);
    let updatedLogs;
    if (existingIdx >= 0) {
      updatedLogs = [...logs];
      updatedLogs[existingIdx] = newLog;
    } else {
      updatedLogs = [newLog, ...logs];
    }

    setLogs(updatedLogs);
    await saveData(undefined, updatedLogs);
    alert("Field Report Committed to Cloud Record.");
  };

  const updateMetric = (id: string, val: number | boolean) => {
    setTodayMetrics(prev => ({ ...prev, [id]: val }));
  };

  const toggleArchiveHabit = async (id: string, archive: boolean = true) => {
    const msg = archive 
      ? "Are you sure you want to archive this mission protocol? It will be hidden from daily reports but historical data will be preserved."
      : "Reactivate this mission protocol?";
      
    if (!confirm(msg)) return;
    
    const updated = habits.map(h => h.id === id ? { ...h, archived: archive } : h);
    setHabits(updated);
    await saveData(updated);
  };

  const addNewHabit = async () => {
    if (!newHabit.name) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      category: newHabit.category as any,
      type: newHabit.type as any,
      unit: newHabit.type === 'counter' ? 'units' : undefined
    };
    const updated = [...habits, habit];
    setHabits(updated);
    await saveData(updated);
    setIsAddingHabit(false);
    setNewHabit({ name: '', category: 'Spiritual', type: 'toggle' });
  };

  return (
    <div className="main-content flex flex-col gap-4 lg:gap-8 pb-12 animate-in fade-in duration-700 h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-0 lg:mb-2">
        <div>
          <h1 className="text-4xl lg:text-5xl xl:text-7xl font-black tracking-tighter italic text-main uppercase">Daily Field Report</h1>
          <p className="text-micro mt-2">Routine Discipline &amp; Spiritual Integrity Protocol</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {isGuest ? (
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
              <CloudOff size={12} className="text-amber-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">Offline (Guest)</span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <Cloud size={12} className="text-emerald-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Sync Active</span>
            </div>
          )}
          
          <div className="flex bg-black/20 p-1 rounded-[14px] border border-white/5 no-drag overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('form')}
              className={clsx(
                "px-6 py-2 rounded-[12px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'form' ? "bg-accent-main text-white shadow-lg shadow-accent-glow" : "text-white/30 hover:bg-white/5"
              )}
            >
              <ClipboardCheck size={14} /> Report
            </button>
            <button 
              onClick={() => setActiveTab('table')}
              className={clsx(
                "px-6 py-2 rounded-[12px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'table' ? "bg-accent-main text-white shadow-lg shadow-accent-glow" : "text-white/30 hover:bg-white/5"
              )}
            >
              <TableIcon size={14} /> Archival
            </button>
            <button 
              onClick={() => setActiveTab('overview')}
              className={clsx(
                "px-6 py-2 rounded-[12px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'overview' ? "bg-accent-main text-white shadow-lg shadow-accent-glow" : "text-white/30 hover:bg-white/5"
              )}
            >
              <Activity size={14} /> Matrix
            </button>
          </div>
          
          <button 
            onClick={loadData}
            disabled={isSyncing}
            className="p-2.5 lg:p-3 rounded-xl glass border border-white/10 text-white/40 hover:text-white transition-all active:scale-95"
          >
            <Save size={16} className={clsx(isSyncing && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar no-drag">
        {activeTab === 'form' && (
          <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="col-span-12 lg:col-span-8 space-y-12">
              {/* Questionnaire Section */}
              <section className="glass rounded-[24px] overflow-hidden border border-white/5 shadow-2xl bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="card-hdr !bg-accent-main !text-white border-b-0 shadow-lg flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">Status: Initializing Daily Check-in</span>
                  </div>
                  <div className="text-[10px] font-black opacity-80 uppercase tracking-widest">
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                
                <div className="p-10 lg:p-16 space-y-16">
                  {habits.filter(h => !h.archived).map((habit, idx) => (
                    <div key={habit.id} className="space-y-6 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                       <div className="flex items-end justify-between border-b border-white/5 pb-4">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-accent-main mb-1">{habit.category}</p>
                            <h3 className="text-2xl font-black italic text-main tracking-tighter">{habit.name}</h3>
                          </div>
                          <div className="flex items-center gap-4">
                            {habit.unit && (
                              <span className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">{habit.unit} recorded</span>
                            )}
                            {!DEFAULT_PROTOCOLS.find(d => d.id === habit.id) && (
                              <button 
                                onClick={() => toggleArchiveHabit(habit.id)}
                                className="p-2 rounded-lg bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                title="Archive Protocol"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                       </div>

                       {habit.type === 'counter' ? (
                         <div className="flex flex-wrap gap-4">
                            {habit.max ? (
                              // Fixed range counters (e.g. 0-5 prayers)
                              Array.from({ length: habit.max + 1 }).map((_, v) => (
                                <button
                                  key={v}
                                  onClick={() => updateMetric(habit.id, v)}
                                  className={clsx(
                                    "w-16 h-16 rounded-2xl font-black transition-all duration-300 border",
                                    todayMetrics[habit.id] === v 
                                      ? "bg-accent-main border-accent-glow text-white shadow-lg shadow-accent-glow scale-110" 
                                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                  )}
                                >
                                  {v}
                                </button>
                              ))
                            ) : (
                              // Open numeric counters (e.g. Pages read)
                              <div className="flex items-center gap-6 bg-white/5 p-4 rounded-3xl border border-white/5">
                                <button 
                                  onClick={() => updateMetric(habit.id, Math.max(0, (todayMetrics[habit.id] as number || 0) - 1))}
                                  className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-all"
                                >
                                  <Minus size={20} />
                                </button>
                                <input 
                                  type="number"
                                  value={todayMetrics[habit.id] as number || 0}
                                  onChange={(e) => updateMetric(habit.id, parseInt(e.target.value) || 0)}
                                  className="bg-transparent text-4xl font-black text-main italic text-center w-24 outline-none"
                                />
                                <button 
                                  onClick={() => updateMetric(habit.id, (todayMetrics[habit.id] as number || 0) + 1)}
                                  className="w-12 h-12 rounded-xl bg-accent-main flex items-center justify-center hover:bg-accent-hover text-white transition-all"
                                >
                                  <Plus size={20} />
                                </button>
                              </div>
                            )}
                         </div>
                       ) : (
                         // Toggle Switch (e.g. Tahajjud)
                         <button 
                           onClick={() => updateMetric(habit.id, !todayMetrics[habit.id])}
                           className={clsx(
                             "w-full h-20 rounded-[24px] border transition-all duration-700 flex items-center px-8 justify-between group overflow-hidden relative",
                             todayMetrics[habit.id] 
                               ? "bg-emerald-600/10 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]" 
                               : "bg-white/5 border-white/5 hover:bg-white/10"
                           )}
                         >
                           {todayMetrics[habit.id] && (
                             <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-transparent pointer-events-none" />
                           )}
                           <span className={clsx(
                             "text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500",
                             todayMetrics[habit.id] ? "text-emerald-500" : "text-white/20"
                           )}>
                             {todayMetrics[habit.id] ? "Protocol Active • Completed" : "Protocol Pending • Inactive"}
                           </span>
                           <div className={clsx(
                             "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-700",
                             todayMetrics[habit.id] ? "bg-emerald-500 text-white rotate-0 scale-110" : "bg-white/10 text-white/20 rotate-[-45deg]"
                           )}>
                             {todayMetrics[habit.id] ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                           </div>
                         </button>
                       )}
                    </div>
                  ))}

                  <div className="pt-12 border-t border-white/5 space-y-6">
                    <label className="text-micro">Field Observations & Reflections</label>
                    <textarea 
                      value={todayNotes}
                      onChange={(e) => setTodayNotes(e.target.value)}
                      placeholder="Enter tactical field notes for today..."
                      className="w-full bg-white/5 border border-white/5 rounded-[14px] p-10 text-lg italic text-white/80 focus:border-accent-glow focus:outline-none min-h-[200px] resize-none transition-all shadow-inner"
                    />
                  </div>

                  <button 
                    onClick={commitToday}
                    className="w-full h-24 btn-ruby rounded-[14px] font-black uppercase tracking-[0.4em] text-[12px] transition-all flex items-center justify-center gap-4 group"
                  >
                    <Save size={20} className="group-hover:scale-125 transition-transform" />
                    Commit Mission Report to Cloud Storage
                  </button>
                </div>
              </section>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-10">
               {/* Dashboard Link */}
               <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full glass p-8 rounded-[14px] border border-white/5 flex items-center gap-6 group hover:border-accent-glow transition-all"
                >
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-accent-main group-hover:text-white transition-all text-white/20">
                     <Home size={28} />
                  </div>
                  <div className="text-left">
                     <h4 className="text-sm font-black text-main italic tracking-tight">Return to HQ</h4>
                     <p className="text-micro mt-1">Exit Field Report Mode</p>
                  </div>
                </button>

               {/* Snapshot */}
               <section className="glass rounded-[14px] p-10 border border-white/5 space-y-8">
                  <h3 className="text-micro border-b border-white/5 pb-4">Protocol Statistics</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-white/5 p-8 rounded-[14px] border border-white/5 group hover:bg-white/[0.08] transition-all">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Archival Streak</p>
                      <h4 className="text-5xl font-black italic text-main mt-2 flex items-baseline gap-2">
                        {streak} <span className="text-[10px] opacity-40 not-italic tracking-[0.2em] uppercase">Solar Days</span>
                      </h4>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[14px] border border-white/5 group hover:bg-white/[0.08] transition-all">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Spiritual Integrity</p>
                      <h4 className="text-5xl font-black italic text-main mt-2 flex items-baseline gap-2">
                        {integrity}<span className="text-2xl opacity-40 italic">%</span>
                      </h4>
                    </div>
                  </div>
                </section>

               {/* Legend & Help */}
               <section className="glass rounded-[14px] p-10 border border-white/5 space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Mission Legend</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Moon size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">Spiritual Protocols</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <BookOpen size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">Scholarly Analytics</span>
                    </div>
                  </div>
               </section>

               {/* Custom Entry Button */}
                <button 
                   onClick={() => setIsAddingHabit(true)}
                   className="w-full h-20 bg-white/5 border border-dashed border-white/10 rounded-[14px] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-main hover:border-accent-main transition-all"
                >
                  <Plus size={16} />
                  Initialize Custom Node
                </button>
            </div>
          </div>
        )}

        {activeTab === 'table' && (
          <section className="glass rounded-[14px] overflow-hidden border border-white/5 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
             <div className="card-hdr !bg-accent-main !text-white border-b-0 shadow-lg flex items-center gap-3 p-8">
                <div className="dot !bg-white"></div>
                MISSION ARCHIVE • TIME-SERIES DATA
             </div>
             <div className="card-body p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-black/40 border-b border-white/10">
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/40">Temporal Marker</th>
                       {habits.map(h => (
                         <th key={h.id} className="p-8 text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[140px]">{h.name}</th>
                       ))}
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-white/40">Field Notes</th>
                     </tr>
                   </thead>
                   <tbody>
                     {logs.map((log, i) => (
                       <tr key={log.date} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                         <td className="p-8">
                           <div className="text-[12px] font-black text-white italic tracking-tight">{log.date}</div>
                         </td>
                         {habits.map(h => (
                           <td key={h.id} className="p-8">
                             {typeof log.metrics?.[h.id] === 'boolean' ? (
                               log.metrics[h.id] ? (
                                 <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active</span>
                               ) : (
                                 <span className="text-white/10 text-[10px] font-black uppercase tracking-widest">Void</span>
                               )
                             ) : (
                               <span className={clsx(
                                 "text-xl font-black italic",
                                 (log.metrics?.[h.id] as number) > 0 ? "text-white" : "text-white/10"
                               )}>
                                 {log.metrics?.[h.id] ?? 0}
                               </span>
                             )}
                           </td>
                         ))}
                         <td className="p-8">
                           <p className="text-[10px] text-white/30 italic truncate max-w-[240px]">{log.notes || 'No archival notes recorded.'}</p>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          </section>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
             <div className="grid grid-cols-12 gap-8">
               <div className="col-span-12 lg:col-span-8">
                 <section className="glass rounded-[14px] p-12 border border-white/5 space-y-12">
                   <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black italic text-main uppercase tracking-tighter">Consistency Matrix</h3>
                     <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2">
                         <div className="w-4 h-4 rounded-[4px] bg-white/5" />
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Inactive</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-4 h-4 rounded-[4px] bg-accent-main shadow-[0_0_15px_var(--accent-glow)]" />
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Operational</span>
                       </div>
                     </div>
                   </div>

                   <div className="flex flex-wrap gap-3">
                      {Array.from({ length: 90 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (89 - i));
                        const dateStr = date.toISOString().split('T')[0];
                        const log = logs.find(l => l.date === dateStr);
                        
                        // Calculate score
                        let score = 0;
                        if (log) {
                          const relevantHabits = habits.filter(h => !h.archived || (log.metrics?.[h.id] !== undefined));
                          const totalHabits = relevantHabits.length || 1;
                          let completed = 0;
                          relevantHabits.forEach(h => {
                            const val = log.metrics?.[h.id];
                            if (typeof val === 'boolean' && val) completed++;
                            if (typeof val === 'number' && val > 0) {
                              const ratio = h.max ? val / h.max : (val > 0 ? 1 : 0);
                              completed += Math.min(1, ratio);
                            }
                          });
                          score = completed / totalHabits;
                        }
                        
                        return (
                          <div 
                            key={i} 
                            title={`${dateStr} | Integrity: ${Math.round(score * 100)}%`}
                            className={clsx(
                              "w-6 h-6 rounded-[6px] transition-all duration-700 cursor-crosshair hover:scale-125 hover:z-10",
                              score === 0 ? "bg-white/5" : 
                              score < 0.4 ? "bg-accent-main/30" :
                              score < 0.8 ? "bg-accent-main/60" : "bg-accent-main shadow-[0_0_20px_var(--accent-glow)]"
                            )}
                          />
                        );
                      })}
                   </div>
                 </section>
                 <section className="glass rounded-[14px] p-12 border border-white/5 space-y-12">
                    <h3 className="text-2xl font-black italic text-main uppercase tracking-tighter">Protocol Inventory</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {habits.map((habit) => (
                        <div key={habit.id} className={clsx(
                          "glass p-8 rounded-[14px] border transition-all flex items-center justify-between group",
                          habit.archived ? "opacity-40 border-white/5" : "border-white/5 hover:border-accent-main"
                        )}>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{habit.category}</p>
                            <h4 className="text-lg font-black italic text-main mt-1">{habit.name}</h4>
                          </div>
                          <button 
                            onClick={() => toggleArchiveHabit(habit.id, !habit.archived)}
                            className={clsx(
                              "px-6 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                              habit.archived 
                                ? "bg-accent-main text-white hover:bg-accent-hover" 
                                : "bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-500"
                            )}
                          >
                            {habit.archived ? 'Reactivate' : 'Archive'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
                
                <div className="col-span-12 lg:col-span-4">
                  <section className="glass rounded-[14px] p-12 border border-white/5 bg-gradient-to-br from-accent-soft via-transparent to-transparent h-full flex flex-col justify-center">
                    <TrendingUp size={48} className="text-accent-main mb-8" />
                    <h3 className="text-3xl font-black italic text-main uppercase tracking-tighter leading-tight mb-6">
                      Tactical<br />Performance<br />Summary
                    </h3>
                    <p className="text-micro leading-relaxed text-white/50 mb-8">
                      Your routine discipline protocols are synchronized across the Murrabi Desk neural network. Maintain consistency to ensure mission success.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-accent-main shadow-[0_0_10px_var(--accent-glow)]" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-main">{habits.filter(h => !h.archived).length} Active Nodes</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-white/10" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{habits.filter(h => h.archived).length} Archived Nodes</span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Add Habit Overlay */}
      {isAddingHabit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsAddingHabit(false)} />
           <div className="relative z-[110] glass p-12 rounded-[24px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-lg animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-accent-main rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent-glow">
                       <Plus size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-main italic tracking-tighter uppercase">Initialize Protocol</h3>
                       <p className="text-micro mt-1">Define New Discipline Objective</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                  <div className="space-y-3">
                     <label className="lbl">Protocol Identifier (Name)</label>
                     <input 
                       type="text" 
                       placeholder="e.g. Exercise, Reading, Research"
                       value={newHabit.name}
                       onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                       autoFocus
                       className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-lg font-bold text-main focus:border-accent-main transition-all shadow-inner"
                     />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                         <label className="lbl">Sector Alignment</label>
                         <select 
                           value={newHabit.category}
                           onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value as any })}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm font-bold text-main focus:border-accent-main transition-all appearance-none"
                         >
                           <option value="Spiritual">Spiritual</option>
                           <option value="Scholarly">Scholarly</option>
                           <option value="Health">Health</option>
                           <option value="Admin">Admin</option>
                         </select>
                     </div>
                     <div className="space-y-3">
                         <label className="lbl">Telemetry Type</label>
                         <select 
                           value={newHabit.type}
                           onChange={(e) => setNewHabit({ ...newHabit, type: e.target.value as any })}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm font-bold text-main focus:border-accent-main transition-all appearance-none"
                         >
                           <option value="toggle">Toggle (Yes/No)</option>
                           <option value="counter">Counter (Numeric)</option>
                         </select>
                     </div>
                  </div>
      
                 <button 
                   onClick={addNewHabit}
                   className="w-full h-20 mt-8 btn-ruby rounded-[14px] font-black uppercase tracking-[0.4em] text-[12px] transition-all"
                 >
                   Establish Mission Node
                 </button>
              </div>
           </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.15);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.3);
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}</style>
    </div>
  );
}
