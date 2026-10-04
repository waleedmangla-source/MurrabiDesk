"use client";
import React, { useState, useRef, useEffect } from 'react';
import { clsx } from "clsx";

const events = [
  { year: "570 A.D.", title: "Birth in Mecca", desc: "The Prophet (sa) was born in Mecca in August 570 A.D. He was given the name Muhammad, which means 'The Praised One'." },
  { year: "Age 25", title: "Marriage to Khadija (ra)", desc: "After leading her trading caravan to Syria with great success, Khadija (ra), impressed by his integrity and honesty, offered her hand in marriage." },
  { year: "Age 40", title: "First Revelation", desc: "In the cave of Hira, he received the first revelation from God, commanding him to 'Recite in the name of thy Lord'. This marked the beginning of his prophethood." },
  { year: "Early Prophethood", title: "The Faithful Persecuted", desc: "Early converts like Bilal, Yasir, and Sumayya endured terrible tortures by the Meccans. Yet, their hearts remained stout and their faith steadfast." },
  { year: "5th Year of Call", title: "Emigration to Abyssinia", desc: "To escape extreme persecution, a party of Muslims migrated to Abyssinia to seek refuge under a just Christian King, the Negus." },
  { year: "10th Year of Call", title: "Journey to Ta'if", desc: "After the death of Khadija and Abu Talib, he sought support in Ta'if but was brutally stoned and driven out, yet he prayed for their guidance." },
  { year: "622 A.D.", title: "The Hijra (Migration)", desc: "Due to intense persecution and assassination plots, the Prophet (sa) and his followers migrated from Mecca to Medina, marking the beginning of the Islamic calendar." },
  { year: "2 A.H.", title: "Battle of Badr", desc: "A poorly equipped Muslim force of 313 men defeated a heavily armed Meccan army of 1000, fulfilling a great prophecy of victory." },
  { year: "3 A.H.", title: "Battle of Uhud", desc: "Meccans attacked to avenge Badr. Despite early success, a strategic mistake led to heavy Muslim losses, and the Prophet (sa) was severely wounded." },
  { year: "5 A.H.", title: "Battle of the Ditch", desc: "A confederate army of over 10,000 besieged Medina. Muslims dug a trench for defense. God sent a severe storm that forced the enemies to disperse." },
  { year: "6 A.H.", title: "Treaty of Hudaibiya", desc: "The Prophet (sa) led 1500 companions for pilgrimage but was stopped. A 10-year peace treaty was signed, initially seeming disadvantageous but leading to great victories." },
  { year: "7 A.H.", title: "Letters to Kings", desc: "The Prophet (sa) sent envoys with letters inviting the rulers of Rome (Heraclius), Iran (Chosroes), Egypt (Muqauqis), and Abyssinia to accept Islam." },
  { year: "7 A.H.", title: "Fall of Khaibar", desc: "Muslims marched against the Jewish stronghold of Khaibar, a center of anti-Islamic intrigues, and conquered it, bringing peace to the region." },
  { year: "8 A.H.", title: "Fall of Mecca", desc: "Following a breach of the Hudaibiya treaty by the Meccans, the Prophet (sa) marched with 10,000 followers and conquered Mecca without bloodshed, granting a general amnesty." },
  { year: "8 A.H.", title: "Battle of Hunain", desc: "Muslims faced a fierce ambush by the Hawazin and Thaqif tribes. Despite initial panic, the Prophet's steadfastness rallied the troops to victory." },
  { year: "9 A.H.", title: "Expedition of Tabuk", desc: "Responding to rumors of a Roman attack, the Prophet (sa) led an army to the Syrian border. Finding no enemy, he signed peace treaties with border tribes." },
  { year: "10 A.H.", title: "The Last Pilgrimage", desc: "The Prophet (sa) performed his final Hajj, delivering a farewell address establishing human equality. The verse declaring the perfection of religion was revealed." },
  { year: "11 A.H.", title: "Passing Away", desc: "Having completed his divine mission, the Prophet (sa) fell ill and passed away in Medina. Abu Bakr (ra) reminded the grieving Muslims that God is ever living." }
];

