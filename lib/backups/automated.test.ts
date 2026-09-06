import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { from, select, single } = vi.hoisted(() => {
  const single = vi.fn();
  const select = vi.fn();
  const insert = vi.fn(() => ({
    select: vi.fn(() => ({ single })),
  }));
  const from = vi.fn(() => ({ select, insert }));
  return { from, select, single, insert };
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from })),
}));

vi.mock("@/lib/backups/run-backup", () => ({
  runBackupJob: vi.fn(async () => undefined),
}));

vi.mock("@/lib/backups/r2", () => ({
  deleteBackupObject: vi.fn(),
}));

import { runScheduledBackupWindow } from "@/lib/backups/automated";
import { runBackupJob } from "@/lib/backups/run-backup";

describe("runScheduledBackupWindow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips when a backup is already in flight", async () => {
    select.mockReturnValue({
      in: vi.fn(() => ({
        limit: vi.fn(async () => ({
          data: [{ id: "busy" }],
          error: null,
        })),
      })),
    });

    const result = await runScheduledBackupWindow({
      backupTime: "weekly_sun_03",
      scheduleWindow: "weekly:2026-09-06:sun03",
    });

    expect(result).toEqual({
      status: "skipped",
      attempts: 0,
      reason: "in_flight",
    });
    expect(runBackupJob).not.toHaveBeenCalled();
  });

  it("skips when the window already completed", async () => {
    select
      .mockReturnValueOnce({
        in: vi.fn(() => ({
          limit: vi.fn(async () => ({ data: [], error: null })),
        })),
      })
      .mockReturnValueOnce({
        eq: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [{ status: "completed" }],
            error: null,
          })),
        })),
      });

    const result = await runScheduledBackupWindow({
      backupTime: "weekly_sun_03",
      scheduleWindow: "weekly:2026-09-06:sun03",
    });

    expect(result.reason).toBe("already_completed");
    expect(runBackupJob).not.toHaveBeenCalled();
  });

  it("skips after 3 failures in the window", async () => {
    select
      .mockReturnValueOnce({
        in: vi.fn(() => ({
          limit: vi.fn(async () => ({ data: [], error: null })),
        })),
      })
      .mockReturnValueOnce({
        eq: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [
              { status: "failed" },
              { status: "failed" },
              { status: "failed" },
            ],
            error: null,
          })),
        })),
      });

    const result = await runScheduledBackupWindow({
      backupTime: "weekly_sun_03",
      scheduleWindow: "weekly:2026-09-06:sun03",
    });

    expect(result.reason).toBe("max_failures");
    expect(runBackupJob).not.toHaveBeenCalled();
  });

  it("runs until success within remaining attempts", async () => {
    select
      .mockReturnValueOnce({
        in: vi.fn(() => ({
          limit: vi.fn(async () => ({ data: [], error: null })),
        })),
      })
      .mockReturnValueOnce({
        eq: vi.fn(() => ({
          eq: vi.fn(async () => ({
            data: [{ status: "failed" }],
            error: null,
          })),
        })),
      });

    single.mockResolvedValue({ data: { id: "new-1" }, error: null });
    vi.mocked(runBackupJob).mockResolvedValue(undefined);

    const result = await runScheduledBackupWindow({
      backupTime: "weekly_sun_03",
      scheduleWindow: "weekly:2026-09-06:sun03",
    });

    expect(result).toMatchObject({
      status: "success",
      attempts: 1,
      backupId: "new-1",
    });
    expect(runBackupJob).toHaveBeenCalledTimes(1);
  });
});
