import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { isCurrentUserStaff } from "@/lib/admin/is-current-user-staff";
import { traceAsync } from "@/lib/admin/perf";
import { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** Inclusive PostgREST `.range()` bounds for a 1-based page. */
export function adminListRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

/** Always at least 1 so list UIs never clamp to page 0. */
export function adminListTotalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

type AccessCheck = () => Promise<boolean>;

async function gatePageData<TPayload extends Record<string, unknown>>(
  canAccess: AccessCheck,
  load: (supabase: ServerClient) => Promise<TPayload>,
  options?: { name?: string },
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  return traceAsync(
    options?.name ?? "gatePageData",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();
      const [allowed, payload] = await Promise.all([
        canAccess(),
        load(supabase),
      ]);
      if (!allowed) return { status: "forbidden" };
      return { status: "ok", ...payload };
    },
  );
}

/**
 * Editor gate for CMS / intake list and detail page data.
 */
export async function gateEditorPageData<
  TPayload extends Record<string, unknown>,
>(
  load: (supabase: ServerClient) => Promise<TPayload>,
  options?: { name?: string },
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  return gatePageData(isCurrentUserEditor, load, {
    name: options?.name ?? "gateEditorPageData",
  });
}

/**
 * Staff gate (admin OR editor) for Users list page data shared by both shells.
 */
export async function gateStaffPageData<
  TPayload extends Record<string, unknown>,
>(
  load: (supabase: ServerClient) => Promise<TPayload>,
  options?: { name?: string },
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  return gatePageData(isCurrentUserStaff, load, {
    name: options?.name ?? "gateStaffPageData",
  });
}

/**
 * Admin-only gate for backups / performance page data.
 */
export async function gateAdminPageData<
  TPayload extends Record<string, unknown>,
>(
  load: (supabase: ServerClient) => Promise<TPayload>,
  options?: { name?: string },
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  return gatePageData(isCurrentUserAdmin, load, {
    name: options?.name ?? "gateAdminPageData",
  });
}
