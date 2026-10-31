import { describe, expect, it } from "vitest";

import {
  enNavLabels,
  frNavLabels,
  isNavGroup,
} from "@/components/layout/site-nav-labels";
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

  it("nests Directory and Alumni under Founders in the nav tree", () => {
    for (const labels of [enNavLabels(), frNavLabels()]) {
      const founders = labels.items.find(
        (entry) => isNavGroup(entry) && entry.href.endsWith("/founders"),
      );
      expect(founders && isNavGroup(founders)).toBe(true);
      if (!founders || !isNavGroup(founders)) return;

      expect(founders.children.map((child) => child.label)).toEqual([
        labels.foundersDirectory,
        "Alumni",
      ]);
      expect(founders.children.map((child) => child.href)).toEqual([
        founders.href,
        founders.href.replace(/\/founders$/, "/alumni"),
      ]);
    }
  });

  it("keeps one header tree order in both locales", () => {
    const entryKey = (entry: ReturnType<typeof enNavLabels>["items"][number]) => {
      if (isNavGroup(entry)) {
        return `group:${entry.href.replace(/^\/(en|fr)/, "") || ""}`;
      }
      return entry.href.replace(/^\/(en|fr)/, "") || "";
    };

    expect(frNavLabels().items.map(entryKey)).toEqual(
      enNavLabels().items.map(entryKey),
    );
    expect(enNavLabels().items.map((entry) => entry.label)).toEqual([
      "Home",
      "About",
      "Programme",
      "Founders",
      "Impact",
      "Partners",
      "Insights",
    ]);
    expect(frNavLabels().items.map((entry) => entry.label)).toEqual([
      "Accueil",
      "À propos",
      "Programme",
      "Fondateurs",
      "Impact",
      "Partenaires",
      "Perspectives",
    ]);
  });
});
