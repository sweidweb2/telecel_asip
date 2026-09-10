import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/** Bookmark redirect: performance moved to the Admin panel. */
export default function DashboardPerformanceRedirect() {
  redirect(ROUTES.adminPerformance);
}
