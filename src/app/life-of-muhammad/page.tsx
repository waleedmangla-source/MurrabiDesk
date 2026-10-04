"use client";
import React, { useState, useRef, useEffect } from 'react';
import { clsx } from "clsx";
import { Clock } from "lucide-react";

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
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 50;
    
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    let x = clientX - rect.left - padding;
    const containerWidth = rect.width - (padding * 2);
    
    if (x < 0) x = 0;
    if (x > containerWidth) x = containerWidth;

    setProgressWidth(x);
    setHoverX(x);

    const step = containerWidth / (events.length - 1);
    let newIndex = Math.round(x / step);
    
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= events.length) newIndex = events.length - 1;

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoverX(null);
  };

  return (
    <main className="main-content flex flex-col gap-6 lg:gap-8 pb-8 lg:pb-12 animate-in fade-in duration-700 lg:h-screen lg:overflow-hidden">
      {/* Header */}
      <header className="flex items-end justify-between mb-1 lg:mb-2">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-main uppercase">
            Life of Muhammad <span className="text-xl text-accent-main">(sa)</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-accent-main opacity-80 mt-1">
            Interactive Timeline
          </p>
        </div>
      </header>

      {/* Timeline Scrub Area */}
      <nav 
        aria-label="Timeline navigation"
        className="relative h-32 flex items-center px-[50px] cursor-ew-resize select-none overflow-visible shrink-0 group/track"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base Track (Thicker, 6px) */}
        <span className="absolute left-[50px] right-[50px] h-1.5 bg-black/10 dark:bg-white/10 rounded-full" />
        
        {/* Active Progress Track (Thicker, 6px) */}
        <span 
          className="absolute left-[50px] h-1.5 bg-accent-main rounded-full transition-all duration-150 ease-out shadow-sm"
          style={{ width: `${progressWidth}px` }}
        />

        {/* Dynamic Smooth Bulge Wave Following Cursor */}
        <span 
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 h-3.5 rounded-full pointer-events-none transition-opacity duration-300 ease-out blur-[1px]",
            isHovering ? "opacity-100" : "opacity-0"
          )}
          style={{
            left: `calc(50px + ${hoverX ?? 0}px - 45px)`,
            width: "90px",
            background: "radial-gradient(ellipse at center, var(--accent-main) 0%, rgba(var(--accent-rgb), 0.6) 40%, transparent 80%)",
            transform: "translateY(-50%)",
            transitionProperty: "opacity, transform, width",
          }}
        />

        {/* Bulge Glow Aura */}
        <span 
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 w-28 h-7 -ml-14 rounded-full pointer-events-none transition-all duration-300 ease-out blur-md",
            isHovering ? "opacity-40 bg-[var(--accent-main)]" : "opacity-0"
          )}
          style={{
            left: `calc(50px + ${hoverX ?? 0}px)`,
          }}
        />

        {/* Nodes */}
        {events.map((ev, idx) => {
          const isActive = idx === activeIndex;
          
          // Calculate distance from cursor for smooth proximity bulging
          let proximityScale = 1;
          if (hoverX !== null && containerRef.current) {
            const containerWidth = containerRef.current.clientWidth - 100;
            const nodeX = (idx / (events.length - 1)) * containerWidth;
            const dist = Math.abs(hoverX - nodeX);
            const maxDist = 90;
            if (dist < maxDist) {
              const factor = (1 - dist / maxDist);
              proximityScale = 1 + factor * 0.9;
            }
          }

          return (
            <span 
              key={idx} 
              className={clsx(
                "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-transform duration-200 ease-out pointer-events-none z-10",
                isActive 
                  ? "w-4 h-4 bg-accent-main border-white dark:border-slate-900 shadow-accent-glow" 
                  : "w-3 h-3 bg-white dark:bg-v4-ink border-black/30 dark:border-white/30"
              )}
              style={{ 
                left: `calc(50px + calc(100% - 100px) * ${idx / (events.length - 1)})`,
                transform: `translate(-50%, -50%) scale(${isActive ? Math.max(1.8, proximityScale * 1.4) : proximityScale})`,
              }}
            >
              <span className={clsx(
                "absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ease-out",
                isActive || (!isHovering && idx % 2 === 0) ? "opacity-100" : "opacity-0",
                isActive ? "text-accent-main font-black scale-110" : "text-muted"
              )}>
                {ev.year}
              </span>
            </span>
          );
        })}
      </nav>

      {/* Content Area */}
      <section className="flex-1 flex flex-col justify-center items-center p-4 lg:p-8 relative overflow-hidden">
        {activeIndex === -1 ? (
          <div className="flex flex-col items-center gap-4 text-center max-w-xl text-muted">
            <Clock size={40} className="text-accent-main opacity-70 animate-pulse" />
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-main">Scrub the timeline above</h2>
            <p className="text-sm font-medium text-muted">Move your cursor or touch along the timeline to read through the historical incidents in chronological order.</p>
          </div>
        ) : (
          <article className="flex flex-col items-center text-center max-w-3xl animate-in fade-in slide-in-from-bottom-3 duration-300">
            <span className="text-xs font-black uppercase tracking-widest text-accent-main px-4 py-1.5 rounded-full bg-accent-soft border border-accent-glow mb-5 inline-block">
              {events[activeIndex].year}
            </span>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-main uppercase mb-5 leading-tight">
              {events[activeIndex].title}
            </h2>
            <hr className="w-16 h-1 border-0 bg-accent-main rounded-full mb-6 opacity-60" />
            <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl font-normal">
              {events[activeIndex].desc}
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
