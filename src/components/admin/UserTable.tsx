"use client";

import { Settings2 } from "lucide-react";
import { Fragment, useState } from "react";
import { AturLangganan, type AksiLangganan } from "./AturLangganan";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { SubscriptionStatus, UserProfile } from "@/types";

const STATUS_STYLE: Record<SubscriptionStatus, string> = {
  lifetime: "bg-accent text-accent-ink",
  active: "bg-guru/25 text-ink",
  trial: "bg-ratu/25 text-ink",
  pending: "bg-lara/30 text-ink",
  expired: "bg-pati/20 text-ink",
};

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  lifetime: "Selamanya",
  active: "Aktif",
  trial: "Trial",
  pending: "Menunggu",
  expired: "Habis",
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
  onAction,
}: {
  users: UserProfile[];
  onAction: (uid: string, aksi: AksiLangganan) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [terbuka, setTerbuka] = useState<string | null>(null);

  const jalankan = async (uid: string, aksi: AksiLangganan) => {
    setBusy(uid);
    try {
      await onAction(uid, aksi);
      setTerbuka(null);
    } finally {
      setBusy(null);
    }
  };

  if (users.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-faint">Tidak ada pengguna.</p>;
  }

  return (
    // Tabel lebar harus bisa digulir sendiri, bukan mendorong lebar halaman.
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-ink-faint">
            <th className="px-3 py-2 font-semibold">Pengguna</th>
            <th className="px-3 py-2 font-semibold">Status</th>
            <th className="px-3 py-2 font-semibold">Berlaku s/d</th>
            <th className="px-3 py-2 font-semibold">Lahir</th>
            <th className="px-3 py-2 text-right font-semibold">Aksi</th>
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
                    <p className="font-medium text-ink">{u.nama || "(belum diisi)"}</p>
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
                      {STATUS_LABEL[u.subscriptionStatus]}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-ink-soft">
                    {seumurHidup ? (
                      <span className="text-ink">Tanpa batas</span>
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
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant={dibuka ? "surface" : "primary"}
                        disabled={busy === u.uid}
                        onClick={() => setTerbuka(dibuka ? null : u.uid)}
                      >
                        <Settings2 className="h-3.5 w-3.5" aria-hidden />
                        Atur
                      </Button>
                    </div>
                  </td>
                </tr>

                {dibuka && (
                  <tr>
                    <td colSpan={5} className="px-3 pb-4">
                      <AturLangganan
                        aktif={aktif}
                        busy={busy === u.uid}
                        onTutup={() => setTerbuka(null)}
                        onPilih={(aksi) => jalankan(u.uid, aksi)}
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
  );
}
