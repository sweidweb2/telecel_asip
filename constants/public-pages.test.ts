import { describe, expect, it } from "vitest";

import {
  INDEXABLE_PAGE_SLUGS,
  PUBLIC_PAGE_SLUGS,
} from "@/constants/public-pages";

describe("public page indexes", () => {
  it("keeps lab and apply out of the default indexable set", () => {
    expect(PUBLIC_PAGE_SLUGS).toContain("lab");
    expect(PUBLIC_PAGE_SLUGS).toContain("apply");
    expect(INDEXABLE_PAGE_SLUGS).not.toContain("lab");
    expect(INDEXABLE_PAGE_SLUGS).not.toContain("apply");
  });

  it("indexes core marketing routes", () => {
    expect(INDEXABLE_PAGE_SLUGS).toEqual(
      expect.arrayContaining([
        "",
        "about",
        "programme",
        "founders",
        "impact",
        "partners",
        "insights",
        "contact",
        "faq",
        "terms",
        "privacy",
      ]),
    );
  });
});
