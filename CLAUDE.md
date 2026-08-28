@AGENTS.md

# Hari Baik

Kalender siklus personal Bali, dijual sebagai langganan. Pemiliknya Agus
Yulyastrawan, Seawise Studio. Live di https://haribaik.seawise.id

Next.js App Router, Tailwind v4, Firebase (Auth + Firestore), deploy lewat
Vercel dari GitHub `seawisecc/hari-baik`, cabang `main`.

## Cara kerja di sini

**Bahasa Indonesia.** Balasan, komentar kode, nama variabel domain, commit
message, dan teks antarmuka semuanya bahasa Indonesia. Istilah teknis yang
tidak punya padanan wajar (commit, deploy, token, cache) boleh tetap Inggris.

**Tidak ada em dash.** Jangan pakai em dash (U+2014) atau en dash (U+2013)
di mana pun: kode, teks antarmuka, dokumen, commit message, balasan. Ganti
dengan koma, titik dua, titik, atau tanda kurung. Di judul tab dan judul
halaman pakai `|`. Ini permintaan tegas pemilik: em dash membuat produknya
terlihat tidak profesional. Sebelum menerbitkan dokumen panjang, periksa
dengan grep.

**`npm run verify` sebelum push.** Merangkai lint, dua belas suite tes, build,
dan uji asap route API di build produksi asli. Perintah ini lahir dari
kejadian nyata, lihat "Yang pernah menggigit" di bawah.

**Tes harus terbukti bisa gagal.** Setelah menulis tes baru, rusak sengaja
nilai yang diujinya dan pastikan tesnya merah, lalu kembalikan. Tes yang lolos
kosong lebih berbahaya daripada tidak ada tes.

**Ukur dulu, jangan menebak.** Untuk klaim performa, ambil angkanya dari
produksi yang sudah ter-deploy. Untuk perilaku antarmuka pihak ketiga, buka
halamannya dan periksa DOM-nya.

## Perintah

| Perintah               | Guna                                               |
| ---------------------- | -------------------------------------------------- |
| `npm run verify`       | Gerbang sebelum push: lint, tes, build, uji asap   |
| `npm test`             | Dua belas suite tes                                |
| `npm run smoke`        | Tembak keenam route API di build produksi asli     |
| `npm run deploy-rules` | Terapkan `firestore.rules`                         |
| `npm run set-admin`    | Beri custom claim admin                            |
| `npm run protection`   | Nyalakan atau matikan Vercel Deployment Protection |

## Keputusan yang jangan dibongkar tanpa alasan

**Mesin wariga tidak boleh berubah tanpa acuan.** `src/lib/wariga/` diuji
terhadap 41 tanggal acuan DAN seluruh 210 hari siklus pawukon dari berkas
Excel pemilik (`src/lib/__tests__/fixtures/hari210.json`). Tanggal contoh saja
pernah membuat tiga siklus salah bertahun-tahun tanpa ketahuan.

**Caturwara, astawara, sangawara ditahan, bukan modulo.** Ketiganya tidak
membagi habis 210. Caturwara dan astawara ditahan tiga hari di awal wuku
Dungulan; sangawara ditahan empat hari di awal siklus.

**Sasih memakai nampih sasih.** Tahun Saka dibagi 19: sisa 6, 11, 0 berarti
Nampih Jyestha; sisa 3, 8, 14, 16 berarti Nampih Sadha. Tujuh sisipan per
sembilan belas tahun, sesuai siklus Metonik. Tanpa ini nama sasih bergeser
satu bulan tiap tiga tahun dan Nyepi bisa hilang dari sebuah tahun.

**Warna kategori tidak boleh bergeser.** Biru, hijau, kuning, merah dari
aplikasi lama, dikunci di suite kontras. Untuk teks pakai varian `-teks`, untuk
bidang berlatar penuh pakai `-pekat`.

**Tanggal lahir diisi sekali, lalu terkunci.** Pengguna mengonfirmasinya di
layar kedua onboarding (tanggal panjang plus wetonnya dibacakan kembali), lalu
Firestore Rules menolak setiap perubahan berikutnya dari klien: `fieldLahir()`
hanya boleh disentuh selama `tanggalLahir` masih null. Perbaikan hanya lewat
`/api/admin/profil`, yang menghitung ulang turunan warigannya di server dan
mencatat nilai lama serta barunya ke jejak audit. Alasannya bukan keamanan,
melainkan supaya hasil yang dilihat pengguna kemarin masih bisa dijelaskan
hari ini. Dijaga `src/lib/__tests__/lahir.test.ts`.

**Rules memakai daftar yang diizinkan.** Update dokumen pengguna dari klien
dibatasi `hanyaFieldKlien()`, bukan sekadar daftar field terlarang, jadi field
baru tertutup sampai sengaja dibuka. Bentuk dan panjangnya ikut diperiksa di
rules supaya dokumen profil tidak bisa dipakai sebagai gudang data bebas.

