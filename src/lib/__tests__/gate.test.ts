/** Keputusan pengalihan rute: siapa boleh melihat apa. */
import { RUTE_PRO, perluLayarTunggu, tentukanAlihan, type KondisiAkses } from "../gate";
import { NAV_AKUN, NAV_MOBILE, NAV_MOBILE_LAINNYA, NAV_PRO, NAV_UTAMA } from "../nav";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (expected !== actual) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

/** Pengguna yang sehat: masuk, terverifikasi, profil lengkap, langganan aktif. */
const dasar: KondisiAkses = {
  pathname: "/hari-ini",
  configured: true,
  loading: false,
  signedIn: true,
  emailVerified: true,
  onboardingComplete: true,
  canView: true,
  isAdmin: false,
};
const k = (ubah: Partial<KondisiAkses>): KondisiAkses => ({ ...dasar, ...ubah });

eq("pengguna sehat tidak dialihkan", null, tentukanAlihan(dasar));

// Tanpa Firebase, aplikasi harus tetap bisa dijalankan untuk pengembangan.
eq(
  "belum dikonfigurasi: bebas",
  null,
  tentukanAlihan(k({ configured: false, signedIn: false })),
);

// Selama masih memuat, jangan mengambil keputusan berdasarkan data separuh.
eq("sedang memuat: tunggu", null, tentukanAlihan(k({ loading: true, signedIn: false })));

// Rute publik terbuka untuk siapa pun.
for (const p of ["/", "/login", "/register", "/lupa-sandi"]) {
  eq(`publik ${p}`, null, tentukanAlihan(k({ pathname: p, signedIn: false })));
}

// Urutan pemeriksaan: dari syarat paling dasar.
eq("belum masuk", "/login", tentukanAlihan(k({ signedIn: false })));
eq("email belum terverifikasi", "/verify-email", tentukanAlihan(k({ emailVerified: false })));
eq("profil belum lengkap", "/onboarding", tentukanAlihan(k({ onboardingComplete: false })));
eq("langganan habis", "/expired", tentukanAlihan(k({ canView: false })));

// Yang terkunci tidak boleh menembus lewat rute manapun.
for (const p of ["/hari-ini", "/kalender", "/kepribadian", "/nama-makna", "/kecocokan"]) {
  eq(`terkunci di ${p}`, "/expired", tentukanAlihan(k({ pathname: p, canView: false })));
}

// Halaman tujuan harus bisa dibuka justru saat pemeriksaannya gagal,
// kalau tidak akan terjadi lingkaran pengalihan.
eq(
  "expired boleh dibuka saat terkunci",
  null,
  tentukanAlihan(k({ pathname: "/expired", canView: false })),
);
eq(
  "verify boleh dibuka saat belum verif",
  null,
  tentukanAlihan(k({ pathname: "/verify-email", emailVerified: false })),
);
eq(
  "onboarding boleh dibuka saat belum lengkap",
  null,
  tentukanAlihan(k({ pathname: "/onboarding", onboardingComplete: false })),
);

// Tapi tetap dialihkan maju bila syarat dasarnya belum terpenuhi.
eq(
  "expired tanpa login tetap ke login",
  "/login",
  tentukanAlihan(k({ pathname: "/expired", signedIn: false })),
);
eq(
  "onboarding tanpa verifikasi ke verify",
  "/verify-email",
  tentukanAlihan(k({ pathname: "/onboarding", emailVerified: false })),
);

// Admin yang langganannya habis tetap harus bisa masuk untuk mengaktifkan
// kembali langganan orang lain.
eq("admin terkunci tetap masuk", null, tentukanAlihan(k({ canView: false, isAdmin: true })));
eq(
  "admin tetap wajib verifikasi",
  "/verify-email",
  tentukanAlihan(k({ emailVerified: false, isAdmin: true })),
);

// Profil belum termuat: jangan menebak, tunggu.
eq(
  "profil belum termuat",
  null,
  tentukanAlihan(k({ onboardingComplete: null, canView: false })),
);

// Layar tunggu. Halaman publik harus langsung tampil: menahannya sampai
// Firebase siap membuat pengunjung pertama dan perayap tautan cuma melihat
// kata "Memuat…", bukan isi halamannya.
for (const jalur of ["/", "/login", "/register", "/lupa-sandi"]) {
  eq(
    `publik tanpa layar tunggu: ${jalur}`,
    false,
    perluLayarTunggu({ pathname: jalur, configured: true, loading: true }),
  );
}
eq(
  "halaman terjaga tetap menunggu",
  true,
  perluLayarTunggu({ pathname: "/hari-ini", configured: true, loading: true }),
);
eq(
  "tanpa firebase tidak ada layar tunggu",
  false,
  perluLayarTunggu({ pathname: "/hari-ini", configured: false, loading: true }),
);
eq(
  "selesai memuat, tidak menunggu",
  false,
  perluLayarTunggu({ pathname: "/hari-ini", configured: true, loading: false }),
);

// Semua rute aplikasi harus terjangkau dari ponsel. Bilah bawah hanya muat
// beberapa, sisanya wajib ada di lembar "Lainnya": pernah terjadi dua fitur
// berbayar hilang sama sekali dari ponsel karena tidak ada yang memeriksa ini.
const semuaRute = [...NAV_UTAMA, ...NAV_PRO, ...NAV_AKUN].map((i) => i.href);
const terjangkau = new Set([...NAV_MOBILE, ...NAV_MOBILE_LAINNYA].map((i) => i.href));
for (const href of semuaRute) {
  eq(`terjangkau dari ponsel: ${href}`, true, terjangkau.has(href));
}

// Setiap rute Pro harus punya penanda di navigasi, dan sebaliknya.
for (const href of Object.keys(RUTE_PRO)) {
  eq(`rute pro ada di navigasi: ${href}`, true, semuaRute.includes(href));
}

console.log(fail === 0 ? "✓ gate: semua lolos" : `✗ gate: ${fail} gagal`);
if (fail) process.exit(1);
