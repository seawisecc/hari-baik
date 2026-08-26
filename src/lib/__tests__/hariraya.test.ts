/**
 * Hari raya yang dihitung, diuji terhadap tanggal yang diketahui.
 *
 * Tanggal acuan diambil dari tabel aplikasi sebelumnya, KECUALI Galungan dan
 * Kuningan 2027: tabel itu terbukti salah satu hari, karena jarak antar
 * Galungan di sana 211 hari padahal siklus pawukon selalu tepat 210.
 */
import {
  hariRayaTerhitung,
  isGalungan,
  isKuningan,
  isNyepi,
  isPagerwesi,
  isSaraswati,
  isSiwaratri,
} from "../wariga/hariraya";
import { getLunar, getSasih, toDateString } from "../wariga";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    fail++;
    console.log(
      "FAIL:",
      label,
      "| expected",
      JSON.stringify(expected),
      "| got",
      JSON.stringify(actual),
    );
  }
};

function semua(uji: (t: string) => boolean, dari: string, sampai: string): string[] {
  const out: string[] = [];
  const d = new Date(dari + "T12:00:00");
  const akhir = new Date(sampai + "T12:00:00");
  while (d <= akhir) {
    const t = toDateString(d);
    if (uji(t)) out.push(t);
    d.setDate(d.getDate() + 1);
  }
  return out;
}

const A = "2026-01-01";
const B = "2027-12-31";

eq("Galungan", ["2026-06-17", "2027-01-13", "2027-08-11"], semua(isGalungan, A, B));
eq("Kuningan", ["2026-06-27", "2027-01-23", "2027-08-21"], semua(isKuningan, A, B));
eq(
  "Saraswati",
  ["2026-04-04", "2026-10-31", "2027-05-29", "2027-12-25"],
  semua(isSaraswati, A, B),
);
eq(
  "Pagerwesi",
  ["2026-04-08", "2026-11-04", "2027-06-02", "2027-12-29"],
  semua(isPagerwesi, A, B),
);
eq("Nyepi", ["2026-03-19", "2027-03-08"], semua(isNyepi, A, B));
// Tiga kali dalam dua tahun Masehi: tahun lunar hanya sekitar 354 hari,
// jadi sasih yang sama bisa muncul dua kali dalam satu tahun Masehi.
eq("Siwaratri", ["2026-01-17", "2027-01-06", "2027-12-26"], semua(isSiwaratri, A, B));

const sw = semua(isSiwaratri, A, B);
for (let i = 1; i < sw.length; i++) {
  const selisih = Math.round(
    (new Date(sw[i] + "T12:00:00").getTime() - new Date(sw[i - 1] + "T12:00:00").getTime()) /
      86_400_000,
  );
  eq(`jarak Siwaratri ${i} sekitar setahun lunar`, true, selisih >= 353 && selisih <= 355);
}

// Kuningan selalu sepuluh hari setelah Galungan.
const g = semua(isGalungan, A, B);
const k = semua(isKuningan, A, B);
g.forEach((tgl, i) => {
  const selisih = Math.round(
    (new Date(k[i] + "T12:00:00").getTime() - new Date(tgl + "T12:00:00").getTime()) /
      86_400_000,
  );
  eq(`Kuningan ${i} sepuluh hari setelah Galungan`, 10, selisih);
});

// Siklus pawukon tepat 210 hari; jarak lain menandakan data yang salah.
for (let i = 1; i < g.length; i++) {
  const selisih = Math.round(
    (new Date(g[i] + "T12:00:00").getTime() - new Date(g[i - 1] + "T12:00:00").getTime()) /
      86_400_000,
  );
  eq(`jarak Galungan ${i} = 210 hari`, 210, selisih);
}

// Hari turunan.
eq(
  "Penampahan Galungan",
  true,
  hariRayaTerhitung("2026-06-16").includes("Penampahan Galungan"),
);
eq("Manis Galungan", true, hariRayaTerhitung("2026-06-18").includes("Manis Galungan"));
eq(
  "Tawur Agung sehari sebelum Nyepi",
  true,
  hariRayaTerhitung("2026-03-18").includes("Tawur Agung Kesanga"),
);
eq(
  "Ngembak Geni sehari setelah Nyepi",
  true,
  hariRayaTerhitung("2026-03-20").includes("Ngembak Geni"),
);

// Hari biasa tidak boleh memunculkan apa pun.
eq("hari biasa kosong", [], hariRayaTerhitung("2026-06-20"));

