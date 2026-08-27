/**
 * Fengshui nama usaha dan produk: sistem 81 angka.
 *
 * Metodenya dua lapis, dan keduanya tradisi yang sudah lama beredar:
 *
 * 1. Setiap huruf Latin diberi nilai 1 sampai 9 secara berulang (A=1 sampai
 *    I=9, lalu J=1 lagi). Ini pemetaan numerologi Pythagoras.
 * 2. Jumlah seluruh hurufnya dibaca di tabel 81 angka, yang aslinya dipakai
 *    untuk menghitung guratan aksara Han pada nama.
 *
 * Yang diambil dari tradisi hanya kerangka hitungnya. Nama tiap angka dan
 * seluruh tafsirnya ditulis ulang di sini untuk konteks nama usaha dan nama
 * produk, bukan untuk nama orang, karena itu yang dijual.
 *
 * Catatan pembacaan yang penting, dan sengaja tidak disembunyikan dari
 * pengguna: ini alat pertimbangan, bukan ramalan. Dua nama boleh mendarat di
 * angka yang sama, dan angka yang baik tidak menutupi produk yang buruk.
 */

/** Teks yang punya versi dua bahasa. Sengaja lokal, bukan dipinjam dari harga. */
export interface Teks {
  id: string;
  en: string;
}

/**
 * Nilai huruf A sampai Z.
 *
 * Angka 1 sampai 9 berulang tiga kali dan berhenti di Z=8, jadi huruf terakhir
 * memang tidak genap satu putaran. Bukan salah ketik: begitulah pemetaannya.
 */
export const NILAI_HURUF: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

/** Huruf mana saja yang bernilai n. Dipakai untuk menyarankan penyesuaian. */
export const HURUF_BERNILAI: Record<number, string[]> = (() => {
  const peta: Record<number, string[]> = {};
  for (const [huruf, nilai] of Object.entries(NILAI_HURUF)) {
    (peta[nilai] ??= []).push(huruf);
  }
  return peta;
})();

export type Nada = "baik" | "campur" | "kurang";

/**
 * Nada dipetakan ke warna kategori yang sudah ada.
 *
 * Sengaja memakai token yang sama dengan kategori hari, bukan warna baru:
 * keempat warna itu dikunci suite kontras, dan pengguna sudah membaca hijau
 * sebagai mendukung serta merah sebagai perlu hati-hati di halaman lain.
 * Nilainya ditulis huruf besar supaya langsung bisa dipakai sebagai kunci
 * KATEGORI_SOLID dan kerabatnya tanpa diterjemahkan lagi.
 */
export const NADA_TONE: Record<Nada, "GURU" | "LARA" | "PATI"> = {
  baik: "GURU",
  campur: "LARA",
  kurang: "PATI",
};

export interface Angka81 {
  angka: number;
  nama: Teks;
  nada: Nada;
  /** Tafsir yang sudah diarahkan ke nama usaha dan nama produk. */
  tafsir: Teks;
}

/**
 * Tabel 81 angka.
 *
 * Nadanya mengikuti pembagian tradisional (baik, bercampur, kurang), dan
 * pembagian itu yang menentukan warna serta urutan saat beberapa kandidat
 * nama dibandingkan. Jangan mengubah nada satu angka tanpa acuan: seluruh
 * peringkat kandidat ikut bergeser.
 */
