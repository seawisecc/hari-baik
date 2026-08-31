"use client";

import { Check, Minus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import { rupiah, teks, type PengaturanHarga } from "@/lib/harga";
import { hematPromo, perTahunPromo, type PaketPromo } from "@/lib/promo";

/**
 * Tiga paket dijejerkan supaya bedanya kelihatan sekaligus.
 *
 * Kartu harga di atasnya menjawab "berapa"; tabel ini menjawab "kenapa yang
 * lebih panjang". Selama isinya cuma harga, paket satu tahun selalu terlihat
 * paling masuk akal karena paling murah; begitu bonusnya ikut dibariskan,
 * yang terbaca bukan lagi selisih harga melainkan selisih isi.
 *
 * Satu DOM, bukan dua.
 *
 * Di ponsel yang tampil satu kolom yang dipilih lewat tab, di layar lebar
 * ketiganya sekaligus. Godaannya merender dua susunan lalu menyembunyikan
 * salah satunya dengan CSS, dan itu sudah pernah menggigit di panel admin:
 * kolom isian jadi kembar dan label menunjuk salinan yang display none.
 * Di sini yang disembunyikan cuma sel per kolom, jadi tidak ada yang kembar.
 */
/** Sel yang bukan kolom terpilih hanya muncul mulai dari layar sedang. */
const kolomKelas = (i: number, tab: number) => (i === tab ? "" : "hidden sm:table-cell");

/**
 * Satu baris pembanding: label di kiri, satu sel per paket.
 *
 * Dideklarasikan di luar komponen induknya, bukan di dalam render. Komponen
 * yang dibuat ulang tiap render adalah tipe baru bagi React setiap kali, jadi
 * seluruh isinya dilepas lalu dipasang ulang dan state apa pun di dalamnya
 * hilang. Di sini belum ada state yang bisa hilang, tapi aturannya ditegakkan
 * lint dan memang sebaiknya begitu.
 */
function Baris({
  label,
  paket,
  tab,
  isi,
}: {
  label: string;
  paket: PaketPromo[];
  tab: number;
  isi: (p: PaketPromo, i: number) => React.ReactNode;
}) {
  return (
    <tr className="border-t border-border-soft">
      <th
        scope="row"
        className="py-3 pr-3 text-left align-middle text-xs font-medium text-ink-soft"
      >
        {label}
      </th>
      {paket.map((p, i) => (
        <td
          key={p.paket.id}
          className={cn("px-3 py-3 text-center align-middle", kolomKelas(i, tab))}
        >
          {isi(p, i)}
        </td>
      ))}
    </tr>
  );
}

export function PerbandinganPaket({
  harga,
  paket,
}: {
  harga: PengaturanHarga;
  paket: PaketPromo[];
}) {
  const t = useT();
  const { lang } = useLang();
  const [tab, setTab] = useState(() => {
    const populer = paket.findIndex((p) => p.paket.populer);
    return populer >= 0 ? populer : 0;
  });

  if (paket.length === 0) return null;

  const addOn = harga.addOn.filter((a) => a.aktif);
  const adaPromo = paket.some((p) => p.diskonPersen > 0);

  /** Nilai yang dihemat: potongan harga ditambah harga bonus yang ikut. */
  const totalHemat = (p: PaketPromo) =>
    p.hargaAsli -
    p.harga +
    p.bonusAddOn.reduce((n, id) => n + (addOn.find((a) => a.id === id)?.harga ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Tab hanya berguna di layar sempit; di layar lebar ketiga kolomnya
          sudah tampak, jadi tombolnya ikut hilang supaya tidak jadi kendali
          yang tidak mengubah apa pun. */}
      <div
        role="tablist"
        aria-label={t("landing.compare.plan")}
        className="flex gap-2 sm:hidden"
      >
        {paket.map((p, i) => (
          <button
            key={p.paket.id}
            role="tab"
            type="button"
            aria-selected={i === tab}
            onClick={() => setTab(i)}
            className={cn(
              "flex-1 rounded-pill px-3 py-2 text-sm font-medium transition-shadow duration-150",
              i === tab
                ? "bg-accent text-accent-ink hb-raise-2"
                : "bg-surface text-ink-soft hb-raise-1",
            )}
          >
            {teks(p.paket.nama, lang)}
          </button>
        ))}
      </div>

      {/* Tabel lebar boleh menggulir di dalam kotaknya sendiri, bukan
          mendorong seluruh halaman jadi bisa digeser ke samping. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-0 border-collapse text-sm">
          <caption className="sr-only">{t("landing.compare.title")}</caption>
          <thead>
            <tr>
              <th className="w-[34%] py-3 pr-3 text-left text-xs font-medium text-ink-faint sm:w-[28%]">
                {t("landing.compare.plan")}
              </th>
              {paket.map((p, i) => (
                <th
                  key={p.paket.id}
                  scope="col"
                  className={cn("px-3 py-3 text-center align-bottom", kolomKelas(i, tab))}
                >
                  {p.paket.populer && (
                    <span className="mb-1.5 inline-flex items-center gap-1 rounded-pill bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
                      <Sparkles className="h-2.5 w-2.5" aria-hidden />
                      {t("price.mostPopular")}
                    </span>
                  )}
                  <span className="block font-heading text-base font-semibold text-ink">
                    {teks(p.paket.nama, lang)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {adaPromo && (
              <Baris
                paket={paket}
                tab={tab}
                label={t("landing.compare.normal")}
                isi={(p) => (
                  <span className="text-xs text-ink-faint line-through">
                    {rupiah(p.hargaAsli)}
                  </span>
                )}
              />
            )}

            <Baris
              paket={paket}
              tab={tab}
              label={adaPromo ? t("landing.compare.price") : t("price.price")}
              isi={(p) => (
                <span className="font-heading text-lg font-bold text-ink">
                  {rupiah(p.harga)}
                </span>
              )}
            />

            <Baris
              paket={paket}
              tab={tab}
              label={t("landing.compare.perYear")}
              isi={(p) => {
                const diskon = hematPromo(p, paket);
                return (
                  <span className="text-ink-soft">
                    {rupiah(perTahunPromo(p))}
                    {diskon > 0 && (
                      <span className="mt-0.5 block text-[11px] font-medium text-guru-teks">
                        {t("price.saveShort", { n: diskon })}
                      </span>
                    )}
                  </span>
                );
              }}
            />

            <Baris
              paket={paket}
              tab={tab}
              label={t("landing.compare.access")}
              isi={(p) => (
                <span className="text-ink-soft">
                  {t("landing.compare.years", { n: p.paket.tahun })}
                </span>
              )}
            />

            <Baris
              paket={paket}
              tab={tab}
              label={t("landing.compare.pro")}
              isi={() => (
                <>
                  <Check className="mx-auto h-4 w-4 text-accent-deep" aria-hidden />
                  <span className="sr-only">{t("promo.included")}</span>
                </>
              )}
            />

            {/*
             * Semua add-on dibariskan, bukan cuma yang jadi bonus.
             *
             * Yang tidak ikut tetap tampil berikut harganya, bukan disembunyikan
             * atau ditandai silang kosong. Barisnya jadi menjawab dua hal
             * sekaligus: apa yang ikut gratis, dan berapa yang harus dibayar
             * kalau paket yang lebih pendek yang diambil. Itu yang membuat
             * selisih paketnya terbaca sebagai angka, bukan sebagai perasaan.
             */}
            {addOn.map((a) => (
              <Baris
                key={a.id}
                paket={paket}
                tab={tab}
                label={teks(a.nama, lang)}
                isi={(p) =>
                  p.bonusAddOn.includes(a.id) ? (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-guru/15 px-2.5 py-1 text-[11px] font-semibold text-guru-teks">
                      <Check className="h-3 w-3" aria-hidden />
                      {t("promo.free")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-ink-faint">
                      <Minus className="h-3 w-3" aria-hidden />
                      {t("promo.buySeparately", { v: rupiah(a.harga) })}
                    </span>
                  )
                }
              />
            ))}

            {adaPromo && (
              <Baris
                paket={paket}
                tab={tab}
                label={t("landing.compare.save")}
                isi={(p) => {
                  const n = totalHemat(p);
                  return n > 0 ? (
                    <span className="font-heading text-base font-bold text-guru-teks">
                      {rupiah(n)}
                    </span>
                  ) : (
                    <span className="text-ink-faint">-</span>
                  );
                }}
              />
            )}
          </tbody>

          <tfoot>
            <tr className="border-t border-border-soft">
              <td />
              {paket.map((p, i) => (
                <td key={p.paket.id} className={cn("px-2 pt-5 align-top", kolomKelas(i, tab))}>
                  <Link href="/register" className="block">
                    <Button size="sm" block variant={p.paket.populer ? "primary" : "surface"}>
                      {adaPromo ? t("promo.take") : t("landing.cta.subscribe")}
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
