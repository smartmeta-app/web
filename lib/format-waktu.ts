/**
 * Semua timestamp di database (Supabase) tersimpan dalam UTC.
 *
 * Sebelumnya fungsi ini memakai `toLocaleString(..., { timeZone: "Asia/Jakarta" })`.
 * Itu bergantung pada data ICU (Intl) di runtime server. Banyak environment hosting
 * Node.js di-build TANPA data ICU lengkap (small-icu) — akibatnya locale "id-ID"
 * otomatis fallback ke default (biasanya format Amerika "month/day/year"), dan opsi
 * `timeZone: "Asia/Jakarta"` bisa diam-diam diabaikan sehingga jam yang tampil
 * bukan WIB. Ini penyebab tanggal tampil terbalik (bulan-tanggal-tahun) dan pinpoint
 * petugas di peta menampilkan jam yang bukan WIB.
 *
 * Supaya 100% konsisten di server manapun (tanpa bergantung Intl/ICU sama sekali),
 * konversi ke WIB dilakukan manual: WIB = UTC+7, dan Indonesia tidak punya DST,
 * jadi offset-nya selalu tetap.
 */

const BULAN_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const OFFSET_WIB_MS = 7 * 60 * 60 * 1000; // WIB = UTC+7, tanpa DST

function keWIB(iso: string): Date {
  const utcMs = new Date(iso).getTime();
  return new Date(utcMs + OFFSET_WIB_MS);
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Format: "21 Jul 2026, 17.30 WIB" — urutan tanggal-bulan-tahun. */
export function formatTanggalWaktu(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = keWIB(iso);
  const tanggal = `${pad(d.getUTCDate())} ${BULAN_ID[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const waktu = `${pad(d.getUTCHours())}.${pad(d.getUTCMinutes())}`;
  return `${tanggal}, ${waktu} WIB`;
}

/** Format: "17.30.05 WIB" */
export function formatWaktu(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = keWIB(iso);
  return `${pad(d.getUTCHours())}.${pad(d.getUTCMinutes())}.${pad(d.getUTCSeconds())} WIB`;
}

/** Format: "21 Jul 2026" — urutan tanggal-bulan-tahun. */
export function formatTanggal(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = keWIB(iso);
  return `${pad(d.getUTCDate())} ${BULAN_ID[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
