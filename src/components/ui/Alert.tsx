import { AlertCircle, CheckCircle2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "success" | "warning" | "error";

// Warna dindingnya ikut warna peringatannya; dinding netral pada permukaan
// berwarna membuat sisinya terlihat kotor, bukan seperti bahan yang sama.
const TONE: Record<Tone, { bg: string; icon: typeof CheckCircle2 }> = {
  success: { bg: "wall-guru bg-success/30 text-ink", icon: CheckCircle2 },
  warning: { bg: "wall-lara bg-warning/35 text-ink", icon: TriangleAlert },
  error: { bg: "wall-error bg-error/30 text-ink", icon: AlertCircle },
};

export function Alert({
  tone = "success",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const { bg, icon: Icon } = TONE[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-center gap-3 rounded-pill px-5 py-3 text-sm hb-raise-1",
        bg,
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}
