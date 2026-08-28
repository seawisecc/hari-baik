"use client";

import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/content/LangProvider";

/**
 * Loloskan pengguna yang emailnya tidak pernah sampai.
 *
 * Hanya muncul untuk yang benar-benar belum terverifikasi. Tombol yang selalu
 * ada, termasuk untuk orang yang sudah menekan tautannya sendiri, cuma
 * menambah satu tombol berdampak yang tidak pernah dibutuhkan.
 *
 * Peringatannya ditulis apa adanya karena memang begitu: sesudah ditekan,
 * pemegang kata sandi akun itu bisa masuk tanpa pernah membuktikan alamat
 * emailnya. Itu keputusan yang boleh diambil ketika kamu sudah tahu orangnya
 * siapa, bukan kebiasaan.
 */
export function TandaiVerifikasi({ busy, onTandai }: { busy: boolean; onTandai: () => void }) {
  const t = useT();

  return (
    <div className="space-y-3 rounded-md bg-surface-sunk px-5 py-5 hb-sink">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        {t("admin.verify.title")}
      </p>
      <p className="text-xs text-ink-soft">{t("admin.verify.hint")}</p>
      <Button size="sm" variant="surface" disabled={busy} onClick={onTandai}>
        <MailCheck className="h-3.5 w-3.5" aria-hidden />
        {t("admin.verify.btn")}
      </Button>
    </div>
  );
}