export default function LifeOfMuhammadTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [bulgeScale, setBulgeScale] = useState(0);
  const [bulgeSkew, setBulgeSkew] = useState(0); // Dynamic directional pull offset (px)
  const lastMousePosRef = useRef<{ x: number; time: number } | null>(null);
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
        
        // Speed cap: Maximum allowed speed is ~1.2 px/ms (~1200 px/sec), preventing jarring skips
        const maxStep = 1.2 * dt; 
        let step = dx * 0.18; // Smooth natural follow

        if (Math.abs(step) > maxStep) {
          step = Math.sign(step) * maxStep;
        }

        // Subtler, more balanced directional skew pull
        const v = step / dt; // px/ms
        velocityRef.current = v;
        // Dynamic motion blur amount strictly along horizontal scrubbing axis (max ~4.5px blur during fast scrub)
        const targetBlur = Math.min(4.5, Math.abs(v) * 3.8);

        currentPosRef.current += step;
        const curX = currentPosRef.current;

        setBulgeScale(1);
        setHoverX(curX);
        setBulgeSkew(prev => prev + (targetSkew - prev) * 0.20);

        // Update active index based on the speed-limited position
        if (containerWidth > 0) {
          const marginLeft = 40;
          const marginRight = 160;
          const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
          let newIndex = Math.round(((curX - marginLeft) / eventTrackWidth) * (events.length - 1));
          if (newIndex < 0) newIndex = 0;
          if (newIndex >= events.length) newIndex = events.length - 1;
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

    const duration = 380; // Snappy ease-out collapse
    const startTime = performance.now();
    const startScale = bulgeScale > 0 ? bulgeScale : 1;
    const startSkew = bulgeSkew;

    const animateCollapse = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Pronounced ease-out curve (quartic-style): shrinks swiftly then cushions softly into straight line
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

  // SVG Bulge parameters (3x bigger bulge)
  const cy = 120;
  const baseThickness = 9; // Slightly thicker overall line (18px total track height)
  const r = 140;
  const maxH = 68;

  // Helper to get half-height at coordinate x (incorporating dynamic directional pull)
  const getBulgeHalfHeight = (x: number) => {
    if (hoverX === null || bulgeScale === 0) return baseThickness;
    const apexX = hoverX + bulgeSkew;
    const dist = Math.abs(x - apexX);
    if (dist >= r) return baseThickness;
    const factor = 0.5 * (1 + Math.cos((dist / r) * Math.PI));
    return baseThickness + maxH * bulgeScale * factor;
  };

  // SVG Bulge generation with directional pull skew
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

  // SVG Bulge only path for isolated shadow/glow
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

  // Vertical dashes that bulge in both height and thickness with the line
  const renderVerticalDashes = () => {
    if (containerWidth <= 0) return null;
    const dashSpacing = 15; // Halved the number of vertical dashes for clean spacing
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
          
          // Non-linear coordinate transformation:
          // We stretch the coordinate space outwards from the center so that 
          // dashes are spaced progressively further apart the closer they are to the apex (u -> 0)
          const u = origDist / r; // 0 at center, 1 at boundary
          // Power curve p < 1 stretches values near 0 outward, expanding center spacing
          const warpedU = Math.pow(u, 0.58);
          const effectiveDist = (1 - bulgeScale) * origDist + bulgeScale * (warpedU * r);
          x = origX > apexX ? apexX + effectiveDist : apexX - effectiveDist;

          // Smooth cosine curve matching the bulge profile
          const dist = Math.abs(x - apexX);
          const factor = 0.5 * (1 + Math.cos(Math.min(1, dist / r) * Math.PI));
          halfHeight = baseThickness + maxH * bulgeScale * factor;

          // Distinct peaked profile so the single closest dash to the center is prominently the thickest
          // factor^1.8 creates a sharp crest where the exact center dash reaches up to 13px - 14px
          const peakFactor = Math.pow(factor, 1.8);
          strokeWidth = 2 + 11.5 * bulgeScale * peakFactor;
        }
      }

      // Full vertical span: extend slightly beyond halfHeight so that
      // clipPath="url(#timeline-track-clip)" cuts them precisely at the exact boundary of the bulge
      const overshoot = isNearCursor ? 12 : 2;
      const y1 = cy - halfHeight - overshoot;
      const y2 = cy + halfHeight + overshoot;

      dashes.push(
        <line
          key={i}
          x1={x}
          y1={y1}
          x2={x}
          y2={y2}
          stroke="#064e3b" // Deep dark emerald (#064e3b - darker version of theme color)
          strokeWidth={strokeWidth}
          strokeOpacity={isNearCursor ? 0.4 + 0.45 * bulgeScale : 0.3}
          strokeLinecap="butt" // Hardcut flat ends clipped flush at the bulge perimeter
        />
      );
    }
    return dashes;
  };

  const activeEvent = events[activeIndex] || events[0];

  return (
    <main className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden animate-in fade-in duration-700">
      
      {/* Page Header */}
      <header className="pt-6 lg:pt-8 pb-1 px-6 text-center shrink-0 z-20">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tight text-main uppercase">
          The Life of The Holy Prophet <span className="text-accent-main font-bold normal-case tracking-normal">(PBUH)</span>
        </h1>
        <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-accent-main opacity-80 mt-1">
          Chronological Timeline
        </p>
      </header>

      {/* Top Title Section */}
      <section className="flex-[0.25] flex flex-col justify-end items-center pb-3 lg:pb-4 px-4 relative z-10">
         <div className="glass px-8 py-3.5 lg:py-4 rounded-2xl relative min-w-[280px] max-w-xl text-center shadow-sm">
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-main uppercase">
               {activeEvent.title}
            </h2>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[var(--glass-bg)] rotate-45 border-r border-b border-[var(--glass-border)]" />
         </div>
      </section>

      {/* Middle Timeline Track Section */}
      <section 
        className="relative h-72 flex-shrink-0 cursor-none select-none overflow-visible w-full group/track z-20 mt-8 lg:mt-10"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="relative w-full h-[240px]">
            {/* SVG Track spanning edge to edge with fade out near the edges */}
            <svg 
              width="100%" 
              height="240" 
              className="absolute top-0 left-0 overflow-visible text-accent-main"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 90px, black calc(100% - 90px), transparent 100%)',
                maskImage: 'linear-gradient(to right, transparent 0%, black 90px, black calc(100% - 90px), transparent 100%)',
              }}
            >
              <defs>
                <clipPath id="timeline-track-clip">
                  <path d={getTimelinePath()} />
                </clipPath>
                {/* Generous filter region with soft shadow and glow */}
                <filter id="bulge-shadow" x="-50%" y="-150%" width="200%" height="400%">
                  <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="rgba(0,0,0,0.35)" />
                  <feDropShadow dx="0" dy="14" stdDeviation="28" floodColor="rgba(16,185,129,0.3)" />
                </filter>
                {/* Gradual white radial gradient / glow towards the center of the bulge */}
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

              {/* Bulge Drop Shadow & Glow (rendered behind the track so edges stay crisp) */}
              {hoverX !== null && bulgeScale > 0 && (
                <path 
                  d={getBulgeOnlyPath()} 
                  fill="currentColor" 
                  filter="url(#bulge-shadow)"
                  opacity={bulgeScale}
                />
              )}

              {/* Base Timeline Track */}
              <path 
                d={getTimelinePath()} 
                fill="currentColor" 
              />

              {/* Gradual White Gradient Towards the Bulge Center */}
              {hoverX !== null && bulgeScale > 0 && (
                <path 
                  d={getBulgeOnlyPath()} 
                  fill="url(#bulge-white-gradient)" 
                  opacity={bulgeScale}
                  className="pointer-events-none"
                />
              )}

              {/* Vertical Dashes Bulging Across the Width of the Line */}
              <g clipPath="url(#timeline-track-clip)" className="pointer-events-none">
                {renderVerticalDashes()}
              </g>
            </svg>

            {/* Top Slanted Topic Titles (slanting up-right) */}
            {containerWidth > 0 && events.map((ev, idx) => {
              const marginLeft = 40;
              const marginRight = 160;
              const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
              const x = marginLeft + (idx / (events.length - 1)) * eventTrackWidth;
              const isActive = idx === activeIndex;
              const halfH = getBulgeHalfHeight(x);

              return (
                <div 
                  key={`top-${idx}`}
                  className="absolute flex items-center pointer-events-none z-10"
                  style={{ 
                    left: `${x}px`,
                    top: `${cy - halfH}px`,
                    transform: `translate(0, -50%) rotate(-45deg)`,
                    transformOrigin: '0 50%'
                  }}
                >
                   {/* The slanted tick */}
                   <div className={clsx(
                     "h-[2.5px] transition-all duration-300 rounded-full", 
                     isActive ? "w-14 bg-accent-main shadow-accent-glow" : "w-10 bg-main opacity-25 dark:opacity-40"
                   )} />
                   {/* The topic title */}
                   <span className={clsx(
                     "ml-2.5 text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300",
                     isActive ? "text-accent-main scale-110 drop-shadow-sm opacity-100" : "text-muted opacity-60"
                   )}>
                     {ev.title}
                   </span>
                </div>
              );
            })}

            {/* Bottom Slanted Dates (slanting down-right) */}
            {containerWidth > 0 && events.map((ev, idx) => {
              const marginLeft = 40;
              const marginRight = 160;
              const eventTrackWidth = Math.max(10, containerWidth - marginLeft - marginRight);
              const x = marginLeft + (idx / (events.length - 1)) * eventTrackWidth;
              const isActive = idx === activeIndex;
              const halfH = getBulgeHalfHeight(x);

              return (
                <div 
                  key={`bottom-${idx}`}
                  className="absolute flex items-center pointer-events-none z-10"
                  style={{ 
                    left: `${x}px`,
                    top: `${cy + halfH}px`,
                    transform: `translate(0, -50%) rotate(45deg)`,
                    transformOrigin: '0 50%'
                  }}
                >
                   {/* The slanted tick */}
                   <div className={clsx(
                     "h-[2.5px] transition-all duration-300 rounded-full", 
                     isActive ? "w-14 bg-accent-main shadow-accent-glow" : "w-10 bg-main opacity-25 dark:opacity-40"
                   )} />
                   {/* The date label */}
                   <span className={clsx(
                     "ml-2.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300",
                     isActive ? "text-accent-main font-black scale-110 drop-shadow-sm opacity-100" : "text-muted opacity-60"
                   )}>
                     {ev.year}
                   </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Information Section */}
      <section className="flex-1 flex flex-col justify-start items-center pt-12 lg:pt-14 px-4 z-10">
        <article className="glass p-8 rounded-3xl max-w-3xl text-center border border-[var(--glass-border)] shadow-sm min-h-[160px] flex items-center justify-center">
          <p className="text-lg md:text-xl text-muted leading-relaxed font-normal">
            {activeEvent.desc}
          </p>
        </article>
      </section>

    </main>
  );
}
