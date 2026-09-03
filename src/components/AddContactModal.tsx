"use client";

import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import type { Contact } from "./TajnidMap";

interface AddContactModalProps {
  onClose: () => void;
  onAdd: (contact: Partial<Contact>) => void;
}

export default function AddContactModal({ onClose, onAdd }: AddContactModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    age: "",
    auxiliary: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    
    onAdd({
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      age: form.age ? parseInt(form.age, 10) : undefined,
      auxiliary: form.auxiliary,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md glass border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden slide-in-from-bottom-4 animate-in duration-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
          <h2 className="text-sm font-black uppercase tracking-widest text-[var(--accent-main)]">Add Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/20 transition-all text-[var(--text-dim)] hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1 block">Name *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] transition-all"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1 block">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1 block">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1 block">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1 block">Auxiliary</label>
            <select
              value={form.auxiliary}
              onChange={e => setForm(f => ({ ...f, auxiliary: e.target.value }))}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-main)] transition-all appearance-none"
            >
              <option value="">Select...</option>
              <option value="Khuddam">Khuddam</option>
              <option value="Ansar">Ansar</option>
              <option value="Atfal">Atfal</option>
              <option value="Lajna">Lajna</option>
              <option value="Nasirat">Nasirat</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent-main)] text-white font-black uppercase tracking-widest text-xs hover:bg-[var(--accent-hover)] transition-all active:scale-95"
          >
            <Plus size={16} />
            Add Member
          </button>
        </form>
      </div>
    </div>
  );
}
