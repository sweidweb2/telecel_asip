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

describe("site nav chrome copy", () => {
  it("keeps masthead and founders directory labels in the labels module", () => {
    expect(enNavLabels().masthead).toBe("A Telecel Group programme");
    expect(enNavLabels().foundersDirectory).toBe("Directory");
    expect(frNavLabels().masthead).toBe("Un programme du Groupe Telecel");
    expect(frNavLabels().foundersDirectory).toBe("Annuaire");
  });

  it("uses the alumni nav item as the dropdown child label", () => {
    for (const labels of [enNavLabels(), frNavLabels()]) {
      const alumni = labels.items.find((item) => item.href.endsWith("/alumni"));
      expect(alumni?.label).toBe("Alumni");
    }
  });

  it("keeps one header slug order in both locales", () => {
    const slug = (href: string) => href.replace(/^\/(en|fr)/, "") || "";
    expect(frNavLabels().items.map((item) => slug(item.href))).toEqual(
      enNavLabels().items.map((item) => slug(item.href)),
    );
    expect(enNavLabels().items.map((item) => item.label)).toEqual([
      "Home",
      "About",
      "Programme",
      "Founders",
      "Alumni",
      "Impact",
      "Partners",
      "Insights",
    ]);
    expect(frNavLabels().items.map((item) => item.label)).toEqual([
      "Accueil",
      "À propos",
      "Programme",
      "Fondateurs",
      "Alumni",
      "Impact",
      "Partenaires",
      "Perspectives",
    ]);
  });
});
