/**
 * Dua sistem pembacaan watak dari weton lahir:
 * - Pangarasan (11 tipe) — cara seseorang bergerak di dunia
 * - Pancasuda  (7 tipe)  — bekal/nasib bawaan
 *
 * `icon` adalah nama ikon lucide-react.
 */

export interface ProfilWatak {
  nama: string;
  simbol: string;
  icon: string;
  kepribadian: string;
  kekuatan: string[];
  tantangan: string[];
  saran: string;
}

export const PANGARASAN: Record<string, ProfilWatak> = {
  "Aras Tuding": {
    nama: "Aras Tuding",
    simbol: "Telunjuk",
    icon: "finger",
    kepribadian:
      "Kamu memiliki kemampuan yang mudah dikenali orang lain. Ada sesuatu dalam dirimu yang membuat orang secara alami mempercayakan tanggung jawab kepadamu. Kamu tekun, dapat diandalkan, dan cenderung menjadi orang yang dicari saat dibutuhkan.",
    kekuatan: [
      "Mudah dipercaya dan diandalkan",
      "Tekun dalam menyelesaikan tugas",
      "Memiliki kemampuan yang menonjol di bidang tertentu",
      "Cepat mendapat kepercayaan dari atasan atau rekan",
    ],
    tantangan: [
      "Terkadang menanggung beban tanggung jawab yang terlalu berat",
      "Perlu belajar mendelegasikan dan meminta bantuan",
    ],
    saran:
      "Percayai kemampuanmu — kemampuan yang kamu miliki bukan kebetulan. Namun ingat, kamu tidak harus menanggung segalanya sendiri. Belajarlah untuk berbagi peran dan membangun tim yang kuat di sekitarmu.",
  },
  "Aras Kembang": {
    nama: "Aras Kembang",
    simbol: "Bunga",
    icon: "flower",
    kepribadian:
      "Kamu memiliki daya tarik alami yang membuat orang lain merasa nyaman di dekatmu. Seperti bunga yang memikat, kamu penuh kasih sayang, hangat, dan pandai membaca perasaan orang lain. Kamu juga memiliki kemampuan untuk menyelesaikan konflik dengan cara yang elegan.",
    kekuatan: [
      "Memiliki pesona dan daya tarik alami",
      "Penyayang dan penuh empati",
      "Pandai menyelesaikan permasalahan interpersonal",
      "Dicintai dan dihargai banyak orang",
    ],
    tantangan: [
      "Kadang terlalu mengutamakan perasaan orang lain di atas kebutuhanmu sendiri",
      "Perlu menjaga batasan yang sehat dalam hubungan",
    ],
    saran:
      "Daya tarikmu adalah karunia — gunakan untuk menginspirasi dan menyembuhkan orang-orang di sekitarmu. Namun jangan lupa merawat dirimu sendiri, karena kamu tidak bisa menuangkan air dari gelas yang kosong.",
  },
  "Lakuning Lintang": {
    nama: "Lakuning Lintang",
    simbol: "Bintang",
    icon: "star",
    kepribadian:
      "Kamu adalah jiwa yang bersinar — tekun, cerdas, dan memiliki kepekaan tinggi terhadap hal-hal di sekitarmu. Kamu cenderung lebih nyaman bekerja sendiri atau dalam keheningan, dan sering kali mampu melihat detail yang luput dari perhatian orang lain.",
    kekuatan: [
      "Tekun dan teliti dalam pekerjaan",
      "Kepekaan bahasa dan komunikasi yang tinggi",
      "Pengamat yang tajam dan penuh perhatian",
      "Kemampuan analisis yang mendalam",
    ],
    tantangan: [
      "Kecenderungan untuk menyimpan perasaan sendiri",
      "Perlu lebih aktif membangun koneksi sosial agar tidak merasa terisolasi",
    ],
    saran:
      "Bintang bersinar paling terang di langit malam — dan cahayamu sungguh nyata. Tantanganmu adalah membiarkan dirimu terlihat. Buka diri, bagikan pemikiranmu, dan biarkan orang lain juga merasakan cahayamu.",
  },
  "Lakuning Rembulan": {
    nama: "Lakuning Rembulan",
    simbol: "Bulan",
    icon: "moon",
    kepribadian:
      "Seperti bulan yang menerangi malam, kehadiranmu membawa ketenangan dan kenyamanan bagi orang-orang di sekitarmu. Kamu berbudi halus, mudah disukai, dan memiliki kemampuan alami untuk mengundang simpati.",
    kekuatan: [
      "Disenangi dan disegani banyak orang",
      "Berbudi halus dan penuh kelembutan",
      "Membawa ketenangan dalam lingkungan yang penuh tekanan",
      "Mudah beradaptasi dalam berbagai situasi sosial",
    ],
    tantangan: [
      "Terkadang terlalu santai sehingga menunda pekerjaan",
      "Perlu membangun disiplin diri yang lebih konsisten",
    ],
    saran:
      "Kelembutan bukannya kelemahan — itu adalah kekuatanmu yang paling dalam. Namun agar cahayamu terus bersinar, disiplin dan konsistensi adalah bahan bakarnya. Sedikit dorongan diri setiap hari akan membawamu jauh.",
  },
  "Lakuning Srengenge": {
    nama: "Lakuning Srengenge",
    simbol: "Matahari",
    icon: "sun",
    kepribadian:
      "Kamu adalah jiwa yang bersemangat, penuh ide, dan memiliki wibawa alami. Seperti matahari, kehadiranmu memberikan cahaya dan energi kepada orang-orang di sekitarmu. Kamu memahami tata krama dan memiliki banyak gagasan yang bisa mengubah keadaan.",
    kekuatan: [
      "Berwibawa dan berkarisma",
      "Penuh ide dan gagasan segar",
      "Memahami tata susila dan etika",
      "Memberikan semangat kepada orang-orang sekitar",
    ],
    tantangan: [
      "Terkadang rasa malu menghambat untuk tampil maksimal",
      "Perlu lebih percaya diri dalam mengekspresikan diri di depan umum",
    ],
    saran:
      "Cahayamu sudah ada — yang dibutuhkan hanya keberanian untuk menyalakannya lebih terang. Setiap kali kamu merasa malu, ingat bahwa dunia membutuhkan ide-idemu. Latih keberanian tampil sedikit demi sedikit, dan lihat betapa orang akan tergerak olehmu.",
  },
  "Lakuning Banyu": {
    nama: "Lakuning Banyu",
    simbol: "Air",
    icon: "droplet",
    kepribadian:
      "Seperti air yang mengalir menemukan jalannya, kamu memiliki kepintaran dalam mengenali peluang dan menyesuaikan diri dengan situasi. Kamu cekatan, berpikiran jauh ke depan, dan tahu ke mana arah yang tepat untuk melangkah.",
    kekuatan: [
      "Cekatan dan adaptif dalam berbagai situasi",
      "Pemikiran strategis dan jangka panjang",
      "Pandai mengenali peluang yang tersembunyi",
      "Fleksibel namun tetap konsisten menuju tujuan",
    ],
    tantangan: [
      "Terkadang terlalu fokus pada diri sendiri dalam mengambil keputusan",
      "Perlu melatih kepekaan terhadap kebutuhan dan perasaan orang lain",
    ],
    saran:
      "Air yang mengalir selalu menemukan jalannya — itulah kekuatanmu. Tetap fleksibel, tetap bergerak. Namun sesekali berhentilah untuk mendengar kebutuhan orang-orang yang bersamamu dalam perjalanan ini.",
  },
  "Lakuning Bumi": {
    nama: "Lakuning Bumi",
    simbol: "Bumi",
    icon: "mountain",
    kepribadian:
      "Kamu adalah pribadi yang hangat, membumi, dan tulus. Seperti bumi yang menjadi tempat berpijak semua makhluk, kamu adalah orang yang memberikan rasa aman dan kenyamanan bagi orang-orang terdekatmu. Kamu menikmati hubungan sosial yang nyata dan penuh makna.",
    kekuatan: [
      "Pemurah, pemaaf, dan menjadi pelindung bagi orang-orang terdekat",
      "Mudah bergaul dan senang bersosialisasi",
      "Pemikiran sederhana namun dalam",
      "Menjadi tempat sandaran yang dapat dipercaya",
    ],
    tantangan: [
      "Terkadang terlalu mengalah sehingga kepentinganmu sendiri terabaikan",
      "Perlu belajar mengatakan tidak dengan baik",
    ],
    saran:
      "Menjadi tempat berpijak bagi orang lain adalah peran yang mulia — dan kamu melakukannya dengan luar biasa. Pastikan juga kamu memiliki tempatmu sendiri untuk beristirahat dan dipulihkan. Dirimu sama pentingnya dengan orang-orang yang kamu jaga.",
  },
  "Lakuning Geni": {
    nama: "Lakuning Geni",
    simbol: "Api",
    icon: "flame",
    kepribadian:
      "Kamu memiliki semangat yang membara dan energi yang kuat. Seperti api, kamu bisa menghangatkan dan menerangi — namun juga perlu dijaga agar tidak membakar. Passion-mu adalah asetmu yang paling besar.",
    kekuatan: [
      "Bersemangat tinggi dan penuh energi",
      "Berani dan tegas dalam bertindak",
      "Mampu memotivasi orang lain dengan antusiasme",
      "Cepat bergerak dan tidak suka berlama-lama",
    ],
    tantangan: [
      "Emosi yang intens bisa menjadi hambatan jika tidak dikelola dengan baik",
      "Perlu melatih kesabaran dan menghitung sebelum bereaksi",
    ],
    saran:
      "Api yang terkendali adalah sumber kehangatan dan cahaya — itulah dirimu saat berada di momen terbaikmu. Latih napas, latih jeda sebelum bereaksi. Ketika emosimu terarah dengan baik, tidak ada yang tidak bisa kamu capai.",
  },
  "Lakuning Angin": {
    nama: "Lakuning Angin",
    simbol: "Angin",
    icon: "wind",
    kepribadian:
      "Kamu memiliki kemampuan luar biasa untuk membaca suasana dan memenangkan hati orang lain. Seperti angin yang menembus ke mana-mana, kamu mudah berbaur dan mampu menyentuh sisi emosional orang lain. Kamu juga menyukai apresiasi dan pengakuan.",
    kekuatan: [
      "Pandai membaca situasi dan perasaan orang lain",
      "Karismatik dan mudah disukai",
      "Luwes dalam bergaul di berbagai kalangan",
      "Komunikatif dan menyenangkan",
    ],
    tantangan: [
      "Saat marah, energinya bisa terasa menakutkan bagi orang lain",
      "Perlu menjaga konsistensi antara kata-kata dan tindakan",
    ],
    saran:
      "Kemampuanmu memenangkan hati orang adalah karunia luar biasa — gunakan untuk membangun, bukan sekadar untuk dinikmati. Dan ingat, pujian paling berarti adalah yang kamu berikan kepada dirimu sendiri berdasarkan integritas tindakanmu.",
  },
  "Lakuning Pandita Sakti": {
    nama: "Lakuning Pandita Sakti",
    simbol: "Pendeta Sakti",
    icon: "book",
    kepribadian:
      "Kamu adalah jiwa yang dalam — bijaksana, cerdas, dan memiliki kemampuan memahami hal-hal yang tidak semua orang bisa lihat. Perjalanan hidupmu mungkin tidak selalu mudah, namun justru dari situ lahir kebijaksanaan yang membuatmu begitu unik.",
    kekuatan: [
      "Kecerdasan tinggi dan kemampuan analisis yang mendalam",
      "Kebijaksanaan yang tumbuh dari pengalaman hidup",
      "Kemampuan komunikasi bahasa yang istimewa",
      "Perspektif yang luas dan pemikiran yang matang",
    ],
    tantangan: [
      "Terkadang terlalu terbawa oleh perasaan prihatin atau kecemasan",
      "Perlu menjaga keseimbangan antara introspeksi dan tindakan nyata",
    ],
    saran:
      "Kebijaksanaanmu adalah cahaya yang dibutuhkan banyak orang. Jangan biarkan kecemasan memadamkan cahaya itu. Setiap pengalaman berat yang telah kamu lewati adalah bahan bakar untuk menerangi jalan orang lain. Bagikan cahayamu dengan percaya diri.",
  },
  "Lakuning Toya": {
    nama: "Lakuning Toya",
    simbol: "Air Jernih",
    icon: "droplets",
    kepribadian:
      "Kamu memiliki kejernihan pikiran dan kedalaman perasaan seperti air yang bening. Kamu mampu melihat situasi dengan jernih, mengalir tenang di tengah tekanan, dan memiliki kemampuan beradaptasi yang luar biasa.",
    kekuatan: [
      "Pikiran jernih dan tidak mudah terpancing emosi",
      "Kemampuan adaptasi yang tinggi",
      "Tenang dalam menghadapi tekanan",
      "Intuisi yang kuat dan tajam",
    ],
    tantangan: [
      "Terkadang terlalu pasif dalam mengambil keputusan",
      "Perlu lebih berani mengungkapkan pendapat dan posisi",
    ],
    saran:
      "Kejernihan pikiranmu adalah hadiah yang langka. Gunakan untuk membantu orang lain melihat situasi dengan lebih jelas. Dan ingat — air yang tenang pun bisa membentuk grand canyon. Konsistensi dan ketekunanmu bisa mengubah hal-hal besar.",
  },
};

