import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { AdminError, handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";

/**
 * Beri atau cabut hak admin.
 *
 * Custom claim baru terbaca oleh klien setelah token di-refresh, jadi kita
 * juga mencabut refresh token target: dia akan dapat token baru berisi claim
 * yang benar pada permintaan berikutnya.
 */
export async function POST(req: NextRequest) {
  try {
    const caller = await requireAdmin(req);

    const { uid, admin } = (await req.json()) as { uid?: string; admin?: boolean };
    if (!uid) throw new AdminError(400, "uid wajib diisi.");
    if (typeof admin !== "boolean") throw new AdminError(400, "admin harus true/false.");

    // Cegah admin terakhir mencabut haknya sendiri dan mengunci semua orang.
    if (uid === caller.uid && admin === false) {
      throw new AdminError(400, "Tidak bisa mencabut hak adminmu sendiri.");
    }

    await adminAuth().setCustomUserClaims(uid, admin ? { admin: true } : {});
    await adminAuth().revokeRefreshTokens(uid);
    await adminDb()
      .collection("users")
      .doc(uid)
      .update({ role: admin ? "admin" : "user" });

    return Response.json({ ok: true, uid, admin });
  } catch (err) {
    return handleAdminError(err);
  }
}
