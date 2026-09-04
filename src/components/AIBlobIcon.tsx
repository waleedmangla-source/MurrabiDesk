"use client";
import React from "react";
import clsx from "clsx";

interface AIBlobIconProps {
  className?: string;
  size?: number;
  active?: boolean;
}

export default function AIBlobIcon({ className, size = 22, active = false }: AIBlobIconProps) {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center shrink-0 pointer-events-none select-none transition-transform duration-300 group-hover:scale-110",
        className
      )}
      style={{ width: size, height: size, perspective: "600px" }}
    >
      <div
        className={clsx(
          "relative w-full h-full flex items-center justify-center transform-gpu transition-all duration-300",
          active && "scale-105"
        )}
      >
        {/* Glow Aura */}
        <div
          className="absolute inset-0 rounded-full blur-md opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: active
              ? "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(37, 99, 235, 0.3) 60%, transparent 80%)"
              : "radial-gradient(circle, rgba(220, 38, 38, 0.35) 0%, rgba(37, 99, 235, 0.25) 60%, transparent 80%)",
          }}
        />

        {/* Back Outline Ring */}
        <div
          className="absolute inset-0 rounded-[32%_68%_28%_72%/_70%_30%_70%_30%] border border-blue-400/50 blur-[1px] animate-[morphDistorted_10s_ease-in-out_infinite_alternate]"
        />

        {/* Core Animated Gradient Blob */}
        <div
          className="absolute inset-1 rounded-[58%_42%_63%_37%/_48%_59%_41%_52%] blur-[2px] opacity-90 animate-[morphCurvy_8s_ease-in-out_infinite_alternate,coreSlowRotate_16s_linear_infinite]"
          style={{
            background: active
              ? "conic-gradient(from 190deg at 50% 50%, #10b981, #2563eb, #059669, #3b82f6, #10b981)"
              : "conic-gradient(from 190deg at 50% 50%, #991b1b, #2563eb, #7f1d1d, #1d4ed8, #991b1b)",
          }}
        />

        {/* Translucent Frosted Front Glass Membrane */}
        <div
          className="relative w-full h-full rounded-[58%_42%_63%_37%/_48%_59%_41%_52%] bg-white/30 backdrop-blur-[4px] border border-white/70 shadow-[inset_0_0_6px_rgba(255,255,255,0.6)] animate-[morphCurvy_9s_ease-in-out_infinite_alternate]"
        />
      </div>
    </div>
  );
}
