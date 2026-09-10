import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  DASHBOARD_PAGE_SEARCH_MAX_LENGTH,
  filterDashboardSearchPages,
  resolveDashboardSearchHref,
  sanitizeDashboardPageSearchQuery,
} from "@/lib/admin/dashboard-page-search";

describe("sanitizeDashboardPageSearchQuery", () => {
  it("strips control characters and caps length", () => {
    const long = "a".repeat(DASHBOARD_PAGE_SEARCH_MAX_LENGTH + 20);
    expect(sanitizeDashboardPageSearchQuery(`\u0000blog\n\t`).trim()).toBe(
      "blog",
    );
    expect(sanitizeDashboardPageSearchQuery(long).length).toBe(
      DASHBOARD_PAGE_SEARCH_MAX_LENGTH,
    );
  });

  it("collapses whitespace and rejects non-strings", () => {
    expect(sanitizeDashboardPageSearchQuery("  blogs   partners ")).toBe(
      "blogs partners ",
    );
    expect(sanitizeDashboardPageSearchQuery(null as unknown as string)).toBe(
      "",
    );
  });
});

describe("filterDashboardSearchPages", () => {
  it("matches page titles from the catalog", () => {
    const results = filterDashboardSearchPages("blog");
    expect(results.some((page) => page.href === ROUTES.blogs)).toBe(true);
  });

  it("does not invent routes from XSS-like input", () => {
    const results = filterDashboardSearchPages(
      '<script>alert(1)</script>://evil.com',
    );
    expect(results.every((page) => page.href.startsWith("/dashboard"))).toBe(
      true,
    );
  });

  it("returns nothing for empty / undersized queries", () => {
    expect(filterDashboardSearchPages("")).toEqual([]);
    expect(filterDashboardSearchPages("   ")).toEqual([]);
  });
});

describe("resolveDashboardSearchHref", () => {
  it("allows catalog hrefs under /dashboard or /admin", () => {
    expect(resolveDashboardSearchHref(ROUTES.blogs)).toBe(ROUTES.blogs);
    expect(resolveDashboardSearchHref(ROUTES.adminUsers)).toBe(
      ROUTES.adminUsers,
    );
    expect(resolveDashboardSearchHref("/dashboard/../login")).toBeNull();
    expect(resolveDashboardSearchHref("https://evil.example")).toBeNull();
    expect(resolveDashboardSearchHref("//evil.example")).toBeNull();
  });
});
