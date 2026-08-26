/**
 * Bangun aset gambar dari lambang SVG.
 *
 * Hasilnya PNG statis yang ikut di-commit, bukan dibangkitkan saat request.
 * WhatsApp dan aplikasi chat lain menyimpan pratinjau dengan agresif dan
 * kadang gagal pada endpoint dinamis, jadi berkas tetap lebih dapat
 * diandalkan daripada rute yang menghasilkan gambar.
 *
 *   npm run build-assets
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const LOGO = "src/assets/logo.svg";
const KANVAS = "#f2f0ec";
const TINTA = "#2f2c28";
const REDUP = "#6b6660";

const logo = readFileSync(LOGO);

mkdirSync("public/icons", { recursive: true });

/** Lambang di atas kotak berlatar kanvas, dengan ruang napas di tepinya. */
async function ikonKotak(ukuran: number, tujuan: string, padding = 0.18) {
  const dalam = Math.round(ukuran * (1 - padding * 2));
  const lambang = await sharp(logo).resize(dalam, dalam).png().toBuffer();
  await sharp({
    create: {
      width: ukuran,
      height: ukuran,
      channels: 4,
      background: KANVAS,
    },
  })
    .composite([{ input: lambang, gravity: "centre" }])
    .png()
    .toFile(tujuan);
  console.log(`  ${tujuan}  ${ukuran}x${ukuran}`);
}

/**
 * Gambar pratinjau tautan, 1200x630.
 *
 * Teksnya digambar sebagai SVG lalu dirasterkan di sini, jadi hasilnya tetap
 * sama di mana pun nanti dibuka: tidak ada font yang perlu tersedia di
 * server maupun di perangkat pembaca.
 */
async function pratinjauTautan(tujuan: string) {
  const W = 1200;
  const H = 630;

  // Lambang besar yang terpotong di tepi kanan mengisi ruang yang tersisa
  // tanpa menambah elemen baru, dan menjaga tatapan tetap ke arah teks.
  //
  // Opacity dibakar ke dalam SVG-nya, bukan lewat sharp: ensureAlpha hanya
  // berlaku untuk gambar yang belum punya kanal alpha, jadi tidak berpengaruh
  // pada hasil render SVG ini.
  const logoRedup = Buffer.from(logo.toString().replace("<g fill=", '<g opacity="0.14" fill='));
  const latar = await sharp(logoRedup).resize(560, 560).png().toBuffer();
  const lambang = await sharp(logo).resize(104, 104).png().toBuffer();

  const teks = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .judul { font-family: Georgia, 'Times New Roman', serif; font-style: italic;
             font-weight: 700; font-size: 86px; fill: ${TINTA}; }
    .slogan { font-family: Georgia, serif; font-weight: 700; font-size: 33px; fill: ${TINTA}; }
    .isi { font-family: Helvetica, Arial, sans-serif; font-size: 26px; fill: ${REDUP}; }
    .kaki { font-family: Helvetica, Arial, sans-serif; font-size: 22px; fill: ${REDUP};
            letter-spacing: 2px; }
  </style>
  <text class="judul" x="234" y="278">Hari Baik</text>
  <text class="slogan" x="96" y="372">&#8220;Setiap orang punya waktunya masing-masing&#8221;</text>
  <text class="isi" x="96" y="424">Kalender siklus personal, dihitung dari tanggal lahirmu.</text>
  <text class="kaki" x="96" y="536">HARIBAIK.SEAWISE.ID</text>
</svg>`);

  await sharp({
    create: { width: W, height: H, channels: 4, background: KANVAS },
  })
    .composite([
      // Latar dulu supaya teks selalu berada di atasnya.
      { input: latar, top: 35, left: 830 },
      { input: lambang, top: 176, left: 96 },
      { input: teks, top: 0, left: 0 },
    ])
    .png()
    .toFile(tujuan);
  console.log(`  ${tujuan}  ${W}x${H}`);
}

/**
 * Ikon "maskable" untuk Android.
 *
 * Android memotong ikon jadi bentuknya sendiri (bulat, kotak membulat,
 * dan lain-lain). Lambang harus muat di dalam lingkaran aman selebar 80%
 * dari kanvas, kalau tidak tepinya akan terpotong.
 */
async function ikonMaskable(ukuran: number, tujuan: string) {
  await ikonKotak(ukuran, tujuan, 0.28);
}

async function main() {
  console.log("\nMembangun aset dari", LOGO, "\n");

  // Favicon SVG dipakai apa adanya oleh peramban modern.
  writeFileSync("src/app/icon.svg", logo);
  console.log("  src/app/icon.svg");

  // iOS memakai ikon ini sebagai pintasan layar utama; latarnya harus padat
  // karena iOS tidak menghormati transparansi di sini.
  await ikonKotak(180, "src/app/apple-icon.png");

  // Ikon manifest: Chrome butuh 192 dan 512 supaya tombol pasang muncul.
  await ikonKotak(192, "public/icons/icon-192.png");
  await ikonKotak(512, "public/icons/icon-512.png");
  await ikonMaskable(512, "public/icons/icon-maskable-512.png");

  await pratinjauTautan("src/app/opengraph-image.png");
  console.log("");
}

main().catch((err) => {
  console.error("\n✗ Gagal:", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
