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
      {/* ── Lighter Living Liquid Gradient with Flow Animation ── */}
      <div className="logo-bubble-core" />

      {/* ── Glass Specular Radiance Overlays ── */}
      <div className="logo-bubble-mid" />
      <div className="logo-bubble-sheen" />

      {/* ── Dynamic Shimmering Noise Grain ── */}
      <div className="logo-noise-animated" />
    </div>
  );
}
