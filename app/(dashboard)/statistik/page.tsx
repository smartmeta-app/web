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
import * as XLSX from "xlsx";
import { BarChart3, FileDown } from "lucide-react";

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

  function exportExcel(data: any[], namaFile: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${namaFile}.xlsx`);
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
        Ringkasan kinerja petugas dan tren laporan. Export tersedia dalam format Excel.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-panel border border-line rounded-lg p-4 sm:p-5">
          <p className="text-sm font-medium mb-4">Laporan per Status</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={laporanPerStatus}>
              <CartesianGrid stroke="#274038" vertical={false} />
              <XAxis dataKey="status" stroke="#9FB3AC" fontSize={12} />
              <YAxis stroke="#9FB3AC" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#16302A", border: "1px solid #274038" }} />
              <Bar dataKey="jumlah" fill="#E8A33D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-panel border border-line rounded-lg p-4 sm:p-5">
          <p className="text-sm font-medium mb-4">Laporan Selesai per Petugas</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={kinerja}>
              <CartesianGrid stroke="#274038" vertical={false} />
              <XAxis dataKey="nama" stroke="#9FB3AC" fontSize={11} />
              <YAxis stroke="#9FB3AC" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#16302A", border: "1px solid #274038" }} />
              <Bar dataKey="selesai" fill="#7FB88F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => exportExcel(rawLaporan, "laporan-warga")}
          className="flex items-center gap-1.5 text-xs border border-line rounded-md px-3 py-2 hover:border-signal transition"
        >
          <FileDown size={13} />
          Export Laporan (.xlsx)
        </button>
        <button
          onClick={() => exportExcel(rawAbsensi, "absensi-petugas")}
          className="flex items-center gap-1.5 text-xs border border-line rounded-md px-3 py-2 hover:border-signal transition"
        >
          <FileDown size={13} />
          Export Absensi (.xlsx)
        </button>
      </div>
    </div>
  );
}
