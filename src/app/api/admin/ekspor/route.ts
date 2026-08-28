import type { NextRequest } from "next/server";
import { cariPengguna } from "@/lib/admin-cari";
import { csvPengguna, namaBerkas } from "@/lib/admin-ekspor";
import { catatJejak } from "@/lib/audit";
import { adminDb } from "@/lib/firebase/admin";
import { handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import { denganVerifikasi } from "@/lib/status-verifikasi";
import type { UserProfile } from "@/types";

/**
 * Batas jumlah baris satu berkas ekspor.
 *
 * Lebih longgar daripada batas pencarian karena ekspor dilakukan sesekali,
 * bukan setiap ketikan. Kalau batas ini kena, berkasnya tetap dikirim tapi
 * header X-Terpotong menandainya, dan tampilan mengatakannya ke admin. Berkas
 * yang diam-diam kurang satu baris lebih berbahaya daripada berkas yang jujur
 * mengaku terpotong.
 */
const BATAS = 5000;

/**
 * Unduh daftar pengguna sebagai CSV.
 *
 * Mengikuti filter status dan kata kunci yang sedang aktif di layar, jadi yang
 * terekspor adalah yang terlihat. Menyediakan tombol "ekspor semua" yang
 * berbeda dari yang tampil hanya menambah satu cara lagi untuk salah paham
 * tentang isi berkasnya; untuk mengekspor semuanya, pilih filter "Semua".
 *
 * Route ini tidak mengubah apa pun, tapi tetap menulis jejak audit. Sekali
 * ditekan, seluruh daftar pelanggan berikut nomor HP dan tanggal lahirnya
 * keluar dari sistem dan menjadi berkas di komputer seseorang. Justru itu
 * yang paling ingin bisa ditelusuri kalau suatu hari ada yang bocor.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);

    const status = req.nextUrl.searchParams.get("status");
    const kunci = req.nextUrl.searchParams.get("q") ?? "";
    const belumVerifikasi = req.nextUrl.searchParams.get("verifikasi") === "belum";

    const dasar = adminDb().collection("users");
    const snap = await (status ? dasar.where("subscriptionStatus", "==", status) : dasar)
      .orderBy("createdAt", "desc")
      .limit(BATAS)
      .get();

    const semua = snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile);
    const dicari = kunci.trim() ? cariPengguna(semua, kunci) : semua;
    const lengkap = await denganVerifikasi(dicari);
    const users = belumVerifikasi
      ? lengkap.filter((u) => u.emailTerverifikasi === false)
      : lengkap;
    const terpotong = snap.size === BATAS;

    const sekarang = new Date();
    const berkas = namaBerkas(status, kunci, sekarang, belumVerifikasi);

    await catatJejak(
      {
        aksi: "ekspor",
        aktor: admin.email ?? admin.uid,
        aktorUid: admin.uid,
        sasaran: null,
        ringkasan: `Mengekspor ${users.length} pengguna ke ${berkas}.`,
        detail: {
          status: status ?? "semua",
          kunci: kunci.trim() || null,
          belumVerifikasi,
          jumlah: users.length,
          terpotong,
        },
      },
      req,
    );

    return new Response(csvPengguna(users), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${berkas}"`,
        // Daftar pelanggan tidak boleh mengendap di cache mana pun.
        "Cache-Control": "no-store",
        "X-Jumlah": String(users.length),
        "X-Terpotong": terpotong ? "1" : "0",
      },
    });
  } catch (err) {
    return handleAdminError(err);
  }
}
