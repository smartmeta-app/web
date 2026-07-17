"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Jenis = { id: string; nama_sampah: string; poin_per_kg: number; aktif: boolean };
type Transaksi = {
  id: string;
  tipe: string;
  jumlah_poin: number;
  berat_kg: number | null;
  keterangan: string | null;
  created_at: string;
  diverifikasi_oleh: string | null;
  warga: { nama: string } | null;
};

export default function BankSampahPage() {
  const supabase = createClient();
  const [jenis, setJenis] = useState<Jenis[]>([]);
  const [tx, setTx] = useState<Transaksi[]>([]);
  const [namaBaru, setNamaBaru] = useState("");
  const [poinBaru, setPoinBaru] = useState("");

  async function load() {
    const { data: j } = await supabase.from("bank_sampah_jenis").select("*").order("nama_sampah");
    if (j) setJenis(j as Jenis[]);
    const { data: t } = await supabase
      .from("bank_sampah_transaksi")
      .select("id, tipe, jumlah_poin, berat_kg, keterangan, created_at, diverifikasi_oleh, warga:warga_id(nama)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (t) setTx(t as unknown as Transaksi[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function tambahJenis() {
    if (!namaBaru || !poinBaru) return;
    await supabase.from("bank_sampah_jenis").insert({
      nama_sampah: namaBaru,
      poin_per_kg: Number(poinBaru),
    });
    setNamaBaru("");
    setPoinBaru("");
    load();
  }

  async function verifikasi(id: string) {
    const { data: userData } = await supabase.auth.getUser();
    await supabase
      .from("bank_sampah_transaksi")
      .update({ diverifikasi_oleh: userData.user?.id })
      .eq("id", id);
    load();
  }

  const pendingTx = tx.filter((t) => !t.diverifikasi_oleh);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <p className="font-data text-xs text-muted uppercase tracking-widest mb-1">
          03 · Bank Sampah
        </p>
        <h2 className="font-display text-2xl font-semibold mb-1">Jenis & Harga Sampah</h2>
        <p className="text-muted text-sm mb-5">Atur poin per kilogram untuk tiap jenis sampah.</p>

        <div className="flex gap-2 mb-4">
          <input
            placeholder="Nama sampah"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            className="flex-1 bg-panel border border-line rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="Poin/kg"
            type="number"
            value={poinBaru}
            onChange={(e) => setPoinBaru(e.target.value)}
            className="w-28 bg-panel border border-line rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={tambahJenis}
            className="bg-signal text-base font-medium rounded-md px-4 text-sm"
          >
            Tambah
          </button>
        </div>

        <div className="space-y-2">
          {jenis.map((j) => (
            <div
              key={j.id}
              className="flex justify-between bg-panel border border-line rounded-lg px-4 py-3"
            >
              <span>{j.nama_sampah}</span>
              <span className="font-data text-signal">{j.poin_per_kg} pt/kg</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-data text-xs text-muted uppercase tracking-widest mb-1">
          Verifikasi
        </p>
        <h2 className="font-display text-2xl font-semibold mb-1">Transaksi Menunggu</h2>
        <p className="text-muted text-sm mb-5">
          Setor sampah, tukar sembako, dan bayar pajak dicatat manual — verifikasi di sini.
        </p>

        <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
          {pendingTx.map((t) => (
            <div key={t.id} className="bg-panel border border-line rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium capitalize">{t.tipe.replaceAll("_", " ")}</p>
                  <p className="text-xs text-muted">{t.warga?.nama}</p>
                  {t.berat_kg && (
                    <p className="text-xs text-muted font-data">{t.berat_kg} kg</p>
                  )}
                  {t.keterangan && <p className="text-xs text-muted mt-1">{t.keterangan}</p>}
                </div>
                <span className="font-data text-sm text-signal">{t.jumlah_poin} pt</span>
              </div>
              <button
                onClick={() => verifikasi(t.id)}
                className="mt-3 text-xs bg-melati/20 text-melati border border-melati rounded-md px-3 py-1.5 hover:bg-melati/30 transition"
              >
                Verifikasi
              </button>
            </div>
          ))}
          {pendingTx.length === 0 && (
            <p className="text-muted text-sm">Tidak ada transaksi menunggu verifikasi.</p>
          )}
        </div>
      </div>
    </div>
  );
}
