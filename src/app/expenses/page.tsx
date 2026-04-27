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
  Check,
  Folder,
  ExternalLink,
  Edit3,
  Clock,
  CheckCircle,
  CreditCard,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { generateWaqfeenPDF } from '@/lib/expense-pdf-service';
import { GoogleSyncService } from '@/lib/google-sync-service';
import { liquid } from '@/lib/sync/bridge';
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
          className="p-1.5 rounded-md text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
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
    document.title = "Waqfeen Expenses";
    
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
  const [isCurrentDraft, setIsCurrentDraft] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('manglawaleed@gmail.com');
  
  // Navigation State
  type Tab = 'overview' | 'create' | 'history' | 'external';
  const [activeTab, setActiveTab] = useState<Tab>('create');

  // Category Filter State
  type Category = 'Drafts' | 'Pending' | 'Refunded';
  const [activeCategory, setActiveCategory] = useState<Category>('Pending');
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set(['Pending'] as Category[]));

  const toggleCategoryExpand = (cat: Category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // History State
  const [expensesHistory, setExpensesHistory] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  const fetchExpenses = async () => {
    try {
      setSyncStatus('syncing');
      // 1. Load from LocalStorage first for instant results
      if (typeof window !== 'undefined') {
        const localHistory = localStorage.getItem('waqfeen_expenses_history');
        if (localHistory) {
          setExpensesHistory(JSON.parse(localHistory));
        }
      }

      // 2. Fetch from Google Sheets (Murrabi Expenses Master)
      const googleSync = await GoogleSyncService.fromLocalStorage();
      let sheetExpenses: any[] = [];
      
      if (googleSync) {
        const sheetsData = await googleSync.getSheetsData(undefined, 'Sheet1!A2:Z1000');
        if (sheetsData?.values) {
          sheetExpenses = sheetsData.values.map((row: any[], index: number) => {
            const isNewSchema = row.length > 8;
            
            // New Schema indices: Date(0), Name(1), Code(2), Month(3), Cheque(4), Total(5), HST(6), Purpose(7), Type(8), Loc(9), Status(10), Comments(11), Folder(12), Email(13)
            // Old Schema indices: Date(0), Name(1), Month(2), Total(3), Purpose(4), Status(5), Folder(6), Email(7)
            
            const date = row[0] || new Date().toISOString().split('T')[0];
            const fullName = row[1] || 'Unknown';
            const month = isNewSchema ? (row[3] || 'Other') : (row[2] || 'Other');
            const totalStr = isNewSchema ? row[5] : row[3];
            const total = parseFloat(String(totalStr).replace(/[^0-9.]/g, '')) || 0;
            const purpose = isNewSchema ? (row[7] || 'Expense Submission') : (row[4] || 'Expense Submission');
            const status = isNewSchema ? (row[10] || 'sent') : (row[5] || 'sent');
            const folderLink = isNewSchema ? row[12] : row[6];
            
            return {
              id: `sheet_${index}`,
              fullName,
              month,
              date,
              purpose,
              total,
              status: status.toLowerCase(),
              isSheet: true,
              isNewSchema,
              rowIndex: index + 2, // A2 is row 2
              folderLink
            };
          });
        }
      }

      // 3. Fetch from local DB for local-only records (non-drafts)
      const res = await fetch('/api/expenses');
      const data = await res.json();
      const localExpenses = (data.success && data.expenses) ? data.expenses.filter((e: any) => e.status !== 'draft') : [];

      // 4. Fetch Drafts from Google Drive
      let driveDrafts: any[] = [];
      if (googleSync) {
        try {
          const files = await (googleSync as any).listDriveFiles('Expenses', 'Drafts');
          if (files && Array.isArray(files)) {
            driveDrafts = files.map((file: any) => ({
              id: file.id,
              fullName: file.name.split('_')[1] || 'Draft',
              month: file.name.split('_')[1] || 'Other',
              date: new Date(file.modifiedTime).toISOString().split('T')[0],
              purpose: 'Cloud Draft',
              total: '0.00',
              status: 'draft',
              isDriveDraft: true,
              fileId: file.id
            }));
          }
        } catch (e) {
          console.error('Failed to fetch Drive drafts:', e);
        }
      }

      // 5. Merge and de-duplicate
      const combined = [...sheetExpenses, ...driveDrafts];
      const sheetKeys = new Set(sheetExpenses.map(s => `${s.fullName}-${s.month}-${s.date}`));

      localExpenses.forEach((lexp: any) => {
        const key = `${lexp.fullName}-${lexp.month}-${lexp.date}`;
        if (!sheetKeys.has(key)) {
          combined.push(lexp);
        }
      });

      // Sort by date descending
      const sorted = combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setExpensesHistory(sorted);
      setSyncStatus('synced');
      
      // Sync back to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('waqfeen_expenses_history', JSON.stringify(sorted));
      }
    } catch (e) {
      console.error('History Fetch Error:', e);
      setSyncStatus('error');
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

      const expenseRecord = {
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fullName: formData.fullName,
        month: formData.expense_month || 'Other',
        date: formData.date,
        purpose: formData.purpose || 'Monthly Expense Submission',
        total: totals.grand,
        status: 'sent',
        data: JSON.stringify(fullState)
      };

      // 1. Save to LocalStorage immediately
      const currentLocal = JSON.parse(localStorage.getItem('waqfeen_expenses_history') || '[]');
      const updatedLocal = [expenseRecord, ...currentLocal].slice(0, 50); // Keep last 50
      localStorage.setItem('waqfeen_expenses_history', JSON.stringify(updatedLocal));
      setExpensesHistory(updatedLocal);

      // 2. Save to API (attempts server-side persistence)
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseRecord)
      });
      const data = await res.json();
      if (data.success) {
        setCurrentReportId(data.id);
        setIsReadOnly(true);
      }

      // 3. Optional: Cloud Sync of the index file
      const googleSync = await GoogleSyncService.fromLocalStorage();
      if (googleSync) {
        const historyData = new TextEncoder().encode(JSON.stringify(updatedLocal));
        googleSync.uploadFile(
          'waqfeen_history.json',
          historyData,
          'application/json',
          undefined,
          'Expenses'
        ).catch(err => console.warn('Cloud History Sync Failed:', err));
      }

      fetchExpenses();
    } catch (err) {
      console.error('Failed to save to history', err);
    }
  };

  const loadFromHistory = async (report: any) => {
    try {
      let fullState: any = null;

      if (report.isDriveDraft) {
        setIsSaving(true); // Use as loading indicator
        const googleSync = await GoogleSyncService.fromLocalStorage();
        if (googleSync) {
          const res = await (googleSync as any).getDriveFileContent(report.fileId);
          if (res.content) {
            fullState = typeof res.content === 'string' ? JSON.parse(res.content) : res.content;
          }
        }
        setIsSaving(false);
      } else if (report.data) {
        fullState = JSON.parse(report.data);
      }

      if (fullState) {
        setFormData(fullState.formData);
        setItemData(fullState.itemData || {});
        setActiveIndices(fullState.activeIndices || []);
        setReceipts(fullState.receipts || []);
        setIsReadOnly(false); // Let them edit the draft
        setCurrentReportId(report.id);
        setIsCurrentDraft(report.isDriveDraft);
        setActiveTab('create'); // Switch to editor view
      }
    } catch (e) {
      console.error('Failed to load history data', e);
      setIsSaving(false);
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
    setIsCurrentDraft(false);
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

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const fullState = {
        formData,
        itemData,
        activeIndices,
        receipts
      };
      
      // Cloud Storage ONLY (JSON)
      const fileName = `Draft_${formData.expense_month || 'Other'}_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      
      await googleSync.uploadFile(
        fileName,
        JSON.stringify(fullState),
        'application/json',
        '', 
        'Expenses',
        'Drafts'
      );

      fetchExpenses(); // Refresh sidebar from Drive
      alert("Draft saved to Google Drive successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save draft to Drive.");
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // Draft recovery disabled per user request


  const toggleRefund = async (exp: any) => {
    try {
      const isRefunded = exp.status === 'refunded' || exp.refunded;
      const newStatus = !isRefunded;

      await fetch('/api/expenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: exp.id, refunded: newStatus })
      });

      // --- NEW: Sync with Google Sheets ---
      if (exp.isSheet && exp.rowIndex) {
        try {
          const statusCol = exp.isNewSchema ? 'K' : 'F';
          const range = `Sheet1!${statusCol}${exp.rowIndex}`;
          await googleSync.updateSheetData(range, [[newStatus ? 'REFUNDED' : 'SENT']]);
        } catch (e) {
          console.warn('Failed to sync status to Sheets:', e);
        }
      }

      // --- Trigger Drive Folder Move ---
      if (newStatus) {
        const folderName = `[EXPENSE] ${exp.fullName} - ${exp.month} (${exp.date})`;
        try {
          await googleSync.moveDriveFolder(folderName, 'Expenses', 'Pending', 'Refunded');
        } catch (e) {
          console.warn('Failed to move Drive folder:', e);
        }
      }

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
          content: pdfBase64,
          mimeType: 'application/pdf'
        },
        ...receipts.map((r, i) => ({
          filename: `REF_${i + 1}_${r.name}`,
          content: r.data,
          mimeType: r.type
        }))
      ];
      
      const emailRes = await googleSync.sendEmail(
        selectedEmail,
        `Expense Report - ${formData.fullName} (${formData.expense_month})`,
        `<p>Please find attached the Expense Report for <b>${formData.fullName}</b> for the month of <b>${formData.expense_month}</b>.</p>
         <p>Total Claimed: <b>$${totals.grand}</b> (HST: $${totals.gst})</p>
         <p>Attached: 1 Report PDF + ${receipts.length} Receipts.</p>`,
        attachments
      );

      if (emailRes?.error) {
        throw new Error(emailRes.error);
      }

      // --- New Automation: Drive Folder & Sheets ---
      const reportFolderName = `[EXPENSE] ${formData.fullName} - ${formData.expense_month} (${formData.date})`;
      
      // 1. Upload PDF to dedicated folder
      const driveRes = await googleSync.uploadFile(
        `Expense_Report_${formData.fullName.replace(/\s+/g, '_')}_${formData.expense_month}.pdf`,
        pdfBytes,
        'application/pdf',
        reportFolderName,
        'Expenses',
        'Pending'
      );

      if (driveRes?.error) {
        console.warn('PDF Upload to Drive failed:', driveRes.error);
      }

      // 2. Upload Summary .txt file
      const summaryText = `
EXPENSE REPORT SUMMARY
=====================
Date: ${formData.date}
Member: ${formData.fullName} (${formData.memberCode})
Month: ${formData.expense_month}
Purpose: ${formData.purpose}
Posting: ${formData.posting} (${formData.posting_location})

FINANCIALS:
Subtotal: $${(parseFloat(totals.grand) - parseFloat(totals.gst)).toFixed(2)}
HST: $${totals.gst}
GRAND TOTAL: $${totals.grand}

ITEMS:
${fullItems.filter(i => i.total).map(i => `- ${i.ref}: $${i.total} (HST: $${i.hst})`).join('\n')}

COMMENTS:
${formData.comments || 'None'}

-- Generated by Murrabi Desk --
      `.trim();

      await googleSync.uploadFile(
        `Summary_${formData.expense_month}.txt`,
        summaryText,
        'text/plain',
        reportFolderName,
        'Expenses',
        'Pending'
      );

      // 3. Upload Receipts to the SAME folder
      for (const r of receipts) {
        await googleSync.uploadFile(
          `RECEIPT_${r.name}`,
          r.data,
          r.type,
          reportFolderName,
          'Expenses'
        );
      }

      // 4. Append to Google Sheets
      const sheetRow = [[
        formData.date,
        formData.fullName,
        formData.memberCode,
        formData.expense_month,
        formData.cheque_num,
        totals.grand,
        totals.gst,
        formData.purpose,
        formData.posting,
        formData.posting_location,
        'SENT',
        formData.comments || '',
        driveRes?.link || 'View in Drive',
        selectedEmail
      ]];

      const sheetRes = await googleSync.appendToSheet(sheetRow);
      if (sheetRes?.error) {
        console.error('Sheet Sync Failed:', sheetRes.error);
        // We still show success for the email, but notify about the sheet
        alert("Email sent, but failed to update Google Sheets: " + sheetRes.error);
      }

      setShowSuccessModal(true);
      
      // 5. Cleanup Draft if applicable
      if (isCurrentDraft && currentReportId) {
        try {
          await googleSync.deleteDriveFile(currentReportId);
          setIsCurrentDraft(false);
          setCurrentReportId(null);
        } catch (e) {
          console.warn('Failed to delete source draft:', e);
        }
      }

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
        'ManualDownloads',
        'Expenses',
        'Pending'
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
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">New Waqfeen Expense</span>
           </button>

           <button 
             onClick={() => {
               // No function yet
               setActiveTab('external');
             }}
             className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all text-left", activeTab === 'external' ? "bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-soft)] shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "text-[var(--text-main)]/50 hover:bg-white/5 hover:text-[var(--text-main)]")}
           >
             <CreditCard size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Log external expense</span>
           </button>

           <div className="h-px bg-white/5 my-4 mx-2" />

           <div className="px-4 mb-2 mt-4">
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] opacity-50">Log Books</span>
           </div>

           <button 
             onClick={() => { 
               setActiveTab('history'); 
               setActiveCategory('Drafts'); 
               toggleCategoryExpand('Drafts');
             }}
             className={clsx("w-full flex items-center justify-between px-4 py-3 rounded-[12px] transition-all text-left group", (activeTab === 'history' && activeCategory === 'Drafts') ? "bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-soft)] shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "text-[var(--text-main)]/50 hover:bg-white/5 hover:text-[var(--text-main)]")}
           >
             <div className="flex items-center gap-3">
               <Edit3 size={18} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Drafts</span>
             </div>
             {expandedCategories.has('Drafts') ? <ChevronDown size={14} className="text-[var(--accent-main)]" /> : <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
           </button>

           {expandedCategories.has('Drafts') && (
             <div className="space-y-1 mb-4 mt-1 ml-6 border-l border-white/5 pl-2 animate-in slide-in-from-top-1 duration-300">
               {expensesHistory.filter(f => !f.isSheet && !f.isGmail).slice(0, 5).map(exp => (
                 <button
                   key={exp.id}
                   onClick={() => {
                     setActiveTab('history');
                     setActiveCategory('Drafts');
                     loadFromHistory(exp);
                   }}
                   className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all text-left group/item"
                 >
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[7px] font-black text-[var(--text-main)]/60 uppercase tracking-tight group-hover/item:text-[var(--text-main)] transition-colors">{exp.month}</span>
                     <span className="text-[6px] font-bold text-[var(--text-dim)] uppercase">{exp.date}</span>
                   </div>
                   <span className="text-[8px] font-black text-[var(--accent-main)] opacity-70 group-hover/item:opacity-100 transition-opacity">${parseFloat(exp.total).toFixed(2)}</span>
                 </button>
               ))}
             </div>
           )}

           <button 
             onClick={() => { 
               setActiveTab('history'); 
               setActiveCategory('Pending'); 
               toggleCategoryExpand('Pending');
             }}
             className={clsx("w-full flex items-center justify-between px-4 py-3 rounded-[12px] transition-all text-left group", (activeTab === 'history' && activeCategory === 'Pending') ? "bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-soft)] shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "text-[var(--text-main)]/50 hover:bg-white/5 hover:text-[var(--text-main)]")}
           >
             <div className="flex items-center gap-3">
               <Clock size={18} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pending</span>
             </div>
             {expandedCategories.has('Pending') ? <ChevronDown size={14} className="text-[var(--accent-main)]" /> : <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
           </button>

           {expandedCategories.has('Pending') && (
             <div className="space-y-1 mb-4 mt-1 ml-6 border-l border-white/5 pl-2 animate-in slide-in-from-top-1 duration-300">
               {expensesHistory.filter(f => f.isSheet && f.status !== 'refunded' && !f.refunded).slice(0, 5).map(exp => (
                 <button
                   key={exp.id}
                   onClick={() => {
                     setActiveTab('history');
                     setActiveCategory('Pending');
                     loadFromHistory(exp);
                   }}
                   className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all text-left group/item"
                 >
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[7px] font-black text-[var(--text-main)]/60 uppercase tracking-tight group-hover/item:text-[var(--text-main)] transition-colors">{exp.month}</span>
                     <span className="text-[6px] font-bold text-[var(--text-dim)] uppercase">{exp.date}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-[8px] font-black text-[var(--accent-main)] opacity-70 group-hover/item:opacity-100 transition-opacity">${parseFloat(exp.total).toFixed(2)}</span>
                     <div 
                       onClick={(e) => {
                         e.stopPropagation();
                         if (window.confirm(`Mark expense for ${exp.month} ($${exp.total}) as refunded?`)) {
                           toggleRefund(exp); 
                         }
                       }}
                       className="w-3.5 h-3.5 rounded-[4px] border border-white/20 hover:border-[var(--accent-main)] hover:bg-[var(--accent-soft)] transition-all flex items-center justify-center cursor-pointer group/check"
                       title="Mark as Refunded"
                     >
                       <Check size={8} className="text-[var(--accent-main)] opacity-0 group-hover/check:opacity-50" />
                     </div>
                   </div>
                 </button>
               ))}
             </div>
           )}

           <button 
             onClick={() => { 
               setActiveTab('history'); 
               setActiveCategory('Refunded'); 
               toggleCategoryExpand('Refunded');
             }}
             className={clsx("w-full flex items-center justify-between px-4 py-3 rounded-[12px] transition-all text-left group", (activeTab === 'history' && activeCategory === 'Refunded') ? "bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-soft)] shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "text-[var(--text-main)]/50 hover:bg-white/5 hover:text-[var(--text-main)]")}
           >
             <div className="flex items-center gap-3">
               <CheckCircle size={18} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Refunded</span>
             </div>
             {expandedCategories.has('Refunded') ? <ChevronDown size={14} className="text-[var(--accent-main)]" /> : <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
           </button>

           {expandedCategories.has('Refunded') && (
             <div className="space-y-1 mb-4 mt-1 ml-6 border-l border-white/5 pl-2 animate-in slide-in-from-top-1 duration-300">
               {expensesHistory.filter(f => f.isSheet && (f.status === 'refunded' || f.refunded)).slice(0, 5).map(exp => (
                 <button
                   key={exp.id}
                   onClick={() => {
                     setActiveTab('history');
                     setActiveCategory('Refunded');
                     loadFromHistory(exp);
                   }}
                   className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all text-left group/item"
                 >
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[7px] font-black text-[var(--text-main)]/60 uppercase tracking-tight group-hover/item:text-[var(--text-main)] transition-colors">{exp.month}</span>
                     <span className="text-[6px] font-bold text-[var(--text-dim)] uppercase">{exp.date}</span>
                   </div>
                   <span className="text-[8px] font-black text-[var(--accent-main)] opacity-70 group-hover/item:opacity-100 transition-opacity">${parseFloat(exp.total).toFixed(2)}</span>
                 </button>
               ))}
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
          <div className="p-8 md:p-12 pt-24 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
            <div className="mb-12">
              <h1 className="text-4xl font-black italic tracking-tighter text-[var(--text-main)] uppercase">Expense <span className="text-[var(--accent-main)]">History</span></h1>
              <p className="text-[var(--text-dim)] max-w-xl mt-2 font-black uppercase tracking-[0.3em] text-[9px]">
                 Local Secure Access &middot; Synced Reconciliations
              </p>
            </div>
            
            <div className="space-y-16 pb-20">
              {(() => {
                const filteredHistory = expensesHistory.filter(form => {
                  if (activeCategory === 'Drafts') {
                    // Local records or explicitly un-synced
                    return !form.isSheet && !form.isGmail;
                  }
                  if (activeCategory === 'Pending') {
                    // Synced records that aren't refunded
                    return form.isSheet && form.status !== 'refunded' && !form.refunded;
                  }
                  if (activeCategory === 'Refunded') {
                    // Synced records that are marked as refunded
                    return form.isSheet && (form.status === 'refunded' || form.refunded);
                  }
                  return true;
                });

                if (filteredHistory.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-20 text-center glass bg-white/5 rounded-[32px] border border-dashed border-white/10">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 opacity-30">
                        <History size={32} className="text-[var(--text-dim)]" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-[var(--text-main)] mb-2 italic">No {activeCategory} <span className="text-[var(--accent-main)]">Reports</span></h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] max-w-xs">There are no expense records in this category currently.</p>
                    </div>
                  );
                }

                return months.map(m => {
                  const monthForms = filteredHistory.filter(e => e.month === m);
                  if (monthForms.length === 0) return null;
                  const monthTotal = monthForms.reduce((sum, e) => sum + e.total, 0);

                return (
                  <div key={m} className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <h3 className="text-lg font-black tracking-widest text-[var(--text-main)] uppercase">{m}</h3>
                      <span className="text-sm font-black text-[var(--accent-main)] uppercase px-3 py-1 bg-[var(--accent-soft)] border border-[var(--accent-soft)] rounded-lg shadow-inner">${parseFloat(monthTotal).toFixed(2)}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {monthForms.map(form => (
                        <div key={form.id} className="glass bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col gap-4 relative group transition-all hover:bg-white/10 hover:border-white/10">
                           <div className="flex items-start justify-between">
                              <div className="pr-4 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-wider">{form.date} &bull; <span className="text-[var(--text-main)]/40">{form.fullName}</span></p>
                                  {form.isSheet && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-main)] text-[8px] font-black uppercase tracking-widest border border-[var(--accent-soft)]">
                                      <RefreshCw size={8} className="animate-spin-slow" /> Cloud Synced
                                    </span>
                                  )}
                                  {form.isGmail && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-dim)] text-[8px] font-black uppercase tracking-widest border border-white/5">
                                      <Mail size={8} /> Gmail
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-bold text-[var(--text-main)]/80 uppercase mt-2 leading-relaxed">{form.purpose}</p>
                                {form.folderLink && (
                                  <a 
                                    href={form.folderLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] hover:text-[var(--accent-main)]/80 mt-3 transition-colors group/link"
                                  >
                                    <Folder size={10} className="group-hover/link:scale-110 transition-transform" /> 
                                    View Drive Folder
                                    <ExternalLink size={8} />
                                  </a>
                                )}
                                {form.snippet && (
                                  <p className="text-[10px] text-[var(--text-dim)] mt-2 line-clamp-1 italic font-medium">"{form.snippet}"</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                <p className="text-lg font-black text-[var(--text-main)] bg-black/40 px-4 py-2 rounded-xl border border-white/10 shadow-inner">${parseFloat(form.total).toFixed(2)}</p>
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
                                  onChange={() => toggleRefund(form)} 
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
              })})()}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full px-8 md:px-12 pt-16 max-w-7xl mx-auto">
      {/* Beta Tools Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-12">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-black uppercase flex flex-col items-start leading-[0.8]">
              <span>Waqfeen</span>
              <span>Expenses</span>
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
            {isReadOnly ? "Archived" : "Save as draft"}
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
      
      {/* Custom Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative w-full max-w-sm glass bg-[#0a0a0a]/90 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30 mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <Check size={40} strokeWidth={3} className="animate-in zoom-in duration-500 delay-150" />
              </div>
              
              <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--text-main)] mb-3 italic">
                Sent <span className="text-emerald-500">Successfully</span>
              </h3>
              
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-dim)] leading-relaxed max-w-[240px] mb-10">
                Your expense report and receipts have been dispatched to the selected recipient.
              </p>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/40 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
