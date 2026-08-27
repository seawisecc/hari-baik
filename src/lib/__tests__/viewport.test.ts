/**
 * `env(safe-area-inset-*)` tidak berguna tanpa `viewport-fit=cover`.
 *
 * Bilah bawah memberi dirinya `pb-[env(safe-area-inset-bottom)]` supaya tidak
 * berhimpit dengan home indicator iPhone. Nilai itu hanya terisi bila viewport
 * dideklarasikan `viewport-fit=cover`; tanpa itu iOS mengembalikan 0 di semua
 * perangkat, dan paddingnya tidak menghasilkan apa-apa. Diukur di WebKit:
 * padding-bottom bilah bawah terkomputasi "0px" sebelum perbaikan ini.
 *
 * Pasangan ini gampang putus tanpa ketahuan, karena keduanya ada di berkas
 * yang berbeda dan yang satu tidak menyebut yang lain. Tes ini yang menahannya.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (expected !== actual) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

/** Semua berkas sumber di bawah src/, tanpa berkas tes. */
function berkasSumber(dir: string, kumpul: string[] = []): string[] {
  for (const nama of readdirSync(dir)) {
    const jalur = join(dir, nama);
    if (statSync(jalur).isDirectory()) {
      if (nama !== "__tests__") berkasSumber(jalur, kumpul);
    } else if (/\.(ts|tsx|css)$/.test(nama)) {
      kumpul.push(jalur);
    }
  }
  return kumpul;
}

const pemakai = berkasSumber("src").filter((f) =>
  readFileSync(f, "utf8").includes("env(safe-area-inset"),
);

// Kalau suatu hari tidak ada lagi yang memakainya, tes ini boleh dibuang.
// Selama masih ada, viewport-fit wajib menyertainya.
eq("ada yang memakai safe-area-inset", true, pemakai.length > 0);

const layout = readFileSync("src/app/layout.tsx", "utf8");
eq(
  `viewport-fit=cover wajib ada karena dipakai di: ${pemakai.join(", ")}`,
  true,
  /viewportFit:\s*"cover"/.test(layout),
);

// Dan viewport-nya harus benar-benar diekspor, bukan sekadar ditulis.
eq("viewport diekspor dari layout", true, /export const viewport:\s*Viewport/.test(layout));

/*
 * Bilah bawah harus tetap `fixed`, bukan `sticky` atau `absolute`.
 *
 * Ini yang membuatnya menempel ke layar saat halaman digulir. Pernah terlihat
 * pada rekaman iPhone bahwa bilahnya bergeser turun keluar layar saat digulir,
 * dan hal pertama yang harus dipastikan saat itu terulang adalah posisinya
 * belum berubah di sini.
 */
{
  const nav = readFileSync("src/components/shell/MobileNav.tsx", "utf8");
  const kelasNav = nav.match(/className="(fixed[^"]*)"/)?.[1] ?? "";
  eq("bilah bawah memakai fixed", true, kelasNav.startsWith("fixed "));
  eq("menempel di bawah", true, kelasNav.includes("bottom-0"));
  eq("melebar penuh", true, kelasNav.includes("inset-x-0"));
  eq("menghormati safe area", true, kelasNav.includes("env(safe-area-inset-bottom)"));

  // Ruang di bawah konten harus lebih tinggi daripada bilahnya, kalau tidak
  // isi terakhir halaman tertutup bilah dan tidak bisa dibaca.
  const shell = readFileSync("src/components/shell/AppShell.tsx", "utf8");
  eq("konten diberi ruang bawah untuk bilah", true, /pb-24/.test(shell));
}

console.log(fail === 0 ? "✓ viewport: semua lolos" : `✗ viewport: ${fail} gagal`);
if (fail) process.exit(1);
