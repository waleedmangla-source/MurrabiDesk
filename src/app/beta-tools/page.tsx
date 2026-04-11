import React from 'react';
import FlightFinder from '@/components/beta/FlightFinder';
import { Rocket, Shield, Terminal, Zap, Globe, Cpu, X } from 'lucide-react';

export default function BetaToolsPage() {
  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="p-12 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center text-emerald-400">
                <Rocket size={24} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Beta <span className="text-emerald-500">Protocols</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">Experimental Workspace • v1.0.6-delta</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tool Card 1 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:bg-white/[0.07] transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <Terminal size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Neural Engine</h3>
                <p className="text-[10px] uppercase font-bold text-white/40 leading-relaxed tracking-wider">Experimental AI node for advanced pattern recognition Across system logs.</p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded">Standby</span>
                  <Zap size={14} className="text-white/20" />
                </div>
              </div>
            </div>

            {/* Tool Card 2 */}
            <div className="group relative">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
               <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:bg-white/[0.07] transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                  <Globe size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Global Sync</h3>
                <p className="text-[10px] uppercase font-bold text-white/40 leading-relaxed tracking-wider">Distributed synchronization protocol for real-time data integrity.</p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Offline</span>
                  <Shield size={14} className="text-white/20" />
                </div>
              </div>
            </div>

            {/* Tool Card 3 */}
            <div className="group relative">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
               <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:bg-white/[0.07] transition-all">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 mb-6 group-hover:scale-110 transition-transform">
                  <Cpu size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white/60 mb-2">Resource Monitor</h3>
                <p className="text-[10px] uppercase font-bold text-white/20 leading-relaxed tracking-wider">Low-level hardware telemetry and heat mapping for high-load tasks.</p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Disabled</span>
                  <X size={14} className="text-white/10" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
            <div className="flex items-center gap-4 text-white/40">
              <Shield size={18} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">All experimental protocols are sandboxed and monitored by the primary kernel.</p>
            </div>
          </div>
        </main>
      </div>

      {/* Flight Finder Secondary Sidebar */}
      <FlightFinder />
    </div>
  );
}
