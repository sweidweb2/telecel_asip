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
    expect(en.impactYears.metrics).toHaveLength(0);
    expect(fr.impactYears.metrics).toHaveLength(0);
    expect(en.ecosystem.roles.map((role) => role.id)).toEqual(
      fr.ecosystem.roles.map((role) => role.id),
    );
    expect(en.hero.brand).toBe("ASIP");
    expect(fr.hero.brand).toBe("ASIP");
    expect(en.hero.primaryCta.slug).toBe("founders");
    expect(en.hero.secondaryCta.slug).toBe("register-interest");
    expect(en.hero.description.length).toBeLessThan(220);
    expect(en.nextChapter.primaryCta.slug).toBe("register-interest");
    expect(en.nextChapter.secondaryCta.slug).toBe("contact");
    expect(en.telecel.title).toContain("Connecting Energies");
    expect(en.telecel.prompt.length).toBeGreaterThan(0);
    expect(fr.telecel.prompt.length).toBeGreaterThan(0);
    expect(fr.telecel.ctaLabel.length).toBeGreaterThan(0);
  });
});
