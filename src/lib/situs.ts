/**
 * Alamat kanonik aplikasi ini.
 *
 * Satu tetapan, bukan untaian yang ditulis ulang di tiap berkas, karena
 * pemakainya berjauhan dan tidak saling menyebut: metadata di
 * `src/app/layout.tsx` yang menentukan isi pratinjau WhatsApp, dan kaki
 * template email di `src/lib/email/template.ts` yang dibaca orang di kotak
 * masuknya. Ketika keduanya ditulis sendiri-sendiri, yang mengganti domain
 * hampir pasti menemukan satu dan melewatkan yang lain, dan yang terlewat itu
 * baru ketahuan berbulan-bulan kemudian dari email pelanggan yang menyebut
 * alamat yang sudah tidak dipakai.
 *
 * Ini alamat yang aplikasinya SEBUT tentang dirinya, bukan alamat yang sedang
 * diakses. Yang kedua diturunkan dari `req.nextUrl.origin` di tiap route, dan
 * memang harus begitu: tautan verifikasi email dan URL kepulangan pembayaran
 * wajib kembali ke host yang barusan dipakai orangnya, bukan ke host yang
 * kebetulan kanonik. `haribaik.seawise.id` masih melayani penuh, dan siapa pun
 * yang masuk lewat sana harus tetap mendarat kembali di sana.
 */
export const SITUS = "https://www.cariharibaik.com";

/** Bentuk tanpa skema, untuk ditulis sebagai teks biasa di email. */
export const SITUS_NAMA = new URL(SITUS).host;
