import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { runAdminMutation } from "@/lib/admin/run-admin-mutation";

vi.mock("@/lib/admin/authorize-admin", () => ({
  authorizeAdmin: vi.fn(async () => ({
    status: "success" as const,
    userId: "user-1",
    supabase: {},
  })),
}));

describe("runAdminMutation", () => {
  const schema = z.object({
    id: z.string().uuid(),
  });

  const messages = {
    unauthorized: "unauthorized",
    signedInRequired: "signed in",
    invalidDetails: "invalid",
    success: "ok",
    genericError: "generic",
  };

  it("returns validation error without calling execute", async () => {
    const execute = vi.fn();
    const result = await runAdminMutation({
      schema,
      input: { id: "not-a-uuid" },
      messages,
      execute,
    });

    expect(result.status).toBe("error");
    expect(execute).not.toHaveBeenCalled();
  });

  it("runs execute and refresh on success", async () => {
    const refresh = vi.fn();
    const result = await runAdminMutation({
      schema,
      input: { id: "11111111-1111-4111-8111-111111111111" },
      messages,
      execute: async () => ({ status: "success", id: "11111111-1111-4111-8111-111111111111" }),
      refresh,
    });

    expect(result).toEqual({
      status: "success",
      message: "ok",
      id: "11111111-1111-4111-8111-111111111111",
    });
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("returns execute message errors as-is", async () => {
    const result = await runAdminMutation({
      schema,
      input: { id: "11111111-1111-4111-8111-111111111111" },
      messages,
      execute: async () => ({
        status: "error",
        message: "not found",
      }),
    });

    expect(result).toEqual({ status: "error", message: "not found" });
  });
});
