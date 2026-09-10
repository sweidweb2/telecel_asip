import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/** Bookmark redirect: backup moved to the Admin panel. */
export default function DashboardBackupRedirect() {
  redirect(ROUTES.adminBackup);
}
