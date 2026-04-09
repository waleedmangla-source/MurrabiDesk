"use client";
import React, { useState, useEffect } from "react";
import { 
  Beaker, 
  Activity, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Zap,
  RefreshCw,
  Search,
  Lock,
  Globe,
  Plus
} from "lucide-react";
import { clsx } from "clsx";

const BOLD_ACCENT = "text-red-500";

export default function BetaToolsPage() {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "Initializing Beta Environment Protocol 7.5...",
    "Loading Mach-O Diagnostic Suite...",
    "Checking System Integrity Protection (SIP) status...",
    "Ready."
  ]);

  const diagnosticChecks = [
    { label: "Code Signature", status: "VALID", icon: ShieldCheck, color: "text-emerald-500" },
    { label: "Mach Port Check-in", status: "STABLE", icon: Activity, color: "text-emerald-500" },
    { label: "Library Validation", status: "ENFORCED", icon: Lock, color: "text-emerald-500" },
    { label: "Process Identity", status: "v6-STABLE", icon: Cpu, color: "text-blue-500" }
  ];

  const portStatus = [
    { port: 8877, service: "Primary Dashboard", status: "ACTIVE", load: "1.2%" },
    { port: 8899, service: "Recovery Shell", status: "IDLE", load: "0.0%" },
    { port: 7777, service: "Legacy Asset Sync", status: "CLOSED", load: "0.0%" }
  ];

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      {/* Beta Tools Header Section */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Beta <span className="text-red-600">Tools</span></h1>
          <p className="text-white/30 max-w-xl mt-2 font-black uppercase tracking-[0.3em] text-[10px]">
             Experimental administrative utilities and process identity diagnostics
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-3 px-6 h-12 bg-white/5 border border-white/5 rounded-2xl text-v4-ink/40 hover:text-red-500 hover:border-red-500/30 transition-all font-black uppercase text-[10px] tracking-widest group">
             <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
             Reload Environment
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
              <h3 className="text-lg font-black tracking-tighter mt-1">System Verified</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Proxy */}
        <div className="lg:col-span-2 glass flex flex-col h-[400px] overflow-hidden group">
           <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                 <Terminal size={16} className="text-red-500" />
                 <span className="text-xs font-bold tracking-tight text-white/60">Admin Shell Proxy v1.2</span>
              </div>
              <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                 <div className="w-2.5 h-2.5 rounded-full bg-orange-500/20" />
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
              </div>
           </div>
           <div className="flex-1 p-6 font-mono text-[11px] text-white/40 overflow-y-auto custom-scrollbar space-y-1 bg-black/40">
              {terminalOutput.map((line, i) => (
                <div key={i} className="flex gap-3">
                   <span className="text-red-500/40 select-none">$</span>
                   <span>{line}</span>
                </div>
              ))}
              <div className="flex gap-3 animate-pulse">
                 <span className="text-red-500/40">$</span>
                 <span className="w-2 h-4 bg-red-500/40" />
              </div>
           </div>
        </div>

        {/* Port Master */}
        <div className="glass flex flex-col h-[400px] overflow-hidden">
           <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-black/20">
              <Globe size={16} className="text-blue-500" />
              <span className="text-xs font-bold tracking-tight text-white/60">Network Port Auditor</span>
           </div>
           <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
              {portStatus.map((port) => (
                <div key={port.port} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2 hover:bg-white/[0.05] transition-all">
                   <div className="flex items-center justify-between">
                      <span className="text-lg font-black tracking-tighter text-white/90">Port {port.port}</span>
                      <span className={clsx(
                        "text-[8px] font-black px-2 py-0.5 rounded-md",
                        port.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                      )}>
                        {port.status}
                      </span>
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-dim">{port.service}</span>
                      <span className="text-red-500/60">CPU: {port.load}</span>
                   </div>
                </div>
              ))}
              
              <div className="mt-8 p-4 rounded-xl border border-dashed border-white/10 flex items-center justify-center gap-3 text-dim hover:text-white/40 hover:border-white/20 transition-all cursor-pointer">
                 <Plus size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Reserve Port</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
