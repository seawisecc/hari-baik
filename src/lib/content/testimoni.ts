import type { Dwibahasa } from "@/lib/harga";

/**
 * Kata pelanggan, untuk halaman depan.
 *
 * KOSONG ADALAH KEADAAN YANG SAH. Bagian "Kata mereka" tidak dirender sama
 * sekali selama daftar ini kosong, jadi tidak ada kartu kosong dan tidak ada
 * tulisan "belum ada testimoni".
 *
 * Isinya harus kata-kata yang benar-benar diucapkan orangnya. Merapikan ejaan,
 * memotong bagian yang tidak relevan, dan menerjemahkan boleh; mengarang
 * kalimat lalu menempelkan nama orang di bawahnya tidak, karena yang membaca
 * halaman ini akan mengira orang itu memang mengatakannya. Yang di bawah ini
 * diserahkan pemilik sebagai kutipan dari pelanggannya sendiri.
 *
 * Terjemahan Inggris ada karena situsnya dwibahasa: pengunjung yang memilih EN
 * tidak seharusnya menemui blok bahasa Indonesia mentah di tengah halaman.
 * Yang aslinya memang berbahasa Inggris tidak diterjemahkan ke mana-mana.
 *
 * CATATAN yang perlu diingat saat mengubah harga: beberapa kutipan menyebut
 * angka rupiah. Itu kata orangnya pada saat itu, jadi jangan diubah mengikuti
 * harga baru. Kalau harganya bergeser jauh, yang benar adalah meminta kutipan
 * baru, bukan menyunting kalimat orang.
 */
export interface Testimoni {
  /** Kutipan apa adanya, tanpa tanda kutip di ujungnya: itu ditambahkan tampilan. */
  kutipan: Dwibahasa;
  nama: string;
  /** Kota atau asal, secukupnya untuk memberi konteks. */
  asal: string;
  peran: Dwibahasa;
}

