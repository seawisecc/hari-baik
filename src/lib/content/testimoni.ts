/**
 * Kata pelanggan, untuk halaman depan.
 *
 * KOSONG ADALAH KEADAAN YANG SAH. Bagian "Kata mereka" di halaman depan tidak
 * dirender sama sekali selama daftar ini kosong, jadi tidak ada kartu kosong,
 * tidak ada tulisan "belum ada testimoni", dan tidak ada yang perlu
 * disembunyikan lewat kode di tempat lain.
 *
 * Isinya HARUS kata-kata yang benar-benar diucapkan orangnya. Merapikan ejaan,
 * memotong bagian yang tidak relevan, atau menerjemahkan boleh; mengarang
 * kalimat lalu menempelkan nama orang di bawahnya tidak, karena yang membaca
 * halaman ini akan mengira orang itu memang mengatakannya. Cara paling aman:
 * salin dari pesan aslinya, lalu tunjukkan hasilnya ke orangnya sebelum naik.
 *
 * Nama boleh disingkat kalau orangnya lebih nyaman begitu, misalnya "Wayan S.".
 * Yang tidak boleh cuma satu: nama orang yang tidak pernah mengatakannya.
 */
export interface Testimoni {
  /** Kutipan apa adanya, tanpa tanda kutip di ujungnya: itu ditambahkan tampilan. */
  kutipan: string;
  nama: string;
  /** Pekerjaan atau asal, secukupnya untuk memberi konteks. Boleh kosong. */
  peran?: string;
}

export const TESTIMONI: Testimoni[] = [];
