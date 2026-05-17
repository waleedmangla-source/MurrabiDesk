"use client";
import { useState, useEffect } from "react";

export type DeviceLayout = {
  isMobile: boolean;   // < 768px
  isTablet: boolean;   // 768px – 1023px
  isDesktop: boolean;  // ≥ 1024px
  isNarrow: boolean;   // isMobile || isTablet (shows drawer)
};

const TABLET_BP = 768;
const DESKTOP_BP = 1024;

function getLayout(width: number): DeviceLayout {
  const isMobile = width < TABLET_BP;
  const isTablet = width >= TABLET_BP && width < DESKTOP_BP;
  const isDesktop = width >= DESKTOP_BP;
  return { isMobile, isTablet, isDesktop, isNarrow: isMobile || isTablet };
}

export function useDeviceLayout(): DeviceLayout {
  const [layout, setLayout] = useState<DeviceLayout>(() => {
    if (typeof window === "undefined")
      return { isMobile: false, isTablet: false, isDesktop: true, isNarrow: false };
    return getLayout(window.innerWidth);
  });

  useEffect(() => {
    const onResize = () => setLayout(getLayout(window.innerWidth));
    window.addEventListener("resize", onResize, { passive: true });
    // Run once immediately in case SSR guessed wrong
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return layout;
}
