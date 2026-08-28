import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { trialEnd } from "@/lib/subscription";
import type { UserProfile } from "@/types";

/**
 * Buat dokumen profil untuk pengguna yang baru mendaftar.
 *
 * Dijalankan di server, bukan di klien, karena `trialEndsAt` menentukan
 * berapa lama seseorang memakai aplikasi tanpa membayar. Kalau klien yang
 * menulisnya, siapa pun yang membuka devtools bisa memberi dirinya trial
 * bertahun-tahun. Firestore Rules melarang klien membuat dokumen di
 * `users/`; hanya route ini yang boleh.
 *
 * Idempoten: dipanggil lagi untuk pengguna yang sudah punya profil tidak
 * mengubah apa pun, jadi aman dipanggil setiap login sebagai jaring pengaman
 * bila pendaftaran sempat terputus di tengah.
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

    const ref = adminDb().collection("users").doc(decoded.uid);
    const snap = await ref.get();

    if (snap.exists) {
      return Response.json({ ok: true, created: false });
    }

    const baru: Omit<UserProfile, "uid"> = {
      email: decoded.email ?? "",
      // Yang masuk lewat Google membawa namanya sendiri dari sana, jadi kolom
      // nama di onboarding sudah terisi dan tinggal dibenarkan kalau perlu.
      // Dipotong 120 huruf mengikuti batas yang sama yang dipakai Rules, supaya
      // dokumen buatan server tidak pernah melebihi bentuk yang boleh disunting
      // pemiliknya sendiri nanti.
      nama: (decoded.name ?? "").slice(0, 120),
      tanggalLahir: null,
      phoneNumber: null,
      role: "user",
      subscriptionStatus: "trial",
      subscriptionExpiresAt: null,
      // Jam trial mulai dari pembuatan akun, bukan dari selesainya onboarding,
      // supaya tidak bisa ditunda dengan menunda pengisian profil.
      trialEndsAt: trialEnd(),
      addOn: [],
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
      saptaWaraLahir: null,
      pancaWaraLahir: null,
      sadWaraLahir: null,
      wukuLahir: null,
      uripLahir: null,
      uripPetemonLahir: null,
    };

    await ref.set(baru);
    return Response.json({ ok: true, created: true });
  } catch (err) {
    console.error("[bootstrap]", err);
    return Response.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
