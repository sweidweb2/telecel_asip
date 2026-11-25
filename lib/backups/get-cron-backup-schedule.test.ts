import { beforeEach, describe, expect, it, vi } from "vitest";

const { maybeSingle, from } = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return { maybeSingle, from };
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from })),
}));

import { getCronBackupSchedule } from "@/lib/backups/get-cron-backup-schedule";

describe("getCronBackupSchedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the schedule when readable", async () => {
    maybeSingle.mockResolvedValue({
      data: { backup_time: "weekly_sun_03" },
      error: null,
    });

    await expect(getCronBackupSchedule()).resolves.toBe("weekly_sun_03");
    expect(from).toHaveBeenCalledWith("site_settings");
  });

  it("returns null when the row is missing", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(getCronBackupSchedule()).resolves.toBeNull();
  });
});
