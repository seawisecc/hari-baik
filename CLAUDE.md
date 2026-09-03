@AGENTS.md

# Hari Baik

Kalender siklus personal, dijual sebagai langganan. Pemiliknya Agus
Yulyastrawan. Dikembangkan Seawise Studio, dioperasikan Mayaloka Digital.
Live di https://haribaik.seawise.id

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

**`npm run verify` sebelum push.** Merangkai lint, lima belas suite tes, build,
dan uji asap route API di build produksi asli. Perintah ini lahir dari
kejadian nyata, lihat "Yang pernah menggigit" di bawah.

**Tes harus terbukti bisa gagal.** Setelah menulis tes baru, rusak sengaja
nilai yang diujinya dan pastikan tesnya merah, lalu kembalikan. Tes yang lolos
kosong lebih berbahaya daripada tidak ada tes.

**Ukur dulu, jangan menebak.** Untuk klaim performa, ambil angkanya dari
produksi yang sudah ter-deploy. Untuk perilaku antarmuka pihak ketiga, buka
halamannya dan periksa DOM-nya.

## Perintah

| Perintah               | Guna                                                 |
| ---------------------- | ---------------------------------------------------- |
| `npm run verify`       | Gerbang sebelum push: lint, tes, build, uji asap     |
| `npm test`             | Lima belas suite tes                                 |
| `npm run smoke`        | Tembak ketiga belas route API di build produksi asli |
| `npm run akun-uji`     | Buat atau kunci ulang akun uji pembayaran            |
| `npm run deploy-rules` | Terapkan `firestore.rules`                           |
| `npm run set-admin`    | Beri custom claim admin                              |
| `npm run protection`   | Nyalakan atau matikan Vercel Deployment Protection   |

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

**Pencarian pengguna dikerjakan di server.** Firestore tidak bisa mencari
substring, jadi dokumennya dibaca lalu dicocokkan `cariPengguna()` di memori.
Godaannya menyaring di browser saja, karena datanya sudah ada di sana. Itu
salah: yang ada di browser cuma sehalaman, dan pencarian yang hanya melihat
sehalaman akan menjawab "tidak ada" untuk pelanggan yang sebenarnya ada.
Jawaban salah lebih berbahaya daripada tidak ada pencarian. Batas pindainya
1000 dokumen dan kalau kena, jawabannya mengatakan itu. Nomor HP diseragamkan
lebih dulu, jadi 0812 dan 62812 saling menemukan.

**Nilai CSV yang diawali `=`, `+`, `-`, atau `@` diberi kutip tunggal.** Nama
diisi sendiri oleh pengguna, dan Excel maupun Sheets menjalankan sel yang
diawali tanda itu sebagai rumus. Yang membuka berkas ekspor adalah pemilik
aplikasi ini sendiri. Nomor HP `+62...` ikut kena dan itu memang benar: tanpa
kutip tunggal Excel membacanya sebagai rumus yang gagal. Berkasnya ber-BOM
UTF-8, kalau tidak Excel di Windows mengubah nama berhuruf non-ASCII jadi
kotak-kotak. Dikunci di `admin.test.ts`.

**Ekspor menulis jejak audit walau tidak mengubah apa pun.** Pemeriksa di
`lahir.test.ts` hanya menangkap POST, PUT, PATCH, dan DELETE, jadi route
ekspor lolos darinya. Tetap dicatat karena sekali ditekan, seluruh daftar
pelanggan berikut nomor HP dan tanggal lahirnya keluar dari sistem, dan itu
justru yang paling ingin bisa ditelusuri kalau suatu hari ada yang bocor.

**Hapus akun berarti Auth dan dokumen sekaligus, Auth dulu.** Menghapus
dokumen Firestore saja tidak menghapus siapa pun: akun Auth-nya tetap hidup
dan begitu orang itu masuk lagi, `/api/auth/bootstrap` membuatkan profil baru
lengkap dengan trial 3 hari yang segar. Tombol hapus setengah begitu bukan
tidak berguna, ia jadi tombol reset trial gratis. Urutannya Auth dulu supaya
kegagalan meninggalkan keadaan yang utuh, bukan akun tanpa profil yang justru
memicu trial baru itu. Salinan penuh dokumennya masuk jejak audit sebelum
dihapus, jadi salah pencet masih bisa disusun ulang tanpa perlu gudang arsip
tersendiri. Dokumen aktivasi miliknya tidak ikut dihapus: itu catatan uang.

**Siapa yang tidak boleh dihapus diputuskan `alasanTolak()`.** Satu fungsi
murni yang dipakai tampilan dan server sekaligus, jadi tombol yang menyala di
layar tidak bisa ditolak API. Yang ditolak: admin, yang permintaan aktivasinya
masih menunggu, dan siapa pun yang aksesnya masih hidup. "Masih hidup"
ditanyakan ke `evaluateAccess()`, bukan dibaca dari field status, supaya
langganan yang tanggalnya sudah lewat tapi statusnya belum sempat diperbarui
tetap terbaca apa adanya. Trial yang belum habis termasuk yang ditolak: itu
calon pelanggan yang mungkin baru mendaftar setengah jam lalu.

**Masuk dengan Google memakai popup, kecuali di aplikasi terpasang.** Di mode
standalone iOS, jendela popup dibuka Safari sebagai konteks terpisah yang tidak
bisa mengembalikan hasilnya, jadi `signInWithPopup` menggantung tanpa pesan apa
pun. Karena `appleWebApp.capable` menaruh aplikasi ini dalam mode standalone,
jalur redirect bukan kasus langka di sini melainkan jalur normal bagi setiap
pengguna yang memasang aplikasinya. Konsekuensinya: halaman dibuang dan dimuat
ulang, jadi `bootstrapProfile()` yang biasanya dipanggil di `loginWithGoogle()`
harus dipanggil ulang lewat `getRedirectResult()` saat kembali. Tanpa itu
pengguna kembali dalam keadaan sudah masuk tapi tanpa dokumen profil, dan
`tentukanAlihan()` tidak mengirimnya ke mana pun karena `onboardingComplete`
masih null: layarnya diam dan tidak ada yang tampak salah. Dijaga
`auth.test.ts`.

