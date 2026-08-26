# Template email Firebase

Dua email yang dikirim Firebase atas nama aplikasi, dibuat mengikuti tema Hari Baik.

| Berkas | Dipasang di |
|---|---|
| `verifikasi.html` | Authentication > Templates > **Email address verification** |
| `reset-sandi.html` | Authentication > Templates > **Password reset** |

## Cara pasang

1. Buka [Firebase Console](https://console.firebase.google.com/) lalu pilih project `hari-baik-7e56c`.
2. Masuk ke **Authentication > Templates**.
3. Pilih template yang mau diubah, tekan ikon pensil di kanan.
4. **Sender name**: isi `Hari Baik`.
5. **Subject**: pakai salah satu di bawah.
6. **Message**: hapus isinya, lalu tempel seluruh isi berkas HTML-nya. Bagian komentar di atas boleh ikut ditempel atau dibuang, keduanya tidak terkirim ke penerima.
7. Tekan **Save**, lalu kirim satu email uji ke dirimu sendiri sebelum dipakai pelanggan.

### Subject yang disarankan

| Template | Subject |
|---|---|
| Verifikasi | `Konfirmasi email kamu di Hari Baik` |
| Reset sandi | `Atur ulang kata sandi Hari Baik` |

Hindari kata seperti "gratis", "promo", atau tanda seru di subject. Ketiganya menaikkan peluang email masuk folder spam, dan email verifikasi yang tidak terbaca sama saja dengan pendaftaran yang gagal.

## Kenapa bentuknya seperti ini

Email bukan halaman web. Empat hal di bawah menentukan cara template ini ditulis, dan ketiganya bukan pilihan gaya.

- **Semua gaya ditulis inline.** Gmail membuang blok `<style>` di banyak konteks, jadi kelas CSS tidak bisa diandalkan.
- **Tata letaknya pakai `<table>`.** Outlook di Windows merender lewat mesin Word, yang tidak mengenal flexbox maupun grid.
- **Fontnya bukan font aplikasi.** Source Serif dan Inter tidak ikut terkirim. Penggantinya Georgia dan Arial, yang ada di hampir semua perangkat dan bentuknya paling mendekati.
- **Tidak ada gambar sama sekali.** Kebanyakan klien email memblokir gambar sampai penerima menekan "tampilkan gambar". Logo cincinnya digambar dengan `border-radius`, jadi selalu muncul. Di Outlook lama bentuknya jadi kotak, dan itu masih lebih baik daripada kotak kosong bertuliskan gambar gagal dimuat.

## Yang tidak bisa diubah dari sini

Tiga batas ini datang dari Firebase, bukan dari templatenya. Aku sebutkan supaya kamu tidak menghabiskan waktu mencarinya di Console.

**Alamat pengirim tetap `noreply@hari-baik-7e56c.firebaseapp.com`.** Nama pengirim bisa diubah jadi "Hari Baik", tapi alamatnya tidak. Untuk mengirim dari `noreply@seawise.id` perlu SMTP sendiri, yang hanya tersedia setelah project dinaikkan ke Google Cloud Identity Platform. Ini berbayar dan sebaiknya dipertimbangkan nanti, bukan sekarang.

**Domain tautan konfirmasi masih `hari-baik-7e56c.firebaseapp.com`.** Bisa diganti jadi domain sendiri lewat Authentication > Settings > Authorized domains ditambah pengaturan custom action URL. Ini gratis dan layak dikerjakan, karena tautan yang domainnya asing menurunkan kepercayaan orang untuk menekannya.

**Isi email tidak bisa mengikuti bahasa pengguna.** Firebase menyimpan satu template per bahasa dan memilihnya dari pengaturan `languageCode`, bukan dari pilihan bahasa di dalam aplikasi. Untuk sekarang templatenya berbahasa Indonesia saja. Kalau nanti pelanggan berbahasa Inggris sudah cukup banyak, Console punya pilihan menambah template per bahasa dan aplikasinya perlu diatur mengirim `languageCode` yang sesuai.

## Setelah dipasang

Uji dengan alamat sungguhan, bukan hanya melihat pratinjau di Console. Yang perlu dicek:

- Gmail di ponsel dan di peramban
- Mode gelap, kalau kamu memakainya. Beberapa klien membalik warna latar sendiri, dan teks gelap di atas latar terang bisa berubah jadi sulit dibaca
- Tombolnya benar-benar bisa ditekan, dan tautan cadangan di bawahnya bisa disalin
- Emailnya masuk kotak masuk, bukan spam
