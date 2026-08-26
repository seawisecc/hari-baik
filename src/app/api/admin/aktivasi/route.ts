import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { AdminError, handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import { extendYears } from "@/lib/subscription";
import type { Aktivasi } from "@/types";

const ALASAN_MAKS = 300;

/** Daftar permintaan aktivasi, terbaru dulu. */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const status = req.nextUrl.searchParams.get("status") ?? "menunggu";

    // Diurutkan di memori, bukan lewat orderBy, supaya tidak butuh composite
    // index tambahan untuk koleksi yang jumlahnya kecil.
    const snap = await adminDb()
      .collection("aktivasi")
      .where("status", "==", status)
      .limit(200)
      .get();

    const daftar = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Aktivasi)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return Response.json({ aktivasi: daftar });
  } catch (err) {
    return handleAdminError(err);
  }
}

/**
 * Setujui atau tolak satu permintaan.
 *
 * Menyetujui sekaligus memperpanjang langganan sesuai lama paket yang
 * diminta, jadi admin tidak perlu mengingat dan mengisinya dua kali.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const { id, aksi, alasan } = (await req.json()) as {
      id?: string;
      aksi?: "setujui" | "tolak";
      alasan?: string;
    };

    if (!id) throw new AdminError(400, "id wajib diisi.");
    if (aksi !== "setujui" && aksi !== "tolak") {
      throw new AdminError(400, "aksi harus setujui atau tolak.");
    }

    const db = adminDb();
    const ref = db.collection("aktivasi").doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new AdminError(404, "Permintaan tidak ditemukan.");

    const permintaan = snap.data() as Aktivasi;
    if (permintaan.status !== "menunggu") {
      throw new AdminError(409, "Permintaan ini sudah diputuskan sebelumnya.");
    }

    const now = new Date();
    const jejak = {
      diputuskanPada: now.toISOString(),
      diputuskanOleh: admin.email ?? admin.uid,
    };

    const userRef = db.collection("users").doc(permintaan.uid);

    if (aksi === "tolak") {
      await ref.update({
        ...jejak,
        status: "ditolak",
        alasanTolak: (alasan ?? "").trim().slice(0, ALASAN_MAKS) || null,
      });
      // Dikembalikan ke expired, bukan dibiarkan pending: pending menandakan
      // ada yang sedang ditunggu, dan tidak ada lagi yang ditunggu.
      await userRef.update({ subscriptionStatus: "expired" });
      return Response.json({ ok: true, status: "ditolak" });
    }

    const userSnap = await userRef.get();
    if (!userSnap.exists) throw new AdminError(404, "Pengguna tidak ditemukan.");
    const current = userSnap.data() as {
      subscriptionExpiresAt?: string | null;
      addOn?: string[];
    };

    const expiresAt = extendYears(
      current.subscriptionExpiresAt ?? null,
      permintaan.paketTahun,
      now,
    );

    // Add-on ditumpuk, bukan ditimpa: pengguna yang membeli tambahan di
    // perpanjangan berikutnya tidak boleh kehilangan yang sudah dibayarnya.
    const addOnDimiliki = [
      ...new Set([...(current.addOn ?? []), ...permintaan.addOn.map((a) => a.id)]),
    ];

    await userRef.update({
      subscriptionStatus: "active",
      subscriptionExpiresAt: expiresAt,
      addOn: addOnDimiliki,
      lastChangedBy: admin.email ?? admin.uid,
      lastChangedAt: now.toISOString(),
    });
    await ref.update({ ...jejak, status: "disetujui", alasanTolak: null });

    return Response.json({ ok: true, status: "disetujui", expiresAt });
  } catch (err) {
    return handleAdminError(err);
  }
}
