import { env } from "@/config/env";

export const siteConfig = {
  name: "SmartEdu AI",
  description:
    "AI-powered academic intelligence for students, teachers, and school administrators.",
  url: env.appUrl,
} as const;