**Email/password tidak boleh ikut hilang saat Google dinyalakan.** Keduanya
berdampingan, dan yang tidak punya akun Google harus tetap bisa daftar dan
masuk seperti sebelumnya. Tombol Google ada di halaman masuk DAN halaman
daftar: menaruhnya hanya di halaman daftar membuat orang yang pertama kali
masuk lewat Google tidak punya jalan masuk sama sekali, karena dia tidak punya
kata sandi untuk diketik di halaman satunya.

**Template email tidak bisa diubah, lewat Console maupun API.** Console
mengunci kolom Message pada email verifikasi. Identity Toolkit Admin API juga
tidak bisa: `PATCH` pada subjek dijawab `EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`,
dan `PATCH` pada isinya dijawab **200 tapi tidak mengubah apa pun**. Yang
kedua itu jebakan, karena berhenti di kode balasannya akan membuat orang yakin
templatenya sudah terpasang. Diuji 28 Agustus 2026 dengan service account
project ini, dan seluruh konfigurasi sebelum dan sesudahnya dibandingkan baris
per baris untuk memastikan tidak ada yang tergeser. Lihat `docs/email/README.md`.

**Action URL boleh dipindah setelah `/aksi` hidup, bukan sebelumnya.**
Firebase Hosting melayani `/__/auth/action` sendiri; Vercel tidak, dan aplikasi
ini di Vercel. Memindahkan `callbackUri` tanpa halaman penangannya membuat
setiap tautan verifikasi dan reset kata sandi berujung 404, termasuk yang sudah
terkirim ke orang. Halamannya sekarang ada di `src/app/aksi/page.tsx`, menangani
`verifyEmail`, `resetPassword`, dan `recoverEmail`, dan sudah diuji dengan
oobCode asli dari `generateEmailVerificationLink()`, bukan hanya dengan tes.
Setelah `applyActionCode`, `currentUser` harus di-reload dan tokennya ditarik
ulang: `emailVerified` ikut token, jadi tanpa itu orangnya menekan tombol lalu
dikembalikan ke layar verifikasi yang sama.

**Rute publik wajib ada di dua daftar.** `RUTE_PUBLIK` di `gate.ts` menentukan
siapa boleh membuka, `RUTE_TELANJANG` di `nav.ts` menentukan apakah bilah
samping ikut tampil. Keduanya di berkas berbeda dan tidak saling menyebut.
Halaman `/aksi` sempat tampil dengan menu lengkap berisi tautan yang semuanya
menolak pengunjungnya, karena terdaftar di yang pertama saja. `gate.test.ts`
sekarang menahannya.

**Status verifikasi email tidak disalin ke Firestore.** Ia milik Firebase Auth,
dan panel admin menempelkannya saat membaca daftar lewat `getUsers()`, bukan
menyimpannya di dokumen. Salinan kedua dari nilai yang bisa berubah di tempat
lain pasti akan basi, lalu suatu hari dipercaya. Route `/api/admin/verifikasi`
mengubahnya di Auth lalu mencabut refresh token: token yang sedang dipegang
masih membawa `emailVerified` yang lama, dan `tentukanAlihan()` membacanya dari
token itu, jadi tanpa pencabutan orangnya tetap tertahan di `/verify-email`
dan admin mengira tombolnya tidak bekerja.

**Akun yang belum verifikasi boleh dihapus walau trialnya masih berjalan.**
`evaluateAccess()` bilang aksesnya hidup, tapi `tentukanAlihan()` menahannya di
`/verify-email`, jadi di layar dia tidak bisa membuka apa pun. Akun seperti
itulah yang paling banyak menumpuk (mendaftar lalu berhenti), dan penjaga
trial justru membuatnya satu-satunya yang tidak bisa dibersihkan. Pengecualian
ini hanya melewati penjaga trial, bukan penjaga admin maupun yang menunggu.
Status tidak diketahui (null, Auth gagal dibaca) tetap ditolak: menebak ke arah
menghapus adalah arah tebakan yang salah.

**Tabel admin punya lima kolom, bukan enam.** Masa berlaku digabung ke dalam
kolom status. Dengan enam kolom, tabelnya lebih lebar daripada ruang di sebelah
bilah samping pada laptop biasa: kolom aksi terpotong di tepi kanan, dan kolom
tanggal yang terhimpit membungkus jadi dua baris sehingga tiap baris jadi
setinggi dua baris. Diukur di jendela 950 piksel, bukan ditebak. Untuk baris
trial yang dibaca `trialEndsAt`, bukan `subscriptionExpiresAt` yang memang
selalu kosong bagi mereka.

**Kegagalan popup Google jangan dijatuhkan ke redirect begitu saja.** Hanya
`auth/popup-blocked` dan `auth/operation-not-supported-in-this-environment`
yang benar-benar tertolong. Kegagalan tersering di Safari,
`auth/missing-initial-state`, berasal dari pemisahan penyimpanan lintas situs
dan menimpa redirect persis sama seperti popup: mencobanya ulang cuma mengubah
kegagalan yang berkata jadi kegagalan yang senyap. Pernah ditulis terbalik
selama satu commit. Dan karena `getRedirectResult()` tidak melempar apa pun
ketika kembali tanpa hasil, penanda di `sessionStorage` domain sendiri yang
membuat kepulangan kosong tetap bisa dilaporkan.

