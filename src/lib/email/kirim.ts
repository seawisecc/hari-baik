import "server-only";

import { Resend } from "resend";
import type { IsiEmail } from "./template";

/**
 * Pengirim email, satu pintu.
 *
 * Alamat pengirimnya `noreply@seawise.id`, bukan subdomain buatan mesin milik
 * Firebase. Itu seluruh alasan berkas ini ada: email dari
 * `hari-baik-7e56c.firebaseapp.com` jatuh ke spam bukan karena gagal
 * autentikasi, melainkan karena domain itu dipakai bersama ribuan project lain
 * dan tidak berhubungan dengan haribaik.seawise.id. Domain sendiri yang
 * di-DKIM membangun reputasinya sendiri.
 *
 * Kuncinya dibaca saat dipanggil, bukan saat modul dimuat, supaya build dan
 * seluruh route lain tetap hidup ketika kuncinya belum dipasang.
 */
/**
 * Alamat pengirim.
 *
 * Harus persis domain yang berstatus Verified di Resend, dan yang terverifikasi
 * adalah subdomain `send.seawise.id`, bukan `seawise.id`. Resend menolak
 * pengiriman dari domain yang tidak terdaftar dengan 403, dan pesannya cuma
 * muncul di log server, bukan di layar siapa pun. Sudah terjadi sekali.
 *
 * Subdomain terpisah untuk pengiriman justru lebih baik: reputasi email
 * transaksional dibangun sendiri, terpisah dari apa pun yang dikirim dari
 * domain utama.
 */
const DARI = "Hari Baik <noreply@send.seawise.id>";

export type HasilKirim =
  | { terkirim: true; id: string | null }
  /** Kunci belum dipasang. Bukan kesalahan, cuma belum siap. */
  | { terkirim: false; alasan: "belum-dikonfigurasi" }
  | { terkirim: false; alasan: "gagal"; pesan: string };

export function emailSiap(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function kirimEmail(ke: string, isi: IsiEmail): Promise<HasilKirim> {
  const kunci = process.env.RESEND_API_KEY;
  if (!kunci) return { terkirim: false, alasan: "belum-dikonfigurasi" };

  try {
    const { data, error } = await new Resend(kunci).emails.send({
      from: DARI,
      to: [ke],
      subject: isi.subjek,
      html: isi.html,
      // Versi teks polos ikut dikirim. Penyaring spam menilai email yang hanya
      // berisi HTML lebih curiga daripada yang membawa keduanya.
      text: isi.teks,
    });

    if (error) {
      console.error("[email] ditolak Resend:", error);
      return { terkirim: false, alasan: "gagal", pesan: error.message };
    }
    return { terkirim: true, id: data?.id ?? null };
  } catch (err) {
    console.error("[email] gagal dikirim:", err);
    return {
      terkirim: false,
      alasan: "gagal",
      pesan: err instanceof Error ? err.message : "Tidak diketahui.",
    };
  }
}
