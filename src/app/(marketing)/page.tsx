import Link from "next/link";
import { GraduationCap, LineChart, Sparkles } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Text,
} from "@/components/ui";
import { ROUTES } from "@/constants/routes";

const highlights = [
  {
    icon: GraduationCap,
    title: "Student intelligence",
    description:
      "Weakness detection, study plans, and competitive exam readiness in one place.",
  },
  {
    icon: LineChart,
    title: "Teacher insights",
    description:
      "Class analytics, AI lesson assistance, and workload optimization.",
  },
  {
    icon: Sparkles,
    title: "School-wide view",
    description:
      "Principals monitor performance, interventions, and school KPIs.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:py-24">
      <section className="mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-full bg-brand-yellow/80 px-3 py-1 text-xs font-medium text-foreground sm:text-sm">
          AI-powered academic platform
        </span>
        <Heading level="h1" className="mt-4 text-3xl sm:text-4xl md:text-5xl">
          Smarter learning for every student
        </Heading>
        <Text variant="lead" className="mt-4 text-base sm:text-lg">
          SmartEdu AI turns academic data into actionable intelligence for
          students, teachers, and school leaders across India.
        </Text>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link href={ROUTES.register} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Get started
            </Button>
          </Link>
          <Link href={ROUTES.login} className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:mt-20 lg:grid-cols-3">
        {highlights.map(({ icon: Icon, title, description }) => (
          <Card key={title} accent="blue">
            <CardHeader>
              <Icon className="mb-2 size-8 text-brand-blue" aria-hidden />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-brand-blue-pastel/40 p-6 text-center sm:mt-16 sm:p-8 md:p-10">
        <Heading level="h3" as="h2" className="text-xl sm:text-2xl">
          Built module by module
        </Heading>
        <Text variant="muted" className="mt-2">
          Foundation is ready. Student, teacher, and admin portals ship in
          focused phases.
        </Text>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link href={ROUTES.student.root} className="w-full sm:w-auto">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              Student portal
            </Button>
          </Link>
          <Link href={ROUTES.teacher.root} className="w-full sm:w-auto">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              Teacher portal
            </Button>
          </Link>
          <Link href={ROUTES.admin.root} className="w-full sm:w-auto">
            <Button variant="accent" size="sm" className="w-full sm:w-auto">
              Admin portal
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
