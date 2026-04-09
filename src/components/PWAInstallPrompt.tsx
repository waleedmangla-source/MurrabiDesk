"use client";

import React, { useEffect, useState } from 'react';
import { Download, Monitor, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile for custom UI
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
      console.log('✨ [PWA] App is installable');
    };

    const triggerHandler = () => {
      if (deferredPrompt) {
        handleInstallClick();
      } else {
        console.log('✨ [PWA] Install prompt not available yet');
        // If not available, maybe it's already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
          alert("Murrabi Desk is already running in App Mode.");
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Support global sidebar trigger
    const triggerBtn = document.getElementById('pwa-install-trigger');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', triggerHandler);
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (triggerBtn) triggerBtn.removeEventListener('click', triggerHandler);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`✨ [PWA] User response to install prompt: ${outcome}`);

    // We used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="glass p-2 rounded-2xl flex items-center gap-2 border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
          <Download size={18} />
        </div>
        <div className="pr-4 pl-2">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">System Update</p>
          <h4 className="text-xs font-black text-white italic tracking-tight">SAVE AS DESKTOP APP</h4>
        </div>
        <button 
          onClick={handleInstallClick}
          className="bg-white text-black text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-white/90 transition-all active:scale-95"
        >
          Install
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 text-white/20 hover:text-white/40 transition-colors"
        >
           ✕
        </button>
      </div>
    </div>
  );
}
