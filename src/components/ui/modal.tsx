"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
} as const;

export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  size = "md",
  className,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger>{trigger}</DialogTrigger> : null}
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          "gap-0 overflow-hidden p-0 ring-foreground/5",
          sizeClasses[size],
          className,
        )}
      >
        <DialogHeader className="border-b border-border/60 bg-muted/30 px-5 py-4">
          <DialogTitle className="font-heading text-lg">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <DialogFooter className="border-t border-border/60 bg-muted/20 px-5 py-4">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type ConfirmModalProps = Omit<ModalProps, "footer" | "children"> & {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
  variant?: "default" | "destructive";
};

export function ConfirmModal({
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  variant = "default",
  onOpenChange,
  ...props
}: ConfirmModalProps) {
  return (
    <Modal
      {...props}
      onOpenChange={onOpenChange}
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onCancel?.();
              onOpenChange?.(false);
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            disabled={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {props.description ? (
        <p className="text-sm text-muted-foreground">{props.description}</p>
      ) : null}
    </Modal>
  );
}
