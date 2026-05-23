"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Card, CardContent, Label, Text } from "@/components/ui";
import {
  DEFAULT_SUBJECTS,
  generatePlanSchema,
  type GeneratePlanFormValues,
} from "@/features/student/study-planner/schemas/planner.schema";
import { EXAM_GOALS } from "@/types/study-planner";
import { cn } from "@/lib/utils";

type TaskGeneratorPanelProps = {
  onGenerate: (values: {
    subjects: string[];
    weakTopics: string[];
    hoursPerDay: number;
    examGoal: GeneratePlanFormValues["examGoal"];
  }) => Promise<void>;
  isSubmitting?: boolean;
};

export function TaskGeneratorPanel({
  onGenerate,
  isSubmitting = false,
}: TaskGeneratorPanelProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Mathematics",
    "Physics",
    "Chemistry",
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneratePlanFormValues>({
    resolver: zodResolver(generatePlanSchema),
    defaultValues: {
      weakTopics: "",
      hoursPerDay: 3,
      examGoal: "Board",
    },
  });

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject],
    );
  };

  const onSubmit = handleSubmit(async (values) => {
    const weakTopics = values.weakTopics
      ? values.weakTopics
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];

    await onGenerate({
      subjects: selectedSubjects,
      weakTopics,
      hoursPerDay: values.hoursPerDay,
      examGoal: values.examGoal,
    });
  });

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-secondary/50 via-card to-accent/30">
      <CardContent className="space-y-4 py-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold">
              AI task generation
            </h3>
            <Text variant="muted" className="mt-1 text-sm">
              Build a balanced weekly plan based on your subjects, weak areas,
              and exam goal.
            </Text>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label>Subjects</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_SUBJECTS.map((subject) => {
                const selected = selectedSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
            {selectedSubjects.length === 0 ? (
              <Text variant="caption" className="text-destructive">
                Select at least one subject
              </Text>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hoursPerDay">Hours per day</Label>
              <input
                id="hoursPerDay"
                type="number"
                min={1}
                max={8}
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                {...register("hoursPerDay", { valueAsNumber: true })}
              />
              {errors.hoursPerDay?.message ? (
                <Text variant="caption" className="text-destructive">
                  {errors.hoursPerDay.message}
                </Text>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="examGoal">Exam goal</Label>
              <select
                id="examGoal"
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                {...register("examGoal")}
              >
                {EXAM_GOALS.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weakTopics">Weak topics (comma-separated)</Label>
            <textarea
              id="weakTopics"
              rows={2}
              placeholder="Organic Chemistry, Calculus, Mechanics..."
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
              {...register("weakTopics")}
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={selectedSubjects.length === 0}
            className="w-full sm:w-auto"
          >
            <Sparkles className="size-4" aria-hidden />
            Generate weekly plan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
