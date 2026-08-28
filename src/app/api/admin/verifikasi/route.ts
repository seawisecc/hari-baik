import type { NextRequest } from "next/server";
import { catatJejak } from "@/lib/audit";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { AdminError, handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";

/**
 * Tandai email seorang pengguna sebagai terverifikasi.
 *
 * Jalan keluar untuk satu keadaan yang pasti terjadi selama email verifikasi
 * masih dikirim Firebase dari domain bersamanya: emailnya tidak pernah sampai.
 * Orangnya sudah membayar, sudah menunggu, dan tidak bisa lewat karena
 * tentukanAlihan() menahannya di /verify-email. Sebelum ada route ini,
 * satu-satunya jalan adalah menjalankan skrip Admin SDK dari laptop, karena
 * konsol Firebase pun tidak menyediakan tombolnya.
 *
 * Yang diubah cuma keadaan di Firebase Auth, tidak ada apa pun yang disalin
 * ke dokumen Firestore. Verifikasi email adalah milik Auth, dan menyimpan
 * salinannya di tempat kedua berarti membuat nilai yang pasti akan basi.
 *
 * Bukan aksi yang bebas dampak: sesudah ini, siapa pun yang memegang kata
 * sandi akun itu bisa masuk tanpa pernah membuktikan alamat emailnya. Karena
 * itu ia dicatat ke jejak audit berikut alamat yang diloloskan, dan hanya
 * dipakai setelah kamu benar-benar tahu orangnya siapa.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const { uid } = (await req.json()) as { uid?: string };
    if (!uid) throw new AdminError(400, "uid wajib diisi.");

    const snap = await adminDb().collection("users").doc(uid).get();
    if (!snap.exists) throw new AdminError(404, "Pengguna tidak ditemukan.");

    let akun;
    try {
      akun = await adminAuth().getUser(uid);
    } catch {
      throw new AdminError(404, "Akun Firebase Auth-nya tidak ada lagi.");
    }

    if (akun.emailVerified) {
      // Bukan kesalahan, dan tidak perlu jejak: tidak ada yang berubah.
      return Response.json({ ok: true, sudah: true });
    }

    await adminAuth().updateUser(uid, { emailVerified: true });

    // Token yang sedang dipegang masih membawa emailVerified lama, dan
    // tentukanAlihan() membacanya dari token itu. Tanpa pencabutan, orangnya
    // tetap tertahan di /verify-email sampai tokennya kedaluwarsa sendiri.
    await adminAuth().revokeRefreshTokens(uid);

    await catatJejak(
      {
        aksi: "verifikasi",
        aktor: admin.email ?? admin.uid,
        aktorUid: admin.uid,
        sasaran: uid,
        ringkasan: `Email ${akun.email ?? uid} ditandai terverifikasi secara manual.`,
        detail: { email: akun.email ?? null },
      },
      req,
    );

    return Response.json({ ok: true, sudah: false });
  } catch (err) {
    return handleAdminError(err);
  }
}
