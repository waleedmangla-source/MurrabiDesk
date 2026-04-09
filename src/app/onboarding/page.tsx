"use client";
import React, { useState } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Cloud, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  React.useEffect(() => {
    // 1. Check for manual auth
    const isAuth = localStorage.getItem('google_refresh_token_encrypted');
    if (isAuth) {
      router.push('/');
      return;
    }

    // 2. Check for OAuth Hand-off Code
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      handleOAuthExchange(code);
    } else {
      setIsVerifying(false);
    }
  }, [router]);

  const handleOAuthExchange = async (code: string) => {
    setIsConnecting(true);
    try {
      console.log('Onboarding: Genesis Hand-off Detected. Synchronizing...');
      const result = await window.electron.authExchangeCode(code);
      if (result.success && result.encryptedToken) {
        localStorage.setItem('google_refresh_token_encrypted', result.encryptedToken);
        router.push('/');
      } else {
        console.error('Genesis Failure:', result.error);
        setIsVerifying(false);
      }
    } catch (err) {
      console.error('Hand-off Error:', err);
      setIsVerifying(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // --- UI: Protocol Loading Layer ---
  if (isVerifying || isConnecting) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center gap-8 p-12">
        <div className="flex flex-col items-center gap-4 max-w-sm w-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-black text-2xl tracking-tighter text-white">Murrabi</span>
            <span className="font-black text-2xl tracking-tighter text-white/50">Desk</span>
          </div>
          
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">
            {isVerifying ? "Verifying Genesis Protocol" : "Synchronizing Mission Identity"}
          </p>
          
          {/* Red Loading Bar Container */}
          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-red-600 animate-loading-bar shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
          </div>
          
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest text-center mt-2">
            Secure Hand-off in Progress...
          </p>
        </div>

        <style jsx>{`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(-20%); }
            100% { transform: translateX(100%); }
          }
          .animate-loading-bar {
            animation: loading-bar 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
          }
        `}</style>
      </div>
    );
  }

  const handleConnect = () => {
    const CLIENT_ID = "834945075004-a5rh91gdl55tqcplv91uh8gs3lajaauu.apps.googleusercontent.com";
    const REDIRECT_URI = "http://localhost:3000/api/auth/google/callback";
    const SCOPES = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.profile",
      "openid"
    ].join(" ");

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: SCOPES,
      access_type: "offline",
      prompt: "consent"
    });

    const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = GOOGLE_AUTH_URL;
  };

  const handleApplyToken = async () => {
    if (!token) return;
    setIsConnecting(true);
    
    try {
      // 1. Encrypt and save token to localStorage
      let encrypted = token;
      if (window.electron) {
        encrypted = await window.electron.encryptString(token);
        await window.electron.syncInit(token);
      }
      
      localStorage.setItem('google_refresh_token_encrypted', encrypted);
      
      // 2. Redirect to Dashboard
      router.push("/");
    } catch (err) {
      console.error("Connection Failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent p-8">
      {/* Premium Glass Container */}
      <div className="w-full max-w-[900px] aspect-[16/10] glass rounded-[40px] border border-white/10 shadow-2xl flex overflow-hidden">
        
        {/* Left Side: Brand & Visuals */}
        <div className="w-1/2 h-full bg-red-600 p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-white/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-black/20 rounded-full blur-[100px]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-black text-2xl tracking-tighter text-white">Murrabi</span>
              <span className="font-black text-2xl tracking-tighter text-white/50">Desk</span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight mb-4 italic">
              Your Mission,<br/>Synchronized.
            </h1>
            <p className="text-white/60 text-sm font-bold max-w-[320px]">
              The premium administrative suite for the modern Murrabi.
            </p>
          </div>

          <div className="relative z-10 flex gap-4">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
               <ShieldCheck className="text-white mb-2" size={24} />
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">End-to-End</p>
               <p className="text-xs font-bold text-white">Secure Sync</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
               <Globe className="text-white mb-2" size={24} />
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Protocol 4.0</p>
               <p className="text-xs font-bold text-white">Global Edge</p>
            </div>
          </div>
        </div>

        {/* Right Side: Setup Flow */}
        <div className="w-1/2 h-full bg-black/40 backdrop-blur-3xl p-12 flex flex-col justify-center gap-8">
          <div>
            <h2 className="text-xl font-black text-white mb-2 italic">Initialize Genesis</h2>
            <p className="text-white/40 font-bold text-sm tracking-tight">Connect your mission account to begin.</p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Connect */}
            <div className="space-y-4">
              <button 
                onClick={handleConnect}
                className="w-full h-16 rounded-[20px] bg-white/10 border border-white/20 text-white font-black text-lg flex items-center justify-center gap-3 hover:bg-white/20 transition-all active:scale-[0.98] shadow-xl"
              >
                <Cloud size={24} className="text-white" />
                Connect Google Account
              </button>
              <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                Secure OAuth2 Authentication
              </p>
            </div>
          </div>

          <p className="text-white/20 text-[10px] font-bold text-center mt-4">
            BY CONTINUING, YOU AGREE TO THE PROTOCOL TERMS & CONDITIONS.
          </p>
        </div>
      </div>
    </div>
  );
}
