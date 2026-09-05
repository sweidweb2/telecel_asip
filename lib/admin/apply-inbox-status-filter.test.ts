import { describe, expect, it } from "vitest";

import { applyInboxStatusFilter } from "@/lib/admin/apply-inbox-status-filter";

function mockQuery() {
  const calls: Array<{ method: string; args: string[] }> = [];
  const query = {
    eq(column: string, value: string) {
      calls.push({ method: "eq", args: [column, value] });
      return query;
    },
    neq(column: string, value: string) {
      calls.push({ method: "neq", args: [column, value] });
      return query;
    },
  };
  return { query, calls };
}

describe("applyInboxStatusFilter", () => {
  it("excludes archived for inbox", () => {
    const { query, calls } = mockQuery();
    applyInboxStatusFilter(query, "inbox");
    expect(calls).toEqual([
      { method: "neq", args: ["inbox_status", "archived"] },
    ]);
  });

  it("filters by exact status", () => {
    const { query, calls } = mockQuery();
    applyInboxStatusFilter(query, "unread");
    expect(calls).toEqual([
      { method: "eq", args: ["inbox_status", "unread"] },
    ]);
  });

  it("skips filter for any", () => {
    const { query, calls } = mockQuery();
    applyInboxStatusFilter(query, "any");
    expect(calls).toEqual([]);
  });
});
