import { afterEach, describe, expect, it, vi } from "vitest";

import { safePrerenderList } from "@/lib/prerender-safe";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("safePrerenderList", () => {
  it("returns the rows when the read succeeds", async () => {
    await expect(
      safePrerenderList("slugs", async () => [{ slug: "a" }]),
    ).resolves.toEqual([{ slug: "a" }]);
  });

  it("falls back to an empty list when the read throws", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      safePrerenderList("slugs", async () => {
        throw new Error("fetch failed");
      }),
    ).resolves.toEqual([]);
    expect(warn).toHaveBeenCalledOnce();
  });
});
