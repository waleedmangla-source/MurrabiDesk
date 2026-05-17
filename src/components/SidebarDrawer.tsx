"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Home,
  Sparkles,
  Mail,
  Calendar,
  FileText,
  PenTool,
  Receipt,
  Activity,
  Beaker,
  Settings,
  User,
  X,
  Info,
} from "lucide-react";

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

interface SidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  userProfile: { name?: string; email?: string; picture?: string | null } | null;
  isLightTheme?: boolean;
  accentColor?: string;
}

export default function SidebarDrawer({
  open,
  onClose,
  userProfile,
  isLightTheme,
  accentColor,
}: SidebarDrawerProps) {
  const pathname = usePathname();
  const isFlupTheme = accentColor === "flup";

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Keyboard escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="sidebar-drawer-backdrop lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={clsx(
          "sidebar-drawer-panel lg:hidden glass border-r border-white/10 flex flex-col gap-3 px-4 pb-4 pt-6",
          !open && "closed"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Ambient glow for dark theme */}
        {!isLightTheme && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] animate-[spin_20s_linear_infinite] mix-blend-screen bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15)_0%,transparent_50%)]" />
          </div>
        )}

        {/* Header row */}
        <div className="relative z-10 flex items-center justify-between mb-2">
          <img
            src="/text-logo.png"
            alt="Murrabi Desk"
            className={clsx(
              "h-[48px] w-auto object-contain",
              !isLightTheme && "invert mix-blend-multiply"
            )}
          />
          <button
            onClick={onClose}
            className="p-2 rounded-[10px] glass border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-1.5 relative z-10 mb-1">
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
            <div className="absolute left-0 mt-2 w-48 px-3 py-2 rounded-xl text-[8px] font-bold leading-relaxed text-white/90 bg-black/80 backdrop-blur-sm border border-white/10 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              This is a volunteer project created for productivity purposes only.
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-0.5 relative z-10 flex-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={clsx(
                "nav-link group transition-all duration-300 rounded-[14px] flex items-center gap-4 py-3.5 px-4 font-bold tracking-tight",
                pathname === link.href ? "active" : "text-gray-400"
              )}
            >
              <link.icon size={20} className="transition-all duration-300 shrink-0" />
              <span className="text-sm tracking-wide">{link.label}</span>
              {link.label === "MurrabiAI" && (
                <div className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Footer — Profile + Settings */}
        <div className="relative z-10 pt-4 border-t border-white/5 space-y-3 mt-auto">
          <div className="flex items-center gap-3 w-full">
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
                  <User size={18} className="text-white/40" />
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
      </div>
    </>
  );
}
