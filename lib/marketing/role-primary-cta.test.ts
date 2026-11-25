import { describe, expect, it } from "vitest";

import {
  marketingAudienceFor,
  portalCtaFor,
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
      }),
    ).toEqual({
      href: "/en/apply",
      label: "Apply to ASIP",
    });
  });

  it("uses Apply to ASIP for every audience while applications are open", () => {
    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: true,
        profile: { role: "viewer", type: "startup" },
      }).label,
    ).toBe("Apply to ASIP");

    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: true,
        profile: { role: "viewer", type: "investor" },
      }).label,
    ).toBe("Apply to ASIP");

    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: true,
        profile: { role: "editor", type: "startup" },
      }),
    ).toEqual({ href: "/en/apply", label: "Apply to ASIP" });
  });

  it("uses distinct founder / investor labels when signed in and closed", () => {
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
        openApplications: false,
        profile: { role: "viewer", type: "investor" },
      }).label,
    ).toBe("Register as an investor");
  });

  it("keeps staff on Feeling interested in chrome (portal is separate)", () => {
    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: false,
        profile: { role: "editor", type: "startup" },
      }),
    ).toEqual({
      href: "/en/register-interest",
      label: "Feeling interested",
    });

    expect(
      rolePrimaryCtaFor({
        locale: "en",
        openApplications: false,
        profile: { role: "admin", type: "admin" },
      }).label,
    ).toBe("Feeling interested");
  });
});

describe("portalCtaFor", () => {
  it("returns shell links for editor and admin only", () => {
    expect(portalCtaFor(null, "en")).toBeNull();
    expect(
      portalCtaFor({ role: "viewer", type: "startup" }, "en"),
    ).toBeNull();
    expect(portalCtaFor({ role: "editor", type: "startup" }, "en")).toEqual({
      href: "/dashboard",
      label: "Dashboard",
    });
    expect(portalCtaFor({ role: "admin", type: "admin" }, "en")).toEqual({
      href: "/admin",
      label: "Admin",
    });
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
