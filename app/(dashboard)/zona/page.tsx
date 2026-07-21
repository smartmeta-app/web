"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { MapPinned } from "lucide-react";

type Zona = {
  id: string;
  nama_zona: string;
  deskripsi: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meter: number | null;
};

export default function ZonaPage() {
  const supabase = createClient();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [nama, setNama] = useState("");
  const [radius, setRadius] = useState("150");

  async function load() {
    const { data } = await supabase.from("zonas").select("*").order("nama_zona");
    if (data) setZonas(data as Zona[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function tambahZona() {
    if (!nama) return;
    await supabase.from("zonas").insert({ nama_zona: nama, radius_meter: Number(radius) });
    setNama("");
    load();
  }

  async function updateRadius(id: string, value: string) {
    await supabase.from("zonas").update({ radius_meter: Number(value) }).eq("id", id);
    load();
  }

  async function hapusZona(id: string) {
    await supabase.from("zonas").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <MapPinned size={14} className="text-signal" />
        <p className="font-data text-xs text-muted uppercase tracking-widest">
          04 · Wilayah
        </p>
      </div>
      <h2 className="font-display text-2xl font-semibold mb-1">Zona & Radius Absensi</h2>
      <p className="text-muted text-sm mb-5">
        Setiap zona punya titik pusat dan radius (meter) yang jadi acuan validasi absensi
        petugas — pastikan kolom <code className="font-data">latitude/longitude</code> zona
        diisi lewat pin di peta (dapat ditambahkan di iterasi berikut) atau langsung di Supabase.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          placeholder="Nama zona, mis. Lingkungan III"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="flex-1 bg-panel border border-line rounded-md px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-24 sm:w-28 bg-panel border border-line rounded-md px-3 py-2 text-sm"
          />
          <button onClick={tambahZona} className="bg-signal text-base rounded-md px-4 text-sm font-medium shrink-0">
            Tambah
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {zonas.map((z) => (
          <div
            key={z.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel border border-line rounded-lg px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{z.nama_zona}</p>
              <p className="text-xs text-muted">
                {z.latitude ? `${z.latitude.toFixed(5)}, ${z.longitude?.toFixed(5)}` : "titik belum diset"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                defaultValue={z.radius_meter ?? 150}
                onBlur={(e) => updateRadius(z.id, e.target.value)}
                className="w-20 bg-base border border-line rounded px-2 py-1 text-xs font-data"
              />
              <span className="text-xs text-muted">m</span>
              <button
                onClick={() => hapusZona(z.id)}
                className="text-xs text-danger border border-danger/40 rounded-md px-2 py-1 hover:bg-danger/10 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
