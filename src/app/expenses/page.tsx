"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  ChevronLeft,
  Info,
  Calendar,
  Briefcase,
  History,
  MessageSquare,
  DollarSign,
  User,
  Hash,
  MapPin,
  ClipboardList,
  RefreshCw,
  Shield,
  Zap,
  Mail,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Paperclip,
  Send,
  GripVertical,
  Save,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { generateWaqfeenPDF } from '@/lib/expense-pdf-service';
import { GoogleSyncService } from '@/lib/google-sync-service';
import { clsx } from 'clsx';

// DND Kit Imports
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// --- Sortable Item Component ---
function SortableReceiptItem({ receipt, idx, onRemove }: { receipt: any, idx: number, onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: receipt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={clsx(
        "flex items-center gap-4 glass bg-white/5 p-3 rounded-[16px] group transition-all border border-white/5",
        isDragging ? "shadow-2xl shadow-red-600/30 border-red-600/30 scale-105" : ""
      )}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-1  rounded-md transition-colors"
      >
        <GripVertical size={16} className="text-[var(--text-main)]/20 " />
      </div>

      <div className="w-10 h-10 rounded-[12px] bg-red-600/20 flex flex-col items-center justify-center border border-red-600/30 flex-shrink-0">
          <span className="text-[8px] font-black text-[var(--accent-main)] uppercase tracking-tighter">REF</span>
          <span className="text-xs font-black text-[var(--text-main)] italic leading-none">#{idx + 1}</span>
      </div>
      
      <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[var(--text-main)] truncate uppercase tracking-tight">{receipt.name}</p>
          <p className="text-[8px] font-black text-[var(--text-main)]/20 uppercase tracking-widest mt-1">{receipt.type.split('/')[1]}</p>
      </div>

      <button 
          onClick={() => onRemove(receipt.id)}
          className="p-1.5  rounded-md text-[var(--accent-main)]/40  transition-all opacity-0 "
      >
          <Trash2 size={14} />
      </button>
    </div>
  );
}

const SECS = [
  { label: "- VEHICLE EXPENSE -", isH: true },
  { idx: 0, label: "Employee Vehicle Fuel", ref: "6020-05100" },
  { idx: 1, label: "Employee Vehicle Maint/Oil", ref: "6020-05110" },
  { idx: 2, label: "Employee Vehicle Insurance", ref: "6020-05130" },
  { idx: 3, label: "Employee Vehicle Lic/Reg", ref: "6020-05140" },
  { idx: 4, label: "Employee Vehicle Washing", ref: "6020-05150" },
  { idx: 5, label: "Other (Description Req.)", ref: "" },
  { label: "- COMMUNICATION -", isH: true },
  { idx: 6, label: "Phone (Employee Res.)", ref: "6090-04100" },
  { idx: 7, label: "Cell (Employee)", ref: "6090-04110" },
  { idx: 8, label: "Internet (Employee Res.)", ref: "6090-04120" },
  { label: "- TRAVEL & LODGING -", isH: true },
  { idx: 9, label: "Employee Travel Exp", ref: "6030-01100" },
  { idx: 10, label: "Accommodation", ref: "6160-03100" },
  { idx: 11, label: "Toll/Parking", ref: "6020-01101" },
  { label: "- DIYAFAT -", isH: true },
  { idx: 12, label: "Diyafat", ref: "6110-01100" },
  { idx: 13, label: "Gifts/Misc", ref: "6180-01100" },
  { idx: 14, label: "Waqf-e-Jadid/Tehrik-e-Jadid", ref: "" },
  { idx: 15, label: "Other Items", ref: "" },
  { label: "- COMPUTERS -", isH: true },
  { idx: 16, label: "Comp Maint", ref: "6080-02100" },
  { idx: 17, label: "Software/Antiv", ref: "6080-03100" },
  { idx: 18, label: "Hardware", ref: "6080-01100" },
  { label: "- MEDICAL -", isH: true },
  { idx: 19, label: "Dental Treating/Med", ref: "6180-01101" },
  { idx: 20, label: "Eye Treatment/Glasses", ref: "6180-01102" },
  { idx: 21, label: "Other Medical", ref: "6180-01103" },
  { label: "- UTILITIES -", isH: true },
  { idx: 22, label: "Hydro", ref: "6040-02100" },
  { idx: 23, label: "Gas/Heating", ref: "6040-02110" },
  { idx: 24, label: "Water", ref: "6040-02120" },
  { label: "- OFFICE EXPENSES -", isH: true },
  { idx: 25, label: "Stationery/Pr", ref: "6070-01100" },
  { idx: 26, label: "Postage/Ship", ref: "6070-02100" },
  { label: "- HOUSEHOLD -", isH: true },
  { idx: 27, label: "Rent/Mortgage", ref: "6010-01100" },
  { idx: 28, label: "Property Tax", ref: "6010-02100" },
  { idx: 29, label: "Insurance/Maintenance", ref: "6010-03100" }
];

