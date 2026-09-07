import { describe, expect, it } from "vitest";

import { partnersCopyFor } from "@/constants/partners-copy";
import { PARTNER_TYPES } from "@/validations/partner";

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
    expect(fr.hero.titleLead.length).toBeGreaterThan(0);
    expect(fr.hero.titleAccent.length).toBeGreaterThan(0);
    expect(en.hero.proof).toHaveLength(fr.hero.proof.length);
    expect(fr.hero.cta.label.length).toBeGreaterThan(0);
    expect(en.types.title.length).toBeGreaterThan(0);
    expect(fr.types.title.length).toBeGreaterThan(0);
    expect(en.types.description.length).toBeGreaterThan(0);
    expect(fr.types.description.length).toBeGreaterThan(0);
  });

  it("covers every partner_type enum value so DB rows always have a label", () => {
    const ids = partnersCopyFor("en").types.rows.map((row) => row.id);
    expect([...ids].sort()).toEqual([...PARTNER_TYPES].sort());
  });
});
