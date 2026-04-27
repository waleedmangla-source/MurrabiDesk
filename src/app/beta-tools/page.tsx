"use client";
import React, { useState } from "react";
import {
  Youtube,
  Download,
  Music,
  Video,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Clock,
  ThumbsUp,
  Eye,
  CheckCircle2,
  Activity,
  Terminal,
  Globe,
  Code,
  FileText,
  ChevronRight
} from "lucide-react";
import { clsx } from "clsx";

export default function BetaToolsPage() {
  // YT-DLP State
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Scrapy State
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeData, setScrapeData] = useState<any>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const fetchVideoInfo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);
    setDownloadSuccess(false);

    try {
      const res = await fetch("/api/yt-dlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const result = await res.json();
      if (result.success) {
        setVideoInfo(result.data);
      } else {
        setError(result.error || "Failed to fetch video information.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'video' | 'audio') => {
    if (!videoInfo) return;
    setDownloading(true);

    try {
      window.location.href = `/api/yt-dlp?url=${encodeURIComponent(url)}&type=${format}`;
      setTimeout(() => {
        setDownloading(false);
        setDownloadSuccess(true);
      }, 3000);
    } catch (err) {
      setError("Failed to initialize download sequence.");
      setDownloading(false);
    }
  };

  const handleScrape = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scrapeUrl) return;

    setScrapeLoading(true);
    setScrapeError(null);
    setScrapeData(null);

    try {
      const res = await fetch("/api/scrapy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl }),
      });

      const result = await res.json();
      if (result.success) {
        setScrapeData(result.data);
      } else {
        setScrapeError(result.error || "Extraction failed. Check if Scrapy is installed.");
      }
    } catch (err) {
      setScrapeError("Extraction protocol error.");
    } finally {
      setScrapeLoading(false);
    }
  };

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      {/* Header Section */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-medium tracking-tighter" style={{ color: 'var(--foreground)' }}>Beta Lab</h1>
          <p className="opacity-30 max-w-xl mt-2 font-medium tracking-[0.05em] text-[11px]" style={{ color: 'var(--foreground)' }}>
            Experimental Infrastructure & Extraction Modules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 no-drag overflow-y-auto pr-4 custom-scrollbar">
        {/* URL Input Areas */}
        <div className="col-span-12 xl:col-span-5 space-y-8">
          {/* YT-DLP Card */}
          <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] h-fit">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600">
                <Youtube size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Media Extraction</h3>
                <p className="text-[9px] font-black uppercase tracking-widest leading-none mt-1 opacity-40" style={{ color: 'var(--foreground)' }}>yt-dlp Implementation 2.0</p>
              </div>
            </div>

            <form onSubmit={fetchVideoInfo} className="space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Paste YouTube Link Here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 placeholder:opacity-10 focus:outline-none focus:border-red-600/50 transition-all font-bold"
                  style={{ color: 'var(--foreground)' }}
                />
                <button
                  type="submit"
                  disabled={loading || !url}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-red-600 hover:bg-red-700 disabled:bg-white/5 disabled:text-white/20 text-white rounded-xl font-medium tracking-widest text-[10px] transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Inspect
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 text-xs font-bold animate-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Scrapy Card */}
          <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] h-fit">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Web Scraper</h3>
                <p className="text-[9px] font-black uppercase tracking-widest leading-none mt-1 opacity-40" style={{ color: 'var(--foreground)' }}>Scrapy Crawler Engine</p>
              </div>
            </div>

            <form onSubmit={handleScrape} className="space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Paste Website URL..."
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 placeholder:opacity-10 focus:outline-none focus:border-emerald-600/50 transition-all font-bold"
                  style={{ color: 'var(--foreground)' }}
                />
                <button
                  type="submit"
                  disabled={scrapeLoading || !scrapeUrl}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-white/5 disabled:text-white/20 text-white rounded-xl font-medium tracking-widest text-[10px] transition-all flex items-center gap-2"
                >
                  {scrapeLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Scrape
                </button>
              </div>

              {scrapeError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 text-xs font-bold animate-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  {scrapeError}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Output Areas */}
        <div className="col-span-12 xl:col-span-7">
          {videoInfo ? (
            <div className="glass-card p-0 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-10 right-10">
                  <h2 className="text-2xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">{videoInfo.title}</h2>
                  <div className="flex items-center gap-6 mt-4 text-white/60 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2"><Eye size={12} className="text-red-600" /> {videoInfo.view_count?.toLocaleString()} Views</div>
                    <div className="flex items-center gap-2"><ThumbsUp size={12} className="text-red-600" /> {videoInfo.like_count?.toLocaleString()} Likes</div>
                    <div className="flex items-center gap-2"><Clock size={12} className="text-red-600" /> {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</div>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => handleDownload('video')}
                    disabled={downloading}
                    className="group relative flex flex-col items-center gap-4 p-8 rounded-[24px] bg-white text-black hover:bg-red-600 hover:text-white transition-all duration-500 overflow-hidden border border-black/5 shadow-xl"
                  >
                    <Video size={32} />
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black uppercase tracking-widest">Download Video</span>
                      <span className="text-[9px] font-bold opacity-40 group-hover:opacity-60 transition-opacity uppercase">MP4 Format • 720p/1080p</span>
                    </div>
                    {downloading && (
                      <div className="absolute inset-0 bg-red-600 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-white" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownload('audio')}
                    disabled={downloading}
                    className="group relative flex flex-col items-center gap-4 p-8 rounded-[24px] bg-white/5 border border-white/10 hover:border-red-600/50 hover:bg-red-600/10 transition-all duration-500"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Music size={32} className="text-red-600" />
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black uppercase tracking-widest">Extract Audio</span>
                      <span className="text-[9px] font-bold opacity-30 group-hover:opacity-60 transition-colors uppercase">MP3 Format • 320kbps</span>
                    </div>
                    {downloading && (
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-red-600" />
                      </div>
                    )}
                  </button>
                </div>

                {downloadSuccess && (
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-in zoom-in-95">
                    <CheckCircle2 size={24} />
                    <div>
                      <div className="text-sm font-black tracking-tight uppercase">Download Initialized</div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">The background process has successfully triggered your file stream.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : scrapeData ? (
            <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] animate-in fade-in slide-in-from-right-8 duration-700 h-full overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Scrape Successful</h2>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--foreground)' }}>Module: Scrapy v2.11</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Page Title</span>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{scrapeData.title || "No Title Found"}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Code size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--foreground)' }}>Links Found</span>
                    </div>
                    <div className="text-xl font-black" style={{ color: 'var(--foreground)' }}>{scrapeData.links_count}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--foreground)' }}>Headers (H1)</span>
                    </div>
                    <div className="text-xl font-black" style={{ color: 'var(--foreground)' }}>{scrapeData.h1?.length || 0}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Text Content Preview</span>
                  <div className="p-6 rounded-2xl bg-black/20 border border-white/5 font-mono text-[11px] leading-relaxed opacity-60 italic" style={{ color: 'var(--foreground)' }}>
                    {scrapeData.text_preview}
                  </div>
                </div>

                {scrapeData.h1?.length > 0 && (
                  <div className="space-y-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Detected H1 Headers</span>
                    <div className="space-y-2">
                      {scrapeData.h1.map((header: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <ChevronRight size={14} className="text-emerald-600" />
                          <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{header}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center glass-card border border-white/5 bg-white/5 rounded-[32px] p-20 text-center">
              <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mb-8 border border-white/10 opacity-10" style={{ color: 'var(--foreground)' }}>
                <Terminal size={48} />
              </div>
              <h3 className="text-xl font-black italic tracking-tight opacity-20 uppercase" style={{ color: 'var(--foreground)' }}>Engine Standby</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-10 mt-4 leading-relaxed max-w-xs" style={{ color: 'var(--foreground)' }}>
                Initialize Media Extraction or Web Scraping protocols to view output data.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.2);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </div>
  );
}
