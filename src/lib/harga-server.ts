import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { HARGA_BAWAAN, type PengaturanHarga } from "@/lib/harga";

/** Satu tempat penyimpanan harga, dipakai route API maupun render server. */
export const DOKUMEN_HARGA = ["pengaturan", "harga"] as const;

/**
 * Baca daftar harga langsung dari Firestore saat halaman dirender di server.
 *
 * Sebelumnya halaman harga mengambilnya lewat `fetch("/api/admin/harga")`
 * setelah hidrasi, dan `DaftarHarga` mengambilnya sekali lagi untuk dirinya
 * sendiri. Dua perjalanan bolak-balik itu, masing-masing bisa kena cold start
 * fungsi, membuat daftar paket kosong beberapa detik: itulah jeda yang
 * terlihat pengguna. Dibaca di server, harganya sudah ada di HTML pertama.
 *
 * Gagal baca tidak boleh menjatuhkan halaman. Harga bawaan dipakai sebagai
 * pengganti, karena halaman kontak admin di bawahnya tetap berguna meski
 * angkanya belum yang terbaru.
 */
export async function bacaHarga(): Promise<PengaturanHarga> {
  try {
    const snap = await adminDb().collection(DOKUMEN_HARGA[0]).doc(DOKUMEN_HARGA[1]).get();
    if (!snap.exists) return HARGA_BAWAAN;
    return { ...HARGA_BAWAAN, ...snap.data() } as PengaturanHarga;
  } catch {
    return HARGA_BAWAAN;
  }
}
