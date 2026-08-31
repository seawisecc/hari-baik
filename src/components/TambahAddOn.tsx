"use client";

import { Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BayarMidtrans, MIDTRANS_AKTIF } from "@/components/BayarMidtrans";
import { ADMIN_WA, ADMIN_WA_DISPLAY } from "@/components/WhatsAppCard";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import { rupiah, teks, type AddOn } from "@/lib/harga";
import type { AccessState } from "@/types";

/**
 * Menambah add-on tanpa membeli langganan lagi.
 *
 * Sebelum ini tidak ada jalannya. Pelanggan yang sudah membayar setahun lalu
 * ingin membuka satu fitur tambahan hanya punya dua pilihan: membeli paket
 * setahun lagi yang belum dia butuhkan, atau menghubungi admin dan menunggu.
 * Keduanya membuang niat membayar yang sudah ada di tangan.
 *
 * Kartunya tidak dirender sama sekali kalau tidak ada yang bisa ditawarkan,
 * yaitu ketika semua add-on sudah dimiliki atau tidak ada yang dijual. Kartu
 * kosong berjudul "Tambah fitur" yang isinya tidak ada apa-apa lebih
 * membingungkan daripada tidak ada kartunya.
 */
export function TambahAddOn({
  katalog,
  dimiliki,
  access,
}: {
  /** Sudah disaring: hanya yang aktif dijual. */
  katalog: AddOn[];
  dimiliki: string[];
  access: AccessState;
}) {
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const [dipilih, setDipilih] = useState<string[]>([]);

  const punya = new Set(dimiliki);
  const tersedia = katalog.filter((a) => !punya.has(a.id));
  const total = katalog.filter((a) => dipilih.includes(a.id)).reduce((n, a) => n + a.harga, 0);

  if (tersedia.length === 0) return null;

  /*
   * Yang langganannya belum aktif tidak ditawari.
   *
   * Add-on hanya terbuka bagi pemegang langganan aktif: gerbangnya diperiksa
   * setelah gerbang Pro. Menjualnya kepada yang masa cobanya masih berjalan
   * berarti menjual sesuatu yang berhenti bisa dibuka beberapa hari lagi, dan
   * yang membelinya tidak akan menyangka itu yang dia beli. Server menolak
   * dengan aturan yang sama lewat alasanTolakAddOn(), jadi menyembunyikan
   * tombolnya di sini bukan satu-satunya penjaga.
   */
  if (!access.isPro) {
    return (
      <Card elevation={2}>
        <CardHeader>
          <CardTitle>{t("addon.buy.title")}</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm leading-relaxed text-ink-soft">{t("addon.buy.needPro")}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardHeader>
        <CardTitle>{t("addon.buy.title")}</CardTitle>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t("addon.buy.desc")}</p>
      </CardHeader>

      <CardBody className="space-y-5">
        <ul className="space-y-2.5">
          {tersedia.map((a) => {
            const aktif = dipilih.includes(a.id);
            return (
              <li key={a.id}>
                <button
                  type="button"
                  aria-pressed={aktif}
                  onClick={() =>
                    setDipilih((d) => (aktif ? d.filter((x) => x !== a.id) : [...d, a.id]))
                  }
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md px-4 py-3.5 text-left",
                    "transition-[box-shadow,background-color] duration-150",
                    aktif ? "bg-accent-wash hb-raise-1" : "bg-surface-sunk hb-sink",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-pill",
                      aktif ? "bg-accent text-accent-ink" : "bg-surface text-ink-faint",
                    )}
                  >
                    {aktif ? (
                      <Check className="h-2.5 w-2.5" />
                    ) : (
                      <Plus className="h-2.5 w-2.5" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">
                      {teks(a.nama, lang)}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                      {teks(a.deskripsi, lang)}
                    </span>
                  </span>

                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-medium text-ink">
                      {rupiah(a.harga)}
                    </span>
                    <span className="block text-[10px] text-ink-faint">
                      {a.sekali ? t("price.oneTimeTag") : t("price.perTerm")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {dipilih.length > 0 && (
          <div className="flex items-baseline justify-between rounded-md bg-surface-sunk px-5 py-4 hb-sink">
            <span className="text-sm text-ink-soft">{t("req.total")}</span>
            <span className="font-heading text-2xl font-bold text-ink">{rupiah(total)}</span>
          </div>
        )}

        {/* Masa berlaku langganan tidak ikut berubah, dan itu perlu disebutkan
            sebelum orang membayar, bukan sesudah. Yang membeli tambahan di
            tengah jalan mudah mengira ia sekalian memperpanjang. */}
        {dipilih.length > 0 && (
          <p className="text-xs leading-relaxed text-ink-faint">{t("addon.buy.note")}</p>
        )}

        {MIDTRANS_AKTIF ? (
          <BayarMidtrans
            paketId={null}
            addOnIds={dipilih}
            onLunas={(orderId) =>
              router.push(`/terima-kasih?bayar=${encodeURIComponent(orderId)}`)
            }
          />
        ) : (
          // Tanpa gateway, satu-satunya jalan menambah add-on adalah lewat
          // admin. Disebutkan apa adanya, bukan dengan tombol mati yang tidak
          // menjelaskan kenapa.
          <a
            href={`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(
              "Halo, saya ingin menambah add-on di Hari Baik.",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-surface text-sm font-medium text-ink hb-raise-1 transition-colors hover:text-accent-deep"
          >
            {t("expired.chatAdmin")} {ADMIN_WA_DISPLAY}
          </a>
        )}
      </CardBody>
    </Card>
  );
}
