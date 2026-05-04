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
  CloudOff
} from "lucide-react";
import { clsx } from "clsx";
import { GoogleSyncService } from '@/lib/google-sync-service';

// --- Types ---
interface Habit {
  id: string;
  name: string;
  category: 'Spiritual' | 'Scholarly' | 'Health' | 'Admin';
  frequency: 'daily' | 'weekly';
}

interface HabitLog {
  date: string; // YYYY-MM-DD
  habits: Record<string, boolean>; // habitId -> completed
  notes?: string;
}

// --- Components ---

export default function HabitsPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'table' | 'overview'>('form');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [todayLog, setTodayLog] = useState<Record<string, boolean>>({});
  const [todayNotes, setTodayNotes] = useState('');
  
  // New Habit State
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    name: '',
    category: 'Spiritual',
    frequency: 'daily'
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
        // Load Config
        const configFiles = await service.listDriveFiles('habits', 'config');
        if (configFiles && configFiles.length > 0) {
          const content = await service.getDriveFileContent(configFiles[0].id);
          if (content) setHabits(JSON.parse(content));
        }

        // Load Logs
        const logFiles = await service.listDriveFiles('habits', 'logs');
        if (logFiles && logFiles.length > 0) {
          const content = await service.getDriveFileContent(logFiles[0].id);
          if (content) {
            const parsedLogs = JSON.parse(content);
            setLogs(parsedLogs);
            
            // Check for today's log
            const today = new Date().toISOString().split('T')[0];
            const found = parsedLogs.find((l: HabitLog) => l.date === today);
            if (found) {
              setTodayLog(found.habits || {});
              setTodayNotes(found.notes || '');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load habit data:', err);
      }
    }
    setIsSyncing(false);
  };

  const saveData = async (updatedHabits?: Habit[], updatedLogs?: HabitLog[]) => {
    setIsSyncing(true);
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        if (updatedHabits) {
          await service.uploadFile('habit_config.json', JSON.stringify(updatedHabits), 'application/json', 'Murrabi/Habits', 'habits', 'config');
        }
        if (updatedLogs) {
          await service.uploadFile('habit_logs.json', JSON.stringify(updatedLogs), 'application/json', 'Murrabi/Habits', 'habits', 'logs');
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
      habits: todayLog,
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
    alert("Mission Entry Committed to Cloud Record.");
  };

  const addNewHabit = async () => {
    if (!newHabit.name) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      category: newHabit.category as any,
      frequency: newHabit.frequency as any,
    };
    const updated = [...habits, habit];
    setHabits(updated);
    await saveData(updated);
    setIsAddingHabit(false);
    setNewHabit({ name: '', category: 'Spiritual', frequency: 'daily' });
  };

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Discipline Protocol</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 opacity-60 mt-1">Operational Habit Tracking System</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isGuest ? (
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
              <CloudOff size={12} className="text-amber-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">Offline Mode (Guest)</span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <Cloud size={12} className="text-emerald-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Cloud Sync Protocol Active</span>
            </div>
          )}
          
          <div className="flex bg-black/20 p-1 rounded-[14px] border border-white/5 no-drag">
            <button 
              onClick={() => setActiveTab('form')}
              className={clsx(
                "px-6 py-2 rounded-[12px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'form' ? "bg-red-600 text-white shadow-lg" : "text-white/30 hover:bg-white/5"
              )}
            >
              <ClipboardCheck size={14} />
              Daily Report
            </button>
            <button 
              onClick={() => setActiveTab('table')}
              className={clsx(
                "px-6 py-2 rounded-[12px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'table' ? "bg-red-600 text-white shadow-lg" : "text-white/30 hover:bg-white/5"
              )}
            >
              <TableIcon size={14} />
              Mission Table
            </button>
            <button 
              onClick={() => setActiveTab('overview')}
              className={clsx(
                "px-6 py-2 rounded-[12px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'overview' ? "bg-red-600 text-white shadow-lg" : "text-white/30 hover:bg-white/5"
              )}
            >
              <Activity size={14} />
              Overview
            </button>
          </div>
          
          <button 
            onClick={loadData}
            disabled={isSyncing}
            className="p-3 rounded-xl glass border border-white/10 text-white/40 hover:text-white transition-all active:scale-95"
          >
            <Save size={18} className={clsx(isSyncing && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar no-drag">
        {activeTab === 'form' && (
          <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Daily Entry Card */}
              <section className="glass rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                <div className="card-hdr !bg-red-600 !text-white border-b-0 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="dot !bg-white"></div>
                    DAILY FIELD REPORT • {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                  </div>
                  <button 
                    onClick={() => setIsAddingHabit(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-[8px] font-black uppercase"
                  >
                    <Plus size={12} />
                    New Node
                  </button>
                </div>
                
                <div className="card-body p-10 space-y-10">
                  {habits.length === 0 ? (
                    <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                      <LayoutDashboard size={48} />
                      <p className="text-xs font-black uppercase tracking-widest">No Discipline Nodes Initialized</p>
                      <button 
                        onClick={() => setIsAddingHabit(true)}
                        className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase mt-4"
                      >
                        Create First Habit
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {habits.map((habit) => (
                        <div 
                          key={habit.id}
                          onClick={() => setTodayLog(prev => ({ ...prev, [habit.id]: !prev[habit.id] }))}
                          className={clsx(
                            "group cursor-pointer p-6 rounded-[22px] border transition-all duration-500 flex items-center justify-between",
                            todayLog[habit.id] 
                              ? "bg-red-600/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
                              : "bg-white/5 border-white/5 hover:bg-white/10"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={clsx(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                              todayLog[habit.id] ? "bg-red-600 text-white" : "bg-white/5 text-white/20"
                            )}>
                              {todayLog[habit.id] ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white italic tracking-tight">{habit.name}</h3>
                              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">{habit.category}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Mission Observations (Notes)</label>
                    <textarea 
                      value={todayNotes}
                      onChange={(e) => setTodayNotes(e.target.value)}
                      placeholder="Enter field notes for today..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm italic text-white/80 focus:border-red-600/30 focus:outline-none h-32 resize-none transition-all"
                    />
                  </div>

                  <button 
                    onClick={commitToday}
                    className="w-full h-16 bg-red-600 rounded-[22px] font-black uppercase tracking-[0.3em] text-[11px] text-white shadow-2xl shadow-red-900/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <Save size={16} />
                    Commit Today's Progress to Cloud
                  </button>
                </div>
              </section>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-8">
               {/* Quick Stats */}
               <section className="glass rounded-[32px] p-8 border border-white/5 space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500">Performance Snapshot</h3>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Active Streaks</p>
                      <h4 className="text-3xl font-black italic text-white mt-1">12 <span className="text-[10px] opacity-40 not-italic">Days</span></h4>
                    </div>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Operational Integrity</p>
                      <h4 className="text-3xl font-black italic text-white mt-1">84<span className="text-[10px] opacity-40 not-italic">%</span></h4>
                    </div>
                 </div>
               </section>

               {/* Mission Legend */}
               <section className="glass rounded-[32px] p-8 border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Protocol Legend</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Spiritual', color: 'bg-amber-500' },
                      { label: 'Scholarly', color: 'bg-blue-500' },
                      { label: 'Health', color: 'bg-emerald-500' },
                      { label: 'Admin', color: 'bg-purple-500' }
                    ].map(cat => (
                      <div key={cat.label} className="flex items-center gap-3">
                        <div className={clsx("w-2 h-2 rounded-full", cat.color)} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{cat.label}</span>
                      </div>
                    ))}
                  </div>
               </section>
            </div>
          </div>
        )}

        {activeTab === 'table' && (
          <section className="glass rounded-[32px] overflow-hidden border border-white/5 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
             <div className="card-hdr !bg-red-600 !text-white border-b-0 shadow-lg flex items-center gap-3">
                <div className="dot !bg-white"></div>
                MISSION DATA GRID • ARCHIVAL LOGS
             </div>
             <div className="card-body p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-black/40 border-b border-white/10">
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                       {habits.map(h => (
                         <th key={h.id} className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[120px]">{h.name}</th>
                       ))}
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Observations</th>
                     </tr>
                   </thead>
                   <tbody>
                     {logs.map((log, i) => (
                       <tr key={log.date} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                         <td className="p-6">
                           <div className="text-[11px] font-black text-white italic tracking-tight">{log.date}</div>
                         </td>
                         {habits.map(h => (
                           <td key={h.id} className="p-6">
                             {log.habits?.[h.id] ? (
                               <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                 <CheckCircle2 size={12} /> Success
                               </div>
                             ) : (
                               <div className="flex items-center gap-2 text-white/10 text-[9px] font-black uppercase tracking-widest">
                                 <XCircle size={12} /> Failed
                               </div>
                             )}
                           </td>
                         ))}
                         <td className="p-6">
                           <p className="text-[10px] text-white/40 italic truncate max-w-[200px]">{log.notes || '—'}</p>
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
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-12 gap-8">
               <div className="col-span-12 lg:col-span-8">
                 <section className="glass rounded-[32px] p-10 border border-white/5 space-y-8">
                   <div className="flex items-center justify-between">
                     <h3 className="text-xl font-black italic text-white uppercase">Consistency Matrix</h3>
                     <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded bg-white/5" />
                         <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Minimal</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded bg-red-600" />
                         <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Peak Duty</span>
                       </div>
                     </div>
                   </div>

                   {/* Simple Grid Representation */}
                   <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 90 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (89 - i));
                        const dateStr = date.toISOString().split('T')[0];
                        const log = logs.find(l => l.date === dateStr);
                        const intensity = log ? Object.values(log.habits || {}).filter(Boolean).length / (habits.length || 1) : 0;
                        
                        return (
                          <div 
                            key={i} 
                            title={dateStr}
                            className={clsx(
                              "w-4 h-4 rounded-[3px] transition-all duration-500",
                              intensity === 0 ? "bg-white/5" : 
                              intensity < 0.5 ? "bg-red-600/30" :
                              intensity < 0.8 ? "bg-red-600/60" : "bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                            )}
                          />
                        );
                      })}
                   </div>
                 </section>
               </div>
               
               <div className="col-span-12 lg:col-span-4 space-y-8">
                  <section className="glass rounded-[32px] p-8 border border-white/5 bg-gradient-to-br from-red-600/10 to-transparent">
                     <TrendingUp size={32} className="text-red-500 mb-4" />
                     <h3 className="text-2xl font-black italic text-white leading-tight">Mission Integrity Level: ALPHA</h3>
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Current performance exceeds standard protocols.</p>
                  </section>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Add Habit Overlay */}
      {isAddingHabit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddingHabit(false)} />
           <div className="relative z-[110] glass p-10 rounded-[40px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] w-full max-w-md animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600">
                       <Plus size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Initialize Node</h3>
                       <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Define New Discipline Parameter</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 form-v4">
                 <div className="space-y-2">
                    <label className="lbl">Protocol Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Morning Adhkar"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                      autoFocus
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:border-red-600/30 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="lbl">Category Alignment</label>
                    <select 
                      value={newHabit.category}
                      onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:border-red-600/30 transition-all appearance-none"
                    >
                      <option value="Spiritual">Spiritual</option>
                      <option value="Scholarly">Scholarly</option>
                      <option value="Health">Health</option>
                      <option value="Admin">Admin</option>
                    </select>
                 </div>
                 
                 <button 
                   onClick={addNewHabit}
                   className="w-full h-16 mt-4 bg-red-600 rounded-[22px] font-black uppercase tracking-[0.3em] text-[11px] text-white shadow-2xl shadow-red-900/40 active:scale-[0.98] transition-all"
                 >
                   Establish Protocol Node
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
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.2);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </div>
  );
}
