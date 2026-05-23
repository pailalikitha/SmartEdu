"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, FormField, Heading, Text } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import {
  completeStudentOnboarding,
  findClassByCode,
} from "@/services/onboarding.service";
import { useAuth } from "@/hooks/use-auth";
import type { ClassRoom } from "@/types/class";

const STEPS = ["code", "profile", "join", "done"] as const;

export function StudentSetupWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<(typeof STEPS)[number]>("code");
  const [isSaving, setIsSaving] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [matchedClass, setMatchedClass] = useState<ClassRoom | null>(null);

  const [name, setName] = useState(user?.displayName ?? "");
  const [rollNumber, setRollNumber] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const validateCode = async () => {
    const code = classCode.trim().toUpperCase();
    if (code.length < 4) {
      toast({ variant: "error", title: "Enter a valid 6-digit class code." });
      return;
    }

    setIsSaving(true);
    try {
      const found = await findClassByCode(code);
      if (!found) {
        toast({ variant: "error", title: "Class code not found. Check with your teacher." });
        return;
      }
      setMatchedClass(found);
      setStep("profile");
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Could not validate code.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const joinClass = async () => {
    if (!user?.id || !user.email || !matchedClass) return;
    if (!name.trim() || !rollNumber.trim() || !parentEmail.trim()) {
      toast({ variant: "error", title: "Fill in all required fields." });
      return;
    }

    setIsSaving(true);
    try {
      await completeStudentOnboarding({
        uid: user.id,
        email: user.email,
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        parentEmail: parentEmail.trim(),
        parentPhone: parentPhone.trim() || undefined,
        classId: matchedClass.id,
        grade: matchedClass.grade ?? matchedClass.name,
        section: matchedClass.section ?? "",
      });
      setStep("done");
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Could not join class.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <Heading level="h2" as="h1">
          Welcome, student
        </Heading>
        <Text variant="muted" as="p" className="mt-1">
          Step {STEPS.indexOf(step) + 1} of {STEPS.length}
        </Text>
      </div>

      {step === "code" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <Heading level="h3" as="h2" className="text-lg">
            Enter class code
          </Heading>
          <FormField
            label="Class code"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={8}
            className="font-mono uppercase tracking-widest"
          />
          <Button
            type="button"
            className="w-full"
            isLoading={isSaving}
            onClick={() => void validateCode()}
          >
            Validate code
          </Button>
        </div>
      ) : null}

      {step === "profile" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <Heading level="h3" as="h2" className="text-lg">
            Your profile
          </Heading>
          {matchedClass ? (
            <Text variant="muted" as="p">
              Joining: {matchedClass.name}
              {matchedClass.section ? ` · Section ${matchedClass.section}` : ""}
            </Text>
          ) : null}
          <FormField label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <FormField label="Roll number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
          <FormField
            label="Parent email"
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
          />
          <FormField
            label="Parent phone (optional)"
            type="tel"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
          />
          <Button type="button" className="w-full" onClick={() => setStep("join")}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === "join" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-center">
          <Heading level="h3" as="h2" className="text-lg">
            Join class
          </Heading>
          <Text variant="muted" as="p">
            You will be enrolled in {matchedClass?.name ?? "your class"}.
          </Text>
          <Button
            type="button"
            className="w-full"
            isLoading={isSaving}
            onClick={() => void joinClass()}
          >
            Join class
          </Button>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-center">
          <Heading level="h3" as="h2" className="text-lg">
            You&apos;re all set!
          </Heading>
          <Button
            type="button"
            className="w-full"
            onClick={() => router.replace(ROUTES.student.dashboard)}
          >
            Go to dashboard
          </Button>
        </div>
      ) : null}
    </div>
  );
}
