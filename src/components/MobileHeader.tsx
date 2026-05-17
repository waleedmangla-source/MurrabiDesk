"use client";
import React from "react";
import { Menu, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/chat": "MurrabiAI",
  "/emails": "Mail",
  "/calendar": "Calendar",
  "/notes": "Notes",
  "/writer": "Writer",
  "/expenses": "Expenses",
  "/habits": "Routine",
  "/beta-tools": "Beta Tools",
  "/profile": "Command ID",
  "/settings": "HQ Protocol",
};

interface MobileHeaderProps {
  onMenuClick: () => void;
  userProfile: { name?: string; picture?: string | null } | null;
  isLightTheme?: boolean;
}

export default function MobileHeader({ onMenuClick, userProfile, isLightTheme }: MobileHeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Murrabi Desk";

  return (
    <header className="mobile-header lg:hidden shrink-0">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-[10px] glass border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 shrink-0"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Logo + Title */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <img
          src="/text-logo.png"
          alt="Murrabi Desk"
          className={clsx(
            "h-8 w-auto object-contain shrink-0",
            !isLightTheme && "invert mix-blend-multiply"
          )}
        />
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 truncate hidden sm:block">
          {title}
        </span>
      </div>

      {/* Profile avatar */}
      <Link
        href="/profile"
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 shrink-0 bg-black/40 flex items-center justify-center shadow-lg transition-all active:scale-95"
      >
        {userProfile?.picture ? (
          <img src={userProfile.picture} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User size={16} className="text-white/40" />
        )}
      </Link>
    </header>
  );
}
