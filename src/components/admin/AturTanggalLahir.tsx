"use client";

import { CalendarCheck } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useT } from "@/lib/content/LangProvider";
import { pancawaraName, saptawaraName, uripHari, wukuName } from "@/lib/wariga";

/**
 * Perbaiki tanggal lahir seorang pengguna.
 *
 * Pengguna mengunci tanggalnya sendiri saat onboarding, jadi panel ini adalah
 * satu-satunya jalan memperbaiki salah ketik. Weton hasil tanggal barunya
 * ditampilkan lebih dulu supaya admin bisa mencocokkannya dengan yang
 * disebutkan pengguna, bukan menyimpan angka yang belum tentu benar.
 */
export function AturTanggalLahir({
  sekarang,
  busy,
  onSimpan,
}: {
  sekarang: string | null;
  busy: boolean;
  onSimpan: (tanggalLahir: string) => void;
}) {
  const t = useT();
  // Id dari useId(), bukan untaian tetap: UserTable merender kartu ponsel dan
  // tabel layar lebar sekaligus, jadi panel ini muncul dua kali di DOM. Id yang
  // kembar membuat label menunjuk salinan yang sedang disembunyikan CSS, dan
  // elemen ber-display none tidak bisa difokuskan. Lihat catatan lengkapnya di
  // HapusPengguna.tsx.
  const idTanggal = useId();
  const [nilai, setNilai] = useState(sekarang ?? "");
  const berubah = nilai.length === 10 && nilai !== sekarang;

  return (
    <div className="space-y-4 rounded-md bg-surface-sunk px-5 py-5 hb-sink">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        {t("admin.birth.title")}
      </p>

      <div className="space-y-2">
        <Label htmlFor={idTanggal} className="text-xs">
          {t("admin.birth.current", { tanggal: sekarang ?? "-" })}
        </Label>
        <Input
          id={idTanggal}
          type="date"
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          className="h-10 w-auto text-sm"
        />
      </div>

      {berubah && (
        <div className="rounded-md bg-surface px-4 py-3 hb-raise-1">
          <p className="text-[11px] uppercase tracking-wide text-ink-faint">
            {t("admin.birth.preview")}
          </p>
          <p className="mt-0.5 font-heading text-base font-semibold text-ink">
            {saptawaraName(nilai)} {pancawaraName(nilai)}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            Wuku {wukuName(nilai)} · Urip {uripHari(nilai)}
          </p>
        </div>
      )}

      <p className="text-xs leading-relaxed text-ink-faint">{t("admin.birth.note")}</p>

      <Button size="sm" disabled={busy || !berubah} onClick={() => onSimpan(nilai)}>
        <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
        {t("admin.birth.save")}
      </Button>
    </div>
  );
}
