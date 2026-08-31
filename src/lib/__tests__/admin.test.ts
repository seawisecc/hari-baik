/**
 * Pencarian, ekspor, dan penghapusan pengguna di panel admin.
 *
 * Ketiganya bekerja pada daftar pelanggan sungguhan, jadi kesalahannya tidak
 * kelihatan seperti kesalahan: pencarian yang meleset terbaca sebagai
 * "orangnya memang belum daftar", ekspor yang salah kutip terbaca sebagai
 * "Excel-nya aneh", dan penghapusan yang lolos penjaga tidak terbaca sama
 * sekali sampai ada yang menanyakan akunnya.
 */
import { readFileSync } from "node:fs";
import { cariPengguna, cocokCari, angkaNomor, normalkan } from "../admin-cari";
import { barisPengguna, csvPengguna, nilaiCsv, namaBerkas, KOLOM } from "../admin-ekspor";
import { alasanTolak, bolehDihapus, emailCocok } from "../admin-hapus";
import { bolehPeriksaUlang, cocokPembayaran, saringPembayaran } from "../admin-pembayaran";
import type { PenggunaAdmin } from "../../types";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (expected !== actual) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

const KINI = new Date("2026-08-28T04:00:00.000Z");

function buat(ubah: Partial<PenggunaAdmin> = {}): PenggunaAdmin {
  return {
    uid: "u1",
    email: "budi@gmail.com",
    nama: "I Wayan Budi Artha",
    tanggalLahir: "1990-05-17",
    phoneNumber: "081234567890",
    role: "user",
    subscriptionStatus: "expired",
    subscriptionExpiresAt: null,
    trialEndsAt: "2026-01-01T00:00:00.000Z",
    addOn: [],
    onboardingComplete: true,
    createdAt: "2025-12-29T02:11:00.000Z",
    saptaWaraLahir: "Kamis",
    pancaWaraLahir: "Umanis",
    sadWaraLahir: "Paniron",
    wukuLahir: "Sinta",
    uripLahir: 13,
    uripPetemonLahir: 21,
    emailTerverifikasi: true,
    ...ubah,
  };
}

// ── Pencarian ─────────────────────────────────────────────────────────────
{
  const u = buat();

  eq("normalkan merapatkan spasi", "i wayan budi", normalkan("  I   Wayan  Budi "));

  eq("kunci kosong mencocokkan semua", true, cocokCari(u, "   "));
  eq("nama sebagian", true, cocokCari(u, "budi"));
  eq("tidak peduli besar kecil huruf", true, cocokCari(u, "BUDI"));
  eq("email", true, cocokCari(u, "gmail"));
  eq("yang tidak ada tetap tidak ketemu", false, cocokCari(u, "ketut"));

  // Kata dipecah dan semuanya harus ketemu, tapi tidak harus berurutan.
  eq("dua kata dari bagian berbeda", true, cocokCari(u, "budi gmail"));
  eq("dua kata yang tidak berdampingan", true, cocokCari(u, "wayan artha"));
  eq("satu kata meleset menggagalkan semuanya", false, cocokCari(u, "budi ketut"));

  // Nomor HP: yang disimpan berawalan 0, yang disalin admin dari WhatsApp
  // berawalan 62. Keduanya harus saling menemukan.
  eq("angkaNomor menyeragamkan awalan", "6281234567890", angkaNomor("0812-3456-7890"));
  eq("angkaNomor membuang tanda baca", "6281234567890", angkaNomor("+62 812 3456 7890"));
  eq("cari nomor bentuk 0", true, cocokCari(u, "081234"));
  eq("cari nomor bentuk 62", true, cocokCari(u, "6281234"));
  eq("cari nomor bertanda plus", true, cocokCari(u, "+62 812 3456 7890"));
  eq("nomor orang lain tidak ketemu", false, cocokCari(u, "089999"));

  // Nomor kosong tidak boleh membuat pencarian angka apa pun jadi cocok.
  eq("tanpa nomor, cari angka gagal", false, cocokCari(buat({ phoneNumber: null }), "0812"));

  const daftar = [u, buat({ uid: "u2", nama: "Ni Ketut Sari", email: "sari@yahoo.com" })];
  eq("saring mengembalikan yang cocok saja", "u2", cariPengguna(daftar, "ketut")[0]?.uid);
  eq("kunci kosong tidak menyaring", 2, cariPengguna(daftar, "").length);
}

