import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/media/process-image", () => ({
  processImageBuffer: vi.fn(),
}));

vi.mock("@/lib/storage/public-url", () => ({
  publicObjectUrl: vi.fn(
    (url: string, bucket: string, path: string) =>
      `${url}/storage/v1/object/public/${bucket}/${path}`,
  ),
  storagePathFromPublicUrl: vi.fn((url: string | null | undefined, bucket: string) => {
    if (!url) return null;
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(marker);
    return index === -1 ? null : url.slice(index + marker.length);
  }),
}));

import { processImageBuffer } from "@/lib/media/process-image";
import {
  uploadVersionedPublicImage,
} from "@/lib/media/upload-versioned-public-image";

describe("uploadVersionedPublicImage", () => {
  const messages = {
    invalidImage: "bad-image",
    genericError: "generic",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    vi.mocked(processImageBuffer).mockResolvedValue({
      buffer: Buffer.from("webp"),
      contentType: "image/webp",
      extension: "webp",
    });
  });

  it("rejects invalid mime or oversized files", async () => {
    const file = new File(["x"], "x.txt", { type: "text/plain" });
    const result = await uploadVersionedPublicImage({
      supabase: {} as never,
      file,
      bucket: "partners",
      entityId: "p1",
      preset: "partnerLogo",
      previousUrl: null,
      maxBytes: 100,
      messages,
      updateRow: vi.fn(),
    });
    expect(result).toEqual({ status: "error", message: "bad-image" });
  });

  it("uploads a versioned path, updates the row, and removes the previous object", async () => {
    const upload = vi.fn(async () => ({ error: null }));
    const remove = vi.fn(async () => ({ error: null }));
    const updateRow = vi.fn(async () => ({
      error: null,
      data: { id: "partner-1" },
    }));
    const supabase = {
      storage: {
        from: vi.fn(() => ({ upload, remove })),
      },
    };

    const file = new File([new Uint8Array([1, 2, 3])], "logo.png", {
      type: "image/png",
    });

    const result = await uploadVersionedPublicImage({
      supabase: supabase as never,
      file,
      bucket: "partners",
      entityId: "partner-1",
      preset: "partnerLogo",
      previousUrl:
        "https://example.supabase.co/storage/v1/object/public/partners/partner-1/old.webp",
      maxBytes: 1024,
      messages,
      updateRow,
    });

    expect(result.status).toBe("success");
    if (result.status !== "success") return;

    expect(result.path.startsWith("partner-1/")).toBe(true);
    expect(result.path.endsWith(".webp")).toBe(true);
    expect(upload).toHaveBeenCalledWith(
      result.path,
      expect.any(Buffer),
      expect.objectContaining({
        contentType: "image/webp",
        upsert: false,
        cacheControl: "31536000",
      }),
    );
    expect(updateRow).toHaveBeenCalledWith(result.publicUrl);
    expect(remove).toHaveBeenCalledWith(["partner-1/old.webp"]);
  });

  it("rolls back the new object when the DB update fails", async () => {
    const upload = vi.fn(async () => ({ error: null }));
    const remove = vi.fn(async () => ({ error: null }));
    const supabase = {
      storage: {
        from: vi.fn(() => ({ upload, remove })),
      },
    };

    const file = new File([new Uint8Array([1])], "logo.png", {
      type: "image/png",
    });

    const result = await uploadVersionedPublicImage({
      supabase: supabase as never,
      file,
      bucket: "startups",
      entityId: "s1",
      preset: "startupLogo",
      previousUrl: null,
      maxBytes: 1024,
      messages,
      updateRow: async () => ({ error: { message: "db" } }),
    });

    expect(result).toEqual({ status: "error", message: "generic" });
    expect(remove).toHaveBeenCalled();
  });

  it("rolls back the new object when the DB update matches zero rows", async () => {
    const upload = vi.fn(async () => ({ error: null }));
    const remove = vi.fn(async () => ({ error: null }));
    const supabase = {
      storage: {
        from: vi.fn(() => ({ upload, remove })),
      },
    };

    const file = new File([new Uint8Array([1])], "logo.png", {
      type: "image/png",
    });

    const result = await uploadVersionedPublicImage({
      supabase: supabase as never,
      file,
      bucket: "startups",
      entityId: "s1",
      preset: "startupLogo",
      previousUrl: null,
      maxBytes: 1024,
      messages,
      updateRow: async () => ({ error: null, data: null }),
    });

    expect(result).toEqual({ status: "error", message: "generic" });
    expect(remove).toHaveBeenCalled();
  });
});
