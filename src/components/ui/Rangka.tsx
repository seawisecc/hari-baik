import { cn } from "@/lib/cn";

/**
 * Rangka halaman saat data belum tiba.
 *
 * Menggantikan tulisan "Memuat…". Bedanya bukan sekadar hiasan: rangka yang
 * bentuknya menyerupai isi yang akan datang membuat tata letak tidak melompat
 * saat isinya masuk, dan menunggu terasa lebih pendek karena ada yang bisa
 * dilihat. Tulisan sendirian tidak memberi keduanya.
 */

export function Rangka({ className }: { className?: string }) {
  return <div aria-hidden className={cn("hb-rangka", className)} />;
}

/** Rangka satu kartu: judul, beberapa baris teks, satu blok. */
export function RangkaKartu({ baris = 3, className }: { baris?: number; className?: string }) {
  return (
    <div className={cn("rounded-lg bg-surface p-6 hb-raise-1", className)}>
      <Rangka className="h-4 w-28" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: baris }, (_, i) => (
          <Rangka
            key={i}
            className={cn(
              "h-3.5",
              i === baris - 1 ? "w-2/3" : "w-full",
              i === 1 && "hb-jeda-1",
              i === 2 && "hb-jeda-2",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Rangka satu halaman penuh.
 *
 * Dipakai selagi sesi dipulihkan, jadi bentuknya sengaja umum: judul di atas
 * lalu beberapa kartu. Menebak bentuk tiap halaman akan salah lebih sering
 * daripada benar, dan tata letak yang meleset lebih mengganggu daripada
 * rangka yang netral.
 */
export function RangkaHalaman() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8 lg:py-10">
      <div role="status" aria-busy="true" className="hb-pudar space-y-6">
        <span className="sr-only">Memuat</span>
        <div className="space-y-2.5">
          <Rangka className="h-7 w-52" />
          <Rangka className="hb-jeda-1 h-4 w-72 max-w-full" />
        </div>
        <RangkaKartu baris={4} />
        <RangkaKartu baris={2} className="hb-jeda-2" />
      </div>
    </div>
  );
}
