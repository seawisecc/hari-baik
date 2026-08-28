/**
 * Rakit ulang tautan aksi Firebase supaya menunjuk ke domain sendiri.
 *
 * `generateEmailVerificationLink()` selalu mengembalikan tautan ke
 * `callbackUri` milik project, yaitu `hari-baik-7e56c.firebaseapp.com`. Kolom
 * itu terkunci: Console menolak mengubahnya, dan Identity Toolkit API menjawab
 * `EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`.
 *
 * Tapi yang sebenarnya bernilai di tautan itu cuma `oobCode`, dan dia ikut
 * terbawa di query-nya. Jadi kodenya diambil, lalu URL-nya dirakit ulang
 * menunjuk ke `/aksi` di domain sendiri. Halaman itu sudah menangani
 * `verifyEmail`, `resetPassword`, dan `recoverEmail`, dan sudah diuji dengan
 * oobCode asli.
 *
 * Ini fungsi murni supaya bisa dites tanpa memanggil Firebase sama sekali.
 */
export function tautanAksi(tautanFirebase: string, asal: string): string | null {
  let url: URL;
  try {
    url = new URL(tautanFirebase);
  } catch {
    return null;
  }

  const kode = url.searchParams.get("oobCode");
  const mode = url.searchParams.get("mode");
  if (!kode || !mode) return null;

  const milikSendiri = new URL("/aksi", asal);
  milikSendiri.searchParams.set("mode", mode);
  milikSendiri.searchParams.set("oobCode", kode);
  return milikSendiri.toString();
}
