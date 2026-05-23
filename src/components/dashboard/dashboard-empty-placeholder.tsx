import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardEmptyPlaceholderProps = {
  className?: string;
  minHeight?: string;
  message?: string;
};

export function DashboardEmptyPlaceholder({
  className,
  minHeight = "min-h-[7.5rem]",
  message = "No data available yet",
}: DashboardEmptyPlaceholderProps) {
  return (
    <Card
      className={cn(
        "border-dashed border-border bg-muted/50 shadow-none",
        className,
      )}
    >
      <CardContent
        className={cn(
          "flex items-center justify-center py-8",
          minHeight,
        )}
      >
        <p className="text-center text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
