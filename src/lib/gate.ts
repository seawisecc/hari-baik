/** Rute yang boleh diakses tanpa melewati pemeriksaan apa pun. */
export const RUTE_PUBLIK = new Set(["/", "/login", "/register", "/lupa-sandi"]);

/**
 * Rute yang menjadi TUJUAN salah satu pemeriksaan. Halaman ini harus bisa
 * dibuka justru ketika pemeriksaannya gagal, kalau tidak akan terjadi
 * lingkaran pengalihan tanpa akhir.
 */
export const RUTE_TUJUAN = new Set(["/verify-email", "/onboarding", "/expired"]);

/**
 * Rute yang butuh langganan aktif, beserta teks layar kuncinya.
 *
 * Ini satu-satunya daftar fitur Pro. Navigasi mengambil penanda "PRO" dari
 * sini, dan gerbang memakainya untuk mengunci; jadi menambah fitur Pro cukup
 * di satu tempat dan tidak mungkin lupa memasang penjaganya.
 */
export const RUTE_PRO: Record<string, { titleKey: string; descKey: string }> = {
  "/nama-makna": { titleKey: "pro.nama.title", descKey: "pro.lock.desc.nama" },
  "/kecocokan": { titleKey: "pro.petemon.title", descKey: "pro.lock.desc.petemon" },
  "/perjalanan-hidup": { titleKey: "pro.nasib.title", descKey: "pro.lock.desc.nasib" },
};

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

/**
 * Haruskah layar tunggu ditampilkan sementara sesi dipulihkan?
 *
 * Rute publik tidak menunggu: tidak ada keputusan yang bergantung pada siapa
 * pengunjungnya, jadi menahan halaman depan di layar "Memuat…" hanya membuat
 * pengunjung pertama dan perayap tautan melihat kata itu, bukan isinya.
 */
export function perluLayarTunggu(k: Pick<KondisiAkses, "pathname" | "configured" | "loading">) {
  return k.configured && k.loading && !RUTE_PUBLIK.has(k.pathname);
}
