import { getDayMarkers, getKategoriHari, getWarigaDay, isKajengKliwon } from "@/lib/wariga";
import type { KategoriName } from "@/lib/wariga";

/**
 * Pencari hari untuk sebuah acara.
 *
 * Ini bukan ramalan. Yang dilakukan hanya menyaring rentang tanggal dengan
 * aturan yang sudah dipakai di seluruh aplikasi, lalu mengurutkannya, supaya
 * pengguna tidak perlu membuka kalender sehari demi sehari.
 */

export type JenisAcara = "umum" | "pernikahan" | "usaha" | "perjalanan" | "upacara" | "pindah";

export const JENIS_ACARA: JenisAcara[] = [
  "umum",
  "pernikahan",
  "usaha",
  "perjalanan",
  "upacara",
  "pindah",
];

/** Bobot kategori: dasar penilaian sebuah hari. */
const NILAI_KATEGORI: Record<KategoriName, number> = {
  GURU: 100,
  RATU: 75,
  LARA: 30,
  PATI: 0,
};

/**
 * Kategori minimum yang dianggap layak per jenis acara.
 *
 * Acara yang mengikat jangka panjang menuntut hari yang lebih baik; perjalanan
 * dan urusan sehari-hari masih wajar di hari yang tenang. Hari Istirahat tidak
 * pernah masuk daftar untuk jenis apa pun.
 */
const MINIMUM: Record<JenisAcara, KategoriName[]> = {
  umum: ["GURU", "RATU"],
  pernikahan: ["GURU"],
  usaha: ["GURU"],
  perjalanan: ["GURU", "RATU"],
  upacara: ["GURU", "RATU"],
  pindah: ["GURU", "RATU"],
};

export interface HariAcara {
  tanggal: string;
  kategori: KategoriName;
  /** 0 sampai 100. Dipakai untuk mengurutkan, bukan untuk ditampilkan mentah. */
  skor: number;
  saptaWara: string;
  pancaWara: string;
  wuku: string;
  sasih: string;
  lunar: string;
  /** Alasan yang menambah nilai hari ini. */
  dukungan: string[];
  /** Hal yang perlu diperhatikan, tidak menggugurkan tapi patut diketahui. */
  catatan: string[];
}

const MS_HARI = 86_400_000;

function rentangTanggal(dari: string, sampai: string): string[] {
  const a = Date.parse(dari + "T00:00:00Z");
  const b = Date.parse(sampai + "T00:00:00Z");
  const out: string[] = [];
  for (let t = a; t <= b; t += MS_HARI) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

/** Batas rentang, supaya satu pencarian tidak menghitung ribuan hari sekaligus. */
export const MAKS_HARI = 366;

export interface HasilPencarian {
  hari: HariAcara[];
  /** Jumlah hari yang diperiksa, termasuk yang tidak lolos. */
  diperiksa: number;
  /** True bila rentangnya dipotong karena melewati batas. */
  dipotong: boolean;
}

/**
 * Cari hari yang cocok untuk sebuah acara di antara dua tanggal.
 *
 * Hasilnya diurutkan dari yang paling didukung. Bila skornya sama, yang lebih
 * awal menang: dari dua hari yang sama baiknya, yang lebih dekat lebih berguna.
 */
export function cariHariAcara(
  tanggalLahir: string,
  dari: string,
  sampai: string,
  jenis: JenisAcara = "umum",
): HasilPencarian {
  const semua = rentangTanggal(dari, sampai);
  const dipotong = semua.length > MAKS_HARI;
  const daftar = dipotong ? semua.slice(0, MAKS_HARI) : semua;
  const layak = MINIMUM[jenis];

  const hari: HariAcara[] = [];
  for (const tanggal of daftar) {
    const kategori = getKategoriHari(tanggalLahir, tanggal).name;
    if (!layak.includes(kategori)) continue;

    const w = getWarigaDay(tanggal, tanggalLahir);
    const m = getDayMarkers(tanggal, tanggalLahir);

    const dukungan: string[] = [];
    const catatan: string[] = [];
    let skor = NILAI_KATEGORI[kategori];

    if (m.isPurnama) {
      skor += 10;
      dukungan.push("purnama");
    }
    if (m.isTilem) {
      skor -= 10;
      catatan.push("tilem");
    }
    if (isKajengKliwon(tanggal)) {
      skor -= 8;
      catatan.push("kajengKliwon");
    }
    // Hari raya bukan hari buruk, tapi orang sudah punya acara sendiri hari itu.
    if (m.isHariRayaHindu) {
      skor -= 12;
      catatan.push("hariRaya");
      if (m.namaHariRaya) catatan.push(...m.namaHariRaya);
    }
    if (m.isLiburNasional && m.namaLibur) {
      dukungan.push("libur");
    }

    hari.push({
      tanggal,
      kategori,
      skor: Math.max(0, Math.min(100, skor)),
      saptaWara: w.saptaWara,
      pancaWara: w.pancaWara,
      wuku: w.wuku,
      sasih: w.sasih,
      lunar: w.lunarDay,
      dukungan,
      catatan,
    });
  }

  hari.sort((a, b) => b.skor - a.skor || a.tanggal.localeCompare(b.tanggal));
  return { hari, diperiksa: daftar.length, dipotong };
}
