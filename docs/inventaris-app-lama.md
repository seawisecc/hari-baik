# Inventaris Aplikasi Lama (haribaik.base44.app)

Hasil pembacaan bundle produksi app lama, 26 Agustus 2026. Dipakai sebagai
acuan feature-parity untuk pengembangan ulang. Tidak ada source map — semua
di bawah ini direkonstruksi dari kode terminifikasi.

## Rute

| Rute | Isi |
|---|---|
| `/` | Landing page (publik) |
| `/dashboard` | Panduan hari ini + kategori energi |
| `/calendar` | Grid kalender bulanan dengan penanda kategori |
| `/nama-makna` | Analisis makna nama via aksara Bali — **Pro** |
| `/perjalanan-hidup` | Peta siklus rejeki & kesehatan per periode usia — **Pro** |
| `/kecocokan` | Petemon Lanang Istri — **Pro** |
| `/kepribadian` | Pangarasan & Pancasuda dari weton lahir |
| `/profile` | Profil user, tanggal lahir (read-only bagi user) |
| `/expired` | Halaman langganan habis |
| `/admin` | Kelola user & langganan |
| `/debug-wariga` | Self-test engine |

## Engine Wariga — SUDAH DIPORT ✅

`src/lib/wariga/` sudah memuat seluruh perhitungan app lama dan lolos 41/41
tes acuan (`/debug-wariga`). Cakupan:

Saptawara · Pancawara · Triwara · Caturwara · Sadwara · Astawara · Sangawara ·
Dasawara · Wuku (210 hari) · Lintang (35) · Watek · Pratima · Patra (Mintuna
Rasi) · Sasih · Penanggal/Panglong · Purnama/Tilem · Galungan · Kuningan ·
Kajeng Kliwon · Tumpek · Anggara Kasih · Buda Kliwon · libur nasional.

### Rumus inti

- **Urip hari** = urip Saptawara + urip Pancawara.
- **Kategori siklus personal** = `(urip hari lahir + urip hari berjalan) mod 4`
  → `1=GURU, 2=RATU, 3=LARA, 0=PATI`.
- **Dewasa ayu** = kategori GURU, jatuh di Wraspati/Sukra, dan bukan Kliwon.
- **Urip petemon** = urip Saptawara + Pancawara + Sadwara.
  Petemon pasangan = jumlah urip petemon kedua orang.

### Epoch yang dipakai

| Siklus | Epoch | Index |
|---|---|---|
| Pancawara | 1993-06-30 | 4 (Kliwon) |
| Pawukon | 1993-06-27 | 0 (hari ke-0 Sinta) |
| Caturwara | 2000-01-01 | 3 |
| Sadwara | 1993-06-30 | 3 |
| Astawara | 2000-01-01 | 7 |
| Sangawara | 2000-01-01 | 0 |
| Bulan baru | 2000-01-06 18:14 UTC | — |

## Konten & data — SUDAH DIPORT ✅

Semua di bawah ini sudah dipindahkan ke `src/lib/content/` dan diverifikasi
lewat `npm test`.

1. **i18n ID/EN** — ±70 key. Label kategori: GURU→"Hari Mengalir",
   RATU→"Hari Tenang", LARA→"Hari Mawas", PATI→"Hari Istirahat", masing-masing
   punya `tagline`, `desc`, dan `long`.
2. **Panduan harian** per kategori × 2 bahasa: `supported[]`, `postpone[]`,
   `affirmation`.
3. **Tabel weton** — 35 kombinasi Saptawara×Pancawara, tiap entri berisi
   `energi`, `tema`, `urip`, `pangarasan`, `pancasuda`.
4. **Pangarasan** — 11 tipe (Aras Tuding, Aras Kembang, Lakuning Lintang,
   Rembulan, Srengenge, Banyu, Bumi, Geni, Angin, Pandita Sakti, Toya), tiap
   tipe punya `simbol`, `kepribadian`, `kekuatan[]`, `tantangan[]`, `saran`.
5. **Pancasuda** — 7 tipe (Wisesa Segara, Tunggak Semi, Satria Wibawa,
   Sumur Sinaba, Bumi Kapetak, Satria Wirang, Lebu Ketiup Angin), struktur sama.
6. **Aksara nama** — pemetaan huruf latin → aksara Bali + nilai (Ha=1 … Ya=17,
   Nga=14, Nya=18). Vokal diabaikan; digraf `ng`/`ny` dibaca sebagai satu
   aksara. Total nilai `mod 5` → unsur: 1 Sri, 2 Bhuana, 3 Peta, 4 Lara,
   5 Pati (sisa 0 dibaca 5).
7. **Perjalanan hidup** — peta rejeki & kesehatan per periode usia.

## Model bisnis app lama

- Trial 3 hari otomatis saat onboarding (`trial_ends_at` = now + 3 hari).
- Langganan Rp 150.000 / tahun, approval **manual** oleh admin.
- Admin center via WhatsApp: 081237597759.
- Field user: `nama`, `tanggal_lahir`, `phone_number` (opsional),
  `sapta_wara_lahir`, `panca_wara_lahir`, `sad_wara_lahir`, `wuku_lahir`,
  `urip_lahir`, `urip_petemon_lahir`, `trial_ends_at`, `onboarding_complete`.

## Yang belum

- Kode Firebase (auth, admin API, rules) belum pernah dijalankan terhadap
  project Firebase sungguhan — belum ada kredensial.
- Deploy ke Vercel.

## Catatan

- Tabel libur nasional & hari raya Hindu di app lama hanya terisi 2026–2027.
  Perlu ditambah tiap tahun — lihat `src/lib/wariga/holidays.ts`.
- Ambang penanggal/panglong app lama memakai 14.765 (bukan sinodis/2).
  Sengaja dipertahankan supaya hasilnya identik.
