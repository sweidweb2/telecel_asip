import { describe, expect, it } from "vitest";

import { escapeIlikePattern } from "@/lib/admin/escape-ilike";

describe("escapeIlikePattern", () => {
  it("escapes backslash, percent, underscore, and double quote", () => {
    expect(escapeIlikePattern(`a\\b%c_d"e`)).toBe(`a\\\\b\\%c\\_d\\"e`);
  });

  it("leaves plain search text unchanged", () => {
    expect(escapeIlikePattern("telecel")).toBe("telecel");
  });
});
