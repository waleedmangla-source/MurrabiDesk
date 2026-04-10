"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface DashboardCalendarProps {
  className?: string;
}

const DashboardCalendar: React.FC<DashboardCalendarProps> = ({ className }) => {
  const [viewDate, setViewDate] = useState(new Date());
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Mock mission days for visual fidelity
  const missionDays = [3, 7, 12, 15, 23, 27]; 

  return (
    <div className={clsx("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="text-xl font-black text-main tracking-tight italic">
          {monthNames[month]} <span className="text-accent-main opacity-60 ml-1">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2.5 rounded-2xl glass border border-white/5 text-white/30   transition-all active:scale-90"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2.5 rounded-2xl glass border border-white/5 text-white/30   transition-all active:scale-90"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-[10px] font-black text-accent-main opacity-30 uppercase tracking-widest py-2">
            {d}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2 flex-grow auto-rows-fr">
        {/* Padding for start of month */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square rounded-xl bg-white/[0.01] border border-white/[0.02] opacity-20" />
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const hasMission = missionDays.includes(day);
          
          return (
            <div 
              key={day}
              className={clsx(
                "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all border group cursor-pointer",
                isToday 
                  ? "bg-accent-main shadow-2xl shadow-accent-soft border-accent-glow text-white z-10" 
                  : "glass border-white/5 text-white/40  "
              )}
            >
              <span className={clsx(
                "text-sm font-black tracking-tighter",
                isToday ? "scale-110" : ""
              )}>
                {day}
              </span>
              
              {hasMission && !isToday && (
                <div className="absolute bottom-2 w-1 h-1 rounded-full bg-accent-main shadow-accent-glow" />
              )}
              
              {hasMission && isToday && (
                <div className="absolute bottom-2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardCalendar;
