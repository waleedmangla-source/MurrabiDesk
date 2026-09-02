"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues with Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface TajnidMapProps {
  contacts: Contact[];
  userLocation: [number, number] | null;
}

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function TajnidMap({ contacts, userLocation }: TajnidMapProps) {
  // Default center to a general location (e.g., Peace Village area as a placeholder)
  const defaultCenter: [number, number] = [43.8643, -79.5298];
  const center = userLocation || defaultCenter;

  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden border border-white/10 relative z-0">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%", background: "#020310" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater center={userLocation} />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-black font-bold">Your Location</div>
            </Popup>
          </Marker>
        )}

        {contacts.map((c) => {
          if (c.lat && c.lng) {
            return (
              <Marker key={c.id} position={[c.lat, c.lng]}>
                <Popup>
                  <div className="text-black">
                    <strong className="block mb-1">{c.name}</strong>
                    <div className="text-xs text-gray-700">{c.phone}</div>
                    <div className="text-xs text-gray-700">{c.address}</div>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
