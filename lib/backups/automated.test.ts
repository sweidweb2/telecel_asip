import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { from, select, single, update } = vi.hoisted(() => {
  const single = vi.fn();
  const select = vi.fn();
  const insert = vi.fn(() => ({
    select: vi.fn(() => ({ single })),
  }));
  const updateSelect = vi.fn(async () => ({ data: [], error: null }));
  const update = vi.fn(() => ({
    in: vi.fn(() => ({
      lt: vi.fn(() => ({
        select: updateSelect,
      })),
    })),
  }));
  const from = vi.fn(() => ({ select, insert, update }));
  return { from, select, single, insert, update, updateSelect };
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

import {
  failStuckInFlightBackups,
  runScheduledBackupWindow,
  BACKUP_STUCK_AFTER_MS,
} from "@/lib/backups/automated";
import { runBackupJob } from "@/lib/backups/run-backup";

describe("failStuckInFlightBackups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks stale pending/processing rows as failed", async () => {
    const updateSelect = vi.fn(async () => ({
      data: [{ id: "stuck-1" }],
      error: null,
    }));
    const lt = vi.fn(() => ({ select: updateSelect }));
    update.mockReturnValueOnce({
      in: vi.fn(() => ({ lt })),
    });

    const now = new Date("2026-09-06T12:00:00.000Z");
    const count = await failStuckInFlightBackups(now);

    expect(count).toBe(1);
    expect(update).toHaveBeenCalledWith({
      status: "failed",
      error_message: "Timed out — job did not finish. Try again.",
    });
    expect(lt).toHaveBeenCalledWith(
      "created_at",
      new Date(now.getTime() - BACKUP_STUCK_AFTER_MS).toISOString(),
    );
  });
});

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

  it("runs one attempt per tick and succeeds", async () => {
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

  it("marks attempt_failed when retries remain for later ticks", async () => {
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

    single.mockResolvedValue({ data: { id: "new-2" }, error: null });
    vi.mocked(runBackupJob).mockRejectedValue(new Error("boom"));

    const result = await runScheduledBackupWindow({
      backupTime: "weekly_sun_03",
      scheduleWindow: "weekly:2026-09-06:sun03",
    });

    expect(result).toMatchObject({
      status: "failed",
      attempts: 1,
      reason: "attempt_failed",
      backupId: "new-2",
    });
    expect(runBackupJob).toHaveBeenCalledTimes(1);
  });
});