**Setiap aksi admin masuk jejak audit.** `catatJejak()` di `src/lib/audit.ts`
menulis ke koleksi `jejak` yang hanya bisa dibaca admin dan tidak bisa ditulis
klien mana pun. `lastChangedBy` di dokumen pengguna hanya menyimpan keadaan
terakhir; jejak menyimpan riwayatnya. Tesnya menolak route admin yang mengubah
data tanpa menulis jejak.

**Permintaan aktivasi tidak boleh mencabut akses.** Pemohon yang langganannya
masih berjalan tidak ditandai `pending`, dan penolakan mengembalikannya ke
status sebenarnya lewat `statusSetelahDitolak()`. Sebelumnya pelanggan aktif
yang memperpanjang lebih awal langsung kehilangan akses, dan pemegang
langganan seumur hidup kehilangan statusnya untuk selamanya.

**Katalog add-on digabung, bukan ditimpa.** Pengaturan harga tersimpan
sebagai satu dokumen utuh, jadi daftar `addOn` di Firestore dulu menimpa
daftar bawaan seluruhnya. Akibatnya add-on baru yang ditambahkan di kode tidak
muncul di halaman harga maupun di panel admin, dan tidak ada cara apa pun
menjualnya. `gabungAddOn()` di `src/lib/harga.ts` menggabungkan keduanya:
yang sudah diatur admin menang, yang belum ikut dengan nilai bawaannya, dan id
lama yang cuma ada di Firestore tetap dibawa supaya bisa dibersihkan lewat
panel. Penggabungan terjadi sebelum penyaringan kesiapan, bukan sesudah.

**Harga publik selalu lewat `bacaHarga()`.** Selain menyaring add-on yang
belum siap, fungsi itu membuang `diperbaruiOleh` (alamat email admin) karena
hasilnya ikut terkirim ke HTML halaman depan dan ke `GET /api/admin/harga`
yang terbuka. Dokumen `pengaturan/harga` sendiri tidak lagi bisa dibaca klien.

**Add-on butuh dua saklar.** Terdaftar di `src/lib/addon-registry.ts` (fiturnya
ada) DAN ditandai aktif di pengaturan harga (mau dijual). Daftar kesiapan ada
di kode, bukan di pengaturan, karena pengaturan bisa diubah admin: pernah ada
empat add-on dijual padahal tidak satu pun fiturnya ada.

**Fengshui nama: reduksi dikurangi 80, bukan sisa bagi 80.** `reduksi81()` di
`src/lib/content/fengshui.ts` mengurangi 80 berulang sampai masuk rentang 1
sampai 81. Aplikasi yang metodenya dibedah untuk fitur ini memakai `nilai % 80`
dan salah di dua tempat: jumlah 160 memberi 0 lalu menunjuk indeks -1 di luar
tabel (hasilnya `undefined` di layar), dan 161 turun ke 1 padahal seharusnya
berhenti di 81. Keempat kasus itu dikunci di `fengshui.test.ts`.

**Nada 81 angka menentukan peringkat kandidat.** Pembagian baik, bercampur,
kurang bukan hiasan warna: itu yang dipakai `bandingkanNama()` untuk mengurutkan
kandidat, dan yang menentukan kapan saran perbaikan muncul. Mengubah nada satu
angka menggeser seluruh peringkat. Warnanya meminjam token kategori hari yang
sudah dikunci suite kontras, bukan warna baru.

**Favicon .ico dibangun, bukan diwarisi.** Peramban modern memakai
`src/app/icon.svg`, jadi tab terlihat benar walau `favicon.ico` masih berkas
bawaan create-next-app. Yang tidak terlihat: WhatsApp, Slack, dan pembaca RSS
menjemput `/favicon.ico` mentah-mentah untuk pratinjau tautan, jadi setiap
tautan yang dibagikan pelanggan memajang segitiga Vercel. Sekarang
`npm run build-assets` ikut menulis .ico itu dari `src/assets/logo.svg`: 16, 32,
dan 48 sebagai BMP mentah supaya dibaca pengurai setua apa pun, 256 sebagai PNG
supaya berkasnya tidak meledak. Hasilnya biner yang di-commit dan tidak
terhubung ke logonya lewat kode apa pun, jadi `ikon.test.ts` membandingkan warna
di dalam .ico dengan warna yang tertulis di logo.svg.

**Fungsi berjalan di Singapura, bukan Virginia.** `vercel.json` mematok
`regions: ["sin1"]`. Bawaan Vercel untuk project baru adalah `iad1`
(Washington DC), sementara Firestore project ini ada di `asia-southeast2`
(Jakarta). Artinya setiap route API menyeberangi Pasifik dua kali: pengguna di
Bali, fungsi di Virginia, data di Jakarta. Terukur 0,7 sampai 1,9 detik untuk
satu kali baca dokumen harga. Kalau suatu hari Firestore dipindah, region ini
harus ikut pindah ke yang terdekat dengannya, bukan ke yang terdekat dengan
pengguna.