// ── Ekspor ────────────────────────────────────────────────────────────────
{
  eq("kolom uid paling depan", "uid", KOLOM[0]);
  eq("jumlah kolom cocok dengan jumlah nilai", KOLOM.length, barisPengguna(buat()).length);

  // Pengutipan RFC 4180.
  eq("nilai biasa tidak dikutip", "budi", nilaiCsv("budi"));
  eq("koma memaksa kutip", '"Budi, S.T."', nilaiCsv("Budi, S.T."));
  eq("kutip digandakan", '"Budi ""Bagus"""', nilaiCsv('Budi "Bagus"'));
  eq("baris baru memaksa kutip", '"a\nb"', nilaiCsv("a\nb"));

  // Sel yang diawali tanda rumus diberi kutip tunggal, kalau tidak Excel dan
  // Sheets menjalankannya sebagai rumus. Nama diisi sendiri oleh pengguna.
  eq("rumus dilucuti", "'=1+1", nilaiCsv("=1+1"));
  eq("rumus berkoma tetap dikutip juga", '"\'=SUM(A1,A2)"', nilaiCsv("=SUM(A1,A2)"));
  eq("plus di depan dilucuti", "'+62812", nilaiCsv("+62812"));
  eq("minus di depan dilucuti", "'-2", nilaiCsv("-2"));
  eq("at di depan dilucuti", "'@budi", nilaiCsv("@budi"));
  eq("tanda di tengah dibiarkan", "a=b", nilaiCsv("a=b"));

  const baris = barisPengguna(buat({ subscriptionStatus: "lifetime" }));
  eq("selamanya ditulis apa adanya", "tanpa batas", baris[KOLOM.indexOf("berlaku sampai")]);

  // Tanggal habis disimpan sebagai akhir hari WITA, yang di UTC jatuh sore
  // hari tanggal yang sama. Dipotong dari untaiannya supaya tidak bergeser
  // mengikuti zona waktu mesin yang menjalankan server.
  const aktif = barisPengguna(
    buat({ subscriptionStatus: "active", subscriptionExpiresAt: "2027-03-01T15:59:59.000Z" }),
  );
  eq("tanggal habis tidak bergeser", "2027-03-01", aktif[KOLOM.indexOf("berlaku sampai")]);
  eq("tanggal daftar dipotong", "2025-12-29", aktif[KOLOM.indexOf("tanggal daftar")]);
  eq("status berlabel Indonesia", "Aktif", aktif[KOLOM.indexOf("status")]);

  const kolomVerif = KOLOM.indexOf("email terverifikasi");
  eq("verifikasi ya", "ya", barisPengguna(buat({ emailTerverifikasi: true }))[kolomVerif]);
  eq(
    "verifikasi belum",
    "belum",
    barisPengguna(buat({ emailTerverifikasi: false }))[kolomVerif],
  );
  // Kosong berarti tidak diketahui, bukan belum.
  eq(
    "verifikasi tak diketahui",
    "",
    barisPengguna(buat({ emailTerverifikasi: null }))[kolomVerif],
  );

  const kosong = barisPengguna(buat({ tanggalLahir: null, uripLahir: null }));
  eq("lahir kosong jadi sel kosong", "", kosong[KOLOM.indexOf("tanggal lahir")]);
  eq("urip kosong bukan tulisan null", "", kosong[KOLOM.indexOf("urip")]);
  eq(
    "urip 0 tetap tertulis",
    "0",
    barisPengguna(buat({ uripLahir: 0 }))[KOLOM.indexOf("urip")],
  );

  const csv = csvPengguna([buat()]);
  eq("berkas diawali BOM", true, csv.charCodeAt(0) === 0xfeff);
  eq("baris dipisah CRLF", true, csv.includes("\r\n"));
  eq("ada satu baris judul dan satu baris isi", 2, csv.trimEnd().split("\r\n").length);
  eq("judul kolom ikut terkirim", true, csv.includes("uid,nama,email"));

  eq(
    "nama berkas menyebut saringannya",
    "hari-baik-pengguna-active-cari-2026-08-28.csv",
    namaBerkas("active", "budi", KINI),
  );
  eq(
    "tanpa saringan, nama berkas tetap bertanggal",
    "hari-baik-pengguna-2026-08-28.csv",
    namaBerkas(null, "", KINI),
  );
}

