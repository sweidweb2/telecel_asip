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
 * Shared admin list/detail page gate: create server client, require `is_admin`,
 * then run the loader. Returns `{ status: "forbidden" }` or `{ status: "ok", ... }`.
 */
export async function gateAdminPageData<TPayload extends Record<string, unknown>>(
  load: (supabase: ServerClient) => Promise<TPayload>,
): Promise<{ status: "forbidden" } | ({ status: "ok" } & TPayload)> {
  const supabase = await createClient();
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) throw error;
  if (!isAdmin) return { status: "forbidden" };

  const payload = await load(supabase);
  return { status: "ok", ...payload };
}
