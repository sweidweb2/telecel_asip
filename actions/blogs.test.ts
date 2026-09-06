import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
  revalidateTag,
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock("@/lib/admin/authorize-admin", () => ({
  authorizeAdmin: vi.fn(),
}));

vi.mock("@/lib/sanitize-html", () => ({
  sanitizeBlogHtml: vi.fn((html: string) => html),
}));

vi.mock("@/lib/media/process-image", () => ({
  processImageBuffer: vi.fn(),
}));

import {
  createBlog,
  deleteBlog,
  updateBlog,
} from "@/actions/blogs";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";

const blogId = "22222222-2222-4222-8222-222222222222";

const validCreate = {
  title: "ASIP alumni open new markets",
  slug: "asip-alumni-open-new-markets",
  summary: "Founders expand into regional distribution with new partners.",
  bodyHtml: "<p>Founders expanded distribution this quarter.</p>",
  categories: ["Founder Stories"],
  authorName: "ASIP Editorial",
  status: "draft" as const,
  isFeatured: false,
  startupId: null,
  cohortId: null,
  sources: [] as string[],
  metaTitle: null,
  metaDescription: null,
};

function mockAdminSession(overrides?: {
  rpc?: ReturnType<typeof vi.fn>;
  from?: ReturnType<typeof vi.fn>;
  storage?: { from: ReturnType<typeof vi.fn> };
}) {
  const rpc = overrides?.rpc ?? vi.fn();
  const from = overrides?.from ?? vi.fn();
  vi.mocked(authorizeAdmin).mockResolvedValue({
    status: "success",
    userId: "admin-1",
    supabase: {
      rpc,
      from,
      storage: overrides?.storage ?? { from: vi.fn() },
    } as never,
  });
  return { rpc, from };
}

describe("blogs actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid create input without authorizing", async () => {
    const result = await createBlog({
      ...validCreate,
      title: "x",
    });

    expect(result.status).toBe("error");
    expect(authorizeAdmin).not.toHaveBeenCalled();
  });

  it("rejects unauthorized create", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage blogs.",
    });

    const result = await createBlog(validCreate);

    expect(result).toEqual({
      status: "error",
      message: "You do not have permission to manage blogs.",
    });
  });

  it("creates a blog via rpc on success", async () => {
    const { rpc } = mockAdminSession();
    rpc.mockResolvedValue({
      data: [{ id: blogId, slug: validCreate.slug }],
      error: null,
    });

    const result = await createBlog(validCreate);

    expect(result).toEqual({
      status: "success",
      message: "Blog created successfully.",
      id: blogId,
    });
    expect(rpc).toHaveBeenCalledWith(
      "create_blog_with_featured",
      expect.objectContaining({
        p_blog: expect.objectContaining({
          title: validCreate.title,
          slug: validCreate.slug,
          status: "draft",
        }),
      }),
    );
    expect(revalidateTag).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("updates a blog via rpc on success", async () => {
    const { rpc } = mockAdminSession();
    rpc.mockResolvedValue({
      data: [{ id: blogId, slug: validCreate.slug, previous_slug: null }],
      error: null,
    });

    const result = await updateBlog({ ...validCreate, id: blogId });

    expect(result).toEqual({
      status: "success",
      message: "Blog updated successfully.",
      id: blogId,
    });
    expect(rpc).toHaveBeenCalledWith(
      "update_blog_with_featured",
      expect.objectContaining({ p_id: blogId }),
    );
  });

  it("deletes a blog and cleans up storage paths", async () => {
    const remove = vi.fn().mockResolvedValue({ data: null, error: null });
    const storageFrom = vi.fn(() => ({ remove }));
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: blogId,
        slug: validCreate.slug,
        thumbnail_url: null,
        author_avatar_url: null,
      },
      error: null,
    });
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) => {
      if (table === "blogs") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle })),
          })),
          delete: vi.fn(() => ({ eq: deleteEq })),
        };
      }
      return {};
    });

    mockAdminSession({
      from: from as never,
      storage: { from: storageFrom },
    });

    const result = await deleteBlog({ id: blogId });

    expect(result).toEqual({
      status: "success",
      message: "Blog deleted successfully.",
      id: undefined,
    });
    expect(deleteEq).toHaveBeenCalledWith("id", blogId);
  });
});
