import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { single, from } = vi.hoisted(() => {
  const single = vi.fn();
  const from = vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({ single })),
    })),
  }));
  return { single, from };
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from })),
}));

vi.mock("@/lib/backups/run-backup", () => ({
  runBackupJob: vi.fn(),
}));

import {
  enqueueBackupAttempt,
  startBackupAttempt,
} from "@/lib/backups/start-backup";
import { runBackupJob } from "@/lib/backups/run-backup";

describe("enqueueBackupAttempt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns insert errors", async () => {
    single.mockResolvedValue({
      data: null,
      error: { message: "insert failed" },
    });

    const result = await enqueueBackupAttempt({
      scope: "full",
      format: "json",
      userId: "admin-1",
    });

    expect(result).toEqual({
      backupId: "",
      error: "insert failed",
    });
    expect(runBackupJob).not.toHaveBeenCalled();
  });

  it("maps unique in-flight violations to a friendly error", async () => {
    single.mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key" },
    });

    const result = await enqueueBackupAttempt({
      scope: "full",
      format: "json",
    });

    expect(result).toEqual({
      backupId: "",
      error: "A backup is already running. Try again when it finishes.",
    });
  });

  it("returns the new backup id without running the job", async () => {
    single.mockResolvedValue({
      data: { id: "b1" },
      error: null,
    });

    const result = await enqueueBackupAttempt({
      scope: "full",
      format: "json",
      userId: "admin-1",
    });

    expect(result).toEqual({ backupId: "b1" });
    expect(runBackupJob).not.toHaveBeenCalled();
  });
});

describe("startBackupAttempt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs the job after insert", async () => {
    single.mockResolvedValue({
      data: { id: "b1" },
      error: null,
    });
    vi.mocked(runBackupJob).mockResolvedValue(undefined);

    const result = await startBackupAttempt({
      scope: "full",
      format: "json",
      targetTables: ["blogs"],
      userId: "admin-1",
      scheduleWindow: "immediate:x",
    });

    expect(result).toEqual({ backupId: "b1", ok: true });
    expect(runBackupJob).toHaveBeenCalledWith({
      backupId: "b1",
      scope: "full",
      format: "json",
      targetTables: ["blogs"],
    });
  });

  it("returns job failures with the backup id", async () => {
    single.mockResolvedValue({
      data: { id: "b2" },
      error: null,
    });
    vi.mocked(runBackupJob).mockRejectedValue(new Error("upload failed"));

    const result = await startBackupAttempt({
      scope: "full",
      format: "json",
    });

    expect(result).toEqual({
      backupId: "b2",
      ok: false,
      error: "upload failed",
    });
  });
});
