"use client";
import React, { useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Calendar,
  Layers,
  Globe,
  Type
} from 'lucide-react';
import { clsx } from 'clsx';
import type { SearchFilters, SearchLanguage } from '@/lib/research-sources';

interface SearchFiltersPopupProps {
  filters: SearchFilters;
  isOpen: boolean;
  onClose: () => void;
  onChange: (filters: SearchFilters) => void;
  onApply: () => void;
}

const ALL_SOURCES: { id: string; label: string; countHint?: string }[] = [
  { id: 'ruhani-khazain', label: 'Ruhani Khazain (23 Vols)' },
  { id: 'quran', label: "Holy Qur'an & 5-Vol Commentary" },
  { id: 'ahadith', label: 'Canonical Ahadith' },
  { id: 'malfuzat', label: 'Malfuzat (10 Vols)' },
  { id: 'tazkirah', label: 'Tadhkirah (Revelations)' },
  { id: 'essence', label: 'Essence of Islam (5 Vols)' },
  { id: 'books', label: 'Books Catalog' },
  { id: 'periodicals', label: 'Periodicals (Al Hakam / RoR / Al Fazl)' },
  { id: 'videos', label: 'MTA & Official Videos' },
  { id: 'audios', label: 'Ask Islam Audios' }
];

const LANGUAGES: { id: SearchLanguage; label: string; hint: string }[] = [
  { id: 'all', label: 'All Languages', hint: 'EN, UR, AR, & transliterated' },
  { id: 'en', label: 'English', hint: 'English articles & translations' },
  { id: 'ur', label: 'Urdu (اردو)', hint: 'Urdu treatises, Malfuzat & Al Fazl' },
  { id: 'ar', label: 'Arabic (العربية)', hint: 'Arabic Quranic text & treatises' }
];

