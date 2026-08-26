/** Rute yang boleh diakses tanpa melewati pemeriksaan apa pun. */
export const RUTE_PUBLIK = new Set(["/", "/login", "/register", "/lupa-sandi"]);

/**
 * Rute yang menjadi TUJUAN salah satu pemeriksaan. Halaman ini harus bisa
 * dibuka justru ketika pemeriksaannya gagal, kalau tidak akan terjadi
 * lingkaran pengalihan tanpa akhir.
 */
export const RUTE_TUJUAN = new Set(["/verify-email", "/onboarding", "/expired"]);

export interface KondisiAkses {
  pathname: string;
  configured: boolean;
  loading: boolean;
  signedIn: boolean;
  emailVerified: boolean;
  /** null bila profil belum termuat. */
  onboardingComplete: boolean | null;
  canView: boolean;
  isAdmin: boolean;
}

/**
 * Ke mana pengguna harus dialihkan, atau null bila boleh tinggal.
 *
 * Fungsi murni supaya keputusannya bisa diuji tanpa merender apa pun.
 * Urutannya dari syarat paling dasar ke paling spesifik: masuk dulu,
 * verifikasi email, lengkapi profil, baru status langganan.
 */
export function tentukanAlihan(k: KondisiAkses): string | null {
  if (!k.configured) return null;
  if (k.loading) return null;
  if (RUTE_PUBLIK.has(k.pathname)) return null;

  let tujuan: string | null = null;

  if (!k.signedIn) tujuan = "/login";
  else if (!k.emailVerified) tujuan = "/verify-email";
  else if (k.onboardingComplete === false) tujuan = "/onboarding";
  // Admin tetap boleh masuk meski langganannya sendiri habis, karena dialah
  // yang harus mengaktifkan kembali langganan orang lain.
  else if (k.onboardingComplete === true && !k.canView && !k.isAdmin) tujuan = "/expired";

  // Sudah berada di tujuan berarti tidak perlu ke mana-mana.
  return tujuan === k.pathname ? null : tujuan;
}
