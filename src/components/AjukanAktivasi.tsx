"use client";

import { Check, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Input";
import { ADMIN_WA, ADMIN_WA_DISPLAY } from "@/components/WhatsAppCard";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { rupiah, teks, type AddOn, type PaketLangganan } from "@/lib/harga";

/**
 * Ajukan aktivasi setelah membayar.
 *
 * Tombolnya baru bisa ditekan setelah paket dipilih: permintaan tanpa paket
 * memaksa admin bertanya balik, dan itu justru menambah pekerjaan yang
 * seharusnya dihilangkan antrean ini.
 */
export function AjukanAktivasi({
  paket,
  addOnTersedia,
  sudahMenunggu,
}: {
  paket: PaketLangganan | null;
  addOnTersedia: AddOn[];
  sudahMenunggu: boolean;
}) {
  const t = useT();
  const { lang } = useLang();
  const { user, profile } = useAuth();

  const [dipilih, setDipilih] = useState<string[]>([]);
  const [catatan, setCatatan] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasil, setHasil] = useState<"terkirim" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addOnDipilih = addOnTersedia.filter((a) => dipilih.includes(a.id));
  const total = (paket?.harga ?? 0) + addOnDipilih.reduce((n, a) => n + a.harga, 0);

  if (sudahMenunggu || hasil === "terkirim") {
    return (
      <div className="space-y-4">
        <Alert tone="success">{hasil === "terkirim" ? t("req.sent") : t("req.pending")}</Alert>
        <TombolWa profil={profile} paket={paket} />
      </div>
    );
  }

  const kirim = async () => {
    if (!user || !paket) return;
    setBusy(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/aktivasi", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paketId: paket.id, addOnIds: dipilih, catatan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("admin.actionFailed"));
      setHasil("terkirim");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.actionFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}

      {addOnTersedia.length > 0 && paket && (
        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            {t("req.addonsPick")}
          </p>
          <div className="flex flex-wrap gap-2">
            {addOnTersedia.map((a) => {
              const aktif = dipilih.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={aktif}
                  onClick={() =>
                    setDipilih((d) => (aktif ? d.filter((x) => x !== a.id) : [...d, a.id]))
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-xs font-medium",
                    "transition-[box-shadow,background-color] duration-150",
                    aktif
                      ? "bg-accent text-accent-ink hb-sink-sm"
                      : "bg-surface text-ink-soft hb-raise-1 hover:text-ink",
                  )}
                >
                  {aktif && <Check className="h-3 w-3" aria-hidden />}
                  {teks(a.nama, lang)}
                  <span className="opacity-70">+{rupiah(a.harga)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {paket && (
        <div className="flex items-baseline justify-between rounded-md bg-surface-sunk px-5 py-4 hb-sink">
          <span className="text-sm text-ink-soft">{t("req.total")}</span>
          <span className="font-heading text-2xl font-bold text-ink">{rupiah(total)}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="catatan" className="text-xs">
          {t("req.noteLabel")}
        </Label>
        <textarea
          id="catatan"
          rows={2}
          value={catatan}
          maxLength={400}
          placeholder={t("req.notePlaceholder")}
          onChange={(e) => setCatatan(e.target.value)}
          className="w-full rounded-md bg-surface-sunk px-4 py-3 text-sm text-ink hb-sink placeholder:text-ink-faint focus:hb-ring"
        />
      </div>

      <Button block size="lg" disabled={busy || !paket} onClick={kirim}>
        <Send className="h-4 w-4" aria-hidden />
        {busy ? t("req.sending") : t("req.iPaid")}
      </Button>

      {!paket && <p className="text-center text-xs text-ink-faint">{t("req.pickFirst")}</p>}

      <p className="text-center text-xs leading-relaxed text-ink-faint">{t("req.orChat")}</p>
      <TombolWa profil={profile} paket={paket} />
    </div>
  );
}

function TombolWa({
  profil,
  paket,
}: {
  profil: { nama?: string; email?: string } | null;
  paket: PaketLangganan | null;
}) {
  const t = useT();
  const { lang } = useLang();

  const pesan = [
    "Halo, saya ingin berlangganan Hari Baik.",
    paket ? `Paket: ${teks(paket.nama, lang)} (${rupiah(paket.harga)})` : null,
    `Nama: ${profil?.nama || "-"}`,
    `Email: ${profil?.email ?? "-"}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <a
      href={`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(pesan)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-surface text-sm font-medium text-ink hb-raise-1 transition-colors hover:text-accent-deep"
    >
      <MessageCircle className="h-4 w-4" aria-hidden />
      {t("expired.chatAdmin")} {ADMIN_WA_DISPLAY}
    </a>
  );
}
