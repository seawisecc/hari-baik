"use client";

import { cn } from "@/lib/cn";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ className, selected = false, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-pill px-3.5 text-[13px] font-medium",
        "transition-[box-shadow,background-color] duration-150",
        "disabled:pointer-events-none disabled:opacity-55",
        selected
          ? "bg-accent text-accent-ink hb-sink-sm"
          : "bg-surface text-ink-soft hb-raise-1 hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
