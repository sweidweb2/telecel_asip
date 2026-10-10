import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  DASHBOARD_NAV_COUNTS_CACHE_TAG,
  mapDashboardNavCounts,
  type DashboardNavCounts,
} from "@/constants/dashboard-nav-counts";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { createAccessTokenClient } from "@/lib/supabase/editor-access-client";
import { createClient } from "@/lib/supabase/server";

export type { DashboardNavCounts } from "@/constants/dashboard-nav-counts";

/** Cross-request TTL. CMS and intake writes bust the tag sooner. */
const NAV_COUNTS_REVALIDATE_SECONDS = 60;

/**
 * Missing RPC or a non-editor token. Thrown so `unstable_cache` does not
 * store an empty badge map for the TTL.
 */
class NavCountSoftError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NavCountSoftError";
  }
}

function isSoftNavCountCode(code: string | undefined): boolean {
  return code === "PGRST202" || code === "42501";
}

/**
 * Cookie-free editor RPC. The access token stays in the closure so it is not
 * part of the cache key. Every editor sees the same RLS result, so one shared
 * entry is correct.
 */
async function fetchDashboardNavCounts(
  accessToken: string,
): Promise<DashboardNavCounts> {
  const supabase = createAccessTokenClient(accessToken);
  const { data, error } = await supabase.rpc("get_dashboard_nav_counts");
  if (error) {
    if (isSoftNavCountCode(error.code)) {
      throw new NavCountSoftError(error.message);
    }
    throw new Error(error.message);
  }

  return mapDashboardNavCounts(data);
}

function readCachedDashboardNavCounts(
  accessToken: string,
): Promise<DashboardNavCounts> {
  return unstable_cache(
    () => fetchDashboardNavCounts(accessToken),
    ["dashboard-nav-counts"],
    {
      tags: [DASHBOARD_NAV_COUNTS_CACHE_TAG],
      revalidate: NAV_COUNTS_REVALIDATE_SECONDS,
    },
  )();
}

/**
 * Editor sidebar badges — one `get_dashboard_nav_counts` RPC.
 * Request-memoized, then cached across requests on `dashboard-nav-counts`.
 * Failed/unauthorized reads return `{}` so chrome still renders.
 */
export const getDashboardNavCounts = cache(async (): Promise<DashboardNavCounts> => {
    if (!(await isCurrentUserEditor())) return {};

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) return {};

    try {
      return await readCachedDashboardNavCounts(accessToken);
    } catch (error) {
      if (error instanceof NavCountSoftError) return {};
      throw error;
    }
  });
