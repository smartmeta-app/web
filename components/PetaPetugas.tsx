"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import { createClient } from "@/lib/supabase-browser";
import { formatWaktu } from "@/lib/format-waktu";

type LokasiRow = {
  petugas_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  profiles: { nama: string; jenis_petugas: "melati" | "bestari" | null } | null;
};

const PUSAT_KELURAHAN: [number, number] = [3.5697, 98.6742]; // Medan, sesuaikan titik pasti

export default function PetaPetugas() {
  const supabase = createClient();
  const [lokasi, setLokasi] = useState<LokasiRow[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("lokasi_petugas")
        .select("petugas_id, latitude, longitude, updated_at, profiles(nama, jenis_petugas)");
      if (data) setLokasi(data as unknown as LokasiRow[]);
    }
    load();

    const channel = supabase
      .channel("lokasi-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lokasi_petugas" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <MapContainer
      center={PUSAT_KELURAHAN}
      zoom={15}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lokasi.map((l) => {
        const warna = l.profiles?.jenis_petugas === "bestari" ? "#6E9BC7" : "#7FB88F";
        return (
          <CircleMarker
            key={l.petugas_id}
            center={[l.latitude, l.longitude]}
            radius={9}
            pathOptions={{ color: warna, fillColor: warna, fillOpacity: 0.85 }}
          >
            <Popup>
              <div className="font-body text-sm">
                <strong>{l.profiles?.nama ?? "Petugas"}</strong>
                <br />
                {l.profiles?.jenis_petugas ?? "-"}
                <br />
                <span className="text-xs text-gray-500">
                  update: {formatWaktu(l.updated_at)}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
