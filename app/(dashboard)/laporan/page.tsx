"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { formatTanggalWaktu } from "@/lib/format-waktu";
import { ClipboardList, ImageOff, X } from "lucide-react";

type LaporanHarian = {
  id: string;
  jenis: string;
  deskripsi: string | null;
  foto_url: string | null;
  created_at: string;
  petugas_id: string | null;
  petugas: { nama: string; jenis_petugas: string | null } | null;
};

type Petugas = { id: string; nama: string };

function todayWIB(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now);
}

export default function LaporanHarianPage() {
  const supabase = createClient();
  const [laporan, setLaporan] = useState<LaporanHarian[]>([]);
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
    // Laporan harian = laporan yang DIBUAT OLEH petugas (petugas_id terisi),
    // beda dengan pengaduan warga yang punya pelapor_id. Ini foto kegiatan
    // kerja lapangan, bukan komplain masuk.
    let query = supabase
      .from("laporan")
      .select("id, jenis, deskripsi, foto_url, created_at, petugas_id, petugas:petugas_id(nama, jenis_petugas)")
      .not("petugas_id", "is", null)
      .order("created_at", { ascending: false });

    if (filterPetugas) query = query.eq("petugas_id", filterPetugas);

    if (filterTanggal) {
      const start = new Date(`${filterTanggal}T00:00:00+07:00`).toISOString();
      const end = new Date(`${filterTanggal}T23:59:59+07:00`).toISOString();
      query = query.gte("created_at", start).lte("created_at", end);
    }

    const { data } = await query;
    setLaporan((data as unknown as LaporanHarian[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPetugas, filterTanggal]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList size={14} className="text-signal" />
        <p className="font-data text-xs text-muted uppercase tracking-widest">
          02 · Laporan Harian
        </p>
      </div>
      <h2 className="font-display text-2xl font-semibold mb-1">Laporan Harian Petugas</h2>
      <p className="text-muted text-sm mb-6">
        Dokumentasi foto kegiatan kerja lapangan petugas — filter berdasarkan nama & tanggal.
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
      ) : laporan.length === 0 ? (
        <div className="rounded-xl border border-line bg-panel p-10 text-center text-muted text-sm">
          Tidak ada laporan harian untuk filter ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {laporan.map((l) => (
            <div key={l.id} className="bg-panel border border-line rounded-xl overflow-hidden">
              <button
                onClick={() => l.foto_url && setFotoDilihat(l.foto_url)}
                className="block w-full aspect-video bg-base"
              >
                {l.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.foto_url}
                    alt={l.jenis}
                    className="w-full h-full object-cover hover:opacity-90 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <ImageOff size={28} />
                  </div>
                )}
              </button>
              <div className="p-4">
                <p className="font-medium text-sm">{l.jenis}</p>
                {l.deskripsi && (
                  <p className="text-xs text-muted mt-1 break-words line-clamp-2">{l.deskripsi}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-data text-signal">
                    {l.petugas?.nama ?? "Petugas"}
                    {l.petugas?.jenis_petugas ? ` · ${l.petugas.jenis_petugas}` : ""}
                  </span>
                </div>
                <p className="text-[10px] text-muted mt-1 font-data">
                  {formatTanggalWaktu(l.created_at)}
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
            alt="Foto laporan"
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
