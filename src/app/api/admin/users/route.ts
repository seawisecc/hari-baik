import type { NextRequest } from "next/server";
import { cariPengguna } from "@/lib/admin-cari";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import type { PenggunaAdmin, UserProfile } from "@/types";

/**
 * Berapa banyak dokumen yang boleh dipindai saat mencari.
 *
 * Pencarian substring tidak bisa dikerjakan Firestore, jadi dokumennya dibaca
 * lalu dicocokkan di sini. Satu pencarian berarti sebanyak ini pembacaan, dan
 * itu ditagih. Batasnya ditaruh di angka yang masih jauh di atas jumlah
 * pelanggan sekarang tapi tidak membiarkan biayanya tumbuh diam-diam kalau
 * suatu hari daftarnya jadi puluhan ribu. Kalau batas ini kena, jawabannya
 * menyebutkan itu, bukan berpura-pura sudah lengkap.
 */
const BATAS_PINDAI = 1000;

/**
 * Tempelkan status verifikasi email dari Firebase Auth.
 *
 * Statusnya tidak ada di Firestore dan sengaja tidak disimpan di sana. Yang
 * ditanya cuma sehalaman yang benar-benar dikirim, bukan seluruh hasil
 * pencarian, karena getUsers menerima paling banyak seratus identifier
 * sekali panggil dan halaman memang dibatasi seratus.
 *
 * Kalau panggilannya gagal, daftarnya tetap dikirim dengan nilai null.
 * Panel admin yang tidak bisa dibuka sama sekali lebih merugikan daripada
 * panel admin tanpa satu kolom.
 */
async function denganVerifikasi(users: UserProfile[]): Promise<PenggunaAdmin[]> {
  if (users.length === 0) return [];
  try {
    const { users: akun } = await adminAuth().getUsers(users.map((u) => ({ uid: u.uid })));
    const peta = new Map(akun.map((a) => [a.uid, a.emailVerified]));
    return users.map((u) => ({ ...u, emailTerverifikasi: peta.get(u.uid) ?? null }));
  } catch (err) {
    console.error("[admin users] status verifikasi gagal dibaca", err);
    return users.map((u) => ({ ...u, emailTerverifikasi: null }));
  }
}

/** Daftar pengguna untuk panel admin. */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const status = req.nextUrl.searchParams.get("status");
    const kunci = req.nextUrl.searchParams.get("q") ?? "";
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 100), 500);

    // Filter dulu, baru urutkan dan batasi, mengikuti urutan yang dipakai
    // Firestore saat menyusun query. Kombinasi where + orderBy pada field
    // berbeda butuh composite index (lihat firestore.indexes.json).
    const dasar = adminDb().collection("users");
    const disaring = status ? dasar.where("subscriptionStatus", "==", status) : dasar;

    // Saat mencari, yang diambil bukan sehalaman melainkan sebanyak yang
    // diizinkan dipindai: pencarian yang hanya melihat 100 baris teratas akan
    // menjawab "tidak ada" untuk pelanggan yang sebenarnya ada, dan jawaban
    // salah lebih berbahaya daripada tidak ada pencarian sama sekali.
    const mencari = kunci.trim() !== "";
    const snap = await disaring
      .orderBy("createdAt", "desc")
      .limit(mencari ? BATAS_PINDAI : limit)
      .get();

    const semua = snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile);
    const cocok = mencari ? cariPengguna(semua, kunci) : semua;
    const halaman = await denganVerifikasi(cocok.slice(0, limit));

    return Response.json({
      users: halaman,
      /** Ada hasil cocok yang tidak ikut terkirim karena kena batas halaman. */
      lebih: cocok.length > limit,
      /** Batas pindai kena, jadi mungkin ada yang cocok tapi tidak sempat dilihat. */
      terpotong: mencari && snap.size === BATAS_PINDAI,
      /** Berapa dokumen yang benar-benar dilihat, supaya tampilan bisa mengatakannya. */
      dipindai: snap.size,
    });
  } catch (err) {
    return handleAdminError(err);
  }
}