export const TABEL_81: Angka81[] = [
  {
    angka: 1,
    nada: "baik",
    nama: { id: "Awal Mula", en: "Prime Beginning" },
    tafsir: {
      id: "Angka pembuka. Cocok untuk usaha yang benar-benar merintis jalannya sendiri, bukan mengikuti yang sudah ada. Kekuatannya pada kejelasan: satu nama, satu janji, satu produk yang dikenal orang.",
      en: "The opening number. It suits a business that genuinely cuts its own path rather than following one. Its strength is clarity: one name, one promise, one product people recognise.",
    },
  },
  {
    angka: 2,
    nada: "kurang",
    nama: { id: "Terpecah", en: "Split" },
    tafsir: {
      id: "Arah yang mudah terbelah. Nama dengan angka ini sering dipakai usaha yang menawarkan terlalu banyak hal sekaligus, sehingga tidak ada satu pun yang diingat. Pertimbangkan mempersempit fokus sebelum mempersempit nama.",
      en: "A direction that splits easily. Names landing here often belong to businesses offering too many things at once, so none is remembered. Consider narrowing the focus before narrowing the name.",
    },
  },
  {
    angka: 3,
    nada: "baik",
    nama: { id: "Nama Harum", en: "Good Name" },
    tafsir: {
      id: "Angka reputasi. Kuat untuk usaha yang tumbuh dari mulut ke mulut: kuliner, jasa perawatan, kerajinan. Nama seperti ini bekerja paling baik bila mutunya konsisten, karena yang disebarkan orang adalah pengalamannya.",
      en: "The reputation number. Strong for businesses that grow by word of mouth: food, care services, craft. It works best when quality stays consistent, because what people pass along is the experience.",
    },
  },
  {
    angka: 4,
    nada: "kurang",
    nama: { id: "Retak", en: "Fracture" },
    tafsir: {
      id: "Awal yang terlihat rapi tapi mudah retak di sambungannya. Sering muncul pada usaha yang pondasinya belum selesai: modal pas-pasan, peran belum jelas, perjanjian belum tertulis. Namanya bukan penyebabnya, tapi tidak menutupinya juga.",
      en: "A start that looks tidy but cracks at the joints. It often appears where the foundation is unfinished: thin capital, unclear roles, unwritten agreements. The name is not the cause, but it does not cover it either.",
    },
  },
  {
    angka: 5,
    nada: "baik",
    nama: { id: "Berkah Panjang", en: "Lasting Fortune" },
    tafsir: {
      id: "Salah satu angka paling stabil di tabel ini. Baik untuk usaha yang dirancang bertahan lama dan diwariskan, bukan yang dikejar cepat lalu dijual. Pertumbuhannya pelan tapi jarang berbalik.",
      en: "One of the steadiest numbers in this table. Good for a business built to last and to be handed down, not one chased quickly then sold. Growth is slow but rarely reverses.",
    },
  },
  {
    angka: 6,
    nada: "baik",
    nama: { id: "Tanah Kokoh", en: "Firm Ground" },
    tafsir: {
      id: "Angka pondasi. Cocok untuk usaha yang menjual rasa aman: properti, keuangan, logistik, konstruksi. Nama ini terdengar bisa dipegang, dan itu memang yang dicari pembeli di bidang tersebut.",
      en: "The foundation number. It suits businesses that sell reassurance: property, finance, logistics, construction. The name sounds dependable, which is exactly what buyers in those fields look for.",
    },
  },
  {
    angka: 7,
    nada: "baik",
    nama: { id: "Berdiri Sendiri", en: "Self-Standing" },
    tafsir: {
      id: "Kemandirian yang tegas. Kuat untuk usaha perorangan, studio, atau merek yang sengaja tidak ikut arus pasar. Sisi beratnya: angka ini kurang membantu usaha yang bergantung pada kemitraan besar.",
      en: "Firm independence. Strong for solo practices, studios, or brands that deliberately stand apart from the market. Its harder side: this number gives little help to ventures that depend on large partnerships.",
    },
  },
  {
    angka: 8,
    nada: "baik",
    nama: { id: "Tekad Baja", en: "Iron Will" },
    tafsir: {
      id: "Daya tahan menghadapi tekanan. Baik untuk usaha yang tahu pasarnya keras dan siap bertahan lama sebelum untung. Nama ini menua dengan baik, tidak cepat terdengar ketinggalan.",
      en: "Endurance under pressure. Good for a venture that knows its market is hard and is prepared to hold out before profit. This name ages well and does not date quickly.",
    },
  },
  {
    angka: 9,
    nada: "kurang",
    nama: { id: "Surut", en: "Ebb" },
    tafsir: {
      id: "Bakat yang tidak menemukan salurannya. Sering pada usaha yang produknya bagus tapi susah dijelaskan dalam satu kalimat. Kalau nama ini tetap dipakai, pastikan penjelasan singkatnya sangat kuat.",
      en: "Talent that never finds its channel. Common where the product is good but hard to explain in one sentence. If you keep this name, make sure the one-line explanation is very strong.",
    },
  },
  {
    angka: 10,
    nada: "kurang",
    nama: { id: "Ruang Kosong", en: "Void" },
    tafsir: {
      id: "Angka yang tidak berpihak ke mana pun. Usahanya bisa berjalan, tapi jarang menonjol dan mudah tertukar dengan pesaing. Untuk nama produk, ini yang paling merugikan: produk yang tidak diingat tidak dicari.",
      en: "A number that leans nowhere. The business can run, but it rarely stands out and is easily confused with rivals. For a product name this hurts most: what is not remembered is not asked for.",
    },
  },
  {
    angka: 11,
    nada: "baik",
    nama: { id: "Tunas Baru", en: "New Shoot" },
    tafsir: {
      id: "Pemulihan dan tumbuh kembali. Angka yang bagus untuk usaha yang berganti nama setelah gagal, atau produk lama yang diluncurkan ulang. Yang dijanjikannya bukan ledakan, melainkan pertumbuhan yang berlanjut.",
      en: "Recovery and regrowth. A good number for a business renaming after a failure, or an old product relaunched. What it promises is not a burst but growth that keeps going.",
    },
  },
  {
    angka: 12,
    nada: "kurang",
    nama: { id: "Kurang Daya", en: "Short of Strength" },
    tafsir: {
      id: "Rencana yang lebih besar daripada tenaga yang tersedia. Muncul pada usaha yang menargetkan pasar luas dengan tim dan modal kecil. Kalau namanya dipertahankan, kecilkan dulu cakupannya.",
      en: "A plan larger than the strength available. It shows up where a small team and small capital aim at a wide market. If you keep the name, shrink the scope first.",
    },
  },
  {
    angka: 13,
    nada: "baik",
    nama: { id: "Cerdik", en: "Quick Wit" },
    tafsir: {
      id: "Kelincahan membaca peluang. Sangat cocok untuk usaha kreatif, agensi, teknologi, dan produk yang menang karena idenya, bukan karena modalnya. Angka favorit untuk merek yang harus terdengar pintar.",
      en: "Agility in reading opportunity. Well suited to creative work, agencies, technology, and products that win on the idea rather than the capital. A favourite for brands that need to sound sharp.",
    },
  },
  {
    angka: 14,
    nada: "kurang",
    nama: { id: "Berserak", en: "Scattered" },
    tafsir: {
      id: "Tenaga yang tercecer ke banyak arah. Sering pada usaha dengan terlalu banyak lini produk dan tidak ada yang jadi andalan. Untuk nama produk, angka ini menandakan pesan yang tidak sampai utuh.",
      en: "Effort scattered in many directions. Common in businesses with too many product lines and no flagship. For a product name it signals a message that does not arrive whole.",
    },
  },
  {
    angka: 15,
    nada: "baik",
    nama: { id: "Panen Penuh", en: "Full Harvest" },
    tafsir: {
      id: "Salah satu angka terkuat untuk usaha. Menandakan hasil yang matang dan hubungan yang baik dengan orang di sekelilingnya: pemasok, karyawan, pelanggan tetap. Pilihan aman untuk nama perusahaan induk.",
      en: "One of the strongest numbers for business. It marks ripened results and good standing with those around it: suppliers, staff, regulars. A safe choice for a parent company name.",
    },
  },
  {
    angka: 16,
    nada: "baik",
    nama: { id: "Tangan Terbuka", en: "Open Hand" },
    tafsir: {
      id: "Kepemimpinan yang menarik orang datang. Baik untuk usaha yang hidup dari jaringan: distribusi, komunitas, waralaba, marketplace. Nama seperti ini memudahkan orang lain ikut membawanya.",
      en: "Leadership that draws people in. Good for ventures that live on networks: distribution, community, franchising, marketplaces. A name like this makes it easy for others to carry it along.",
    },
  },
  {
    angka: 17,
    nada: "baik",
    nama: { id: "Menembus", en: "Breakthrough" },
    tafsir: {
      id: "Keteguhan yang menerobos hambatan. Cocok untuk usaha yang masuk ke pasar yang sudah ramai dan harus merebut tempat. Sisi yang perlu dijaga: nama sekeras ini butuh pelayanan yang lembut sebagai penyeimbang.",
      en: "Resolve that pushes through obstacles. Suited to entering a crowded market and taking a place in it. The thing to watch: a name this hard needs soft service to balance it.",
    },
  },
  {
    angka: 18,
    nada: "baik",
    nama: { id: "Terwujud", en: "Achieved" },
    tafsir: {
      id: "Rencana yang sampai ke tujuannya. Angka yang baik untuk peluncuran produk dan untuk usaha yang menjual hasil yang terukur. Kuat dipakai bersama nama yang pendek dan tegas.",
      en: "A plan that reaches its destination. A good number for product launches and for businesses that sell measurable results. Strong when paired with a short, firm name.",
    },
  },
  {
    angka: 19,
    nada: "kurang",
    nama: { id: "Aral", en: "Obstruction" },
    tafsir: {
      id: "Kemampuan yang terus tersandung keadaan. Angka ini sering ada pada usaha berbakat yang urusannya banyak tertahan di luar kendalinya: izin, pemasok, cuaca, regulasi. Bila namanya penting bagimu, siapkan cadangan waktu.",
      en: "Ability that keeps tripping over circumstance. It often marks a capable business held up by things outside its control: permits, suppliers, weather, regulation. If the name matters to you, build slack into your timelines.",
    },
  },
  {
    angka: 20,
    nada: "kurang",
    nama: { id: "Rapuh", en: "Brittle" },
    tafsir: {
      id: "Terlihat kuat dari luar, mudah pecah bila ditekan. Salah satu angka yang paling sering disarankan diganti untuk nama badan usaha. Untuk nama produk sampingan yang umurnya pendek, dampaknya lebih ringan.",
      en: "Solid from outside, quick to break under pressure. One of the numbers most often advised against for a legal entity name. For a short-lived side product the impact is lighter.",
    },
  },
  {
    angka: 21,
    nada: "baik",
    nama: { id: "Bulan Terang", en: "Bright Moon" },
    tafsir: {
      id: "Angka kepemimpinan yang matang. Baik untuk usaha yang ingin dikenal sebagai rujukan di bidangnya, bukan sekadar penjual. Tumbuhnya bertahap, dan puncaknya datang setelah beberapa tahun, bukan di tahun pertama.",
      en: "A number of matured leadership. Good for a business that wants to be known as the reference in its field, not merely a seller. Growth is gradual and the peak arrives after some years, not in the first.",
    },
  },
  {
    angka: 22,
    nada: "kurang",
    nama: { id: "Layu", en: "Withering" },
    tafsir: {
      id: "Awal yang bersemangat lalu kehilangan tenaga di tengah jalan. Sering pada usaha yang ramai saat dibuka lalu sepi setelah enam bulan. Kalau namanya tetap dipakai, rencanakan sesuatu yang menyegarkan di bulan-bulan itu.",
      en: "An eager start that loses energy midway. Common where a launch is busy then quiet after six months. If you keep the name, plan something refreshing for exactly those months.",
    },
  },
  {
    angka: 23,
    nada: "baik",
    nama: { id: "Matahari Naik", en: "Rising Sun" },
    tafsir: {
      id: "Salah satu angka paling terang di tabel ini. Pertumbuhan cepat dan terlihat. Cocok untuk usaha yang memang ingin menonjol dan siap dengan perhatian yang datang bersamanya.",
      en: "One of the brightest numbers here. Fast and visible growth. Suited to a business that genuinely wants to stand out and is ready for the attention that comes with it.",
    },
  },
  {
    angka: 24,
    nada: "baik",
    nama: { id: "Berlimpah", en: "Abundance" },
    tafsir: {
      id: "Angka pengumpulan harta yang tumbuh dari kecil. Cocok untuk usaha yang untungnya tipis per transaksi tapi banyak jumlahnya: ritel, warung, produk sehari-hari. Kuat untuk nama produk yang dibeli berulang.",
      en: "A number for wealth gathered from small beginnings. It suits businesses with thin margins and high volume: retail, small shops, everyday goods. Strong for a product bought again and again.",
    },
  },
  {
    angka: 25,
    nada: "baik",
    nama: { id: "Cakap", en: "Capable" },
    tafsir: {
      id: "Keterampilan yang diakui orang. Baik untuk usaha jasa yang menjual keahlian: konsultan, bengkel, klinik, jasa teknis. Yang perlu dijaga: nada namanya jangan sampai terdengar lebih tinggi dari pelayanannya.",
      en: "Skill that others recognise. Good for service businesses selling expertise: consultants, workshops, clinics, technical services. Watch that the name never sounds grander than the service.",
    },
  },
  {
    angka: 26,
    nada: "kurang",
    nama: { id: "Gelombang Besar", en: "Rough Swell" },
    tafsir: {
      id: "Naik turun yang tajam. Bisa menghasilkan usaha yang luar biasa besar, bisa juga karam, dan keduanya sama-sama mungkin. Angka yang tidak cocok bila kamu butuh penghasilan yang bisa diperkirakan tiap bulan.",
      en: "Sharp rises and falls. It can produce an unusually large business or sink one, and both are equally possible. A poor fit if you need predictable monthly income.",
    },
  },
  {
    angka: 27,
    nada: "campur",
    nama: { id: "Setengah Jalan", en: "Halfway" },
    tafsir: {
      id: "Maju jauh lalu berhenti sebelum tuntas. Sering pada usaha yang berhasil di tahap awal lalu sulit naik kelas. Angka ini bukan penghalang, tapi menandakan perlunya orang kedua yang menutup apa yang tidak kamu selesaikan.",
      en: "It goes far then stops short of finishing. Common where a venture succeeds early then struggles to scale. Not a barrier, but a sign you need a second person who closes what you leave open.",
    },
  },
  {
    angka: 28,
    nada: "kurang",
    nama: { id: "Terpisah", en: "Severed" },
    tafsir: {
      id: "Perpisahan dan pergantian yang berulang. Untuk usaha, ini paling terasa pada perputaran karyawan dan mitra yang tinggi. Salah satu angka yang paling sering disarankan diganti untuk usaha berbasis tim.",
      en: "Repeated partings and turnover. In business it shows most in staff and partners who keep changing. One of the numbers most often advised against for team-based ventures.",
    },
  },
  {
    angka: 29,
    nada: "baik",
    nama: { id: "Daya Hidup", en: "Life Force" },
    tafsir: {
      id: "Tenaga besar dan keinginan yang tidak cepat puas. Baik untuk usaha yang berencana ekspansi ke banyak cabang. Sisi yang perlu direm: angka ini mendorong tumbuh lebih cepat daripada kesiapan pengelolaannya.",
      en: "Large energy and appetite that is slow to be satisfied. Good for a venture planning many branches. The side to restrain: it pushes growth faster than management is ready for.",
    },
  },
  {
    angka: 30,
    nada: "campur",
    nama: { id: "Untung-untungan", en: "Gamble" },
    tafsir: {
      id: "Hasilnya bergantung pada keputusan besar yang diambil sekali dua kali, bukan pada kerja harian. Bisa sangat berhasil, bisa habis. Kalau memilih nama ini, batasi seberapa besar taruhan yang boleh diambil sekaligus.",
      en: "The outcome rests on one or two large decisions rather than on daily work. It can succeed greatly or be spent entirely. If you choose this name, cap how much you are willing to stake at once.",
    },
  },
  {
    angka: 31,
    nada: "baik",
    nama: { id: "Berani dan Arif", en: "Brave and Wise" },
    tafsir: {
      id: "Keberanian yang disertai pertimbangan, gabungan yang jarang. Salah satu angka terbaik untuk nama perusahaan yang dipimpin sendiri oleh pendirinya. Tahan lama dan tidak mudah goyah oleh tren.",
      en: "Courage carried with judgement, an uncommon pairing. One of the best numbers for a company still led by its founder. Durable, and not easily shaken by trends.",
    },
  },
  {
    angka: 32,
    nada: "baik",
    nama: { id: "Peluang Datang", en: "Fortune Calls" },
    tafsir: {
      id: "Bantuan datang dari orang lain pada waktu yang tepat. Angka yang baik untuk usaha yang tumbuh lewat rekomendasi, investor, atau mitra besar. Rawatlah hubungan itu, karena di situ kekuatannya.",
      en: "Help arrives from others at the right moment. A good number for ventures that grow through referrals, investors, or a large partner. Tend those relationships, because that is where its strength sits.",
    },
  },
  {
    angka: 33,
    nada: "baik",
    nama: { id: "Naik Tinggi", en: "Soaring" },
    tafsir: {
      id: "Angka yang sangat kuat, dan justru karena itu tidak cocok untuk semua. Baik untuk usaha yang ambisinya memang besar dan pemiliknya sanggup memikul sorotan. Untuk usaha rumahan, angka ini terasa kebesaran.",
      en: "A very strong number, and for that reason not right for everyone. Good where the ambition really is large and the owner can carry the spotlight. For a home business it sits oversized.",
    },
  },
  {
    angka: 34,
    nada: "kurang",
    nama: { id: "Runtuh", en: "Collapse" },
    tafsir: {
      id: "Kerusakan yang datang mendadak setelah masa yang tampak tenang. Angka yang paling banyak dihindari dalam tradisi ini untuk nama badan usaha. Bila nama ini sudah terlanjur dipakai, pertimbangkan menambahkan satu kata di depannya.",
      en: "Damage that arrives suddenly after a calm stretch. The number most avoided in this tradition for a legal entity name. If it is already in use, consider adding one word in front of it.",
    },
  },
  {
    angka: 35,
    nada: "baik",
    nama: { id: "Tenteram", en: "Serene" },
    tafsir: {
      id: "Kestabilan yang lembut, bukan pertumbuhan yang cepat. Sangat cocok untuk usaha yang menjual ketenangan: penginapan, spa, pendidikan, jasa perawatan. Kurang mendukung usaha yang harus agresif merebut pasar.",
      en: "Gentle stability rather than quick growth. Very suited to businesses selling calm: lodging, spas, education, care services. Less supportive where the market must be taken aggressively.",
    },
  },
  {
    angka: 36,
    nada: "kurang",
    nama: { id: "Ombak Gelisah", en: "Restless Waves" },
    tafsir: {
      id: "Selalu sibuk tapi jarang tenang. Sering pada usaha yang pemiliknya mengurus semuanya sendiri dan tidak sempat menata. Angka ini mengingatkan untuk mendelegasikan lebih awal daripada yang terasa nyaman.",
      en: "Always busy and seldom settled. Common where the owner handles everything and never gets to organise. It is a reminder to delegate earlier than feels comfortable.",
    },
  },
  {
    angka: 37,
    nada: "baik",
    nama: { id: "Berwibawa", en: "Commanding" },
    tafsir: {
      id: "Kepemimpinan yang dituruti tanpa harus memaksa. Baik untuk usaha yang mengoordinasi banyak pihak: kontraktor, event, distribusi, koperasi. Nama ini terdengar bisa dipercaya memegang tanggung jawab besar.",
      en: "Authority that is followed without force. Good for ventures coordinating many parties: contractors, events, distribution, cooperatives. The name sounds trustworthy with large responsibility.",
    },
  },
  {
    angka: 38,
    nada: "campur",
    nama: { id: "Tekun Berbakat", en: "Patient Craft" },
    tafsir: {
      id: "Bakat yang nyata tapi tidak agresif menjual dirinya. Sangat baik untuk usaha kerajinan, seni, dan produk yang mutunya bicara pelan-pelan. Kurang mendukung bila kamu butuh penjualan besar dalam waktu singkat.",
      en: "Real talent that does not push itself forward. Very good for craft, art, and products whose quality speaks slowly. Less supportive if you need large sales in a short time.",
    },
  },
  {
    angka: 39,
    nada: "baik",
    nama: { id: "Kelimpahan", en: "Wealth" },
    tafsir: {
      id: "Angka kemakmuran yang jelas. Salah satu pilihan paling disukai untuk nama perusahaan dagang dan keuangan. Karena kuat, angka ini menuntut pengelolaan yang rapi supaya yang masuk tidak sama cepatnya keluar.",
      en: "An unambiguous number of prosperity. A favourite for trading and finance company names. Because it is strong, it demands tidy management so what comes in does not leave as fast.",
    },
  },
  {
    angka: 40,
    nada: "campur",
    nama: { id: "Untung Berisiko", en: "Risky Gain" },
    tafsir: {
      id: "Kecerdikan yang bisa membawa untung besar atau menabrak batas. Angka yang menuntut kehati-hatian pada janji dan kontrak. Untuk nama produk, pastikan klaimnya tidak melebihi yang bisa dibuktikan.",
      en: "Shrewdness that can bring large gains or cross a line. It calls for care with promises and contracts. For a product name, make sure the claim never exceeds what you can prove.",
    },
  },
  {
    angka: 41,
    nada: "baik",
    nama: { id: "Kebajikan", en: "Virtue" },
    tafsir: {
      id: "Kemampuan dan nama baik yang berjalan bersama. Angka yang bagus untuk usaha yang ingin dipercaya dalam jangka panjang, termasuk yayasan dan usaha keluarga. Jarang menghasilkan lonjakan, tapi hampir tidak pernah berbalik.",
      en: "Ability and good standing moving together. A fine number for ventures that want long-term trust, including foundations and family businesses. It rarely spikes, and almost never reverses.",
    },
  },
  {
    angka: 42,
    nada: "campur",
    nama: { id: "Serba Bisa", en: "Jack of Trades" },
    tafsir: {
      id: "Banyak kemampuan, sedikit yang didalami. Untuk usaha, ini menandakan godaan mengambil setiap pekerjaan yang datang. Angka ini membaik begitu kamu berani menolak pekerjaan yang di luar bidangmu.",
      en: "Many abilities, few taken deep. In business it marks the temptation to accept every job that arrives. This number improves the moment you start declining work outside your field.",
    },
  },
  {
    angka: 43,
    nada: "campur",
    nama: { id: "Harta Bocor", en: "Leaking Wealth" },
    tafsir: {
      id: "Pemasukan cukup tapi tidak tinggal. Sering pada usaha yang omzetnya besar sementara untungnya tipis karena biaya tidak terpantau. Kalau namanya dipertahankan, pembukuan yang ketat adalah penyeimbangnya.",
      en: "Income enough but it does not stay. Common where turnover is large and profit thin because costs go unwatched. If you keep the name, strict bookkeeping is its counterweight.",
    },
  },
  {
    angka: 44,
    nada: "kurang",
    nama: { id: "Pusaran", en: "Whirlpool" },
    tafsir: {
      id: "Usaha yang berputar tanpa maju. Rencana berganti terus, dan tenaga habis di perubahan arah, bukan di pekerjaannya. Angka yang sebaiknya dihindari untuk nama badan usaha yang berumur panjang.",
      en: "A venture that turns without advancing. Plans keep changing and energy is spent on the turns rather than the work. Best avoided for a long-lived entity name.",
    },
  },
  {
    angka: 45,
    nada: "baik",
    nama: { id: "Jalan Lapang", en: "Clear Road" },
    tafsir: {
      id: "Rencana yang bisa dijalankan tanpa banyak hambatan. Angka yang baik untuk usaha yang butuh proses panjang dan izin banyak: properti, pendidikan, kesehatan. Hasilnya datang tepat waktu, bukan lebih cepat.",
      en: "A plan that can be carried out without much obstruction. A good number for ventures needing long processes and many permits: property, education, health. Results come on time rather than early.",
    },
  },
  {
    angka: 46,
    nada: "kurang",
    nama: { id: "Terhuyung", en: "Stumbling" },
    tafsir: {
      id: "Beban yang lebih berat daripada pundak yang memikulnya. Muncul pada usaha yang tumbuh terlalu cepat sebelum sistemnya siap. Bila namanya penting, tahan dulu ekspansinya sampai pondasinya menyusul.",
      en: "A load heavier than the shoulders carrying it. It appears where a venture grows faster than its systems. If the name matters, hold expansion until the foundation catches up.",
    },
  },
  {
    angka: 47,
    nada: "baik",
    nama: { id: "Mekar", en: "Blossom" },
    tafsir: {
      id: "Hasil yang datang pada waktunya dan disertai dukungan orang. Salah satu angka paling aman untuk nama produk baru. Cocok untuk peluncuran, karena menandakan sambutan yang baik sejak awal.",
      en: "Results arriving in season, with people's support behind them. One of the safest numbers for a new product name. Good for launches, since it marks a warm early reception.",
    },
  },
  {
    angka: 48,
    nada: "baik",
    nama: { id: "Guru Bijak", en: "Wise Counsel" },
    tafsir: {
      id: "Angka penasihat: dipercaya, dimintai pendapat, dihormati. Sangat cocok untuk konsultan, pendidikan, lembaga, dan usaha yang menjual pengetahuan. Kurang cocok untuk produk yang menjual kesenangan cepat.",
      en: "The adviser's number: trusted, consulted, respected. Very suited to consulting, education, institutions, and businesses selling knowledge. Less suited to products selling quick pleasure.",
    },
  },
  {
    angka: 49,
    nada: "kurang",
    nama: { id: "Bimbang", en: "Wavering" },
    tafsir: {
      id: "Keputusan yang selalu tertunda. Untuk usaha, ini terasa pada peluang yang lewat karena terlalu lama ditimbang. Angka ini melemahkan nama yang seharusnya terdengar tegas.",
      en: "Decisions that are always postponed. In business it shows as opportunities lost to over-deliberation. This number weakens a name that ought to sound decisive.",
    },
  },
  {
    angka: 50,
    nada: "kurang",
    nama: { id: "Naik Lalu Turun", en: "Rise then Fall" },
    tafsir: {
      id: "Satu keberhasilan besar diikuti kemunduran yang sepadan. Sering pada usaha yang bergantung pada satu produk atau satu pelanggan besar. Penyeimbangnya jelas: jangan bertumpu pada satu kaki.",
      en: "One large success followed by a matching setback. Common where a venture leans on a single product or a single big client. The counterweight is plain: do not stand on one leg.",
    },
  },
  {
    angka: 51,
    nada: "campur",
    nama: { id: "Pasang Surut", en: "Tide" },
    tafsir: {
      id: "Berhasil di awal, diuji di tengah, membaik lagi kemudian. Angka yang wajar untuk usaha musiman: pariwisata, pertanian, mode. Yang menentukan bukan namanya, melainkan cadangan kas di musim sepi.",
      en: "Success early, testing in the middle, improvement again later. A reasonable number for seasonal work: tourism, agriculture, fashion. What decides the outcome is not the name but the cash reserve in the quiet season.",
    },
  },
  {
    angka: 52,
    nada: "baik",
    nama: { id: "Terpandang Jauh", en: "Far Sight" },
    tafsir: {
      id: "Kemampuan melihat lebih awal daripada orang lain. Angka yang bagus untuk usaha yang menaruh taruhannya pada tren yang belum ramai. Butuh kesabaran, karena pasarnya baru menyusul beberapa waktu kemudian.",
      en: "The ability to see earlier than others. A good number for a venture betting on a trend before the crowd. It requires patience, since the market only catches up later.",
    },
  },
  {
    angka: 53,
    nada: "kurang",
    nama: { id: "Manis di Luar", en: "Sweet Outside" },
    tafsir: {
      id: "Tampak makmur, di dalam berat. Angka yang mengingatkan pada usaha yang mengejar citra sebelum arus kasnya sehat. Kalau namanya tetap dipilih, dahulukan margin sebelum penampilan.",
      en: "Prosperous outside, strained within. It points to ventures chasing image before cash flow is healthy. If you keep the name, put margin ahead of appearance.",
    },
  },
  {
    angka: 54,
    nada: "kurang",
    nama: { id: "Terjal", en: "Steep" },
    tafsir: {
      id: "Jalan yang bisa didaki tapi menguras. Salah satu angka paling berat di tabel ini, dan jarang disarankan untuk nama usaha baru. Bila nama ini punya nilai sejarah bagimu, pertimbangkan memakainya sebagai nama lini, bukan nama badan usaha.",
      en: "A road that can be climbed but drains you. One of the heaviest numbers here, seldom advised for a new business name. If it carries history for you, consider using it as a line name rather than the entity name.",
    },
  },
  {
    angka: 55,
    nada: "campur",
    nama: { id: "Baik Bercampur", en: "Mixed Blessing" },
    tafsir: {
      id: "Kebaikan dan kesulitan hadir bersamaan dalam ukuran yang hampir sama. Angka yang menuntut kesiapan menerima keduanya. Untuk usaha, artinya rencanakan dua skenario, jangan hanya yang optimistis.",
      en: "Good and difficulty arrive together in near equal measure. It asks you to be ready for both. In business that means planning two scenarios, not only the optimistic one.",
    },
  },
  {
    angka: 56,
    nada: "kurang",
    nama: { id: "Kurang Bertenaga", en: "Underpowered" },
    tafsir: {
      id: "Keinginan ada, dorongan untuk melaksanakannya kurang. Sering pada usaha sampingan yang tidak pernah benar-benar dijalankan penuh. Angka ini melemahkan nama yang butuh kesan bergerak cepat.",
      en: "The wish is there, the drive to act on it is not. Common in side ventures never fully run. This number weakens a name that needs to feel fast-moving.",
    },
  },
  {
    angka: 57,
    nada: "baik",
    nama: { id: "Tegar", en: "Resilient" },
    tafsir: {
      id: "Melewati satu masa sulit lalu keluar lebih kuat. Angka yang baik untuk usaha yang tahu akan menghadapi persaingan keras di awal. Yang dijanjikannya bukan jalan mulus, melainkan daya pulih.",
      en: "It passes through one hard stretch and comes out stronger. A good number for a venture expecting fierce early competition. What it promises is not a smooth road but the power to recover.",
    },
  },
  {
    angka: 58,
    nada: "campur",
    nama: { id: "Susah Dulu, Senang Kemudian", en: "Late Bloom" },
    tafsir: {
      id: "Tahun-tahun awal berat, sesudahnya membaik dan bertahan. Angka yang jujur untuk usaha yang tahu titik impasnya jauh. Kalau kamu punya napas panjang, ini bukan angka yang buruk.",
      en: "The early years are hard, then it improves and holds. An honest number for a venture whose break-even point is far off. If you have long breath, this is not a bad number.",
    },
  },
  {
    angka: 59,
    nada: "kurang",
    nama: { id: "Padam", en: "Extinguished" },
    tafsir: {
      id: "Semangat yang habis sebelum hasilnya terlihat. Angka yang mengingatkan pentingnya tujuan antara: sesuatu yang bisa dirayakan sebelum tujuan besarnya tercapai. Untuk nama badan usaha, sebaiknya dicari alternatif.",
      en: "Spirit spent before results appear. It underlines the need for milestones: something worth celebrating before the large goal arrives. For an entity name, an alternative is better.",
    },
  },
  {
    angka: 60,
    nada: "kurang",
    nama: { id: "Tanpa Arah", en: "Adrift" },
    tafsir: {
      id: "Bergerak tanpa tujuan yang disepakati. Sering pada usaha yang pemiliknya lebih dari satu dan belum sepakat mau ke mana. Sebelum mengganti namanya, sepakati dulu tujuannya.",
      en: "Movement without an agreed destination. Common where there is more than one owner and no shared direction yet. Settle the destination before changing the name.",
    },
  },
  {
    angka: 61,
    nada: "baik",
    nama: { id: "Nama dan Kuasa", en: "Name and Power" },
    tafsir: {
      id: "Kemakmuran yang datang bersama pengakuan. Angka yang kuat untuk nama perusahaan yang ingin dikenal luas. Sisi yang perlu dijaga: mudah membuat orang di dalamnya merasa lebih tinggi daripada pelanggannya.",
      en: "Prosperity arriving with recognition. A strong number for a company meant to be widely known. The side to watch: it easily makes those inside feel above their customers.",
    },
  },
  {
    angka: 62,
    nada: "kurang",
    nama: { id: "Retak Dalam", en: "Inner Crack" },
    tafsir: {
      id: "Luarnya utuh, di dalamnya sudah renggang. Untuk usaha, ini biasanya soal kepercayaan antar pengelola yang tidak pernah dibicarakan. Angka ini menyarankan membereskan urusan di dalam sebelum mengurus citra di luar.",
      en: "Whole outside, already loose within. In business this is usually unspoken trust between the people running it. The number suggests settling matters inside before working on the outside image.",
    },
  },
  {
    angka: 63,
    nada: "baik",
    nama: { id: "Makmur", en: "Prosperous" },
    tafsir: {
      id: "Kemakmuran yang tumbuh dan bisa diwariskan. Salah satu angka paling seimbang untuk usaha keluarga. Tidak menuntut keberanian besar, hanya kesinambungan.",
      en: "Prosperity that grows and can be handed on. One of the most balanced numbers for a family business. It asks for continuity rather than boldness.",
    },
  },
  {
    angka: 64,
    nada: "kurang",
    nama: { id: "Sia-sia", en: "In Vain" },
    tafsir: {
      id: "Usaha keras yang hasilnya tidak sepadan. Angka yang jarang disarankan untuk nama apa pun yang dipakai jangka panjang. Kalau muncul pada kandidat favoritmu, coba tambahkan satu kata dan hitung ulang.",
      en: "Hard effort with results that do not match it. Rarely advised for any name meant to last. If it lands on your favourite candidate, try adding one word and recount.",
    },
  },
  {
    angka: 65,
    nada: "baik",
    nama: { id: "Panjang dan Terang", en: "Long and Bright" },
    tafsir: {
      id: "Umur panjang disertai nama yang terang. Angka yang cocok untuk usaha yang ingin berdiri puluhan tahun di satu tempat. Pertumbuhannya tenang dan jarang terganggu.",
      en: "Long life carried with a bright name. It suits a business meant to stand for decades in one place. Growth is calm and seldom disturbed.",
    },
  },
  {
    angka: 66,
    nada: "kurang",
    nama: { id: "Tak Damai", en: "Unsettled" },
    tafsir: {
      id: "Kesulitan yang datang dari dua arah sekaligus. Untuk usaha, ini sering berupa tekanan dari pasar dan dari dalam tim pada waktu yang sama. Angka yang menuntut cadangan, baik uang maupun tenaga.",
      en: "Difficulty arriving from two directions at once. In business that is often market pressure and internal strain together. A number that demands reserves, of money and of energy.",
    },
  },
  {
    angka: 67,
    nada: "baik",
    nama: { id: "Jalan Terbuka", en: "Open Path" },
    tafsir: {
      id: "Pintu yang terbuka dan bantuan yang mudah didapat. Angka yang bagus untuk usaha yang butuh banyak izin, mitra, atau saluran distribusi. Yang datang bukan kemudahan tanpa kerja, melainkan lebih sedikit penolakan.",
      en: "Doors that open and help that comes easily. A good number for ventures needing many permits, partners, or distribution channels. What arrives is not effortlessness but fewer refusals.",
    },
  },
  {
    angka: 68,
    nada: "baik",
    nama: { id: "Pencipta", en: "Inventor" },
    tafsir: {
      id: "Gagasan baru yang disertai ketekunan menjalankannya, gabungan yang jarang. Angka terbaik di tabel ini untuk usaha berbasis produk sendiri, bukan menjual barang orang lain. Sangat cocok untuk nama produk.",
      en: "New ideas paired with the patience to carry them out, an uncommon combination. The best number here for a business built on its own product rather than reselling. Very well suited to a product name.",
    },
  },
  {
    angka: 69,
    nada: "kurang",
    nama: { id: "Terhenti", en: "Stalled" },
    tafsir: {
      id: "Bergerak lalu tertahan tanpa sebab yang jelas. Sering pada usaha yang menunggu satu hal yang tidak kunjung datang: perizinan, investor, satu pelanggan besar. Angka ini menyarankan mencari jalan kedua.",
      en: "Movement that halts for no clear reason. Common where a venture waits on one thing that never arrives: a permit, an investor, one big client. The number suggests finding a second route.",
    },
  },
  {
    angka: 70,
    nada: "kurang",
    nama: { id: "Sunyi", en: "Desolate" },
    tafsir: {
      id: "Kesepian dan kehilangan arah. Salah satu angka paling berat, dan tidak disarankan untuk nama yang akan dipakai bertahun-tahun. Untuk nama produk musiman, dampaknya lebih terbatas.",
      en: "Isolation and lost bearings. One of the heaviest numbers, not advised for a name meant to last years. For a seasonal product name the impact is more limited.",
    },
  },
  {
    angka: 71,
    nada: "campur",
    nama: { id: "Kuat di Dalam", en: "Strong Within" },
    tafsir: {
      id: "Kekuatan yang nyata tapi enggan ditunjukkan. Untuk usaha, artinya mutunya bagus sementara pemasarannya diam. Angka ini membaik begitu kamu berani bicara tentang apa yang kamu kerjakan.",
      en: "Real strength that is reluctant to show itself. In business that means good quality with quiet marketing. This number improves as soon as you start speaking about what you make.",
    },
  },
  {
    angka: 72,
    nada: "kurang",
    nama: { id: "Pahit di Balik Manis", en: "Bitter behind Sweet" },
    tafsir: {
      id: "Keberhasilan awal yang menyimpan tagihan di belakangnya. Sering pada usaha yang tumbuh dengan utang atau diskon besar. Yang perlu diperiksa bukan namanya, melainkan berapa lama diskonnya sanggup ditanggung.",
      en: "Early success carrying a bill behind it. Common where growth is funded by debt or deep discounts. What needs checking is not the name but how long the discount can be carried.",
    },
  },
  {
    angka: 73,
    nada: "campur",
    nama: { id: "Cukup Diri", en: "Modest Sufficiency" },
    tafsir: {
      id: "Tidak besar, tapi tidak pernah kekurangan. Angka yang jujur untuk usaha kecil yang memang tidak ingin membesar. Kalau rencanamu ekspansi, angka ini tidak akan membantu mendorongnya.",
      en: "Not large, but never wanting. An honest number for a small business that does not wish to grow big. If your plan is expansion, this number will not push it along.",
    },
  },
  {
    angka: 74,
    nada: "kurang",
    nama: { id: "Tak Berguna", en: "Idle" },
    tafsir: {
      id: "Tenaga yang terpakai untuk hal yang tidak menghasilkan. Angka yang mengingatkan untuk memeriksa mana kegiatan yang benar-benar mendatangkan pemasukan. Untuk nama badan usaha, sebaiknya dihindari.",
      en: "Effort spent on what does not produce. A reminder to check which activities actually bring income. Best avoided for an entity name.",
    },
  },
  {
    angka: 75,
    nada: "campur",
    nama: { id: "Menunggu Waktu", en: "Bide Time" },
    tafsir: {
      id: "Baik bila bertahan, buruk bila memaksa maju. Angka yang cocok untuk usaha yang sedang menunggu pasarnya matang. Jangan pakai nama ini untuk sesuatu yang harus tumbuh cepat tahun ini.",
      en: "Good when holding, poor when forcing forward. It suits a venture waiting for its market to ripen. Do not give this name to something that must grow fast this year.",
    },
  },
  {
    angka: 76,
    nada: "kurang",
    nama: { id: "Tulang Patah", en: "Broken Frame" },
    tafsir: {
      id: "Kerangka yang tidak sanggup menahan bebannya. Untuk usaha, biasanya soal struktur: terlalu banyak lapisan, atau satu orang memegang terlalu banyak. Angka yang jarang disarankan untuk nama perusahaan.",
      en: "A frame that cannot hold its load. In business it is usually structural: too many layers, or one person holding too much. Seldom advised for a company name.",
    },
  },
  {
    angka: 77,
    nada: "campur",
    nama: { id: "Separuh Baik", en: "Half Good" },
    tafsir: {
      id: "Sebagian perjalanan mendukung, sebagian tidak. Angka yang hasilnya sangat bergantung pada siapa yang menjalankannya. Untuk kandidat nama, ini biasanya bukan pilihan pertama, tapi bukan pula yang harus dicoret.",
      en: "Part of the journey supports you, part does not. The outcome depends heavily on who is running it. As a candidate this is usually not the first choice, but not one to strike out either.",
    },
  },
  {
    angka: 78,
    nada: "campur",
    nama: { id: "Terang Lalu Redup", en: "Bright then Dim" },
    tafsir: {
      id: "Paruh pertama baik, paruh kedua menurun. Angka yang wajar untuk produk dengan umur pakai terbatas, dan kurang cocok untuk nama badan usaha yang diharapkan bertahan. Rencanakan penerusnya sejak awal.",
      en: "The first half is good, the second declines. Reasonable for a product with a limited life, less so for an entity name expected to last. Plan its successor from the start.",
    },
  },
  {
    angka: 79,
    nada: "kurang",
    nama: { id: "Tak Bisa Maju", en: "No Way Forward" },
    tafsir: {
      id: "Kepercayaan yang sulit didapat dan jalan yang buntu. Salah satu angka yang paling melemahkan untuk usaha yang menjual jasa. Sebaiknya dicarikan alternatif sebelum nama ini dipakai resmi.",
      en: "Trust that is hard to earn and a road that ends. One of the most weakening numbers for a service business. Find an alternative before this name is registered.",
    },
  },
  {
    angka: 80,
    nada: "campur",
    nama: { id: "Mundur Lalu Tenang", en: "Retreat to Peace" },
    tafsir: {
      id: "Kesulitan panjang yang berakhir tenang bila kamu bersedia mengecil. Angka yang tidak cocok untuk ekspansi, tapi masuk akal untuk usaha yang sengaja dijalankan kecil dan tenang.",
      en: "A long difficulty that ends calmly if you are willing to become smaller. Poor for expansion, but sensible for a venture deliberately kept small and quiet.",
    },
  },
  {
    angka: 81,
    nada: "baik",
    nama: { id: "Kembali ke Awal", en: "Full Circle" },
    tafsir: {
      id: "Angka penutup yang kembali ke sifat angka satu, dengan pengalaman di belakangnya. Salah satu angka terkuat di tabel ini untuk kemakmuran. Cocok untuk nama perusahaan induk yang menaungi banyak usaha.",
      en: "The closing number, returning to the nature of one with experience behind it. Among the strongest here for prosperity. Well suited to a parent company holding several ventures.",
    },
  },
];

