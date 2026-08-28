import { describe, expect, it } from "vitest";

import { alumniCopyFor } from "@/constants/alumni-copy";
import { navLabelsFor } from "@/components/layout/site-nav-labels";
import { INDEXABLE_PAGE_SLUGS } from "@/constants/public-pages";

describe("alumniCopyFor", () => {
  it("keeps the same benefit shape in English and French", () => {
    const en = alumniCopyFor("en");
    const fr = alumniCopyFor("fr");

    expect(en.benefits.items.map((item) => item.id)).toEqual(
      fr.benefits.items.map((item) => item.id),
    );
    expect(en.benefits.items).toHaveLength(5);
    expect(en.hero.primaryCta.slug).toBe("founders");
    expect(fr.hero.primaryCta.slug).toBe("founders");
    expect(en.hero.primaryCta.label).toBe("Explore the community");
    expect(fr.hero.title.length).toBeGreaterThan(0);
    expect(en.notice.length).toBeGreaterThan(0);
  });
});

describe("alumni public activation", () => {
  it("is linked from the primary nav and stays out of the sitemap", () => {
    for (const locale of ["en", "fr"] as const) {
      const items = navLabelsFor(locale).items;
      expect(items.some((item) => item.href.endsWith("/alumni"))).toBe(true);
      expect(items.find((item) => item.href.endsWith("/alumni"))?.label).toBe(
        "Alumni",
      );
    }
    expect(INDEXABLE_PAGE_SLUGS).not.toContain("alumni");
  });
});
