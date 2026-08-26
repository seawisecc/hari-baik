/**
 * Add-on hanya boleh dijual kalau fiturnya benar-benar ada.
 *
 * Empat add-on pernah tayang dan bisa dibeli di produksi, seharga Rp 225.000
 * kalau diambil semua, padahal tidak satu pun fiturnya ada di aplikasi.
 * Kepemilikannya pun tidak dicatat: daftar add-on hanya tersimpan di dokumen
 * permintaan aktivasi dan hilang begitu permintaannya disetujui, jadi tidak
 * ada satu tempat pun yang tahu siapa membayar apa.
 *
 * Tiga uji di bawah menjaga ketiganya.
 */
import { existsSync, readFileSync } from "node:fs";
import { ADDON_SIAP, addOnSiapJual } from "../addon-registry";
import { RUTE_ADDON } from "../gate";
import { HARGA_BAWAAN } from "../harga";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (expected !== actual) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

// 1. Setiap add-on yang ditandai siap jual harus punya halaman yang nyata.
//    Mendaftarkannya di sini adalah pernyataan bahwa fiturnya sudah jadi, dan
//    pernyataan itu diperiksa, bukan dipercaya begitu saja.
for (const [id, info] of Object.entries(ADDON_SIAP)) {
  const jalur = `src/app${info.rute}/page.tsx`;
  eq(`add-on ${id}: halaman ${info.rute} ada`, true, existsSync(jalur));
}

// 2. Tidak ada add-on bawaan yang aktif tanpa terdaftar siap jual.
for (const a of HARGA_BAWAAN.addOn) {
  if (a.aktif) {
    eq(`add-on aktif ${a.id} harus terdaftar siap jual`, true, addOnSiapJual(a.id));
  }
}

// 3. Penyaringnya harus benar-benar dipanggil di jalur yang menyajikan harga.
//    Tanpa ini, pengaturan di Firestore bisa menghidupkan kembali add-on yang
//    belum siap, dan penjaganya jadi hiasan.
{
  const sumber = readFileSync("src/lib/harga-server.ts", "utf8");
  eq("harga-server memakai daftar kesiapan", true, sumber.includes("addOnSiapJual"));
  eq("bacaHarga menyaring add-on", true, /return saringAddOn\(/.test(sumber));
  const jalurKeluar = (sumber.match(/return (?!saringAddOn)\w/g) ?? []).length;
  eq("tidak ada jalan keluar tanpa saringan di bacaHarga", 0, jalurKeluar);
}

// 4. Kepemilikan add-on harus tercatat di profil saat admin menyetujui.
{
  const rute = readFileSync("src/app/api/admin/aktivasi/route.ts", "utf8");
  eq("persetujuan menulis addOn ke profil", true, /addOn: addOnDimiliki/.test(rute));
  eq("add-on lama tidak tertimpa", true, rute.includes("current.addOn ?? []"));

  const tipe = readFileSync("src/types/index.ts", "utf8");
  eq("UserProfile punya field addOn", true, /^\s{2}addOn: string\[\];/m.test(tipe));

  const rules = readFileSync("firestore.rules", "utf8");
  eq("addOn terlindungi dari tulisan klien", true, rules.includes("'addOn'"));
}

// 5. Setiap rute yang dijaga sebagai add-on harus menunjuk add-on yang benar
//    ada di daftar harga dan sudah terdaftar siap jual. Tanpa ini, salah ketik
//    id membuat halaman terkunci selamanya untuk semua orang.
for (const [rute, info] of Object.entries(RUTE_ADDON)) {
  eq(
    `${rute}: id ${info.addOnId} ada di daftar harga`,
    true,
    HARGA_BAWAAN.addOn.some((a) => a.id === info.addOnId),
  );
  eq(`${rute}: id ${info.addOnId} terdaftar siap jual`, true, addOnSiapJual(info.addOnId));
  eq(`${rute}: halamannya ada`, true, existsSync(`src/app${rute}/page.tsx`));
}

// Sebaliknya: setiap add-on yang siap jual harus punya gerbangnya. Fitur yang
// dijual tapi tidak dijaga berarti dibuka gratis untuk semua orang.
for (const id of Object.keys(ADDON_SIAP)) {
  eq(
    `add-on ${id} punya rute terjaga`,
    true,
    Object.values(RUTE_ADDON).some((r) => r.addOnId === id),
  );
}

// 7. Route admin harus menolak id add-on yang tidak dikenal. Tanpa itu, salah
//    ketik tersimpan diam-diam ke profil pengguna dan tidak pernah membuka
//    apa pun, sementara admin mengira pelanggannya sudah aktif.
{
  const rute = readFileSync("src/app/api/admin/subscription/route.ts", "utf8");
  eq("aksi addon ada di daftar aksi", true, rute.includes('"addon"'));
  eq(
    "id add-on divalidasi terhadap katalog",
    true,
    rute.includes("HARGA_BAWAAN.addOn.map((a) => a.id)"),
  );
  eq("id asing ditolak", true, /Add-on tidak dikenal/.test(rute));
  eq("daftar dibersihkan dari duplikat", true, rute.includes("[...new Set(addOn)]"));
}

console.log(fail === 0 ? "✓ add-on: semua lolos" : `✗ add-on: ${fail} gagal`);
if (fail) process.exit(1);