**`auth/internal-error` adalah pembungkus, bukan sebab.** Sebabnya diselipkan
Firebase ke `customData.message` sebagai untaian JSON, dan `detailAuth()` yang
membongkarnya. Tanpa itu semua kegagalan yang berbeda-beda terlihat sama persis
di layar. Errornya juga SELALU dicatat ke console, bukan hanya ketika kodenya
belum dikenal: kode yang sudah punya kalimatnya sendiri justru lolos dari
pencatatan, dan itu persis yang menutupi sebab kegagalan masuk Google selama
satu putaran penuh.

**Halaman ini menolak ditaruh di dalam iframe.** CSP mengirim
`frame-ancestors 'none'` plus `X-Frame-Options: DENY`, jadi alat pratinjau
ponsel yang bekerja dengan menyematkan halaman menampilkan "refused to
connect". Itu bukan kerusakan, itu penjaga clickjacking yang bekerja. Di
ponsel sungguhan tidak ada iframe, jadi tidak ada masalah. Jangan dilonggarkan
demi alat pratinjau; pakai Responsive Design Mode peramban, yang mengubah
ukuran viewport tanpa menyematkan apa pun.

**Kode error yang belum dikenali ikut ditampilkan.** `pesanAuth()` dulu
mengubah setiap kode asing jadi "Terjadi kesalahan. Coba lagi." Itu terbaca
sopan tapi menelan satu-satunya keterangan yang berguna: yang melihatnya tidak
bisa berbuat apa-apa dan yang dilapori tidak bisa mencari apa-apa. Satu putaran
penuh terbuang hanya untuk mengetahui kode yang sudah ada di tangan
penggunanya sejak awal.

**CSP harus mengizinkan `apis.google.com` di `script-src`.** `@firebase/auth`
memuat `https://apis.google.com/js/api.js` saat berjalan untuk membangun
jembatan komunikasi dengan jendela popup Google. Host itu TIDAK tercakup oleh
`*.googleapis.com`: berbeda. Tanpa izin ini, masuk dengan Google gagal dengan
`auth/internal-error` tanpa keterangan apa pun dan tanpa satu pun permintaan ke
identitytoolkit, karena skripnya ditolak sebelum ada server yang sempat
menjawab. Sempat dikira masalah Safari selama beberapa putaran; sebenarnya
berlaku di semua peramban. Email dan kata sandi tetap jalan sepanjang itu,
karena jalur itu cuma fetch ke `identitytoolkit.googleapis.com` yang memang ada
di `connect-src`, dan itulah yang membuatnya lama tidak ketahuan. URL-nya
dirangkai saat berjalan, jadi tidak muncul sebagai untaian utuh di bundel dan
tidak bisa ditemukan dengan membaca hasil build. `auth.test.ts` membaca paket
SDK-nya langsung: host mana pun yang dipakainya memuat skrip wajib ada di
`script-src`.

**`authDomain` masih `hari-baik-7e56c.firebaseapp.com`.** Artinya penangan
OAuth berjalan di domain pihak ketiga, dan itulah sumber kerapuhan masuk dengan
Google di Safari. Perbaikannya membuatnya satu domain dengan aplikasi: proxy
`/__/auth/*` ke firebaseapp.com, ganti env `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
DAN tambahkan `https://haribaik.seawise.id/__/auth/handler` ke Authorized
redirect URIs di Google Cloud Console. Ketiganya harus sekaligus: dua yang
pertama tanpa yang ketiga membuat Google menolak dengan redirect_uri_mismatch,
dan masuk dengan Google mati total, bukan cuma rapuh.

**Email konfirmasi dikirim sendiri, bukan lewat Firebase.** Alasannya bukan
gaya: Firebase mengirimnya dari `noreply@hari-baik-7e56c.firebaseapp.com`,
subdomain buatan mesin yang dipakai bersama ribuan project lain. SPF dan DKIM-nya
sah (diukur lewat dig), jadi yang menjatuhkannya ke spam adalah reputasi domain
pengirim, dan itu tidak bisa diperbaiki dari sisi kita. Isinya juga terkunci:
Console dan Identity Toolkit API sama-sama menolak dengan
`EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`.

**Tautan dari `generateEmailVerificationLink()` dirakit ulang ke `/aksi`.**
Tautannya selalu menunjuk ke `callbackUri` project, yang juga terkunci. Tapi
yang bernilai di dalamnya cuma `oobCode`, dan itu ikut terbawa di query, jadi
`tautanAksi()` mengambilnya lalu menyusun URL baru ke domain sendiri. `apiKey`
sengaja tidak ikut: halaman `/aksi` memakai config miliknya sendiri, dan apa
pun yang tidak dibutuhkan lebih baik tidak berkeliaran di kotak masuk orang.

**Jalur cadangan ke pengirim Firebase tidak boleh dibuang.** Kalau
`RESEND_API_KEY` belum ada atau pengirimannya gagal, `kirimVerifikasi()`
kembali memakai `sendEmailVerification()`. Email dari alamat lama yang sering
masuk spam masih jauh lebih baik daripada tidak ada email sama sekali, yang
berarti akunnya mati sebelum sempat dipakai.

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

**Teks publik menyebut sistemnya, bukan sukunya.** Halaman depan, metadata,
manifest, dan label kalender dulu berbunyi "kalender Bali", "Wariga Bali",
"Primbon Jawa", "hari raya Hindu", dan "aksara Bali". Hitungannya sendiri
memang berasal dari sana dan itu tidak disembunyikan, tapi judul yang menyebut
satu suku membuat pembaca dari daerah lain menyimpulkan aplikasinya bukan
untuk mereka sebelum sempat melihat isinya, padahal angkanya sama untuk siapa
pun. Sekarang: "kalender wariga", "Wariga", "Primbon", "hari raya", "nilai
aksara", dan purnama/tilem disebut "bulan purnama" dan "bulan baru". Kutipan
testimoni TIDAK ikut diubah: itu kata orangnya, bukan teks kita.

