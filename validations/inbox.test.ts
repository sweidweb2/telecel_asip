import { describe, expect, it } from "vitest";

import { INBOX_STATUSES } from "@/constants/inbox";
import {
  inboxListFilterSchema,
  updateInboxStatusSchema,
} from "@/validations/inbox";

describe("updateInboxStatusSchema", () => {
  const id = "55555555-5555-4555-8555-555555555555";

  it.each(INBOX_STATUSES)("accepts status %s", (inboxStatus) => {
    const result = updateInboxStatusSchema.safeParse({ id, inboxStatus });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown status", () => {
    const result = updateInboxStatusSchema.safeParse({
      id,
      inboxStatus: "spam",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid id", () => {
    const result = updateInboxStatusSchema.safeParse({
      id: "not-a-uuid",
      inboxStatus: "unread",
    });
    expect(result.success).toBe(false);
  });
});

describe("inboxListFilterSchema", () => {
  it("defaults unknown values to inbox", () => {
    expect(inboxListFilterSchema.parse("nope")).toBe("inbox");
  });

  it("accepts all filter values", () => {
    for (const value of ["inbox", "unread", "reviewed", "archived", "any"]) {
      expect(inboxListFilterSchema.parse(value)).toBe(value);
    }
  });
});
