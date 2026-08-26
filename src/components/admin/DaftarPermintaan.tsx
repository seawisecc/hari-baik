"use client";

import { Check, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { rupiah } from "@/lib/harga";
import type { Aktivasi, StatusAktivasi } from "@/types";
import { ambilToken } from "@/lib/firebase/client";

const FILTER: { key: StatusAktivasi; labelKey: string }[] = [
  { key: "menunggu", labelKey: "admin.req.filter.waiting" },
  { key: "disetujui", labelKey: "admin.req.filter.approved" },
  { key: "ditolak", labelKey: "admin.req.filter.rejected" },
];

function nomorWa(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0/, "62");
}

export function DaftarPermintaan() {
  const t = useT();
  const { user } = useAuth();
  const [status, setStatus] = useState<StatusAktivasi>("menunggu");
  const [daftar, setDaftar] = useState<Aktivasi[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [menolak, setMenolak] = useState<string | null>(null);
  const [alasan, setAlasan] = useState("");

  useEffect(() => {
    if (!user) return;
    let batal = false;

    void (async () => {
      try {
        const token = await ambilToken();
        if (batal) return;
        const res = await fetch(`/api/admin/aktivasi?status=${status}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (batal) return;
        if (!res.ok) throw new Error(data.error ?? t("admin.loadFailed"));
        setDaftar(data.aktivasi);
        setError(null);
      } catch (err) {
        if (!batal) setError(err instanceof Error ? err.message : t("admin.loadFailed"));
      } finally {
        if (!batal) setMemuat(false);
      }
    })();

    return () => {
      batal = true;
    };
  }, [user, status, refresh, t]);

  const putuskan = async (id: string, aksi: "setujui" | "tolak") => {
    if (!user) return;
    setBusy(id);
    setError(null);
    try {
      const token = await ambilToken();
      const res = await fetch("/api/admin/aktivasi", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, aksi, alasan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("admin.actionFailed"));
      setMenolak(null);
      setAlasan("");
      setMemuat(true);
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.actionFailed"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-wrap gap-2.5">
        {FILTER.map((f) => (
          <Chip
            key={f.key}
            selected={status === f.key}
            onClick={() => {
              if (f.key === status) return;
              setMemuat(true);
              setStatus(f.key);
            }}
          >
            {t(f.labelKey)}
          </Chip>
        ))}
      </div>

      {memuat ? (
        <p className="py-10 text-center text-sm text-ink-faint">{t("common.loading")}</p>
      ) : daftar.length === 0 ? (
        <Card elevation={1}>
          <CardBody className="py-10 text-center text-sm text-ink-faint">
            {t("admin.req.none")}
          </CardBody>
        </Card>
      ) : (
        <ul className="space-y-4">
          {daftar.map((a) => (
            <li key={a.id}>
              <Card elevation={2}>
                <CardBody className="space-y-4 pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{a.nama || a.email}</p>
                      <p className="text-xs text-ink-faint">{a.email}</p>
                      {a.phoneNumber && (
                        <a
                          href={`https://wa.me/${nomorWa(a.phoneNumber)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-ink-soft underline underline-offset-2"
                        >
                          <MessageCircle className="h-3 w-3" aria-hidden />
                          {a.phoneNumber}
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-xl font-bold text-ink">
                        {rupiah(a.total)}
                      </p>
                      <p className="text-xs text-ink-soft">{a.paketNama}</p>
                      <p className="text-[11px] text-ink-faint">
                        {t("admin.req.willExtend", { n: a.paketTahun })}
                      </p>
                    </div>
                  </div>

                  {a.addOn.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {a.addOn.map((x) => (
                        <li
                          key={x.id}
                          className="rounded-pill bg-surface-sunk px-3 py-1.5 text-xs text-ink-soft hb-sink-sm"
                        >
                          {x.nama} · {rupiah(x.harga)}
                        </li>
                      ))}
                    </ul>
                  )}

                  {a.catatan && (
                    <div className="rounded-md bg-surface-sunk px-4 py-3 hb-sink">
                      <p className="text-[11px] uppercase tracking-wide text-ink-faint">
                        {t("admin.req.note")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink">{a.catatan}</p>
                    </div>
                  )}

                  <p className="text-xs text-ink-faint">
                    {new Date(a.createdAt).toLocaleString("id-ID")}
                    {a.diputuskanOleh && (
                      <>
                        {" · "}
                        {t("admin.req.decidedBy")} {a.diputuskanOleh}
                      </>
                    )}
                  </p>

                  {a.alasanTolak && <p className="text-sm text-error">{a.alasanTolak}</p>}

                  {a.status === "menunggu" && (
                    <div className="space-y-3 border-t border-border-soft pt-4">
                      {menolak === a.id ? (
                        <div className="space-y-3">
                          <textarea
                            rows={2}
                            value={alasan}
                            maxLength={300}
                            placeholder={t("admin.req.rejectReason")}
                            onChange={(e) => setAlasan(e.target.value)}
                            className="w-full rounded-md bg-surface-sunk px-4 py-3 text-sm text-ink hb-sink placeholder:text-ink-faint focus:hb-ring"
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={busy === a.id}
                              onClick={() => putuskan(a.id, "tolak")}
                            >
                              {t("admin.req.confirmReject")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy === a.id}
                              onClick={() => {
                                setMenolak(null);
                                setAlasan("");
                              }}
                            >
                              {t("common.cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            disabled={busy === a.id}
                            onClick={() => putuskan(a.id, "setujui")}
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden />
                            {t("admin.req.approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="surface"
                            disabled={busy === a.id}
                            onClick={() => setMenolak(a.id)}
                          >
                            <X className="h-3.5 w-3.5" aria-hidden />
                            {t("admin.req.reject")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
