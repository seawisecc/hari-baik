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
    <>
      {/*
       * Ponsel: satu kartu per pengguna.
       *
       * Tabel enam kolom memaksa geser ke samping di layar selebar telapak
       * tangan, dan status yang ingin dilihat justru yang paling kanan.
       * Menggeser sambil mengatur langganan orang adalah cara paling mudah
       * salah pencet, jadi di ponsel setiap orang dapat kartunya sendiri
       * yang bisa dibaca dari atas ke bawah tanpa menggeser apa pun.
       */}
      <div className="space-y-3 md:hidden">
        {users.map((u) => (
          <KartuPengguna
            key={u.uid}
            u={u}
            katalogAddOn={katalogAddOn}
            busy={busy === u.uid}
            dibuka={terbuka === u.uid}
            onBuka={() => setTerbuka(terbuka === u.uid ? null : u.uid)}
            onAksi={(aksi) => jalankan(u.uid, aksi)}
          />
        ))}
      </div>

      {/* Layar lebar: tabel, karena membandingkan banyak orang sekaligus
          lebih mudah kalau angkanya sebaris. */}
      <div className="hidden overflow-x-auto md:block">
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
              const dibuka = terbuka === u.uid;

              return (
                // Panel pengaturan harus jadi baris sendiri; kalau ditaruh di baris
                // yang sama, sel colSpan menghimpit kolom-kolom lainnya.
                <Fragment key={u.uid}>
                  <tr className="border-t border-border-soft align-middle">
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{u.nama || t("profile.noName")}</p>
                      <p className="text-xs text-ink-faint">{u.email}</p>
                      {u.phoneNumber && <TautanWa phone={u.phoneNumber} />}
                    </td>

                    <td className="px-3 py-3">
                      <Status status={u.subscriptionStatus} />
                    </td>

                    <td className="px-3 py-3 text-ink-soft">
                      {u.subscriptionStatus === "lifetime" ? (
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
                        <PanelKelola
                          u={u}
                          katalogAddOn={katalogAddOn}
                          busy={busy === u.uid}
                          onTutup={() => setTerbuka(null)}
                          onAksi={(aksi) => jalankan(u.uid, aksi)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Satu pengguna sebagai kartu, untuk layar sempit. */
function KartuPengguna({
  u,
  katalogAddOn,
  busy,
  dibuka,
  onBuka,
  onAksi,
}: {
  u: UserProfile;
  katalogAddOn: AddOn[];
  busy: boolean;
  dibuka: boolean;
  onBuka: () => void;
  onAksi: (aksi: AksiPengguna) => void;
}) {
  const t = useT();

  return (
    <div className="rounded-md bg-surface px-5 py-4 hb-raise-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{u.nama || t("profile.noName")}</p>
          <p className="truncate text-xs text-ink-faint">{u.email}</p>
        </div>
        <Status status={u.subscriptionStatus} />
      </div>

      {u.phoneNumber && (
        <div className="mt-1">
          <TautanWa phone={u.phoneNumber} />
        </div>
      )}

      {/* Dua kolom: label kiri, nilai kanan. Di lebar ponsel ini lebih cepat
          dipindai daripada label di atas nilainya, yang membuat kartunya
          panjang dua kali lipat. */}
      <dl className="mt-4 space-y-2 border-t border-border-soft pt-3 text-sm">
        <Baris label={t("admin.col.validUntil")}>
          {u.subscriptionStatus === "lifetime" ? (
            <span className="text-ink">{t("admin.noExpiry")}</span>
          ) : (
            tanggal(u.subscriptionExpiresAt)
          )}
        </Baris>

        <Baris label={t("admin.col.birth")}>
          {u.tanggalLahir ?? "-"}
          {u.uripLahir !== null && (
            <span className="text-ink-faint"> · urip {u.uripLahir}</span>
          )}
        </Baris>

        <div>
          <dt className="mb-1.5 text-xs text-ink-faint">{t("admin.col.addon")}</dt>
          <dd>
            <SelAddOn dimiliki={u.addOn ?? []} katalog={katalogAddOn} />
          </dd>
        </div>
      </dl>

      <Button
        className="mt-4"
        block
        size="sm"
        variant={dibuka ? "surface" : "primary"}
        disabled={busy}
        onClick={onBuka}
      >
        <Settings2 className="h-3.5 w-3.5" aria-hidden />
        {dibuka ? t("common.close") : t("admin.manage")}
      </Button>

      {dibuka && (
        <div className="mt-4">
          <PanelKelola
            u={u}
            katalogAddOn={katalogAddOn}
            busy={busy}
            onTutup={onBuka}
            onAksi={onAksi}
          />
        </div>
      )}
    </div>
  );
}

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd className="text-right text-ink-soft">{children}</dd>
    </div>
  );
}

/**
 * Tiga pengatur untuk satu pengguna.
 *
 * Dipakai kartu ponsel maupun baris tabel, jadi keduanya tidak bisa berbeda
 * isi: menambah pengatur di satu tempat otomatis muncul di keduanya.
 */
function PanelKelola({
  u,
  katalogAddOn,
  busy,
  onTutup,
  onAksi,
}: {
  u: UserProfile;
  katalogAddOn: AddOn[];
  busy: boolean;
  onTutup: () => void;
  onAksi: (aksi: AksiPengguna) => void;
}) {
  const aktif = u.subscriptionStatus === "lifetime" || u.subscriptionStatus === "active";

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <AturLangganan
        aktif={aktif}
        busy={busy}
        onTutup={onTutup}
        onPilih={(aksi) => onAksi(aksi)}
      />
      <AturAddOn
        katalog={katalogAddOn}
        dimiliki={u.addOn ?? []}
        busy={busy}
        onSimpan={(addOn) => onAksi({ action: "addon", addOn })}
      />
      {/* Pengguna tidak bisa lagi mengubah tanggal lahirnya sendiri setelah
          onboarding, jadi perbaikannya ada di sini. */}
      <AturTanggalLahir
        sekarang={u.tanggalLahir}
        busy={busy}
        onSimpan={(tanggalLahir) => onAksi({ action: "lahir", tanggalLahir })}
      />
    </div>
  );
}

function Status({ status }: { status: SubscriptionStatus }) {
  const t = useT();
  return (
    <span
      className={cn(
        "shrink-0 rounded-pill px-2.5 py-1 text-xs font-medium",
        STATUS_STYLE[status],
      )}
    >
      {t(STATUS_KEY[status])}
    </span>
  );
}

function TautanWa({ phone }: { phone: string }) {
  return (
    <a
      href={`https://wa.me/${nomorWa(phone)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-ink-soft underline underline-offset-2"
    >
      {phone}
    </a>
  );
}

/**
 * Ringkasan add-on: cukup untuk memindai, tidak untuk membaca.
 *
 * Id yang tidak ada lagi di katalog ditandai berbeda, bukan dibiarkan tampil
 * seperti add-on biasa. Itu yang membuat sisa lama seperti
 * "pengingat-whatsapp" terbaca sebagai sesuatu yang perlu dibersihkan.
 */
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
        if (!a) {
          return (
            <span
              key={id}
              title={t("admin.addon.legacy")}
              className="rounded-pill bg-lara/20 px-2 py-0.5 text-[10px] font-medium text-lara-teks"
            >
              {id} · {t("admin.addon.unknown")}
            </span>
          );
        }
        return (
          <span
            key={id}
            title={teks(a.nama, lang)}
            className="rounded-pill bg-accent-wash px-2 py-0.5 text-[10px] font-medium text-accent-deep"
          >
            {teks(a.nama, lang)}
          </span>
        );
      })}
    </div>
  );
}
