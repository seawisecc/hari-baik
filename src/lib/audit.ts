import "server-only";

import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Jejak audit: catatan yang tidak bisa dibantah tentang siapa mengubah apa.
 *
 * Sebelum ini, satu-satunya bekas perubahan adalah `lastChangedBy` di dokumen
 * pengguna, yang ditimpa setiap kali ada perubahan berikutnya. Artinya kalau
 * seorang pengguna protes langganannya tiba-tiba mati, atau tanggal lahirnya
 * berubah, tidak ada apa pun yang bisa dibuka untuk melihat apa yang benar
 * benar terjadi: yang tersisa hanya keadaan terakhir.
 *
 * Koleksi `jejak` bersifat tambah-saja. Rules menolak semua tulisan dari
 * klien mana pun; hanya Admin SDK di server yang bisa mengisinya, dan tidak
 * ada satu pun jalur di aplikasi ini yang menyunting atau menghapus isinya.
 *
 * Menulis jejak tidak boleh menggagalkan aksinya. Kalau Firestore sedang
 * bermasalah, admin tetap harus bisa mengaktifkan langganan orang yang sudah
 * membayar; kegagalannya dicatat ke log server, bukan dilempar ke pemanggil.
 */
export type AksiJejak =
  /** Status atau masa berlaku langganan diubah admin. */
  | "langganan"
  /** Daftar add-on milik pengguna ditetapkan admin. */
  | "addon"
  /** Permintaan aktivasi disetujui atau ditolak. */
  | "aktivasi"
  /** Hak admin diberikan atau dicabut. */
  | "klaim"
  /** Daftar harga disimpan. */
  | "harga"
  /** Tanggal lahir seorang pengguna diperbaiki admin. */
  | "lahir"
  /** Daftar pengguna diunduh sebagai berkas. Tidak mengubah apa pun, tetap dicatat. */
  | "ekspor"
  /** Akun pengguna dihapus, Auth dan dokumennya sekaligus. */
  | "hapus"
  /** Email ditandai terverifikasi oleh admin, tanpa pengguna menekan tautannya. */
  | "verifikasi";

export interface Jejak {
  aksi: AksiJejak;
  /** Email admin pelakunya, atau uid bila emailnya tidak ada. */
  aktor: string;
  aktorUid: string;
  /** uid pengguna yang terkena, null untuk perubahan yang tidak menyasar orang. */
  sasaran: string | null;
  /** Satu kalimat bahasa Indonesia, cukup dibaca tanpa membuka detailnya. */
  ringkasan: string;
  /** Nilai sebelum dan sesudah, sejauh yang relevan untuk aksi ini. */
  detail?: Record<string, unknown>;
}

/** Alamat IP pemanggil, sejauh yang bisa dipercaya di belakang proxy Vercel. */
function ipDari(req?: NextRequest): string | null {
  if (!req) return null;
  const maju = req.headers.get("x-forwarded-for");
  return maju ? (maju.split(",")[0]?.trim() ?? null) : null;
}

export async function catatJejak(entry: Jejak, req?: NextRequest): Promise<void> {
  try {
    await adminDb()
      .collection("jejak")
      .add({
        ...entry,
        detail: entry.detail ?? null,
        ip: ipDari(req),
        createdAt: new Date().toISOString(),
      });
  } catch (err) {
    console.error("[jejak]", entry.aksi, err);
  }
}
