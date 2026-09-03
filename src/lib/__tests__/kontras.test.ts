/**
 * Kontras warna, diperiksa langsung dari token di globals.css.
 *
 * Ada di suite karena kegagalan kontras tidak pernah terlihat saat menulis
 * kode: halaman tetap tampil rapi, hanya sebagian pembaca yang tidak bisa
 * membacanya. Beberapa pasangan di sini pernah lolos ke produksi di bawah
 * ambang, termasuk teks putih di atas warna kategori.
 *
 * Ambang WCAG AA: 4,5:1 untuk teks biasa, 3:1 untuk grafis dan ikon.
 */
import { readFileSync } from "node:fs";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (expected !== actual) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

const css = readFileSync("src/app/globals.css", "utf8");

/**
 * Ambil nilai token.
 *
 * Tema hanya menimpa sebagian token, jadi yang tidak ditimpa dibaca dari
 * nilai dasarnya, persis seperti yang dilakukan CSS saat merender.
 */
function token(nama: string, tema?: string): string {
  const pola = new RegExp(`--${nama}:\\s*(#[0-9a-fA-F]{6})`);
  if (tema) {
    const awal = css.indexOf(`[data-theme="${tema}"]`);
    if (awal === -1) throw new Error(`Tema ${tema} tidak ada di globals.css.`);
    const blok = css.slice(awal, css.indexOf("}", awal));
    const m = blok.match(pola);
    if (m) return m[1];
  }
  const dasar = css.match(pola);
  if (!dasar) throw new Error(`Token --${nama} tidak ditemukan.`);
  return dasar[1];
}

const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function luminansi(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => linear(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rasio(a: string, b: string): number {
  const [terang, gelap] = [luminansi(a), luminansi(b)].sort((x, y) => y - x);
  return (terang + 0.05) / (gelap + 0.05);
}

const bulat = (n: number) => Math.round(n * 100) / 100;

/** Latar terang tempat teks bisa berdiri, per tema. */
function latar(tema?: string) {
  return [
    token("hb-surface", tema),
    token("hb-surface-sunk", tema),
    token("hb-accent-wash", tema),
  ];
}

function cukup(label: string, warna: string, latarnya: string[], ambang: number) {
  const terburuk = Math.min(...latarnya.map((b) => rasio(warna, b)));
  eq(`${label} (terburuk ${bulat(terburuk)}:1, butuh ${ambang}:1)`, true, terburuk >= ambang);
}

for (const tema of [undefined, "senja"] as const) {
  const nama = tema ?? "mint";
  const bidang = latar(tema);

  // Teks biasa di atas bidang terang.
  cukup(`[${nama}] ink`, token("hb-ink", tema), bidang, 4.5);
  cukup(`[${nama}] ink-soft`, token("hb-ink-soft", tema), bidang, 4.5);
  cukup(`[${nama}] ink-faint`, token("hb-ink-faint", tema), bidang, 4.5);
  cukup(`[${nama}] accent-deep`, token("hb-accent-deep", tema), bidang, 4.5);

  // Warna kategori sebagai TULISAN memakai varian -teks.
  for (const k of ["guru", "ratu", "lara", "pati"]) {
    cukup(`[${nama}] ${k}-teks`, token(`hb-${k}-teks`), bidang, 4.5);
  }

  // Teks pada bidang beraksen dan bidang kategori pekat.
  eq(
    `[${nama}] accent-ink di atas accent >= 4.5`,
    true,
    rasio(token("hb-accent-ink", tema), token("hb-accent", tema)) >= 4.5,
  );
  for (const k of ["guru", "ratu", "lara", "pati"]) {
    const r = rasio("#ffffff", token(`hb-${k}-pekat`));
    eq(`[${nama}] putih di atas ${k}-pekat (${bulat(r)}:1)`, true, r >= 4.5);
  }

  /*
   * Tombol promo memakai aksen yang lebih pekat daripada tombol biasa, dan
   * itu justru pasangan yang paling gampang jatuh: yang menaikkan bobot
   * warnanya demi perhatian hampir selalu menurunkan kontras tulisannya
   * tanpa sadar. Dua keadaan tombolnya diperiksa terpisah, karena hover
   * mengganti latar DAN warna tulisannya sekaligus.
   */
  eq(
    `[${nama}] accent-ink di atas accent-strong (tombol promo) >= 4.5`,
    true,
    rasio(token("hb-accent-ink", tema), token("hb-accent-strong", tema)) >= 4.5,
  );
  eq(
    `[${nama}] putih di atas accent-deep (tombol promo saat hover) >= 4.5`,
    true,
    rasio("#ffffff", token("hb-accent-deep", tema)) >= 4.5,
  );

  // Penanda kalender itu grafis, bukan teks: ambangnya 3:1, dan warnanya
  // sengaja dipertahankan sama dengan aplikasi sebelumnya.
  for (const k of ["guru", "ratu", "lara", "pati"]) {
    const r = rasio(token(`hb-${k}`), token("hb-surface", tema));
    eq(`[${nama}] titik ${k} terlihat (${bulat(r)}:1)`, true, r >= 1.9);
  }
}

/*
 * Penanda tingkat fitur di halaman depan memakai latar setengah tembus
 * (bg-lara/15), yang tidak punya token sendiri sehingga mudah terlewat saat
 * memeriksa kontras. Nilai 20% sempat dipakai dan hanya mencapai 4,48:1.
 */
{
  const campur = (fg: string, bg: string, a: number) => {
    const komponen = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = komponen(fg);
    const B = komponen(bg);
    return (
      "#" +
      [0, 1, 2]
        .map((i) =>
          Math.round(A[i] * a + B[i] * (1 - a))
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  };
  const latar = campur(token("hb-lara"), token("hb-surface"), 0.15);
  const r = rasio(token("hb-lara-teks"), latar);
  eq(`penanda add-on di halaman depan (${bulat(r)}:1)`, true, r >= 4.5);
}

// Identitas warna kategori tidak boleh bergeser: biru, hijau, kuning, merah
// dari aplikasi lama. Varian -teks dan -pekat boleh gelap, aslinya tidak.
eq("guru tetap hijau asli", "#7a9e7e", token("hb-guru"));
eq("ratu tetap biru asli", "#7a8e9e", token("hb-ratu"));
eq("lara tetap kuning asli", "#c4935a", token("hb-lara"));
eq("pati tetap merah asli", "#9e5a5a", token("hb-pati"));

console.log(fail === 0 ? "✓ kontras: semua lolos" : `✗ kontras: ${fail} gagal`);
if (fail) process.exit(1);
