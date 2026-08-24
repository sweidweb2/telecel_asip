import { describe, expect, it } from "vitest";

import {
  getInsightBySlug,
  getInsightSlugs,
  getRelatedInsights,
} from "@/data/insights";

describe("insights data", () => {
  it("returns article by slug", () => {
    const article = getInsightBySlug("ux-review-presentations");
    expect(article?.title).toBe("UX review presentations");
    expect(article?.body.length).toBeGreaterThan(0);
  });

  it("lists all insight slugs", () => {
    expect(getInsightSlugs()).toContain("improve-design-skills");
    expect(getInsightSlugs().length).toBeGreaterThanOrEqual(10);
  });

  it("returns related insights in the same category", () => {
    const related = getRelatedInsights("ux-review-presentations", 2);
    expect(related.every((item) => item.slug !== "ux-review-presentations")).toBe(
      true,
    );
  });
});
