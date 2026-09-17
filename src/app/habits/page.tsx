"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, 
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
  Plus,
  Moon,
  Loader2,
  Layers,
  Flame,
  X,
  Download,
  Mail,
  Sparkles,
  RefreshCw,
  Send,
  Cloud,
  CloudOff,
  Check,
  Building,
  User,
  Clock,
  BookOpen
} from "lucide-react";
import { clsx } from "clsx";
import { GoogleSyncService } from '@/lib/google-sync-service';

// --- Types ---
type HabitType = 'toggle' | 'counter';
type HabitCategory = 'Spiritual' | 'Scholarly' | 'Pastoral' | 'Health' | 'Admin';

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

export interface MonthlyReportData {
  name: string;
  office: string;
  month: string;
  yearMonth: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q11: string;
  q12: string;
  q13: string;
  q14: string;
  q15: string;
  q16: string;
  q17: string;
}

const DEFAULT_PROTOCOLS: Habit[] = [
  { id: 'prayers_total', name: 'Total Prayers', category: 'Spiritual', type: 'counter', max: 5, unit: 'offered' },
  { id: 'prayers_mosque', name: 'Mosque Attendance', category: 'Spiritual', type: 'counter', max: 5, unit: 'prayers' },
  { id: 'tahajjud', name: 'Tahajjud Protocol', category: 'Spiritual', type: 'toggle' },
  { id: 'quran_study', name: 'Quran Tilawat & Tafsir', category: 'Spiritual', type: 'counter', unit: 'ruku' },
  { id: 'rk_pages', name: 'Ruhani Khazain', category: 'Scholarly', type: 'counter', unit: 'pages' },
  { id: 'member_visits', name: 'Member Visits & Rabita', category: 'Pastoral', type: 'counter', unit: 'families' },
];

function formatMonthLabel(yearMonthStr: string): string {
  try {
    const [year, month] = yearMonthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  } catch {
    return yearMonthStr;
  }
}

