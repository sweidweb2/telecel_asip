import { describe, expect, it } from "vitest";

import {
  COHORT_PAGE_SIZE,
  COHORT_PUBLIC_LABEL_MAX,
  createCohortSchema,
  parseCohortListQuery,
  updateCohortSchema,
} from "@/validations/cohort";

const base = {
  year: 2025,
  publicLabel: "2025 Portfolio Support Year",
  programmeDatesStart: "2025-01-01",
  programmeDatesEnd: "2025-12-31",
  programmeStatus: "closed" as const,
  summary: "Portfolio support year for ASIP founders.",
  mediaUrl: "https://example.com/media.webp",
  publishStatus: "draft" as const,
  partnerIds: ["11111111-1111-4111-8111-111111111111"],
  startupIds: ["22222222-2222-4222-8222-222222222222"],
};

describe("createCohortSchema", () => {
  it("accepts a complete cohort", () => {
    const parsed = createCohortSchema.parse(base);
    expect(parsed.year).toBe(2025);
    expect(parsed.partnerIds).toHaveLength(1);
    expect(parsed.startupIds).toHaveLength(1);
  });

  it("allows empty optional fields and empty link arrays", () => {
    const parsed = createCohortSchema.parse({
      year: 2019,
      publicLabel: "2019 Cohort",
      programmeDatesStart: "",
      programmeDatesEnd: "",
      programmeStatus: "hold",
      summary: "",
      mediaUrl: "",
      publishStatus: "published",
      partnerIds: [],
      startupIds: [],
    });
    expect(parsed.summary).toBe("");
    expect(parsed.mediaUrl).toBe("");
    expect(parsed.partnerIds).toEqual([]);
  });

  it("rejects an over-long label, a non-http media URL, and inverted dates", () => {
    expect(
      createCohortSchema.safeParse({
        ...base,
        publicLabel: "a".repeat(COHORT_PUBLIC_LABEL_MAX + 1),
      }).success,
    ).toBe(false);
    expect(
      createCohortSchema.safeParse({
        ...base,
        mediaUrl: "ftp://example.com/x",
      }).success,
    ).toBe(false);
    expect(
      createCohortSchema.safeParse({
        ...base,
        programmeDatesStart: "2025-06-01",
        programmeDatesEnd: "2025-01-01",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown programme status and invalid link ids", () => {
    expect(
      createCohortSchema.safeParse({
        ...base,
        programmeStatus: "ongoing",
      }).success,
    ).toBe(false);
    expect(
      createCohortSchema.safeParse({
        ...base,
        partnerIds: ["not-a-uuid"],
      }).success,
    ).toBe(false);
  });
});

describe("updateCohortSchema", () => {
  it("requires a valid id", () => {
    expect(updateCohortSchema.safeParse(base).success).toBe(false);
    expect(
      updateCohortSchema.safeParse({
        ...base,
        id: "33333333-3333-4333-8333-333333333333",
      }).success,
    ).toBe(true);
  });
});

describe("parseCohortListQuery", () => {
  it("applies defaults and page size", () => {
    const query = parseCohortListQuery({});
    expect(query).toEqual({
      page: 1,
      search: "",
      status: "all",
      pageSize: COHORT_PAGE_SIZE,
    });
  });

  it("parses search and status filters", () => {
    const query = parseCohortListQuery({
      page: "2",
      search: "Portfolio",
      status: "published",
    });
    expect(query.page).toBe(2);
    expect(query.search).toBe("Portfolio");
    expect(query.status).toBe("published");
  });
});
