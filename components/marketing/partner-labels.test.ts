import { describe, expect, it } from "vitest";

import { partnerLabelsFor } from "@/components/marketing/partner-labels";

describe("partnerLabelsFor", () => {
  it("returns the same keys with non-empty strings in English and French", () => {
    const en = partnerLabelsFor("en");
    const fr = partnerLabelsFor("fr");

    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
    for (const value of [...Object.values(en), ...Object.values(fr)]) {
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("does not fall back to English for French", () => {
    expect(partnerLabelsFor("fr").historicalTitle).not.toBe(
      partnerLabelsFor("en").historicalTitle,
    );
  });
});
