import { describe, expect, it } from "vitest";

import {
  backupListFilterParams,
  createBackupSchema,
  getBackupDownloadUrlSchema,
  parseBackupListQuery,
} from "@/validations/backup";

describe("createBackupSchema", () => {
  it("accepts full JSON backup", () => {
    expect(
      createBackupSchema.safeParse({ scope: "full", format: "json" }).success,
    ).toBe(true);
  });

  it("accepts storage ZIP", () => {
    expect(
      createBackupSchema.safeParse({ scope: "storage", format: "zip" }).success,
    ).toBe(true);
  });

  it("rejects storage with JSON", () => {
    expect(
      createBackupSchema.safeParse({ scope: "storage", format: "json" })
        .success,
    ).toBe(false);
  });

  it("rejects DB scopes with ZIP", () => {
    expect(
      createBackupSchema.safeParse({ scope: "full", format: "zip" }).success,
    ).toBe(false);
  });

  it("rejects tables scope for new backups", () => {
    expect(
      createBackupSchema.safeParse({
        scope: "tables",
        format: "json",
        targetTables: ["blogs"],
      }).success,
    ).toBe(false);
  });
});

describe("getBackupDownloadUrlSchema", () => {
  it("accepts a uuid", () => {
    expect(
      getBackupDownloadUrlSchema.safeParse({
        backupId: "11111111-1111-4111-8111-111111111111",
      }).success,
    ).toBe(true);
  });

  it("rejects non-uuid", () => {
    expect(
      getBackupDownloadUrlSchema.safeParse({ backupId: "nope" }).success,
    ).toBe(false);
  });
});

describe("parseBackupListQuery", () => {
  it("defaults page and pageSize", () => {
    expect(parseBackupListQuery({})).toEqual({ page: 1, pageSize: 25 });
  });

  it("parses pageSize from search params", () => {
    expect(parseBackupListQuery({ page: "2", pageSize: "50" })).toEqual({
      page: 2,
      pageSize: 50,
    });
  });
});

describe("backupListFilterParams", () => {
  it("omits default pageSize", () => {
    expect(backupListFilterParams({ page: 1, pageSize: 25 })).toEqual({
      pageSize: undefined,
    });
  });

  it("keeps non-default pageSize", () => {
    expect(backupListFilterParams({ page: 1, pageSize: 50 })).toEqual({
      pageSize: "50",
    });
  });
});
