/**
 * Tes aturan akses. Dijalankan dengan: npm run test
 * Sengaja tanpa framework: logikanya kecil dan hanya butuh perbandingan nilai.
 */
import { readFileSync } from "node:fs";
import {
  evaluateAccess,
  extendOneYear,
  extendYears,
  punyaAksesBerbayar,
  statusSetelahDitolak,
  trialDiakhiri,
  trialEnd,
} from "../subscription";

const now = new Date("2026-08-26T10:00:00Z");
const iso = (d: string) => new Date(d).toISOString();

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

let s = evaluateAccess(
  { subscriptionStatus: "trial", subscriptionExpiresAt: null, trialEndsAt: iso("2026-08-28") },
  now,
);
eq("trial jalan: bisa lihat", true, s.canView);
eq("trial jalan: belum pro", false, s.isPro);
eq("trial jalan: sisa 2 hari", 2, s.daysLeft);

s = evaluateAccess(
  { subscriptionStatus: "trial", subscriptionExpiresAt: null, trialEndsAt: iso("2026-08-25") },
  now,
);
eq("trial habis: terkunci", false, s.canView);
eq("trial habis: type none", "none", s.type);

s = evaluateAccess(
  {
    subscriptionStatus: "active",
    subscriptionExpiresAt: iso("2027-08-26"),
    trialEndsAt: iso("2026-08-25"),
  },
  now,
);
eq("langganan aktif: pro", true, s.isPro);
eq("langganan aktif: type", "subscription", s.type);

// Bayar saat trial hampir habis: trial yang lewat tidak boleh menutup akses.
s = evaluateAccess(
  {
    subscriptionStatus: "active",
    subscriptionExpiresAt: iso("2027-01-01"),
    trialEndsAt: iso("2026-08-20"),
  },
  now,
);
eq("bayar setelah trial lewat: tetap pro", true, s.isPro);

// Langganan kedaluwarsa tapi trial belum: jatuh balik ke trial, bukan terkunci.
s = evaluateAccess(
  {
    subscriptionStatus: "active",
    subscriptionExpiresAt: iso("2026-08-01"),
    trialEndsAt: iso("2026-08-30"),
  },
  now,
);
eq("langganan habis, trial jalan", "trial", s.type);

s = evaluateAccess(
  {
    subscriptionStatus: "pending",
    subscriptionExpiresAt: null,
    trialEndsAt: iso("2026-08-30"),
  },
  now,
);
eq("pending: belum pro", false, s.isPro);
eq("pending: masih bisa lihat", true, s.canView);

// Perpanjangan mempertahankan jam, dan menumpuk kalau masih aktif.
eq("perpanjang dari nol", iso("2027-08-26T10:00:00Z"), extendOneYear(null, now));
eq("perpanjang ditumpuk", iso("2028-01-01"), extendOneYear(iso("2027-01-01"), now));
eq(
  "perpanjang dari yang lewat",
  iso("2027-08-26T10:00:00Z"),
  extendOneYear(iso("2025-01-01"), now),
);

eq("trial 3 hari", iso("2026-08-29T10:00:00Z"), trialEnd(now));

// Seumur hidup tidak punya tanggal habis, jadi tidak boleh ikut logika
// kedaluwarsa apa pun, termasuk saat trial-nya sudah lewat.
s = evaluateAccess(
  {
    subscriptionStatus: "lifetime",
    subscriptionExpiresAt: null,
    trialEndsAt: iso("2020-01-01"),
  },
  now,
);
eq("lifetime: pro", true, s.isPro);
eq("lifetime: bisa lihat", true, s.canView);
eq("lifetime: type", "lifetime", s.type);
eq("lifetime: tanpa sisa hari", null, s.daysLeft);
eq("lifetime: tanpa tanggal habis", null, s.expiresAt);

// Tanggal habis lama yang masih tertinggal tidak boleh mengunci lifetime.
s = evaluateAccess(
  {
    subscriptionStatus: "lifetime",
    subscriptionExpiresAt: iso("2020-01-01"),
    trialEndsAt: null,
  },
  now,
);
eq("lifetime abaikan tanggal lama", true, s.isPro);

// Perpanjangan beberapa tahun sekaligus.
eq("tambah 2 tahun dari nol", iso("2028-08-26T10:00:00Z"), extendYears(null, 2, now));
eq("tambah 5 tahun ditumpuk", iso("2032-01-01"), extendYears(iso("2027-01-01"), 5, now));
eq(
  "tambah dari yang sudah lewat",
  iso("2029-08-26T10:00:00Z"),
  extendYears(iso("2020-01-01"), 3, now),
);

