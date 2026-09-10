import { cache } from "react";

import {
  mapDashboardNavCounts,
  type DashboardNavCounts,
} from "@/constants/dashboard-nav-counts";
import { wrapCached } from "@/lib/admin/perf";
import { createClient } from "@/lib/supabase/server";

export type { DashboardNavCounts } from "@/constants/dashboard-nav-counts";

/**
 * Editor sidebar badges — one `get_dashboard_nav_counts` RPC.
 * Request-memoized so layout + streamed badges share a single call.
 * Failed/unauthorized reads return `{}` so chrome still renders.
 */
export const getDashboardNavCounts = wrapCached(
  "getDashboardNavCounts",
  { eventType: "layout" },
  cache(async (): Promise<DashboardNavCounts> => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_dashboard_nav_counts");

    if (error) {
      if (error.code === "PGRST202" || error.code === "42501") return {};
      throw error;
    }

    return mapDashboardNavCounts(data);
  }),
);