/** Lima unsur, dibaca dari digit terakhir angka hasil. */
export const UNSUR = ["Kayu", "Api", "Tanah", "Logam", "Air"] as const;
export type Unsur = (typeof UNSUR)[number];

export const UNSUR_LABEL: Record<Unsur, Teks> = {
  Kayu: { id: "Kayu", en: "Wood" },
  Api: { id: "Api", en: "Fire" },
  Tanah: { id: "Tanah", en: "Earth" },
  Logam: { id: "Logam", en: "Metal" },
  Air: { id: "Air", en: "Water" },
};

export const UNSUR_SIFAT: Record<Unsur, Teks> = {
  Kayu: {
    id: "Tumbuh dan memanjang. Mendukung usaha yang berkembang lewat cabang, mitra, dan lini baru.",
    en: "Growing and extending. It supports ventures that expand through branches, partners, and new lines.",
  },
  Api: {
    id: "Menyala dan terlihat. Mendukung usaha yang hidup dari perhatian: mode, hiburan, kuliner, pemasaran.",
    en: "Burning and visible. It supports ventures that live on attention: fashion, entertainment, food, marketing.",
  },
  Tanah: {
    id: "Menahan dan menyimpan. Mendukung usaha yang menjual rasa aman: properti, keuangan, penyimpanan, pendidikan.",
    en: "Holding and storing. It supports ventures that sell security: property, finance, storage, education.",
  },
  Logam: {
    id: "Memotong dan menegaskan. Mendukung usaha yang menuntut ketepatan: teknik, hukum, alat, manufaktur.",
    en: "Cutting and defining. It supports ventures that demand precision: engineering, law, tools, manufacturing.",
  },
  Air: {
    id: "Mengalir dan menyesuaikan. Mendukung usaha yang berpindah dan menghubungkan: dagang, logistik, perjalanan, jasa daring.",
    en: "Flowing and adapting. It supports ventures that move and connect: trade, logistics, travel, online services.",
  },
};

