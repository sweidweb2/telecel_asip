import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "@/lib/auth/safe-redirect-path";

describe("safeRedirectPath", () => {
  const fallback = "/en";

  it("keeps a same-origin relative path", () => {
    expect(safeRedirectPath("/dashboard/users", fallback)).toBe(
      "/dashboard/users",
    );
  });

  it("falls back for missing, protocol-relative, and absolute URLs", () => {
    expect(safeRedirectPath(undefined, fallback)).toBe(fallback);
    expect(safeRedirectPath(null, fallback)).toBe(fallback);
    expect(safeRedirectPath("", fallback)).toBe(fallback);
    expect(safeRedirectPath("//evil.example", fallback)).toBe(fallback);
    expect(safeRedirectPath("https://evil.example", fallback)).toBe(fallback);
  });
});
