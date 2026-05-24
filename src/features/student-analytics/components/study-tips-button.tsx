"use client";

import { ChevronDown, Lightbulb } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast";
import { callAnthropic } from "@/lib/ai/anthropic-client";
import { parseJsonStringArray } from "@/lib/ai/parse-json-array";
import { cn } from "@/lib/utils";

type StudyTipsButtonProps = {
  subject: string;
  average: number;
};

export function StudyTipsButton({ subject, average }: StudyTipsButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTips = async () => {
    if (tips.length > 0) {
      setOpen((v) => !v);
      return;
    }

    setOpen(true);
    setLoading(true);
    try {
      const text = await callAnthropic({
        messages: [
          {
            role: "user",
            content: `Student scored ${average}% in ${subject}. Give 3 specific improvement tips. Return JSON array only.`,
          },
        ],
      });
      setTips(parseJsonStringArray(text).slice(0, 3));
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Could not load tips.",
        variant: "error",
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void loadTips()}
        disabled={loading}
      >
        <Lightbulb className="size-4" aria-hidden />
        Get Study Tips
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </Button>
      {open ? (
        <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
          {loading ? (
            <LoadingSpinner label="Loading tips" />
          ) : (
            <ol className="list-decimal space-y-1 pl-4">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ol>
          )}
        </div>
      ) : null}
    </div>
  );
}
