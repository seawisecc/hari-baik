/**
 * Favicon .ico harus lambang Hari Baik, bukan bawaan create-next-app.
 *
 * Peramban modern memakai `icon.svg`, jadi di tab semuanya terlihat benar dan
 * tidak ada yang curiga. Tapi WhatsApp, Slack, dan pembaca RSS menjemput
 * `/favicon.ico` mentah-mentah untuk pratinjau tautan. Berbulan-bulan setiap
 * tautan yang dibagikan pelanggan memajang segitiga Vercel di sudut kartunya,
 * karena `src/app/favicon.ico` masih berkas scaffold yang tidak pernah
 * disentuh siapa pun.
 *
 * Berkasnya dibangkitkan `npm run build-assets` dari `src/assets/logo.svg`,
 * tapi hasilnya ikut di-commit sebagai biner. Tidak ada apa pun di kode yang
 * menghubungkan keduanya, jadi logo boleh berubah tanpa faviconnya ikut
 * dibangun ulang. Tes ini yang menahannya: warna di dalam .ico dibandingkan
 * dengan warna yang benar-benar tertulis di logo.svg.
 */
import { readFileSync } from "node:fs";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (expected !== actual) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

const ico = readFileSync("src/app/favicon.ico");

eq("ico: kolom reserved nol", 0, ico.readUInt16LE(0));
eq("ico: bertipe ikon, bukan kursor", 1, ico.readUInt16LE(2));

/** Isi tiap entri, dengan nol pada lebar dibaca sebagai 256 sesuai format .ico. */
const entri = Array.from({ length: ico.readUInt16LE(4) }, (_, i) => {
  const o = 6 + i * 16;
  const panjang = ico.readUInt32LE(o + 8);
  const mulai = ico.readUInt32LE(o + 12);
  return { ukuran: ico[o] || 256, isi: ico.subarray(mulai, mulai + panjang) };
});

eq("ico: empat ukuran", "16, 32, 48, 256", entri.map((e) => e.ukuran).join(", "));
eq(
  "ico: tidak ada entri yang menunjuk ke luar berkas",
  true,
  entri.every((e) => e.isi.length > 0),
);

// Ukuran kecil disimpan BMP mentah supaya dibaca pengurai setua apa pun, yang
// terbesar PNG supaya berkasnya tidak meledak jadi seperempat megabita.
const png = (b: Buffer) => b.subarray(0, 4).toString("hex") === "89504e47";
eq(
  "ico: 16, 32, 48 tersimpan sebagai BMP",
  true,
  entri.slice(0, 3).every((e) => !png(e.isi)),
);
eq("ico: 256 tersimpan sebagai PNG", true, png(entri[3].isi));

/**
 * Baca satu piksel dari entri BMP.
 *
 * BMP di dalam .ico menyimpan barisnya dari bawah ke atas, dan urutan kanalnya
 * biru dulu. Kepala 40 byte dilewati; sesudahnya langsung bidang piksel karena
 * gambarnya 32 bit dan tidak punya palet.
 */
function piksel(e: (typeof entri)[number], x: number, y: number) {
  const p = e.isi.subarray(40);
  const o = ((e.ukuran - 1 - y) * e.ukuran + x) * 4;
  const heks = (n: number) => n.toString(16).padStart(2, "0");
  return { warna: `#${heks(p[o + 2])}${heks(p[o + 1])}${heks(p[o])}`, alfa: p[o + 3] };
}

const e32 = entri[1];

// Lubang tengah cincin harus benar-benar tembus pandang. Lambang Vercel bawaan
// justru lingkaran hitam penuh, jadi pemeriksaan ini sendiri sudah membedakan
// keduanya.
eq("cincin: tengahnya tembus pandang", 0, piksel(e32, 16, 16).alfa);

// Keempat warna busur diambil dari logo.svg, bukan ditulis ulang di sini:
// kalau lambangnya diwarnai ulang tanpa build-assets dijalankan, tes ini merah.
const logo = readFileSync("src/assets/logo.svg", "utf8");
const warnaLogo = [...logo.matchAll(/stroke="(#[0-9a-f]{6})"/g)].map((m) => m[1]);
eq("logo.svg: empat busur berwarna", 4, warnaLogo.length);

const hitung = new Map<string, number>();
for (let y = 0; y < e32.ukuran; y++) {
  for (let x = 0; x < e32.ukuran; x++) {
    const { warna, alfa } = piksel(e32, x, y);
    if (alfa === 255) hitung.set(warna, (hitung.get(warna) ?? 0) + 1);
  }
}

// Pinggiran busur dihaluskan, jadi ada puluhan warna campuran yang muncul satu
// dua piksel. Yang harus dipastikan adalah keempat warna logo-lah yang paling
// banyak menutupi bidang, bukan sekadar ada di suatu tempat.
const teratas = [...hitung]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 4)
  .map(([w]) => w);

for (const warna of warnaLogo) {
  eq(
    `warna ${warna} dari logo.svg mendominasi salah satu busur`,
    true,
    teratas.includes(warna),
  );
}

console.log(fail === 0 ? "✓ ikon: semua lolos" : `✗ ikon: ${fail} gagal`);
if (fail) process.exit(1);
