"use client";

import { Settings2 } from "lucide-react";
import { Fragment, useState } from "react";
import type { AksiPengguna } from "./aksi";
import { AturAddOn } from "./AturAddOn";
import { AturLangganan } from "./AturLangganan";
import { AturTanggalLahir } from "./AturTanggalLahir";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import { teks, type AddOn } from "@/lib/harga";
import type { SubscriptionStatus, UserProfile } from "@/types";

const STATUS_STYLE: Record<SubscriptionStatus, string> = {
  lifetime: "bg-accent text-accent-ink",
  active: "bg-guru/25 text-ink",
  trial: "bg-ratu/25 text-ink",
  pending: "bg-lara/30 text-ink",
  expired: "bg-pati/20 text-ink",
};

const STATUS_KEY: Record<SubscriptionStatus, string> = {
  lifetime: "admin.filter.lifetime",
  active: "admin.filter.active",
  trial: "admin.filter.trial",
  pending: "admin.filter.pending",
  expired: "admin.filter.expired",
};

function tanggal(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** 08xx jadi 628xx supaya tautan wa.me bisa dibuka. */
function nomorWa(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0/, "62");
}

export function UserTable({
  users,
  katalogAddOn,
  onAction,
}: {
  users: UserProfile[];
  /** Daftar add-on yang ada, untuk pengatur per pengguna. */
  katalogAddOn: AddOn[];
  onAction: (uid: string, aksi: AksiPengguna) => Promise<void>;
}) {
  const t = useT();
  const [busy, setBusy] = useState<string | null>(null);
  const [terbuka, setTerbuka] = useState<string | null>(null);

  const jalankan = async (uid: string, aksi: AksiPengguna) => {
    setBusy(uid);
    try {
      await onAction(uid, aksi);
      setTerbuka(null);
    } finally {
      setBusy(null);
    }
  };

  if (users.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-faint">{t("admin.noUsers")}</p>;
  }

  return (
    // Tabel lebar harus bisa digulir sendiri, bukan mendorong lebar halaman.
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-ink-faint">
            <th className="px-3 py-2 font-semibold">{t("admin.col.user")}</th>
            <th className="px-3 py-2 font-semibold">{t("admin.col.status")}</th>
            <th className="px-3 py-2 font-semibold">{t("admin.col.validUntil")}</th>
            <th className="px-3 py-2 font-semibold">{t("admin.col.birth")}</th>
            <th className="px-3 py-2 font-semibold">{t("admin.col.addon")}</th>
            <th className="px-3 py-2 text-right font-semibold">{t("admin.col.action")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const seumurHidup = u.subscriptionStatus === "lifetime";
            const aktif = seumurHidup || u.subscriptionStatus === "active";
            const dibuka = terbuka === u.uid;

            return (
              // Panel pengaturan harus jadi baris sendiri; kalau ditaruh di baris
              // yang sama, sel colSpan menghimpit kolom-kolom lainnya.
              <Fragment key={u.uid}>
                <tr className="border-t border-border-soft align-middle">
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{u.nama || t("profile.noName")}</p>
                    <p className="text-xs text-ink-faint">{u.email}</p>
                    {u.phoneNumber && (
                      <a
                        href={`https://wa.me/${nomorWa(u.phoneNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-ink-soft underline underline-offset-2"
                      >
                        {u.phoneNumber}
                      </a>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-block rounded-pill px-2.5 py-1 text-xs font-medium",
                        STATUS_STYLE[u.subscriptionStatus],
                      )}
                    >
                      {t(STATUS_KEY[u.subscriptionStatus])}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-ink-soft">
                    {seumurHidup ? (
                      <span className="text-ink">{t("admin.noExpiry")}</span>
                    ) : (
                      tanggal(u.subscriptionExpiresAt)
                    )}
                  </td>

                  <td className="px-3 py-3 text-ink-soft">
                    {u.tanggalLahir ?? "-"}
                    {u.uripLahir !== null && (
                      <span className="block text-xs text-ink-faint">urip {u.uripLahir}</span>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <SelAddOn dimiliki={u.addOn ?? []} katalog={katalogAddOn} />
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant={dibuka ? "surface" : "primary"}
                        disabled={busy === u.uid}
                        onClick={() => setTerbuka(dibuka ? null : u.uid)}
                      >
                        <Settings2 className="h-3.5 w-3.5" aria-hidden />
                        {t("admin.manage")}
                      </Button>
                    </div>
                  </td>
                </tr>

                {dibuka && (
                  <tr>
                    <td colSpan={6} className="px-3 pb-4">
                      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
                        <AturLangganan
                          aktif={aktif}
                          busy={busy === u.uid}
                          onTutup={() => setTerbuka(null)}
                          onPilih={(aksi) => jalankan(u.uid, aksi)}
                        />
                        <AturAddOn
                          katalog={katalogAddOn}
                          dimiliki={u.addOn ?? []}
                          busy={busy === u.uid}
                          onSimpan={(addOn) => jalankan(u.uid, { action: "addon", addOn })}
                        />
                        {/* Pengguna tidak bisa lagi mengubah tanggal lahirnya
                            sendiri setelah onboarding, jadi perbaikannya ada
                            di sini. */}
                        <AturTanggalLahir
                          sekarang={u.tanggalLahir}
                          busy={busy === u.uid}
                          onSimpan={(tanggalLahir) =>
                            jalankan(u.uid, { action: "lahir", tanggalLahir })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Ringkasan add-on di baris tabel: cukup untuk memindai, tidak untuk membaca. */
function SelAddOn({ dimiliki, katalog }: { dimiliki: string[]; katalog: AddOn[] }) {
  const t = useT();
  const { lang } = useLang();

  if (dimiliki.length === 0) {
    return <span className="text-xs text-ink-faint">{t("admin.addon.none")}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {dimiliki.map((id) => {
        const a = katalog.find((x) => x.id === id);
        return (
          <span
            key={id}
            title={a ? teks(a.nama, lang) : id}
            className="rounded-pill bg-accent-wash px-2 py-0.5 text-[10px] font-medium text-accent-deep"
          >
            {a ? teks(a.nama, lang) : id}
          </span>
        );
      })}
    </div>
  );
}
