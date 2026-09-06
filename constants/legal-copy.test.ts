import { describe, expect, it } from "vitest";

import { legalCopyFor } from "@/constants/legal-copy";

describe("legalCopyFor", () => {
  it("covers terms and privacy in both locales", () => {
    for (const locale of ["en", "fr"] as const) {
      const terms = legalCopyFor(locale, "terms");
      const privacy = legalCopyFor(locale, "privacy");
      expect(terms.title.length).toBeGreaterThan(0);
      expect(privacy.title.length).toBeGreaterThan(0);
      expect(terms.sections.length).toBeGreaterThan(2);
      expect(privacy.sections.length).toBeGreaterThan(2);
    }
  });

  it("keeps section counts aligned across locales", () => {
    expect(legalCopyFor("en", "terms").sections).toHaveLength(
      legalCopyFor("fr", "terms").sections.length,
    );
    expect(legalCopyFor("en", "privacy").sections).toHaveLength(
      legalCopyFor("fr", "privacy").sections.length,
    );
  });
});
