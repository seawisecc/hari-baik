import type { KategoriName } from "@/lib/wariga";
import type { Lang } from "./i18n";

/** Panduan aktivitas harian per kategori siklus, dua bahasa. */
export interface PanduanHari {
  supported: string[];
  postpone: string[];
  affirmation: string;
}

const PANDUAN: Record<Lang, Record<KategoriName, PanduanHari>> = {
  "id": {
    "GURU": {
      "supported": [
        "Memulai proyek atau usaha baru",
        "Menandatangani kontrak atau perjanjian",
        "Presentasi dan pitching ide",
        "Melamar pekerjaan atau promosi",
        "Membuka rekening, investasi pertama",
        "Grand opening, launching produk",
        "Pernikahan dan pertemuan penting",
        "Perjalanan jauh"
      ],
      "postpone": [
        "Tidak ada pantangan khusus hari ini"
      ],
      "affirmation": "Langkahmu hari ini meninggalkan jejak yang berarti."
    },
    "RATU": {
      "supported": [
        "Menyelesaikan pekerjaan yang tertunda",
        "Meeting dan diskusi bisnis rutin",
        "Follow-up klien dan negosiasi lanjutan",
        "Belajar dan pengembangan diri",
        "Aktivitas sosial dan mempererat relasi",
        "Pembayaran dan transaksi keuangan rutin",
        "Konten kreasi dan editing"
      ],
      "postpone": [
        "Keputusan investasi besar yang belum matang",
        "Konfrontasi atau perdebatan panas"
      ],
      "affirmation": "Konsistensi hari ini adalah investasi terbesar untuk masa depanmu."
    },
    "LARA": {
      "supported": [
        "Riset, perencanaan, dan persiapan",
        "Pekerjaan administratif dan dokumentasi",
        "Evaluasi strategi yang sudah berjalan",
        "Pekerjaan kreatif solo (menulis, mendesain)",
        "Olahraga dan perawatan diri",
        "Bersih-bersih dan merapikan lingkungan kerja"
      ],
      "postpone": [
        "Memulai usaha atau proyek baru",
        "Membuat keputusan finansial besar",
        "Perjalanan jauh yang tidak mendesak",
        "Konfrontasi atau negosiasi alot"
      ],
      "affirmation": "Persiapan yang matang hari ini adalah kekuatan untuk hari-hari berikutnya."
    },
    "PATI": {
      "supported": [
        "Istirahat berkualitas dan pemulihan energi",
        "Meditasi, journaling, refleksi diri",
        "Olahraga ringan (jalan kaki, yoga, stretching)",
        "Beres-beres, decluttering, mengorganisir",
        "Waktu berkualitas bersama keluarga",
        "Menonton, membaca, atau hiburan ringan",
        "Perawatan kesehatan rutin (cek dokter, dll)"
      ],
      "postpone": [
        "Memulai bisnis, proyek, atau kolaborasi baru",
        "Menandatangani kontrak penting",
        "Perjalanan jauh",
        "Keputusan finansial besar"
      ],
      "affirmation": "Orang yang tahu kapan harus berhenti adalah orang yang paling bijak."
    }
  },
  "en": {
    "GURU": {
      "supported": [
        "Starting a new project or business",
        "Signing contracts or agreements",
        "Presentations and pitching ideas",
        "Applying for jobs or promotions",
        "Opening accounts, first investments",
        "Grand openings, product launches",
        "Weddings and important meetings",
        "Long-distance travel"
      ],
      "postpone": [
        "No special restrictions today"
      ],
      "affirmation": "Your steps today leave a meaningful mark."
    },
    "RATU": {
      "supported": [
        "Finishing pending work",
        "Regular business meetings and discussions",
        "Client follow-ups and ongoing negotiations",
        "Learning and self-development",
        "Social activities and strengthening relationships",
        "Routine payments and financial transactions",
        "Content creation and editing"
      ],
      "postpone": [
        "Immature large investment decisions",
        "Confrontations or heated debates"
      ],
      "affirmation": "Today's consistency is your greatest investment for the future."
    },
    "LARA": {
      "supported": [
        "Research, planning, and preparation",
        "Administrative work and documentation",
        "Evaluating existing strategies",
        "Solo creative work (writing, designing)",
        "Exercise and self-care",
        "Cleaning and organizing workspace"
      ],
      "postpone": [
        "Starting a new business or project",
        "Making large financial decisions",
        "Non-urgent long-distance travel",
        "Confrontations or tough negotiations"
      ],
      "affirmation": "Today's thorough preparation is the strength for the days ahead."
    },
    "PATI": {
      "supported": [
        "Quality rest and energy recovery",
        "Meditation, journaling, self-reflection",
        "Light exercise (walking, yoga, stretching)",
        "Tidying up, decluttering, organizing",
        "Quality time with family",
        "Watching, reading, or light entertainment",
        "Routine health care (doctor checkups, etc.)"
      ],
      "postpone": [
        "Starting new businesses, projects, or collaborations",
        "Signing important contracts",
        "Long-distance travel",
        "Major financial decisions"
      ],
      "affirmation": "The person who knows when to stop is the wisest of all."
    }
  }
};

export function getPanduan(lang: Lang, kategori: KategoriName): PanduanHari {
  return PANDUAN[lang]?.[kategori] ?? PANDUAN.id[kategori];
}
