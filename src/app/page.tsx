import { bacaHarga } from "@/lib/harga-server";
import { daftarPaketPromo, sisaHariPromo, sisaPromoRinci } from "@/lib/promo";
import { LandingClient } from "./LandingClient";

/**
 * Harga di halaman depan dibaca di server, bukan lewat fetch setelah hidrasi,
 * supaya angkanya sudah ada di HTML pertama: baik untuk pengunjung yang
 * koneksinya lambat maupun untuk mesin pencari dan pratinjau tautan.
 *
 * Dibangun ulang saat admin menyimpan harga baru lewat revalidatePath.
 *
 * Sepuluh menit, bukan sejam, sejak ada promo berjangka. Halaman ini disimpan
 * sebagai statis, jadi masa kedaluwarsanya adalah lamanya harga promo masih
 * terpajang setelah promonya sebenarnya berakhir. Route pembayaran menghitung
 * ulang dengan waktu sungguhan dan akan menagih harga normal, jadi jendela itu
 * adalah jendela di mana angka di layar berbeda dari angka di tagihan. Sejam
 * terlalu lama untuk itu.
 */
export const revalidate = 600;

export default async function LandingPage() {
  const harga = await bacaHarga();
  const sekarang = new Date();

  /*
   * Promo dihitung di server, sama seperti tahun di footer.
   *
   * Kalau dihitung di klien dengan `new Date()`, hasil render server dan
   * render pertama peramban bisa berbeda tepat di sekitar tengah malam
   * terakhir promo, dan React akan membuang seluruh pohonnya lalu
   * menggambarnya ulang. Yang dilihat pengunjung: harga berkedip.
   */
  return (
    <LandingClient
      harga={harga}
      paketPromo={daftarPaketPromo(harga, sekarang)}
      sisaPromo={sisaHariPromo(harga.promo, sekarang)}
      /* Jam mundurnya juga dimulai dari waktu server, bukan dihitung ulang
         saat hidrasi. Detik yang berbeda antara HTML dan render pertama
         peramban membuang seluruh pohonnya, dan yang terlihat halaman yang
         berkedip. Lihat catatan di HitungMundur. */
      sisaRinci={sisaPromoRinci(harga.promo, sekarang)}
      berakhirPromo={harga.promo?.berakhirPada ?? null}
      tahun={sekarang.getFullYear()}
    />
  );
}
