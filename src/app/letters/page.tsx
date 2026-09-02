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
  Calendar,
  Globe,
  Heart,
  Building,
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

// Sub-categories for Letter to Huzoor
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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("United Kingdom");
  const [includeWifePermission, setIncludeWifePermission] = useState(false);

  // States
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

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
      const datesText =
        fromDate && toDate
          ? `تاریخ ${fromDate} تا ${toDate}`
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
      let text = `عاجزانہ درخواست ہے کہ خاکسار کے یوکے (UK) کے دورہ کے دوران رہا ئش (Accommodation) کا انتظام فرمانے کی اجازت و سہولت مرحمت فرمائی جائے۔`;

      if (fromDate && toDate) {
        text += ` خاکسار کا قیام مورخہ ${fromDate} تا ${toDate} تک ہوگا۔`;
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
      setSubject(`Letter to Huzoor (aba) - ${subLabel} - ${name || "Murrabi Desk"}`);
    } else {
      setSubject(`Letter to ${currentCategory.recipient} - ${name || "Murrabi Desk"}`);
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

  return (
    <div className="flex flex-col lg:flex-row min-h-dvh lg:h-screen lg:overflow-hidden bg-transparent">
      {/* ── Left Category Navigation Sidebar ── */}
      <div className="hidden lg:flex w-[280px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20 print:hidden">
        <div className="px-5 pt-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/20">
              <ScrollText size={20} className="text-[var(--accent-main)]" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                Letters
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)] opacity-70 mt-1">
                Official Protocols
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          <div className="px-5 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
              Select Category
            </p>
          </div>
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-5 py-3.5 transition-all text-left border-l-2",
                    active
                      ? "font-black text-white border-[var(--accent-main)] bg-black/30"
                      : "text-white/60 hover:bg-black/10 hover:text-white border-transparent"
                  )}
                >
                  <Icon
                    size={16}
                    className={clsx(
                      "shrink-0",
                      active ? "text-[var(--accent-main)]" : "text-white/40"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate leading-snug">
                      {cat.label}
                    </p>
                    <p className="text-[9px] text-white/40 truncate mt-0.5">
                      {cat.tag}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold">
            <Sparkles size={12} className="text-[var(--accent-main)]" />
            <span>HQ Protocol Generator</span>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Category Tabs */}
      <div className="lg:hidden shrink-0 px-4 pt-4 pb-2 glass border-b border-white/5 bg-black/20 print:hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/20">
            <ScrollText size={18} className="text-[var(--accent-main)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">
              Letters
            </h1>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)] opacity-70 mt-0.5">
              Official Protocols
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border",
                  active
                    ? "bg-[var(--accent-main)] text-white border-[var(--accent-main)] shadow-[0_0_12px_var(--accent-glow)]"
                    : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
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
          </div>
        </div>

        {/* Notifications */}
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
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input Card */}
              <div className="lg:col-span-7 glass-card rounded-[20px] p-6 border border-white/10 space-y-5">
                <h3 className="text-lg font-black italic tracking-tight text-white flex items-center gap-2">
                  <FileText size={18} className="text-[var(--accent-main)]" />
                  <span>Letter Details</span>
                </h3>

                {/* --- Huzoor Sub-Category Dropdown --- */}
                {activeCategoryId === "huzoor" && (
                  <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-main)]/20 space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--accent-main)]">
                      Select Request Category (قسم کا انتخاب)
                    </label>
                    <select
                      value={huzoorSubCat}
                      onChange={(e) => setHuzoorSubCat(e.target.value as HuzoorSubCategory)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-[var(--accent-main)] transition-all"
                    >
                      {HUZOOR_SUB_CATEGORIES.map((sub) => (
                        <option key={sub.id} value={sub.id} className="bg-gray-900 text-white">
                          {sub.label}
                        </option>
                      ))}
                    </select>

                    {/* Specific Fields for "Leave Request (International)" */}
                    {huzoorSubCat === "leave_international" && (
                      <div className="space-y-4 pt-3 border-t border-white/10 animate-in fade-in duration-200">
                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-white/60 mb-1 flex items-center gap-1">
                              <Calendar size={11} className="text-[var(--accent-main)]" />
                              <span>From Date (کب سے)</span>
                            </label>
                            <input
                              type="date"
                              value={fromDate}
                              onChange={(e) => setFromDate(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--accent-main)]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-white/60 mb-1 flex items-center gap-1">
                              <Calendar size={11} className="text-[var(--accent-main)]" />
                              <span>To Date (کب تک)</span>
                            </label>
                            <input
                              type="date"
                              value={toDate}
                              onChange={(e) => setToDate(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--accent-main)]"
                            />
                          </div>
                        </div>

                        {/* Country selector (Excluding Canada) */}
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-white/60 mb-1 flex items-center gap-1">
                            <Globe size={11} className="text-[var(--accent-main)]" />
                            <span>Destination Country (ملک جہاں سفر کرنا ہے)</span>
                          </label>
                          <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white outline-none focus:border-[var(--accent-main)]"
                          >
                            {COUNTRIES_EXCLUDING_CANADA.map((c) => (
                              <option key={c} value={c} className="bg-gray-900 text-white">
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Wife Permission Checkbox */}
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
                            Request permission for Wife to accompany (اہلیہ کے ساتھ سفر کی اجازت)
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Specific Fields for "Request for Accommodation (UK Only)" */}
                    {huzoorSubCat === "uk_accommodation" && (
                      <div className="space-y-3 pt-3 border-t border-white/10 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-white/60 mb-1 flex items-center gap-1">
                              <Calendar size={11} className="text-[var(--accent-main)]" />
                              <span>Arrival Date</span>
                            </label>
                            <input
                              type="date"
                              value={fromDate}
                              onChange={(e) => setFromDate(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--accent-main)]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-white/60 mb-1 flex items-center gap-1">
                              <Calendar size={11} className="text-[var(--accent-main)]" />
                              <span>Departure Date</span>
                            </label>
                            <input
                              type="date"
                              value={toDate}
                              onChange={(e) => setToDate(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--accent-main)]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Recipient Email */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-1.5">
                      Send To (Email Address)
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                      />
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="recipient@email.com"
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[var(--accent-main)] transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Letter Subject"
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[var(--accent-main)] transition-all"
                    />
                  </div>

                  {/* Additional Urdu Text */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-1.5">
                      Additional Message / Prayers Details (مضمون میں اضافی باتیں)
                    </label>
                    <textarea
                      rows={5}
                      dir="rtl"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="اضافی مضمون یا دعائیہ جملے تحریر کریں۔۔۔"
                      className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/30 outline-none focus:border-[var(--accent-main)] transition-all font-urdu leading-relaxed"
                      style={{
                        fontFamily:
                          "'Jameel Noori Nastaleeq Regular', 'Jameel Noori Nastaleeq', 'Amiri', 'Noto Naskh Arabic', serif",
                      }}
                    />
                  </div>

                  {/* Sender Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">
                        Name (نام)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--accent-main)] font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">
                        Code (کوڈ)
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--accent-main)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">
                        Designation (عہدہ)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--accent-main)] font-serif"
                      />
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
