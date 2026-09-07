import { describe, expect, it } from "vitest";

import {
  applyPartnerContributionSuggestion,
  filterPartnerContributionRoles,
  getPartnerContributionActiveWord,
  PARTNER_CONTRIBUTION_ROLES,
  PARTNER_CONTRIBUTION_SUGGESTION_LIMIT,
} from "@/constants/partner-contribution-roles";

describe("getPartnerContributionActiveWord", () => {
  it("returns the full value when there is no space", () => {
    expect(getPartnerContributionActiveWord("Tech")).toBe("Tech");
  });

  it("returns only the word after the last space", () => {
    expect(getPartnerContributionActiveWord("Strategic Partner Strat")).toBe(
      "Strat",
    );
  });

  it("returns empty after a trailing space (new value started)", () => {
    expect(getPartnerContributionActiveWord("Strategic Partner ")).toBe("");
  });
});

describe("applyPartnerContributionSuggestion", () => {
  it("replaces the whole value when typing the first word", () => {
    expect(applyPartnerContributionSuggestion("Tech", "Technology Partner")).toBe(
      "Technology Partner",
    );
  });

  it("keeps prior words and replaces the active word", () => {
    expect(
      applyPartnerContributionSuggestion(
        "Strategic Partner Strat",
        "Sponsorship Partner",
      ),
    ).toBe("Strategic Partner Sponsorship Partner");
  });

  it("appends after a trailing space", () => {
    expect(
      applyPartnerContributionSuggestion("Strategic Partner ", "Media Partner"),
    ).toBe("Strategic Partner Media Partner");
  });
});

describe("filterPartnerContributionRoles", () => {
  it("returns up to five browse hints when the active word is empty", () => {
    expect(filterPartnerContributionRoles("")).toHaveLength(
      PARTNER_CONTRIBUTION_SUGGESTION_LIMIT,
    );
    expect(filterPartnerContributionRoles("Strategic Partner ")).toEqual(
      PARTNER_CONTRIBUTION_ROLES.slice(0, PARTNER_CONTRIBUTION_SUGGESTION_LIMIT),
    );
  });

  it("filters using only the word after the last space", () => {
    const result = filterPartnerContributionRoles("ignored words tech");
    expect(result).toContain("Technology Partner");
    expect(result.every((role) => /tech/i.test(role))).toBe(true);
  });

  it("caps at five results", () => {
    const result = filterPartnerContributionRoles("partner");
    expect(result.length).toBeLessThanOrEqual(
      PARTNER_CONTRIBUTION_SUGGESTION_LIMIT,
    );
  });
});
