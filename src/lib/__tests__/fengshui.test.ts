/**
 * Fengshui nama usaha dan produk.
 *
 * Dua hal yang dijaga di sini. Pertama, tabel 81 angka harus utuh: satu angka
 * yang hilang berarti sebagian nama tidak punya jawaban sama sekali, dan itu
 * baru ketahuan di tangan pengguna. Kedua, reduksi ke rentang 1 sampai 81
 * harus benar di ujung-ujungnya, karena persis di situ aplikasi yang metodenya
 * dibedah untuk fitur ini salah: jumlah 160 membuatnya menunjuk ke luar tabel.
 */
import { readFileSync } from "node:fs";
import {
  BATAS_HURUF,
  HURUF_BERNILAI,
  KATA_IMBUHAN,
  NILAI_HURUF,
  TABEL_81,
  bandingkanNama,
  hitungFengshui,
  maknaAngka,
  nilaiKata,
  reduksi81,
  saranHuruf,
  saranKata,
  unsurAngka,
} from "../content/fengshui";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

// 1. Tabel harus utuh: 81 entri, berurut, tanpa lompatan dan tanpa duplikat.
eq("tabel punya 81 entri", 81, TABEL_81.length);
eq(
  "angka berurut 1 sampai 81",
  "",
  TABEL_81.map((a, i) => (a.angka === i + 1 ? "" : `posisi ${i}: ${a.angka}`))
    .filter(Boolean)
    .join(", "),
);

// 2. Tidak ada teks yang kosong. Satu tafsir kosong berarti halaman yang polos
//    untuk sebagian pengguna, dan itu fitur berbayar.
for (const a of TABEL_81) {
  const kosong: string[] = [];
  if (!a.nama.id.trim()) kosong.push("nama.id");
  if (!a.nama.en.trim()) kosong.push("nama.en");
  if (a.tafsir.id.trim().length < 40) kosong.push("tafsir.id");
  if (a.tafsir.en.trim().length < 40) kosong.push("tafsir.en");
  eq(`angka ${a.angka} teksnya lengkap`, "", kosong.join(","));
  if (!["baik", "campur", "kurang"].includes(a.nada)) {
    fail++;
    console.log("FAIL: nada tak dikenal pada angka", a.angka, a.nada);
  }
}

// 3. Ketiga nada harus benar-benar terpakai. Tabel yang seluruhnya "baik"
//    membuat fitur ini tidak berguna untuk memilih di antara kandidat.
for (const nada of ["baik", "campur", "kurang"] as const) {
  const n = TABEL_81.filter((a) => a.nada === nada).length;
  if (n < 10) {
    fail++;
    console.log(`FAIL: nada ${nada} cuma ${n} angka, terlalu sedikit`);
  }
}

// 4. Pemetaan huruf: 1 sampai 9 berulang, berhenti di Z=8.
eq("26 huruf terpetakan", 26, Object.keys(NILAI_HURUF).length);
eq("A", 1, NILAI_HURUF.A);
eq("I", 9, NILAI_HURUF.I);
eq("J kembali ke 1", 1, NILAI_HURUF.J);
eq("R", 9, NILAI_HURUF.R);
eq("S kembali ke 1", 1, NILAI_HURUF.S);
eq("Z berhenti di 8", 8, NILAI_HURUF.Z);
eq(
  "tidak ada nilai di luar 1 sampai 9",
  true,
  Object.values(NILAI_HURUF).every((n) => n >= 1 && n <= 9),
);

// Peta balikannya harus konsisten dengan peta majunya.
for (const [nilai, huruf] of Object.entries(HURUF_BERNILAI)) {
  eq(
    `huruf bernilai ${nilai} benar semua`,
    true,
    huruf.every((h) => NILAI_HURUF[h] === Number(nilai)),
  );
}

/*
 * 5. Reduksi ke 1 sampai 81.
 *
 * Aplikasi yang dibedah memakai `nilai % 80`, dan itu salah di dua tempat:
 * jumlah 160 memberi 0 lalu menunjuk indeks -1 di luar tabel, dan jumlah 161
 * seharusnya berhenti di 81 tapi malah turun ke 1. Empat baris pertama di
 * bawah ini adalah kasus itu.
 */
