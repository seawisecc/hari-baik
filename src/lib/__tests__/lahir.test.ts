/**
 * Penjaga kunci tanggal lahir dan jejak audit.
 *
 * Tanggal lahir adalah satu-satunya masukan yang menentukan seluruh isi
 * aplikasi ini. Kalau pengguna bisa menggesernya sendiri kapan saja, tidak
 * ada satu pun hasil yang bisa dipertanggungjawabkan: kategori hari kemarin
 * bisa berbeda dari yang dia lihat hari ini, dan tidak ada yang tahu kenapa.
 *
 * Karena itu tanggalnya dikonfirmasi sekali di onboarding, lalu dikunci.
 * Penjaga sebenarnya ada di Firestore Rules, yang tidak bisa diuji dari sini
 * tanpa emulator; yang diperiksa berkas ini adalah bahwa aturannya masih ada
 * di firestore.rules dan tidak ada jalur di aplikasi yang mencoba menembusnya.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

const baca = (f: string) => readFileSync(f, "utf8");

// ── Firestore Rules ───────────────────────────────────────────────────────
{
  const rules = baca("firestore.rules");

  eq("rules mengunci tanggal lahir", true, rules.includes("function menyentuhLahir()"));
  eq(
    "rules tahu kapan lahir masih kosong",
    true,
    rules.includes("function lahirMasihKosong()"),
  );
  eq(
    "update pengguna memakai kuncinya",
    true,
    /!menyentuhLahir\(\)\s*\|\|\s*lahirMasihKosong\(\)/.test(rules),
  );

  // Seluruh turunan wariga ikut terkunci: kalau hanya tanggalnya yang dijaga,
  // weton dan urip di dokumen bisa diubah sendiri dan tidak lagi cocok dengan
  // tanggalnya, dan panel admin akan menyaring orang dengan data karangan.
  for (const f of [
    "tanggalLahir",
    "saptaWaraLahir",
    "pancaWaraLahir",
    "sadWaraLahir",
    "wukuLahir",
    "uripLahir",
    "uripPetemonLahir",
  ]) {
    const daftar = rules.slice(rules.indexOf("function fieldLahir()"));
    eq(`fieldLahir memuat ${f}`, true, daftar.slice(0, 400).includes(`'${f}'`));
  }

  // Daftar yang diizinkan, bukan daftar yang dilarang.
  eq("klien dibatasi daftar field yang boleh", true, rules.includes("hanyaFieldKlien()"));
  eq("field terlindungi masih dijaga", true, rules.includes("keepsProtectedFields()"));

  // Jejak audit tidak boleh bisa disentuh dari klien mana pun.
  const jejak = rules.slice(rules.indexOf("match /jejak/"));
  eq(
    "jejak hanya dibaca admin",
    true,
    jejak.slice(0, 200).includes("allow read: if isAdmin()"),
  );
  eq(
    "jejak tidak bisa ditulis klien",
    true,
    jejak.slice(0, 200).includes("allow write: if false"),
  );
}

// ── Tidak ada jalur klien yang menulis tanggal lahir ──────────────────────
{
  function berkas(dir: string, out: string[] = []): string[] {
    for (const nama of readdirSync(dir)) {
      const jalur = join(dir, nama);
      if (statSync(jalur).isDirectory()) berkas(jalur, out);
      else if (/\.tsx?$/.test(jalur) && !jalur.includes("__tests__")) out.push(jalur);
    }
    return out;
  }

  const penulis: string[] = [];
  const penulisLahir: string[] = [];
  for (const f of berkas("src")) {
    const isi = baca(f);
    if (!isi.includes("perbaruiProfil(") || f.endsWith("firebase/client.ts")) continue;
    penulis.push(f);
    // Isi setiap pemanggilan, dari kurung buka sampai penutup panggilannya.
    for (const m of isi.matchAll(/perbaruiProfil\([\s\S]*?\n\s*\}\);/g)) {
      if (m[0].includes("tanggalLahir")) penulisLahir.push(f);
    }
  }

  eq(
    "hanya onboarding dan keluarga yang menulis profil",
    ["src/app/keluarga/page.tsx", "src/app/onboarding/page.tsx"],
    penulis.sort(),
  );
  eq(
    "hanya onboarding yang menulis tanggal lahir",
    ["src/app/onboarding/page.tsx"],
    [...new Set(penulisLahir)],
  );
}

// ── Onboarding harus mengonfirmasi dulu, bukan langsung menyimpan ─────────
{
  const isi = baca("src/app/onboarding/page.tsx");
  const badan = /onSubmit=\{\(e\) => \{([\s\S]*?)\n\s*\}\}/.exec(isi)?.[1] ?? "";

  eq("form onboarding ditemukan", true, badan.length > 0);
  eq("kirim form membuka konfirmasi", true, badan.includes("setKonfirmasi(true)"));
  eq("kirim form belum menyimpan apa pun", false, badan.includes("perbaruiProfil"));
  eq("kirim form tidak memanggil simpan", false, /\bsimpan\(/.test(badan));
  eq("ada peringatan bahwa tanggalnya terkunci", true, isi.includes("onboarding.lockWarning"));
}

// ── Halaman profil tidak lagi menawarkan ubah tanggal lahir ───────────────
{
  /*
   * Dibaca seluruh berkas di folder halamannya, bukan page.tsx saja.
   *
   * Halaman profil sempat dipecah jadi page.tsx (server, membaca katalog
   * add-on) dan ProfilClient.tsx (isinya). Pemeriksa yang menunjuk satu nama
   * berkas langsung merah, dan yang lebih berbahaya: kalau kalimatnya
   * kebetulan pindah ke berkas lain tanpa page.tsx ikut berubah, pemeriksanya
   * akan tetap hijau sambil tidak memeriksa apa pun.
   */
  const isi = readdirSync("src/app/profil")
    .filter((n) => n.endsWith(".tsx"))
    .map((n) => baca(join("src/app/profil", n)))
    .join("\n");

  eq("ada berkas halaman profil", true, isi.length > 0);
  eq("profil tidak menulis profil dari klien", false, isi.includes("perbaruiProfil"));
  eq("profil menjelaskan kuncinya", true, isi.includes("birth.locked"));
}

// ── Perbaikan admin dihitung ulang di server dan tercatat ─────────────────
{
  const isi = baca("src/app/api/admin/profil/route.ts");
  eq("route lahir butuh admin", true, isi.includes("requireAdmin(req)"));
  eq("turunan wariga dihitung di server", true, isi.includes("saptawaraName(tanggalLahir)"));
  eq("perubahan lahir tercatat", true, isi.includes('aksi: "lahir"'));
}

// ── Setiap route admin yang mengubah data menulis jejak ───────────────────
{
  function rute(dir: string, out: string[] = []): string[] {
    for (const nama of readdirSync(dir)) {
      const jalur = join(dir, nama);
      if (statSync(jalur).isDirectory()) rute(jalur, out);
      else if (nama === "route.ts") out.push(jalur);
    }
    return out;
  }

  const tanpaJejak = rute("src/app/api/admin").filter((f) => {
    const isi = baca(f);
    const mengubah = /export async function (POST|PUT|PATCH|DELETE)/.test(isi);
    return mengubah && !isi.includes("catatJejak");
  });
  eq("semua route admin yang mengubah data menulis jejak", "", tanpaJejak.join(", "));
}

console.log(fail === 0 ? "✓ lahir: semua lolos" : `✗ lahir: ${fail} gagal`);
if (fail) process.exit(1);
