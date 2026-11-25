import { describe, expect, it } from "vitest";

import { CONTACT } from "@/constants/contact";
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

  it("keeps the cookies anchor and contact details for the live product", () => {
    const privacy = legalCopyFor("en", "privacy");
    expect(privacy.sections.some((section) => section.id === "cookies")).toBe(
      true,
    );
    const blob = [
      ...legalCopyFor("en", "terms").sections.flatMap((s) => s.paragraphs),
      ...privacy.sections.flatMap((s) => s.paragraphs),
    ].join(" ");
    expect(blob).toContain(CONTACT.email);
    expect(blob).toContain("rate limit");
    expect(blob).toMatch(/signed in|sign in/i);
    expect(blob.toLowerCase()).not.toContain("draft");
    expect(blob.toLowerCase()).not.toContain("provisional");
  });
});
