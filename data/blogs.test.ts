import { beforeEach, describe, expect, it, vi } from "vitest";

const { eq, orderPublished, orderId } = vi.hoisted(() => {
  const orderId = vi.fn();
  const orderPublished = vi.fn(() => ({ order: orderId }));
  const eq = vi.fn(() => ({ order: orderPublished }));
  return { eq, orderPublished, orderId };
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

import { getPublishedBlogs } from "@/data/blogs";

describe("getPublishedBlogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderId.mockResolvedValue({ data: [], error: null });
  });

  it("filters to published status only", async () => {
    await getPublishedBlogs();
    expect(eq).toHaveBeenCalledWith("status", "published");
  });
});
