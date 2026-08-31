/**
 * Promo berjangka: potongan harga, bonus add-on, dan tanggal berakhirnya.
 *
 * Yang dijaga di sini bukan tampilan, melainkan janji. Harga yang tertulis di
 * halaman harus sama dengan harga yang ditagih, bonus yang dijanjikan harus
 * benar-benar ikut, dan promo yang lewat tanggalnya harus mati sendiri tanpa
 * ada yang perlu mengingatnya.
 */
import { HARGA_BAWAAN, type PengaturanHarga } from "../harga";
import { rakitPesanan } from "../pesanan";
import {
  DISKON_MAKS,
  PROMO_BAWAAN,
  PROMO_BONUS,
  bonusBolehDijual,
  bulatkanHarga,
  daftarPaketPromo,
  gabungPromo,
  hargaPromo,
  hematPromo,
  promoBerlaku,
  saringPromo,
  sisaHariPromo,
  type PengaturanPromo,
} from "../promo";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

const harga: PengaturanHarga = HARGA_BAWAAN;
const paketDari = (id: string) => harga.paket.find((p) => p.id === id)!;
const boleh = bonusBolehDijual(harga);

/** Di dalam masa promo bawaan, dan jauh sesudahnya. */
const saatPromo = new Date("2026-09-01T10:00:00+08:00");
const setelahPromo = new Date("2026-10-01T10:00:00+08:00");

// ---------------------------------------------------------------- masa berlaku

eq("promo bawaan berjalan di dalam masanya", true, promoBerlaku(PROMO_BAWAAN, saatPromo));
eq("promo mati sesudah tanggalnya", false, promoBerlaku(PROMO_BAWAAN, setelahPromo));
eq(
  "promo mati bila saklarnya mati",
  false,
  promoBerlaku({ ...PROMO_BAWAAN, aktif: false }, saatPromo),
);

/*
 * Tanpa tanggal berakhir, promo mati, bukan berlaku selamanya.
 *
 * Ini arah bawaan yang disengaja. Harga uji Rp 1.000 pernah tertinggal di
 * produksi berminggu-minggu justru karena tidak ada apa pun yang berakhir
 * dengan sendirinya. Promo yang kehilangan tanggalnya adalah bentuk yang sama
 * persis dari kesalahan itu.
 */
eq(
  "promo tanpa tanggal berakhir tidak berjalan",
  false,
  promoBerlaku({ ...PROMO_BAWAAN, berakhirPada: null }, saatPromo),
);
eq(
  "tanggal yang tidak bisa dibaca tidak menghidupkan promo",
  false,
  promoBerlaku({ ...PROMO_BAWAAN, berakhirPada: "besok pagi" }, saatPromo),
);

// Hari terakhir tetap tertulis "1 hari", bukan "0 hari" yang terbaca sudah lewat.
eq(
  "sisa hari dibulatkan ke atas",
  1,
  sisaHariPromo(PROMO_BAWAAN, new Date("2026-09-30T20:00:00+08:00")),
);
eq(
  "sisa hari 30 September dari 1 September",
  30,
  sisaHariPromo(PROMO_BAWAAN, new Date("2026-08-31T23:59:59+08:00")),
);
eq("sisa hari null saat promo mati", null, sisaHariPromo(PROMO_BAWAAN, setelahPromo));

// ---------------------------------------------------------------------- harga

eq("bulatkan ke bawah ke ribuan", 135_000, bulatkanHarga(135_999));
eq("bulatkan tidak pernah negatif", 0, bulatkanHarga(-5));

{
  const satu = hargaPromo(paketDari("tahunan"), PROMO_BAWAAN, saatPromo, boleh);
  const dua = hargaPromo(paketDari("dua-tahun"), PROMO_BAWAAN, saatPromo, boleh);
  const tiga = hargaPromo(paketDari("tiga-tahun"), PROMO_BAWAAN, saatPromo, boleh);

  eq("1 tahun potong 10%", 135_000, satu.harga);
  eq("2 tahun potong 20%", 216_000, dua.harga);
  eq("3 tahun potong 25%", 270_000, tiga.harga);

  eq(
    "harga asli tetap tersimpan",
    [150_000, 270_000, 360_000],
    [satu.hargaAsli, dua.hargaAsli, tiga.hargaAsli],
  );

  eq("paket satu tahun tanpa bonus", [], satu.bonusAddOn);
  eq("paket dua tahun dapat pencari hari", ["cari-hari-acara"], dua.bonusAddOn);
  eq(
    "paket tiga tahun dapat dua bonus",
    ["cari-hari-acara", "profil-keluarga"],
    tiga.bonusAddOn,
  );

  // Setelah tanggalnya lewat, yang keluar harus harga asli apa adanya, bukan
  // harga promo yang tertinggal.
  const lewat = hargaPromo(paketDari("dua-tahun"), PROMO_BAWAAN, setelahPromo, boleh);
  eq("harga kembali normal sendiri", 270_000, lewat.harga);
  eq("bonus ikut hilang saat promo lewat", [], lewat.bonusAddOn);
  eq("diskon nol saat promo lewat", 0, lewat.diskonPersen);
}

