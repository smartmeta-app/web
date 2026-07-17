"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Zona = { id: string; nama_zona: string };
type Notif = {
  id: string;
  judul: string;
  isi: string;
  target_role: string | null;
  created_at: string;
};

export default function NotifikasiPage() {
  const supabase = createClient();
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetZona, setTargetZona] = useState<string>("");
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [riwayat, setRiwayat] = useState<Notif[]>([]);
  const [terkirim, setTerkirim] = useState(false);

  async function load() {
    const { data: z } = await supabase.from("zonas").select("id, nama_zona");
    if (z) setZonas(z as Zona[]);
    const { data: n } = await supabase
      .from("notifikasi")
      .select("id, judul, isi, target_role, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (n) setRiwayat(n as Notif[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function kirim() {
    if (!judul || !isi) return;
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("notifikasi").insert({
      judul,
      isi,
      target_role: targetRole || null,
      target_zona_id: targetZona || null,
      dikirim_oleh: userData.user?.id,
    });
    // Catatan: pengiriman push notification sesungguhnya (OneSignal) dipicu dari
    // Supabase Edge Function yang subscribe ke insert tabel `notifikasi`.
    setJudul("");
    setIsi("");
    setTerkirim(true);
    setTimeout(() => setTerkirim(false), 2500);
    load();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <p className="font-data text-xs text-muted uppercase tracking-widest mb-1">
          07 · Broadcast
        </p>
        <h2 className="font-display text-2xl font-semibold mb-1">Kirim Notifikasi</h2>
        <p className="text-muted text-sm mb-5">
          Notifikasi dikirim ke semua, berdasarkan peran, atau zona tertentu.
        </p>

        <div className="space-y-3">
          <input
            placeholder="Judul"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full bg-panel border border-line rounded-md px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Isi pesan"
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            rows={4}
            className="w-full bg-panel border border-line rounded-md px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="flex-1 bg-panel border border-line rounded-md px-3 py-2 text-sm"
            >
              <option value="">Semua peran</option>
              <option value="petugas">Petugas</option>
              <option value="warga">Warga</option>
            </select>
            <select
              value={targetZona}
              onChange={(e) => setTargetZona(e.target.value)}
              className="flex-1 bg-panel border border-line rounded-md px-3 py-2 text-sm"
            >
              <option value="">Semua zona</option>
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nama_zona}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={kirim}
            className="bg-signal text-base font-medium rounded-md px-4 py-2 text-sm w-full"
          >
            {terkirim ? "Terkirim ✓" : "Kirim Broadcast"}
          </button>
        </div>
      </div>

      <div>
        <p className="font-data text-xs text-muted uppercase tracking-widest mb-1">Riwayat</p>
        <h2 className="font-display text-2xl font-semibold mb-5">Notifikasi Terkirim</h2>
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {riwayat.map((n) => (
            <div key={n.id} className="bg-panel border border-line rounded-lg p-4">
              <p className="text-sm font-medium">{n.judul}</p>
              <p className="text-xs text-muted mt-1">{n.isi}</p>
              <p className="text-[10px] font-data text-muted mt-2">
                {n.target_role ?? "semua peran"} · {new Date(n.created_at).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
