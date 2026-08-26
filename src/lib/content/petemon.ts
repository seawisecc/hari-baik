import { getPancawara, getSadwara, getSaptawara, uripSadwara } from "@/lib/wariga";

/**
 * Petemon Lanang Istri — kecocokan dua tanggal lahir.
 *
 * Urip petemon berbeda dari urip harian biasa: Sadwara ikut dihitung.
 * Total kedua orang lalu dibaca lewat dua tabel sekaligus (mod 5 dan mod 16).
 */

export interface UripPetemon {
  saptaWara: string;
  saptaUrip: number;
  pancaWara: string;
  pancaUrip: number;
  sadWara: string;
  sadUrip: number;
  totalUrip: number;
}

export interface Tafsir {
  name: string;
  interp: string;
}

const PANCA_PETEMON: Record<number, Tafsir> = {
  "0": {
    "name": "Pati",
    "interp": "Hubungan yang memerlukan perhatian dan usaha ekstra. Secara tradisional dianggap mengandung potensi bahaya atau rintangan berat. Dengan cinta tulus dan doa, setiap rintangan bisa dilewati."
  },
  "1": {
    "name": "Sri",
    "interp": "Hubungan yang makmur dan penuh berkah. Pasangan ini cenderung saling mendukung dan membawa keberuntungan satu sama lain."
  },
  "2": {
    "name": "Gedong",
    "interp": "Hubungan yang terlindungi — seperti berada dalam gedung yang kokoh. Ada rasa aman dan stabilitas dalam hubungan ini."
  },
  "3": {
    "name": "Peta",
    "interp": "Hubungan yang penuh dinamika dan kadang keributan. Dibutuhkan kesabaran ekstra dan komunikasi yang baik untuk menjaga keharmonisan."
  },
  "4": {
    "name": "Lara",
    "interp": "Hubungan yang bisa menghadirkan ujian, termasuk soal kesehatan atau perasaan yang berat. Kebijaksanaan dan saling menjaga adalah kunci."
  }
};

const SAD_PETEMON: Record<number, Tafsir> = {
  "0": {
    "name": "Bagia Temonin",
    "interp": "Selalu rukun. Pasangan ini memiliki kemampuan alami untuk kembali ke keharmonisan setelah setiap konflik."
  },
  "1": {
    "name": "Ala-Ayu Panes-Tis",
    "interp": "Hubungan yang bergejolak — naik turun, panas dingin. Dibutuhkan ketahanan dan kesiapan mental untuk terus bertumbuh bersama."
  },
  "2": {
    "name": "Durbala",
    "interp": "Sering menghadapi kesulitan dan saling memperebutkan ego. Penting untuk belajar melepaskan keangkuhan dan saling mengalah."
  },
  "3": {
    "name": "Wirang",
    "interp": "Sering merasa kecewa satu sama lain. Ekspektasi perlu disesuaikan dengan realitas agar hubungan tidak mudah goyah."
  },
  "4": {
    "name": "Pianak Mati",
    "interp": "Perjalanan mendapatkan atau menjaga keturunan mungkin penuh tantangan. Kesabaran dan dukungan medis bisa menjadi jalan keluar."
  },
  "5": {
    "name": "Melah Lunas-Lanus",
    "interp": "Hubungan yang terus meningkat — rejeki, keharmonisan, dan kebahagiaan tumbuh bersama seiring waktu."
  },
  "6": {
    "name": "Kemeranan",
    "interp": "Ada periode penderitaan atau kesulitan yang mungkin dihadapi bersama. Justru di sinilah ikatan sejati diuji dan diperkuat."
  },
  "7": {
    "name": "Suka Duhka",
    "interp": "Ada suka dan duka yang silih berganti, namun dengan waktu dan kesabaran, hubungan ini akan menemukan ritmenya."
  },
  "8": {
    "name": "Doyan Terak",
    "interp": "Sering merasa serba kurang — baik materi maupun emosional. Bersyukur dan mengelola harapan bersama sangat penting."
  },
  "9": {
    "name": "Sekita Tong Ada Tuna",
    "interp": "Kemakmuran hadir, namun kadang diiringi kekacauan. Belajar menikmati kelimpahan tanpa membiarkan ego merusak keharmonisan."
  },
  "10": {
    "name": "Melas Bikas Ratu",
    "interp": "Pasangan yang berwibawa dan dihormati. Hubungan ini memancarkan energi positif ke lingkungan sekitar."
  },
  "11": {
    "name": "Sebita",
    "interp": "Selalu dalam keadaan puas dan cukup. Hubungan yang penuh syukur dan ketenangan batin."
  },
  "12": {
    "name": "Sedana Lulus",
    "interp": "Murah rejeki — keberkahan materi mengalir dalam hubungan ini. Bersama, pasangan ini cenderung lebih mudah meraih kemakmuran."
  },
  "13": {
    "name": "Ageng Lama",
    "interp": "Hubungan yang kekal dan panjang umur. Pasangan ini diberkahi dengan ikatan yang kuat melewati waktu."
  },
  "14": {
    "name": "Dahating Bagia",
    "interp": "Sangat berbahagia. Ini adalah salah satu kombinasi terbaik — penuh kebahagiaan dan keberkahan."
  },
  "15": {
    "name": "Dahating Ala",
    "interp": "Sangat berat. Dibutuhkan komitmen dan kebijaksanaan yang luar biasa untuk menjaga hubungan ini tetap sehat dan harmonis."
  }
};

export function uripPetemon(tanggalLahir: string): UripPetemon {
  const sapta = getSaptawara(tanggalLahir);
  const panca = getPancawara(tanggalLahir);
  const sadWara = getSadwara(tanggalLahir);
  const sadUrip = uripSadwara(tanggalLahir);
  return {
    saptaWara: sapta.name,
    saptaUrip: sapta.urip,
    pancaWara: panca.name,
    pancaUrip: panca.urip,
    sadWara,
    sadUrip,
    totalUrip: sapta.urip + panca.urip + sadUrip,
  };
}

export interface HasilPetemon {
  orang1: UripPetemon;
  orang2: UripPetemon;
  total: number;
  sisa5: number;
  sisa16: number;
  panca: Tafsir;
  sad: Tafsir;
}

export function hitungPetemon(lahir1: string, lahir2: string): HasilPetemon {
  const orang1 = uripPetemon(lahir1);
  const orang2 = uripPetemon(lahir2);
  const total = orang1.totalUrip + orang2.totalUrip;
  const sisa5 = total % 5;
  const sisa16 = total % 16;
  return { orang1, orang2, total, sisa5, sisa16, panca: PANCA_PETEMON[sisa5], sad: SAD_PETEMON[sisa16] };
}
