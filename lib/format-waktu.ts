/**
 * Semua timestamp di database (Supabase) tersimpan dalam UTC. Kalau
 * di-format tanpa menentukan timeZone, JavaScript ikut zona waktu
 * server/browser (seringnya UTC di hosting), BUKAN WIB — makanya jam yang
 * tampil di dashboard sebelumnya selalu meleset. Fungsi ini SELALU
 * menampilkan dalam Asia/Jakarta (WIB), apa pun timezone server/browsernya.
 */

const TIMEZONE = "Asia/Jakarta";

export function formatTanggalWaktu(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";
}

export function formatWaktu(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("id-ID", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + " WIB";
}

export function formatTanggal(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
