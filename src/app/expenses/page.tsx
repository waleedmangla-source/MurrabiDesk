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
  ChevronRight,
  Bookmark,
  Lock,
  Cloud,
  Search,
  TrendingUp,
  PieChart,
  Receipt,
  ArrowRight
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

function formatExpenseDate(dateStr: string) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

// --- Sortable Item Component ---
function SortableReceiptItem({ receipt, idx, onRemove, isReadOnly }: { receipt: any, idx: number, onRemove: (id: string) => void, isReadOnly?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: receipt.id, disabled: !!isReadOnly });

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
        {...(!isReadOnly ? attributes : {})} 
        {...(!isReadOnly ? listeners : {})} 
        className={clsx("p-1 rounded-md transition-colors", !isReadOnly ? "cursor-grab active:cursor-grabbing" : "cursor-default opacity-40")}
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

      {!isReadOnly && (
        <button 
            type="button"
            onClick={() => onRemove(receipt.id)}
            className="p-1.5 rounded-md text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            title="Remove receipt"
        >
            <Trash2 size={14} />
        </button>
      )}
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

const MOCK_EXPENSES = [
  // --- Drafts ---
  {
    id: 'mock_draft_1',
    fullName: 'Waleed Ahmad Mangla',
    memberCode: '31572',
    month: 'May',
    date: '2026-05-18',
    purpose: 'Vehicle Fuel & Mission Travel',
    total: 112.50,
    status: 'draft',
    isDriveDraft: true,
    data: JSON.stringify({
      formData: {
        fullName: 'Waleed Ahmad Mangla',
        memberCode: '31572',
        date: '2026-05-18',
        cheque_num: '1042',
        expense_month: 'May',
        posting: 'branch',
        posting_location: 'Toronto West',
        purpose: 'Vehicle Fuel & Mission Travel',
        comments: 'Travel for regional visits and mission activities in the western sector.'
      },
      itemData: {
        0: { ref: '1', hst: '12.95', total: '112.50' }
      },
      activeIndices: [0],
      receipts: [
        { id: 'rcpt_mock_1', name: 'Shell_Gas_Station_May18.pdf', type: 'application/pdf' }
      ]
    })
  },
  {
    id: 'mock_draft_2',
    fullName: 'Waleed Ahmad Mangla',
    memberCode: '31572',
    month: 'June',
    date: '2026-06-02',
    purpose: 'Curriculum Books & Printing Material',
    total: 64.20,
    status: 'draft',
    isDriveDraft: true,
    data: JSON.stringify({
      formData: {
        fullName: 'Waleed Ahmad Mangla',
        memberCode: '31572',
        date: '2026-06-02',
        cheque_num: '',
        expense_month: 'June',
        posting: 'branch',
        posting_location: 'Brampton North',
        purpose: 'Curriculum Books & Printing Material',
        comments: 'Printing of syllabus handouts and binding for weekly classes.'
      },
      itemData: {
        5: { ref: '2', hst: '7.38', total: '64.20' }
      },
      activeIndices: [5],
      receipts: [
        { id: 'rcpt_mock_2', name: 'Staples_Printing_Receipt.jpg', type: 'image/jpeg' }
      ]
    })
  },
  {
    id: 'mock_draft_3',
    fullName: 'Waleed Ahmad Mangla',
    memberCode: '31572',
    month: 'April',
    date: '2026-04-20',
    purpose: 'Jamia IT Cables & Hardware Adapter',
    total: 230.00,
    status: 'draft',
    isDriveDraft: true,
    data: JSON.stringify({
      formData: {
        fullName: 'Waleed Ahmad Mangla',
        memberCode: '31572',
        date: '2026-04-20',
        cheque_num: '1038',
        expense_month: 'April',
        posting: 'hq',
        posting_location: 'Jamia Ahmadiyya',
        purpose: 'Jamia IT Cables & Hardware Adapter',
        comments: 'Ethernet cables, HDMI splitters, and multi-port USB hubs for computer lab.'
      },
      itemData: {
        5: { ref: '3', hst: '26.46', total: '230.00' }
      },
      activeIndices: [5],
      receipts: [
        { id: 'rcpt_mock_3', name: 'BestBuy_Invoice_7821.pdf', type: 'application/pdf' }
      ]
    })
  },

  // --- Pending ---
  {
    id: 'mock_pending_1',
    fullName: 'Waleed Ahmad Mangla',
    memberCode: '31572',
    month: 'May',
    date: '2026-05-12',
    purpose: 'Stationery & Office Supplies',
    total: 72.88,
    status: 'sent',
    refunded: 0,
    isSheet: true,
    rowIndex: 2,
    data: JSON.stringify({
      formData: {
        fullName: 'Waleed Ahmad Mangla',
        memberCode: '31572',
        date: '2026-05-12',
        cheque_num: '1040',
        expense_month: 'May',
        posting: 'branch',
        posting_location: 'Toronto Central',
        purpose: 'Stationery & Office Supplies',
        comments: 'Folders, pens, notebooks, and dry-erase markers for committee meetings.'
      },
      itemData: {
        5: { ref: '1', hst: '8.39', total: '72.88' }
      },
      activeIndices: [5],
      receipts: [
        { id: 'rcpt_p1', name: 'Walmart_Supplies_May12.pdf', type: 'application/pdf' }
      ]
    })
  },
  {
    id: 'mock_pending_2',
    fullName: 'Waleed Ahmad Mangla',
    memberCode: '31572',
    month: 'May',
    date: '2026-05-04',
    purpose: 'Regional Inspection Travel Fuel',
    total: 185.40,
    status: 'sent',
    refunded: 0,
    isSheet: true,
    rowIndex: 3,
    data: JSON.stringify({
      formData: {
        fullName: 'Waleed Ahmad Mangla',
        memberCode: '31572',
        date: '2026-05-04',
        cheque_num: '1039',
        expense_month: 'May',
        posting: 'hq',
        posting_location: 'Ontario Region',
        purpose: 'Regional Inspection Travel Fuel',
        comments: 'Quarterly visit to regional chapters and Halqa centers across southern Ontario.'
      },
      itemData: {
        0: { ref: '1', hst: '21.33', total: '185.40' }
      },
      activeIndices: [0],
      receipts: [
        { id: 'rcpt_p2', name: 'PetroCanada_Fuel_May04.pdf', type: 'application/pdf' }
      ]
    })
  },
  {
    id: 'mock_pending_3',
    fullName: 'Waleed Ahmad Mangla',
    memberCode: '31572',
    month: 'April',
    date: '2026-04-28',
    purpose: 'Vehicle Oil Change & Maintenance',
    total: 142.10,
    status: 'sent',
    refunded: 0,
    isSheet: true,
    rowIndex: 4,
    data: JSON.stringify({
      formData: {
        fullName: 'Waleed Ahmad Mangla',
        memberCode: '31572',
        date: '2026-04-28',
        cheque_num: '1036',
        expense_month: 'April',
        posting: 'branch',
        posting_location: 'Toronto West',
        purpose: 'Vehicle Oil Change & Maintenance',
        comments: 'Synthetic oil replacement, filter change, and tire rotation at 60,000 km.'
      },
      itemData: {
        1: { ref: '1', hst: '16.35', total: '142.10' }
      },
      activeIndices: [1],
      receipts: [
        { id: 'rcpt_p3', name: 'MrLube_Invoice_April28.pdf', type: 'application/pdf' }
      ]
    })
  },
  {
    id: 'mock_pending_4',
    fullName: 'Waleed Ahmad Mangla',
    memberCode: '31572',
    month: 'April',
    date: '2026-04-15',
    purpose: 'Mobile & Internet Reimbursement',
    total: 175.00,
    status: 'sent',
    refunded: 0,
    isSheet: true,
    rowIndex: 5,
    data: JSON.stringify({
      formData: {
        fullName: 'Waleed Ahmad Mangla',
        memberCode: '31572',
        date: '2026-04-15',
        cheque_num: '1035',
        expense_month: 'April',
        posting: 'branch',
        posting_location: 'Toronto West',
        purpose: 'Mobile & Internet Reimbursement',
        comments: 'Monthly communication allowance covering official mobile line and high-speed internet.'
      },
      itemData: {
        7: { ref: '1', hst: '10.00', total: '85.00' },
        8: { ref: '2', hst: '10.50', total: '90.00' }
      },
      activeIndices: [7, 8],
      receipts: [
        { id: 'rcpt_p4', name: 'Rogers_Bill_April2026.pdf', type: 'application/pdf' }
      ]
    })
  },

  // --- Refunded ---
  {
    id: 'mock_refunded_1',
    fullName: 'Waleed Ahmad Mangla',
    memberCode: '31572',
    month: 'March',
    date: '2026-03-22',
    purpose: 'Book Binding & Postal Delivery',
    total: 48.50,
    status: 'refunded',
    refunded: 1,
    isSheet: true,
    rowIndex: 6,
    data: JSON.stringify({
      formData: {
        fullName: 'Waleed Ahmad Mangla',
        memberCode: '31572',
        date: '2026-03-22',
        cheque_num: '1031',
        expense_month: 'March',
        posting: 'branch',
        posting_location: 'Toronto West',
        purpose: 'Book Binding & Postal Delivery',
        comments: 'Registered parcel postage for curriculum books dispatched to regional center.'
      },
      itemData: {
        5: { ref: '1', hst: '5.58', total: '48.50' }
      },
      activeIndices: [5],
      receipts: [
        { id: 'rcpt_r1', name: 'CanadaPost_Tracking_March22.pdf', type: 'application/pdf' }
      ]
    })
  },
  {
    id: 'mock_refunded_2',
    fullName: 'Waleed Ahmad Mangla',
    memberCode: '31572',
    month: 'February',
    date: '2026-02-18',
    purpose: 'Vehicle Fuel & Highway 407 Toll',
    total: 95.00,
    status: 'refunded',
    refunded: 1,
    isSheet: true,
    rowIndex: 7,
    data: JSON.stringify({
      formData: {
        fullName: 'Waleed Ahmad Mangla',
        memberCode: '31572',
        date: '2026-02-18',
        cheque_num: '1028',
        expense_month: 'February',
        posting: 'branch',
        posting_location: 'Toronto West',
        purpose: 'Vehicle Fuel & Highway 407 Toll',
        comments: 'Urgent transit across the GTA via ETR 407 and fuel top-up.'
      },
      itemData: {
        0: { ref: '1', hst: '8.50', total: '65.00' },
        11: { ref: '2', hst: '3.45', total: '30.00' }
      },
      activeIndices: [0, 11],
      receipts: [
        { id: 'rcpt_r2', name: 'Esso_Gas_Feb18.pdf', type: 'application/pdf' }
      ]
    })
  },
  {
    id: 'mock_refunded_3',
    fullName: 'Waleed Ahmad Mangla',
    memberCode: '31572',
    month: 'January',
    date: '2026-01-14',
    purpose: 'Jamia Library Reference Collection',
    total: 320.00,
    status: 'refunded',
    refunded: 1,
    isSheet: true,
    rowIndex: 8,
    data: JSON.stringify({
      formData: {
        fullName: 'Waleed Ahmad Mangla',
        memberCode: '31572',
        date: '2026-01-14',
        cheque_num: '1020',
        expense_month: 'January',
        posting: 'hq',
        posting_location: 'Jamia Ahmadiyya',
        purpose: 'Jamia Library Reference Collection',
        comments: 'Arabic lexicons and classical theological references procured for student research.'
      },
      itemData: {
        5: { ref: '1', hst: '15.20', total: '320.00' }
      },
      activeIndices: [5],
      receipts: [
        { id: 'rcpt_r3', name: 'Books_Acquisition_Jan14.pdf', type: 'application/pdf' }
      ]
    })
  }
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
      const savedCustom = localStorage.getItem('murabbi_profile_custom');
      const directMemberCode = localStorage.getItem('murabbi_member_code');
      
      let memberCode = directMemberCode || '';
      let fullName = googleInfo?.name || '';

      if (savedCustom) {
        try {
          const customData = JSON.parse(savedCustom);
          if (customData.memberCode && !memberCode) memberCode = customData.memberCode;
          if (customData.name && !fullName) fullName = customData.name;
        } catch {}
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isJustSaved, setIsJustSaved] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isCurrentDraft, setIsCurrentDraft] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<any | null>(null);
  const [showInfoErrorModal, setShowInfoErrorModal] = useState(false);
  const [refundConfirmTarget, setRefundConfirmTarget] = useState<{ exp: any; month: string } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [hasUsedAiInCurrentReport, setHasUsedAiInCurrentReport] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('manglawaleed@gmail.com');
  
  // Navigation State
  type Tab = 'overview' | 'create' | 'history' | 'external';
  const [activeTab, setActiveTab] = useState<Tab>('create');

  // Open Expense Tabs State
  interface OpenExpenseTab {
    id: string;
    title: string;
    category: 'Drafts' | 'Pending' | 'Refunded';
    date: string;
    month?: string;
    total: number | string;
    report: any;
    state: {
      formData: typeof formData;
      itemData: typeof itemData;
      activeIndices: number[];
      receipts: any[];
      isReadOnly: boolean;
      currentReportId: string | null;
      isCurrentDraft: boolean;
      hasUsedAiInCurrentReport: boolean;
    };
  }

  const [openExpenseTabs, setOpenExpenseTabs] = useState<OpenExpenseTab[]>([]);
  const [activeReportTabId, setActiveReportTabId] = useState<string>('new');
  const newExpenseStateRef = React.useRef<any>(null);

  // Category Filter State
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

  // Presets State
  interface ExpensePreset {
    id: string;
    name: string;
    formData: typeof formData;
    itemData: typeof itemData;
    activeIndices: number[];
  }
  const [presets, setPresets] = useState<ExpensePreset[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPresets = localStorage.getItem('waqfeen_expense_presets');
      if (savedPresets) {
        try { setPresets(JSON.parse(savedPresets)); } catch (e) { console.error(e); }
      }
    }
  }, []);

  const handleAddPreset = () => {
    if (presets.length >= 5) {
      alert("Maximum 5 presets allowed. Please delete an existing preset to add a new one.");
      return;
    }
    if (!formData.purpose || !formData.purpose.trim()) {
      alert("Please enter an Executive Summary / Purpose description first to name your preset.");
      return;
    }
    const presetName = formData.purpose.trim();
    const newPreset: ExpensePreset = {
      id: `preset_${Date.now()}`,
      name: presetName,
      formData: { ...formData },
      itemData: { ...itemData },
      activeIndices: [...activeIndices]
    };
    const updated = [newPreset, ...presets].slice(0, 5);
    setPresets(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('waqfeen_expense_presets', JSON.stringify(updated));
    }
  };

  const applyPreset = (preset: ExpensePreset) => {
    setFormData(prev => ({
      ...prev,
      ...preset.formData,
      date: prev.date || new Date().toISOString().split('T')[0]
    }));
    setItemData(preset.itemData || {});
    setActiveIndices(preset.activeIndices || []);
  };

  const removePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('waqfeen_expense_presets', JSON.stringify(updated));
    }
  };

  // Expense Policy Summary Minimized State
  const [isPolicySummaryMinimized, setIsPolicySummaryMinimized] = useState(true);

  // History State
  const [expensesHistory, setExpensesHistory] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  const fetchExpenses = async () => {
    try {
      setSyncStatus('syncing');
      
      const deletedMockIds: string[] = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('waqfeen_deleted_mock_ids') || '[]')
        : [];
      const availableMocks = MOCK_EXPENSES.filter(m => !deletedMockIds.includes(m.id));

      // 1. Load from LocalStorage first for instant results
      if (typeof window !== 'undefined') {
        const localHistory = localStorage.getItem('waqfeen_expenses_history');
        if (localHistory) {
          try {
            const parsed = JSON.parse(localHistory);
            const existingIds = new Set(parsed.map((p: any) => p.id));
            const missingMocks = availableMocks.filter(m => !existingIds.has(m.id));
            const merged = [...missingMocks, ...parsed];
            setExpensesHistory(merged);
          } catch (e) {
            setExpensesHistory(availableMocks);
          }
        } else {
          setExpensesHistory(availableMocks);
          localStorage.setItem('waqfeen_expenses_history', JSON.stringify(availableMocks));
        }
      }

      // 2. Fetch from Google Sheets (Murabbi Expenses Master)
      const googleSync = await GoogleSyncService.fromLocalStorage();
      let sheetExpenses: any[] = [];
      
      if (googleSync) {
        const sheetsData = await googleSync.getSheetsData(undefined, 'Sheet1!A2:Z1000');
        if (sheetsData?.values) {
          sheetExpenses = sheetsData.values.map((row: any[], index: number) => {
            const isNewSchema = row.length > 8;
            
            // New Schema indices: Date(0), Name(1), Code(2), Month(3), Cheque(4), Total(5), HST(6), Purpose(7), Type(8), Loc(9), Status(10), Comments(11), Folder(12), Email(13)
            // Old Schema indices: Date(0), Name(1), Month(2), Total(3), Purpose(4), Status(5), Folder(6), Email(7)
            
            const date = (row[0] || new Date().toISOString().split('T')[0]).toString().trim();
            const fullName = (row[1] || 'Unknown').toString().trim();
            const month = (isNewSchema ? (row[3] || 'Other') : (row[2] || 'Other')).toString().trim();
            const totalStr = isNewSchema ? row[5] : row[3];
            const total = parseFloat(String(totalStr).replace(/[^0-9.]/g, '')) || 0;
            const purpose = (isNewSchema ? (row[7] || 'Expense Submission') : (row[4] || 'Expense Submission')).toString().trim();
            const status = (isNewSchema ? (row[10] || 'sent') : (row[5] || 'sent')).toString().trim();
            const rawFolderLink = (isNewSchema ? row[12] : row[6]) || '';
            const folderLink = (typeof rawFolderLink === 'string' && (rawFolderLink.startsWith('http://') || rawFolderLink.startsWith('https://')))
              ? rawFolderLink.trim()
              : '';
            
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
          }).filter((e: any) => e.fullName && e.fullName !== 'Unknown' && e.fullName.trim() !== '' && e.total > 0 && e.status !== 'deleted');
        }
      }

      // 3. Fetch from local DB for local-only records (non-drafts)
      const res = await fetch('/api/expenses');
      const data = await res.json();
      const localExpenses = (data.success && data.expenses) ? data.expenses.filter((e: any) => e.status !== 'draft' && e.status !== 'deleted') : [];

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

      // Include available mock expenses for testing
      const existingIds = new Set(combined.map((c: any) => c.id));
      availableMocks.forEach(m => {
        if (!existingIds.has(m.id)) {
          combined.push(m);
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

  // Category item filter helper
  const getCategoryItems = (category: Category) => {
    return expensesHistory.filter(f => {
      if (category === 'Drafts') {
        return f.status === 'draft' || (!f.isSheet && f.status !== 'sent' && f.status !== 'refunded' && !f.refunded);
      }
      if (category === 'Pending') {
        return !f.refunded && f.status !== 'refunded' && (f.status === 'sent' || f.status === 'pending' || (f.isSheet && f.status !== 'draft'));
      }
      if (category === 'Refunded') {
        return f.status === 'refunded' || !!f.refunded;
      }
      return true;
    });
  };

  // Overview Analytics Aggregator
  const overviewStats = useMemo(() => {
    let totalClaimed = 0;
    let pendingTotal = 0;
    let pendingCount = 0;
    let refundedTotal = 0;
    let refundedCount = 0;
    let draftTotal = 0;
    let draftCount = 0;
    let hstTotal = 0;

    const monthlyMap: Record<string, { total: number; refunded: number; pending: number; draft: number }> = {};
    months.forEach(m => {
      monthlyMap[m] = { total: 0, refunded: 0, pending: 0, draft: 0 };
    });

    const categorySpendMap: Record<string, number> = {
      "Vehicle & Transport": 0,
      "Communication": 0,
      "Travel & Lodging": 0,
      "Diyafat & Hospitality": 0,
      "Computers & IT": 0,
      "Office & Supplies": 0,
      "Medical & Other": 0
    };

    expensesHistory.forEach(exp => {
      const amt = parseFloat(exp.total) || 0;
      totalClaimed += amt;

      const isRef = exp.status === 'refunded' || !!exp.refunded;
      const isDrf = exp.status === 'draft' || (!exp.isSheet && exp.status !== 'sent' && !isRef);

      if (isRef) {
        refundedTotal += amt;
        refundedCount += 1;
      } else if (isDrf) {
        draftTotal += amt;
        draftCount += 1;
      } else {
        pendingTotal += amt;
        pendingCount += 1;
      }

      // Monthly aggregation
      const m = exp.month && monthlyMap[exp.month] ? exp.month : 'Other';
      if (monthlyMap[m]) {
        monthlyMap[m].total += amt;
        if (isRef) monthlyMap[m].refunded += amt;
        else if (isDrf) monthlyMap[m].draft += amt;
        else monthlyMap[m].pending += amt;
      }

      // Parse itemized breakdown for HST & Category spending
      let parsedData: any = null;
      if (exp.data) {
        try {
          parsedData = typeof exp.data === 'string' ? JSON.parse(exp.data) : exp.data;
        } catch (e) {
          // ignore error
        }
      }

      let hasItemBreakdown = false;
      if (parsedData?.itemData && parsedData?.activeIndices && parsedData.activeIndices.length > 0) {
        parsedData.activeIndices.forEach((idx: number) => {
          const it = parsedData.itemData[idx];
          if (!it) return;
          hasItemBreakdown = true;
          const itemAmt = parseFloat(it.total) || 0;
          const itemHst = parseFloat(it.hst) || 0;
          hstTotal += itemHst;

          if (idx >= 0 && idx <= 5) categorySpendMap["Vehicle & Transport"] += itemAmt;
          else if (idx >= 6 && idx <= 8) categorySpendMap["Communication"] += itemAmt;
          else if (idx >= 9 && idx <= 11) categorySpendMap["Travel & Lodging"] += itemAmt;
          else if (idx >= 12 && idx <= 15) categorySpendMap["Diyafat & Hospitality"] += itemAmt;
          else if (idx >= 16 && idx <= 18) categorySpendMap["Computers & IT"] += itemAmt;
          else if (idx >= 25 && idx <= 26) categorySpendMap["Office & Supplies"] += itemAmt;
          else categorySpendMap["Medical & Other"] += itemAmt;
        });
      }

      // If no itemized lines available, classify by purpose keywords
      if (!hasItemBreakdown && amt > 0) {
        const p = (exp.purpose || '').toLowerCase();
        if (p.includes('fuel') || p.includes('vehicle') || p.includes('gas') || p.includes('car')) {
          categorySpendMap["Vehicle & Transport"] += amt;
        } else if (p.includes('phone') || p.includes('mobile') || p.includes('internet') || p.includes('rogers') || p.includes('bell')) {
          categorySpendMap["Communication"] += amt;
        } else if (p.includes('travel') || p.includes('hotel') || p.includes('toll') || p.includes('transit')) {
          categorySpendMap["Travel & Lodging"] += amt;
        } else if (p.includes('food') || p.includes('diyafat') || p.includes('refresh') || p.includes('lunch')) {
          categorySpendMap["Diyafat & Hospitality"] += amt;
        } else if (p.includes('computer') || p.includes('laptop') || p.includes('software') || p.includes('hardware')) {
          categorySpendMap["Computers & IT"] += amt;
        } else if (p.includes('book') || p.includes('print') || p.includes('staples') || p.includes('postage')) {
          categorySpendMap["Office & Supplies"] += amt;
        } else {
          categorySpendMap["Medical & Other"] += amt;
        }
      }
    });

    const reconciliationRate = totalClaimed > 0 ? Math.round((refundedTotal / totalClaimed) * 100) : 0;
    const maxMonthlyTotal = Math.max(...Object.values(monthlyMap).map(v => v.total), 1);

    const sortedCategories = Object.entries(categorySpendMap)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: totalClaimed > 0 ? Math.round((amount / totalClaimed) * 100) : 0
      }))
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return {
      totalClaimed,
      pendingTotal,
      pendingCount,
      refundedTotal,
      refundedCount,
      draftTotal,
      draftCount,
      hstTotal,
      reconciliationRate,
      monthlyMap,
      maxMonthlyTotal,
      sortedCategories
    };
  }, [expensesHistory, months]);

  // Export Expenses CSV Function
  const exportExpensesCSV = () => {
    if (!expensesHistory || expensesHistory.length === 0) {
      alert("No expense records available to export.");
      return;
    }
    const headers = ["Date", "Month", "Recipient", "Member Code", "Purpose", "Total Amount ($)", "Status", "HST Claimed ($)", "Drive Folder"];
    const rows = expensesHistory.map(e => {
      let parsed: any = null;
      let hstTotal = 0;
      if (e.data) {
        try {
          parsed = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (parsed?.itemData) {
            Object.values(parsed.itemData).forEach((it: any) => {
              if (it?.hst) hstTotal += parseFloat(it.hst) || 0;
            });
          }
        } catch (err) {}
      }
      const statusText = (e.status === 'refunded' || e.refunded) ? 'Refunded' : (e.status === 'draft' ? 'Draft' : 'Pending');
      return [
        `"${e.date || ''}"`,
        `"${e.month || ''}"`,
        `"${(e.fullName || '').replace(/"/g, '""')}"`,
        `"${e.memberCode || ''}"`,
        `"${(e.purpose || '').replace(/"/g, '""')}"`,
        `"${parseFloat(e.total || 0).toFixed(2)}"`,
        `"${statusText}"`,
        `"${hstTotal.toFixed(2)}"`,
        `"${e.folderLink || ''}"`
      ];
    });
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Waqfeen_Expenses_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const applyTabState = (st: any) => {
    if (!st) return;
    setFormData(st.formData);
    setItemData(st.itemData || {});
    setActiveIndices(st.activeIndices || []);
    setReceipts(st.receipts || []);
    setIsReadOnly(!!st.isReadOnly);
    setCurrentReportId(st.currentReportId || null);
    setIsCurrentDraft(!!st.isCurrentDraft);
    setHasUsedAiInCurrentReport(!!st.hasUsedAiInCurrentReport);
    setActiveTab('create');
  };

  const selectExpenseTab = (targetTabId: string) => {
    if (targetTabId === activeReportTabId && activeTab === 'create') return;

    // Snapshot current active tab state
    const currentSnapshot = {
      formData,
      itemData,
      activeIndices,
      receipts,
      isReadOnly,
      currentReportId,
      isCurrentDraft,
      hasUsedAiInCurrentReport
    };

    if (activeReportTabId === 'new') {
      newExpenseStateRef.current = currentSnapshot;
    } else {
      setOpenExpenseTabs(prev => prev.map(t => t.id === activeReportTabId ? { ...t, state: currentSnapshot } : t));
    }

    // Switch to target tab
    if (targetTabId === 'new') {
      setActiveReportTabId('new');
      if (newExpenseStateRef.current) {
        applyTabState(newExpenseStateRef.current);
      } else {
        startNewReport();
        setActiveTab('create');
      }
    } else {
      const target = openExpenseTabs.find(t => t.id === targetTabId);
      if (target) {
        setActiveReportTabId(target.id);
        applyTabState(target.state);
      }
    }
  };

  const closeExpenseTab = (tabId: string) => {
    setOpenExpenseTabs(prev => {
      const next = prev.filter(t => t.id !== tabId);
      if (activeReportTabId === tabId) {
        if (next.length > 0) {
          const last = next[next.length - 1];
          setActiveReportTabId(last.id);
          applyTabState(last.state);
        } else {
          setActiveReportTabId('new');
          if (newExpenseStateRef.current) {
            applyTabState(newExpenseStateRef.current);
          } else {
            startNewReport();
            setActiveTab('create');
          }
        }
      }
      return next;
    });
  };

  const openExpenseInTab = async (report: any, category: 'Drafts' | 'Pending' | 'Refunded') => {
    // 1. Snapshot current tab state
    const currentSnapshot = {
      formData,
      itemData,
      activeIndices,
      receipts,
      isReadOnly,
      currentReportId,
      isCurrentDraft,
      hasUsedAiInCurrentReport
    };

    if (activeReportTabId === 'new') {
      newExpenseStateRef.current = currentSnapshot;
    } else {
      setOpenExpenseTabs(prev => prev.map(t => t.id === activeReportTabId ? { ...t, state: currentSnapshot } : t));
    }

    // 2. Check if tab already exists
    const existing = openExpenseTabs.find(t => t.id === report.id);
    if (existing) {
      setActiveReportTabId(existing.id);
      applyTabState(existing.state);
      setActiveTab('create');
      return;
    }

    // 3. Load report state
    try {
      setIsSaving(true);
      let loadedState: any = null;

      if (report.isDriveDraft) {
        const googleSync = await GoogleSyncService.fromLocalStorage();
        if (googleSync) {
          const res = await (googleSync as any).getDriveFileContent(report.fileId);
          if (res && res.content) {
            const fullState = typeof res.content === 'string' ? JSON.parse(res.content) : res.content;
            loadedState = {
              formData: fullState.formData || formData,
              itemData: fullState.itemData || {},
              activeIndices: fullState.activeIndices || [],
              receipts: fullState.receipts || [],
              isReadOnly: false,
              currentReportId: report.id,
              isCurrentDraft: true,
              hasUsedAiInCurrentReport: !!fullState.hasUsedAiInCurrentReport
            };
          }
        }
      } else if (report.data) {
        const fullState = typeof report.data === 'string' ? JSON.parse(report.data) : report.data;
        const readOnly = report.status === 'sent' || report.status === 'refunded' || category !== 'Drafts';
        loadedState = {
          formData: fullState.formData || formData,
          itemData: fullState.itemData || {},
          activeIndices: fullState.activeIndices || [],
          receipts: fullState.receipts || [],
          isReadOnly: readOnly,
          currentReportId: report.id,
          isCurrentDraft: false,
          hasUsedAiInCurrentReport: !!fullState.hasUsedAiInCurrentReport
        };
      }

      if (!loadedState) {
        const parsedTotal = parseFloat(report.total || 0);
        const hasTotal = !isNaN(parsedTotal) && parsedTotal > 0;
        loadedState = {
          formData: {
            memberCode: report.memberCode || '',
            fullName: report.fullName || '',
            date: report.date || new Date().toISOString().split('T')[0],
            cheque_num: report.cheque_num || '',
            expense_month: report.month || months[new Date().getMonth()],
            posting: 'branch',
            posting_location: '',
            purpose: report.purpose || 'Expense Submission',
            fiscal_period: '',
            date_received: '',
            other_label: '',
            comments: report.comments || '',
          },
          itemData: hasTotal ? { 0: { ref: '1', hst: '0.00', total: parsedTotal.toFixed(2) } } : {},
          activeIndices: hasTotal ? [0] : [],
          receipts: [],
          isReadOnly: true,
          currentReportId: report.id,
          isCurrentDraft: false,
          hasUsedAiInCurrentReport: false
        };
      }

      const newTab: OpenExpenseTab = {
        id: report.id,
        title: report.date || report.month || 'Expense',
        category,
        date: report.date || new Date().toISOString().split('T')[0],
        month: report.month,
        total: report.total || 0,
        report,
        state: loadedState
      };

      setOpenExpenseTabs(prev => [...prev.filter(t => t.id !== report.id), newTab]);
      setActiveReportTabId(report.id);
      applyTabState(loadedState);
      setActiveTab('create');
    } catch (err) {
      console.error('Error opening expense in tab:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const loadFromHistory = async (report: any) => {
    await openExpenseInTab(report, activeCategory);
  };

  const startNewReport = () => {
    setActiveReportTabId('new');
    newExpenseStateRef.current = null;
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
    setHasUsedAiInCurrentReport(false);
    // Trigger prefill again to restore name/code
    const directMemberCode = localStorage.getItem('murabbi_member_code');
    const savedCustom = localStorage.getItem('murabbi_profile_custom');
    let fullName = '';
    let memberCode = directMemberCode || '';
    if (savedCustom) {
      try {
        const customData = JSON.parse(savedCustom);
        if (customData.name) fullName = customData.name;
        if (customData.memberCode && !memberCode) memberCode = customData.memberCode;
      } catch {}
    }
    if (fullName || memberCode) {
      setFormData(prev => ({
        ...prev,
        fullName: fullName || prev.fullName,
        memberCode: memberCode || prev.memberCode
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
        receipts,
        hasUsedAiInCurrentReport
      };
      
      // Cloud Storage ONLY (JSON)
      const fileName = `Draft_${formData.expense_month || 'Other'}_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      
      const googleSync = await GoogleSyncService.fromLocalStorage();
      if (!googleSync) throw new Error("Google sync not authenticated");

      await googleSync.uploadFile(
        fileName,
        JSON.stringify(fullState),
        'application/json',
        '', 
        'Expenses',
        'Drafts'
      );

      fetchExpenses(); // Refresh sidebar from Drive
      setIsJustSaved(true);
      setTimeout(() => setIsJustSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to save draft to Drive.");
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleDeleteExpense = async (targetExp?: any) => {
    const target = targetExp || currentOpenReport?.report || (isCurrentDraft ? { id: currentReportId, isDriveDraft: true, fileId: currentReportId } : null);

    try {
      // 0. If it's a mock expense, record as deleted so it's not re-seeded
      if (target?.id?.startsWith('mock_')) {
        if (typeof window !== 'undefined') {
          const deletedMocks = JSON.parse(localStorage.getItem('waqfeen_deleted_mock_ids') || '[]');
          if (!deletedMocks.includes(target.id)) {
            deletedMocks.push(target.id);
            localStorage.setItem('waqfeen_deleted_mock_ids', JSON.stringify(deletedMocks));
          }
        }
      }

      const googleSync = await GoogleSyncService.fromLocalStorage();

      // 1. If it's a Drive Draft, delete file from Google Drive
      if (target?.isDriveDraft || (isCurrentDraft && currentReportId)) {
        const fileId = target?.fileId || currentReportId;
        if (fileId && googleSync) {
          try {
            await (googleSync as any).deleteDriveFile(fileId);
          } catch (e) {
            console.warn('Failed to delete Drive draft:', e);
          }
        }
      }

      // 2. If it has a Google Sheet row (Murabbi Expenses Master)
      if (target?.isSheet && target.rowIndex && googleSync) {
        try {
          const emptyRow = Array(14).fill('');
          emptyRow[10] = 'DELETED';
          await googleSync.updateSheetData(`Sheet1!A${target.rowIndex}:N${target.rowIndex}`, [emptyRow]);
        } catch (e) {
          console.warn('Failed to delete Google Sheet row:', e);
        }
      }

      // 3. If it has an associated Drive folder (e.g. from folderLink)
      if (target?.folderLink && googleSync) {
        try {
          const match = target.folderLink.match(/folders\/([a-zA-Z0-9_-]+)/) || target.folderLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            await (googleSync as any).deleteDriveFile(match[1]);
          }
        } catch (e) {
          console.warn('Failed to delete Drive folder:', e);
        }
      }

      // 4. Delete from SQLite DB
      if (target?.id || (target?.fullName && target?.date)) {
        try {
          await fetch('/api/expenses', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: target?.id, 
              fullName: target?.fullName || formData.fullName, 
              date: target?.date || formData.date 
            })
          });
        } catch (e) {
          console.warn('Failed to delete from local DB:', e);
        }
      }

      // 5. Delete from LocalStorage
      if (typeof window !== 'undefined') {
        const curLocal = JSON.parse(localStorage.getItem('waqfeen_expenses_history') || '[]');
        const updatedLocal = curLocal.filter((h: any) => {
          if (target?.id && h.id === target.id) return false;
          if (target && h.fullName === target.fullName && h.date === target.date && h.month === target.month) return false;
          return true;
        });
        localStorage.setItem('waqfeen_expenses_history', JSON.stringify(updatedLocal));
        setExpensesHistory(updatedLocal);
      }

      // 6. Refresh full history from sources
      fetchExpenses();

      // 7. Tab handling
      const tabToClose = target?.id 
        ? openExpenseTabs.find(t => t.id === target.id)?.id 
        : (activeReportTabId !== 'new' ? activeReportTabId : null);

      if (tabToClose) {
        closeExpenseTab(tabToClose);
      } else if (activeReportTabId === 'new') {
        startNewReport();
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    } finally {
      setShowDeleteConfirm(false);
      setExpenseToDelete(null);
    }
  };

  // Draft recovery disabled per user request


  const toggleRefund = async (exp: any) => {
    try {
      // --- If mock expense, update in-memory and localStorage immediately ---
      if (exp.id?.startsWith('mock_')) {
        setExpensesHistory(prev => {
          const updated = prev.map(item => {
            if (item.id === exp.id) {
              const newStatus = (item.status === 'refunded' || item.refunded) ? 'sent' : 'refunded';
              const newRefunded = newStatus === 'refunded' ? 1 : 0;
              return { ...item, status: newStatus, refunded: newRefunded };
            }
            return item;
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('waqfeen_expenses_history', JSON.stringify(updated));
          }
          return updated;
        });
        return;
      }

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
          const sheetRes = await googleSync.updateSheetData(range, [[newStatus ? 'REFUNDED' : 'SENT']]);
          if (sheetRes && sheetRes.error) {
            alert(`Sheet sync error: ${sheetRes.error}`);
          }
        } catch (e) {
          console.warn('Failed to sync status to Sheets:', e);
        }
      }

      // --- Trigger Drive Folder Move ---
      if (newStatus) {
        const folderName = `[EXPENSE] ${exp.fullName} - ${exp.month} (${exp.date})`;
        try {
          const moveRes = await googleSync.moveDriveFolder(folderName, 'Expenses', 'Pending', 'Refunded');
          if (moveRes && moveRes.error) {
            alert(`Drive move error: ${moveRes.error}`);
          } else if (moveRes && moveRes.message) {
            alert(`Drive move info: ${moveRes.message}`);
          }
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
    if (exportError && (field === 'fullName' || field === 'memberCode')) {
      setExportError(null);
    }
    if (field === 'memberCode') {
      localStorage.setItem('murabbi_member_code', value);
      try {
        const existing = localStorage.getItem('murabbi_profile_custom');
        const parsed = existing ? JSON.parse(existing) : {};
        parsed.memberCode = value;
        localStorage.setItem('murabbi_profile_custom', JSON.stringify(parsed));
      } catch {}
    }
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

    const compressImage = async (file: File): Promise<{ data: string, type: string, name: string }> => {
      return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => resolve({
            data: (e.target?.result as string).split(',')[1],
            type: file.type,
            name: file.name
          });
          reader.readAsDataURL(file);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 1600;
            if (width > height && width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            let newName = file.name;
            if (!newName.toLowerCase().endsWith('.jpg') && !newName.toLowerCase().endsWith('.jpeg')) {
              newName = newName.replace(/\.[^/.]+$/, "") + ".jpg";
            }
            resolve({
              data: dataUrl.split(',')[1],
              type: 'image/jpeg',
              name: newName
            });
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    const newReceipts = [...receipts];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressed = await compressImage(file);
      newReceipts.push({
        id: Math.random().toString(36).substr(2, 9),
        name: compressed.name,
        data: compressed.data,
        type: compressed.type
      });
    }

    setReceipts(newReceipts);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAutoFillDescription = async () => {
    if (hasUsedAiInCurrentReport) {
      alert("AI receipt analysis can only be used once per expense report.");
      return;
    }

    if (receipts.length === 0) {
      alert("Please upload some receipts first to analyze.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipts: receipts.map(r => ({ type: r.type, data: r.data })) })
      });

      if (!res.ok) throw new Error("Failed to analyze receipts");

      const data = await res.json();
      
      // Update form header fields (Month, Purpose)
      setFormData(prev => ({
        ...prev,
        expense_month: data.month || prev.expense_month,
        purpose: data.description || prev.purpose
      }));

      // Update Expense Claim items (Active Categories, HST, Totals)
      if (Array.isArray(data.items) && data.items.length > 0) {
        const newActive = new Set(activeIndices);
        const newItemData = { ...itemData };

        data.items.forEach((item: any) => {
          const idx = (typeof item.categoryIdx === 'number' && item.categoryIdx >= 0 && item.categoryIdx <= 29)
            ? item.categoryIdx 
            : 15; // fallback to 15 (Other Items)
          
          newActive.add(idx);

          const existingHst = parseFloat(newItemData[idx]?.hst || '0') || 0;
          const existingTotal = parseFloat(newItemData[idx]?.total || '0') || 0;

          const itemHst = typeof item.hst === 'number' ? item.hst : (parseFloat(item.hst) || 0);
          const itemTotal = typeof item.total === 'number' ? item.total : (parseFloat(item.total) || 0);

          newItemData[idx] = {
            ref: newItemData[idx]?.ref || '1',
            hst: (existingHst + itemHst).toFixed(2),
            total: (existingTotal + itemTotal).toFixed(2)
          };
        });

        setActiveIndices(Array.from(newActive).sort((a, b) => a - b));
        setItemData(newItemData);
      }

      setHasUsedAiInCurrentReport(true);

    } catch (err) {
      console.error(err);
      alert("Error analyzing receipts. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
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
      setExportError("Please fill in basic member information before exporting.");
      setShowInfoErrorModal(true);
      return;
    }
    setExportError(null);
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

      // Browser-compatible Uint8Array to Base64 (Safer method)
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(new Blob([pdfBytes], { type: 'application/pdf' }));
      });
      
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

-- Generated by Murabbi Desk --
      `.trim();

      // 2. Upload Summary .json file (Structured Data)
      const summaryData = {
        meta: {
          generatedBy: "Murabbi Desk",
          timestamp: new Date().toISOString()
        },
        report: {
          fullName: formData.fullName,
          email: formData.email,
          month: formData.expense_month,
          purpose: formData.purpose,
          posting: formData.posting,
          location: formData.posting_location,
          totals: {
            subtotal: (parseFloat(totals.grand) - parseFloat(totals.gst)).toFixed(2),
            hst: totals.gst,
            grandTotal: totals.grand
          },
          items: fullItems.filter(i => i.total).map(i => ({
            ref: i.ref,
            total: i.total,
            hst: i.hst
          })),
          comments: formData.comments || ''
        }
      };

      await googleSync.uploadFile(
        `Summary_${formData.expense_month}.json`,
        JSON.stringify(summaryData, null, 2),
        'application/json',
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
      const driveFolderUrl = driveRes?.folderLink || (driveRes?.folderId ? `https://drive.google.com/drive/folders/${driveRes.folderId}` : (driveRes?.link || ''));
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
        driveFolderUrl,
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
    if (!formData.fullName || !formData.memberCode) {
      setExportError("Please fill in basic member information before exporting.");
      setShowInfoErrorModal(true);
      return;
    }
    setExportError(null);
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

  const currentOpenReport = openExpenseTabs.find(t => t.id === activeReportTabId);
  const draftsCount = useMemo(() => getCategoryItems('Drafts').length, [expensesHistory]);
  const pendingCount = useMemo(() => getCategoryItems('Pending').length, [expensesHistory]);
  const refundedCount = useMemo(() => getCategoryItems('Refunded').length, [expensesHistory]);

  const isDraftsActive = (activeTab === 'history' && activeCategory === 'Drafts') ||
    (activeTab === 'create' && currentOpenReport?.category === 'Drafts');
  const isPendingActive = (activeTab === 'history' && activeCategory === 'Pending') ||
    (activeTab === 'create' && currentOpenReport?.category === 'Pending');
  const isRefundedActive = (activeTab === 'history' && activeCategory === 'Refunded') ||
    (activeTab === 'create' && currentOpenReport?.category === 'Refunded');

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-transparent">
      {/* Navigation Sidebar (Left) — desktop only */}
      <div className="hidden lg:flex w-[240px] glass bg-black/20 border-r border-white/5 flex-col h-full shrink-0 secondary-sidebar">
        {/* Sidebar Title */}
        <div className="px-5 pt-8 pb-4 border-b border-white/5 shrink-0">
          <h1 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] uppercase leading-none">
            Waqfeen<br />Expenses
          </h1>
        </div>
        
        <nav className="flex-1 py-4 space-y-1 no-drag overflow-y-auto custom-scrollbar">
           <button 
             onClick={() => setActiveTab('overview')}
             className={clsx(
               "w-full flex items-center justify-between px-6 py-3 transition-all text-left border-l-2 text-xs font-semibold tracking-wide",
               activeTab === 'overview'
                 ? "text-[var(--text-main)] border-[var(--accent-main)] bg-black/20 font-bold"
                 : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--text-main)] border-transparent"
             )}
           >
             <span>Overview</span>
           </button>

           <button 
             onClick={() => {
               selectExpenseTab('new');
               setActiveTab('create');
             }}
             className={clsx(
               "w-full flex items-center justify-between px-6 py-3 transition-all text-left border-l-2 text-xs font-semibold tracking-wide",
               (activeTab === 'create' && activeReportTabId === 'new')
                 ? "text-[var(--text-main)] border-[var(--accent-main)] bg-black/20 font-bold"
                 : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--text-main)] border-transparent"
             )}
           >
             <span>New Waqfeen Expense</span>
           </button>

           <button 
             onClick={() => {
               setActiveTab('external');
             }}
             className={clsx(
               "w-full flex items-center justify-between px-6 py-3 transition-all text-left border-l-2 text-xs font-semibold tracking-wide",
               activeTab === 'external'
                 ? "text-[var(--text-main)] border-[var(--accent-main)] bg-black/20 font-bold"
                 : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--text-main)] border-transparent"
             )}
           >
             <span>Log External Expense</span>
           </button>

           <div className="h-px bg-white/5 my-4 mx-6" />

           <div className="px-6 mb-2 mt-2">
             <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--text-dim)] opacity-60">Log Books</span>
           </div>

           <button 
             onClick={() => { 
               setActiveTab('history'); 
               setActiveCategory('Drafts'); 
               if (!expandedCategories.has('Drafts')) {
                 toggleCategoryExpand('Drafts');
               }
             }}
             className={clsx(
               "w-full flex items-center justify-between px-6 py-3 transition-all text-left border-l-2 text-xs font-semibold tracking-wide group",
               isDraftsActive
                 ? "text-[var(--text-main)] border-[var(--accent-main)] bg-black/20 font-bold"
                 : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--text-main)] border-transparent"
             )}
           >
             <div className="flex items-center gap-2">
               <span>Drafts</span>
               {draftsCount > 0 && (
                 <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-[var(--text-dim)]">
                   {draftsCount}
                 </span>
               )}
             </div>
             <div 
               onClick={(e) => {
                 e.stopPropagation();
                 toggleCategoryExpand('Drafts');
               }}
               className="p-1 -mr-1 rounded-md hover:bg-white/10 transition-colors"
               title={expandedCategories.has('Drafts') ? "Collapse" : "Expand"}
             >
               <ChevronDown size={14} className={clsx(
                 "transition-transform duration-200 text-[var(--text-dim)] group-hover:text-[var(--text-main)]",
                 !expandedCategories.has('Drafts') && "-rotate-90"
               )} />
             </div>
           </button>

           {expandedCategories.has('Drafts') && (
             <div className="space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                {(() => {
                  const items = getCategoryItems('Drafts');
                 if (items.length === 0) {
                   return (
                     <div className="px-6 py-2 text-[10px] text-[var(--text-dim)] italic">
                       No drafts
                     </div>
                   );
                 }
                 const groups = items.reduce((acc: any, curr) => {
                   const m = curr.month || 'Other';
                   if (!acc[m]) acc[m] = [];
                   acc[m].push(curr);
                   return acc;
                 }, {});

                 return Object.entries(groups).map(([month, monthItems]: [string, any]) => (
                   <div key={month} className="space-y-0.5">
                     <div className="px-6 pt-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--text-dim)] opacity-50">
                       {month}
                     </div>
                     {monthItems.map((exp: any) => {
                       const isOpen = activeReportTabId === exp.id && activeTab === 'create';
                       return (
                         <button
                           key={exp.id}
                           onClick={() => openExpenseInTab(exp, 'Drafts')}
                           className={clsx(
                             "w-full flex items-center justify-between px-6 py-2.5 transition-all text-left border-l-2 text-xs font-semibold tracking-wide group/item",
                             isOpen
                               ? "text-[var(--text-main)] border-[var(--accent-main)] bg-black/20 font-bold"
                               : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--text-main)] border-transparent"
                           )}
                         >
                           <div className="flex flex-col min-w-0 pr-2">
                             <span className="text-xs font-bold text-[var(--text-main)] tracking-tight">{formatExpenseDate(exp.date)}</span>
                             <span className="text-[10px] text-[var(--text-dim)] truncate max-w-[140px]">
                               {exp.purpose && exp.purpose !== 'Cloud Draft' ? exp.purpose : (exp.month || 'Draft')}
                             </span>
                           </div>
                           <span className="text-xs font-bold text-[var(--accent-main)] shrink-0">${parseFloat(exp.total || 0).toFixed(2)}</span>
                         </button>
                       );
                     })}
                   </div>
                 ));
               })()}
             </div>
           )}

           <button 
             onClick={() => { 
               setActiveTab('history'); 
               setActiveCategory('Pending'); 
               if (!expandedCategories.has('Pending')) {
                 toggleCategoryExpand('Pending');
               }
             }}
             className={clsx(
               "w-full flex items-center justify-between px-6 py-3 transition-all text-left border-l-2 text-xs font-semibold tracking-wide group",
               isPendingActive
                 ? "text-[var(--text-main)] border-[var(--accent-main)] bg-black/20 font-bold"
                 : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--text-main)] border-transparent"
             )}
           >
             <div className="flex items-center gap-2">
               <span>Pending</span>
               {pendingCount > 0 && (
                 <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-[var(--text-dim)]">
                   {pendingCount}
                 </span>
               )}
             </div>
             <div 
               onClick={(e) => {
                 e.stopPropagation();
                 toggleCategoryExpand('Pending');
               }}
               className="p-1 -mr-1 rounded-md hover:bg-white/10 transition-colors"
               title={expandedCategories.has('Pending') ? "Collapse" : "Expand"}
             >
               <ChevronDown size={14} className={clsx(
                 "transition-transform duration-200 text-[var(--text-dim)] group-hover:text-[var(--text-main)]",
                 !expandedCategories.has('Pending') && "-rotate-90"
               )} />
             </div>
           </button>

           {expandedCategories.has('Pending') && (
             <div className="space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                {(() => {
                  const items = getCategoryItems('Pending');
                  if (items.length === 0) {
                    return (
                      <div className="px-6 py-2 text-[10px] text-[var(--text-dim)] italic">
                        No pending expenses
                      </div>
                    );
                  }
                  const groups = items.reduce((acc: any, curr) => {
                    const m = curr.month || 'Other';
                    if (!acc[m]) acc[m] = [];
                    acc[m].push(curr);
                    return acc;
                  }, {});

                  return Object.entries(groups).map(([month, monthItems]: [string, any]) => (
                    <div key={month} className="space-y-0.5">
                      <div className="px-6 pt-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--text-dim)] opacity-50">
                        {month}
                      </div>
                      {monthItems.map((exp: any) => {
                        const isOpen = activeReportTabId === exp.id && activeTab === 'create';
                        return (
                          <button
                            key={exp.id}
                            onClick={() => openExpenseInTab(exp, 'Pending')}
                            className={clsx(
                              "w-full flex items-center justify-between px-6 py-2.5 transition-all text-left border-l-2 text-xs font-semibold tracking-wide group/item",
                              isOpen
                                ? "text-[var(--text-main)] border-[var(--accent-main)] bg-black/20 font-bold"
                                : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--text-main)] border-transparent"
                            )}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="text-xs font-bold text-[var(--text-main)] tracking-tight">{formatExpenseDate(exp.date)}</span>
                              <span className="text-[10px] text-[var(--text-dim)] truncate max-w-[140px]">
                                {exp.purpose && exp.purpose !== 'Expense Submission' ? exp.purpose : (exp.month || 'Pending')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs font-bold text-[var(--accent-main)] mr-0.5">${parseFloat(exp.total || 0).toFixed(2)}</span>
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRefundConfirmTarget({ exp, month });
                                }}
                                className="w-4 h-4 rounded-[4px] border border-white/20 hover:border-[var(--accent-main)] hover:bg-[var(--accent-soft)] transition-all flex items-center justify-center cursor-pointer group/check"
                                title="Mark as Refunded"
                              >
                                <Check size={9} className="text-[var(--accent-main)] opacity-0 group-hover/check:opacity-100" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}

           <button 
             onClick={() => { 
               setActiveTab('history'); 
               setActiveCategory('Refunded'); 
               if (!expandedCategories.has('Refunded')) {
                 toggleCategoryExpand('Refunded');
               }
             }}
             className={clsx(
               "w-full flex items-center justify-between px-6 py-3 transition-all text-left border-l-2 text-xs font-semibold tracking-wide group",
               isRefundedActive
                 ? "text-[var(--text-main)] border-[var(--accent-main)] bg-black/20 font-bold"
                 : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--text-main)] border-transparent"
             )}
           >
             <div className="flex items-center gap-2">
               <span>Refunded</span>
               {refundedCount > 0 && (
                 <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-[var(--text-dim)]">
                   {refundedCount}
                 </span>
               )}
             </div>
             <div 
               onClick={(e) => {
                 e.stopPropagation();
                 toggleCategoryExpand('Refunded');
               }}
               className="p-1 -mr-1 rounded-md hover:bg-white/10 transition-colors"
               title={expandedCategories.has('Refunded') ? "Collapse" : "Expand"}
             >
               <ChevronDown size={14} className={clsx(
                 "transition-transform duration-200 text-[var(--text-dim)] group-hover:text-[var(--text-main)]",
                 !expandedCategories.has('Refunded') && "-rotate-90"
               )} />
             </div>
           </button>

           {expandedCategories.has('Refunded') && (
             <div className="space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                {(() => {
                  const items = getCategoryItems('Refunded');
                  if (items.length === 0) {
                    return (
                      <div className="px-6 py-2 text-[10px] text-[var(--text-dim)] italic">
                        No refunded expenses
                      </div>
                    );
                  }
                  const groups = items.reduce((acc: any, curr) => {
                    const m = curr.month || 'Other';
                    if (!acc[m]) acc[m] = [];
                    acc[m].push(curr);
                    return acc;
                  }, {});

                  return Object.entries(groups).map(([month, monthItems]: [string, any]) => (
                    <div key={month} className="space-y-0.5">
                      <div className="px-6 pt-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-[var(--text-dim)] opacity-50">
                        {month}
                      </div>
                      {monthItems.map((exp: any) => {
                        const isOpen = activeReportTabId === exp.id && activeTab === 'create';
                        return (
                          <button
                            key={exp.id}
                            onClick={() => openExpenseInTab(exp, 'Refunded')}
                            className={clsx(
                              "w-full flex items-center justify-between px-6 py-2.5 transition-all text-left border-l-2 text-xs font-semibold tracking-wide group/item",
                              isOpen
                                ? "text-[var(--text-main)] border-[var(--accent-main)] bg-black/20 font-bold"
                                : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--text-main)] border-transparent"
                            )}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="text-xs font-bold text-[var(--text-main)] tracking-tight">{formatExpenseDate(exp.date)}</span>
                              <span className="text-[10px] text-[var(--text-dim)] truncate max-w-[140px]">
                                {exp.purpose && exp.purpose !== 'Expense Submission' ? exp.purpose : (exp.month || 'Refunded')}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[var(--accent-main)] shrink-0">${parseFloat(exp.total || 0).toFixed(2)}</span>
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}
        </nav>
      </div>

      <div className="flex-1 main-content flex flex-col h-full overflow-y-auto scroll-smooth">
        {/* Mobile tab strip */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto px-3 py-2 border-b border-white/5 glass bg-black/10 shrink-0 no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: '⚡' },
            { id: 'create', label: 'New Expense', icon: '+' },
            { id: 'external', label: 'External', icon: '💳' },
            { id: 'history-Drafts', label: 'Drafts', icon: '📝' },
            { id: 'history-Pending', label: 'Pending', icon: '⏳' },
            { id: 'history-Refunded', label: 'Refunded', icon: '✅' },
          ].map(tab => {
            const isActive = tab.id.startsWith('history')
              ? activeTab === 'history' && activeCategory === tab.id.split('-')[1]
              : activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id.startsWith('history')) {
                    setActiveTab('history');
                    setActiveCategory(tab.id.split('-')[1] as any);
                  } else if (tab.id === 'create') {
                    startNewReport(); setActiveTab('create');
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={clsx(
                  "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                  isActive
                    ? "text-[var(--text-main)]"
                    : "text-[var(--text-dim)] border border-white/10 hover:text-[var(--text-muted)]"
                )}
                style={isActive ? { background: 'var(--accent-main)' } : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {activeTab === 'overview' && (
          <div className="p-6 md:p-10 pt-8 md:pt-10 animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-7xl mx-auto w-full flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] uppercase">
                  Financial <span className="text-[var(--accent-main)]">Overview</span>
                </h1>
                <p className="text-[var(--text-dim)] font-medium text-xs mt-1">
                  Executive claims summary, reimbursement velocity, and tax rebate tracking.
                </p>
              </div>

              {/* Header Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportExpensesCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[var(--text-main)] border border-white/5 hover:border-white/15 transition-all shadow-sm active:scale-95"
                  title="Export all claims to CSV"
                >
                  <Download size={13} className="text-[var(--accent-main)]" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={fetchExpenses}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-main)] border border-white/5 transition-all"
                  title="Refresh & Sync Data"
                >
                  <RefreshCw size={14} className={clsx(syncStatus === 'syncing' && "animate-spin text-[var(--accent-main)]")} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startNewReport();
                    setActiveTab('create');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-main)] hover:bg-[var(--accent-main)]/90 text-white text-xs font-bold transition-all shadow-lg active:scale-95"
                >
                  <Plus size={13} />
                  <span>New Claim</span>
                </button>
              </div>
            </div>

            {/* 1. Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Claims */}
              <div className="glass bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/15 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-xl group-hover:bg-white/[0.04] transition-all -mr-6 -mt-6" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-dim)]">Total Claims</span>
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-main)]">
                    <DollarSign size={15} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono tracking-tight text-[var(--text-main)]">
                    ${overviewStats.totalClaimed.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[var(--text-dim)] font-medium mt-1">
                    {expensesHistory.length} total reports filed
                  </div>
                </div>
              </div>

              {/* Card 2: Pending Reimbursement */}
              <div 
                onClick={() => { setActiveTab('history'); setActiveCategory('Pending'); }}
                className="glass bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/30 transition-all cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-all -mr-6 -mt-6" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">Pending Refund</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Clock size={15} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono tracking-tight text-sky-400">
                    ${overviewStats.pendingTotal.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[var(--text-dim)] font-medium mt-1">
                    {overviewStats.pendingCount} claim{overviewStats.pendingCount === 1 ? '' : 's'} awaiting HQ payout
                  </div>
                </div>
              </div>

              {/* Card 3: Refunded & Settled */}
              <div 
                onClick={() => { setActiveTab('history'); setActiveCategory('Refunded'); }}
                className="glass bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all -mr-6 -mt-6" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Reimbursed</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle size={15} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono tracking-tight text-emerald-400">
                    ${overviewStats.refundedTotal.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[var(--text-dim)] font-medium mt-1 flex items-center gap-1.5">
                    <span className="font-bold text-emerald-400">{overviewStats.reconciliationRate}%</span>
                    <span>settlement rate ({overviewStats.refundedCount} claims)</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Accumulated HST / Tax Rebate */}
              <div className="glass bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[var(--accent-main)]/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-main)]/5 rounded-full blur-xl group-hover:bg-[var(--accent-main)]/10 transition-all -mr-6 -mt-6" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]">HST Recoverable</span>
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-main)] flex items-center justify-center">
                    <Receipt size={15} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono tracking-tight text-[var(--accent-main)]">
                    ${overviewStats.hstTotal.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[var(--text-dim)] font-medium mt-1">
                    Charity tax rebate eligible
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Middle Row: 12-Month Trend & Lifecycle Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Trend Chart (2 cols) */}
              <div className="lg:col-span-2 glass bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                      <TrendingUp size={15} className="text-[var(--accent-main)]" />
                      <span>Monthly Spending Trend</span>
                    </h3>
                    <p className="text-[10px] text-[var(--text-dim)] mt-0.5">Expenditure pattern across all 12 calendar months</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-dim)] font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Refunded</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" /> Pending</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Draft</span>
                  </div>
                </div>

                {/* 12 Month Bars */}
                <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 px-1 border-b border-white/5">
                  {months.map(m => {
                    const data = overviewStats.monthlyMap[m];
                    const heightPct = overviewStats.maxMonthlyTotal > 0
                      ? Math.min(100, Math.max(6, Math.round((data.total / overviewStats.maxMonthlyTotal) * 100)))
                      : 6;
                    const hasSpend = data.total > 0;

                    return (
                      <div key={m} className="flex-1 flex flex-col items-center h-full justify-end group/bar relative">
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-20 bg-black/90 border border-white/10 rounded-xl p-2 text-center shadow-xl min-w-[90px]">
                          <span className="text-[9px] font-bold text-[var(--text-dim)] block uppercase">{m}</span>
                          <span className="text-xs font-black font-mono text-[var(--accent-main)] block">${data.total.toFixed(2)}</span>
                          {data.refunded > 0 && <span className="text-[9px] text-emerald-400 block font-medium">Ref: ${data.refunded.toFixed(0)}</span>}
                          {data.pending > 0 && <span className="text-[9px] text-sky-400 block font-medium">Pnd: ${data.pending.toFixed(0)}</span>}
                          {data.draft > 0 && <span className="text-[9px] text-amber-400 block font-medium">Drf: ${data.draft.toFixed(0)}</span>}
                        </div>

                        {/* Bar Segment */}
                        <div 
                          className={clsx(
                            "w-full max-w-[28px] rounded-t-md transition-all duration-300 flex flex-col justify-end overflow-hidden",
                            hasSpend ? "bg-white/10 group-hover/bar:bg-white/20" : "bg-white/[0.02]"
                          )}
                          style={{ height: `${hasSpend ? heightPct : 6}%` }}
                        >
                          {data.draft > 0 && (
                            <div 
                              className="w-full bg-amber-500/80" 
                              style={{ height: `${(data.draft / data.total) * 100}%` }} 
                            />
                          )}
                          {data.pending > 0 && (
                            <div 
                              className="w-full bg-sky-500/80" 
                              style={{ height: `${(data.pending / data.total) * 100}%` }} 
                            />
                          )}
                          {data.refunded > 0 && (
                            <div 
                              className="w-full bg-emerald-500/80" 
                              style={{ height: `${(data.refunded / data.total) * 100}%` }} 
                            />
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-[var(--text-dim)] mt-2 uppercase truncate max-w-full">
                          {m.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Pipeline & Action Alerts (1 col) */}
              <div className="glass bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] mb-1 flex items-center gap-2">
                    <PieChart size={15} className="text-[var(--accent-main)]" />
                    <span>Claims Pipeline</span>
                  </h3>
                  <p className="text-[10px] text-[var(--text-dim)] mb-5">Lifecycle stage distribution</p>

                  <div className="space-y-3">
                    {/* Drafts */}
                    <div 
                      onClick={() => { setActiveTab('history'); setActiveCategory('Drafts'); }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-amber-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block group-hover:text-amber-400 transition-colors">Draft Reports</span>
                          <span className="text-[10px] text-[var(--text-dim)]">{overviewStats.draftCount} unsubmitted</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--text-main)]">${overviewStats.draftTotal.toFixed(2)}</span>
                    </div>

                    {/* Pending */}
                    <div 
                      onClick={() => { setActiveTab('history'); setActiveCategory('Pending'); }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-sky-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block group-hover:text-sky-400 transition-colors">Awaiting Approval</span>
                          <span className="text-[10px] text-[var(--text-dim)]">{overviewStats.pendingCount} with finance</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--text-main)]">${overviewStats.pendingTotal.toFixed(2)}</span>
                    </div>

                    {/* Refunded */}
                    <div 
                      onClick={() => { setActiveTab('history'); setActiveCategory('Refunded'); }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block group-hover:text-emerald-400 transition-colors">Settled / Reimbursed</span>
                          <span className="text-[10px] text-[var(--text-dim)]">{overviewStats.refundedCount} completed</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--text-main)]">${overviewStats.refundedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Reminder Alert Badge */}
                {overviewStats.draftCount > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                    <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[10px] text-amber-200/90 leading-relaxed">
                      You have <strong>{overviewStats.draftCount} draft report{overviewStats.draftCount > 1 ? 's' : ''}</strong> pending completion. Remember to submit before month-end accounting close.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Bottom Row: Category Spend & Recent Claims Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
              {/* Category Breakdown */}
              <div className="glass bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] mb-1 flex items-center gap-2">
                    <Receipt size={15} className="text-[var(--accent-main)]" />
                    <span>Spend by Category</span>
                  </h3>
                  <p className="text-[10px] text-[var(--text-dim)] mb-5">Aggregated according to Jama'at Waqfeen account codes</p>

                  <div className="space-y-3.5">
                    {overviewStats.sortedCategories.length === 0 ? (
                      <p className="text-xs text-[var(--text-dim)] italic py-6 text-center">No categorized expenditures recorded yet.</p>
                    ) : (
                      overviewStats.sortedCategories.map(cat => (
                        <div key={cat.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[var(--text-main)]">{cat.name}</span>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-[10px] text-[var(--text-dim)]">{cat.pct}%</span>
                              <span className="font-bold text-[var(--accent-main)]">${cat.amount.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[var(--accent-main)] rounded-full transition-all duration-500"
                              style={{ width: `${cat.pct}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity Mini-Feed */}
              <div className="glass bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                        <History size={15} className="text-[var(--accent-main)]" />
                        <span>Recent Claims</span>
                      </h3>
                      <p className="text-[10px] text-[var(--text-dim)] mt-0.5">Latest reports recorded across all folders</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('history'); setActiveCategory('Pending'); }}
                      className="text-[10px] font-bold text-[var(--accent-main)] hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>

                  <div className="divide-y divide-white/5">
                    {expensesHistory.slice(0, 5).map(item => {
                      const isRef = item.status === 'refunded' || !!item.refunded;
                      const isDrf = item.status === 'draft' || (!item.isSheet && item.status !== 'sent' && !isRef);
                      const catName = isRef ? 'Refunded' : (isDrf ? 'Drafts' : 'Pending');

                      return (
                        <div 
                          key={item.id} 
                          onClick={() => openExpenseInTab(item, catName)}
                          className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition-all cursor-pointer group"
                        >
                          <div className="flex flex-col min-w-0 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--text-main)] tracking-tight group-hover:text-[var(--accent-main)] transition-colors truncate">
                                {item.purpose || 'Expense Submission'}
                              </span>
                              {isRef && (
                                <span className="px-1.5 py-0.2 text-[8px] font-black rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  REFUNDED
                                </span>
                              )}
                              {isDrf && (
                                <span className="px-1.5 py-0.2 text-[8px] font-black rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  DRAFT
                                </span>
                              )}
                              {!isRef && !isDrf && (
                                <span className="px-1.5 py-0.2 text-[8px] font-black rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                  PENDING
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[var(--text-dim)] mt-0.5">
                              {item.date} &bull; {item.month}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-bold text-xs text-[var(--text-main)]">
                              ${parseFloat(item.total || 0).toFixed(2)}
                            </span>
                            <div className="p-1 rounded-lg bg-white/5 group-hover:bg-[var(--accent-main)] group-hover:text-white transition-colors text-[var(--text-dim)]">
                              <Edit3 size={11} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6 md:p-10 pt-8 md:pt-10 animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-7xl mx-auto w-full flex flex-col gap-6">
            {(() => {
              const categoryItems = getCategoryItems(activeCategory);
              const totalAmount = categoryItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

              return (
                <>
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/5">
                    <div>
                      <h1 className="text-3xl font-black italic tracking-tighter text-[var(--text-main)] uppercase">
                        {activeCategory === 'Drafts' && <>Draft <span className="text-[var(--accent-main)]">Expenses</span></>}
                        {activeCategory === 'Pending' && <>Pending <span className="text-[var(--accent-main)]">Refunds</span></>}
                        {activeCategory === 'Refunded' && <>Refunded <span className="text-[var(--accent-main)]">Expenses</span></>}
                      </h1>
                      <p className="text-[var(--text-dim)] font-medium text-xs mt-1">
                        {activeCategory === 'Drafts' && "Unsubmitted expense reports and saved drafts awaiting completion."}
                        {activeCategory === 'Pending' && "Submitted claims awaiting review, headquarter approval, and reimbursement."}
                        {activeCategory === 'Refunded' && "Archived and reconciled claims that have been reimbursed."}
                      </p>
                    </div>

                    {/* Total Claims Metric Badge (moved where toggle switch was) */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-black/30 border border-white/5 rounded-xl self-start sm:self-auto">
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)]">Total Claims</span>
                        <span className="text-sm font-black text-[var(--accent-main)] font-mono">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)]">Records</span>
                        <span className="text-sm font-bold text-[var(--text-main)]">
                          {categoryItems.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Table Card View */}
                  <div className="glass bg-black/20 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/[0.03] border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-[var(--text-dim)]">
                            <th className="py-3.5 px-5">Date</th>
                            <th className="py-3.5 px-4">Period</th>
                            <th className="py-3.5 px-4">Purpose & Details</th>
                            <th className="py-3.5 px-4 text-right">Amount</th>
                            <th className="py-3.5 px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                          {categoryItems.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-16 text-center">
                                <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 text-[var(--text-dim)]">
                                    <History size={24} />
                                  </div>
                                  <p className="text-sm font-bold text-[var(--text-main)] mb-1">
                                    No {activeCategory.toLowerCase()} available
                                  </p>
                                  <p className="text-[11px] text-[var(--text-dim)]">
                                    There are currently no expenses categorized as {activeCategory}.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            categoryItems.map(item => {
                              let parsedData: any = null;
                              if (item.data) {
                                try {
                                  parsedData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                                } catch (e) {
                                  console.warn(e);
                                }
                              }

                              const receiptCount = parsedData?.receipts?.length || 0;
                              const activeIndicesList: number[] = parsedData?.activeIndices || [];
                              const commentsToShow = item.comments || parsedData?.formData?.comments || '';

                              return (
                                <tr 
                                  key={item.id} 
                                  className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                                  onClick={() => openExpenseInTab(item, activeCategory)}
                                >
                                  {/* Date */}
                                  <td className="py-4 px-5 align-top">
                                    <span className="font-bold text-sm text-[var(--text-main)] tracking-tight">
                                      {item.date}
                                    </span>
                                  </td>

                                  {/* Period */}
                                  <td className="py-4 px-4 align-top">
                                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/5 border border-white/5 text-[var(--text-main)]">
                                      {item.month || 'Other'}
                                    </span>
                                  </td>

                                  {/* Purpose & Breakdown */}
                                  <td className="py-4 px-4 align-top">
                                    <div className="flex flex-col gap-1 max-w-md">
                                      <span className="font-bold text-xs text-[var(--text-main)] group-hover:text-[var(--accent-main)] transition-colors line-clamp-1">
                                        {item.purpose || 'Expense Submission'}
                                      </span>
                                      
                                      {/* Subtext info: receipt pills, breakdown, drive link */}
                                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                        {receiptCount > 0 && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-dim)] bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                            <Paperclip size={9} />
                                            <span>{receiptCount} receipt{receiptCount > 1 ? 's' : ''}</span>
                                          </span>
                                        )}

                                        {activeIndicesList.length > 0 && (
                                          <span className="text-[10px] text-[var(--text-dim)]">
                                            {activeIndicesList.length} item{activeIndicesList.length > 1 ? 's' : ''} claimed
                                          </span>
                                        )}

                                        {item.folderLink && (item.folderLink.startsWith('http://') || item.folderLink.startsWith('https://')) && (
                                          <a
                                            href={item.folderLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent-main)] hover:underline"
                                            title="Open Drive Folder"
                                          >
                                            <Folder size={10} />
                                            <span>Drive Folder</span>
                                            <ExternalLink size={8} />
                                          </a>
                                        )}
                                      </div>

                                      {commentsToShow && (
                                        <p className="text-[10px] text-[var(--text-dim)] italic line-clamp-1 mt-0.5">
                                          "{commentsToShow}"
                                        </p>
                                      )}
                                    </div>
                                  </td>

                                  {/* Total Amount */}
                                  <td className="py-4 px-4 align-top text-right">
                                    <span className="font-mono font-bold text-sm text-[var(--text-main)] group-hover:text-[var(--accent-main)] transition-colors">
                                      ${parseFloat(item.total || 0).toFixed(2)}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-4 px-5 align-top text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Quick Refund Toggle */}
                                      {activeCategory === 'Pending' && (
                                        <button
                                          type="button"
                                          onClick={() => setRefundConfirmTarget({ exp: item, month: item.month || 'Other' })}
                                          className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-[var(--text-dim)] hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer"
                                          title="Mark as Refunded"
                                        >
                                          <Check size={12} />
                                        </button>
                                      )}
                                      {activeCategory === 'Refunded' && (
                                        <button
                                          type="button"
                                          onClick={() => toggleRefund(item)}
                                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-white/5 text-emerald-400 hover:text-[var(--text-dim)] border border-emerald-500/20 transition-all cursor-pointer"
                                          title="Undo Refund (Mark as Pending)"
                                        >
                                          <CheckCircle size={12} />
                                        </button>
                                      )}

                                      {/* Delete Button */}
                                      <button
                                        type="button"
                                        onClick={() => setExpenseToDelete(item)}
                                        className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-500 hover:text-red-400 border border-red-600/20 hover:border-red-600/40 transition-all cursor-pointer"
                                        title="Delete Expense"
                                      >
                                        <Trash2 size={12} />
                                      </button>

                                      {/* Open / Edit Tab Button */}
                                      <button
                                        type="button"
                                        onClick={() => openExpenseInTab(item, activeCategory)}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[var(--text-main)] transition-all border border-white/5 hover:border-[var(--accent-main)]/40 ml-1 cursor-pointer"
                                        title="Open in Tab"
                                      >
                                        <Edit3 size={11} className="text-[var(--accent-main)]" />
                                        <span>Open</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer */}
                    {categoryItems.length > 0 && (
                      <div className="px-5 py-3.5 bg-black/30 border-t border-white/5 flex items-center justify-between text-xs text-[var(--text-dim)]">
                        <span>
                          Showing <strong className="text-[var(--text-main)]">{categoryItems.length}</strong> {categoryItems.length === 1 ? 'expense' : 'expenses'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider">Subtotal:</span>
                          <span className="font-mono font-bold text-sm text-[var(--accent-main)]">
                            ${totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="flex flex-col gap-6 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full px-6 md:px-12 pt-6 md:pt-8 max-w-7xl mx-auto">
            {/* Top Action Bar Section */}
            <div className="flex items-center justify-between mb-4">
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title={isCurrentDraft ? "Delete draft" : "Delete expense"}
            style={{ backgroundColor: '#dc2626', borderColor: '#ef4444', color: '#ffffff' }}
            className="p-4 btn-delete-draft-permanent rounded-[18px] transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg shadow-red-600/40 cursor-pointer"
          >
            <Trash2 size={18} color="#ffffff" className="stroke-white" />
          </button>

          <button 
            onClick={handleSaveDraft}
            disabled={isSaving || isReadOnly}
            className={clsx(
              "px-6 py-4 glass rounded-[18px] border transition-all flex items-center gap-3 group relative overflow-hidden",
              isReadOnly ? "bg-white/5 border-white/10 opacity-60 cursor-not-allowed" : "bg-[var(--accent-main)]/10 border-[var(--accent-main)]/20 hover:bg-[var(--accent-main)]/20 text-[var(--accent-main)]"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--accent-main)]/20 border-t-[var(--accent-main)]" />
            ) : (
              isReadOnly ? <Lock size={16} className="text-amber-400" /> : <Save size={18} className="group-hover:scale-110 transition-transform relative z-10" />
            )}
            <span className={clsx("text-[10px] font-black uppercase tracking-[0.3em] relative z-10", isReadOnly && "text-amber-400/90")}>
              {isReadOnly ? "Locked • Pending" : (isJustSaved ? "Draft saved" : "Save as draft")}
            </span>
          </button>
        </div>
      </div>



      <div className="w-full space-y-6 form-v4 no-drag">


        <form id="F" onSubmit={(e) => e.preventDefault()} className="space-y-6">
          
          {/* Expense Policy Summary Section (Unboxed) */}
          <div className="glass bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3 mb-4 shadow-xl">
            <div className={clsx("flex items-center justify-between", !isPolicySummaryMinimized && "pb-3 border-b border-white/5")}>
              <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setIsPolicySummaryMinimized(!isPolicySummaryMinimized)}>
                <div className="w-2 h-2 rounded-full bg-[var(--accent-main)]"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-main)]">
                  Expense Policy Summary
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPolicySummaryMinimized(!isPolicySummaryMinimized)}
                className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-all"
                title={isPolicySummaryMinimized ? "Expand Policy Summary" : "Minimize Policy Summary"}
              >
                {isPolicySummaryMinimized ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {!isPolicySummaryMinimized && (
              <div className="overflow-x-auto animate-in slide-in-from-top-1 duration-300">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
                      <th className="py-2.5 px-3">Expense</th>
                      <th className="py-2.5 px-3">Explanation</th>
                      <th className="py-2.5 px-3 text-right">Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[var(--text-main)]">Vehicle Fuel</td>
                      <td className="py-2.5 px-3 text-[var(--text-dim)]">Expense total over limit should be explained in detail</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-main)]">$330 per Month</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[var(--text-main)]">Communication</td>
                      <td className="py-2.5 px-3 text-[var(--text-dim)]">Includes Cable TV, Internet, Landline, and Mobile</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-main)]">$175 Per Month</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[var(--text-main)]">Household</td>
                      <td className="py-2.5 px-3 text-[var(--text-dim)]">Minor replacement or repair of small household items</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-main)]">$200 Per Year</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[var(--text-main)]">Diyafat</td>
                      <td className="py-2.5 px-3 text-[var(--text-dim)]">Entertainment of official or formal guests</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-main)]">$100 Per Month</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[var(--text-main)]">Dental</td>
                      <td className="py-2.5 px-3 text-[var(--text-dim)]">Dental work for immediate family, non-cosmetic only</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-main)]">$1500 Per Year/Family</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[var(--text-main)]">Prescription Glasses</td>
                      <td className="py-2.5 px-3 text-[var(--text-dim)]">Eye exam fees are included in the expense limit.</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-main)]">$200 Per 2 Years/Member</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Expense Presets Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 glass bg-white/5 p-4 rounded-2xl border border-white/5 shadow-md mb-2">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              <div className="flex items-center gap-2 pr-2 border-r border-white/10">
                <Bookmark size={14} className="text-[var(--accent-main)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">Presets ({presets.length}/5)</span>
              </div>

              {presets.length === 0 ? (
                <span className="text-[10px] font-medium text-[var(--text-dim)] italic">No saved presets. Fill out form & click + to save preset.</span>
              ) : (
                presets.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => !isReadOnly && applyPreset(p)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 transition-all group",
                      !isReadOnly ? "hover:border-[var(--accent-main)]/40 hover:bg-white/10 cursor-pointer" : "cursor-not-allowed opacity-50"
                    )}
                    title={isReadOnly ? "Locked: expense is read-only" : `Click to load preset: ${p.name}`}
                  >
                    <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--accent-main)] transition-colors">{p.name}</span>
                    {!isReadOnly && (
                      <button
                        onClick={(e) => removePreset(p.id, e)}
                        className="p-0.5 rounded-md hover:bg-red-500/20 hover:text-red-400 text-[var(--text-dim)] transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Preset"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={handleAddPreset}
              disabled={presets.length >= 5 || isReadOnly}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 shadow-sm group",
                (presets.length >= 5 || isReadOnly)
                  ? "bg-white/5 text-[var(--text-dim)] border-white/5 opacity-50 cursor-not-allowed"
                  : "bg-[var(--accent-soft)] text-[var(--accent-main)] border-[var(--accent-main)]/30 hover:bg-[var(--accent-main)] hover:text-white"
              )}
              title={isReadOnly ? "Cannot add preset to locked expense" : (presets.length >= 5 ? "Maximum 5 presets reached. Delete one to add a new preset." : "Save current form as a new preset (named after Expense Description)")}
            >
              <Plus size={14} />
              <span>Add Preset</span>
            </button>
          </div>

          {/* Card 1: General Info */}
          <div className="card" id="general-info-card">
            <div className="card-hdr">
              <div className="dot"></div>
              GENERAL INFORMATION
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Full Name</span>
                      {exportError && !formData.fullName && (
                        <span className="text-[10px] text-amber-400 font-bold normal-case tracking-normal">Required for export</span>
                      )}
                    </label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={isReadOnly}
                      className={clsx(exportError && !formData.fullName && "!border-amber-500/80 !ring-1 !ring-amber-500/50")}
                      placeholder="e.g. Waleed Ahmad Mangla" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-1 gap-2">
                      <label className="lbl flex items-center justify-between">
                        <span>Member Code</span>
                        {exportError && !formData.memberCode && (
                          <span className="text-[10px] text-amber-400 font-bold normal-case tracking-normal">Required</span>
                        )}
                      </label>
                      <input 
                        type="text" 
                        value={formData.memberCode}
                        onChange={(e) => handleInputChange('memberCode', e.target.value)}
                        disabled={isReadOnly}
                        className={clsx(exportError && !formData.memberCode && "!border-amber-500/80 !ring-1 !ring-amber-500/50")}
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
                    className={clsx("h-20 resize-none", isReadOnly && "bg-white/5 opacity-60 cursor-not-allowed text-stone-300")} 
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    disabled={isReadOnly}
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
                            className={clsx("!p-1 !text-[10px] !bg-transparent !border-0 font-mono text-v4-ink-muted focus:!bg-white/10 outline-none", !isReadOnly ? "cursor-pointer" : "cursor-not-allowed opacity-70")} 
                            value={itemData[idx]?.ref || '1'}
                            onChange={(e) => handleItemChange(idx, 'ref', e.target.value)}
                            disabled={isReadOnly}
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
                            className={clsx("!p-1 !text-xs !bg-transparent !border-0 text-right focus:!bg-white/10", isReadOnly && "opacity-70 cursor-not-allowed")} 
                            placeholder="0.00"
                            value={itemData[idx]?.hst || ''}
                            onChange={(e) => handleItemChange(idx, 'hst', e.target.value)}
                            disabled={isReadOnly}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input 
                            type="text" 
                            className={clsx("!p-1 !text-xs !bg-transparent !border-0 text-right font-bold focus:!bg-white/10", isReadOnly && "opacity-70 cursor-not-allowed")} 
                            placeholder="0.00"
                            value={itemData[idx]?.total || ''}
                            onChange={(e) => handleItemChange(idx, 'total', e.target.value)}
                            disabled={isReadOnly}
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          {!isReadOnly && (
                            <button 
                                onClick={() => removeCategory(idx)}
                                className="text-v4-rule  transition-colors active:scale-90"
                                title="Remove item"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Add Expense Row (Hidden when Read-Only) */}
                  {!isReadOnly && (
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
                  )}

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
                        className={clsx("h-32 resize-none", isReadOnly && "bg-white/5 opacity-60 cursor-not-allowed text-stone-300")} 
                        value={formData.comments}
                        onChange={(e) => handleInputChange('comments', e.target.value)}
                        disabled={isReadOnly}
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
                          <div className={clsx(
                            "border-2 border-dashed border-white/5 rounded-[20px] p-8 flex flex-col items-center justify-center gap-4 transition-all",
                            !isReadOnly ? "group cursor-pointer hover:border-white/10" : "cursor-not-allowed opacity-50"
                          )}
                               onClick={() => !isReadOnly && fileInputRef.current?.click()}>
                              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center transition-all">
                                  <Paperclip size={20} className="text-[var(--text-main)]/40 " />
                              </div>
                              <div className="text-center">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]/50 transition-colors">
                                    {isReadOnly ? "No receipts attached" : "Click to upload receipts"}
                                  </p>
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
                                              isReadOnly={isReadOnly}
                                          />
                                      ))}
                                  </div>
                              </SortableContext>
                          </DndContext>
                      )}

                      {!isReadOnly && (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 w-full p-3 rounded-[16px] border border-dashed border-white/10 flex items-center justify-center gap-2 transition-all group"
                        >
                            <Plus size={14} className="text-[var(--text-main)]/20 " />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-main)]/20 ">Add Another Receipt</span>
                        </button>
                      )}

                      {!isReadOnly && receipts.length > 0 && (
                          <button
                              type="button"
                              disabled={isAnalyzing || hasUsedAiInCurrentReport}
                              onClick={handleAutoFillDescription}
                              className={`mt-2 w-full p-3 rounded-[16px] border flex items-center justify-center gap-2 transition-all font-bold text-[9px] uppercase tracking-widest ${
                                  hasUsedAiInCurrentReport 
                                      ? "bg-stone-500/10 border-stone-500/20 text-stone-400 cursor-not-allowed opacity-70" 
                                      : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
                              }`}
                          >
                              {hasUsedAiInCurrentReport 
                                  ? "✓ AI ANALYSIS COMPLETE FOR THIS REPORT" 
                                  : (isAnalyzing ? "ANALYZING RECEIPTS..." : "✨ AUTOFILL")}
                          </button>
                      )}

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
          {exportError && (
            <div className="col-span-1 md:col-span-2 flex items-center justify-between p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-xl shadow-amber-950/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <AlertCircle size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-200">{exportError}</p>
                  <p className="text-[10px] text-amber-300/70 font-semibold mt-0.5">Please provide Full Name and 5-digit Member Code in General Information.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('general-info-card');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  Go to fields
                </button>
                <button 
                  type="button"
                  onClick={() => setExportError(null)}
                  className="p-1.5 rounded-xl text-amber-400 hover:text-white hover:bg-amber-500/20 transition-all cursor-pointer"
                  title="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

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
          
          {isReadOnly ? (
            <button 
              disabled={true}
              className="py-5 rounded-[14px] flex items-center justify-center gap-3 text-sm font-black tracking-widest uppercase no-drag bg-white/5 border border-white/10 text-[var(--text-dim)] cursor-not-allowed opacity-60"
            >
              <Lock size={20} className="text-amber-400" />
              Submitted • Pending Refund
            </button>
          ) : (
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
          )}

          <div className="col-span-1 md:col-span-2 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] font-medium text-[var(--text-dim)] shadow-sm">
            <Cloud size={15} className="text-[var(--accent-main)] shrink-0" />
            <span><strong className="text-[var(--text-main)] font-semibold">Note:</strong> Every expense that is sent is backed up on Google Drive.</span>
          </div>
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

      {/* Custom Delete Confirmation Modal */}
      {(showDeleteConfirm || expenseToDelete) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => { setShowDeleteConfirm(false); setExpenseToDelete(null); }}
          />
          <div className="relative w-full max-w-sm glass bg-[#0a0a0a]/90 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 pt-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 flex items-center justify-center text-red-500 border border-red-600/30 mb-6 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <Trash2 size={32} />
              </div>
              
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--text-main)] mb-3 italic">
                Delete <span className="text-red-500">{(expenseToDelete?.isDriveDraft || (isCurrentDraft && !expenseToDelete)) ? 'Draft' : 'Expense'}</span>?
              </h3>
              
              <p className="text-xs font-bold text-[var(--text-main)] leading-relaxed max-w-[280px]">
                {expenseToDelete ? (
                  <>Are you sure you want to delete the expense for <span className="text-red-400">{expenseToDelete.month || expenseToDelete.date}</span> (${parseFloat(expenseToDelete.total || 0).toFixed(2)})?</>
                ) : (
                  isCurrentDraft 
                    ? "Are you sure you want to delete this draft? This action cannot be undone."
                    : "Are you sure you want to delete this entire expense record? This action cannot be undone."
                )}
              </p>
              <p className="text-[10px] font-medium text-[var(--text-dim)] mt-2">
                This will permanently delete the expense and cannot be undone.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mt-8">
                <button 
                  onClick={() => { setShowDeleteConfirm(false); setExpenseToDelete(null); }}
                  className="px-6 py-4 rounded-[18px] border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--text-main)] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteExpense(expenseToDelete)}
                  className="px-6 py-4 rounded-[18px] bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-900/40 hover:bg-red-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Missing Info Error Modal */}
      {showInfoErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowInfoErrorModal(false)}
          />
          <div className="relative w-full max-w-sm glass bg-[#0a0a0a]/90 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 pt-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <AlertCircle size={32} />
              </div>
              
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--text-main)] mb-3 italic">
                Missing <span className="text-amber-400">Information</span>
              </h3>
              
              <p className="text-xs font-bold text-[var(--text-main)] leading-relaxed max-w-[280px]">
                Please fill in basic member information before exporting.
              </p>
              <p className="text-[10px] font-medium text-[var(--text-dim)] mt-2">
                Full Name and Member Code are required.
              </p>

              <div className="w-full mt-8">
                <button 
                  onClick={() => {
                    setShowInfoErrorModal(false);
                    const el = document.getElementById('general-info-card');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="w-full px-6 py-4 rounded-[18px] bg-[var(--accent-main)] text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  OK, Fill Information
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* On-Page Refund Confirmation Modal */}
      {refundConfirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setRefundConfirmTarget(null)}
          />
          <div className="relative w-full max-w-sm glass bg-[#0a0a0a]/90 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 pt-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Check size={32} />
              </div>
              
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--text-main)] mb-3 italic">
                Mark as <span className="text-emerald-400">Refunded</span>?
              </h3>
              
              <p className="text-xs font-bold text-[var(--text-main)] leading-relaxed max-w-[280px]">
                Mark expense for {refundConfirmTarget.month} (${parseFloat(refundConfirmTarget.exp.total || 0).toFixed(2)}) as refunded?
              </p>
              <p className="text-[10px] font-medium text-[var(--text-dim)] mt-2">
                This will update the status to refunded and sync across records.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mt-8">
                <button 
                  onClick={() => setRefundConfirmTarget(null)}
                  className="px-6 py-4 rounded-[18px] border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--text-main)] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const target = refundConfirmTarget;
                    setRefundConfirmTarget(null);
                    toggleRefund(target.exp);
                  }}
                  className="px-6 py-4 rounded-[18px] bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/40 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Confirm
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
