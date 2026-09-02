"use client";

import React, { useMemo } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

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
  selectedContactId: string | null;
  onSelectContact: (id: string | null) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  background: "#020310",
};

// Dark mode style matching Murrabi Desk aesthetic
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

export default function TajnidMap({ contacts, userLocation, selectedContactId, onSelectContact }: TajnidMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const defaultCenter = useMemo(() => ({ lat: 43.8643, lng: -79.5298 }), []);
  const center = useMemo(() => (userLocation ? { lat: userLocation[0], lng: userLocation[1] } : defaultCenter), [userLocation, defaultCenter]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full rounded-[14px] overflow-hidden border border-white/10 flex items-center justify-center bg-black/10">
        <Loader2 className="animate-spin text-white/50" size={32} />
      </div>
    );
  }

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <div className="w-full h-full rounded-[14px] overflow-hidden border border-white/10 relative z-0">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedContact?.lat && selectedContact?.lng ? { lat: selectedContact.lat, lng: selectedContact.lng } : center}
        zoom={selectedContact ? 15 : 12}
        options={mapOptions}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={{ lat: userLocation[0], lng: userLocation[1] }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#ef4444", // Red
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            }}
            title="Your Location"
          />
        )}

        {/* Contact Markers */}
        {contacts.map((c) => {
          if (c.lat && c.lng) {
            return (
              <Marker
                key={c.id}
                position={{ lat: c.lat, lng: c.lng }}
                onClick={() => onSelectContact(c.id)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: "#3b82f6", // Blue
                  fillOpacity: 0.9,
                  strokeWeight: 1,
                  strokeColor: "#ffffff",
                }}
              />
            );
          }
          return null;
        })}

        {/* Selected Contact Popup */}
        {selectedContact && selectedContact.lat && selectedContact.lng && (
          <InfoWindow
            position={{ lat: selectedContact.lat, lng: selectedContact.lng }}
            onCloseClick={() => onSelectContact(null)}
          >
            <div className="text-black p-1 max-w-[200px]">
              <strong className="block mb-1 text-sm">{selectedContact.name}</strong>
              <div className="text-xs text-gray-700">{selectedContact.phone}</div>
              <div className="text-xs text-gray-700 leading-tight mt-1">{selectedContact.address}</div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
