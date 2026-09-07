import { describe, expect, it } from "vitest";

import {
  applyImpactDisplayLocationSuggestion,
  filterImpactClaimLabels,
  filterImpactDisplayLocations,
  filterImpactGeographies,
  getImpactDisplayLocationActiveLine,
  IMPACT_CLAIM_LABELS,
  IMPACT_DISPLAY_LOCATION_OPTIONS,
  IMPACT_GEOGRAPHIES,
  IMPACT_SUGGESTION_LIMIT,
} from "@/constants/impact-suggestions";

describe("filterImpactClaimLabels", () => {
  it("returns browse hints when empty", () => {
    expect(filterImpactClaimLabels("")).toEqual(
      IMPACT_CLAIM_LABELS.slice(0, IMPACT_SUGGESTION_LIMIT),
    );
  });

  it("filters by substring", () => {
    const result = filterImpactClaimLabels("job");
    expect(result.every((label) => /job/i.test(label))).toBe(true);
  });
});

describe("filterImpactGeographies", () => {
  it("returns browse hints when empty", () => {
    expect(filterImpactGeographies("")).toEqual(
      IMPACT_GEOGRAPHIES.slice(0, IMPACT_SUGGESTION_LIMIT),
    );
  });

  it("filters by substring", () => {
    const result = filterImpactGeographies("west");
    expect(result).toContain("West Africa");
  });
});

describe("impact display location line helpers", () => {
  it("reads only the active line", () => {
    expect(getImpactDisplayLocationActiveLine("impact_page\nhome")).toBe(
      "home",
    );
    expect(getImpactDisplayLocationActiveLine("impact_page\n")).toBe("");
  });

  it("replaces the active line on select", () => {
    expect(
      applyImpactDisplayLocationSuggestion(
        "impact_page\nhome",
        "homepage_module_02",
      ),
    ).toBe("impact_page\nhomepage_module_02");
  });

  it("filters using the active line", () => {
    const result = filterImpactDisplayLocations("impact_page\nhome");
    expect(result).toContain("homepage_module_02");
    expect(result.every((item) => /home/i.test(item))).toBe(true);
  });

  it("caps browse hints", () => {
    expect(filterImpactDisplayLocations("")).toEqual(
      IMPACT_DISPLAY_LOCATION_OPTIONS.slice(0, IMPACT_SUGGESTION_LIMIT),
    );
  });
});
