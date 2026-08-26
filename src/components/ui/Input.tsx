"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

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

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block text-sm font-medium text-ink-soft", className)} {...props} />
  );
}
