"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  Sparkles,
  Mail,
  Calendar,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Beaker,
  Activity,
  PenTool,
  Info,
} from "lucide-react";
import CommandPalette from "@/components/CommandPalette";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { liquid } from "@/lib/sync/bridge";
import MobileHeader from "@/components/MobileHeader";
import SidebarDrawer from "@/components/SidebarDrawer";
import { GoogleSyncService } from "@/lib/google-sync-service";

const ACCENT_COLORS: Record<
  string,
  { main: string; hover: string; glow: string; soft: string; rgb: string }
> = {
  creamy: {
    main: "#44403c",
    hover: "#1c1917",
    glow: "rgba(68, 64, 60, 0.25)",
    soft: "rgba(68, 64, 60, 0.08)",
    rgb: "68, 64, 60",
  },
  flup: {
    main: "#10b981",
    hover: "#059669",
    glow: "rgba(16, 185, 129, 0.25)",
    soft: "rgba(16, 185, 129, 0.1)",
    rgb: "16, 185, 129",
  },
  "flup-blue": {
    main: "#2563eb",
    hover: "#1d4ed8",
    glow: "rgba(37, 99, 235, 0.25)",
    soft: "rgba(37, 99, 235, 0.1)",
    rgb: "37, 99, 235",
  },
};

