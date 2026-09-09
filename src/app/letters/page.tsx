"use client";

import React, { useState, useEffect } from "react";
import {
  ScrollText,
  Crown,
  Shield,
  Radio,
  ClipboardList,
  UserCheck,
  Send,
  Eye,
  Download,
  CheckCircle,
  Loader2,
  AlertCircle,
  Mail,
  FileText,
  Sparkles,
  Calendar as CalendarIcon,
  Globe,
  Heart,
  Building,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  User,
  Hash,
  Briefcase,
  Save,
  Languages,
  Wand2,
  Search,
  Mic,
  Upload,
  HardDrive,
  Edit3,
  X,
} from "lucide-react";
import clsx from "clsx";
import { liquid } from "@/lib/sync/bridge";

interface LetterCategory {
  id: string;
  label: string;
  recipient: string;
  recipientEmail: string;
  icon: React.ElementType;
  description: string;
  tag: string;
}

const CATEGORIES: LetterCategory[] = [
  {
    id: "huzoor",
    label: "Letter to Huzoor",
    recipient: "His Holiness Hazrat Mirza Masroor Ahmad (aba)",
    recipientEmail: "private.secretary@ahmadiyya.org.uk",
    icon: Crown,
    description: "Official correspondence & petitions addressed directly to Huzoor (aba)",
    tag: "HQ Protocol",
  },
  {
    id: "amir",
    label: "Letter to Amir",
    recipient: "Respected Amir Sahib",
    recipientEmail: "amir@ahmadiyya.ca",
    icon: Shield,
    description: "Formal letter addressed to the National Amir Jamaat",
    tag: "National HQ",
  },
  {
    id: "tabshir",
    label: "Letter to Tabshir",
    recipient: "Wakalat-e-Tabshir",
    recipientEmail: "tabshir@ahmadiyya.org.uk",
    icon: Radio,
    description: "Correspondence & reports addressed to Wakalat-e-Tabshir",
    tag: "Tehrik-e-Jadid",
  },
  {
    id: "request",
    label: "Letter of Request",
    recipient: "Respected Authority",
    recipientEmail: "",
    icon: ClipboardList,
    description: "Standard request, application, or official petition",
    tag: "General Request",
  },
  {
    id: "missionary",
    label: "Letter to Missionary In-charge",
    recipient: "Respected Missionary In-charge Sahib",
    recipientEmail: "missionary.incharge@ahmadiyya.ca",
    icon: UserCheck,
    description: "Official letter addressed to the Missionary In-charge",
    tag: "Field Command",
  },
];

type HuzoorSubCategory = "prayers" | "leave_international" | "uk_accommodation";

const HUZOOR_SUB_CATEGORIES: { id: HuzoorSubCategory; label: string; icon: React.ElementType }[] = [
  { id: "prayers", label: "Letter for Prayers", icon: Heart },
  { id: "leave_international", label: "Leave Request (International)", icon: Globe },
  { id: "uk_accommodation", label: "Request for Accommodation (UK Only)", icon: Building },
];

// Country list excluding Canada
const COUNTRIES_EXCLUDING_CANADA = [
  "United Kingdom",
  "Pakistan",
  "United States",
  "Germany",
  "India",
  "Turkey",
  "Saudi Arabia",
  "United Arab Emirates",
  "Ghana",
  "Nigeria",
  "Kenya",
  "Tanzania",
  "Australia",
  "Spain",
  "France",
  "Switzerland",
  "Norway",
  "Sweden",
  "Denmark",
  "Netherlands",
  "Belgium",
  "Japan",
  "Malaysia",
  "Indonesia",
  "Other",
];

// Format date into "September 11, 2026"
function formatPrettyDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (monthIdx < 0 || monthIdx > 11) return dateStr;

  return `${months[monthIdx]} ${day}, ${year}`;
}

