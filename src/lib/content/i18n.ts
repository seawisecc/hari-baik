/**
 * Kamus ID/EN. Diambil utuh dari aplikasi sebelumnya agar teks yang sudah
 * dikenal pengguna tidak berubah.
 *
 * Kunci memakai notasi bertitik ("day.guru.long"), bukan objek bersarang,
 * supaya `t()` tetap satu lookup dan kunci yang hilang mudah terlihat.
 */

export const LANGS = ["id", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = { id: "ID", en: "EN" };

const dict = {
  id: {
    "app.tagline": "Setiap orang punya waktunya masing-masing",
    "app.subtitle": "Kalender Siklus Personal dihitung dari tanggal lahirmu.",
    "day.guru": "Hari Mengalir",
    "day.ratu": "Hari Tenang",
    "day.lara": "Hari Mawas",
    "day.pati": "Hari Istirahat",
    "day.guru.tagline": "Energi mendukung, langkah terasa ringan.",
    "day.ratu.tagline": "Stabil dan produktif. Jalankan yang sudah dimulai.",
    "day.lara.tagline": "Kurangi tergesa, perbanyak pertimbangan.",
    "day.pati.tagline": "Hari terbaik untuk memulihkan diri dan merefleksikan perjalanan.",
    "day.guru.desc":
      "Ini adalah hari di mana energimu selaras dengan waktu. Baik untuk memulai, memutuskan, dan bergerak maju.",
    "day.ratu.desc":
      "Energi hari ini mendukung konsistensi. Cocok untuk menyelesaikan pekerjaan yang sedang berjalan dan menjaga hubungan yang sudah ada.",
    "day.lara.desc":
      "Hari ini mengundang kamu untuk lebih cermat. Tunda keputusan besar dan fokuslah pada hal-hal yang sudah pasti.",
    "day.pati.desc":
      "Hari ini mengajakmu untuk berhenti sejenak. Bukan untuk berhenti selamanya, tapi untuk mengisi ulang energi dan menata perspektif.",
    "day.guru.long":
      "Hari Guru adalah momen di mana kondisi internal dan eksternal cenderung harmonis. Gunakan hari ini untuk hal-hal yang membutuhkan keberanian dan kejernihan pikiran: memulai proyek baru, membuat keputusan penting, menjalin relasi baru, atau melakukan percakapan yang selama ini tertunda.",
    "day.ratu.long":
      "Hari Ratu bukan hari untuk ekspansi besar, melainkan untuk memelihara. Selesaikan yang belum tuntas, perkuat pondasi, dan nikmati ritme kerja yang stabil. Hari yang baik untuk meeting rutin, komunikasi bisnis, dan aktivitas yang memerlukan ketelitian.",
    "day.lara.long":
      "Hari Lara bukan pertanda buruk. Ini adalah pengingat untuk melambat. Hindari mengambil risiko besar atau memulai sesuatu yang memerlukan komitmen jangka panjang. Gunakan hari ini untuk riset, persiapan, evaluasi, dan memperbaiki hal-hal kecil. Energi terbaik hari ini ada pada pekerjaan di belakang layar.",
    "day.pati.long":
      "Hari Pati adalah waktu untuk introspeksi, bukan larangan. Hindari memaksa hal-hal besar terjadi hari ini. Sebaliknya, gunakan waktu ini untuk berdiam, bersyukur, berolahraga ringan, beres-beres, atau sekadar beristirahat dengan penuh kesadaran. Banyak keputusan terbaik lahir setelah periode istirahat yang berkualitas.",
    "assist.title": "Panduan Hari Ini",
    "assist.supported": "Aktivitas yang Didukung",
    "assist.postpone": "Sebaiknya Ditunda",
    "assist.affirmation": "Afirmasi",
    "assist.btn": "Lihat Panduan Hari Ini",
    energy: "Energi Hari",
    "detail.section": "Detail Siklus Hari Ini",
    "detail.cycle": "Siklus Personal",
    "nav.today": "Hari Ini",
    "nav.calendar": "Kalender",
    "nav.profile": "Profil",
    "nav.logout": "Keluar",
    "subscription.title": "Langganan",
    "subscription.active": "Aktif hingga",
    "subscription.expired": "Langganan Habis",
    "subscription.trial": "Trial hingga",
    "subscription.cta": "Perpanjang Sekarang",
    "subscription.days": "hari lagi",
    "admin.users": "Kelola Pengguna",
    "admin.edit": "Edit",
    "admin.delete": "Hapus Akun",
    "admin.extend": "Perpanjang",
    "admin.delete.confirm":
      "Apakah kamu yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.",
    "admin.delete.success": "Akun berhasil dihapus.",
    "profile.dob.readonly": "Untuk mengubah tanggal lahir, hubungi admin.",
    "expired.title": "Waktunya Isi Ulang Energi",
    "expired.desc":
      "Akses kalender siklus personalmu telah berakhir. Aktifkan kembali untuk melanjutkan perjalananmu.",
    "expired.cta": "Aktifkan Kembali: Rp 150.000 / Tahun",
    "pro.nama.title": "Makna Nama",
    "pro.nama.input": "Masukkan nama lengkap",
    "pro.nama.cta": "Hitung Makna",
    "pro.nama.breakdown": "Rincian Perhitungan",
    "pro.nama.unsur": "Unsur Nama",
    "pro.nasib.title": "Perjalanan Hidup",
    "pro.nasib.subtitle": "Gambaran perjalanan rejeki & kesehatan per periode usia",
    "pro.nasib.now": "Kamu sekarang",
    "pro.petemon.title": "Kecocokan",
    "pro.petemon.input": "Tanggal lahir pasangan",
    "pro.petemon.cta": "Lihat Kecocokan",
    "pro.petemon.result": "Hasil Petemon",
    "pro.lock.title": "Fitur Pro",
    "pro.lock.cta": "Aktifkan Langganan",
    "pro.lock.tagline": "Akses semua fitur tanpa batas.",
    "pro.lock.desc.nama":
      "Analisis makna nama berdasarkan aksara Bali, tersedia untuk subscriber.",
    "pro.lock.desc.nasib":
      "Gambaran perjalanan rejeki & kesehatan per periode usia, tersedia untuk subscriber.",
    "pro.lock.desc.petemon":
      "Perhitungan kecocokan Petemon Lanang Istri, tersedia untuk subscriber.",
    "trial.calendar.banner":
      "Navigasi kalender multi-bulan tersedia untuk subscriber. Aktifkan langganan untuk melihat hari baik di bulan-bulan berikutnya.",
    "wisdom.name":
      "Nama adalah doa dan harapan. Karakter dan kebaikan yang kamu lakukan jauh lebih menentukan perjalanan hidupmu.",
    "wisdom.nasib":
      "Gambaran ini adalah panduan refleksi, bukan ramalan pasti. Karma baik, pasangan hidup, rejeki anak, kerja keras, dan doa sangat menentukan perjalananmu.",
    "wisdom.petemon":
      "Cinta, komitmen, dan komunikasi adalah fondasi utama hubungan yang langgeng. Petemon Lanang Istri bukan penentu jodoh. Gunakan sebagai panduan kebijaksanaan.",
  },
  en: {
    "app.tagline": "Everyone has their own perfect timing",
    "app.subtitle": "Your Personal Cycle Calendar is calculated from your birth date.",
    "day.guru": "Flow Day",
    "day.ratu": "Calm Day",
    "day.lara": "Mindful Day",
    "day.pati": "Rest Day",
    "day.guru.tagline": "Energy flows, steps feel light.",
    "day.ratu.tagline": "Stable and productive. Keep the momentum.",
    "day.lara.tagline": "Slow down, think it through.",
    "day.pati.tagline": "The best day to rest and reflect.",
    "day.guru.desc":
      "Your energy aligns with the moment. Great for starting, deciding, and moving forward.",
    "day.ratu.desc":
      "Today's energy supports consistency. Best for completing ongoing work and nurturing existing relationships.",
    "day.lara.desc":
      "Today invites you to be more careful. Postpone big decisions and focus on what is already certain.",
    "day.pati.desc":
      "Today invites you to pause. Not to stop forever, but to recharge and gain perspective.",
    "day.guru.long":
      "A Flow Day is a moment when your inner and outer conditions tend to be in harmony. Use today for things that require courage and clarity: starting new projects, making important decisions, building new relationships, or having conversations you have been putting off.",
    "day.ratu.long":
      "A Calm Day is not for big expansion, but for nurturing. Finish what is unfinished, strengthen foundations, and enjoy a stable work rhythm. Great for regular meetings, business communication, and detail-oriented work.",
    "day.lara.long":
      "A Mindful Day is not a bad sign. It is a reminder to slow down. Avoid taking big risks or starting something that requires long-term commitment. Use today for research, preparation, evaluation, and fixing small things. The best energy today is for behind-the-scenes work.",
    "day.pati.long":
      "A Rest Day is time for introspection, not a restriction. Avoid forcing big things to happen today. Instead, use this time to be still, be grateful, exercise lightly, tidy up, or simply rest with full awareness. Many of the best decisions are born after a quality rest period.",
    "assist.title": "Today's Guide",
    "assist.supported": "Supported Activities",
    "assist.postpone": "Better to Postpone",
    "assist.affirmation": "Affirmation",
    "assist.btn": "View Today's Guide",
    energy: "Day Energy",
    "detail.section": "Daily Cycle Details",
    "detail.cycle": "Personal Cycle",
    "nav.today": "Today",
    "nav.calendar": "Calendar",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "subscription.title": "Subscription",
    "subscription.active": "Active until",
    "subscription.expired": "Subscription Expired",
    "subscription.trial": "Trial until",
    "subscription.cta": "Renew Now",
    "subscription.days": "days left",
    "admin.users": "Manage Users",
    "admin.edit": "Edit",
    "admin.delete": "Delete Account",
    "admin.extend": "Extend",
    "admin.delete.confirm":
      "Are you sure you want to delete this account? This action cannot be undone.",
    "admin.delete.success": "Account successfully deleted.",
    "profile.dob.readonly": "To change your birth date, contact admin.",
    "expired.title": "Time to Recharge",
    "expired.desc":
      "Your access to the personal cycle calendar has ended. Reactivate to continue your journey.",
    "expired.cta": "Reactivate: Rp 150,000 / Year",
    "pro.nama.title": "Name Meaning",
    "pro.nama.input": "Enter full name",
    "pro.nama.cta": "Analyze Name",
    "pro.nama.breakdown": "Calculation Breakdown",
    "pro.nama.unsur": "Name Element",
    "pro.nasib.title": "Life Journey",
    "pro.nasib.subtitle": "Overview of fortune & health journey per age period",
    "pro.nasib.now": "You are here",
    "pro.petemon.title": "Compatibility",
    "pro.petemon.input": "Partner's birth date",
    "pro.petemon.cta": "Check Compatibility",
    "pro.petemon.result": "Compatibility Result",
    "pro.lock.title": "Pro Feature",
    "pro.lock.cta": "Activate Subscription",
    "pro.lock.tagline": "Access all features without limits.",
    "pro.lock.desc.nama": "Name analysis based on Balinese script, available for subscribers.",
    "pro.lock.desc.nasib":
      "Fortune & health journey overview per age period, available for subscribers.",
    "pro.lock.desc.petemon":
      "Petemon Lanang Istri compatibility calculation, available for subscribers.",
    "trial.calendar.banner":
      "Multi-month calendar navigation is available for subscribers. Activate your subscription to see lucky days in upcoming months.",
    "wisdom.name":
      "A name is a prayer and a hope. Your character and kindness determine your path far more than any calculation.",
    "wisdom.nasib":
      "This is a guide for reflection, not a fixed prediction. Good karma, your partner, children's blessings, hard work, and prayer greatly shape your journey.",
    "wisdom.petemon":
      "Love, commitment, and communication are the true foundations of a lasting relationship. Petemon is a guide for wisdom, not a verdict.",
  },
} as const;

export type MessageKey = keyof (typeof dict)["id"];

/** Fallback ke bahasa Indonesia, lalu ke kunci itu sendiri. */
export function translate(lang: Lang, key: MessageKey | string): string {
  const table = dict[lang] as Record<string, string>;
  return table?.[key] ?? (dict.id as Record<string, string>)[key] ?? String(key);
}

export { dict as messages };