export default function SearchFiltersPopup({
  filters,
  isOpen,
  onClose,
  onChange,
  onApply
}: SearchFiltersPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleVerbatim = () => {
    onChange({
      ...filters,
      verbatim: !filters.verbatim
    });
  };

  const handleSourceToggle = (sourceId: string) => {
    let nextSources: string[];
    // If empty array, it means all sources are enabled currently
    if (filters.sources.length === 0) {
      // User is unchecking one source out of all
      nextSources = ALL_SOURCES.map(s => s.id).filter(id => id !== sourceId);
    } else if (filters.sources.includes(sourceId)) {
      nextSources = filters.sources.filter(id => id !== sourceId);
    } else {
      nextSources = [...filters.sources, sourceId];
      if (nextSources.length === ALL_SOURCES.length) {
        nextSources = []; // Treat all selected as empty array (all enabled)
      }
    }
    onChange({
      ...filters,
      sources: nextSources
    });
  };

  const handleSelectAllSources = () => {
    onChange({ ...filters, sources: [] });
  };

  const handleLanguageChange = (lang: SearchLanguage) => {
    onChange({ ...filters, language: lang });
  };

  const handleYearChange = (field: 'yearFrom' | 'yearTo', val: string) => {
    const num = val.trim() === '' ? null : parseInt(val, 10);
    onChange({
      ...filters,
      [field]: isNaN(num as number) ? null : num
    });
  };

  const handleReset = () => {
    onChange({
      verbatim: false,
      yearFrom: null,
      yearTo: null,
      sources: [],
      language: 'all'
    });
  };

  const isSourceActive = (sourceId: string) => {
    return filters.sources.length === 0 || filters.sources.includes(sourceId);
  };

  const hasAnyFilterActive =
    filters.verbatim ||
    filters.yearFrom !== null ||
    filters.yearTo !== null ||
    filters.sources.length > 0 ||
    filters.language !== 'all';

  return (
    <div
      ref={popupRef}
      className={clsx(
        "absolute right-0 top-full mt-2 w-96 max-w-[94vw] z-50",
        "glass bg-[#060a17]/95 dark:bg-[#030611]/95 backdrop-blur-2xl",
        "border border-white/15 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/60",
        "p-4 md:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left select-none",
        "max-h-[85vh] overflow-y-auto custom-scrollbar"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-main)]">
            <SlidersHorizontal size={15} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--foreground)] tracking-tight">
              Search Settings & Filters
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">
              Refine scope, timeline, and search mode
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
          title="Close filters"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Section 1: Search Mode (Verbatim Flip Switch) ── */}
      <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type size={14} className="text-[var(--accent-main)]" />
            <span className="text-xs font-bold text-[var(--foreground)]">Verbatim Search</span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={filters.verbatim}
            onClick={handleToggleVerbatim}
            className={clsx(
              "flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer shadow-sm active:scale-95",
              filters.verbatim
                ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-[var(--accent-main)] ring-1 ring-[var(--accent-main)]/30"
                : "bg-white/5 border-white/15 text-[var(--text-muted)] hover:border-[var(--accent-main)]/50 hover:text-[var(--foreground)]"
            )}
          >
            <span className="text-[10px] font-black">
              {filters.verbatim ? 'ON' : 'OFF'}
            </span>
            <div
              className={clsx(
                "w-6 h-3.5 rounded-full p-0.5 transition-colors duration-200 flex items-center relative border",
                filters.verbatim
                  ? "bg-[var(--accent-main)] border-[var(--accent-main)]"
                  : "bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600"
              )}
            >
              <div
                className={clsx(
                  "w-2.5 h-2.5 rounded-full shadow-sm transition-transform duration-200 ease-out bg-white",
                  filters.verbatim ? "translate-x-2.5" : "translate-x-0"
                )}
              />
            </div>
          </button>
        </div>
        <p className="text-[10.5px] text-[var(--text-muted)] leading-relaxed font-medium">
          Exact word-for-word string match. Automatically looks up translations and Arabic/Urdu phonetic transliterations.
        </p>
      </div>

      {/* ── Section 2: Timeline Range (Year Picker) ── */}
      <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[var(--accent-main)]" />
            <span className="text-xs font-bold text-[var(--foreground)]">Timeline Filter</span>
          </div>
          {(filters.yearFrom !== null || filters.yearTo !== null) && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, yearFrom: null, yearTo: null })}
              className="text-[10px] text-[var(--accent-main)] hover:underline font-bold"
            >
              Clear dates
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">
              From Year
            </label>
            <input
              type="number"
              min={1835}
              max={new Date().getFullYear()}
              placeholder="e.g. 1880"
              value={filters.yearFrom ?? ''}
              onChange={(e) => handleYearChange('yearFrom', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/10 text-xs font-bold text-[var(--foreground)] placeholder:text-[var(--text-dim)] focus:border-[var(--accent-main)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">
              To Year
            </label>
            <input
              type="number"
              min={1835}
              max={new Date().getFullYear()}
              placeholder="e.g. 1908"
              value={filters.yearTo ?? ''}
              onChange={(e) => handleYearChange('yearTo', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/10 text-xs font-bold text-[var(--foreground)] placeholder:text-[var(--text-dim)] focus:border-[var(--accent-main)] focus:outline-none"
            />
          </div>
        </div>

        {/* Era Quick Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: 'Promised Messiah Era (1880–1908)', from: 1880, to: 1908 },
            { label: 'Early Khilafat (1908–1965)', from: 1908, to: 1965 },
            { label: 'Contemporary (2000+)', from: 2000, to: new Date().getFullYear() }
          ].map((preset) => {
            const isSelected = filters.yearFrom === preset.from && filters.yearTo === preset.to;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ ...filters, yearFrom: preset.from, yearTo: preset.to })}
                className={clsx(
                  "px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors border",
                  isSelected
                    ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-[var(--accent-main)]"
                    : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-white/20"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Target Corpora & Sources ── */}
      <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-[var(--accent-main)]" />
            <span className="text-xs font-bold text-[var(--foreground)]">Corpus Sources</span>
          </div>
          <button
            type="button"
            onClick={handleSelectAllSources}
            className="text-[10px] text-[var(--accent-main)] hover:underline font-bold"
          >
            {filters.sources.length === 0 ? 'All Active' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-1.5 pt-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
          {ALL_SOURCES.map((source) => {
            const active = isSourceActive(source.id);
            return (
              <label
                key={source.id}
                className={clsx(
                  "flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors",
                  active
                    ? "bg-white/5 border-white/15 text-[var(--foreground)] font-bold"
                    : "bg-transparent border-transparent text-[var(--text-muted)] hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleSourceToggle(source.id)}
                    className="rounded border-white/20 text-[var(--accent-main)] focus:ring-[var(--accent-main)] cursor-pointer"
                  />
                  <span>{source.label}</span>
                </div>
                {active && <Check size={12} className="text-[var(--accent-main)]" />}
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Section 4: Language Scope ── */}
      <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-[var(--accent-main)]" />
          <span className="text-xs font-bold text-[var(--foreground)]">Language Filter</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {LANGUAGES.map((lang) => {
            const active = filters.language === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleLanguageChange(lang.id)}
                className={clsx(
                  "px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer",
                  active
                    ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-[var(--accent-main)] font-black"
                    : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-white/20 font-bold"
                )}
              >
                <div className="text-[11px]">{lang.label}</div>
                <div className="text-[9px] opacity-70 truncate">{lang.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Actions Footer ── */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasAnyFilterActive}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <RotateCcw size={13} />
          <span>Reset All</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onApply();
            onClose();
          }}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-main)] to-[var(--accent-hover)] text-white text-xs font-black tracking-wide shadow-md shadow-[var(--accent-glow)] hover:brightness-110 active:scale-95 transition-all"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
