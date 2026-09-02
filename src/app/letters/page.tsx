"use client";

import React, { useState } from "react";
import {
  ScrollText,
  Crown,
  Shield,
  Radio,
  ClipboardList,
  UserCheck,
} from "lucide-react";

const LETTER_TABS = [
  {
    id: "huzoor",
    label: "Letter to Huzoor",
    icon: Crown,
    description: "Official correspondence addressed to Huzoor (aba)",
  },
  {
    id: "amir",
    label: "Letter to Amir",
    icon: Shield,
    description: "Formal letter addressed to the Amir",
  },
  {
    id: "tabshir",
    label: "Letter to Tabshir",
    icon: Radio,
    description: "Correspondence addressed to the Tabshir department",
  },
  {
    id: "request",
    label: "Letter of Request",
    icon: ClipboardList,
    description: "General letter of request or petition",
  },
  {
    id: "missionary",
    label: "Letter to Missionary In-charge",
    icon: UserCheck,
    description: "Letter addressed to the Missionary In-charge",
  },
];

export default function LettersPage() {
  const [activeTab, setActiveTab] = useState(LETTER_TABS[0].id);

  const currentTab = LETTER_TABS.find((t) => t.id === activeTab)!;
  const TabIcon = currentTab.icon;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 md:p-10 gap-6">
      {/* Page Header */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="p-3 rounded-[14px] bg-[var(--accent-soft)] border border-[var(--accent-main)]/20">
          <ScrollText size={24} className="text-[var(--accent-main)]" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic text-v4-ink leading-none">
            Letters
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)] opacity-60 mt-1">
            Official Correspondence Module
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="shrink-0 glass rounded-[14px] p-1.5 border border-white/5">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {LETTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-bold text-sm
                  whitespace-nowrap transition-all duration-300 shrink-0
                  ${
                    isActive
                      ? "bg-[var(--accent-main)] text-white shadow-[0_0_16px_var(--accent-glow)]"
                      : "text-v4-ink/50 hover:text-v4-ink/80 hover:bg-white/5"
                  }
                `}
              >
                <Icon size={15} className="shrink-0" />
                <span className="tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="glass-card h-full flex flex-col items-center justify-center gap-6 border border-white/5">
          {/* Placeholder content — templates come later */}
          <div
            className="p-5 rounded-[18px] border border-[var(--accent-main)]/20"
            style={{ background: "var(--accent-soft)" }}
          >
            <TabIcon size={40} className="text-[var(--accent-main)]" />
          </div>
          <div className="text-center space-y-2 max-w-sm">
            <h2 className="text-2xl font-black italic tracking-tight text-v4-ink">
              {currentTab.label}
            </h2>
            <p className="text-sm text-v4-ink/50 font-medium">
              {currentTab.description}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)]/50 pt-2">
              Template incoming — check back soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
