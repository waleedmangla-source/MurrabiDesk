"use client";
import React from "react";
import clsx from "clsx";

interface AIBlobIconProps {
  className?: string;
  size?: number;
  active?: boolean;
}

export default function AIBlobIcon({ className, size = 20, active = false }: AIBlobIconProps) {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center shrink-0 pointer-events-none select-none transition-transform duration-300 group-hover:scale-110",
        className
      )}
      style={{ width: size, height: size }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Subtle Ambient Back Glow when Active */}
        <div
          className={clsx(
            "absolute inset-0 rounded-full blur-[4px] transition-opacity duration-300",
            active ? "opacity-40 bg-[var(--accent-main)]" : "opacity-0 group-hover:opacity-20 bg-[var(--accent-main)]"
          )}
        />

        {/* Primary Morphing Blob Outline */}
        <div
          className={clsx(
            "w-full h-full border-[1.75px] transition-colors duration-300 animate-[morphCurvy_9s_ease-in-out_infinite_alternate]",
            active
              ? "border-[var(--accent-main)] shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              : "border-gray-400 group-hover:border-black"
          )}
          style={{
            borderRadius: "58% 42% 63% 37% / 48% 59% 41% 52%",
          }}
        />

        {/* Inner Secondary Morphing Outline */}
        <div
          className={clsx(
            "absolute inset-[2.5px] border-[1px] opacity-60 transition-colors duration-300 animate-[morphDistorted_12s_ease-in-out_infinite_alternate]",
            active
              ? "border-[var(--accent-main)]"
              : "border-gray-400/60 group-hover:border-black/60"
          )}
          style={{
            borderRadius: "32% 68% 28% 72% / 70% 30% 70% 30%",
          }}
        />
      </div>
    </div>
  );
}
