import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  STAFF_PAGE_SEARCH_MAX_LENGTH,
  filterStaffSearchPages,
  resolveStaffSearchHref,
  sanitizeStaffPageSearchQuery,
} from "@/lib/admin/staff-page-search";

describe("sanitizeStaffPageSearchQuery", () => {
  it("strips control characters and caps length", () => {
    const long = "a".repeat(STAFF_PAGE_SEARCH_MAX_LENGTH + 20);
    expect(sanitizeStaffPageSearchQuery(`\u0000blog\n\t`).trim()).toBe(
      "blog",
    );
    expect(sanitizeStaffPageSearchQuery(long).length).toBe(
      STAFF_PAGE_SEARCH_MAX_LENGTH,
    );
  });

  it("collapses whitespace and rejects non-strings", () => {
    expect(sanitizeStaffPageSearchQuery("  blogs   partners ")).toBe(
      "blogs partners ",
    );
    expect(sanitizeStaffPageSearchQuery(null as unknown as string)).toBe(
      "",
    );
  });
});

describe("filterStaffSearchPages", () => {
  it("matches page titles from the catalog", () => {
    const results = filterStaffSearchPages("blog");
    expect(results.some((page) => page.href === ROUTES.blogs)).toBe(true);
  });

  it("matches create actions like new blog", () => {
    const results = filterStaffSearchPages("new blog");
    expect(results.some((page) => page.href === ROUTES.blogsNew)).toBe(true);
  });

  it("does not invent routes from XSS-like input", () => {
    const results = filterStaffSearchPages(
      '<script>alert(1)</script>://evil.com',
    );
    expect(results.every((page) => page.href.startsWith("/dashboard"))).toBe(
      true,
    );
  });

  it("returns nothing for empty / undersized queries", () => {
    expect(filterStaffSearchPages("")).toEqual([]);
    expect(filterStaffSearchPages("   ")).toEqual([]);
  });
});

describe("resolveStaffSearchHref", () => {
  it("allows catalog hrefs under /dashboard or /admin", () => {
    expect(resolveStaffSearchHref(ROUTES.blogs)).toBe(ROUTES.blogs);
    expect(resolveStaffSearchHref(ROUTES.blogsNew)).toBe(ROUTES.blogsNew);
    expect(resolveStaffSearchHref(ROUTES.adminUsers)).toBe(
      ROUTES.adminUsers,
    );
    expect(resolveStaffSearchHref(ROUTES.adminSettings)).toBe(
      ROUTES.adminSettings,
    );
    expect(resolveStaffSearchHref("/dashboard/../login")).toBeNull();
    expect(resolveStaffSearchHref("https://evil.example")).toBeNull();
    expect(resolveStaffSearchHref("//evil.example")).toBeNull();
  });
});
