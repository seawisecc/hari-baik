/**
 * Penjaga untuk satu kelas bug yang sudah pernah terjadi.
 *
 * AuthProvider dulu memaksa render ulang dengan menyalin objek User:
 *
 *     setUser({ ...current, emailVerified: current.emailVerified } as User);
 *
 * Objek User dari Firebase menyimpan methodnya di prototype, bukan sebagai
 * properti biasa, jadi spread hanya membawa datanya dan membuang seluruh
 * methodnya. Cast `as User` di ujungnya membuat TypeScript diam.
 *
 * Akibatnya baru terasa jauh dari tempat kejadian: begitu seseorang selesai
 * memverifikasi email, setiap `user.getIdToken()` berikutnya gagal dengan
 * "getIdToken is not a function". Yang rusak bukan verifikasinya, melainkan
 * tombol "Saya sudah bayar" dan seluruh panel admin.
 */
import { readFileSync } from "node:fs";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (expected !== actual) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

// Bukti perilakunya, bukan sekadar diyakini: method di prototype memang hilang.
class UserPalsu {
  emailVerified = false;
  getIdToken() {
    return "token";
  }
}
const asli = new UserPalsu();
const salinan = { ...asli } as unknown as UserPalsu;
eq("objek asli punya method", "function", typeof asli.getIdToken);
eq("salinan spread kehilangan method", "undefined", typeof salinan.getIdToken);

const provider = readFileSync("src/lib/firebase/AuthProvider.tsx", "utf8");

