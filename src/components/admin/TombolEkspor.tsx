"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/content/LangProvider";
import { ambilToken } from "@/lib/firebase/client";

/** Ambil nama berkas dari header, dengan cadangan kalau headernya tidak terbaca. */
function namaDariHeader(header: string | null): string {
  return header?.match(/filename="([^"]+)"/)?.[1] ?? "hari-baik-pengguna.csv";
}

/**
 * Unduh daftar pengguna yang sedang tampil sebagai CSV.
 *
 * Tidak bisa jadi tautan biasa. Route ekspor butuh header Authorization berisi
 * ID token, dan tautan `href` tidak membawa header apa pun; membuka route itu
 * lewat tautan hanya menghasilkan 401. Jadi berkasnya diambil lewat fetch,
 * dijadikan blob, lalu disodorkan ke peramban sebagai unduhan.
 *
 * Object URL-nya dilepas setelah dipakai. Tanpa itu isi berkasnya menetap di
 * memori tab selama tab itu terbuka, dan ini berkas berisi seluruh daftar
 * pelanggan.
 */
export function TombolEkspor({ status, kunci }: { status: string | null; kunci: string }) {
  const t = useT();
  const [sibuk, setSibuk] = useState(false);
  const [catatan, setCatatan] = useState<string | null>(null);
  const [gagal, setGagal] = useState(false);

  const unduh = async () => {
    setSibuk(true);
    setCatatan(null);
    setGagal(false);
    try {
      const token = await ambilToken();
      const q = new URLSearchParams();
      if (status) q.set("status", status);
      if (kunci.trim()) q.set("q", kunci.trim());

      const res = await fetch(`/api/admin/ekspor?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(String(res.status));

      const jumlah = Number(res.headers.get("X-Jumlah") ?? 0);
      const terpotong = res.headers.get("X-Terpotong") === "1";

      if (jumlah === 0) {
        setCatatan(t("admin.export.empty"));
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = namaDariHeader(res.headers.get("Content-Disposition"));
      a.click();
      URL.revokeObjectURL(url);

      setCatatan(
        terpotong
          ? t("admin.export.truncated", { n: jumlah })
          : t("admin.export.done", { n: jumlah }),
      );
    } catch {
      setGagal(true);
      setCatatan(t("admin.export.failed"));
    } finally {
      setSibuk(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Button size="sm" variant="surface" disabled={sibuk} onClick={unduh}>
        <Download className="h-3.5 w-3.5" aria-hidden />
        {sibuk ? t("admin.export.running") : t("admin.export")}
      </Button>
      {catatan && (
        <p role="status" className={gagal ? "text-xs text-error" : "text-xs text-ink-faint"}>
          {catatan}
        </p>
      )}
    </div>
  );
}
