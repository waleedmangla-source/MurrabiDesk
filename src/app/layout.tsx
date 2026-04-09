"use client";
import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import "../styles/globals.css";
import { 
  Home, 
  Sparkles, 
  Mail, 
  Calendar, 
  Receipt, 
  Settings,
  ChevronLeft,
  Menu,
  Globe,
  FileText,
  Plus,
  Save,
  CloudOff,
  Cloud,
  User,
  Beaker,
  Activity,
  Terminal,
  X,
  Minus,
  Maximize2,
  Download
} from "lucide-react";
import CommandPalette from "@/components/CommandPalette";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { liquid } from '@/lib/sync/bridge';

const ACCENT_COLORS: Record<string, { main: string, hover: string, glow: string, soft: string, rgb: string }> = {
  red: { main: '#ef4444', hover: '#dc2626', glow: 'rgba(239, 68, 68, 0.5)', soft: 'rgba(239, 68, 68, 0.1)', rgb: '239, 68, 68' },
  indigo: { main: '#6366f1', hover: '#4f46e5', glow: 'rgba(99, 102, 241, 0.5)', soft: 'rgba(99, 102, 241, 0.1)', rgb: '99, 102, 241' },
  emerald: { main: '#10b981', hover: '#059669', glow: 'rgba(16, 185, 129, 0.5)', soft: 'rgba(16, 185, 129, 0.1)', rgb: '16, 185, 129' },
  amber: { main: '#f59e0b', hover: '#d97706', glow: 'rgba(245, 158, 11, 0.5)', soft: 'rgba(245, 158, 11, 0.1)', rgb: '245, 158, 11' },
  violet: { main: '#8b5cf6', hover: '#7c3aed', glow: 'rgba(139, 92, 246, 0.5)', soft: 'rgba(139, 92, 246, 0.1)', rgb: '139, 92, 246' },
  // Creamy White — full light theme; accent vars overridden via data-theme CSS
  creamy: { main: '#44403c', hover: '#1c1917', glow: 'rgba(68, 64, 60, 0.25)', soft: 'rgba(68, 64, 60, 0.08)', rgb: '68, 64, 60' },
};

const inter = Inter({ subsets: ["latin"] });

