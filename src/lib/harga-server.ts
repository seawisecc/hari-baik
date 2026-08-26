import "server-only";
import { addOnSiapJual } from "@/lib/addon-registry";
import { adminDb } from "@/lib/firebase/admin";
import { HARGA_BAWAAN, type PengaturanHarga } from "@/lib/harga";

/**
 * Paksa nonaktif setiap add-on yang fiturnya belum ada.
 *
 * Dilakukan di sini, satu pintu yang dilewati halaman harga maupun route
 * pengajuan aktivasi, supaya tidak ada jalur yang bisa menjual sesuatu yang
 * belum bisa dikirim. Menandainya aktif di panel admin tidak cukup untuk
 * menembus ini, dan memang begitu maksudnya.
 */
function saringAddOn(h: PengaturanHarga): PengaturanHarga {
  return {
    ...h,
    addOn: h.addOn.map((a) => (addOnSiapJual(a.id) ? a : { ...a, aktif: false })),
  };
}

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
    if (!snap.exists) return saringAddOn(HARGA_BAWAAN);
    return saringAddOn({ ...HARGA_BAWAAN, ...snap.data() } as PengaturanHarga);
  } catch {
    return saringAddOn(HARGA_BAWAAN);
  }
}