/**
 * Unsur dibaca dari digit terakhir angka hasil.
 *
 * Ditulis sebagai tabel, bukan sebagai rumus pembagian, karena pasangannya
 * tidak sejajar dengan urutan digit: nol berpasangan dengan sembilan di ujung
 * yang lain, bukan dengan satu. Rumus yang tampak rapi justru meleset di situ.
 */
const UNSUR_DIGIT: readonly Unsur[] = [
  "Air", // 0
  "Kayu", // 1
  "Kayu", // 2
  "Api", // 3
  "Api", // 4
  "Tanah", // 5
  "Tanah", // 6
  "Logam", // 7
  "Logam", // 8
  "Air", // 9
];

export function unsurAngka(angka: number): Unsur {
  return UNSUR_DIGIT[angka % 10];
}

/**
 * Batas panjang nama yang diperiksa.
 *
 * Bukan batas teknis, melainkan batas yang masuk akal: nama usaha yang lebih
 * panjang dari ini tidak akan diingat orang, dan hasil hitungnya jadi tidak
 * berarti karena hampir semua huruf saling meredam.
 */
export const BATAS_HURUF = 48;

/** Berapa kandidat nama yang boleh dibandingkan sekaligus. */
export const BATAS_KANDIDAT = 6;

/**
 * Turunkan jumlah huruf ke rentang 1 sampai 81.
 *
 * Dikurangi 80 berulang, bukan sisa bagi 80. Bedanya nyata di dua tempat, dan
 * keduanya salah pada aplikasi yang metodenya dibedah untuk fitur ini: jumlah
 * tepat 160 memberi sisa 0 lalu menunjuk ke luar tabel, dan 161 seharusnya
 * berhenti di 81, bukan turun ke 1. Nama sepanjang itu memang jarang, tapi
 * "jarang" bukan alasan mengembalikan hasil yang salah.
 */
