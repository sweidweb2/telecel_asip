"use server";

import { revalidatePath } from "next/cache";
import { subDays } from "date-fns";

import { ROUTES } from "@/constants/routes";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import type { AdminActionResult } from "@/types/admin-action";

const MESSAGES = {
  signedInRequired: "Sign in to continue.",
  unauthorized: "You do not have permission to manage performance events.",
  success: "Old performance events deleted.",
  genericError: "Could not delete performance events. Try again.",
};

/**
 * Delete admin_perf_events older than 7 days. Never traced (no recursion).
 */
export async function deleteOldAdminPerfEvents(): Promise<AdminActionResult> {
  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const cutoff = subDays(new Date(), 7).toISOString();
  const { error } = await session.supabase
    .from("admin_perf_events")
    .delete()
    .lt("created_at", cutoff);

  if (error) {
    return { status: "error", message: MESSAGES.genericError };
  }

  revalidatePath(ROUTES.performance);
  return { status: "success", message: MESSAGES.success };
}
