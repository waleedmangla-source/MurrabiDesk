"use client";

import React, { useState, useEffect } from "react";
import { Upload, Users, Search, MapPin, Loader2, Navigation, Info } from "lucide-react";
import dynamic from "next/dynamic";
import Papa from "papaparse";
import type { Contact } from "@/components/TajnidMap";

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
    lat: 43.8643,
    lng: -79.5298,
  },
  {
    id: "mock-2",
    name: "Ahmad Khan",
    phone: "416-555-0202",
    email: "ahmad@example.com",
    address: "100 Melville Rd, Maple, ON L6A 1Z5",
    lat: 43.8587,
    lng: -79.5089,
  },
  {
    id: "mock-3",
    name: "Tahir Ahmad",
    phone: "905-555-0303",
    email: "tahir@example.com",
    address: "1 Canada's Wonderland Dr, Vaughan, ON",
    lat: 43.8430,
    lng: -79.5390,
  },
  {
    id: "mock-4",
    name: "Usman Ali",
    phone: "905-555-0404",
    email: "usman@example.com",
    address: "1 Bass Pro Mills Dr, Vaughan, ON",
    lat: 43.8258,
    lng: -79.5385,
  },
  {
    id: "mock-5",
    name: "Ibrahim Syed",
    phone: "647-555-0505",
    email: "ibrahim@example.com",
    address: "225 High Tech Rd, Richmond Hill, ON",
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
            id: String(index),
            name: row.Name || row.name || "Unknown",
            phone: row.Phone || row.phone || "",
            email: row.Email || row.email || "",
            address: row.Address || row.address || "",
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
            // Small delay to prevent hitting rate limits (though Google is more generous)
            await new Promise(r => setTimeout(r, 200)); 
          }
        }
        
        setContacts(loadedContacts);
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
    return c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Pane - List & Upload */}
      <div className="w-1/3 min-w-[320px] max-w-md border-r border-white/5 flex flex-col bg-black/20">
        <div className="p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black italic tracking-tighter text-[var(--foreground)] flex items-center gap-2">
              <Users className="text-[var(--accent-main)]" />
              Tajnid
            </h1>
            <div className="flex items-center gap-2">
              <div className="relative group/tooltip flex items-center">
                <Info size={16} className="text-[var(--text-dim)] hover:text-[var(--foreground)] transition-all cursor-help" />
                <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-xl text-[10px] leading-relaxed font-medium text-white/90 bg-black/90 backdrop-blur-md border border-white/10 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <span className="font-bold block mb-1 text-[var(--accent-main)]">Prompt your LLM:</span>
                  "Create a CSV from the uploaded files with the following headers: Name, Phone, Email, Address. Ensure all members are included."
                </div>
              </div>
              <label className="cursor-pointer p-2 rounded-xl glass border border-white/10 hover:bg-white/5 transition-all text-[var(--accent-main)] flex items-center gap-2">
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Upload CSV</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={14} />
            <input
              type="text"
              placeholder="Search members..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-main)] transition-all"
            />
          </div>
          
          {geocodingProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-[var(--text-dim)] mb-1 uppercase font-bold tracking-wider">
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

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-dim)] opacity-50 p-6 text-center">
              <Users size={32} className="mb-3" />
              <p className="text-sm">No contacts found.</p>
              <p className="text-xs mt-1">Upload a CSV file containing Name, Phone, and Address.</p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div 
                key={contact.id} 
                onClick={() => setSelectedContactId(contact.id)}
                className={`p-4 rounded-xl glass border transition-all flex flex-col gap-2 cursor-pointer ${
                  selectedContactId === contact.id ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/10' : 'border-white/5 hover:border-[var(--accent-main)]/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">{contact.name}</h3>
                  {contact.lat && contact.lng ? (
                    <MapPin size={12} className="text-emerald-400 mt-0.5" title="Location verified" />
                  ) : (
                    <MapPin size={12} className="text-red-400 mt-0.5" title="Location missing" />
                  )}
                </div>
                {contact.phone && <div className="text-xs text-[var(--text-dim)]">{contact.phone}</div>}
                {contact.email && <div className="text-xs text-[var(--text-dim)]">{contact.email}</div>}
                {contact.address && <div className="text-xs text-[var(--text-dim)] truncate" title={contact.address}>{contact.address}</div>}
              </div>
            ))
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