**Pembayaran punya dua jalur, dan keduanya harus tetap hidup.** Midtrans Snap
untuk yang mau langsung masuk, transfer manual untuk yang sudah terbiasa
mengabari admin. Kalau `MIDTRANS_SERVER_KEY` dan
`NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` kosong, tombol gateway tidak dirender dan
route-nya menjawab 503; jalur manual berjalan persis seperti sebelumnya.
Sandbox atau produksi dibaca dari awalan kunci (`SB-`), bukan dari saklar
tersendiri yang bisa berbeda dari kuncinya. Kunci server dan kunci klien dari
lingkungan berbeda ditolak di `konfigurasiMidtrans()`, karena gejalanya di
layar cuma "transaksi tidak ditemukan" yang tidak menunjuk ke mana pun.

**Pesanan gateway tinggal di koleksi `pembayaran`, bukan `aktivasi`.** Koleksi
`aktivasi` adalah antrean kerja admin: yang berstatus "menunggu" di sana
menunggu orang memeriksanya. Pesanan Midtrans yang dibuat lalu ditinggalkan
bukan itu, dan kalau ikut masuk akan menumpuk sebagai pekerjaan palsu yang
tidak pernah bisa diselesaikan. Begitu lunas, barulah dokumen `aktivasi`
ditulis, sudah berstatus disetujui dengan `diputuskanOleh: "midtrans"`, supaya
catatan uang semua pelanggan tetap berkumpul di satu koleksi.

**Gateway produksi sudah terbukti utuh, sekali, pada 31 Agustus 2026.** Satu
pembayaran QRIS sungguhan (Rp 1.000, paket 1 Tahun) berstatus `settlement` dan
langganannya menyala 66 detik kemudian. Artinya rantai lengkapnya jalan:
tagihan dibuat, uang masuk, status terbaca, langganan diperpanjang, jejak
audit tertulis. Yang BELUM pernah diuji sungguhan: pengembalian dana, kartu
kredit dengan 3DS, dan pesanan yang isinya add-on saja.

**Notifikasi sandbox yang menembak endpoint produksi ditolak 401, dan itu
benar.** URL notifikasi didaftarkan di dua dashboard yang terpisah, dan
mengisikan URL produksi ke dashboard sandbox membuat Midtrans mengirim
notifikasi bertanda tangan kunci sandbox ke endpoint yang memegang kunci
produksi. Tanda tangannya tidak cocok, endpoint menolak, Midtrans mengulang
lalu mengirim email "having difficulty sending notification". Itu penjaga yang
bekerja, bukan kerusakan: menerimanya berarti siapa pun yang punya akun
sandbox Midtrans bisa mengaktifkan langganan di situs live secara gratis. Cara
memastikan asalnya tanpa menebak: hitung sha512 dari `order_id + status_code +
gross_amount + kunci` untuk kedua kunci, lalu bandingkan dengan `signature_key`
di email itu.

**Pembayaran punya dua bentuk pesanan, dibedakan `paketTahun`.** Dengan paket
berarti berlangganan atau memperpanjang. Tanpa paket (`paketId` null,
`paketTahun` 0) berarti pelanggan menambah add-on di tengah masa langganan.
Nol tahun tidak boleh lolos ke `extendYears()`: hasilnya tanggal habis ditulis
ulang DAN status disetel "active", jadi pemegang langganan seumur hidup yang
membeli satu add-on turun jadi pelanggan tahunan. `hanyaAddOn` di
`pembayaran-server.ts` yang menahannya, dan ia harus tetap diturunkan dari
`paketTahun`, bukan ditulis sebagai nilai tetap.

**Add-on hanya dijual ke langganan berbayar yang hidup.** `alasanTolakAddOn()`
memeriksa `evaluateAccess().isPro`, bukan `canView`. Yang masa cobanya masih
berjalan punya akses, tapi add-on tidak akan bisa dibuka begitu trialnya habis
beberapa hari lagi, dan yang membelinya tidak akan menyangka itu yang dia
beli. Yang sudah dimiliki ikut disaring `addOnBelumDimiliki()` supaya menekan
tombol dua kali tidak jadi membayar dua kali untuk barang yang sama. Aturannya
dipakai layar profil dan route `/api/bayar` sekaligus.

**Setelah membayar, orangnya mendarat di `/terima-kasih`, bukan `/hari-ini`.**
Sebagian metode (e-wallet, kartu dengan 3DS) meninggalkan aplikasi ini
sepenuhnya, dan `finish` URL dulu menunjuk balik ke `/expired`: orang yang baru
saja membayar mendarat di layar yang berbunyi "aksesmu habis", lalu
menyimpulkan uangnya hilang. Halaman itu juga tempat yang benar untuk keadaan
menggantung, karena virtual account dan QRIS baru masuk beberapa menit
kemudian. Ia WAJIB ada di `RUTE_TUJUAN` dan `RUTE_TELANJANG` sekaligus: tanpa
yang pertama, gerbang memantulkan orang yang aksesnya belum hidup kembali ke
`/expired`, tepat pada detik dia paling butuh kepastian.

