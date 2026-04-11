"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin,
  Calendar, Tag, RefreshCw, Check, Trash2, ExternalLink
} from "lucide-react";
import { clsx } from "clsx";
import { GoogleSyncService } from "@/lib/google-sync-service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type CalendarView = "day" | "week" | "month";

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  location?: string;
  color?: string;
  allDay?: boolean;
  description?: string;
}

interface NewEventDraft {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  color: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const EVENT_COLORS = [
  { label: "Accent",  value: "accent",  bg: "bg-[var(--accent-main)]",         text: "text-white" },
  { label: "Blue",    value: "blue",    bg: "bg-blue-500",                      text: "text-white" },
  { label: "Mint",    value: "mint",    bg: "bg-emerald-400",                   text: "text-white" },
  { label: "Lavender",value: "lavender",bg: "bg-violet-400",                    text: "text-white" },
  { label: "Peach",   value: "peach",   bg: "bg-orange-400",                    text: "text-white" },
  { label: "Rose",    value: "rose",    bg: "bg-pink-400",                      text: "text-white" },
];

const COLOR_STYLE: Record<string, string> = {
  accent:   "bg-[var(--accent-main)]/20 border-[var(--accent-main)]/40 text-[var(--accent-main)]",
  blue:     "bg-blue-500/20 border-blue-500/40 text-blue-400",
  mint:     "bg-emerald-400/20 border-emerald-400/40 text-emerald-400",
  lavender: "bg-violet-400/20 border-violet-400/40 text-violet-400",
  peach:    "bg-orange-400/20 border-orange-400/40 text-orange-400",
  rose:     "bg-pink-400/20 border-pink-400/40 text-pink-400",
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─────────────────────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────────────────────
function isoToDate(iso: string) { return new Date(iso); }
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfWeek(d: Date) {
  const clone = new Date(d);
  clone.setDate(clone.getDate() - clone.getDay());
  clone.setHours(0, 0, 0, 0);
  return clone;
}
function endOfWeek(d: Date) {
  const clone = startOfWeek(d);
  clone.setDate(clone.getDate() + 6);
  clone.setHours(23, 59, 59, 999);
  return clone;
}
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function formatHour(h: number) {
  if (h === 0) return "12 am";
  if (h < 12) return `${h} am`;
  if (h === 12) return "12 pm";
  return `${h - 12} pm`;
}
function formatTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours(), m = d.getMinutes();
  const suffix = h >= 12 ? "pm" : "am";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${suffix}`;
}
function eventTop(start: Date) {
  return (start.getHours() + start.getMinutes() / 60) * 64; // 64px per hour
}
function eventHeight(start: Date, end: Date) {
  const diff = (end.getTime() - start.getTime()) / 3600000;
  return Math.max(diff * 64, 24);
}
function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ─────────────────────────────────────────────────────────────
// Mini Calendar (sidebar)
// ─────────────────────────────────────────────────────────────
function MiniCalendar({ selected, onSelect, today, events = [] }: { 
  selected: Date; 
  onSelect: (d: Date) => void; 
  today: Date;
  events?: CalendarEvent[];
}) {
  const [month, setMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));

  useEffect(() => {
    setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [selected]);

  const startDay = startOfMonth(month);
  const endDay = endOfMonth(month);
  const leadingBlanks = startDay.getDay();
  const days: (Date | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: endDay.getDate() }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  while (days.length % 7 !== 0) days.push(null);

  return (
    <div className="p-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black text-[var(--foreground)] tracking-tight">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-dim)] transition-colors"
          >
            <ChevronLeft size={12} />
          </button>
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-dim)] transition-colors"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-[8px] font-black uppercase tracking-widest text-[var(--text-dim)] text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((d, i) => {
          if (!d) return <div key={`blank-${i}`} />;
          const isToday = sameDay(d, today);
          const isSelected = sameDay(d, selected);
          const hasEvents = events.some(e => sameDay(isoToDate(e.start), d));

          return (
            <div key={d.toISOString()} className="relative flex items-center justify-center py-0.5">
              <button
                onClick={() => onSelect(d)}
                className={clsx(
                  "text-[10px] font-bold w-7 h-7 flex flex-col items-center justify-center rounded-xl transition-all relative",
                  isToday && "bg-black/40 border border-accent-main/20 text-[var(--accent-main)] font-black shadow-inner",
                  isSelected && !isToday && "bg-white/10 text-[var(--accent-main)]",
                  !isSelected && !isToday && "text-[var(--foreground)] hover:bg-white/10"
                )}
              >
                <span className={clsx(hasEvents && "translate-y-[-1px]")}>{d.getDate()}</span>
                {hasEvents && (
                  <div className={clsx(
                    "w-0.5 h-0.5 rounded-full absolute bottom-1.5",
                    isToday ? "bg-[var(--accent-main)]" : "bg-white/30"
                  )} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Event Pill (Day/Week grid)
// ─────────────────────────────────────────────────────────────
function EventPill({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const start = isoToDate(event.start);
  const end = isoToDate(event.end);
  const top = eventTop(start);
  const height = eventHeight(start, end);
  const color = event.color || "accent";
  const colorClass = COLOR_STYLE[color] || COLOR_STYLE["accent"];

  return (
    <div
      className={clsx(
        "absolute left-0 right-1 rounded-xl border px-2 py-1.5 cursor-pointer transition-all hover:brightness-110 hover:scale-[1.01] hover:z-10 overflow-hidden group",
        colorClass
      )}
      style={{ top: `${top}px`, height: `${height}px`, minHeight: "24px" }}
      onClick={onClick}
    >
      <div className="font-black text-[10px] leading-tight truncate">{event.title}</div>
      {height > 36 && (
        <div className="text-[8px] font-bold opacity-70 mt-0.5 truncate">
          {formatTime(event.start)} – {formatTime(event.end)}
        </div>
      )}
      {event.location && height > 54 && (
        <div className="text-[8px] font-bold opacity-60 truncate mt-0.5">📍 {event.location}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Event Detail Modal
// ─────────────────────────────────────────────────────────────
function EventModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const color = event.color || "accent";
  const colorClass = COLOR_STYLE[color] || COLOR_STYLE["accent"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div className={clsx("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", colorClass)}>
            Event
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-[var(--text-dim)] transition-colors">
            <X size={16} />
          </button>
        </div>
        <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight mb-6 leading-tight">{event.title}</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <Calendar size={14} className="text-[var(--accent-main)] shrink-0" />
            <span className="font-bold">{new Date(event.start).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
          </div>
          {!event.allDay && (
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <Clock size={14} className="text-[var(--accent-main)] shrink-0" />
              <span className="font-bold">{formatTime(event.start)} – {formatTime(event.end)}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <MapPin size={14} className="text-[var(--accent-main)] shrink-0" />
              <span className="font-bold">{event.location}</span>
            </div>
          )}
          {event.description && (
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-[var(--text-muted)] font-medium leading-relaxed">
              {event.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// New Event Modal
// ─────────────────────────────────────────────────────────────
function NewEventModal({ draft, onDraftChange, onSave, onClose, saving }: {
  draft: NewEventDraft;
  onDraftChange: (k: keyof NewEventDraft, v: string) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-black text-[var(--foreground)] tracking-tight">New Event</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-[var(--text-dim)] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-1 block">Event Title</label>
            <input
              autoFocus
              value={draft.title}
              onChange={e => onDraftChange("title", e.target.value)}
              placeholder="e.g. Team Standup"
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-main)]/50 focus:outline-none transition-all"
              onKeyDown={e => { if (e.key === "Enter") onSave(); }}
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-1 block">Date</label>
            <input
              type="date"
              value={draft.date}
              onChange={e => onDraftChange("date", e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-main)]/50 focus:outline-none transition-all [color-scheme:dark]"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-1 block">Start</label>
              <input
                type="time"
                value={draft.startTime}
                onChange={e => onDraftChange("startTime", e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-main)]/50 focus:outline-none transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-1 block">End</label>
              <input
                type="time"
                value={draft.endTime}
                onChange={e => onDraftChange("endTime", e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-main)]/50 focus:outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-1 block">Location (optional)</label>
            <input
              value={draft.location}
              onChange={e => onDraftChange("location", e.target.value)}
              placeholder="e.g. Zoom"
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent-main)]/50 focus:outline-none transition-all"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-2 block">Color</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => onDraftChange("color", c.value)}
                  className={clsx(
                    "w-7 h-7 rounded-full transition-all border-2",
                    c.bg,
                    draft.color === c.value ? "border-white scale-110" : "border-transparent scale-100 hover:scale-105"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={saving || !draft.title}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "var(--accent-main)" }}
        >
          {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
          {saving ? "Creating..." : "Create Event"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Day/Week Grid (shared scrollable time grid)
// ─────────────────────────────────────────────────────────────
function TimeGrid({ columns, onSlotClick, onNewEvent }: {
  columns: { date: Date; events: CalendarEvent[] }[];
  onSlotClick: (e: CalendarEvent) => void;
  onNewEvent: (date: Date, hour: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const hour = today.getHours();
      scrollRef.current.scrollTop = Math.max(0, (hour - 2) * 64);
    }
  }, []);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Day headers */}
      <div className={`grid border-b border-white/5`} style={{ gridTemplateColumns: `56px repeat(${columns.length}, 1fr)` }}>
        <div className="h-14" />
        {columns.map(col => {
          const isToday = sameDay(col.date, today);
          return (
            <div key={col.date.toISOString()} className="h-14 flex flex-col items-center justify-center border-l border-white/5">
              <div className={clsx("text-[9px] font-black uppercase tracking-widest", isToday ? "text-[var(--accent-main)]" : "text-[var(--text-dim)]")}>
                {FULL_DAYS[col.date.getDay()].slice(0, 3)}
              </div>
              <div className={clsx(
                "text-xl font-black leading-none mt-0.5 w-9 h-9 flex items-center justify-center rounded-full transition-all",
                isToday ? "bg-[var(--accent-main)] text-white" : "text-[var(--foreground)]"
              )}>
                {col.date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="relative" style={{ gridTemplateColumns: `56px repeat(${columns.length}, 1fr)`, display: "grid" }}>
          {/* Hours column */}
          <div className="relative">
            {HOURS.map(h => (
              <div key={h} className="h-16 flex items-start justify-end pr-3 pt-0">
                <span className="text-[9px] font-bold text-[var(--text-dim)] -translate-y-2">{h > 0 ? formatHour(h) : ""}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {columns.map(col => {
            const isToday = sameDay(col.date, today);
            const currentHour = today.getHours() + today.getMinutes() / 60;
            return (
              <div
                key={col.date.toISOString()}
                className="relative border-l border-white/5"
                style={{ height: `${HOURS.length * 64}px` }}
              >
                {/* Hour lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-white/[0.04] group/slot cursor-pointer hover:bg-white/[0.02] transition-colors"
                    style={{ top: `${h * 64}px`, height: "64px" }}
                    onClick={() => onNewEvent(col.date, h)}
                  />
                ))}

                {/* Current time line */}
                {isToday && (
                  <div className="absolute w-full z-10 pointer-events-none flex items-center" style={{ top: `${currentHour * 64}px` }}>
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-main)] -ml-1 shadow-[0_0_6px_var(--accent-glow)]" />
                    <div className="flex-1 h-[1px] bg-[var(--accent-main)] opacity-60" />
                  </div>
                )}

                {/* Events */}
                {col.events.map(ev => (
                  <EventPill key={ev.id} event={ev} onClick={() => onSlotClick(ev)} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Month View
// ─────────────────────────────────────────────────────────────
function MonthView({ date, events, onDayClick, onEventClick }: {
  date: Date;
  events: CalendarEvent[];
  onDayClick: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
}) {
  const today = new Date();
  const firstDay = startOfMonth(date);
  const lastDay = endOfMonth(date);
  const leadingBlanks = firstDay.getDay();

  const cells: (Date | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(date.getFullYear(), date.getMonth(), i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const getEventsForDay = (d: Date) => events.filter(e => sameDay(isoToDate(e.start), d));

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] text-center py-2">{d}</div>
        ))}
      </div>

      {/* Weeks */}
      <div className="flex-1 grid gap-1.5" style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((d, di) => {
              if (!d) return <div key={`e-${wi}-${di}`} className="rounded-2xl bg-white/[0.02] border border-white/[0.03]" />;
              const isToday = sameDay(d, today);
              const dayEvents = getEventsForDay(d);
              return (
                <div
                  key={d.toISOString()}
                  className={clsx(
                    "rounded-2xl border p-2 cursor-pointer transition-all hover:bg-white/5 overflow-hidden",
                    isToday ? "border-[var(--accent-main)]/40 bg-[var(--accent-soft)]" : "border-white/5 bg-white/[0.02]"
                  )}
                  onClick={() => onDayClick(d)}
                >
                  <div className={clsx(
                    "text-xs font-black mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                    isToday ? "bg-[var(--accent-main)] text-white" : "text-[var(--foreground)]"
                  )}>
                    {d.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => {
                      const colorClass = COLOR_STYLE[ev.color || "accent"] || COLOR_STYLE["accent"];
                      return (
                        <div
                          key={ev.id}
                          className={clsx("text-[8px] font-black px-1.5 py-0.5 rounded-md truncate border cursor-pointer hover:brightness-110", colorClass)}
                          onClick={e => { e.stopPropagation(); onEventClick(ev); }}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[8px] font-black text-[var(--text-dim)] px-1">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Calendar Page
// ─────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState<CalendarView>("week");
  const [current, setCurrent] = useState(today);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<NewEventDraft>({
    title: "", date: localDateStr(today), startTime: "09:00", endTime: "10:00", location: "", color: "accent"
  });

  // ── Load Events ──
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const isGuest = localStorage.getItem("murrabi_guest_mode") === "true";
      if (isGuest) {
        // Demo events for guest mode
        const now = new Date();
        const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
        setEvents([
          { id: "1", title: "Team Standup", start: new Date(y,m,d,9,0).toISOString(), end: new Date(y,m,d,9,30).toISOString(), color: "blue" },
          { id: "2", title: "Design Review", start: new Date(y,m,d,11,0).toISOString(), end: new Date(y,m,d,12,0).toISOString(), color: "lavender" },
          { id: "3", title: "Lunch Break", start: new Date(y,m,d,13,0).toISOString(), end: new Date(y,m,d,14,0).toISOString(), color: "mint" },
          { id: "4", title: "Friday Khutbah", start: new Date(y,m,d+2,13,0).toISOString(), end: new Date(y,m,d+2,14,0).toISOString(), color: "accent" },
          { id: "5", title: "Product Sprint", start: new Date(y,m,d+1,10,0).toISOString(), end: new Date(y,m,d+1,12,0).toISOString(), color: "peach" },
        ]);
        return;
      }
      const service = await GoogleSyncService.fromLocalStorage();
      const raw = await service?.getCalendarEvents(false) || [];
      const mapped: CalendarEvent[] = raw.map((e: any, i: number) => ({
        id: e.id || String(i),
        title: e.summary || "Untitled Event",
        start: e.start?.dateTime || e.start?.date || new Date().toISOString(),
        end: e.end?.dateTime || e.end?.date || new Date().toISOString(),
        location: e.location,
        description: e.description,
        allDay: !e.start?.dateTime,
        color: ["accent","blue","mint","lavender","peach","rose"][i % 6],
      }));
      setEvents(mapped);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // ── Navigation ──
  const navigate = (dir: 1 | -1) => {
    const d = new Date(current);
    if (view === "day")   d.setDate(d.getDate() + dir);
    if (view === "week")  d.setDate(d.getDate() + dir * 7);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    setCurrent(d);
  };

  // ── Header label ──
  const headerLabel = () => {
    if (view === "month") return `${MONTHS[current.getMonth()]} ${current.getFullYear()}`;
    if (view === "day") return current.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const sw = startOfWeek(current);
    const ew = endOfWeek(current);
    if (sw.getMonth() === ew.getMonth()) return `${MONTHS[sw.getMonth()]} ${sw.getFullYear()}`;
    return `${MONTHS[sw.getMonth()]} – ${MONTHS[ew.getMonth()]} ${ew.getFullYear()}`;
  };

  // ── Filter events ──
  const filteredEvents = (forDate: Date) => events.filter(e => sameDay(isoToDate(e.start), forDate));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek(current));
    d.setDate(d.getDate() + i);
    return d;
  });

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => new Date(e.start).getTime() > Date.now())
      .sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 10);
  }, [events]);

  // ── Handle new event ──
  const handleNewEventFromSlot = (date: Date, hour: number) => {
    setDraft({
      title: "", date: localDateStr(date),
      startTime: `${String(hour).padStart(2,"0")}:00`,
      endTime: `${String(Math.min(hour + 1, 23)).padStart(2,"0")}:00`,
      location: "", color: "accent"
    });
    setShowNewEvent(true);
  };

  const handleCreateEvent = async () => {
    if (!draft.title) return;
    setSaving(true);
    try {
      const startISO = new Date(`${draft.date}T${draft.startTime}:00`).toISOString();
      const endISO   = new Date(`${draft.date}T${draft.endTime}:00`).toISOString();
      const newEv: CalendarEvent = {
        id: `local-${Date.now()}`,
        title: draft.title,
        start: startISO,
        end: endISO,
        location: draft.location || undefined,
        color: draft.color,
      };
      setEvents(prev => [...prev, newEv]);

      const isGuest = localStorage.getItem("murrabi_guest_mode") === "true";
      if (!isGuest) {
        const service = await GoogleSyncService.fromLocalStorage();
        await service?.createCalendarEvent({
          summary: draft.title,
          location: draft.location,
          start: { dateTime: startISO },
          end: { dateTime: endISO },
        });
      }
    } finally {
      setSaving(false);
      setShowNewEvent(false);
      setDraft({ title: "", date: localDateStr(today), startTime: "09:00", endTime: "10:00", location: "", color: "accent" });
    }
  };

  const handleDayClickFromMonth = (d: Date) => {
    setCurrent(d);
    setView("day");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* ── Sidebar ── */}
      <div className="w-[240px] glass bg-black/20 border-r border-white/5 flex flex-col h-full shrink-0 secondary-sidebar">
        {/* Mini calendar */}
        <MiniCalendar 
          selected={current} 
          onSelect={(d) => { setCurrent(d); if (view === "month") setView("day"); }} 
          today={today}
          events={events}
        />

        <div className="border-t border-white/5 mx-4" />

        {/* My Calendars */}
        <div className="px-4 pt-4 pb-2">
          <div className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)] mb-2">My Calendars</div>
          {["Personal","Work","Birthdays"].map((cal, i) => {
            const colors = ["var(--accent-main)", "#3b82f6", "#ec4899"];
            return (
              <div key={cal} className="flex items-center gap-2 py-1.5 group cursor-pointer">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: colors[i] }} />
                <span className="text-xs font-bold text-[var(--foreground)]">{cal}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/5 mx-4 my-2" />

        {/* Upcoming Events */}
        <div className="px-4 flex-1 flex flex-col min-h-0">
          <div className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)] mb-3 shrink-0">Upcoming Events</div>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 pb-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-[10px] font-bold text-[var(--text-muted)] italic">No upcoming events</div>
            ) : (
              upcomingEvents.map(ev => {
                const start = new Date(ev.start);
                const isToday = sameDay(start, today);
                const colorClass = COLOR_STYLE[ev.color || "accent"] || COLOR_STYLE["accent"];
                
                return (
                  <div 
                    key={ev.id} 
                    className="group cursor-pointer"
                    onClick={() => {
                      setCurrent(start);
                      setView("day");
                      setSelectedEvent(ev);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={clsx("w-1 self-stretch rounded-full shrink-0", 
                        ev.color === "blue" ? "bg-blue-500" :
                        ev.color === "mint" ? "bg-emerald-400" :
                        ev.color === "lavender" ? "bg-violet-400" :
                        ev.color === "peach" ? "bg-orange-400" :
                        ev.color === "rose" ? "bg-pink-400" : "bg-[var(--accent-main)]"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black text-[var(--foreground)] leading-tight truncate group-hover:text-[var(--accent-main)] transition-colors">
                          {ev.title}
                        </div>
                        <div className="text-[9px] font-bold text-[var(--text-dim)] mt-0.5">
                          {isToday ? "Today" : start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" · "}{formatTime(ev.start)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* New Event Button */}
        <div className="px-4 pb-4 mt-auto">
          <button
            onClick={() => { setDraft({ title: "", date: localDateStr(current), startTime: "09:00", endTime: "10:00", location: "", color: "accent" }); setShowNewEvent(true); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95"
            style={{ background: "var(--accent-main)" }}
          >
            <Plus size={13} /> New Event
          </button>
        </div>
      </div>

      {/* ── Main Calendar ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 shrink-0">
          {/* View switcher */}
          <div className="flex bg-white/5 rounded-xl p-0.5 gap-0.5 border border-white/5">
            {(["month","week","day"] as CalendarView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={clsx(
                  "px-4 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all",
                  view === v ? "bg-[var(--accent-main)] text-white shadow-sm" : "text-[var(--text-dim)] hover:text-[var(--foreground)]"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 text-[var(--text-dim)] transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-white/10 text-[var(--text-dim)] transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Header label */}
          <h1 className="text-lg font-black tracking-tight text-[var(--foreground)] flex-1">{headerLabel()}</h1>

          {/* Today Button */}
          <button
            onClick={() => setCurrent(today)}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 text-[var(--foreground)] hover:bg-white/5 transition-all"
          >
            Today
          </button>

          {/* Refresh */}
          <button
            onClick={loadEvents}
            className={clsx("p-2 rounded-xl hover:bg-white/10 text-[var(--text-dim)] transition-all", loading && "animate-spin")}
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Views */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={24} className="animate-spin text-[var(--accent-main)]" />
              <p className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-widest">Loading events...</p>
            </div>
          </div>
        ) : view === "month" ? (
          <MonthView
            date={current}
            events={events}
            onDayClick={handleDayClickFromMonth}
            onEventClick={setSelectedEvent}
          />
        ) : view === "week" ? (
          <TimeGrid
            columns={weekDays.map(d => ({ date: d, events: filteredEvents(d) }))}
            onSlotClick={setSelectedEvent}
            onNewEvent={handleNewEventFromSlot}
          />
        ) : (
          <TimeGrid
            columns={[{ date: current, events: filteredEvents(current) }]}
            onSlotClick={setSelectedEvent}
            onNewEvent={handleNewEventFromSlot}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      {showNewEvent && (
        <NewEventModal
          draft={draft}
          onDraftChange={(k, v) => setDraft(prev => ({ ...prev, [k]: v }))}
          onSave={handleCreateEvent}
          onClose={() => setShowNewEvent(false)}
          saving={saving}
        />
      )}
    </div>
  );
}