/*
 * Potongan tidak boleh membuat harga naik, seaneh apa pun isi pengaturannya.
 *
 * Pengaturan promo bisa disunting admin lewat API, dan yang dijaga di sini
 * bukan salah ketik yang wajar melainkan nilai yang mustahil: persen negatif,
 * persen di atas seratus, dan bukan angka sama sekali.
 */
{
  const nakal = (n: number): PengaturanPromo => ({
    aktif: true,
    berakhirPada: PROMO_BAWAAN.berakhirPada,
    paket: [{ paketId: "tahunan", diskonPersen: n }],
  });
  eq(
    "persen negatif tidak menaikkan harga",
    150_000,
    hargaPromo(paketDari("tahunan"), nakal(-50), saatPromo, boleh).harga,
  );
  eq(
    "persen di atas batas ditahan di batas",
    bulatkanHarga((150_000 * (100 - DISKON_MAKS)) / 100),
    hargaPromo(paketDari("tahunan"), nakal(500), saatPromo, boleh).harga,
  );
}

// ------------------------------------------------------------- bonus yang siap

/*
 * Bonus yang add-on-nya tidak dijual tidak boleh dijanjikan.
 *
 * Orang membeli paket panjang justru karena fitur yang ikut di dalamnya.
 * Menjanjikan sesuatu yang tidak bisa dibuka lebih buruk daripada tidak
 * menjanjikan apa-apa, karena kesalahannya baru terasa setelah uangnya masuk.
 */
{
  const tanpaPencari = hargaPromo(
    paketDari("tiga-tahun"),
    PROMO_BAWAAN,
    saatPromo,
    (id) => id !== "cari-hari-acara",
  );
  eq("bonus yang tidak dijual dibuang", ["profil-keluarga"], tanpaPencari.bonusAddOn);
}

// Setiap bonus di kode harus benar-benar ada di katalog add-on bawaan.
for (const [paketId, ids] of Object.entries(PROMO_BONUS)) {
  eq(
    `paket bonus ${paketId} ada di daftar harga`,
    true,
    harga.paket.some((p) => p.id === paketId),
  );
  for (const id of ids) {
    eq(
      `bonus ${id} ada di katalog add-on`,
      true,
      harga.addOn.some((a) => a.id === id),
    );
  }
}

// -------------------------------------------------------------------- hemat

{
  const semua = daftarPaketPromo(harga, saatPromo);
  eq("tiga paket aktif", 3, semua.length);
  // 135.000, 108.000, dan 90.000 per tahun.
  eq(
    "hemat dihitung dari harga yang dibayar",
    [0, 20, 33],
    semua.map((p) => hematPromo(p, semua)),
  );
}

// ------------------------------------------------------------------- pesanan

