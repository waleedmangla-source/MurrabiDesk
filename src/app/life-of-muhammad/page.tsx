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
  Tv,
  Lock,
  Unlock
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
  const [isHeld, setIsHeld] = useState(false); // Click-to-hold state
  const isHeldRef = useRef(false);
  const velocityRef = useRef<number>(0);
  const currentPosRef = useRef<number | null>(null);
  const targetPosRef = useRef<number | null>(null);
  const loopRef = useRef<number | null>(null);
  const collapseAnimRef = useRef<number | null>(null);

  // Keep isHeldRef in sync with state
  useEffect(() => {
    isHeldRef.current = isHeld;
  }, [isHeld]);

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

  const handleTrackClick = (e: React.MouseEvent) => {
    if (isHeld) {
      // Toggle off hold position
      setIsHeld(false);
      // Immediately allow following cursor if still over track
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(containerWidth, x));
        targetPosRef.current = x;
        startTrackingLoop();
      }
    } else {
      // Lock into hold position at current hover location (or clicked position)
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(containerWidth, x));
        currentPosRef.current = x;
        targetPosRef.current = x;
        setHoverX(x);
        setBulgeScale(1);
        setBulgeSkew(0);
        
        if (containerWidth > 0 && filteredEvents.length > 0) {
          const marginLeft = 60;
          const marginRight = 80;
          const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
          let newIndex = Math.round(((x - marginLeft) / eventTrackWidth) * (filteredEvents.length - 1));
          newIndex = Math.max(0, Math.min(filteredEvents.length - 1, newIndex));
          setActiveIndex(newIndex);
        }
      }
      setIsHeld(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isHeldRef.current) return; // Locked in hold position
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
    if (isHeldRef.current) return; // Keep locked bulge visible when in hold position
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

  const handleWheel = (e: React.WheelEvent) => {
    if (isHeldRef.current) return; // Locked in hold position
    // If user is scrolling horizontally, pan through the timeline events
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) {
      const step = e.deltaX * 0.6;
      const curX = currentPosRef.current ?? (containerWidth / 2);
      const nextX = Math.max(0, Math.min(containerWidth, curX + step));
      currentPosRef.current = nextX;
      setHoverX(nextX);
      setBulgeScale(1);
      if (containerWidth > 0 && filteredEvents.length > 0) {
        const marginLeft = 60;
        const marginRight = 80;
        const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
        let newIndex = Math.round(((nextX - marginLeft) / eventTrackWidth) * (filteredEvents.length - 1));
        newIndex = Math.max(0, Math.min(filteredEvents.length - 1, newIndex));
        setActiveIndex(newIndex);
      }
    }
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

  // Coordinates for the active title card speech bubble to follow the bulge
  const titleCardCoords = useMemo(() => {
    if (containerWidth <= 0 || filteredEvents.length === 0) {
      return { clampedCardX: 0, targetBulgeX: 0, tailOffset: 0 };
    }
    const marginLeft = 60;
    const marginRight = 80;
    const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
    const activeEventX = marginLeft + (activeIndex / Math.max(1, filteredEvents.length - 1)) * eventTrackWidth;

    // The apex of the bulge is at hoverX + bulgeSkew when hovering, or the active milestone when idle
    const targetBulgeX = hoverX !== null ? hoverX + bulgeSkew : activeEventX;

    // Approximate half width of speech bubble card for boundary clamping
    const bubbleHalfWidth = containerWidth > 640 ? 190 : 140;
    const clampedCardX = Math.max(bubbleHalfWidth + 12, Math.min(containerWidth - bubbleHalfWidth - 12, targetBulgeX));
    const tailOffset = Math.max(-80, Math.min(80, targetBulgeX - clampedCardX));

    return { clampedCardX, targetBulgeX, tailOffset };
  }, [containerWidth, filteredEvents.length, activeIndex, hoverX, bulgeSkew]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Milestone', label: 'Milestones' },
    { id: 'Battle / Expedition', label: 'Battles & Expeditions' },
    { id: 'Treaty & Diplomatic', label: 'Treaties & Envoys' },
    { id: 'Revelation & Law', label: 'Revelations & Laws' },
    { id: 'Personal & Family', label: 'Life & Family' }
  ];

  return (
    <div className="h-full w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col bg-background text-main custom-scrollbar">
      
      {/* Top Header & Multi-Volume Controls */}
      <header className="sticky top-0 pt-3 pb-2 px-6 shrink-0 z-40 flex flex-col items-center border-b border-border/40 bg-background/85 backdrop-blur-md shadow-sm">
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

      {/* Top Active Title Speech Box (Follows the bulge wherever it goes, slightly lowered) */}
      <section className="w-full relative h-16 shrink-0 z-30 pt-1 mt-7 md:mt-9 overflow-visible">
        {activeEvent ? (
          <div 
            className="absolute top-1 glass px-6 md:px-8 py-3 rounded-2xl min-w-[220px] max-w-[90vw] md:max-w-xl text-center shadow-md border border-[var(--glass-border)] animate-in fade-in zoom-in-95 duration-200 transition-[left] ease-out duration-75"
            style={{
              left: containerWidth > 0 ? `${titleCardCoords.clampedCardX}px` : '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <h2 className="text-lg md:text-2xl font-black italic tracking-tight text-main uppercase truncate max-w-full">
              {activeEvent.title}
            </h2>
            {/* Speech bubble tail pointing towards the bulge apex */}
            <div 
              className="absolute -bottom-2 w-4 h-4 bg-[var(--glass-bg)] border-r border-b border-[var(--glass-border)] transition-[left] ease-out duration-75"
              style={{
                left: `calc(50% + ${titleCardCoords.tailOffset}px)`,
                transform: 'translateX(-50%) rotate(45deg)'
              }}
            />
          </div>
        ) : (
          <div className="w-full flex justify-center pt-1">
            <div className="glass px-6 py-3 rounded-2xl text-center text-muted text-sm">
              No events match your search criteria.
            </div>
          </div>
        )}
      </section>

      {/* Middle Interactive Bulging Timeline Track (Slightly lowered) */}
      <section 
        className={clsx(
          "relative h-56 flex-shrink-0 select-none overflow-visible w-full group/track z-20 mt-5 mb-12 md:mt-6 md:mb-16",
          isHeld ? "cursor-pointer" : "cursor-none"
        )}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleTrackClick}
        onWheel={handleWheel}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="relative w-full h-[210px]">

            {/* Bottom Slanted Dates (slanting down-right) - Rendered BEHIND the bulge */}
            {containerWidth > 0 && filteredEvents.map((ev, idx) => {
              const marginLeft = 60;
              const marginRight = 80;
              const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
              const x = marginLeft + (idx / Math.max(1, filteredEvents.length - 1)) * eventTrackWidth;
              const isActive = idx === activeIndex;
              const evEra = getEventEra(ev);
              const cfg = ERA_CONFIGS[evEra];

              const distFromActive = Math.abs(idx - activeIndex);
              const shouldShowLabel = isActive || distFromActive === 1 || (filteredEvents.length <= 25) || (idx % Math.ceil(filteredEvents.length / 22) === 0);

              return (
                <div 
                  key={`bottom-${ev.id}`}
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
                    className={clsx(
                      "h-[2.5px] transition-all duration-300 rounded-full", 
                      isActive ? "w-14" : "w-8"
                    )} 
                    style={{
                      backgroundColor: isActive ? cfg.accent : cfg.pastel,
                      boxShadow: isActive ? `0 0 10px ${cfg.glow}` : undefined,
                      opacity: isActive ? 1 : 0.65
                    }}
                  />
                  {/* The date label */}
                  {shouldShowLabel && (
                    <span 
                      className={clsx(
                        "ml-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300",
                        isActive 
                          ? "font-black scale-110 drop-shadow-sm opacity-100" 
                          : "opacity-60 text-muted"
                      )}
                      style={{
                        color: isActive ? cfg.accent : undefined
                      }}
                    >
                      {ev.year}
                    </span>
                  )}
                </div>
              );
            })}

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
                  <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="rgba(0,0,0,0.4)" />
                  <feDropShadow dx="0" dy="16" stdDeviation="28" floodColor="rgba(0,0,0,0.3)" />
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

              {/* Vertical Indicator Line at the Center/Apex of the Bulge (Longer than bulge itself) */}
              {(hoverX !== null || isHeld) && containerWidth > 0 && (() => {
                const apexX = hoverX !== null ? hoverX + bulgeSkew : titleCardCoords.targetBulgeX;
                const lineHalfHeight = 96; // 192px total height, significantly longer than max bulge height (144px)
                return (
                  <g className="pointer-events-none select-none transition-opacity duration-150" opacity={bulgeScale > 0 ? 1 : 0.8}>
                    {/* Subtle outer halo for contrast against dark backgrounds */}
                    <line
                      x1={apexX}
                      y1={cy - lineHalfHeight}
                      x2={apexX}
                      y2={cy + lineHalfHeight}
                      stroke="rgba(255, 255, 255, 0.45)"
                      strokeWidth={12}
                      strokeLinecap="round"
                    />
                    {/* Main prominent black vertical indicator line */}
                    <line
                      x1={apexX}
                      y1={cy - lineHalfHeight}
                      x2={apexX}
                      y2={cy + lineHalfHeight}
                      stroke="#000000"
                      strokeWidth={8}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      </section>

      {/* Bottom Comprehensive Detail Section (unconstrained natural page flow with generous spacing) */}
      <section className="w-full flex flex-col items-center pt-8 md:pt-14 px-4 pb-28 z-10">
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

    </div>
  );
}
