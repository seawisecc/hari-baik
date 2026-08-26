/**
 * Tes aturan akses. Dijalankan dengan: npm run test
 * Sengaja tanpa framework — logikanya kecil dan hanya butuh perbandingan nilai.
 */
import { evaluateAccess, extendOneYear, trialEnd } from "../subscription";

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

// Bayar saat trial hampir habis — trial yang lewat tidak boleh menutup akses.
s = evaluateAccess(
  {
    subscriptionStatus: "active",
    subscriptionExpiresAt: iso("2027-01-01"),
    trialEndsAt: iso("2026-08-20"),
  },
  now,
);
eq("bayar setelah trial lewat: tetap pro", true, s.isPro);

// Langganan kedaluwarsa tapi trial belum — jatuh balik ke trial, bukan terkunci.
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

console.log(fail === 0 ? "✓ langganan: semua lolos" : `✗ langganan: ${fail} gagal`);
if (fail) process.exit(1);
