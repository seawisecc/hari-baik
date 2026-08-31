import { redirect } from "next/navigation";
import { bacaHarga } from "@/lib/harga-server";
import { daftarPaketPromo, promoBerlaku, sisaHariPromo } from "@/lib/promo";
import { PenawaranClient } from "./PenawaranClient";

/**
 * Layar penawaran, ditampilkan sekali tepat setelah onboarding selesai.
 *
 * Itu menit dengan niat paling tinggi yang pernah dimiliki halaman mana pun di
 * aplikasi ini: orangnya baru saja mengisi tanggal lahirnya sendiri, jadi dia
 * sedang percaya dan sedang ingin tahu. Menyuruhnya mencari halaman langganan
 * sendiri beberapa hari kemudian membuang menit itu.
 *
 * Yang membawanya ke sini cuma satu, yaitu alihan dari halaman onboarding.
 * Gerbang tidak pernah memantulkan siapa pun ke sini, dan itu disengaja:
 * begitu sebuah layar penawaran jadi tujuan sebuah pemeriksaan, ia berhenti
 * jadi penawaran dan berubah jadi tembok.
 *
 * Dibuat dinamis, bukan statis. Halaman ini cuma dibuka sekali per orang jadi
 * tidak ada yang dihemat dengan menyimpannya, sementara keputusan "promonya
 * masih jalan atau tidak" harus dibaca dengan waktu sungguhan. Layar penawaran
 * promo yang muncul setelah promonya berakhir adalah janji yang sudah tidak
 * bisa ditepati kasir.
 */
export const dynamic = "force-dynamic";

export default async function PenawaranPage() {
  const harga = await bacaHarga();
  const sekarang = new Date();

  /*
   * Tanpa promo yang berjalan, halaman ini tidak muncul sama sekali.
   *
   * Layar harga tepat setelah pendaftaran hanya sepadan kalau ada sesuatu yang
   * benar-benar ditawarkan dan ada alasan memutuskannya sekarang. Tanpa itu ia
   * cuma hambatan di antara orang dan aplikasi yang baru saja dia daftari,
   * dan halaman depan sudah menjanjikan dia bisa langsung mencoba.
   */
  if (!promoBerlaku(harga.promo, sekarang)) redirect("/hari-ini");

  return (
    <PenawaranClient
      harga={harga}
      paketPromo={daftarPaketPromo(harga, sekarang)}
      sisaPromo={sisaHariPromo(harga.promo, sekarang) ?? 0}
    />
  );
}
