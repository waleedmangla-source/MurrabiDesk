"use client";
import React, { useState, useEffect } from 'react';

/**
 * WorldClock Component
 * 
 * Renders a high-fidelity analog clock within a glassmorphic container.
 * Supports timezone offsets and remains synchronized with the global clock.
 */

interface WorldClockProps {
  city: string;
  timezone: string;
}

const WorldClock: React.FC<WorldClockProps> = ({ city, timezone }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Synchronize clock seconds
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTzTime = () => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(time);
      
      const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      const s = parseInt(parts.find(p => p.type === 'second')?.value || '0');
      
      return { h, m, s };
    } catch (e) {
      // Fallback to local time if timezone is invalid
      return { h: time.getHours(), m: time.getMinutes(), s: time.getSeconds() };
    }
  };

  const { h, m, s } = getTzTime();
  
  // Calculate rotations
  const sDeg = (s / 60) * 360;
  const mDeg = ((m + s / 60) / 60) * 360;
  const hDeg = (((h % 12) + m / 60) / 12) * 360;

  return (
    <div className="flex flex-col items-center justify-center group hover:scale-110 transition-all duration-700 no-drag cursor-pointer p-2 relative">
      {/* Main Circular Clock Body */}
      <div className="relative w-32 h-32 circular-pod border border-white/10 glass shadow-2xl flex flex-col items-center justify-center overflow-hidden">
        {/* Hour Markers */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-0.5 h-1.5 rounded-full" 
            style={{ 
              backgroundColor: 'var(--foreground)',
              opacity: 0.15,
              transform: `rotate(${i * 30}deg) translateY(-54px)` 
            }} 
          />
        ))}

        {/* Ambient Subtle Background Pulse (Visual confirmation of sync) */}
        <div className="absolute inset-0 bg-accent-main/[0.02] animate-pulse" />

        {/* Hands Container */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none z-10 scale-90">
            {/* Hour Hand */}
            <div 
              className="absolute w-1.5 h-10 rounded-full origin-bottom mb-10 transition-transform duration-500 ease-out shadow-lg"
              style={{ 
                backgroundColor: 'var(--accent-main)',
                transform: `rotate(${hDeg}deg)` 
              }}
            />
            {/* Minute Hand */}
            <div 
              className="absolute w-1 h-14 rounded-full origin-bottom mb-14 transition-transform duration-500 ease-out"
              style={{ 
                backgroundColor: 'var(--accent-main)',
                opacity: 0.7,
                transform: `rotate(${mDeg}deg)` 
              }}
            />
            {/* Second Hand */}
            <div 
              className="absolute w-[1.5px] h-16 bg-accent-main rounded-full origin-bottom mb-16 shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
              style={{ transform: `rotate(${sDeg}deg)` }}
            />
            
            {/* Center Hub */}
            <div className="absolute w-2.5 h-2.5 bg-accent-main rounded-full border border-white shadow-2xl z-20" />
        </div>

        {/* Integrated Metadata (Inside the circle) */}
        <div className="absolute inset-x-0 bottom-6 text-center z-20 pointer-events-none">
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-accent-main opacity-80 mb-0.5">{city}</p>
            <p className="text-[10px] font-black tracking-tighter tabular-nums text-white/90">
              {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}
            </p>
        </div>
      </div>
    </div>
  );
};

export default WorldClock;