export default function HabitsPage() {
  // Top-level Navigation Mode: 'monthly' (Report Form) or 'daily' (Daily Ledger & Matrix)
  const [activeView, setActiveView] = useState<'monthly' | 'daily'>('monthly');
  const [dailyTab, setDailyTab] = useState<'matrix' | 'table'>('matrix');
  const [mobileView, setMobileView] = useState<'sidebar' | 'content'>('content');

  // Daily Tracking State
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_PROTOCOLS);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formMetrics, setFormMetrics] = useState<Record<string, number | boolean>>({});
  const [formNotes, setFormNotes] = useState('');
  const [isCommittingDaily, setIsCommittingDaily] = useState(false);
  const [dailyCommitSuccess, setDailyCommitSuccess] = useState(false);
  const [searchTable, setSearchTable] = useState('');

  // Monthly Report State
  const currentYearMonth = useMemo(() => {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${m}`;
  }, []);

  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(currentYearMonth);
  const [reportData, setReportData] = useState<MonthlyReportData>(() => ({
    name: '',
    office: '',
    month: formatMonthLabel(currentYearMonth),
    yearMonth: currentYearMonth,
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '',
    q8: '', q9: '', q10: '', q11: '', q12: '', q13: '', q14: '',
    q15: '', q16: '', q17: ''
  }));

  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [reportSaveSuccess, setReportSaveSuccess] = useState(false);
  const [autoFillSuccess, setAutoFillSuccess] = useState(false);

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Load User Profile and Data on Mount
  useEffect(() => {
    setIsGuest(localStorage.getItem('murabbi_guest_mode') === 'true');
    
    // Load cached recipient
    const lastRecipient = localStorage.getItem('murabbi_last_report_recipient');
    if (lastRecipient) setEmailRecipient(lastRecipient);

    // Load initial user name into report
    GoogleSyncService.getUserProfile().then((profile) => {
      if (profile?.name) {
        setReportData(prev => ({
          ...prev,
          name: prev.name || profile.name
        }));
      }
    });

    loadData();
  }, []);

  // Update Daily Form State on Date Switch
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

  // Load Monthly Report for Selected Month
  useEffect(() => {
    const monthLabel = formatMonthLabel(selectedYearMonth);
    
    // Check local storage first
    const cached = localStorage.getItem(`murabbi_report_${selectedYearMonth}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setReportData(parsed);
        return;
      } catch {}
    }

    // Default template state
    setReportData(prev => ({
      ...prev,
      month: monthLabel,
      yearMonth: selectedYearMonth,
      q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '',
      q8: '', q9: '', q10: '', q11: '', q12: '', q13: '', q14: '',
      q15: '', q16: '', q17: ''
    }));

    // Attempt to load from Drive
    loadReportFromDrive(selectedYearMonth);
  }, [selectedYearMonth]);

  const loadData = async () => {
    setIsSyncing(true);
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        // Load Daily Logs
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

  const loadReportFromDrive = async (yearMonth: string) => {
    const service = await GoogleSyncService.fromLocalStorage();
    if (!service) return;
    try {
      const files = await service.listDriveFiles('Reports', 'Monthly');
      const targetName = `report_${yearMonth}.json`;
      const found = files.find(f => f.name === targetName);
      if (found) {
        const content = await service.getDriveFileContent(found.id);
        if (content) {
          const parsed = JSON.parse(content);
          setReportData(parsed);
          localStorage.setItem(`murabbi_report_${yearMonth}`, JSON.stringify(parsed));
        }
      }
    } catch (err) {
      console.error('Drive report load error:', err);
    }
  };

  const saveReport = async (dataToSave?: MonthlyReportData) => {
    const current = dataToSave || reportData;
    setIsSavingReport(true);
    
    // Save to localStorage
    localStorage.setItem(`murabbi_report_${current.yearMonth}`, JSON.stringify(current));

    // Save to Google Drive
    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        await service.uploadFile(
          `report_${current.yearMonth}.json`,
          JSON.stringify(current, null, 2),
          'application/json',
          undefined,
          'Reports',
          'Monthly'
        );
      } catch (err) {
        console.error('Failed to save report to Drive:', err);
      }
    }
    
    setIsSavingReport(false);
    setReportSaveSuccess(true);
    setTimeout(() => setReportSaveSuccess(false), 2000);
  };

  // Update a single question field
  const updateReportField = (field: keyof MonthlyReportData, val: string) => {
    setReportData(prev => {
      const updated = { ...prev, [field]: val };
      localStorage.setItem(`murabbi_report_${updated.yearMonth}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Auto-Fill monthly report using daily logs for the selected month
  const handleAutoFillFromDaily = () => {
    const monthLogs = logs.filter(l => l.date.startsWith(selectedYearMonth));
    if (monthLogs.length === 0) {
      alert(`No daily tracking logs found for ${formatMonthLabel(selectedYearMonth)}. Please log daily entries or complete the report manually.`);
      return;
    }

    const daysAttended = monthLogs.length;

    let totalMosqueSalat = 0;
    let tahajjudDays = 0;
    let quranDays = 0;
    let rkPages = 0;

    monthLogs.forEach(l => {
      totalMosqueSalat += Number(l.metrics?.['prayers_mosque']) || 0;
      if (l.metrics?.['tahajjud']) tahajjudDays++;
      if (Number(l.metrics?.['quran_study']) > 0) quranDays++;
      rkPages += Number(l.metrics?.['rk_pages']) || 0;
    });

    setReportData(prev => {
      const updated: MonthlyReportData = {
        ...prev,
        q1: prev.q1 || String(daysAttended),
        q3: prev.q3 || String(totalMosqueSalat),
        q4: prev.q4 || String(tahajjudDays),
        q5: prev.q5 || String(quranDays),
        q6: prev.q6 || String(rkPages),
      };
      saveReport(updated);
      return updated;
    });

    setAutoFillSuccess(true);
    setTimeout(() => setAutoFillSuccess(false), 3000);
  };

  // Export to .docx (original template filled)
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await saveReport();
      const res = await fetch('/api/reports/monthly-missionary/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: reportData, format: 'download' })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to export document');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeMonth = reportData.month.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeName = (reportData.name || 'Missionary').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `Monthly_Missionary_Report_${safeName}_${safeMonth}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Open Email Modal
  const openEmailModal = () => {
    setEmailSubject(`Monthly Missionary Report — ${reportData.name || 'Murabbi'} — ${reportData.month}`);
    setEmailBody(
      `Assalamu 'alaikum wa Rahmatullah,\n\n` +
      `Respected In-Charge / Ameer Sahib,\n\n` +
      `Please find attached my completed Monthly Missionary Report for ${reportData.month}.\n\n` +
      `Summary of Office & Personal Activities:\n` +
      `• Office Days Attended: ${reportData.q1 || '0'}\n` +
      `• Congregational Salat: ${reportData.q3 || '0'}\n` +
      `• Days Tahajjud: ${reportData.q4 || '0'}\n` +
      `• Commentary of Promised Messiah (as): ${reportData.q6 || '0'} pages\n\n` +
      `Wassalam,\n` +
      `${reportData.name || 'Missionary'}\n` +
      `${reportData.office || 'Murabbi Silsila'}`
    );
    setIsEmailModalOpen(true);
  };

  // Send Email with attached .docx
  const handleSendEmail = async () => {
    if (!emailRecipient.trim()) {
      alert('Please enter a recipient email address.');
      return;
    }

    setIsSendingEmail(true);
    try {
      // 1. Generate base64 docx
      const expRes = await fetch('/api/reports/monthly-missionary/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: reportData, format: 'base64' })
      });
      const expJson = await expRes.json();
      if (!expJson.success) throw new Error(expJson.error || 'Failed to prepare report attachment');

      // 2. Send via Gmail API
      const res = await fetch('/api/brain/gmail-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-murabbi-token': localStorage.getItem('google_refresh_token_encrypted') || ''
        },
        body: JSON.stringify({
          to: emailRecipient.trim(),
          subject: emailSubject,
          body: emailBody.replace(/\n/g, '<br/>'),
          attachments: [{
            filename: expJson.filename,
            content: expJson.base64,
            mimeType: expJson.mimeType
          }]
        })
      });

      const sendJson = await res.json();
      if (!sendJson.success) throw new Error(sendJson.error || 'Failed to dispatch email');

      localStorage.setItem('murabbi_last_report_recipient', emailRecipient.trim());
      setIsEmailModalOpen(false);
      alert(`Monthly Missionary Report successfully emailed to ${emailRecipient}!`);
    } catch (err: any) {
      alert('Failed to send email: ' + err.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Daily Commit
  const commitDailyReport = async () => {
    setIsCommittingDaily(true);
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

    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        await service.uploadFile('habit_logs.json', JSON.stringify(updatedLogs), 'application/json', undefined, 'Habits', 'Logs');
      } catch (err) {
        console.error('Failed to sync logs to Drive:', err);
      }
    }

    setIsCommittingDaily(false);
    setDailyCommitSuccess(true);
    setTimeout(() => setDailyCommitSuccess(false), 2500);
  };

  const updateMetric = (id: string, val: number | boolean) => {
    setFormMetrics(prev => ({ ...prev, [id]: val }));
  };

  // Completion calculation for Monthly Report
  const completedQuestionsCount = useMemo(() => {
    let count = 0;
    for (let i = 1; i <= 17; i++) {
      const val = (reportData as any)[`q${i}`];
      if (val && String(val).trim().length > 0) count++;
    }
    return count;
  }, [reportData]);

  // Month list for selection dropdown
  const monthOptions = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      list.push({ yearMonth: ym, label: formatMonthLabel(ym) });
    }
    return list;
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-dvh lg:h-screen lg:overflow-hidden bg-transparent">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          PANEL 1: SECONDARY SIDEBAR — Sized to w-[240px] matching Mail Tab
         ────────────────────────────────────────────────────────────────────────── */}
      <div 
        className={clsx(
          "w-full lg:w-[240px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20 secondary-sidebar",
          mobileView === 'sidebar' ? "flex" : "hidden lg:flex"
        )}
      >
        {/* Sidebar Title */}
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Routine
          </h1>
        </div>

        {/* View Mode Switcher Pill */}
        <div className="px-5 pt-1 pb-3 border-b border-white/5 mb-2">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveView('monthly')}
              className={clsx(
                "flex-1 py-1.5 text-center text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1",
                activeView === 'monthly'
                  ? "bg-[var(--accent-main)] text-white shadow-sm"
                  : "text-white/40 hover:text-white"
              )}
            >
              <FileText size={11} /> Monthly
            </button>
            <button
              onClick={() => setActiveView('daily')}
              className={clsx(
                "flex-1 py-1.5 text-center text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1",
                activeView === 'daily'
                  ? "bg-[var(--accent-main)] text-white shadow-sm"
                  : "text-white/40 hover:text-white"
              )}
            >
              <Activity size={11} /> Daily
            </button>
          </div>
        </div>

        {/* ── SIDEBAR CONTENT: MONTHLY REPORT CONTROLS ── */}
        {activeView === 'monthly' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-3 space-y-5">
            {/* Month Selector */}
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)]">
                Active Month
              </label>
              <select
                value={selectedYearMonth}
                onChange={(e) => setSelectedYearMonth(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:border-[var(--accent-main)] outline-none cursor-pointer"
              >
                {monthOptions.map(m => (
                  <option key={m.yearMonth} value={m.yearMonth} className="bg-slate-900 text-white">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Progress / Completion Status */}
            <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-white/60">Questions Answered</span>
                <span className="text-[var(--accent-main)]">{completedQuestionsCount} / 17</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent-main)] transition-all duration-500 rounded-full"
                  style={{ width: `${(completedQuestionsCount / 17) * 100}%` }}
                />
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider text-white/30 block text-right">
                {completedQuestionsCount === 17 ? '• Ready for Submission' : '• In Progress'}
              </span>
            </div>

            {/* Auto-Fill from Daily Logs Action */}
            <button
              onClick={handleAutoFillFromDaily}
              className={clsx(
                "w-full py-2.5 px-3 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-between group",
                autoFillSuccess 
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white"
              )}
              title="Automatically calculate attendance, congregational prayers, and study from daily records"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={13} className={clsx("transition-transform group-hover:scale-125", autoFillSuccess ? "text-emerald-400" : "text-amber-400")} />
                <span className="truncate">Auto-Fill from Daily</span>
              </div>
              {autoFillSuccess ? <Check size={13} /> : <ChevronRight size={13} className="text-white/30" />}
            </button>

            {/* Download Word Document Action */}
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="w-full py-2.5 px-3 btn-ruby rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {isExportingDocx ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Generating Word...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Download (.docx)</span>
                </>
              )}
            </button>

            {/* Send via Email Action */}
            <button
              onClick={openEmailModal}
              className="w-full py-2.5 px-3 rounded-xl glass border border-white/10 text-white/80 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Mail size={13} className="text-[var(--accent-main)]" />
              <span>Send Report</span>
            </button>
          </div>
        )}

        {/* ── SIDEBAR CONTENT: DAILY TRACKER FORM ── */}
        {activeView === 'daily' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-3 space-y-4">
            {/* Daily Date Selector */}
            <div className="flex items-center justify-between gap-1 py-1">
              <button 
                onClick={() => {
                  const parts = selectedDate.split('-');
                  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }} 
                className="p-1 rounded-md hover:bg-black/20 text-[var(--text-dim)] hover:text-white transition-all"
              >
                <ChevronLeft size={13} />
              </button>

              <button 
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} 
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-black/20 transition-all text-left"
              >
                <span className="text-xs font-black italic text-white tracking-tight">
                  {selectedDate}
                </span>
              </button>

              <button 
                onClick={() => {
                  const parts = selectedDate.split('-');
                  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }} 
                className="p-1 rounded-md hover:bg-black/20 text-[var(--text-dim)] hover:text-white transition-all"
              >
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Daily Protocol Checklist */}
            <div className="space-y-3">
              {habits.map((habit) => (
                <div key={habit.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black italic text-white tracking-tight truncate max-w-[140px]">
                      {habit.name}
                    </span>
                    {habit.type === 'counter' && habit.max && (
                      <span className="text-[9px] font-bold text-[var(--text-dim)]">
                        {formMetrics[habit.id] ?? 0}/{habit.max}
                      </span>
                    )}
                  </div>

                  {habit.type === 'counter' ? (
                    habit.max ? (
                      <div className="grid grid-cols-6 gap-0.5 bg-black/20 p-0.5 rounded-lg border border-white/5">
                        {Array.from({ length: habit.max + 1 }).map((_, v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => updateMetric(habit.id, v)}
                            className={clsx(
                              "h-7 rounded text-[10px] font-black transition-all flex items-center justify-center",
                              formMetrics[habit.id] === v
                                ? "bg-[var(--accent-main)] text-white shadow-sm font-bold"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-black/20 p-1 rounded-lg border border-white/5">
                        <button
                          type="button"
                          onClick={() => updateMetric(habit.id, Math.max(0, ((formMetrics[habit.id] as number) || 0) - 1))}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all"
                        >
                          <Minus size={11} />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={typeof formMetrics[habit.id] === 'number' ? (formMetrics[habit.id] as number) : 0}
                          onChange={(e) => updateMetric(habit.id, Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-12 bg-transparent text-center font-black text-sm text-white italic outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateMetric(habit.id, ((formMetrics[habit.id] as number) || 0) + 1)}
                          className="w-6 h-6 rounded bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-all"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    )
                  ) : (
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
                      <div className={clsx("w-7 h-4 rounded-full transition-colors relative p-0.5", formMetrics[habit.id] ? "bg-emerald-500" : "bg-white/10")}>
                        <div className={clsx("w-3 h-3 rounded-full bg-white transition-transform shadow-xs", formMetrics[habit.id] ? "translate-x-3" : "translate-x-0")} />
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Daily Commit Button */}
            <button
              onClick={commitDailyReport}
              disabled={isCommittingDaily}
              className="w-full py-2.5 mt-2 btn-ruby rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow transition-all active:scale-95"
            >
              {isCommittingDaily ? <Loader2 size={12} className="animate-spin" /> : dailyCommitSuccess ? <Check size={12} /> : <Save size={12} />}
              <span>{dailyCommitSuccess ? 'Committed!' : 'Commit Record'}</span>
            </button>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-black/10 flex items-center justify-between text-[8px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
          <span className="flex items-center gap-1">
            {isGuest ? <CloudOff size={10} className="text-amber-400" /> : <Cloud size={10} className="text-emerald-400" />}
            {isGuest ? 'Local Link' : 'Cloud Sync'}
          </span>
          <span>{reportSaveSuccess ? 'Saved to Record' : isSavingReport ? 'Saving...' : 'Synced'}</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          PANEL 2: MAIN WORKSPACE CANVAS
          Mode 1: The Fillable Monthly Missionary Report Form
          Mode 2: Daily Routine Telemetry & Ledger
         ────────────────────────────────────────────────────────────────────────── */}
      <div 
        className={clsx(
          "flex-1 flex-col h-full overflow-hidden bg-transparent",
          mobileView === 'content' ? "flex" : "hidden lg:flex"
        )}
      >
        {/* Workspace Header Bar */}
        <header className="px-6 lg:px-10 pt-7 pb-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-black/10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tighter italic text-[var(--text-main)] uppercase leading-none">
              {activeView === 'monthly' ? 'Monthly Missionary Report' : 'Routine Discipline Ledger'}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] mt-1 flex items-center gap-2">
              {activeView === 'monthly' ? `Field Report Submission • ${reportData.month}` : 'Spiritual Integrity & Mission Telemetry'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeView === 'daily' && (
              <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 no-drag">
                <button
                  onClick={() => setDailyTab('matrix')}
                  className={clsx(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                    dailyTab === 'matrix' ? "bg-[var(--accent-main)] text-white shadow-sm" : "text-white/40 hover:text-white"
                  )}
                >
                  <Activity size={13} /> Matrix
                </button>
                <button
                  onClick={() => setDailyTab('table')}
                  className={clsx(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                    dailyTab === 'table' ? "bg-[var(--accent-main)] text-white shadow-sm" : "text-white/40 hover:text-white"
                  )}
                >
                  <TableIcon size={13} /> Table
                </button>
              </div>
            )}

            {activeView === 'monthly' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => saveReport()}
                  disabled={isSavingReport}
                  className="px-4 py-2 rounded-xl glass border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center gap-2 active:scale-95"
                >
                  {isSavingReport ? <Loader2 size={13} className="animate-spin text-[var(--accent-main)]" /> : <Save size={13} />}
                  <span>{reportSaveSuccess ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleExportDocx}
                  disabled={isExportingDocx}
                  className="px-4 py-2 btn-ruby rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow transition-all active:scale-95"
                >
                  {isExportingDocx ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  <span>Download .docx</span>
                </button>
              </div>
            )}

            {/* Mobile View Toggle */}
            <button
              onClick={() => setMobileView(mobileView === 'sidebar' ? 'content' : 'sidebar')}
              className="lg:hidden p-2 rounded-xl glass border border-white/10 text-white/50"
            >
              <Calendar size={14} />
            </button>
          </div>
        </header>

        {/* ── WORKSPACE BODY ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-8 no-drag">
          
          {/* ══════════════════════════════════════════════════════════════════════
              VIEW 1: THE FILLABLE MONTHLY MISSIONARY REPORT
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === 'monthly' && (
            <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
              
              {/* Report Document Sheet Header */}
              <div className="glass-card rounded-2xl p-8 lg:p-10 border border-white/10 shadow-2xl relative space-y-8 bg-gradient-to-b from-white/[0.03] to-transparent">
                
                {/* Islamic Inscription & Title */}
                <div className="text-center space-y-2 pb-6 border-b border-white/5">
                  <p className="text-xl font-serif italic text-white/80 tracking-wide select-none">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                    In the name of Allah the Gracious the Merciful
                  </p>
                  <h1 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-white pt-2">
                    Monthly Missionary Report
                  </h1>
                </div>

                {/* Table 1: Header Metadata (Name, Office, Month) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] flex items-center gap-1.5">
                      <User size={12} className="text-[var(--accent-main)]" /> Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Waleed Ahmad Mangla"
                      value={reportData.name}
                      onChange={(e) => updateReportField('name', e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-[var(--accent-main)] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] flex items-center gap-1.5">
                      <Building size={12} className="text-[var(--accent-main)]" /> Office / Posting
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Regional Missionary"
                      value={reportData.office}
                      onChange={(e) => updateReportField('office', e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-[var(--accent-main)] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] flex items-center gap-1.5">
                      <Calendar size={12} className="text-[var(--accent-main)]" /> Reporting Month
                    </label>
                    <input
                      type="text"
                      value={reportData.month}
                      onChange={(e) => updateReportField('month', e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-[var(--accent-main)] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* ── SECTION I: OFFICE ACTIVITIES (Table 2) ── */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-main)]" />
                    <h3 className="text-sm font-black italic uppercase tracking-[0.2em] text-white">
                      Office Activities
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Q1 */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-black text-[var(--accent-main)]">1.</span>
                        <label className="text-xs font-bold text-white/90">
                          How many days attended?
                        </label>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        placeholder="e.g. 24"
                        value={reportData.q1}
                        onChange={(e) => updateReportField('q1', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-black text-white focus:border-[var(--accent-main)] outline-none"
                      />
                    </div>

                    {/* Q2 */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-black text-[var(--accent-main)]">2.</span>
                        <label className="text-xs font-bold text-white/90">
                          Average number of hours worked?
                        </label>
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        placeholder="e.g. 8"
                        value={reportData.q2}
                        onChange={(e) => updateReportField('q2', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-black text-white focus:border-[var(--accent-main)] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION II: PERSONAL ACTIVITIES (Table 3) ── */}
                <div className="space-y-5 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-main)]" />
                    <h3 className="text-sm font-black italic uppercase tracking-[0.2em] text-white">
                      Personal Activities
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Q3 */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2 max-w-xl">
                        <span className="text-xs font-black text-[var(--accent-main)] mt-0.5">3.</span>
                        <div>
                          <p className="text-xs font-bold text-white/90">
                            During the month how many ‘Salat’ were offered in the congregation in total?
                          </p>
                          <span className="text-[9px] text-white/40 font-medium">Auto-computable from daily mosque attendance</span>
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={reportData.q3}
                        onChange={(e) => updateReportField('q3', e.target.value)}
                        className="w-28 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-black text-white text-center focus:border-[var(--accent-main)] outline-none shrink-0"
                      />
                    </div>

                    {/* Q4 */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2 max-w-xl">
                        <span className="text-xs font-black text-[var(--accent-main)] mt-0.5">4.</span>
                        <div>
                          <p className="text-xs font-bold text-white/90">
                            How many days Tahajjud was offered?
                          </p>
                          <span className="text-[9px] text-white/40 font-medium">Voluntary night prayers offered</span>
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        placeholder="0"
                        value={reportData.q4}
                        onChange={(e) => updateReportField('q4', e.target.value)}
                        className="w-28 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-black text-white text-center focus:border-[var(--accent-main)] outline-none shrink-0"
                      />
                    </div>

                    {/* Q5 */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2 max-w-xl">
                        <span className="text-xs font-black text-[var(--accent-main)] mt-0.5">5.</span>
                        <div>
                          <p className="text-xs font-bold text-white/90">
                            How many days recitation was done?
                          </p>
                          <span className="text-[9px] text-white/40 font-medium">Recitation of the Holy Qur'an with translation</span>
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        placeholder="0"
                        value={reportData.q5}
                        onChange={(e) => updateReportField('q5', e.target.value)}
                        className="w-28 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-black text-white text-center focus:border-[var(--accent-main)] outline-none shrink-0"
                      />
                    </div>

                    {/* Q6 & Q7 Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Q6 */}
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-black text-[var(--accent-main)]">6.</span>
                          <label className="text-xs font-bold text-white/90 leading-snug">
                            How many pages were read from the commentary of the Promised Messiah (as)?
                          </label>
                        </div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Pages read..."
                          value={reportData.q6}
                          onChange={(e) => updateReportField('q6', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-black text-white focus:border-[var(--accent-main)] outline-none"
                        />
                      </div>

                      {/* Q7 */}
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-black text-[var(--accent-main)]">7.</span>
                          <label className="text-xs font-bold text-white/90 leading-snug">
                            How many pages were read from Tafsir-e-Kabir?
                          </label>
                        </div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Pages read..."
                          value={reportData.q7}
                          onChange={(e) => updateReportField('q7', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-black text-white focus:border-[var(--accent-main)] outline-none"
                        />
                      </div>
                    </div>

                    {/* Q8: Books of Promised Messiah */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-black text-[var(--accent-main)]">8.</span>
                        <label className="text-xs font-bold text-white/90">
                          Which books of The Promised Messiah (as) were read?
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="e.g. Kashti-e-Nuh, Braheen-e-Ahmadiyya, The Philosophy of the Teachings of Islam..."
                        value={reportData.q8}
                        onChange={(e) => updateReportField('q8', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[var(--accent-main)] outline-none resize-none"
                      />
                    </div>

                    {/* Q9: Jama'at literature */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-black text-[var(--accent-main)]">9.</span>
                        <label className="text-xs font-bold text-white/90">
                          What was studied from Jama'at literature?
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="e.g. Al Hakam weekly, Review of Religions, Friday Sermon notes..."
                        value={reportData.q9}
                        onChange={(e) => updateReportField('q9', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[var(--accent-main)] outline-none resize-none"
                      />
                    </div>

                    {/* Q10: Non-Jama'at literature */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-black text-[var(--accent-main)]">10.</span>
                        <label className="text-xs font-bold text-white/90">
                          What was studied from other literature?
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="e.g. Comparative religion, Christian theology, Islamic history..."
                        value={reportData.q10}
                        onChange={(e) => updateReportField('q10', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[var(--accent-main)] outline-none resize-none"
                      />
                    </div>

                    {/* Q11: Current affairs */}
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-black text-[var(--accent-main)]">11.</span>
                        <label className="text-xs font-bold text-white/90">
                          What was studied regarding current affairs?
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="e.g. Geopolitics, Middle Eastern developments, local policy..."
                        value={reportData.q11}
                        onChange={(e) => updateReportField('q11', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[var(--accent-main)] outline-none resize-none"
                      />
                    </div>

                    {/* Q12, Q13, Q14 Numeric Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Q12 */}
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-black text-[var(--accent-main)]">12.</span>
                          <label className="text-xs font-bold text-white/90 leading-snug">
                            How many hours were spent in Tabligh activities?
                          </label>
                        </div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Hours..."
                          value={reportData.q12}
                          onChange={(e) => updateReportField('q12', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-black text-white focus:border-[var(--accent-main)] outline-none"
                        />
                      </div>

                      {/* Q13 */}
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-black text-[var(--accent-main)]">13.</span>
                          <label className="text-xs font-bold text-white/90 leading-snug">
                            How many days did you exercise?
                          </label>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="31"
                          placeholder="Days..."
                          value={reportData.q13}
                          onChange={(e) => updateReportField('q13', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-black text-white focus:border-[var(--accent-main)] outline-none"
                        />
                      </div>

                      {/* Q14 */}
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-black text-[var(--accent-main)]">14.</span>
                          <label className="text-xs font-bold text-white/90 leading-snug">
                            How many letters were written to Syedna Hazrat Khalifatul Masih (aa)?
                          </label>
                        </div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Letters..."
                          value={reportData.q14}
                          onChange={(e) => updateReportField('q14', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-black text-white focus:border-[var(--accent-main)] outline-none"
                        />
                      </div>
                    </div>

                    {/* Detailed Reflections & Observations (Q15, Q16, Q17) */}
                    <div className="space-y-4 pt-2">
                      {/* Q15 */}
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-black text-[var(--accent-main)]">15.</span>
                          <label className="text-xs font-bold text-white/90">
                            Any details regarding office work or studies you would like to mention.
                          </label>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Enter administrative details, special tasks accomplished, or studies completed..."
                          value={reportData.q15}
                          onChange={(e) => updateReportField('q15', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[var(--accent-main)] outline-none resize-none leading-relaxed"
                        />
                      </div>

                      {/* Q16 */}
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-black text-[var(--accent-main)]">16.</span>
                          <label className="text-xs font-bold text-white/90">
                            Any details regarding Tabligh activities you like to mention?
                          </label>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Enter outreach events, bookstalls, contacts nurtured, interfaith meetings..."
                          value={reportData.q16}
                          onChange={(e) => updateReportField('q16', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[var(--accent-main)] outline-none resize-none leading-relaxed"
                        />
                      </div>

                      {/* Q17 */}
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-black text-[var(--accent-main)]">17.</span>
                          <label className="text-xs font-bold text-white/90">
                            Any details regarding personal studies you like to mention?
                          </label>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Enter personal research, language acquisition, notes on Malfuzat or Hadith..."
                          value={reportData.q17}
                          onChange={(e) => updateReportField('q17', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[var(--accent-main)] outline-none resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Floating Action Strip */}
                <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/50">
                    <span>Last Saved: {reportSaveSuccess ? 'Just now' : 'Synced to local record'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAutoFillFromDaily}
                      className="px-4 py-2 rounded-xl glass border border-white/10 hover:border-white/20 text-xs font-bold text-white flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      <span>Auto-Fill from Daily</span>
                    </button>

                    <button
                      onClick={handleExportDocx}
                      disabled={isExportingDocx}
                      className="px-5 py-2.5 btn-ruby rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      {isExportingDocx ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                      <span>Export Document (.docx)</span>
                    </button>

                    <button
                      onClick={openEmailModal}
                      className="px-4 py-2.5 rounded-xl glass border border-white/10 hover:border-white/20 text-xs font-bold text-white flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Send size={13} className="text-[var(--accent-main)]" />
                      <span>Send via Email</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              VIEW 2: DAILY ROUTINE TELEMETRY & LEDGER
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === 'daily' && (
            <div className="space-y-8 animate-in fade-in duration-300 pb-20">
              
              {/* TAB 2A: MATRIX */}
              {dailyTab === 'matrix' && (
                <div className="space-y-8">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="glass rounded-xl p-5 border border-white/5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-main)] shrink-0">
                        <Flame size={24} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Archival Streak</span>
                        <h3 className="text-3xl font-black italic text-white tracking-tight mt-0.5">
                          {logs.length} <span className="text-xs font-bold opacity-40">Days</span>
                        </h3>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-5 border border-white/5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Congregational Total</span>
                        <h3 className="text-3xl font-black italic text-white tracking-tight mt-0.5">
                          {logs.reduce((acc, l) => acc + (Number(l.metrics?.['prayers_mosque']) || 0), 0)}
                        </h3>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-5 border border-white/5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Commentary Pages</span>
                        <h3 className="text-3xl font-black italic text-white tracking-tight mt-0.5">
                          {logs.reduce((acc, l) => acc + (Number(l.metrics?.['rk_pages']) || 0), 0)}
                        </h3>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-5 border border-white/5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                        <Moon size={24} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Tahajjud Total</span>
                        <h3 className="text-3xl font-black italic text-white tracking-tight mt-0.5">
                          {logs.filter(l => l.metrics?.['tahajjud']).length} <span className="text-xs font-bold opacity-40">Nights</span>
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* 90-Day Heatmap Grid */}
                  <section className="glass rounded-2xl p-6 lg:p-8 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black italic uppercase tracking-tight text-white">
                        Consistency Matrix (90 Days)
                      </h3>
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        Click any node to inspect in sidebar
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {Array.from({ length: 90 }).map((_, i) => {
                        const dateObj = new Date();
                        dateObj.setDate(dateObj.getDate() - (89 - i));
                        const dateStr = dateObj.toISOString().split('T')[0];
                        const log = logs.find(l => l.date === dateStr);
                        const hasEntry = !!log;
                        const isCurrent = dateStr === selectedDate;

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedDate(dateStr)}
                            title={`${dateStr} • ${hasEntry ? 'Logged' : 'No record'}`}
                            className={clsx(
                              "w-5 h-5 rounded-[4px] transition-all cursor-pointer",
                              isCurrent && "ring-2 ring-[var(--accent-main)] ring-offset-2 ring-offset-black scale-110",
                              hasEntry ? "bg-[var(--accent-main)] shadow-[0_0_10px_var(--accent-glow)]" : "bg-white/5 hover:bg-white/10"
                            )}
                          />
                        );
                      })}
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 2B: TABLE LEDGER */}
              {dailyTab === 'table' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between glass p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2.5 bg-black/20 px-3 py-2 rounded-lg border border-white/5 w-72">
                      <Search size={14} className="text-white/30" />
                      <input
                        type="text"
                        value={searchTable}
                        onChange={(e) => setSearchTable(e.target.value)}
                        placeholder="Search records by date..."
                        className="bg-transparent text-xs text-white outline-none w-full"
                      />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                      {logs.length} Total Logs
                    </span>
                  </div>

                  <div className="glass rounded-xl overflow-hidden border border-white/5">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-black/40 border-b border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest">
                          <th className="p-4">Date</th>
                          {habits.map(h => (
                            <th key={h.id} className="p-4 whitespace-nowrap">{h.name}</th>
                          ))}
                          <th className="p-4">Notes</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.filter(l => !searchTable || l.date.includes(searchTable)).map(l => (
                          <tr key={l.date} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="p-4 font-black text-white italic">{l.date}</td>
                            {habits.map(h => (
                              <td key={h.id} className="p-4">
                                {typeof l.metrics?.[h.id] === 'boolean' 
                                  ? (l.metrics[h.id] ? <span className="text-emerald-400 font-bold">Yes</span> : <span className="text-white/20">—</span>)
                                  : <span className="font-bold text-white">{l.metrics?.[h.id] ?? 0}</span>
                                }
                              </td>
                            ))}
                            <td className="p-4 max-w-xs truncate text-white/50">{l.notes || '—'}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedDate(l.date)}
                                className="text-[9px] font-bold text-[var(--accent-main)] hover:underline uppercase"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          EMAIL DISPATCH MODAL
         ────────────────────────────────────────────────────────────────────────── */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEmailModalOpen(false)} />
          <div className="relative z-[110] glass p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg space-y-6 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--accent-main)] rounded-xl flex items-center justify-center text-white shadow">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic tracking-tight uppercase">
                    Dispatch Monthly Report
                  </h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                    Send to Ameer / In-charge with .docx Attached
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">
                  Recipient Email
                </label>
                <input 
                  type="email" 
                  placeholder="e.g. ameer@ahmadiyya.org.uk or office@..."
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  autoFocus
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-[var(--accent-main)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">
                  Subject Line
                </label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:border-[var(--accent-main)] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">
                  Message Body
                </label>
                <textarea 
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-xs leading-relaxed text-white focus:border-[var(--accent-main)] outline-none resize-none font-medium"
                />
              </div>

              {/* Attachment Badge */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    W
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Monthly_Missionary_Report_{reportData.month.replace(/\s+/g, '_')}.docx
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-white/40">
                      Official Word Document • Auto-generated
                    </span>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="w-full py-3.5 btn-ruby rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Dispatching Email...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Report via Gmail</span>
                  </>
                )}
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
      `}</style>
    </div>
  );
}