export function reduksi81(jumlah: number): number {
  let n = jumlah;
  while (n > 81) n -= 80;
  return n;
}

export interface RincianHuruf {
  huruf: string;
  nilai: number;
}

export interface HasilFengshui {
  /** Nama seperti yang diketik, hanya dirapikan spasinya. */
  nama: string;
  /** Huruf yang benar-benar dihitung, tanpa spasi, angka, dan tanda baca. */
  rincian: RincianHuruf[];
  /** Berapa karakter yang diabaikan karena bukan huruf A sampai Z. */
  diabaikan: number;
  /** True bila namanya dipotong di BATAS_HURUF. */
  dipotong: boolean;
  jumlah: number;
  angka: number;
  makna: Angka81;
  unsur: Unsur;
}

const petaAngka = new Map(TABEL_81.map((a) => [a.angka, a]));

/** Cari satu entri tabel. Melempar bila angkanya di luar 1 sampai 81. */
export function maknaAngka(angka: number): Angka81 {
  const m = petaAngka.get(angka);
  if (!m) throw new Error(`Angka di luar tabel 81: ${angka}`);
  return m;
}

/**
 * Hitung satu nama.
 *
 * Angka, spasi, dan tanda baca diabaikan, bukan ditolak: nama usaha nyata
 * memang mengandung "PT", titik, dan angka tahun. Berapa yang diabaikan tetap
 * dilaporkan supaya pengguna tahu bahwa "Kopi 88" dihitung sama dengan "Kopi".
 */
