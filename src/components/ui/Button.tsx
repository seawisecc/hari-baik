"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const button = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none " +
    "transition-[box-shadow,transform,background-color] duration-150 " +
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        // Aksi utama: pil aksen yang timbul, menekan saat aktif.
        primary:
          "bg-accent text-accent-ink hb-raise-2 hover:bg-accent-strong active:hb-sink-sm",
        // Aksi sekunder: permukaan netral timbul.
        surface: "bg-surface text-ink hb-raise-1 hover:bg-surface-sunk active:hb-sink-sm",
        // Tanpa elevasi: untuk aksi tersier di dalam kartu.
        ghost: "bg-transparent text-ink-soft hover:bg-surface-sunk hover:text-ink",
        danger: "bg-error/85 text-white hb-raise-1 hover:bg-error active:hb-sink-sm",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-pill",
        md: "h-11 px-6 text-[15px] rounded-pill",
        lg: "h-13 px-8 text-base rounded-pill",
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
