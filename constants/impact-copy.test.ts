import { describe, expect, it } from "vitest";

import { impactCopyFor } from "@/constants/impact-copy";

describe("impactCopyFor", () => {
  it("keeps the same lens ids and founder CTA in English and French", () => {
    const en = impactCopyFor("en");
    const fr = impactCopyFor("fr");

    expect(en.lenses.rows.map((row) => row.id)).toEqual(
      fr.lenses.rows.map((row) => row.id),
    );
    expect(en.lenses.rows).toHaveLength(6);
    expect(en.hero.cta.slug).toBe("founders");
    expect(en.ctaSection.slug).toBe("founders");
    expect(en.ctaSection.label).toBe("Explore founder stories");
    expect(fr.hero.title.length).toBeGreaterThan(0);
    expect(fr.hero.cta.label.length).toBeGreaterThan(0);
  });
});
