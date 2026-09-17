import {
  DASHBOARD_COMMAND_PAGES,
  type DashboardSearchPage,
} from "@/constants/dashboard-nav";
import { ADMIN_SEARCH_PAGES } from "@/constants/admin-nav";

/** Hard cap on the header page-search field (characters). */
export const STAFF_PAGE_SEARCH_MAX_LENGTH = 64;

/** Max suggestions shown in the dropdown. */
export const STAFF_PAGE_SEARCH_MAX_RESULTS = 8;

/** Minimum typed characters before filtering (1 = match as you type). */
export const STAFF_PAGE_SEARCH_MIN_LENGTH = 1;

const STAFF_SEARCH_PAGES: readonly DashboardSearchPage[] = [
  ...DASHBOARD_COMMAND_PAGES,
  ...ADMIN_SEARCH_PAGES,
];

const ALLOWED_HREFS = new Set(STAFF_SEARCH_PAGES.map((page) => page.href));

/**
 * Strip control chars / normalize whitespace and enforce length.
 * Output is plain text only — never treat as HTML or a URL.
 */
export function sanitizeStaffPageSearchQuery(raw: string): string {
  if (typeof raw !== "string") return "";

  return raw
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F\u0080-\u009F]/g, "")
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, STAFF_PAGE_SEARCH_MAX_LENGTH);
}

function normalizeForMatch(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en").trim();
}

/**
 * Filter a static staff page catalog by title / group.
 * Matching is substring-only against known labels — never builds hrefs from input.
 */
export function filterStaffSearchPages(
  rawQuery: string,
  catalog: readonly DashboardSearchPage[] = DASHBOARD_COMMAND_PAGES,
): DashboardSearchPage[] {
  const query = sanitizeStaffPageSearchQuery(rawQuery).trimEnd();
  if (query.length < STAFF_PAGE_SEARCH_MIN_LENGTH) return [];

  const needle = normalizeForMatch(query);
  if (!needle) return [];

  const matches: DashboardSearchPage[] = [];
  for (const page of catalog) {
    const haystack = normalizeForMatch(`${page.title} ${page.group}`);
    if (!haystack.includes(needle)) continue;
    matches.push(page);
    if (matches.length >= STAFF_PAGE_SEARCH_MAX_RESULTS) break;
  }
  return matches;
}

/**
 * Resolve navigation only through the allowlist.
 * Blocks open redirects / injected paths even if a caller passes a bad href.
 */
export function resolveStaffSearchHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  if (!ALLOWED_HREFS.has(href)) return null;
  const isStaffPath =
    href.startsWith("/dashboard") || href.startsWith("/admin");
  if (!isStaffPath) return null;
  if (href.includes("//") || href.includes("\\") || href.includes("@")) {
    return null;
  }
  return href;
}
