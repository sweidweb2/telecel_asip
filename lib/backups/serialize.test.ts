import { describe, expect, it } from "vitest";

import {
  escapeCsvCell,
  quoteIdent,
  rowsToCsv,
  rowsToSqlInserts,
  selectExpiredAutomatedBackups,
  serializeTableFile,
} from "@/lib/backups/serialize";
import { createBackupSchema } from "@/validations/backup";

describe("backup serializers", () => {
  it("escapes CSV cells with quotes and newlines", () => {
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell("a\nb")).toBe('"a\nb"');
    expect(escapeCsvCell(null)).toBe("");
  });

  it("serializes rows to CSV with header", () => {
    const csv = rowsToCsv([
      { id: "1", name: "Ada" },
      { id: "2", name: "Bo, Jr" },
    ]);
    expect(csv).toBe('id,name\n1,Ada\n2,"Bo, Jr"\n');
  });

  it("serializes SQL inserts with quoted identifiers", () => {
    expect(quoteIdent('weird"name')).toBe('"weird""name"');
    const sql = rowsToSqlInserts("profiles", [
      { id: "a", active: true, meta: { x: 1 } },
    ]);
    expect(sql).toContain('INSERT INTO "profiles"');
    expect(sql).toContain("TRUE");
    expect(sql).toContain("'{\"x\":1}'::jsonb");
  });

  it("picks filenames by format", () => {
    expect(serializeTableFile("blogs", [], "json").filename).toBe("blogs.json");
    expect(serializeTableFile("blogs", [], "csv").filename).toBe("blogs.csv");
    expect(serializeTableFile("blogs", [], "sql").filename).toBe("blogs.sql");
  });

  it("selects expired automated backups beyond retention", () => {
    const rows = [
      { id: "1", created_at: "2026-01-03T00:00:00.000Z" },
      { id: "2", created_at: "2026-01-02T00:00:00.000Z" },
      { id: "3", created_at: "2026-01-01T00:00:00.000Z" },
    ];
    expect(selectExpiredAutomatedBackups(rows, 2).map((r) => r.id)).toEqual([
      "3",
    ]);
    expect(selectExpiredAutomatedBackups(rows, 8)).toEqual([]);
  });
});

describe("createBackupSchema", () => {
  it("accepts full JSON backup", () => {
    const parsed = createBackupSchema.safeParse({
      scope: "full",
      format: "json",
    });
    expect(parsed.success).toBe(true);
  });

  it("requires tables for tables scope", () => {
    const parsed = createBackupSchema.safeParse({
      scope: "tables",
      format: "csv",
      targetTables: [],
    });
    expect(parsed.success).toBe(false);
  });

  it("forces zip for storage", () => {
    expect(
      createBackupSchema.safeParse({ scope: "storage", format: "json" })
        .success,
    ).toBe(false);
    expect(
      createBackupSchema.safeParse({ scope: "storage", format: "zip" })
        .success,
    ).toBe(true);
  });
});
