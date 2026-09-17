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
  createStartup,
  deleteStartup,
  updateStartup,
} from "@/actions/startups";

const startupId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const validCreate = {
  name: "Analytical Engines",
  slug: "analytical-engines",
  description: "Working capital for African SMEs.",
  status: "draft" as const,
  foundedAt: "",
  details: {
    websiteUrl: "",
    industry: "",
    category: "",
    location: "",
    cohort: "",
    countryCode: "",
    sector: "",
    founderNames: "",
    coverImageUrl: "",
    publicOutcome: "",
    featured: false,
    imageFocalX: 50,
    imageFocalY: 50,
    foundingYear: undefined,
    team: "",
    size: "",
    problem: "",
    solution: "",
    targetMarket: "",
    businessModel: "",
    fundingGoal: undefined,
    amountRaised: undefined,
  },
};

describe("startups actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid create input", async () => {
    const result = await createStartup({ ...validCreate, name: "x" });
    expect(result.status).toBe("error");
    expect(authorizeEditor).not.toHaveBeenCalled();
  });

  it("rejects unauthorized create", async () => {
    authorizeEditor.mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage startups.",
    });
    await expect(createStartup(validCreate)).resolves.toEqual({
      status: "error",
      message: "You do not have permission to manage startups.",
    });
  });

  it("creates, updates, and deletes a startup", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: startupId, slug: validCreate.slug }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ id: startupId, slug: validCreate.slug, previous_slug: null }],
        error: null,
      });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: startupId, slug: validCreate.slug, logo_url: null },
      error: null,
    });
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle })),
      })),
      delete: vi.fn(() => ({ eq: deleteEq })),
    }));

    authorizeEditor.mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: { rpc, from, storage: { from: vi.fn() } },
    });

    await expect(createStartup(validCreate)).resolves.toMatchObject({
      status: "success",
      id: startupId,
    });
    await expect(
      updateStartup({ ...validCreate, id: startupId, name: "Analytical Engines Co" }),
    ).resolves.toMatchObject({ status: "success", id: startupId });
    await expect(deleteStartup({ id: startupId })).resolves.toMatchObject({
      status: "success",
    });
  });
});