export const TESTIMONI: Testimoni[] = [
  {
    nama: "Michael Chen",
    asal: "Australia",
    peran: { id: "Tech Entrepreneur", en: "Tech entrepreneur" },
    kutipan: {
      id: "I used to ignore traditional calendars, assuming they lacked technical accuracy. But Hari Baik translates the complex Wariga system into a deterministic algorithm. Mapping my high-stakes meetings to 'Hari Mengalir' and deep work to 'Hari Istirahat' has genuinely optimized my productivity cycle without any superstitious fluff.",
      en: "I used to ignore traditional calendars, assuming they lacked technical accuracy. But Hari Baik translates the complex Wariga system into a deterministic algorithm. Mapping my high-stakes meetings to 'Hari Mengalir' and deep work to 'Hari Istirahat' has genuinely optimized my productivity cycle without any superstitious fluff.",
    },
  },
  {
    nama: "Rina Setyawati",
    asal: "Jakarta",
    peran: { id: "Marketing Director", en: "Marketing director" },
    kutipan: {
      id: "Sebagai eksekutif di Jakarta, saya terbiasa dengan keputusan berbasis data. Memadukan kalender Masehi dengan siklus personal Bali ini ternyata sangat logis. Campaign yang kami luncurkan bertepatan dengan 'Hari Mengalir' menunjukkan tingkat konversi yang lebih baik. Sangat direkomendasikan bagi profesional yang ingin menyelaraskan timing eksekusi.",
      en: "As an executive in Jakarta I am used to data-driven decisions. Weaving the Gregorian calendar together with this personal Balinese cycle turned out to be entirely logical. The campaign we launched on a 'Hari Mengalir' showed a better conversion rate. Strongly recommended for professionals who want to line up the timing of their execution.",
    },
  },
  {
    nama: "Budi Santoso",
    asal: "Surabaya",
    peran: { id: "Pengusaha grosir dan distribusi", en: "Wholesale and distribution owner" },
    kutipan: {
      id: "Awalnya saya berasumsi ini hanya aplikasi ramalan karena saya bukan penganut Hindu. Ternyata ini murni perhitungan matematis pawukon yang berlaku universal. Fitur siklus rezeki membantu saya mengerem keputusan ekspansi saat 'Hari Mawas'. Biaya langganan Rp 180 ribu untuk 2 tahun sama sekali tidak sebanding dengan risiko kerugian bisnis yang berhasil saya hindari.",
      en: "At first I assumed this was just a fortune-telling app, since I am not Hindu. It turned out to be pure pawukon arithmetic that applies to anyone. The fortune-cycle feature helped me put the brakes on an expansion decision during a 'Hari Mawas'. Rp 180 thousand for two years is nothing next to the business losses I managed to avoid.",
    },
  },
  {
    nama: "I Wayan Arya",
    asal: "Bali",
    peran: { id: "Konsultan event organizer", en: "Event organiser consultant" },
    kutipan: {
      id: "Sebagai pengelola event di Bali, fitur 'Pencari Hari Acara' sangat efisien. Dulu saya harus menghabiskan waktu berdiskusi panjang untuk mencari dewasa ayu, sekarang sistem dari Hari Baik memberikan data awal yang presisi dalam hitungan detik. Sangat cost-efficient untuk operasional bisnis dan antarmukanya sangat bersih.",
      en: "Running events in Bali, the Event Day Finder is very efficient. I used to spend hours in discussion looking for a dewasa ayu; now Hari Baik gives me precise starting data in seconds. Very cost-efficient for operations, and the interface is clean.",
    },
  },
  {
    nama: "Siti Aisyah",
    asal: "Bandung",
    peran: { id: "Desainer grafis lepas", en: "Freelance graphic designer" },
    kutipan: {
      id: "Bekerja lepas sering memicu burnout akibat jadwal yang tidak teratur. Aplikasi ini mengubah manajemen energi saya secara radikal. Saat kalender menunjukkan 'Hari Istirahat', saya tolak revisi berat dan fokus pemulihan. Hasilnya, kualitas output desain saya justru meningkat tajam di hari-hari produktif.",
      en: "Freelancing often tips into burnout because the schedule has no shape. This app changed how I manage my energy completely. When the calendar shows a 'Hari Istirahat' I turn down heavy revisions and focus on recovering. The result is that the quality of my work on the productive days went up sharply.",
    },
  },
  {
    nama: "Dimas Suryono",
    asal: "Yogyakarta",
    peran: { id: "Peneliti dan dosen bisnis", en: "Researcher and business lecturer" },
    kutipan: {
      id: "Secara akademis, saya sangat mengapresiasi transparansi developer. Mereka menegaskan bahwa ini bukan tebakan AI yang halusinatif, melainkan rumusan algoritma baku wariga yang diuji pada 210 hari siklus. Mengemas kearifan lokal menjadi tools manajemen waktu yang sistematis adalah sebuah eksekusi yang brilian.",
      en: "Academically, I appreciate the developers' transparency. They are explicit that this is not a hallucinating AI guess but the standard wariga algorithm, checked against all 210 days of the cycle. Packaging local knowledge into a systematic time-management tool is a brilliant piece of execution.",
    },
  },
  {
    nama: "Johannes Tarigan",
    asal: "Medan",
    peran: { id: "Property developer", en: "Property developer" },
    kutipan: {
      id: "Dalam bisnis properti, momentum legalitas adalah kunci. Saya menggunakan fitur 'Laporan Lengkap PDF' dan 'Pencari Hari Acara' untuk menentukan tanggal peletakan batu pertama. Add-on Rp 50.000 ini sangat worth it, laporannya siap cetak dan mudah dipresentasikan kepada para stakeholder.",
      en: "In property, the timing of the legal milestones is everything. I use the Full Report PDF and the Event Day Finder to settle the date of a groundbreaking. The Rp 50,000 add-on is well worth it: the report is print-ready and easy to put in front of stakeholders.",
    },
  },
  {
    nama: "Andi Mappanyukki",
    asal: "Makassar",
    peran: { id: "Pemilik jaringan restoran", en: "Restaurant group owner" },
    kutipan: {
      id: "Fitur 'Fengshui Nama Usaha' dengan sistem 81 angka bekerja dengan sangat terstruktur. Saat melakukan re-branding cabang baru, aplikasi ini mampu membandingkan beberapa kandidat nama secara objektif dan menunjukkan kelemahan energinya. Solusi teknis yang sangat membantu dalam membangun brand equity.",
      en: "The Business Name Fengshui feature and its 81-number system is remarkably structured. Rebranding a new branch, the app compared several candidate names objectively and showed where each one was weak. A genuinely useful technical aid for building brand equity.",
    },
  },
  {
    nama: "Ayu Larasati",
    asal: "Semarang",
    peran: { id: "Pegawai bank, calon pengantin", en: "Bank officer, bride to be" },
    kutipan: {
      id: "Saya dan pasangan sempat kewalahan menyelaraskan jadwal pernikahan dengan kalender kedua pihak keluarga. Fitur 'Kecocokan Pasangan' memecahkan kendala ini secara objektif tanpa bias. Akurasinya memuaskan dan berhasil memangkas perdebatan keluarga dalam menentukan tanggal.",
      en: "My partner and I were overwhelmed trying to line up the wedding with both families' calendars. The Compatibility feature settled it objectively, with no bias on either side. The accuracy satisfied everyone and it cut short a lot of family argument about the date.",
    },
  },
  {
    nama: "Hendra Wijaya",
    asal: "Palembang",
    peran: { id: "Sales area manager", en: "Sales area manager" },
    kutipan: {
      id: "Awalnya saya hanya mencoba trial gratis 3 hari, tapi langsung upgrade ke paket 3 tahun. Visibilitas terhadap 4 kategori energi harian (Mengalir, Tenang, Mawas, Istirahat) membantu saya mengatur jadwal pitching ke klien VIP. Tahu kapan harus menekan target dan kapan harus mengevaluasi strategi adalah nilai jual utama aplikasi ini.",
      en: "I only meant to try the three-day trial, then upgraded straight to the three-year plan. Seeing the four daily energy categories laid out helps me schedule pitches to VIP clients. Knowing when to push a target and when to step back and review the strategy is the real selling point.",
    },
  },
  {
    nama: "Tari Wulandari",
    asal: "Balikpapan",
    peran: { id: "HR consultant", en: "HR consultant" },
    kutipan: {
      id: "Saya menggunakan add-on 'Profil Keluarga' (Rp 75.000) untuk memetakan siklus energi anggota keluarga dalam satu layar. Dari sudut pandang psikologi praktis, fitur ini menekan asumsi-asumsi negatif saat ada anggota keluarga yang sedang berada di 'Hari Istirahat'. Sangat efektif untuk menjaga stabilitas emosional di rumah.",
      en: "I use the Family Profile add-on to map everyone's energy cycle on one screen. In practical psychological terms, it takes the edge off the negative assumptions we make when someone at home is in a 'Hari Istirahat'. Very effective for keeping the household even-tempered.",
    },
  },
  {
    nama: "Kevin Rumagit",
    asal: "Manado",
    peran: { id: "Software engineer", en: "Software engineer" },
    kutipan: {
      id: "Dari kacamata arsitektur TI, aplikasi ini sangat solid. UI/UX yang bersih, flow registrasi yang aman (tanpa syarat kartu kredit), serta zero-bias pada algoritmanya. Menjadikan rumus usia ratusan tahun ke dalam bentuk Software as a Service (SaaS) yang stabil menunjukkan kualitas engineering tingkat tinggi.",
      en: "From an architecture point of view this is solid work. Clean UI and UX, a safe registration flow with no credit card required, and no bias baked into the algorithm. Turning arithmetic that is centuries old into a stable SaaS product shows real engineering quality.",
    },
  },
];
