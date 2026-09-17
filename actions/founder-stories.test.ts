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

vi.mock("@/lib/admin/authorize-editor", () => ({
  authorizeEditor,
}));

import {
  createFounderStory,
  deleteFounderStory,
  updateFounderStory,
} from "@/actions/founder-stories";

const storyId = "66666666-6666-4666-8666-666666666666";
const startupId = "77777777-7777-4777-8777-777777777777";

const validCreate = {
  startupId,
  storyTitle: "Opening new markets through partnerships",
  coverImageUrl: "",
  headlineStat: "20K deliveries",
  theProblem: "Distribution was fragmented.",
  whatTheyBuilt: "A marketplace for retailers.",
  theAsipConnection: "ASIP opened mentor intros.",
  whereTheyAreNow: "Expanding into new markets.",
  founderQuoteText: "",
  quoteAttributionName: "",
  quoteAttributionTitle: "",
  quoteDate: "",
  quotePermissionStatus: "" as const,
  publishStatus: "draft" as const,
};

describe("founder-stories actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid create input", async () => {
    const result = await createFounderStory({
      ...validCreate,
      theProblem: "x",
    });
    expect(result.status).toBe("error");
    expect(authorizeEditor).not.toHaveBeenCalled();
  });

  it("rejects unauthorized create", async () => {
    authorizeEditor.mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage founder stories.",
    });
    await expect(createFounderStory(validCreate)).resolves.toEqual({
      status: "error",
      message: "You do not have permission to manage founder stories.",
    });
  });

  it("creates, updates, and deletes a founder story", async () => {
    const insertSingle = vi.fn().mockResolvedValue({
      data: { id: storyId },
      error: null,
    });
    const updateMaybe = vi.fn().mockResolvedValue({
      data: { id: storyId },
      error: null,
    });
    const existingMaybe = vi.fn().mockResolvedValue({
      data: { id: storyId },
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

    await expect(createFounderStory(validCreate)).resolves.toMatchObject({
      status: "success",
      id: storyId,
    });
    await expect(
      updateFounderStory({
        ...validCreate,
        id: storyId,
        theProblem: "Distribution was fragmented across markets.",
      }),
    ).resolves.toMatchObject({ status: "success", id: storyId });
    await expect(deleteFounderStory({ id: storyId })).resolves.toMatchObject({
      status: "success",
    });
  });
});
