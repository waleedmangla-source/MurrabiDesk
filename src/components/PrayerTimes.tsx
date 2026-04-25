"use client";

import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Sunrise, 
  Sunset, 
  Clock, 
  Shield, 
  RefreshCw,
  MapPin,
  BellRing
} from 'lucide-react';
import { clsx } from "clsx";

interface Timings {
  Fajr: string;
  Sunrise: string;
  Zuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
}

export default function PrayerTimes() {
  const [timings, setTimings] = useState<Timings | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);

  useEffect(() => {
    fetchPrayerTimes();
    const interval = setInterval(updateNextPrayer, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [timings]);

  const fetchPrayerTimes = async () => {
    try {
      const response = await fetch('/api/prayer-times');
      const data = await response.json();
      setTimings(data);
      setLoading(false);
    } catch (err) {
      console.error('Namaz Sync Failed:', err);
    }
  };

  const updateNextPrayer = () => {
    if (!timings) return;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const checkList: { name: string; time: string }[] = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Zuhr', time: timings.Zuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha },
    ];

    for (const p of checkList) {
      const [h, m] = p.time.split(':').map(Number);
      if (h * 60 + m > currentTime) {
        setNextPrayer(p.name);
        return;
      }
    }
    setNextPrayer('Fajr'); // Next day
  };

  const formatTime = (time24: string) => {
    if (!time24) return '--:--';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  if (loading || !timings) {
    return (
      <div className="card h-full flex flex-col justify-center items-center animate-pulse gap-4">
         <RefreshCw className="animate-spin text-v4-gold opacity-20" size={32} />
         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Syncing Spiritual HQ...</span>
      </div>
    );
  }

  const prayers = [
    { name: 'Fajr', time: formatTime(timings.Fajr) },
    { name: 'Sunrise', time: formatTime(timings.Sunrise) },
    { name: 'Zuhur', time: formatTime(timings.Zuhr) },
    { name: 'Asr', time: formatTime(timings.Asr) },
    { name: 'Sunset', time: formatTime(timings.Sunset) },
    { name: 'Maghrib', time: formatTime(timings.Maghrib) },
    { name: 'Isha', time: formatTime(timings.Isha) },
  ];

  return (
    <section className="card overflow-hidden shadow-2xl relative group no-drag flex-shrink-0">
      <div className="card-hdr !bg-accent-main !text-white border-b-0">
        <div className="dot !bg-white"></div>
        SYSTEM PROTOCOL • NAMAZ TIMINGS
      </div>
      <div className="card-body !pt-2 pb-6 px-8 h-full">
        {/* Decorative Background Icon */}
        <div className="absolute -bottom-10 -right-10 text-white/[0.02] pointer-events-none">
           <BellRing size={200} />
        </div>

        {/* Main Prayers Grid (Circular) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
           {prayers.map((p, i) => {
             const [h24, m] = timings[p.name === 'Zuhur' ? 'Zuhr' : p.name as keyof Timings]?.split(':').map(Number) || [0, 0];
             const hDeg = ((h24 % 12) + m / 60) * 30;
             const mDeg = m * 6;

             return (
               <div 
                 key={p.name}
                 className={clsx(
                   "flex flex-col items-center gap-3 p-4 circular-pod transition-all duration-700 group/prayer relative aspect-square justify-center border border-white/5 shadow-2xl",
                   nextPrayer === p.name 
                     ? "bg-accent-main/10 border-accent-main/20 shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]" 
                     : "bg-black/20 "
                 )}
               >
                  {/* Miniature Analog Clock Face */}
                  <div className="relative w-14 h-14 circular-pod border border-white/10 glass-sm shadow-inner flex items-center justify-center">
                    {/* Next Indicator Glow */}
                    {nextPrayer === p.name && (
                       <div className="absolute inset-0 rounded-full bg-accent-main/5 animate-pulse" />
                    )}

                    {/* Hands */}
                    <div 
                      className="absolute w-0.5 h-4 bg-accent-main rounded-full origin-bottom mb-4 transition-transform duration-1000 ease-in-out"
                      style={{ transform: `rotate(${hDeg}deg)` }}
                    />
                    <div 
                      className="absolute w-[1px] h-5 bg-white/40 rounded-full origin-bottom mb-5 transition-transform duration-1000 ease-in-out"
                      style={{ transform: `rotate(${mDeg}deg)` }}
                    />
                    <div className="absolute w-1 h-1 bg-accent-main rounded-full z-10" />
                  </div>

                  <div className="text-center">
                     <p className={clsx(
                       "text-[7px] font-black uppercase tracking-[0.2em] mb-0.5",
                       nextPrayer === p.name ? "text-accent-main" : "text-white/40"
                     )}>{p.name}</p>
                     <p className={clsx(
                       "text-[10px] font-black tracking-tighter tabular-nums",
                       nextPrayer === p.name ? "text-v4-cream" : "text-white/60"
                     )}>{p.time.replace(' AM', '').replace(' PM', '')}</p>
                  </div>
               </div>
             );
           })}
        </div>

        {/* Footer Meta */}
        <div className="flex items-center gap-4 text-[9px] font-bold text-white/10 uppercase tracking-[0.3em] mt-auto">
           {/* Space for future operational metadata */}
        </div>
      </div>
    </section>
  );
}
