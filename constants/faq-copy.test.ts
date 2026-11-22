import { describe, expect, it } from "vitest";

import { marketingCopyFor } from "@/constants/marketing-copy";

describe("FAQ marketing copy", () => {
  it("keeps bilingual FAQ tabs aligned", () => {
    const en = marketingCopyFor("en", "faq");
    const fr = marketingCopyFor("fr", "faq");
    const enTabs = en.tabs ?? [];
    const frTabs = fr.tabs ?? [];

    expect(enTabs.length).toBeGreaterThan(0);
    expect(enTabs.map((tab) => tab.id)).toEqual(frTabs.map((tab) => tab.id));
    expect(enTabs[0]?.items.length).toBeGreaterThan(0);
    expect(frTabs[0]?.items[0]?.title.length).toBeGreaterThan(0);
  });

  it("mentions Register Interest when applications may be closed", () => {
    const en = marketingCopyFor("en", "faq");
    const text = en.cards
      .map((item) => `${item.title} ${item.description}`)
      .join(" ");
    expect(text).toMatch(/register your interest/i);
    // No internal implementation language ("navbar", "redirects") in public answers.
    expect(text).not.toMatch(/navbar|redirect/i);
  });
});
