"use client";
import React, { useEffect, useRef, useState } from "react";

interface ScreensaverModalProps {
  active: boolean;
  onExit: () => void;
}

export default function ScreensaverModal({ active, onExit }: ScreensaverModalProps) {
  const [mounted, setMounted] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const activatedTime = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!active) {
      startPos.current = null;
      return;
    }

    activatedTime.current = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      // Small grace period (250ms) to avoid triggering immediately on the double-click release
      if (Date.now() - activatedTime.current < 250) return;

      if (!startPos.current) {
        startPos.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);

      // Mouse wiggle threshold (greater than 12px movement in any direction)
      if (dx > 12 || dy > 12) {
        onExit();
      }
    };

    const handleClick = () => {
      if (Date.now() - activatedTime.current > 150) {
        onExit();
      }
    };

    const handleKeyDown = () => {
      onExit();
    };

    const handleTouch = () => {
      if (Date.now() - activatedTime.current > 150) {
        onExit();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("touchstart", handleTouch);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, onExit]);

  if (!mounted || !active) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-[#020308]/95 backdrop-blur-xl flex flex-col items-center justify-center select-none cursor-none overflow-hidden animate-in fade-in duration-500"
      aria-label="Murabbi Desk Screensaver"
      role="dialog"
      aria-modal="true"
    >
      {/* Pulsing theme ambient background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Deep pulsing radial glow */}
        <div
          className="w-[500px] h-[500px] rounded-full blur-[90px] animate-pulse opacity-70 transition-all duration-1000"
          style={{
            background: "radial-gradient(circle, var(--accent-main, #10b981) 0%, rgba(var(--accent-rgb, 16, 185, 129), 0.25) 50%, transparent 80%)",
            animationDuration: "3.5s",
          }}
        />

        {/* Secondary rotating accent halo */}
        <div
          className="absolute w-[700px] h-[700px] rounded-full blur-[140px] opacity-35 animate-[spin_30s_linear_infinite]"
          style={{
            background: "conic-gradient(from 0deg, var(--accent-main, #10b981), #06b6d4, var(--accent-main, #10b981))",
          }}
        />
      </div>

      {/* Center content container */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <div className="relative group">
          {/* Soft logo backdrop ring */}
          <div
            className="absolute -inset-6 rounded-3xl blur-xl opacity-40 animate-pulse"
            style={{
              backgroundColor: "var(--accent-main, #10b981)",
              animationDuration: "2.5s",
            }}
          />

          <img
            src="/text-logo.png"
            alt="Murabbi Desk"
            className="relative h-20 md:h-28 w-auto object-contain drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)] filter brightness-110"
          />
        </div>

        {/* Subtitle / Status indicator */}
        <div className="space-y-1.5 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: "var(--accent-main, #10b981)" }}
            />
            <span
              className="text-[11px] font-black tracking-[0.35em] uppercase"
              style={{ color: "var(--accent-main, #10b981)" }}
            >
              Murabbi Desk OS
            </span>
          </div>

          <p className="text-[10px] text-white/40 uppercase tracking-[0.25em] font-mono">
            Wiggle mouse or click to resume
          </p>
        </div>
      </div>
    </div>
  );
}
