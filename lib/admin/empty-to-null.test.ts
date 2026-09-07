import { describe, expect, it } from "vitest";

import { emptyToNull } from "@/lib/admin/empty-to-null";

describe("emptyToNull", () => {
  it("returns null for empty, whitespace, null, and undefined", () => {
    expect(emptyToNull("")).toBeNull();
    expect(emptyToNull("   ")).toBeNull();
    expect(emptyToNull(null)).toBeNull();
    expect(emptyToNull(undefined)).toBeNull();
  });

  it("trims non-empty strings", () => {
    expect(emptyToNull("  hello  ")).toBe("hello");
  });
});