/*
 * Yang ditagih dan yang diberikan.
 *
 * Bagian ini yang paling menentukan, karena fungsi yang sama dipakai layar
 * langganan untuk menuliskan totalnya dan dipakai kedua route pembayaran untuk
 * menagihnya.
 */
{
  const dua = hargaPromo(paketDari("dua-tahun"), PROMO_BAWAAN, saatPromo, boleh);

  const polos = rakitPesanan(harga, dua, []);
  eq("total paket dua tahun tanpa tambahan", 216_000, polos.total);
  eq(
    "bonus ikut sebagai baris berharga nol",
    [{ id: "cari-hari-acara", nama: "Pencari Hari Acara", harga: 0 }],
    polos.addOnBonus,
  );
  eq(
    "bonus masuk ke daftar yang akan dimiliki",
    true,
    polos.addOn.some((a) => a.id === "cari-hari-acara"),
  );

  /*
   * Mencentang add-on yang sudah jadi bonus tidak boleh menambah tagihan.
   *
   * Kalau lolos, yang terjadi persis kebalikan dari yang dijanjikan halaman
   * depan: orang membayar untuk barang yang baru saja dinyatakan gratis.
   */
  const dobel = rakitPesanan(harga, dua, ["cari-hari-acara"]);
  eq("bonus yang ikut dicentang tidak ditagih", 216_000, dobel.total);
  eq("bonus tidak muncul di daftar yang dibayar", [], dobel.addOnBayar);
  eq(
    "bonus tetap diberikan sekali saja",
    1,
    dobel.addOn.filter((a) => a.id === "cari-hari-acara").length,
  );

  // Add-on lain tetap ditagih penuh.
  const plus = rakitPesanan(harga, dua, ["laporan-pdf"]);
  eq("add-on di luar bonus tetap ditagih", 216_000 + 60_000, plus.total);

  // Pesanan add-on saja: tidak ada paket, jadi tidak ada bonus dan tidak ada
  // potongan. Nol tahun tidak boleh diam-diam membawa hadiah.
  const sendiri = rakitPesanan(harga, null, ["laporan-pdf"]);
  eq("pesanan add-on saja tidak dapat bonus", [], sendiri.addOnBonus);
  eq("pesanan add-on saja tidak dapat potongan", 60_000, sendiri.total);
  eq("pesanan add-on saja tidak punya harga paket", 0, sendiri.hargaPaket);

  // Setelah promo lewat, jalur yang sama menagih harga penuh.
  const lewat = hargaPromo(paketDari("dua-tahun"), PROMO_BAWAAN, setelahPromo, boleh);
  eq("harga penuh ditagih setelah promo lewat", 270_000, rakitPesanan(harga, lewat, []).total);
  eq("tidak ada bonus setelah promo lewat", [], rakitPesanan(harga, lewat, []).addOnBonus);

  // Add-on yang dinonaktifkan admin tidak bisa dibeli lewat celah ini.
  const mati: PengaturanHarga = {
    ...harga,
    addOn: harga.addOn.map((a) => (a.id === "laporan-pdf" ? { ...a, aktif: false } : a)),
  };
  eq(
    "add-on nonaktif tidak masuk pesanan",
    [],
    rakitPesanan(mati, dua, ["laporan-pdf"]).addOnBayar,
  );
}

// ------------------------------------------------------- gabung dan saring

/*
 * Dokumen harga lama tidak membawa field promo sama sekali. Tanpa penggabungan
 * ini, promo tidak akan pernah muncul di pemasangan mana pun yang harganya
 * sudah pernah disimpan admin, dan tidak ada cara apa pun menyalakannya.
 */
eq("pengaturan tanpa promo jatuh ke bawaan", PROMO_BAWAAN, gabungPromo(undefined));
eq(
  "pengaturan promo rusak jatuh ke bawaan",
  PROMO_BAWAAN,
  gabungPromo({ aktif: true, berakhirPada: null, paket: null } as unknown as PengaturanPromo),
);

{
  const tersimpan: PengaturanPromo = {
    aktif: true,
    berakhirPada: "2027-01-01T00:00:00.000Z",
    paket: [{ paketId: "tahunan", diskonPersen: 15 }],
  };
  eq("pengaturan tersimpan menang", tersimpan, gabungPromo(tersimpan));

  /*
   * Bonus TIDAK ikut tersimpan, dan itu inti pemisahannya.
   *
   * Kalau bonus disimpan di Firestore, ia beku pada nilai saat admin pertama
   * kali menekan simpan, dan bonus yang ditambahkan belakangan di kode tidak
   * akan pernah muncul. Itu persis kesalahan yang sudah pernah terjadi pada
   * katalog add-on, yang membuat add-on baru tidak bisa dijual sama sekali.
   */
  const dengan = gabungPromo({
    ...tersimpan,
    paket: [{ paketId: "dua-tahun", diskonPersen: 20, bonusAddOn: ["ngawur"] }],
  } as unknown as PengaturanPromo);
  eq(
    "bonus dari pengaturan diabaikan",
    [{ paketId: "dua-tahun", diskonPersen: 20 }],
    dengan.paket,
  );
  eq(
    "bonus tetap datang dari kode",
    ["cari-hari-acara"],
    hargaPromo(paketDari("dua-tahun"), dengan, new Date("2026-12-01T00:00:00Z"), boleh)
      .bonusAddOn,
  );
}

eq(
  "potongan untuk paket yang tidak dijual dibuang",
  [],
  saringPromo(PROMO_BAWAAN, ["paket-lain"]).paket,
);
eq(
  "potongan untuk paket yang dijual tetap ada",
  3,
  saringPromo(PROMO_BAWAAN, ["tahunan", "dua-tahun", "tiga-tahun"]).paket.length,
);

console.log(fail === 0 ? "✓ promo: semua lolos" : `✗ promo: ${fail} gagal`);
if (fail > 0) process.exit(1);
