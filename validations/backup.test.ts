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
  it("defaults page, pageSize, filters, and sort", () => {
    expect(parseBackupListQuery({})).toEqual({
      page: 1,
      pageSize: 25,
      status: "all",
      scope: "all",
      sort: "created_at",
      dir: "desc",
    });
  });

  it("parses filters and sort from search params", () => {
    expect(
      parseBackupListQuery({
        page: "2",
        pageSize: "50",
        status: "failed",
        scope: "storage",
        sort: "file_size",
        dir: "asc",
      }),
    ).toEqual({
      page: 2,
      pageSize: 50,
      status: "failed",
      scope: "storage",
      sort: "file_size",
      dir: "asc",
    });
  });
});

describe("backupListFilterParams", () => {
  it("omits defaults", () => {
    expect(
      backupListFilterParams({
        page: 1,
        pageSize: 25,
        status: "all",
        scope: "all",
        sort: "created_at",
        dir: "desc",
      }),
    ).toEqual({
      status: undefined,
      scope: undefined,
      sort: undefined,
      dir: undefined,
      pageSize: undefined,
    });
  });

  it("keeps non-default filters and sort", () => {
    expect(
      backupListFilterParams({
        page: 1,
        pageSize: 50,
        status: "completed",
        scope: "automated",
        sort: "status",
        dir: "asc",
      }),
    ).toEqual({
      status: "completed",
      scope: "automated",
      sort: "status",
      dir: "asc",
      pageSize: "50",
    });
  });
});
