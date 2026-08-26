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
  "auth/operation-not-allowed": "Metode email/password belum diaktifkan di Firebase Console.",
};

export function pesanAuth(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  return PESAN[code] ?? "Terjadi kesalahan. Coba lagi.";
}