**Firebase diimpor dinamis.** `src/lib/firebase/client.ts` memiliki SDK-nya;
komponen lain hanya boleh mengimpor tipe. Impor statis mengembalikan 640 KB
Firebase ke setiap halaman, termasuk halaman depan yang tidak memakainya.

**Token diambil lewat `ambilToken()`**, yang membaca `currentUser` milik
Firebase, bukan objek User di state React.

**Harga dibaca di server.** `bacaHarga()` di `src/lib/harga-server.ts` adalah
satu pintu yang menyaring add-on yang belum siap. Jangan mengambil harga lewat
fetch dari klien lagi.

**`env(safe-area-inset-*)` mati tanpa `viewport-fit=cover`.** Bilah bawah
memberi dirinya `pb-[env(safe-area-inset-bottom)]`, tapi iOS hanya mengisi
inset itu bila viewport dideklarasikan `viewport-fit=cover`. Tanpa itu nilainya
0 di semua perangkat, dan karena `appleWebApp.capable` menaruh aplikasi ini
dalam mode standalone yang memakai seluruh tinggi layar, bilahnya berhimpit
dengan home indicator. Terukur di WebKit: `padding-bottom` bilah terkomputasi
`0px` sebelum diperbaiki. Keduanya ada di berkas berbeda dan tidak saling
menyebut, jadi `viewport.test.ts` yang menahannya: selama ada yang memakai
`env(safe-area-inset-*)`, `viewportFit: "cover"` wajib ada.

## Yang pernah menggigit

**`next dev` bukan produksi.** Route API lolos semua di dev lalu balas 500 di
produksi karena `firebase-admin` menarik `jose` v6 yang ESM-only. Dipatok ke
`jose@5.10.0` lewat override tingkat atas; override bersarang tidak
berpengaruh. Dari sini lahir `npm run smoke`.

**Spread membuang method.** `setUser({ ...current } as User)` membuang seluruh
method objek User Firebase karena methodnya ada di prototype. Cast `as`
membuat TypeScript diam. Akibatnya setiap pengguna baru gagal membayar setelah
verifikasi email.

**Server lokal basi menyesatkan.** `pkill -f "next start"` sering tidak kena;
server lama tetap memegang port dan `curl` mengenai build lama. Pakai
`lsof -ti:PORT | xargs -r kill -9`, dan periksa `EADDRINUSE` di lognya.

**Cache ISR bertahan antar deploy.** Halaman dengan `revalidate` yang kodenya
tidak berubah akan memakai ulang hasil render lama, termasuk datanya. Route
PUT harga memanggil `revalidatePath`; kalau butuh segar segera di luar itu,
sentuh kode halamannya.

**Grep pada HTML ikut mengenai payload RSC.** Untuk memeriksa apa yang
benar-benar terlihat, buang `<script>` dan tag dulu. Dua kali aku salah lapor
karena ini.

**Prettier merapikan ulang.** Pencocokan string persis sering meleset setelah
Prettier menggabung impor multi-baris. Sisipkan setelah baris impor satu baris
yang pasti, bukan setelah "impor terakhir".

## Yang masih terbuka

- **Bulan sinodis rata-rata.** Kalau bulan baru jatuh dekat batas hari,
  hasilnya bisa meleset sehari. Nyepi 2024 terhitung 10 Maret, sebenarnya 11
  Maret. 2025 sampai 2027 sudah cocok. Perlu waktu bulan baru sebenarnya.
- **Urutan bulan Mala.** Bulan sisipan ditaruh sesudah sasih aslinya. Urutan
  terbalik menghasilkan tanggal identik dan hanya menukar label, jadi tidak
  bisa dipastikan dari tanggal. Perlu konfirmasi orang yang paham.
- **Libur nasional 2028 ke atas** masih manual, menunggu SKB pemerintah.
- **Email verifikasi tidak bisa bertema.** Firebase mengunci isinya untuk
  mencegah spam. Hanya reset kata sandi yang bisa. Lihat `docs/email/README.md`.
- **Pengingat WhatsApp dibuang** dari katalog, butuh layanan pengirim pesan
  dan penjadwal di luar aplikasi ini.

## Struktur singkat

```
src/lib/wariga/        mesin perhitungan, murni fungsi, paling dijaga
src/lib/content/       teks dan tabel yang diport dari aplikasi lama
src/lib/content/fengshui  sistem 81 angka untuk nama usaha, add-on sekali bayar
src/lib/gate.ts        semua keputusan akses, fungsi murni, ada tesnya
src/lib/addon-registry add-on mana yang fiturnya sudah ada
src/lib/harga-server   satu pintu baca harga di server
src/lib/audit.ts       jejak audit, ditulis semua route admin yang mengubah data
src/app/api/           route admin selalu requireAdmin, harga dihitung server
docs/email/            template email Firebase dan batasnya
```
