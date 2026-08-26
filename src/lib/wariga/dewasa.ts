import { hariRayaTerhitung, isGalungan, isKuningan } from "./hariraya";
import { HARI_RAYA_HINDU, LIBUR_NASIONAL } from "./holidays";
import {
  getAstawara,
  getCaturwara,
  getDasawara,
  getLintang,
  getPatra,
  getPratima,
  getSadwara,
  getSangawara,
  getSasih,
  getTriwara,
  getWatek,
  getWuku,
  getPancawara,
  getSaptawara,
  isPurnama,
  isTilem,
  lunarLabel,
  pancawaraName,
  saptawaraName,
  uripHari,
} from "./pawukon";
import type { DayMarkers, KategoriHari, KategoriName, WarigaDay } from "./types";

// ── Hari raya ─────────────────────────────────────────────────────────────

export { isGalungan, isKuningan } from "./hariraya";

/** Kajeng Kliwon: pertemuan Kajeng (Triwara) dengan Kliwon (Pancawara), tiap 15 hari. */
export function isKajengKliwon(dateStr: string): boolean {
  return getTriwara(dateStr) === "Kajeng" && pancawaraName(dateStr) === "Kliwon";
}

/** Tumpek: Saniscara Kliwon: jatuh tiap 35 hari. */
export function isTumpek(dateStr: string): boolean {
  return saptawaraName(dateStr) === "Saniscara" && pancawaraName(dateStr) === "Kliwon";
}

/** Anggara Kasih: Anggara Kliwon. */
export function isAnggaraKasih(dateStr: string): boolean {
  return saptawaraName(dateStr) === "Anggara" && pancawaraName(dateStr) === "Kliwon";
}

/** Buda Kliwon. */
export function isBudaKliwon(dateStr: string): boolean {
  return saptawaraName(dateStr) === "Budha" && pancawaraName(dateStr) === "Kliwon";
}

export function getLiburNasional(dateStr: string): string | null {
  return LIBUR_NASIONAL[dateStr] ?? null;
}

/**
 * Hari raya Hindu untuk satu tanggal: gabungan tabel penetapan dengan
 * hari yang bisa dihitung sendiri (Galungan, Kuningan, Purnama, Tilem).
 */
export function getHariRayaHindu(dateStr: string): string[] | null {
  // Semuanya dihitung; tabel hanya dipakai bila ada hari raya tambahan
  // yang belum punya rumus. Sebelumnya tabel dan perhitungan digabung
  // begitu saja, dan satu hari raya bisa muncul dua kali dengan selisih
  // satu hari ketika isinya bertentangan.
  const list = [...hariRayaTerhitung(dateStr)];

  const tambahan = HARI_RAYA_HINDU[dateStr];
  if (tambahan && !list.some((x) => x.includes(tambahan) || tambahan.includes(x))) {
    list.push(tambahan);
  }

  if (isPurnama(dateStr)) list.push(`Purnama ${getSasih(dateStr)}`);
  if (isTilem(dateStr)) list.push(`Tilem ${getSasih(dateStr)}`);
  return list.length > 0 ? list : null;
}

// ── Kategori siklus personal ──────────────────────────────────────────────

const KATEGORI: Record<
  number,
  { name: KategoriName; label: string; color: KategoriHari["color"] }
> = {
  1: { name: "GURU", label: "Sangat Baik", color: "guru" },
  2: { name: "RATU", label: "Baik", color: "ratu" },
  3: { name: "LARA", label: "Kurang Baik", color: "lara" },
  0: { name: "PATI", label: "Buruk", color: "pati" },
};

/**
 * Kategori hari = (urip hari lahir + urip hari berjalan) mod 4.
 * Ini inti "siklus personal": tiap orang punya pola 4-fase sendiri
 * yang bergantung pada tanggal lahirnya.
 */
export function getKategoriHari(birthDate: string, dateStr: string): KategoriHari {
  const uripLahir = uripHari(birthDate);
  const uripHariIni = uripHari(dateStr);
  const total = uripLahir + uripHariIni;
  return { ...KATEGORI[total % 4], uripLahir, uripHariIni, total, sisa: total % 4 };
}

/**
 * Dewasa ayu: penanda hari terbaik: kategori GURU yang jatuh di
 * Wraspati atau Sukra, dan bukan Kliwon.
 */
export function isDewasaAyu(birthDate: string, dateStr: string): boolean {
  const sapta = saptawaraName(dateStr);
  return (
    getKategoriHari(birthDate, dateStr).name === "GURU" &&
    (sapta === "Wraspati" || sapta === "Sukra") &&
    pancawaraName(dateStr) !== "Kliwon"
  );
}

// ── Agregat ───────────────────────────────────────────────────────────────

/** Seluruh atribut wariga satu tanggal. `birthDate` opsional: tanpa itu `kategori` null. */
export function getWarigaDay(dateStr: string, birthDate?: string | null): WarigaDay {
  const sapta = getSaptawara(dateStr);
  const panca = getPancawara(dateStr);
  const wuku = getWuku(dateStr);
  const patra = getPatra(dateStr);

  return {
    date: dateStr,
    saptaWara: sapta.name,
    pancaWara: panca.name,
    wuku: wuku.name,
    triWara: getTriwara(dateStr),
    caturWara: getCaturwara(dateStr),
    sadWara: getSadwara(dateStr),
    astaWara: getAstawara(dateStr),
    sangaWara: getSangawara(dateStr),
    dasaWara: getDasawara(dateStr),
    lintang: getLintang(dateStr),
    watek: getWatek(dateStr),
    pratima: getPratima(dateStr),
    patra: patra.label,
    patraName: patra.name,
    patraNum: patra.number,
    lunarDay: lunarLabel(dateStr),
    sasih: getSasih(dateStr),
    uripSapta: sapta.urip,
    uripPanca: panca.urip,
    uripTotal: sapta.urip + panca.urip,
    hariLibur: getLiburNasional(dateStr),
    hariRayaHindu: getHariRayaHindu(dateStr),
    isPurnama: isPurnama(dateStr),
    isTilem: isTilem(dateStr),
    isGalungan: isGalungan(dateStr),
    isKuningan: isKuningan(dateStr),
    kategori: birthDate ? getKategoriHari(birthDate, dateStr) : null,
    dewasaAyu: birthDate ? isDewasaAyu(birthDate, dateStr) : false,
  };
}

/** Versi ringan untuk merender grid kalender sebulan penuh. */
export function getDayMarkers(dateStr: string, birthDate?: string | null): DayMarkers {
  const libur = getLiburNasional(dateStr);
  const raya = getHariRayaHindu(dateStr);
  const kategori = birthDate ? getKategoriHari(birthDate, dateStr) : null;
  return {
    isLiburNasional: !!libur,
    namaLibur: libur,
    isHariRayaHindu: !!raya,
    namaHariRaya: raya,
    isPurnama: isPurnama(dateStr),
    isTilem: isTilem(dateStr),
    statusHari: kategori ? kategori.name.toLowerCase() : null,
  };
}