export const PANCASUDA: Record<string, ProfilWatak> = {
  "Wisesa Segara": {
    nama: "Wisesa Segara",
    simbol: "Samudra Raya",
    icon: "waves",
    kepribadian:
      "Seluas samudra, begitulah kedermawanan dan kebesaran hatimu. Kamu adalah pribadi yang pemurah, pemaaf, dan memiliki wibawa alami yang membuat orang lain merasa dihormati di hadapanmu.",
    kekuatan: [
      "Pemurah dan tidak pelit dalam berbagi",
      "Pemaaf — tidak menyimpan dendam lama",
      "Berwibawa dan bertanggung jawab",
      "Lurus dan konsisten dalam menjalankan prinsip hidup",
      "Rejeki dan usaha cenderung berhasil dengan ketekunan",
    ],
    tantangan: ["Kadang terlalu mudah memberi sehingga perlu menjaga batas"],
    saran:
      "Kebesaran hatimu adalah kekuatanmu. Teruslah memberi dengan ikhlas — namun pastikan kamu juga memberi ruang bagi dirimu sendiri untuk berkembang dan dipulihkan.",
  },
  "Tunggak Semi": {
    nama: "Tunggak Semi",
    simbol: "Tunas yang Tumbuh Kembali",
    icon: "sprout",
    kepribadian:
      "Seperti tunas yang selalu tumbuh kembali meski dipotong, kamu memiliki kemampuan luar biasa untuk bangkit dan memulihkan diri. Kamu juga memiliki bakat alami dalam mengelola sumber daya dengan bijak.",
    kekuatan: [
      "Penghasilan dan kebutuhan hidup cenderung selalu tercukupi",
      "Kemampuan mengelola keuangan dan sumber daya",
      "Tangguh dan mampu bangkit dari keterpurukan",
      "Kesederhanaan yang membawa ketenangan",
    ],
    tantangan: [
      "Terkadang keras kepala dan sulit menerima sudut pandang lain",
      "Sedikit angkuh bisa menjadi penghalang hubungan yang lebih dalam",
    ],
    saran:
      "Ketangguhanmu adalah aset luar biasa — kamu selalu bisa bangkit. Lengkapi kekuatan itu dengan kelenturan: mau mendengar dan membuka diri pada perspektif yang berbeda. Gabungan ketangguhan dan kefleksibelan akan membawamu sangat jauh.",
  },
  "Satria Wibawa": {
    nama: "Satria Wibawa",
    simbol: "Kesatria Mulia",
    icon: "shield",
    kepribadian:
      "Kamu adalah pribadi yang membawa kemuliaan dalam setiap langkahmu. Kejujuran dan keluhuran budimu membuat orang lain secara alami menghormatimu — bukan karena pangkat atau jabatan, tapi karena karakter aslimu.",
    kekuatan: [
      "Dihormati karena kemuliaan dan keluhuran budi",
      "Jujur dan berprinsip",
      "Integritas yang tinggi dalam setiap tindakan",
      "Menjadi teladan bagi orang-orang di sekitarnya",
    ],
    tantangan: ["Standar yang tinggi kadang membuat frustrasi bila orang lain tidak sejalan"],
    saran:
      "Integritasmu adalah mahkotamu yang sesungguhnya — tidak ada yang bisa mengambilnya darimu. Teruslah berjalan dengan kepala tegak dan hati yang lurus, karena jejak yang kamu tinggalkan menginspirasi banyak orang yang bahkan tidak kamu sadari.",
  },
  "Sumur Sinaba": {
    nama: "Sumur Sinaba",
    simbol: "Sumur yang Selalu Dicari",
    icon: "circle-dot",
    kepribadian:
      "Kamu adalah sumber kebijaksanaan yang dicari banyak orang. Seperti sumur di tengah padang — orang datang kepadamu untuk mencari petunjuk, nasihat, dan ketenangan. Kelembutan dan kedermawananmu membuat semua orang merasa diterima.",
    kekuatan: [
      "Dicari orang karena petuah dan nasihatnya yang bijak",
      "Lemah lembut dalam bertutur dan bersikap",
      "Penyayang dan dermawan",
      "Memiliki kemampuan konseling dan mediasi alami",
    ],
    tantangan: [
      "Perlu menjaga energi agar tidak terkuras oleh banyaknya orang yang mengandalkan dirimu",
    ],
    saran:
      "Sumur yang selalu mengeluarkan air pun perlu diisi kembali. Jaga waktu untuk dirimu — istirahat, refleksi, dan pemulihan. Semakin kamu merawat dirimu, semakin jernih dan dalam nasihat yang bisa kamu berikan kepada orang lain.",
  },
  "Bumi Kapetak": {
    nama: "Bumi Kapetak",
    simbol: "Bumi yang Tersembunyi",
    icon: "layers",
    kepribadian:
      "Kamu adalah pribadi yang sungguh-sungguh — suka bekerja, rapi, bersih, dan memiliki ketahanan luar biasa dalam menghadapi cobaan hidup. Kekuatanmu sering tidak terlihat oleh orang lain, namun justru itulah fondasi yang membuatmu kokoh.",
    kekuatan: [
      "Rajin dan suka bekerja keras",
      "Kuat menanggung cobaan dan kekecewaan",
      "Hidup yang rapi, bersih, dan teratur",
      "Keuletan yang tidak mudah menyerah",
    ],
    tantangan: [
      "Kecenderungan menyimpan kekecewaan terlalu lama bisa menjadi beban emosional",
      "Perlu belajar melepaskan dan memaafkan untuk ketenangan jiwa",
    ],
    saran:
      "Kekuatanmu yang tersembunyi adalah emas murni — tidak semua orang bisa melihatnya, tapi dampaknya nyata. Pelajaran terpentingmu adalah melepaskan: melepaskan dendam, melepaskan kekecewaan, melepaskan hal-hal yang tidak lagi bisa kamu kendalikan. Dalam keikhlasan itu, kamu akan menemukan kebebasan yang sesungguhnya.",
  },
  "Satria Wirang": {
    nama: "Satria Wirang",
    simbol: "Kesatria yang Tangguh dalam Ujian",
    icon: "swords",
    kepribadian:
      "Perjalanan hidupmu mengajarkan ketangguhan dengan cara yang unik — melalui berbagai ujian yang membentukmu menjadi pribadi yang lebih dalam dan bijaksana. Keluhuran budimu tidak pernah hilang, meski kadang kamu merasa kurang dihargai.",
    kekuatan: [
      "Luhur budi dan memiliki nilai-nilai hidup yang kuat",
      "Ketangguhan yang terbentuk dari pengalaman",
      "Kemampuan bangkit dari situasi yang memalukan atau mengecewakan",
      "Pemahaman empati yang dalam karena pernah merasakan sendiri",
    ],
    tantangan: [
      "Kecenderungan terburu-buru dalam mengambil keputusan bisa memperburuk situasi",
      "Perlu melatih kesabaran dan mempertimbangkan matang sebelum bertindak",
    ],
    saran:
      "Setiap ujian yang kamu lalui adalah mahkota yang tidak semua orang mampu memakainya. Pelajaran terbesarmu: berhentilah sebentar sebelum bertindak. Tarik napas, pertimbangkan, baru melangkah. Kebijaksanaan dalam timing adalah kekuatan yang akan mengubah hidupmu.",
  },
  "Lebu Ketiup Angin": {
    nama: "Lebu Ketiup Angin",
    simbol: "Debu yang Bertransformasi",
    icon: "wind",
    kepribadian:
      "Perjalanan hidupmu mungkin terasa penuh ketidakpastian — seperti debu yang dibawa angin. Namun justru dalam perjalanan itulah kamu mengembangkan kelenturan dan ketangguhan yang luar biasa. Setiap langkahmu adalah kesempatan untuk menabung karma baik.",
    kekuatan: [
      "Kelenturan dan kemampuan beradaptasi dengan berbagai kondisi",
      "Pengalaman hidup yang kaya dan beragam",
      "Potensi untuk bertransformasi menjadi lebih baik",
      "Kepekaan terhadap kesulitan orang lain karena pernah merasakannya",
    ],
    tantangan: [
      "Kondisi hidup yang kadang terasa tidak stabil membutuhkan ketekunan ekstra",
      "Perlu membangun fondasi yang konsisten melalui kebiasaan baik setiap hari",
    ],
    saran:
      "Debu pun bisa menjadi tanah yang subur jika ditempatkan di tempat yang tepat. Kunci perjalananmu adalah konsistensi dalam kebaikan — jangan pernah berhenti menabung karma baik, sekecil apapun. Setiap perbuatan baik adalah benih yang kelak akan berbuah. Jauhi kemalasan, jaga semangat, dan percayalah bahwa setiap usahamu tidak pernah sia-sia.",
  },
};

export const getPangarasan = (nama: string): ProfilWatak | null => PANGARASAN[nama] ?? null;
export const getPancasuda = (nama: string): ProfilWatak | null => PANCASUDA[nama] ?? null;
