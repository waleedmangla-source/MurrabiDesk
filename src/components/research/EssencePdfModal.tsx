"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Loader2,
  Bookmark,
  Layers,
  Sparkles
} from "lucide-react";
import { clsx } from "clsx";
import { getEssencePdfUrl, ESSENCE_VOLUMES_METADATA } from "@/lib/essence-data";

interface EssencePdfModalProps {
  volume: number; // 1 to 5
  volumeRoman?: string;
  pageNum?: number | string;
  pdfPage: number;
  title: string;
  topic?: string;
  sourceTreatise?: string;
  excerpt?: string;
  fullText?: string;
  onClose: () => void;
}

const ESSENCE_TOTAL_PAGES: Record<number, number> = {
  1: 543,
  2: 505,
  3: 487,
  4: 334,
  5: 240
};

export default function EssencePdfModal({
  volume,
  volumeRoman: initialRoman,
  pageNum: initialBookPage,
  pdfPage: initialPdfPage,
  title,
  topic,
  sourceTreatise,
  excerpt,
  fullText,
  onClose
}: EssencePdfModalProps) {
  const meta = ESSENCE_VOLUMES_METADATA[volume];
  const volumeRoman = initialRoman || meta?.volumeRoman || String(volume);
  const totalPages = ESSENCE_TOTAL_PAGES[volume] || 500;

  const [currentPage, setCurrentPage] = useState<number>(initialPdfPage || 1);
  const [pageInput, setPageInput] = useState<string>(String(initialPdfPage || 1));
  const [viewMode, setViewMode] = useState<"pdf" | "text">("pdf");
  const [copied, setCopied] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);

  // Direct URLs
  const filename = volume === 3 ? "essence-3.pdf" : `Essence-${volume}.pdf`;
  const rawPdfUrl = `https://files.alislam.cloud/pdf/${filename}`;
  const directPdfUrl = `${rawPdfUrl}#page=${currentPage}`;
  const proxyPdfUrl = `/api/pdf-proxy?url=${encodeURIComponent(rawPdfUrl)}#page=${currentPage}&view=FitH&toolbar=1&navpanes=0`;

  // Sync page input when currentPage changes
  useEffect(() => {
    setPageInput(String(currentPage));
    setIframeLoading(true);
  }, [currentPage]);

  // Handle ESC key and keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && e.altKey) {
        handlePrevPage();
      } else if (e.key === "ArrowRight" && e.altKey) {
        handleNextPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [currentPage, onClose]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      setCurrentPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const copyCitation = () => {
    const citation = `[The Essence of Islam, Vol. ${volumeRoman}, p. ${initialBookPage || ''} (PDF p. ${currentPage}) - "${title}"${sourceTreatise ? ` (${sourceTreatise})` : ""}]\nTranslation by Muhammad Zafrulla Khan\nSource: ${directPdfUrl}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Reader Dialog Shell */}
      <div className="relative w-full max-w-6xl h-[94vh] flex flex-col rounded-2xl md:rounded-3xl glass bg-[#050713]/98 dark:bg-[#020310]/98 border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ── TOP TOOLBAR ── */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 glass bg-black/50 backdrop-blur-md select-none gap-2">
          
          {/* Left: Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1 text-xs font-bold shrink-0 active:scale-95"
              title="Close (Esc)"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="h-4 w-px bg-white/10 shrink-0 hidden sm:block" />

            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black text-[10px] tracking-wider uppercase shrink-0 flex items-center gap-1">
                <Bookmark size={11} />
                Vol. {volumeRoman}
              </span>
              <div className="truncate">
                <h2 className="font-bold text-xs sm:text-sm text-[var(--foreground)] truncate">
                  {title}
                </h2>
                <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 truncate">
                  {initialBookPage && <span>Book p. {initialBookPage} •</span>}
                  <span>PDF p. {currentPage}</span>
                  {topic && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-400/90 font-medium">{topic}</span>
                    </>
                  )}
                  {sourceTreatise && (
                    <>
                      <span>•</span>
                      <span className="italic text-[var(--text-muted)] hidden lg:inline">{sourceTreatise}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center: View Toggle & Page Jumper */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center glass bg-white/5 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("pdf")}
                className={clsx(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  viewMode === "pdf"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "text-[var(--text-muted)] hover:text-white"
                )}
                title="View authentic publication PDF"
              >
                <BookOpen size={13} />
                <span className="hidden md:inline">PDF Document</span>
              </button>
              <button
                onClick={() => setViewMode("text")}
                className={clsx(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  viewMode === "text"
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "text-[var(--text-muted)] hover:text-white"
                )}
                title="View formatted excerpt text"
              >
                <FileText size={13} />
                <span className="hidden md:inline">Extracted Text</span>
              </button>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1 glass bg-white/5 border border-white/10 rounded-xl px-1.5 py-0.5">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 text-[var(--text-muted)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Page (Alt + Left)"
              >
                <ChevronLeft size={16} />
              </button>

              <form onSubmit={handlePageSubmit} className="flex items-center gap-1">
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={() => setPageInput(String(currentPage))}
                  className="w-12 text-center bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/15 rounded-md text-xs font-bold text-white py-0.5 outline-none transition-colors"
                  title="Type page number and press Enter"
                />
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  / {totalPages}
                </span>
              </form>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 text-[var(--text-muted)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Page (Alt + Right)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={copyCitation}
              className={clsx(
                "px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                copied
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                  : "bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white border-white/10"
              )}
              title="Copy citation to clipboard"
            >
              {copied ? <Check size={14} className="text-indigo-400" /> : <Copy size={14} />}
              <span className="hidden lg:inline">{copied ? "Copied" : "Cite"}</span>
            </button>

            <a
              href={directPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors border border-white/10 flex items-center justify-center"
              title="Open raw PDF in new browser tab"
            >
              <ExternalLink size={15} />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors border border-white/10 flex items-center justify-center ml-1"
              title="Close reader"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT VIEW ── */}
        <div className="relative flex-1 bg-black/40 overflow-hidden">
          {viewMode === "pdf" ? (
            <div className="relative w-full h-full">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050713]/90 z-10">
                  <Loader2 size={32} className="animate-spin text-indigo-400" />
                  <p className="text-xs text-[var(--text-muted)] font-medium">
                    Loading The Essence of Islam Vol. {volumeRoman} (p. {currentPage})...
                  </p>
                </div>
              )}
              <iframe
                key={`essence-pdf-${volume}-${currentPage}`}
                src={proxyPdfUrl}
                title={`The Essence of Islam Vol. ${volumeRoman} Page ${currentPage}`}
                className="w-full h-full border-0"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
              {/* Header Box */}
              <div className="p-6 rounded-2xl glass bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold uppercase text-[10px]">
                      The Essence of Islam
                    </span>
                    <span>•</span>
                    <span className="text-white font-semibold">Volume {volumeRoman}</span>
                    {topic && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{topic}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span>Page {initialBookPage || currentPage}</span>
                    <span>(PDF p. {currentPage})</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {title}
                </h1>

                {/* Excerpt Body */}
                <div className="space-y-3 pt-2">
                  <p className="text-base sm:text-lg text-[var(--foreground)]/90 leading-relaxed font-serif whitespace-pre-line">
                    {fullText || excerpt || "No text available for this page."}
                  </p>
                </div>

                {/* Ruhani Khazain Source Treatise Citation Box */}
                {sourceTreatise && (
                  <div className="p-4 rounded-xl glass bg-indigo-500/[0.04] border border-indigo-500/20 space-y-1 text-xs text-[var(--text-muted)] leading-relaxed">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                      <Bookmark size={13} />
                      <span>Primary Treatise Source in Ruhani Khazain:</span>
                    </div>
                    <p className="text-sm text-[var(--foreground)] font-medium italic">
                      {sourceTreatise}
                    </p>
                  </div>
                )}
              </div>

              {/* Publication Reference Card */}
              <div className="p-4 rounded-xl glass bg-indigo-500/[0.02] border border-indigo-500/10 flex items-center justify-between text-xs">
                <div className="text-[var(--text-muted)]">
                  Translated by <span className="text-[var(--foreground)] font-bold">Muhammad Zafrulla Khan</span> • Islam International Publications Ltd.
                </div>
                <button
                  onClick={() => setViewMode("pdf")}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 text-xs"
                >
                  <BookOpen size={13} />
                  Switch to authentic PDF view
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER STATUS BAR ── */}
        <div className="px-4 py-2 border-t border-white/10 glass bg-black/40 flex items-center justify-between text-[11px] text-[var(--text-muted)] select-none">
          <div className="flex items-center gap-3">
            <span>Hazrat Mirza Ghulam Ahmad of Qadian (as)</span>
            <span>•</span>
            <span className="text-indigo-400/90">Extracts from Ruhani Khazain (Vols. I–V)</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">Alt+Left/Right</kbd> to turn pages</span>
            <span>•</span>
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">Esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
