"use client";

import React, { useState, useEffect } from 'react';
import {
  User, Palette, RefreshCw, Bell, Globe, Link2, Keyboard,
  Shield, CheckCircle2, Eye, EyeOff, Trash2, Lock, FileDigit,
  Cloud, Monitor, Save, AlertTriangle, MapPin, Award,
  BookOpen, Users, Cake, Activity, Camera, Fingerprint,
  ChevronRight, Clock, Languages, Plug, Info, LogOut,
  Mail, Calendar, StickyNote, LayoutDashboard, Zap,
  Sun, Moon, Laptop, MailCheck, ArrowUpDown, CloudOff
} from "lucide-react";
import { clsx } from "clsx";
import { GoogleSyncService } from '@/lib/google-sync-service';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type Tab =
  | 'profile'
  | 'appearance'
  | 'sync'
  | 'notifications'
  | 'language'
  | 'accounts'
  | 'shortcuts'
  | 'privacy'
  | 'feedback';

interface SettingsState {
  // Appearance
  accentColor: string;
  highDensityMode: boolean;
  defaultLaunchTab: string;
  // Sync
  syncFrequency: string;
  // Notifications
  showWorldClock: boolean;
  showPrayerTimes: boolean;
  showAIPrompts: boolean;
  emailNotifications: boolean;
  // Language
  dateFormat: string;
  timeFormat: string;
  weekStart: string;
  language: string;
  // Signature
  signatureData: string | null;
  // Profile custom
  missionTitle: string;
  missionArea: string;
  graduationYear: string;
  languages: string;
  memberCode: string;
  alias: string;
  birthday: string;
  bio: string;
}

// ─────────────────────────────────────────────────────────────
// Sidebar nav items
// ─────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'profile',       label: 'Profile',           icon: User,         desc: 'Identity & bio' },
  { id: 'appearance',    label: 'Appearance',         icon: Palette,      desc: 'Themes & display' },
  { id: 'sync',          label: 'Sync & Data',        icon: RefreshCw,    desc: 'Google sync settings' },
  { id: 'notifications', label: 'Notifications',      icon: Bell,         desc: 'Alerts & widgets' },
  { id: 'language',      label: 'Language & Region',  icon: Languages,    desc: 'Format & locale' },
  { id: 'accounts',      label: 'Connected Accounts', icon: Plug,         desc: 'Google, OAuth' },
  { id: 'shortcuts',     label: 'Shortcuts',          icon: Keyboard,     desc: 'Keyboard reference' },
  { id: 'privacy',       label: 'Privacy & Security', icon: Shield,       desc: 'Cache, wipe, sign out' },
  { id: 'feedback',      label: 'Request a Feature',  icon: Zap,          desc: 'Submit ideas & requests' },
];

