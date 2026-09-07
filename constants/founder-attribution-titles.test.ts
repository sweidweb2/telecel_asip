import { describe, expect, it } from "vitest";

import {
  filterFounderAttributionTitles,
  FOUNDER_ATTRIBUTION_TITLES,
  FOUNDER_ATTRIBUTION_TITLE_SUGGESTION_LIMIT,
} from "@/constants/founder-attribution-titles";

describe("filterFounderAttributionTitles", () => {
  it("returns browse hints when the query is empty", () => {
    expect(filterFounderAttributionTitles("")).toEqual(
      FOUNDER_ATTRIBUTION_TITLES.slice(
        0,
        FOUNDER_ATTRIBUTION_TITLE_SUGGESTION_LIMIT,
      ),
    );
    expect(filterFounderAttributionTitles("   ")).toHaveLength(
      FOUNDER_ATTRIBUTION_TITLE_SUGGESTION_LIMIT,
    );
  });

  it("filters by substring match", () => {
    const result = filterFounderAttributionTitles("ceo");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((title) => /ceo/i.test(title))).toBe(true);
  });

  it("caps results at the suggestion limit", () => {
    const result = filterFounderAttributionTitles("o");
    expect(result.length).toBeLessThanOrEqual(
      FOUNDER_ATTRIBUTION_TITLE_SUGGESTION_LIMIT,
    );
  });
});
