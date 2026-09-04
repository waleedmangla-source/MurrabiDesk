"use client";

import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  Shield, 
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';

interface EventModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (event: any) => Promise<void>;
  selectedDate?: Date;
  initialData?: {
    summary?: string;
    description?: string;
    location?: string;
    type?: EventType;
  };
}

export type EventType = 'prayer' | 'meeting' | 'outreach' | 'personal';

export default function EventModal({ 
  isOpen = true, 
  onClose, 
  onSubmit, 
  selectedDate = new Date(),
  initialData 
}: EventModalProps) {
  const [title, setTitle] = useState(initialData?.summary || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState<EventType>(initialData?.type || 'meeting');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    setStatus('syncing');

    try {
      const start = new Date(selectedDate);
      const [sH, sM] = startTime.split(':');
      start.setHours(parseInt(sH), parseInt(sM), 0);

      const end = new Date(selectedDate);
      const [eH, eM] = endTime.split(':');
      end.setHours(parseInt(eH), parseInt(eM), 0);

      const eventData = {
        summary: title,
        location,
        description: initialData?.description || `Mission Category: ${type.toUpperCase()}`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        colorId: type === 'prayer' ? '11' : type === 'meeting' ? '1' : type === 'outreach' ? '5' : '10'
      };

      if (onSubmit) {
        await onSubmit(eventData);
      } else {
        const { GoogleSyncService } = await import('@/lib/google-sync-service');
        const service = await GoogleSyncService.fromLocalStorage();
        if (service) {
          await service.createCalendarEvent(eventData);
        }
      }

      setStatus('success');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err) {
      console.error('Submission failed:', err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setStartTime('09:00');
    setEndTime('10:00');
    setType('meeting');
    setStatus('idle');
  };

  const types: EventType[] = ['prayer', 'meeting', 'outreach', 'personal'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-700">
      <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
        
        {/* Header */}
        <div className="bg-white/[0.01] px-8 py-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-white font-black text-3xl tracking-tighter italic">Add <span className="text-red-600">Task</span></h2>
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Mission Log Active</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-white/20   transition-all rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Title Input */}
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">
              Task Summary
            </label>
            <input 
              autoFocus
              type="text"
              placeholder="Primary mission objective..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-2xl px-6 text-xl font-black text-white outline-none focus:ring-2 focus:ring-red-600/40 focus:bg-white/5 transition-all placeholder:text-white/5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Time Selectors */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">
                Timeline
              </label>
              <div className="flex items-center gap-2">
                 <input 
                   type="time" 
                   value={startTime}
                   onChange={(e) => setStartTime(e.target.value)}
                   className="flex-1 h-12 bg-white/[0.01] border border-white/5 rounded-xl px-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-red-600/40"
                 />
                 <span className="text-white/5 font-black">→</span>
                 <input 
                   type="time" 
                   value={endTime}
                   onChange={(e) => setEndTime(e.target.value)}
                   className="flex-1 h-12 bg-white/[0.01] border border-white/5 rounded-xl px-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-red-600/40"
                 />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">
                Location
              </label>
              <input 
                type="text"
                placeholder="Mission HQ..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-12 bg-white/[0.01] border border-white/5 rounded-xl px-5 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-red-600/40"
              />
            </div>
          </div>

          {/* Classification Tags */}
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {types.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={clsx(
                    "h-12 rounded-xl border uppercase text-[8px] font-black tracking-widest transition-all",
                    type === t 
                      ? "bg-white text-black border-white shadow-xl shadow-white/5" 
                      : "bg-white/[0.01] border-white/5 text-white/20  "
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex flex-col gap-6">
             <button 
               type="submit"
               disabled={isSubmitting || status === 'success'}
               className={clsx(
                 "w-full h-16 rounded-2xl flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl relative overflow-hidden group font-black uppercase text-[10px] tracking-[0.3em]",
                 status === 'success' ? "bg-red-600 text-white" :
                 status === 'error' ? "bg-red-800 text-white" :
                 "bg-white text-black  active:scale-[0.98]"
               )}
             >
                {status === 'syncing' ? (
                   <RefreshCw size={20} className="animate-spin" />
                ) : status === 'success' ? (
                   <CheckCircle2 size={20} />
                ) : status === 'error' ? (
                   <AlertCircle size={20} />
                ) : (
                  <>
                    <span>Confirm task</span>
                     <div className="absolute right-8 opacity-0   transition-all">
                        →
                     </div>
                  </>
                )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
