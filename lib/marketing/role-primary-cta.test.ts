import { describe, expect, it } from "vitest";

import {
  marketingAudienceFor,
  rolePrimaryCtaFor,
} from "@/lib/marketing/role-primary-cta";

describe("rolePrimaryCtaFor", () => {
  it("uses Feeling interested for guests while keeping intake href", () => {
    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: false,
        profile: null,
      }),
    ).toEqual({
      href: "/en/register-interest",
      label: "Feeling interested",
    });

    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: true,
        profile: null,
      }).href,
    ).toBe("/en/apply");
  });

  it("uses distinct founder / investor labels when signed in", () => {
    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: false,
        profile: { role: "viewer", type: "startup" },
      }).label,
    ).toBe("Register as a founder");

    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: true,
        profile: { role: "viewer", type: "startup" },
      }).label,
    ).toBe("Apply as a founder");

    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: false,
        profile: { role: "viewer", type: "investor" },
      }).label,
    ).toBe("Register as an investor");

    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: true,
        profile: { role: "viewer", type: "investor" },
      }).label,
    ).toBe("Engage as an investor");
  });

  it("routes staff to their shells", () => {
    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: false,
        profile: { role: "editor", type: "startup" },
      }),
    ).toEqual({ href: "/dashboard", label: "Dashboard" });

    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: false,
        profile: { role: "admin", type: "admin" },
      }).href,
    ).toBe("/admin");
  });
});

describe("marketingAudienceFor", () => {
  it("maps profile to guest / startup / investor / staff", () => {
    expect(marketingAudienceFor(null)).toBe("guest");
    expect(marketingAudienceFor({ role: "viewer", type: "startup" })).toBe(
      "startup",
    );
    expect(marketingAudienceFor({ role: "viewer", type: "investor" })).toBe(
      "investor",
    );
    expect(marketingAudienceFor({ role: "editor", type: "startup" })).toBe(
      "staff",
    );
    expect(marketingAudienceFor({ role: "admin", type: "admin" })).toBe(
      "staff",
    );
  });
});
