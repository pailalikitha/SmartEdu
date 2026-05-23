"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error";

export type ToastMessage = {
  id: string;
  title: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (options: { title: string; variant?: ToastVariant }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, variant = "success" }: { title: string; variant?: ToastVariant }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, title, variant }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(100%,22rem)] flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
              item.variant === "success"
                ? "border-success/30 bg-card text-foreground"
                : "border-destructive/30 bg-card text-foreground",
            )}
          >
            {item.variant === "success" ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
            ) : (
              <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
            )}
            <p className="flex-1 text-sm font-medium">{item.title}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
