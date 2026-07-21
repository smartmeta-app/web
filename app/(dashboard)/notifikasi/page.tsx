"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { formatTanggalWaktu } from "@/lib/format-waktu";
import { Megaphone } from "lucide-react";

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
  const [riwayat, setRiwayat] = useState<Notif[]>([]);
  const [terkirim, setTerkirim] = useState(false);

  async function load() {
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
        <div className="flex items-center gap-2 mb-1">
          <Megaphone size={14} className="text-signal" />
          <p className="font-data text-xs text-muted uppercase tracking-widest">
            07 · Broadcast
          </p>
        </div>
        <h2 className="font-display text-2xl font-semibold mb-1">Kirim Notifikasi</h2>
        <p className="text-muted text-sm mb-5">
          Notifikasi dikirim ke semua pengguna atau berdasarkan peran tertentu.
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
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full bg-panel border border-line rounded-md px-3 py-2 text-sm"
          >
            <option value="">Semua peran</option>
            <option value="petugas">Petugas</option>
            <option value="warga">Warga</option>
          </select>
          <button
            onClick={kirim}
            className="bg-gradient-to-r from-signal to-melati text-white font-medium rounded-md px-4 py-2 text-sm w-full"
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
              <p className="text-sm font-medium break-words">{n.judul}</p>
              <p className="text-xs text-muted mt-1 break-words">{n.isi}</p>
              <p className="text-[10px] font-data text-muted mt-2">
                {n.target_role ?? "semua peran"} · {formatTanggalWaktu(n.created_at)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
