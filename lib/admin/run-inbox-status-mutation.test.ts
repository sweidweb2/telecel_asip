import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/run-admin-mutation", () => ({
  runAdminMutation: vi.fn(),
}));

import { runAdminMutation } from "@/lib/admin/run-admin-mutation";
import { runInboxStatusMutation } from "@/lib/admin/run-inbox-status-mutation";

describe("runInboxStatusMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(runAdminMutation).mockResolvedValue({
      status: "success",
      message: "ok",
    });
  });

  it("delegates to runAdminMutation with the inbox table update", async () => {
    const refresh = vi.fn();
    const messages = {
      unauthorized: "no",
      signedInRequired: "sign-in",
      invalidDetails: "invalid",
      success: "updated",
      genericError: "generic",
      notFound: "missing",
    };

    await runInboxStatusMutation({
      table: "applications",
      input: {
        id: "11111111-1111-4111-8111-111111111111",
        inboxStatus: "reviewed",
      },
      messages,
      refresh,
    });

    expect(runAdminMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          id: "11111111-1111-4111-8111-111111111111",
          inboxStatus: "reviewed",
        },
        messages,
        refresh,
      }),
    );

    const call = vi.mocked(runAdminMutation).mock.calls[0]?.[0];
    expect(call?.execute).toBeTypeOf("function");

    const maybeSingle = vi.fn(async () => ({
      data: { id: "1" },
      error: null,
    }));
    const select = vi.fn(() => ({ maybeSingle }));
    const eq = vi.fn(() => ({ eq, select }));
    const from = vi.fn(() => ({
      update: vi.fn(() => ({ eq })),
    }));

    const result = await call!.execute(
      { status: "success", userId: "u1", supabase: { from } } as never,
      {
        id: "11111111-1111-4111-8111-111111111111",
        inboxStatus: "reviewed",
        onlyIfStatus: "unread",
      },
    );

    expect(from).toHaveBeenCalledWith("applications");
    expect(eq).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
    expect(eq).toHaveBeenCalledWith("inbox_status", "unread");
    expect(result).toEqual({ status: "success" });
  });
});
