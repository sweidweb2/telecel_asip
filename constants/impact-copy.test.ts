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
    // Text Pack v2 locked copy.
    expect(en.hero.title).toBe("Proof, not promises.");
    expect(en.hero.cta.label).toBe("Explore founder outcomes");
    expect(en.caseStudy.readStory).toBe("Read full story");
    // No "coming soon" placeholder copy ships in English.
    expect(en.caseStudy.comingSoon).toBe("");
    expect(fr.caseStudy.readStory.length).toBeGreaterThan(0);
    expect(en.caseStudy.steps.barrier).toBe("The problem");
    expect(fr.caseStudy.steps.outcome.length).toBeGreaterThan(0);
    expect(en.evidenceRule.requirements).toHaveLength(5);
    expect(en.evidenceRule.requirements.map((item) => item.id)).toEqual(
      fr.evidenceRule.requirements.map((item) => item.id),
    );
    expect(en.evidenceRule.title).toBe("How impact is verified.");
    expect(en.ctaSection.slug).toBe("founders");
    expect(en.ctaSection.label).toBe("Explore the portfolio");
    expect(fr.hero.title.length).toBeGreaterThan(0);
    expect(fr.hero.cta.label.length).toBeGreaterThan(0);
  });
});
