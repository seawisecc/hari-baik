import type { UserProfile } from "@/types";

/**
 * Pencocokan pencarian pengguna untuk panel admin.
 *
 * Firestore tidak bisa mencari substring: yang bisa hanya kesamaan persis dan
 * awalan, dan awalan pun harus ditopang index. Untuk daftar pelanggan
 * seukuran ini, mencocokkan di memori jauh lebih jujur hasilnya daripada
 * memaksa Firestore melakukan sesuatu yang memang bukan pekerjaannya.
 *
 * Fungsi di sini murni supaya bisa dites tanpa Firestore, dan dipakai di
 * server, bukan di klien: mencari hanya pada 100 baris yang kebetulan sudah
 * termuat akan menjawab "tidak ada" untuk pelanggan yang sebenarnya ada, dan
 * jawaban salah lebih buruk daripada tidak ada pencarian sama sekali.
 */

/** Bentuk minimal yang bisa dicari. Sengaja sempit supaya mudah dites. */
export type DapatDicari = Pick<UserProfile, "nama" | "email" | "phoneNumber">;

/** Huruf kecil, spasi dirapatkan, ujungnya dipangkas. */
export function normalkan(teks: string): string {
  return teks.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Nomor HP jadi angka saja, awalan 0 disamakan dengan 62.
 *
 * Nomor yang sama ditulis bermacam-macam oleh pemiliknya sendiri:
 * "0812-3456-7890", "+62 812 3456 7890", "62812345678 90". Tanpa penyeragaman
 * ini, admin yang menyalin nomor dari WhatsApp (bentuk 62) tidak akan
 * menemukan pengguna yang mendaftar dengan bentuk 0, padahal orangnya sama.
 */
export function angkaNomor(teks: string): string {
  const angka = teks.replace(/\D/g, "");
  return angka.startsWith("0") ? `62${angka.slice(1)}` : angka;
}

/** Semua yang boleh dicocokkan dari satu pengguna, sebagai satu untaian. */
function jerami(u: DapatDicari): string {
  const nomor = u.phoneNumber ?? "";
  return normalkan(
    [u.nama, u.email, nomor, nomor.replace(/\D/g, ""), angkaNomor(nomor)].join(" "),
  );
}

/**
 * Apakah pengguna ini cocok dengan kata kunci?
 *
 * Kata kunci dipecah per kata dan semuanya harus ketemu, tidak harus
 * berurutan. "budi gmail" menemukan Budi yang emailnya di gmail, dan "wayan
 * putu" menemukan Wayan Putu walau di dokumennya tertulis "I Wayan Putu Adi".
 * Pencocokan seluruh untaian sekaligus akan meleset di kedua kasus itu.
 */
export function cocokCari(u: DapatDicari, kunci: string): boolean {
  const kata = normalkan(kunci).split(" ").filter(Boolean);
  if (kata.length === 0) return true;

  const teks = jerami(u);
  return kata.every((k) => {
    if (teks.includes(k)) return true;
    // Angka dicoba sekali lagi dalam bentuk seragamnya, supaya "0812" dan
    // "62812" saling menemukan.
    const n = angkaNomor(k);
    return n.length > 0 && /\d/.test(k) && teks.includes(n);
  });
}

/** Saring daftar pengguna. Kunci kosong berarti tidak menyaring apa pun. */
export function cariPengguna<T extends DapatDicari>(daftar: T[], kunci: string): T[] {
  if (normalkan(kunci) === "") return daftar;
  return daftar.filter((u) => cocokCari(u, kunci));
}
