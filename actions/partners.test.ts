import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag, authorizeEditor } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  authorizeEditor: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
  revalidateTag,
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock("@/lib/admin/authorize-editor", () => ({
  authorizeEditor,
}));

import {
  createPartner,
  deletePartner,
  updatePartner,
} from "@/actions/partners";

const partnerId = "33333333-3333-4333-8333-333333333333";

const validCreate = {
  name: "E2E Partners Mentors",
  org: "Ecosystem Co",
  type: "mentors" as const,
  contribution: "Mentoring and market intros.",
  isActive: true,
  logoPermission: false,
  link: "",
  sortOrder: 1,
};

function mockSession(
  fromImpl: ReturnType<typeof vi.fn>,
  rpcImpl: ReturnType<typeof vi.fn> = vi.fn(),
) {
  authorizeEditor.mockResolvedValue({
    status: "success",
    userId: "admin-1",
    supabase: {
      from: fromImpl,
      rpc: rpcImpl,
      storage: {
        from: vi.fn(() => ({
          list: vi.fn().mockResolvedValue({ data: [], error: null }),
          remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      },
    },
  });
}

describe("partners actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid create input", async () => {
    const result = await createPartner({ ...validCreate, name: "x" });
    expect(result.status).toBe("error");
    expect(authorizeEditor).not.toHaveBeenCalled();
  });

  it("rejects unauthorized create", async () => {
    authorizeEditor.mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage partners.",
    });
    await expect(createPartner(validCreate)).resolves.toEqual({
      status: "error",
      message: "You do not have permission to manage partners.",
    });
  });

  it("creates, updates, and deletes a partner", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: partnerId }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ id: partnerId }],
        error: null,
      });
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const existingMaybe = vi.fn().mockResolvedValue({
      data: { id: partnerId, logo_url: null },
      error: null,
    });

    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: existingMaybe })),
      })),
      delete: vi.fn(() => ({ eq: deleteEq })),
    }));

    mockSession(from, rpc);

    await expect(createPartner(validCreate)).resolves.toMatchObject({
      status: "success",
      id: partnerId,
    });
    expect(rpc).toHaveBeenCalledWith("create_partner_with_sort_order", {
      p_partner: expect.objectContaining({ name: validCreate.name }),
    });
    await expect(
      updatePartner({ ...validCreate, id: partnerId, name: "Updated Partner" }),
    ).resolves.toMatchObject({ status: "success", id: partnerId });
    expect(rpc).toHaveBeenCalledWith("update_partner_with_sort_order", {
      p_id: partnerId,
      p_partner: expect.objectContaining({ name: "Updated Partner" }),
    });
    await expect(deletePartner({ id: partnerId })).resolves.toMatchObject({
      status: "success",
    });
    expect(revalidatePath).toHaveBeenCalled();
  });
});
