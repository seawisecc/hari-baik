import { bacaHarga } from "@/lib/harga-server";
import { ProfilClient } from "./ProfilClient";

/**
 * Katalog add-on dibaca di server, bukan lewat fetch dari browser.
 *
 * Aturan yang sama dengan halaman langganan: `bacaHarga()` adalah satu pintu
 * yang menyaring add-on yang fiturnya belum ada, dan harganya sudah ikut di
 * HTML pertama, jadi daftar tambahan tidak muncul belakangan setelah
 * halamannya terlihat selesai.
 *
 * Halamannya tetap statis dan dipakai ulang antar pengguna: yang ada di sini
 * cuma katalog publik. Bagian yang bergantung akun, termasuk add-on mana yang
 * sudah dimiliki, ditangani ProfilClient di browser.
 */
export const revalidate = 3600;

export default async function ProfilPage() {
  return <ProfilClient harga={await bacaHarga()} />;
}
