"use client";

import { Check, Copy, Printer } from "lucide-react";
import { useState } from "react";

import { Button, Text } from "@/components/ui";
import { Modal } from "@/components/ui/modal";

export type AccountCredentials = {
  studentName: string;
  studentEmail: string;
  studentPassword: string;
  parentName?: string;
  parentEmail?: string | null;
  parentPassword?: string | null;
  parentReused?: boolean;
  emailWarnings?: string[];
};

type CredentialsSuccessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: AccountCredentials | null;
};

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

export function CredentialsSuccessModal({
  open,
  onOpenChange,
  credentials,
}: CredentialsSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!credentials) return null;

  const lines = [
    `Student: ${credentials.studentName}`,
    `Email: ${credentials.studentEmail}`,
    `Password: ${credentials.studentPassword}`,
  ];
  if (credentials.parentEmail && credentials.parentPassword) {
    lines.push(
      "",
      `Parent: ${credentials.parentName ?? "Parent"}`,
      `Email: ${credentials.parentEmail}`,
      `Password: ${credentials.parentPassword}`,
    );
  }

  const allText = lines.join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(allText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<pre>${allText.replace(/</g, "&lt;")}</pre>`);
    win.print();
    win.close();
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Accounts created"
      description="Share these credentials securely. Welcome emails were sent when email is configured."
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="size-4" aria-hidden />
            Print
          </Button>
          <Button type="button" size="sm" onClick={() => void handleCopy()}>
            {copied ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            {copied ? "Copied" : "Copy all"}
          </Button>
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="font-medium">Student account</p>
          <p className="mt-2 text-muted-foreground">Email: {credentials.studentEmail}</p>
          <p className="font-mono text-foreground">{credentials.studentPassword}</p>
        </div>

        {credentials.parentEmail && credentials.parentPassword ? (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="font-medium">
              Parent account
              {credentials.parentReused ? " (existing account linked)" : ""}
            </p>
            <p className="mt-2 text-muted-foreground">Email: {credentials.parentEmail}</p>
            <p className="font-mono text-foreground">{credentials.parentPassword}</p>
          </div>
        ) : (
          <Text variant="muted" className="text-sm">
            No parent account created (parent email was not provided).
          </Text>
        )}

        {credentials.emailWarnings?.length ? (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-warning">
            {credentials.emailWarnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
