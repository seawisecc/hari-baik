# Hari Baik

Kalender siklus personal — memadukan Wariga & kalender Bali di atas kalender
Masehi. Pengembangan ulang dari app sebelumnya (base44).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Firebase (Auth + Firestore)
· Vercel.

## Menjalankan

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # engine wariga, konten, aturan langganan
npm run build
```

Aplikasi **bisa langsung dijalankan tanpa Firebase** — tanggal lahir disimpan
di browser dan semua fitur terbuka. Ini untuk pengembangan; begitu kredensial
Firebase dipasang, sumber data otomatis pindah ke profil pengguna dan fitur
Pro dikunci sesuai status langganan.

## Menyiapkan Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com).
2. **Authentication** → aktifkan metode **Email/Password**.
3. **Firestore Database** → buat database (mode production).
4. Salin `.env.example` → `.env.local`, isi nilai klien dari
   *Project settings → General → Your apps*.
5. Unduh kunci server dari *Project settings → Service accounts →
   Generate new private key*, lalu:
   ```bash
   npm run import-sa        # baca JSON-nya, tulis ke .env.local
   npm run check-firebase   # pastikan benar-benar tersambung
   ```
   Setelah itu hapus file JSON-nya; isinya kunci penuh ke project.
6. Terapkan rules dan index:
   ```bash
   npm run deploy-rules      # lewat Firebase Rules API
   npm run deploy-indexes    # butuh peran datastore.indexAdmin
   ```
   Kalau `deploy-indexes` kena 403, buat index lewat tautan yang muncul di
   pesan error Firestore saat query pertama dijalankan; tautan itu sudah
   terisi otomatis.
7. Daftarkan akun pertamamu lewat aplikasi, lalu jadikan admin:
   ```bash
   npm run set-admin -- email@kamu.com
   ```
   Keluar lalu masuk lagi supaya token memuat claim yang baru.

## Rute

Semua rute selain yang publik dijaga terpusat oleh `AuthGate`, dengan urutan
dari syarat paling dasar: masuk, verifikasi email, lengkapi profil, lalu
status langganan. Keputusannya ada di `src/lib/gate.ts` sebagai fungsi murni
yang diuji terpisah, jadi halaman baru otomatis ikut terjaga.

Fitur Pro juga didaftarkan di sana (`RUTE_PRO`). Navigasi mengambil penanda
"PRO" dari daftar yang sama, sehingga tidak mungkin sebuah halaman ditandai
Pro tapi lupa dipasangi penjaganya.

| Rute | Isi | Akses |
|---|---|---|
| `/` | Landing page | publik |
| `/login`, `/register`, `/lupa-sandi` | Autentikasi | publik |
| `/verify-email` | Menunggu verifikasi email | login |
| `/onboarding` | Nama + tanggal lahir, mulai trial 3 hari | login |
| `/hari-ini` | **Halaman utama** — insight hari ini + perkiraan 7 hari | login |
| `/kalender` | Grid bulanan + panduan hari terpilih | login |
| `/kepribadian` | Pangarasan & Pancasuda dari weton lahir | login |
| `/nama-makna` | Makna nama lewat aksara Bali | Pro |
| `/kecocokan` | Petemon Lanang Istri | Pro |
| `/perjalanan-hidup` | Peta rejeki & kesehatan per periode usia | Pro |
| `/profil` | Profil & status langganan | login |
| `/expired` | Layar terkunci + kontak admin | login |
| `/admin` | Kelola pengguna & langganan | admin |
| `/styleguide` | Sistem desain | dev |
| `/debug-wariga` | Self-test engine (41 tes) | dev |

## Struktur

```
src/
├── app/                    # rute App Router
│   ├── (auth)/             # login, register, verify-email
│   └── api/admin/          # route server: users, subscription, claim
├── components/
│   ├── ui/                 # primitif desain
│   ├── calendar/           # grid, detail hari, legenda
│   └── admin/              # tabel pengguna
├── lib/
│   ├── wariga/             # engine kalender Bali — murni fungsi, tanpa DB
│   ├── content/            # data yang diport dari app lama + i18n
│   ├── firebase/           # client, admin SDK, auth provider, penjaga admin
│   ├── theme/              # provider tema
│   ├── subscription.ts     # satu-satunya tempat aturan akses diputuskan
│   └── __tests__/          # dijalankan lewat `npm test`
└── types/
firestore.rules             # security rules
scripts/set-admin.ts        # bootstrap admin pertama
docs/
├── arsitektur.md              # dokumen arsitektur awal
└── inventaris-app-lama.md     # hasil pembacaan app lama
```

## Deploy

Project tersambung ke `seawisecc/hari-baik`, branch `main`. Push ke `main`
memicu deploy produksi otomatis; branch lain menghasilkan preview.

```bash
git push                                       # cara biasa: deploy otomatis
./scripts/push-env.sh                          # kirim 9 variabel Firebase ke Vercel
npm run authorize-domains -- domain-baru.com   # daftarkan ke Firebase Auth
```

Tanpa langkah terakhir, Firebase menolak login dari domain baru dengan
`auth/unauthorized-domain`, dan gejalanya baru terlihat setelah live.
`npm run revoke-domain` mencabut kembali bila salah daftar.

Deployment baru di Vercel menyala dengan proteksi SSO, artinya hanya anggota
tim yang bisa membukanya. Untuk membuka ke publik:

```bash
npm run protection            # lihat status
npm run protection -- off     # buka untuk umum
npm run protection -- on      # tutup lagi
```

### Domain

| Domain | Keterangan |
|---|---|
| `hari-baik-seawise.vercel.app` | aktif |
| `haribaik.seawise.id` | menunggu DNS |

DNS `seawise.id` dikelola di cloudhost.id, jadi record-nya dibuat di sana:

```
CNAME   haribaik   1bf39122ca7a8100.vercel-dns-017.com.
```

Perhatikan: `hari-baik.vercel.app` (tanpa akhiran tim) adalah milik aplikasi
orang lain, bukan project ini.

## Hari raya

Galungan, Kuningan, Saraswati, Pagerwesi, Nyepi, Siwaratri, Purnama, dan Tilem
semuanya dihitung dari pawukon dan sasih di `src/lib/wariga/hariraya.ts`,
beserta turunannya: Penampahan, Manis, Tawur Agung, dan Ngembak Geni. Tidak
ada yang perlu ditambah tiap tahun.

Yang tetap manual hanya libur nasional, karena tanggalnya ditetapkan lewat SKB
pemerintah dan tidak mengikuti aturan yang bisa dihitung.

## Langganan

Harga diatur dari panel admin, bukan ditulis di kode, jadi mengubahnya tidak
perlu deploy. Tiga paket bawaan: 1, 2, dan 3 tahun, dengan diskon 10% dan 20%
per tahun untuk yang lebih panjang. Add-on dijual terpisah.

Alurnya: pengguna memilih paket di `/expired`, menekan "Saya sudah bayar", dan
permintaannya masuk ke tab Permintaan di panel admin. Admin menyetujui, dan
langganan otomatis diperpanjang sesuai lama paket yang diminta.

Harga tidak pernah dikirim dari klien; klien hanya menyebut id paket dan
server yang menghitung totalnya. Kalau harganya ikut dikirim, siapa pun bisa
mengajukan paket tiga tahun seharga seribu rupiah.

## Keamanan

Tiga lapis, dan lapisan klien **bukan** yang menentukan:

1. **Firestore Rules** — pengguna hanya bisa baca/tulis dokumennya sendiri,
   dan tidak bisa menyentuh `role`, `subscriptionStatus`, atau
   `subscriptionExpiresAt`. Tanggal lahir hanya bisa diisi sekali.
2. **API route admin** — memverifikasi custom claim `admin: true` pada ID token
   di server tiap permintaan, dengan `checkRevoked`. Tidak ada yang dipercaya
   dari body request.
3. **Penjaga tampilan** — hanya untuk pengalaman pengguna; menyembunyikan menu
   yang tidak relevan, bukan mengamankan data.

Role admin datang dari custom claim, bukan field Firestore, supaya tidak bisa
diubah dari klien.

## Layout

Satu kerangka (`AppShell`) dengan dua bentuk:

- **Desktop (≥1024px)** — sidebar tetap di kiri berisi navigasi bergrup
  (Harian / Analisis / Akun) plus kontrol tema & bahasa. Kalender memakai
  dua kolom: grid menempel di kiri, detail hari digulir di kanan.
- **Mobile** — top bar tipis + bottom nav lima item. Perkiraan tujuh hari
  digulir mendatar.

Landing dan halaman auth sengaja tidak memakai shell — di sana navigasi
aplikasi belum relevan.

## Identitas

Lambangnya cincin dari empat busur, satu per fase siklus: Mengalir, Tenang,
Mawas, Istirahat. Warnanya sama persis dengan yang dipakai di kalender, jadi
lambangnya sekaligus memperkenalkan kodenya sendiri.

Sumbernya satu berkas, `src/assets/logo.svg`. Favicon, ikon iOS, gambar
pratinjau tautan, dan lambang di dalam aplikasi semuanya berasal dari sana,
jadi tidak mungkin berbeda satu sama lain.

```bash
npm run build-assets    # bangun ulang PNG setelah logo.svg diubah
```

Menghasilkan `src/app/icon.svg`, `src/app/apple-icon.png` (180px), dan
`src/app/opengraph-image.png` (1200x630). PNG-nya ikut di-commit, bukan
dibangkitkan saat request: WhatsApp menyimpan pratinjau dengan agresif dan
kadang gagal pada endpoint dinamis.

## Tipografi

- **Source Serif 4** untuk judul. Dipilih karena punya berat tebal yang
  sebenarnya, jadi `font-bold` tidak dipalsukan browser seperti pada serif
  satu-berat.
- **Inter** untuk teks dan antarmuka. Dirancang untuk layar, sehingga label
  11-13px yang banyak dipakai di sini tetap jernih.

Teks aplikasi tidak memakai em dash. Pemisah yang dipakai: koma untuk klausa
penghubung, titik dua untuk penjelasan, titik untuk kalimat baru, dan titik
tengah (·) untuk memisah label inline.

## Tema

Dua tema aksen di atas dasar netral off-white yang sama:

- **Mint** (default) — hijau mint, sesuai styleguide referensi
- **Senja** — jingga hangat

Warna empat kategori siklus (hijau/biru/kuning/merah) **sama di kedua tema** —
diambil dari aplikasi lama, karena identitas kategori tidak boleh ikut berubah
saat pengguna mengganti tema.

Semua warna adalah token CSS di `src/app/globals.css`; komponen tidak pernah
memakai hex langsung, jadi menambah tema ketiga cukup satu blok
`:root[data-theme=...]`.

## Status

- [x] Engine Wariga lengkap — 41/41 tes lolos
- [x] Sistem desain + 2 tema
- [x] Konten diport dari app lama (i18n, panduan, weton, watak, nama, petemon, nasib)
- [x] Kalender + panduan harian
- [x] Fitur Pro: nama, kecocokan, perjalanan hidup, kepribadian
- [x] Firebase Auth + Firestore + security rules
- [x] Admin: perpanjang N tahun, tetapkan tanggal habis, atau seumur hidup
- [x] Layout desktop & mobile terpisah, beranda = insight hari ini
- [x] Diuji terhadap project Firebase sungguhan (`hari-baik-7e56c`)
- [x] Deploy ke Vercel: https://hari-baik-seawise.vercel.app
- [x] Gerbang akses terpusat: trial habis mengunci total ke `/expired`
- [x] Verifikasi email diwajibkan
- [x] Lupa kata sandi
- [x] Poles halaman auth, onboarding, profil, admin
- [x] Antrean aktivasi: pengguna ajukan, admin setujui
- [x] Hari raya Hindu dihitung, bukan ditulis manual
- [ ] Libur nasional baru terisi 2026-2027 (`src/lib/wariga/holidays.ts`); ini
      memang harus ditambah tiap tahun karena mengikuti SKB pemerintah