export default function ExpensesPage() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Set Tab Title & Pre-fill Identity
  useEffect(() => {
    document.title = "Expense Tool";
    
    const prefillProtocol = async () => {
      const googleInfo = await GoogleSyncService.getUserProfile();
      const savedCustom = localStorage.getItem('murrabi_profile_custom');
      
      let memberCode = '';
      let fullName = '';

      if (savedCustom) {
          const customData = JSON.parse(savedCustom);
          memberCode = customData.memberCode || '';
          fullName = customData.name || '';
      }

      if (!fullName && googleInfo) {
          fullName = googleInfo.name || '';
      }

      if (fullName || memberCode) {
          setFormData(prev => ({
              ...prev,
              fullName: fullName || prev.fullName,
              memberCode: memberCode || prev.memberCode
          }));
      }
    };

    prefillProtocol();
  }, []);

  const [formData, setFormData] = useState({
    memberCode: '',
    fullName: '',
    date: new Date().toISOString().split('T')[0],
    cheque_num: '',
    expense_month: months[new Date().getMonth()],
    posting: 'branch',
    posting_location: '',
    purpose: '',
    fiscal_period: '',
    date_received: '',
    other_label: '',
    comments: '',
  });

  const [itemData, setItemData] = useState<Record<number, { ref: string, hst: string, total: string }>>({});
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('manglawaleed@gmail.com');
  
  // Navigation State
  type Tab = 'overview' | 'create' | 'history';
  const [activeTab, setActiveTab] = useState<Tab>('create');

  // History State
  const [expensesHistory, setExpensesHistory] = useState<any[]>([]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      if (data.success) {
        setExpensesHistory(data.expenses);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const saveExpenseToHistory = async () => {
    try {
      const fullState = {
        formData,
        itemData,
        activeIndices,
        receipts
      };

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          month: formData.expense_month || 'Other',
          date: formData.date,
          purpose: formData.purpose || 'Monthly Expense Submission',
          total: totals.grand,
          status: 'sent',
          data: JSON.stringify(fullState)
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentReportId(data.id);
        setIsReadOnly(true);
      }
      fetchExpenses();
    } catch (err) {
      console.error('Failed to save to history', err);
    }
  };

  const loadFromHistory = (report: any) => {
    try {
      if (report.data) {
        const fullState = JSON.parse(report.data);
        setFormData(fullState.formData);
        setItemData(fullState.itemData || {});
        setActiveIndices(fullState.activeIndices || []);
        setReceipts(fullState.receipts || []);
        setIsReadOnly(true);
        setCurrentReportId(report.id);
        setActiveTab('create'); // Switch to editor view
      }
    } catch (e) {
      console.error('Failed to load history data', e);
    }
  };

  const startNewReport = () => {
    setFormData({
      memberCode: '',
      fullName: '',
      date: new Date().toISOString().split('T')[0],
      cheque_num: '',
      expense_month: months[new Date().getMonth()],
      posting: 'branch',
      posting_location: '',
      purpose: '',
      fiscal_period: '',
      date_received: '',
      other_label: '',
      comments: '',
    });
    setItemData({});
    setActiveIndices([]);
    setReceipts([]);
    setIsReadOnly(false);
    setCurrentReportId(null);
    // Trigger prefill again to restore name/code
    const savedCustom = localStorage.getItem('murrabi_profile_custom');
    if (savedCustom) {
      const customData = JSON.parse(savedCustom);
      setFormData(prev => ({
        ...prev,
        fullName: customData.name || '',
        memberCode: customData.memberCode || ''
      }));
    }
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    try {
      const draft = {
        formData,
        itemData,
        activeIndices,
        receipts
      };
      localStorage.setItem('murrabi_expense_draft', JSON.stringify(draft));
      
      // Cloud Backup (Async)
      googleSync.uploadFile(
        `Draft_${formData.expense_month || 'Other'}_${new Date().toISOString().split('T')[0]}.json`,
        JSON.stringify(draft),
        'application/json',
        'ExpenseDrafts'
      ).catch(err => console.error('Cloud Draft Sync Failed:', err));

      alert("Draft saved successfully! You can resume this anytime.");
    } catch (e) {
      console.error(e);
      alert("Failed to save draft.");
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // Draft recovery disabled per user request


  const toggleRefund = async (id: string, currentStatus: number) => {
    try {
      await fetch('/api/expenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, refunded: !currentStatus })
      });
      fetchExpenses();
    } catch (err) {
      console.error('Failed to update refund status', err);
    }
  };

  // DND Kit Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Receipt Management State
  const [receipts, setReceipts] = useState<{ id: string, name: string, data: string, type: string }[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const googleSync = new GoogleSyncService();

  // Auto-calculate totals
  const totals = useMemo(() => {
    let gst = 0;
    let grand = 0;
    activeIndices.forEach(idx => {
      const item = itemData[idx];
      if (item) {
        gst += parseFloat(item.hst || '0');
        grand += parseFloat(item.total || '0');
      }
    });
    return {
      gst: gst.toFixed(2),
      grand: grand.toFixed(2)
    };
  }, [itemData, activeIndices]);



  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (idx: number, field: 'ref' | 'hst' | 'total', value: string) => {
    setItemData(prev => ({
      ...prev,
      [idx]: {
        ...(prev[idx] || { ref: '0', hst: '', total: '' }),
        [field]: value
      }
    }));
  };

  const addCategory = () => {
    if (selectedIdx === -1 || activeIndices.includes(selectedIdx)) return;
    const nextRef = (activeIndices.length + 1).toString();
    setActiveIndices(prev => [...prev, selectedIdx].sort((a, b) => a - b));
    if (!itemData[selectedIdx]) {
        setItemData(prev => ({
            ...prev,
            [selectedIdx]: { ref: nextRef, hst: '', total: '' }
        }));
    }
  };

  const removeCategory = (idx: number) => {
    setActiveIndices(prev => prev.filter(i => i !== idx));
  };

  const splitPurpose = (text: string) => {
    const words = text.split(' ');
    let lines = ['', '', ''];
    const limits = [55, 110, 110]; // Characters per line (d1 is shorter)
    
    let currentIdx = 0;
    for (const word of words) {
        if (currentIdx > 2) break;
        const test = lines[currentIdx] ? lines[currentIdx] + ' ' + word : word;
        if (test.length > limits[currentIdx]) {
            currentIdx++;
            if (currentIdx > 2) break;
            lines[currentIdx] = word;
        } else {
            lines[currentIdx] = test;
        }
    }
    return { d1: lines[0], d2: lines[1], d3: lines[2] };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (receipts.length + files.length > 10) {
      alert("Maximum 10 receipts allowed.");
      return;
    }

    const newReceipts = [...receipts];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result.split(',')[1]); // Get base64 only
        };
        reader.readAsDataURL(file);
      });

      newReceipts.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        data: fileData,
        type: file.type
      });
    }

    setReceipts(newReceipts);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  };

  const moveReceipt = (index: number, direction: 'up' | 'down') => {
    // Legacy move function removed in favor of DND
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setReceipts((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleExportAndSend = async () => {
    if (!formData.fullName || !formData.memberCode) {
      alert("Please fill in basic member information before exporting.");
      return;
    }
    setShowSendConfirm(true);
  };

  const confirmAndSend = async () => {
    setShowSendConfirm(false);
    setIsSending(true);
    try {
      const fullItems = Array(30).fill(null).map((_, i) => ({
        ref: itemData[i]?.ref || '',
        hst: itemData[i]?.hst || '',
        total: itemData[i]?.total || ''
      }));

      const { d1, d2, d3 } = splitPurpose(formData.purpose);

      const pdfBytes = await generateWaqfeenPDF({
        member_code: formData.memberCode,
        full_name: formData.fullName,
        date: formData.date,
        cheque_num: formData.cheque_num,
        expense_month: formData.expense_month,
        posting: formData.posting,
        posting_location: formData.posting_location,
        d1, d2, d3,
        fiscal_period: formData.fiscal_period,
        date_received: formData.date_received,
        other_label: formData.other_label,
        items: fullItems,
        grand_hst: totals.gst,
        grand_total: totals.grand,
        comments: formData.comments
      });

      // Browser-compatible Uint8Array to Base64
      const pdfBase64 = btoa(
        new Uint8Array(pdfBytes)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      const attachments = [
        {
          filename: `Expense_Report_${formData.expense_month || 'Draft'}.pdf`,
          data: pdfBase64,
          mimeType: 'application/pdf'
        },
        ...receipts.map((r, i) => ({
          filename: `REF_${i + 1}_${r.name}`,
          data: r.data,
          mimeType: r.type
        }))
      ];
      
      await googleSync.sendEmail(
        selectedEmail,
        `Expense Report - ${formData.fullName} (${formData.expense_month})`,
        `<p>Please find attached the Expense Report for <b>${formData.fullName}</b> for the month of <b>${formData.expense_month}</b>.</p>
         <p>Total Claimed: <b>$${totals.grand}</b> (HST: $${totals.gst})</p>
         <p>Attached: 1 Report PDF + ${receipts.length} Receipts.</p>`,
        attachments
      );

      // Cloud Backup (Async)
      googleSync.uploadFile(
        `Expense_Report_${formData.fullName.replace(/\s+/g, '_')}_${formData.expense_month}.pdf`,
        pdfBytes,
        'application/pdf',
        'Expenses'
      ).catch(err => console.error('Cloud Report Sync Failed:', err));

      alert("Expense report and receipts sent successfully!");
      saveExpenseToHistory();
    } catch (err: any) {
      console.error(err);
      alert("Error sending report: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const fullItems = Array(30).fill(null).map((_, i) => ({
        ref: itemData[i]?.ref || '',
        hst: itemData[i]?.hst || '',
        total: itemData[i]?.total || ''
      }));

      const { d1, d2, d3 } = splitPurpose(formData.purpose);

      const pdfBytes = await generateWaqfeenPDF({
        member_code: formData.memberCode,
        full_name: formData.fullName,
        date: formData.date,
        cheque_num: formData.cheque_num,
        expense_month: formData.expense_month,
        posting: formData.posting,
        posting_location: formData.posting_location,
        d1, d2, d3,
        fiscal_period: formData.fiscal_period,
        date_received: formData.date_received,
        other_label: formData.other_label,
        items: fullItems,
        grand_hst: totals.gst,
        grand_total: totals.grand,
        comments: formData.comments
      });

      // Cloud Backup (Async)
      googleSync.uploadFile(
        `Expense_Report_${formData.fullName.replace(/\s+/g, '_')}_${formData.expense_month}_${Date.now()}.pdf`,
        pdfBytes,
        'application/pdf',
        'Expenses'
      ).catch(err => console.error('Cloud Download Sync Failed:', err));

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Expense_Report_${formData.expense_month || 'Draft'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      saveExpenseToHistory();
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const availableSECS = useMemo(() => SECS.filter(s => !s.isH && !activeIndices.includes(s.idx!)), [activeIndices]);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Navigation Sidebar (Left) */}
      <div className="w-[240px] glass bg-black/20 border-r border-white/5 flex flex-col h-full shrink-0">
        <div className="no-drag h-[60px] shrink-0">
          {/* Header removed for minimalist layout - space reserved for drag area */}
        </div>
        
        <nav className="flex-1 p-4 space-y-2 no-drag mt-4 overflow-y-auto custom-scrollbar">
           <button 
             onClick={() => setActiveTab('overview')}
             className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all text-left", activeTab === 'overview' ? "bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-soft)] shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "text-[var(--text-main)]/50 hover:bg-white/5 hover:text-[var(--text-main)]")}
           >
             <Zap size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Overview</span>
           </button>

           <button 
             onClick={() => {
               startNewReport();
               setActiveTab('create');
             }}
             className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all text-left", (activeTab === 'create' && !isReadOnly) ? "bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-soft)] shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "text-[var(--text-main)]/50 hover:bg-white/5 hover:text-[var(--text-main)]")}
           >
             <Plus size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">New Expense</span>
           </button>

           <div className="h-px bg-white/5 my-4 mx-2" />

           <button 
             onClick={() => setIsHistoryOpen(!isHistoryOpen)}
             className="w-full flex items-center justify-between px-4 py-3 rounded-[12px] text-[var(--text-main)]/50 hover:bg-white/5 hover:text-[var(--text-main)] transition-all text-left group"
           >
             <div className="flex items-center gap-3">
               <History size={18} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Expense History</span>
             </div>
             <ChevronLeft size={14} className={clsx("transition-transform duration-300", isHistoryOpen ? "-rotate-90" : "")} />
           </button>

           {isHistoryOpen && (
             <div className="space-y-1 mt-2 animate-in slide-in-from-top-2 duration-300">
               {expensesHistory.length === 0 ? (
                 <div className="px-4 py-8 text-center border border-dashed border-white/5 rounded-[12px] ml-2">
                   <p className="text-[7px] font-black uppercase tracking-widest text-[var(--text-dim)]">No completed reports yet</p>
                 </div>
               ) : (
                 expensesHistory.slice(0, 10).map((exp) => (
                   <button
                     key={exp.id}
                     onClick={() => loadFromHistory(exp)}
                     className={clsx(
                       "w-full flex flex-col gap-1 px-4 py-2 rounded-[10px] transition-all text-left border group ml-2",
                       currentReportId === exp.id 
                        ? "bg-white/10 border-white/10" 
                        : "border-transparent hover:bg-white/5"
                     )}
                   >
                     <div className="flex justify-between items-center w-full">
                       <span className="text-[9px] font-black text-[var(--text-main)] uppercase tracking-tight truncate">{exp.month}</span>
                       <Shield size={8} className={clsx(exp.status === 'sent' ? "text-[var(--accent-main)]" : "text-amber-500", "opacity-50")} />
                     </div>
                     <div className="flex justify-between items-center w-full">
                       <span className="text-[7px] font-bold text-[var(--text-dim)] uppercase">{exp.date}</span>
                       <span className="text-[8px] font-black text-[var(--text-main)]/80">${exp.total.toFixed(2)}</span>
                     </div>
                   </button>
                 ))
               )}
             </div>
           )}
        </nav>
      </div>

      <div className="flex-1 main-content flex flex-col h-screen overflow-y-auto scroll-smooth">
        {activeTab === 'overview' && (
          <div className="p-12 flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in-95 duration-500">
             <div className="w-20 h-20 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mb-6 border border-[var(--accent-soft)] relative group">
               <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <Briefcase size={32} className="text-[var(--accent-main)]" />
             </div>
             <h1 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] uppercase">Overview <span className="text-[var(--accent-main)]">Dashboard</span></h1>
             <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] mt-4 max-w-[300px] leading-relaxed">
               Comprehensive financial metrics and visualizations will flow here in Protocol 5.0.
             </p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-8 md:p-12 pt-24 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto w-full">
            <div className="mb-12">
              <h1 className="text-4xl font-black italic tracking-tighter text-[var(--text-main)] uppercase">Expense <span className="text-[var(--accent-main)]">History</span></h1>
              <p className="text-[var(--text-dim)] max-w-xl mt-2 font-black uppercase tracking-[0.3em] text-[9px]">
                 Local Secure Access &middot; Synced Reconciliations
              </p>
            </div>
            
            <div className="space-y-16 pb-20">
              {months.map(m => {
                const monthForms = expensesHistory.filter(e => e.month === m);
                if (monthForms.length === 0) return null;
                const monthTotal = monthForms.reduce((sum, e) => sum + e.total, 0);

                return (
                  <div key={m} className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <h3 className="text-lg font-black tracking-widest text-[var(--text-main)] uppercase">{m}</h3>
                      <span className="text-sm font-black text-[var(--accent-main)] uppercase px-3 py-1 bg-[var(--accent-soft)] border border-[var(--accent-soft)] rounded-lg shadow-inner">${monthTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {monthForms.map(form => (
                        <div key={form.id} className="glass bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col gap-4 relative group transition-all hover:bg-white/10 hover:border-white/10">
                           <div className="flex items-start justify-between">
                              <div className="pr-4">
                                <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-wider">{form.date} &bull; <span className="text-[var(--text-main)]/40">{form.fullName}</span></p>
                                <p className="text-sm font-bold text-[var(--text-main)]/50 uppercase mt-2 leading-relaxed">{form.purpose}</p>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                <p className="text-lg font-black text-[var(--text-main)] bg-black/40 px-4 py-2 rounded-xl border border-white/10 shadow-inner">${form.total.toFixed(2)}</p>
                              </div>
                           </div>
                           
                           <div className="mt-2 pt-4 border-t border-white/5 flex items-center justify-between">
                              <label className="flex items-center gap-3 cursor-pointer group/chk select-none">
                                <div className={clsx(
                                  "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                  form.refunded ? "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/20 bg-black/50 group-hover/chk:border-emerald-500/50"
                                )}>
                                  {form.refunded ? <div className="w-2 h-2 bg-white rounded-sm" /> : null}
                                </div>
                                <input 
                                  type="checkbox" 
                                  className="hidden" 
                                  checked={!!form.refunded} 
                                  onChange={() => toggleRefund(form.id, form.refunded)} 
                                />
                                <span className={clsx(
                                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                                  form.refunded ? "text-[var(--accent-main)]" : "text-[var(--text-dim)] group-hover/chk:text-[var(--text-main)]/50"
                                )}>
                                  {form.refunded ? 'Marked Refunded' : 'Mark Refunded'}
                                </span>
                              </label>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {expensesHistory.length === 0 && (
                <div className="text-center py-32 flex flex-col items-center">
                   <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                     <History size={32} className="text-[var(--text-main)]/20" />
                   </div>
                   <p className="text-lg font-black uppercase tracking-widest text-[var(--text-main)]/80">No History Found</p>
                   <p className="text-xs font-black uppercase tracking-widest text-[var(--text-dim)] mt-3 max-w-[300px] leading-relaxed">
                     Expenses will automatically appear here once exported via the New Expense tool.
                   </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full px-8 md:px-12 pt-16 max-w-6xl mx-auto">
      {/* Beta Tools Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-12">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-[var(--text-main)] uppercase flex items-center gap-4">
              Expense <span className="text-[var(--accent-main)]">Tool</span>
              {isReadOnly && (
                <span className="px-4 py-1.5 bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/20 rounded-full flex items-center gap-2 animate-pulse">
                  <Shield size={12} className="text-[var(--accent-main)]" />
                  <span className="text-[9px] font-black text-[var(--accent-main)] tracking-[0.2em]">ARCHIVED / READ-ONLY</span>
                </span>
              )}
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-6 px-6 py-3 glass bg-white/5 rounded-[20px] border border-white/5 shadow-2xl shadow-black/20">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-[var(--text-dim)] tracking-[0.2em] mb-1">Total Claim</span>
              <span className="text-lg font-black italic text-[var(--accent-main)] tracking-tighter">${totals.grand}</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-[var(--text-dim)] tracking-[0.2em] mb-1">Period</span>
              <span className="text-sm font-black text-[var(--text-main)]/80 uppercase tracking-widest">{formData.expense_month}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSaveDraft}
          disabled={isSaving || isReadOnly}
          className={clsx(
            "px-6 py-4 glass rounded-[18px] border transition-all flex items-center gap-3 group relative overflow-hidden",
            isReadOnly ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed" : "bg-[var(--accent-main)]/10 border-[var(--accent-main)]/20 hover:bg-[var(--accent-main)]/20 text-[var(--accent-main)]"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--accent-main)]/20 border-t-[var(--accent-main)]" />
          ) : (
            isReadOnly ? <Shield size={18} /> : <Save size={18} className="group-hover:scale-110 transition-transform relative z-10" />
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.3em] relative z-10">
            {isReadOnly ? "Archived" : "Save for later"}
          </span>
        </button>
      </div>



      <div className="w-full space-y-8 form-v4 no-drag pt-4">


        <form id="F" onSubmit={(e) => e.preventDefault()} className="space-y-6">
          
          {/* Card 1: General Info */}
          <div className="card">
            <div className="card-hdr">
              <div className="dot"></div>
              GENERAL INFORMATION
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="e.g. Waleed Ahmad Mangla" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-1 gap-2">
                      <label className="lbl">Member Code</label>
                      <input 
                        type="text" 
                        value={formData.memberCode}
                        onChange={(e) => handleInputChange('memberCode', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="5 digits" 
                        maxLength={5} 
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <label className="lbl">Report Date</label>
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)} 
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-1 gap-2">
                      <label className="lbl">Cheque #</label>
                      <input 
                        type="text" 
                        value={formData.cheque_num}
                        onChange={(e) => handleInputChange('cheque_num', e.target.value)} 
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <label className="lbl">Expense Month</label>
                      <select 
                        value={formData.expense_month}
                        onChange={(e) => handleInputChange('expense_month', e.target.value)}
                        className="appearance-none"
                        disabled={isReadOnly}
                      >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl">Posting Location</label>
                    <div className="flex flex-col gap-4 py-2">
                       <div className="flex items-center gap-6">
                        {['branch', 'national', 'jamia'].map(p => (
                          <label key={p} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="posting" 
                              value={p}
                              checked={formData.posting === p}
                              onChange={(e) => handleInputChange('posting', e.target.value)}
                              disabled={isReadOnly}
                              className="accent-stone-800" 
                            />
                            <span className="lbl text-[10px] uppercase font-black">{p}</span>
                          </label>
                        ))}
                      </div>
                      <input 
                        type="text" 
                        value={formData.posting_location}
                        onChange={(e) => handleInputChange('posting_location', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="Department / City" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-v4-rule">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="lbl">Executive Summary / Purpose</label>
                    <span className="text-[9px] font-mono text-v4-ink-muted uppercase">
                        {formData.purpose.length} / 300
                    </span>
                  </div>
                  <textarea 
                    className="h-20 resize-none" 
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    placeholder="Describe the reason for these expenses in one paragraph..."
                    maxLength={300}
                  />
                  <p className="text-[9px] text-v4-ink-muted/60 italic leading-tight">
                    This will be automatically formatted into the three lines of the official report.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Expense Claims Table */}
          <div className="card">
            <div className="card-hdr">
              <div className="dot"></div>
              EXPENSE CLAIM (DYNAMIC)
            </div>
            <div className="overflow-x-auto min-h-[100px]">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Category</th>
                    <th style={{ width: '15%' }}>Ref #</th>
                    <th style={{ width: '20%' }} className="text-right">HST ($)</th>
                    <th style={{ width: '20%' }} className="text-right">Total ($)</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {activeIndices.map((idx) => {
                    const sec = SECS.find(s => s.idx === idx)!;
                    return (
                      <tr key={idx} className="border-b border-v4-rule/50 group  transition-colors">
                        <td className="py-2 px-3 font-bold text-v4-ink">{sec.label}</td>
                        <td className="py-2 px-3">
                          <select 
                            className="!p-1 !text-[10px] !bg-transparent !border-0 font-mono text-v4-ink-muted focus:!bg-white/10 outline-none cursor-pointer" 
                            value={itemData[idx]?.ref || '1'}
                            onChange={(e) => handleItemChange(idx, 'ref', e.target.value)}
                          >
                            {Array.from({ length: 20 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                            <option value="0">0</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input 
                            type="text" 
                            className="!p-1 !text-xs !bg-transparent !border-0 text-right focus:!bg-white/10" 
                            placeholder="0.00"
                            value={itemData[idx]?.hst || ''}
                            onChange={(e) => handleItemChange(idx, 'hst', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input 
                            type="text" 
                            className="!p-1 !text-xs !bg-transparent !border-0 text-right font-bold focus:!bg-white/10" 
                            placeholder="0.00"
                            value={itemData[idx]?.total || ''}
                            onChange={(e) => handleItemChange(idx, 'total', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button 
                              onClick={() => removeCategory(idx)}
                              className="text-v4-rule  transition-colors active:scale-90"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Add Expense Row */}
                  <tr className="bg-v4-warm/30 italic">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                         <select 
                            value={selectedIdx}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setSelectedIdx(val);
                            }}
                            className="!bg-black/20 !text-[var(--text-main)] !py-2 !px-3 !text-[11px] !w-full !border !border-white/10 rounded-[14px] font-medium appearance-none"
                         >
                            <option value="-1">Add Expense (Pick Category)...</option>
                            {availableSECS.map(s => (
                                <option key={s.idx} value={s.idx}>{s.label}</option>
                            ))}
                        </select>
                         <button 
                             onClick={addCategory}
                             className="!bg-red-600 !text-[var(--text-main)] !py-1 !px-4 rounded-[14px] !text-[9px] font-bold  active:scale-95 transition-all h-full shadow-lg shadow-red-900/40"
                         >
                            ADD
                        </button>
                      </div>
                    </td>
                    <td colSpan={4} className="text-right pr-6 text-[10px] text-v4-ink-muted uppercase tracking-tighter">
                        Select a category to add to your claim
                    </td>
                  </tr>

                  {activeIndices.length > 0 && (
                    <tr className="tot-r">
                      <td colSpan={2} className="py-3 px-4 uppercase tracking-widest text-[10px]">GRAND TOTAL CLAIMED</td>
                      <td className="py-3 px-4 text-right !text-xs font-bold text-v4-ink">${totals.gst}</td>
                      <td className="py-3 px-4 text-right !text-xs font-black text-v4-ink">${totals.grand}</td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Comments */}
            <div className="card">
                <div className="card-hdr">
                    <div className="dot"></div>
                    ADDITIONAL COMMENTS
                </div>
                <div className="card-body h-full">
                    <textarea 
                        className="h-32 resize-none" 
                        value={formData.comments}
                        onChange={(e) => handleInputChange('comments', e.target.value)}
                        placeholder="Detail specialized expenses (e.g. Jamia equipment, property repair notes)..."
                    />
                </div>
            </div>
          </div>

          {/* Receipts & Attachments Section */}
          <div className="card">
              <div className="card-hdr flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <div className="dot"></div>
                      RECEIPTS & PROOF OF PURCHASE
                  </div>
                  <span className="text-[9px] font-black italic text-[var(--accent-main)] uppercase tracking-widest">
                      {receipts.length} / 10 ATTACHED
                  </span>
              </div>
              <div className="card-body">
                  <p className="text-[10px] font-black italic text-black uppercase tracking-widest mb-6">
                    Ensure all receipts correspond strictly to the referenced index numbers.
                  </p>
                  <div className="space-y-4">
                      {receipts.length === 0 ? (
                          <div className="border-2 border-dashed border-white/5 rounded-[20px] p-8 flex flex-col items-center justify-center gap-4 group  transition-all cursor-pointer"
                               onClick={() => fileInputRef.current?.click()}>
                              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center   transition-all">
                                  <Paperclip size={20} className="text-[var(--text-main)]/40 " />
                              </div>
                              <div className="text-center">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]/50  transition-colors">Click to upload receipts</p>
                                  <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-main)]/10 mt-1">PDF, JPG, PNG (Max 10 files)</p>
                              </div>
                          </div>
                      ) : (
                          <DndContext 
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd}
                              modifiers={[restrictToVerticalAxis]}
                          >
                              <SortableContext 
                                  items={receipts.map(r => r.id)}
                                  strategy={verticalListSortingStrategy}
                              >
                                  <div className="grid grid-cols-1 gap-2">
                                      {receipts.map((receipt, idx) => (
                                          <SortableReceiptItem 
                                              key={receipt.id} 
                                              receipt={receipt} 
                                              idx={idx} 
                                              onRemove={removeReceipt} 
                                          />
                                      ))}
                                  </div>
                              </SortableContext>
                          </DndContext>
                      )}

                      <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 w-full p-3 rounded-[16px] border border-dashed border-white/10 flex items-center justify-center gap-2   transition-all group"
                      >
                          <Plus size={14} className="text-[var(--text-main)]/20 " />
                          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-main)]/20 ">Add Another Receipt</span>
                      </button>

                      <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          multiple 
                          accept=".pdf,image/*"
                          onChange={handleFileChange}
                      />
                  </div>
              </div>
          </div>
        </form>

        {/* Global Export & Send Section */}
        <div className="mt-12 pt-8 border-t border-v4-rule/30 grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
          <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="btn-v4 py-5 rounded-[14px] flex items-center justify-center gap-3 text-sm font-black tracking-widest uppercase no-drag border-white/5 "
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/20 border-t-white" />
            ) : (
              <>
                <Download size={20} />
                Export PDF Only
              </>
            )}
          </button>
          
          <button 
            onClick={handleExportAndSend}
            disabled={isSending}
            className="btn-ruby py-5 rounded-[14px] flex items-center justify-center gap-3 text-sm font-black tracking-widest uppercase no-drag shadow-2xl shadow-red-900/40"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/20 border-t-white" />
            ) : (
              <>
                <Send size={20} />
                Export & Send (With Receipts)
              </>
            )}
          </button>


        </div>
      </div>

          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {showSendConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowSendConfirm(false)}
          />
          <div className="relative w-full max-w-lg glass bg-[#0a0a0a]/80 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 pt-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 flex items-center justify-center text-red-500 border border-red-600/30 mb-6 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <AlertCircle size={32} />
              </div>
              
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--text-main)] mb-3 italic">
                Confirm <span className="text-red-500">Submission</span>
              </h3>
              
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-dim)] leading-relaxed max-w-[320px]">
                Are you sure you want to send this expense report via email?
              </p>

              <div className="mt-8 w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                   <span className="text-[8px] font-black uppercase text-[var(--text-dim)] tracking-widest">Select Destination</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => setSelectedEmail('manglawaleed@gmail.com')}
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                      selectedEmail === 'manglawaleed@gmail.com' 
                        ? "bg-red-600/20 border-red-600/50 text-[var(--text-main)] shadow-[0_0_20px_rgba(220,38,38,0.1)]" 
                        : "bg-black/40 border-white/5 text-[var(--text-dim)] hover:border-white/20"
                    )}
                  >
                     <div className={clsx(
                       "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                       selectedEmail === 'manglawaleed@gmail.com' ? "bg-red-600 text-white" : "bg-white/5 text-[var(--text-dim)]"
                     )}>
                        <Mail size={14} />
                     </div>
                     <span className="text-xs font-black tracking-tight">manglawaleed@gmail.com (Developer)</span>
                  </button>

                  <button 
                    onClick={() => setSelectedEmail('ap@ahmadiyya.ca')}
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                      selectedEmail === 'ap@ahmadiyya.ca' 
                        ? "bg-red-600/20 border-red-600/50 text-[var(--text-main)] shadow-[0_0_20px_rgba(220,38,38,0.1)]" 
                        : "bg-black/40 border-white/5 text-[var(--text-dim)] hover:border-white/20"
                    )}
                  >
                     <div className={clsx(
                       "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                       selectedEmail === 'ap@ahmadiyya.ca' ? "bg-red-600 text-white" : "bg-white/5 text-[var(--text-dim)]"
                     )}>
                        <Mail size={14} />
                     </div>
                     <span className="text-xs font-black tracking-tight">ap@ahmadiyya.ca (Accounts Payable)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-10">
                <button 
                  onClick={() => setShowSendConfirm(false)}
                  className="px-6 py-4 rounded-[18px] border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--text-main)] transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmAndSend}
                  className="px-6 py-4 rounded-[18px] bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-900/40 hover:bg-red-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