**Halaman langganan tidak boleh pernah kehabisan cara membayar.**
`transferManual` di pengaturan harga mematikan jalur transfer manual setelah
gateway berjalan, supaya antrean konfirmasi admin berhenti terisi. Tapi ada
satu kombinasi yang mematikan: saklar itu mati DAN gateway ikut mati (kunci
belum dipasang di lingkungan itu, atau server dan klien beda lingkungan).
Yang tersisa halaman berisi daftar harga tanpa satu pun tombol untuk
membelinya, dan itu jalan buntu yang tidak terlihat seperti kerusakan: tidak
ada yang melaporkannya, yang terjadi cuma orang pergi. Karena itu
`jalurBayar()` memaksa transfer manual hidup ketika gateway tidak aktif, apa
pun isi pengaturannya. Saklar menentukan yang diinginkan, fungsi itu
menentukan yang aman. Dipakai tampilan DAN route `/api/aktivasi` sekaligus,
jadi tombol yang disembunyikan juga benar-benar ditolak server. Dijaga
`addon.test.ts`, yang menamai kegagalannya "buntu".

**Penawaran sesudah onboarding adalah penawaran, bukan tembok.** `/penawaran`
muncul sekali, dibawa alihan dari halaman onboarding, pada menit dengan niat
paling tinggi yang dimiliki aplikasi ini: orangnya baru saja mengisi tanggal
lahirnya sendiri. Yang memisahkannya dari tembok cuma jalan keluar yang
benar-benar ada, jadi itu yang dikunci `gate.test.ts` dan bukan tampilannya:
`tentukanAlihan()` tidak boleh pernah mengembalikan rute ini dari keadaan mana
pun, ia tidak boleh masuk `RUTE_TUJUAN`, dan berkasnya wajib memuat tautan ke
`/hari-ini`. Sekali sebuah layar penawaran jadi tujuan sebuah pemeriksaan, yang
gagal pemeriksaan dikirim ke sana berulang kali tanpa cara keluar selain
membayar, dan halaman depan sudah terlanjur menjanjikan "tanpa kartu kredit".
Halaman itu juga mengalihkan sendiri ke `/hari-ini` di server ketika tidak ada
promo berjalan, jadi layar harga tepat setelah mendaftar hanya muncul kalau
memang ada yang ditawarkan. Alihannya tiba sebagai `NEXT_REDIRECT` di payload
flight, bukan sebagai 307 pada dokumennya, jadi memeriksanya dengan kode
balasan `curl` akan menjawab 200 dan terlihat seperti tidak bekerja.

**Ajakan promo di halaman depan berdetak, dan tetap bisa ditinggalkan.**
Jam mundurnya dirender di hero, di atas kartu harga, dan di bilah yang
menempel di bawah layar, tapi nilai awalnya SELALU datang dari server lewat
`sisaPromoRinci()`. Menghitungnya sendiri di peramban dengan `Date.now()`
memberi detik yang berbeda dari detik yang sudah tertulis di HTML halaman
statis, dan React menjawabnya dengan menggambar ulang seluruh pohonnya:
halaman yang berkedip pada muatan pertama. Bilah bawahnya punya tombol tutup
yang bertahan sepanjang kunjungan dan menyingkir sendiri saat kartu harga
terlihat, dengan alasan yang sama seperti `/penawaran`: ajakan yang tidak bisa
disingkirkan berhenti dibaca dan mulai dihindari, dan hero sudah terlanjur
menjanjikan "tanpa kartu kredit". Yang diamati bilah itu deret kartu harganya
(`SASARAN`), BUKAN jangkar `#promo` di atasnya: jangkar itu setinggi nol, dan
target setinggi nol tidak pernah dianggap berpotongan oleh
`IntersectionObserver`, jadi pemeriksaannya diam tanpa satu pun error dan
bilahnya menutupi kartu yang sedang dibaca orangnya. Nilai hematnya disebut
dalam rupiah lewat `nilaiHemat()`, bukan cuma persen, dan angka yang sama
dipakai ketiganya. Dijaga `promo.test.ts` dan `kontras.test.ts`.

**Promo tanpa tanggal berakhir adalah promo yang mati.** `promoBerlaku()` di
`src/lib/promo.ts` menolak `berakhirPada` yang null, dan route PUT harga
menolak menyimpan promo aktif tanpa tanggal. Arah bawaan itu disengaja:
promo yang kehilangan tanggalnya adalah bentuk yang sama persis dengan harga
uji Rp 1.000 yang tertinggal di produksi, yaitu potongan harga yang berlaku
selamanya karena tidak ada apa pun yang mengingatkan untuk mengembalikannya.
Lewat tanggalnya, `hargaPromo()` mengembalikan harga asli apa adanya tanpa
ada yang perlu menyentuh saklar. Karena itu pula halaman depan dan `/expired`
turun ke `revalidate = 600`: masa kedaluwarsa halaman statis adalah lamanya
harga promo masih terpajang setelah promonya benar-benar berakhir, sementara
route pembayaran sudah menagih harga normal. Sejam terlalu lama untuk jendela
di mana angka di layar berbeda dari angka di tagihan.

**Bonus add-on paket ada di kode, bukan di pengaturan.** `PROMO_BONUS` di
`src/lib/promo.ts` menentukan add-on mana yang ikut gratis di tiap paket, dan
`gabungPromo()` membuang `bonusAddOn` apa pun yang datang dari Firestore.
Alasannya sama persis dengan `addon-registry`: dokumen harga disimpan utuh,
jadi daftar yang tersimpan akan beku pada nilai saat admin pertama kali
menekan simpan, dan bonus yang ditambahkan belakangan di kode tidak akan
pernah muncul. Yang boleh diatur admin cuma keputusan dagangnya: promo jalan
atau tidak, sampai kapan, dan berapa persen. Bonus yang add-on-nya tidak
dijual ikut disaring `hargaPromo()`, karena menjanjikan fitur yang tidak bisa
dibuka lebih buruk daripada tidak menjanjikan apa-apa: kesalahannya baru
terasa setelah uangnya masuk.

