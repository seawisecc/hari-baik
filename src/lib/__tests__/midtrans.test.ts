/**
 * Pembayaran lewat Midtrans.
 *
 * Yang diuji di sini bukan "apakah kodenya jalan", melainkan tiga hal yang
 * kalau salah tidak akan terlihat sampai ada uang yang hilang:
 *
 * 1. Tanda tangan notifikasi. Route notifikasi terbuka untuk umum, dan
 *    satu-satunya yang membedakan Midtrans dari siapa pun di internet adalah
 *    sha512 ini. Rumusnya dikunci ke nilai acuan yang dihitung terpisah, jadi
 *    urutan penggabungannya pun ikut terjaga.
 * 2. Terjemahan status. `capture` dengan `fraud_status: challenge` bukan
 *    lunas, dan memperlakukannya sebagai lunas berarti membuka langganan atas
 *    pembayaran yang beberapa jam kemudian bisa dibatalkan.
 * 3. Nominal dirakit di server. Kalau harganya boleh datang dari klien, paket
 *    tiga tahun bisa dibeli seharga seribu rupiah dan Midtrans akan
 *    menerimanya, karena yang menentukan tagihan adalah kita.
 */
import { readFileSync } from "node:fs";
import {
  buatOrderId,
  modeDariKunci,
  nominalCocok,
  orderIdValid,
  rincianItem,
  statusDariNotifikasi,
  tandaTanganCocok,
  tandaTanganDiharapkan,
  totalItem,
  urlSnapJs,
  urlStatusTransaksi,
  urlTransaksiSnap,
} from "../midtrans";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};
const baca = (p: string) => readFileSync(p, "utf8");

// ── Mode dibaca dari kunci, bukan dari saklar terpisah ────────────────────
eq("kunci sandbox", "sandbox", modeDariKunci("SB-Mid-server-abc"));
eq("kunci produksi", "produksi", modeDariKunci("Mid-server-abc"));
eq("spasi di ujung tidak menipu", "sandbox", modeDariKunci("  SB-Mid-client-abc  "));

eq("snap.js sandbox", "https://app.sandbox.midtrans.com/snap/snap.js", urlSnapJs("sandbox"));
eq("snap.js produksi", "https://app.midtrans.com/snap/snap.js", urlSnapJs("produksi"));
eq(
  "transaksi produksi",
  "https://app.midtrans.com/snap/v1/transactions",
  urlTransaksiSnap("produksi"),
);
eq(
  "status sandbox",
  "https://api.sandbox.midtrans.com/v2/HB-a-b-c/status",
  urlStatusTransaksi("sandbox", "HB-a-b-c"),
);

// ── Order id: batas Midtrans dan keunikan antar percobaan ─────────────────
{
  const id = buatOrderId("aB9xYz01234567890", 1_760_000_000_000, "q7wx9z");
  eq("order id valid", true, orderIdValid(id));
  eq("order id di bawah 50 karakter", true, id.length <= 50);
  eq("uid dipotong 10", true, id.startsWith("HB-aB9xYz0123-".slice(0, 13)));

  // Percobaan kedua harus punya id sendiri. Midtrans menolak order_id yang
  // sudah pernah dipakai, jadi id yang sama membuat orang yang membatalkan
  // lalu mencoba lagi menekan tombol yang tidak melakukan apa-apa.
  const lagi = buatOrderId("aB9xYz01234567890", 1_760_000_000_001, "aa11bb");
  eq("percobaan kedua id baru", true, id !== lagi);

  // Karakter di luar yang diizinkan Midtrans harus dibuang, bukan diloloskan.
  const kotor = buatOrderId("uid/with spaces!", 1_760_000_000_000, "a b*c");
  eq("order id bersih", true, /^[A-Za-z0-9\-_.~]+$/.test(kotor));
  eq("order id kotor tetap valid", true, orderIdValid(kotor));

  eq("order id asing ditolak", false, orderIdValid("../../etc/passwd"));
  eq("order id kosong ditolak", false, orderIdValid(""));
  eq("order id merchant lain ditolak", false, orderIdValid("ORDER-12345"));
}

