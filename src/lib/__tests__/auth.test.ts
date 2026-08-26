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

eq(
  "ambilToken membaca dari currentUser",
  true,
  readFileSync("src/lib/firebase/client.ts", "utf8").includes("getFirebaseAuth().currentUser"),
);

console.log(fail === 0 ? "✓ auth: semua lolos" : `✗ auth: ${fail} gagal`);
if (fail) process.exit(1);
