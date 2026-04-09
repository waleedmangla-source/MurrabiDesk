"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  RefreshCw,
  Globe,
  Bell,
  Search,
  Filter,
  CalendarDays,
  Activity,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { GoogleSyncService } from '@/lib/google-sync-service';
import EventModal, { EventType } from '@/components/EventModal';

interface MissionEvent {
  id: string;
  summary: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type: EventType;
  isSyncing?: boolean;
}

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<MissionEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const ranges = {
      month: () => ({
        start: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1),
        end: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
      }),
      week: () => {
        const start = new Date(viewDate);
        start.setDate(viewDate.getDate() - viewDate.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
      },
      day: () => ({
        start: new Date(viewDate),
        end: new Date(viewDate)
      })
    };

    const { start, end } = ranges[viewMode]();
    fetchEvents(false, start.toISOString(), end.toISOString());
  }, [viewDate, viewMode]);

  const fetchEvents = async (force = false, timeMin?: string, timeMax?: string) => {
    setIsSyncing(true);
    
    // If no bounds provided, default to current view context
    let tMin = timeMin;
    let tMax = timeMax;
    if (!tMin || !tMax) {
      const today = new Date(viewDate);
      if (viewMode === 'month') {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        tMin = start.toISOString(); tMax = end.toISOString();
      } else if (viewMode === 'week') {
        const start = new Date(today); start.setDate(today.getDate() - today.getDay());
        const end = new Date(start); end.setDate(start.getDate() + 6);
        tMin = start.toISOString(); tMax = end.toISOString();
      } else {
        tMin = today.toISOString(); tMax = today.toISOString();
      }
    }

    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
      try {
        const googleEvents = await service.getCalendarEvents(force, tMin, tMax);
        const mapped: MissionEvent[] = googleEvents.map((ge: any) => ({
          id: ge.id,
          summary: ge.summary || 'Untitled Objective',
          startTime: new Date(ge.start?.dateTime || ge.start?.date || ''),
          endTime: new Date(ge.end?.dateTime || ge.end?.date || ''),
          location: ge.location,
          type: inferType(ge.summary, ge.description)
        }));
        setEvents(mapped);
      } catch (err) {
        console.error('Calendar Fetch Error:', err);
      }
    }
    setIsSyncing(false);
  };

  const inferType = (summary: string = '', description: string = ''): EventType => {
    const combined = (summary + description).toLowerCase();
    if (combined.includes('prayer') || combined.includes('namaz') || combined.includes('salat')) return 'prayer';
    if (combined.includes('meeting') || combined.includes('amila')) return 'meeting';
    if (combined.includes('outreach') || combined.includes('tabligh')) return 'outreach';
    return 'personal';
  };

  const handleAddEvent = async (eventData: any) => {
    // Optimistic Update
    const tempId = Math.random().toString(36);
    const newLocalEvent: MissionEvent = {
        id: tempId,
        summary: eventData.summary,
        startTime: new Date(eventData.start.dateTime),
        endTime: new Date(eventData.end.dateTime),
        location: eventData.location,
        type: inferType(eventData.summary, eventData.description),
        isSyncing: true
    };
    
    setEvents(prev => [...prev, newLocalEvent]);

    const service = await GoogleSyncService.fromLocalStorage();
    if (service) {
        try {
            await service.createCalendarEvent(eventData);
            await fetchEvents(true); // Final reconciliation
        } catch (err) {
            console.error('Remote sync failure:', err);
            // Revert or show error
            setEvents(prev => prev.filter(e => e.id !== tempId));
        }
    }
  };

  const calendarGrid = useMemo(() => {
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const days: (Date | null)[] = Array(startDay).fill(null);
    for (let d = 1; d <= endOfMonth.getDate(); d++) {
      days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    }
    return days;
  }, [viewDate]);

  const weekGrid = useMemo(() => {
    const start = new Date(viewDate);
    start.setDate(viewDate.getDate() - viewDate.getDay());
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
    }
    return days;
  }, [viewDate]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, MissionEvent[]> = {};
    events.forEach(event => {
      const dateKey = event.startTime.toDateString();
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(event);
    });
    return map;
  }, [events]);

  const dayEvents = useMemo(() => {
    return (eventsByDate[viewDate.toDateString()] || [])
        .sort((a,b) => a.startTime.getTime() - b.startTime.getTime());
  }, [eventsByDate, viewDate]);

  const groupedUpcomingFeed = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sorted = events
      .filter(e => e.startTime >= today)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const groups: { date: string, events: MissionEvent[] }[] = [];
    sorted.forEach(event => {
      const dateStr = event.startTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase();
      let group = groups.find(g => g.date === dateStr);
      if (!group) {
        group = { date: dateStr, events: [] };
        groups.push(group);
      }
      group.events.push(event);
    });
    return groups;
  }, [events]);

  const changeMonth = (val: number) => {
    const next = new Date(viewDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + val);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + (val * 7));
    } else {
      next.setDate(next.getDate() + val);
    }
    setViewDate(next);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const todayEvents = events.filter(e => isToday(e.startTime));
  const nextEvent = groupedUpcomingFeed[0]?.events[0];

  const diagnosticChecks = useMemo(() => [
    { label: "Mission Load", status: todayEvents.length > 3 ? "HEAVY" : "STABLE", val: `${todayEvents.length} Active`, icon: Activity, color: todayEvents.length > 0 ? "text-emerald-500" : "text-blue-500" },
    { label: "Sync Status", status: isSyncing ? "SYNCING" : (isOnline ? "STABLE" : "OFFLINE"), val: isOnline ? "Connected" : "Disconnected", icon: RefreshCw, color: isOnline ? "text-emerald-500" : "text-red-500" },
    { label: "Active Tasks", status: "v4-STABLE", val: `${events.length} Total`, icon: CalendarDays, color: "text-blue-500" },
    { label: "Next Objective", status: "PENDING", val: nextEvent ? nextEvent.summary : "None", icon: Clock, color: "text-v4-gold" }
  ], [todayEvents.length, isSyncing, isOnline, events.length, nextEvent]);

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      {/* Beta Tools Header Section */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Mission <span className="text-red-600">Calendar</span></h1>
          <p className="text-white/30 max-w-xl mt-2 font-black uppercase tracking-[0.3em] text-[9px]">
             Experimental Administrative Temporal Coordination Protocol
          </p>
        </div>
        
        <div className="flex gap-4">
           {/* View Toggle Switcher */}
           <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={clsx(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === mode ? "bg-red-600 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                  )}
                >
                  {mode}
                </button>
              ))}
           </div>

           <button 
             onClick={() => fetchEvents(true)}
             className={clsx(
               "btn-v4 px-6 flex items-center gap-2 group",
               isSyncing && "opacity-50 pointer-events-none"
             )}
           >
              <RefreshCw size={14} className={clsx(isSyncing && "animate-spin", "group-hover:rotate-180 transition-transform duration-700")} />
              Sync Protocol
           </button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-white text-black flex items-center gap-2 px-6 h-9 rounded-full font-black hover:bg-gray-100 active:scale-95 transition-all text-[10px] uppercase tracking-widest shadow-xl"
           >
              <Plus size={16} />
              Add Task
           </button>
        </div>
      </div>

      {/* Primary Diagnostic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {diagnosticChecks.map((check) => (
          <div key={check.label} className="glass p-5 flex flex-col gap-3 relative overflow-hidden group">
            <div className={clsx("p-2 rounded-lg w-fit", check.color, "bg-current opacity-10 absolute -right-2 -top-2 scale-150 blur-xl")} />
            <div className="flex items-center justify-between relative z-10">
              <check.icon className={check.color} size={20} />
              <span className={clsx("text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-black/40", check.color)}>
                {check.status}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-dim text-[10px] font-bold uppercase tracking-wider">{check.label}</p>
              <h3 className="text-lg font-black tracking-tighter mt-1 truncate">{check.val}</h3>
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden min-h-0">
        {/* Main Grid View: Open Fluid Layout */}
        <div className="lg:col-span-2 glass flex flex-col overflow-hidden group min-h-0">
           <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                 <CalendarDays size={16} className="text-red-500" />
                 <span className="text-xs font-black tracking-tight text-white/60">Mission Timeline Grid</span>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => changeMonth(-1)} className="p-1 hover:text-white text-white/30 transition-colors"><ChevronLeft size={16}/></button>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{months[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                 <button onClick={() => changeMonth(1)} className="p-1 hover:text-white text-white/30 transition-colors"><ChevronRight size={16}/></button>
              </div>
           </div>

           <div className="flex-1 p-6 flex flex-col min-h-0">
             {viewMode === 'month' && (
                <>
                  <div className="grid grid-cols-7 mb-4 shrink-0">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="py-2 text-center text-xs font-black text-red-600/30 uppercase tracking-[0.5em]">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-2 min-h-0">
                    {calendarGrid.map((date, idx) => {
                      const currentIsToday = date ? isToday(date) : false;
                      const isSelected = date ? selectedDate.toDateString() === date.toDateString() : false;
                      const dayEventsThisDay = date ? (eventsByDate[date.toDateString()] || []) : [];
                      return (
                        <div 
                          key={idx}
                          onClick={() => date && setSelectedDate(date)}
                          className={clsx(
                            "h-full rounded-2xl flex flex-col items-center justify-center relative transition-all border group cursor-pointer p-1",
                            !date ? "bg-white/[0.01] border-transparent opacity-5 pointer-events-none" : 
                            currentIsToday ? "bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.3)] border-red-500 text-white z-10" :
                            isSelected ? "bg-red-600/30 border-red-500/50 text-white shadow-xl" :
                            "glass border-white/5 text-white/30 hover:text-white hover:bg-white/10 hover:border-white/10"
                          )}
                        >
                          {date && (
                            <>
                              <span className={clsx("text-sm font-black tracking-tighter", currentIsToday ? "" : "")}>
                                {date.getDate()}
                              </span>
                              <div className="absolute bottom-2 flex gap-1">
                                {dayEventsThisDay.slice(0, 3).map(e => (
                                  <div key={e.id} className={clsx("w-1 h-1 rounded-full", currentIsToday ? "bg-white" : "bg-red-500")} />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
             )}

             {viewMode === 'week' && (
               <div className="flex-1 grid grid-cols-7 gap-4 min-h-0">
                  {weekGrid.map((date) => {
                    const currentIsToday = isToday(date);
                    const isSelected = selectedDate.toDateString() === date.toDateString();
                    const dayEventsThisWeek = eventsByDate[date.toDateString()] || [];
                    return (
                      <div 
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={clsx(
                          "flex-1 glass rounded-3xl border border-white/5 flex flex-col overflow-hidden transition-all",
                          currentIsToday ? "border-red-500/40 bg-red-600/5 shadow-2xl" : 
                          isSelected ? "border-white/20 bg-white/5" : ""
                        )}
                      >
                         <div className={clsx(
                           "p-4 border-b text-center shrink-0",
                           currentIsToday ? "bg-red-600 text-white border-red-500/20" : "bg-black/20 border-white/5"
                         )}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            <p className="text-xl font-black mt-1">{date.getDate()}</p>
                         </div>
                         <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2">
                            {dayEventsThisWeek.map(event => (
                              <div key={event.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-red-500/20 transition-all cursor-pointer">
                                 <p className="text-[10px] font-black text-white truncate">{event.summary}</p>
                                 <p className="text-[8px] font-bold text-white/40 mt-1 uppercase tracking-widest">
                                    {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                              </div>
                            ))}
                         </div>
                      </div>
                    );
                  })}
               </div>
             )}

             {viewMode === 'day' && (
               <div className="flex-1 glass rounded-[40px] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-white/5 bg-black/20 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500/60">Selected Objective Timeline</span>
                        <h2 className="text-4xl font-black text-white italic mt-2 tracking-tighter">
                          {viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h2>
                     </div>
                     <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(220,38,38,0.3)]">
                        <CalendarIcon size={32} />
                     </div>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                     <div className="space-y-6">
                        {dayEvents.length > 0 ? dayEvents.map((event, i) => (
                          <div key={event.id} className="flex gap-8 group">
                             <div className="w-24 shrink-0 flex flex-col items-end pt-2">
                                <span className="text-sm font-black text-white italic tracking-tighter">{event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <div className="h-full w-px bg-white/5 mt-4 group-last:hidden" />
                             </div>
                             <div className="flex-1 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-red-500/30 transition-all shadow-xl hover:bg-white/[0.05]">
                                <div className="flex items-start justify-between">
                                   <div>
                                      <h4 className="text-xl font-bold text-white tracking-tight">{event.summary}</h4>
                                      <p className="text-[10px] font-bold text-white/20 mt-1 uppercase tracking-[0.2em]">{event.location || 'No Location Specified'}</p>
                                   </div>
                                   <div className={clsx(
                                      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                      event.type === 'prayer' ? "bg-teal-500/20 text-teal-400" :
                                      event.type === 'meeting' ? "bg-red-600/20 text-red-400" :
                                      "bg-white/10 text-white/50"
                                   )}>
                                      {event.type}
                                   </div>
                                </div>
                             </div>
                          </div>
                        )) : (
                           <div className="h-full flex flex-col items-center justify-center text-white/10 opacity-20 py-24">
                              <ShieldCheck size={120} strokeWidth={0.5} />
                              <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-8">No Scheduled Objectives</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
             )}
           </div>
        </div>

         {/* Sidebar: Upcoming Mission Feed */}
         <div className="glass flex flex-col overflow-hidden min-h-0">
            <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-black/20">
               <Globe size={16} className="text-blue-500" />
               <span className="text-xs font-black tracking-tight text-white/60">Mission Objectives Queue</span>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
               {groupedUpcomingFeed.length > 0 ? (
                  groupedUpcomingFeed.map(group => (
                     <div key={group.date} className="space-y-4">
                        <div className="sticky top-0 z-20 flex items-center gap-4 py-3 bg-v4-black/80 backdrop-blur-md">
                           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/60 whitespace-nowrap">{group.date}</span>
                           <div className="h-px flex-1 bg-gradient-to-r from-red-500/20 to-transparent" />
                        </div>
                        
                        <div className="space-y-4">
                           {group.events.map(event => (
                              <div key={event.id} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-all flex gap-6 relative overflow-hidden shadow-sm hover:shadow-xl hover:bg-white/[0.05]">
                                 {event.isSyncing && (
                                    <div className="absolute top-2 right-4 flex items-center gap-2">
                                       <RefreshCw size={10} className="animate-spin text-red-500" />
                                       <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Syncing</span>
                                    </div>
                                 )}
                                 <div className={clsx(
                                    "w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg transition-all group-hover:scale-110",
                                    event.type === 'prayer' ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-teal-900/20" :
                                    event.type === 'meeting' ? "bg-red-600/10 text-red-500 border border-red-500/20 shadow-red-900/20" :
                                    event.type === 'outreach' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-indigo-900/20" :
                                    "bg-white/5 text-white/40 border border-white/10"
                                 )}>
                                    <Clock size={20} className="opacity-40" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h4 className="font-extrabold text-white text-xs tracking-tight italic group-hover:text-white transition-colors truncate">{event.summary}</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-2">
                                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                                         <Clock size={10} className="text-red-500/60" />
                                         {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                      {event.location && (
                                         <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5 truncate">
                                            <MapPin size={10} className="text-white/10" />
                                            {event.location}
                                         </p>
                                      )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))
               ) : (
                 <div className="h-64 flex flex-col items-center justify-center p-12 border border-dashed border-white/5 rounded-3xl text-white/5 bg-black/5">
                    <CalendarIcon size={64} className="mb-4 opacity-5 text-red-600" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Upcoming Tasks</p>
                 </div>
               )}
            </div>


            <div className="p-4 border-t border-white/5 bg-black/20">
               <button 
                 onClick={() => setShowAddModal(true)}
                 className="btn-v4 w-full bg-white text-black font-black uppercase tracking-widest py-3 hover:bg-gray-100 transition-all active:scale-95 text-[10px]"
               >
                 <Plus size={14} className="mr-2" />
                 Initialize Mission Objective
               </button>
            </div>
         </div>
      </div>


      <EventModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSubmit={handleAddEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}
