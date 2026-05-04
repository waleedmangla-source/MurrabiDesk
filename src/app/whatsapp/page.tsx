"use client";

import { useEffect, useState } from "react";

import { MessageCircle, ExternalLink, Globe } from "lucide-react";

export default function WhatsAppPage() {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(" electron/") > -1) {
      setIsElectron(true);
    }
  }, []);

  const openWhatsAppPopup = () => {
    const width = 1100;
    const height = 850;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      "https://web.whatsapp.com",
      "WhatsApp",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no,location=no`
    );
  };

  if (!isElectron) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="glass border border-white/10 rounded-[32px] p-12 shadow-2xl max-w-2xl bg-[#0a0b1e]/40 backdrop-blur-3xl relative overflow-hidden group">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-colors duration-700" />
          
          <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/30 relative z-10">
            <MessageCircle className="w-10 h-10 text-emerald-400" />
          </div>

          <h1 className="text-3xl font-black text-white mb-4 tracking-tight relative z-10">WhatsApp Connector</h1>
          <p className="text-white/60 text-lg mb-8 leading-relaxed relative z-10">
            To maintain security standards, WhatsApp Web must open in a separate verified window when using the web version of Murrabi Desk.
          </p>
          
          <div className="flex flex-col gap-4 relative z-10">
            <button 
              onClick={openWhatsAppPopup}
              className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 group/btn"
            >
              <ExternalLink className="w-5 h-5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              Launch WhatsApp Session
            </button>
            
            <div className="flex items-center justify-center gap-2 text-white/30 text-xs font-black uppercase tracking-[0.3em] mt-4">
              <Globe size={12} className="text-emerald-500/50" />
              Standard Web Protocol
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-40px)] w-full flex flex-col relative bg-black/40 overflow-hidden border-l border-white/5">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />
      
      {/* WhatsApp Webview */}
      <webview
        className="flex-1 w-full h-full"
        src="https://web.whatsapp.com"
        partition="persist:whatsapp"
        useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        style={{ height: '100%', width: '100%', backgroundColor: 'transparent' }}
      />

      {/* Status Bar */}
      <div className="absolute bottom-6 right-6 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="glass border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black text-white/40 uppercase tracking-[0.3em] shadow-2xl flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Secure Protocol Active
        </div>
      </div>
    </div>
  );
}

// Add TypeScript support for webview
declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: any;
    }
  }
}
