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
  createEvidenceRecord,
  deleteEvidenceRecord,
  updateEvidenceRecord,
} from "@/actions/evidence-records";

const evidenceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ownerId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const validCreate = {
  primarySource: "ASIP cohort report 2024",
  sourceFileUrl: "",
  measurementPeriodStart: "2024-01-01",
  measurementPeriodEnd: "2024-12-31",
  ownerId,
  status: "pending" as const,
  lastVerifiedDate: "2025-01-15",
  permission: "public" as const,
  reviewDate: "2025-01-20",
};

describe("evidence-records actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid create input", async () => {
    const result = await createEvidenceRecord({
      ...validCreate,
      primarySource: "x",
    });
    expect(result.status).toBe("error");
    expect(authorizeEditor).not.toHaveBeenCalled();
  });

  it("rejects unauthorized create", async () => {
    authorizeEditor.mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage evidence records.",
    });
    await expect(createEvidenceRecord(validCreate)).resolves.toEqual({
      status: "error",
      message: "You do not have permission to manage evidence records.",
    });
  });

  it("creates, updates, and deletes an evidence record", async () => {
    const insertSingle = vi.fn().mockResolvedValue({
      data: { id: evidenceId },
      error: null,
    });
    const updateMaybe = vi.fn().mockResolvedValue({
      data: { id: evidenceId },
      error: null,
    });
    const existingMaybe = vi.fn().mockResolvedValue({
      data: { id: evidenceId },
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

    await expect(createEvidenceRecord(validCreate)).resolves.toMatchObject({
      status: "success",
      id: evidenceId,
    });
    await expect(
      updateEvidenceRecord({
        ...validCreate,
        id: evidenceId,
        primarySource: "ASIP cohort report 2024 edited",
      }),
    ).resolves.toMatchObject({ status: "success", id: evidenceId });
    await expect(deleteEvidenceRecord({ id: evidenceId })).resolves.toMatchObject({
      status: "success",
    });
  });
});
