import { describe, expect, it } from "vitest";

import { enNavLabels, frNavLabels } from "@/components/layout/site-nav-labels";

describe("site nav apply CTA", () => {
  it("points to Apply when applications are open", () => {
    expect(enNavLabels(true).apply).toEqual({
      href: "/en/apply",
      label: "Apply",
    });
    expect(frNavLabels(true).apply.href).toBe("/fr/apply");
  });

  it("points to Register Interest when applications are closed", () => {
    expect(enNavLabels(false).apply).toEqual({
      href: "/en/register-interest",
      label: "Register Interest",
    });
    expect(frNavLabels(false).apply.href).toBe("/fr/register-interest");
  });
});
