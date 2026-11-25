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

vi.mock("@/lib/admin/authorize-role", () => ({
  authorizeEditor,
}));

import {
  createCohort,
  deleteCohort,
  updateCohort,
} from "@/actions/cohorts";

const cohortId = "44444444-4444-4444-8444-444444444444";

const validCreate = {
  year: 2026,
  publicLabel: "ASIP 2026",
  programmeDatesStart: "2026-01-01",
  programmeDatesEnd: "2026-12-31",
  programmeStatus: "closed" as const,
  summary: "",
  mediaUrl: "",
  publishStatus: "draft" as const,
  partnerIds: [] as string[],
  startupIds: [] as string[],
};

describe("cohorts actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid create input", async () => {
    const result = await createCohort({ ...validCreate, publicLabel: "x" });
    expect(result.status).toBe("error");
    expect(authorizeEditor).not.toHaveBeenCalled();
  });

  it("rejects unauthorized create", async () => {
    authorizeEditor.mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage cohorts.",
    });
    await expect(createCohort(validCreate)).resolves.toEqual({
      status: "error",
      message: "You do not have permission to manage cohorts.",
    });
  });

  it("creates, updates, and deletes via rpc / table", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: cohortId }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ id: cohortId }],
        error: null,
      });
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({
        data: { media_url: null },
        error: null,
      })
      .mockResolvedValue({
        data: { id: cohortId },
        error: null,
      });
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle })),
      })),
      delete: vi.fn(() => ({ eq: deleteEq })),
    }));
    const storageFrom = vi.fn(() => ({
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
    }));

    authorizeEditor.mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: { rpc, from, storage: { from: storageFrom } },
    });

    await expect(createCohort(validCreate)).resolves.toMatchObject({
      status: "success",
      id: cohortId,
    });
    await expect(
      updateCohort({ ...validCreate, id: cohortId, publicLabel: "ASIP 2026B" }),
    ).resolves.toMatchObject({ status: "success", id: cohortId });
    await expect(deleteCohort({ id: cohortId })).resolves.toMatchObject({
      status: "success",
    });
    expect(rpc).toHaveBeenCalledWith(
      "create_cohort_with_links",
      expect.any(Object),
    );
  });
});
