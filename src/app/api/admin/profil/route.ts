import type { NextRequest } from "next/server";
import { catatJejak } from "@/lib/audit";
import { uripPetemon } from "@/lib/content/petemon";
import { adminDb } from "@/lib/firebase/admin";
import { AdminError, handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import { getSadwara, pancawaraName, saptawaraName, uripHari, wukuName } from "@/lib/wariga";
import type { UserProfile } from "@/types";

const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;
/** Sebelum ini bukan tanggal lahir, melainkan salah ketik. */
const PALING_AWAL = "1900-01-01";

/** Hari ini menurut WITA (UTC+8), zona pemilik dan sebagian besar penggunanya. */
function hariIniWita(): string {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * Perbaiki tanggal lahir seorang pengguna. Hanya admin.
 *
 * Pengguna mengisi tanggal lahirnya sekali di onboarding, dengan layar
 * konfirmasi, lalu field itu terkunci di Firestore Rules. Route ini adalah
 * satu-satunya pintu untuk memperbaikinya kalau ternyata keliru, dan setiap
 * pemakaiannya masuk jejak audit lengkap dengan nilai sebelum dan sesudah.
 *
 * Field wariga turunan dihitung ulang di sini, di server, dari mesin yang
 * sama yang dipakai layar pengguna. Kalau dikirim klien, tanggal dan wetonnya
 * bisa tidak cocok satu sama lain dan tidak ada yang tahu mana yang benar.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const { uid, tanggalLahir } = (await req.json()) as {
      uid?: string;
      tanggalLahir?: string;
    };

    if (!uid || typeof uid !== "string") throw new AdminError(400, "uid wajib diisi.");
    if (!tanggalLahir || !POLA_TANGGAL.test(tanggalLahir)) {
      throw new AdminError(400, "tanggalLahir harus berformat YYYY-MM-DD.");
    }

    // Pola saja tidak cukup: "2026-02-31" lolos regex tapi bukan tanggal.
    const waktu = new Date(`${tanggalLahir}T12:00:00Z`);
    if (Number.isNaN(waktu.getTime()) || waktu.toISOString().slice(0, 10) !== tanggalLahir) {
      throw new AdminError(400, "Tanggal tidak valid.");
    }
    if (tanggalLahir > hariIniWita()) {
      throw new AdminError(400, "Tanggal lahir tidak boleh di masa depan.");
    }
    if (tanggalLahir < PALING_AWAL) {
      throw new AdminError(400, `Tanggal lahir tidak boleh sebelum ${PALING_AWAL}.`);
    }

    const ref = adminDb().collection("users").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) throw new AdminError(404, "Pengguna tidak ditemukan.");
    const sebelum = snap.data() as UserProfile;

    if (sebelum.tanggalLahir === tanggalLahir) {
      return Response.json({ ok: true, tanggalLahir, berubah: false });
    }

    const petemon = uripPetemon(tanggalLahir);
    const turunan = {
      saptaWaraLahir: saptawaraName(tanggalLahir),
      pancaWaraLahir: pancawaraName(tanggalLahir),
      sadWaraLahir: getSadwara(tanggalLahir),
      wukuLahir: wukuName(tanggalLahir),
      uripLahir: uripHari(tanggalLahir),
      uripPetemonLahir: petemon.totalUrip,
    };

    await ref.update({
      tanggalLahir,
      ...turunan,
      lastChangedBy: admin.email ?? admin.uid,
      lastChangedAt: new Date().toISOString(),
    });

    await catatJejak(
      {
        aksi: "lahir",
        aktor: admin.email ?? admin.uid,
        aktorUid: admin.uid,
        sasaran: uid,
        ringkasan: `Tanggal lahir ${sebelum.email ?? uid} diubah dari ${
          sebelum.tanggalLahir ?? "kosong"
        } menjadi ${tanggalLahir}.`,
        detail: { sebelum: sebelum.tanggalLahir ?? null, sesudah: tanggalLahir, ...turunan },
      },
      req,
    );

    return Response.json({ ok: true, tanggalLahir, berubah: true, ...turunan });
  } catch (err) {
    return handleAdminError(err);
  }
}
