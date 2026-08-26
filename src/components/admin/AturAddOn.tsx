"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { addOnSiapJual } from "@/lib/addon-registry";
import { useLang, useT } from "@/lib/content/LangProvider";
import { rupiah, teks, type AddOn } from "@/lib/harga";

/**
 * Pengatur add-on per pengguna, untuk admin.
 *
 * Menetapkan daftar penuh, bukan menambah atau mengurangi satu per satu:
 * admin melihat semuanya di layar lalu menyimpan apa yang terlihat, jadi tidak
 * ada keadaan yang bisa berbeda antara yang tampil dan yang tersimpan.
 *
 * Add-on yang fiturnya belum ada tetap ditampilkan, tapi tidak bisa dicentang.
 * Menyembunyikannya akan membuat admin bertanya-tanya ke mana perginya sesuatu
 * yang pernah ada di daftar harga.
 */
export function AturAddOn({
  katalog,
  dimiliki,
  busy,
  onSimpan,
}: {
  katalog: AddOn[];
  dimiliki: string[];
  busy: boolean;
  onSimpan: (addOn: string[]) => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const [pilihan, setPilihan] = useState<string[]>(dimiliki);

  const berubah =
    pilihan.length !== dimiliki.length || pilihan.some((id) => !dimiliki.includes(id));

  const alihkan = (id: string) =>
    setPilihan((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          {t("admin.addon.title")}
        </p>
        <p className="mt-0.5 text-xs text-ink-faint">{t("admin.addon.hint")}</p>
      </div>

      <ul className="space-y-2">
        {katalog.map((a) => {
          const siap = addOnSiapJual(a.id);
          const dipilih = pilihan.includes(a.id);
          return (
            <li key={a.id}>
              <button
                type="button"
                disabled={!siap || busy}
                aria-pressed={dipilih}
                onClick={() => alihkan(a.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-left",
                  "transition-shadow duration-150",
                  dipilih ? "bg-accent-wash hb-raise-1" : "bg-surface-sunk hb-sink",
                  !siap && "cursor-not-allowed opacity-55",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-sm border",
                    dipilih
                      ? "border-accent-strong bg-accent text-accent-ink"
                      : "border-border-soft bg-surface",
                  )}
                >
                  {dipilih && <Check className="h-3 w-3" />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">
                    {teks(a.nama, lang)}
                  </span>
                  {!siap && (
                    <span className="block text-[11px] text-ink-faint">
                      {t("admin.addon.notReady")}
                    </span>
                  )}
                  {siap && !a.aktif && (
                    <span className="block text-[11px] text-ink-faint">
                      {t("admin.addon.inactive")}
                    </span>
                  )}
                </span>

                <span className="shrink-0 text-xs font-medium text-ink-soft">
                  {rupiah(a.harga)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Button size="sm" block disabled={!berubah || busy} onClick={() => onSimpan(pilihan)}>
        {t("admin.addon.save")}
      </Button>
    </div>
  );
}
