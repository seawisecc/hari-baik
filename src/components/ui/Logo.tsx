import Image from "next/image";
import logo from "@/assets/logo.svg";
import { cn } from "@/lib/cn";

/**
 * Lambang Hari Baik: cincin empat busur, satu per fase siklus.
 *
 * Dirender lewat next/image dari berkas SVG yang sama dengan favicon dan
 * gambar pratinjau, jadi ketiganya tidak mungkin berbeda.
 */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return <Image src={logo} alt="" width={size} height={size} className={className} priority />;
}

/** Lambang berdampingan dengan wordmark. */
export function Wordmark({
  size = 32,
  className,
  textClassName,
}: {
  size?: number;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2.5", className)}>
      <Logo size={size} />
      <span
        className={cn(
          "whitespace-nowrap font-heading text-xl font-bold italic leading-none text-ink",
          textClassName,
        )}
      >
        Hari Baik
      </span>
    </span>
  );
}
