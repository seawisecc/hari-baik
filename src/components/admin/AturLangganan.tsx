"use client";

import { CalendarDays, Infinity as InfinityIcon, Plus, X } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useT } from "@/lib/content/LangProvider";
import type { AksiLangganan } from "./aksi";

const CEPAT = [1, 2, 3, 5];

/**
 * Panel pengaturan langganan satu pengguna.
 *
 * Tombol cepat untuk kasus umum, pemilih tanggal untuk yang tidak umum, dan
 * "selamanya" untuk yang tidak punya tanggal habis sama sekali.
 */
export function AturLangganan({
  aktif,
  onPilih,
  onTutup,
  busy,
}: {
  aktif: boolean;
  onPilih: (aksi: AksiLangganan) => void;
  onTutup: () => void;
  busy: boolean;
}) {
  const t = useT();
  // Id dari useId(), bukan untaian tetap: UserTable merender kartu ponsel dan
  // tabel layar lebar sekaligus, jadi panel ini muncul dua kali di DOM. Id yang
  // kembar membuat label menunjuk salinan yang sedang disembunyikan CSS, dan
  // elemen ber-display none tidak bisa difokuskan. Lihat catatan lengkapnya di
  // HapusPengguna.tsx.
  const idHabis = useId();
  const [tanggal, setTanggal] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Dicek saat tombol ditekan, bukan lewat atribut `min`: membaca waktu
  // berjalan di tengah render membuat hasil render tidak murni.
  const tetapkan = () => {
    if (new Date(`${tanggal}T23:59:59`) <= new Date()) {
      setError(t("admin.dateMustBeFuture"));
      return;
    }
    setError(null);
    onPilih({ action: "set", expiresAt: tanggal });
  };

  return (
    <div className="space-y-5 rounded-md bg-surface-sunk px-5 py-5 hb-sink">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          {t("admin.manageSub")}
        </p>
        <button
          onClick={onTutup}
          disabled={busy}
          aria-label={t("common.close")}
          className="text-ink-faint hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs text-ink-soft">{t("admin.addFromExpiry")}</p>
        <div className="flex flex-wrap gap-2">
          {CEPAT.map((n) => (
            <Button
              key={n}
              size="sm"
              variant="surface"
              disabled={busy}
              onClick={() => onPilih({ action: "extend", tahun: n })}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {t("admin.years", { n })}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={idHabis} className="text-xs">
          {t("admin.orSetDate")}
        </Label>
        <div className="flex flex-wrap gap-2">
          <Input
            id={idHabis}
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="h-10 w-auto flex-1 text-sm"
          />
          <Button size="sm" disabled={busy || !tanggal} onClick={tetapkan}>
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {t("admin.setDate")}
          </Button>
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border-soft pt-4">
        <Button
          size="sm"
          variant="surface"
          disabled={busy}
          onClick={() => onPilih({ action: "lifetime" })}
        >
          <InfinityIcon className="h-3.5 w-3.5" aria-hidden />
          {t("admin.forever")}
        </Button>
        {aktif && (
          <Button
            size="sm"
            variant="danger"
            disabled={busy}
            onClick={() => onPilih({ action: "deactivate" })}
          >
            {t("admin.deactivate")}
          </Button>
        )}
      </div>
    </div>
  );
}
