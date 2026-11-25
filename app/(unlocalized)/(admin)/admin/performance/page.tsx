import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/** Old Performance tracker URL — feature torn down; keep bookmarks working. */
export default function AdminPerformanceRedirectPage() {
  redirect(ROUTES.admin);
}