export function hitungFengshui(nama: string): HasilFengshui {
  const mentah = nama.trim().replace(/\s+/g, " ");
  const semuaHuruf = mentah.toUpperCase().replace(/[^A-Z]/g, "");
  const dipotong = semuaHuruf.length > BATAS_HURUF;
  const huruf = dipotong ? semuaHuruf.slice(0, BATAS_HURUF) : semuaHuruf;

  const rincian: RincianHuruf[] = [...huruf].map((h) => ({ huruf: h, nilai: NILAI_HURUF[h] }));
  const jumlah = rincian.reduce((n, r) => n + r.nilai, 0);
  const angka = reduksi81(jumlah);

  return {
    nama: mentah,
    rincian,
    diabaikan: mentah.replace(/\s/g, "").length - semuaHuruf.length,
    dipotong,
    jumlah,
    angka,
    // Nama kosong tidak punya angka. Dipaksa ke 1 akan berbohong, jadi
    // pemanggilnya yang harus memeriksa rincian.length lebih dulu.
    makna: maknaAngka(angka === 0 ? 1 : angka),
    unsur: unsurAngka(angka === 0 ? 1 : angka),
  };
}

/** Urutan nada saat kandidat diperingkat: yang paling mendukung di atas. */
const URUTAN_NADA: Record<Nada, number> = { baik: 0, campur: 1, kurang: 2 };

