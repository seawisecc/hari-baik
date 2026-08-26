import { bacaHarga } from "@/lib/harga-server";
import { LandingClient } from "./LandingClient";

/**
 * Harga di halaman depan dibaca di server, bukan lewat fetch setelah hidrasi,
 * supaya angkanya sudah ada di HTML pertama: baik untuk pengunjung yang
 * koneksinya lambat maupun untuk mesin pencari dan pratinjau tautan.
 *
 * Dibangun ulang saat admin menyimpan harga baru lewat revalidatePath.
 */
export const revalidate = 3600;

export default async function LandingPage() {
  return <LandingClient harga={await bacaHarga()} tahun={new Date().getFullYear()} />;
}
