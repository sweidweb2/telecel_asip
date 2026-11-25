import { beforeEach, describe, expect, it, vi } from "vitest";

const afterMock = vi.hoisted(() => vi.fn((fn: () => void | Promise<void>) => {
  void Promise.resolve().then(() => fn());
}));

vi.mock("next/server", () => ({
  after: afterMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

vi.mock("@/lib/admin/authorize-role", () => ({
  authorizeAdmin: vi.fn(),
}));

vi.mock("@/lib/backups/automated", () => ({
  hasInFlightBackup: vi.fn(),
  applyAutomatedBackupRetention: vi.fn(),
  failStuckInFlightBackups: vi.fn(),
}));

vi.mock("@/lib/backups/start-backup", () => ({
  enqueueBackupAttempt: vi.fn(),
  startBackupAttempt: vi.fn(),
}));

vi.mock("@/lib/backups/run-backup", () => ({
  runBackupJob: vi.fn(),
}));

vi.mock("@/lib/backups/r2", () => ({
  getSignedBackupUrl: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeStaffMutationRateLimit: vi.fn(async () => true),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({})),
}));

import {
  createBackup,
  getBackupDownloadUrl,
  getBackupStatus,
  runBackupNow,
} from "@/actions/backups";
import { authorizeAdmin } from "@/lib/admin/authorize-role";
import {
  applyAutomatedBackupRetention,
  failStuckInFlightBackups,
  hasInFlightBackup,
} from "@/lib/backups/automated";
import { runBackupJob } from "@/lib/backups/run-backup";
import { getSignedBackupUrl } from "@/lib/backups/r2";
import { enqueueBackupAttempt } from "@/lib/backups/start-backup";

const backupId = "11111111-1111-4111-8111-111111111111";

describe("createBackup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasInFlightBackup).mockResolvedValue(false);
    vi.mocked(failStuckInFlightBackups).mockResolvedValue(0);
  });

  it("rejects invalid input before auth", async () => {
    const result = await createBackup({
      scope: "tables" as never,
      format: "json",
    });
    expect(result.status).toBe("error");
    expect(authorizeAdmin).not.toHaveBeenCalled();
  });

  it("returns auth errors", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "error",
      message: "Only admins can manage backups.",
    });

    const result = await createBackup({ scope: "full", format: "json" });
    expect(result).toEqual({
      status: "error",
      message: "Only admins can manage backups.",
    });
  });

  it("blocks when another backup is in flight", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {} as never,
    });
    vi.mocked(hasInFlightBackup).mockResolvedValue(true);

    const result = await createBackup({ scope: "full", format: "json" });
    expect(result).toEqual({
      status: "error",
      message: "A backup is already running. Try again when it finishes.",
    });
    expect(enqueueBackupAttempt).not.toHaveBeenCalled();
  });

  it("enqueues a full JSON backup and schedules background work", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {} as never,
    });
    vi.mocked(enqueueBackupAttempt).mockResolvedValue({
      backupId,
    });
    vi.mocked(runBackupJob).mockResolvedValue(undefined);

    const result = await createBackup({ scope: "full", format: "json" });
    expect(result).toEqual({
      status: "success",
      message:
        "Backup started. Watch history - download when it completes.",
      id: backupId,
    });
    expect(enqueueBackupAttempt).toHaveBeenCalledWith({
      userId: "admin-1",
      scope: "full",
      format: "json",
      targetTables: null,
    });
    expect(afterMock).toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(runBackupJob).toHaveBeenCalledWith({
        backupId,
        scope: "full",
        format: "json",
        targetTables: null,
      });
    });
  });

  it("forces zip for storage scope", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {} as never,
    });
    vi.mocked(enqueueBackupAttempt).mockResolvedValue({ backupId });
    vi.mocked(runBackupJob).mockResolvedValue(undefined);

    await createBackup({ scope: "storage", format: "zip" });
    expect(enqueueBackupAttempt).toHaveBeenCalledWith({
      userId: "admin-1",
      scope: "storage",
      format: "zip",
      targetTables: null,
    });
  });
});

describe("runBackupNow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasInFlightBackup).mockResolvedValue(false);
    vi.mocked(failStuckInFlightBackups).mockResolvedValue(0);
    vi.mocked(applyAutomatedBackupRetention).mockResolvedValue({ deleted: 0 });
    vi.mocked(runBackupJob).mockResolvedValue(undefined);
  });

  it("returns auth errors", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "error",
      message: "Sign in to manage backups.",
    });

    const result = await runBackupNow();
    expect(result).toEqual({
      status: "error",
      message: "Sign in to manage backups.",
    });
    expect(enqueueBackupAttempt).not.toHaveBeenCalled();
  });

  it("rejects when another backup is in flight", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {} as never,
    });
    vi.mocked(hasInFlightBackup).mockResolvedValue(true);

    const result = await runBackupNow();
    expect(result).toEqual({
      status: "error",
      message: "A backup is already running. Try again when it finishes.",
    });
    expect(enqueueBackupAttempt).not.toHaveBeenCalled();
  });

  it("enqueues an immediate automated backup in the background", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: "off",
      error: null,
    });
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: { rpc } as never,
    });
    vi.mocked(enqueueBackupAttempt).mockResolvedValue({ backupId });

    const result = await runBackupNow();

    expect(result).toEqual({
      status: "success",
      message:
        "Backup started. Watch history - download when it completes.",
      id: backupId,
    });
    expect(rpc).toHaveBeenCalledWith("get_admin_backup_schedule");
    expect(enqueueBackupAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "admin-1",
        scope: "automated",
        format: "json",
        scheduleWindow: expect.stringMatching(/^immediate:/),
      }),
    );
    await vi.waitFor(() => {
      expect(runBackupJob).toHaveBeenCalled();
      expect(applyAutomatedBackupRetention).toHaveBeenCalled();
    });
  });
});

describe("getBackupStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(failStuckInFlightBackups).mockResolvedValue(0);
  });

  it("returns processing status", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: backupId,
        status: "processing",
        error_message: null,
      },
      error: null,
    });
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle })),
          })),
        })),
      } as never,
    });

    const result = await getBackupStatus(backupId);
    expect(result).toEqual({
      status: "success",
      backupStatus: "processing",
      errorMessage: null,
    });
    expect(failStuckInFlightBackups).toHaveBeenCalled();
  });
});

describe("getBackupDownloadUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid ids", async () => {
    const result = await getBackupDownloadUrl("bad");
    expect(result.status).toBe("error");
    expect(authorizeAdmin).not.toHaveBeenCalled();
  });

  it("returns a signed URL for completed backups", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: backupId,
        status: "completed",
        file_path: "backups/full/x.zip",
      },
      error: null,
    });
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle })),
          })),
        })),
      } as never,
    });
    vi.mocked(getSignedBackupUrl).mockResolvedValue("https://signed.example/x");

    const result = await getBackupDownloadUrl(backupId);
    expect(result).toEqual({
      status: "success",
      url: "https://signed.example/x",
      message: "Download ready.",
    });
  });
});
