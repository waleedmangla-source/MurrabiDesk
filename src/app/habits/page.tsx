"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  Table as TableIcon, 
  Activity, 
  Save, 
  Search,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Minus,
  Moon,
  Loader2,
  Layers,
  FileText,
  Flame,
  X
} from "lucide-react";
import { clsx } from "clsx";
import { GoogleSyncService } from '@/lib/google-sync-service';

// --- Types ---
type HabitType = 'toggle' | 'counter';
type HabitCategory = 'Spiritual' | 'Scholarly' | 'Health' | 'Admin';

interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
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
  const [activeTab, setActiveTab] = useState<'matrix' | 'table'>('matrix');
  const [mobileView, setMobileView] = useState<'form' | 'workspace'>('form');
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_PROTOCOLS);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  
  // Date State for Daily Form
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Daily Form State
  const [formMetrics, setFormMetrics] = useState<Record<string, number | boolean>>({});
  const [formNotes, setFormNotes] = useState('');

  // Table Search Filter
  const [searchTable, setSearchTable] = useState('');
  
  // New Habit Modal State
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    name: '',
    category: 'Spiritual',
    type: 'toggle',
    max: 5,
    unit: ''
  });

  // Initialize
  useEffect(() => {
    setIsGuest(localStorage.getItem('murabbi_guest_mode') === 'true');
    loadData();
  }, []);

  // Update form state when selectedDate or logs change
  useEffect(() => {
    const found = logs.find(l => l.date === selectedDate);
    if (found) {
      setFormMetrics(found.metrics || {});
      setFormNotes(found.notes || '');
    } else {
      const initial: Record<string, number | boolean> = {};
      habits.forEach(h => {
        initial[h.id] = h.type === 'counter' ? 0 : false;
      });
      setFormMetrics(initial);
      setFormNotes('');
    }
  }, [selectedDate, logs, habits]);

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
            const parsedLogs: HabitLog[] = JSON.parse(content);
            parsedLogs.sort((a, b) => b.date.localeCompare(a.date));
            setLogs(parsedLogs);
          }
        }
      } catch (err) {
        console.error('Failed to load habit data from Drive:', err);
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
          const customOnly = updatedHabits.filter(h => !DEFAULT_PROTOCOLS.find(d => d.id === h.id));
          await service.uploadFile('habit_config.json', JSON.stringify(customOnly), 'application/json', undefined, 'Habits', 'Config');
        }
        if (updatedLogs) {
          await service.uploadFile('habit_logs.json', JSON.stringify(updatedLogs), 'application/json', undefined, 'Habits', 'Logs');
        }
      } catch (err) {
        console.error('Failed to sync data to Drive:', err);
      }
    }
    setIsSyncing(false);
  };

  const commitReport = async () => {
    setIsCommitting(true);
    const newLog: HabitLog = {
      date: selectedDate,
      metrics: formMetrics,
      notes: formNotes
    };

    const existingIdx = logs.findIndex(l => l.date === selectedDate);
    let updatedLogs: HabitLog[];
    if (existingIdx >= 0) {
      updatedLogs = [...logs];
      updatedLogs[existingIdx] = newLog;
    } else {
      updatedLogs = [newLog, ...logs];
    }

    updatedLogs.sort((a, b) => b.date.localeCompare(a.date));
    setLogs(updatedLogs);
    await saveData(undefined, updatedLogs);
    
    setIsCommitting(false);
    setCommitSuccess(true);
    setTimeout(() => setCommitSuccess(false), 2500);
  };

  const updateMetric = (id: string, val: number | boolean) => {
    setFormMetrics(prev => ({ ...prev, [id]: val }));
  };

  const addNewHabit = async () => {
    if (!newHabit.name?.trim()) return;
    const habit: Habit = {
      id: `habit_${Date.now()}`,
      name: newHabit.name.trim(),
      category: newHabit.category as HabitCategory,
      type: newHabit.type as HabitType,
      unit: newHabit.unit?.trim() || (newHabit.type === 'counter' ? 'units' : undefined),
      max: newHabit.type === 'counter' && newHabit.max ? Number(newHabit.max) : undefined
    };
    const updated = [...habits, habit];
    setHabits(updated);
    await saveData(updated);
    setIsAddingHabit(false);
    setNewHabit({ name: '', category: 'Spiritual', type: 'toggle', max: 5, unit: '' });
  };

  // Date Navigation Helpers
  const shiftDate = (days: number) => {
    const parts = selectedDate.split('-');
    const current = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    current.setDate(current.getDate() + days);
    const dateStr = current.toISOString().split('T')[0];
    setSelectedDate(dateStr);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isToday = selectedDate === todayStr;

  const formattedSelectedDate = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const hasLogForSelectedDate = useMemo(() => {
    return logs.some(l => l.date === selectedDate);
  }, [logs, selectedDate]);

  // Telemetry & Statistics
  const { streak, integrity, totalLoggedDays } = useMemo(() => {
    if (!logs || logs.length === 0) return { streak: 0, integrity: 0, totalLoggedDays: 0 };

    let streakCount = 0;
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let checkDate = (sortedLogs[0]?.date === todayStr) ? todayStr : (sortedLogs[0]?.date === yesterday ? yesterday : null);
    
    if (checkDate) {
      let currentDate = new Date(checkDate);
      for (const log of sortedLogs) {
        const expectedDateStr = currentDate.toISOString().split('T')[0];
        if (log.date === expectedDateStr) {
          streakCount++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

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

    const calculatedIntegrity = recentLogs.length > 0 ? Math.round((totalScore / recentLogs.length) * 100) : 0;

    return { 
      streak: streakCount, 
      integrity: calculatedIntegrity,
      totalLoggedDays: logs.length
    };
  }, [logs, habits, todayStr]);

  const activeHabits = useMemo(() => habits.filter(h => !h.archived), [habits]);

  const filteredTableLogs = useMemo(() => {
    if (!searchTable.trim()) return logs;
    const q = searchTable.toLowerCase();
    return logs.filter(l => l.date.includes(q) || (l.notes && l.notes.toLowerCase().includes(q)));
  }, [logs, searchTable]);

  return (
    <div className="flex flex-col lg:flex-row min-h-dvh lg:h-screen lg:overflow-hidden bg-transparent">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          PANEL 1: SECONDARY SIDEBAR — Sized & Styled exactly like Mail tab (w-[240px])
          Desktop: Fixed width sidebar | Mobile: Displayed when mobileView === 'form'
         ────────────────────────────────────────────────────────────────────────── */}
      <div 
        className={clsx(
          "w-full lg:w-[240px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20 secondary-sidebar",
          mobileView === 'form' ? "flex" : "hidden lg:flex"
        )}
      >
        {/* Sidebar Title — Identical to Mail Tab Header */}
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Routine
          </h1>
        </div>
        
        {/* Date Navigator & Status Strip — Styled like Mail Tab's Account Section */}
        <div className="px-5 pt-1 pb-4 border-b border-white/5 mb-2">
          <div className="flex items-center justify-between gap-1 py-1">
            <button 
              onClick={() => shiftDate(-1)} 
              className="p-1 rounded-md hover:bg-black/20 text-[var(--text-dim)] hover:text-white transition-all"
              title="Previous Day"
            >
              <ChevronLeft size={13} />
            </button>

            <button 
              onClick={() => setSelectedDate(todayStr)} 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-black/20 transition-all text-left"
              title="Click to jump to today"
            >
              <span className="text-xs font-black italic text-white tracking-tight">
                {formattedSelectedDate}
              </span>
              {isToday ? (
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--accent-main)] bg-[var(--accent-soft)] px-1 rounded">
                  Today
                </span>
              ) : (
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/30">
                  {selectedDate.split('-')[0]}
                </span>
              )}
            </button>

            <button 
              onClick={() => shiftDate(1)} 
              className="p-1 rounded-md hover:bg-black/20 text-[var(--text-dim)] hover:text-white transition-all"
              title="Next Day"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="flex items-center justify-between px-1 mt-1">
            <span className={clsx(
              "text-[8px] font-bold uppercase tracking-widest",
              hasLogForSelectedDate ? "text-emerald-400" : "text-[var(--text-dim)]"
            )}>
              {hasLogForSelectedDate ? "• Recorded" : "• Pending"}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
              {isGuest ? "Local" : "Cloud Sync"}
            </span>
          </div>
        </div>

        {/* Clean, Non-Boxy Daily Protocol Form List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-3 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)]">
              Daily Protocols
            </span>
            <button
              onClick={() => setIsAddingHabit(true)}
              className="text-[8px] font-bold uppercase tracking-wider text-[var(--accent-main)] hover:underline flex items-center gap-0.5"
            >
              <Plus size={10} /> Node
            </button>
          </div>

          {activeHabits.map((habit) => {
            return (
              <div key={habit.id} className="space-y-1.5">
                {/* Header label */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black italic text-white tracking-tight truncate max-w-[140px]">
                    {habit.name}
                  </span>
                  {habit.type === 'counter' && habit.max && (
                    <span className="text-[9px] font-bold text-[var(--text-dim)]">
                      {formMetrics[habit.id] ?? 0}/{habit.max}
                    </span>
                  )}
                  {habit.type === 'counter' && !habit.max && habit.unit && (
                    <span className="text-[8px] font-bold text-[var(--text-dim)] uppercase">
                      {habit.unit}
                    </span>
                  )}
                </div>

                {/* Direct Control without heavy card packaging */}
                {habit.type === 'counter' ? (
                  habit.max ? (
                    /* Segmented Control (e.g. 0-5 for prayers) */
                    <div className="grid grid-cols-6 gap-0.5 bg-black/20 p-0.5 rounded-lg border border-white/5">
                      {Array.from({ length: habit.max + 1 }).map((_, v) => {
                        const isSelected = formMetrics[habit.id] === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => updateMetric(habit.id, v)}
                            className={clsx(
                              "h-7 rounded text-[10px] font-black transition-all flex items-center justify-center",
                              isSelected
                                ? "bg-[var(--accent-main)] text-white shadow-sm font-bold"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Clean Stepper (e.g. Ruhani Khazain pages) */
                    <div className="flex items-center justify-between bg-black/20 p-1 rounded-lg border border-white/5">
                      <button
                        type="button"
                        onClick={() => updateMetric(habit.id, Math.max(0, ((formMetrics[habit.id] as number) || 0) - 1))}
                        className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all active:scale-95"
                      >
                        <Minus size={11} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={formMetrics[habit.id] ?? 0}
                        onChange={(e) => updateMetric(habit.id, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 bg-transparent text-center font-black text-sm text-white italic outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateMetric(habit.id, ((formMetrics[habit.id] as number) || 0) + 1)}
                        className="w-6 h-6 rounded bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-all active:scale-95"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  )
                ) : (
                  /* Clean Toggle Switch (e.g. Tahajjud) */
                  <button
                    type="button"
                    onClick={() => updateMetric(habit.id, !formMetrics[habit.id])}
                    className={clsx(
                      "w-full px-2.5 py-1.5 rounded-lg border transition-all flex items-center justify-between text-left",
                      formMetrics[habit.id]
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5"
                    )}
                  >
                    <span className="text-[10px] font-bold">
                      {formMetrics[habit.id] ? "Completed" : "Pending"}
                    </span>
                    <div 
                      className={clsx(
                        "w-7 h-4 rounded-full transition-colors relative p-0.5",
                        formMetrics[habit.id] ? "bg-emerald-500" : "bg-white/10"
                      )}
                    >
                      <div 
                        className={clsx(
                          "w-3 h-3 rounded-full bg-white transition-transform shadow-xs",
                          formMetrics[habit.id] ? "translate-x-3" : "translate-x-0"
                        )} 
                      />
                    </div>
                  </button>
                )}
              </div>
            );
          })}

          {/* Daily Field Notes */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)]">
              Daily Notes
            </span>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Tactical observations..."
              rows={3}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-dim)]/40 focus:border-[var(--accent-main)] outline-none resize-none transition-all"
            />
          </div>
        </div>

        {/* Sidebar Footer: Commit to Record Button */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-black/10">
          <button
            type="button"
            onClick={commitReport}
            disabled={isCommitting}
            className="w-full py-2.5 btn-ruby rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow transition-all active:scale-95 disabled:opacity-50"
          >
            {isCommitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Committing...</span>
              </>
            ) : commitSuccess ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-300" />
                <span>Committed!</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span>Commit Record</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          PANEL 2: MAIN WORKSPACE (Matrix & Table View)
          Desktop: Pinned right canvas | Mobile: Displayed when mobileView === 'workspace'
         ────────────────────────────────────────────────────────────────────────── */}
      <div 
        className={clsx(
          "flex-1 flex-col h-full overflow-hidden bg-transparent",
          mobileView === 'workspace' ? "flex" : "hidden lg:flex"
        )}
      >
        {/* Workspace Top Navigation Bar */}
        <header className="px-6 lg:px-8 pt-8 pb-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-black/10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tighter italic text-[var(--text-main)] uppercase leading-none">
              Daily Field Report
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] mt-1 flex items-center gap-2">
              Routine Discipline &amp; Spiritual Integrity Protocol
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Tab Switcher: Matrix vs Table */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 no-drag">
              <button
                onClick={() => setActiveTab('matrix')}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                  activeTab === 'matrix' 
                    ? "bg-[var(--accent-main)] text-white shadow-md shadow-[var(--accent-glow)]" 
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <Activity size={13} /> Matrix
              </button>

              <button
                onClick={() => setActiveTab('table')}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                  activeTab === 'table' 
                    ? "bg-[var(--accent-main)] text-white shadow-md shadow-[var(--accent-glow)]" 
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <TableIcon size={13} /> Table
              </button>
            </div>

            {/* Sync Refresh Button */}
            <button
              onClick={loadData}
              disabled={isSyncing}
              className="p-2 rounded-xl glass border border-white/10 text-white/40 hover:text-white transition-all active:scale-95"
              title="Refresh and sync cloud data"
            >
              <Save size={14} className={clsx(isSyncing && "animate-spin text-[var(--accent-main)]")} />
            </button>
          </div>
        </header>

        {/* Mobile Sub-Navigation Bar (Switches between Sidebar Form & Workspace) */}
        <div className="lg:hidden flex border-b border-white/5 bg-black/30 p-1">
          <button
            onClick={() => setMobileView('form')}
            className={clsx(
              "flex-1 py-2 text-center text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              mobileView === 'form' ? "bg-[var(--accent-main)] text-white" : "text-white/40"
            )}
          >
            Daily Form
          </button>
          <button
            onClick={() => setMobileView('workspace')}
            className={clsx(
              "flex-1 py-2 text-center text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              mobileView === 'workspace' ? "bg-[var(--accent-main)] text-white" : "text-white/40"
            )}
          >
            Ledger &amp; Matrix
          </button>
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-8 no-drag">
          
          {/* TAB 1: MATRIX & TELEMETRY */}
          {activeTab === 'matrix' && (
            <div className="space-y-8 animate-in fade-in duration-300 pb-16">
              
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-main)] shrink-0">
                    <Flame size={24} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                      Archival Streak
                    </span>
                    <h3 className="text-3xl font-black italic text-[var(--text-main)] tracking-tight mt-0.5">
                      {streak} <span className="text-xs font-bold not-italic opacity-40">Days</span>
                    </h3>
                  </div>
                </div>

                <div className="glass rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                      Spiritual Integrity
                    </span>
                    <h3 className="text-3xl font-black italic text-[var(--text-main)] tracking-tight mt-0.5">
                      {integrity}<span className="text-lg font-bold opacity-50">%</span>
                    </h3>
                  </div>
                </div>

                <div className="glass rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <Layers size={24} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                      Active Protocols
                    </span>
                    <h3 className="text-3xl font-black italic text-[var(--text-main)] tracking-tight mt-0.5">
                      {activeHabits.length} <span className="text-xs font-bold not-italic opacity-40">Nodes</span>
                    </h3>
                  </div>
                </div>

                <div className="glass rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                      Total Field Logs
                    </span>
                    <h3 className="text-3xl font-black italic text-[var(--text-main)] tracking-tight mt-0.5">
                      {totalLoggedDays} <span className="text-xs font-bold not-italic opacity-40">Records</span>
                    </h3>
                  </div>
                </div>
              </div>

              {/* 90-Day Consistency Matrix Heatmap */}
              <section className="glass rounded-2xl p-6 lg:p-8 border border-white/5 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black italic text-[var(--text-main)] uppercase tracking-tight">
                      Consistency Matrix (90 Days)
                    </h3>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-dim)] mt-0.5">
                      Visual compliance across daily spiritual &amp; mission protocols
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-[3px] bg-white/5" />
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">0%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-[3px] bg-[var(--accent-main)] opacity-30" />
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">&lt;50%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-[3px] bg-[var(--accent-main)] shadow-[0_0_10px_var(--accent-glow)]" />
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">100%</span>
                    </div>
                  </div>
                </div>

                {/* Heatmap Grid */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {Array.from({ length: 90 }).map((_, i) => {
                    const dateObj = new Date();
                    dateObj.setDate(dateObj.getDate() - (89 - i));
                    const dateStr = dateObj.toISOString().split('T')[0];
                    const log = logs.find(l => l.date === dateStr);
                    
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
                    
                    const isCurrentFormDate = dateStr === selectedDate;

                    return (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateStr);
                          if (window.innerWidth < 1024) setMobileView('form');
                        }}
                        title={`${dateStr} • ${Math.round(score * 100)}% Protocol Integrity`}
                        className={clsx(
                          "w-5 h-5 rounded-[4px] transition-all duration-300 hover:scale-125 hover:z-10 relative cursor-pointer",
                          isCurrentFormDate && "ring-2 ring-[var(--accent-main)] ring-offset-2 ring-offset-black scale-110",
                          score === 0 ? "bg-white/5 hover:bg-white/10" : 
                          score < 0.4 ? "bg-[var(--accent-main)]/30" :
                          score < 0.8 ? "bg-[var(--accent-main)]/60" : "bg-[var(--accent-main)] shadow-[0_0_12px_var(--accent-glow)]"
                        )}
                      />
                    );
                  })}
                </div>
                <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest pt-2">
                  * Click any node to load and inspect that day's field report in the sidebar.
                </div>
              </section>

              {/* Protocol Summaries */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="glass rounded-2xl p-6 border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Moon size={18} />
                    </div>
                    <div>
                      <h4 className="text-base font-black italic text-[var(--text-main)] uppercase tracking-tight">
                        Spiritual Disciplines
                      </h4>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                        Obligatory &amp; Voluntary Devotions
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    {habits.filter(h => h.category === 'Spiritual' && !h.archived).map(h => (
                      <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-xs font-bold text-[var(--text-main)]">{h.name}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">
                          {h.type === 'counter' ? `0–${h.max || 'N/A'} ${h.unit || ''}` : 'Toggle'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="glass rounded-2xl p-6 border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h4 className="text-base font-black italic text-[var(--text-main)] uppercase tracking-tight">
                        Scholarly &amp; Mission Nodes
                      </h4>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                        Intellectual &amp; Administrative Consistency
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    {habits.filter(h => h.category !== 'Spiritual' && !h.archived).map(h => (
                      <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-xs font-bold text-[var(--text-main)]">{h.name}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-400">
                          {h.category} • {h.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* TAB 2: TABLE VIEW */}
          {activeTab === 'table' && (
            <div className="space-y-6 animate-in fade-in duration-300 pb-16">
              {/* Search & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 glass p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5 bg-black/20 px-3 py-2 rounded-lg border border-white/5 w-full sm:w-80">
                  <Search size={14} className="text-white/30 shrink-0" />
                  <input
                    type="text"
                    value={searchTable}
                    onChange={(e) => setSearchTable(e.target.value)}
                    placeholder="Search records by date or notes..."
                    className="bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--text-dim)] outline-none w-full"
                  />
                  {searchTable && (
                    <button onClick={() => setSearchTable('')} className="text-white/30 hover:text-white">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                  {filteredTableLogs.length} Records In Ledger
                </div>
              </div>

              {/* Table */}
              <div className="glass rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/40 border-b border-white/10">
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-white/40">Date</th>
                        {activeHabits.map(h => (
                          <th key={h.id} className="p-4 text-[9px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap">
                            {h.name}
                          </th>
                        ))}
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-white/40">Observations</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-white/40 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTableLogs.length === 0 ? (
                        <tr>
                          <td colSpan={activeHabits.length + 3} className="p-12 text-center text-white/30 text-xs italic">
                            No field records match your search query.
                          </td>
                        </tr>
                      ) : (
                        filteredTableLogs.map((log) => (
                          <tr 
                            key={log.date} 
                            className={clsx(
                              "border-b border-white/5 hover:bg-white/[0.03] transition-colors",
                              log.date === selectedDate && "bg-[var(--accent-soft)]"
                            )}
                          >
                            <td className="p-4 whitespace-nowrap">
                              <span className="text-xs font-black text-white italic tracking-tight">
                                {log.date}
                              </span>
                            </td>
                            
                            {activeHabits.map(h => (
                              <td key={h.id} className="p-4 whitespace-nowrap">
                                {typeof log.metrics?.[h.id] === 'boolean' ? (
                                  log.metrics[h.id] ? (
                                    <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                      Done
                                    </span>
                                  ) : (
                                    <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">
                                      Void
                                    </span>
                                  )
                                ) : (
                                  <span className={clsx(
                                    "text-sm font-black italic",
                                    (log.metrics?.[h.id] as number) > 0 ? "text-white" : "text-white/20"
                                  )}>
                                    {log.metrics?.[h.id] ?? 0}
                                  </span>
                                )}
                              </td>
                            ))}

                            <td className="p-4 max-w-xs">
                              <p className="text-xs text-white/50 italic truncate">
                                {log.notes || '—'}
                              </p>
                            </td>

                            <td className="p-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedDate(log.date);
                                  if (window.innerWidth < 1024) setMobileView('form');
                                }}
                                className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-[var(--accent-main)] hover:bg-white/10 transition-all"
                              >
                                Edit in Form
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          MODAL: INITIALIZE NEW MISSION PROTOCOL
         ────────────────────────────────────────────────────────────────────────── */}
      {isAddingHabit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddingHabit(false)} />
          <div className="relative z-[110] glass p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md animate-in zoom-in-95 space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--accent-main)] rounded-xl flex items-center justify-center text-white shadow-md shadow-[var(--accent-glow)]">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-main)] italic tracking-tight uppercase">
                    Initialize Protocol
                  </h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
                    Add new daily tracking metric
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsAddingHabit(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">
                  Protocol Identifier (Name)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Daily Quran Recitation, Workout, Istighfar"
                  value={newHabit.name || ''}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  autoFocus
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-[var(--foreground)] focus:border-[var(--accent-main)] transition-all outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">
                    Sector Alignment
                  </label>
                  <select 
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value as HabitCategory })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-3 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-main)] transition-all outline-none"
                  >
                    <option value="Spiritual">Spiritual</option>
                    <option value="Scholarly">Scholarly</option>
                    <option value="Health">Health</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">
                    Telemetry Type
                  </label>
                  <select 
                    value={newHabit.type}
                    onChange={(e) => setNewHabit({ ...newHabit, type: e.target.value as HabitType })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-3 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-main)] transition-all outline-none"
                  >
                    <option value="toggle">Toggle (Done / Void)</option>
                    <option value="counter">Counter (Numeric)</option>
                  </select>
                </div>
              </div>

              {newHabit.type === 'counter' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">
                      Unit Name (e.g. pages, times)
                    </label>
                    <input 
                      type="text" 
                      placeholder="pages"
                      value={newHabit.unit || ''}
                      onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-main)] transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">
                      Upper Bound (Optional max)
                    </label>
                    <input 
                      type="number" 
                      placeholder="e.g. 5"
                      value={newHabit.max || ''}
                      onChange={(e) => setNewHabit({ ...newHabit, max: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-main)] transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              <button 
                type="button"
                onClick={addNewHabit}
                className="w-full py-3.5 mt-4 btn-ruby rounded-xl font-black uppercase tracking-[0.25em] text-xs transition-all shadow-lg active:scale-95"
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
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--accent-main);
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
