"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Laporan = {
  id: string;
  jenis: string;
  deskripsi: string | null;
  status: "baru" | "diproses" | "selesai" | "ditolak";
  foto_url: string | null;
  created_at: string;
  petugas_id: string | null;
  pelapor: { nama: string } | null;
};

type Petugas = { id: string; nama: string; jenis_petugas: string | null };

const STATUS_WARNA: Record<string, string> = {
  baru: "text-signal border-signal",
  diproses: "text-bestari border-bestari",
  selesai: "text-melati border-melati",
  ditolak: "text-danger border-danger",
};

export default function LaporanPage() {
  const supabase = createClient();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [filter, setFilter] = useState<string>("semua");

  async function load() {
    const { data } = await supabase
      .from("laporan")
      .select("id, jenis, deskripsi, status, foto_url, created_at, petugas_id, pelapor:pelapor_id(nama)")
      .order("created_at", { ascending: false });
    if (data) setLaporan(data as unknown as Laporan[]);

    const { data: p } = await supabase
      .from("profiles")
      .select("id, nama, jenis_petugas")
      .eq("role", "petugas");
    if (p) setPetugasList(p as Petugas[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function ubahStatus(id: string, status: Laporan["status"]) {
    await supabase.from("laporan").update({ status }).eq("id", id);
    load();
  }

  async function assignPetugas(id: string, petugas_id: string) {
    await supabase.from("laporan").update({ petugas_id }).eq("id", id);
    load();
  }

  const filtered = laporan.filter((l) => filter === "semua" || l.status === filter);

  return (
    <div>
      <p className="font-data text-xs text-muted uppercase tracking-widest mb-1">
        02 · Aduan
      </p>
      <h2 className="font-display text-2xl font-semibold mb-1">Laporan Warga</h2>
      <p className="text-muted text-sm mb-6">
        Tinjau, tugaskan ke petugas, dan perbarui status laporan masuk.
      </p>

      <div className="flex gap-2 mb-5">
        {["semua", "baru", "diproses", "selesai", "ditolak"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs border transition capitalize ${
              filter === s ? "bg-panel border-signal text-ink" : "border-line text-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((l) => (
          <div key={l.id} className="bg-panel border border-line rounded-lg p-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium">{l.jenis}</p>
                <p className="text-sm text-muted mt-0.5">{l.deskripsi}</p>
                <p className="text-xs text-muted mt-2 font-data">
                  {l.pelapor?.nama ?? "Warga"} · {new Date(l.created_at).toLocaleString("id-ID")}
                </p>
              </div>
              <span
                className={`text-xs border rounded-full px-2.5 py-1 shrink-0 capitalize ${STATUS_WARNA[l.status]}`}
              >
                {l.status}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <select
                value={l.petugas_id ?? ""}
                onChange={(e) => assignPetugas(l.id, e.target.value)}
                className="bg-base border border-line rounded-md text-xs px-2 py-1.5 text-ink"
              >
                <option value="">Tugaskan petugas…</option>
                {petugasList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.jenis_petugas})
                  </option>
                ))}
              </select>

              <select
                value={l.status}
                onChange={(e) => ubahStatus(l.id, e.target.value as Laporan["status"])}
                className="bg-base border border-line rounded-md text-xs px-2 py-1.5 text-ink capitalize"
              >
                {["baru", "diproses", "selesai", "ditolak"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted text-sm">Tidak ada laporan untuk filter ini.</p>
        )}
      </div>
    </div>
  );
}
