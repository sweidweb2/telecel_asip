import { describe, expect, it } from "vitest";

import {
  INDEXABLE_PAGE_SLUGS,
  PUBLIC_PAGE_SLUGS,
} from "@/constants/public-pages";

describe("public page indexes", () => {
  it("keeps apply, register-interest, and alumni out of the default indexable set", () => {
    expect(PUBLIC_PAGE_SLUGS).not.toContain("lab");
    expect(PUBLIC_PAGE_SLUGS).toContain("apply");
    expect(PUBLIC_PAGE_SLUGS).toContain("alumni");
    expect(INDEXABLE_PAGE_SLUGS).not.toContain("apply");
    expect(INDEXABLE_PAGE_SLUGS).not.toContain("register-interest");
    expect(INDEXABLE_PAGE_SLUGS).not.toContain("alumni");
  });

  it("indexes core marketing routes", () => {
    expect(INDEXABLE_PAGE_SLUGS).toEqual(
      expect.arrayContaining([
        "",
        "about",
        "program",
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