**Total di layar dan total di tagihan dirakit satu fungsi.** `rakitPesanan()`
di `src/lib/pesanan.ts` dipakai layar langganan, `/api/bayar`, dan
`/api/aktivasi` sekaligus. Di dalamnya bonus menang atas pilihan sendiri:
mencentang add-on yang sudah jadi bonus paket tidak menambah tagihan, karena
kalau lolos yang terjadi persis kebalikan dari yang dijanjikan halaman depan.
Promonya diterima sudah jadi sebagai `PaketPromo`, bukan dihitung di dalam,
supaya sisi peramban tidak pernah memanggil `new Date()`: hasil hitungan
server yang diturunkan sebagai prop tidak bisa berbeda dari waktu server yang
nanti menagih. Pembulatan promo selalu ke bawah ke ribuan terdekat, karena ke
atas berarti pelanggan membayar sedikit lebih mahal daripada persen yang
tertulis di halaman.

Midtrans sengaja tidak diberi saklar di panel admin: saklarnya sudah ada dan
lebih tegas, yaitu ada tidaknya kunci di env. Dua saklar berarti dua sumber
kebenaran yang bisa berbeda, dan yang paling mungkin terjadi adalah admin
mematikannya di panel lalu lupa sementara kuncinya masih terpasang.

Field yang hilang dari badan permintaan PUT harga dibaca `true`, bukan
`Boolean(undefined)`. Permintaan lama yang belum membawa field ini akan
diam-diam mematikan transfer manual, dan halaman langganan kehilangan satu
jalur tanpa ada yang pernah menyentuh saklarnya.

**Nonaktifkan harus ikut mengakhiri masa coba.** Aksi `deactivate` dulu hanya
menyetel `subscriptionStatus` ke "expired" dan mengosongkan
`subscriptionExpiresAt`, sementara `trialEndsAt` dibiarkan. Untuk siapa pun
yang masa cobanya belum lewat, itu tidak mencabut apa pun: `evaluateAccess()`
membaca `trialEndsAt` tanpa peduli status, jadi orangnya tetap bisa membuka
seluruh aplikasi dan yang berubah cuma lencana di panel admin. Yang membuatnya
ketahuan bukan aksesnya, melainkan tombol hapus yang menolak bekerja dengan
alasan "aksesnya masih berjalan" pada akun yang jelas-jelas tertulis Expired,
dan menekan Nonaktifkan sekali lagi tidak mengubah apa pun. Sekarang lewat
`trialDiakhiri()`, yang hanya memajukan tanggal yang masih di masa depan;
yang sudah lewat dibiarkan supaya riwayatnya tidak ditulis ulang. Tanggal
lamanya masuk jejak audit, jadi salah pencet masih bisa dikembalikan.

**Panel kelola dirender dua kali, jadi id kolom isian wajib dari `useId()`.**
`UserTable` merender kartu ponsel DAN tabel layar lebar sekaligus; yang
menyembunyikan salah satunya cuma CSS, jadi keduanya ada di DOM. Id yang
ditulis sendiri jadi kembar, dan tiap label menunjuk elemen PERTAMA yang
ber-id itu, yaitu salinan kartu ponsel yang `display: none`. Elemen
ber-display none tidak bisa menerima fokus, jadi di laptop menekan label tidak
memfokuskan apa pun dan yang diketik tidak masuk ke mana-mana. Gejalanya
persis seperti fitur yang mati: tombol hapus tidak pernah menyala karena kolom
konfirmasinya tetap kosong, sementara di ponsel semuanya normal. Terukur di
peramban pada lebar 1680: fokus mendarat di BODY. Tiga kolom kena sekaligus
(tanggal habis, tanggal lahir, konfirmasi hapus) dan hanya satu yang
dilaporkan. Ditahan `admin.test.ts`.

**Tab Pembayaran menampilkan jawaban Midtrans, bukan kehendak admin.** Tombol
"periksa ulang" menanyakan status ke Midtrans lalu menerapkannya lewat
`terapkanPembayaran()`, fungsi yang sama dengan webhook. Tidak ada jalan di
layar itu untuk menandai lunas sesuatu yang tidak dibayar; admin yang memang
ingin memberi akses gratis memakai pengatur langganan di daftar pengguna, dan
itu tercatat atas namanya sendiri, bukan atas nama Midtrans. Pesanan sandbox
diberi penanda mode supaya hasil percobaan tidak terbaca sebagai uang masuk.

**URL notifikasi didaftarkan di Settings, Payment, bukan Settings,
Configuration.** Midtrans memindahkan seluruh kolom notifikasi (Payment
Notification URL, Recurring, Account Linking) ke halaman Settings, Payment,
dan halaman Configuration yang disebut hampir semua panduan yang beredar,
termasuk sebagian dokumentasi resmi mereka sendiri, sudah tidak ada. Yang
mencarinya akan menelusuri menu yang tidak akan pernah ditemukan. Sandbox dan
produksi juga punya dashboard terpisah (`dashboard.sandbox.midtrans.com` dan
`dashboard.midtrans.com`) yang pengaturannya tidak saling menyalin: URL yang
didaftarkan di satu sisi tidak berlaku di sisi lain.

**Notifikasi Midtrans dipercaya karena tanda tangannya, bukan karena isinya.**
Route `/api/bayar/notifikasi` terbuka untuk umum, dan memang harus: yang
memanggilnya server Midtrans, bukan peramban, jadi tidak ada token Firebase
yang bisa diminta. Penggantinya sha512 dari `order_id + status_code +
gross_amount + server_key`. Tanpa pemeriksaan itu, satu POST berisi
`{"order_id":"...","transaction_status":"settlement"}` cukup untuk memberi
diri sendiri langganan tiga tahun gratis. Rumusnya dikunci di
`midtrans.test.ts` terhadap nilai acuan yang dihitung terpisah, jadi urutan
penggabungannya pun ikut terjaga. `gross_amount` dipakai apa adanya berikut
dua desimalnya ("150000.00"); membulatkannya membuat setiap pembayaran yang
benar-benar lunas ditolak sebagai palsu.

