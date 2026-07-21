"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase-browser";
import { formatWaktu } from "@/lib/format-waktu";
import { Play, Pause, History, Route } from "lucide-react";

const PetaPlayback = dynamic(() => import("@/components/PetaPlayback"), { ssr: false });

type Petugas = { id: string; nama: string; jenis_petugas: string | null };
type TitikRute = { latitude: number; longitude: number; recorded_at: string };

function todayWIB(): string {
  // Tanggal hari ini dalam WIB (bukan ikut timezone browser/server) supaya
  // default date picker selalu benar walau server hosting-nya UTC.
  const now = new Date();
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now);
}

export default function PlaybackPage() {
  const supabase = createClient();
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [selectedPetugas, setSelectedPetugas] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayWIB());
  const [titik, setTitik] = useState<TitikRute[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function loadPetugas() {
      const { data } = await supabase
        .from("profiles")
        .select("id, nama, jenis_petugas")
        .eq("role", "petugas")
        .order("nama");
      if (data) {
        setPetugasList(data as Petugas[]);
        if (data.length > 0) setSelectedPetugas(data[0].id);
      }
    }
    loadPetugas();
  }, []);

  async function muatRute() {
    if (!selectedPetugas) return;
    setLoading(true);
    setIsPlaying(false);
    setCurrentIndex(0);

    // Konversi tanggal WIB yang dipilih jadi rentang UTC yang tepat, karena
    // data di database tersimpan UTC sementara yang dipilih user adalah
    // tanggal WIB.
    const start = new Date(`${selectedDate}T00:00:00+07:00`).toISOString();
    const end = new Date(`${selectedDate}T23:59:59+07:00`).toISOString();

    const { data } = await supabase
      .from("riwayat_lokasi_petugas")
      .select("latitude, longitude, recorded_at")
      .eq("petugas_id", selectedPetugas)
      .gte("recorded_at", start)
      .lte("recorded_at", end)
      .order("recorded_at", { ascending: true });

    setTitik((data as TitikRute[]) ?? []);
    setLoading(false);
  }

  function togglePlay() {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= titik.length - 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <History size={14} className="text-muted" />
        <p className="font-data text-xs text-muted uppercase tracking-widest">
          01B · Playback
        </p>
      </div>
      <h2 className="font-display text-2xl font-semibold mb-1">Playback Rute Petugas</h2>
      <p className="text-muted text-sm mb-6">
        Putar ulang perjalanan petugas pada tanggal tertentu untuk verifikasi rute kerja.
      </p>

      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={selectedPetugas}
          onChange={(e) => setSelectedPetugas(e.target.value)}
          className="bg-panel border border-line rounded-md px-3 py-2 text-sm min-w-[220px]"
        >
          {petugasList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama} ({p.jenis_petugas ?? "-"})
            </option>
          ))}
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-panel border border-line rounded-md px-3 py-2 text-sm"
        />
        <button
          onClick={muatRute}
          disabled={loading}
          className="flex items-center gap-2 bg-signal text-base font-medium rounded-md px-4 py-2 text-sm disabled:opacity-50"
        >
          <Route size={15} />
          {loading ? "Memuat..." : "Muat Rute"}
        </button>
      </div>

      {titik.length === 0 ? (
        <div className="rounded-xl border border-line bg-panel p-10 text-center text-muted text-sm">
          Belum ada rute dimuat. Pilih petugas & tanggal, lalu klik "Muat Rute".
          <br />
          <span className="text-xs">
            (Kalau tetap kosong, kemungkinan petugas tidak aktif tracking pada tanggal itu.)
          </span>
        </div>
      ) : (
        <>
          <div className="h-[420px] rounded-xl overflow-hidden border border-line mb-4">
            <PetaPlayback titik={titik} currentIndex={currentIndex} />
          </div>

          <div className="bg-panel border border-line rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-signal text-base shrink-0"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={titik.length - 1}
                value={currentIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  setCurrentIndex(Number(e.target.value));
                }}
                className="flex-1 accent-signal"
              />
              <span className="font-data text-xs text-muted w-16 text-right">
                {currentIndex + 1}/{titik.length}
              </span>
            </div>
            <p className="text-xs text-muted font-data">
              Waktu titik ini: {formatWaktu(titik[currentIndex]?.recorded_at)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
