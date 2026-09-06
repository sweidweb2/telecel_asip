import { cache } from "react";

import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type PublicTable = keyof Database["public"]["Tables"];

/** Route → table for sidebar record badges. Non-entity nav items are omitted. */
const NAV_COUNT_TABLES = [
  { href: ROUTES.registrations, table: "interest_registrations" },
  { href: ROUTES.applications, table: "applications" },
  { href: ROUTES.contactUs, table: "contact_messages" },
  { href: ROUTES.blogs, table: "blogs" },
  { href: ROUTES.portfolio, table: "startups" },
  { href: ROUTES.partners, table: "partners" },
  { href: ROUTES.founderStories, table: "founder_stories" },
  { href: ROUTES.cohorts, table: "cohorts" },
  { href: ROUTES.events, table: "events" },
  { href: ROUTES.evidence, table: "evidence_records" },
  { href: ROUTES.impactMetrics, table: "impact_metrics" },
  { href: ROUTES.users, table: "profiles" },
] as const satisfies ReadonlyArray<{ href: string; table: PublicTable }>;

export type DashboardNavCounts = Partial<Record<string, number>>;

/**
 * Exact head counts for sidebar entity badges.
 * Request-memoized; failed tables are omitted (no badge) so chrome stays up.
 */
export const getDashboardNavCounts = cache(
  async (): Promise<DashboardNavCounts> => {
    const supabase = await createClient();

    const entries = await Promise.all(
      NAV_COUNT_TABLES.map(async ({ href, table }) => {
        const result = await supabase
          .from(table)
          .select("id", { count: "exact", head: true });

        if (result.error) return [href, null] as const;
        return [href, result.count ?? 0] as const;
      }),
    );

    const counts: DashboardNavCounts = {};
    for (const [href, count] of entries) {
      if (count !== null) counts[href] = count;
    }
    return counts;
  },
);
