import { describe, expect, it } from "vitest";

import {
  findInvalidLegacyRedirects,
  LEGACY_REDIRECTS,
  legacyRedirectRules,
} from "./legacy-redirects";
import { LOCALES } from "./locales";
import { PUBLIC_PAGE_SLUG_SET } from "./public-pages";

describe("LEGACY_REDIRECTS", () => {
  it("only targets real marketing pages", () => {
    expect(findInvalidLegacyRedirects()).toEqual([]);
  });

  it("uses locale-less sources with a leading slash and no trailing slash", () => {
    for (const { source } of LEGACY_REDIRECTS) {
      expect(source.startsWith("/")).toBe(true);
      expect(source.endsWith("/")).toBe(false);
      const first = source.split("/")[1];
      expect(LOCALES as readonly string[]).not.toContain(first);
    }
  });

  it("has no duplicate sources", () => {
    const sources = LEGACY_REDIRECTS.map((entry) => entry.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("never redirects a path that still exists in the new site", () => {
    for (const { source } of LEGACY_REDIRECTS) {
      const segments = source.split("/").filter(Boolean);
      if (segments.length !== 1) continue;
      expect(PUBLIC_PAGE_SLUG_SET.has(segments[0]!)).toBe(false);
    }
  });
});

describe("legacyRedirectRules", () => {
  const rules = legacyRedirectRules("en");

  it("emits a locale-less and a locale-prefixed rule per entry", () => {
    expect(rules).toHaveLength(LEGACY_REDIRECTS.length * 2);
  });

  it("emits a literal 301 for every rule", () => {
    expect(rules.every((rule) => rule.statusCode === 301)).toBe(true);
  });

  it("maps a simple legacy page to the default locale", () => {
    expect(rules).toContainEqual({
      source: "/about-us",
      destination: "/en/about",
      statusCode: 301,
    });
  });

  it("preserves the locale when one is already present", () => {
    expect(rules).toContainEqual({
      source: "/:locale(en|fr)/about-us",
      destination: "/:locale/about",
      statusCode: 301,
    });
  });

  it("collapses legacy sections onto their new index page", () => {
    expect(rules).toContainEqual({
      source: "/news/:path*",
      destination: "/en/insights",
      statusCode: 301,
    });
  });

  it("sends legacy entry points to the localised home page", () => {
    expect(rules).toContainEqual({
      source: "/index.php",
      destination: "/en",
      statusCode: 301,
    });
  });
});