// ── Terjemahan status ─────────────────────────────────────────────────────
eq("settlement lunas", "lunas", statusDariNotifikasi({ transaction_status: "settlement" }));
eq(
  "capture accept lunas",
  "lunas",
  statusDariNotifikasi({ transaction_status: "capture", fraud_status: "accept" }),
);
eq(
  "capture challenge belum lunas",
  "menunggu",
  statusDariNotifikasi({ transaction_status: "capture", fraud_status: "challenge" }),
);
eq("pending menunggu", "menunggu", statusDariNotifikasi({ transaction_status: "pending" }));
eq("expire gagal", "gagal", statusDariNotifikasi({ transaction_status: "expire" }));
eq("deny gagal", "gagal", statusDariNotifikasi({ transaction_status: "deny" }));
eq("cancel gagal", "gagal", statusDariNotifikasi({ transaction_status: "cancel" }));
eq(
  "refund dipisahkan dari gagal",
  "dikembalikan",
  statusDariNotifikasi({ transaction_status: "refund" }),
);
eq(
  "chargeback dipisahkan dari gagal",
  "dikembalikan",
  statusDariNotifikasi({ transaction_status: "chargeback" }),
);
// Status yang belum dikenal tidak boleh jatuh ke "lunas". Menebak ke arah
// membuka akses adalah arah tebakan yang salah.
eq(
  "status asing tidak lunas",
  "gagal",
  statusDariNotifikasi({ transaction_status: "sesuatu" }),
);
eq("tanpa status tidak lunas", "gagal", statusDariNotifikasi({}));

// ── Nominal ───────────────────────────────────────────────────────────────
eq("desimal Midtrans dibaca benar", true, nominalCocok("150000.00", 150_000));
eq("nominal beda ditolak", false, nominalCocok("150000.00", 150_001));
eq("nominal kosong ditolak", false, nominalCocok(undefined, 150_000));
eq("nominal bukan angka ditolak", false, nominalCocok("seratus", 150_000));

// ── Rincian belanja ───────────────────────────────────────────────────────
{
  const items = rincianItem({ id: "dua-tahun", nama: "2 Tahun", harga: 270_000 }, [
    { id: "profil-keluarga", nama: "Profil Keluarga", harga: 75_000 },
  ]);
  eq("dua baris rincian", 2, items.length);
  // Midtrans menolak transaksi bila jumlah item tidak sama persis dengan
  // gross_amount, jadi keduanya harus lahir dari daftar yang sama.
  eq("total sama dengan jumlah item", 345_000, totalItem(items));

  const panjang = rincianItem({ id: "x".repeat(80), nama: "N".repeat(120), harga: 1000 }, []);
  eq("nama item dipotong 50", 50, panjang[0].name.length);
  eq("id item dipotong 50", 50, panjang[0].id.length);
}

// ── Tanda tangan ──────────────────────────────────────────────────────────
const KUNCI_UJI = "SB-Mid-server-CONTOHKUNCIUJI";
const NOTIF_UJI = {
  order_id: "HB-abc123-m5x7q9-8f2a",
  status_code: "200",
  gross_amount: "150000.00",
  transaction_status: "settlement",
};
/**
 * Nilai acuan dihitung di luar kode ini, dengan sha512 pustaka standar Node
 * atas untaian `order_id + status_code + gross_amount + server_key`. Kalau
 * suatu hari ada yang menukar urutan penggabungannya, atau membulatkan
 * gross_amount, tes ini merah dan bukan produksi yang menemukannya.
 */
const TANDA_TANGAN_ACUAN =
  "16899cdb0595a4d047dcaba57697d104ddd7640aaca523e62c30a83eb3bfeb2d" +
  "1929ec88e57e84414946cca3da31601da191ed433781d8ef57f14ad65a33654d";

