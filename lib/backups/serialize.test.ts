import { describe, expect, it } from "vitest";

import {
  escapeCsvCell,
  rowsToCsv,
  serializeTableFile,
} from "@/lib/backups/serialize";
import { createBackupSchema } from "@/validations/backup";

describe("backup serializers", () => {
  it("escapes CSV cells with quotes and newlines", () => {
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell("a\nb")).toBe('"a\nb"');
    expect(escapeCsvCell(null)).toBe("");
  });

  it("serializes rows to CSV with explicit columns", () => {
    const csv = rowsToCsv(
      ["id", "name"],
      [
        { id: "1", name: "Ada" },
        { id: "2", name: "Bo, Jr" },
      ],
    );
    expect(csv).toBe('id,name\n1,Ada\n2,"Bo, Jr"\n');
  });

  it("writes JSON table dumps", () => {
    const file = serializeTableFile("blogs", [{ id: 1 }]);
    expect(file.filename).toBe("blogs.json");
    expect(file.content).toContain('"id": 1');
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
      format: "json",
      targetTables: [],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects csv/sql for new backups", () => {
    expect(
      createBackupSchema.safeParse({ scope: "full", format: "csv" }).success,
    ).toBe(false);
    expect(
      createBackupSchema.safeParse({ scope: "full", format: "sql" }).success,
    ).toBe(false);
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
