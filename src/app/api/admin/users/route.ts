import type { NextRequest } from "next/server";
import { cariPengguna } from "@/lib/admin-cari";
import { adminDb } from "@/lib/firebase/admin";
import { handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import { denganVerifikasi } from "@/lib/status-verifikasi";
import type { UserProfile } from "@/types";

/**
 * Berapa banyak dokumen yang boleh dipindai saat mencari atau menyaring yang
 * belum terverifikasi.
 *
 * Keduanya tidak bisa dikerjakan Firestore. Pencarian substring bukan
 * pekerjaannya, dan status verifikasi bahkan tidak ada di sana: ia milik
 * Firebase Auth. Jadi dokumennya dibaca lalu disaring di sini, dan satu
 * permintaan berarti sebanyak ini pembacaan. Batasnya ditaruh di angka yang
 * masih jauh di atas jumlah pelanggan sekarang tapi tidak membiarkan biayanya
 * tumbuh diam-diam kalau suatu hari daftarnya jadi puluhan ribu. Kalau batas
 * ini kena, jawabannya menyebutkan itu, bukan berpura-pura sudah lengkap.
 */
const BATAS_PINDAI = 1000;

/** Daftar pengguna untuk panel admin. */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const status = req.nextUrl.searchParams.get("status");
    const kunci = req.nextUrl.searchParams.get("q") ?? "";
    const belumVerifikasi = req.nextUrl.searchParams.get("verifikasi") === "belum";
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 100), 500);

    // Filter dulu, baru urutkan dan batasi, mengikuti urutan yang dipakai
    // Firestore saat menyusun query. Kombinasi where + orderBy pada field
    // berbeda butuh composite index (lihat firestore.indexes.json).
    const dasar = adminDb().collection("users");
    const disaring = status ? dasar.where("subscriptionStatus", "==", status) : dasar;

    // Saat menyaring di memori, yang diambil bukan sehalaman melainkan
    // sebanyak yang diizinkan dipindai: penyaringan yang hanya melihat 100
    // baris teratas akan menjawab "tidak ada" untuk pengguna yang sebenarnya
    // ada, dan jawaban salah lebih berbahaya daripada tidak ada fiturnya.
    const memindai = kunci.trim() !== "" || belumVerifikasi;
    const snap = await disaring
      .orderBy("createdAt", "desc")
      .limit(memindai ? BATAS_PINDAI : limit)
      .get();

    const semua = snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile);
    const dicari = kunci.trim() ? cariPengguna(semua, kunci) : semua;

    // Saat menyaring yang belum terverifikasi, statusnya harus ditanyakan
    // untuk semua calon lebih dulu, bukan hanya untuk sehalaman yang akan
    // dikirim. Itu sebabnya penyaringan ini lebih mahal daripada yang lain,
    // dan itu wajar: ia dipakai sesekali untuk membersihkan, bukan tiap hari.
    const lengkap = await denganVerifikasi(belumVerifikasi ? dicari : dicari.slice(0, limit));
    const cocok = belumVerifikasi
      ? lengkap.filter((u) => u.emailTerverifikasi === false)
      : lengkap;

    return Response.json({
      users: cocok.slice(0, limit),
      /** Ada hasil cocok yang tidak ikut terkirim karena kena batas halaman. */
      lebih: cocok.length > limit,
      /** Batas pindai kena, jadi mungkin ada yang cocok tapi tidak sempat dilihat. */
      terpotong: memindai && snap.size === BATAS_PINDAI,
      /** Berapa dokumen yang benar-benar dilihat, supaya tampilan bisa mengatakannya. */
      dipindai: snap.size,
    });
  } catch (err) {
    return handleAdminError(err);
  }
}
