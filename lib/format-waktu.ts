/**
 * Semua timestamp di database (Supabase) tersimpan dalam UTC.
 *
 * Sebelumnya fungsi ini memakai `toLocaleString(..., { timeZone: "Asia/Jakarta" })`.
 * Itu bergantung pada data ICU (Intl) di runtime server. Banyak environment hosting
 * Node.js di-build TANPA data ICU lengkap (small-icu) — akibatnya locale "id-ID"
 * otomatis fallback ke default (biasanya format Amerika "month/day/year"), dan opsi
 * `timeZone: "Asia/Jakarta"` bisa diam-diam diabaikan.
 *
 * Supaya 100% konsisten di server manapun, konversi ke WIB dilakukan manual:
 * WIB = UTC+7, dan Indonesia tidak punya DST, jadi offset-nya selalu tetap.
 *
 * PENTING — soal string tanpa penanda zona waktu:
 * Kalau string ISO dari Supabase TIDAK berakhiran "Z" atau offset (+hh:mm),
 * `new Date(iso)` bawaan JS akan membacanya sebagai waktu LOKAL perangkat yang
 * menjalankan kode (browser petugas/admin) — bukan UTC. Karena kebanyakan
 * pengguna aplikasi ini perangkatnya sudah di-set WIB, hasil parse itu sudah
 * "kebetulan" WIB duluan, sehingga tambahan +7 jam di bawah malah membatalkan
 * diri sendiri: yang tampil ke layar jadi angka UTC mentah dari database,
 * hanya dilabeli "WIB" tanpa benar-benar dikonversi. Ini penyebab jam
 * pinpoint petugas di peta tidak mengikuti WIB.
 *
 * Perbaikannya: paksa string tanpa penanda zona untuk selalu dibaca sebagai
 * UTC (tambahkan "Z" kalau belum ada), supaya hasilnya deterministik di
 * perangkat manapun, apapun timezone lokalnya.
 */

const BULAN_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const OFFSET_WIB_MS = 7 * 60 * 60 * 1000; // WIB = UTC+7, tanpa DST

// Cek apakah string ISO sudah punya penanda zona waktu eksplisit ("Z" di akhir,
// atau offset "+hh:mm"/"-hh:mm"). Kalau tidak, JS akan salah membacanya sebagai
// waktu lokal browser, bukan UTC.
const PUNYA_ZONA_WAKTU = /Z$|[+-]\d{2}:?\d{2}$/;

function keWIB(iso: string): Date {
  const isoUtc = PUNYA_ZONA_WAKTU.test(iso) ? iso : `${iso}Z`;
  const utcMs = new Date(isoUtc).getTime();
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
