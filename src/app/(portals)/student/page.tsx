import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export default function StudentRootPage() {
  redirect(ROUTES.student.dashboard);
}