eq("160 tidak jatuh ke nol", 80, reduksi81(160));
eq("161 berhenti di 81", 81, reduksi81(161));
eq("240 tidak jatuh ke nol", 80, reduksi81(240));
eq("241 berhenti di 81", 81, reduksi81(241));
eq("1 tetap 1", 1, reduksi81(1));
eq("81 tetap 81", 81, reduksi81(81));
eq("82 turun ke 2", 2, reduksi81(82));
eq("162 turun ke 2", 2, reduksi81(162));

// Tidak ada jumlah yang bisa keluar dari tabel, sampai jauh di atas batas.
for (let n = 1; n <= 2000; n++) {
  const r = reduksi81(n);
  if (r < 1 || r > 81) {
    fail++;
    console.log("FAIL: reduksi81 keluar rentang", n, "->", r);
    break;
  }
}
eq(
  "setiap angka hasil punya makna",
  true,
  [...Array(81)].every((_, i) => !!maknaAngka(i + 1)),
);

// 6. Nilai acuan, dihitung tangan.
//    HARI BAIK = 8+1+9+9 + 2+1+9+2 = 41
const hb = hitungFengshui("Hari Baik");
eq("Hari Baik jumlahnya 41", 41, hb.jumlah);
eq("Hari Baik angkanya 41", 41, hb.angka);
eq("delapan huruf dihitung", 8, hb.rincian.length);
eq("spasi tidak dihitung sebagai diabaikan", 0, hb.diabaikan);

// Angka dan tanda baca diabaikan, dan jumlahnya dilaporkan.
const k88 = hitungFengshui("Kopi 88");
eq("Kopi 88 sama dengan Kopi", hitungFengshui("Kopi").jumlah, k88.jumlah);
eq("dua karakter dilaporkan diabaikan", 2, k88.diabaikan);

// Nama kosong tidak boleh melempar, dan tidak boleh berpura-pura punya hasil.
const kosong = hitungFengshui("   ");
eq("nama kosong: tidak ada huruf", 0, kosong.rincian.length);
eq("nama kosong: jumlahnya nol", 0, kosong.jumlah);

// 7. Nama sepanjang apa pun tetap aman, termasuk yang jumlahnya kelipatan 80.
//    17 huruf I (9) ditambah G (7) = 160, persis kasus yang salah di aplikasi asal.
const seratusEnamPuluh = hitungFengshui("I".repeat(17) + "G");
eq("jumlahnya memang 160", 160, seratusEnamPuluh.jumlah);
eq("angkanya 80, bukan 0", 80, seratusEnamPuluh.angka);
eq("maknanya ada", true, !!seratusEnamPuluh.makna.nama.id);

const panjang = hitungFengshui("I".repeat(BATAS_HURUF + 10));
eq("nama kelewat panjang dipotong", true, panjang.dipotong);
eq("dipotong tepat di batas", BATAS_HURUF, panjang.rincian.length);

// 8. Unsur dibaca dari digit terakhir.
eq("1 Kayu", "Kayu", unsurAngka(1));
eq("2 Kayu", "Kayu", unsurAngka(2));
eq("3 Api", "Api", unsurAngka(3));
eq("5 Tanah", "Tanah", unsurAngka(5));
eq("7 Logam", "Logam", unsurAngka(7));
eq("9 Air", "Air", unsurAngka(9));
eq("10 Air", "Air", unsurAngka(10));
eq("81 Kayu", "Kayu", unsurAngka(81));

// 9. Perbandingan kandidat: yang bernada baik naik ke atas, kosong dibuang,
//    dan urutan ketik jadi pemutus supaya hasilnya tidak berubah-ubah.
{
  const hasil = bandingkanNama(["Hari Baik", "", "   ", "Seawise"]);
  eq("kandidat kosong dibuang", 2, hasil.length);
  const nada = hasil.map((h) => h.makna.nada);
  const urut = [...nada].sort(
    (a, b) => ["baik", "campur", "kurang"].indexOf(a) - ["baik", "campur", "kurang"].indexOf(b),
  );
  eq("terurut dari yang paling mendukung", urut, nada);

  // Dua nama dengan nada sama harus tetap pada urutan ketiknya.
  const kembar = bandingkanNama(["Hari Baik", "Baik Hari"]);
  eq("nada keduanya sama", kembar[0].makna.nada, kembar[1].makna.nada);
  eq("urutan ketik dipertahankan", "Hari Baik", kembar[0].nama);
}

