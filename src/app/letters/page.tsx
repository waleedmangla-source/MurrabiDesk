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
  Camera,
  Trash2,
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

  // Passport photo state (Letters to Huzoor only)
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);

  const handlePassportPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file for the passport photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setPassportPhoto(result);
      }
    };
    reader.readAsDataURL(file);
  };

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
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

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

  const handlePrintPdf = async () => {
    // 1. Target the active letter element in the DOM
    const sourceEl = document.getElementById("printable-letter");
    if (!sourceEl) {
      window.print();
      return;
    }

    // 2. Create an isolated, hidden iframe for clean US Letter PDF export
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "8.5in";
    iframe.style.height = "11in";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // 3. Extract all head styles from main window to ensure 100% identical styling and font definitions
    const headStyles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((node) => node.outerHTML)
      .join("\n");

    const printHtml = `
      <!DOCTYPE html>
      <html lang="ur" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <base href="${window.location.origin}/">
        <title>${subject || "Official Letter"}</title>
        ${headStyles}
        <style>
          @page {
            size: letter portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            width: 8.5in !important;
            height: 11in !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #111827 !important;
            direction: rtl;
            text-align: right;
          }
          .letter-sheet-export {
            width: 8.5in !important;
            min-height: 11in !important;
            max-width: 8.5in !important;
            margin: 0 !important;
            padding: 1in !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #111827 !important;
            box-shadow: none !important;
            border: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-hidden, [class*="print:hidden"] {
            display: none !important;
          }
          .footer-signoff-row {
            direction: ltr !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            width: 100% !important;
          }
        </style>
      </head>
      <body>
        <div class="letter-sheet-export">
          ${sourceEl.innerHTML}
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(printHtml);
    doc.close();

    // 4. Wait for fonts to be ready in both the host window and the iframe
    try {
      await document.fonts.ready;
      if (iframe.contentWindow?.document?.fonts) {
        await iframe.contentWindow.document.fonts.ready;
      }
    } catch (e) {
      console.warn("Font readiness wait error:", e);
    }

    // 5. Trigger print after layout is stable
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 250);
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
      <div style="font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; font-size: 16px; direction: rtl; text-align: right; padding: 30px; background-color: #ffffff; color: #111827; max-width: 650px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px; font-size: 16px; font-weight: bold; line-height: 1.8; font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif;">
          <div>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <div>نَحْمَدُهُ وَنُصَلِّي عَلَىٰ رَسُولِهِ الْكَرِيمِ ؐ</div>
          <div>وَعَلَىٰ عَبْدِهِ الْمَسِيحِ الْمَوْعُودِ ؑ</div>
        </div>
        
        <div style="font-size: 16px; margin-bottom: 20px; line-height: 2; font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif;">
          السلام علیکم ورحمۃ اللہ وبرکاته
        </div>
        
        <div style="font-size: 16px; margin-bottom: 40px; line-height: 2.2; white-space: pre-wrap; font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif;">
          ${computedUrduBody}
        </div>
        
        <div style="font-size: 16px; line-height: 1.8; margin-top: 30px; font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e5e7eb; padding-top: 20px; direction: ltr;">
          <div>
            ${
              activeCategoryId === "huzoor" && passportPhoto
                ? `<img src="${passportPhoto}" alt="Passport Photo" style="width: 100px; height: 125px; object-fit: cover; border: 1px solid #d1d5db; border-radius: 4px;" />`
                : ""
            }
          </div>
          <div style="direction: rtl; text-align: right;">
            <div>والسلام</div>
            <div>خاکسار</div>
            <div style="font-weight: bold; font-size: 16px;">${name}</div>
            <div style="font-size: 13px; font-family: sans-serif;">${code}</div>
            <div style="font-size: 16px;">${designation}</div>
          </div>
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
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
          <style>
            @font-face {
              font-family: 'Jameel Noori Nastaleeq Regular';
              src: url('https://fonts.gstatic.com/ea/jameelnoorinastaleeq/v1/JameelNooriNastaleeq-Regular.ttf') format('truetype');
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif;
              font-size: 16px;
              direction: rtl;
              text-align: right;
              background-color: #f1f5f9;
              padding: 40px 16px;
              color: #111827;
            }
            .letter-sheet {
              width: 8.5in;
              max-width: 100%;
              min-height: 11in;
              margin: 0 auto;
              padding: 1in;
              background: #ffffff;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
              border-radius: 4px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-sizing: border-box;
            }
            .header {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              line-height: 1.8;
              border-bottom: 1.5px solid #e5e7eb;
              padding-bottom: 24px;
              margin-bottom: 32px;
            }
            .greeting {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 24px;
              color: #1f2937;
            }
            .body-text {
              font-size: 16px;
              line-height: 2.2;
              white-space: pre-wrap;
              color: #111827;
              flex: 1;
            }
            .footer {
              border-top: 1.5px solid #e5e7eb;
              padding-top: 24px;
              margin-top: 32px;
              font-size: 16px;
              line-height: 1.8;
              color: #111827;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .passport-photo {
              width: 1.15in;
              height: 1.45in;
              object-fit: cover;
              border: 1px solid #9ca3af;
              border-radius: 2px;
            }
            .sign-title {
              font-weight: bold;
              font-size: 16px;
              margin-top: 4px;
            }
            .meta-text {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 13px;
              color: #4b5563;
            }
          </style>
        </head>
        <body>
          <div class="letter-sheet">
            <div class="header">
              <div>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
              <div>نَحْمَدُهُ وَنُصَلِّي عَلَىٰ رَسُولِهِ الْكَرِيمِ ؐ</div>
              <div>وَعَلَىٰ عَبْدِهِ الْمَسِيحِ الْمَوْعُودِ ؑ</div>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column;">
              <div class="greeting">السلام علیکم ورحمۃ اللہ وبرکاته</div>
              <div class="body-text">${computedUrduBody}</div>
            </div>
            <div class="footer" style="direction: ltr;">
              <div>
                ${
                  activeCategoryId === "huzoor" && passportPhoto
                    ? `<img src="${passportPhoto}" alt="Passport Photo" class="passport-photo" />`
                    : ""
                }
              </div>
              <div style="direction: rtl; text-align: right;">
                <div>والسلام</div>
                <div>خاکسار</div>
                <div class="sign-title">${name}</div>
                <div class="meta-text">${code}</div>
                <div>${designation}</div>
              </div>
            </div>
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
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
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
              const active = activeCategoryId === cat.id;
              return (
                <div key={cat.id} className="space-y-px">
                  <button
                    onClick={() => handleSelectCategoryItem(cat.id)}
                    className={clsx(
                      "w-full flex items-center justify-between px-6 py-3 transition-all text-left border-l-2",
                      active
                        ? "font-black text-white border-[var(--accent-main)]"
                        : "text-[var(--text-muted)] hover:bg-black/10 hover:text-[var(--foreground)] border-transparent"
                    )}
                    style={active ? { background: "rgba(0, 0, 0, 0.2)" } : {}}
                  >
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
                    <div className="pl-8 pr-3 space-y-0.5 py-1 bg-black/5">
                      {HUZOOR_SUB_CATEGORIES.filter((sub) => {
                        if (!searchQuery) return true;
                        return sub.label
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase());
                      }).map((sub) => {
                        const isSubActive =
                          activeCategoryId === "huzoor" && huzoorSubCat === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSelectCategoryItem("huzoor", sub.id)}
                            className={clsx(
                              "w-full flex items-center px-3 py-1.5 rounded-lg text-xs transition-all text-left",
                              isSubActive
                                ? "bg-[var(--accent-soft)] text-white font-bold"
                                : "text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--foreground)]"
                            )}
                          >
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
        </div>

        {/* Action Button at bottom (New Letter) — identical to Mail Compose */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleNewLetter}
            className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-md"
            style={{ background: "var(--accent-main)" }}
          >
            New Letter
          </button>
        </div>
      </div>

      {/* ── Mobile Category Strip — matching Mail tab ── */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-b border-white/5 glass bg-black/10 shrink-0 no-scrollbar print:hidden">
        <button
          onClick={handleNewLetter}
          className="shrink-0 flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
          style={{ background: "var(--accent-main)" }}
        >
          New
        </button>
        {CATEGORIES.map((cat) => {
          const active = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategoryItem(cat.id)}
              className={clsx(
                "shrink-0 flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                active
                  ? "text-white"
                  : "text-[var(--text-muted)] border border-white/10"
              )}
              style={active ? { background: "var(--accent-main)" } : {}}
            >
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
                <span>US Letter</span>
              </button>
            </div>

            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white/80 hover:text-white glass border border-white/10 hover:border-white/20 transition-all shadow-sm"
              title="Export US Letter PDF"
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
                      className="w-full p-4 font-urdu leading-relaxed text-[16px] text-white"
                      style={{
                        fontFamily:
                          "'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                        fontSize: "16px",
                        lineHeight: "2.4",
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
                          className="mt-1 font-urdu text-[16px]"
                          style={{
                            fontFamily:
                              "'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                            fontSize: "16px",
                          }}
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
                          className="mt-1 font-urdu text-[16px]"
                          style={{
                            fontFamily:
                              "'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                            fontSize: "16px",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Passport Photograph (Huzoor Letters Only) */}
                {activeCategoryId === "huzoor" && (
                  <div className="card">
                    <div className="card-hdr flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="dot"></div>
                        <span>PASSPORT PHOTOGRAPH</span>
                      </div>
                      <span className="text-[10px] text-[var(--accent-main)] font-semibold uppercase tracking-wider">
                        Huzoor Letters Only
                      </span>
                    </div>
                    <div className="card-body">
                      {passportPhoto ? (
                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10">
                          <img
                            src={passportPhoto}
                            alt="Passport Preview"
                            className="w-16 h-20 object-cover rounded border border-white/20 shadow-sm"
                          />
                          <div className="flex-1 space-y-1">
                            <p className="text-xs font-semibold text-white">Passport Photograph Attached</p>
                            <p className="text-[11px] text-white/50">
                              Appears on the bottom-left corner of the letter sheet.
                            </p>
                            <div className="flex items-center gap-3 pt-1">
                              <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-main)] hover:underline">
                                <Camera size={12} />
                                <span>Change Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handlePassportPhotoUpload}
                                />
                              </label>
                              <span className="text-white/20">•</span>
                              <button
                                type="button"
                                onClick={() => setPassportPhoto(null)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:underline"
                              >
                                <Trash2 size={12} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/15 hover:border-[var(--accent-main)]/60 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl p-5 cursor-pointer transition group">
                          <Camera size={24} className="text-white/40 group-hover:text-[var(--accent-main)] transition mb-2" />
                          <span className="text-xs font-semibold text-white group-hover:text-[var(--accent-main)] transition">
                            Upload Passport Picture
                          </span>
                          <span className="text-[11px] text-white/40 mt-0.5 text-center">
                            Standard portrait photo. Placed on the bottom-left of the letter to Huzoor.
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePassportPhotoUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Real-time Document Card Preview */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Live US Letter Preview
                  </span>
                  <button
                    onClick={() => setViewMode("preview")}
                    className="text-xs font-bold text-[var(--accent-main)] hover:underline flex items-center gap-1"
                  >
                    <span>Full US Letter</span>
                    <Eye size={12} />
                  </button>
                </div>

                {/* Simulated US Letter Sheet */}
                <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-6 md:p-8 flex flex-col justify-between min-h-[640px] border border-gray-200 dir-rtl text-right font-urdu text-[16px]">
                  {/* Bismillah Header */}
                  <div className="text-center space-y-1 text-[16px] font-bold text-gray-800 border-b pb-4 border-gray-100 font-urdu">
                    <div>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                    <div>نَحْمَدُهُ وَنُصَلِّي عَلَىٰ رَسُولِهِ الْكَرِيمِ ؐ</div>
                    <div>وَعَلَىٰ عَبْدِهِ الْمَسِيحِ الْمَوْعُودِ ؑ</div>
                  </div>

                  {/* Greeting & Body */}
                  <div className="my-5 space-y-3 flex-1">
                    <div className="text-[16px] font-bold text-gray-800 font-urdu">
                      السلام علیکم ورحمۃ اللہ وبرکاته
                    </div>
                    <div
                      className="text-[16px] text-gray-800 leading-[2.2] whitespace-pre-wrap font-urdu"
                      style={{
                        fontFamily:
                          "'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                        fontSize: "16px",
                      }}
                    >
                      {computedUrduBody}
                    </div>
                  </div>

                  {/* Sign-off & Bottom Left Passport Photo */}
                  <div
                    className="border-t pt-4 border-gray-100 flex items-end justify-between w-full footer-signoff-row"
                    dir="ltr"
                    style={{ direction: "ltr" }}
                  >
                    {/* Left: Passport photo (Huzoor letters only) */}
                    {activeCategoryId === "huzoor" ? (
                      <div className="print:hidden shrink-0">
                        {passportPhoto ? (
                          <div className="relative group">
                            <img
                              src={passportPhoto}
                              alt="Passport Photo"
                              className="w-16 h-20 md:w-20 md:h-24 object-cover rounded border border-gray-300 shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded flex flex-col items-center justify-center gap-1">
                              <label className="cursor-pointer text-[10px] text-white hover:text-[var(--accent-main)] font-sans flex items-center gap-1 font-medium">
                                <Camera size={10} />
                                <span>Change</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handlePassportPhotoUpload}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setPassportPhoto(null)}
                                className="text-[10px] text-rose-300 hover:text-rose-400 font-sans flex items-center gap-1 font-medium"
                              >
                                <Trash2 size={10} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="w-16 h-20 md:w-20 md:h-24 border-2 border-dashed border-gray-300 hover:border-[var(--accent-main)] bg-gray-50/80 hover:bg-gray-100/90 rounded flex flex-col items-center justify-center p-1.5 cursor-pointer transition text-gray-400 hover:text-[var(--accent-main)] group">
                            <Camera size={16} className="mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-sans font-medium text-center leading-tight">
                              Passport Photo
                            </span>
                            <span className="text-[8px] font-sans text-gray-400 group-hover:text-[var(--accent-main)]/80 mt-0.5">
                              + Upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePassportPhotoUpload}
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <div />
                    )}

                    {/* Right: Sign-off block */}
                    <div
                      className="text-[16px] space-y-1 text-gray-800 font-urdu text-right ml-auto"
                      dir="rtl"
                      style={{ direction: "rtl", textAlign: "right" }}
                    >
                      <div>والسلام</div>
                      <div>خاکسار</div>
                      <div className="font-bold text-[16px] text-gray-950 font-urdu">{name}</div>
                      <div className="text-xs text-gray-600 font-sans">{code}</div>
                      <div className="text-[16px] text-gray-600 font-urdu">{designation}</div>
                    </div>
                  </div>
                </div>

                {/* Hidden print container for edit mode fallback */}
                <div
                  id="printable-letter"
                  className="hidden print:flex bg-white text-gray-900 p-[1in] flex-col justify-between text-right font-urdu w-[8.5in] min-h-[11in] text-[16px]"
                >
                  <div className="text-center space-y-2 text-[16px] font-bold text-gray-900 border-b pb-6 border-gray-200 font-urdu">
                    <div>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                    <div>نَحْمَدُهُ وَنُصَلِّي عَلَىٰ رَسُولِهِ الْكَرِيمِ ؐ</div>
                    <div>وَعَلَىٰ عَبْدِهِ الْمَسِيحِ الْمَوْعُودِ ؑ</div>
                  </div>
                  <div className="my-8 flex-1 space-y-6">
                    <div className="text-[16px] font-bold text-gray-800 font-urdu">
                      السلام علیکم ورحمۃ اللہ وبرکاته
                    </div>
                    <div
                      className="text-[16px] leading-[2.2] whitespace-pre-wrap font-urdu text-gray-900"
                      style={{
                        fontFamily:
                          "'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                        fontSize: "16px",
                      }}
                    >
                      {computedUrduBody}
                    </div>
                  </div>
                  <div
                    className="text-[16px] space-y-1.5 text-gray-900 border-t pt-6 border-gray-200 font-urdu flex justify-between items-end w-full footer-signoff-row"
                    dir="ltr"
                    style={{ direction: "ltr" }}
                  >
                    {/* Left: Passport photo (Huzoor letters only) */}
                    <div>
                      {activeCategoryId === "huzoor" && passportPhoto ? (
                        <img
                          src={passportPhoto}
                          alt="Passport Photo"
                          className="w-24 h-32 object-cover rounded-sm border border-gray-400"
                        />
                      ) : null}
                    </div>

                    {/* Right: Sign-off block */}
                    <div
                      className="text-right ml-auto font-urdu"
                      dir="rtl"
                      style={{ direction: "rtl", textAlign: "right" }}
                    >
                      <div>والسلام</div>
                      <div>خاکسار</div>
                      <div className="font-bold text-[16px] font-urdu">{name}</div>
                      <div className="text-sm text-gray-700 font-sans">{code}</div>
                      <div className="text-[16px] text-gray-700 font-urdu">{designation}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Full Page PDF Document View (Standard US Letter 8.5" x 11") */
            <div className="flex flex-col items-center py-6 px-4">
              <div className="w-full max-w-[8.5in] flex items-center justify-between pb-3 text-xs text-white/50 print:hidden">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent-main)]">
                  Standard US Letter (8.5&quot; × 11&quot;)
                </span>
                <span className="text-[10px] text-white/40">
                  Print &amp; Export Ready
                </span>
              </div>
              <div
                id="printable-letter"
                className="w-full max-w-[8.5in] min-h-[11in] bg-white text-gray-900 shadow-2xl p-12 md:p-[1in] flex flex-col justify-between border border-gray-300 text-right font-urdu text-[16px]"
              >
                {/* Header */}
                <div className="text-center space-y-2 text-[16px] font-bold text-gray-900 border-b pb-6 border-gray-200 font-urdu">
                  <div>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                  <div>نَحْمَدُهُ وَنُصَلِّي عَلَىٰ رَسُولِهِ الْكَرِيمِ ؐ</div>
                  <div>وَعَلَىٰ عَبْدِهِ الْمَسِيحِ الْمَوْعُودِ ؑ</div>
                </div>

                {/* Content */}
                <div className="my-8 flex-1 space-y-6">
                  <div className="text-[16px] font-bold text-gray-800 font-urdu">
                    السلام علیکم ورحمۃ اللہ وبرکاته
                  </div>
                  <div
                    className="text-[16px] text-gray-900 leading-[2.2] whitespace-pre-wrap font-urdu"
                    style={{
                      fontFamily:
                        "'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                      fontSize: "16px",
                    }}
                  >
                    {computedUrduBody}
                  </div>
                </div>

                {/* Footer Signoff & Bottom Left Passport Photo */}
                <div
                  className="text-[16px] space-y-1.5 text-gray-900 border-t pt-6 border-gray-200 font-urdu flex justify-between items-end w-full footer-signoff-row"
                  dir="ltr"
                  style={{ direction: "ltr" }}
                >
                  {/* Left: Passport photo (Huzoor letters only) */}
                  {activeCategoryId === "huzoor" ? (
                    <div className="shrink-0">
                      {passportPhoto ? (
                        <div className="relative group">
                          <img
                            src={passportPhoto}
                            alt="Passport Photo"
                            className="w-24 h-32 object-cover rounded-sm border border-gray-300 shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded flex flex-col items-center justify-center gap-1.5 print:hidden">
                            <label className="cursor-pointer text-xs text-white hover:text-[var(--accent-main)] font-sans flex items-center gap-1 font-medium">
                              <Camera size={12} />
                              <span>Change</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePassportPhotoUpload}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setPassportPhoto(null)}
                              className="text-xs text-rose-300 hover:text-rose-400 font-sans flex items-center gap-1 font-medium"
                            >
                              <Trash2 size={12} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="w-24 h-32 border-2 border-dashed border-gray-300 hover:border-[var(--accent-main)] bg-gray-50/80 hover:bg-gray-100/90 rounded flex flex-col items-center justify-center p-2 cursor-pointer transition text-gray-400 hover:text-[var(--accent-main)] group print:hidden">
                          <Camera size={20} className="mb-1.5 group-hover:scale-110 transition-transform" />
                          <span className="text-[11px] font-sans font-medium text-center leading-tight">
                            Passport Photo
                          </span>
                          <span className="text-[9px] font-sans text-gray-400 group-hover:text-[var(--accent-main)]/80 mt-0.5">
                            + Upload Photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePassportPhotoUpload}
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Right: Sign-off block */}
                  <div
                    className="text-right ml-auto font-urdu"
                    dir="rtl"
                    style={{ direction: "rtl", textAlign: "right" }}
                  >
                    <div>والسلام</div>
                    <div>خاکسار</div>
                    <div className="font-bold text-[16px] font-urdu">{name}</div>
                    <div className="text-sm text-gray-700 font-sans">{code}</div>
                    <div className="text-[16px] text-gray-700 font-urdu">{designation}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
