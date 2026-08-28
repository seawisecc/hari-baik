import { evaluateAccess } from "@/lib/subscription";
import type { UserProfile } from "@/types";

/**
 * Siapa yang boleh dihapus, dan kenapa yang lain tidak.
 *
 * Menghapus akun adalah satu-satunya aksi admin di aplikasi ini yang tidak
 * bisa dibatalkan lewat aksi lain. Karena itu aturannya ditulis sebagai fungsi
 * murni di sini, bukan sebagai rangkaian if di dalam route: ia bisa dites
 * tanpa Firestore, dan tampilan memakai fungsi yang sama persis dengan yang
 * dipakai server untuk menolak. Tombol yang menyala di layar tapi ditolak
 * server, atau sebaliknya, keduanya sama membingungkannya.
 *
 * Yang tidak boleh dihapus dan alasannya:
 *
 * - admin, karena akun yang bisa menghapus tidak boleh bisa menghapus dirinya
 *   sendiri atau rekannya sampai tidak ada yang tersisa untuk masuk;
 * - yang masih menunggu, karena "menunggu" berarti orang itu mengaku sudah
 *   membayar dan belum diperiksa. Menghapusnya membuang pelanggan yang
 *   uangnya barangkali sudah masuk;
 * - yang aksesnya masih hidup, termasuk trial yang belum habis. Trial yang
 *   masih berjalan adalah calon pelanggan yang mungkin baru mendaftar
 *   setengah jam lalu, bukan sisa yang perlu dibersihkan.
 *
 * Keputusan "aksesnya masih hidup" tidak dihitung ulang di sini, melainkan
 * ditanyakan ke evaluateAccess(), satu-satunya tempat aturan akses diputuskan.
 *
 * Dengan satu pengecualian, yang datang dari kasus nyata. Orang yang mendaftar
 * lalu tidak pernah menekan tautan verifikasinya punya trial yang secara
 * hitungan masih berjalan, jadi evaluateAccess() bilang aksesnya hidup. Di
 * layar dia tidak bisa membuka apa pun: tentukanAlihan() menahannya di
 * /verify-email selama emailnya belum terbukti. Jadi "aksesnya masih hidup"
 * tidak benar untuknya, dan akun seperti itulah yang justru paling banyak
 * menumpuk. Selama emailnya diketahui belum terverifikasi, penjaga trial
 * dilewati. Kalau statusnya tidak diketahui (null, karena akun Auth-nya gagal
 * dibaca), penjaganya tetap berlaku: menebak ke arah menghapus adalah arah
 * tebakan yang salah.
 */
export type TolakHapus = "admin" | "menunggu" | "aktif";

/** Bentuk minimal yang cukup untuk memutuskan. */
export type DapatDihapus = Pick<
  UserProfile,
  "role" | "subscriptionStatus" | "subscriptionExpiresAt" | "trialEndsAt"
> & {
  /**
   * Dari Firebase Auth, bukan dari dokumen Firestore. null berarti tidak
   * diketahui, dan diperlakukan seperti sudah terverifikasi.
   */
  emailTerverifikasi?: boolean | null;
};

export function alasanTolak(u: DapatDihapus, sekarang: Date = new Date()): TolakHapus | null {
  if (u.role === "admin") return "admin";
  if (u.subscriptionStatus === "pending") return "menunggu";
  // Yang emailnya belum terbukti tidak pernah bisa masuk, berapa pun sisa
  // trialnya, jadi tidak ada akses hidup yang perlu dilindungi.
  if (u.emailTerverifikasi === false) return null;
  if (evaluateAccess(u, sekarang).canView) return "aktif";
  return null;
}

export function bolehDihapus(u: DapatDihapus, sekarang: Date = new Date()): boolean {
  return alasanTolak(u, sekarang) === null;
}

/**
 * Apakah email konfirmasi yang diketik admin cocok dengan email sasaran?
 *
 * Konfirmasinya mengetik email, bukan menekan "ya", karena daftar pengguna
 * adalah baris-baris yang mirip satu sama lain dan tombol hapus di baris yang
 * salah tidak terasa berbeda dari tombol hapus di baris yang benar. Mengetik
 * email memaksa mata kembali ke baris yang dimaksud.
 *
 * Perbandingannya mengabaikan besar kecil huruf dan spasi di ujung, karena
 * email memang begitu, dan karena menyalin dari tabel sering ikut membawa
 * spasi. Selain itu harus sama persis.
 */
export function emailCocok(diketik: string, sebenarnya: string): boolean {
  return diketik.trim().toLowerCase() === (sebenarnya ?? "").trim().toLowerCase();
}