**`capture` bukan berarti lunas.** Untuk kartu kredit, Midtrans menahan
transaksi mencurigakan dengan `fraud_status: "challenge"`: uangnya belum tentu
jadi milik kita. Yang dibaca lunas hanya `settlement` dan `capture` yang
`accept`. Status yang belum dikenal jatuh ke `gagal`, bukan ke lunas: menebak
ke arah membuka akses adalah arah tebakan yang salah.

**Penerapan pembayaran dibungkus satu transaksi dan hanya boleh sekali.**
`terapkanPembayaran()` di `src/lib/pembayaran-server.ts` menulis
`diterapkanPada` di dalam transaksi yang sama dengan perpanjangan
langganannya, jadi tidak ada celah di antara "sudah diperpanjang" dan "sudah
ditandai". Midtrans memang mengirim ulang notifikasi yang sama sampai dijawab
200, dan halaman pembayaran ikut bertanya sendiri; tanpa penjaga ini satu kali
bayar bisa memperpanjang langganan dua kali.

**Halaman pembayaran ikut bertanya sendiri, tidak cuma menunggu webhook.**
Notifikasi bisa tidak sampai (URL belum didaftarkan di dashboard, deploy
sedang berganti), dan yang menanggung akibatnya orang yang uangnya sudah
keluar tapi aplikasinya masih terkunci. Karena itu `GET /api/bayar?orderId=`
menanyakan statusnya langsung ke Midtrans lalu menerapkannya lewat fungsi yang
sama dengan webhook. Dua jalur, satu kesimpulan.

**Pindah ke aplikasi menunggu `canView`, bukan jawaban server.** Langganan
memang sudah dinyalakan di Firestore sebelum jawaban "lunas" dikirim, tapi
profil di layar datang lewat onSnapshot yang tiba beberapa saat kemudian.
Pindah lebih dulu membuat penjaga akses melihat akses yang belum hidup lalu
memantulkan pengguna kembali ke halaman terkunci, tanpa keterangan apa pun,
tepat setelah dia membayar.

**CSP harus mengizinkan host Midtrans di empat arahan.** `script-src` untuk
snap.js, `frame-src` untuk jendela pembayarannya (dan iframe bank 3DS di
dalamnya), `connect-src` untuk permintaan yang dilakukannya, `img-src` untuk
logo bank dan e-wallet. `Permissions-Policy` juga melepas `payment` untuk
halaman sendiri dan iframe Midtrans. Sama seperti apis.google.com pada masuk
dengan Google: skrip yang ditolak CSP gagal tanpa satu pun permintaan
jaringan, jadi yang terlihat cuma tombol yang tidak membuka apa-apa.
`midtrans.test.ts` menahannya.

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

**Harga uji yang ditinggalkan di produksi.** Paket 1 Tahun sempat disetel
Rp 1.000 untuk menguji pembayaran sungguhan dengan biaya kecil, lalu tidak
dikembalikan. Selama itu siapa pun bisa membeli setahun seharga seribu rupiah,
dan tidak ada satu pun yang berbunyi salah: halaman harga tampil rapi, gateway
menerima, langganan menyala. Yang berubah diam-diam cuma penghematan di
halaman depan, karena `hemat()` menghitungnya terhadap paket satu tahun, jadi
dengan acuan Rp 1.000 tidak ada paket yang terlihat hemat sama sekali.
Menguji dengan nominal kecil itu benar; yang salah adalah tidak ada apa pun
yang mengingatkan untuk mengembalikannya. Sebelum menutup sesi pengujian
pembayaran, baca ulang harga live lewat `GET /api/admin/harga`.

**`vercel redeploy` memakai env var milik deployment lama.** Ia benar-benar
membangun ulang (nama chunk-nya berubah), tapi konfigurasinya diambil dari
deployment yang di-redeploy, bukan dari pengaturan project saat ini. Env var
yang baru ditambahkan TIDAK ikut. Gejalanya menyesatkan karena setengah
jalan: `MIDTRANS_SERVER_KEY` terbaca dan route webhook menjawab 400 seolah
gateway hidup, sementara `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` yang dibekukan saat
build tetap kosong, jadi tombol bayarnya tidak pernah muncul. Untuk env var
baru, picu build baru dari git (push ke `main`) atau `vercel deploy --prod`,
bukan redeploy.

Cara memastikannya tanpa perlu masuk sebagai pengguna: ambil chunk yang
dirujuk HTML halamannya lalu cari untaian `app.midtrans.com` di dalamnya.
Untaian itu ada di `urlSnapJs()` dan ikut ke bundel apa pun yang memuat
BayarMidtrans. Meng-grep HTML-nya saja tidak menjawab apa pun: teks tombolnya
dirender setelah hidrasi, jadi tidak ada di HTML bahkan ketika tombolnya jelas
terlihat di layar.

**Daftar chunk diambil dengan `/_next/static/[^"]*\.js`, bukan dari `src="`.**
Sebagian chunk dirujuk bukan lewat atribut `src`, termasuk yang memuat
komponen halaman itu sendiri. Memindai hanya yang ber-`src=` melewatkan persis
chunk yang dicari, dan hasilnya nol untuk build yang sebenarnya baik-baik
saja. Ini sudah pernah menyesatkan satu putaran penuh: produksi dilaporkan
tidak membawa kode Midtrans padahal membawanya, dan yang menyelamatkan hanya
menjalankan pemindaian yang sama pada build lokal yang jelas berfungsi lalu
mendapati hasilnya juga nol. Setiap pemindaian bundel wajib punya pembanding
yang diketahui benar; tanpa itu, nol tidak bisa dibedakan dari alat yang
rusak.

