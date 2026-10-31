import { beforeEach, describe, expect, it, vi } from "vitest";

const { eq, orderId, limit } = vi.hoisted(() => {
  const limit = vi.fn();
  const orderId = vi.fn(() => ({ limit }));
  const orderPublished = vi.fn(() => ({ order: orderId }));
  const eq = vi.fn(() => ({ order: orderPublished }));
  return { eq, orderPublished, orderId, limit };
});

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq })),
    })),
  })),
}));

import { getPublishedBlogs, PUBLISHED_BLOGS_LIST_LIMIT } from "@/data/blogs";

describe("getPublishedBlogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockResolvedValue({ data: [], error: null });
  });

  it("filters to published status and applies the soft cap", async () => {
    await getPublishedBlogs();
    expect(eq).toHaveBeenCalledWith("status", "published");
    expect(limit).toHaveBeenCalledWith(PUBLISHED_BLOGS_LIST_LIMIT);
  });

  it("honours a smaller home teaser limit", async () => {
    await getPublishedBlogs(8);
    expect(limit).toHaveBeenCalledWith(8);
  });
});
