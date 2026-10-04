"use client";
import React, { useState, useEffect } from 'react';
import {
  X,
  Scroll,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { clsx } from 'clsx';
import type { HadithResult } from '@/lib/research-sources';

interface HadithReaderModalProps {
  hadith: HadithResult | null;
  onClose: () => void;
}

export default function HadithReaderModal({ hadith, onClose }: HadithReaderModalProps) {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!hadith) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hadith, onClose]);

  if (!hadith) return null;

  const fontClasses = {
    sm: 'text-xs md:text-sm leading-relaxed',
    base: 'text-sm md:text-base leading-relaxed',
    lg: 'text-base md:text-lg leading-relaxed',
    xl: 'text-lg md:text-xl leading-relaxed'
  };

  const arabicFontClasses = {
    sm: 'text-lg md:text-xl leading-loose',
    base: 'text-xl md:text-2xl leading-loose',
    lg: 'text-2xl md:text-3xl leading-loose',
    xl: 'text-3xl md:text-4xl leading-loose'
  };

  const handleCopy = () => {
    const citationText = `[Sunnah.com: ${hadith.book}${hadith.chapter ? `, ${hadith.chapter}` : ''}${hadith.hadithNumber ? ` (Hadith #${hadith.hadithNumber})` : ''}${hadith.narrator ? ` — Narrated by ${hadith.narrator}` : ''}]\n${hadith.arabicText ? `\n"${hadith.arabicText}"\n` : ''}\n"${hadith.englishTranslation}"\n${hadith.urduTranslation ? `\n"${hadith.urduTranslation}"\n` : ''}\nSource: ${hadith.url || 'https://sunnah.com'}`;
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const titleText = `${hadith.book}${hadith.hadithNumber ? ` • Hadith #${hadith.hadithNumber}` : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl glass bg-[#0f141a]/95 dark:bg-[#0c1015]/95 border border-white/10 shadow-2xl shadow-black/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 font-bold shrink-0 shadow-inner">
              <Scroll size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">
                  {titleText}
                </h2>
                {hadith.grade && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {hadith.grade}
                  </span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5 flex-wrap">
                <span>Sunnah.com Authentic Collection</span>
                {hadith.chapter && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 truncate max-w-xs">{hadith.chapter}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Font Size controls */}
            <div className="hidden sm:flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5 mr-1">
              <button
                type="button"
                onClick={() => setFontSize('sm')}
                className={clsx(
                  "p-1.5 rounded text-xs font-bold transition-all",
                  fontSize === 'sm' ? "bg-white/20 text-white" : "text-[var(--text-muted)] hover:text-white"
                )}
                title="Small text"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('base')}
                className={clsx(
                  "p-1.5 rounded text-xs font-bold transition-all",
                  fontSize === 'base' ? "bg-white/20 text-white" : "text-[var(--text-muted)] hover:text-white"
                )}
                title="Default text"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('lg')}
                className={clsx(
                  "p-1.5 rounded text-xs font-bold transition-all",
                  fontSize === 'lg' ? "bg-white/20 text-white" : "text-[var(--text-muted)] hover:text-white"
                )}
                title="Large text"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xl')}
                className={clsx(
                  "p-1.5 rounded text-xs font-bold transition-all",
                  fontSize === 'xl' ? "bg-white/20 text-white" : "text-[var(--text-muted)] hover:text-white"
                )}
                title="Extra large text"
              >
                A++
              </button>
            </div>

            {/* Copy Citation */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--foreground)] border border-white/10 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
              title="Copy Hadith & Citation"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>

            {/* External Sunnah.com link */}
            {hadith.url && (
              <a
                href={hadith.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all flex items-center gap-1 text-xs font-bold"
                title="Open on Sunnah.com"
              >
                <Globe size={14} />
                <ExternalLink size={12} className="opacity-70" />
              </a>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all ml-1"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar text-[var(--foreground)]">
          {/* Narrator Card */}
          {hadith.narrator && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-black uppercase text-[10px] tracking-wider">Isnad / Sanad:</span>
                <span>Narrated by {hadith.narrator}</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                {hadith.hadithNumber ? `Reference: Hadith #${hadith.hadithNumber}` : ''}
              </span>
            </div>
          )}

          {/* Full Arabic Matn */}
          {hadith.arabicText && (
            <div className="p-5 sm:p-6 rounded-2xl glass bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Arabic Matn (نص الحديث)</span>
                <span className="font-mono text-[10px] opacity-70">Sunnah.com Official Text</span>
              </div>
              <div
                dir="rtl"
                className={clsx(
                  "text-right font-arabic text-[var(--foreground)] leading-loose tracking-wide font-normal select-text",
                  arabicFontClasses[fontSize]
                )}
              >
                {hadith.arabicText}
              </div>
            </div>
          )}

          {/* Full English Translation */}
          <div className="p-5 sm:p-6 rounded-2xl glass bg-amber-500/[0.03] border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Complete English Translation</span>
              <span className="font-mono text-[10px] opacity-70">{hadith.book}</span>
            </div>
            <p className={clsx(
              "text-[var(--foreground)]/95 font-medium italic border-l-2 border-amber-500/50 pl-4 py-1 select-text",
              fontClasses[fontSize]
            )}>
              "{hadith.englishTranslation}"
            </p>
          </div>

          {/* Urdu Translation if available */}
          {hadith.urduTranslation && (
            <div className="p-5 sm:p-6 rounded-2xl glass bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Urdu Translation (اردو ترجمہ)</span>
              </div>
              <div
                dir="rtl"
                className="text-right font-urdu text-base sm:text-lg leading-loose text-[var(--foreground)] select-text"
              >
                {hadith.urduTranslation}
              </div>
            </div>
          )}

          {/* Context Note if available */}
          {hadith.contextNote && (
            <div className="p-4 rounded-xl glass bg-white/[0.02] border border-white/5 space-y-2 text-xs text-[var(--text-muted)]">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Contextual Exegesis:</span>
              <p className="leading-relaxed font-medium">{hadith.contextNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
