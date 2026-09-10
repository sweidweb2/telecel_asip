import { escapeCsvCell } from "@/lib/backups/serialize";

export const EXPORT_MAX_ROWS = 5_000;
export const EXPORT_PAGE_SIZE = 500;

type FetchExportPage = (
  from: number,
  to: number,
) => Promise<Record<string, unknown>[]>;

/**
 * Walk an export in PostgREST-sized pages up to `maxRows`.
 * Stops early when a page is short.
 */
export async function* iterateExportRows(
  fetchPage: FetchExportPage,
  maxRows = EXPORT_MAX_ROWS,
  pageSize = EXPORT_PAGE_SIZE,
): AsyncGenerator<Record<string, unknown>, { truncated: boolean; rowCount: number }> {
  let from = 0;
  let rowCount = 0;

  while (rowCount < maxRows) {
    const size = Math.min(pageSize, maxRows - rowCount);
    const rows = await fetchPage(from, from + size - 1);
    if (rows.length === 0) {
      return { truncated: false, rowCount };
    }
    for (const row of rows) {
      yield row;
      rowCount += 1;
      if (rowCount >= maxRows) {
        return { truncated: true, rowCount };
      }
    }
    if (rows.length < size) {
      return { truncated: false, rowCount };
    }
    from += size;
  }

  return { truncated: true, rowCount };
}

/** Stream a CSV (header + rows) without buffering the whole file. */
export function csvReadableStream(
  columns: string[],
  rows: AsyncIterable<Record<string, unknown>>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(`${columns.join(",")}\n`));
        for await (const row of rows) {
          const line = `${columns.map((column) => escapeCsvCell(row[column])).join(",")}\n`;
          controller.enqueue(encoder.encode(line));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
