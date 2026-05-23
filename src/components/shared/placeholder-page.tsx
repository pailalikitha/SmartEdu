import { Construction } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { PageMeta } from "@/types";

type PlaceholderPageProps = PageMeta & {
  moduleLabel: string;
};

export function PlaceholderPage({
  title,
  description,
  moduleLabel,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card accent="blue">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="size-5 text-brand-blue" aria-hidden />
            Module in progress
          </CardTitle>
          <CardDescription>
            The {moduleLabel} module will be built in the next development phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">
            Foundation architecture is ready. Feature implementation follows the
            module-by-module plan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
