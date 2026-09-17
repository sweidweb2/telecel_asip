import { ROUTES } from "@/constants/routes";

/**
 * Editor sidebar badge sources. Table keys match `get_dashboard_nav_counts`.
 * Href list is the single source for which nav items stream a count.
 */
export const DASHBOARD_NAV_COUNT_TABLES = [
  { href: ROUTES.registrations, table: "interest_registrations" },
  { href: ROUTES.applications, table: "applications" },
  { href: ROUTES.contactUs, table: "contact_messages" },
  { href: ROUTES.newsletter, table: "newsletter_subscribers" },
  { href: ROUTES.blogs, table: "blogs" },
  { href: ROUTES.portfolio, table: "startups" },
  { href: ROUTES.partners, table: "partners" },
  { href: ROUTES.founderStories, table: "founder_stories" },
  { href: ROUTES.cohorts, table: "cohorts" },
  { href: ROUTES.events, table: "events" },
  { href: ROUTES.evidence, table: "evidence_records" },
  { href: ROUTES.impactMetrics, table: "impact_metrics" },
  { href: ROUTES.users, table: "profiles" },
] as const;

export type DashboardNavCountTable =
  (typeof DASHBOARD_NAV_COUNT_TABLES)[number]["table"];

export type DashboardNavCounts = Partial<Record<string, number>>;

/** Invalidated from `refreshAdminResource` and other CMS writes that change totals. */
export const DASHBOARD_NAV_COUNTS_CACHE_TAG = "dashboard-nav-counts";

export const DASHBOARD_NAV_COUNT_HREF_SET: ReadonlySet<string> = new Set(
  DASHBOARD_NAV_COUNT_TABLES.map((row) => row.href),
);

export function isDashboardNavCountHref(href: string): boolean {
  return DASHBOARD_NAV_COUNT_HREF_SET.has(href);
}

function asCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Map RPC jsonb (table → total) onto sidebar hrefs. Unknown/invalid values omitted.
 */
export function mapDashboardNavCounts(
  payload: unknown,
): DashboardNavCounts {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const raw = payload as Record<string, unknown>;
  const counts: DashboardNavCounts = {};

  for (const { href, table } of DASHBOARD_NAV_COUNT_TABLES) {
    const count = asCount(raw[table]);
    if (count !== null) counts[href] = count;
  }

  return counts;
}
