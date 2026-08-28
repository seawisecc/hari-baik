"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { pesanAuth } from "@/lib/firebase/errors";

/**
 * Lambang G milik Google, digambar langsung sebagai SVG.
 *
 * Bukan berkas gambar, karena satu-satunya gambar di seluruh alur masuk tidak
 * layak menambah satu permintaan jaringan lagi ke halaman yang justru sedang
 * ditunggu orang. Warnanya warna resmi Google dan tidak boleh ikut tema:
 * pedoman mereknya melarang lambang ini diwarnai ulang.
 */
function LambangGoogle() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

/**
 * Tombol masuk dengan Google, dipakai halaman masuk dan halaman daftar.
 *
 * Keduanya memakai tombol yang sama karena bagi Google memang tidak ada
 * bedanya: akun yang belum pernah ada akan dibuat, yang sudah ada akan
 * dimasuki. Memisahkannya jadi "daftar" dan "masuk" hanya menciptakan
 * pertanyaan yang tidak perlu dijawab pengguna.
 */
export function TombolGoogle({
  disabled,
  onError,
  onSukses,
}: {
  disabled?: boolean;
  onError: (pesan: string | null) => void;
  onSukses: () => void;
}) {
  const t = useT();
  const { loginWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      variant="surface"
      block
      size="lg"
      disabled={disabled || busy}
      onClick={async () => {
        onError(null);
        setBusy(true);
        try {
          const selesai = await loginWithGoogle();
          // Pada jalur redirect halaman ini sudah ditinggalkan, jadi tidak ada
          // yang perlu dipindahkan dan tombolnya tidak perlu dipulihkan.
          if (selesai) onSukses();
        } catch (err) {
          // Menutup jendela Google bukan kesalahan, itu keputusan. Menampilkan
          // spanduk merah untuk itu membuat orang mengira ada yang rusak.
          const kode = (err as { code?: string }).code;
          if (kode !== "auth/popup-closed-by-user" && kode !== "auth/cancelled-popup-request") {
            onError(pesanAuth(err));
          }
        } finally {
          setBusy(false);
        }
      }}
    >
      <LambangGoogle />
      {busy ? t("common.processing") : t("auth.google")}
    </Button>
  );
}

/** Garis pemisah dengan kata di tengahnya. */
export function Pemisah() {
  const t = useT();
  return (
    <div className="flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-border-soft" />
      <span className="text-xs uppercase tracking-wider text-ink-faint">{t("auth.or")}</span>
      <span className="h-px flex-1 bg-border-soft" />
    </div>
  );
}
