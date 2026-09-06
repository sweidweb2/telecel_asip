/** Pure serializers for backup JSON dumps and shared CSV helpers (Quick CSV). */

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

/** CSV with an explicit column order (Quick CSV exports). */
export function rowsToCsv(
  columns: string[],
  rows: Record<string, unknown>[],
): string {
  const header = columns.join(",");
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvCell(row[column])).join(","),
  );
  return `${[header, ...lines].join("\n")}\n`;
}

export function rowsToJsonFile(rows: Record<string, unknown>[]): string {
  return `${JSON.stringify(rows, null, 2)}\n`;
}

export function serializeTableFile(
  table: string,
  rows: Record<string, unknown>[],
): { filename: string; content: string } {
  return { filename: `${table}.json`, content: rowsToJsonFile(rows) };
}
