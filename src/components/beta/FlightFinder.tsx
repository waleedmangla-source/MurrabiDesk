"use client";

import React, { useState, useEffect } from 'react';
import { Plane, Search, Bell, TrendingDown, Clock, X, Terminal, ChevronRight } from 'lucide-react';
import { Flight, Itinerary, searchFlights } from '@/lib/flight-service';
import clsx from 'clsx';

export default function FlightFinder() {
  const [origin, setOrigin] = useState('JFK');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(500);
  const [isSearching, setIsSearching] = useState(false);
  const [recentFinds, setRecentFinds] = useState<Flight[]>([]);
  const [activeTrackers, setActiveTrackers] = useState<Itinerary[]>([]);

  const handleTrack = async () => {
    if (!destination) return;
    setIsSearching(true);
    
    // Simulate finding a flight
    const results = await searchFlights(origin, destination, '2026-06-15');
    if (results.length > 0) {
      setRecentFinds(prev => [...results, ...prev]);
    }
    
    const newTracker: Itinerary = {
      id: Math.random().toString(36).substr(2, 9),
      src: origin,
      dst: destination,
      budget: budget,
      leaveDates: ['2026-06-15'],
      returnDates: ['2026-06-22'],
      status: 'active',
      lastScan: new Date().toLocaleTimeString()
    };
    
    setActiveTrackers(prev => [newTracker, ...prev]);
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border-l border-white/10 w-80 text-white overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Plane size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Cheap Finds</h2>
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Beta Flight Protocol</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Search & Track Section */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/40 tracking-widest">Origin</label>
                <input 
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  className="w-full bg-transparent border-none p-0 text-sm font-black focus:ring-0 placeholder:text-white/10"
                  placeholder="NYC"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/40 tracking-widest">To</label>
                <input 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  className="w-full bg-transparent border-none p-0 text-sm font-black focus:ring-0 placeholder:text-white/10 text-emerald-400"
                  placeholder="LON"
                />
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/40 tracking-widest">Budget</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-white/30">$</span>
                  <input 
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    className="w-16 bg-transparent border-none p-0 text-sm font-black focus:ring-0"
                  />
                </div>
              </div>
              <button 
                onClick={handleTrack}
                disabled={isSearching}
                className={clsx(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  isSearching 
                    ? "bg-white/10 text-white/30 cursor-not-allowed" 
                    : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
                )}
              >
                {isSearching ? 'Scanning...' : 'Track'}
              </button>
            </div>
          </div>
        </section>

        {/* Active Trackers */}
        {activeTrackers.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                <Bell size={12} className="text-emerald-400" />
                Active Trackers
              </h3>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/10 text-white/60">{activeTrackers.length}</span>
            </div>
            <div className="space-y-2">
              {activeTrackers.map(tracker => (
                <div key={tracker.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/[0.07] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <Search size={14} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-tighter">
                        <span>{tracker.src}</span>
                        <ChevronRight size={10} className="text-white/20" />
                        <span className="text-emerald-400">{tracker.dst}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={8} className="text-white/30" />
                        <span className="text-[7px] text-white/30 uppercase font-bold tracking-widest">Last Scan: {tracker.lastScan}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black">${tracker.budget}</div>
                    <div className="text-[6px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">Monitoring</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Finds */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              <TrendingDown size={12} className="text-emerald-400" />
              Cheap Opportunities
            </h3>
          </div>
          
          <div className="space-y-3">
            {recentFinds.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                <Terminal size={20} className="text-white/10 mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 leading-loose">
                  No price drops detected<br/>in current cycle
                </p>
              </div>
            ) : (
              recentFinds.slice(0, 5).map(flight => (
                <div key={flight.id} className="relative group animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[7px] font-black text-emerald-400 uppercase tracking-widest mb-1">Detected Ticket</div>
                        <div className="text-xs font-black tracking-tighter uppercase">{flight.src} → {flight.dst}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-400 leading-none">${flight.price}</div>
                        <div className="text-[7px] font-bold text-white/30 uppercase tracking-widest mt-1 italic">Save 34%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-white/40 text-[8px] font-bold">
                           {flight.airline?.charAt(0)}
                         </div>
                         <span className="text-[8px] font-black uppercase tracking-tight text-white/50">{flight.airline}</span>
                      </div>
                      <button className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Footer / Status */}
      <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[7px] font-black uppercase tracking-widest text-white/30">Protocol Active</span>
        </div>
        <button className="p-1 px-2 rounded-md hover:bg-white/5 transition-colors">
          <span className="text-[7px] font-black uppercase tracking-widest text-white/30 hover:text-white/60">Advanced Settings</span>
        </button>
      </div>
    </div>
  );
}
