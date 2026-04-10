"use client";

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  RefreshCw, 
  Globe, 
  Eye, 
  EyeOff, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Lock, 
  Cloud, 
  Bell, 
  FileDigit, 
  Layout, 
  Monitor,
  AlertTriangle
} from "lucide-react";
import { clsx } from "clsx";
import { GoogleSyncService } from '@/lib/google-sync-service';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wipeLock, setWipeLock] = useState(true);

  // Settings State
  const [settings, setSettings] = useState({
    syncFrequency: '5m',
    showWorldClock: true,
    showPrayerTimes: true,
    showAIPrompts: true,
    notificationsEnabled: true,
    highDensityMode: false,
    signatureData: null as string | null,
    accentColor: 'red'
  });

  useEffect(() => {
    setMounted(true);
    // Load Accent preference
    const saved = localStorage.getItem('murrabi_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.accentColor) setSettings(prev => ({ ...prev, accentColor: parsed.accentColor }));
      else if (parsed.theme === 'ruby') setSettings(prev => ({ ...prev, accentColor: 'red' }));
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('murrabi_settings', JSON.stringify(settings));
    
    // Specifically trigger dashboard updates if needed
    localStorage.setItem('murrabi_show_worldclocks', settings.showWorldClock.toString());
    localStorage.setItem('murrabi_show_prayertimes', settings.showPrayerTimes.toString());

    // Trigger global accent change if needed
    if (typeof window !== 'undefined') {
       // We refresh the page or rely on layout state. 
       // For instant preview in this window:
       window.location.reload(); 
    }

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  const handleWipeProtocol = () => {
    if (wipeLock) return;
    
    // Destructive Wipe
    const keysToWipe = [
      'cache_calendar', 
      'cache_gmail', 
      'cache_notes', 
      'mission_notes_browser_fallback',
      'murrabi_profile_custom',
      'google_sync_status'
    ];
    
    keysToWipe.forEach(key => localStorage.removeItem(key));
    alert("WIPE COMPLETE: Mission Cache Purged.");
    router.push('/');
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, signatureData: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!mounted) return null;

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      {/* Beta Tools Header Section */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Mission <span className="text-red-600">Settings</span></h1>
          <p className="text-white/30 max-w-xl mt-2 font-black uppercase tracking-[0.3em] text-[10px]">
             Operational Infrastructure & Protocol Configuration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12 no-drag">
        {/* Sync Protocol Widget */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] h-full flex flex-col">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
                   <RefreshCw size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white italic tracking-tight">Mission Sync Gateway</h3>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none mt-1">Google Workspace Connectivity</p>
                </div>
             </div>

             <div className="space-y-8 flex-grow">
                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-4">
                      <Cloud size={20} className="text-white/40" />
                      <div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Protocol Status</div>
                         <div className="text-sm font-bold text-white">Encrypted WebSocket Active</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 text-[9px] font-black uppercase text-green-500">
                      Synchronized
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-v4-ink-muted">Sync Frequency Pulse</label>
                   <div className="grid grid-cols-3 gap-3">
                      {['5m', '15m', '1h'].map(freq => (
                         <button
                           key={freq}
                           onClick={() => setSettings(prev => ({ ...prev, syncFrequency: freq }))}
                           className={clsx(
                             "py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border",
                             settings.syncFrequency === freq 
                               ? "bg-red-600 border-red-500/50 text-white shadow-lg shadow-red-500/20" 
                               : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                           )}
                         >
                            {freq}
                         </button>
                      ))}
                   </div>
                </div>

                <button className="w-full h-14 rounded-2xl bg-white/5 border border-white/5 text-v4-ink text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600/10 hover:text-red-500 transition-all">
                   Force Protocol Resync
                </button>
             </div>
          </div>
        </div>

        {/* Visual Protocol Overrides */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] h-full">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
                   <Layout size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white italic tracking-tight">Display Protocols</h3>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none mt-1">Interface Density & Visibility</p>
                </div>
             </div>

             <div className="space-y-4">
                <ToggleRow 
                  icon={<Globe size={18} />} 
                  label="Dashboard WorldClock" 
                  description="Show world time zones in Dashboard"
                  active={settings.showWorldClock}
                  onToggle={() => setSettings(prev => ({ ...prev, showWorldClock: !prev.showWorldClock }))}
                />
                <ToggleRow 
                  icon={<Bell size={18} />} 
                  label="Prayer Times Widget" 
                  description="Display spiritual alignments"
                  active={settings.showPrayerTimes}
                  onToggle={() => setSettings(prev => ({ ...prev, showPrayerTimes: !prev.showPrayerTimes }))}
                />
                <ToggleRow 
                  icon={<Monitor size={18} />} 
                  label="Mission Shortcuts" 
                  description="Contextual AI action rows"
                  active={settings.showAIPrompts}
                  onToggle={() => setSettings(prev => ({ ...prev, showAIPrompts: !prev.showAIPrompts }))}
                />
                <ToggleRow 
                  icon={<Monitor size={18} />} 
                  label="High Density UI" 
                  description="Minimize padding for expert users"
                  active={settings.highDensityMode}
                  onToggle={() => setSettings(prev => ({ ...prev, highDensityMode: !prev.highDensityMode }))}
                />
             </div>
          </div>
        </div>

        {/* Mission Accent Protocol selection */}
        <div className="col-span-12">
           <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] h-full">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 bg-accent-soft rounded-2xl flex items-center justify-center text-accent-main shadow-xl shadow-accent-soft">
                    <Monitor size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-white italic tracking-tight">Mission Accent Protocol</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none mt-1">Global Color Identity Override</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <p className="text-[10px] font-bold text-white/40 leading-relaxed max-w-2xl">
                    Select a Mission Accent to transform all primary UI elements, interactive states, and glowing auras across the entire Murrabi Desk suite.
                 </p>
                 
                 <div className="flex flex-wrap gap-6 items-end">
                    {[
                       { id: 'red', name: 'Murrabi Red', hex: '#ef4444' },
                       { id: 'indigo', name: 'Indigo Mission', hex: '#6366f1' },
                       { id: 'emerald', name: 'Emerald Scholarly', hex: '#10b981' },
                       { id: 'amber', name: 'Amber Prophetic', hex: '#f59e0b' },
                       { id: 'violet', name: 'Aura Violet', hex: '#8b5cf6' }
                    ].map(color => (
                       <button
                         key={color.id}
                         onClick={() => setSettings(prev => ({ ...prev, accentColor: color.id }))}
                         className={clsx(
                           "group relative flex flex-col items-center gap-3 transition-all",
                           settings.accentColor === color.id ? "scale-110" : "opacity-40 hover:opacity-100"
                         )}
                       >
                          <div 
                            className="w-16 h-16 rounded-full border-4 transition-all shadow-2xl"
                            style={{ 
                               backgroundColor: color.hex,
                               borderColor: settings.accentColor === color.id ? 'white' : 'transparent',
                               boxShadow: settings.accentColor === color.id ? `0 0 30px ${color.hex}80` : 'none'
                             }}
                          />
                          <div className={clsx(
                             "text-[9px] font-black uppercase tracking-widest transition-opacity",
                             settings.accentColor === color.id ? "opacity-100 text-white" : "opacity-0"
                          )}>
                             {color.name}
                          </div>
                          
                          {settings.accentColor === color.id && (
                             <div className="absolute -top-1 -right-1 bg-white text-black p-1 rounded-full shadow-lg">
                                <CheckCircle2 size={12} />
                             </div>
                          )}
                       </button>
                    ))}

                    {/* Divider */}
                    <div className="w-px h-16 bg-white/10 mx-2" />

                    {/* Creamy White Theme */}
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, accentColor: 'creamy' }))}
                      className={clsx(
                        "group relative flex flex-col items-center gap-3 transition-all",
                        settings.accentColor === 'creamy' ? "scale-110" : "opacity-40 hover:opacity-100"
                      )}
                    >
                      <div 
                        className="w-16 h-16 rounded-full border-4 transition-all shadow-2xl relative overflow-hidden"
                        style={{ 
                          backgroundColor: '#faf7f0',
                          borderColor: settings.accentColor === 'creamy' ? '#44403c' : 'transparent',
                          boxShadow: settings.accentColor === 'creamy' ? '0 0 30px rgba(68,64,60,0.3)' : 'none'
                        }}
                      >
                        {/* Cream texture gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#fef9f0] to-[#ede8dc]" />
                      </div>
                      <div className={clsx(
                        "text-[9px] font-black uppercase tracking-widest transition-opacity whitespace-nowrap",
                        settings.accentColor === 'creamy' ? "opacity-100 text-white" : "opacity-0"
                      )}>
                        Creamy White
                      </div>
                      {settings.accentColor === 'creamy' && (
                        <div className="absolute -top-1 -right-1 bg-stone-800 text-white p-1 rounded-full shadow-lg">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Encrypted Storage & Wipe Protocol */}
        <div className="col-span-12 lg:col-span-4">
           <div className="glass-card p-10 relative overflow-hidden border border-white/10 bg-white/5 rounded-[32px] h-full flex flex-col group/wipe">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-[80px]" />
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/30">
                   <Shield size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white italic tracking-tight">System Security</h3>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Encryption & Data Lifecycle</p>
                </div>
             </div>

             <div className="flex-grow space-y-8">
                <div className="space-y-3">
                   <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-white/20">Encryption Standard</div>
                   <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center gap-4">
                      <Lock size={16} className="text-v4-gold" />
                      <span className="text-xs font-black text-white tracking-widest uppercase">AES-256 GCM (Native)</span>
                   </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl relative overflow-hidden">
                   <div className="absolute -right-4 -bottom-4 opacity-10 group-hover/wipe:rotate-12 transition-transform">
                      <AlertTriangle size={80} />
                   </div>
                   <h4 className="text-[10px] font-black uppercase tracking-tighter text-red-500 mb-3 flex items-center gap-2">
                      <AlertTriangle size={14} />
                      Destructive Alpha Sequence
                   </h4>
                   <p className="text-[9px] font-bold text-white/40 leading-relaxed mb-6">
                      Wipe Protocol clears all local mission cache, including emails, calendar, and notes. This cannot be undone.
                   </p>
                   
                   <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setWipeLock(!wipeLock)}
                        className={clsx(
                          "w-full h-12 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          wipeLock ? "bg-white/5 border-white/5 text-white/40" : "bg-red-600/10 border-red-500/30 text-red-500"
                        )}
                      >
                         {wipeLock ? <Eye size={14} /> : <EyeOff size={14} />}
                         {wipeLock ? "Unlock Wipe Protocol" : "Wipe Securely Loaded"}
                      </button>
                      
                      <button 
                        disabled={wipeLock}
                        onClick={handleWipeProtocol}
                        className={clsx(
                          "w-full h-12 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 shadow-2xl",
                          wipeLock ? "bg-white/5 text-white/10 opacity-50 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700 shadow-red-900/40"
                        )}
                      >
                         <Trash2 size={14} />
                         Execute Wipe
                      </button>
                   </div>
                </div>
             </div>
           </div>
        </div>

        {/* Administrative Signature Widget */}
        <div className="col-span-12 lg:col-span-8">
           <div className="glass-card p-10 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] h-full flex flex-col">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
                   <FileDigit size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white italic tracking-tight">Signature Portfolio</h3>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none mt-1">Official Document Authentication</p>
                </div>
             </div>

             <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <p className="text-[10px] font-bold text-white/40 leading-relaxed">
                      Upload your digital signature to be automatically appended to SECS Expense Reports, mission letters, and scholarly archives.
                   </p>
                   <div className="relative group/upload h-48 border-2 border-dashed border-white/10 rounded-3xl hover:border-red-500/30 transition-all bg-black/20 flex flex-col items-center justify-center gap-4 cursor-pointer">
                      <input 
                        type="file" 
                        onChange={handleSignatureUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        accept="image/*"
                      />
                      <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-white/20 group-hover/upload:scale-110 transition-transform">
                         <Cloud size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Drop Signature Here</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-v4-ink-muted">Preview Archive</label>
                   <div className="h-48 rounded-3xl bg-white border border-white/5 p-8 flex items-center justify-center overflow-hidden watermark-bg shadow-inner relative">
                      {settings.signatureData ? (
                        <img src={settings.signatureData} alt="Signature Preview" className="max-w-full max-h-full object-contain grayscale" />
                      ) : (
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-black/10 text-center italic">
                           No Signature Injected<br/>(Protocol Default)
                        </div>
                      )}
                      <div className="absolute top-4 right-4 text-[8px] font-black text-black/20 uppercase tracking-widest">Digital Auth</div>
                   </div>
                   {settings.signatureData && (
                     <button 
                       onClick={() => setSettings(prev => ({ ...prev, signatureData: null }))}
                       className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-colors"
                     >
                       Remove Signature
                     </button>
                   )}
                </div>
             </div>
           </div>
        </div>

        {/* Global Save Action */}
        <div className="col-span-12 flex justify-end pt-8">
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="group relative overflow-hidden px-16 h-20 rounded-[28px] font-black uppercase tracking-[0.3em] text-[12px] transition-all duration-500 flex items-center gap-4 text-white shadow-2xl hover:shadow-red-500/20 active:scale-95 disabled:opacity-50"
           >
              {/* Background Rush Container */}
              <div className="absolute inset-0 bg-white/5 z-0" />
              
              {/* Color Rush Layer */}
              <div className={clsx(
                 "absolute inset-0 z-0 transition-all duration-700 ease-out translate-y-full group-hover:translate-y-0 bg-red-600",
                 isSaving && "translate-y-0"
              )} />
              
              {/* Content */}
              <span className="relative z-10 flex items-center gap-3">
                 {isSaving ? (
                   <>
                      <RefreshCw size={20} className="animate-spin" />
                      Updating Global Protocols...
                   </>
                 ) : showSuccess ? (
                   <>
                      <CheckCircle2 size={20} className="text-green-300" />
                      Systems Updated
                   </>
                 ) : (
                   <>
                      <Save size={20} className="group-hover:translate-x-1 transition-transform" />
                      Update Mission Protocol
                   </>
                 )}
              </span>

              {/* Rainbow Aura Glow */}
              <div className="absolute -inset-1 z-[-1] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl">
                 <div className="w-full h-full bg-[linear-gradient(45deg,#ff0000,#ff7300,#fffb00,#48ff00,#00ffd5,#002bff,#7a00ff,#ff00c8,#ff0000)] bg-[length:400%_400%] animate-[gradient_3s_linear_infinite] rounded-[30px]" />
              </div>
           </button>
        </div>
      </div>

      <style jsx global>{`
        .watermark-bg {
           background-image: radial-gradient(#000 0.5px, transparent 0.5px);
           background-size: 10px 10px;
           background-color: #f8fafc;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

function ToggleRow({ icon, label, description, active, onToggle }: { 
  icon: React.ReactNode, 
  label: string, 
  description: string, 
  active: boolean, 
  onToggle: () => void 
}) {
  return (
    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 group/toggle hover:bg-white/10 transition-all">
       <div className="flex items-center gap-4">
          <div className={clsx(
             "p-3 rounded-xl border transition-all",
             active ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/10 text-white/20"
          )}>
             {icon}
          </div>
          <div>
             <div className="text-xs font-black text-white italic tracking-tight">{label}</div>
             <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{description}</div>
          </div>
       </div>
       
       <button 
         onClick={onToggle}
         className={clsx(
           "w-12 h-6 rounded-full relative transition-all duration-300",
           active ? "bg-red-600" : "bg-white/10"
         )}
       >
          <div className={clsx(
             "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-lg",
             active ? "left-7" : "left-1"
          )} />
       </button>
    </div>
  );
}
