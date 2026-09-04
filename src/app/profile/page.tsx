"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  Calendar, 
  HardDrive,
  ExternalLink,
  RefreshCw,
  Clock,
  Shield,
  Activity,
  Award,
  BookOpen,
  Camera,
  Save,
  CheckCircle2,
  CloudOff,
  Fingerprint,
  Users,
  Cake
} from "lucide-react";
import { clsx } from "clsx";
import { GoogleSyncService } from '@/lib/google-sync-service';
import WorldClock from '@/components/WorldClock';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
  // Custom fields
  missionTitle: string;
  missionArea: string;
  graduationYear: string;
  languages: string;
  memberCode: string;
  alias: string;
  birthday: string;
  bio: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsRefreshing(true);
    const googleInfo = await GoogleSyncService.getUserProfile();
    
    // Load custom fields from localStorage
    const savedCustom = localStorage.getItem('murrabi_profile_custom');
    const customData = savedCustom ? JSON.parse(savedCustom) : {
      missionTitle: "Administrative Murrabi",
      missionArea: "Canada HQ / Toronto",
      graduationYear: "2018",
      languages: "English, Urdu, Arabic",
      memberCode: "M-777",
      alias: "Administrative Proxy",
      birthday: "1994-01-01",
      bio: "Dedicated to the scholarly advancement and administrative excellence of the mission. Focusing on digital transformation of regional logistics and expense protocol automation."
    };

    if (googleInfo) {
      setProfile({ ...googleInfo, ...customData });
    } else {
       // Fallback for demo
       setProfile({
          id: 'mock-123',
          email: 'waleed@murrabi.desk',
          name: 'Waleed Mangla',
          given_name: 'Waleed',
          family_name: 'Mangla',
          picture: '',
          locale: 'EN-CA',
          ...customData
       });
    }
    
    setIsLoading(false);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleSave = () => {
    if (!profile) return;
    setIsSaving(true);
    
    const customData = {
      name: profile.name,
      missionTitle: profile.missionTitle,
      missionArea: profile.missionArea,
      graduationYear: profile.graduationYear,
      languages: profile.languages,
      memberCode: profile.memberCode,
      alias: profile.alias,
      birthday: profile.birthday,
      bio: profile.bio
    };

    localStorage.setItem('murrabi_profile_custom', JSON.stringify(customData));
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-transparent animate-pulse">
        <div className="text-accent-main flex flex-col items-center gap-6">
           <RefreshCw size={48} className="animate-spin opacity-20" />
           <span className="uppercase tracking-[0.5em] text-[10px] font-black">Establishing Identity Protocol...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content flex flex-col gap-8 pb-12 animate-in fade-in duration-700 h-screen overflow-hidden">
      {/* Identity Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Identity Protocol</h1>
          <p className="text-white/30 max-w-xl mt-2 font-black uppercase tracking-[0.3em] text-[10px]">
             Administrative Clearance / Level 4 Authorization
          </p>
        </div>
        
        <button 
          onClick={fetchProfile}
          className={clsx(
            "flex items-center gap-3 px-6 h-12 bg-white/5 border border-white/5 rounded-2xl text-v4-ink/40   transition-all font-black uppercase text-[10px] tracking-widest",
            isRefreshing && "opacity-50 pointer-events-none"
          )}
        >
          <RefreshCw size={14} className={clsx(isRefreshing && "animate-spin")} />
          Sync Google Data
        </button>
      </div>

      <div className="grid grid-cols-12 gap-12 no-drag">
        {/* Core Identity Widget */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="glass-card p-10 relative overflow-hidden group border border-white/5 bg-white/5 rounded-[32px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-soft rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col items-center mb-10">
              <div className="relative group/avatar mb-8">
                <div className="absolute -inset-4 bg-accent-glow/20 rounded-full blur-3xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
                <div className="w-40 h-40 rounded-full border-4 border-white/10 p-1.5 relative overflow-hidden backdrop-blur-3xl bg-black/40">
                  {profile?.picture ? (
                    <img 
                      src={profile.picture} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover shadow-2xl" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-white/20">
                      <User size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-[#0F0F0F] flex items-center justify-center text-black shadow-2xl">
                   <ShieldCheck size={18} />
                </div>
              </div>

              <input 
                type="text"
                value={profile?.name || ""}
                onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full bg-transparent border-none text-center text-xl font-black tracking-tight text-white focus:ring-0 placeholder:text-white/10 mb-2"
                placeholder="Full Name"
              />
              <input 
                type="text"
                value={profile?.missionTitle || ""}
                onChange={(e) => setProfile(prev => prev ? { ...prev, missionTitle: e.target.value } : null)}
                className="w-full bg-transparent border-none text-center text-[10px] font-black uppercase tracking-[0.4em] text-accent-main focus:ring-0 placeholder:text-accent-main/20"
                placeholder="Mission Rank"
              />
            </div>

            <div className="space-y-4 pt-10 border-t border-white/5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest leading-none">
                <span className="text-white/20">Protocol Status:</span>
                <span className="text-green-500 flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   Active Authority
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest leading-none">
                <span className="text-white/20">Sync Level:</span>
                <span className="text-v4-ink/60">HQ Encrypted</span>
              </div>
            </div>
          </div>

          {/* New Section: Administrative Credentials */}
          <div className="glass-card p-10 relative overflow-hidden group border border-white/5 bg-white/5 rounded-[32px]">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-accent-soft rounded-2xl flex items-center justify-center text-accent-main">
                   <Fingerprint size={20} />
                </div>
                <div>
                   <h3 className="text-sm font-black text-white italic tracking-tight uppercase">Administrative Credentials</h3>
                   <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Restricted Identifiers</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-[0.2em] text-v4-ink-muted flex items-center gap-2">
                       Member Code
                   </label>
                   <input 
                       type="text"
                       value={profile?.memberCode || ""}
                       onChange={(e) => setProfile(prev => prev ? { ...prev, memberCode: e.target.value } : null)}
                       className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-5 text-xs font-bold text-v4-ink focus:border-accent-glow focus:ring-0 transition-all font-mono"
                       placeholder="M-XXX"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-[0.2em] text-v4-ink-muted flex items-center gap-2">
                       Alias / Protocol Name
                   </label>
                   <div className="relative group/field">
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-main transition-colors" size={14} />
                       <input 
                           type="text"
                           value={profile?.alias || ""}
                           onChange={(e) => setProfile(prev => prev ? { ...prev, alias: e.target.value } : null)}
                           className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-5 text-xs font-bold text-v4-ink focus:border-accent-glow focus:ring-0 transition-all"
                           placeholder="Enter alias..."
                       />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-[0.2em] text-v4-ink-muted flex items-center gap-2">
                       Chronological Birthday
                   </label>
                   <div className="relative group/field">
                       <Cake className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-main transition-colors" size={14} />
                       <input 
                           type="date"
                           value={profile?.birthday || ""}
                           onChange={(e) => setProfile(prev => prev ? { ...prev, birthday: e.target.value } : null)}
                           className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-5 text-xs font-bold text-v4-ink focus:border-accent-glow focus:ring-0 transition-all [color-scheme:dark]"
                       />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Operational Metadata Widget */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <div className="glass-card p-12 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px]">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-accent-soft rounded-2xl flex items-center justify-center text-accent-main">
                   <Globe size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white italic tracking-tight">Mission Parameters</h3>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Geospatial and Scholarly Data</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-v4-ink-muted">Mission Area / HQ</label>
                    <div className="relative group">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent-main transition-colors" size={16} />
                       <input 
                         type="text"
                         value={profile?.missionArea || ""}
                         onChange={(e) => setProfile(prev => prev ? { ...prev, missionArea: e.target.value } : null)}
                         className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-v4-ink focus:border-accent-glow focus:ring-0 transition-all"
                         placeholder="Location"
                       />
                    </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-v4-ink-muted">Graduation Year (Jamia)</label>
                   <div className="relative group">
                      <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent-main transition-colors" size={16} />
                      <input 
                        type="text"
                        value={profile?.graduationYear || ""}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, graduationYear: e.target.value } : null)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-v4-ink focus:border-accent-glow focus:ring-0 transition-all"
                        placeholder="Year"
                      />
                   </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-v4-ink-muted">Linguistic Portfolio</label>
                    <div className="relative group">
                       <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent-main transition-colors" size={16} />
                       <input 
                         type="text"
                         value={profile?.languages || ""}
                         onChange={(e) => setProfile(prev => prev ? { ...prev, languages: e.target.value } : null)}
                         className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-v4-ink focus:border-accent-glow focus:ring-0 transition-all"
                         placeholder="Primary, Secondary, etc."
                       />
                    </div>
                </div>
             </div>
          </div>

          {/* Bio / Mission Statement */}
          <div className="glass-card p-12 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px] flex-grow">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-accent-main/10 rounded-2xl flex items-center justify-center text-accent-main">
                   <Activity size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white italic tracking-tight">Mission Objective</h3>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Core Values and Scholarly Focus</p>
                </div>
             </div>

             <textarea 
               value={profile?.bio || ""}
               onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
               className="w-full bg-white/5 border border-white/5 rounded-3xl p-8 text-sm leading-relaxed text-v4-ink focus:border-accent-glow focus:ring-0 transition-all h-48 custom-scrollbar resize-none italic"
               placeholder="Enter your scholarly mission statement..."
             />

             {/* Dynamic Save Protocol Action */}
             <div className="mt-12 flex items-center justify-between">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20 text-[9px] font-black uppercase tracking-widest text-green-500">
                   <CheckCircle2 size={12} />
                   Identity Verified by <img src="/logo.png" alt="Logo" className="h-3 w-auto object-contain inline-block align-middle mx-1" /> HQ
                </div>
                
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="group relative overflow-hidden px-12 h-16 rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500 flex items-center gap-4 text-white shadow-2xl  active:scale-95 disabled:opacity-50"
                >
                   {/* Background Rush Container */}
                   <div className="absolute inset-0 bg-white/10 z-0" />
                   
                   {/* Color Rush Layer */}
                   <div className={clsx(
                      "absolute inset-0 z-0 transition-all duration-700 ease-out translate-y-full  bg-accent-main",
                      isSaving && "translate-y-0"
                   )} />
                   
                   {/* Sparkle Rush Layer */}
                   <div className="absolute inset-0 z-0 opacity-0  transition-opacity pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] animate-pulse" />
                   </div>

                   {/* Content */}
                   <span className="relative z-10 flex items-center gap-3">
                      {isSaving ? (
                        <>
                           <RefreshCw size={18} className="animate-spin" />
                           Commiting...
                        </>
                      ) : showSuccess ? (
                        <>
                           <CheckCircle2 size={18} />
                           Protocol Updated
                        </>
                      ) : (
                        <>
                           <Save size={18} className=" transition-transform" />
                           Commit Profile
                        </>
                      )}
                   </span>

                   {/* Rainbow Aura Glow */}
                   <div className="absolute -inset-1 z-[-1] opacity-0  transition-opacity duration-700 blur-xl">
                      <div className="w-full h-full bg-[linear-gradient(45deg,#ff0000,#ff7300,#fffb00,#48ff00,#00ffd5,#002bff,#7a00ff,#ff00c8,#ff0000)] bg-[length:400%_400%] animate-[gradient_3s_linear_infinite] rounded-[22px]" />
                   </div>
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Security & Access Section */}
      <div className="mt-12 no-drag">
        <div className="glass-card p-12 relative overflow-hidden border border-white/5 bg-white/5 rounded-[32px]">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                    <Shield size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-white italic tracking-tight">Security & Authorization</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Manage your administrative access and identity encryption</p>
                 </div>
              </div>

              <button 
                onClick={async () => {
                  if (confirm("Are you sure you want to log out? This will clear your local administrative cache.")) {
                    await GoogleSyncService.logout();
                    window.location.href = "/onboarding";
                  }
                }}
                className="group relative h-14 px-10 rounded-[18px] font-black uppercase tracking-widest text-[10px] text-white overflow-hidden transition-all active:scale-95"
              >
                 <div className="absolute inset-0 bg-white/5  transition-colors duration-500" />
                 <span className="relative z-10 flex items-center gap-3">
                    <CloudOff size={16} />
                    Log Out of <img src="/logo.png" alt="Logo" className="h-4 w-auto object-contain inline-block align-middle mx-1" />
                 </span>
              </button>
           </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