// ── Penghapusan ───────────────────────────────────────────────────────────
{
  eq("langganan habis boleh dihapus", true, bolehDihapus(buat(), KINI));

  eq("admin ditolak", "admin", alasanTolak(buat({ role: "admin" }), KINI));
  eq(
    "yang menunggu keputusan ditolak",
    "menunggu",
    alasanTolak(buat({ subscriptionStatus: "pending" }), KINI),
  );
  eq(
    "pelanggan aktif ditolak",
    "aktif",
    alasanTolak(
      buat({ subscriptionStatus: "active", subscriptionExpiresAt: "2027-01-01T00:00:00.000Z" }),
      KINI,
    ),
  );
  eq(
    "pemegang seumur hidup ditolak",
    "aktif",
    alasanTolak(buat({ subscriptionStatus: "lifetime" }), KINI),
  );

  // Trial yang masih berjalan adalah calon pelanggan, bukan sisa yang perlu
  // dibersihkan. Yang sudah lewat masa cobanya baru boleh.
  eq(
    "trial yang masih jalan ditolak",
    "aktif",
    alasanTolak(
      buat({ subscriptionStatus: "trial", trialEndsAt: "2026-09-01T00:00:00.000Z" }),
      KINI,
    ),
  );
  eq(
    "trial yang sudah habis boleh",
    null,
    alasanTolak(
      buat({ subscriptionStatus: "trial", trialEndsAt: "2026-08-01T00:00:00.000Z" }),
      KINI,
    ),
  );

  // Langganan yang tanggalnya sudah lewat tapi statusnya belum sempat
  // diperbarui tetap terbaca sebagai tidak aktif, karena yang ditanya adalah
  // evaluateAccess(), bukan field statusnya.
  eq(
    "status active dengan tanggal lewat boleh dihapus",
    null,
    alasanTolak(
      buat({ subscriptionStatus: "active", subscriptionExpiresAt: "2026-06-01T00:00:00.000Z" }),
      KINI,
    ),
  );

  /*
   * Yang mendaftar lalu berhenti di layar verifikasi.
   *
   * Trialnya secara hitungan masih berjalan, jadi evaluateAccess() bilang
   * aksesnya hidup, padahal di layar dia tidak bisa membuka apa pun. Akun
   * seperti inilah yang paling banyak menumpuk, dan penjaga trial justru
   * membuatnya jadi satu-satunya yang tidak bisa dibersihkan.
   */
  const belumVerifikasi = {
    subscriptionStatus: "trial" as const,
    trialEndsAt: "2026-09-01T00:00:00.000Z",
  };
  eq(
    "trial berjalan yang belum verifikasi boleh dihapus",
    null,
    alasanTolak(buat({ ...belumVerifikasi, emailTerverifikasi: false }), KINI),
  );
  eq(
    "trial berjalan yang sudah verifikasi tetap ditolak",
    "aktif",
    alasanTolak(buat({ ...belumVerifikasi, emailTerverifikasi: true }), KINI),
  );
  // Tidak diketahui bukan alasan untuk menghapus. Menebak ke arah menghapus
  // adalah arah tebakan yang salah.
  eq(
    "status verifikasi tidak diketahui tetap ditolak",
    "aktif",
    alasanTolak(buat({ ...belumVerifikasi, emailTerverifikasi: null }), KINI),
  );
  // Pengecualiannya hanya melewati penjaga trial, bukan penjaga yang lain.
  eq(
    "admin yang belum verifikasi tetap ditolak",
    "admin",
    alasanTolak(buat({ role: "admin", emailTerverifikasi: false }), KINI),
  );
  eq(
    "yang menunggu dan belum verifikasi tetap ditolak",
    "menunggu",
    alasanTolak(buat({ subscriptionStatus: "pending", emailTerverifikasi: false }), KINI),
  );

  eq("email cocok apa adanya", true, emailCocok("budi@gmail.com", "budi@gmail.com"));
  eq("besar kecil huruf diabaikan", true, emailCocok("BUDI@Gmail.com ", "budi@gmail.com"));
  eq("email lain ditolak", false, emailCocok("budi@gmail.co", "budi@gmail.com"));
  eq("kosong ditolak", false, emailCocok("", "budi@gmail.com"));
}

