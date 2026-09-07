import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
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

/**
 * Shared admin list/detail page gate: create server client, check admin
 * (request-cached) in parallel with the loader.
 */
export async function gateAdminPageData<TPayload extends Record<string, unknown>>(
  load: (supabase: ServerClient) => Promise<TPayload>,
  options?: { name?: string },
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  return traceAsync(
    options?.name ?? "gateAdminPageData",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();
      const [isAdmin, payload] = await Promise.all([
        isCurrentUserAdmin(),
        load(supabase),
      ]);
      if (!isAdmin) return { status: "forbidden" };
      return { status: "ok", ...payload };
    },
  );
}
