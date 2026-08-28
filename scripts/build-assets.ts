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
  const lambang = await sharp(logo).resize(52, 52).png().toBuffer();

  /*
   * Teksnya dipecah baris di sini, bukan dibiarkan membungkus sendiri.
   * <text> pada SVG tidak mengenal pembungkusan baris sama sekali: kalimat
   * yang kepanjangan akan terus memanjang keluar kanvas tanpa peringatan.
   *
   * Lebar amannya 1008 piksel (1200 dikurangi tepi 96 di kiri dan kanan).
   * Setiap kali kalimatnya diubah, gambarnya harus dilihat lagi, bukan
   * dipercaya begitu saja.
   */
  const teks = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .merek { font-family: Georgia, 'Times New Roman', serif; font-style: italic;
             font-weight: 700; font-size: 34px; fill: ${TINTA}; }
    .kail { font-family: Georgia, 'Times New Roman', serif; font-weight: 700;
            font-size: 58px; fill: ${TINTA}; }
    .isi { font-family: Helvetica, Arial, sans-serif; font-size: 27px; fill: ${REDUP}; }
    .akar { font-family: Helvetica, Arial, sans-serif; font-size: 22px; fill: ${REDUP};
            letter-spacing: 1px; }
    .kaki { font-family: Helvetica, Arial, sans-serif; font-size: 22px; fill: ${REDUP};
            letter-spacing: 2px; }
  </style>
  <text class="merek" x="158" y="107">Hari Baik</text>
  <text class="kail" x="96" y="248">Sudah kerja keras, tapi kenapa</text>
  <text class="kail" x="96" y="318">hasilnya sering meleset?</text>
  <text class="isi" x="96" y="382">Bukan cuma soal seberapa keras kamu berusaha,</text>
  <text class="isi" x="96" y="420">tapi seberapa tepat kapan kamu memulai.</text>
  <text class="akar" x="96" y="484">Wariga Bali &#183; Primbon Jawa &#183; Fengshui</text>
  <text class="kaki" x="96" y="546">HARIBAIK.SEAWISE.ID</text>
</svg>`);

  await sharp({
    create: { width: W, height: H, channels: 4, background: KANVAS },
  })
    .composite([
      // Latar dulu supaya teks selalu berada di atasnya.
      { input: latar, top: 35, left: 830 },
      { input: lambang, top: 62, left: 96 },
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

/**
 * Favicon .ico berisi empat ukuran.
 *
 * Peramban modern memakai `icon.svg`, tapi WhatsApp, Slack, dan pembaca RSS
 * masih menjemput `/favicon.ico` mentah-mentah dan menempelkannya di pratinjau
 * tautan. Selama berkas ini bawaan create-next-app, setiap tautan yang dibagikan
 * pelanggan memajang lambang Vercel, bukan lambang Hari Baik.
 *
 * Bentuk berkasnya menyalin yang sudah terbukti dipakai Next.js: 16, 32, dan 48
 * sebagai BMP mentah (dibaca semua pengurai, setua apa pun), 256 sebagai PNG
 * supaya ukuran berkasnya tidak meledak.
 */
async function faviconIco(tujuan: string) {
  const ukuran = [16, 32, 48, 256];

  /** Satu gambar BMP dalam bentuk yang dipahami .ico: tanpa kepala berkas, tinggi dua kali lipat. */
  async function bmp(u: number) {
    const { data } = await sharp(logo).resize(u, u).ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    });

    const kepala = Buffer.alloc(40);
    kepala.writeUInt32LE(40, 0);
    kepala.writeInt32LE(u, 4);
    // Tinggi ditulis dua kali lipat karena BMP di dalam .ico menyimpan gambar
    // dan topeng transparansinya sebagai satu bidang bertumpuk.
    kepala.writeInt32LE(u * 2, 8);
    kepala.writeUInt16LE(1, 12);
    kepala.writeUInt16LE(32, 14);

    // BMP menyimpan baris dari bawah ke atas, dan urutan kanalnya biru dulu.
    const piksel = Buffer.alloc(u * u * 4);
    for (let y = 0; y < u; y++) {
      for (let x = 0; x < u; x++) {
        const dari = (y * u + x) * 4;
        const ke = ((u - 1 - y) * u + x) * 4;
        piksel[ke] = data[dari + 2];
        piksel[ke + 1] = data[dari + 1];
        piksel[ke + 2] = data[dari];
        piksel[ke + 3] = data[dari + 3];
      }
    }

    // Topeng 1 bit per piksel, tiap barisnya dibulatkan ke kelipatan 4 byte.
    // Isinya nol semua: transparansi sudah dibawa kanal alfa di atas.
    const topeng = Buffer.alloc(Math.ceil(u / 32) * 4 * u);

    return Buffer.concat([kepala, piksel, topeng]);
  }

  const isi = await Promise.all(
    ukuran.map((u) => (u >= 256 ? sharp(logo).resize(u, u).png().toBuffer() : bmp(u))),
  );

  const kepala = Buffer.alloc(6);
  kepala.writeUInt16LE(1, 2);
  kepala.writeUInt16LE(ukuran.length, 4);

  const daftar = Buffer.alloc(16 * ukuran.length);
  let offset = kepala.length + daftar.length;
  ukuran.forEach((u, i) => {
    const o = i * 16;
    // Nol berarti 256: lebar dan tinggi hanya diberi satu byte.
    daftar[o] = u % 256;
    daftar[o + 1] = u % 256;
    daftar.writeUInt16LE(1, o + 4);
    daftar.writeUInt16LE(32, o + 6);
    daftar.writeUInt32LE(isi[i].length, o + 8);
    daftar.writeUInt32LE(offset, o + 12);
    offset += isi[i].length;
  });

  writeFileSync(tujuan, Buffer.concat([kepala, daftar, ...isi]));
  console.log(`  ${tujuan}  ${ukuran.join(", ")}`);
}

async function main() {
  console.log("\nMembangun aset dari", LOGO, "\n");

  // Favicon SVG dipakai apa adanya oleh peramban modern.
  writeFileSync("src/app/icon.svg", logo);
  console.log("  src/app/icon.svg");

  // Yang lama tetap dibutuhkan aplikasi chat dan pengurai yang tidak membaca SVG.
  await faviconIco("src/app/favicon.ico");

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
