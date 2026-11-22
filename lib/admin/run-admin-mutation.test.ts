import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { DASHBOARD_NAV_COUNTS_CACHE_TAG } from "@/constants/dashboard-nav-counts";
import { ROUTES } from "@/constants/routes";
import {
  refreshAdminResource,
  runAdminMutation,
} from "@/lib/admin/run-admin-mutation";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
  revalidateTag,
}));

vi.mock("@/lib/admin/authorize-editor", () => ({
  authorizeEditor: vi.fn(async () => ({
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

describe("refreshAdminResource", () => {
  it("revalidates the editor nav-count tag on every write", () => {
    refreshAdminResource({
      listPath: ROUTES.blogs,
      cacheTags: ["blogs"],
    });

    expect(revalidatePath).toHaveBeenCalledWith(ROUTES.blogs);
    expect(revalidateTag).toHaveBeenCalledWith(
      DASHBOARD_NAV_COUNTS_CACHE_TAG,
      "max",
    );
    expect(revalidateTag).toHaveBeenCalledWith("blogs", "max");
  });

  it("skips the nav-count tag when bustNavCounts is false", () => {
    revalidatePath.mockClear();
    revalidateTag.mockClear();

    refreshAdminResource({
      listPath: ROUTES.applications,
      cacheTags: ["applications"],
      bustNavCounts: false,
    });

    expect(revalidatePath).toHaveBeenCalledWith(ROUTES.applications);
    expect(revalidateTag).toHaveBeenCalledWith("applications", "max");
    expect(revalidateTag).not.toHaveBeenCalledWith(
      DASHBOARD_NAV_COUNTS_CACHE_TAG,
      "max",
    );
  });

  it("revalidates cache tags without a list path", () => {
    revalidatePath.mockClear();
    revalidateTag.mockClear();

    refreshAdminResource({
      cacheTags: ["investor-interests"],
      bustNavCounts: false,
    });

    expect(revalidatePath).not.toHaveBeenCalled();
    expect(revalidateTag).toHaveBeenCalledWith("investor-interests", "max");
    expect(revalidateTag).not.toHaveBeenCalledWith(
      DASHBOARD_NAV_COUNTS_CACHE_TAG,
      "max",
    );
  });
});