// Tidak boleh ada objek User yang dikarang sendiri lalu di-cast.
eq(
  "AuthProvider tidak menyalin objek User",
  false,
  /setUser\(\s*\{/.test(provider) || /\{\s*\.\.\.current[^}]*\}\s*as\s+User/.test(provider),
);

// Status verifikasi harus punya state sendiri; itu yang menghapus alasan
// menyalin objek User demi memicu render.
eq("emailVerified punya state sendiri", true, provider.includes("setEmailVerified"));

// Komponen tidak boleh mengambil token dari objek User di state React.
// Sumbernya satu: ambilToken(), yang membaca currentUser milik Firebase.
const komponen = [
  "src/app/admin/page.tsx",
  "src/components/AjukanAktivasi.tsx",
  "src/components/admin/DaftarPermintaan.tsx",
  "src/components/admin/AturHarga.tsx",
];
for (const f of komponen) {
  eq(
    `${f} tidak memakai user.getIdToken`,
    false,
    readFileSync(f, "utf8").includes("user.getIdToken"),
  );
}

{
  const klien = readFileSync("src/lib/firebase/client.ts", "utf8");
  eq("ambilToken membaca dari currentUser", true, /auth\.currentUser/.test(klien));

  // SDK Firebase harus diimpor secara dinamis. Impor statis mengembalikannya
  // ke bundel setiap halaman, termasuk halaman depan yang tidak memakainya.
  eq("SDK diimpor dinamis", true, klien.includes('import("firebase/auth")'));
  eq(
    "client tidak mengimpor nilai firebase secara statis",
    false,
    /^import (?!type )/m.test(
      klien
        .split("\n")
        .filter((l) => l.includes('from "firebase/'))
        .join("\n"),
    ),
  );
}

// Komponen tidak boleh mengimpor nilai dari paket firebase langsung; itu
// menarik SDK-nya kembali ke bundel halaman yang bersangkutan.
for (const f of [
  "src/app/onboarding/page.tsx",
  "src/app/keluarga/page.tsx",
  "src/lib/firebase/AuthProvider.tsx",
]) {
  const barisImpor = readFileSync(f, "utf8")
    .split("\n")
    .filter((l) => l.includes('from "firebase/'));
  eq(
    `${f} hanya mengimpor tipe dari paket firebase`,
    true,
    barisImpor.every((l) => l.startsWith("import type")),
  );
}

// ── Masuk dengan Google ───────────────────────────────────────────────────
//
// Alur ini punya dua jalur yang tidak bisa saling menggantikan, dan yang satu
// hanya terpakai di keadaan yang tidak pernah terlihat saat menguji di laptop:
// aplikasi yang sudah dipasang di layar utama iPhone berjalan standalone, dan
// di sana signInWithPopup menggantung tanpa pesan apa pun. Jalur redirect-nya
// punya konsekuensi lanjutan, karena halaman dibuang dan dimuat ulang, jadi
// pembuatan profil harus dikerjakan ulang saat kembali.
{
  const klien = readFileSync("src/lib/firebase/client.ts", "utf8");
  const galatSumber = readFileSync("src/lib/firebase/errors.ts", "utf8");
  for (const f of [
    "GoogleAuthProvider",
    "signInWithPopup",
    "signInWithRedirect",
    "getRedirectResult",
  ]) {
    eq(`client menyediakan ${f}`, true, klien.includes(f));
  }

  // Popup saja tidak cukup, dan redirect tanpa pembacaan hasilnya membuat
  // pengguna kembali dalam keadaan masuk tapi tanpa dokumen profil. Layarnya
  // diam di tempat, dan tidak ada apa pun yang terlihat salah.
  eq("jalur redirect disiapkan", true, provider.includes("signInWithRedirect"));
  // Dicocokkan berikut argumennya, bukan namanya saja: nama yang kebetulan
  // memuat potongan itu, atau tipe yang diimpor tanpa pernah dipanggil, sudah
  // cukup membuat pemeriksaan nama telanjang lolos.
  eq("hasil redirect dibaca saat kembali", true, provider.includes("getRedirectResult(auth)"));
  eq(
    "profil dibuat setelah kembali dari redirect",
    true,
    /getRedirectResult[\s\S]{0,400}bootstrapProfile/.test(provider),
  );
  eq("mode terpasang dikenali", true, provider.includes("display-mode: standalone"));

  /*
   * Popup yang gagal harus jatuh ke redirect, dan daftarnya harus daftar
   * pengecualian, bukan daftar putih.
   *
   * Sebelumnya hanya auth/popup-blocked yang dicoba ulang. Artinya setiap
   * kode kegagalan baru harus ditemukan lebih dulu lewat seorang pengguna
   * sungguhan yang gagal masuk, dan itu memang terjadi di Safari. Yang boleh
   * TIDAK dicoba ulang cuma pembatalan oleh orangnya sendiri.
   */
  eq(
    "hanya pembatalan yang tidak dicoba ulang",
    true,
    /const dibatalkan =[\s\S]{0,200}if \(dibatalkan\) throw err;/.test(provider),
  );
  eq(
    "sisanya jatuh ke redirect",
    true,
    provider.indexOf("if (dibatalkan) throw err;") <
      provider.lastIndexOf("signInWithRedirect(auth, provider)"),
  );

  /*
   * Kode yang belum dikenali tidak boleh ditelan.
   *
   * "Terjadi kesalahan. Coba lagi." terbaca sopan tapi tidak menunjuk apa
   * pun: yang melihatnya tidak bisa berbuat apa-apa, dan yang dilapori tidak
   * bisa mencari apa-apa. Satu putaran penuh terbuang hanya untuk mengetahui
   * kode yang sebenarnya sudah ada di tangan pengguna sejak awal.
   */
  eq("kode yang belum dikenali ikut ditampilkan", true, galatSumber.includes("(${code})"));
  eq("dan dicatat utuh ke console", true, galatSumber.includes("console.error"));

  // Email yang sudah punya sandi lalu ditekan tombol Google akan ditolak
  // Firebase dengan kode ini. Tanpa pesan yang menyebut jalan keluarnya,
  // orangnya menekan tombol yang sama berulang kali.
  eq(
    "bentrok akun punya pesannya sendiri",
    true,
    galatSumber.includes("auth/account-exists-with-different-credential"),
  );

  // Tombolnya harus ada di kedua halaman. Menaruhnya hanya di halaman daftar
  // membuat orang yang sudah pernah masuk lewat Google tidak punya jalan
  // masuk sama sekali, karena dia tidak punya kata sandi.
  for (const f of ["src/app/(auth)/login/page.tsx", "src/app/(auth)/register/page.tsx"]) {
    eq(`${f} menawarkan Google`, true, readFileSync(f, "utf8").includes("<TombolGoogle"));
  }

  // Email/password tidak boleh ikut hilang: yang tidak punya akun Google
  // harus tetap bisa masuk seperti sebelumnya.
  eq("masuk dengan sandi tetap ada", true, provider.includes("signInWithEmailAndPassword"));
  eq(
    "daftar dengan sandi tetap ada",
    true,
    provider.includes("createUserWithEmailAndPassword"),
  );
}

console.log(fail === 0 ? "✓ auth: semua lolos" : `✗ auth: ${fail} gagal`);
if (fail) process.exit(1);
