import { cn } from "@/lib/utils";

export type BarChartItem = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarChartItem[];
  maxValue?: number;
  className?: string;
  valueSuffix?: string;
};

export function BarChart({
  data,
  maxValue,
  className,
  valueSuffix = "%",
}: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5">
      <div
        className={cn(
          "flex h-40 min-w-[min(100%,280px)] items-end justify-between gap-1 px-0.5 sm:h-48 sm:min-w-0 sm:gap-2 md:gap-3",
          data.length > 8 && "min-w-[32rem]",
          className,
        )}
        role="img"
        aria-label="Bar chart"
      >
        {data.map((item, index) => {
          const height = Math.max(8, Math.round((item.value / max) * 100));
          const displayValue = `${item.value}${valueSuffix}`;

          return (
            <div
              key={item.label}
              className="group flex min-w-[2rem] flex-1 flex-col items-center gap-1 sm:min-w-0 sm:gap-2"
            >
              <span className="text-[0.65rem] font-semibold text-primary sm:text-xs">
                {displayValue}
              </span>
              <div className="flex h-28 w-full items-end justify-center sm:h-36 md:h-40">
                <div
                  className={cn(
                    "w-full max-w-10 rounded-t-lg bg-gradient-to-t from-primary to-primary/60 shadow-sm transition-all",
                    index % 2 === 0 ? "opacity-95" : "opacity-85",
                  )}
                  style={{ height: `${height}%` }}
                  title={`${item.label}: ${displayValue}`}
                />
              </div>
              <span className="w-full truncate text-center text-[0.65rem] font-medium text-muted-foreground sm:text-xs">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
