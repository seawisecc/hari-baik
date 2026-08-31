/**
 * Makna nama lewat nilai aksara.
 *
 * Hanya konsonan yang dihitung: vokal tidak punya nilai aksara sendiri.
 * Digraf "ng" (Nga) dan "ny" (Nya) dibaca sebagai satu aksara, jadi harus
 * dicek lebih dulu sebelum huruf tunggal.
 */

export interface AksaraNilai {
  name: string;
  value: number;
}

const AKSARA_TUNGGAL: Record<string, AksaraNilai> = {
  h: {
    name: "Ha",
    value: 1,
  },
  n: {
    name: "Na",
    value: 2,
  },
  c: {
    name: "Ca",
    value: 3,
  },
  r: {
    name: "Ra",
    value: 4,
  },
  k: {
    name: "Ka",
    value: 5,
  },
  q: {
    name: "Ka",
    value: 5,
  },
  d: {
    name: "Da",
    value: 6,
  },
  t: {
    name: "Ta",
    value: 7,
  },
  s: {
    name: "Sa",
    value: 8,
  },
  z: {
    name: "Sa",
    value: 8,
  },
  w: {
    name: "Wa",
    value: 9,
  },
  v: {
    name: "Wa",
    value: 9,
  },
  l: {
    name: "La",
    value: 10,
  },
  m: {
    name: "Ma",
    value: 11,
  },
  g: {
    name: "Ga",
    value: 12,
  },
  b: {
    name: "Ba",
    value: 13,
  },
  p: {
    name: "Pa",
    value: 15,
  },
  j: {
    name: "Ja",
    value: 16,
  },
  y: {
    name: "Ya",
    value: 17,
  },
};

const AKSARA_DIGRAF: Record<string, AksaraNilai> = {
  ng: {
    name: "Nga",
    value: 14,
  },
  ny: {
    name: "Nya",
    value: 18,
  },
};

const VOKAL = new Set(["a", "i", "u", "e", "o"]);

export const UNSUR_NAMA = ["Sri", "Bhuana", "Peta", "Lara", "Pati"] as const;
export type UnsurNama = (typeof UNSUR_NAMA)[number];

/** Nada visual tiap unsur: dipetakan ke token warna kategori. */
export const UNSUR_TONE: Record<UnsurNama, "accent" | "guru" | "ratu" | "lara" | "pati"> = {
  Sri: "accent",
  Bhuana: "guru",
  Peta: "ratu",
  Lara: "lara",
  Pati: "pati",
};

export const UNSUR_INTERP: Record<UnsurNama, string> = {
  Sri: "Sangat baik. Nama ini membawa energi kemakmuran, keberuntungan, kebahagiaan, kemuliaan, dan kesuksesan di berbagai bidang kehidupan.",
  Bhuana:
    "Baik. Nama ini mendukung kedudukan dan kemakmuran. Perjalanan hidup cenderung positif, meski kadang ada dinamika kecil di sisi kesehatan atau keharmonisan rumah tangga yang perlu dijaga.",
  Peta: "Baik. Nama ini membawa keberuntungan dalam karier dan ekonomi. Terdapat potensi besar untuk berkembang, dengan catatan untuk senantiasa menjaga keseimbangan hubungan dan kesehatan.",
  Lara: "Perlu perhatian. Nama ini menandakan perjalanan hidup yang penuh dinamika: mungkin ada periode yang terasa berat atau tantangan berulang. Dengan kesadaran dan karma baik, tantangan ini bisa dilewati dan menjadi pelajaran berharga.",
  Pati: "Perlu perhatian lebih. Nama ini secara tradisional dianggap memerlukan keseimbangan ekstra dalam menjalani hidup. Ini bukan takdir, melainkan pengingat untuk lebih berhati-hati, menjaga kesehatan, dan menabung karma baik melalui perbuatan positif.",
};

export interface RincianAksara {
  huruf: string;
  aksara: string;
  value: number;
}

export interface MaknaNama {
  nama: string;
  rincian: RincianAksara[];
  total: number;
  /** 1–5; sisa 0 dibaca sebagai 5. */
  sisa: number;
  unsur: UnsurNama;
  interp: string;
}

export function hitungMaknaNama(nama: string): MaknaNama {
  const bersih = nama.toLowerCase().replace(/[^a-z]/g, "");
  const rincian: RincianAksara[] = [];
  let total = 0;

  for (let i = 0; i < bersih.length;) {
    const pasangan = bersih.slice(i, i + 2);
    const digraf = pasangan.length === 2 ? AKSARA_DIGRAF[pasangan] : undefined;
    if (digraf) {
      rincian.push({ huruf: pasangan, aksara: digraf.name, value: digraf.value });
      total += digraf.value;
      i += 2;
      continue;
    }
    const huruf = bersih[i];
    const tunggal = AKSARA_TUNGGAL[huruf];
    if (!VOKAL.has(huruf) && tunggal) {
      rincian.push({ huruf, aksara: tunggal.name, value: tunggal.value });
      total += tunggal.value;
    }
    i += 1;
  }

  const sisa = total % 5 === 0 ? 5 : total % 5;
  const unsur = UNSUR_NAMA[sisa - 1];
  return { nama: nama.trim(), rincian, total, sisa, unsur, interp: UNSUR_INTERP[unsur] };
}
