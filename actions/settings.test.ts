import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  revalidatePath,
  revalidateTag,
  authorizeAdmin,
  authorizeStaff,
  maybeSingle,
  update,
} = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const updateEq = vi.fn(() => ({ select: vi.fn(() => ({ maybeSingle })) }));
  const update = vi.fn(() => ({ eq: updateEq }));
  return {
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
    authorizeAdmin: vi.fn(),
    authorizeStaff: vi.fn(),
    maybeSingle,
    update,
  };
});

vi.mock("next/cache", () => ({
  revalidatePath,
  revalidateTag,
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

vi.mock("@/lib/admin/authorize-admin", () => ({
  authorizeAdmin,
}));

vi.mock("@/lib/admin/authorize-staff", () => ({
  authorizeStaff,
}));

import {
  updateAdminSiteSettings,
  updateEditorSiteSettings,
} from "@/actions/settings";
import { SITE_SETTINGS_CACHE_TAG } from "@/data/settings";

const editorInput = {
  openApplications: true,
  newsletterSignupEnabled: true,
};

const adminInput = {
  ...editorInput,
  backupTime: "weekly_sun_03" as const,
};

function mockStaffSession() {
  authorizeStaff.mockResolvedValue({
    status: "success",
    userId: "editor-1",
    supabase: {
      from: vi.fn(() => ({ update })),
    },
  });
}

function mockAdminSession() {
  authorizeAdmin.mockResolvedValue({
    status: "success",
    userId: "admin-1",
    supabase: {
      from: vi.fn(() => ({ update })),
    },
  });
}

describe("updateEditorSiteSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid input", async () => {
    const result = await updateEditorSiteSettings({
      openApplications: "yes" as never,
      newsletterSignupEnabled: true,
    });

    expect(result.status).toBe("error");
    expect(authorizeStaff).not.toHaveBeenCalled();
  });

  it("requires a signed-in staff user", async () => {
    authorizeStaff.mockResolvedValue({
      status: "error",
      message: "You must be signed in.",
    });

    const result = await updateEditorSiteSettings(editorInput);

    expect(result).toEqual({
      status: "error",
      message: "You must be signed in.",
    });
  });

  it("updates application and newsletter toggles", async () => {
    mockStaffSession();
    maybeSingle.mockResolvedValue({ data: { id: 1 }, error: null });

    const result = await updateEditorSiteSettings(editorInput);

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

describe("updateAdminSiteSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-admins with backup-specific copy", async () => {
    authorizeAdmin.mockResolvedValue({
      status: "error",
      message: "You do not have permission to change site settings.",
    });

    const result = await updateAdminSiteSettings(adminInput);

    expect(result).toEqual({
      status: "error",
      message: "Only administrators can change the backup schedule.",
    });
  });

  it("updates settings including backup_time", async () => {
    mockAdminSession();
    maybeSingle.mockResolvedValue({ data: { id: 1 }, error: null });

    const result = await updateAdminSiteSettings(adminInput);

    expect(result).toEqual({
      status: "success",
      message: "Settings saved.",
    });
    expect(update).toHaveBeenCalledWith({
      open_applications: true,
      newsletter_signup_enabled: true,
      backup_time: "weekly_sun_03",
    });
  });

  it("still does not start a backup when schedule value changes", async () => {
    mockAdminSession();
    maybeSingle.mockResolvedValue({ data: { id: 1 }, error: null });

    const result = await updateAdminSiteSettings({
      ...adminInput,
      backupTime: "weekly_mon_03",
    });

    expect(result).toEqual({
      status: "success",
      message: "Settings saved.",
    });
  });
});
