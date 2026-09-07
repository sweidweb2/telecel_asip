import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const updateCalls: unknown[] = [];

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn((patch: unknown) => {
        updateCalls.push(patch);
        return {
          eq: vi.fn(async () => ({ error: null })),
        };
      }),
    })),
  })),
}));

vi.mock("@/lib/backups/r2", () => ({
  buildBackupObjectKey: vi.fn(() => "backups/full/x.zip"),
  uploadBackupObject: vi.fn(async () => ({
    key: "backups/full/x.zip",
    size: 12,
  })),
}));

vi.mock("@/lib/backups/table-export", () => ({
  fetchAllTableRows: vi.fn(async () => [{ id: "1" }]),
}));

vi.mock("@/lib/backups/storage-export", () => ({
  addStorageBucketsToZip: vi.fn(async () => ({ objectCount: 0 })),
}));

import { runBackupJob } from "@/lib/backups/run-backup";
import { uploadBackupObject } from "@/lib/backups/r2";
import { fetchAllTableRows } from "@/lib/backups/table-export";

describe("runBackupJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateCalls.length = 0;
  });

  it("exports tables as JSON zip and marks completed", async () => {
    await runBackupJob({
      backupId: "b1",
      scope: "tables",
      format: "json",
      targetTables: ["blogs"],
    });

    expect(fetchAllTableRows).toHaveBeenCalled();
    expect(uploadBackupObject).toHaveBeenCalled();
    expect(updateCalls[0]).toMatchObject({ status: "processing" });
    expect(updateCalls.at(-1)).toMatchObject({
      status: "completed",
      file_path: "backups/full/x.zip",
      file_size: 12,
    });
  });

  it("marks failed when upload throws", async () => {
    vi.mocked(uploadBackupObject).mockRejectedValueOnce(
      new Error("bucket missing"),
    );

    await expect(
      runBackupJob({
        backupId: "b2",
        scope: "full",
        format: "json",
      }),
    ).rejects.toThrow("bucket missing");

    expect(updateCalls.some((p) => (p as { status?: string }).status === "failed")).toBe(
      true,
    );
    expect(
      updateCalls.find((p) => (p as { status?: string }).status === "failed"),
    ).toMatchObject({
      status: "failed",
      error_message: "bucket missing",
    });
  });
});
