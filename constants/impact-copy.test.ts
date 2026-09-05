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
    expect(en.hero.title).toBe("The story is what happened next.");
    expect(en.progress.eyebrow).toBe("Seven years of impact");
    expect(en.progress.description.includes("verified founder outcomes")).toBe(
      true,
    );
    expect(fr.progress.eyebrow).toBe("Sept ans d’impact");
    expect(en.caseStudy.readStory).toBe("Read full story");
    expect(en.caseStudy.comingSoon).toBe("Founder story coming soon");
    expect(fr.caseStudy.comingSoon.length).toBeGreaterThan(0);
    expect(fr.caseStudy.readStory.length).toBeGreaterThan(0);
    expect(en.caseStudy.steps.barrier).toBe("Barrier");
    expect(fr.caseStudy.steps.outcome.length).toBeGreaterThan(0);
    expect(en.evidenceRule.requirements).toHaveLength(5);
    expect(en.evidenceRule.requirements.map((item) => item.id)).toEqual(
      fr.evidenceRule.requirements.map((item) => item.id),
    );
    expect(en.evidenceRule.title).toContain("paper trail");
    expect(fr.hero.title).toBe("L’histoire, c’est ce qui s’est passé ensuite.");
    expect(en.ctaSection.slug).toBe("founders");
    expect(en.ctaSection.label).toBe("Explore founder stories");
    expect(fr.hero.title.length).toBeGreaterThan(0);
    expect(fr.hero.cta.label.length).toBeGreaterThan(0);
  });
});
