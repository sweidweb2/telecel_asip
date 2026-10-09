import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { isCurrentUserStaff } from "@/lib/admin/is-current-user-staff";
import { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export type StaffPageRole = "admin" | "editor" | "staff";

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

const ROLE_CHECKS = {
  admin: isCurrentUserAdmin,
  editor: isCurrentUserEditor,
  staff: isCurrentUserStaff,
} as const;

/**
 * Role-gated page data loader. Prefer the named `gate*PageData` wrappers at
 * call sites; use this when the role is dynamic.
 * Not traced: the page (`loadAdminListPage` / `CmsEditorPage`) records the wait.
 */
export async function gatePageDataByRole<
  TPayload extends Record<string, unknown>,
>(
  role: StaffPageRole,
  load: (supabase: ServerClient) => Promise<TPayload>,
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  if (!(await ROLE_CHECKS[role]())) return { status: "forbidden" };
  const supabase = await createClient();
  const payload = await load(supabase);
  return { status: "ok", ...payload };
}

/**
 * Editor gate for CMS / intake list and detail page data.
 */
export async function gateEditorPageData<
  TPayload extends Record<string, unknown>,
>(
  load: (supabase: ServerClient) => Promise<TPayload>,
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  return gatePageDataByRole("editor", load);
}

/**
 * Staff gate (admin OR editor) for Users list page data shared by both shells.
 */
export async function gateStaffPageData<
  TPayload extends Record<string, unknown>,
>(
  load: (supabase: ServerClient) => Promise<TPayload>,
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  return gatePageDataByRole("staff", load);
}

/**
 * Admin-only gate for backups / performance page data.
 */
export async function gateAdminPageData<
  TPayload extends Record<string, unknown>,
>(
  load: (supabase: ServerClient) => Promise<TPayload>,
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  return gatePageDataByRole("admin", load);
}
