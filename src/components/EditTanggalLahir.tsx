"use client";

import { doc, updateDoc } from "firebase/firestore";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useT } from "@/lib/content/LangProvider";
import { uripPetemon } from "@/lib/content/petemon";
import { getDb } from "@/lib/firebase/client";
import {
  getSadwara,
  pancawaraName,
  saptawaraName,
  toDateString,
  uripHari,
  wukuName,
} from "@/lib/wariga";

/**
 * Ubah tanggal lahir sendiri.
 *
 * Field wariga turunan ikut dihitung ulang di sini supaya tetap sinkron
 * dengan tanggal barunya; kalau tidak, admin akan melihat weton lama.
 */
export function EditTanggalLahir({
  uid,
  tanggalLahir,
  onSelesai,
}: {
  uid: string;
  tanggalLahir: string | null;
  onSelesai?: () => void;
}) {
  const t = useT();
  const [buka, setBuka] = useState(false);
  const [nilai, setNilai] = useState(tanggalLahir ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = toDateString(new Date());

  if (!buka) {
    return (
      <Button variant="surface" size="sm" onClick={() => setBuka(true)}>
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        {t("birth.change")}
      </Button>
    );
  }

  return (
    <form
      className="space-y-4 rounded-md bg-surface-sunk px-5 py-5 hb-sink"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!nilai) return;
        setBusy(true);
        setError(null);
        try {
          const petemon = uripPetemon(nilai);
          await updateDoc(doc(getDb(), "users", uid), {
            tanggalLahir: nilai,
            saptaWaraLahir: saptawaraName(nilai),
            pancaWaraLahir: pancawaraName(nilai),
            sadWaraLahir: getSadwara(nilai),
            wukuLahir: wukuName(nilai),
            uripLahir: uripHari(nilai),
            uripPetemonLahir: petemon.totalUrip,
          });
          setBuka(false);
          onSelesai?.();
        } catch {
          setError(t("common.saveFailed"));
        } finally {
          setBusy(false);
        }
      }}
    >
      {error && <Alert tone="error">{error}</Alert>}

      <div className="space-y-2">
        <Label htmlFor="ubah-lahir">{t("onboarding.birthDate")}</Label>
        <Input
          id="ubah-lahir"
          type="date"
          max={today}
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          required
        />
      </div>

      {nilai && nilai !== tanggalLahir && (
        <div className="rounded-md bg-surface px-4 py-3 hb-raise-1">
          <p className="text-xs text-ink-faint">{t("birth.newWeton")}</p>
          <p className="mt-0.5 font-heading text-base font-semibold text-ink">
            {saptawaraName(nilai)} {pancawaraName(nilai)}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            Wuku {wukuName(nilai)} · Urip {uripHari(nilai)}
          </p>
        </div>
      )}

      <p className="text-xs leading-relaxed text-ink-faint">{t("birth.recalcNote")}</p>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy || !nilai || nilai === tanggalLahir}>
          {busy ? t("common.saving") : t("common.save")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => {
            setNilai(tanggalLahir ?? "");
            setBuka(false);
            setError(null);
          }}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
