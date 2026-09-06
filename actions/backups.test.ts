import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

vi.mock("@/lib/admin/authorize-admin", () => ({
  authorizeAdmin: vi.fn(),
}));

vi.mock("@/lib/backups/automated", () => ({
  hasInFlightBackup: vi.fn(),
  startAutomatedBackupAttempt: vi.fn(),
  applyAutomatedBackupRetention: vi.fn(),
}));

vi.mock("@/lib/backups/start-backup", () => ({
  startBackupAttempt: vi.fn(),
}));

vi.mock("@/lib/backups/r2", () => ({
  getSignedBackupUrl: vi.fn(),
}));

import {
  createBackup,
  getBackupDownloadUrl,
  runBackupNow,
} from "@/actions/backups";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import {
  applyAutomatedBackupRetention,
  hasInFlightBackup,
  startAutomatedBackupAttempt,
} from "@/lib/backups/automated";
import { getSignedBackupUrl } from "@/lib/backups/r2";
import { startBackupAttempt } from "@/lib/backups/start-backup";

const backupId = "11111111-1111-4111-8111-111111111111";

describe("createBackup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasInFlightBackup).mockResolvedValue(false);
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
    expect(startBackupAttempt).not.toHaveBeenCalled();
  });

  it("creates a full JSON backup", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {} as never,
    });
    vi.mocked(startBackupAttempt).mockResolvedValue({
      backupId,
      ok: true,
    });

    const result = await createBackup({ scope: "full", format: "json" });
    expect(result).toEqual({
      status: "success",
      message: "Backup completed.",
      id: backupId,
    });
    expect(startBackupAttempt).toHaveBeenCalledWith({
      userId: "admin-1",
      scope: "full",
      format: "json",
      targetTables: null,
    });
  });

  it("forces zip for storage scope", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {} as never,
    });
    vi.mocked(startBackupAttempt).mockResolvedValue({
      backupId,
      ok: true,
    });

    await createBackup({ scope: "storage", format: "zip" });
    expect(startBackupAttempt).toHaveBeenCalledWith({
      userId: "admin-1",
      scope: "storage",
      format: "zip",
      targetTables: null,
    });
  });

  it("returns engine errors", async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {} as never,
    });
    vi.mocked(startBackupAttempt).mockResolvedValue({
      backupId,
      ok: false,
      error: "R2 failed",
    });

    const result = await createBackup({ scope: "full", format: "json" });
    expect(result).toEqual({ status: "error", message: "R2 failed" });
  });
});

describe("runBackupNow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasInFlightBackup).mockResolvedValue(false);
    vi.mocked(startAutomatedBackupAttempt).mockResolvedValue({
      backupId: "b1",
      ok: true,
    });
    vi.mocked(applyAutomatedBackupRetention).mockResolvedValue({ deleted: 0 });
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
    expect(startAutomatedBackupAttempt).not.toHaveBeenCalled();
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
    expect(startAutomatedBackupAttempt).not.toHaveBeenCalled();
  });

  it("starts an immediate window backup and applies retention", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { backup_time: "off" },
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

    const result = await runBackupNow();

    expect(result).toEqual({
      status: "success",
      message: "Backup completed.",
    });
    expect(startAutomatedBackupAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "admin-1",
        scheduleWindow: expect.stringMatching(/^immediate:/),
      }),
    );
    expect(applyAutomatedBackupRetention).toHaveBeenCalled();
  });

  it("returns failure when the backup attempt fails", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { backup_time: "off" },
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
    vi.mocked(startAutomatedBackupAttempt).mockResolvedValue({
      backupId: "b2",
      ok: false,
    });

    const result = await runBackupNow();
    expect(result).toEqual({
      status: "error",
      message: "Backup failed. Check Backup history for details.",
    });
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

  it("returns not found", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
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

    const result = await getBackupDownloadUrl(backupId);
    expect(result).toEqual({
      status: "error",
      message: "Backup not found.",
    });
  });

  it("returns not ready for failed rows", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: backupId, status: "failed", file_path: null },
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

    const result = await getBackupDownloadUrl(backupId);
    expect(result).toEqual({
      status: "error",
      message: "This backup is not ready to download.",
    });
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
    expect(getSignedBackupUrl).toHaveBeenCalledWith("backups/full/x.zip", 900);
  });
});
