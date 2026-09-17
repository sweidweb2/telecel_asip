/** Pure serializers for backup JSON dumps and shared CSV helpers (Quick CSV). */

/**
 * Spreadsheet formula triggers (Excel / LibreOffice / Google Sheets).
 * Leading whitespace does not remove the risk.
 */
const CSV_FORMULA_PREFIX = /^[\t\r ]*[=+\-@]/;

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  // Force text so staff opening the CSV cannot execute injected formulas.
  if (CSV_FORMULA_PREFIX.test(text)) {
    text = `'${text}`;
  }

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
