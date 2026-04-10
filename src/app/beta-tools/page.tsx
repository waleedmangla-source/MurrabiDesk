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
  Terminal
} from "lucide-react";
import { clsx } from "clsx";

export default function BetaToolsPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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
      // Direct window location change to trigger browser download
      window.location.href = `/api/yt-dlp?url=${encodeURIComponent(url)}&type=${format}`;
      
      // Since it's an attachment, the page won't change, we just need to wait a bit
      setTimeout(() => {
        setDownloading(false);
        setDownloadSuccess(true);
      }, 3000);
    } catch (err) {
      setError("Failed to initialize download sequence.");
      setDownloading(false);
    }
  };

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      {/* Header Section */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase" style={{ color: 'var(--foreground)' }}>Beta <span className="text-red-600">Lab</span></h1>
          <p className="opacity-30 max-w-xl mt-2 font-black uppercase tracking-[0.3em] text-[10px]" style={{ color: 'var(--foreground)' }}>
             Experimental Infrastructure & Extraction Modules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 no-drag overflow-y-auto pr-4 custom-scrollbar">
        {/* URL Input Area */}
        <div className="col-span-12 xl:col-span-5">
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
                  className="absolute right-2 top-2 bottom-2 px-6 bg-red-600 hover:bg-red-700 disabled:bg-white/5 disabled:text-white/20 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
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

            <div className="mt-12 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-20 pb-2 border-b border-white/5" style={{ color: 'var(--foreground)' }}>
                  <span>Active Modules</span>
                  <span>Security Shield</span>
                </div>
              
              <div className="space-y-3">
                <div className="p-5 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-4 group cursor-pointer hover:border-red-600/50 transition-all">
                   <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                     <Activity size={18} />
                   </div>
                   <div>
                      <div className="text-[11px] font-black italic" style={{ color: 'var(--foreground)' }}>Neural Link Diagnostics</div>
                      <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>v4.0 Sync System</p>
                   </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 opacity-50 cursor-not-allowed">
                   <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center opacity-40" style={{ color: 'var(--foreground)' }}>
                     <Terminal size={18} />
                   </div>
                   <div>
                      <div className="text-[11px] font-black opacity-40 italic" style={{ color: 'var(--foreground)' }}>System Kernel Access</div>
                      <p className="text-[9px] font-bold opacity-20 uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>Access Restricted</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Preview & Actions */}
        <div className="col-span-12 xl:col-span-7">
          {videoInfo ? (
            <div className="glass-card p-0 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] animate-in fade-in slide-in-from-right-8 duration-700">
               {/* Thumbnail Header */}
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

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                           <img src={videoInfo.uploader_url ? `https://ui-avatars.com/api/?name=${videoInfo.uploader}&background=random` : ""} alt={videoInfo.uploader} />
                        </div>
                        <span className="text-[11px] font-black uppercase" style={{ color: 'var(--foreground)' }}>{videoInfo.uploader}</span>
                     </div>
                     <a 
                       href={url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-20 hover:text-red-600 transition-colors"
                       style={{ color: 'var(--foreground)' }}
                     >
                        Source Link <ExternalLink size={12} />
                     </a>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center glass-card border border-white/5 bg-white/5 rounded-[32px] p-20 text-center">
               <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mb-8 border border-white/10 opacity-10" style={{ color: 'var(--foreground)' }}>
                  <Youtube size={48} />
               </div>
               <h3 className="text-xl font-black italic tracking-tight opacity-20 uppercase" style={{ color: 'var(--foreground)' }}>Awaiting Target URL...</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-10 mt-4 leading-relaxed max-w-xs" style={{ color: 'var(--foreground)' }}>
                  Enter a valid YouTube protocol link to initialize the extraction engine.
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
