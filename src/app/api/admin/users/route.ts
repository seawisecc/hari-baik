import type { NextRequest } from "next/server";
import { cariPengguna } from "@/lib/admin-cari";
import { adminDb } from "@/lib/firebase/admin";
import { handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import type { UserProfile } from "@/types";

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

    return Response.json({
      users: cocok.slice(0, limit),
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
