import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { handleAdminError, requireAdmin, AdminError } from "@/lib/firebase/requireAdmin";
import { extendOneYear } from "@/lib/subscription";
import type { SubscriptionStatus } from "@/types";

type Action = "approve" | "extend" | "deactivate";
const ACTIONS: Action[] = ["approve", "extend", "deactivate"];

/**
 * Ubah status langganan seorang pengguna.
 *
 * approve/extend sama-sama menambah setahun; bedanya approve dipakai untuk
 * permintaan yang masih `pending`. Keduanya menumpuk dari tanggal habis kalau
 * langganan masih aktif, supaya sisa masa berlaku tidak hangus.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);

    const body = (await req.json()) as { uid?: string; action?: Action };
    const { uid, action } = body;

    if (!uid) throw new AdminError(400, "uid wajib diisi.");
    if (!action || !ACTIONS.includes(action)) {
      throw new AdminError(400, `action harus salah satu dari: ${ACTIONS.join(", ")}.`);
    }

    const ref = adminDb().collection("users").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) throw new AdminError(404, "Pengguna tidak ditemukan.");

    const current = snap.data() as { subscriptionExpiresAt?: string | null };
    const now = new Date();

    let update: {
      subscriptionStatus: SubscriptionStatus;
      subscriptionExpiresAt: string | null;
    };

    if (action === "deactivate") {
      update = { subscriptionStatus: "expired", subscriptionExpiresAt: null };
    } else {
      update = {
        subscriptionStatus: "active",
        subscriptionExpiresAt: extendOneYear(current.subscriptionExpiresAt ?? null, now),
      };
    }

    await ref.update({
      ...update,
      lastChangedBy: admin.email ?? admin.uid,
      lastChangedAt: now.toISOString(),
    });

    return Response.json({ ok: true, uid, ...update });
  } catch (err) {
    return handleAdminError(err);
  }
}
