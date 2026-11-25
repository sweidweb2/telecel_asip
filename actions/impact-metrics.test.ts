import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, authorizeEditor } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  authorizeEditor: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
  revalidateTag: vi.fn(),
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock("@/lib/admin/authorize-role", () => ({
  authorizeEditor,
}));

import {
  createImpactMetric,
  deleteImpactMetric,
  updateImpactMetric,
} from "@/actions/impact-metrics";

const metricId = "88888888-8888-4888-8888-888888888888";
const evidenceId = "99999999-9999-4999-8999-999999999999";

const validCreate = {
  claimLabel: "Founders raised follow-on capital",
  value: "42",
  unit: "%",
  periodStart: "2024-01-01",
  periodEnd: "2024-12-31",
  geography: "",
  impactLens: null,
  displayLocations: [] as string[],
  evidenceId,
  publishStatus: "pending" as const,
};

describe("impact-metrics actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid create input", async () => {
    const result = await createImpactMetric({
      ...validCreate,
      claimLabel: "x",
    });
    expect(result.status).toBe("error");
    expect(authorizeEditor).not.toHaveBeenCalled();
  });

  it("rejects unauthorized create", async () => {
    authorizeEditor.mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage impact metrics.",
    });
    await expect(createImpactMetric(validCreate)).resolves.toEqual({
      status: "error",
      message: "You do not have permission to manage impact metrics.",
    });
  });

  it("creates, updates, and deletes an impact metric", async () => {
    const insertSingle = vi.fn().mockResolvedValue({
      data: { id: metricId },
      error: null,
    });
    const updateMaybe = vi.fn().mockResolvedValue({
      data: { id: metricId },
      error: null,
    });
    const existingMaybe = vi.fn().mockResolvedValue({
      data: { id: metricId },
      error: null,
    });
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ single: insertSingle })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({ maybeSingle: updateMaybe })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: existingMaybe })),
      })),
      delete: vi.fn(() => ({ eq: deleteEq })),
    }));

    authorizeEditor.mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: { from },
    });

    await expect(createImpactMetric(validCreate)).resolves.toMatchObject({
      status: "success",
      id: metricId,
    });
    await expect(
      updateImpactMetric({
        ...validCreate,
        id: metricId,
        claimLabel: "Founders raised follow-on capital edited",
      }),
    ).resolves.toMatchObject({ status: "success", id: metricId });
    await expect(deleteImpactMetric({ id: metricId })).resolves.toMatchObject({
      status: "success",
    });
  });
});
