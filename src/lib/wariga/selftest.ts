import { getKategoriHari } from "./dewasa";
import {
  getAstawara, getCaturwara, getDasawara, getLintang, getPatra, getSadwara,
  getSangawara, getSasih, getTriwara, getWatek, getWuku,
  pancawaraName, saptawaraName, uripHari, uripSadwara,
} from "./pawukon";
import { getLiburNasional } from "./dewasa";

export interface TestResult {
  test: string;
  expected: unknown;
  actual: unknown;
  pass: boolean;
}

/**
 * Verifikasi engine terhadap tanggal acuan yang sudah diketahui hasilnya.
 * Dipakai di halaman /debug-wariga dan sebagai smoke test saat build.
 */
export function runWarigaSelfTest(): TestResult[] {
  const out: TestResult[] = [];
  const check = (test: string, expected: unknown, actual: unknown) => {
    out.push({ test, expected, actual, pass: expected === actual });
  };

  check("Sapta 1993-06-30 = Budha", "Budha", saptawaraName("1993-06-30"));
  check("Sapta 2026-06-16 = Anggara", "Anggara", saptawaraName("2026-06-16"));
  check("Sapta 2026-06-17 = Budha", "Budha", saptawaraName("2026-06-17"));
  check("Sapta 2026-06-18 = Wraspati", "Wraspati", saptawaraName("2026-06-18"));

  check("Panca 1993-06-30 = Kliwon", "Kliwon", pancawaraName("1993-06-30"));
  check("Panca 2026-06-16 = Wage", "Wage", pancawaraName("2026-06-16"));
  check("Panca 2026-06-17 = Kliwon", "Kliwon", pancawaraName("2026-06-17"));
  check("Panca 2026-06-18 = Umanis", "Umanis", pancawaraName("2026-06-18"));

  check("Catur 2026-06-16 = Jaya", "Jaya", getCaturwara("2026-06-16"));
  check("Catur 2026-06-17 = Menala", "Menala", getCaturwara("2026-06-17"));
  check("Catur 2026-06-18 = Sri", "Sri", getCaturwara("2026-06-18"));

  check("Sad 1993-06-30 = Paniron", "Paniron", getSadwara("1993-06-30"));
  check("Sad 2026-06-17 = Aryang", "Aryang", getSadwara("2026-06-17"));
  check("Sad 2026-06-18 = Urukung", "Urukung", getSadwara("2026-06-18"));

  check("Asta 2026-06-16 = Kala", "Kala", getAstawara("2026-06-16"));
  check("Asta 2026-06-17 = Uma", "Uma", getAstawara("2026-06-17"));
  check("Asta 2026-06-18 = Sri", "Sri", getAstawara("2026-06-18"));

  check("Sanga 2026-06-16 = Urungan", "Urungan", getSangawara("2026-06-16"));
  check("Sanga 2026-06-17 = Tulus", "Tulus", getSangawara("2026-06-17"));
  check("Sanga 2026-06-18 = Dadi", "Dadi", getSangawara("2026-06-18"));

  check("Dasa 2026-06-16 = Raja", "Raja", getDasawara("2026-06-16"));
  check("Tri 2026-06-17 = Beteng", "Beteng", getTriwara("2026-06-17"));
  check("Tri 2026-06-18 = Kajeng", "Kajeng", getTriwara("2026-06-18"));

  check("Wuku 1993-06-30 = Sinta", "Sinta", getWuku("1993-06-30").name);
  check("Wuku 2026-05-21 = Wariga", "Wariga", getWuku("2026-05-21").name);

  check("Watek 2026-06-16 = Watu - Lembu", "Watu - Lembu", getWatek("2026-06-16"));
  check("Watek 2026-06-17 = Wong - Lintah", "Wong - Lintah", getWatek("2026-06-17"));
  check("Watek 2026-06-18 = Bhuta - Lelipi", "Bhuta - Lelipi", getWatek("2026-06-18"));

  check("Patra# 2026-06-16 = 26", 26, getPatra("2026-06-16").number);
  check("Patra# 2026-06-17 = 27", 27, getPatra("2026-06-17").number);
  check("Patra# 2026-06-18 = 28", 28, getPatra("2026-06-18").number);

  check("Sasih 2026-06-16 = Kasa", "Kasa", getSasih("2026-06-16"));
  check("Lintang 2026-06-16 = Jongsarad", "Jongsarad", getLintang("2026-06-16"));

  check("Libur 2026-06-16", "Tahun Baru Islam 1448 Hijriah", getLiburNasional("2026-06-16"));
  check("Libur 2026-01-01", "Tahun Baru 2026 Masehi", getLiburNasional("2026-01-01"));

  // Kategori siklus personal: lahir 1993-06-30 (urip 15) terhadap 2026-05-23 (urip 17).
  const k = getKategoriHari("1993-06-30", "2026-05-23");
  check("Mitra uripLahir = 15", 15, k.uripLahir);
  check("Mitra uripHariIni = 17", 17, k.uripHariIni);
  check("Mitra total = 32", 32, k.total);

  // Urip petemon = urip Saptawara + Pancawara + Sadwara.
  const p1 = uripHari("1993-06-30") + uripSadwara("1993-06-30");
  check("Petemon org1 = 23", 23, p1);
  const p2 = uripHari("1997-09-07") + uripSadwara("1997-09-07");
  check("Petemon org2 = 21", 21, p2);
  check("Petemon total = 44", 44, p1 + p2);

  return out;
}
