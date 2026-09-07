import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { setAdminPerfRoute, traceAsync } from "@/lib/admin/perf";

type ForbiddenResult = { status: "forbidden" };
type OkListResult<TList extends { totalPages: number }> = {
  status: "ok";
  list: TList;
};

/**
 * Shared admin list-page control flow: fetch → forbidden redirect → page clamp.
 * Returns the successful page payload (never resolves when redirecting).
 */
export async function loadAdminListPage<
  TQuery extends { page: number },
  TList extends { totalPages: number },
  TOk extends OkListResult<TList>,
>({
  query,
  fetchPage,
  listPath,
  buildClampParams,
  forbiddenPath = ROUTES.dashboard,
}: {
  query: TQuery;
  fetchPage: (query: TQuery) => Promise<ForbiddenResult | TOk>;
  listPath: string;
  buildClampParams: (query: TQuery, totalPages: number) => URLSearchParams;
  forbiddenPath?: string;
}): Promise<TOk> {
  setAdminPerfRoute(listPath);

  const result = await traceAsync(
    "loadAdminListPage",
    {
      eventType: "page",
      route: listPath,
      meta: { page: query.page },
    },
    () => fetchPage(query),
  );

  if (result.status === "forbidden") {
    redirect(forbiddenPath);
  }

  if (query.page > result.list.totalPages) {
    const params = buildClampParams(query, result.list.totalPages);
    redirect(`${listPath}?${params.toString()}`);
  }

  return result;
}

/**
 * Build URLSearchParams for an over-page redirect.
 * Pass only active filters (omit empty / `"all"` values in the caller).
 */
export function adminListClampParams(
  totalPages: number,
  filters: Record<string, string | undefined>,
): URLSearchParams {
  const params = new URLSearchParams({ page: String(totalPages) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return params;
}
