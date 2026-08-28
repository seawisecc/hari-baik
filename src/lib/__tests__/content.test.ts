/** Cek integritas data konten yang diport dari aplikasi lama. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { getPancasuda, getPangarasan } from "../content/kepribadian";
import { translate } from "../content/i18n";
import { hitungMaknaNama } from "../content/nama";
import { petaPerjalananHidup } from "../content/nasib";
import { getPanduan } from "../content/panduan";
import { hitungPetemon } from "../content/petemon";
import { WETON } from "../content/weton";
import { PANCAWARA, SAPTAWARA, uripHari } from "../wariga";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

// Petemon: nilai acuan dari self-test aplikasi lama.
const p = hitungPetemon("1993-06-30", "1997-09-07");
eq("petemon orang1", 23, p.orang1.totalUrip);
eq("petemon orang2", 21, p.orang2.totalUrip);
eq("petemon total", 44, p.total);

// Tabel weton harus lengkap dan konsisten dengan engine.
eq("weton 35 entri", 35, Object.keys(WETON).length);
for (const [key, w] of Object.entries(WETON)) {
  const [s, pw] = key.split("-");
  const su = SAPTAWARA.find((x) => x.name === s)?.urip;
  const pu = PANCAWARA.find((x) => x.name === pw)?.urip;
  if (su === undefined || pu === undefined) {
    fail++;
    console.log("FAIL: nama wara tak dikenal:", key);
    continue;
  }
  if (su + pu !== w.urip) {
    fail++;
    console.log(`FAIL: urip ${key} tabel=${w.urip} engine=${su + pu}`);
  }
  if (!getPangarasan(w.pangarasan)) {
    fail++;
    console.log("FAIL: pangarasan tanpa profil:", key, w.pangarasan);
  }
  if (!getPancasuda(w.pancasuda)) {
    fail++;
    console.log("FAIL: pancasuda tanpa profil:", key, w.pancasuda);
  }
}

// Aksara: digraf dibaca satu, vokal diabaikan.
const n = hitungMaknaNama("Nyoman");
eq(
  "digraf ny satu aksara",
  true,
  n.rincian.some((r) => r.aksara === "Nya"),
);
eq(
  "vokal diabaikan",
  false,
  n.rincian.some((r) => "aiueo".includes(r.huruf)),
);

// Perjalanan hidup harus aman untuk semua urip yang mungkin (7–18) dan di luarnya.
for (let u = 7; u <= 18; u++) {
  const peta = petaPerjalananHidup(u);
  if (peta.length !== 18) {
    fail++;
    console.log("FAIL: jumlah periode urip", u, peta.length);
  }
}
eq(
  "urip di luar rentang aman",
  true,
  petaPerjalananHidup(99).every((x) => x.value === null),
);

// Urip lahir yang bisa muncul dari tanggal nyata selalu di 7–18.
const urip = uripHari("1993-06-30");
eq("urip 1993-06-30", 15, urip);

eq("panduan id", true, getPanduan("id", "GURU").supported.length > 0);
eq("panduan en", true, getPanduan("en", "PATI").affirmation.length > 0);
eq("i18n id", "Hari Mengalir", translate("id", "day.guru"));
eq("i18n en", "Flow Day", translate("en", "day.guru"));

/*
 * Kamus dua bahasa.
 *
 * Diperiksa di sini, bukan diperiksa manual, karena kunci yang hilang tidak
 * pernah menimbulkan error: `translate` jatuh ke bahasa Indonesia, lalu ke
 * nama kuncinya sendiri. Halaman depan pernah menampilkan tulisan "energy"
 * sebagai judul bagian selama berminggu-minggu karena itu.
 */
const sumberI18n = readFileSync("src/lib/content/i18n.ts", "utf8");
const potongId = sumberI18n.slice(
  sumberI18n.indexOf("\n  id: {"),
  sumberI18n.indexOf("\n  en: {"),
);
const potongEn = sumberI18n.slice(sumberI18n.indexOf("\n  en: {"));
// Kunci boleh tertulis dengan atau tanpa tanda kutip: Prettier melepas kutip
// pada kunci yang sudah berupa identifier sah, seperti `energy`.
const kunciDi = (blok: string) =>
  new Set([...blok.matchAll(/^ {4}"?([\w.]+)"?:/gm)].map((m) => m[1]));
const kunciId = kunciDi(potongId);
const kunciEn = kunciDi(potongEn);

eq("kamus id tidak kosong", true, kunciId.size > 200);
eq(
  "setiap kunci ID punya padanan EN",
  "",
  [...kunciId].filter((k) => !kunciEn.has(k)).join(", "),
);
eq(
  "setiap kunci EN punya padanan ID",
  "",
  [...kunciEn].filter((k) => !kunciId.has(k)).join(", "),
);

// Penanda {…} harus sama di kedua bahasa, kalau tidak salah satunya akan
// menampilkan kurung kurawal mentah kepada pengguna.
const nilaiDi = (blok: string) =>
  new Map(
    [...blok.matchAll(/^ {4}"?([\w.]+)"?:\s*\n?\s*"((?:[^"\\]|\\.)*)"/gm)].map((m) => [
      m[1],
      m[2],
    ]),
  );
const nilaiId = nilaiDi(potongId);
const nilaiEn = nilaiDi(potongEn);
const penanda = (teks: string) =>
  [...teks.matchAll(/\{(\w+)\}/g)]
    .map((m) => m[1])
    .sort()
    .join(",");
const penandaBeda = [...nilaiId]
  .filter(([k, v]) => nilaiEn.has(k) && penanda(v) !== penanda(nilaiEn.get(k)!))
  .map(([k]) => k);
eq("penanda ID dan EN cocok", "", penandaBeda.join(", "));

// Setiap kunci yang dipanggil t("…") harus benar-benar ada.
function berkasTsx(dir: string, out: string[] = []): string[] {
  for (const nama of readdirSync(dir)) {
    const jalur = join(dir, nama);
    if (statSync(jalur).isDirectory()) berkasTsx(jalur, out);
    else if (/\.tsx?$/.test(jalur) && !jalur.includes("__tests__")) out.push(jalur);
  }
  return out;
}
const dipakai = new Map<string, string>();
for (const f of berkasTsx("src")) {
  for (const m of readFileSync(f, "utf8").matchAll(/\bt\(\s*"([^"]+)"/g)) {
    if (!dipakai.has(m[1])) dipakai.set(m[1], f);
  }
}
eq(
  "semua kunci yang dipakai terdefinisi",
  "",
  [...dipakai]
    .filter(([k]) => !kunciId.has(k))
    .map(([k, f]) => `${k} (${f})`)
    .join(", "),
);

/*
 * Bagian "Kata mereka" harus hilang seluruhnya saat daftarnya kosong.
 *
 * Kartu kosong atau tulisan "belum ada testimoni" lebih melemahkan daripada
 * tidak menyinggungnya sama sekali. Ini gampang putus tanpa ketahuan, karena
 * yang menulis ulang halaman depan tidak selalu tahu daftarnya boleh kosong.
 */
{
  const landing = readFileSync("src/app/LandingClient.tsx", "utf8");
  eq("bagian testimoni dirender bersyarat", true, landing.includes("TESTIMONI.length > 0 &&"));
}

console.log(fail === 0 ? "✓ konten: semua lolos" : `✗ konten: ${fail} gagal`);
if (fail) process.exit(1);