**`vercel env pull` mengosongkan env var yang ditandai sensitif.** Berkas yang
dihasilkan tetap memuat semua namanya, tapi nilainya `""`, karena env var
sensitif memang tidak bisa dibaca balik oleh siapa pun. Menjalankannya begitu
saja akan menimpa `.env.local` yang sedang bekerja dengan berkas yang semuanya
kosong, dan gejalanya baru muncul jauh kemudian sebagai "kredensial Firebase
belum lengkap". Salin dulu sebelum menarik. Konsekuensi lain: kunci pihak
ketiga tidak bisa diperiksa dari sini, jadi kegagalan pengiriman ditelusuri
lewat `vercel logs`, bukan dengan memanggil API penyedianya.

**Grep pada HTML ikut mengenai payload RSC.** Untuk memeriksa apa yang
benar-benar terlihat, buang `<script>` dan tag dulu. Dua kali aku salah lapor
karena ini.

**Prettier merapikan ulang.** Pencocokan string persis sering meleset setelah
Prettier menggabung impor multi-baris. Sisipkan setelah baris impor satu baris
yang pasti, bukan setelah "impor terakhir". Ini juga berlaku pada tes yang
memeriksa kode dengan membaca sumbernya: `addon.test.ts` pernah merah bukan
karena aturannya dilanggar, melainkan karena baris yang dicarinya dipecah
Prettier setelah berkasnya disentuh. Pola seperti itu harus menoleransi spasi
dan pindah baris, kalau tidak ia menjaga tata letak, bukan aturannya.

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
  Sejak masuk dengan Google ada, sebagian pengguna tidak pernah menerima email
  ini sama sekali, jadi masalahnya mengecil tapi belum hilang.
- **Email verifikasi sering masuk spam.** Bukan karena gagal autentikasi: SPF
  dan DKIM domain pengirim Firebase ada dan sah (diperiksa lewat dig, 28
  Agustus 2026). Penyebabnya alamat pengirimnya `hari-baik-7e56c.firebaseapp.com`,
  subdomain buatan mesin yang dipakai bersama ribuan project lain dan tidak
  berhubungan dengan `haribaik.seawise.id`, ditambah tautan di dalamnya yang
  juga berdomain lain. `seawise.id` sendiri belum punya record SPF; DMARC-nya
  sudah ada di `p=none`. Perbaikan penuhnya berarti mengirim emailnya sendiri
  lewat `generateEmailVerificationLink()`, yang sekalian menyelesaikan butir di
  atas.
- **Pengingat WhatsApp dibuang** dari katalog, butuh layanan pengirim pesan
  dan penjadwal di luar aplikasi ini.
- **Pengembalian dana Midtrans belum ditangani otomatis.** `refund`,
  `partial_refund`, dan `chargeback` dicatat sebagai `dikembalikan` di dokumen
  pembayaran, tapi langganan yang sudah menyala tidak dicabut. Itu disengaja:
  aksesnya mungkin sudah dipakai, dan keputusannya milik orang, bukan
  otomatis. Yang belum ada cara memberi tahu admin bahwa itu terjadi.
- **Pesanan yang ditinggalkan tidak pernah dibersihkan.** Dokumen
  `pembayaran` berstatus menunggu menumpuk selamanya. Transaksinya sendiri
  kedaluwarsa 24 jam di sisi Midtrans, jadi tidak ada yang bisa dibayar
  belakangan; yang menumpuk cuma dokumennya. Sudah ada satu di produksi
  (QRIS Rp 495.000, dibuat 31 Agustus 2026, tidak pernah dibayar).
- **Tidak ada yang memberi tahu admin saat pembayaran masuk.** Uang yang
  lunas cuma terlihat kalau ada yang membuka tab Pembayaran atau dashboard
  Midtrans. Untuk sekarang itu cukup, karena jumlahnya masih sedikit.
- **Kartu kredit dengan 3DS dan pesanan add-on saja belum pernah diuji
  sungguhan.** Keduanya jalan di sandbox; yang belum terbukti adalah
  kepulangan lewat alihan halaman pada kartu produksi, dan penerapan pesanan
  ber-`paketTahun` nol pada akun yang langganannya benar-benar berjalan.

## Struktur singkat

```
src/lib/wariga/        mesin perhitungan, murni fungsi, paling dijaga
src/lib/content/       teks dan tabel yang diport dari aplikasi lama
src/lib/content/fengshui  sistem 81 angka untuk nama usaha, add-on sekali bayar
src/lib/gate.ts        semua keputusan akses, fungsi murni, ada tesnya
src/lib/addon-registry add-on mana yang fiturnya sudah ada
src/lib/harga-server   satu pintu baca harga di server
src/lib/audit.ts       jejak audit, ditulis semua route admin yang mengubah data
src/lib/midtrans.ts    murni: tanda tangan, terjemahan status, order id
src/lib/midtrans-server  yang memegang kunci server, server-only
src/lib/pembayaran-server  satu pintu mengubah pembayaran jadi langganan
src/lib/admin-pembayaran  pencarian dan penyaringan pesanan, fungsi murni
src/lib/addon-beli.ts  siapa boleh menambah add-on tanpa berlangganan lagi
src/lib/promo.ts       promo berjangka: potongan, bonus, tanggal berakhirnya
src/lib/pesanan.ts     satu perakit isi pesanan, dipakai layar dan kedua route
src/app/penawaran/     penawaran sekali jalan sesudah onboarding, selalu bisa dilewati
src/app/terima-kasih/  ke mana orang mendarat setelah membayar
scripts/akun-uji.ts    akun uji pembayaran, bisa dikunci ulang
src/app/api/           route admin selalu requireAdmin, harga dihitung server
docs/email/            template email Firebase dan batasnya
```
