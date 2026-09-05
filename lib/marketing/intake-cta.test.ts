import { describe, expect, it } from "vitest";

import { intakeCtaFor } from "@/lib/marketing/intake-cta";

describe("intakeCtaFor", () => {
  it("promotes register-interest when applications are closed", () => {
    expect(intakeCtaFor("en", false)).toEqual({
      slug: "register-interest",
      label: "Register interest",
      href: "/en/register-interest",
    });
    expect(intakeCtaFor("fr", false).slug).toBe("register-interest");
  });

  it("promotes apply when applications are open", () => {
    expect(intakeCtaFor("en", true)).toEqual({
      slug: "apply",
      label: "Apply to ASIP",
      href: "/en/apply",
    });
    expect(intakeCtaFor("fr", true)).toMatchObject({
      slug: "apply",
      href: "/fr/apply",
    });
  });
});
