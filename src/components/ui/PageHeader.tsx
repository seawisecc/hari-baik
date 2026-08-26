"use client";

/**
 * Judul halaman. Kontrol tema/bahasa TIDAK di sini — di desktop letaknya
 * di sidebar, di mobile di top bar; menaruhnya di tiap halaman membuatnya
 * muncul dua kali.
 */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
      <div>
        <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 max-w-prose text-[15px] leading-relaxed text-ink-soft">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}

/** Kutipan penyeimbang — mengingatkan bahwa hasil hitungan bukan vonis. */
export function Wisdom({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-surface-sunk px-5 py-4 hb-sink">
      <p className="text-[13px] italic leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
