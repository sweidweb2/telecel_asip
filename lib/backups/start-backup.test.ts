import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { single, updateEq, from } = vi.hoisted(() => {
  const single = vi.fn();
  const updateEq = vi.fn();
  const from = vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({ single })),
    })),
    update: vi.fn(() => ({ eq: updateEq })),
  }));
  return { single, updateEq, from };
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from })),
}));

vi.mock("@/lib/backups/run-backup", () => ({
  runBackupJob: vi.fn(),
}));

import { startBackupAttempt } from "@/lib/backups/start-backup";
import { runBackupJob } from "@/lib/backups/run-backup";

describe("startBackupAttempt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns insert errors", async () => {
    single.mockResolvedValue({
      data: null,
      error: { message: "insert failed" },
    });

    const result = await startBackupAttempt({
      scope: "full",
      format: "json",
      userId: "admin-1",
    });

    expect(result).toEqual({
      backupId: "",
      ok: false,
      error: "insert failed",
    });
    expect(runBackupJob).not.toHaveBeenCalled();
  });

  it("runs the job after insert", async () => {
    single.mockResolvedValue({
      data: { id: "b1" },
      error: null,
    });
    vi.mocked(runBackupJob).mockResolvedValue(undefined);

    const result = await startBackupAttempt({
      scope: "tables",
      format: "json",
      targetTables: ["blogs"],
      userId: "admin-1",
      scheduleWindow: "immediate:x",
    });

    expect(result).toEqual({ backupId: "b1", ok: true });
    expect(runBackupJob).toHaveBeenCalledWith({
      backupId: "b1",
      scope: "tables",
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
