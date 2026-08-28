/** Ubah kode error Firebase Auth jadi kalimat yang bisa ditindaklanjuti pengguna. */
const PESAN: Record<string, string> = {
  "auth/invalid-email": "Format email tidak valid.",
  "auth/user-disabled": "Akun ini dinonaktifkan. Hubungi admin.",
  "auth/user-not-found": "Email atau kata sandi salah.",
  "auth/wrong-password": "Email atau kata sandi salah.",
  "auth/invalid-credential": "Email atau kata sandi salah.",
  "auth/email-already-in-use": "Email ini sudah terdaftar. Coba masuk.",
  "auth/weak-password": "Kata sandi minimal 6 karakter.",
  "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  "auth/network-request-failed": "Koneksi bermasalah. Periksa jaringanmu.",
  "auth/operation-not-allowed": "Metode masuk ini belum diaktifkan di Firebase Console.",

  // Masuk dengan Google.
  //
  // account-exists-with-different-credential muncul ketika email yang sama
  // sudah dipakai mendaftar dengan kata sandi. Firebase tidak menggabungkan
  // keduanya sendiri, dan pesan bawaannya tidak memberi tahu jalan keluarnya,
  // jadi orangnya akan menekan tombol yang sama berulang kali.
  "auth/account-exists-with-different-credential":
    "Email ini sudah terdaftar dengan kata sandi. Masuk dengan kata sandi dulu.",
  "auth/popup-blocked": "Peramban memblokir jendela Google. Izinkan popup lalu coba lagi.",
  // Safari memisahkan penyimpanan milik domain pihak ketiga, dan alur popup
  // Firebase menaruh keadaan awalnya di sessionStorage domain authDomain.
  // Kalau pemisahan itu memutusnya, inilah kode yang keluar.
  "auth/missing-initial-state":
    "Peramban memblokir penyimpanan yang dibutuhkan Google. Matikan mode penyamaran atau pemblokiran cookie lintas situs, lalu coba lagi.",
  "auth/web-storage-unsupported":
    "Peramban ini memblokir penyimpanan lokal, yang dibutuhkan untuk masuk.",
  "auth/timeout": "Terlalu lama menunggu jawaban. Coba lagi.",
  "auth/user-cancelled": "Izin ke Google dibatalkan.",
  "auth/internal-error": "Google menolak permintaannya. Coba lagi sebentar lagi.",
  // Bukan kode Firebase, melainkan kode kita sendiri: alur redirect kembali
  // tanpa membawa siapa pun. Firebase tidak melempar apa pun untuk keadaan
  // ini, ia hanya mengembalikan null.
  "auth/redirect-tanpa-hasil":
    "Masuk lewat Google tidak selesai. Kalau peramban ini memblokir cookie lintas situs, coba pakai email dan kata sandi.",
  "auth/popup-closed-by-user": "Jendela Google ditutup sebelum selesai.",
  "auth/cancelled-popup-request": "Jendela Google ditutup sebelum selesai.",
  "auth/unauthorized-domain": "Domain ini belum diizinkan di Firebase Console.",

  // Tautan dari email. Ketiganya berarti hal yang sama bagi yang membukanya:
  // tautannya tidak berlaku lagi, dan yang perlu dia tahu adalah cara
  // mendapatkan yang baru, bukan istilah teknisnya.
  "auth/expired-action-code":
    "Tautannya sudah kedaluwarsa. Minta email baru lalu buka yang terbaru.",
  "auth/invalid-action-code":
    "Tautannya tidak berlaku. Biasanya karena sudah pernah dipakai, atau ada email yang lebih baru.",
  "auth/missing-action-code": "Tautannya tidak lengkap. Buka lagi langsung dari emailnya.",
};

/**
 * Keterangan mentah yang dibawa error, kalau ada.
 *
 * `auth/internal-error` adalah pembungkus, bukan sebab. Sebab sesungguhnya
 * datang dari server dan diselipkan Firebase ke `customData.message` sebagai
 * untaian JSON, misalnya `{"error":{"message":"..."}}`. Tanpa dibongkar, semua
 * kegagalan yang berbeda-beda terlihat sama persis di layar, dan penyebabnya
 * hanya bisa ditebak.
 */
export function detailAuth(err: unknown): string | null {
  const mentah = (err as { customData?: { message?: unknown } })?.customData?.message;
  if (typeof mentah !== "string" || mentah === "") return null;

  // Kalau isinya JSON, ambil kalimatnya saja. Kalau bukan, pakai apa adanya.
  try {
    const isi = JSON.parse(mentah) as { error?: { message?: string } };
    return isi.error?.message ?? mentah;
  } catch {
    return mentah;
  }
}

/**
 * Kalimat untuk pengguna, ditambah keterangan yang bisa ditindaklanjuti.
 *
 * Sebelumnya setiap kode yang tidak terdaftar berubah jadi "Terjadi kesalahan.
 * Coba lagi." Itu terbaca sopan tapi menelan satu-satunya keterangan yang
 * berguna: yang melihatnya tidak bisa berbuat apa-apa, dan yang dilapori tidak
 * bisa mencari apa-apa.
 *
 * Errornya SELALU dicatat utuh ke console, bukan hanya ketika kodenya belum
 * dikenal. Itu kesalahan yang sudah terjadi sekali: `auth/internal-error`
 * punya kalimatnya sendiri, jadi ia lolos dari pencatatan, dan yang tersisa
 * cuma kalimat sopan tanpa satu pun petunjuk tentang sebab di baliknya.
 */
export function pesanAuth(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";

  console.error("[auth]", code || "(tanpa kode)", err);

  const detail = detailAuth(err);
  const kalimat = PESAN[code];

  if (kalimat) return detail ? `${kalimat} (${detail})` : kalimat;
  return code ? `Terjadi kesalahan. Coba lagi. (${code})` : "Terjadi kesalahan. Coba lagi.";
}
