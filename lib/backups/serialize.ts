/** Pure serializers for backup table dumps (JSON / CSV / SQL INSERT). */

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0] ?? {});
  const header = columns.join(",");
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvCell(row[column])).join(","),
  );
  return `${[header, ...lines].join("\n")}\n`;
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "NULL";
    return String(value);
  }
  if (typeof value === "object") {
    const json = JSON.stringify(value).replaceAll("'", "''");
    return `'${json}'::jsonb`;
  }
  const text = String(value).replaceAll("'", "''");
  return `'${text}'`;
}

/** Quote an identifier safely for generated INSERT dumps. */
export function quoteIdent(name: string): string {
  return `"${name.replaceAll('"', '""')}"`;
}

export function rowsToSqlInserts(
  table: string,
  rows: Record<string, unknown>[],
): string {
  if (rows.length === 0) {
    return `-- ${table}: 0 rows\n`;
  }
  const columns = Object.keys(rows[0] ?? {});
  const colList = columns.map(quoteIdent).join(", ");
  const statements = rows.map((row) => {
    const values = columns.map((column) => sqlLiteral(row[column])).join(", ");
    return `INSERT INTO ${quoteIdent(table)} (${colList}) VALUES (${values});`;
  });
  return `${statements.join("\n")}\n`;
}

export function rowsToJsonFile(rows: Record<string, unknown>[]): string {
  return `${JSON.stringify(rows, null, 2)}\n`;
}

export type BackupDbFormat = "json" | "csv" | "sql";

export function serializeTableFile(
  table: string,
  rows: Record<string, unknown>[],
  format: BackupDbFormat,
): { filename: string; content: string } {
  switch (format) {
    case "json":
      return { filename: `${table}.json`, content: rowsToJsonFile(rows) };
    case "csv":
      return { filename: `${table}.csv`, content: rowsToCsv(rows) };
    case "sql":
      return { filename: `${table}.sql`, content: rowsToSqlInserts(table, rows) };
  }
}

/** Keep the newest `keep` items; return the rest for deletion. */
export function selectExpiredAutomatedBackups<T extends { created_at: string }>(
  rows: T[],
  keep: number,
): T[] {
  if (keep < 1) return [...rows];
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return sorted.slice(keep);
}
