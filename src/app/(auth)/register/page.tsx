import type { Metadata } from "next";
import { Suspense } from "react";

import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Register",
};

function RegisterFallback() {
  return (
    <div className="flex justify-center py-12">
      <div
        className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
