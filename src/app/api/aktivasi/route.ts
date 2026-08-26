import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { bacaHarga } from "@/lib/harga-server";
import type { Aktivasi, UserProfile } from "@/types";

const CATATAN_MAKS = 400;

/**
 * Ajukan permintaan aktivasi setelah membayar.
 *
 * Harga dan nama paket diambil dari server, bukan dari yang dikirim klien:
 * klien hanya menyebut id paket. Kalau harganya ikut dikirim, siapa pun bisa
 * mengajukan paket tiga tahun seharga seribu rupiah.
 */
export async function POST(req: NextRequest) {
  try {
    const header = req.headers.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return Response.json({ error: "Token tidak ada." }, { status: 401 });

    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(token);
    } catch {
      return Response.json({ error: "Token tidak valid." }, { status: 401 });
    }

    const body = (await req.json()) as {
      paketId?: string;
      addOnIds?: string[];
      catatan?: string;
    };

    const harga = await bacaHarga();
    const paket = harga.paket.find((p) => p.id === body.paketId && p.aktif);
    if (!paket) {
      return Response.json({ error: "Paket tidak ditemukan." }, { status: 400 });
    }

    const idAddOn = Array.isArray(body.addOnIds) ? body.addOnIds : [];
    const addOn = harga.addOn
      .filter((a) => a.aktif && idAddOn.includes(a.id))
      .map((a) => ({ id: a.id, nama: a.nama.id, harga: a.harga }));

    const db = adminDb();

    // Satu permintaan terbuka per pengguna. Tanpa ini, tombol yang diklik
    // berkali-kali membuat antrean admin penuh permintaan kembar.
    const terbuka = await db
      .collection("aktivasi")
      .where("uid", "==", decoded.uid)
      .where("status", "==", "menunggu")
      .limit(1)
      .get();
    if (!terbuka.empty) {
      return Response.json(
        { error: "Permintaanmu sebelumnya masih menunggu diproses admin.", sudahAda: true },
        { status: 409 },
      );
    }

    const userRef = db.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return Response.json({ error: "Profil tidak ditemukan." }, { status: 404 });
    }
    const user = userSnap.data() as UserProfile;

    const total = paket.harga + addOn.reduce((n, a) => n + a.harga, 0);
    const catatan = (body.catatan ?? "").trim().slice(0, CATATAN_MAKS) || null;

    const doc: Omit<Aktivasi, "id"> = {
      uid: decoded.uid,
      email: user.email ?? decoded.email ?? "",
      nama: user.nama ?? "",
      phoneNumber: user.phoneNumber ?? null,
      paketId: paket.id,
      paketNama: paket.nama.id,
      paketTahun: paket.tahun,
      harga: paket.harga,
      addOn,
      total,
      catatan,
      status: "menunggu",
      createdAt: new Date().toISOString(),
      diputuskanPada: null,
      diputuskanOleh: null,
      alasanTolak: null,
    };

    const ref = await db.collection("aktivasi").add(doc);

    // Status pengguna ikut berubah supaya muncul di filter Menunggu admin,
    // tanpa memberi akses apa pun sebelum disetujui.
    await userRef.update({ subscriptionStatus: "pending" });

    return Response.json({ ok: true, id: ref.id, total });
  } catch (err) {
    console.error("[aktivasi]", err);
    return Response.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
