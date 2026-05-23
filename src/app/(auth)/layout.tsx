import { AuthShell, GuestGuard } from "@/components/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthShell>
      <GuestGuard>{children}</GuestGuard>
    </AuthShell>
  );
}
