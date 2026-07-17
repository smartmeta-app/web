# SMART META — Dashboard Admin

Dashboard admin Next.js 14 untuk pemantauan petugas kebersihan Melati & Bestari,
Kelurahan Teladan Barat. Terhubung langsung ke Supabase.

## 1. Setup

```bash
npm install
cp .env.local.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## 2. Tambahan kolom di tabel `zonas`

Halaman "Zona & Radius Absensi" butuh kolom yang belum ada di schema awal.
Jalankan di Supabase SQL editor:

```sql
alter table zonas add column latitude double precision;
alter table zonas add column longitude double precision;
alter table zonas add column radius_meter integer default 150;
```

## 3. Membuat akun admin pertama

Karena registrasi akun admin sengaja tidak dibuka lewat form publik (demi keamanan),
buat manual:

1. Buat user baru di Supabase Auth (dashboard Supabase → Authentication → Add user).
2. Insert baris di tabel `profiles` dengan `id` = id user tersebut dan `role = 'admin'`.

## 4. Menambah akun petugas / warga

Paling aman lewat Supabase Auth (invite by email) lalu insert baris `profiles`
terkait. Bisa juga dibuatkan halaman "Tambah Akun" khusus di iterasi berikutnya
(pakai Supabase Admin API dari server action, karena butuh service role key
yang tidak boleh ada di client).

## 5. Struktur halaman

| Rute            | Fitur                                          |
|------------------|-------------------------------------------------|
| `/`              | Peta realtime posisi petugas                    |
| `/laporan`       | Kelola laporan warga, assign petugas, ubah status |
| `/bank-sampah`   | Kelola jenis sampah & verifikasi transaksi poin |
| `/zona`          | Kelola zona tugas & radius validasi absensi     |
| `/akun`          | Kelola akun petugas & warga, atur jam kerja     |
| `/statistik`     | Grafik kinerja & export Excel                   |
| `/notifikasi`    | Broadcast notifikasi ke role/zona tertentu      |

## 6. Catatan push notification

Insert ke tabel `notifikasi` di halaman Broadcast belum langsung mengirim push.
Hubungkan dengan Supabase Edge Function yang trigger saat ada row baru di
`notifikasi`, lalu panggil OneSignal REST API dari situ (butuh OneSignal REST
API key, jangan taruh di client).

## 7. Desain

Identitas visual: latar teal gelap ala pusat kendali (`#0F1E1B`), aksen amber
sinyal-hidup (`#E8A33D`) untuk status live/perhatian, hijau sage untuk Melati,
biru berdebu untuk Bestari. Font `Space Grotesk` (judul), `Inter` (isi),
`JetBrains Mono` (data/koordinat/waktu) — mengesankan panel operasi lapangan,
bukan dashboard SaaS generik.
