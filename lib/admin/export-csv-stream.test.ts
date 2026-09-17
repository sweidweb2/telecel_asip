import { describe, expect, it, vi } from "vitest";

import {
  csvReadableStream,
  iterateExportRows,
} from "@/lib/admin/export-csv-stream";

describe("iterateExportRows", () => {
  it("pages until a short response and does not mark truncated", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce([{ id: "1" }, { id: "2" }])
      .mockResolvedValueOnce([{ id: "3" }]);

    const rows: Record<string, unknown>[] = [];
    const iterator = iterateExportRows(fetchPage, 10, 2);
    let next = await iterator.next();
    while (!next.done) {
      rows.push(next.value);
      next = await iterator.next();
    }

    expect(rows.map((row) => row.id)).toEqual(["1", "2", "3"]);
    expect(next.value).toEqual({ truncated: false, rowCount: 3 });
    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(fetchPage).toHaveBeenNthCalledWith(1, 0, 1);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 2, 3);
  });

  it("stops at maxRows and marks truncated", async () => {
    const fetchPage = vi.fn().mockResolvedValue([{ id: "a" }, { id: "b" }]);

    const rows: Record<string, unknown>[] = [];
    const iterator = iterateExportRows(fetchPage, 3, 2);
    let next = await iterator.next();
    while (!next.done) {
      rows.push(next.value);
      next = await iterator.next();
    }

    expect(rows).toHaveLength(3);
    expect(next.value).toEqual({ truncated: true, rowCount: 3 });
  });
});

describe("csvReadableStream", () => {
  it("streams a header and escaped rows", async () => {
    async function* rows() {
      yield { id: "1", name: "Ada" };
      yield { id: "2", name: "Bo, Jr" };
    }

    const stream = csvReadableStream(["id", "name"], rows());
    const text = await new Response(stream).text();
    expect(text).toBe('id,name\n1,Ada\n2,"Bo, Jr"\n');
  });
});
