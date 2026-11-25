import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  applyAutomatedBackupRetention,
  runScheduledBackupWindow,
  isScheduleDue,
  scheduleWindowKey,
  getCronBackupSchedule,
} = vi.hoisted(() => {
  return {
    applyAutomatedBackupRetention: vi.fn(),
    runScheduledBackupWindow: vi.fn(),
    isScheduleDue: vi.fn(),
    scheduleWindowKey: vi.fn(),
    getCronBackupSchedule: vi.fn(),
  };
});

vi.mock("@/lib/backups/get-cron-backup-schedule", () => ({
  getCronBackupSchedule,
}));

vi.mock("@/lib/backups/automated", () => ({
  applyAutomatedBackupRetention,
  failStuckInFlightBackups: vi.fn(),
  runScheduledBackupWindow,
}));

vi.mock("@/lib/backups/schedule", async () => {
  const actual = await vi.importActual<typeof import("@/lib/backups/schedule")>(
    "@/lib/backups/schedule",
  );
  return {
    ...actual,
    isScheduleDue,
    scheduleWindowKey,
  };
});

import { POST } from "@/app/api/cron/backup/route";
import { failStuckInFlightBackups } from "@/lib/backups/automated";

describe("POST /api/cron/backup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKUP_CRON_SECRET = "test-secret";
    applyAutomatedBackupRetention.mockResolvedValue({ deleted: 0 });
    vi.mocked(failStuckInFlightBackups).mockResolvedValue(0);
  });

  it("rejects missing authorization", async () => {
    const response = await POST(new Request("http://localhost/api/cron/backup"));
    expect(response.status).toBe(401);
  });

  it("rejects query-string secret (Bearer only)", async () => {
    const response = await POST(
      new Request("http://localhost/api/cron/backup?secret=test-secret"),
    );
    expect(response.status).toBe(401);
    expect(failStuckInFlightBackups).not.toHaveBeenCalled();
  });

  it("skips when schedule is off", async () => {
    getCronBackupSchedule.mockResolvedValue("off");

    const response = await POST(
      new Request("http://localhost/api/cron/backup", {
        headers: { Authorization: "Bearer test-secret" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.skipped).toBe("off");
    expect(runScheduledBackupWindow).not.toHaveBeenCalled();
    expect(applyAutomatedBackupRetention).toHaveBeenCalled();
    expect(failStuckInFlightBackups).toHaveBeenCalled();
  });

  it("skips when schedule is not due this hour", async () => {
    getCronBackupSchedule.mockResolvedValue("weekly_sun_03");
    isScheduleDue.mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost/api/cron/backup", {
        headers: { Authorization: "Bearer test-secret" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.skipped).toBe("not_due");
    expect(runScheduledBackupWindow).not.toHaveBeenCalled();
  });

  it("runs the scheduled window when due", async () => {
    getCronBackupSchedule.mockResolvedValue("weekly_sun_03");
    isScheduleDue.mockReturnValue(true);
    scheduleWindowKey.mockReturnValue("weekly:2026-09-06:sun03");
    runScheduledBackupWindow.mockResolvedValue({
      status: "success",
      attempts: 1,
      backupId: "b1",
    });

    const response = await POST(
      new Request("http://localhost/api/cron/backup", {
        headers: { Authorization: "Bearer test-secret" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.status).toBe("success");
    expect(runScheduledBackupWindow).toHaveBeenCalledWith({
      backupTime: "weekly_sun_03",
      scheduleWindow: "weekly:2026-09-06:sun03",
    });
    expect(applyAutomatedBackupRetention).toHaveBeenCalled();
  });
});
