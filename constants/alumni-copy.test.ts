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
    expect(en.benefits.title.length).toBeGreaterThan(0);
    expect(fr.benefits.title.length).toBeGreaterThan(0);
    expect(en.hero.primaryCta.slug).toBe("founders");
    expect(fr.hero.primaryCta.slug).toBe("founders");
    expect(en.hero.primaryCta.label).toBe("Explore the community");
    expect(fr.hero.title.length).toBeGreaterThan(0);
    expect(en.notice).toBe("");
  });
});

describe("alumni public activation", () => {
  it("stays out of the primary nav and the sitemap while HOLD", () => {
    for (const locale of ["en", "fr"] as const) {
      // Alumni sits inside the Founders dropdown, so flatten group children.
      const items = navLabelsFor(locale).items.flatMap((item) =>
        item.kind === "group" ? [item, ...item.children] : [item],
      );
      // Text Pack v2: hidden until the public proposition is approved.
      expect(items.some((item) => item.href.endsWith("/alumni"))).toBe(false);
    }
    expect(INDEXABLE_PAGE_SLUGS).not.toContain("alumni");
  });
});