// Rumusnya harus tetap jalan jauh ke depan tanpa tabel apa pun.
eq("Galungan 2030 ada", true, semua(isGalungan, "2030-01-01", "2030-12-31").length >= 1);
// Nyepi dan Siwaratri SENGAJA tidak dihitung di luar rentang sasih yang
// terverifikasi. Model sasih di mesin ini belum punya nampih sasih, jadi
// namanya bergeser satu bulan tiap sekitar tiga tahun. Menampilkan hari raya
// yang salah lebih merugikan daripada tidak menampilkannya.
eq("Nyepi 2035 tidak diklaim", 0, semua(isNyepi, "2035-01-01", "2035-12-31").length);
eq("Nyepi 2027 masih dihitung", 1, semua(isNyepi, "2027-01-01", "2027-12-31").length);
eq("Siwaratri 2035 tidak diklaim", 0, semua(isSiwaratri, "2035-01-01", "2035-12-31").length);

/*
 * Sasih: nama bulan Bali.
 *
 * getSasih dulu memakai Math.round, sehingga pada hari-hari Panglong umur
 * bulannya sudah lewat setengah siklus dan pembulatannya melompat ke bulan
 * berikutnya. Namanya jadi berganti di tengah bulan, dan separuh kalender
 * memakai nama sasih yang salah tanpa ada yang kelihatan rusak.
 *
 * Dua uji di bawah menangkapnya tanpa perlu acuan luar sama sekali.
 */

// 1. Nama sasih hanya boleh berganti tepat pada Penanggal 1, tidak pernah di
//    tengah bulan lunar.
{
  // getLunar memakai HALF_SYNODIC 14.765, yang dipatok agar sama dengan
  // aplikasi sebelumnya dan sedikit berbeda dari setengah bulan sinodis
  // sebenarnya. Sesekali, sekitar tujuh kali dalam tiga puluh tahun, selisih
  // itu membuat penomorannya melompat dari Panglong 15 langsung ke Penanggal
  // 2. Pergantian sasih di hari seperti itu tetap benar, jadi dihitung sah.
  let salahTempat = 0;
  let lompatanDiketahui = 0;
  const mulai = new Date(Date.UTC(2026, 0, 1));
  let sebelumnya = getSasih(toDateString(mulai));
  let fasSebelumnya = getLunar(toDateString(mulai));
  for (let i = 0; i < 800; i++) {
    mulai.setUTCDate(mulai.getUTCDate() + 1);
    const t = toDateString(mulai);
    const l = getLunar(t);
    const sekarang = getSasih(t);
    const awalBulanLunar =
      (l.phase === "Penanggal" && l.day === 1) ||
      (fasSebelumnya.phase === "Panglong" &&
        fasSebelumnya.day === 15 &&
        l.phase === "Penanggal");
    if (l.phase === "Penanggal" && l.day !== 1 && fasSebelumnya.phase === "Panglong") {
      lompatanDiketahui++;
    }
    if ((sekarang !== sebelumnya) !== awalBulanLunar) salahTempat++;
    sebelumnya = sekarang;
    fasSebelumnya = l;
  }
  eq("sasih hanya berganti di awal bulan lunar", 0, salahTempat);
  // Kalau angka ini melonjak, ada yang berubah pada HALF_SYNODIC.
  eq("lompatan Penanggal 1 tetap langka", true, lompatanDiketahui <= 2);
}

// 2. Siwaratri adalah purwaning tilem: Panglong 14 sasih Kapitu, malam
//    sebelum bulan mati. Ditulis sesuai sumber tradisional.
for (const t of semua(isSiwaratri, "2026-01-01", "2027-12-31")) {
  const l = getLunar(t);
  eq(`Siwaratri ${t} jatuh pada Panglong 14`, "Panglong 14", `${l.phase} ${l.day}`);
  eq(`Siwaratri ${t} sasih Kapitu`, "Kapitu", getSasih(t));
}

// 3. Bukti silang yang tidak bergantung pada penamaan: dari Panglong 14 Kapitu
//    ke Penanggal 1 Kadasa terpisah dua bulan lunar penuh, jadi sekitar 61
//    hari. Kalau bulannya benar-benar Kaulu, jaraknya hanya sekitar 31.
{
  const siwaratri = semua(isSiwaratri, "2026-01-01", "2027-12-31");
  const nyepi = semua(isNyepi, "2026-01-01", "2027-12-31");
  for (const sw of siwaratri) {
    const berikut = nyepi.find((n) => n > sw);
    if (!berikut) continue;
    const jarak = Math.round(
      (Date.parse(berikut + "T00:00:00Z") - Date.parse(sw + "T00:00:00Z")) / 86_400_000,
    );
    eq(`jarak ${sw} ke Nyepi ${berikut} dua bulan lunar`, true, jarak >= 59 && jarak <= 63);
  }
}

// Nyepi tetap Penanggal 1 Kadasa; perbaikan sasih tidak boleh menggesernya.
for (const t of semua(isNyepi, "2026-01-01", "2027-12-31")) {
  eq(`Nyepi ${t} sasih Kadasa`, "Kadasa", getSasih(t));
}

console.log(fail === 0 ? "✓ hari raya: semua lolos" : `✗ hari raya: ${fail} gagal`);
if (fail) process.exit(1);
