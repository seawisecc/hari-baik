import type { NextRequest } from "next/server";
import { alasanTolak, emailCocok, type DapatDihapus } from "@/lib/admin-hapus";
import { catatJejak } from "@/lib/audit";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { AdminError, handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";

const PESAN_TOLAK: Record<string, string> = {
  admin: "Akun admin tidak bisa dihapus. Cabut hak adminnya lebih dulu.",
  menunggu:
    "Permintaan aktivasinya masih menunggu diproses. Setujui atau tolak dulu, baru hapus.",
  aktif: "Aksesnya masih berjalan. Nonaktifkan dulu, baru bisa dihapus.",
};

/**
 * Hapus seorang pengguna: akun Firebase Auth dan dokumen profilnya sekaligus.
 *
 * Menghapus dokumen Firestore saja tidak menghapus siapa pun. Akun Auth-nya
 * tetap hidup, dan begitu orang itu masuk lagi, /api/auth/bootstrap membuatkan
 * profil baru lengkap dengan masa trial yang segar. Tombol "hapus" yang
 * setengah begitu bukan sekadar tidak berguna, ia jadi tombol reset trial
 * gratis yang bisa dipakai berulang-ulang.
 *
 * Urutannya Auth dulu, baru Firestore. Kalau penghapusan Auth gagal karena
 * sesuatu, dokumennya masih utuh dan keadaannya tetap konsisten. Kebalikannya
 * meninggalkan akun yang bisa masuk tanpa profil, yaitu keadaan yang justru
 * memicu pembuatan trial baru itu.
 *
 * Salinan penuh dokumennya ikut ke jejak audit sebelum dihapus. Jejak sudah
 * bersifat tambah-saja dan hanya bisa dibaca admin, jadi tidak perlu ada
 * gudang arsip baru: satu baris jejak sudah cukup untuk menyusun ulang akun
 * yang terhapus karena salah pencet, termasuk tanggal lahirnya, yang seluruh
 * perhitungan aplikasi ini bergantung padanya.
 *
 * Dokumen permintaan aktivasi miliknya sengaja TIDAK ikut dihapus. Itu catatan
 * siapa membayar berapa dan kapan; menghapusnya berarti angka penjualan bulan
 * yang sudah lewat ikut berubah setiap kali ada akun lama dibersihkan. Yang
 * masih berstatus menunggu tidak akan tertinggal, karena pengguna dengan
 * permintaan terbuka memang ditolak untuk dihapus.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const { uid, email } = (await req.json()) as { uid?: string; email?: string };

    if (!uid) throw new AdminError(400, "uid wajib diisi.");
    if (typeof email !== "string" || !email.trim()) {
      throw new AdminError(400, "Ketik email pengguna sebagai konfirmasi.");
    }

    // Menghapus diri sendiri diperiksa sebelum apa pun. Field role di dokumen
    // bukan sumber kebenaran hak admin (custom claim yang benar), jadi seorang
    // admin yang dokumennya masih bertuliskan "user" akan lolos pemeriksaan
    // peran di bawah dan menghapus akunnya sendiri di tengah pekerjaan.
    if (uid === admin.uid) {
      throw new AdminError(400, "Tidak bisa menghapus akunmu sendiri.");
    }

    const ref = adminDb().collection("users").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) throw new AdminError(404, "Pengguna tidak ditemukan.");

    const profil = snap.data() as Record<string, unknown>;

    if (!emailCocok(email, String(profil.email ?? ""))) {
      throw new AdminError(400, "Email konfirmasi tidak cocok dengan pengguna ini.");
    }

    /*
     * Status verifikasi harus ikut ditanyakan sebelum memutuskan.
     *
     * Yang emailnya belum terbukti tidak pernah bisa masuk walau trialnya
     * secara hitungan masih berjalan, dan akun seperti itulah yang paling
     * banyak menumpuk: mendaftar, lalu berhenti di layar verifikasi.
     *
     * Akun Auth yang sudah tidak ada diperlakukan sama, yaitu tidak bisa
     * masuk. Yang tersisa dari akun seperti itu memang cuma dokumen yatim.
     */
    let akun;
    try {
      akun = await adminAuth().getUser(uid);
    } catch (err) {
      if ((err as { code?: string }).code !== "auth/user-not-found") throw err;
    }

    const tolak = alasanTolak({
      ...(profil as unknown as DapatDihapus),
      emailTerverifikasi: akun ? akun.emailVerified : false,
    });
    if (tolak) throw new AdminError(409, PESAN_TOLAK[tolak]);

    let authTerhapus = false;
    if (akun) {
      await adminAuth().deleteUser(uid);
      authTerhapus = true;
    }

    await ref.delete();

    await catatJejak(
      {
        aksi: "hapus",
        aktor: admin.email ?? admin.uid,
        aktorUid: admin.uid,
        sasaran: uid,
        ringkasan: `Akun ${profil.email ?? uid} dihapus (status ${profil.subscriptionStatus ?? "?"}).`,
        detail: {
          authTerhapus,
          // Salinan utuh, bukan ringkasan. Yang tidak disalin di sini tidak
          // akan ada lagi di mana pun.
          profil,
        },
      },
      req,
    );

    return Response.json({ ok: true, uid, authTerhapus });
  } catch (err) {
    return handleAdminError(err);
  }
}
