"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, FormField, Heading, Text } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { completeTeacherOnboarding } from "@/services/onboarding.service";
import { useAuth } from "@/hooks/use-auth";

const STEPS = ["profile", "class", "code", "done"] as const;

export function TeacherSetupWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<(typeof STEPS)[number]>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [classCode, setClassCode] = useState("");

  const [name, setName] = useState(user?.displayName ?? "");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [grade, setGrade] = useState("");

  const handleFinishClass = async () => {
    if (!user?.id || !user.email) return;
    if (!className.trim() || !section.trim() || !grade.trim()) {
      toast({ variant: "error", title: "Fill in all class fields." });
      return;
    }

    setIsSaving(true);
    try {
      const result = await completeTeacherOnboarding({
        uid: user.id,
        email: user.email,
        name: name.trim(),
        subject: subject.trim(),
        phone: phone.trim(),
        className: className.trim(),
        section: section.trim(),
        grade: grade.trim(),
      });
      setClassCode(result.classCode);
      setStep("code");
    } catch (err) {
      toast({
        variant: "error",
        title: err instanceof Error ? err.message : "Setup failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <Heading level="h2" as="h1">
          Welcome, teacher
        </Heading>
        <Text variant="muted" as="p" className="mt-1">
          Step {STEPS.indexOf(step) + 1} of {STEPS.length}
        </Text>
      </div>

      {step === "profile" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <Heading level="h3" as="h2" className="text-lg">
            Set up profile
          </Heading>
          <FormField label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <FormField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <FormField label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              if (!name.trim() || !subject.trim()) {
                toast({ variant: "error", title: "Name and subject are required." });
                return;
              }
              setStep("class");
            }}
          >
            Continue
          </Button>
        </div>
      ) : null}

      {step === "class" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <Heading level="h3" as="h2" className="text-lg">
            Create first class
          </Heading>
          <FormField label="Class name" value={className} onChange={(e) => setClassName(e.target.value)} />
          <FormField label="Section" value={section} onChange={(e) => setSection(e.target.value)} />
          <FormField label="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} />
          <Button
            type="button"
            className="w-full"
            isLoading={isSaving}
            onClick={() => void handleFinishClass()}
          >
            Generate class code
          </Button>
        </div>
      ) : null}

      {step === "code" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-center">
          <Heading level="h3" as="h2" className="text-lg">
            Your class code
          </Heading>
          <p className="font-mono text-3xl font-bold tracking-widest text-primary">
            {classCode}
          </p>
          <Text variant="muted" as="p">
            Share this 6-character code with students so they can join your class.
          </Text>
          <Button type="button" className="w-full" onClick={() => setStep("done")}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-center">
          <Heading level="h3" as="h2" className="text-lg">
            You&apos;re ready!
          </Heading>
          <Text variant="muted" as="p">
            Your profile and first class are set up.
          </Text>
          <Button
            type="button"
            className="w-full"
            onClick={() => router.replace(ROUTES.teacher.dashboard)}
          >
            Go to dashboard
          </Button>
        </div>
      ) : null}
    </div>
  );
}
