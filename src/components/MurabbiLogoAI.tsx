"use client";
import React from "react";
import clsx from "clsx";

interface MurabbiLogoAIProps {
  className?: string;
  glowIntensity?: "subtle" | "medium" | "vibrant";
  alt?: string;
}

export default function MurabbiLogoAI({
  className = "h-[130px] md:h-[180px] lg:h-[210px]",
  glowIntensity = "medium",
  alt = "Murabbi Desk"
}: MurabbiLogoAIProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={clsx(
        "logo-ai-bubble-mask relative select-none pointer-events-none overflow-hidden transition-all duration-300",
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
      {/* ── Base Layer: Deep chromatic foundation for rich letterform contrast ── */}
      <div className="absolute inset-0 bg-[#090d16]" />

      {/* ── Murabbi AI Bubble Core Mesh (Living Iridescent Gradient) ── */}
      <div className="logo-bubble-core" />

      {/* ── Secondary Layer: Mid-glass translucency & depth ── */}
      <div className="logo-bubble-mid" />

      {/* ── Specular Glass Light Sweep ── */}
      <div className="logo-bubble-specular" />

      {/* ── Organic Micro-Noise Texture matching Murabbi AI Bubble ── */}
      <div className="blob-noise opacity-20 pointer-events-none" />
    </div>
  );
}
