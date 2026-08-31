import { bacaHarga } from "@/lib/harga-server";
import { daftarPaketPromo, sisaHariPromo } from "@/lib/promo";
import { ExpiredClient } from "./ExpiredClient";

/**
 * Harga dibaca di server supaya sudah ikut terkirim di HTML pertama.
 *
 * Halamannya sendiri tetap statis dan dipakai ulang antar pengguna: isinya
 * cuma daftar harga publik, tidak ada apa pun milik pengguna tertentu di
 * sini. Bagian yang bergantung akun ditangani ExpiredClient di browser.
 * Halaman dibangun ulang saat admin menyimpan harga baru, lewat
 * revalidatePath di route PUT-nya, jadi perubahan harga langsung terlihat
 * tanpa perlu menunggu masa kedaluwarsa.
 *
 * Sepuluh menit sejak ada promo berjangka, dengan alasan yang sama seperti di
 * halaman depan: masa kedaluwarsa halaman statis adalah lamanya harga promo
 * masih terpajang setelah promonya benar-benar berakhir, dan route pembayaran
 * menghitung ulang dengan waktu sungguhan.
 */
export const revalidate = 600;

export default async function ExpiredPage() {
  const harga = await bacaHarga();
  const sekarang = new Date();
  // Promo dihitung di server, lalu diturunkan sebagai prop. Menghitungnya di
  // peramban berarti total di tombol bisa berbeda dari total yang ditagih.
  return (
    <ExpiredClient
      harga={harga}
      paketPromo={daftarPaketPromo(harga, sekarang)}
      sisaPromo={sisaHariPromo(harga.promo, sekarang)}
    />
  );
}
