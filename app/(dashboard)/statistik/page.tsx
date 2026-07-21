"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { exportExcelDenganFoto } from "@/lib/export-excel";
import { BarChart3, FileDown, Loader2 } from "lucide-react";

export default function StatistikPage() {
  const supabase = createClient();
  const [laporanPerStatus, setLaporanPerStatus] = useState<{ status: string; jumlah: number }[]>([]);
  const [kinerja, setKinerja] = useState<{ nama: string; selesai: number }[]>([]);
  const [rawLaporan, setRawLaporan] = useState<any[]>([]);
  const [rawAbsensi, setRawAbsensi] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: laporan } = await supabase.from("laporan").select("*");
      if (laporan) {
        setRawLaporan(laporan);
        const grup: Record<string, number> = {};
        laporan.forEach((l: any) => (grup[l.status] = (grup[l.status] || 0) + 1));
        setLaporanPerStatus(Object.entries(grup).map(([status, jumlah]) => ({ status, jumlah })));
      }

      const { data: selesai } = await supabase
        .from("laporan")
        .select("petugas_id, status, profiles:petugas_id(nama)")
        .eq("status", "selesai");
      if (selesai) {
        const grup: Record<string, number> = {};
        selesai.forEach((l: any) => {
          const nama = l.profiles?.nama ?? "Tanpa nama";
          grup[nama] = (grup[nama] || 0) + 1;
        });
        setKinerja(Object.entries(grup).map(([nama, selesai]) => ({ nama, selesai })));
      }

      const { data: absensi } = await supabase.from("absensi").select("*");
      if (absensi) setRawAbsensi(absensi);
    }
    load();
  }, []);

  const [mengekspor, setMengekspor] = useState<"laporan" | "absensi" | null>(null);
  const [progresEkspor, setProgresEkspor] = useState<string>("");
  const [errorEkspor, setErrorEkspor] = useState<string | null>(null);

  async function handleExport(data: any[], namaFile: string, jenis: "laporan" | "absensi") {
    setErrorEkspor(null);
    setMengekspor(jenis);
    setProgresEkspor("Menyiapkan…");
    try {
      await exportExcelDenganFoto(data, namaFile, (selesai, total) => {
        setProgresEkspor(`Mengambil foto ${selesai}/${total}…`);
      });
    } catch (err: any) {
      setErrorEkspor(err?.message ?? "Export gagal, coba lagi.");
    } finally {
      setMengekspor(null);
      setProgresEkspor("");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 size={14} className="text-signal" />
        <p className="font-data text-xs text-muted uppercase tracking-widest">
          06 · Statistik
        </p>
      </div>
      <h2 className="font-display text-2xl font-semibold mb-1">Statistik & Export</h2>
      <p className="text-muted text-sm mb-6">
        Ringkasan kinerja petugas dan tren laporan. Export tersedia dalam format Excel — foto
        (bukti laporan/absensi) ikut tertanam langsung di file, tidak lagi berupa link.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-panel border border-line rounded-lg p-4 sm:p-5">
          <p className="text-sm font-medium mb-4">Laporan per Status</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={laporanPerStatus}>
              <CartesianGrid stroke="#1E3A5F" vertical={false} />
              <XAxis dataKey="status" stroke="#93AAC4" fontSize={12} />
              <YAxis stroke="#93AAC4" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0F2340", border: "1px solid #1E3A5F" }} />
              <Bar dataKey="jumlah" fill="#2F8AF0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-panel border border-line rounded-lg p-4 sm:p-5">
          <p className="text-sm font-medium mb-4">Laporan Selesai per Petugas</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={kinerja}>
              <CartesianGrid stroke="#1E3A5F" vertical={false} />
              <XAxis dataKey="nama" stroke="#93AAC4" fontSize={11} />
              <YAxis stroke="#93AAC4" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0F2340", border: "1px solid #1E3A5F" }} />
              <Bar dataKey="selesai" fill="#22B573" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => handleExport(rawLaporan, "laporan-warga", "laporan")}
          disabled={mengekspor !== null}
          className="flex items-center gap-1.5 text-xs border border-line rounded-md px-3 py-2 hover:border-signal transition disabled:opacity-50"
        >
          {mengekspor === "laporan" ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <FileDown size={13} />
          )}
          Export Laporan (.xlsx)
        </button>
        <button
          onClick={() => handleExport(rawAbsensi, "absensi-petugas", "absensi")}
          disabled={mengekspor !== null}
          className="flex items-center gap-1.5 text-xs border border-line rounded-md px-3 py-2 hover:border-signal transition disabled:opacity-50"
        >
          {mengekspor === "absensi" ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <FileDown size={13} />
          )}
          Export Absensi (.xlsx)
        </button>
        {mengekspor && <span className="text-xs text-muted">{progresEkspor}</span>}
        {errorEkspor && <span className="text-xs text-danger">{errorEkspor}</span>}
      </div>
    </div>
  );
}
