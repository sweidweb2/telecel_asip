import { describe, expect, it } from "vitest";

import {
  createEvidenceRecordSchema,
  EVIDENCE_PAGE_SIZE,
  EVIDENCE_PRIMARY_SOURCE_MAX,
  parseEvidenceListQuery,
  updateEvidenceRecordSchema,
} from "@/validations/evidence-record";

const ownerId = "11111111-1111-4111-8111-111111111111";

const base = {
  primarySource: "ASIP Holdings FY 2025 Report, p.12",
  sourceFileUrl: "https://example.com/report.pdf",
  measurementPeriodStart: "2024-01-01",
  measurementPeriodEnd: "2024-12-31",
  ownerId,
  status: "pending" as const,
  lastVerifiedDate: "2025-01-15",
  permission: "internal_only" as const,
  reviewDate: "2025-06-01",
};

describe("createEvidenceRecordSchema", () => {
  it("accepts a complete evidence record", () => {
    const parsed = createEvidenceRecordSchema.parse(base);
    expect(parsed.primarySource).toBe(base.primarySource);
    expect(parsed.status).toBe("pending");
    expect(parsed.sourceFileUrl).toBe(base.sourceFileUrl);
  });

  it("allows an empty source file URL", () => {
    const parsed = createEvidenceRecordSchema.parse({
      ...base,
      sourceFileUrl: "",
    });
    expect(parsed.sourceFileUrl).toBe("");
  });

  it("rejects a short primary source, over-long source, and non-http URL", () => {
    expect(
      createEvidenceRecordSchema.safeParse({ ...base, primarySource: "A" })
        .success,
    ).toBe(false);
    expect(
      createEvidenceRecordSchema.safeParse({
        ...base,
        primarySource: "a".repeat(EVIDENCE_PRIMARY_SOURCE_MAX + 1),
      }).success,
    ).toBe(false);
    expect(
      createEvidenceRecordSchema.safeParse({
        ...base,
        sourceFileUrl: "ftp://example.com/file.pdf",
      }).success,
    ).toBe(false);
  });

  it("rejects a period end before the start", () => {
    const result = createEvidenceRecordSchema.safeParse({
      ...base,
      measurementPeriodStart: "2024-06-01",
      measurementPeriodEnd: "2024-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid owner id and unknown status", () => {
    expect(
      createEvidenceRecordSchema.safeParse({ ...base, ownerId: "not-a-uuid" })
        .success,
    ).toBe(false);
    expect(
      createEvidenceRecordSchema.safeParse({ ...base, status: "draft" })
        .success,
    ).toBe(false);
  });
});

describe("updateEvidenceRecordSchema", () => {
  it("requires a uuid id", () => {
    expect(
      updateEvidenceRecordSchema.safeParse({ ...base, id: ownerId }).success,
    ).toBe(true);
    expect(
      updateEvidenceRecordSchema.safeParse({ ...base, id: "bad" }).success,
    ).toBe(false);
  });
});

describe("parseEvidenceListQuery", () => {
  it("applies defaults", () => {
    const query = parseEvidenceListQuery({});
    expect(query).toEqual({
      page: 1,
      search: "",
      status: "all",
      permission: "all",
      pageSize: EVIDENCE_PAGE_SIZE,
    });
  });

  it("uses the first array value and catches invalid filters", () => {
    expect(
      parseEvidenceListQuery({
        page: ["3"],
        search: ["pipeline"],
        status: ["verified"],
        permission: ["public"],
      }),
    ).toMatchObject({
      page: 3,
      search: "pipeline",
      status: "verified",
      permission: "public",
    });

    expect(
      parseEvidenceListQuery({
        page: "nope",
        status: "unknown",
        permission: "unknown",
      }),
    ).toMatchObject({
      page: 1,
      status: "all",
      permission: "all",
    });
  });
});
