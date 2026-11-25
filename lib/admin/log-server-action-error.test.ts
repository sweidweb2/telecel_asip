import { afterEach, describe, expect, it, vi } from "vitest";

import { logServerActionError } from "@/lib/admin/log-server-action-error";

describe("logServerActionError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs code and message without inventing fields", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    logServerActionError("[test-scope]", {
      code: "23505",
      message: "duplicate key",
    }, { kind: "duplicate" });

    expect(errorSpy).toHaveBeenCalledWith("[test-scope]", {
      code: "23505",
      message: "duplicate key",
      kind: "duplicate",
    });
  });

  it("stringifies unknown errors", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    logServerActionError("[test-scope]", "boom");

    expect(errorSpy).toHaveBeenCalledWith("[test-scope]", {
      code: undefined,
      message: "boom",
    });
  });
});
