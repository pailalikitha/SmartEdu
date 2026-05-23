import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  className?: string;
  barClassName?: string;
  max?: number;
};

export function ProgressBar({
  value,
  className,
  barClassName,
  max = 100,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