const navLinks = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Sparkles, label: "MurrabiAI", href: "/chat" },
  { icon: Mail, label: "Mail", href: "/emails" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: FileText, label: "Notes", href: "/notes" },
  { icon: PenTool, label: "Writer", href: "/writer" },
  { icon: Receipt, label: "Expenses", href: "/expenses" },
  { icon: Activity, label: "Routine", href: "/habits" },
  { icon: Beaker, label: "Beta Tools", href: "/beta-tools" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accentColor, setAccentColor] = useState("flup");
  const pathname = usePathname();
  const router = useRouter();

  // ── Mount + init ──────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    window.addEventListener("online", () => {});
    window.addEventListener("offline", () => {});

    const existingToken = localStorage.getItem("google_refresh_token_encrypted");
    const isGuest = localStorage.getItem("murrabi_guest_mode") === "true";

    if (existingToken && !isGuest) {
      liquid.invoke("sync-init", { refreshToken: existingToken }).then(() => {
        GoogleSyncService.getUserProfile().then((profile) => {
          if (profile) setUserProfile(profile);
        });
      });
    } else if (isGuest) {
      setUserProfile({ name: "Guest User", email: "guest@murrabi.local", picture: null });
    }

    const savedSettings = localStorage.getItem("murrabi_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.accentColor) setAccentColor(parsed.accentColor);
      } catch {}
    }

    if (window.innerWidth < 1024) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  // Apply accent CSS vars to <html> whenever accentColor changes
  useEffect(() => {
    if (!mounted) return;
    const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.flup;
    const root = document.documentElement;
    root.style.setProperty("--accent-main", accent.main);
    root.style.setProperty("--accent-hover", accent.hover);
    root.style.setProperty("--accent-glow", accent.glow);
    root.style.setProperty("--accent-soft", accent.soft);
    root.style.setProperty("--accent-rgb", accent.rgb);

    const isLight = ["creamy", "flup", "flup-blue"].includes(accentColor);
    const isCreamyTheme = accentColor === "creamy";
    const isFlupTheme = accentColor === "flup";
    const isFlupBlueTheme = accentColor === "flup-blue";

    root.className = isLight ? "" : "dark";
    root.removeAttribute("data-theme");
    if (isCreamyTheme) root.setAttribute("data-theme", "creamy");
    else if (isFlupTheme) root.setAttribute("data-theme", "flup");
    else if (isFlupBlueTheme) root.setAttribute("data-theme", "flup-blue");
  }, [accentColor, mounted]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && /^[1-8]$/.test(e.key)) {
        e.preventDefault();
        const link = navLinks[parseInt(e.key) - 1];
        if (link) router.push(link.href);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        router.push("/profile");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // ── Sync heartbeat ────────────────────────────────────────────────────────
  useEffect(() => {
    const runSync = async () => {
      if (!navigator.onLine) return;
      const service = await GoogleSyncService.fromLocalStorage();
      if (service) {
        await Promise.all([
          service.getCalendarEvents(),
          service.getEmails(),
          service.listNotes(),
        ]);
      }
    };
    runSync();
    const interval = setInterval(runSync, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const isAuth = localStorage.getItem("google_refresh_token_encrypted");
    const isGuest = localStorage.getItem("murrabi_guest_mode") === "true";
    const authenticated = isAuth || isGuest;
    if (!authenticated && pathname !== "/onboarding") {
      router.push("/onboarding");
    } else if (authenticated && pathname === "/onboarding") {
      router.push("/");
    }
  }, [mounted, pathname, router]);

  // ── Derived theme values ──────────────────────────────────────────────────
  const isFlupTheme = accentColor === "flup";
  const isLightTheme = ["creamy", "flup", "flup-blue"].includes(accentColor);

  // ── Before mount: render children inside a dark shell (no sidebar flash) ──
  if (!mounted) {
    return (
      <div className="flex h-dvh w-full bg-[#020310]">
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Mobile drawer */}
      <SidebarDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userProfile={userProfile}
        isLightTheme={isLightTheme}
        accentColor={accentColor}
      />

      <div className="flex h-full lg:h-screen w-full bg-transparent lg:overflow-hidden relative flex-col lg:flex-row">
        <CommandPalette />

        {/* Desktop sidebar */}
        <aside
          className={clsx(
            "hidden lg:flex h-full w-60 flex-col gap-3 glass border-r border-white/5 px-4 pb-4 pt-10 z-50 shrink-0 select-none transition-all duration-[600ms] ease-[cubic-bezier(0.2,1,0.4,1)] relative overflow-hidden group/sidebar",
            isSidebarCollapsed ? "-ml-60 opacity-0 pointer-events-none" : "ml-0 opacity-100"
          )}
        >
          {/* Ambient background */}
          {!isLightTheme && (
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] animate-[spin_20s_linear_infinite] mix-blend-screen bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15)_0%,transparent_50%)]" />
              <div className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-red-500/5 to-transparent" />
            </div>
          )}

          {/* Collapse button */}
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="absolute -right-3 top-6 p-2 rounded-[12px] glass border border-white/10 text-white/20 transition-all no-drag opacity-0 group-hover/sidebar:opacity-100 z-50"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Logo */}
          <div className="flex flex-col items-center gap-2 text-center w-full pt-0 relative group z-10">
            <div className="flex items-center justify-center overflow-hidden">
              <img
                src="/text-logo.png"
                alt="Murrabi Desk"
                className="h-[62px] w-auto object-contain transition-all duration-300 invert mix-blend-multiply"
              />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <p className={clsx(
                "text-[9px] font-black uppercase tracking-[0.3em]",
                isFlupTheme ? "text-[#10b981]/60" : "text-red-500/60"
              )}>
                CREATED BY WALEED M.
              </p>
              <div className="relative group/tooltip">
                <Info
                  size={10}
                  className={clsx(
                    "cursor-pointer transition-opacity hover:opacity-100 opacity-50",
                    isFlupTheme ? "text-[#10b981]" : "text-red-500"
                  )}
                />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 px-3 py-2 rounded-xl text-[8px] font-bold leading-relaxed text-white/90 bg-black/80 backdrop-blur-sm border border-white/10 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-center">
                  This is a volunteer project created for productivity purposes only.
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-black/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="sidebar-radio-container relative z-10 flex flex-col gap-0">
            <div className="sidebar-glider-container">
              <div
                className="sidebar-glider"
                style={{
                  height: `calc(100% / ${navLinks.length})`,
                  transform: `translateY(${Math.max(0, navLinks.findIndex((l) => pathname === l.href)) * 100}%)`,
                  opacity: navLinks.some((l) => pathname === l.href) ? 1 : 0,
                }}
              />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                className={clsx(
                  "nav-link group transition-all duration-300 rounded-[14px] flex items-center gap-4 py-4 px-5 font-bold tracking-tight z-10",
                  pathname === link.href ? "active" : "text-gray-400"
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

          {/* Footer */}
          <div className="mt-auto pt-8 border-t border-white/5 space-y-4 relative z-10">
            <div className="flex items-center gap-3 w-full group/footer min-h-[44px]">
              <Link
                href="/profile"
                className={clsx(
                  "flex-grow flex items-center gap-3 p-1.5 px-3 rounded-2xl border transition-all",
                  pathname === "/profile"
                    ? "bg-red-600/10 border-red-500/30"
                    : "border-white/10 bg-white/5 shadow-sm"
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
              <Link href="/settings" className="p-2 text-v4-ink/30 transition-all active:scale-95">
                <Settings size={20} />
              </Link>
            </div>
          </div>
        </aside>

        <PWAInstallPrompt />

        <main className="flex-1 lg:overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative flex flex-col">
          {/* Desktop sidebar re-open handle */}
          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="hidden lg:flex fixed left-4 top-6 p-2 rounded-[12px] glass border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all z-[100] animate-in fade-in slide-in-from-left-4"
              title="Open Sidebar (Cmd+D)"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Mobile header */}
          <MobileHeader
            onMenuClick={() => setIsDrawerOpen(true)}
            userProfile={userProfile}
            isLightTheme={isLightTheme}
          />

          {children}
        </main>
      </div>
    </>
  );
}
