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
      setError("Failed to initialize download protocol.");
      setDownloading(false);
    }
  };

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      {/* Header Section */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Beta <span className="text-red-600">Protocols</span></h1>
          <p className="text-white/30 max-w-xl mt-2 font-black uppercase tracking-[0.3em] text-[10px]">
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
                <h3 className="text-lg font-black text-white italic tracking-tight">Media Extraction</h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none mt-1">yt-dlp Implementation 2.0</p>
              </div>
            </div>

            <form onSubmit={fetchVideoInfo} className="space-y-6">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Paste YouTube Link Here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/10 focus:outline-none focus:border-red-600/50 transition-all font-bold"
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
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20 pb-2 border-b border-white/5">
                <span>Active Modules</span>
                <span>Security Protocol</span>
              </div>
              
              <div className="space-y-3">
                <div className="p-5 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-4 group cursor-pointer hover:border-red-600/50 transition-all">
                   <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                     <Activity size={18} />
                   </div>
                   <div>
                      <div className="text-[11px] font-black text-white italic">Neural Link Diagnostics</div>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Protocol 4.0 Verified</p>
                   </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 opacity-50 cursor-not-allowed">
                   <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/40">
                     <Terminal size={18} />
                   </div>
                   <div>
                      <div className="text-[11px] font-black text-white/40 italic">System Kernel Access</div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Access Restricted</p>
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
                       className="group relative flex flex-col items-center gap-4 p-8 rounded-[24px] bg-white text-black hover:bg-red-600 hover:text-white transition-all duration-500 overflow-hidden"
                     >
                        <Video size={32} />
                        <div className="flex flex-col items-center">
                           <span className="text-xs font-black uppercase tracking-widest">Download Video</span>
                           <span className="text-[9px] font-bold opacity-40 group-hover:opacity-60 transition-opacity">MP4 Format • 1080p Target</span>
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
                       className="group relative flex flex-col items-center gap-4 p-8 rounded-[24px] bg-white/5 border border-white/10 text-white hover:border-red-600/50 hover:bg-red-600/10 transition-all duration-500"
                     >
                        <Music size={32} className="text-red-600" />
                        <div className="flex flex-col items-center">
                           <span className="text-xs font-black uppercase tracking-widest">Extract Audio</span>
                           <span className="text-[9px] font-bold text-white/30 group-hover:text-white/60 transition-colors">MP3 Format • 320kbps</span>
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
                          <div className="text-sm font-black italic tracking-tight">Mission Success</div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Protocol has successfully queued your file for extraction & local storage.</p>
                       </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                           <img src={videoInfo.uploader_url ? `https://ui-avatars.com/api/?name=${videoInfo.uploader}&background=random` : ""} alt={videoInfo.uploader} />
                        </div>
                        <span className="text-[11px] font-black text-white italic">{videoInfo.uploader}</span>
                     </div>
                     <a 
                       href={url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-600 transition-colors"
                     >
                        Source Link <ExternalLink size={12} />
                     </a>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center glass-card border border-white/5 bg-white/5 rounded-[32px] p-20 text-center">
               <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center mb-8 border border-white/10 text-white/10">
                  <Youtube size={48} />
               </div>
               <h3 className="text-xl font-black text-white italic tracking-tight opacity-20">Awaiting Target URL...</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 mt-4 leading-relaxed max-w-xs">
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
