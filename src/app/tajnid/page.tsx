"use client";

import React, { useState, useEffect } from "react";
import { Upload, Users, Search, MapPin, Loader2, Navigation, Info, Plus, Copy, Check, Download, Filter, X } from "lucide-react";
import dynamic from "next/dynamic";
import Papa from "papaparse";
import clsx from "clsx";
import type { Contact } from "@/components/TajnidMap";
import AddContactModal from "@/components/AddContactModal";

// Dynamic import with no SSR to avoid window is not defined
const TajnidMap = dynamic(() => import("@/components/TajnidMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/10 text-white/50">
      <Loader2 size={24} className="animate-spin" />
    </div>
  ),
});

const MOCK_CONTACTS: Contact[] = [
  {
    id: "mock-1",
    name: "Waleed Mangla",
    phone: "416-555-0101",
    email: "waleed@example.com",
    address: "10610 Jane St, Maple, ON L6A 3A2",
    age: 30,
    auxiliary: "Khuddam",
    lat: 43.8643,
    lng: -79.5298,
  },
  {
    id: "mock-2",
    name: "Ahmad Khan",
    phone: "416-555-0202",
    email: "ahmad@example.com",
    address: "100 Melville Rd, Maple, ON L6A 1Z5",
    age: 45,
    auxiliary: "Ansar",
    lat: 43.8587,
    lng: -79.5089,
  },
  {
    id: "mock-3",
    name: "Tahir Ahmad",
    phone: "905-555-0303",
    email: "tahir@example.com",
    address: "1 Canada's Wonderland Dr, Vaughan, ON",
    age: 12,
    auxiliary: "Atfal",
    lat: 43.8430,
    lng: -79.5390,
  },
  {
    id: "mock-4",
    name: "Ayesha Ali",
    phone: "905-555-0404",
    email: "ayesha@example.com",
    address: "1 Bass Pro Mills Dr, Vaughan, ON",
    age: 28,
    auxiliary: "Lajna",
    lat: 43.8258,
    lng: -79.5385,
  },
  {
    id: "mock-5",
    name: "Fatima Syed",
    phone: "647-555-0505",
    email: "fatima@example.com",
    address: "225 High Tech Rd, Richmond Hill, ON",
    age: 14,
    auxiliary: "Nasirat",
    lat: 43.8428,
    lng: -79.4303,
  }
];

