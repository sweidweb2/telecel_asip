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
    expect(en.hero.titleLines).toHaveLength(2);
    expect(en.hero.description.length).toBeGreaterThan(80);
    expect(en.hero.description.length).toBeLessThan(220);
    expect(fr.hero.titleLines).toHaveLength(2);
    expect(en.cohortFilm.playLabel.length).toBeGreaterThan(0);
    expect(fr.cohortFilm.playLabel.length).toBeGreaterThan(0);
    expect(en.cohortFilm.watchLabel.length).toBeGreaterThan(0);
    expect(fr.cohortFilm.watchLabel.length).toBeGreaterThan(0);
    expect(en.cohortFilm.posterAlt.length).toBeGreaterThan(10);
    expect(fr.cohortFilm.posterAlt.length).toBeGreaterThan(10);
    expect(en.hero.continuumAlts).toHaveLength(fr.hero.continuumAlts.length);
    expect(en.cohortFilm.title).not.toEqual(fr.cohortFilm.title);
    expect(en.nextChapter.primaryCta.slug).toBe("register-interest");
    expect(en.nextChapter.secondaryCta.slug).toBe("contact");
    expect(en.outcomes.features.map((feature) => feature.id)).toEqual(
      fr.outcomes.features.map((feature) => feature.id),
    );
    expect(en.outcomes.features).toHaveLength(3);
    expect(en.outcomes.cta.slug).toBe("impact");
    expect(en.telecel.title).toContain("Connecting Energies");
    expect(en.telecel.prompt.length).toBeGreaterThan(0);
    expect(fr.telecel.prompt.length).toBeGreaterThan(0);
    expect(fr.telecel.ctaLabel.length).toBeGreaterThan(0);
  });
});
