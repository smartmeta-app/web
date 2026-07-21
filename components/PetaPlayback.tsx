"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

export type TitikRute = {
  latitude: number;
  longitude: number;
  recorded_at: string;
};

export default function PetaPlayback({
  titik,
  currentIndex,
}: {
  titik: TitikRute[];
  currentIndex: number;
}) {
  const mapRef = useRef<LeafletMap | null>(null);
  const current = titik[currentIndex];
  const jalur: [number, number][] = titik.map((t) => [t.latitude, t.longitude]);

  useEffect(() => {
    if (mapRef.current && current) {
      mapRef.current.panTo([current.latitude, current.longitude]);
    }
  }, [currentIndex, current]);

  if (titik.length === 0) return null;

  return (
    <MapContainer
      center={[titik[0].latitude, titik[0].longitude]}
      zoom={16}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Jalur penuh — garis pudar menunjukkan seluruh rute hari itu */}
      <Polyline positions={jalur} pathOptions={{ color: "#6E9BC7", weight: 3, opacity: 0.35 }} />
      {/* Jalur yang sudah "dilewati" playback — solid, ikut slider */}
      <Polyline
        positions={jalur.slice(0, currentIndex + 1)}
        pathOptions={{ color: "#E8A33D", weight: 4, opacity: 0.9 }}
      />
      {current && (
        <Marker position={[current.latitude, current.longitude]}>
          <Popup>
            <div className="font-body text-sm">
              {new Date(current.recorded_at).toLocaleTimeString("id-ID", {
                timeZone: "Asia/Jakarta",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}{" "}
              WIB
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
