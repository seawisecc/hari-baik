import "server-only";

import { adminAuth } from "@/lib/firebase/admin";
import type { PenggunaAdmin, UserProfile } from "@/types";

/** getUsers menerima paling banyak seratus identifier sekali panggil. */
const SEKALI_TANYA = 100;

/**
 * Tempelkan status verifikasi email dari Firebase Auth ke daftar pengguna.
 *
 * Statusnya tidak ada di Firestore dan sengaja tidak disimpan di sana: nilai
 * yang bisa berubah di Auth tidak boleh punya salinan kedua yang pasti akan
 * basi lalu suatu hari dipercaya.
 *
 * Dipakai bersama oleh daftar pengguna dan ekspor, supaya keduanya tidak bisa
 * memberi jawaban yang berbeda tentang orang yang sama. Kalau ekspor memakai
 * salinan aturannya sendiri, cepat atau lambat berkas CSV dan layar akan
 * berselisih, dan yang dipercaya orang adalah yang terakhir dilihatnya.
 *
 * Yang tidak ditemukan di Auth bernilai false, bukan null: itu dokumen yatim
 * yang tertinggal setelah akunnya dihapus dari luar aplikasi ini, dan
 * pemiliknya sama tidak bisa masuknya dengan yang belum terverifikasi. null
 * disediakan untuk keadaan yang berbeda, yaitu Auth-nya gagal dihubungi.
 */
export async function denganVerifikasi(users: UserProfile[]): Promise<PenggunaAdmin[]> {
  if (users.length === 0) return [];

  const peta = new Map<string, boolean>();
  try {
    for (let i = 0; i < users.length; i += SEKALI_TANYA) {
      const potong = users.slice(i, i + SEKALI_TANYA);
      const { users: akun } = await adminAuth().getUsers(potong.map((u) => ({ uid: u.uid })));
      for (const a of akun) peta.set(a.uid, a.emailVerified);
    }
  } catch (err) {
    // Panel admin yang tidak bisa dibuka sama sekali lebih merugikan daripada
    // panel admin tanpa satu kolom.
    console.error("[status verifikasi] gagal dibaca", err);
    return users.map((u) => ({ ...u, emailTerverifikasi: null }));
  }

  return users.map((u) => ({ ...u, emailTerverifikasi: peta.get(u.uid) ?? false }));
}
