import { describe, expect, it } from "vitest";

import { programmeCopyFor } from "@/constants/programme-copy";

describe("programmeCopyFor", () => {
  it("keeps the same journey, value, and eligibility structure in English and French", () => {
    const en = programmeCopyFor("en");
    const fr = programmeCopyFor("fr");

    expect(en.journey.steps.map((step) => step.id)).toEqual(
      fr.journey.steps.map((step) => step.id),
    );
    expect(en.journey.steps).toHaveLength(6);
    expect(en.value.items.map((item) => item.id)).toEqual(
      fr.value.items.map((item) => item.id),
    );
    expect(en.value.items).toHaveLength(7);
    expect(en.eligibility.items).toHaveLength(fr.eligibility.items.length);

    expect(en.hero.primaryCta.slug).toBe("register-interest");
    expect(en.hero.secondaryCta.slug).toBe("founders");
    expect(fr.hero.primaryCta.slug).toBe("register-interest");
    expect(fr.hero.secondaryCta.slug).toBe("founders");

    expect(en.audience.highlights.map((item) => item.id)).toEqual(
      fr.audience.highlights.map((item) => item.id),
    );
    expect(en.audience.highlights).toHaveLength(3);

    expect(en.hero.title).toBe("Build the company, not just the pitch.");
    expect(fr.hero.title.length).toBeGreaterThan(0);
    expect(fr.hero.primaryCta.label.length).toBeGreaterThan(0);
  });
});
