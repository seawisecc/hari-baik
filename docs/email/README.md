# Template email Firebase

## Yang bisa dan tidak bisa diubah

Diperiksa langsung di console project `hari-baik-7e56c` pada 26 Agustus 2026, bukan dari dokumentasi. Kolom **Message** diperiksa sesudah masuk mode edit, dan hasilnya berbeda per template:

| Template                   | Subject | Message     |
| -------------------------- | ------- | ----------- |
| Email address verification | bisa    | **dikunci** |
| Password reset             | bisa    | **bisa**    |
| Email address change       | bisa    | **dikunci** |

Alasannya disebut Firebase sendiri di tooltip kolom Message:

> To help prevent spam, the message can't be edited on this email template.

Ini bukan soal paket Spark, bukan soal hak akses, dan tidak hilang dengan upgrade. Firebase mengunci isi kedua email itu karena keduanya berisi tautan yang bisa dipakai mengambil alih akun, jadi teksnya dijaga supaya tidak bisa dijadikan alat phishing.

Artinya: **email verifikasi tidak bisa dibuat bertema lewat Console.** Yang bisa sekarang hanya reset kata sandi.

## Yang bisa dipasang sekarang

### Reset kata sandi

1. Buka [Firebase Console](https://console.firebase.google.com/) lalu pilih project `hari-baik-7e56c`.
2. Masuk ke **Authentication > Templates > Password reset**.
3. Tekan ikon pensil di kanan panel.
4. **Sender name**: `Hari Baik`
5. **Subject**: `Atur ulang kata sandi Hari Baik`
6. **Message**: hapus isinya, tempel seluruh isi `reset-sandi.html`. Komentar di bagian atas boleh ikut atau dibuang, keduanya tidak terkirim ke penerima.
7. **Save**, lalu kirim satu email uji ke dirimu sendiri.

### Untuk email verifikasi

Yang masih bisa dilakukan tanpa membangun apa pun:

- **Sender name** jadi `Hari Baik`, supaya di kotak masuk tidak muncul sebagai `noreply`.
- **Subject** jadi `Konfirmasi email kamu di Hari Baik`.

Keduanya sudah cukup mengubah kesan pertama di daftar inbox, walaupun isi emailnya tetap teks bawaan Firebase.

Catatan: waktu diperiksa, Sender name masih `not provided` dan Subject masih bawaan. Perubahan yang belum ditekan **Save** tidak tersimpan.

## Kalau email verifikasi harus bertema

Satu-satunya jalan adalah berhenti memakai `sendEmailVerification()` bawaan dan mengirim emailnya sendiri:

1. Di server, panggil `generateEmailVerificationLink(email)` dari Firebase Admin SDK. Ini mengembalikan tautan konfirmasi yang sah, tanpa mengirim email apa pun.
2. Kirim email sendiri lewat layanan pengirim, memakai `verifikasi.html` sebagai isinya.

Yang didapat: kendali penuh atas tampilan, alamat pengirim bisa jadi `noreply@seawise.id`, dan isinya bisa mengikuti bahasa pilihan pengguna.

Yang dibayar: satu layanan pengirim email tambahan untuk dipasang dan dijaga, plus domain yang perlu diverifikasi lewat DNS supaya emailnya tidak masuk spam.

Belum dikerjakan, karena ini menambah satu komponen baru ke sistem dan sebaiknya diputuskan lebih dulu, bukan diselipkan.

## Kenapa bentuk HTML-nya seperti itu

Email bukan halaman web. Empat hal di bawah menentukan cara template ditulis, dan semuanya bukan pilihan gaya.

- **Semua gaya inline.** Gmail membuang blok `<style>` di banyak konteks.
- **Tata letak pakai `<table>`.** Outlook di Windows merender lewat mesin Word, yang tidak mengenal flexbox maupun grid.
- **Font bukan font aplikasi.** Source Serif dan Inter tidak ikut terkirim. Penggantinya Georgia dan Arial.
- **Tidak ada gambar.** Kebanyakan klien email memblokir gambar sampai penerima menekan tombol tampilkan. Logo cincinnya digambar dengan `border-radius`, jadi selalu muncul.

## Dua batas lain yang tetap berlaku

**Alamat pengirim tetap `noreply@hari-baik-7e56c.firebaseapp.com`.** Nama pengirim bisa diubah, alamatnya tidak, kecuali memakai SMTP sendiri lewat Google Cloud Identity Platform.

**Domain tautan konfirmasi masih `hari-baik-7e56c.firebaseapp.com`.** Bisa diganti lewat **Customize action URL** di panel yang sama. Ini gratis dan layak dikerjakan, karena tautan berdomain asing menurunkan kepercayaan orang untuk menekannya.

**Isi email tidak mengikuti bahasa di dalam aplikasi.** Firebase memilih template dari `languageCode`, bukan dari toggle ID/EN. Pengaturannya ada di **Template language** di kiri bawah panel, sekarang masih English.

## Kenapa emailnya masuk spam, dan apa yang mengurangi

Diperiksa lewat `dig` pada 28 Agustus 2026, bukan dari dugaan:

| Yang diperiksa                         | Hasil                                  |
| -------------------------------------- | -------------------------------------- |
| SPF `seawise.id`                       | tidak ada, hanya TXT verifikasi Google |
| DMARC `seawise.id`                     | ada, `p=none`                          |
| SPF `hari-baik-7e56c.firebaseapp.com`  | ada, `v=spf1 redirect=_spf.google.com` |
| DKIM `hari-baik-7e56c.firebaseapp.com` | ada                                    |

Jadi emailnya tidak gagal autentikasi. Yang membuatnya jatuh ke spam:

1. Alamat pengirimnya subdomain buatan mesin yang dipakai bersama ribuan project Firebase lain. Reputasi dinilai per domain pengirim, dan domain itu bukan milikmu.
2. Sender name masih `not provided`, jadi muncul sebagai `noreply` di daftar inbox.
3. Tautan di dalamnya juga berdomain `firebaseapp.com`. Email yang mengaku dari Hari Baik tapi mengarah ke domain lain adalah pola yang sama persis dengan phishing.

Yang sudah mengurangi masalahnya tanpa mengirim email apa pun: **masuk dengan Google**. Akun yang datang lewat Google sudah terverifikasi emailnya, jadi `sendEmailVerification()` tidak pernah dipanggil untuk mereka. Untuk pasar yang hampir semuanya Gmail, ini memotong sebagian besar kasusnya.

Sisanya, untuk yang tetap mendaftar dengan kata sandi:

- **Gratis, di Console, tanpa kode.** Isi Sender name dan Subject, lalu arahkan **Customize action URL** ke `haribaik.seawise.id`. Nomor 2 dan 3 di atas hilang. Nomor 1 tetap.
- **Perbaikan penuhnya** ada di bagian "Kalau email verifikasi harus bertema" di atas: kirim sendiri lewat `generateEmailVerificationLink()` dari domain `seawise.id` yang di-DKIM. `seawise.id` perlu record SPF lebih dulu, karena sekarang belum punya.

## Setelah dipasang

Uji dengan alamat sungguhan, bukan hanya pratinjau di Console:

- Gmail di ponsel dan di peramban
- Mode gelap, kalau kamu memakainya
- Tombolnya bisa ditekan, tautan cadangan di bawahnya bisa disalin
- Masuk kotak masuk, bukan spam
