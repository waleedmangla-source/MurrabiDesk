"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bookmark,
  FileText,
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
  Copy,
  ExternalLink,
  Plus,
  Compass,
  Zap,
  BookMarked,
  X,
  Download,
  Share2,
  FolderDown,
  Layers,
  ChevronDown,
  Hand
} from "lucide-react";
import { clsx } from "clsx";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import {
  BookItem,
  BookProgress,
  ALL_DEFAULT_BOOKS,
  RUHANI_KHAZAIN_BOOKS,
  ENGLISH_CLASSICS_BOOKS,
  loadBookProgress,
  saveBookProgress,
  getAllInProgressBooks,
  loadCustomBooks,
  saveCustomBook,
  getActiveBookId,
  setActiveBookId,
  formatTimeSeconds
} from "@/lib/live-reader-library";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export default function LiveReaderPage() {
  // ─────────────────────────────────────────────────────────────
  // 1. Library & Active Book State
  // ─────────────────────────────────────────────────────────────
  const [sidebarTab, setSidebarTab] = useState<"reading" | "library">("reading");
  const [libraryFilter, setLibraryFilter] = useState<"all" | "khazain" | "english" | "custom">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customBooks, setCustomBooks] = useState<BookItem[]>([]);
  const [inProgressList, setInProgressList] = useState<BookProgress[]>([]);

  const [activeBook, setActiveBook] = useState<BookItem>(() => {
    return ALL_DEFAULT_BOOKS[0]; // Life of Muhammad
  });

  // ─────────────────────────────────────────────────────────────
  // 2. PDF Viewer & Pagination State
  // ─────────────────────────────────────────────────────────────
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");
  const [pdfScale, setPdfScale] = useState<number>(1.05);
  const [pdfLoading, setPdfLoading] = useState<boolean>(true);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 3. Card Flip & Two-Finger Swipe Gesture State
  // ─────────────────────────────────────────────────────────────
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const swipeLockRef = useRef<boolean>(false);
  const wheelAccumulatorRef = useRef<number>(0);
  const wheelResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Touch tracking for mobile/touchscreens
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isTwoFingerTouchRef = useRef<boolean>(false);

  // ─────────────────────────────────────────────────────────────
  // 4. Telemetry & Per-Page Timer State
  // ─────────────────────────────────────────────────────────────
  const [pageElapsedSeconds, setPageElapsedSeconds] = useState<number>(0);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);
  const [isSessionTimerRunning, setIsSessionTimerRunning] = useState<boolean>(true);
  const [dailyGoalMinutes] = useState<number>(30); // 30 min daily reading target
  const [bookProgress, setBookProgress] = useState<BookProgress | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 5. Per-Page Notepad & Drive Sync State
  // ─────────────────────────────────────────────────────────────
  const [pageNotes, setPageNotes] = useState<string>("");
  const [driveSyncStatus, setDriveSyncStatus] = useState<"synced" | "saving" | "offline" | "error">("synced");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 6. MurabbiAI Page Analysis State
  // ─────────────────────────────────────────────────────────────
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────
  // 7. AI Compilation Modal State
  // ─────────────────────────────────────────────────────────────
  const [isCompileModalOpen, setIsCompileModalOpen] = useState<boolean>(false);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compiledResult, setCompiledResult] = useState<{ title: string; markdown: string; html: string } | null>(null);
  const [compileStatus, setCompileStatus] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 8. Add Custom Book Modal State
  // ─────────────────────────────────────────────────────────────
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState<boolean>(false);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const [newBookUrl, setNewBookUrl] = useState("");

  const pageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pdfDocRef = useRef<any>(null);

  // PDF Loading options
  const pdfOptions = useMemo(
    () => ({
      cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/",
    }),
    []
  );

  // ── Load Custom Books and Initial Progress ──
  useEffect(() => {
    const loadedCustom = loadCustomBooks();
    setCustomBooks(loadedCustom);
    setInProgressList(getAllInProgressBooks());

    const savedBookId = getActiveBookId();
    const candidate = [...ALL_DEFAULT_BOOKS, ...loadedCustom].find((b) => b.id === savedBookId);
    if (candidate) {
      setActiveBook(candidate);
    }
  }, []);

  // ── When Active Book Changes: Initialize or Resume Progress ──
  useEffect(() => {
    if (!activeBook) return;
    setActiveBookId(activeBook.id);
    const existing = loadBookProgress(activeBook.id);

    if (existing) {
      setBookProgress(existing);
      const resumePage = existing.lastPage || 1;
      setCurrentPage(resumePage);
      setPageInput(String(resumePage));
      setPageNotes(existing.pages?.[String(resumePage)]?.notes || "");
    } else {
      const initialProg: BookProgress = {
        bookId: activeBook.id,
        bookTitle: activeBook.title,
        lastPage: 1,
        totalPages: activeBook.totalPages || 100,
        bookmarkedPages: [1],
        telemetry: {
          totalPagesRead: 1,
          totalTimeSeconds: 0,
          averagePageTimeSeconds: 60,
        },
        pages: {},
      };
      setBookProgress(initialProg);
      setCurrentPage(1);
      setPageInput("1");
      setPageNotes("");
      saveBookProgress(activeBook.id, initialProg);
    }

    setPageElapsedSeconds(0);
    setAiAnalysisResult(null);
    setAiError(null);
  }, [activeBook]);

  // ── General Session Timer (Stopwatch) ──
  useEffect(() => {
    if (isSessionTimerRunning) {
      sessionTimerRef.current = setInterval(() => {
        setSessionElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isSessionTimerRunning]);

  // ── Per-Page Timer ──
  useEffect(() => {
    setPageElapsedSeconds(0);
    pageTimerRef.current = setInterval(() => {
      setPageElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (pageTimerRef.current) clearInterval(pageTimerRef.current);
    };
  }, [currentPage, activeBook.id]);

  // ── Record Page Time & Auto-Bookmark at End of Page ──
  const recordPageTelemetryAndBookmark = useCallback(
    (pageToSave: number, timeSpent: number, notesContent: string) => {
      if (!activeBook) return;

      setBookProgress((prev) => {
        const currentProg: BookProgress = prev || {
          bookId: activeBook.id,
          bookTitle: activeBook.title,
          lastPage: pageToSave,
          totalPages: numPages || 100,
          bookmarkedPages: [pageToSave],
          telemetry: { totalPagesRead: 1, totalTimeSeconds: 0, averagePageTimeSeconds: 60 },
          pages: {},
        };

        const pageKey = String(pageToSave);
        const prevPageData = currentProg.pages[pageKey] || {
          notes: "",
          timeSpentSeconds: 0,
          updatedAt: new Date().toISOString(),
        };

        const updatedTimeForPage = (prevPageData.timeSpentSeconds || 0) + timeSpent;
        const updatedPages = {
          ...currentProg.pages,
          [pageKey]: {
            notes: notesContent,
            timeSpentSeconds: updatedTimeForPage,
            bookmarked: true,
            updatedAt: new Date().toISOString(),
          },
        };

        // Calculate aggregated telemetry
        const pagesWithTime = Object.values(updatedPages).filter((p) => (p.timeSpentSeconds || 0) > 0);
        const totalSecs = pagesWithTime.reduce((acc, p) => acc + (p.timeSpentSeconds || 0), 0);
        const totalCount = Math.max(pagesWithTime.length, 1);
        const avgSecs = Math.round(totalSecs / totalCount);

        // Auto-bookmark this page
        const bookmarks = new Set(currentProg.bookmarkedPages || []);
        bookmarks.add(pageToSave);

        const newProgress: BookProgress = {
          ...currentProg,
          lastPage: pageToSave,
          totalPages: numPages || currentProg.totalPages,
          bookmarkedPages: Array.from(bookmarks),
          telemetry: {
            totalPagesRead: totalCount,
            totalTimeSeconds: totalSecs,
            averagePageTimeSeconds: avgSecs,
          },
          pages: updatedPages,
          lastSynced: new Date().toISOString(),
        };

        // Persist locally
        saveBookProgress(activeBook.id, newProgress);
        setInProgressList(getAllInProgressBooks());

        // Sync to Google Drive in background
        syncProgressToGoogleDrive(activeBook.id, newProgress);

        return newProgress;
      });
    },
    [activeBook, numPages]
  );

  // ── Sync to Google Drive API ──
  const syncProgressToGoogleDrive = async (bookId: string, progress: BookProgress) => {
    try {
      setDriveSyncStatus("saving");
      const token = typeof window !== "undefined" ? localStorage.getItem("google_refresh_token_encrypted") || "" : "";

      const res = await fetch("/api/live-reader/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-murabbi-token": token,
        },
        body: JSON.stringify({ bookId, progress }),
      });

      if (res.ok) {
        setDriveSyncStatus("synced");
      } else {
        setDriveSyncStatus("offline");
      }
    } catch {
      setDriveSyncStatus("offline");
    }
  };

  // ── Page Navigation Handler ──
  const changePage = useCallback(
    (newPage: number) => {
      if (!numPages || newPage < 1 || newPage > numPages || newPage === currentPage) return;

      // Save telemetry and notes for outgoing page
      recordPageTelemetryAndBookmark(currentPage, pageElapsedSeconds, pageNotes);

      // Switch to new page
      setCurrentPage(newPage);
      setPageInput(String(newPage));

      // Load notes for incoming page
      const existingNotesForNewPage = bookProgress?.pages?.[String(newPage)]?.notes || "";
      setPageNotes(existingNotesForNewPage);
      setAiAnalysisResult(null);
      setAiError(null);
    },
    [numPages, currentPage, pageElapsedSeconds, pageNotes, recordPageTelemetryAndBookmark, bookProgress]
  );

  // ── Trigger Animated Card Flip ──
  const triggerPageFlip = useCallback(
    (direction: "next" | "prev") => {
      if (swipeLockRef.current) return;

      if (direction === "next") {
        if (!numPages || currentPage >= numPages) return;
        swipeLockRef.current = true;
        wheelAccumulatorRef.current = 0;
        setFlipDirection("next");
        setIsFlipping(true);

        setTimeout(() => {
          changePage(currentPage + 1);
          setTimeout(() => {
            setIsFlipping(false);
            setFlipDirection(null);
            swipeLockRef.current = false;
          }, 200);
        }, 130);
      } else {
        if (currentPage <= 1) return;
        swipeLockRef.current = true;
        wheelAccumulatorRef.current = 0;
        setFlipDirection("prev");
        setIsFlipping(true);

        setTimeout(() => {
          changePage(currentPage - 1);
          setTimeout(() => {
            setIsFlipping(false);
            setFlipDirection(null);
            swipeLockRef.current = false;
          }, 200);
        }, 130);
      }
    },
    [currentPage, numPages, changePage]
  );

  // ── Two-Finger Swipe Trackpad & Touch Listeners ──
  useEffect(() => {
    const el = cardContainerRef.current;
    if (!el) return;

    // Trackpad 2-finger horizontal swipe
    const onWheel = (e: WheelEvent) => {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.75 && Math.abs(e.deltaX) > 6;
      if (!isHorizontal && !e.shiftKey) return;

      // Prevent macOS back/forward browser navigation swipe
      e.preventDefault();

      if (swipeLockRef.current) return;

      wheelAccumulatorRef.current += e.deltaX;

      if (wheelResetTimeoutRef.current) clearTimeout(wheelResetTimeoutRef.current);
      wheelResetTimeoutRef.current = setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 200);

      const SWIPE_THRESHOLD = 28; // Responsive threshold for macOS trackpad
      if (wheelAccumulatorRef.current > SWIPE_THRESHOLD) {
        triggerPageFlip("next");
      } else if (wheelAccumulatorRef.current < -SWIPE_THRESHOLD) {
        triggerPageFlip("prev");
      }
    };

    // Touchscreen 2-finger swipe
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isTwoFingerTouchRef.current = true;
        touchStartXRef.current = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        touchStartYRef.current = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      } else {
        isTwoFingerTouchRef.current = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTwoFingerTouchRef.current || touchStartXRef.current === null) return;
      if (e.touches.length !== 2) return;

      const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const deltaX = currentX - touchStartXRef.current;
      const deltaY = currentY - (touchStartYRef.current || 0);

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
        e.preventDefault();
        if (deltaX < -35) {
          triggerPageFlip("next");
        } else if (deltaX > 35) {
          triggerPageFlip("prev");
        }
      }
    };

    const onTouchEnd = () => {
      isTwoFingerTouchRef.current = false;
      touchStartXRef.current = null;
      touchStartYRef.current = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [triggerPageFlip]);

  // ── Keyboard Arrow Keys Navigation ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        triggerPageFlip("next");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        triggerPageFlip("prev");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [triggerPageFlip]);

  // ── Handle Notepad Typing (Debounced Auto-Save) ──
  const handleNotesChange = (text: string) => {
    setPageNotes(text);
    setDriveSyncStatus("saving");

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      recordPageTelemetryAndBookmark(currentPage, pageElapsedSeconds, text);
    }, 1200);
  };

  // ── MurabbiAI Page Analysis ──
  const handleAnalyzePage = async () => {
    setIsAiAnalyzing(true);
    setAiError(null);
    setShowAiDrawer(true);

    try {
      // Capture text from PDF.js document or canvas snapshot
      let pageText = "";
      if (pdfDocRef.current) {
        try {
          const pageObj = await pdfDocRef.current.getPage(currentPage);
          const textContent = await pageObj.getTextContent();
          pageText = textContent.items.map((item: any) => item.str).join(" ");
        } catch {}
      }

      let imageBase64: string | undefined = undefined;
      const canvas = document.querySelector(".react-pdf__Page__canvas") as HTMLCanvasElement;
      if (canvas && (!pageText || pageText.trim().length < 50)) {
        // Scanned page: extract canvas data URL
        imageBase64 = canvas.toDataURL("image/jpeg", 0.85);
      }

      const res = await fetch("/api/live-reader/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pageText,
          imageBase64,
          pageNum: currentPage,
          bookTitle: activeBook.title,
          author: activeBook.author,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Analysis failed");
      }

      const data = await res.json();
      setAiAnalysisResult(data);
    } catch (err: any) {
      setAiError(err.message || "Failed to analyze page");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // ── AI Compile All Notes ──
  const handleOpenCompileModal = async () => {
    setIsCompileModalOpen(true);
    setIsCompiling(true);
    setCompileStatus("Synthesizing notes with MurabbiAI...");

    try {
      const notesByPage = bookProgress?.pages || {};
      const res = await fetch("/api/live-reader/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle: activeBook.title,
          author: activeBook.author,
          notesByPage,
          readingTelemetry: bookProgress?.telemetry,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Compilation failed");
      }

      const data = await res.json();
      setCompiledResult(data);
      setCompileStatus("Successfully compiled into study brief.");
    } catch (err: any) {
      setCompileStatus(`Compilation Error: ${err.message}`);
    } finally {
      setIsCompiling(false);
    }
  };

  // ── Export to Google Doc ──
  const handleExportToGoogleDoc = async () => {
    if (!compiledResult) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("google_refresh_token_encrypted") || "" : "";
    try {
      const res = await fetch("/api/brain/create-doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-murabbi-token": token,
        },
        body: JSON.stringify({
          title: compiledResult.title,
          templateText: compiledResult.html,
          module: "Live Reader",
        }),
      });
      if (res.ok) {
        alert("Study Document successfully created in Google Drive under Murabbi Desk/Live Reader!");
      } else {
        alert("Failed to export Google Doc. Verify Google Drive authentication.");
      }
    } catch (e: any) {
      alert(`Error creating Google Doc: ${e.message}`);
    }
  };

  // ── Export to Murabbi Notes ──
  const handleExportToMurabbiNotes = async () => {
    if (!compiledResult) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("google_refresh_token_encrypted") || "" : "";
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: compiledResult.title,
          content: compiledResult.markdown,
          labels: ["Live Reader", activeBook.title],
          color: "emerald",
        }),
      });
      if (res.ok) {
        alert("Document successfully saved into Murabbi Notes!");
      } else {
        alert("Failed to save to Murabbi Notes.");
      }
    } catch (e: any) {
      alert(`Error saving note: ${e.message}`);
    }
  };

  // ── Add Custom PDF Handler ──
  const handleAddCustomBook = () => {
    if (!newBookTitle || !newBookUrl) {
      alert("Please provide both title and PDF URL");
      return;
    }
    const newBook: BookItem = {
      id: `custom_${Date.now()}`,
      title: newBookTitle,
      author: newBookAuthor || "Unknown Author",
      language: "english",
      category: "custom",
      pdfUrl: newBookUrl.startsWith("http") ? `/api/pdf-proxy?url=${encodeURIComponent(newBookUrl)}` : newBookUrl,
      isCustom: true,
    };
    saveCustomBook(newBook);
    setCustomBooks((prev) => [newBook, ...prev]);
    setActiveBook(newBook);
    setIsAddBookModalOpen(false);
    setNewBookTitle("");
    setNewBookAuthor("");
    setNewBookUrl("");
  };

  // ── Filtered Library Books ──
  const filteredLibrary = useMemo(() => {
    let list: BookItem[] = [];
    if (libraryFilter === "all") list = [...ALL_DEFAULT_BOOKS, ...customBooks];
    else if (libraryFilter === "khazain") list = RUHANI_KHAZAIN_BOOKS;
    else if (libraryFilter === "english") list = ENGLISH_CLASSICS_BOOKS;
    else if (libraryFilter === "custom") list = customBooks;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.urduTitle && b.urduTitle.toLowerCase().includes(q)) ||
        b.author.toLowerCase().includes(q)
    );
  }, [libraryFilter, searchQuery, customBooks]);

  // Telemetry stats
  const avgSpeedSecs = bookProgress?.telemetry?.averagePageTimeSeconds || 60;
  const totalNotesCount = Object.values(bookProgress?.pages || {}).filter((p) => p.notes && p.notes.trim().length > 0).length;

  return (
    <div className="flex w-full h-[calc(100vh-3.5rem)] lg:h-screen overflow-hidden bg-[var(--background)]">
      {/* ─────────────────────────────────────────────────────────────
          SECONDARY SIDEBAR: Exactly w-[240px] Matching Email Tab
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[240px] shrink-0 h-full flex-col border-r border-white/5 glass bg-black/20 select-none">
        {/* Sidebar Title */}
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Live Reader
          </h1>
        </div>

        {/* Sync Status Badge */}
        <div className="px-5 pt-1 pb-3 border-b border-white/5 mb-2">
          <div className="flex items-center gap-2 py-1">
            <span
              className={clsx(
                "w-2 h-2 rounded-full shrink-0",
                driveSyncStatus === "synced"
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  : driveSyncStatus === "saving"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-slate-400"
              )}
            />
            <span className="text-[10px] font-bold tracking-tight text-[var(--text-dim)] truncate">
              {driveSyncStatus === "synced"
                ? "Google Drive Linked"
                : driveSyncStatus === "saving"
                ? "Syncing JSON to Drive..."
                : "Local Link Only"}
            </span>
          </div>

          {/* Animated Sidebar Tabs: Reading vs Library */}
          <div className="relative flex bg-[var(--text-dim)]/5 rounded-xl p-1 mt-3 border border-white/5">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-[8px] transition-all duration-300 ease-out shadow-sm"
              style={{
                left: sidebarTab === "reading" ? "0.25rem" : "calc(50%)",
                background: "var(--accent-main)",
              }}
            />
            <button
              onClick={() => setSidebarTab("reading")}
              className={clsx(
                "relative z-10 flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-colors duration-200",
                sidebarTab === "reading" ? "text-white drop-shadow-md" : "text-[var(--text-dim)] hover:text-white"
              )}
            >
              Reading
            </button>
            <button
              onClick={() => setSidebarTab("library")}
              className={clsx(
                "relative z-10 flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-colors duration-200",
                sidebarTab === "library" ? "text-white drop-shadow-md" : "text-[var(--text-dim)] hover:text-white"
              )}
            >
              Library
            </button>
          </div>
        </div>

        {/* Sidebar Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-3 gap-2">
          {sidebarTab === "reading" ? (
            <div className="flex flex-col gap-2">
              <div className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)] px-2">
                Currently Reading
              </div>

              {inProgressList.length === 0 ? (
                <div className="text-[11px] text-[var(--text-dim)] italic text-center py-6">
                  Select a book from Library to begin reading.
                </div>
              ) : (
                inProgressList.map((prog) => {
                  const isActive = prog.bookId === activeBook.id;
                  const matchingBook = [...ALL_DEFAULT_BOOKS, ...customBooks].find((b) => b.id === prog.bookId);
                  const progressPct = Math.min(
                    100,
                    Math.round((prog.lastPage / (prog.totalPages || 100)) * 100)
                  );

                  return (
                    <button
                      key={prog.bookId}
                      onClick={() => {
                        if (matchingBook) setActiveBook(matchingBook);
                      }}
                      className={clsx(
                        "w-full flex flex-col p-3 rounded-2xl border text-left transition-all duration-200 group relative",
                        isActive
                          ? "bg-[var(--accent-main)]/10 border-[var(--accent-main)]/40 shadow-sm"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-[var(--text-dim)]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={clsx(
                            "text-xs font-black truncate",
                            isActive ? "text-white" : "text-[var(--foreground)] group-hover:text-white"
                          )}
                        >
                          {prog.bookTitle}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-[var(--accent-main)] shrink-0">
                          {progressPct}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-black/40 rounded-full h-1 overflow-hidden my-1">
                        <div
                          className="bg-[var(--accent-main)] h-full transition-all duration-500 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-[var(--text-dim)] mt-1">
                        <span>Page {prog.lastPage} of {prog.totalPages}</span>
                        <span>{formatTimeSeconds(prog.telemetry.averagePageTimeSeconds)} / pg</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            /* Library Tab */
            <div className="flex flex-col gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/20 border border-white/5 text-[11px] text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none focus:border-[var(--accent-main)]"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {(["all", "khazain", "english", "custom"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setLibraryFilter(cat)}
                    className={clsx(
                      "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 transition-all",
                      libraryFilter === cat
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-[var(--text-dim)] hover:text-white"
                    )}
                  >
                    {cat === "khazain" ? "Khazain" : cat === "english" ? "English" : cat}
                  </button>
                ))}
              </div>

              {/* Book List */}
              <div className="flex flex-col gap-1.5 mt-1">
                {filteredLibrary.map((b) => {
                  const isSelected = b.id === activeBook.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setActiveBook(b)}
                      className={clsx(
                        "w-full flex flex-col p-2.5 rounded-xl border text-left transition-all group",
                        isSelected
                          ? "bg-[var(--accent-main)] text-white border-[var(--accent-main)] shadow-sm"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-[var(--text-dim)]"
                      )}
                    >
                      <span className={clsx("text-xs font-bold truncate", isSelected ? "text-white" : "text-[var(--foreground)]")}>
                        {b.title}
                      </span>
                      {b.urduTitle && (
                        <span className="text-[10px] font-arabic opacity-80 truncate text-right">
                          {b.urduTitle}
                        </span>
                      )}
                      <span className="text-[8px] uppercase tracking-wider opacity-60 truncate mt-0.5">
                        {b.author}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer: + Add Custom Book Button */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 glass bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all active:scale-95"
          >
            <Plus size={14} />
            <span>Add Custom PDF</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA: Header Telemetry + Center Card Deck + Right Notepad
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--background)]">
        {/* ── Top Header Controls & Telemetry Bar ── */}
        <header className="h-16 shrink-0 border-b border-white/10 glass bg-black/40 px-4 md:px-6 flex items-center justify-between gap-4">
          {/* Active Book Info & Page Pagination */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)]">
                Active Book
              </span>
              <h2 className="text-sm md:text-base font-black text-white truncate max-w-[220px] md:max-w-md">
                {activeBook.title}
              </h2>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 ml-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => triggerPageFlip("prev")}
                className="p-1 rounded-lg hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="Previous Card (Left Arrow or Two-finger swipe right)"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 px-2 text-xs font-mono font-bold text-white">
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = parseInt(pageInput, 10);
                      if (!isNaN(val)) changePage(val);
                    }
                  }}
                  className="w-10 bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-center text-xs text-white outline-none focus:border-[var(--accent-main)]"
                />
                <span className="text-[var(--text-dim)]">/ {numPages || "..."}</span>
              </div>

              <button
                disabled={!numPages || currentPage >= numPages}
                onClick={() => triggerPageFlip("next")}
                className="p-1 rounded-lg hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="Next Card (Right Arrow or Two-finger swipe left)"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Auto-Bookmark Pill */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold"
              title="Automatically saves your bookmark on page change"
            >
              <Bookmark size={12} className="fill-amber-400" />
              <span>Bookmarked</span>
            </div>
          </div>

          {/* Right Header: Per-Page Telemetry & General Session Timer */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Per-Page Timer & Speed Analytics */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--text-dim)]">
                  Card Time
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {formatTimeSeconds(pageElapsedSeconds)}
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--text-dim)]">
                  Avg Speed
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {formatTimeSeconds(avgSpeedSecs)} / card
                </span>
              </div>
            </div>

            {/* General Session Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10">
              <Clock size={14} className="text-[var(--accent-main)]" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--text-dim)]">
                  Session
                </span>
                <span className="text-xs font-mono font-black text-white">
                  {formatTimeSeconds(sessionElapsedSeconds)}
                </span>
              </div>

              <button
                onClick={() => setIsSessionTimerRunning(!isSessionTimerRunning)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-all ml-1"
                title={isSessionTimerRunning ? "Pause Reading Session" : "Resume Reading Session"}
              >
                {isSessionTimerRunning ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                onClick={() => setSessionElapsedSeconds(0)}
                className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-dim)] hover:text-white transition-all"
                title="Reset Session Timer"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {/* MurabbiAI Analyze Trigger Button */}
            <button
              onClick={handleAnalyzePage}
              disabled={isAiAnalyzing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-main)] to-emerald-600 hover:opacity-90 active:scale-95 text-white text-xs font-black shadow-lg shadow-[var(--accent-main)]/20 transition-all disabled:opacity-50"
            >
              {isAiAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span className="hidden sm:inline">MurabbiAI Analyze</span>
            </button>
          </div>
        </header>

        {/* ── Main Stage: Card Deck Stage (Center) + Notepad Pane (Right) ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* CENTER: Interactive Card Stage with Two-Finger Swipe */}
          <div
            ref={cardContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center p-4 md:p-6 bg-black/50 relative cursor-grab active:cursor-grabbing"
            style={{ touchAction: "pan-y" }}
          >
            {/* Top Toolbar: Zoom Controls & Swipe Hint */}
            <div className="sticky top-2 z-20 flex items-center justify-between w-full max-w-[760px] mb-3 px-2 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass bg-black/60 border border-white/10 shadow-xl backdrop-blur-md">
                <button
                  onClick={() => setPdfScale((s) => Math.max(0.7, s - 0.1))}
                  className="p-1 rounded hover:bg-white/10 text-white text-xs font-bold"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold text-white px-1">
                  {Math.round(pdfScale * 100)}%
                </span>
                <button
                  onClick={() => setPdfScale((s) => Math.min(2.0, s + 0.1))}
                  className="p-1 rounded hover:bg-white/10 text-white text-xs font-bold"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => setPdfScale(1.05)}
                  className="text-[9px] font-bold text-[var(--text-dim)] hover:text-white ml-2 px-1.5 py-0.5 rounded border border-white/10"
                >
                  Reset
                </button>
              </div>

              {/* Two-Finger Swipe Helper Pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass bg-black/60 border border-white/10 text-[10px] font-bold text-[var(--text-dim)] shadow-xl backdrop-blur-md">
                <Hand size={12} className="text-[var(--accent-main)]" />
                <span>Swipe with two fingers horizontally to flip cards</span>
              </div>
            </div>

            {/* ── CARD DECK PRESENTATION ── */}
            <div className="relative w-full max-w-[760px] flex items-center justify-center my-auto pb-16 select-none perspective-[1400px]">
              {/* Stacked Deck Silhouette 2 (Deepest layer) */}
              <div className="absolute inset-x-8 top-1 bottom-6 rounded-[34px] bg-white/70 border border-zinc-200/80 shadow-md scale-[0.93] -translate-y-3 pointer-events-none transition-all duration-300" />

              {/* Stacked Deck Silhouette 1 (Middle layer) */}
              <div className="absolute inset-x-4 top-2 bottom-5 rounded-[32px] bg-white/90 border border-zinc-200 shadow-lg scale-[0.965] -translate-y-1.5 pointer-events-none transition-all duration-300" />

              {/* Main Interactive Card (White Card with Crisp Black Text) */}
              <div
                className={clsx(
                  "relative w-full rounded-[28px] overflow-hidden bg-white text-zinc-950 border border-zinc-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] flex flex-col group/card transition-all duration-300 ease-out",
                  isFlipping && flipDirection === "next" && "-translate-x-14 rotate-[-3.5deg] opacity-60 scale-[0.96]",
                  isFlipping && flipDirection === "prev" && "translate-x-14 rotate-[3.5deg] opacity-60 scale-[0.96]",
                  !isFlipping && "translate-x-0 rotate-0 opacity-100 scale-100"
                )}
              >
                {/* Card Header Banner (Black Text) */}
                <div className="px-5 py-3 border-b border-zinc-200/80 bg-zinc-50/90 flex items-center justify-between select-none">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-[var(--accent-main)]" />
                    <span className="text-xs font-black text-zinc-950 truncate max-w-[320px]">
                      {activeBook.title}
                    </span>
                    {activeBook.volume && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-800 border border-zinc-300">
                        Vol {activeBook.volume}
                      </span>
                    )}
                  </div>

                  {/* Card Number Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-emerald-950 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full">
                      Card {currentPage} of {numPages || "..."}
                    </span>
                    <button
                      onClick={() => {
                        recordPageTelemetryAndBookmark(currentPage, pageElapsedSeconds, pageNotes);
                      }}
                      className="p-1 rounded-lg hover:bg-zinc-200 text-amber-500 transition-all"
                      title="Bookmark this card"
                    >
                      <Bookmark size={13} className="fill-amber-500" />
                    </button>
                  </div>
                </div>

                {/* PDF Card Body (100% Crisp Black Vector & Canvas Rendering) */}
                <div className="w-full flex justify-center bg-white overflow-hidden py-2 min-h-[500px]">
                  <Document
                    file={activeBook.pdfUrl}
                    options={pdfOptions}
                    onLoadSuccess={(pdf) => {
                      pdfDocRef.current = pdf;
                      setNumPages(pdf.numPages);
                      setPdfLoading(false);
                      setPdfError(null);
                    }}
                    onLoadError={(err) => {
                      console.error("PDF Load Error:", err);
                      setPdfError("Failed to load PDF. Please check your connection or the PDF URL.");
                      setPdfLoading(false);
                    }}
                    loading={
                      <div className="flex flex-col items-center justify-center p-24 gap-3 text-zinc-900">
                        <Loader2 size={32} className="animate-spin text-[var(--accent-main)]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                          Preparing Card...
                        </span>
                      </div>
                    }
                    error={
                      <div className="p-8 rounded-2xl bg-zinc-50 border border-red-300 text-center max-w-md my-auto">
                        <AlertCircle size={28} className="text-red-500 mx-auto mb-2" />
                        <h3 className="text-sm font-bold text-zinc-900 mb-1">Failed to Render Card</h3>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {pdfError || "Unable to display this card. Please retry or choose another book."}
                        </p>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={currentPage}
                      scale={pdfScale}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      loading={
                        <div className="w-[580px] h-[780px] flex items-center justify-center bg-zinc-100">
                          <Loader2 size={24} className="animate-spin text-[var(--accent-main)]" />
                        </div>
                      }
                    />
                  </Document>
                </div>

                {/* Card Footer Bar (Black/Dark Text) */}
                <div className="px-5 py-2.5 border-t border-zinc-200/80 bg-zinc-50/90 flex items-center justify-between text-[10px] text-zinc-700 select-none">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">Dwell: {formatTimeSeconds(pageElapsedSeconds)}</span>
                    <span>•</span>
                    <span className="font-bold text-zinc-900">Avg: {formatTimeSeconds(avgSpeedSecs)} / card</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-semibold text-zinc-600">
                    <span>Swipe 2-fingers or use ← → keys</span>
                  </div>
                </div>
              </div>

              {/* Floating Left Flip Button */}
              <button
                disabled={currentPage <= 1}
                onClick={() => triggerPageFlip("prev")}
                className="absolute -left-5 md:-left-6 p-3 rounded-full bg-white/95 border border-zinc-300 text-zinc-900 hover:bg-white hover:border-[var(--accent-main)] shadow-xl transition-all disabled:opacity-0 disabled:pointer-events-none active:scale-90 z-20"
                title="Previous Card (Swipe right)"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Floating Right Flip Button */}
              <button
                disabled={!numPages || currentPage >= numPages}
                onClick={() => triggerPageFlip("next")}
                className="absolute -right-5 md:-right-6 p-3 rounded-full bg-white/95 border border-zinc-300 text-zinc-900 hover:bg-white hover:border-[var(--accent-main)] shadow-xl transition-all disabled:opacity-0 disabled:pointer-events-none active:scale-90 z-20"
                title="Next Card (Swipe left)"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* RIGHT: Small Dedicated Notepad for Current Page & AI Compile Button */}
          <aside className="w-[320px] md:w-[360px] shrink-0 border-l border-white/10 glass bg-black/40 flex flex-col h-full overflow-hidden select-none">
            {/* Notepad Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[var(--accent-main)]" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Card {currentPage} Notes
                  </span>
                </div>
                <span className="text-[9px] text-[var(--text-dim)] font-medium mt-0.5">
                  Saved on .JSON in Google Drive
                </span>
              </div>

              {/* Compile All Notes Button */}
              <button
                onClick={handleOpenCompileModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[11px] font-black transition-all active:scale-95 shadow-sm"
                title="Compile all page notes into a polished single document using AI"
              >
                <Sparkles size={12} className="text-amber-400" />
                <span>Compile AI Doc</span>
              </button>
            </div>

            {/* Note Textarea for Current Page */}
            <div className="flex-1 p-4 flex flex-col overflow-hidden">
              <textarea
                value={pageNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder={`Type thoughts, key points, or quotes for Card ${currentPage} here...\n\nEvery page card gets its own notepad, automatically saved to your book's JSON file on Google Drive.`}
                className="flex-1 w-full p-3.5 rounded-2xl bg-black/30 border border-white/10 text-xs text-white placeholder-[var(--text-dim)] focus:border-[var(--accent-main)] focus:outline-none resize-none leading-relaxed custom-scrollbar"
              />

              {/* Status Footnote */}
              <div className="flex items-center justify-between text-[9px] text-[var(--text-dim)] mt-2 px-1">
                <span>Total Annotated Cards: {totalNotesCount}</span>
                <span className="text-emerald-400 font-bold">
                  {driveSyncStatus === "saving" ? "Saving..." : "Synced to Drive ✓"}
                </span>
              </div>
            </div>

            {/* MurabbiAI Analysis Card (Collapsible) */}
            <div className="border-t border-white/10 p-4 max-h-[45%] overflow-y-auto custom-scrollbar flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)] flex items-center gap-1.5">
                  <Sparkles size={12} />
                  MurabbiAI Context
                </span>
                {aiAnalysisResult && (
                  <button
                    onClick={() => {
                      const summary = aiAnalysisResult.summary || "";
                      const insight = aiAnalysisResult.theologicalInsight || "";
                      const append = `\n\n[MurabbiAI Insight]:\n${summary}\n\nTakeaway: ${insight}`;
                      handleNotesChange((pageNotes + append).trim());
                    }}
                    className="text-[9px] font-bold text-[var(--text-dim)] hover:text-white underline"
                  >
                    + Copy to Notes
                  </button>
                )}
              </div>

              {isAiAnalyzing ? (
                <div className="flex items-center gap-2 py-4 text-xs text-[var(--text-dim)]">
                  <Loader2 size={14} className="animate-spin text-[var(--accent-main)]" />
                  <span>Analyzing theology & arguments...</span>
                </div>
              ) : aiAnalysisResult ? (
                <div className="flex flex-col gap-2.5 text-xs">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-white/60 mb-0.5">Synopsis</h4>
                    <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                      {aiAnalysisResult.summary}
                    </p>
                  </div>

                  {aiAnalysisResult.theologicalInsight && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-[9px] font-black uppercase tracking-wider text-emerald-400 mb-0.5">
                        Murabbi Pedagogical Insight
                      </h4>
                      <p className="text-[11px] text-emerald-200 leading-relaxed">
                        {aiAnalysisResult.theologicalInsight}
                      </p>
                    </div>
                  )}

                  {Array.isArray(aiAnalysisResult.hardWords) && aiAnalysisResult.hardWords.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-white/60 mb-1">Vocabulary</h4>
                      <div className="flex flex-col gap-1">
                        {aiAnalysisResult.hardWords.map((hw: any, idx: number) => (
                          <div key={idx} className="p-1.5 rounded-lg bg-white/5 text-[10px]">
                            <span className="font-bold text-white mr-1.5">{hw.word}:</span>
                            <span className="text-[var(--text-dim)]">{hw.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-[var(--text-dim)] italic py-2">
                  Click "MurabbiAI Analyze" in the top bar to extract theological insights and vocabulary for this card.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: AI Document Compiler Preview & Export
      ───────────────────────────────────────────────────────────── */}
      {isCompileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl glass bg-zinc-950/90 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col max-h-[85vh] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--accent-main)]/20 border border-[var(--accent-main)]/30 text-[var(--accent-main)]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic text-white tracking-tight">
                    MurabbiAI Study Document Compiler
                  </h3>
                  <p className="text-xs text-[var(--text-dim)]">
                    Cleaned, organized, and spell-checked study brief for "{activeBook.title}"
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCompileModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-[var(--text-dim)] hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Document Body Preview */}
            <div className="flex-1 overflow-y-auto custom-scrollbar my-4 p-5 rounded-2xl bg-black/40 border border-white/5 font-sans leading-relaxed text-sm text-slate-200">
              {isCompiling ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 size={32} className="animate-spin text-[var(--accent-main)]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {compileStatus}
                  </span>
                </div>
              ) : compiledResult ? (
                <div className="prose prose-invert max-w-none text-xs sm:text-sm">
                  <div
                    dangerouslySetInnerHTML={{ __html: compiledResult.html }}
                  />
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--text-dim)]">
                  {compileStatus || "No compilation available."}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="text-[10px] text-[var(--text-dim)]">
                Compiled from {totalNotesCount} card notepads
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!compiledResult}
                  onClick={() => {
                    if (compiledResult) {
                      navigator.clipboard.writeText(compiledResult.markdown);
                      alert("Markdown copied to clipboard!");
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-white/10 glass bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all"
                >
                  Copy Markdown
                </button>
                <button
                  disabled={!compiledResult}
                  onClick={handleExportToMurabbiNotes}
                  className="px-4 py-2 rounded-xl border border-white/10 glass bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all"
                >
                  Save to Notes
                </button>
                <button
                  disabled={!compiledResult}
                  onClick={handleExportToGoogleDoc}
                  className="px-4 py-2 rounded-xl bg-[var(--accent-main)] hover:opacity-90 active:scale-95 text-xs font-bold text-white shadow-lg shadow-[var(--accent-main)]/20 transition-all flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>Save as Google Doc</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: Add Custom PDF Book
      ───────────────────────────────────────────────────────────── */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass bg-zinc-950/90 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black italic text-white tracking-tight">Add Custom PDF Book</h3>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-dim)] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-dim)]">
                  Book Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tadhkiratul Auliya"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-[var(--text-dim)] outline-none focus:border-[var(--accent-main)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-dim)]">
                  Author
                </label>
                <input
                  type="text"
                  placeholder="e.g. Farid al-Din Attar"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-[var(--text-dim)] outline-none focus:border-[var(--accent-main)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-dim)]">
                  PDF URL or Path *
                </label>
                <input
                  type="text"
                  placeholder="https://.../book.pdf or /filename.pdf"
                  value={newBookUrl}
                  onChange={(e) => setNewBookUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-[var(--text-dim)] outline-none focus:border-[var(--accent-main)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 glass bg-white/5 text-xs font-bold text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomBook}
                className="px-4 py-2 rounded-xl bg-[var(--accent-main)] text-xs font-bold text-white shadow-lg"
              >
                Add & Open Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