// 10. Saran hanya boleh menawarkan angka yang benar-benar bernada baik.
{
  const buruk = hitungFengshui("Kopi");
  const kata = saranKata(buruk);
  eq(
    "semua saran kata bernada baik",
    true,
    kata.every((s) => s.makna.nada === "baik"),
  );
  eq(
    "angka saran cocok dengan hitungannya",
    true,
    kata.every((s) => s.angka === reduksi81(buruk.jumlah + s.tambahan)),
  );
  eq(
    "tidak menawarkan angka yang sama dua kali",
    kata.length,
    new Set(kata.map((s) => s.angka)).size,
  );

  // Nama yang angkanya sudah mendukung tidak boleh ditawari perubahan apa pun.
  // Aturan ini harus di fungsinya, bukan di halaman, supaya pemanggil lain
  // tidak bisa memunculkan saran yang membingungkan.
  const sudahBaik = hitungFengshui("Hari Baik");
  eq("nama yang sudah baik: nadanya memang baik", "baik", sudahBaik.makna.nada);
  eq("tidak menyarankan kata", 0, saranKata(sudahBaik).length);
  eq("tidak menyarankan huruf", 0, saranHuruf(sudahBaik).length);

  // Nama kosong juga tidak punya apa pun untuk disarankan.
  eq("nama kosong tanpa saran kata", 0, saranKata(hitungFengshui("")).length);
  eq("nama kosong tanpa saran huruf", 0, saranHuruf(hitungFengshui("")).length);

  const huruf = saranHuruf(buruk);
  eq(
    "semua saran huruf bernada baik",
    true,
    huruf.every((s) => s.makna.nada === "baik"),
  );
  eq(
    "huruf yang ditawarkan benar nilainya",
    true,
    huruf.every((s) => s.huruf.every((h) => NILAI_HURUF[h] === s.selisih)),
  );
  eq(
    "selisihnya satu huruf saja",
    true,
    huruf.every((s) => s.selisih >= 1 && s.selisih <= 9),
  );
}

// Nilai kata dihitung dari hurufnya, bukan ditulis tangan, jadi cukup satu acuan.
eq("Jaya = 1+1+7+1", 10, nilaiKata("Jaya"));
eq("daftar kata tidak kosong", true, KATA_IMBUHAN.length >= 20);
eq(
  "semua kata imbuhan punya nilai",
  true,
  KATA_IMBUHAN.every((k) => nilaiKata(k) > 0),
);

/*
 * 11. Setiap nama, sependek apa pun, harus mendapat jawaban.
 *
 * Dijalankan atas seluruh huruf tunggal dan seluruh pasangan dua huruf: 702
 * masukan, cukup untuk memastikan tidak ada celah di ujung bawah tabel.
 */
{
  const abjad = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let rusak = 0;
  for (const a of abjad) {
    for (const b of ["", ...abjad]) {
      const h = hitungFengshui(a + b);
      if (h.angka < 1 || h.angka > 81 || !h.makna.tafsir.id) rusak++;
    }
  }
  eq("semua nama satu dan dua huruf punya hasil", 0, rusak);
}

// 12. Tidak ada em dash atau en dash di berkas kontennya.
{
  const sumber = readFileSync("src/lib/content/fengshui.ts", "utf8");
  eq("tanpa em dash", 0, (sumber.match(/—/g) ?? []).length);
  eq("tanpa en dash", 0, (sumber.match(/–/g) ?? []).length);
}

console.log(fail === 0 ? "✓ fengshui: semua lolos" : `✗ fengshui: ${fail} gagal`);
if (fail) process.exit(1);
