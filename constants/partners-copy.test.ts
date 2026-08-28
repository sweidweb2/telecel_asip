import { describe, expect, it } from "vitest";

import { PARTNER_LOGOS } from "@/constants/partner-logos";
import { partnersCopyFor } from "@/constants/partners-copy";

describe("partnersCopyFor", () => {
  it("keeps the same partner-type ids and contact CTA in English and French", () => {
    const en = partnersCopyFor("en");
    const fr = partnersCopyFor("fr");

    expect(en.types.rows.map((row) => row.id)).toEqual(
      fr.types.rows.map((row) => row.id),
    );
    expect(en.types.rows).toHaveLength(6);
    expect(en.hero.cta.slug).toBe("contact");
    expect(en.hero.cta.label).toBe("Discuss a partnership");
    expect(en.ctaSection.slug).toBe("contact");
    expect(en.ctaSection.label).toBe("Discuss a partnership");
    expect(fr.hero.title.length).toBeGreaterThan(0);
    expect(fr.hero.cta.label.length).toBeGreaterThan(0);
  });
});

describe("PARTNER_LOGOS", () => {
  it("uses local partner assets with unique names", () => {
    expect(PARTNER_LOGOS.length).toBeGreaterThan(0);
    expect(PARTNER_LOGOS.every((logo) => logo.src.startsWith("/partners/"))).toBe(
      true,
    );
    expect(new Set(PARTNER_LOGOS.map((logo) => logo.name)).size).toBe(
      PARTNER_LOGOS.length,
    );
  });
});
