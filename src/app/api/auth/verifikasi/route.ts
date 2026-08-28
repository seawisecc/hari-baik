import type { NextRequest } from "next/server";
import { emailVerifikasi } from "@/lib/email/template";
import { emailSiap, kirimEmail } from "@/lib/email/kirim";
import { tautanAksi } from "@/lib/email/tautan";
import { adminAuth } from "@/lib/firebase/admin";

/**
 * Kirim email konfirmasi sendiri, bukan lewat Firebase.
 *
 * Firebase mengirimnya dari `noreply@hari-baik-7e56c.firebaseapp.com`, subdomain
 * buatan mesin yang dipakai bersama ribuan project lain. Emailnya lolos SPF dan
 * DKIM, tapi tetap jatuh ke spam karena domain itu tidak punya reputasi dan
 * tidak berhubungan dengan haribaik.seawise.id. Isinya juga tidak bisa diubah:
 * Console mengunci kolom Message, dan API menolak dengan
 * EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED.
 *
 * `generateEmailVerificationLink()` menghasilkan tautan sah tanpa mengirim
 * apa pun. Tautannya masih menunjuk ke domain Firebase, tapi `oobCode`-nya ikut
 * terbawa, jadi URL-nya dirakit ulang ke `/aksi` di domain sendiri.
 *
 * Kalau kuncinya belum dipasang, route ini menjawab `terkirim: false` dan klien
 * kembali memakai jalur Firebase. Selama masa peralihan itu penting: yang
 * mendaftar tetap harus menerima emailnya, walaupun dari alamat yang lama.
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

    if (!emailSiap()) {
      return Response.json({ terkirim: false, alasan: "belum-dikonfigurasi" });
    }

    const akun = await adminAuth().getUser(decoded.uid);
    if (!akun.email) {
      return Response.json({ error: "Akun ini tidak punya alamat email." }, { status: 400 });
    }
    if (akun.emailVerified) {
      // Bukan kesalahan. Tombol kirim ulang bisa saja ditekan setelah
      // verifikasinya selesai di perangkat lain.
      return Response.json({ terkirim: false, alasan: "sudah-terverifikasi" });
    }

    const dariFirebase = await adminAuth().generateEmailVerificationLink(akun.email);
    const asal = new URL(req.url).origin;
    const tautan = tautanAksi(dariFirebase, asal);
    if (!tautan) {
      console.error("[verifikasi] tautan Firebase tidak bisa dibaca:", dariFirebase);
      return Response.json({ terkirim: false, alasan: "gagal" }, { status: 500 });
    }

    const hasil = await kirimEmail(akun.email, emailVerifikasi({ tautan, email: akun.email }));
    if (!hasil.terkirim) {
      return Response.json({ terkirim: false, alasan: hasil.alasan }, { status: 502 });
    }

    return Response.json({ terkirim: true });
  } catch (err) {
    console.error("[verifikasi]", err);
    return Response.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
  }
}
