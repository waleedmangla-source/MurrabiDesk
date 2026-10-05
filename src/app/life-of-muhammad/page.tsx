"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { clsx } from "clsx";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Bookmark, 
  Calendar,
  Play,
  ExternalLink,
  Tv
} from "lucide-react";
import { 
  TIMELINE_EVENTS, 
  TimelineEvent, 
  TimelineEra, 
  ERA_CONFIGS, 
  getEventEra 
} from "@/data/timelineData";

export default function LifeOfMuhammadTimeline() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Filter events based on category and search query (all volumes always displayed)
  const filteredEvents = useMemo(() => {
    return TIMELINE_EVENTS.filter((ev) => {
      if (activeCategory !== 'all' && ev.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesDesc = ev.desc.toLowerCase().includes(q);
        const matchesYear = ev.year.toLowerCase().includes(q);
        const matchesTags = ev.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesYear && !matchesTags) return false;
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const [activeIndex, setActiveIndex] = useState(0);

  // Reset active index if out of bounds upon filter change
  useEffect(() => {
    if (activeIndex >= filteredEvents.length) {
      setActiveIndex(Math.max(0, filteredEvents.length - 1));
    }
  }, [filteredEvents.length, activeIndex]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [bulgeScale, setBulgeScale] = useState(0);
  const [bulgeSkew, setBulgeSkew] = useState(0); // Dynamic directional pull offset (px)
  const velocityRef = useRef<number>(0);
  const currentPosRef = useRef<number | null>(null);
  const targetPosRef = useRef<number | null>(null);
  const loopRef = useRef<number | null>(null);
  const collapseAnimRef = useRef<number | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      if (collapseAnimRef.current) cancelAnimationFrame(collapseAnimRef.current);
    };
  }, []);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        setActiveIndex(prev => Math.min(filteredEvents.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        e.preventDefault();
        setActiveIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredEvents.length]);

  // Continuous animation loop that bounds scrub speed
  const startTrackingLoop = () => {
    if (loopRef.current) return;

    let lastLoopTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.max(1, now - lastLoopTime);
      lastLoopTime = now;

      if (targetPosRef.current !== null) {
        if (currentPosRef.current === null) {
          currentPosRef.current = targetPosRef.current;
        }

        const dx = targetPosRef.current - currentPosRef.current;
        
        // Speed cap: Maximum allowed speed is ~1.2 px/ms, preventing jarring skips
        const maxStep = 1.2 * dt; 
        let step = dx * 0.18; // Smooth natural follow

        if (Math.abs(step) > maxStep) {
          step = Math.sign(step) * maxStep;
        }

        // Directional skew pull
        const v = step / dt; // px/ms
        velocityRef.current = v;
        const targetSkew = Math.max(-25, Math.min(25, v * 22));

        currentPosRef.current += step;
        const curX = currentPosRef.current;

        setBulgeScale(1);
        setHoverX(curX);
        setBulgeSkew(prev => prev + (targetSkew - prev) * 0.20);

        // Update active index based on the speed-limited position
        if (containerWidth > 0 && filteredEvents.length > 0) {
          const marginLeft = 60;
          const marginRight = 80;
          const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
          let newIndex = Math.round(((curX - marginLeft) / eventTrackWidth) * (filteredEvents.length - 1));
          if (newIndex < 0) newIndex = 0;
          if (newIndex >= filteredEvents.length) newIndex = filteredEvents.length - 1;
          setActiveIndex(newIndex);
        }

        loopRef.current = requestAnimationFrame(loop);
      } else {
        loopRef.current = null;
      }
    };

    loopRef.current = requestAnimationFrame(loop);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    let x = clientX - rect.left;
    const currentWidth = containerWidth;
    
    if (x < 0) x = 0;
    if (x > currentWidth) x = currentWidth;

    targetPosRef.current = x;

    if (collapseAnimRef.current) {
      cancelAnimationFrame(collapseAnimRef.current);
      collapseAnimRef.current = null;
    }

    startTrackingLoop();
  };

  const handleMouseLeave = () => {
    targetPosRef.current = null;
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
    }
    if (collapseAnimRef.current) {
      cancelAnimationFrame(collapseAnimRef.current);
    }

    const duration = 380;
    const startTime = performance.now();
    const startScale = bulgeScale > 0 ? bulgeScale : 1;
    const startSkew = bulgeSkew;

    const animateCollapse = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const currentScale = startScale * Math.pow(1 - progress, 3.5);
      const currentSkew = startSkew * Math.pow(1 - progress, 3.5);

      if (progress < 1) {
        setBulgeScale(currentScale);
        setBulgeSkew(currentSkew);
        collapseAnimRef.current = requestAnimationFrame(animateCollapse);
      } else {
        setBulgeScale(0);
        setBulgeSkew(0);
        setHoverX(null);
        currentPosRef.current = null;
        collapseAnimRef.current = null;
      }
    };

    collapseAnimRef.current = requestAnimationFrame(animateCollapse);
  };

  // SVG Bulge parameters
  const cy = 110;
  const baseThickness = 8;
  const r = 140;
  const maxH = 64;

  const getBulgeHalfHeight = (x: number) => {
    if (hoverX === null || bulgeScale === 0) return baseThickness;
    const apexX = hoverX + bulgeSkew;
    const dist = Math.abs(x - apexX);
    if (dist >= r) return baseThickness;
    const factor = 0.5 * (1 + Math.cos((dist / r) * Math.PI));
    return baseThickness + maxH * bulgeScale * factor;
  };

  const getTimelinePath = () => {
    let path = "";
    if (hoverX === null || containerWidth === 0 || bulgeScale === 0) {
      path = `M 0,${cy - baseThickness} L ${containerWidth},${cy - baseThickness} L ${containerWidth},${cy + baseThickness} L 0,${cy + baseThickness} Z`;
    } else {
      const hx = hoverX;
      const apexX = hx + bulgeSkew;
      const currentMaxH = maxH * bulgeScale;
      path += `M 0,${cy - baseThickness} `;
      path += `L ${Math.max(0, hx - r)},${cy - baseThickness} `;
      path += `C ${hx - r/2 + bulgeSkew * 0.4},${cy - baseThickness} ${apexX - r/2},${cy - baseThickness - currentMaxH} ${apexX},${cy - baseThickness - currentMaxH} `;
      path += `C ${apexX + r/2},${cy - baseThickness - currentMaxH} ${hx + r/2 + bulgeSkew * 0.4},${cy - baseThickness} ${Math.min(containerWidth, hx + r)},${cy - baseThickness} `;
      path += `L ${containerWidth},${cy - baseThickness} `;
      
      path += `L ${containerWidth},${cy + baseThickness} `;
      path += `L ${Math.min(containerWidth, hx + r)},${cy + baseThickness} `;
      path += `C ${hx + r/2 + bulgeSkew * 0.4},${cy + baseThickness} ${apexX + r/2},${cy + baseThickness + currentMaxH} ${apexX},${cy + baseThickness + currentMaxH} `;
      path += `C ${apexX - r/2},${cy + baseThickness + currentMaxH} ${hx - r/2 + bulgeSkew * 0.4},${cy + baseThickness} ${Math.max(0, hx - r)},${cy + baseThickness} `;
      path += `L 0,${cy + baseThickness} Z`;
    }
    return path;
  };

  const getBulgeOnlyPath = () => {
    if (hoverX === null || containerWidth === 0 || bulgeScale === 0) return "";
    const hx = hoverX;
    const apexX = hx + bulgeSkew;
    const currentMaxH = maxH * bulgeScale;
    const leftX = Math.max(0, hx - r);
    const rightX = Math.min(containerWidth, hx + r);

    let path = `M ${leftX},${cy - baseThickness} `;
    path += `C ${hx - r/2 + bulgeSkew * 0.4},${cy - baseThickness} ${apexX - r/2},${cy - baseThickness - currentMaxH} ${apexX},${cy - baseThickness - currentMaxH} `;
    path += `C ${apexX + r/2},${cy - baseThickness - currentMaxH} ${hx + r/2 + bulgeSkew * 0.4},${cy - baseThickness} ${rightX},${cy - baseThickness} `;
    path += `L ${rightX},${cy + baseThickness} `;
    path += `C ${hx + r/2 + bulgeSkew * 0.4},${cy + baseThickness} ${apexX + r/2},${cy + baseThickness + currentMaxH} ${apexX},${cy + baseThickness + currentMaxH} `;
    path += `C ${apexX - r/2},${cy + baseThickness + currentMaxH} ${hx - r/2 + bulgeSkew * 0.4},${cy + baseThickness} ${leftX},${cy + baseThickness} `;
    path += `Z`;
    return path;
  };

  const renderVerticalDashes = () => {
    if (containerWidth <= 0) return null;
    const dashSpacing = 15;
    const count = Math.floor(containerWidth / dashSpacing);
    const dashes = [];
    const apexX = hoverX !== null ? hoverX + bulgeSkew : 0;

    for (let i = 1; i < count; i++) {
      const origX = i * dashSpacing;
      let x = origX;
      let halfHeight = baseThickness;
      let strokeWidth = 2;
      let isNearCursor = false;

      if (hoverX !== null && bulgeScale > 0) {
        const origDist = Math.abs(origX - apexX);
        if (origDist < r) {
          isNearCursor = true;
          const u = origDist / r;
          const warpedU = Math.pow(u, 0.58);
          const effectiveDist = (1 - bulgeScale) * origDist + bulgeScale * (warpedU * r);
          x = origX > apexX ? apexX + effectiveDist : apexX - effectiveDist;

          const dist = Math.abs(x - apexX);
          const factor = 0.5 * (1 + Math.cos(Math.min(1, dist / r) * Math.PI));
          halfHeight = baseThickness + maxH * bulgeScale * factor;

          const peakFactor = Math.pow(factor, 1.8);
          strokeWidth = 2 + 11.5 * bulgeScale * peakFactor;
        }
      }

      const overshoot = isNearCursor ? 12 : 2;
      const y1 = cy - halfHeight - overshoot;
      const y2 = cy + halfHeight + overshoot;

      // Determine era color for this dash based on x position
      const marginLeft = 60;
      const marginRight = 80;
      const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
      let approxIdx = Math.round(((x - marginLeft) / eventTrackWidth) * (filteredEvents.length - 1));
      approxIdx = Math.max(0, Math.min(filteredEvents.length - 1, approxIdx));
      const dashEvent = filteredEvents[approxIdx];
      const dashEra = dashEvent ? getEventEra(dashEvent) : 'medina';
      const dashConfig = ERA_CONFIGS[dashEra];

      dashes.push(
        <line
          key={i}
          x1={x}
          y1={y1}
          x2={x}
          y2={y2}
          stroke={dashConfig.accent}
          strokeWidth={strokeWidth}
          strokeOpacity={isNearCursor ? 0.65 + 0.3 * bulgeScale : 0.35}
          strokeLinecap="butt"
        />
      );
    }
    return dashes;
  };

  const activeEvent: TimelineEvent | undefined = filteredEvents[activeIndex] || filteredEvents[0];
  const activeEra: TimelineEra = activeEvent ? getEventEra(activeEvent) : 'medina';
  const activeEraConfig = ERA_CONFIGS[activeEra];

  // Dynamic SVG Gradient stops based on event positions along the track
  const gradientStops = useMemo(() => {
    if (filteredEvents.length === 0 || containerWidth <= 0) return [];
    const stops: { offset: string; color: string }[] = [];
    const marginLeft = 60;
    const marginRight = 80;
    const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);

    filteredEvents.forEach((ev, idx) => {
      const era = getEventEra(ev);
      const config = ERA_CONFIGS[era];
      const x = marginLeft + (idx / Math.max(1, filteredEvents.length - 1)) * eventTrackWidth;
      const pct = Math.max(0, Math.min(100, (x / containerWidth) * 100));

      if (idx === 0) {
        stops.push({ offset: '0%', color: config.pastel });
      }
      stops.push({ offset: `${pct.toFixed(2)}%`, color: config.pastel });
      if (idx === filteredEvents.length - 1) {
        stops.push({ offset: '100%', color: config.pastel });
      }
    });

    return stops;
  }, [filteredEvents, containerWidth]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Milestone', label: 'Milestones' },
    { id: 'Battle / Expedition', label: 'Battles & Expeditions' },
    { id: 'Treaty & Diplomatic', label: 'Treaties & Envoys' },
    { id: 'Revelation & Law', label: 'Revelations & Laws' },
    { id: 'Personal & Family', label: 'Life & Family' }
  ];

  return (
    <main className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden animate-in fade-in duration-500 bg-background text-main">
      
      {/* Top Header & Multi-Volume Controls */}
      <header className="pt-4 pb-2 px-6 shrink-0 z-30 flex flex-col items-center border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Main Title & Subtitle */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <BookOpen size={18} />
              </span>
              <h1 className="text-xl md:text-2xl font-black italic tracking-tight uppercase text-main">
                The Life of The Holy Prophet <span className="text-accent-main font-bold normal-case tracking-normal">(PBUH)</span>
              </h1>
            </div>
            <p className="text-[11px] font-semibold text-muted tracking-wide mt-0.5">
              Based on the authoritative treatise <span className="font-bold text-accent-main">Seal of the Prophets</span> (Vols. I–III) by Hadrat Mirza Bashir Ahmad (ra)
            </p>
          </div>


        </div>

        {/* Search & Filter Bar */}
        <div className="w-full max-w-7xl flex flex-wrap items-center justify-between gap-3 mt-2.5 pt-2 border-t border-border/20">
          
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={clsx(
                  "px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider whitespace-nowrap transition-all border",
                  activeCategory === c.id
                    ? "bg-accent-main/15 border-accent-main text-accent-main font-black"
                    : "border-border/50 text-muted hover:text-main bg-background/50"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search Box & Quick Navigation */}
          <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search events, companions, treaties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300/60 dark:border-white/10 text-main placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent-main"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-main"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Arrow Jump Buttons */}
            <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-0.5 rounded-xl border border-slate-300/40 dark:border-white/10">
              <button
                onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                disabled={activeIndex <= 0}
                className="p-1 rounded-lg hover:bg-background disabled:opacity-30 text-main transition"
                title="Previous Event (Left Arrow)"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5 text-accent-main">
                {filteredEvents.length > 0 ? `${activeIndex + 1}/${filteredEvents.length}` : '0/0'}
              </span>
              <button
                onClick={() => setActiveIndex(prev => Math.min(filteredEvents.length - 1, prev + 1))}
                disabled={activeIndex >= filteredEvents.length - 1}
                className="p-1 rounded-lg hover:bg-background disabled:opacity-30 text-main transition"
                title="Next Event (Right Arrow)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 5-Era Pastel Color Legend */}
        <div className="w-full max-w-7xl flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 pt-1.5 border-t border-border/10 text-[10px]">
          <span className="font-extrabold uppercase tracking-wider text-muted text-[9px]">Eras:</span>
          {Object.values(ERA_CONFIGS).map((era) => {
            const isEraActive = activeEra === era.id;
            return (
              <div 
                key={era.id} 
                className={clsx(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all duration-200",
                  isEraActive ? "bg-white/10 dark:bg-white/5 ring-1 ring-white/20 font-bold" : "opacity-75 hover:opacity-100"
                )}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-transform" 
                  style={{ 
                    backgroundColor: era.pastel, 
                    border: `1.5px solid ${era.accent}`,
                    boxShadow: isEraActive ? `0 0 8px ${era.glow}` : undefined,
                    transform: isEraActive ? 'scale(1.25)' : 'scale(1)'
                  }} 
                />
                <span className={clsx("whitespace-nowrap tracking-wide", isEraActive ? "text-main font-extrabold" : "text-muted")}>
                  {era.name}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      {/* Top Active Title Speech Box (Moved higher with justify-start and z-30) */}
      <section className="flex-1 flex flex-col justify-start pt-2 md:pt-3 items-center px-4 relative z-30 min-h-0">
        {activeEvent ? (
          <div className="glass px-8 py-2.5 rounded-2xl relative min-w-[280px] max-w-2xl text-center shadow-md border border-[var(--glass-border)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span 
                className={clsx("px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border", activeEraConfig.bgChip)}
              >
                {activeEraConfig.name}
              </span>
              <span className="text-xs text-muted">•</span>
              <span 
                className="text-[11px] font-bold tracking-wider uppercase"
                style={{ color: activeEraConfig.accent }}
              >
                {activeEvent.year}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black italic tracking-tight text-main uppercase">
              {activeEvent.title}
            </h2>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--glass-bg)] rotate-45 border-r border-b border-[var(--glass-border)]" />
          </div>
        ) : (
          <div className="glass px-6 py-3 rounded-2xl text-center text-muted text-sm">
            No events match your search criteria.
          </div>
        )}
      </section>

      {/* Middle Interactive Bulging Timeline Track (Centered in the screen) */}
      <section 
        className="relative h-56 flex-shrink-0 cursor-none select-none overflow-visible w-full group/track z-20 my-auto"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="relative w-full h-[210px]">
            {/* Top Slanted Topic Title (Active Event Only - all extra slanted lines removed) */}
            {containerWidth > 0 && activeEvent && (() => {
              const marginLeft = 60;
              const marginRight = 80;
              const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
              const x = marginLeft + (activeIndex / Math.max(1, filteredEvents.length - 1)) * eventTrackWidth;
              const evEra = getEventEra(activeEvent);
              const cfg = ERA_CONFIGS[evEra];

              return (
                <div 
                  key={`top-${activeEvent.id}`}
                  className="absolute flex items-center pointer-events-none z-0 transition-opacity duration-200"
                  style={{ 
                    left: `${x}px`,
                    top: `${cy - baseThickness}px`,
                    transform: `translate(0, -50%) rotate(-45deg)`,
                    transformOrigin: '0 50%'
                  }}
                >
                  {/* The slanted tick mark */}
                  <div 
                    className="h-[2.5px] w-14 transition-all duration-300 rounded-full" 
                    style={{
                      backgroundColor: cfg.accent,
                      boxShadow: `0 0 10px ${cfg.glow}`,
                      opacity: 1
                    }}
                  />
                  {/* The title label */}
                  <span 
                    className="ml-2 text-[10px] md:text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 scale-110 drop-shadow-sm opacity-100 font-extrabold max-w-[240px] truncate"
                    style={{
                      color: cfg.accent
                    }}
                  >
                    {activeEvent.title}
                  </span>
                </div>
              );
            })()}

            {/* Bottom Slanted Date (Active Event Only - all extra slanted lines removed) */}
            {containerWidth > 0 && activeEvent && (() => {
              const marginLeft = 60;
              const marginRight = 80;
              const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
              const x = marginLeft + (activeIndex / Math.max(1, filteredEvents.length - 1)) * eventTrackWidth;
              const evEra = getEventEra(activeEvent);
              const cfg = ERA_CONFIGS[evEra];

              return (
                <div 
                  key={`bottom-${activeEvent.id}`}
                  className="absolute flex items-center pointer-events-none z-0 transition-opacity duration-200"
                  style={{ 
                    left: `${x}px`,
                    top: `${cy + baseThickness}px`,
                    transform: `translate(0, -50%) rotate(45deg)`,
                    transformOrigin: '0 50%'
                  }}
                >
                  {/* The slanted tick mark */}
                  <div 
                    className="h-[2.5px] w-14 transition-all duration-300 rounded-full" 
                    style={{
                      backgroundColor: cfg.accent,
                      boxShadow: `0 0 10px ${cfg.glow}`,
                      opacity: 1
                    }}
                  />
                  {/* The date label */}
                  <span 
                    className="ml-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 font-black scale-110 drop-shadow-sm opacity-100"
                    style={{
                      color: cfg.accent
                    }}
                  >
                    {activeEvent.year}
                  </span>
                </div>
              );
            })()}

            {/* SVG Track spanning edge to edge - Rendered IN FRONT OF the slanted text (z-10) */}
            <svg 
              width="100%" 
              height="210" 
              className="absolute top-0 left-0 overflow-visible text-accent-main pointer-events-none z-10"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 80px, black calc(100% - 80px), transparent 100%)',
                maskImage: 'linear-gradient(to right, transparent 0%, black 80px, black calc(100% - 80px), transparent 100%)',
              }}
            >
              <defs>
                <clipPath id="timeline-track-clip">
                  <path d={getTimelinePath()} />
                </clipPath>
                {/* 5-Era Pastel Linear Gradient along the entire track */}
                <linearGradient id="timeline-era-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  {gradientStops.map((stop, idx) => (
                    <stop key={idx} offset={stop.offset} stopColor={stop.color} />
                  ))}
                </linearGradient>
                <filter id="bulge-shadow" x="-50%" y="-150%" width="200%" height="400%">
                  <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="rgba(0,0,0,0.25)" />
                  <feDropShadow dx="0" dy="14" stdDeviation="28" floodColor={activeEraConfig.glow} />
                </filter>
                {hoverX !== null && (
                  <radialGradient 
                    id="bulge-white-gradient" 
                    cx={hoverX + bulgeSkew} 
                    cy={cy} 
                    r={r} 
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="45%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="85%" stopColor="#ffffff" stopOpacity="0.0" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </radialGradient>
                )}
              </defs>

              {/* Bulge Drop Shadow & Glow */}
              {hoverX !== null && bulgeScale > 0 && (
                <path 
                  d={getBulgeOnlyPath()} 
                  fill="url(#timeline-era-gradient)" 
                  filter="url(#bulge-shadow)"
                  opacity={bulgeScale}
                />
              )}

              {/* Base Timeline Track with 5-Era Pastel Gradient */}
              <path 
                d={getTimelinePath()} 
                fill="url(#timeline-era-gradient)" 
              />

              {/* Gradual White Glow Towards Bulge Center */}
              {hoverX !== null && bulgeScale > 0 && (
                <path 
                  d={getBulgeOnlyPath()} 
                  fill="url(#bulge-white-gradient)" 
                  opacity={bulgeScale}
                  className="pointer-events-none"
                />
              )}

              {/* Vertical Dashes Bulging Across the Line */}
              <g clipPath="url(#timeline-track-clip)" className="pointer-events-none">
                {renderVerticalDashes()}
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Bottom Comprehensive Detail Section (flex-1 with scroll) */}
      <section className="flex-1 flex flex-col justify-start items-center pt-3 lg:pt-4 px-4 pb-6 z-10 overflow-y-auto min-h-0">
        {activeEvent && (
          <article className="glass p-6 md:p-8 rounded-3xl max-w-4xl w-full border border-[var(--glass-border)] shadow-xl relative animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-border/30">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className={clsx("px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg border", activeEraConfig.bgChip)}
                >
                  Vol. {activeEvent.vol}: {activeEraConfig.name}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-blue-500/15 text-blue-500 border border-blue-500/25">
                  {activeEvent.category}
                </span>
              </div>

              {/* Exact Date */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                <Calendar size={14} style={{ color: activeEraConfig.accent }} />
                <span>{activeEvent.date}</span>
              </div>
            </div>

            {/* Deep Narrative Description */}
            <p className="text-base md:text-lg text-main leading-relaxed font-normal mb-6 text-justify">
              {activeEvent.desc}
            </p>

            {/* Linked Friday Sermons Section */}
            {activeEvent.khutbas && activeEvent.khutbas.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border/40">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-accent-main/15 text-accent-main">
                      <Tv size={15} />
                    </span>
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-main">
                      Friday Sermons of Huzoor (aba) on this Incident
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-accent-main px-2 py-0.5 rounded-full bg-accent-main/10 border border-accent-main/20">
                    {activeEvent.khutbas.length} {activeEvent.khutbas.length === 1 ? 'Sermon' : 'Sermons'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeEvent.khutbas.map((kh) => (
                    <a
                      key={kh.id}
                      href={kh.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/khutba flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/50 hover:border-accent-main/60 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                        <img
                          src={kh.thumbnailUrl}
                          alt={kh.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/khutba:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover/khutba:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 text-accent-main flex items-center justify-center shadow-md transform group-hover/khutba:scale-110 transition-transform">
                            <Play size={18} className="ml-0.5 fill-current" />
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-bold text-white tracking-wide">
                          {kh.date}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3.5 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-main line-clamp-2 leading-snug group-hover/khutba:text-accent-main transition-colors">
                            {kh.title}
                          </h4>
                          <ExternalLink size={13} className="text-muted shrink-0 group-hover/khutba:text-accent-main transition-colors mt-0.5" />
                        </div>
                        {kh.summary && (
                          <p className="mt-2 text-[11px] text-muted line-clamp-2 leading-relaxed font-normal">
                            {kh.summary}
                          </p>
                        )}
                        <div className="mt-auto pt-2.5 flex items-center text-[10px] font-bold text-accent-main">
                          Watch on Al Islam &rarr;
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tags & Source Citation Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-6 border-t border-border/30 text-xs">
              
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider mr-1">
                  Key Subjects:
                </span>
                {activeEvent.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800/60 hover:bg-accent-main/20 text-muted hover:text-accent-main transition text-[11px] font-medium"
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Book Source Citation */}
              <div className="flex items-center gap-1.5 text-accent-main font-bold shrink-0">
                <Bookmark size={14} />
                <span>{activeEvent.source}</span>
              </div>
            </div>
          </article>
        )}
      </section>

    </main>
  );
}
