"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { formatTanggalWaktu } from "@/lib/format-waktu";
import { Camera, ImageOff, X, MapPin } from "lucide-react";

type AbsensiFoto = {
  id: string;
  petugas_id: string;
  status: "masuk" | "keluar";
  latitude: number;
  longitude: number;
  foto_selfie_url: string;
  dalam_radius: boolean;
  waktu: string;
  petugas: { nama: string; jenis_petugas: string | null } | null;
};

type Petugas = { id: string; nama: string };

function todayWIB(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now);
}

export default function AbsensiPetugasPage() {
  const supabase = createClient();
  const [absensi, setAbsensi] = useState<AbsensiFoto[]>([]);
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [filterPetugas, setFilterPetugas] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [loading, setLoading] = useState(true);
  const [fotoDilihat, setFotoDilihat] = useState<string | null>(null);

  useEffect(() => {
    async function loadPetugas() {
      const { data } = await supabase
        .from("profiles")
        .select("id, nama")
        .eq("role", "petugas")
        .order("nama");
      if (data) setPetugasList(data as Petugas[]);
    }
    loadPetugas();
  }, []);

  async function load() {
    setLoading(true);
    let query = supabase
      .from("absensi")
      .select(
        "id, petugas_id, status, latitude, longitude, foto_selfie_url, dalam_radius, waktu, petugas:petugas_id(nama, jenis_petugas)"
      )
      .order("waktu", { ascending: false });

    if (filterPetugas) query = query.eq("petugas_id", filterPetugas);

    if (filterTanggal) {
      const start = new Date(`${filterTanggal}T00:00:00+07:00`).toISOString();
      const end = new Date(`${filterTanggal}T23:59:59+07:00`).toISOString();
      query = query.gte("waktu", start).lte("waktu", end);
    }

    const { data } = await query;
    setAbsensi((data as unknown as AbsensiFoto[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPetugas, filterTanggal]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Camera size={14} className="text-signal" />
        <p className="font-data text-xs text-muted uppercase tracking-widest">
          03 · Absensi Petugas
        </p>
      </div>
      <h2 className="font-display text-2xl font-semibold mb-1">Foto Absensi Kehadiran</h2>
      <p className="text-muted text-sm mb-6">
        Dokumentasi foto selfie absen masuk & keluar petugas — filter berdasarkan nama & tanggal.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <select
          value={filterPetugas}
          onChange={(e) => setFilterPetugas(e.target.value)}
          className="bg-panel border border-line rounded-md px-3 py-2 text-sm sm:min-w-[220px]"
        >
          <option value="">Semua petugas</option>
          {petugasList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterTanggal}
          onChange={(e) => setFilterTanggal(e.target.value)}
          className="bg-panel border border-line rounded-md px-3 py-2 text-sm"
        />
        {(filterPetugas || filterTanggal) && (
          <button
            onClick={() => {
              setFilterPetugas("");
              setFilterTanggal("");
            }}
            className="flex items-center gap-1 text-xs text-muted hover:text-ink border border-line rounded-md px-3 py-2 transition"
          >
            <X size={13} /> Reset filter
          </button>
        )}
        <button
          onClick={() => setFilterTanggal(todayWIB())}
          className="text-xs border border-line rounded-md px-3 py-2 hover:border-signal transition"
        >
          Hari ini
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Memuat…</p>
      ) : absensi.length === 0 ? (
        <div className="rounded-xl border border-line bg-panel p-10 text-center text-muted text-sm">
          Tidak ada data absensi untuk filter ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {absensi.map((a) => (
            <div key={a.id} className="bg-panel border border-line rounded-xl overflow-hidden">
              <button
                onClick={() => a.foto_selfie_url && setFotoDilihat(a.foto_selfie_url)}
                className="block w-full aspect-video bg-base"
              >
                {a.foto_selfie_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.foto_selfie_url}
                    alt={`Absen ${a.status}`}
                    className="w-full h-full object-cover hover:opacity-90 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <ImageOff size={28} />
                  </div>
                )}
              </button>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">
                    {a.petugas?.nama ?? "Petugas"}
                    {a.petugas?.jenis_petugas ? ` · ${a.petugas.jenis_petugas}` : ""}
                  </p>
                  <span
                    className={`shrink-0 text-[10px] font-data font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                      a.status === "masuk"
                        ? "bg-signal/15 text-signal border-signal/30"
                        : "bg-melati/15 text-melati border-melati/30"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span
                    className={`flex items-center gap-1 text-[10px] font-data ${
                      a.dalam_radius ? "text-melati" : "text-danger"
                    }`}
                  >
                    <MapPin size={11} />
                    {a.dalam_radius ? "Dalam radius zona" : "Luar radius zona"}
                  </span>
                </div>
                <p className="text-[10px] text-muted mt-1 font-data">
                  {formatTanggalWaktu(a.waktu)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox sederhana untuk lihat foto ukuran penuh */}
      {fotoDilihat && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setFotoDilihat(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoDilihat}
            alt="Foto absensi"
            className="max-w-full max-h-full rounded-lg object-contain"
          />
          <button
            onClick={() => setFotoDilihat(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white"
          >
            <X size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