async function ujiTandaTangan() {
  eq(
    "rumus tanda tangan sesuai acuan",
    TANDA_TANGAN_ACUAN,
    await tandaTanganDiharapkan("HB-abc123-m5x7q9-8f2a", "200", "150000.00", KUNCI_UJI),
  );

  eq(
    "tanda tangan benar diterima",
    true,
    await tandaTanganCocok({ ...NOTIF_UJI, signature_key: TANDA_TANGAN_ACUAN }, KUNCI_UJI),
  );
  eq(
    "huruf besar tetap diterima",
    true,
    await tandaTanganCocok(
      { ...NOTIF_UJI, signature_key: TANDA_TANGAN_ACUAN.toUpperCase() },
      KUNCI_UJI,
    ),
  );

  // Inilah serangan yang sebenarnya: nominal atau status diubah, sisanya
  // dibiarkan. Tanda tangannya harus ikut tidak cocok.
  eq(
    "nominal yang diubah ditolak",
    false,
    await tandaTanganCocok(
      { ...NOTIF_UJI, gross_amount: "1000.00", signature_key: TANDA_TANGAN_ACUAN },
      KUNCI_UJI,
    ),
  );
  eq(
    "order id yang diubah ditolak",
    false,
    await tandaTanganCocok(
      { ...NOTIF_UJI, order_id: "HB-lain-m5x7q9-8f2a", signature_key: TANDA_TANGAN_ACUAN },
      KUNCI_UJI,
    ),
  );
  eq(
    "kunci server lain ditolak",
    false,
    await tandaTanganCocok(
      { ...NOTIF_UJI, signature_key: TANDA_TANGAN_ACUAN },
      "SB-Mid-server-KUNCILAIN",
    ),
  );
  eq("tanpa tanda tangan ditolak", false, await tandaTanganCocok(NOTIF_UJI, KUNCI_UJI));
  eq(
    "tanda tangan kosong ditolak",
    false,
    await tandaTanganCocok({ ...NOTIF_UJI, signature_key: "" }, KUNCI_UJI),
  );
}

// ── Yang tidak boleh hilang dari route ────────────────────────────────────
{
  const notif = baca("src/app/api/bayar/notifikasi/route.ts");
  eq("notifikasi memeriksa tanda tangan", true, notif.includes("tandaTanganCocok"));
  eq("notifikasi memeriksa nominal", true, notif.includes("nominalCocok"));
  // Route ini tidak boleh punya jalan pintas: tanpa penolakan eksplisit,
  // notifikasi yang tanda tangannya salah akan lolos ke penerapan.
  eq("notifikasi menolak tanda tangan salah", true, /status:\s*401/.test(notif));

  const bayar = baca("src/app/api/bayar/route.ts");
  eq("harga dirakit server", true, bayar.includes("bacaHarga()"));
  // Nominal dari klien adalah lubang yang paling mudah dibuat dan paling
  // mahal: yang dikirim peramban cuma id paket.
  eq("nominal tidak diterima dari klien", false, /body\.(harga|total|gross)/.test(bayar));
  eq("total dihitung dari rincian", true, bayar.includes("totalItem(items)"));

  // Kedua jalur harus bermuara ke fungsi penerapan yang sama, kalau tidak
  // suatu hari yang satu memperpanjang langganan dengan aturan berbeda dari
  // yang lain.
  eq("notifikasi memakai penerapan bersama", true, notif.includes("terapkanPembayaran"));
  eq(
    "pemeriksaan status memakai penerapan bersama",
    true,
    bayar.includes("terapkanPembayaran"),
  );

  const terap = baca("src/lib/pembayaran-server.ts");
  eq("penerapan dibungkus transaksi", true, terap.includes("runTransaction"));
  eq("penerapan menolak berjalan dua kali", true, terap.includes("diterapkanPada"));
  eq("penerapan menulis jejak audit", true, terap.includes("catatJejak"));
}

// ── Kunci server tidak boleh sampai ke peramban ───────────────────────────
{
  const klien = baca("src/components/BayarMidtrans.tsx");
  eq(
    "komponen klien tidak menyentuh kunci server",
    false,
    klien.includes("MIDTRANS_SERVER_KEY"),
  );

  const server = baca("src/lib/midtrans-server.ts");
  eq("berkas kunci server ditandai server-only", true, server.includes('import "server-only"'));
}

// ── CSP harus mengizinkan Snap ────────────────────────────────────────────
{
  // Sama seperti apis.google.com pada masuk dengan Google: skrip yang ditolak
  // CSP gagal tanpa satu pun permintaan jaringan, jadi yang terlihat cuma
  // tombol yang tidak membuka apa-apa dan tidak ada yang bisa ditelusuri.
  const cfg = baca("next.config.ts");
  const arahan = (nama: string) => cfg.match(new RegExp(`"${nama} ([^"]+)"`))?.[1] ?? "";

  for (const host of ["https://app.midtrans.com", "https://app.sandbox.midtrans.com"]) {
    eq(`script-src memuat ${host}`, true, arahan("script-src").includes(host));
    eq(`frame-src memuat ${host}`, true, arahan("frame-src").includes(host));
    eq(`connect-src memuat ${host}`, true, arahan("connect-src").includes(host));
  }
}

ujiTandaTangan().then(() => {
  console.log(fail === 0 ? "✓ midtrans: semua lolos" : `✗ midtrans: ${fail} gagal`);
  if (fail) process.exit(1);
});