// ─────────────────────────────────────────────────────────────
// Helper: Toggle Row
// ─────────────────────────────────────────────────────────────
function ToggleRow({ icon, label, description, active, onToggle }: {
  icon: React.ReactNode; label: string; description: string; active: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 transition-all">
      <div className="flex items-center gap-4">
        <div className={clsx("p-2.5 rounded-xl border transition-all", active ? "bg-[var(--accent-soft)] border-[var(--accent-main)]/20 text-[var(--accent-main)]" : "bg-white/5 border-white/10 text-white/20")}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-black text-[var(--foreground)] tracking-tight">{label}</div>
          <div className="text-[9px] font-bold text-[var(--text-dim)] uppercase tracking-widest">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={clsx("w-11 h-6 rounded-full relative transition-all duration-300", active ? "bg-[var(--accent-main)]" : "bg-white/10")}
      >
        <div className={clsx("absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-lg", active ? "left-6" : "left-1")} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helper: Section Card
// ─────────────────────────────────────────────────────────────
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("glass border border-white/5 bg-white/5 rounded-3xl p-8", className)}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-4 mb-7">
      <div className="w-10 h-10 bg-[var(--accent-soft)] rounded-2xl flex items-center justify-center text-[var(--accent-main)]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-black text-[var(--foreground)] italic tracking-tight">{title}</h3>
        {subtitle && <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">{subtitle}</p>}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">{children}</label>;
}

function FieldInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-5 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-main)]/50 focus:outline-none transition-all [color-scheme:dark]"
    />
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: Profile
// ─────────────────────────────────────────────────────────────
function ProfileTab({ settings, setSettings }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>> }) {
  const [googleProfile, setGoogleProfile] = useState<any>(null);
  useEffect(() => {
    GoogleSyncService.getUserProfile().then(p => setGoogleProfile(p));
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<User size={18} />} title="Identity" subtitle="Your public profile information" />
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full border-2 border-white/10 overflow-hidden bg-black/40 shrink-0 flex items-center justify-center">
            {googleProfile?.picture
              ? <img src={googleProfile.picture} alt="avatar" className="w-full h-full object-cover" />
              : <User size={32} className="text-white/20" />}
          </div>
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <FieldLabel>Full Name</FieldLabel>
              <FieldInput value={settings.missionTitle} onChange={v => setSettings(s => ({ ...s, missionTitle: v }))} placeholder="Your name" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <FieldLabel>Mission Title / Role</FieldLabel>
            <FieldInput value={settings.missionTitle} onChange={v => setSettings(s => ({ ...s, missionTitle: v }))} placeholder="Administrative Murrabi" />
          </div>
          <div className="space-y-1">
            <FieldLabel>Member Code</FieldLabel>
            <FieldInput value={settings.memberCode} onChange={v => setSettings(s => ({ ...s, memberCode: v }))} placeholder="M-XXX" />
          </div>
          <div className="space-y-1">
            <FieldLabel>Mission Area / HQ</FieldLabel>
            <FieldInput value={settings.missionArea} onChange={v => setSettings(s => ({ ...s, missionArea: v }))} placeholder="Toronto, Canada" />
          </div>
          <div className="space-y-1">
            <FieldLabel>Graduation Year (Jamia)</FieldLabel>
            <FieldInput value={settings.graduationYear} onChange={v => setSettings(s => ({ ...s, graduationYear: v }))} placeholder="2018" />
          </div>
          <div className="space-y-1">
            <FieldLabel>Protocol Alias</FieldLabel>
            <FieldInput value={settings.alias} onChange={v => setSettings(s => ({ ...s, alias: v }))} placeholder="Alias..." />
          </div>
          <div className="space-y-1">
            <FieldLabel>Birthday</FieldLabel>
            <FieldInput type="date" value={settings.birthday} onChange={v => setSettings(s => ({ ...s, birthday: v }))} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <FieldLabel>Languages</FieldLabel>
            <FieldInput value={settings.languages} onChange={v => setSettings(s => ({ ...s, languages: v }))} placeholder="English, Urdu, Arabic" />
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader icon={<Activity size={18} />} title="Bio / Mission Statement" subtitle="Scholarly focus and objectives" />
        <textarea
          value={settings.bio}
          onChange={e => setSettings(s => ({ ...s, bio: e.target.value }))}
          className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-xs leading-relaxed text-[var(--foreground)] focus:border-[var(--accent-main)]/50 focus:outline-none transition-all h-36 resize-none italic"
          placeholder="Enter your scholarly mission statement..."
        />
      </Card>
      <Card>
        <CardHeader icon={<FileDigit size={18} />} title="Signature" subtitle="Used on exported expense reports" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="relative h-40 border-2 border-dashed border-white/10 rounded-2xl bg-black/20 flex flex-col items-center justify-center gap-3 cursor-pointer">
            <input type="file" onChange={e => {
              const f = e.target.files?.[0];
              if (f) { const r = new FileReader(); r.onloadend = () => setSettings(s => ({ ...s, signatureData: r.result as string })); r.readAsDataURL(f); }
            }} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
            <Cloud size={24} className="text-white/20" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Drop Signature Here</span>
          </div>
          <div className="h-40 rounded-2xl bg-white p-4 flex items-center justify-center overflow-hidden" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '10px 10px', backgroundColor: '#f8fafc' }}>
            {settings.signatureData
              ? <img src={settings.signatureData} alt="Signature" className="max-w-full max-h-full object-contain grayscale" />
              : <div className="text-[9px] font-black uppercase tracking-[0.2em] text-black/20 text-center italic">No Signature<br />(Protocol Default)</div>}
          </div>
        </div>
        {settings.signatureData && (
          <button onClick={() => setSettings(s => ({ ...s, signatureData: null }))} className="mt-3 text-[9px] font-black uppercase tracking-widest text-red-500">
            Remove Signature
          </button>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: Appearance
// ─────────────────────────────────────────────────────────────
const THEMES = [
  { id: 'red',     name: 'Murrabi Red',        hex: '#ef4444' },
  { id: 'indigo',  name: 'Indigo Mission',      hex: '#6366f1' },
  { id: 'emerald', name: 'Emerald Scholarly',   hex: '#10b981' },
  { id: 'amber',   name: 'Amber Prophetic',     hex: '#f59e0b' },
  { id: 'violet',  name: 'Aura Violet',         hex: '#8b5cf6' },
  { id: 'creamy',  name: 'Creamy White',        hex: '#a07f5c' },
  { id: 'flup',    name: 'Flup White',          hex: '#10b981', isLight: true },
];

function AppearanceTab({ settings, setSettings }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>> }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<Palette size={18} />} title="Theme" subtitle="Global color identity" />
        <div className="flex flex-wrap gap-5">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setSettings(s => ({ ...s, accentColor: t.id }))}
              className={clsx("flex flex-col items-center gap-2 transition-all", settings.accentColor === t.id ? "scale-110" : "opacity-40")}>
              <div className="w-14 h-14 rounded-full border-4 shadow-xl relative overflow-hidden transition-all"
                style={{ backgroundColor: t.isLight ? '#ffffff' : t.hex, borderColor: settings.accentColor === t.id ? 'white' : 'transparent', boxShadow: settings.accentColor === t.id ? `0 0 24px ${t.hex}80` : 'none' }}>
                {t.isLight && <div className="absolute inset-0 flex items-center justify-center"><div className="w-7 h-7 rounded-full" style={{ background: t.hex }} /></div>}
                {t.id === 'creamy' && <div className="absolute inset-0 bg-gradient-to-br from-[#fef9f0] to-[#ede8dc]" />}
              </div>
              {settings.accentColor === t.id && <span className="text-[8px] font-black uppercase tracking-widest text-white whitespace-nowrap">{t.name}</span>}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Monitor size={18} />} title="Display" subtitle="Density and layout preferences" />
        <div className="space-y-3">
          <ToggleRow
            icon={<ArrowUpDown size={16} />}
            label="High Density Mode"
            description="Minimize padding for expert users"
            active={settings.highDensityMode}
            onToggle={() => setSettings(s => ({ ...s, highDensityMode: !s.highDensityMode }))}
          />
        </div>
        <div className="mt-5 space-y-2">
          <FieldLabel>Default Launch Tab</FieldLabel>
          <select
            value={settings.defaultLaunchTab}
            onChange={e => setSettings(s => ({ ...s, defaultLaunchTab: e.target.value }))}
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-5 text-xs font-bold text-[var(--foreground)] focus:outline-none [color-scheme:dark]"
          >
            {[
              { v: '/', label: 'Dashboard' },
              { v: '/emails', label: 'Emails' },
              { v: '/expenses', label: 'Expenses' },
              { v: '/notes', label: 'Notes' },
              { v: '/calendar', label: 'Calendar' },
            ].map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: Sync & Data
// ─────────────────────────────────────────────────────────────
function SyncTab({ settings, setSettings }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>> }) {
  const [syncing, setSyncing] = useState(false);
  const handleForceSync = () => { setSyncing(true); setTimeout(() => setSyncing(false), 2000); };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<Cloud size={18} />} title="Sync Gateway" subtitle="Google Workspace connectivity" />
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Cloud size={16} className="text-white/40" />
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Protocol Status</div>
              <div className="text-xs font-bold text-[var(--foreground)]">Encrypted WebSocket Active</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 text-[8px] font-black uppercase text-green-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <FieldLabel>Sync Frequency</FieldLabel>
          <div className="grid grid-cols-3 gap-3">
            {['5m', '15m', '1h'].map(f => (
              <button key={f} onClick={() => setSettings(s => ({ ...s, syncFrequency: f }))}
                className={clsx("py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border",
                  settings.syncFrequency === f ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white" : "bg-white/5 border-white/5 text-white/40")}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleForceSync} disabled={syncing}
          className="w-full h-12 rounded-2xl bg-white/5 border border-white/5 text-[var(--foreground)]/60 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
          <RefreshCw size={14} className={clsx(syncing && "animate-spin")} />
          {syncing ? 'Syncing...' : 'Force Protocol Resync'}
        </button>
      </Card>

      <Card>
        <CardHeader icon={<Info size={18} />} title="Local Cache Info" subtitle="Stored data breakdown" />
        <div className="space-y-3">
          {[
            { label: 'Gmail Cache', icon: <Mail size={14} />, key: 'cache_gmail' },
            { label: 'Calendar Cache', icon: <Calendar size={14} />, key: 'cache_calendar' },
            { label: 'Notes Cache', icon: <StickyNote size={14} />, key: 'mission_notes_browser_fallback' },
          ].map(item => {
            const hasData = typeof window !== 'undefined' && !!localStorage.getItem(item.key);
            return (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3 text-[var(--text-dim)]">
                  {item.icon}
                  <span className="text-[11px] font-bold text-[var(--foreground)]">{item.label}</span>
                </div>
                <span className={clsx("text-[9px] font-black uppercase tracking-widest", hasData ? "text-green-400" : "text-white/20")}>
                  {hasData ? 'Cached' : 'Empty'}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: Notifications
// ─────────────────────────────────────────────────────────────
function NotificationsTab({ settings, setSettings }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>> }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<Bell size={18} />} title="Dashboard Widgets" subtitle="Toggle which widgets appear on your dashboard" />
        <div className="space-y-3">
          <ToggleRow icon={<Globe size={16} />} label="World Clock" description="Show world time zones" active={settings.showWorldClock} onToggle={() => setSettings(s => ({ ...s, showWorldClock: !s.showWorldClock }))} />
          <ToggleRow icon={<Clock size={16} />} label="Prayer Times" description="Display spiritual alignments" active={settings.showPrayerTimes} onToggle={() => setSettings(s => ({ ...s, showPrayerTimes: !s.showPrayerTimes }))} />
          <ToggleRow icon={<Zap size={16} />} label="AI Mission Shortcuts" description="Contextual AI action rows" active={settings.showAIPrompts} onToggle={() => setSettings(s => ({ ...s, showAIPrompts: !s.showAIPrompts }))} />
        </div>
      </Card>
      <Card>
        <CardHeader icon={<MailCheck size={18} />} title="Email & Alerts" subtitle="Notification preferences" />
        <div className="space-y-3">
          <ToggleRow icon={<Mail size={16} />} label="Email Notifications" description="New mail alert badge" active={settings.emailNotifications} onToggle={() => setSettings(s => ({ ...s, emailNotifications: !s.emailNotifications }))} />
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: Language & Region
// ─────────────────────────────────────────────────────────────
function LanguageTab({ settings, setSettings }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>> }) {
  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; label: string }[] }) => (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-5 text-xs font-bold text-[var(--foreground)] focus:outline-none [color-scheme:dark]">
        {options.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<Languages size={18} />} title="Language" subtitle="Interface language preference" />
        <SelectField label="Interface Language" value={settings.language} onChange={v => setSettings(s => ({ ...s, language: v }))}
          options={[{ v: 'en', label: 'English' }, { v: 'ur', label: 'Urdu' }, { v: 'ar', label: 'Arabic' }, { v: 'fr', label: 'French' }]} />
      </Card>
      <Card>
        <CardHeader icon={<Globe size={18} />} title="Region & Formats" subtitle="Date, time, and calendar preferences" />
        <div className="space-y-5">
          <SelectField label="Date Format" value={settings.dateFormat} onChange={v => setSettings(s => ({ ...s, dateFormat: v }))}
            options={[{ v: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' }, { v: 'DD/MM/YYYY', label: 'DD/MM/YYYY (International)' }, { v: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }]} />
          <SelectField label="Time Format" value={settings.timeFormat} onChange={v => setSettings(s => ({ ...s, timeFormat: v }))}
            options={[{ v: '12h', label: '12-hour (2:30 PM)' }, { v: '24h', label: '24-hour (14:30)' }]} />
          <SelectField label="Week Starts On" value={settings.weekStart} onChange={v => setSettings(s => ({ ...s, weekStart: v }))}
            options={[{ v: 'sunday', label: 'Sunday' }, { v: 'monday', label: 'Monday' }, { v: 'saturday', label: 'Saturday' }]} />
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: Connected Accounts
// ─────────────────────────────────────────────────────────────
function AccountsTab() {
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => { GoogleSyncService.getUserProfile().then(setProfile); }, []);

  const SCOPES = [
    { label: 'Gmail Read & Send', icon: <Mail size={14} />, granted: true },
    { label: 'Google Calendar', icon: <Calendar size={14} />, granted: true },
    { label: 'Google Drive (App Data)', icon: <Cloud size={14} />, granted: true },
    { label: 'Google Profile', icon: <User size={14} />, granted: true },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<Plug size={18} />} title="Google Account" subtitle="Primary connected identity" />
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 mb-6">
          {profile?.picture
            ? <img src={profile.picture} className="w-12 h-12 rounded-full" alt="avatar" />
            : <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><User size={20} className="text-white/30" /></div>}
          <div>
            <div className="text-sm font-black text-[var(--foreground)]">{profile?.name || 'Not connected'}</div>
            <div className="text-[10px] text-[var(--text-dim)]">{profile?.email || '—'}</div>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 text-[8px] font-black uppercase text-green-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Authorized
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <FieldLabel>Granted Permissions</FieldLabel>
          {SCOPES.map(scope => (
            <div key={scope.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3 text-[var(--text-dim)]">
                {scope.icon}
                <span className="text-[11px] font-bold text-[var(--foreground)]">{scope.label}</span>
              </div>
              <CheckCircle2 size={14} className="text-green-400" />
            </div>
          ))}
        </div>
        <button
          onClick={() => window.location.href = '/onboarding'}
          className="w-full h-11 rounded-2xl bg-white/5 border border-white/5 text-[var(--foreground)]/60 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <RefreshCw size={13} /> Re-authorize Google Account
        </button>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: Shortcuts
// ─────────────────────────────────────────────────────────────
const SHORTCUTS = [
  { section: 'Navigation', items: [
    { keys: ['G', 'I'], desc: 'Go to Inbox' },
    { keys: ['G', 'E'], desc: 'Go to Expenses' },
    { keys: ['G', 'N'], desc: 'Go to Notes' },
    { keys: ['G', 'S'], desc: 'Go to Settings' },
  ]},
  { section: 'Email', items: [
    { keys: ['C'], desc: 'Compose new email' },
    { keys: ['E'], desc: 'Archive selected email' },
    { keys: ['#'], desc: 'Delete selected email' },
    { keys: ['R'], desc: 'Reply to email' },
    { keys: ['⌘', 'Enter'], desc: 'Send email' },
  ]},
  { section: 'Notes', items: [
    { keys: ['N'], desc: 'Create new note' },
    { keys: ['⌘', 'F'], desc: 'Search notes' },
  ]},
  { section: 'General', items: [
    { keys: ['?'], desc: 'Show keyboard shortcuts' },
    { keys: ['Esc'], desc: 'Close modal / deselect' },
  ]},
];

function ShortcutsTab() {
  return (
    <div className="space-y-6">
      {SHORTCUTS.map(section => (
        <Card key={section.section}>
          <CardHeader icon={<Keyboard size={18} />} title={section.section} />
          <div className="space-y-2">
            {section.items.map(item => (
              <div key={item.desc} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs font-bold text-[var(--foreground)]">{item.desc}</span>
                <div className="flex items-center gap-1">
                  {item.keys.map((k, i) => (
                    <kbd key={i} className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-black text-[var(--foreground)] font-mono">{k}</kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: Privacy & Security
// ─────────────────────────────────────────────────────────────
function PrivacyTab() {
  const [wipeLock, setWipeLock] = useState(true);
  const router = useRouter();

  const handleWipe = () => {
    if (wipeLock) return;
    ['cache_calendar', 'cache_gmail', 'cache_notes', 'mission_notes_browser_fallback', 'murrabi_profile_custom', 'google_sync_status'].forEach(k => localStorage.removeItem(k));
    alert('WIPE COMPLETE: Mission Cache Purged.');
    router.push('/');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<Lock size={18} />} title="Encryption Standard" subtitle="Data protection protocol" />
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center gap-4">
          <Lock size={16} className="text-amber-400" />
          <span className="text-xs font-black text-[var(--foreground)] tracking-widest uppercase">AES-256 GCM — All Tokens Encrypted Locally</span>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-1">Session</div>
          <div className="text-xs font-bold text-[var(--foreground)]">Google OAuth 2.0 — Refresh Token Stored Encrypted</div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<LogOut size={18} />} title="Sign Out" subtitle="End your current session" />
        <p className="text-[10px] text-[var(--text-dim)] mb-5 leading-relaxed">
          Signing out clears your local session token. Your data in Google remains intact. You can sign back in anytime.
        </p>
        <button
          onClick={async () => {
            if (confirm('Sign out of MurrabiDesk?')) { await GoogleSyncService.logout(); window.location.href = '/onboarding'; }
          }}
          className="flex items-center gap-2 px-6 h-11 rounded-2xl bg-white/5 border border-white/5 text-[var(--foreground)]/60 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <CloudOff size={14} /> Sign Out
        </button>
      </Card>

      <Card>
        <div className="relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10"><AlertTriangle size={80} /></div>
          <CardHeader icon={<AlertTriangle size={18} />} title="Danger Zone" subtitle="Irreversible destructive actions" />
          <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-tighter text-red-500 mb-2 flex items-center gap-2">
              <AlertTriangle size={12} /> Destructive — Wipe Local Cache
            </h4>
            <p className="text-[9px] font-bold text-white/40 leading-relaxed mb-5">
              Clears all local mission cache including emails, calendar, and notes. Cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setWipeLock(!wipeLock)}
                className={clsx("w-full h-11 rounded-xl border font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  wipeLock ? "bg-white/5 border-white/5 text-white/40" : "bg-red-600/10 border-red-500/30 text-red-400")}>
                {wipeLock ? <Eye size={13} /> : <EyeOff size={13} />}
                {wipeLock ? 'Unlock Wipe Protocol' : 'Wipe Protocol Armed'}
              </button>
              <button disabled={wipeLock} onClick={handleWipe}
                className={clsx("w-full h-11 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                  wipeLock ? "bg-white/5 text-white/10 cursor-not-allowed" : "bg-red-600 text-white shadow-lg shadow-red-900/40")}>
                <Trash2 size={13} /> Execute Wipe
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Info size={18} />} title="About MurrabiDesk" subtitle="Version info" />
        <div className="space-y-2 text-xs">
          {[
            { label: 'Version', value: '2.0.0' },
            { label: 'Stack', value: 'Next.js 14 · TypeScript · Tailwind' },
            { label: 'Auth', value: 'Google OAuth 2.0' },
            { label: 'Built by', value: 'Waleed Mangla' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="font-black text-[var(--text-dim)] uppercase text-[9px] tracking-widest">{r.label}</span>
              <span className="font-bold text-[var(--foreground)] text-[11px]">{r.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// TAB: Request a Feature
// ─────────────────────────────────────────────────────────────
// 🔧 Replace the src below with your actual Google Form embed URL
// Go to your Google Form → Send → Embed → copy the src value from the <iframe> tag
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScNyE_i3NqCeeqLbjtuu43TA0KI_PnjDvTpCB1uRgFlyf74qA/viewform?embedded=true";

function FeedbackTab() {
  const isPlaceholder = GOOGLE_FORM_URL.includes('YOUR_FORM_ID');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<Zap size={18} />} title="Request a Feature" subtitle="Submit ideas, bugs, or improvements" />
        <p className="text-xs text-[var(--text-dim)] leading-relaxed mb-6">
          Have an idea that would make MurrabiDesk better? Submit a feature request or bug report below. All submissions are reviewed personally.
        </p>

        {isPlaceholder ? (
          /* Placeholder UI if no form URL is set */
          <div className="flex flex-col items-center justify-center gap-5 py-16 border-2 border-dashed border-white/10 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-main)]">
              <Zap size={28} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-[var(--foreground)]">Google Form Not Configured</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-dim)] mt-1">
                Replace <code className="text-[var(--accent-main)]">YOUR_FORM_ID</code> in settings/page.tsx
              </p>
            </div>
            <a
              href="https://docs.google.com/forms"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95"
              style={{ background: 'var(--accent-main)' }}
            >
              <Plug size={13} /> Create Google Form
            </a>
          </div>
        ) : (
          /* Live embedded Google Form */
          <div className="rounded-2xl overflow-hidden border border-white/5" style={{ minHeight: 1080 }}>
            <iframe
              src={GOOGLE_FORM_URL}
              width="100%"
              height="1080"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="Feature Request Form"
              className="block"
              style={{ background: 'transparent' }}
            >
              Loading form…
            </iframe>
          </div>
        )}

        <p className="text-[9px] font-bold text-[var(--text-dim)] uppercase tracking-widest mt-4 text-center">
          Powered by Google Forms · Responses reviewed by the dev team
        </p>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Settings Page

// ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [settings, setSettings] = useState<SettingsState>({
    accentColor: 'red',
    highDensityMode: false,
    defaultLaunchTab: '/',
    syncFrequency: '5m',
    showWorldClock: true,
    showPrayerTimes: true,
    showAIPrompts: true,
    emailNotifications: true,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    weekStart: 'sunday',
    language: 'en',
    signatureData: null,
    missionTitle: 'Administrative Murrabi',
    missionArea: 'Canada HQ / Toronto',
    graduationYear: '2018',
    languages: 'English, Urdu, Arabic',
    memberCode: 'M-777',
    alias: 'Administrative Proxy',
    birthday: '1994-01-01',
    bio: '',
  });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('murrabi_settings_v2');
    if (saved) {
      try { setSettings(prev => ({ ...prev, ...JSON.parse(saved) })); } catch {}
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('murrabi_settings_v2', JSON.stringify(settings));
    localStorage.setItem('murrabi_settings', JSON.stringify({ accentColor: settings.accentColor }));
    localStorage.setItem('murrabi_show_worldclocks', settings.showWorldClock.toString());
    localStorage.setItem('murrabi_show_prayertimes', settings.showPrayerTimes.toString());
    localStorage.setItem('murrabi_profile_custom', JSON.stringify({
      missionTitle: settings.missionTitle, missionArea: settings.missionArea,
      graduationYear: settings.graduationYear, languages: settings.languages,
      memberCode: settings.memberCode, alias: settings.alias, birthday: settings.birthday, bio: settings.bio,
    }));
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); window.location.reload(); }, 1500);
    }, 1000);
  };

  if (!mounted) return null;

  const TABS: Record<Tab, React.ReactNode> = {
    profile:       <ProfileTab settings={settings} setSettings={setSettings} />,
    appearance:    <AppearanceTab settings={settings} setSettings={setSettings} />,
    sync:          <SyncTab settings={settings} setSettings={setSettings} />,
    notifications: <NotificationsTab settings={settings} setSettings={setSettings} />,
    language:      <LanguageTab settings={settings} setSettings={setSettings} />,
    accounts:      <AccountsTab />,
    shortcuts:     <ShortcutsTab />,
    privacy:       <PrivacyTab />,
    feedback:      <FeedbackTab />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* ── Secondary Sidebar ── */}
      <div className="w-[240px] glass bg-black/20 border-r border-white/5 flex flex-col h-full shrink-0">
        <div className="px-6 pt-14 pb-5 border-b border-white/5">
          <h2 className="text-lg font-black tracking-tighter text-[var(--foreground)]">Settings</h2>
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)]/60 mt-0.5">Configuration Protocol</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group",
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent-main)]"
                    : "text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={16} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className={clsx("text-xs font-black truncate", active ? "text-[var(--accent-main)]" : "text-[var(--foreground)]")}>
                    {item.label}
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-widest truncate text-[var(--text-dim)]">{item.desc}</div>
                </div>
                {active && <ChevronRight size={12} className="shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Save Button in Sidebar */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--accent-main)' }}
          >
            {isSaving ? <RefreshCw size={13} className="animate-spin" /> : showSuccess ? <CheckCircle2 size={13} /> : <Save size={13} />}
            {isSaving ? 'Saving...' : showSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto px-8 pt-14 pb-16">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black italic tracking-tighter text-[var(--foreground)] uppercase">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] mt-1">
              {NAV_ITEMS.find(n => n.id === activeTab)?.desc}
            </p>
          </div>

          {/* Tab Content */}
          <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {TABS[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}
