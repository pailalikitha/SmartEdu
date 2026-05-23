"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Bot, Sparkles, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useTeacherClassesSnapshot } from "@/features/teacher/hooks/use-teacher-classes-snapshot";
import { useTeacherRosterSnapshot } from "@/features/teacher/hooks/use-teacher-roster-snapshot";
import { computeTeacherAnalytics } from "@/features/teacher/utils/teacher-analytics";
import { useAuth } from "@/hooks/use-auth";
import { callAnthropic, type AnthropicMessage } from "@/lib/ai/anthropic-client";
import { formatPercentage } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "Who are my at-risk students?",
  "Suggest activities for weak Math students",
  "How can I improve class attendance?",
  "Create a lesson plan for next week",
  "Write a parent communication about poor performance",
  "What teaching strategy works for low scorers?",
];

const WELCOME_PROMPTS = QUICK_PROMPTS.slice(0, 3);

function renderInline(text: string) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i}>{part.slice(2, -2)}</strong>
      );
    }
    return part;
  });
}

function formatMessage(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={`br-${i}`} />;
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      return (
        <li key={i} className="ml-4 list-disc">
          {renderInline(trimmed.replace(/^[-•]\s/, ""))}
        </li>
      );
    }
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <li key={i} className="ml-4 list-decimal">
          {renderInline(trimmed.replace(/^\d+\.\s/, ""))}
        </li>
      );
    }
    return (
      <p key={i} className="mb-1">
        {renderInline(trimmed)}
      </p>
    );
  });
}

export function TeacherAssistantPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const teacherId = user?.id;
  const teacherName = user?.displayName ?? user?.email ?? "Teacher";

  const { classes } = useTeacherClassesSnapshot(teacherId);
  const classIds = useMemo(() => classes.map((c) => c.id), [classes]);
  const roster = useTeacherRosterSnapshot(classIds);

  const analytics = useMemo(
    () =>
      computeTeacherAnalytics(
        classes,
        roster.students,
        roster.marksByStudent,
        roster.attendanceByStudent,
      ),
    [classes, roster.students, roster.marksByStudent, roster.attendanceByStudent],
  );

  const classData = useMemo(
    () =>
      classes.map((c) => ({
        name: c.name,
        section: c.section,
        subject: c.subject,
        students: roster.students.filter((s) => s.classId === c.id).length,
      })),
    [classes, roster.students],
  );

  const [chatHistory, setChatHistory] = useState<AnthropicMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const sendMessage = async (userMessage: string) => {
    const trimmed = userMessage.trim();
    if (!trimmed || isLoading) return;

    const newHistory: AnthropicMessage[] = [
      ...chatHistory,
      { role: "user", content: trimmed },
    ];
    setChatHistory(newHistory);
    setInput("");
    setIsLoading(true);

    const systemPrompt = `You are an AI teaching assistant for SmartEdu. You help teachers analyze performance, suggest strategies, and support students.

TEACHER CONTEXT (use this to give specific answers):
Teacher name: ${teacherName}
Classes: ${JSON.stringify(classData)}
Total students: ${analytics.totalStudents}
Class average: ${analytics.classAverage ?? "N/A"}%
At-risk students: ${analytics.atRisk.length}
Subject averages: ${JSON.stringify(analytics.subjectAverages.map((s) => ({ subject: s.subject, average: s.average })))}

Give specific, actionable advice based on this real data.
Be concise but thorough. Use bullet points for lists.`;

    try {
      const aiMessage = await callAnthropic({
        system: systemPrompt,
        messages: newHistory,
      });
      setChatHistory([
        ...newHistory,
        { role: "assistant", content: aiMessage },
      ]);
    } catch (err) {
      toast({
        title:
          err instanceof Error ? err.message : "AI request failed.",
        variant: "error",
      });
      setChatHistory(newHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChip = (text: string) => {
    setInput(text);
    void sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const charCount = input.length;
  const nearLimit = charCount > 1800;

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-[480px] flex-col rounded-xl border border-border bg-card shadow-sm">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-violet-600" />
          <h1 className="font-heading text-lg font-semibold">
            AI Teaching Assistant
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setChatHistory([])}
          disabled={chatHistory.length === 0 && !isLoading}
        >
          Clear Chat
        </Button>
      </header>

      <div className="shrink-0 bg-muted/60 px-4 py-2 text-xs text-muted-foreground">
        Context loaded: {classes.length} classes, {analytics.totalStudents}{" "}
        students
        {analytics.classAverage !== null
          ? `, avg ${formatPercentage(analytics.classAverage)}`
          : ""}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {chatHistory.length === 0 && !isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Bot className="size-8" />
            </div>
            <div className="max-w-md space-y-2">
              <p className="font-heading text-lg font-semibold">
                Hi {teacherName}! I&apos;m your AI teaching assistant.
              </p>
              <p className="text-sm text-muted-foreground">
                I have context about your {classes.length} classes and{" "}
                {analytics.totalStudents} students. Ask me anything about your
                students or teaching strategies.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {WELCOME_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleChip(prompt)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <Bot className="size-4" />
                  </div>
                ) : null}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/80 text-foreground",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose-sm">{formatMessage(msg.content)}</div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p
                    className={cn(
                      "mt-1 text-[10px] opacity-70",
                      msg.role === "user"
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {msg.role === "user" ? (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <User className="size-4" />
                  </div>
                ) : null}
              </div>
            ))}
            {isLoading ? (
              <div className="flex gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-violet-100">
                  <Bot className="size-4 text-violet-700" />
                </div>
                <div className="rounded-2xl bg-muted/80 px-4 py-3">
                  <span className="inline-flex gap-1">
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isLoading}
              onClick={() => handleChip(prompt)}
              className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs whitespace-nowrap hover:bg-muted disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            disabled={isLoading}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your students or teaching…"
            className="max-h-24 min-h-9 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          />
          <Button
            size="icon"
            disabled={isLoading || !input.trim()}
            onClick={() => void sendMessage(input)}
            aria-label="Send message"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
        {nearLimit ? (
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {charCount} / 2000
          </p>
        ) : null}
      </div>
    </div>
  );
}
