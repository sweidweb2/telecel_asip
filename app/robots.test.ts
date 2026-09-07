import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/seo/site", () => ({
  absoluteUrl: (path: string) => `https://example.com${path}`,
}));

import robots from "@/app/robots";

describe("robots", () => {
  it("disallows dashboard, api, and auth surfaces", () => {
    const result = robots();
    const disallow = Array.isArray(result.rules)
      ? result.rules[0]?.disallow
      : result.rules.disallow;

    expect(disallow).toEqual(
      expect.arrayContaining([
        "/dashboard/",
        "/api/",
        "/admin/",
        "/login",
        "/signup",
        "/en/login",
        "/fr/login",
        "/en/lab",
        "/fr/lab",
      ]),
    );
    expect(result.sitemap).toBe("https://example.com/sitemap.xml");
  });
});
