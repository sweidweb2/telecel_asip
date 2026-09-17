import { describe, expect, it } from "vitest";

import { enNavLabels, frNavLabels } from "@/components/layout/site-nav-labels";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";

describe("site nav apply CTA", () => {
  it("points to Apply when applications are open", () => {
    const intake = intakeCtaFor("en", true);
    expect(enNavLabels(true).apply).toEqual({
      href: intake.href,
      label: intake.label,
    });
    expect(frNavLabels(true).apply).toEqual({
      href: intakeCtaFor("fr", true).href,
      label: intakeCtaFor("fr", true).label,
    });
  });

  it("points to Register Interest when applications are closed", () => {
    const intake = intakeCtaFor("en", false);
    expect(enNavLabels(false).apply).toEqual({
      href: intake.href,
      label: intake.label,
    });
    expect(frNavLabels(false).apply.href).toBe("/fr/register-interest");
  });
});