// ── Penjaga yang hanya ada di route, bukan di fungsi murni ────────────────
{
  const hapus = readFileSync("src/app/api/admin/hapus/route.ts", "utf8");

  // Menghapus dokumen tanpa menghapus akun Auth membuat orangnya bisa masuk
  // lagi dan mendapat trial baru dari bootstrap. Keduanya harus ada.
  eq("akun Auth ikut dihapus", true, hapus.includes("deleteUser(uid)"));
  eq("dokumen ikut dihapus", true, hapus.includes("ref.delete()"));
  // Keduanya harus benar-benar ada sebelum urutannya berarti apa-apa. Tanpa
  // syarat itu, menghapus baris deleteUser justru membuat tes urutan ini
  // lolos, karena indexOf mengembalikan -1 yang selalu lebih kecil.
  {
    const auth = hapus.indexOf("deleteUser(uid)");
    const dok = hapus.indexOf("ref.delete()");
    eq("Auth dihapus lebih dulu", true, auth >= 0 && dok >= 0 && auth < dok);
  }

  // Field role di dokumen bukan sumber kebenaran hak admin, jadi penjaga
  // "jangan hapus diri sendiri" tidak boleh bersandar padanya.
  eq("tidak bisa menghapus diri sendiri", true, hapus.includes("uid === admin.uid"));
  eq("email konfirmasi diperiksa ulang di server", true, hapus.includes("emailCocok("));
  eq("aturan boleh atau tidaknya dipakai bersama", true, hapus.includes("alasanTolak("));
  eq("salinan profil masuk jejak", true, /detail:\s*\{[^}]*profil/.test(hapus));

  const verif = readFileSync("src/app/api/admin/verifikasi/route.ts", "utf8");

  // Token yang sedang dipegang pengguna masih membawa emailVerified yang lama,
  // dan tentukanAlihan() membacanya dari token itu. Tanpa pencabutan, orangnya
  // tetap tertahan di /verify-email sesudah ditandai, dan admin akan mengira
  // tombolnya tidak bekerja.
  eq("token lama dicabut setelah ditandai", true, verif.includes("revokeRefreshTokens(uid)"));

  // Verifikasi email milik Firebase Auth. Menyalinnya ke dokumen Firestore
  // membuat nilai kedua yang pasti akan basi lalu suatu hari dipercaya.
  eq("status verifikasi tidak disalin ke Firestore", false, verif.includes(".update("));

  const daftar = readFileSync("src/app/api/admin/users/route.ts", "utf8");
  const ekspor = readFileSync("src/app/api/admin/ekspor/route.ts", "utf8");
  const status = readFileSync("src/lib/status-verifikasi.ts", "utf8");

  eq("status verifikasi dibaca dari Auth", true, status.includes("getUsers("));
  // Dicocokkan ke bentuk tulisan Firestore, bukan ke nama methodnya saja: Map
  // juga punya .set(), dan modul ini memang memakainya untuk mengingat status
  // yang baru dibaca.
  eq("dan tidak disimpan ke Firestore", false, /\.doc\([^)]*\)\.(set|update)\(/.test(status));

  // Keduanya wajib memakai modul yang sama. Kalau ekspor punya salinan
  // aturannya sendiri, cepat atau lambat berkas CSV dan layar akan berselisih
  // tentang orang yang sama, dan yang dipercaya orang adalah yang terakhir
  // dilihatnya.
  eq("daftar memakai modul bersama", true, daftar.includes("denganVerifikasi("));
  eq("ekspor memakai modul bersama", true, ekspor.includes("denganVerifikasi("));

  // Ekspor tidak mengubah apa pun, jadi tidak tertangkap pemeriksa jejak di
  // lahir.test.ts yang hanya melihat POST, PUT, PATCH, dan DELETE.
  eq("ekspor tetap menulis jejak", true, ekspor.includes("catatJejak("));
  eq(
    "berkas tidak boleh nyangkut di cache",
    true,
    ekspor.includes('"Cache-Control": "no-store"'),
  );
}

