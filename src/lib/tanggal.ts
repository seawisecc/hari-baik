import type { Lang } from "@/lib/content/i18n";

const LOCALE: Record<Lang, string> = { id: "id-ID", en: "en-GB" };

function toDate(dateStr: string) {
  // Tengah hari supaya pergeseran zona waktu tidak memindahkan tanggalnya.
  return new Date(dateStr + "T12:00:00");
}

export function tanggalPanjang(dateStr: string, lang: Lang) {
  return toDate(dateStr).toLocaleDateString(LOCALE[lang], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function tanggalPendek(dateStr: string, lang: Lang) {
  return toDate(dateStr).toLocaleDateString(LOCALE[lang], {
    day: "numeric",
    month: "short",
  });
}

export function namaHariPendek(dateStr: string, lang: Lang) {
  return toDate(dateStr).toLocaleDateString(LOCALE[lang], { weekday: "short" });
}

export function tanggalBulan(dateStr: string) {
  return toDate(dateStr).getDate();
}

/** "Hari ini", "Besok", lalu nama hari. */
export function labelRelatif(offset: number, dateStr: string, lang: Lang) {
  if (offset === 0) return lang === "en" ? "Today" : "Hari ini";
  if (offset === 1) return lang === "en" ? "Tomorrow" : "Besok";
  return namaHariPendek(dateStr, lang);
}

/** "31 Desember 2030". Tanpa nama hari: untuk tanggal kedaluwarsa itu hanya derau. */
export function tanggalMedium(dateStr: string, lang: Lang) {
  return toDate(dateStr).toLocaleDateString(LOCALE[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