export default function TajnidPage() {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [query, setQuery] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  // New features state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterAuxiliary, setFilterAuxiliary] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Request user location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const exportSelectedCsv = () => {
    if (selectedIds.size === 0) return;
    const selectedData = contacts.filter(c => selectedIds.has(c.id));
    const csv = Papa.unparse(selectedData.map(c => ({
      Name: c.name,
      Phone: c.phone,
      Email: c.email,
      Address: c.address,
      Age: c.age || "",
      Auxiliary: c.auxiliary || "",
      Latitude: c.lat || "",
      Longitude: c.lng || ""
    })));
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tajnid_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddMember = async (newContact: Partial<Contact>) => {
    setIsAddModalOpen(false);
    const c: Contact = {
      id: `manual-${Date.now()}`,
      name: newContact.name || "Unknown",
      phone: newContact.phone || "",
      email: newContact.email || "",
      address: newContact.address || "",
      age: newContact.age,
      auxiliary: newContact.auxiliary,
    };

    if (c.address) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        try {
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(c.address)}&key=${apiKey}`);
          const data = await res.json();
          if (data.status === "OK" && data.results.length > 0) {
            const loc = data.results[0].geometry.location;
            c.lat = loc.lat;
            c.lng = loc.lng;
          }
        } catch (err) {
          console.error("Geocoding failed for manual add", err);
        }
      }
    }

    setContacts(prev => [c, ...prev]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsed = results.data as any[];
        
        const loadedContacts: Contact[] = parsed.map((row, index) => {
          return {
            id: `csv-${Date.now()}-${index}`,
            name: row.Name || row.name || "Unknown",
            phone: row.Phone || row.phone || "",
            email: row.Email || row.email || "",
            address: row.Address || row.address || "",
            age: row.Age ? parseInt(row.Age, 10) : (row.age ? parseInt(row.age, 10) : undefined),
            auxiliary: row.Auxiliary || row.auxiliary || "",
            lat: row.lat ? parseFloat(row.lat) : (row.latitude ? parseFloat(row.latitude) : undefined),
            lng: row.lng ? parseFloat(row.lng) : (row.longitude ? parseFloat(row.longitude) : undefined),
          };
        });

        // Basic geocoding for contacts missing lat/lng using Google Maps Geocoding API
        const toGeocode = loadedContacts.filter(c => !c.lat && !c.lng && c.address);
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (toGeocode.length > 0 && apiKey) {
          for (let i = 0; i < toGeocode.length; i++) { 
            const c = toGeocode[i];
            try {
              const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(c.address)}&key=${apiKey}`);
              const data = await res.json();
              if (data.status === "OK" && data.results.length > 0) {
                const loc = data.results[0].geometry.location;
                c.lat = loc.lat;
                c.lng = loc.lng;
              }
            } catch (err) {
              console.error("Geocoding failed for", c.address);
            }
            setGeocodingProgress(Math.round(((i + 1) / toGeocode.length) * 100));
            await new Promise(r => setTimeout(r, 200)); 
          }
        }
        
        setContacts(prev => [...loadedContacts, ...prev]);
        setIsUploading(false);
        setGeocodingProgress(0);
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        setIsUploading(false);
      }
    });
  };

  const filteredContacts = contacts.filter(c => {
    const q = query.toLowerCase();
    const matchesQuery = c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.phone.includes(q);
    const matchesFilter = filterAuxiliary === "All" || c.auxiliary === filterAuxiliary;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      {isAddModalOpen && (
        <AddContactModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddMember} />
      )}

      {/* Left Pane - Secondary Sidebar styled like Mail sidebar */}
      <div className="w-[240px] shrink-0 border-r border-white/5 glass bg-black/20 flex flex-col overflow-hidden h-full">
        {/* Header */}
        <div className="shrink-0 px-4 pt-6 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-white uppercase truncate leading-none">
              Tajnid
            </h1>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-all text-[var(--text-dim)] hover:text-white"
                title="Add Member"
              >
                <Plus size={16} />
              </button>
              <div className="relative group/tooltip flex items-center">
                <Info size={15} className="text-[var(--text-dim)] hover:text-white transition-all cursor-help" />
                <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-xl text-[10px] leading-relaxed font-medium text-white/90 bg-black/90 backdrop-blur-md border border-white/10 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <span className="font-bold block mb-1 text-[var(--accent-main)]">Prompt your LLM:</span>
                  "Create a CSV from the uploaded files with the following headers: Name, Phone, Email, Address, Age, Auxiliary. (Auxiliary should be one of Khuddam, Ansar, Atfal, Lajna, or Nasirat). Ensure all members are included."
                </div>
              </div>
              <label className="cursor-pointer p-1.5 rounded-lg hover:bg-white/5 transition-all text-[var(--text-dim)] hover:text-[var(--accent-main)] flex items-center gap-1.5" title="Upload CSV">
                {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
              {filteredContacts.length} members{selectedIds.size > 0 ? `, ${selectedIds.size} selected` : ''}
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 glass bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-3">
            <Search size={13} className="text-[var(--text-dim)] shrink-0" />
            <input
              type="text"
              placeholder="Search members..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none"
            />
            {query && <button onClick={() => setQuery('')}><X size={12} className="text-[var(--text-dim)]" /></button>}
          </div>

          {/* Auxiliary Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {["All", "Khuddam", "Ansar", "Atfal", "Lajna", "Nasirat"].map((aux) => {
              const active = filterAuxiliary === aux;
              return (
                <button
                  key={aux}
                  onClick={() => setFilterAuxiliary(aux)}
                  className={clsx(
                    "shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    active
                      ? "text-white"
                      : "text-[var(--text-dim)] hover:text-white border border-white/5 hover:border-white/10"
                  )}
                  style={active ? { background: 'var(--accent-main)' } : {}}
                >
                  {aux}
                </button>
              );
            })}
          </div>
          
          {geocodingProgress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[9px] text-[var(--text-dim)] mb-1 uppercase font-black tracking-widest">
                <span>Geocoding via Google Maps</span>
                <span>{geocodingProgress}%</span>
              </div>
              <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent-main)] transition-all duration-300" 
                  style={{ width: `${geocodingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Selection Header */}
        <div className="px-3.5 py-2 border-b border-white/5 bg-black/10 flex items-center justify-between shrink-0">
          <label className="flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] hover:text-white transition-all">
            <input 
              type="checkbox" 
              className="rounded bg-black/40 border-white/10 accent-[var(--accent-main)] cursor-pointer"
              checked={filteredContacts.length > 0 && selectedIds.size === filteredContacts.length}
              onChange={handleSelectAll}
            />
            {selectedIds.size > 0 ? `${selectedIds.size} Selected` : "Select All"}
          </label>
          
          {selectedIds.size > 0 && (
            <button 
              onClick={exportSelectedCsv}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-main)] text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
            >
              <Download size={11} />
              Export CSV
            </button>
          )}
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
              <Users size={32} className="text-[var(--text-dim)] opacity-30" />
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-dim)]">No contacts found</p>
            </div>
          ) : (
            filteredContacts.map(contact => {
              const isSelected = selectedContactId === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  className={clsx(
                    "w-full flex items-start gap-2.5 px-3.5 py-2.5 border-b border-white/5 text-left transition-all group cursor-pointer",
                    isSelected ? "bg-black/40 border-l-2 border-l-[var(--accent-main)]" : "hover:bg-black/10"
                  )}
                >
                  <input 
                    type="checkbox" 
                    className="mt-0.5 rounded bg-black/40 border-white/10 accent-[var(--accent-main)] cursor-pointer shrink-0"
                    checked={selectedIds.has(contact.id)}
                    onClick={(e) => toggleSelection(contact.id, e)}
                    onChange={() => {}}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-xs truncate font-bold text-[var(--foreground)]">
                        {contact.name}
                      </p>
                      {contact.lat && contact.lng ? (
                        <MapPin size={11} className="text-emerald-400 shrink-0" title="Location verified" />
                      ) : (
                        <MapPin size={11} className="text-red-400 shrink-0 opacity-60" title="Location missing" />
                      )}
                    </div>

                    {(contact.auxiliary || contact.age) && (
                      <div className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-main)] mb-1">
                        {contact.auxiliary}{contact.auxiliary && contact.age ? ' • ' : ''}
                        {contact.age ? `${contact.age} YRS` : ''}
                      </div>
                    )}

                    {contact.phone && (
                      <div className="flex items-center group/copy gap-1.5 text-[10px] text-[var(--text-dim)] truncate mb-0.5">
                        <span>{contact.phone}</span>
                        <span 
                          onClick={(e) => { e.stopPropagation(); handleCopy(contact.phone); }}
                          className="opacity-0 group-hover/copy:opacity-100 p-0.5 hover:bg-white/10 rounded transition-all text-[var(--text-dim)] hover:text-white cursor-pointer"
                          title="Copy Phone"
                        >
                          {copiedText === contact.phone ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        </span>
                        <a 
                          href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover/copy:opacity-100 p-0.5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded transition-all text-[var(--text-dim)]"
                          title="Open in WhatsApp"
                        >
                          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                          </svg>
                        </a>
                      </div>
                    )}

                    {contact.email && (
                      <div className="flex items-center group/copy gap-1.5 text-[10px] text-[var(--text-dim)] truncate mb-0.5">
                        <span>{contact.email}</span>
                        <span 
                          onClick={(e) => { e.stopPropagation(); handleCopy(contact.email); }}
                          className="opacity-0 group-hover/copy:opacity-100 p-0.5 hover:bg-white/10 rounded transition-all text-[var(--text-dim)] hover:text-white cursor-pointer"
                          title="Copy Email"
                        >
                          {copiedText === contact.email ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        </span>
                      </div>
                    )}

                    {contact.address && (
                      <p className="text-[10px] text-[var(--text-dim)] truncate opacity-70" title={contact.address}>
                        {contact.address}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane - Map */}
      <div className="flex-1 p-4 relative bg-black/10">
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-xl flex items-center gap-2">
            <Navigation size={12} className="text-[var(--accent-main)]" />
            Tajnid Google Maps View
          </div>
        </div>
        <TajnidMap 
          contacts={contacts} 
          userLocation={userLocation} 
          selectedContactId={selectedContactId}
          onSelectContact={setSelectedContactId}
        />
      </div>
    </div>
  );
}
