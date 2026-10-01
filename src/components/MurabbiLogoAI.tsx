"use client";
import React from "react";
import clsx from "clsx";

interface MurabbiLogoAIProps {
  className?: string;
  alt?: string;
}

export default function MurabbiLogoAI({
  className = "h-[130px] md:h-[180px] lg:h-[210px]",
  alt = "Murabbi Desk"
}: MurabbiLogoAIProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={clsx(
        "logo-ai-bubble-mask relative select-none pointer-events-none overflow-hidden",
        className
      )}
      style={{
        aspectRatio: "2610 / 1800",
        WebkitMaskImage: "url(/text-logo.png)",
        maskImage: "url(/text-logo.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    >
      {/* ── Murabbi AI Bubble Core Gradient (Exact Crimson & Royal Blue colors, Static) ── */}
      <div className="logo-bubble-core" />

      {/* ── Glass Specular Highlights (Static) ── */}
      <div className="logo-bubble-mid" />
      <div className="logo-bubble-sheen" />

      {/* ── Organic Micro-Noise Texture matching Murabbi AI Bubble ── */}
      <div className="blob-noise opacity-15 pointer-events-none" />
    </div>
  );
}
