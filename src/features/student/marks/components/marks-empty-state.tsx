import { GraduationCap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function MarksEmptyState() {
  return (
    <Card className="border-dashed border-border bg-muted/40 shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div
          className="flex size-20 items-center justify-center rounded-2xl bg-secondary/80 text-primary"
          aria-hidden
        >
          <GraduationCap className="size-10" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            No marks yet
          </h2>
          <p className="text-sm text-muted-foreground">
            Your marks will appear here once your teacher uploads your results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
