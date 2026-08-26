import type { KategoriName } from "@/lib/wariga";

/**
 * Pemetaan kategori ke kelas Tailwind.
 *
 * Ditulis penuh, bukan disusun dari string (`bg-${k}`), karena Tailwind
 * memindai kode sumber secara statis — kelas yang dirakit saat runtime
 * tidak akan ikut ter-generate.
 */
export const KATEGORI_KEY: Record<KategoriName, string> = {
  GURU: "guru",
  RATU: "ratu",
  LARA: "lara",
  PATI: "pati",
};

export const KATEGORI_BG: Record<KategoriName, string> = {
  GURU: "bg-guru",
  RATU: "bg-ratu",
  LARA: "bg-lara",
  PATI: "bg-pati",
};

export const KATEGORI_TEKS: Record<KategoriName, string> = {
  GURU: "text-guru",
  RATU: "text-ratu",
  LARA: "text-lara",
  PATI: "text-pati",
};

/** Latar tipis untuk kartu — cukup untuk memberi nada tanpa menenggelamkan teks. */
export const KATEGORI_WASH: Record<KategoriName, string> = {
  GURU: "bg-guru/12",
  RATU: "bg-ratu/12",
  LARA: "bg-lara/12",
  PATI: "bg-pati/12",
};

export const KATEGORI_RING: Record<KategoriName, string> = {
  GURU: "ring-guru/35",
  RATU: "ring-ratu/35",
  LARA: "ring-lara/35",
  PATI: "ring-pati/35",
};
