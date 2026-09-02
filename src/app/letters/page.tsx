"use client";

import React, { useState } from "react";
import {
  ScrollText,
  Crown,
  Shield,
  Radio,
  ClipboardList,
  UserCheck,
  FileText,
  Search,
  Plus,
  Send,
  Sparkles,
  Download,
  Copy,
  Edit3,
} from "lucide-react";
import clsx from "clsx";

interface LetterTab {
  id: string;
  label: string;
  recipient: string;
  icon: React.ElementType;
  description: string;
  tag: string;
}

const LETTER_TABS: LetterTab[] = [
  {
    id: "huzoor",
    label: "Letter to Huzoor",
    recipient: "His Holiness Hazrat Mirza Masroor Ahmad (aba)",
    icon: Crown,
    description: "Official correspondence & petitions addressed directly to Huzoor (aba)",
    tag: "HQ Protocol",
  },
  {
    id: "amir",
    label: "Letter to Amir",
    recipient: "Amir Jamaat-e-Ahmadiyya",
    icon: Shield,
    description: "Formal letter addressed to the National Amir Jamaat",
    tag: "National HQ",
  },
  {
    id: "tabshir",
    label: "Letter to Tabshir",
    recipient: "Wakalat-e-Tabshir",
    icon: Radio,
    description: "Correspondence & reports addressed to the Tehrik-e-Jadid / Tabshir department",
    tag: "Tehrik-e-Jadid",
  },
  {
    id: "request",
    label: "Letter of Request",
    recipient: "Respected Authority / Department",
    icon: ClipboardList,
    description: "Standard request, application, or petition template",
    tag: "General Request",
  },
  {
    id: "missionary",
    label: "Letter to Missionary In-charge",
    recipient: "Missionary In-charge",
    icon: UserCheck,
    description: "Official letter addressed to the Missionary In-charge",
    tag: "Field Command",
  },
];

export default function LettersPage() {
  const [activeTabId, setActiveTabId] = useState<string>(LETTER_TABS[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const currentTab = LETTER_TABS.find((t) => t.id === activeTabId)!;
  const TabIcon = currentTab.icon;

  const filteredTabs = LETTER_TABS.filter((tab) =>
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-dvh lg:h-screen lg:overflow-hidden bg-transparent">
      {/* ── Panel 1: Letters Category Sidebar — Desktop only ── */}
      <div className="hidden lg:flex w-[280px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20">
        {/* Sidebar Title */}
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

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              placeholder="Search letter type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:border-[var(--accent-main)] transition-all"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          <div className="px-4 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
              Letter Templates
            </p>
          </div>
          <nav className="space-y-1">
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
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
                      {tab.label}
                    </p>
                    <p className="text-[9px] text-white/40 truncate mt-0.5">
                      {tab.tag}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold">
            <Sparkles size={12} className="text-[var(--accent-main)]" />
            <span>Template Engine Ready</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Tab Navigation (Horizontal) ── */}
      <div className="lg:hidden shrink-0 px-4 pt-4 pb-2 glass border-b border-white/5 bg-black/20">
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
          {LETTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border",
                  active
                    ? "bg-[var(--accent-main)] text-white border-[var(--accent-main)] shadow-[0_0_12px_var(--accent-glow)]"
                    : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main View Area ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Detail / Header Bar */}
        <div className="shrink-0 px-6 py-4 border-b border-white/5 glass bg-black/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-white/5 text-[var(--accent-main)] border border-white/10 shrink-0">
              <TabIcon size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white truncate">
                  {currentTab.label}
                </h2>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-main)] border border-[var(--accent-main)]/20 shrink-0">
                  {currentTab.tag}
                </span>
              </div>
              <p className="text-xs text-white/40 truncate mt-0.5">
                Target: <span className="text-white/70 font-semibold">{currentTab.recipient}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white/70 hover:text-white glass border border-white/10 hover:border-white/20 transition-all"
              title="Copy Template"
            >
              <Copy size={13} />
              <span>Copy</span>
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95"
              style={{ background: "var(--accent-main)" }}
            >
              <Edit3 size={13} />
              <span>Draft</span>
            </button>
          </div>
        </div>

        {/* Content Body Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl glass-card rounded-[20px] p-8 md:p-12 border border-white/10 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
            {/* Ambient Background Radial Glow */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute w-[150%] h-[150%] -top-[25%] -left-[25%] bg-[radial-gradient(ellipse_at_center,var(--accent-soft)_0%,transparent_70%)]" />
            </div>

            {/* Icon Banner */}
            <div
              className="relative z-10 p-6 rounded-2xl border border-[var(--accent-main)]/30 shadow-[0_0_30px_var(--accent-glow)]"
              style={{ background: "var(--accent-soft)" }}
            >
              <TabIcon size={48} className="text-[var(--accent-main)]" />
            </div>

            {/* Text details */}
            <div className="relative z-10 space-y-2 max-w-md">
              <h3 className="text-2xl md:text-3xl font-black italic tracking-tight text-white">
                {currentTab.label}
              </h3>
              <p className="text-sm text-white/60 font-medium leading-relaxed">
                {currentTab.description}
              </p>
              <div className="pt-3">
                <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-[var(--accent-main)] px-3 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-main)]/20">
                  Template Stub • Awaiting Content
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