import { GoogleSyncService } from '@/lib/google-sync-service';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accentColor, setAccentColor] = useState("red");
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Sparkles, label: "MurrabiAI", href: "/chat" },
    { icon: Mail, label: "Emails", href: "/emails" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: FileText, label: "Notes", href: "/notes" },
    { icon: Receipt, label: "Expenses", href: "/expenses" },
    { icon: Beaker, label: "Beta Tools", href: "/beta-tools" },
  ];

  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Detect Electron environment
    const isEnvElectron = navigator.userAgent.toLowerCase().indexOf('electron') > -1;
    setIsElectron(isEnvElectron);
    
    // Check Google Sync Status
    const syncStatus = localStorage.getItem('google_sync_status');
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // 3. Initialize Sync Engine if token exists
    const existingToken = localStorage.getItem('google_refresh_token_encrypted');
    const isGuest = localStorage.getItem('murrabi_guest_mode') === 'true';

    if (existingToken && !isGuest) {
      liquid.invoke('sync-init', { refreshToken: existingToken }).then(() => {
        // Fetch User Profile after init
        GoogleSyncService.getUserProfile().then(profile => {
          if (profile) setUserProfile(profile);
        });
      });
    } else if (isGuest) {
      setUserProfile({ name: 'Guest User', email: 'guest@murrabi.local', picture: null });
    }

    // Load Accent Preference
    const savedSettings = localStorage.getItem('murrabi_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.accentColor) setAccentColor(parsed.accentColor);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar CMD+D
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
      
      // Navigate to tabs CMD+1, 2, 3... 7
      if ((e.metaKey || e.ctrlKey) && /^[1-7]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (navLinks[index]) {
          router.push(navLinks[index].href);
        }
      }

      // Profile Shortcut CMD+P
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        router.push('/profile');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Global Sync Heartbeat (Protocol 4.0)
  useEffect(() => {
    const runSync = async () => {
      if (!navigator.onLine) return;
      const service = await GoogleSyncService.fromLocalStorage();
      if (service) {
        console.log('Heartbeat: Synchronizing Mission Data...');
        // These methods now handle their own caching internally
        await Promise.all([
          service.getCalendarEvents(),
          service.getEmails(),
          service.listNotes()
        ]);
      }
    };

    // Initial sync
    runSync();
    
    // Periodic sync every 5 minutes
    const interval = setInterval(runSync, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Auth Guard Protocol (Liquid Shield V2)
  useEffect(() => {
    if (!mounted) return;
    
    const isAuth = localStorage.getItem('google_refresh_token_encrypted');
    const isGuest = localStorage.getItem('murrabi_guest_mode') === 'true';
    const authenticated = isAuth || isGuest;

    if (!authenticated && pathname !== '/onboarding') {
      console.log('🛡 [AUTH] Unauthorized access detected. Shielding to Onboarding.');
      router.push('/onboarding');
    } else if (authenticated && pathname === '/onboarding') {
      console.log('🛡 [AUTH] Valid session identified. Entering Dashboard.');
      router.push('/');
    }
  }, [mounted, pathname, router]);

  if (!mounted) return (
    <html lang="en" className="dark">
      <body className={clsx(inter.className, "bg-transparent")}>
        {children}
      </body>
    </html>
  );

  const currentAccent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.red;
  const isCreamyTheme = accentColor === 'creamy';

  return (
    <html 
      lang="en" 
      className={isCreamyTheme ? '' : 'dark'}
      data-theme={isCreamyTheme ? 'creamy' : undefined}
      style={{
        '--accent-main': currentAccent.main,
        '--accent-hover': currentAccent.hover,
        '--accent-glow': currentAccent.glow,
        '--accent-soft': currentAccent.soft,
        '--accent-rgb': currentAccent.rgb,
      } as React.CSSProperties}>
      <head>
        <title>Murrabi Desk OS</title>
        <meta name="description" content="Premium Islamic Administrative Desktop Suite" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#8E1E2F" />
        <link rel="apple-touch-icon" href="/icons/icon.png" />
      </head>
      <body className={clsx(
        inter.className, 
        isElectron ? "bg-transparent is-electron" : "bg-black", 
        "transition-colors duration-500"
      )}>
        <div className="flex h-screen w-full bg-transparent overflow-hidden relative">
          <CommandPalette />

           {/* NATIVE DRAG AREA — allows window dragging from top bar */}
           <div className="fixed top-0 left-0 w-full h-[38px] z-[1001] pointer-events-none" style={{ WebkitAppRegion: 'drag' } as any} />
          
          {/* Sidebar */}
          <aside className={clsx(
            "h-full w-64 flex flex-col gap-3 glass border-r border-white/5 px-6 pb-6 pt-14 z-50 shrink-0 select-none transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden group/sidebar",
            isSidebarCollapsed ? "-ml-64" : "ml-0"
          )}>
            {/* Ambient Animated Sidebar Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
               <div className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15)_0%,transparent_50%)] animate-[spin_20s_linear_infinite] mix-blend-screen" />
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent animate-[pulse_4s_ease-in-out_infinite]" />
            </div>

            {/* Internal Toggle Button (Hide/Collapse) */}
            <button 
              onClick={() => setIsSidebarCollapsed(true)}
              className="absolute -right-3 top-6 p-2 rounded-[12px] glass border border-white/10 text-white/20 hover:text-red-500 hover:bg-red-600/10 transition-all no-drag opacity-0 group-hover/sidebar:opacity-100 z-50"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex flex-col items-center gap-2 text-center w-full pt-4 relative group z-10">
              <div className="flex items-center justify-center overflow-hidden">
                <span className="font-black text-3xl tracking-tighter leading-none" style={{ color: 'var(--foreground)' }}>Murrabi</span>
                <span className="font-black text-3xl tracking-tighter text-red-500 leading-none">Desk</span>
              </div>
              <p className="text-[9px] text-red-500/60 font-black uppercase tracking-[0.3em]">
                CREATED BY WALEED M.
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[9px] font-bold text-white/40">
                {isOnline ? (
                  <>
                    <Cloud size={14} className="text-green-500" />
                    Cloud Synchronized • Protocol 4.0
                  </>
                ) : (
                  <>
                    <CloudOff size={14} className="text-red-500" />
                    Offline Mode • Local Cache
                  </>
                )}
              </div>
            </div>

            <nav className="flex-grow space-y-2 relative z-10">
              {navLinks.map((link) => (
                <Link 
                   key={link.label} 
                   className={clsx(
                     "nav-link group transition-all duration-300 rounded-[14px] flex items-center gap-4 py-3.5 px-5 font-bold tracking-tight hover:bg-red-600/10 hover:shadow-2xl hover:shadow-red-900/20",
                    pathname === link.href && "active !text-white !shadow-2xl !shadow-red-900/40"
                  )}
                  href={link.href}
                >
                  <link.icon size={20} className="transition-all duration-300" />
                  <span className="text-sm tracking-wide flex-shrink-0">{link.label}</span>
                  {link.label === "MurrabiAI" && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  )}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-8 border-t border-white/5 space-y-4 relative z-10">
               <div className="flex items-center gap-3 w-full group/footer min-h-[44px]">
                  {/* Profile Section */}
                  <Link 
                    href="/profile"
                    className={clsx(
                      "flex-grow flex items-center gap-3 p-1.5 px-3 rounded-2xl border transition-all hover:bg-white/10",
                      pathname === '/profile' ? "bg-red-600/10 border-red-500/30" : "border-white/10 bg-white/5 shadow-sm"
                    )}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 shrink-0 bg-black/40 flex items-center justify-center shadow-lg">
                       {userProfile?.picture ? (
                         <img src={userProfile.picture} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <User size={18} className="text-v4-ink/40" />
                       )}
                    </div>
                    <div className="min-w-0 pr-2">
                       <h4 className="text-[11px] font-black text-v4-ink truncate leading-none mb-1">
                          {userProfile?.name || "Waleed Mangla"}
                       </h4>
                       <p className="text-[8px] font-black text-red-500/40 uppercase tracking-widest truncate">
                          HQ Protocol
                       </p>
                    </div>
                  </Link>

                  {/* Settings Icon on the Right (Minimalist/No Box) */}
                  <Link 
                    href="/settings"
                    className="p-2 text-v4-ink/30 hover:text-red-500 transition-all hover:scale-110 active:scale-95"
                  >
                    <Settings size={20} />
                  </Link>
               </div>
               
               {/* Installation Call to Action */}
               {!isElectron && (
                 <div className="mt-4 px-2">
                    <button 
                     id="pwa-install-trigger"
                     className="w-full flex items-center justify-center gap-3 bg-red-600/10 border border-red-500/20 rounded-xl py-4 text-[9px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-600/20 hover:text-red-400 transition-all no-drag shadow-lg shadow-red-900/10 group"
                    >
                      <Download size={12} className="group-hover:bounce" />
                      Initialize App Mode
                    </button>
                 </div>
               )}
            </div>
          </aside>

          {/* Integration of PWA Prompt Component */}
          {!isElectron && <PWAInstallPrompt />}

          <main className={clsx(
            "flex-1 h-full overflow-y-auto custom-scrollbar transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative flex flex-col",
            isSidebarCollapsed ? "pl-0" : "pl-0" // Flexible for future padding logic
          )}>
             {/* MISSION LIP (Vertical Sidebar Handle) */}
             {isSidebarCollapsed && (
               <button 
                 onClick={() => setIsSidebarCollapsed(false)}
                 className="fixed top-1/2 -translate-y-1/2 left-0 z-[100] w-1.5 h-32 bg-red-600 rounded-r-[6px] hover:w-2.5 transition-all duration-300 shadow-[2px_0_15px_rgba(239,68,68,0.4)] group/lip flex items-center justify-center cursor-pointer animate-in fade-in slide-in-from-left-2"
                 title="Open Sidebar (Cmd+D)"
               >
                 <div className="w-0.5 h-12 bg-white/20 rounded-full opacity-0 group-hover/lip:opacity-100 transition-opacity" />
               </button>
             )}
             {children}
          </main>
        </div>
      </body>
    </html>
  );
}
