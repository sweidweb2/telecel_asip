import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag, getUser, rpc, maybeSingle, eq, update, from } =
  vi.hoisted(() => {
    const maybeSingle = vi.fn();
    const eq = vi.fn(() => ({ select: vi.fn(() => ({ maybeSingle })) }));
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));
    return {
      revalidatePath: vi.fn(),
      revalidateTag: vi.fn(),
      getUser: vi.fn(),
      rpc: vi.fn(),
      maybeSingle,
      eq,
      update,
      from,
    };
  });

vi.mock("next/cache", () => ({
  revalidatePath,
  revalidateTag,
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    rpc,
    from,
  })),
}));

import { updateSiteSettings } from "@/actions/settings";
import { SITE_SETTINGS_CACHE_TAG } from "@/data/settings";

describe("updateSiteSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid input", async () => {
    const result = await updateSiteSettings({
      openApplications: "yes" as never,
      newsletterSignupEnabled: true,
    });

    expect(result.status).toBe("error");
    expect(getUser).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await updateSiteSettings({
      openApplications: true,
      newsletterSignupEnabled: false,
    });

    expect(result).toEqual({
      status: "error",
      message: "You must be signed in.",
    });
  });

  it("rejects non-admins", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    rpc.mockResolvedValue({ data: false, error: null });

    const result = await updateSiteSettings({
      openApplications: true,
      newsletterSignupEnabled: false,
    });

    expect(result).toEqual({
      status: "error",
      message: "You do not have permission to change site settings.",
    });
  });

  it("updates settings and revalidates on success", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    rpc.mockResolvedValue({ data: true, error: null });
    maybeSingle.mockResolvedValue({ data: { id: 1 }, error: null });

    const result = await updateSiteSettings({
      openApplications: true,
      newsletterSignupEnabled: true,
    });

    expect(result).toEqual({
      status: "success",
      message: "Settings saved.",
    });
    expect(update).toHaveBeenCalledWith({
      open_applications: true,
      newsletter_signup_enabled: true,
    });
    expect(revalidateTag).toHaveBeenCalledWith(SITE_SETTINGS_CACHE_TAG, "max");
    expect(revalidatePath).toHaveBeenCalled();
  });
});
