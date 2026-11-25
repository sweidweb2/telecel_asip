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
  withMediaUrlCas,
  type PersistMediaUrl,
} from "@/lib/media/upload-versioned-public-image";

function mockPersist(options?: {
  error?: { message?: string } | null;
  data?: { id: string } | null;
  trackEq?: ReturnType<typeof vi.fn>;
  trackIs?: ReturnType<typeof vi.fn>;
}) {
  const eq = options?.trackEq ?? vi.fn(function (this: unknown) {
    return this;
  });
  const is = options?.trackIs ?? vi.fn(function (this: unknown) {
    return this;
  });
  const maybeSingle = vi.fn(async () => ({
    error: options?.error ?? null,
    data: options?.data === undefined ? { id: "row-1" } : options.data,
  }));
  const select = vi.fn(() => ({ maybeSingle }));
  const prepareUpdate = vi.fn(() => ({
    eq,
    is,
    select,
  })) as unknown as PersistMediaUrl["prepareUpdate"];
  return { prepareUpdate, eq, is, select, maybeSingle };
}

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
      persistMediaUrl: {
        column: "logo_url",
        prepareUpdate: vi.fn(),
      },
    });
    expect(result).toEqual({ status: "error", message: "bad-image" });
  });

  it("uploads a versioned path, CAS-updates the row, and removes the previous object", async () => {
    const upload = vi.fn(async () => ({ error: null }));
    const remove = vi.fn(async () => ({ error: null }));
    const supabase = {
      storage: {
        from: vi.fn(() => ({ upload, remove })),
      },
    };
    const persist = mockPersist({ data: { id: "partner-1" } });

    const file = new File([new Uint8Array([1, 2, 3])], "logo.png", {
      type: "image/png",
    });
    const previousUrl =
      "https://example.supabase.co/storage/v1/object/public/partners/partner-1/old.webp";

    const result = await uploadVersionedPublicImage({
      supabase: supabase as never,
      file,
      bucket: "partners",
      entityId: "partner-1",
      preset: "partnerLogo",
      previousUrl,
      maxBytes: 1024,
      messages,
      persistMediaUrl: {
        column: "logo_url",
        prepareUpdate: persist.prepareUpdate,
      },
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
    expect(persist.prepareUpdate).toHaveBeenCalledWith(result.publicUrl);
    expect(persist.eq).toHaveBeenCalledWith("logo_url", previousUrl);
    expect(remove).toHaveBeenCalledWith(["partner-1/old.webp"]);
  });

  it("CAS-requires null when there was no previous URL", async () => {
    const upload = vi.fn(async () => ({ error: null }));
    const remove = vi.fn(async () => ({ error: null }));
    const supabase = {
      storage: {
        from: vi.fn(() => ({ upload, remove })),
      },
    };
    const persist = mockPersist();

    const file = new File([new Uint8Array([1])], "logo.png", {
      type: "image/png",
    });

    const result = await uploadVersionedPublicImage({
      supabase: supabase as never,
      file,
      bucket: "partners",
      entityId: "p1",
      preset: "partnerLogo",
      previousUrl: null,
      maxBytes: 1024,
      messages,
      persistMediaUrl: {
        column: "logo_url",
        prepareUpdate: persist.prepareUpdate,
      },
    });

    expect(result.status).toBe("success");
    expect(persist.is).toHaveBeenCalledWith("logo_url", null);
  });

  it("rolls back the new object when the DB update fails", async () => {
    const upload = vi.fn(async () => ({ error: null }));
    const remove = vi.fn(async () => ({ error: null }));
    const supabase = {
      storage: {
        from: vi.fn(() => ({ upload, remove })),
      },
    };
    const persist = mockPersist({ error: { message: "db" }, data: null });

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
      persistMediaUrl: {
        column: "logo_url",
        prepareUpdate: persist.prepareUpdate,
      },
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
    const persist = mockPersist({ data: null });

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
      persistMediaUrl: {
        column: "logo_url",
        prepareUpdate: persist.prepareUpdate,
      },
    });

    expect(result).toEqual({ status: "error", message: "generic" });
    expect(remove).toHaveBeenCalled();
  });
});

describe("withMediaUrlCas", () => {
  it("matches the previous URL when present", () => {
    const eq = vi.fn(function (this: unknown) {
      return this;
    });
    const is = vi.fn(function (this: unknown) {
      return this;
    });
    const query = { eq, is };

    withMediaUrlCas(query as never, "logo_url", "https://cdn.example/old.webp");

    expect(eq).toHaveBeenCalledWith("logo_url", "https://cdn.example/old.webp");
    expect(is).not.toHaveBeenCalled();
  });

  it("requires null when there was no previous URL", () => {
    const eq = vi.fn(function (this: unknown) {
      return this;
    });
    const is = vi.fn(function (this: unknown) {
      return this;
    });
    const query = { eq, is };

    withMediaUrlCas(query as never, "logo_url", null);

    expect(is).toHaveBeenCalledWith("logo_url", null);
    expect(eq).not.toHaveBeenCalled();
  });
});
