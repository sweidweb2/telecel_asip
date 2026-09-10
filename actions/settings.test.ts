import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  revalidatePath,
  revalidateTag,
  authorizeEditor,
  maybeSingle,
  update,
} = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const updateEq = vi.fn(() => ({ select: vi.fn(() => ({ maybeSingle })) }));
  const update = vi.fn(() => ({ eq: updateEq }));
  return {
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
    authorizeEditor: vi.fn(),
    maybeSingle,
    update,
  };
});

vi.mock("next/cache", () => ({
  revalidatePath,
  revalidateTag,
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

vi.mock("@/lib/admin/authorize-editor", () => ({
  authorizeEditor,
}));

import { updateSiteSettings } from "@/actions/settings";
import { SITE_SETTINGS_CACHE_TAG } from "@/data/settings";

const validInput = {
  openApplications: true,
  newsletterSignupEnabled: true,
  backupTime: "weekly_sun_03" as const,
};

function mockAdminSession() {
  authorizeEditor.mockResolvedValue({
    status: "success",
    userId: "admin-1",
    supabase: {
      from: vi.fn(() => ({ update })),
    },
  });
}

describe("updateSiteSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid input", async () => {
    const result = await updateSiteSettings({
      openApplications: "yes" as never,
      newsletterSignupEnabled: true,
      backupTime: "weekly_sun_03",
    });

    expect(result.status).toBe("error");
    expect(authorizeEditor).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    authorizeEditor.mockResolvedValue({
      status: "error",
      message: "You must be signed in.",
    });

    const result = await updateSiteSettings(validInput);

    expect(result).toEqual({
      status: "error",
      message: "You must be signed in.",
    });
  });

  it("rejects non-admins", async () => {
    authorizeEditor.mockResolvedValue({
      status: "error",
      message: "You do not have permission to change site settings.",
    });

    const result = await updateSiteSettings(validInput);

    expect(result).toEqual({
      status: "error",
      message: "You do not have permission to change site settings.",
    });
  });

  it("updates settings without starting a backup", async () => {
    mockAdminSession();
    maybeSingle.mockResolvedValue({ data: { id: 1 }, error: null });

    const result = await updateSiteSettings(validInput);

    expect(result).toEqual({
      status: "success",
      message: "Settings saved.",
    });
    expect(update).toHaveBeenCalledWith({
      open_applications: true,
      newsletter_signup_enabled: true,
      backup_time: "weekly_sun_03",
    });
    expect(revalidateTag).toHaveBeenCalledWith(SITE_SETTINGS_CACHE_TAG, "max");
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("still does not start a backup when schedule value changes", async () => {
    mockAdminSession();
    maybeSingle.mockResolvedValue({ data: { id: 1 }, error: null });

    const result = await updateSiteSettings({
      ...validInput,
      backupTime: "weekly_mon_03",
    });

    expect(result).toEqual({
      status: "success",
      message: "Settings saved.",
    });
  });
});