// ── Google Flights Style Dual Month Date Picker Modal ──
function GoogleFlightsDatePickerModal({
  isOpen,
  onClose,
  fromDate,
  toDate,
  onSelectRange,
}: {
  isOpen: boolean;
  onClose: () => void;
  fromDate: string;
  toDate: string;
  onSelectRange: (start: string, end: string) => void;
}) {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 8, 1));
  const [tempStart, setTempStart] = useState<string>(fromDate);
  const [tempEnd, setTempEnd] = useState<string>(toDate);
  const [selectingStep, setSelectingStep] = useState<"start" | "end">("start");

  useEffect(() => {
    setTempStart(fromDate);
    setTempEnd(toDate);
  }, [fromDate, toDate, isOpen]);

  if (!isOpen) return null;

  const nextMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const handleDateClick = (dateStr: string) => {
    if (selectingStep === "start" || (tempStart && tempEnd) || (tempStart && dateStr < tempStart)) {
      setTempStart(dateStr);
      setTempEnd("");
      setSelectingStep("end");
    } else {
      setTempEnd(dateStr);
      setSelectingStep("start");
    }
  };

  const handleApply = () => {
    if (tempStart && tempEnd) {
      onSelectRange(tempStart, tempEnd);
    } else if (tempStart) {
      onSelectRange(tempStart, tempStart);
    }
    onClose();
  };

  const renderMonthCalendar = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const isStart = tempStart === dateStr;
      const isEnd = tempEnd === dateStr;
      const isInRange = tempStart && tempEnd && dateStr > tempStart && dateStr < tempEnd;

      days.push(
        <div key={dateStr} className="relative flex items-center justify-center py-0.5">
          <button
            key={dateStr}
            onClick={() => handleDateClick(dateStr)}
            className={clsx(
              "text-[10px] font-bold w-7 h-7 flex flex-col items-center justify-center rounded-xl transition-all relative",
              (isStart || isEnd) && "bg-[var(--accent-main)] text-white shadow-md font-black z-10 scale-105",
              isInRange && "bg-white/10 text-[var(--accent-main)] font-black border border-[var(--accent-main)]/30",
              !isStart && !isEnd && !isInRange && "text-[var(--foreground)] hover:bg-white/10"
            )}
          >
            <span>{d}</span>
            {(isStart || isEnd) && (
              <div className="w-1 h-1 rounded-full bg-white absolute bottom-0.5" />
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="w-full select-none">
        <div className="text-xs font-black text-[var(--foreground)] tracking-tight text-center mb-3">
          {monthNames[month]} {year}
        </div>
        <div className="grid grid-cols-7 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-[8px] font-black uppercase tracking-widest text-[var(--text-dim)] text-center py-1"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5 justify-items-center">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-card rounded-[24px] p-6 max-w-2xl w-full border border-white/10 shadow-2xl space-y-6 bg-[#0c0d1e]/95 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/20">
              <CalendarIcon size={18} />
            </div>
            <div>
              <h3 className="text-base font-black italic tracking-tight text-white">
                Select Departure & Return Dates
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)] opacity-70">
                Google Flights Date Picker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-2 rounded-xl glass border border-white/10"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-black/40 p-3 rounded-2xl border border-white/5">
          <div
            onClick={() => setSelectingStep("start")}
            className={clsx(
              "p-3 rounded-xl border transition-all cursor-pointer",
              selectingStep === "start"
                ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-white"
                : "bg-white/5 border-white/5 text-white/60"
            )}
          >
            <span className="block text-[9px] font-black uppercase tracking-widest text-white/50">
              Departure Date
            </span>
            <span className="text-xs font-bold text-white mt-1 block">
              {tempStart ? formatPrettyDate(tempStart) : "Select date"}
            </span>
          </div>
          <div
            onClick={() => setSelectingStep("end")}
            className={clsx(
              "p-3 rounded-xl border transition-all cursor-pointer",
              selectingStep === "end"
                ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-white"
                : "bg-white/5 border-white/5 text-white/60"
            )}
          >
            <span className="block text-[9px] font-black uppercase tracking-widest text-white/50">
              Return Date
            </span>
            <span className="text-xs font-bold text-white mt-1 block">
              {tempEnd ? formatPrettyDate(tempEnd) : "Select date"}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between absolute top-0 left-0 right-0 z-10 px-2 pointer-events-none">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl glass border border-white/10 text-white/70 hover:text-white pointer-events-auto hover:bg-white/10"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl glass border border-white/10 text-white/70 hover:text-white pointer-events-auto hover:bg-white/10"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {renderMonthCalendar(currentMonthDate)}
            <div className="hidden md:block">
              {renderMonthCalendar(nextMonthDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => {
              setTempStart("");
              setTempEnd("");
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95"
            style={{ background: "var(--accent-main)" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LettersPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("huzoor");
  const [huzoorSubCat, setHuzoorSubCat] = useState<HuzoorSubCategory>("prayers");

  // General Form Fields
  const [name, setName] = useState("ولید احمد منگلا");
  const [code, setCode] = useState("12878");
  const [designation, setDesignation] = useState("مربی سلسلہ");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  // Leave Request (International) Specific Fields
  const [fromDate, setFromDate] = useState("2026-09-11");
  const [toDate, setToDate] = useState("2026-09-25");
  const [selectedCountry, setSelectedCountry] = useState("United Kingdom");
  const [includeWifePermission, setIncludeWifePermission] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  // States
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  // AI Assistant & Smart Search States
  const [isAiDraftOpen, setIsAiDraftOpen] = useState(false);
  const [aiPromptTopic, setAiPromptTopic] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<"translate" | "draft" | "search" | null>(null);
  const [isListening, setIsListening] = useState(false);

  // AI Smart Search & Prefill Handler
  const handleAiSmartSearch = async (queryText?: string) => {
    const textToSearch = queryText || searchQuery;
    if (!textToSearch.trim()) return;

    setIsAiLoading(true);
    setAiMode("search");
    setErrorMessage("");

    try {
      const res = await fetch("/api/letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "smart_search",
          query: textToSearch,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.categoryId) {
        handleSelectCategoryItem(
          data.categoryId,
          data.subCategoryId ? (data.subCategoryId as HuzoorSubCategory) : undefined
        );
      }

      if (data.country) setSelectedCountry(data.country);
      if (data.fromDate) setFromDate(data.fromDate);
      if (data.toDate) setToDate(data.toDate);
      if (data.wifePermission !== null && data.wifePermission !== undefined) {
        setIncludeWifePermission(Boolean(data.wifePermission));
      }
      if (data.urduBody) {
        setCustomMessage(data.urduBody);
      }
    } catch (err: any) {
      console.error("AI Smart Search Error:", err);
      setErrorMessage(err.message || "Failed to analyze AI search query.");
    } finally {
      setIsAiLoading(false);
      setAiMode(null);
    }
  };

  // Voice Speech-to-Text Input Handler
  const handleVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        setSearchQuery(transcript);
        handleAiSmartSearch(transcript);
      }
    };

    recognition.start();
  };
  // Search & Recent Categories State
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"categories" | "recent">("categories");
  const [recentCategoryKeys, setRecentCategoryKeys] = useState<string[]>([
    "huzoor-prayers",
    "huzoor-leave_international",
    "amir-main",
  ]);

  // Start a fresh letter / reset
  const handleNewLetter = () => {
    setCustomMessage("");
    setActiveCategoryId("huzoor");
    setHuzoorSubCat("prayers");
    setViewMode("edit");
  };

  // Handle selecting a category or sub-category item
  const handleSelectCategoryItem = (catId: string, subId?: HuzoorSubCategory) => {
    setActiveCategoryId(catId);
    if (catId === "huzoor" && subId) {
      setHuzoorSubCat(subId);
    }
    const itemKey = catId === "huzoor" ? `huzoor-${subId || huzoorSubCat}` : `${catId}-main`;
    setRecentCategoryKeys((prev) => [itemKey, ...prev.filter((k) => k !== itemKey)]);
  };

  // AI Translate Handler
  const handleAiTranslate = async () => {
    if (!customMessage.trim()) return;
    setIsAiLoading(true);
    setAiMode("translate");
    setErrorMessage("");

    try {
      const res = await fetch("/api/letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "translate",
          text: customMessage,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.result) {
        setCustomMessage(data.result);
      }
    } catch (err: any) {
      console.error("AI Translation Error:", err);
      setErrorMessage(err.message || "Failed to translate text.");
    } finally {
      setIsAiLoading(false);
      setAiMode(null);
    }
  };

  // AI Generate Draft Handler
  const handleAiGenerateDraft = async () => {
    if (!aiPromptTopic.trim()) return;
    setIsAiLoading(true);
    setAiMode("draft");
    setErrorMessage("");

    try {
      const res = await fetch("/api/letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "draft",
          prompt: aiPromptTopic,
          recipient: currentCategory.recipient,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.result) {
        setCustomMessage(data.result);
        setIsAiDraftOpen(false);
        setAiPromptTopic("");
      }
    } catch (err: any) {
      console.error("AI Draft Generation Error:", err);
      setErrorMessage(err.message || "Failed to generate AI draft.");
    } finally {
      setIsAiLoading(false);
      setAiMode(null);
    }
  };

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategoryId)!;
  const CategoryIcon = currentCategory.icon;

  // Compute final Urdu text body dynamically based on sub-category selection
  const computedUrduBody = React.useMemo(() => {
    if (activeCategoryId !== "huzoor") {
      return customMessage || "خدا تعالیٰ سے دعا ہے کہ خدا تعالیٰ آپ کو صحت والی زندگی عطا فرمائے۔ آمین۔";
    }

    if (huzoorSubCat === "prayers") {
      return (
        customMessage ||
        "حضور انور ایدہ اللہ تعالیٰ بنصرہ العزیز کی خدمت اقدس میں عاجزانہ درخواست دعا ہے کہ اللہ تعالیٰ حضور انور کو صحت، سلامتی اور لمبی عمر بالخیر عطا فرمائے اور حضور انور کا بابرکت سایہ ہمارے سروں پر قائم رکھے۔ آمین۔\n\nخدا تعالیٰ سے دعا ہے کہ خدا تعالیٰ آپ کو صحت والی زندگی عطا فرمائے۔ آمین۔"
      );
    }

    if (huzoorSubCat === "leave_international") {
      const fromPretty = formatPrettyDate(fromDate);
      const toPretty = formatPrettyDate(toDate);
      const datesText =
        fromPretty && toPretty
          ? `تاریخ ${fromPretty} تا ${toPretty}`
          : "مقررہ تواریخ";
      const countryText = selectedCountry || "بیرون ملک";

      let text = `عاجزانہ درخواست ہے کہ خاکسار کو ${countryText} کا سفر اختیار کرنے کی اجازت مرحمت فرمائی جائے۔ خاکسار کی رخصت کی تواریخ ${datesText} تک مطلوب ہیں۔`;

      if (includeWifePermission) {
        text += ` نیز خاکسار کی اہلیہ محترمہ کو بھی ساتھ سفر کرنے کی اجازت مرحمت فرمائی جائے۔`;
      }

      text += `\n\nحضور انور ایدہ اللہ تعالیٰ کی خدمت میں عاجزانہ دعا کی درخواست ہے۔ اللہ تعالیٰ حضور انور کا سایہ ہمارے سروں پر دراز فرمائے۔ آمین۔`;

      if (customMessage) {
        text += `\n\n${customMessage}`;
      }

      return text;
    }

    if (huzoorSubCat === "uk_accommodation") {
      const fromPretty = formatPrettyDate(fromDate);
      const toPretty = formatPrettyDate(toDate);
      let text = `عاجزانہ درخواست ہے کہ خاکسار کے یوکے (UK) کے دورہ کے دوران رہا ئش (Accommodation) کا انتظام فرمانے کی اجازت و سہولت مرحمت فرمائی جائے۔`;

      if (fromPretty && toPretty) {
        text += ` خاکسار کا قیام مورخہ ${fromPretty} تا ${toPretty} تک ہوگا۔`;
      }

      text += `\n\nحضور انور ایدہ اللہ تعالیٰ کی خدمت میں عاجزانہ دعا کی درخواست ہے۔ آمین۔`;

      if (customMessage) {
        text += `\n\n${customMessage}`;
      }

      return text;
    }

    return customMessage;
  }, [
    activeCategoryId,
    huzoorSubCat,
    customMessage,
    fromDate,
    toDate,
    selectedCountry,
    includeWifePermission,
  ]);

  // Sync recipient email & subject whenever category/sub-category changes
  useEffect(() => {
    setRecipientEmail(currentCategory.recipientEmail);
    if (activeCategoryId === "huzoor") {
      const subLabel = HUZOOR_SUB_CATEGORIES.find((s) => s.id === huzoorSubCat)?.label;
      setSubject(`Letter to Huzoor (aba) - ${subLabel} - ${name || "Murabbi Desk"}`);
    } else {
      setSubject(`Letter to ${currentCategory.recipient} - ${name || "Murabbi Desk"}`);
    }
  }, [activeCategoryId, huzoorSubCat, currentCategory, name]);

  const handlePrintPdf = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      setErrorMessage("Please specify a recipient email address.");
      return;
    }
    setSending(true);
    setErrorMessage("");
    setSendSuccess(false);

    const htmlBody = `
      <div style="font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Amiri', 'Noto Naskh Arabic', serif; direction: rtl; text-align: right; padding: 30px; background-color: #ffffff; color: #111827; max-width: 650px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px; font-size: 20px; font-weight: bold; line-height: 1.8; font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', serif;">
          <div>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <div>نَحْمَدُهُ وَنُصَلِّي عَلَىٰ رَسُولِهِ الْكَرِيمِ ؐ</div>
          <div>وَعَلَىٰ عَبْدِهِ الْمَسِيحِ الْمَوْعُودِ ؑ</div>
        </div>
        
        <div style="font-size: 18px; margin-bottom: 20px; line-height: 2; font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', serif;">
          السلام علیکم ورحمۃ اللہ وبرکاته
        </div>
        
        <div style="font-size: 18px; margin-bottom: 40px; line-height: 2.2; white-space: pre-wrap; font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', serif;">
          ${computedUrduBody}
        </div>
        
        <div style="font-size: 18px; line-height: 1.8; margin-top: 30px; font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', serif;">
          <div>والسلام</div>
          <div>خاکسار</div>
          <div style="font-weight: bold;">${name}</div>
          <div>${code}</div>
          <div>${designation}</div>
        </div>
      </div>
    `;

    try {
      const res = await liquid.invoke("gmail-send", {
        to: recipientEmail,
        subject: subject || `Letter from ${name}`,
        body: htmlBody,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (err: any) {
      console.error("Failed to send letter:", err);
      setErrorMessage(err.message || "Failed to send letter. Please try again.");
    } finally {
      setSending(false);
    }
  };
  // Google Drive Upload State
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [driveSuccess, setDriveSuccess] = useState(false);
  const [driveLink, setDriveLink] = useState("");

  const handleUploadToDrive = async () => {
    setIsUploadingDrive(true);
    setErrorMessage("");
    setDriveSuccess(false);
    setDriveLink("");

    try {
      // 1. Generate HTML Document Content
      const htmlDocument = `
        <!DOCTYPE html>
        <html lang="ur" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>${subject || "Official Letter"}</title>
          <style>
            @font-face {
              font-family: 'Jameel Noori Nastaleeq Regular';
              src: url('https://fonts.gstatic.com/ea/jameelnoorinastaleeq/v1/JameelNooriNastaleeq-Regular.ttf') format('truetype');
            }
            body {
              font-family: 'Jameel Noori Nastaleeq Regular', 'Amiri', serif;
              direction: rtl;
              text-align: right;
              padding: 40px;
              color: #111827;
              background-color: #ffffff;
            }
            .header {
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 24px;
              line-height: 1.8;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .body-text {
              font-size: 18px;
              line-height: 2.2;
              white-space: pre-wrap;
              margin-bottom: 40px;
            }
            .footer {
              font-size: 18px;
              line-height: 1.8;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div>نَحْمَدُهُ وَنُصَلِّي عَلَىٰ رَسُولِهِ الْكَرِيمِ ؐ</div>
            <div>وَعَلَىٰ عَبْدِهِ الْمَسِيحِ الْمَوْعُودِ ؑ</div>
          </div>
          <div class="greeting">السلام علیکم ورحمۃ اللہ وبرکاته</div>
          <div class="body-text">${computedUrduBody}</div>
          <div class="footer">
            <div>والسلام</div>
            <div>خاکسار</div>
            <div style="font-weight: bold;">${name}</div>
            <div>${code}</div>
            <div>${designation}</div>
          </div>
        </body>
        </html>
      `;

      // 2. Invoke liquid Google Drive Upload API
      const fileName = `${subject || "Official Letter"} - ${new Date().toISOString().split("T")[0]}.html`;
      const res = await liquid.invoke("drive-upload", {
        name: fileName,
        content: htmlDocument,
        mimeType: "text/html",
        module: "Letters",
        category: currentCategory.label,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      setDriveSuccess(true);
      if (res?.link) setDriveLink(res.link);
      setTimeout(() => setDriveSuccess(false), 6000);
    } catch (err: any) {
      console.error("Google Drive Upload Error:", err);
      setErrorMessage(err.message || "Failed to upload letter to Google Drive.");
    } finally {
      setIsUploadingDrive(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-dvh lg:h-screen lg:overflow-hidden bg-transparent">
      {/* Google Flights Style Date Picker Modal */}
      <GoogleFlightsDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        fromDate={fromDate}
        toDate={toDate}
        onSelectRange={(start, end) => {
          setFromDate(start);
          setToDate(end);
        }}
      />

      {/* ── Left Category Navigation Sidebar — Styled like Mail Tab ── */}
      <div className="hidden lg:flex w-[240px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20 print:hidden">
        {/* Sidebar Title */}
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Letters
          </h1>
        </div>

        {/* Sub-Header / Controls */}
        <div className="px-5 pt-1 pb-4 border-b border-white/5 mb-2">
          {/* Search Box — identical styling to Mail tab */}
          <div className="flex items-center gap-2 glass bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Search size={13} className="text-[var(--text-dim)] shrink-0" />
            <input
              type="text"
              placeholder="Search or ask AI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAiSmartSearch();
              }}
              className="flex-1 bg-transparent text-xs text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none min-w-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[var(--text-dim)] hover:text-white transition-colors shrink-0"
              >
                <X size={12} />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={clsx(
                "p-1 rounded-lg transition-all shrink-0",
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-[var(--text-dim)] hover:text-[var(--foreground)]"
              )}
              title="Voice query"
            >
              <Mic size={12} />
            </button>
            <button
              type="button"
              onClick={() => handleAiSmartSearch()}
              disabled={isAiLoading || !searchQuery}
              className="p-1 rounded-lg text-[var(--accent-main)] hover:bg-white/10 transition-all shrink-0 disabled:opacity-30"
              title="AI Smart Search & Prefill"
            >
              {aiMode === "search" && isAiLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
            </button>
          </div>

          {/* Animated Sidebar Tabs — identical to Mail tab */}
          <div className="relative flex bg-[var(--text-dim)]/5 rounded-xl p-1 mt-3 border border-white/5">
            {/* Animated Background Pill */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-[8px] transition-all duration-300 ease-out shadow-sm"
              style={{
                left: sidebarTab === "categories" ? "0.25rem" : "calc(50%)",
                background: "var(--accent-main)",
              }}
            />
            {[
              { id: "categories", label: "Categories" },
              { id: "recent", label: "Recent" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSidebarTab(t.id as any)}
                className={clsx(
                  "relative z-10 flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-colors duration-200",
                  sidebarTab === t.id
                    ? "text-white drop-shadow-md"
                    : "text-[var(--text-dim)] hover:text-[var(--text-muted)]"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {sidebarTab === "categories" ? (
            <nav className="py-2 space-y-px">
              {CATEGORIES.filter((cat) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                const matchesCat =
                  cat.label.toLowerCase().includes(q) ||
                  cat.tag.toLowerCase().includes(q) ||
                  cat.description.toLowerCase().includes(q);

                if (cat.id === "huzoor") {
                  const matchesSub = HUZOOR_SUB_CATEGORIES.some((sub) =>
                    sub.label.toLowerCase().includes(q)
                  );
                  return matchesCat || matchesSub;
                }
                return matchesCat;
              }).map((cat) => {
                const Icon = cat.icon;
                const active = activeCategoryId === cat.id;
                return (
                  <div key={cat.id} className="space-y-px">
                    <button
                      onClick={() => handleSelectCategoryItem(cat.id)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-6 py-3 transition-all text-left border-l-2",
                        active
                          ? "font-black text-white border-[var(--accent-main)]"
                          : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--foreground)] border-transparent"
                      )}
                      style={active ? { background: "rgba(0, 0, 0, 0.2)" } : {}}
                    >
                      <Icon size={15} className="shrink-0" />
                      <span className="text-xs font-bold flex-1 truncate">
                        {cat.label}
                      </span>
                      <span
                        className={clsx(
                          "text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[var(--accent-soft)] text-[var(--accent-main)]"
                        )}
                      >
                        {cat.tag}
                      </span>
                    </button>

                    {/* Sub-Categories nested under Letter to Huzoor */}
                    {cat.id === "huzoor" && (
                      <div className="pl-10 pr-3 space-y-0.5 py-1 bg-black/5">
                        {HUZOOR_SUB_CATEGORIES.filter((sub) => {
                          if (!searchQuery) return true;
                          return sub.label
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        }).map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive =
                            activeCategoryId === "huzoor" && huzoorSubCat === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleSelectCategoryItem("huzoor", sub.id)}
                              className={clsx(
                                "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all text-left",
                                isSubActive
                                  ? "bg-[var(--accent-soft)] text-white font-bold"
                                  : "text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--foreground)]"
                              )}
                            >
                              <SubIcon
                                size={12}
                                className={clsx(
                                  "shrink-0",
                                  isSubActive
                                    ? "text-[var(--accent-main)]"
                                    : "opacity-60"
                                )}
                              />
                              <span className="truncate text-[11px]">
                                {sub.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          ) : (
            <div className="p-4 flex flex-col flex-1">
              <div className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)] mb-4 shrink-0">
                Recent Categories
              </div>
              <div className="flex flex-col gap-2 pb-4">
                {recentCategoryKeys.length === 0 ? (
                  <div className="text-[10px] font-bold text-[var(--text-muted)] italic text-center py-8">
                    No recent categories
                  </div>
                ) : (
                  recentCategoryKeys.map((key) => {
                    const [catId, subId] = key.split("-");
                    const cat = CATEGORIES.find((c) => c.id === catId);
                    if (!cat) return null;
                    const Icon = cat.icon;
                    const subLabel =
                      catId === "huzoor" && subId !== "main"
                        ? HUZOOR_SUB_CATEGORIES.find((s) => s.id === subId)?.label
                        : null;
                    const isSelected =
                      activeCategoryId === catId &&
                      (catId !== "huzoor" || huzoorSubCat === subId);

                    return (
                      <div
                        key={`recent-${key}`}
                        onClick={() =>
                          handleSelectCategoryItem(
                            catId,
                            subId !== "main"
                              ? (subId as HuzoorSubCategory)
                              : undefined
                          )
                        }
                        className={clsx(
                          "flex items-center gap-3 p-2 pr-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-black/10 hover:border-white/10 transition-all group cursor-pointer",
                          isSelected &&
                            "border-[var(--accent-main)]/40 bg-[var(--accent-soft)]"
                        )}
                      >
                        <div
                          className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center font-black text-white shrink-0",
                            isSelected
                              ? "bg-[var(--accent-main)]"
                              : "bg-white/10 text-[var(--accent-main)]"
                          )}
                        >
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={clsx(
                              "text-[10px] font-black tracking-tight truncate transition-colors",
                              isSelected
                                ? "text-white"
                                : "text-[var(--foreground)] group-hover:text-[var(--accent-main)]"
                            )}
                          >
                            {cat.label}
                          </div>
                          {subLabel && (
                            <div className="text-[9px] text-[var(--text-dim)] truncate">
                              {subLabel}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button at bottom (New Letter) — identical to Mail Compose */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleNewLetter}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-md"
            style={{ background: "var(--accent-main)" }}
          >
            <Edit3 size={14} />
            New Letter
          </button>
        </div>
      </div>

      {/* ── Mobile Category Strip — matching Mail tab ── */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-b border-white/5 glass bg-black/10 shrink-0 no-scrollbar print:hidden">
        <button
          onClick={handleNewLetter}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
          style={{ background: "var(--accent-main)" }}
        >
          <Edit3 size={12} />
          New
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategoryItem(cat.id)}
              className={clsx(
                "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                active
                  ? "text-white"
                  : "text-[var(--text-muted)] border border-white/10"
              )}
              style={active ? { background: "var(--accent-main)" } : {}}
            >
              <Icon size={11} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Workspace Area ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Control Header */}
        <div className="shrink-0 px-6 py-4 border-b border-white/5 glass bg-black/10 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-white/5 text-[var(--accent-main)] border border-white/10 shrink-0">
              <CategoryIcon size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white truncate">
                  {currentCategory.label}
                </h2>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/20 shrink-0">
                  {currentCategory.tag}
                </span>
              </div>
              <p className="text-xs text-white/40 truncate mt-0.5">
                Target: <span className="text-white/70 font-semibold">{currentCategory.recipient}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex bg-black/30 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode("edit")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  viewMode === "edit"
                    ? "bg-[var(--accent-main)] text-white shadow-sm"
                    : "text-white/50 hover:text-white"
                )}
              >
                <FileText size={13} />
                <span>Form</span>
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  viewMode === "preview"
                    ? "bg-[var(--accent-main)] text-white shadow-sm"
                    : "text-white/50 hover:text-white"
                )}
              >
                <Eye size={13} />
                <span>PDF Document</span>
              </button>
            </div>

            <button
              onClick={handlePrintPdf}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white/80 hover:text-white glass border border-white/10 hover:border-white/20 transition-all"
              title="Download / Print PDF"
            >
              <Download size={14} />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleSendEmail}
              disabled={sending || !recipientEmail}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:opacity-40"
              style={{ background: "var(--accent-main)" }}
            >
              {sending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              <span>Send</span>
            </button>

            <button
              onClick={handleUploadToDrive}
              disabled={isUploadingDrive}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white glass border border-white/10 hover:border-white/20 hover:bg-white/10 shadow-lg transition-all active:scale-95 disabled:opacity-40"
              title="Upload letter as document to Google Drive"
            >
              {isUploadingDrive ? (
                <Loader2 size={14} className="animate-spin text-[var(--accent-main)]" />
              ) : (
                <HardDrive size={14} className="text-[var(--accent-main)]" />
              )}
              <span>Add to Google Drive</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {driveSuccess && (
          <div className="shrink-0 mx-6 mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} />
              <span>Letter uploaded to Murabbi Desk Drive / Letters!</span>
            </div>
            {driveLink && (
              <a
                href={driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-300 font-bold"
              >
                View in Drive ↗
              </a>
            )}
          </div>
        )}
        {sendSuccess && (
          <div className="shrink-0 mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle size={15} />
            <span>Letter successfully sent to {recipientEmail}!</span>
          </div>
        )}
        {errorMessage && (
          <div className="shrink-0 mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form vs Preview Workspace */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
          {viewMode === "edit" ? (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 form-v4">
              {/* Form Input Cards Container (Form V4 Layout matching Expenses tab) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* --- Huzoor Sub-Category Card --- */}
                {activeCategoryId === "huzoor" && (
                  <div className="card">
                    <div className="card-hdr">
                      <div className="dot"></div>
                      REQUEST CATEGORY & TRAVEL PARAMS
                    </div>
                    <div className="card-body space-y-4">
                      <div>
                        <label className="lbl">Select Request Category</label>
                        <select
                          value={huzoorSubCat}
                          onChange={(e) => setHuzoorSubCat(e.target.value as HuzoorSubCategory)}
                          className="mt-1"
                        >
                          {HUZOOR_SUB_CATEGORIES.map((sub) => (
                            <option key={sub.id} value={sub.id} className="bg-gray-900 text-white">
                              {sub.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Specific Fields for "Leave Request (International)" */}
                      {huzoorSubCat === "leave_international" && (
                        <div className="space-y-4 pt-3 border-t border-white/10 animate-in fade-in duration-200">
                          <div>
                            <label className="lbl flex items-center gap-1 mb-1.5">
                              <CalendarIcon size={11} className="text-[var(--accent-main)]" />
                              <span>Travel & Leave Dates Range</span>
                            </label>
                            <div
                              onClick={() => setIsDatePickerOpen(true)}
                              className="w-full bg-black/40 border border-white/10 hover:border-[var(--accent-main)] rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all group"
                            >
                              <div className="flex items-center gap-3 text-xs">
                                <div>
                                  <span className="block text-[8px] font-black uppercase tracking-widest text-white/40">From</span>
                                  <span className="font-bold text-white">{fromDate ? formatPrettyDate(fromDate) : "Select date"}</span>
                                </div>
                                <ArrowRight size={14} className="text-[var(--accent-main)] group-hover:translate-x-1 transition-transform" />
                                <div>
                                  <span className="block text-[8px] font-black uppercase tracking-widest text-white/40">To</span>
                                  <span className="font-bold text-white">{toDate ? formatPrettyDate(toDate) : "Select date"}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-lg">
                                Change
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="lbl flex items-center gap-1 mb-1.5">
                              <Globe size={11} className="text-[var(--accent-main)]" />
                              <span>Destination Country</span>
                            </label>
                            <select
                              value={selectedCountry}
                              onChange={(e) => setSelectedCountry(e.target.value)}
                            >
                              {COUNTRIES_EXCLUDING_CANADA.map((c) => (
                                <option key={c} value={c} className="bg-gray-900 text-white">
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2.5 pt-1">
                            <input
                              type="checkbox"
                              id="wifePermission"
                              checked={includeWifePermission}
                              onChange={(e) => setIncludeWifePermission(e.target.checked)}
                              className="w-4 h-4 rounded border-white/20 bg-black/40 text-[var(--accent-main)] focus:ring-0 cursor-pointer"
                            />
                            <label
                              htmlFor="wifePermission"
                              className="text-xs font-bold text-white/80 cursor-pointer select-none"
                            >
                              Request permission for Wife to accompany
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Specific Fields for "Request for Accommodation (UK Only)" */}
                      {huzoorSubCat === "uk_accommodation" && (
                        <div className="space-y-3 pt-3 border-t border-white/10 animate-in fade-in duration-200">
                          <div>
                            <label className="lbl flex items-center gap-1 mb-1.5">
                              <CalendarIcon size={11} className="text-[var(--accent-main)]" />
                              <span>Stay Dates Range</span>
                            </label>
                            <div
                              onClick={() => setIsDatePickerOpen(true)}
                              className="w-full bg-black/40 border border-white/10 hover:border-[var(--accent-main)] rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all group"
                            >
                              <div className="flex items-center gap-3 text-xs">
                                <div>
                                  <span className="block text-[8px] font-black uppercase tracking-widest text-white/40">Arrival</span>
                                  <span className="font-bold text-white">{fromDate ? formatPrettyDate(fromDate) : "Select date"}</span>
                                </div>
                                <ArrowRight size={14} className="text-[var(--accent-main)] group-hover:translate-x-1 transition-transform" />
                                <div>
                                  <span className="block text-[8px] font-black uppercase tracking-widest text-white/40">Departure</span>
                                  <span className="font-bold text-white">{toDate ? formatPrettyDate(toDate) : "Select date"}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-lg">
                                Change
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Card 1: Recipient & Dispatch Parameters */}
                <div className="card">
                  <div className="card-hdr">
                    <div className="dot"></div>
                    DISPATCH & RECIPIENT INFORMATION
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <label className="lbl">Send To (Email Address)</label>
                        <div className="relative mt-1">
                          <Mail
                            size={14}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                          />
                          <input
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="recipient@email.com"
                            className="pl-9 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="lbl">Subject Line</label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Letter Subject"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Letter Content & AI Tools */}
                <div className="card">
                  <div className="card-hdr flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="dot"></div>
                      <span>LETTER CONTENT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAiTranslate}
                        disabled={isAiLoading || !customMessage}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] border border-white/10 flex items-center gap-1 transition-all disabled:opacity-40"
                        title="Translate text to formal Urdu"
                      >
                        {aiMode === "translate" && isAiLoading ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <Languages size={10} />
                        )}
                        <span>AI Translate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAiDraftOpen(!isAiDraftOpen)}
                        className="px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--accent-main)]/20 text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] border border-[var(--accent-main)]/30 flex items-center gap-1 transition-all"
                        title="Generate draft using AI"
                      >
                        <Wand2 size={10} />
                        <span>AI Generator</span>
                      </button>
                    </div>
                  </div>

                  <div className="card-body space-y-4">
                    {/* Expandable AI Generator Prompt Modal / Bar */}
                    {isAiDraftOpen && (
                      <div className="p-4 rounded-xl bg-black/40 border border-[var(--accent-main)]/30 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <label className="lbl flex items-center gap-1.5 text-[var(--accent-main)]">
                            <Sparkles size={12} />
                            <span>AI Letter Writer — Topic / Key Notes</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsAiDraftOpen(false)}
                            className="text-white/40 hover:text-white text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <input
                          type="text"
                          value={aiPromptTopic}
                          onChange={(e) => setAiPromptTopic(e.target.value)}
                          placeholder="e.g. Requesting prayers for father's surgery next week..."
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-[var(--accent-main)]"
                        />
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={handleAiGenerateDraft}
                            disabled={isAiLoading || !aiPromptTopic}
                            className="px-4 py-1.5 rounded-lg bg-[var(--accent-main)] text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-40 transition-all"
                          >
                            {aiMode === "draft" && isAiLoading ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            <span>Compose Letter</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <textarea
                      rows={5}
                      dir="rtl"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="اضافی مضمون یا دعائیہ جملے تحریر کریں۔۔۔"
                      className="w-full p-4 font-urdu leading-relaxed text-sm text-white"
                      style={{
                        fontFamily:
                          "'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Amiri', 'Noto Naskh Arabic', serif",
                      }}
                    />
                  </div>
                </div>

                {/* Card 3: Sender Identity */}
                <div className="card">
                  <div className="card-hdr">
                    <div className="dot"></div>
                    SENDER IDENTIFICATION
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="lbl">Full Name</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 font-urdu"
                        />
                      </div>
                      <div>
                        <label className="lbl">Member Code</label>
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="mt-1 font-sans"
                        />
                      </div>
                      <div>
                        <label className="lbl">Designation</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="mt-1 font-urdu"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Real-time Document Card Preview */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Live Letter Preview
                  </span>
                  <button
                    onClick={() => setViewMode("preview")}
                    className="text-xs font-bold text-[var(--accent-main)] hover:underline flex items-center gap-1"
                  >
                    <span>Full Screen PDF</span>
                    <Eye size={12} />
                  </button>
                </div>

                {/* Simulated A4 Paper */}
                <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-6 md:p-8 flex flex-col justify-between min-h-[480px] border border-gray-200 dir-rtl text-right font-urdu">
                  {/* Bismillah Header */}
                  <div className="text-center space-y-1 text-sm font-bold text-gray-800 border-b pb-4 border-gray-100 font-urdu">
                    <div>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                    <div>نَحْمَدُهُ وَنُصَلِّي عَلَىٰ رَسُولِهِ الْكَرِيمِ ؐ</div>
                    <div>وَعَلَىٰ عَبْدِهِ الْمَسِيحِ الْمَوْعُودِ ؑ</div>
                  </div>

                  {/* Greeting & Body */}
                  <div className="my-6 space-y-4 flex-1">
                    <div className="text-xs font-semibold text-gray-700 font-urdu">
                      السلام علیکم ورحمۃ اللہ وبرکاته
                    </div>
                    <div
                      className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap font-urdu"
                      style={{
                        fontFamily:
                          "'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Amiri', 'Noto Naskh Arabic', serif",
                      }}
                    >
                      {computedUrduBody}
                    </div>
                  </div>

                  {/* Sign-off */}
                  <div className="text-xs space-y-1 text-gray-800 border-t pt-4 border-gray-100 font-urdu">
                    <div>والسلام</div>
                    <div>خاکسار</div>
                    <div className="font-bold text-gray-950 font-urdu">{name}</div>
                    <div className="text-[11px] text-gray-600 font-sans">{code}</div>
                    <div className="text-[11px] text-gray-600 font-urdu">{designation}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Full Page PDF Document View (Print-ready A4) */
            <div className="max-w-3xl mx-auto my-4 font-urdu">
              <div className="bg-white text-gray-900 rounded-none shadow-2xl p-12 md:p-16 min-h-[900px] flex flex-col justify-between border border-gray-300 print:border-none print:shadow-none print:m-0 text-right font-urdu">
                {/* Header */}
                <div className="text-center space-y-2 text-base md:text-lg font-bold text-gray-900 border-b pb-6 border-gray-200 font-urdu">
                  <div>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                  <div>نَحْمَدُهُ وَنُصَلِّي عَلَىٰ رَسُولِهِ الْكَرِيمِ ؐ</div>
                  <div>وَعَلَىٰ عَبْدِهِ الْمَسِيحِ الْمَوْعُودِ ؑ</div>
                </div>

                {/* Content */}
                <div className="my-8 flex-1 space-y-6">
                  <div className="text-base font-bold text-gray-800 font-urdu">
                    السلام علیکم ورحمۃ اللہ وبرکاته
                  </div>
                  <div
                    className="text-base md:text-lg text-gray-900 leading-loose whitespace-pre-wrap font-urdu"
                    style={{
                      fontFamily:
                        "'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Amiri', 'Noto Naskh Arabic', serif",
                    }}
                  >
                    {computedUrduBody}
                  </div>
                </div>

                {/* Footer Signoff */}
                <div className="text-base space-y-1.5 text-gray-900 border-t pt-6 border-gray-200 font-urdu">
                  <div>والسلام</div>
                  <div>خاکسار</div>
                  <div className="font-bold text-lg font-urdu">{name}</div>
                  <div className="text-sm text-gray-700 font-sans">{code}</div>
                  <div className="text-sm text-gray-700 font-urdu">{designation}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
