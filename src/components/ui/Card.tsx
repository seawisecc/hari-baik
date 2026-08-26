import { cn } from "@/lib/cn";

type Elevation = 1 | 2 | 3 | 4;

const RAISE: Record<Elevation, string> = {
  1: "hb-raise-1",
  2: "hb-raise-2",
  3: "hb-raise-3",
  4: "hb-raise-4",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
  /** Permukaan tertekan, untuk area sekunder di dalam kartu lain. */
  sunken?: boolean;
}

export function Card({ className, elevation = 2, sunken = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg",
        sunken ? "bg-surface-sunk hb-sink" : `wall-surface bg-surface ${RAISE[elevation]}`,
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-6 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-heading text-lg font-semibold text-ink", className)} {...props} />
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}
