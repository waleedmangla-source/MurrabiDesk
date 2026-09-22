"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { Shield, Loader2, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (code) {
      setIsProcessing(true);
      fetch('/api/auth/google/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          redirectUri: `${window.location.origin}/api/auth/google/callback` 
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('google_refresh_token_encrypted', data.token);
          localStorage.removeItem('murabbi_guest_mode');
          if (data.rootFolderId) {
            localStorage.setItem('murabbi_drive_root_id', data.rootFolderId);
          }
          
          // Ensure Murabbi Desk Drive folder is created and initialized
          fetch('/api/brain/init-drive', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-murabbi-token': data.token 
            }
          })
          .then(res => res.json())
          .then(driveData => {
            if (driveData.rootId) {
              localStorage.setItem('murabbi_drive_root_id', driveData.rootId);
            }
            window.location.href = '/';
          })
          .catch(() => {
            // Proceed to dashboard even if network hiccup
            window.location.href = '/';
          });
        } else {
          setError(data.error || 'Failed to authenticate');
          setIsProcessing(false);
        }
      })
      .catch(err => {
        setError(err.message);
        setIsProcessing(false);
      });
    }
  }, [code]);

  const handleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleGuest = () => {
    localStorage.setItem('murabbi_guest_mode', 'true');
    window.location.href = '/';
  };

  return (
    <div className="h-screen w-full bg-[#020310] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top right quick-access button */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href="/research"
          className="flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80 hover:text-white transition-all shadow-sm group"
        >
          <Search size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Research Portal →</span>
        </Link>
      </div>

      <div className="glass max-w-md w-full rounded-[32px] p-8 relative z-10 border border-white/10 shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Shield className="text-white" size={32} />
          </div>
        </div>

        <h1 className="text-3xl font-black text-white text-center tracking-tight mb-2 uppercase">
          Murabbi Desk
        </h1>
        <p className="text-white/50 text-center text-sm mb-10 font-medium">
          Premium Islamic Administrative Suite
        </p>

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="animate-spin text-red-500 mb-4" size={32} />
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Securing Credentials...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs text-center font-bold">
                {error}
              </div>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full bg-white text-black hover:bg-white/90 transition-colors h-14 rounded-xl font-bold tracking-wide flex items-center justify-center gap-3"
            >
              Sign in with Google
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-white/30 text-[10px] font-black uppercase tracking-widest">Or continue as</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              onClick={handleGuest}
              className="w-full bg-white/5 text-white hover:bg-white/10 transition-colors h-14 rounded-xl font-bold tracking-wide border border-white/10"
            >
              Guest Mode (Local Only)
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-emerald-400/70 text-[10px] font-black uppercase tracking-widest">Public Access</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <Link
              href="/research"
              className="w-full bg-gradient-to-r from-emerald-500/15 via-emerald-600/20 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 text-emerald-300 border border-emerald-500/30 transition-all h-14 rounded-xl font-bold tracking-wide flex items-center justify-center gap-3 group active:scale-[0.99] shadow-lg shadow-emerald-500/10"
            >
              <Search size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Murabbi Research (Public Portal)</span>
            </Link>
          </div>
        )}

        <p className="text-center text-[9px] text-white/30 mt-8 font-black tracking-[0.2em] uppercase">
          Security Protocol Enabled
        </p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#020310] flex items-center justify-center"><Loader2 className="animate-spin text-red-500" /></div>}>
      <OnboardingContent />
    </Suspense>
  );
}
