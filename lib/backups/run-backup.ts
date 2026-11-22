import "server-only";

import JSZip from "jszip";

import {
  buildBackupObjectKey,
  deleteBackupObject,
  uploadBackupObject,
} from "@/lib/backups/r2";
import { serializeTableFile } from "@/lib/backups/serialize";
import { addStorageBucketsToZip } from "@/lib/backups/storage-export";
import { fetchAllTableRows } from "@/lib/backups/table-export";
import {
  resolveBackupTables,
  type BackupTableName,
} from "@/constants/backup-tables";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type BackupScope = Database["public"]["Enums"]["backup_scope"];
type BackupFormat = Database["public"]["Enums"]["backup_format"];
type BackupStatus = Database["public"]["Enums"]["backup_status"];

export type RunBackupInput = {
  backupId: string;
  scope: BackupScope;
  format: BackupFormat;
  targetTables?: readonly string[] | null;
};

async function updateBackupRow(
  backupId: string,
  patch: {
    status?: BackupStatus;
    file_path?: string | null;
    file_size?: number | null;
    error_message?: string | null;
  },
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("backups").update(patch).eq("id", backupId);
  if (error) {
    throw new Error(`Failed to update backup ${backupId}: ${error.message}`);
  }
}

async function buildDbZip(tables: BackupTableName[]): Promise<Buffer> {
  const admin = createAdminClient();
  const zip = new JSZip();
  const manifest: {
    exportedAt: string;
    format: "json";
    tables: { name: string; rowCount: number }[];
  } = {
    exportedAt: new Date().toISOString(),
    format: "json",
    tables: [],
  };

  for (const table of tables) {
    const rows = await fetchAllTableRows(admin, table);
    const file = serializeTableFile(table, rows);
    zip.file(`tables/${file.filename}`, file.content);
    manifest.tables.push({ name: table, rowCount: rows.length });
  }

  zip.file("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
  return Buffer.from(await zip.generateAsync({ type: "nodebuffer" }));
}

async function buildStorageZip(): Promise<Buffer> {
  const admin = createAdminClient();
  const zip = new JSZip();
  const { objectCount } = await addStorageBucketsToZip(admin, zip);
  zip.file(
    "manifest.json",
    `${JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        format: "zip",
        objectCount,
      },
      null,
      2,
    )}\n`,
  );
  return Buffer.from(await zip.generateAsync({ type: "nodebuffer" }));
}

/**
 * Process a pending backup row: export → R2 upload → mark completed / failed.
 */
export async function runBackupJob(input: RunBackupInput): Promise<void> {
  try {
    await updateBackupRow(input.backupId, {
      status: "processing",
      error_message: null,
    });

    let body: Buffer;
    const extension = "zip";

    if (input.scope === "storage") {
      if (input.format !== "zip") {
        throw new Error("Storage backups must use zip format.");
      }
      body = await buildStorageZip();
    } else {
      if (input.format !== "json") {
        throw new Error("Database backups must use JSON format.");
      }
      const tables = resolveBackupTables(
        input.scope === "automated" ? "automated" : input.scope,
        input.targetTables,
      );
      if (tables.length === 0) {
        throw new Error("No tables selected for backup.");
      }
      body = await buildDbZip(tables);
    }

    const key = buildBackupObjectKey({
      backupId: input.backupId,
      scope: input.scope,
      extension,
    });

    const uploaded = await uploadBackupObject({
      key,
      body,
      contentType: "application/zip",
    });

    try {
      await updateBackupRow(input.backupId, {
        status: "completed",
        file_path: uploaded.key,
        file_size: uploaded.size,
        error_message: null,
      });
    } catch (markError) {
      // Avoid orphaning an R2 object when the completed row write fails.
      try {
        await deleteBackupObject(uploaded.key);
      } catch (cleanupError) {
        console.error("[backups] failed to remove orphaned R2 object", {
          backupId: input.backupId,
          key: uploaded.key,
          cleanupError,
        });
      }
      throw markError;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown backup failure.";
    console.error("[backups] job failed", {
      backupId: input.backupId,
      scope: input.scope,
      message,
    });
    try {
      await updateBackupRow(input.backupId, {
        status: "failed",
        error_message: message.slice(0, 4000),
      });
    } catch (updateError) {
      console.error("[backups] failed to mark backup as failed", updateError);
    }
    throw error;
  }
}