/*
 * Panel kelola dirender dua kali, jadi id kolom isian tidak boleh ditulis
 * sendiri.
 *
 * UserTable merender kartu ponsel DAN tabel layar lebar sekaligus; yang
 * menyembunyikan salah satunya cuma CSS, jadi keduanya ada di DOM. Id yang
 * ditulis sendiri jadi kembar, dan setiap label menunjuk elemen PERTAMA yang
 * ber-id itu, yaitu salinan kartu ponsel yang display-nya none. Elemen
 * ber-display none tidak bisa menerima fokus, jadi di laptop menekan label
 * tidak memfokuskan apa pun dan yang diketik tidak masuk ke mana-mana.
 *
 * Gejalanya persis seperti fitur yang mati: tombol hapus tidak pernah menyala
 * karena kolom konfirmasinya tetap kosong, padahal di ponsel semuanya normal.
 * Terukur di peramban pada lebar 1680: fokus mendarat di BODY. Tiga kolom kena
 * sekaligus (tanggal habis, tanggal lahir, konfirmasi hapus) dan hanya satu
 * yang dilaporkan, jadi dua sisanya sempat tidak diketahui siapa pun.
 */
{
  const tabel = readFileSync("src/components/admin/UserTable.tsx", "utf8");

  // Kalau suatu hari hanya satu pohon yang dirender, aturan di bawah boleh
  // dilonggarkan. Selama keduanya ada, tidak boleh.
  eq("kartu ponsel dan tabel dirender berdampingan", true, /md:hidden/.test(tabel));
  eq("tabel disembunyikan lewat CSS, bukan dilepas", true, /hidden[^"]*md:block/.test(tabel));

  const dipakaiDuaKali = [
    "src/components/admin/HapusPengguna.tsx",
    "src/components/admin/AturTanggalLahir.tsx",
    "src/components/admin/AturLangganan.tsx",
    "src/components/admin/AturAddOn.tsx",
    "src/components/admin/TandaiVerifikasi.tsx",
  ];

  for (const f of dipakaiDuaKali) {
    const isi = readFileSync(f, "utf8");
    if (!isi.includes("htmlFor")) continue;

    // htmlFor yang berupa untaian harfiah pasti kembar: nilainya sama untuk
    // kedua salinan.
    eq(`${f}: htmlFor bukan untaian harfiah`, false, /htmlFor="/.test(isi));
    // id yang berupa untaian harfiah, sama saja.
    eq(`${f}: id bukan untaian harfiah`, false, /\sid="/.test(isi));
    // Termasuk id yang dirangkai dari uid: satu pengguna tetap punya dua
    // salinan di layar, jadi uid tidak membuatnya unik.
    eq(`${f}: id tidak dirangkai dari uid`, false, /id=\{`[^`]*\$\{u\.uid\}/.test(isi));
    eq(`${f}: memakai useId`, true, isi.includes("useId()"));
  }
}

/*
 * Daftar pembayaran di panel admin.
 *
 * Layar ini dibuka justru ketika ada yang salah: seseorang mengaku sudah
 * membayar tapi aplikasinya masih terkunci. Pencarian yang meleset di sini
 * terbaca sebagai "pesanannya memang tidak ada", dan itu jawaban yang salah
 * kepada orang yang uangnya sudah keluar.
 */
{
  const contoh = {
    orderId: "HB-abc123-m5x7q9-8f2a",
    email: "Wayan.Sutrisna@Gmail.com",
    nama: "Wayan Sutrisna",
    transactionId: "05eab30a-2c8a-46ef-922d-db704c45e426",
  };

  eq("cocok lewat email", true, cocokPembayaran(contoh, "wayan.sutrisna@gmail.com"));
  eq("besar kecil huruf diabaikan", true, cocokPembayaran(contoh, "WAYAN"));
  eq("cocok lewat order id", true, cocokPembayaran(contoh, "HB-abc123-m5x7q9-8f2a"));
  // Arah pencarian yang sering terbalik: admin membuka dashboard Midtrans
  // lebih dulu, melihat ada uang masuk, lalu ingin tahu itu siapa. Yang ada
  // di tangannya id transaksi, bukan email.
  eq("cocok lewat id transaksi Midtrans", true, cocokPembayaran(contoh, "05eab30a"));
  eq("dua kata harus dua-duanya ketemu", true, cocokPembayaran(contoh, "wayan gmail"));
  eq("kata yang tidak ada menggugurkan", false, cocokPembayaran(contoh, "wayan yahoo"));
  eq("kunci kosong meloloskan semua", true, cocokPembayaran(contoh, "   "));

  const daftar = [
    { ...contoh, orderId: "HB-a-b-lama", createdAt: "2026-08-01T00:00:00.000Z" },
    { ...contoh, orderId: "HB-a-b-baru", createdAt: "2026-08-30T00:00:00.000Z" },
  ];
  // eq() di berkas ini membandingkan dengan !==, jadi array digabung jadi
  // untaian lebih dulu. Dibandingkan apa adanya, dua array berisi sama
  // persis tetap dianggap berbeda dan tesnya merah tanpa ada yang salah.
  eq(
    "terbaru dulu",
    "HB-a-b-baru,HB-a-b-lama",
    saringPembayaran(daftar, "")
      .map((p) => p.orderId)
      .join(","),
  );

  /*
   * Tombol periksa ulang hanya untuk yang memang bisa berubah.
   *
   * Yang sudah diterapkan tidak boleh ditanyakan lagi: bukan karena berbahaya
   * (penerapannya sendiri sudah menolak berjalan dua kali), melainkan karena
   * tombol yang tidak melakukan apa pun membuat admin ragu apakah tombolnya
   * bekerja, lalu menekannya berulang kali.
   */
  eq(
    "yang menunggu boleh diperiksa",
    true,
    bolehPeriksaUlang({ status: "menunggu", diterapkanPada: null }),
  );
  eq(
    "yang sudah diterapkan tidak",
    false,
    bolehPeriksaUlang({ status: "lunas", diterapkanPada: "2026-08-31T00:00:00.000Z" }),
  );
  eq(
    "yang gagal tidak",
    false,
    bolehPeriksaUlang({ status: "gagal", diterapkanPada: null }),
  );
  eq(
    "yang dikembalikan tidak",
    false,
    bolehPeriksaUlang({ status: "dikembalikan", diterapkanPada: null }),
  );

  const route = readFileSync("src/app/api/admin/pembayaran/route.ts", "utf8");
  eq("route pembayaran butuh admin", true, route.includes("requireAdmin(req)"));
  eq("route pembayaran menulis jejak", true, route.includes("catatJejak("));
  // Tidak boleh ada jalan di layar ini untuk menandai lunas sesuatu yang tidak
  // dibayar. Yang diterapkan harus jawaban Midtrans, bukan isi permintaan.
  eq("status tidak diterima dari klien", false, /body\.status|\{\s*status\s*\}\s*=\s*await req/.test(route));
  eq("status ditanyakan ke Midtrans", true, route.includes("ambilStatusTransaksi("));
  eq("penerapannya lewat fungsi bersama", true, route.includes("terapkanPembayaran("));
}

console.log(fail === 0 ? "✓ admin: semua lolos" : `✗ admin: ${fail} gagal`);
if (fail) process.exit(1);