/**
 * Bandingkan beberapa kandidat nama, terbaik lebih dulu.
 *
 * Ini alasan utama fitur ini dibeli: orang yang menamai usaha hampir tidak
 * pernah punya satu nama, melainkan empat sampai lima yang masih ditimbang.
 * Nama kosong dibuang, dan urutan ketik dipakai sebagai pemutus supaya
 * hasilnya tidak berubah-ubah untuk masukan yang sama.
 */
export function bandingkanNama(daftar: string[]): HasilFengshui[] {
  return daftar
    .slice(0, BATAS_KANDIDAT)
    .map((n) => hitungFengshui(n))
    .filter((h) => h.rincian.length > 0)
    .map((h, urutanKetik) => ({ h, urutanKetik }))
    .sort((a, b) => {
      const nada = URUTAN_NADA[a.h.makna.nada] - URUTAN_NADA[b.h.makna.nada];
      if (nada !== 0) return nada;
      return a.urutanKetik - b.urutanKetik;
    })
    .map((x) => x.h);
}

/**
 * Kata yang lazim disandingkan pada nama usaha dan produk di Indonesia.
 *
 * Dipakai untuk menawarkan jalan keluar yang bisa benar-benar dipakai. Menyuruh
 * orang mengganti huruf sampai angkanya bagus akan menghasilkan nama yang aneh
 * dan tidak akan dipakai siapa pun; menambahkan satu kata yang memang sudah
 * biasa terdengar jauh lebih mungkin diterima.
 *
 * Nilainya tidak dituliskan di sini, melainkan dihitung dari hurufnya, supaya
 * daftar ini tidak bisa melenceng dari pemetaan huruf di atas.
 */
