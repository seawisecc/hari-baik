"use client";

import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import { rupiah, teks, type PengaturanHarga } from "@/lib/harga";
import { hematPromo, perTahunPromo, type PaketPromo } from "@/lib/promo";

/**
 * Daftar harga yang dilihat pengguna.
 *
 * Harganya diterima sebagai prop, bukan diambil sendiri lewat fetch. Dulu
 * komponen ini mengembalikan null sampai fetch-nya selesai, jadi seluruh
 * blok harga kosong selama beberapa detik setiap kali halaman dibuka.
 * Sekarang pemanggilnya membacanya di server dan menurunkannya ke sini,
 * sehingga daftar sudah lengkap pada render pertama.
 */
export function DaftarHarga({
  data,
  paketPromo,
  dipilih,
  onPilih,
  tanpaAddOn = false,
}: {
  data: PengaturanHarga;
  /**
   * Paket aktif berikut harga promonya, dihitung di server.
   *
   * Bukan dihitung ulang di sini. Harga promo yang dihitung di peramban
   * memakai jam peramban, dan jam itu tidak selalu sama dengan jam server
   * yang nanti menagih. Selisihnya jarang, tapi bentuknya adalah angka di
   * layar yang berbeda dari angka di tagihan.
   */
  paketPromo: PaketPromo[];
  /** Id paket yang sedang dipilih; diberi tanda di daftar. */
  dipilih?: string | null;
  onPilih?: (paket: PaketPromo) => void;
  /** Sembunyikan daftar add-on, mis. bila pemilihannya ada di tempat lain. */
  tanpaAddOn?: boolean;
}) {
  const t = useT();
  const { lang } = useLang();

  const addOn = data.addOn.filter((a) => a.aktif);

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          {t("price.choosePlan")}
        </p>

        <ul className="space-y-3">
          {paketPromo.map((item) => {
            const p = item.paket;
            const diskon = hematPromo(item, paketPromo);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onPilih?.(item)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-lg px-5 py-4 text-left",
                    "transition-shadow duration-150",
                    dipilih === p.id
                      ? "bg-accent-wash hb-raise-2 ring-2 ring-accent-strong/55"
                      : p.populer
                        ? "bg-accent-wash/60 hb-raise-1 ring-1 ring-accent-strong/25"
                        : "bg-surface hb-raise-1 hover:hb-raise-2",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-lg font-semibold text-ink">
                        {teks(p.nama, lang)}
                      </span>
                      {p.populer && (
                        <span className="inline-flex items-center gap-1 rounded-pill bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
                          <Sparkles className="h-2.5 w-2.5" aria-hidden />
                          {t("price.mostPopular")}
                        </span>
                      )}
                      {item.diskonPersen > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-pill bg-guru/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-guru-teks">
                          {t("promo.off", { n: item.diskonPersen })}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {rupiah(perTahunPromo(item))} {t("price.perYear")}
                      {diskon > 0 && (
                        <span className="ml-2 font-medium text-guru-teks">
                          {t("price.saveShort", { n: diskon })}
                        </span>
                      )}
                    </p>
                    {/* Bonusnya disebut di baris paketnya sendiri, bukan cuma
                        di halaman depan. Yang sampai ke layar ini lewat
                        tautan langsung tidak pernah melihat halaman depan,
                        dan dialah yang sedang memutuskan. */}
                    {item.bonusAddOn.length > 0 && (
                      <p className="mt-1 text-xs font-medium text-guru-teks">
                        {t("promo.bonusTitle")}:{" "}
                        {item.bonusAddOn
                          .map((id) => {
                            const a = addOn.find((x) => x.id === id);
                            return a ? teks(a.nama, lang) : null;
                          })
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-right">
                    {item.diskonPersen > 0 && (
                      <span className="block text-xs text-ink-faint line-through">
                        {rupiah(item.hargaAsli)}
                      </span>
                    )}
                    <span className="block font-heading text-xl font-bold text-ink">
                      {rupiah(item.harga)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {!tanpaAddOn && addOn.length > 0 && (
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            {t("price.addonsPublic")}
          </p>
          <p className="mb-3 text-xs text-ink-faint">{t("price.addonsPublicHint")}</p>

          <ul className="space-y-2.5">
            {addOn.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-3 rounded-md bg-surface-sunk px-4 py-3.5 hb-sink"
              >
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-deep" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{teks(a.nama, lang)}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                    {teks(a.deskripsi, lang)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-ink">{rupiah(a.harga)}</p>
                  <p className="text-[10px] text-ink-faint">
                    {a.sekali ? t("price.oneTimeTag") : t("price.perTerm")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
