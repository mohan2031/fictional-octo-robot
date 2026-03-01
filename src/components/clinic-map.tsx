'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Clinic } from '@/lib/types';
import Link from 'next/link';

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface ClinicMapProps {
  clinics: Clinic[];
}

export function ClinicMap({ clinics }: ClinicMapProps) {
  if (clinics.length === 0) {
    return <div className="h-full w-full bg-muted flex items-center justify-center"><p>No clinics to display on map.</p></div>;
  }
  
  // Calculate center of map to focus on
  const latitudes = clinics.map(s => s.lat).filter(lat => lat !== 0);
  const longitudes = clinics.map(s => s.lng).filter(lng => lng !== 0);

  const centerLat = latitudes.length > 0 ? latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length : 20.5937;
  const centerLng = longitudes.length > 0 ? longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length : 78.9629;
  const zoomLevel = latitudes.length > 0 ? 8 : 4;


  return (
    <MapContainer center={[centerLat, centerLng]} zoom={zoomLevel} scrollWheelZoom={true} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clinics.map(clinic => (
        clinic.lat !== 0 && clinic.lng !== 0 &&
        <Marker key={clinic.id} position={[clinic.lat, clinic.lng]} icon={icon}>
          <Popup>
            <div className="space-y-1">
                <div className="font-bold">{clinic.name}</div>
                <p className="text-xs text-muted-foreground">{clinic.location}</p>
                <Link href={`/clinics/${clinic.id}`} className="text-sm text-primary hover:underline">
                View Clinic
                </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
