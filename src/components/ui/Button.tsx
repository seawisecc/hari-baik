"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const button = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none " +
    "transition-[background-color,box-shadow,transform] duration-100 " +
    // Ditekan: turun satu piksel dan bayangannya menghilang. Cukup untuk
    // terasa, tanpa memindahkan teks yang sedang dibaca.
    "active:translate-y-px active:shadow-none " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Tinta gelap di atas warna terang, bukan putih di atas warna pekat.
        // Putih di atas mint hanya mencapai kontras 2,2:1, jauh di bawah
        // ambang yang bisa dibaca; kebalikannya mencapai 7:1.
        primary:
          "bg-accent text-accent-ink border border-accent-deep/20 " +
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_1px_2px_rgb(88_80_70/0.09)] " +
          "hover:bg-accent-strong",
        surface:
          "bg-surface text-ink border border-black/8 " +
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(88_80_70/0.07)] " +
          "hover:bg-surface-sunk",
        ghost: "bg-transparent text-ink-soft hover:bg-surface-sunk hover:text-ink",
        danger:
          "bg-error text-ink border border-black/12 " +
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_1px_2px_rgb(88_80_70/0.09)] " +
          "hover:brightness-97",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-pill",
        md: "h-11 px-6 text-[15px] rounded-pill",
        lg: "h-12 px-8 text-base rounded-pill",
        icon: "h-10 w-10 rounded-pill",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => (
    <button ref={ref} className={cn(button({ variant, size, block }), className)} {...props} />
  ),
);
Button.displayName = "Button";
