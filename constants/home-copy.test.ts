import { describe, expect, it } from "vitest";

import { homeCopyFor } from "@/constants/home-copy";

describe("homeCopyFor", () => {
  it("keeps the same module shape in English and French", () => {
    const en = homeCopyFor("en");
    const fr = homeCopyFor("fr");

    expect(en.platform.steps.map((step) => step.id)).toEqual(
      fr.platform.steps.map((step) => step.id),
    );
    expect(en.platform.steps).toHaveLength(5);
    expect(en.impactYears.metrics).toHaveLength(5);
    expect(fr.impactYears.metrics).toHaveLength(5);
    expect(en.ecosystem.roles.map((role) => role.id)).toEqual(
      fr.ecosystem.roles.map((role) => role.id),
    );
    expect(en.hero.primaryCta.slug).toBe("founders");
    expect(en.hero.secondaryCta.slug).toBe("register-interest");
    expect(en.nextChapter.primaryCta.slug).toBe("register-interest");
    expect(en.nextChapter.secondaryCta.slug).toBe("contact");
    expect(fr.hero.title.length).toBeGreaterThan(0);
  });
});
