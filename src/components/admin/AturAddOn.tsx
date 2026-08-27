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
 *
 * Id yang menempel di dokumen pengguna tapi sudah tidak ada di katalog juga
 * ikut ditampilkan, di kelompoknya sendiri, dan bisa dimatikan. Tanpa itu id
 * seperti "pengingat-whatsapp" tidak muncul di mana pun tapi tetap ikut
 * terkirim setiap kali menyimpan, ditolak server, dan mengunci seluruh
 * pengaturan add-on orang itu.
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

  /** Dimiliki pengguna ini, tapi sudah tidak ada di daftar harga. */
  const warisan = dimiliki.filter((id) => !katalog.some((a) => a.id === id));

  return (
    // Wadahnya sama dengan dua pengatur lain di sebelahnya. Sebelumnya panel
    // ini polos tanpa permukaan, jadi di ponsel, ketika ketiganya bertumpuk,
    // batas antar pengatur hilang dan ketiganya terbaca sebagai satu daftar
    // panjang.
    <div className="space-y-3 rounded-md bg-surface-sunk px-5 py-5 hb-sink">
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
                  dipilih ? "bg-accent-wash hb-raise-1" : "bg-surface hb-raise-1",
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

      {warisan.length > 0 && (
        <div className="space-y-2 rounded-md bg-lara/12 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-lara-teks">
            {t("admin.addon.legacy")}
          </p>
          <p className="text-xs leading-relaxed text-ink-soft">{t("admin.addon.legacyHint")}</p>
          <ul className="space-y-2 pt-0.5">
            {warisan.map((id) => {
              const dipilih = pilihan.includes(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    disabled={busy}
                    aria-pressed={dipilih}
                    onClick={() => alihkan(id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md bg-surface px-4 py-2.5 text-left",
                      "transition-shadow duration-150 hb-raise-1",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-sm border",
                        dipilih
                          ? "border-lara bg-lara text-ink"
                          : "border-border-soft bg-surface-sunk",
                      )}
                    >
                      {dipilih && <Check className="h-3 w-3" />}
                    </span>
                    {/* Id ditulis utuh, tidak dipotong: kalau nanti ada sisa
                        lain, admin harus bisa membacanya untuk tahu itu apa. */}
                    <span className="min-w-0 flex-1 break-all font-mono text-xs text-ink">
                      {id}
                    </span>
                    <span className="shrink-0 text-[11px] font-medium text-lara-teks">
                      {dipilih ? t("admin.addon.legacyOn") : t("admin.addon.legacyOff")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Button size="sm" block disabled={!berubah || busy} onClick={() => onSimpan(pilihan)}>
        {t("admin.addon.save")}
      </Button>
    </div>
  );
}
