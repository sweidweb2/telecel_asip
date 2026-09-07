import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createPublicClient,
  isPlaceholderSupabaseUrl,
  PLACEHOLDER_SUPABASE_HOST,
} from "@/lib/supabase/public";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isPlaceholderSupabaseUrl", () => {
  it("detects the CI placeholder host", () => {
    expect(
      isPlaceholderSupabaseUrl(`https://${PLACEHOLDER_SUPABASE_HOST}`),
    ).toBe(true);
  });

  it("rejects real project URLs", () => {
    expect(
      isPlaceholderSupabaseUrl("https://abcdefgh.supabase.co"),
    ).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(isPlaceholderSupabaseUrl("not-a-url")).toBe(false);
  });
});

describe("createPublicClient", () => {
  it("stubs network calls for the CI placeholder host", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", `https://${PLACEHOLDER_SUPABASE_HOST}`);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "placeholder-anon-key");

    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("partners_public")
      .select("id")
      .limit(1);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("throws when env vars are missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(() => createPublicClient()).toThrow(/Missing NEXT_PUBLIC_SUPABASE/);
  });
});
