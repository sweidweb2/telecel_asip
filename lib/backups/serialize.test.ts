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

  it("neutralizes spreadsheet formula injection prefixes", () => {
    expect(escapeCsvCell("=CMD('calc')")).toBe("'=CMD('calc')");
    expect(escapeCsvCell("+1+1")).toBe("'+1+1");
    expect(escapeCsvCell("-2+3")).toBe("'-2+3");
    expect(escapeCsvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(escapeCsvCell(' =HYPERLINK("http://evil")')).toBe(
      `"' =HYPERLINK(""http://evil"")"`,
    );
    expect(escapeCsvCell("safe text")).toBe("safe text");
    expect(escapeCsvCell("email@example.com")).toBe("email@example.com");
  });

  it("serializes rows to CSV with explicit columns", () => {
    const csv = rowsToCsv(
      ["id", "name"],
      [
        { id: "1", name: "Ada" },
        { id: "2", name: "Bo, Jr" },
        { id: "3", name: "=1+1" },
      ],
    );
    expect(csv).toBe('id,name\n1,Ada\n2,"Bo, Jr"\n3,\'=1+1\n');
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

  it("rejects tables scope", () => {
    const parsed = createBackupSchema.safeParse({
      scope: "tables",
      format: "json",
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
