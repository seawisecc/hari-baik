"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { SubscriptionStatus, UserProfile } from "@/types";

const STATUS_STYLE: Record<SubscriptionStatus, string> = {
  active: "bg-guru/25 text-ink",
  trial: "bg-ratu/25 text-ink",
  pending: "bg-lara/30 text-ink",
  expired: "bg-pati/20 text-ink",
};

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
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

export function UserTable({
  users,
  onAction,
}: {
  users: UserProfile[];
  onAction: (uid: string, action: "approve" | "extend" | "deactivate") => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const jalankan = async (uid: string, action: "approve" | "extend" | "deactivate") => {
    setBusy(uid);
    try {
      await onAction(uid, action);
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
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-ink-faint">
            <th className="px-3 py-2 font-medium">Pengguna</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Berlaku s/d</th>
            <th className="px-3 py-2 font-medium">Lahir</th>
            <th className="px-3 py-2 text-right font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.uid} className="border-t border-border-soft align-middle">
              <td className="px-3 py-3">
                <p className="font-medium text-ink">{u.nama || "(belum diisi)"}</p>
                <p className="text-xs text-ink-faint">{u.email}</p>
                {u.phoneNumber && (
                  <a
                    href={`https://wa.me/${u.phoneNumber.replace(/^0/, "62").replace(/\D/g, "")}`}
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
              <td className="px-3 py-3 text-ink-soft">{tanggal(u.subscriptionExpiresAt)}</td>
              <td className="px-3 py-3 text-ink-soft">
                {u.tanggalLahir ?? "-"}
                {u.uripLahir !== null && (
                  <span className="block text-xs text-ink-faint">urip {u.uripLahir}</span>
                )}
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    disabled={busy === u.uid}
                    onClick={() =>
                      jalankan(u.uid, u.subscriptionStatus === "pending" ? "approve" : "extend")
                    }
                  >
                    {u.subscriptionStatus === "pending" ? "Setujui" : "+1 tahun"}
                  </Button>
                  {u.subscriptionStatus === "active" && (
                    <Button
                      size="sm"
                      variant="surface"
                      disabled={busy === u.uid}
                      onClick={() => jalankan(u.uid, "deactivate")}
                    >
                      Nonaktifkan
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
