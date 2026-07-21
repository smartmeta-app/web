"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Radar, Users, MessageSquareWarning, Clock } from "lucide-react";

const PetaPetugas = dynamic(() => import("@/components/PetaPetugas"), { ssr: false });

export default function PetaPage() {
  const supabase = createClient();
  const [aktif, setAktif] = useState(0);
  const [totalPetugas, setTotalPetugas] = useState(0);
  const [laporanBaru, setLaporanBaru] = useState(0);

  useEffect(() => {
    async function loadStats() {
      const { count: total } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "petugas");
      setTotalPetugas(total ?? 0);

      const { count: liveCount } = await supabase
        .from("lokasi_petugas")
        .select("*", { count: "exact", head: true });
      setAktif(liveCount ?? 0);

      const { count: laporan } = await supabase
        .from("laporan")
        .select("*", { count: "exact", head: true })
        .eq("status", "baru");
      setLaporanBaru(laporan ?? 0);
    }
    loadStats();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Radar size={14} className="text-signal" />
          <p className="font-data text-xs text-muted uppercase tracking-widest">
            01 · Pemantauan
          </p>
        </div>
        <h2 className="font-display text-2xl font-semibold">Peta Realtime Petugas</h2>
        <p className="text-muted text-sm mt-1">
          Posisi petugas Melati & Bestari diperbarui otomatis via Supabase Realtime.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatChip icon={Radar} label="Sedang Live" value={aktif} accent="text-signal" />
        <StatChip icon={Users} label="Total Petugas" value={totalPetugas} accent="text-melati" />
        <StatChip icon={MessageSquareWarning} label="Laporan Baru" value={laporanBaru} accent="text-danger" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-melati inline-block" /> Melati
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-bestari inline-block" /> Bestari
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={12} /> Update otomatis setiap ada perubahan
        </span>
      </div>

      <div className="flex-1 min-h-[400px] sm:min-h-[520px] rounded-xl overflow-hidden border border-line">
        <PetaPetugas />
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-panel border border-line rounded-xl p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg bg-base flex items-center justify-center ${accent}`}>
        <Icon size={17} />
      </div>
      <div>
        <p className="font-data text-xl font-semibold leading-none">{value}</p>
        <p className="text-xs text-muted mt-1">{label}</p>
      </div>
    </div>
  );
}
