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

export function pesanAuth(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  return PESAN[code] ?? "Terjadi kesalahan. Coba lagi.";
}