export const KATA_IMBUHAN = [
  "Jaya",
  "Abadi",
  "Makmur",
  "Sejahtera",
  "Mandiri",
  "Utama",
  "Prima",
  "Sentosa",
  "Lestari",
  "Sukses",
  "Karya",
  "Cipta",
  "Agung",
  "Mulia",
  "Sari",
  "Raya",
  "Perkasa",
  "Gemilang",
  "Berkah",
  "Amanah",
  "Sejati",
  "Cahaya",
  "Bintang",
  "Nusantara",
  "Putra",
  "Putri",
  "Bahagia",
  "Harmoni",
  "Terang",
  "Megah",
  "Anugerah",
  "Semesta",
  "Artha",
  "Bali",
  "Dewata",
  "Werdhi",
  "Kerthi",
  "Santhi",
  "Giri",
  "Segara",
  "Tirta",
] as const;

/** Jumlah nilai huruf sebuah kata, tanpa reduksi. */
export function nilaiKata(kata: string): number {
  return [...kata.toUpperCase().replace(/[^A-Z]/g, "")].reduce((n, h) => n + NILAI_HURUF[h], 0);
}

export interface SaranKata {
  kata: string;
  tambahan: number;
  angka: number;
  makna: Angka81;
}

/**
 * Kata mana yang, bila disandingkan, memindahkan nama ini ke angka bernada baik.
 *
 * Diurutkan dari kata terpendek: makin sedikit yang berubah dari nama aslinya,
 * makin besar kemungkinan sarannya benar-benar dipakai.
 */
export function saranKata(hasil: HasilFengshui, batas = 5): SaranKata[] {
  // Nama yang angkanya sudah mendukung tidak punya "lebih baik" untuk dituju:
  // semua angka bernada baik setara di tabel ini. Menawarkan perubahan di situ
  // hanya membuat orang ragu pada nama yang sebenarnya sudah bagus.
  if (hasil.makna.nada === "baik" || hasil.rincian.length === 0) return [];

  const terlihat = new Set<number>();
  return KATA_IMBUHAN.map((kata) => {
    const tambahan = nilaiKata(kata);
    const angka = reduksi81(hasil.jumlah + tambahan);
    return { kata, tambahan, angka, makna: maknaAngka(angka) };
  })
    .filter((s) => s.makna.nada === "baik")
    .sort((a, b) => a.kata.length - b.kata.length || a.kata.localeCompare(b.kata))
    .filter((s) => {
      // Beberapa kata mendarat di angka yang sama. Menawarkan lima kata dengan
      // makna identik terlihat seperti pilihan padahal bukan.
      if (terlihat.has(s.angka)) return false;
      terlihat.add(s.angka);
      return true;
    })
    .slice(0, batas);
}

export interface SaranHuruf {
  /** Berapa nilai yang perlu ditambah, 1 sampai 9. */
  selisih: number;
  /** Huruf mana saja yang bernilai segitu. */
  huruf: string[];
  angka: number;
  makna: Angka81;
}

/**
 * Satu huruf tambahan mana yang memindahkan nama ini ke angka bernada baik.
 *
 * Berguna untuk penyesuaian ejaan yang halus: "Kopi" jadi "Kopie", "Sadhu"
 * jadi "Sadhu Co". Hanya sampai sembilan karena lebih dari itu bukan lagi
 * satu huruf, dan untuk itu sudah ada saran kata di atas.
 */
export function saranHuruf(hasil: HasilFengshui, batas = 3): SaranHuruf[] {
  // Alasannya sama dengan saranKata: tidak ada yang perlu diperbaiki.
  if (hasil.makna.nada === "baik" || hasil.rincian.length === 0) return [];

  const saran: SaranHuruf[] = [];
  for (let selisih = 1; selisih <= 9; selisih++) {
    const angka = reduksi81(hasil.jumlah + selisih);
    const makna = maknaAngka(angka);
    if (makna.nada !== "baik") continue;
    saran.push({ selisih, huruf: HURUF_BERNILAI[selisih], angka, makna });
    if (saran.length === batas) break;
  }
  return saran;
}
