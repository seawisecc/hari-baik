import { bacaHarga } from "@/lib/harga-server";
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
 */
export const revalidate = 3600;

export default async function ExpiredPage() {
  return <ExpiredClient harga={await bacaHarga()} />;
}
