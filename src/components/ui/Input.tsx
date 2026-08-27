"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/content/LangProvider";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full min-w-0 max-w-full rounded-pill bg-surface-sunk px-5 text-[15px] text-ink hb-sink",
        "placeholder:text-ink-faint",
        "transition-shadow duration-150 focus:hb-ring",
        "disabled:opacity-55",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

/**
 * Isian kata sandi dengan tombol mata untuk menampilkan isinya.
 *
 * Mengetik kata sandi di ponsel tanpa bisa melihatnya adalah sumber kesalahan
 * masuk yang paling sering, dan orang menyerah setelah dua kali gagal padahal
 * sandinya benar, hanya salah satu huruf. Karena itu tombolnya ada di sini,
 * bukan menjadi hiasan opsional yang mungkin lupa dipasang di satu halaman.
 *
 * Bawaannya tetap tersembunyi: yang melihat layar bisa saja bukan pemiliknya.
 * Tombolnya `type="button"` supaya menekan Enter di isian ini tetap mengirim
 * formulir, bukan menyalakan mata.
 */
export function InputSandi({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const t = useT();
  const [terlihat, setTerlihat] = useState(false);
  const Ikon = terlihat ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        {...props}
        type={terlihat ? "text" : "password"}
        // Ruang untuk tombolnya, supaya sandi panjang tidak menyelinap di
        // bawah ikon dan terlihat terpotong.
        className={cn("pr-14", className)}
      />
      <button
        type="button"
        onClick={() => setTerlihat((v) => !v)}
        aria-label={t(terlihat ? "auth.hidePassword" : "auth.showPassword")}
        title={t(terlihat ? "auth.hidePassword" : "auth.showPassword")}
        className={cn(
          "absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center",
          "rounded-pill text-ink-faint transition-colors hover:text-ink",
          "focus-visible:hb-ring focus-visible:outline-none",
        )}
      >
        <Ikon className="h-4.5 w-4.5" aria-hidden />
      </button>
    </div>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block text-sm font-medium text-ink-soft", className)} {...props} />
  );
}
