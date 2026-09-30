"use client";
import React, { useState, useEffect, useRef } from "react";
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
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Clock,
  User,
  Calendar
} from "lucide-react";
import { clsx } from "clsx";

interface MalfuzatPdfModalProps {
  volume: number;
  pageNum: number | string; // Printed book page number
  pdfPage: number; // 1-based physical page in PDF file
  title: string;
  urduTitle?: string;
  dateStr?: string;
  englishTranslation?: string;
  urduText?: string;
  onClose: () => void;
}

// Total PDF pages per volume for bounds checking
const VOLUME_TOTAL_PAGES: Record<number, number> = {
  1: 366,
  2: 371,
  3: 394,
  4: 343,
  7: 649,
  8: 585,
  9: 653,
  10: 687
};

export default function MalfuzatPdfModal({
  volume,
  pageNum: initialBookPage,
  pdfPage: initialPdfPage,
  title,
  urduTitle,
  dateStr,
  englishTranslation,
  urduText,
  onClose
}: MalfuzatPdfModalProps) {
  const totalPages = VOLUME_TOTAL_PAGES[volume] || 400;
  const [currentPage, setCurrentPage] = useState<number>(initialPdfPage || 1);
  const [pageInput, setPageInput] = useState<string>(String(initialPdfPage || 1));
  const [viewMode, setViewMode] = useState<"pdf" | "text">("pdf");
  const [copied, setCopied] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");

  // Text article state (when switching to Extracted Text view)
  const [articleContent, setArticleContent] = useState<any>(null);
  const [loadingText, setLoadingText] = useState<boolean>(false);

  // Sync page input when currentPage changes
  useEffect(() => {
    setPageInput(String(currentPage));
    setIframeLoading(true);
  }, [currentPage]);

  // Direct URLs
  const rawPdfUrl = `https://files.alislam.cloud/pdf/Malfuzat-${volume}.pdf`;
  const directPdfUrl = `${rawPdfUrl}#page=${currentPage}`;
  const proxyPdfUrl = `/api/pdf-proxy?url=${encodeURIComponent(rawPdfUrl)}#page=${currentPage}&view=FitH&toolbar=1&navpanes=0`;

  // Handle ESC key to close and arrow keys for page turning in PDF view
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
  }, [currentPage, totalPages, onClose]);

  // Fetch extracted text when switching to text mode or page changes
  useEffect(() => {
    if (viewMode === "text") {
      fetchPageText(currentPage);
    }
  }, [viewMode, currentPage]);

  const fetchPageText = async (targetPage: number) => {
    setLoadingText(true);
    try {
      const res = await fetch("/api/research/article-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: `${rawPdfUrl}#page=${targetPage}`,
          source: "Malfuzat"
        })
      });
      const data = await res.json();
      if (data.success && data.article) {
        setArticleContent(data.article);
      }
    } catch (e) {
      console.warn("[Malfuzat PDF Modal] Error fetching page text:", e);
    } finally {
      setLoadingText(false);
    }
  };

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
    const citation = `[Malfuzat, Vol. ${volume}, p. ${initialBookPage} (PDF p. ${currentPage}), "${title}"${dateStr ? `, ${dateStr}` : ""}]\nSource: ${directPdfUrl}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Dark Ambient Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Reader Dialog Shell */}
      <div className="relative w-full max-w-6xl h-[94vh] flex flex-col rounded-2xl md:rounded-3xl glass bg-[#050713]/98 dark:bg-[#020310]/98 border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ── TOP STICKY TOOLBAR ── */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 glass bg-black/50 backdrop-blur-md select-none gap-2">
          
          {/* Left: Volume & Book Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1 text-xs font-bold shrink-0 active:scale-95"
              title="Close PDF (Esc)"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="h-4 w-px bg-white/10 shrink-0 hidden sm:block" />

            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[10px] tracking-wider uppercase shrink-0">
                Vol {volume}
              </span>
              <div className="truncate">
                <h2 className="font-bold text-xs sm:text-sm text-[var(--foreground)] truncate">
                  {title}
                </h2>
                <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 truncate">
                  <span>Book Page {initialBookPage}</span>
                  <span>•</span>
                  <span>PDF Page {currentPage}</span>
                  {dateStr && (
                    <>
                      <span>•</span>
                      <span>{dateStr}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center: View Toggle & Page Navigation */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center glass bg-white/5 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("pdf")}
                className={clsx(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  viewMode === "pdf"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-[var(--text-muted)] hover:text-white"
                )}
                title="View original publication PDF"
              >
                <BookOpen size={13} />
                <span className="hidden md:inline">PDF Document</span>
              </button>
              <button
                onClick={() => setViewMode("text")}
                className={clsx(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  viewMode === "text"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-[var(--text-muted)] hover:text-white"
                )}
                title="View formatted extracted text"
              >
                <FileText size={13} />
                <span className="hidden md:inline">Extracted Text</span>
              </button>
            </div>

            {/* Page Jumper Controls */}
            <div className="flex items-center gap-1 glass bg-white/5 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white disabled:opacity-30 disabled:hover:text-[var(--text-muted)] transition-colors"
                title="Previous page (Alt + Left Arrow)"
              >
                <ChevronLeft size={14} />
              </button>

              <form onSubmit={handlePageSubmit} className="flex items-center text-xs px-1">
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={() => setPageInput(String(currentPage))}
                  className="w-10 sm:w-12 text-center bg-black/30 border border-white/10 rounded px-1 py-0.5 text-xs text-[var(--foreground)] font-mono focus:outline-none focus:border-emerald-500/50"
                  title="Jump to physical PDF page"
                />
                <span className="text-[var(--text-muted)] text-[11px] ml-1">/ {totalPages}</span>
              </form>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white disabled:opacity-30 disabled:hover:text-[var(--text-muted)] transition-colors"
                title="Next page (Alt + Right Arrow)"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Right: Actions & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Cite Button */}
            <button
              onClick={copyCitation}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--text-muted)] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Copy Citation with exact page URL"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Cite"}</span>
            </button>

            {/* Open externally in new tab */}
            <a
              href={directPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
              title="Open full PDF in separate browser tab"
            >
              <ExternalLink size={14} />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors ml-1"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-neutral-950 flex flex-col">
          {viewMode === "pdf" ? (
            /* ── PDF EMBED VIEW ── */
            <div className="flex-1 w-full h-full relative bg-neutral-900 flex flex-col">
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-sm space-y-3">
                  <Loader2 size={36} className="animate-spin text-emerald-400" />
                  <p className="text-sm font-bold text-[var(--text-muted)] tracking-wide">
                    Streaming Malfuzat Vol. {volume} (Page {currentPage})...
                  </p>
                </div>
              )}
              <iframe
                key={`pdf-frame-v${volume}-p${currentPage}`}
                src={proxyPdfUrl}
                onLoad={() => setIframeLoading(false)}
                className="w-full h-full border-0 bg-white"
                title={`Malfuzat Volume ${volume} - Page ${currentPage}`}
              />
            </div>
          ) : (
            /* ── EXTRACTED TEXT VIEW ── */
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 md:px-16 py-8">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Info */}
                <div className="space-y-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--text-muted)]">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black uppercase text-[10px] tracking-wider">
                      Malfuzat Volume {volume}
                    </span>
                    <span>• Book Page {initialBookPage}</span>
                    <span>• PDF Page {currentPage}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight leading-snug">
                    {articleContent?.title || title}
                  </h1>

                  {urduTitle && (
                    <div dir="rtl" className="text-xl font-urdu text-emerald-400 font-normal pt-1">
                      {urduTitle}
                    </div>
                  )}

                  <div className="flex items-center gap-4 flex-wrap text-xs text-[var(--text-muted)] pt-1">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)]">
                      <User size={13} className="text-emerald-400" />
                      <span>By Hazrat Mirza Ghulam Ahmad (as)</span>
                    </div>
                    {dateStr && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-emerald-400" />
                        <span>{dateStr}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Urdu Discourse Quote if present */}
                {urduText && (
                  <div
                    dir="rtl"
                    className="p-5 rounded-2xl glass bg-emerald-500/[0.04] border border-emerald-500/20 text-xl md:text-2xl leading-loose font-urdu text-[var(--foreground)] text-right"
                  >
                    {urduText}
                  </div>
                )}

                {/* Loading state for page text */}
                {loadingText && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <Loader2 size={30} className="animate-spin text-emerald-400" />
                    <p className="text-xs font-bold text-[var(--text-muted)]">
                      Loading page discourse text...
                    </p>
                  </div>
                )}

                {/* Extracted HTML or English translation fallback */}
                {!loadingText && articleContent?.contentHtml ? (
                  <div
                    className={clsx(
                      "article-reader-body select-text transition-all leading-relaxed",
                      fontSize === "sm" && "text-sm leading-relaxed",
                      fontSize === "base" && "text-base leading-relaxed md:leading-loose",
                      fontSize === "lg" && "text-lg leading-loose",
                      fontSize === "xl" && "text-xl leading-loose"
                    )}
                    dangerouslySetInnerHTML={{ __html: articleContent.contentHtml }}
                  />
                ) : !loadingText && englishTranslation ? (
                  <div className="space-y-4 text-base md:text-lg leading-relaxed text-[var(--foreground)]/90 font-medium">
                    <p>{englishTranslation}</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
