import {
  checkStaffRole,
  type StaffRoleGate,
} from "@/lib/admin/current-user-role";
import { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export type StaffPageRole = StaffRoleGate;

/** Inclusive PostgREST `.range()` bounds for a 1-based page. */
export function adminListRange(page: number, pageSize: number) {
  // Intentional OFFSET pagination: CMS pages are 10–25 rows and not deep-paged.
  // Switch to cursor keys only if a list is routinely walked far past early pages.
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

/** Always at least 1 so list UIs never clamp to page 0. */
export function adminListTotalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Role-gated page data loader.
 * Not traced: the page (`loadAdminListPage` / `CmsEditorPage`) records the wait.
 */
export async function gatePageDataByRole<
  TPayload extends Record<string, unknown>,
>(
  role: StaffPageRole,
  load: (supabase: ServerClient) => Promise<TPayload>,
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  if (!(await checkStaffRole(role))) return { status: "forbidden" };
  const supabase = await createClient();
  const payload = await load(supabase);
  return { status: "ok", ...payload };
}
