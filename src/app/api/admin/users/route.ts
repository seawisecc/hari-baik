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

    let query = adminDb().collection("users").orderBy("createdAt", "desc").limit(limit);
    if (status) query = query.where("subscriptionStatus", "==", status) as typeof query;

    const snap = await query.get();
    const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile);

    return Response.json({ users });
  } catch (err) {
    return handleAdminError(err);
  }
}
