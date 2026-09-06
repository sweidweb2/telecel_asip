import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  revalidatePath,
  revalidateTag,
  getUser,
  rpc,
  maybeSingle,
  selectEq,
  update,
  from,
  hasInFlightBackup,
  startAutomatedBackupAttempt,
  applyAutomatedBackupRetention,
} = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const selectEq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq: selectEq }));
  const updateEq = vi.fn(() => ({ select: vi.fn(() => ({ maybeSingle })) }));
  const update = vi.fn(() => ({ eq: updateEq }));
  const from = vi.fn(() => ({ update, select }));
  return {
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
    getUser: vi.fn(),
    rpc: vi.fn(),
    maybeSingle,
    selectEq,
    update,
    from,
    hasInFlightBackup: vi.fn(),
    startAutomatedBackupAttempt: vi.fn(),
    applyAutomatedBackupRetention: vi.fn(),
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

vi.mock("@/lib/backups/automated", () => ({
  hasInFlightBackup,
  startAutomatedBackupAttempt,
  applyAutomatedBackupRetention,
}));

import { updateSiteSettings } from "@/actions/settings";
import { SITE_SETTINGS_CACHE_TAG } from "@/data/settings";

const validInput = {
  openApplications: true,
  newsletterSignupEnabled: true,
  backupTime: "daily_03" as const,
};

describe("updateSiteSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasInFlightBackup.mockResolvedValue(false);
    startAutomatedBackupAttempt.mockResolvedValue({
      backupId: "b1",
      ok: true,
    });
    applyAutomatedBackupRetention.mockResolvedValue({ deleted: 0 });
  });

  it("rejects invalid input", async () => {
    const result = await updateSiteSettings({
      openApplications: "yes" as never,
      newsletterSignupEnabled: true,
      backupTime: "daily_03",
    });

    expect(result.status).toBe("error");
    expect(getUser).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await updateSiteSettings(validInput);

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

    const result = await updateSiteSettings(validInput);

    expect(result).toEqual({
      status: "error",
      message: "You do not have permission to change site settings.",
    });
  });

  it("updates settings without starting a backup", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    rpc.mockResolvedValue({ data: true, error: null });
    maybeSingle.mockResolvedValue({ data: { id: 1 }, error: null });

    const result = await updateSiteSettings(validInput);

    expect(result).toEqual({
      status: "success",
      message: "Settings saved.",
    });
    expect(update).toHaveBeenCalledWith({
      open_applications: true,
      newsletter_signup_enabled: true,
      backup_time: "daily_03",
    });
    expect(startAutomatedBackupAttempt).not.toHaveBeenCalled();
    expect(applyAutomatedBackupRetention).not.toHaveBeenCalled();
    expect(revalidateTag).toHaveBeenCalledWith(SITE_SETTINGS_CACHE_TAG, "max");
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("still does not start a backup when schedule value changes", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    rpc.mockResolvedValue({ data: true, error: null });
    maybeSingle.mockResolvedValue({ data: { id: 1 }, error: null });

    const result = await updateSiteSettings({
      ...validInput,
      backupTime: "weekly_sun_03",
    });

    expect(result).toEqual({
      status: "success",
      message: "Settings saved.",
    });
    expect(startAutomatedBackupAttempt).not.toHaveBeenCalled();
  });
});
