/** Menjalankan self-test engine sebagai bagian dari `npm run test`. */
import { readFileSync } from "node:fs";
import {
  ASTAWARA,
  CATURWARA,
  DASAWARA,
  LINTANG,
  PANCAWARA,
  SADWARA,
  SANGAWARA,
  SAPTAWARA,
  TRIWARA,
  getAstawara,
  getCaturwara,
  getDasawara,
  getLintang,
  getPancawara,
  getSadwara,
  getSangawara,
  getSaptawara,
  getTriwara,
  getWuku,
  runWarigaSelfTest,
  uripHari,
} from "../wariga";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (expected !== actual) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

const results = runWarigaSelfTest();
const gagalAcuan = results.filter((r) => !r.pass);
gagalAcuan.forEach((f) =>
  console.log("FAIL:", f.test, "| expected", f.expected, "| got", f.actual),
);
fail += gagalAcuan.length;

/*
 * Pemeriksaan seluruh siklus terhadap tabel 210 hari milik pemilik aplikasi.
 *
 * Tanggal contoh saja tidak cukup. Empat puluh satu acuan di atas semuanya
 * lolos, sebelum maupun sesudah perbaikan, padahal caturwara, astawara, dan
 * sangawara selama ini salah untuk sebagian besar hari: ketiganya tidak
 * pernah tersentuh satu pun acuan itu. Memeriksa 210 hari sekaligus menutup
 * celah semacam itu, karena setiap hari dalam siklus ikut diperiksa.
 */
{
  const fx = JSON.parse(readFileSync("src/lib/__tests__/fixtures/hari210.json", "utf8")) as {
    acuan: string;
    kolom: string[];
    baris: number[][];
  };

  const geser = (n: number) => {
    const d = new Date(fx.acuan + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };

  const periksa: {
    nama: string;
    kol: string;
    hitung: (t: string) => string | number;
    daftar?: readonly string[];
  }[] = [
    { nama: "wuku", kol: "wuku", hitung: (t) => getWuku(t).index + 1 },
    { nama: "triwara", kol: "tri", hitung: getTriwara, daftar: TRIWARA },
    { nama: "caturwara", kol: "catur", hitung: getCaturwara, daftar: CATURWARA },
    {
      nama: "pancawara",
      kol: "panca",
      hitung: (t) => getPancawara(t).name,
      daftar: PANCAWARA.map((w) => w.name),
    },
    { nama: "sadwara", kol: "sad", hitung: getSadwara, daftar: SADWARA },
    {
      nama: "saptawara",
      kol: "sapta",
      hitung: (t) => getSaptawara(t).name,
      daftar: SAPTAWARA.map((w) => w.name),
    },
    { nama: "astawara", kol: "asta", hitung: getAstawara, daftar: ASTAWARA },
    { nama: "sangawara", kol: "sanga", hitung: getSangawara, daftar: SANGAWARA },
    { nama: "dasawara", kol: "dasa", hitung: getDasawara, daftar: DASAWARA },
    { nama: "urip", kol: "urip", hitung: uripHari },
    { nama: "lintang", kol: "ltg", hitung: getLintang, daftar: LINTANG },
  ];

  for (const p of periksa) {
    const k = fx.kolom.indexOf(p.kol);
    let beda = 0;
    let pertama = "";
    for (let i = 0; i < fx.baris.length; i++) {
      const t = geser(i);
      const diharap = p.daftar ? p.daftar[fx.baris[i][k] - 1] : fx.baris[i][k];
      const didapat = p.hitung(t);
      if (diharap !== didapat) {
        beda++;
        if (!pertama) pertama = `${t}: tabel=${diharap} mesin=${didapat}`;
      }
    }
    eq(`${p.nama} cocok 210 hari${beda ? ` (${pertama})` : ""}`, 0, beda);
  }
}

console.log(
  fail === 0
    ? `✓ wariga: ${results.length}/${results.length} acuan + 210 hari penuh lolos`
    : `✗ wariga: ${fail} gagal`,
);
if (fail) process.exit(1);
