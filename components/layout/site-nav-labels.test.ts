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

  it("exposes a locale-prefixed Login link beside the intake CTA", () => {
    expect(enNavLabels().login).toEqual({
      href: "/en/login",
      label: "Login",
    });
    expect(frNavLabels().login).toEqual({
      href: "/fr/login",
      label: "Connexion",
    });
  });
});

describe("site nav chrome copy", () => {
  it("keeps masthead and founders directory labels in the labels module", () => {
    expect(enNavLabels().masthead).toBe("A Telecel Group Program");
    expect(enNavLabels().foundersDirectory).toBe("Directory");
    expect(frNavLabels().masthead).toBe("Un programme du Groupe Telecel");
    expect(frNavLabels().foundersDirectory).toBe("Annuaire");
  });

  it("links Founders directly and keeps Alumni out of the nav (Text Pack v2 HOLD)", () => {
    for (const labels of [enNavLabels(), frNavLabels()]) {
      expect(labels.items.some(isNavGroup)).toBe(false);
      expect(labels.items.some((entry) => entry.href.endsWith("/founders"))).toBe(
        true,
      );
      expect(labels.items.some((entry) => entry.href.endsWith("/alumni"))).toBe(
        false,
      );
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
