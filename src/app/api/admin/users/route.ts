import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import type { UserProfile } from "@/types";

/** Daftar pengguna untuk panel admin. */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const status = req.nextUrl.searchParams.get("status");
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 100), 500);

    // Filter dulu, baru urutkan dan batasi, mengikuti urutan yang dipakai
    // Firestore saat menyusun query. Kombinasi where + orderBy pada field
    // berbeda butuh composite index (lihat firestore.indexes.json).
    const dasar = adminDb().collection("users");
    const query = (status ? dasar.where("subscriptionStatus", "==", status) : dasar)
      .orderBy("createdAt", "desc")
      .limit(limit);

    const snap = await query.get();
    const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile);

    return Response.json({ users });
  } catch (err) {
    return handleAdminError(err);
  }
}
