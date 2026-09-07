import { describe, expect, it } from "vitest";

import {
  createImpactMetricSchema,
  IMPACT_CLAIM_LABEL_MAX,
  IMPACT_METRIC_PAGE_SIZE,
  parseImpactMetricListQuery,
  updateImpactMetricSchema,
} from "@/validations/impact-metric";

const evidenceId = "00000000-0000-4000-8000-000000000001";

const base = {
  claimLabel: "Applications",
  value: "10,000+",
  unit: "founders",
  periodStart: "2019-01-01",
  periodEnd: "2025-12-31",
  geography: "Africa",
  impactLens: "pipeline" as const,
  displayLocations: ["homepage_module_02", "impact_page"],
  evidenceId,
  publishStatus: "pending" as const,
};

describe("createImpactMetricSchema", () => {
  it("accepts a complete metric and normalises display locations from a string", () => {
    const parsed = createImpactMetricSchema.parse({
      ...base,
      displayLocations: "homepage_module_02, impact_page\ninsights",
    });
    expect(parsed.displayLocations).toEqual([
      "homepage_module_02",
      "impact_page",
      "insights",
    ]);
    expect(parsed.claimLabel).toBe("Applications");
  });

  it("allows optional fields to be empty and lens to be null", () => {
    const parsed = createImpactMetricSchema.parse({
      claimLabel: "Women-led",
      value: "70%",
      unit: "",
      periodStart: "2024-01-01",
      periodEnd: "2024-12-31",
      geography: "",
      impactLens: null,
      displayLocations: "",
      evidenceId,
      publishStatus: "verified",
    });
    expect(parsed.unit).toBe("");
    expect(parsed.geography).toBe("");
    expect(parsed.impactLens).toBeNull();
    expect(parsed.displayLocations).toEqual([]);
  });

  it("rejects a missing evidence id and an inverted period", () => {
    expect(
      createImpactMetricSchema.safeParse({
        ...base,
        evidenceId: "",
      }).success,
    ).toBe(false);
    expect(
      createImpactMetricSchema.safeParse({
        ...base,
        periodStart: "2025-01-01",
        periodEnd: "2024-01-01",
      }).success,
    ).toBe(false);
  });

  it("rejects an over-long claim label and an unknown lens", () => {
    expect(
      createImpactMetricSchema.safeParse({
        ...base,
        claimLabel: "a".repeat(IMPACT_CLAIM_LABEL_MAX + 1),
      }).success,
    ).toBe(false);
    expect(
      createImpactMetricSchema.safeParse({
        ...base,
        impactLens: "unknown_lens",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown publish status", () => {
    expect(
      createImpactMetricSchema.safeParse({
        ...base,
        publishStatus: "approved",
      }).success,
    ).toBe(false);
  });
});

describe("updateImpactMetricSchema", () => {
  it("requires a uuid id", () => {
    expect(
      updateImpactMetricSchema.safeParse({ ...base, id: "not-a-uuid" }).success,
    ).toBe(false);
    expect(
      updateImpactMetricSchema.safeParse({
        ...base,
        id: "00000000-0000-4000-8000-000000000000",
      }).success,
    ).toBe(true);
  });
});

describe("parseImpactMetricListQuery", () => {
  it("defaults page, search, lens, and publish status", () => {
    const query = parseImpactMetricListQuery({});
    expect(query).toEqual({
      page: 1,
      search: "",
      lens: "all",
      publishStatus: "all",
      pageSize: IMPACT_METRIC_PAGE_SIZE,
    });
  });

  it("parses valid filters and falls back on invalid ones", () => {
    const query = parseImpactMetricListQuery({
      page: "3",
      search: " women ",
      lens: "inclusion",
      publishStatus: "verified",
    });
    expect(query.page).toBe(3);
    expect(query.search).toBe("women");
    expect(query.lens).toBe("inclusion");
    expect(query.publishStatus).toBe("verified");

    const fallback = parseImpactMetricListQuery({
      lens: "nope",
      publishStatus: "draft",
      page: "0",
    });
    expect(fallback.lens).toBe("all");
    expect(fallback.publishStatus).toBe("all");
    expect(fallback.page).toBe(1);
  });
});