/*
 * Permintaan aktivasi dari orang yang masih berbayar.
 *
 * Ini pernah menjadi lubang nyata: route pengajuan selalu menandai pemohon
 * "pending", dan penolakan selalu menandainya "expired". Artinya pelanggan
 * yang memperpanjang lebih awal langsung kehilangan akses yang sudah dia
 * bayar, dan pemegang langganan seumur hidup kehilangan status itu untuk
 * selamanya hanya karena membeli satu add-on.
 */
eq(
  "aktif dan belum habis: masih berbayar",
  true,
  punyaAksesBerbayar(
    { subscriptionStatus: "active", subscriptionExpiresAt: iso("2027-01-01") },
    now,
  ),
);
eq(
  "aktif tapi sudah lewat: tidak berbayar",
  false,
  punyaAksesBerbayar(
    { subscriptionStatus: "active", subscriptionExpiresAt: iso("2020-01-01") },
    now,
  ),
);
eq(
  "seumur hidup: selalu berbayar",
  true,
  punyaAksesBerbayar({ subscriptionStatus: "lifetime", subscriptionExpiresAt: null }, now),
);
eq(
  "masa coba: belum berbayar",
  false,
  punyaAksesBerbayar({ subscriptionStatus: "trial", subscriptionExpiresAt: null }, now),
);

eq(
  "ditolak saat langganan masih jalan: tetap aktif",
  "active",
  statusSetelahDitolak(
    { subscriptionStatus: "pending", subscriptionExpiresAt: iso("2027-01-01") },
    now,
  ),
);
eq(
  "ditolak saat seumur hidup: tetap seumur hidup",
  "lifetime",
  statusSetelahDitolak({ subscriptionStatus: "lifetime", subscriptionExpiresAt: null }, now),
);
eq(
  "ditolak tanpa langganan: expired",
  "expired",
  statusSetelahDitolak({ subscriptionStatus: "pending", subscriptionExpiresAt: null }, now),
);
eq(
  "ditolak saat langganan sudah habis: expired",
  "expired",
  statusSetelahDitolak(
    { subscriptionStatus: "pending", subscriptionExpiresAt: iso("2020-01-01") },
    now,
  ),
);

/*
 * Nonaktifkan harus benar-benar menonaktifkan.
 *
 * Aksi itu dulu hanya menyetel status ke "expired" dan mengosongkan tanggal
 * habis langganan. Untuk siapa pun yang masa cobanya belum lewat, itu tidak
 * mencabut apa pun: evaluateAccess() membaca trialEndsAt tanpa peduli status,
 * jadi orangnya tetap bisa membuka seluruh aplikasi sementara panel admin
 * menampilkannya sebagai Expired. Terjadi sungguhan pada satu akun, dan yang
 * membuatnya ketahuan bukan aksesnya melainkan tombol hapus yang menolak
 * bekerja dengan alasan "aksesnya masih berjalan".
 */
eq("trial yang masih hidup diakhiri sekarang", now.toISOString(), trialDiakhiri(iso("2026-09-01"), now));
eq("trial yang sudah lewat tidak disentuh", iso("2026-08-01"), trialDiakhiri(iso("2026-08-01"), now));
eq("tanpa trial tetap null", null, trialDiakhiri(null, now));

// Inilah keadaan yang sebenarnya terjadi: status sudah expired, tapi masa coba
// masih berjalan, jadi aksesnya tetap hidup.
eq(
  "expired dengan trial hidup masih bisa membuka aplikasi",
  true,
  evaluateAccess(
    {
      subscriptionStatus: "expired",
      subscriptionExpiresAt: null,
      trialEndsAt: iso("2026-08-27"),
    },
    now,
  ).canView,
);
// Dan inilah keadaan sesudah nonaktifkan diperbaiki.
eq(
  "setelah trialnya ikut diakhiri, aksesnya mati",
  false,
  evaluateAccess(
    {
      subscriptionStatus: "expired",
      subscriptionExpiresAt: null,
      trialEndsAt: trialDiakhiri(iso("2026-08-27"), now),
    },
    now,
  ).canView,
);

{
  const route = readFileSync("src/app/api/admin/subscription/route.ts", "utf8");
  const potongan = route.slice(route.indexOf('if (action === "deactivate")'), route.indexOf('} else if (action === "lifetime")'));
  eq("nonaktifkan ikut mengakhiri masa coba", true, potongan.includes("trialDiakhiri("));
}

console.log(fail === 0 ? "✓ langganan: semua lolos" : `✗ langganan: ${fail} gagal`);
if (fail) process.exit(1);
