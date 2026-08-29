import { describe, expect, it } from "vitest";

import {
  publicObjectUrl,
  storagePathFromPublicUrl,
} from "@/lib/storage/public-url";

const SUPABASE_URL = "https://project.supabase.co";

describe("publicObjectUrl", () => {
  it("builds a public object URL", () => {
    expect(publicObjectUrl(SUPABASE_URL, "partners", "abc/logo.webp")).toBe(
      `${SUPABASE_URL}/storage/v1/object/public/partners/abc/logo.webp`,
    );
  });
});

describe("storagePathFromPublicUrl", () => {
  it("returns the object path for a URL in the bucket", () => {
    const url = publicObjectUrl(SUPABASE_URL, "partners", "abc/logo.webp");
    expect(storagePathFromPublicUrl(url, "partners")).toBe("abc/logo.webp");
  });

  it("returns null for another bucket", () => {
    const url = publicObjectUrl(SUPABASE_URL, "startups", "abc/logo.webp");
    expect(storagePathFromPublicUrl(url, "partners")).toBeNull();
  });

  it("returns null for empty, null, and non-storage URLs", () => {
    expect(storagePathFromPublicUrl(null, "partners")).toBeNull();
    expect(storagePathFromPublicUrl(undefined, "partners")).toBeNull();
    expect(storagePathFromPublicUrl("", "partners")).toBeNull();
    expect(
      storagePathFromPublicUrl("https://evil.example.com/logo.webp", "partners"),
    ).toBeNull();
  });

  it("returns null when the bucket prefix has no object path after it", () => {
    expect(
      storagePathFromPublicUrl(
        `${SUPABASE_URL}/storage/v1/object/public/partners/`,
        "partners",
      ),
    ).toBeNull();
  });
});
